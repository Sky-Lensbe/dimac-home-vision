import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Body } from "./validation.ts";
import { PHYSICAL_PRODUCTS, DRONE_PRICE } from "../_shared/quickscan/catalog.ts";
import { MAIL_SENDER, OWNER_EMAIL, INTERNAL_NOTIFICATION_RECIPIENTS, sendMail } from "../_shared/mail.ts";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Methode niet toegestaan" }, 405);
  try {
    if (Number(req.headers.get("content-length") || 0) > 16000) return json({ error: "Aanvraag te groot" }, 413);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Controleer uw gegevens." }, 400);
    const d = parsed.data;
    if (Date.now() - d.startedAt < 3000 || d.startedAt > Date.now()) return json({ error: "Probeer over enkele seconden opnieuw." }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row, error } = await db.from("contact_submissions").insert({ id: d.id, form_type: d.type, name: d.name, email: d.email.toLowerCase(), payload: d }).select("id").single();
    if (error?.code === "23505") return json({ ok: true, saved: true, duplicate: true });
    if (error || !row) return json({ error: "Uw aanvraag kon niet worden opgeslagen. Probeer later opnieuw." }, 503);
    const pkg = PHYSICAL_PRODUCTS.find((p) => p.id === d.packageId);
    const title = d.type === "woningscan" ? `Aanvraag ${pkg?.name}` : d.type === "renovation" ? "Renovatieplannen bespreken" : "Contact via website";
    const fields: Record<string, unknown> = { Naam: d.name, "E-mail": d.email, Telefoon: d.phone, Onderwerp: d.subject, Locatie: d.location || d.address, "Type renovatie": d.renovationType, Budget: d.budget, Start: d.start, Omvang: d.scope, Aanpak: d.approach, Periode: d.timing, Situatie: d.situation, Toelichting: d.message, "Quickscan-referentie": d.reportRef };
    if (pkg) { fields.Pakket = pkg.name; fields.Drone = d.drone ? "Ja" : "Nee"; fields["Totaal incl. btw"] = `€${pkg.price + (d.drone && pkg.droneAllowed ? DRONE_PRICE : 0)}`; }
    const body = Object.entries(fields).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join("\n\n");
    const owner = await sendMail({ from: MAIL_SENDER, to: [...INTERNAL_NOTIFICATION_RECIPIENTS], reply_to: d.email, subject: `DIMAC | ${title}`, text: `${body}\n\nAanvraagreferentie: ${d.id}\nVrijblijvende aanvraag, geen bevestigde opdracht.` }, `request-owner-${d.id}`);
    const confirmation = await sendMail({ from: MAIL_SENDER, to: [d.email.toLowerCase()], reply_to: OWNER_EMAIL, subject: `DIMAC | Uw aanvraag is geregistreerd`, text: `Beste ${d.name},\n\nUw aanvraag bij DIMAC is geregistreerd.\n\n${title}\nReferentie: ${d.id}\n\nDit is geen definitieve afspraak, overeenkomst of betalingsverplichting. Heeft u vragen? Antwoord op deze e-mail.\n\nMet vriendelijke groeten,\nTeam DIMAC\nVerzonden voor DIMAC via Sky-Lens.` }, `request-confirm-${d.id}`);
    await db.from("contact_submissions").update({ owner_status: owner.status, confirmation_status: confirmation.status }).eq("id", d.id);
    return json({ ok: true, saved: true, ownerStatus: owner.status, confirmationStatus: confirmation.status });
  } catch { return json({ error: "Uw aanvraag kon niet worden bevestigd. Probeer later opnieuw." }, 500); }
});
