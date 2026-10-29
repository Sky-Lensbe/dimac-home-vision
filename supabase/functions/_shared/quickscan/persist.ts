/**
 * Betrouwbare opslag van een Quickscan-registratie (geen imports, testbaar met een nep-databank).
 *
 * 2.2.2: de verplichte registratie (lead, antwoorden, rapportsnapshot en audit-events) gebeurt in één
 * PostgreSQL-functie `quickscan_register`, dus binnen één databasetransactie. Mislukt één insert, dan draait
 * PostgreSQL alles terug; er is geen compensatie via een aparte verwijdering meer nodig.
 *
 * Idempotentie: het rapportnummer is afgeleid van (e-mail, starttijd, antwoorden) en uniek in de databank.
 * De functie neemt een transactie-advisory-lock per rapportnummer, zodat gelijktijdige identieke indieningen
 * na elkaar verwerkt worden en de tweede het reeds opgeslagen rapport terugkrijgt.
 *
 * Onzekere status: als de verbinding wegvalt of het antwoord onleesbaar is, controleren we eerst of het
 * rapport toch bestaat. Kan dat niet bevestigd worden, dan volgt een neutrale melding zonder garanties.
 */

type DbError = { code?: string; message?: string } | null;
type Res<T> = PromiseLike<{ data: T | null; error: DbError }>;

export interface RegisterArgs {
  p_report_number: string;
  p_lead: Record<string, unknown>;
  p_responses: Record<string, unknown>[];
  p_report: Record<string, unknown>;
  p_events: Record<string, unknown>[];
}

/** Minimale databankinterface die de echte client en de tests allebei bieden. */
export interface QuickscanStore {
  findReport(reportNumber: string): Res<{ report_snapshot: unknown }>;
  register(args: RegisterArgs): Res<{ duplicate: boolean; snapshot: unknown }>;
}

export type PersistResult =
  | { ok: true; duplicate: boolean; snapshot: unknown }
  | { ok: false; status: number; error: string; uncertain: boolean };

/** De databank meldde een fout: de transactie is volledig teruggedraaid. */
export const SAVE_ERROR = "Uw rapport kon niet worden opgeslagen. Probeer het later opnieuw.";
/** De opslagstatus is niet met zekerheid gekend: geen garantie in één of andere richting. */
export const UNCERTAIN_ERROR = "We konden niet bevestigen of uw rapport werd opgeslagen. Probeer het opnieuw: een herhaalde indiening maakt geen dubbele registratie aan.";

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
  /** Rapportrij zonder lead_id; de databankfunctie koppelt de lead binnen dezelfde transactie. */
  report: Record<string, unknown>;
  snapshot: unknown;
  events: Record<string, unknown>[];
}

export async function findExisting(db: QuickscanStore, reportNumber: string): Promise<unknown | null> {
  const { data } = await db.findReport(reportNumber);
  return data?.report_snapshot ?? null;
}

export async function persistQuickscan(db: QuickscanStore, input: PersistInput): Promise<PersistResult> {
  const uncertain = async (): Promise<PersistResult> => {
    // Is het rapport ondanks de onderbreking toch opgeslagen? Dan is dat een geslaagde registratie.
    try {
      const dup = await findExisting(db, input.reportNumber);
      if (dup) return { ok: true, duplicate: true, snapshot: dup };
    } catch { /* status blijft onzeker */ }
    return { ok: false, status: 503, error: UNCERTAIN_ERROR, uncertain: true };
  };

  let res: { data: { duplicate: boolean; snapshot: unknown } | null; error: DbError };
  try {
    res = await db.register({
      p_report_number: input.reportNumber,
      p_lead: input.lead,
      p_responses: input.responses,
      p_report: { ...input.report, report_snapshot: input.snapshot },
      p_events: input.events,
    });
  } catch {
    console.error("quickscan: register call interrupted");
    return uncertain();
  }
  if (res.error) {
    console.error("quickscan: register failed, transaction rolled back", res.error.code);
    return { ok: false, status: 500, error: SAVE_ERROR, uncertain: false };
  }
  if (!res.data || res.data.snapshot == null) return uncertain();
  return { ok: true, duplicate: !!res.data.duplicate, snapshot: res.data.snapshot };
}
