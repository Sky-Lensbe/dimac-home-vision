import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { isComplete, QUESTION_VERSION, type Answers } from "../_shared/quickscan/engine.ts";
import { composeReport } from "../_shared/quickscan/report.ts";
import { MAIL_MODE, mayReceiveReportMail, resolveRecipients } from "../_shared/quickscan/mail-policy.ts";
import { sendReportMail } from "../_shared/quickscan/send-report.ts";
import { sendMail, MAIL_SENDER } from "../_shared/mail.ts";
import { findExisting, persistQuickscan, reportNumberFor, type QuickscanStore } from "../_shared/quickscan/persist.ts";

const CONSENT_VERSION = "qs-consent-2026.10-1";
const RATE_LIMIT_PER_HOUR = 5;

const Body = z.object({
  answers: z.record(z.union([z.string().max(40), z.array(z.string().max(40)).max(12)])),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  municipality: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).regex(/^[0-9+()./\s-]*$/).optional().or(z.literal("")),
  marketingConsent: z.boolean(),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
  startedAt: z.number().int().positive(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Methode niet toegestaan" }, 405);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Ongeldige aanvraag" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: "Controleer de ingevulde gegevens.", fields: parsed.error.flatten().fieldErrors }, 400);
  const d = parsed.data;

  // Spamwering: honeypot en onrealistisch snelle invulling.
  if (d.website) return json({ error: "Aanvraag geweigerd" }, 400);
  if (Date.now() - d.startedAt < 20_000) return json({ error: "De vragenlijst werd te snel ingevuld. Probeer opnieuw." }, 400);

  const answers = d.answers as Answers;
  if (!isComplete(answers)) return json({ error: "Niet alle vragen zijn beantwoord." }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const store: QuickscanStore = {
    findReport: (n) => db.from("quickscan_reports").select("report_snapshot").eq("report_number", n).maybeSingle(),
    // Eén atomaire databanktransactie voor lead, antwoorden, rapport en events (zie quickscan_register).
    register: (args) => db.rpc("quickscan_register", args) as never,
  };

  // Server-side herberekening; niets uit de browser wordt vertrouwd.
  const report = composeReport(answers);
  const a = report.answers;
  const reportNumber = await reportNumberFor(d.email, d.startedAt, a);
  const deliveryStatus = mayReceiveReportMail(d.email) ? "pending" : "niet_geconfigureerd";

  // Herhaalde indiening: geef het reeds opgeslagen rapport terug, zonder nieuwe records of rate-limitverbruik.
  const existing = await findExisting(store, reportNumber);
  if (existing) {
    const { data: stored } = await db.from("quickscan_reports").select("delivery_status").eq("report_number", reportNumber).maybeSingle();
    return json({ ok: true, report: existing, deliveryStatus: stored?.delivery_status ?? "failed", duplicate: true });
  }

  // Rate limiting per IP (gehasht), per uur.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "onbekend";
  const ipHash = await sha256(`qs:${ip}`);
  const windowStart = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString();
  const { data: rl } = await db.from("quickscan_rate_limits").select("count").eq("ip_hash", ipHash).eq("window_start", windowStart).maybeSingle();
  if ((rl?.count ?? 0) >= RATE_LIMIT_PER_HOUR) return json({ error: "Te veel aanvragen. Probeer het later opnieuw." }, 429);
  await db.from("quickscan_rate_limits").upsert({ ip_hash: ipHash, window_start: windowStart, count: (rl?.count ?? 0) + 1 });

  const postal = /^\d{4}$/.test(d.municipality) ? d.municipality : null;
  const now = new Date().toISOString();
  const meta = { reportNumber, name: `${d.firstName} ${d.lastName}`, municipality: d.municipality, date: now };
  const snapshot = { ...report, meta };

  const result = await persistQuickscan(store, {
    reportNumber,
    snapshot,
    lead: {
      first_name: d.firstName, last_name: d.lastName, email: d.email.toLowerCase(), phone: d.phone || null,
      municipality: d.municipality, postal_code: postal,
      situation: (a.Q01 as string) ?? null, property_type: (a.Q02 as string) ?? null,
      construction_period: (a.Q03 as string) ?? null, decision_timing: (a.Q49 as string) ?? null,
      marketing_consent: d.marketingConsent, consent_version: CONSENT_VERSION, consent_timestamp: d.marketingConsent ? now : null,
    },
    responses: Object.entries(a).map(([question_id, v]) => ({ question_id, answer_value: v, question_version: QUESTION_VERSION })),
    report: {
      report_number: reportNumber, rule_version: report.ruleVersion, report_version: report.reportVersion,
      barometer_score_internal: report.scoreInternal, barometer_category: report.category.id, information_coverage: report.unknown.level,
      domain_scores: report.domainScores, safety_flags: report.safety.map((s) => s.id), attention_points: report.points,
      unknown_information: report.unknown.items, combination_advice: report.combinations,
      recommended_package: report.v23.recommendation.productId, drone_recommendation: report.drone,
      delivery_status: deliveryStatus,
    },
    events: [
      { event_type: "rapport_aangemaakt", detail: reportNumber },
      { event_type: "email_voorbereid", detail: `Modus ${MAIL_MODE}` },
    ],
  });
  if (!result.ok) return json({ error: result.error }, result.status);
  if (result.duplicate || !mayReceiveReportMail(d.email)) return json({ ok: true, report: result.snapshot, deliveryStatus, duplicate: result.duplicate });

  // Het opgeslagen snapshot wordt bezorgd; mailfouten wijzigen de registratie niet.
  let sent: { status: string; detail?: string };
  try { sent = await sendReportMail(result.snapshot, meta, d.email, d.firstName); }
  catch (e) { console.error("Rapportmail mislukt", e); sent = { status: "failed", detail: "PDF of mail mislukt" }; }
  for (const recipient of resolveRecipients("lead_notification", null)) {
    const notice = await sendMail({ from: MAIL_SENDER, to: [recipient], reply_to: d.email,
      subject: `DIMAC | Nieuwe Quickscan ${reportNumber}`,
      text: `Nieuwe Quickscan-aanvraag\n\nNaam: ${meta.name}\nE-mail: ${d.email}\nTelefoon: ${d.phone || "Niet opgegeven"}\nGemeente: ${d.municipality}\nWoningtype: ${a.Q02}\nRapportnummer: ${reportNumber}\nRapportmail: ${sent.status}\nMarketingtoestemming: ${d.marketingConsent ? "Ja" : "Nee"}` }, `quickscan-notice-${reportNumber}`);
    await db.from("quickscan_events").insert({ lead_id: (await db.from("quickscan_reports").select("lead_id").eq("report_number", reportNumber).single()).data?.lead_id, event_type: `lead_notification_${notice.status}`, detail: reportNumber });
  }
  await db.from("quickscan_reports").update({ delivery_status: sent.status }).eq("report_number", reportNumber);
  return json({ ok: true, report: result.snapshot, deliveryStatus: sent.status, duplicate: false });
});
