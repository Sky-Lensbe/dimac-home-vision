import type { QuickscanStore } from "../../supabase/functions/_shared/quickscan/persist";

/** Nep-databank die quickscan_register nabootst: alles-of-niets per oproep, unieke rapportnummers. */
export function fakeDb(fail: Partial<Record<"lead" | "responses" | "report" | "events" | "throw" | "throwAfterCommit", boolean>> = {}) {
  const t = { leads: [] as { id: string }[], responses: [] as { lead_id: string }[], reports: [] as { lead_id: string; report_number: string; report_snapshot: unknown }[], events: [] as { lead_id: string }[] };
  let n = 0;
  const db: QuickscanStore = {
    findReport: async (nr) => ({ data: t.reports.find((r) => r.report_number === nr) ?? null, error: null }),
    register: async (args) => {
      if (fail.throw) throw new Error("netwerk");
      const ex = t.reports.find((r) => r.report_number === args.p_report_number);
      if (ex) return { data: { duplicate: true, snapshot: ex.report_snapshot }, error: null };
      // Transactie: eerst alles voorbereiden, pas bij volledig succes vastleggen.
      const id = `L${++n}`;
      for (const k of ["lead", "responses", "report", "events"] as const) if (fail[k]) return { data: null, error: { code: "23502" } };
      t.leads.push({ id });
      t.responses.push(...args.p_responses.map(() => ({ lead_id: id })));
      t.reports.push({ lead_id: id, report_number: args.p_report_number, report_snapshot: args.p_report.report_snapshot });
      t.events.push(...args.p_events.map(() => ({ lead_id: id })));
      if (fail.throwAfterCommit) throw new Error("antwoord verloren");
      return { data: { duplicate: false, snapshot: args.p_report.report_snapshot }, error: null };
    },
  };
  return { db, t };
}
export const input = (nr: string) => ({
  reportNumber: nr, snapshot: { nr }, lead: { email: "x@y.be" },
  responses: [{ question_id: "Q01", answer_value: "eigenaar" }],
  report: { report_number: nr },
  events: [{ event_type: "rapport_aangemaakt" }],
});

