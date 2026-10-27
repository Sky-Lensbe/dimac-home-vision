import type { QuickscanReport } from "@/lib/quickscan";
import type { ReportMeta } from "@/lib/quickscanPdf";

export type StoredReport = QuickscanReport & { meta: ReportMeta };

/**
 * Een opgeslagen rapport is onveranderlijk: we tonen en exporteren exact de opgeslagen
 * berekening met haar oorspronkelijke versie. Deze module importeert bewust de rekenregels niet,
 * zodat een oud rapport nooit ongemerkt met nieuwe regels herberekend kan worden.
 */
export function storedReport(snapshot: StoredReport): Readonly<StoredReport> {
  return Object.freeze(structuredClone(snapshot));
}

export const reportVersionLabel = (s: { reportVersion?: string; ruleVersion?: string }) =>
  `${s.reportVersion ?? "onbekende rapportversie"} · ${s.ruleVersion ?? "onbekende regelversie"}`;
