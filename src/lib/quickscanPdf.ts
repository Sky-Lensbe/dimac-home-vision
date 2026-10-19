import { jsPDF } from "jspdf";
import type { QuickscanReport } from "@/lib/quickscan";
import { CATEGORIES } from "@/lib/quickscan";

export interface ReportMeta { reportNumber: string; name: string; municipality: string; date: string }

const ORANGE: [number, number, number] = [215, 100, 29];
const INK: [number, number, number] = [34, 34, 34];
const MUTED: [number, number, number] = [110, 110, 110];

/** Bouwt het A4-rapport rechtstreeks uit de opgeslagen rapportgegevens. */
export function buildReportPdf(r: QuickscanReport, meta: ReportMeta): Blob {
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
  h2(1, "Uw woningprofiel");
  for (const p of r.profile) text(`${p.label}: ${p.value}`, 10, INK, "normal", 0.5);

  h2(2, "Renovatienoodzakelijkheidsbarometer");
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

  h2(3, "Uw belangrijkste aandachtspunten");
  if (!r.points.length) text("Er zijn op basis van uw antwoorden geen uitgesproken aandachtspunten gemeld.");
  for (const p of r.points) { text(p.title, 11, INK, "bold", 1); text(p.text, 10, INK, "normal", 1); text(`Volgende stap: ${p.next}`, 9, MUTED); }

  h2(4, "Wat weten we nog niet?");
  text(r.unknown.label, 11, INK, "bold", 1); text(r.unknown.text, 10);
  if (r.unknown.sentence) text(r.unknown.sentence, 10);

  if (r.combinations.length) {
    h2(5, "Renovaties slim combineren");
    for (const c of r.combinations) { text(c.title, 11, INK, "bold", 1); text(c.text, 10); }
  }
  h2(6, "Samenvatting");
  text(r.summary, 10);

  h2(7, "Een mogelijke volgende stap");
  text(`Woningscan ${r.packageAdvice.pkg === "compleet" ? "Compleet" : "Basis"}`, 11, INK, "bold", 1);
  text(r.packageAdvice.text, 10);
  if (r.packageAdvice.doubt && r.packageAdvice.pkg === "basis") text("Compleet is relevant wanneer u ook een renovatieplanning en een indicatie van de kosten wenst.", 10, MUTED);
  if (r.droneText) text(r.droneText, 10, MUTED);
  text("Deze aanbeveling is vrijblijvend. U kunt alle pakketten bekijken op dimac.be/woningscan.", 9, MUTED);

  h2(8, "Grenzen van de Quickscan");
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
