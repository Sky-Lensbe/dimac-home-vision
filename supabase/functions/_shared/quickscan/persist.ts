/**
 * Betrouwbare opslag van een Quickscan-registratie (geen imports, testbaar met een nep-databank).
 *
 * Volgorde: lead → antwoorden → rapportsnapshot → events. Mislukt een verplichte stap, dan wordt de lead
 * verwijderd; antwoorden, rapport en events hangen eraan met ON DELETE CASCADE, zodat er geen gedeeltelijke
 * of verweesde records achterblijven. Pas als alle verplichte stappen gelukt zijn, geeft de functie ok terug.
 *
 * Herhaalde indieningen: het rapportnummer is afgeleid van (e-mail, starttijd, antwoorden). Een tweede
 * identieke indiening geeft het reeds opgeslagen rapport terug en maakt geen nieuwe records aan.
 */

type DbError = { code?: string; message?: string } | null;
type Res<T> = PromiseLike<{ data: T | null; error: DbError }>;

/** Minimale databankinterface die de echte client en de tests allebei bieden. */
export interface QuickscanStore {
  findReport(reportNumber: string): Res<{ report_snapshot: unknown }>;
  insertLead(row: Record<string, unknown>): Res<{ id: string }>;
  insertResponses(rows: Record<string, unknown>[]): Res<unknown>;
  insertReport(row: Record<string, unknown>): Res<unknown>;
  insertEvents(rows: Record<string, unknown>[]): Res<unknown>;
  deleteLead(id: string): Res<unknown>;
}

export type PersistResult =
  | { ok: true; duplicate: boolean; snapshot: unknown }
  | { ok: false; status: number; error: string };

export const SAVE_ERROR = "Uw rapport kon niet worden opgeslagen. Er werd niets geregistreerd; probeer het later opnieuw.";

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
  : JSON.stringify(v);

/** Deterministisch rapportnummer: dezelfde indiening levert hetzelfde nummer (unieke sleutel in de databank). */
export async function reportNumberFor(email: string, startedAt: number, answers: unknown): Promise<string> {
  const h = await sha256Hex(`${email.trim().toLowerCase()}|${startedAt}|${stable(answers)}`);
  const day = new Date(startedAt).toISOString().slice(0, 10).replace(/-/g, "");
  return `QS-${day}-${h.slice(0, 8).toUpperCase()}`;
}

export interface PersistInput {
  reportNumber: string;
  lead: Record<string, unknown>;
  responses: Record<string, unknown>[];
  report: (leadId: string) => Record<string, unknown>;
  snapshot: unknown;
  events: Record<string, unknown>[];
}

export async function findExisting(db: QuickscanStore, reportNumber: string): Promise<unknown | null> {
  const { data } = await db.findReport(reportNumber);
  return data?.report_snapshot ?? null;
}

export async function persistQuickscan(db: QuickscanStore, input: PersistInput): Promise<PersistResult> {
  const existing = await findExisting(db, input.reportNumber);
  if (existing) return { ok: true, duplicate: true, snapshot: existing };

  const { data: lead, error: leadErr } = await db.insertLead(input.lead);
  if (leadErr || !lead) { console.error("quickscan: lead insert failed", leadErr?.code); return { ok: false, status: 500, error: SAVE_ERROR }; }

  const rollback = async (stage: string, err: DbError) => {
    console.error(`quickscan: ${stage} failed, rolling back`, err?.code);
    const { error } = await db.deleteLead(lead.id);
    if (error) console.error("quickscan: rollback failed", error.code);
  };

  if (input.responses.length) {
    const { error } = await db.insertResponses(input.responses.map((r) => ({ ...r, lead_id: lead.id })));
    if (error) { await rollback("responses insert", error); return { ok: false, status: 500, error: SAVE_ERROR }; }
  }

  const { error: repErr } = await db.insertReport(input.report(lead.id));
  if (repErr) {
    await rollback("report insert", repErr);
    // Gelijktijdige dubbele indiening: het andere verzoek heeft het rapport al opgeslagen.
    if (repErr.code === "23505") {
      const dup = await findExisting(db, input.reportNumber);
      if (dup) return { ok: true, duplicate: true, snapshot: dup };
    }
    return { ok: false, status: 500, error: SAVE_ERROR };
  }

  // Events zijn auditinformatie; het rapport is al volledig opgeslagen. Een fout wordt gelogd, niet verzwegen.
  const { error: evErr } = await db.insertEvents(input.events.map((e) => ({ ...e, lead_id: lead.id })));
  if (evErr) console.error("quickscan: events insert failed", evErr.code);

  return { ok: true, duplicate: false, snapshot: input.snapshot };
}
