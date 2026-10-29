import { jsPDF } from "jspdf";
import type { QuickscanReport } from "@/lib/quickscan";
import { CATEGORIES } from "@/lib/quickscan";

export interface ReportMeta { reportNumber: string; name: string; municipality: string; date: string }

const ORANGE: [number, number, number] = [215, 100, 29];
const INK: [number, number, number] = [34, 34, 34];
const MUTED: [number, number, number] = [110, 110, 110];

/** Pre-2.3-rapporten: exact de oorspronkelijke opmaak, rechtstreeks uit de opgeslagen gegevens. */
export function buildLegacyPdf(r: QuickscanReport, meta: ReportMeta): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 20, CW = W - 2 * M, BOTTOM = 277;
  let y = M;

  const ensure = (h: number) => { if (y + h > BOTTOM) { doc.addPage(); y = M; } };
  const text = (s: string, size = 10, color = INK, style: "normal" | "bold" = "normal", gap = 1.5) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(s, CW) as string[];
    const lh = size * 0.42;
    for (const l of lines) { ensure(lh); doc.text(l, M, y); y += lh; }
    y += gap;
  };
  let chapter = 0;
  const ch = () => ++chapter;
  const h2 = (n: number, s: string) => {
    ensure(16); y += 4;
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.4); doc.line(M, y, M + 12, y); y += 6;
    text(`${n}. ${s}`, 14, INK, "bold", 2);
  };

  // Voorblad
  doc.setFillColor(...ORANGE); doc.rect(0, 0, W, 4, "F");
  y = 60;
  text("DIMAC QUICKSCAN", 10, ORANGE, "bold", 4);
  text("Uw persoonlijk woningrapport", 26, INK, "bold", 10);
  text(meta.name, 12); text(meta.municipality, 12, MUTED);
  text(new Date(meta.date).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }), 12, MUTED);
  text(`Rapportnummer ${meta.reportNumber}`, 10, MUTED, "normal", 20);
  text("Een eerste analyse op basis van uw eigen antwoorden. Deze analyse vervangt geen inspectie ter plaatse.", 9, MUTED);

  doc.addPage(); y = M;
  if (r.safety.length) {
    h2(0, "Veiligheidsadvies");
    for (const s of r.safety) { text(s.title, 11, ORANGE, "bold", 1); text(s.text, 10); }
  }
  h2(ch(), "Uw woningprofiel");
  for (const p of r.profile) text(`${p.label}: ${p.value}`, 10, INK, "normal", 0.5);

  h2(ch(), "Uw renovatiebarometer");
  // Vierdelige meter
  ensure(14);
  const segW = CW / 4;
  CATEGORIES.forEach((c, i) => {
    const on = r.level === i;
    doc.setFillColor(...(on ? ORANGE : ([230, 226, 220] as [number, number, number])));
    doc.rect(M + i * segW + 0.5, y, segW - 1, 4, "F");
    doc.setFontSize(7); doc.setTextColor(...(on ? INK : MUTED)); doc.setFont("helvetica", on ? "bold" : "normal");
    doc.text(doc.splitTextToSize(c.label, segW - 2) as string[], M + i * segW + 0.5, y + 8);
  });
  y += 16;
  text(r.category.label, 12, INK, "bold", 1);
  text(r.category.text, 10);
  text("De barometer geeft de signalen weer die u zelf opgeeft, niet een bewezen renovatienoodzaak.", 9, MUTED);

  h2(ch(), "Uw belangrijkste aandachtspunten");
  if (!r.points.length) text("Er zijn op basis van uw antwoorden geen uitgesproken aandachtspunten gemeld.");
  for (const p of r.points) { text(p.title, 11, INK, "bold", 1); text(p.text, 10, INK, "normal", 1); text(`Volgende stap: ${p.next}`, 9, MUTED); }

  if (r.energy?.length) {
    h2(ch(), "Energetische aandachtspunten");
    for (const t of r.energy) text(t, 10, INK, "normal", 0.5);
  }
  if (r.notices?.length) {
    h2(ch(), "Aandachtspunten zonder invloed op de barometer");
    for (const n of r.notices) { text(n.title, 11, INK, "bold", 1); text(n.text, 10); }
  }

  h2(ch(), "Wat weten we nog niet?");
  text(r.unknown.label, 11, INK, "bold", 1); text(r.unknown.text, 10);
  if (r.unknown.sentence) text(r.unknown.sentence, 10);
  if (r.unknown.skipped?.length) text(`Overgeslagen vragen (ontbrekende informatie): ${r.unknown.skipped.map((s) => s.label).join("; ")}.`, 9, MUTED);

  if (r.combinations.length) {
    h2(ch(), "Renovaties slim combineren");
    for (const c of r.combinations) { text(c.title, 11, INK, "bold", 1); text(c.text, 10); }
  }
  if (r.apartment) {
    h2(ch(), r.apartment.title);
    if (r.apartment.groups) {
      for (const g of r.apartment.groups) {
        text(g.title, 11, INK, "bold", 1);
        for (const i of g.items) text(`${i.label} ${i.value}`, 10, INK, "normal", 0.5);
        for (const t of g.signals) text(t, 10);
      }
      if (r.apartment.syndic?.length) {
        text("Vragen voor de syndicus", 11, INK, "bold", 1);
        for (const t of r.apartment.syndic) text(`• ${t}`, 10, INK, "normal", 0.5);
      }
    } else {
      for (const i of r.apartment.items) text(`${i.label} ${i.value}`, 10, INK, "normal", 0.5);
      for (const t of r.apartment.signals) text(t, 10);
    }
    for (const t of r.apartment.notes) text(t, 9, MUTED);
  }
  h2(ch(), "Samenvatting");
  text(r.summary, 10);

  h2(ch(), "Een mogelijke volgende stap");
  text(r.nextStep.title, 11, INK, "bold", 1);
  text(r.nextStep.text, 10);
  if (r.droneText) text(r.droneText, 10, MUTED);

  h2(ch(), "Grenzen van de Quickscan");
  text(r.limits, 10);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.setFont("helvetica", "normal");
    doc.text(`DIMAC Quickscan · ${meta.reportNumber}`, M, 290);
    doc.text(`${i} / ${pages}`, W - M, 290, { align: "right" });
  }
  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** 2.3-snapshots krijgen de nieuwe opmaak; oudere snapshots exact hun oorspronkelijke opmaak. */
export async function buildReportPdf(r: QuickscanReport, meta: ReportMeta): Promise<Blob> {
  if ("v23" in r && (r as { v23?: unknown }).v23) {
    const { buildReportPdf23 } = await import("@/lib/quickscanPdf23");
    return buildReportPdf23(r as never, meta);
  }
  return buildLegacyPdf(r, meta);
}
export { reportPdfModel } from "@/lib/quickscanPdf23";
