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
/** Local Vite does not serve the managed asset route; use the same public project assets there. */
async function loadPdfAsset(url: string): Promise<ArrayBuffer> {
  const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const resolved = local && url.startsWith("/__l5e/assets-v1/")
    ? `https://id-preview--9898680e-4724-4e20-8227-2a5082382f19.lovable.app${url}` : url;
  const response = await fetch(resolved);
  if (!response.ok || response.headers.get("content-type")?.includes("text/html")) throw new Error("PDF asset unavailable");
  return response.arrayBuffer();
}
/** Dispatch solely by stored version. No engine call, no new report composition. */
export function buildReportPdf23(r: QuickscanReport23, meta: ReportMeta, opts: PdfLoadOptions = {}): Promise<Blob> {
  opts = { ...opts, load: opts.load ?? loadPdfAsset };
  if (r.reportVersion === "qs-report-2.3.4") return render234(r, meta, pdfDependencies as PdfDependencies234, opts);
  if (r.reportVersion === "qs-report-2.3.3") return renderSnapshotPdf(r, meta, pdfDependencies, opts);
  if (["qs-report-2.3", "qs-report-2.3.1", "qs-report-2.3.2"].includes(r.reportVersion)) return historicalPdf(r, meta, pdfDependencies, opts);
  throw new Error("Unsupported stored PDF report version");
}
