import { jsPDF } from "jspdf";
import { CATEGORIES } from "@/lib/quickscan";
import { withReportRef, type QuickscanReport23, type DomainStatus, type IconId, type ReportV232, type ReportV233 } from "@/lib/quickscanReport";
import { ICONS, ILLUSTRATIONS, type Shape } from "@/lib/reportArt";
import { formatEuro, VAT_LABEL } from "@/data/woningscan";
import { absoluteUrl } from "@/lib/site";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";
import playfairRegular from "@/assets/fonts/PlayfairDisplay-Regular.ttf.asset.json";
import playfairSemi from "@/assets/fonts/PlayfairDisplay-SemiBold.ttf.asset.json";
import interRegular from "@/assets/fonts/Inter-Regular.ttf.asset.json";
import interSemi from "@/assets/fonts/Inter-SemiBold.ttf.asset.json";
import artBuilding from "@/assets/dimac-gebouw.png.asset.json";
import artHouse from "@/assets/dimac-woning.png.asset.json";
import type { ReportMeta } from "@/lib/quickscanPdf";

import { renderSnapshotPdf, reportPdfModel as snapshotModel, type PdfDependencies } from "../../supabase/functions/_shared/quickscan/pdf/render233";
import { renderSnapshotPdf as render234, type PdfDependencies as PdfDependencies234 } from "../../supabase/functions/_shared/quickscan/pdf/render234";
import { renderSnapshotPdf as historicalPdf } from "../../supabase/functions/_shared/quickscan/pdf/historical-frozen";
export type { PdfLoadOptions } from "../../supabase/functions/_shared/quickscan/pdf/render233";
import type { PdfLoadOptions } from "../../supabase/functions/_shared/quickscan/pdf/render233";
export const PDF_ASSETS = {
  logo: [logoAsset.url, "/logo-dimac.png"],
  fonts: { serif: [playfairRegular.url, playfairSemi.url], sans: [interRegular.url, interSemi.url] },
  art: { building: [artBuilding.url], house: [artHouse.url] },
};

export const pdfDependencies: PdfDependencies = {
  jsPDF, categories: CATEGORIES, assets: PDF_ASSETS, absoluteUrl,
  withReportRef: (path, number) => withReportRef(path, number), formatEuro, vatLabel: VAT_LABEL,
};
export function reportPdfModel(r: QuickscanReport23, meta: ReportMeta) {
  return snapshotModel(r, meta, pdfDependencies);
}
/** Dispatch solely by stored version. No engine call, no new report composition. */
export function buildReportPdf23(r: QuickscanReport23, meta: ReportMeta, opts: PdfLoadOptions = {}): Promise<Blob> {
  if (r.reportVersion === "qs-report-2.3.4") return render234(r, meta, pdfDependencies as PdfDependencies234, opts);
  if (r.reportVersion === "qs-report-2.3.3") return renderSnapshotPdf(r, meta, pdfDependencies, opts);
  if (["qs-report-2.3", "qs-report-2.3.1", "qs-report-2.3.2"].includes(r.reportVersion)) return historicalPdf(r, meta, pdfDependencies, opts);
  throw new Error("Unsupported stored PDF report version");
}
