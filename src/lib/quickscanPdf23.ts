import { jsPDF } from "jspdf";
import { CATEGORIES } from "@/lib/quickscan";
import { withReportRef, type QuickscanReport23, type DomainStatus, type DocStatus, type IconId } from "@/lib/quickscanReport";
import { ICONS, ILLUSTRATIONS, type Shape } from "@/lib/reportArt";
import { formatEuro, VAT_LABEL } from "@/data/woningscan";
import { absoluteUrl } from "@/lib/site";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";
import playfairRegular from "@/assets/fonts/PlayfairDisplay-Regular.ttf.asset.json";
import playfairSemi from "@/assets/fonts/PlayfairDisplay-SemiBold.ttf.asset.json";
import interRegular from "@/assets/fonts/Inter-Regular.ttf.asset.json";
import interSemi from "@/assets/fonts/Inter-SemiBold.ttf.asset.json";
import type { ReportMeta } from "@/lib/quickscanPdf";

type RGB = [number, number, number];
const ORANGE: RGB = [215, 100, 29];
const INK: RGB = [26, 28, 32];
const BODY: RGB = [62, 64, 70];
const MUTED: RGB = [118, 120, 126];
const LINE: RGB = [226, 226, 230];
const SURFACE: RGB = [249, 249, 251];
const RED: RGB = [185, 43, 43];

export const PDF_ASSETS = {
  logo: [logoAsset.url, "/logo-dimac.png"],
  fonts: { serif: [playfairRegular.url, playfairSemi.url], sans: [interRegular.url, interSemi.url] },
};

/** Dezelfde inhoud als online; de PDF leest alleen de opgeslagen snapshot. */
export function reportPdfModel(r: QuickscanReport23, meta: ReportMeta) {
  const rec = r.v23.recommendation;
  return {
    recommendation: rec,
    ctaUrl: rec.ctaPath ? absoluteUrl(withReportRef(rec.ctaPath, meta.reportNumber)) : null,
    infoUrl: absoluteUrl(rec.infoPath),
    priceLabel: rec.price !== null ? formatEuro(rec.price) : null,
  };
}

export interface PdfLoadOptions { load?: (url: string) => Promise<ArrayBuffer>; arrayBuffer?: boolean }
const defaultLoad = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.arrayBuffer();
};
const toBase64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const isImage = (b: Uint8Array) => (b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0xff && b[1] === 0xd8);

export async function buildReportPdf23(r: QuickscanReport23, meta: ReportMeta, opts: PdfLoadOptions = {}): Promise<Blob> {
  const load = opts.load ?? defaultLoad;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  let SERIF = "times", SANS = "helvetica";
  try {
    const [pr, ps, ir, is] = await Promise.all([...PDF_ASSETS.fonts.serif, ...PDF_ASSETS.fonts.sans].map(load));
    doc.addFileToVFS("Playfair-Regular.ttf", toBase64(pr)); doc.addFont("Playfair-Regular.ttf", "Playfair", "normal");
    doc.addFileToVFS("Playfair-SemiBold.ttf", toBase64(ps)); doc.addFont("Playfair-SemiBold.ttf", "Playfair", "bold");
    doc.addFileToVFS("Inter-Regular.ttf", toBase64(ir)); doc.addFont("Inter-Regular.ttf", "Inter", "normal");
    doc.addFileToVFS("Inter-SemiBold.ttf", toBase64(is)); doc.addFont("Inter-SemiBold.ttf", "Inter", "bold");
    SERIF = "Playfair"; SANS = "Inter";
  } catch { /* Valt terug op standaardletters; de inhoud blijft identiek. */ }
  let logo: { data: string; fmt: "PNG" | "JPEG"; ratio: number } | null = null;
  for (const url of PDF_ASSETS.logo) {
    try {
      const buf = await load(url);
      const b = new Uint8Array(buf);
      if (!isImage(b)) continue;
      const fmt = b[0] === 0x89 ? "PNG" : "JPEG";
      const data = `data:image/${fmt.toLowerCase()};base64,${toBase64(buf)}`;
      const p = doc.getImageProperties(data);
      logo = { data, fmt, ratio: p.width / p.height };
      break;
    } catch { /* volgende bron */ }
  }

  const W = 210, H = 297, M = 18, CW = W - 2 * M, TOP = 36, BOTTOM = 276;
  const v = r.v23;
  const model = reportPdfModel(r, meta);
  let y = TOP;

  const font = (fam: "serif" | "sans", bold = false, size = 9, color: RGB = BODY) => {
    doc.setFont(fam === "serif" ? SERIF : SANS, bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
  };
  const lh = (size: number, k = 1.42) => size * 0.3528 * k;
  const lines = (s: string, width: number) => doc.splitTextToSize(s, width) as string[];
  const para = (s: string, x: number, yy: number, width: number, size: number, k = 1.42) => {
    const ls = lines(s, width);
    ls.forEach((l, i) => doc.text(l, x, yy + i * lh(size, k)));
    return ls.length * lh(size, k);
  };
  const measure = (s: string, width: number, fam: "serif" | "sans", bold: boolean, size: number, k = 1.42) => { font(fam, bold, size); return lines(s, width).length * lh(size, k); };
  const eyebrow = (s: string, x: number, yy: number, color: RGB = ORANGE) => { font("sans", true, 6.8, color); doc.text(s.toUpperCase(), x, yy, { charSpace: 0.9 }); };

  const draw = (shapes: Shape[], x: number, yy: number, size: number, grid: number, color: RGB, k = 0.6, gridH?: number) => {
    const s = size / grid;
    for (const sh of shapes) {
      doc.setDrawColor(...(sh.accent ? ORANGE : color));
      doc.setFillColor(...(sh.accent ? ORANGE : color));
      doc.setLineWidth(Math.max(0.08, (sh.w ?? 1.4) * s * k));
      doc.setLineDashPattern(sh.dash ? [0.7, 0.7] : [], 0);
      if (sh.k === "c") doc.circle(x + sh.x * s, yy + sh.y * s, sh.r * s, sh.fill ? "F" : "S");
      else {
        const pts = sh.p.map(([px, py]) => [x + px * s, yy + py * s]);
        const d = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
        doc.lines(d, pts[0][0], pts[0][1], [1, 1], sh.fill ? "F" : "S", !!sh.c);
      }
    }
    doc.setLineDashPattern([], 0);
    void gridH;
  };
  const icon = (id: IconId, x: number, yy: number, size: number, color: RGB = ORANGE) => draw(ICONS[id], x, yy, size, 24, color, 0.55);

  // ---------- Kop- en voettekst ----------
  const sections: number[] = [];
  const header = () => {
    if (logo) {
      const h = 19, w = h * logo.ratio;
      doc.addImage(logo.data, logo.fmt, M - 2, 7, w, h, undefined, "FAST");
    } else { font("serif", true, 14, INK); doc.text("DIMAC", M, 20); }
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.5); doc.line(M, 27, M + 10, 27);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M + 12, 27, W - M, 27);
    font("sans", false, 6.5, MUTED); doc.text("WONINGSCAN / QUICKSCAN", W - M - 22, 19, { align: "right", charSpace: 0.7 });
  };
  const newPage = (first = false) => { if (!first) doc.addPage(); header(); y = TOP; };
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  const startSection = () => { newPage(); sections.push(doc.getNumberOfPages()); };

  // ---------- Pagina 1: cover ----------
  header(); sections.push(1);
  eyebrow("Persoonlijk woningrapport", M, 44);
  font("serif", false, 42, INK); doc.text("Uw woning", M, 62); doc.text("in beeld.", M, 78);
  font("sans", false, 8.6, INK);
  let cy = 88;
  if (v.facts.length) cy += para(v.facts.map((f) => f.value.replace(/ /g, "\u00a0")).join("  ·  "), M, cy, 80, 8.6) + 3;
  font("sans", false, 8.8, BODY);
  cy += para(`Een heldere eerste analyse van uw ${r.apartment ? "appartement" : "woning"}, op basis van uw eigen antwoorden in de DIMAC Quickscan.`, M, cy, 84, 8.8) + 2;
  font("sans", false, 7.2, MUTED); doc.text(new Date(meta.date).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }) + `  ·  Rapport ${meta.reportNumber}`, M, cy + 3);
  // Illustratie (illustratief, geen foto)
  draw(ILLUSTRATIONS[v.illustration], 104, 34, 88, 220, [92, 96, 104], 0.5);
  font("sans", false, 5.8, MUTED); doc.text("ILLUSTRATIE, GEEN WEERGAVE VAN UW WONING", 192, 98, { align: "right", charSpace: 0.5 });
  y = Math.max(cy + 10, 106);

  if (r.safety.length) {
    const items = r.safety.map((s) => ({ t: s.title, b: s.text }));
    const h = 10 + items.reduce((n, it) => n + measure(it.t, CW - 12, "sans", true, 8.6) + measure(it.b, CW - 12, "sans", false, 8) + 3, 0);
    doc.setDrawColor(...RED); doc.setLineWidth(0.5); doc.rect(M, y, CW, h, "S");
    eyebrow("Veiligheid eerst", M + 6, y + 6, RED);
    let sy = y + 11;
    for (const it of items) { font("sans", true, 8.6, INK); sy += para(it.t, M + 6, sy, CW - 12, 8.6); font("sans", false, 8, BODY); sy += para(it.b, M + 6, sy, CW - 12, 8) + 3; }
    y += h + 6;
  }

  // Barometer
  {
    const textH = measure(r.category.text, CW - 16, "sans", false, 8.4);
    const h = 44 + textH;
    doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.rect(M, y, CW, h, "FD");
    eyebrow("Uw renovatiebarometer", M + 8, y + 9);
    font("serif", false, 22, INK); doc.text(r.category.label, M + 8, y + 21);
    const segW = (CW - 16) / 4;
    CATEGORIES.forEach((c, i) => {
      const on = r.level === i;
      doc.setFillColor(...(on ? ORANGE : ([222, 222, 226] as RGB)));
      doc.roundedRect(M + 8 + i * segW + 0.8, y + 26, segW - 1.6, on ? 3 : 2.2, 1, 1, "F");
      font("sans", on, 6.4, on ? INK : MUTED); doc.text(lines(c.label, segW - 2), M + 8 + i * segW + 0.8, y + 34);
    });
    font("sans", false, 8.4, BODY); para(r.category.text, M + 8, y + 41, CW - 16, 8.4);
    font("sans", false, 6.8, MUTED); doc.text("Een eerste indicatie op basis van uw antwoorden, geen technische diagnose.", M + 8, y + h - 3.5);
    y += h + 8;
  }

  // Highlights
  if (v.highlights.length) {
    font("serif", false, 15, INK); doc.text("Dit verdient uw aandacht", M, y + 4);
    font("sans", false, 6.2, MUTED); doc.text("OP BASIS VAN UW ANTWOORDEN", W - M, y + 4, { align: "right", charSpace: 0.6 });
    y += 9;
    const gap = 4, cw = (CW - gap * 2) / 3;
    const hs = v.highlights.map((h) => 26 + measure(h.title, cw - 20, "sans", true, 8.6, 1.3) + measure(h.short, cw - 10, "sans", false, 7.8));
    const ch = Math.max(...hs);
    ensure(ch);
    v.highlights.forEach((h, i) => {
      const x = M + i * (cw + gap);
      doc.setDrawColor(...(h.safety ? RED : LINE)); doc.setLineWidth(0.25); doc.rect(x, y, cw, ch, "S");
      icon(h.icon, x + 5, y + 5, 10);
      font("serif", false, 13, ORANGE); doc.text(String(i + 1).padStart(2, "0"), x + 18, y + 10);
      font("sans", true, 8.6, INK); const th = para(h.title, x + 18, y + 15, cw - 22, 8.6, 1.3);
      font("sans", false, 7.8, BODY); para(h.short, x + 5, y + Math.max(24, 17 + th), cw - 10, 7.8);
      doc.setDrawColor(...ORANGE); doc.setLineWidth(0.6); doc.line(x + 5, y + ch - 4, x + 13, y + ch - 4);
    });
    y += ch + 8;
  }

  // Eerste conclusie
  {
    const h = measure(v.conclusion, CW - 8, "serif", false, 11.5, 1.35) + 7;
    ensure(h);
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.7); doc.line(M, y, M, y + h);
    eyebrow("Eerste conclusie", M + 5, y + 3, MUTED);
    font("serif", false, 11.5, INK); para(v.conclusion, M + 5, y + 9, CW - 8, 11.5, 1.35);
    y += h + 4;
  }

  // ---------- Pagina 2: analyse ----------
  startSection();
  eyebrow("Analyse per bouwdeel", M, y + 4);
  font("serif", false, 26, INK); doc.text("De resultaten", M, y + 16); doc.text("in detail.", M, y + 26);
  font("sans", false, 7.6, MUTED); para("Op basis van uw antwoorden geven we per thema een eerste inschatting. Dit is een indicatie en geen technische diagnose. Een lage score bewijst niet dat een onderdeel in orde is.", 118, y + 12, W - M - 118, 7.6);
  y += 34;
  const STATUS: Record<DomainStatus, { fill: RGB | null; stroke: RGB; dash?: boolean }> = {
    geen: { fill: null, stroke: [150, 150, 156] }, beperkt: { fill: [200, 200, 206], stroke: [150, 150, 156] },
    duidelijk: { fill: ORANGE, stroke: ORANGE }, ernstig: { fill: RED, stroke: RED }, onvoldoende: { fill: null, stroke: [150, 150, 156], dash: true },
  };
  for (const d of v.domains) {
    const tw = CW - 70;
    const body = [d.analysis, d.missing, d.scopeNote].filter(Boolean) as string[];
    const h = 12 + body.reduce((n, t, i) => n + measure(t, tw, "sans", false, i ? 7 : 7.8) + 1, 0);
    ensure(h + 3);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.25); doc.rect(M, y, CW, h, "S");
    icon(d.icon, M + 5, y + (h - 11) / 2, 11);
    font("sans", true, 9, INK); doc.text(d.title, M + 22, y + 7);
    let by = y + 12;
    body.forEach((t, i) => { font("sans", false, i ? 7 : 7.8, i ? MUTED : BODY); by += para(t, M + 22, by, tw, i ? 7 : 7.8) + 1; });
    const st = STATUS[d.status];
    doc.setLineDashPattern(st.dash ? [0.5, 0.5] : [], 0); doc.setDrawColor(...st.stroke); doc.setLineWidth(0.45);
    if (st.fill) { doc.setFillColor(...st.fill); doc.circle(W - M - 46, y + h / 2 - 1, 1.5, "FD"); } else doc.circle(W - M - 46, y + h / 2 - 1, 1.5, "S");
    doc.setLineDashPattern([], 0);
    font("sans", true, 7.2, INK); para(d.statusLabel, W - M - 42, y + h / 2, 38, 7.2, 1.25);
    y += h + 3;
  }

  if (v.connections.length) {
    y += 5;
    const blocks = v.connections.map((c) => Math.max(66, measure(c.text, 78, "sans", false, 8) + 18));
    const h = 26 + blocks.reduce((a, b) => a + b, 0);
    ensure(Math.min(h, BOTTOM - TOP));
    doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.rect(M, y, CW, h, "FD");
    eyebrow("Wat vertellen uw antwoorden samen?", M + 8, y + 9);
    font("serif", false, 17, INK); doc.text("Verbanden die het verschil maken.", M + 8, y + 19);
    let ky = y + 28;
    v.connections.forEach((c, i) => {
      const bx = M + 8, bw = 82;
      const P = c.nodes.length === 3 ? [[bx + bw / 2, ky + 8], [bx + 10, ky + 44], [bx + bw - 10, ky + 44]] : [[bx + 16, ky + 18], [bx + bw - 16, ky + 18]];
      doc.setDrawColor(...ORANGE); doc.setLineWidth(0.3); doc.setLineDashPattern([0.9, 0.9], 0);
      P.forEach((p, j) => {
        if (c.nodes.length === 2 && j === 1) return;
        const q = P[(j + 1) % P.length];
        const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), u = 8.5 / L;
        doc.line(p[0] + dx * u, p[1] + dy * u, q[0] - dx * u, q[1] - dy * u);
      });
      doc.setLineDashPattern([], 0);
      c.nodes.forEach((n, j) => {
        const [px, py] = P[j];
        doc.setFillColor(255, 255, 255); doc.setDrawColor(...ORANGE); doc.setLineWidth(0.35); doc.circle(px, py, 7.5, "FD");
        icon(n.icon, px - 4.5, py - 4.5, 9);
        font("sans", true, 7.6, INK); doc.text(n.label, px, py + 11.5, { align: "center" });
        font("sans", false, 6.2, MUTED); doc.text(lines(n.caption, 30), px, py + 14.5, { align: "center" });
      });
      if (c.nodes.length === 3) { icon("house", bx + bw / 2 - 3.5, ky + 30, 7, MUTED); }
      const tx = M + 98;
      font("sans", true, 8.6, INK); doc.text(c.title, tx, ky + 4);
      font("sans", false, 8, BODY); const th = para(c.text, tx, ky + 10, CW - 98 - 6, 8);
      font("sans", false, 6.8, MUTED); doc.text("Een mogelijk verband, geen bewezen oorzaak.", tx, ky + 13 + th);
      ky += blocks[i];
    });
    y += h + 6;
  }

  const textBlock = (title: string, body: string[], size = 7.8) => {
    const h = 7 + body.reduce((n, t) => n + measure(t, CW, "sans", false, size) + 1.5, 0);
    ensure(h);
    font("sans", true, 8.8, INK); doc.text(title, M, y + 4);
    let by = y + 9;
    for (const t of body) { font("sans", false, size, BODY); by += para(t, M, by, CW, size) + 1.5; }
    y = by + 3;
  };
  if (r.unknown.items.length || r.unknown.skipped?.length) textBlock(`Wat weten we nog niet? ${r.unknown.label}.`, [r.unknown.sentence, r.unknown.skipped?.length ? `Overgeslagen: ${r.unknown.skipped.map((s) => s.label).join("; ")}.` : ""].filter(Boolean));
  for (const n of r.notices ?? []) textBlock(n.title, [n.text]);
  if (r.apartment) {
    const sig = r.apartment.groups?.flatMap((g) => g.signals) ?? r.apartment.signals;
    textBlock(r.apartment.title, [...sig, ...(r.apartment.syndic?.length ? [`Vragen voor de syndicus: ${r.apartment.syndic.join(" ")}`] : []), ...r.apartment.notes], 7.4);
  }

  // ---------- Pagina 3: advies ----------
  startSection();
  eyebrow("Praktisch advies", M, y + 4);
  font("serif", false, 22, INK); const tl = lines(v.adviceTitle, 112); tl.forEach((l, i) => doc.text(l, M, y + 15 + i * 9));
  font("sans", false, 7.6, MUTED); para("Met deze acties verduidelijkt u de belangrijkste aandachtspunten en onzekerheden.", 140, y + 12, W - M - 140, 7.6);
  y += 17 + tl.length * 9;
  v.actions.forEach((x, i) => {
    const tw = CW - 42;
    const h = 12 + measure(x.text, tw, "sans", false, 7.8) + (x.next ? measure(`Volgende stap: ${x.next}`, tw, "sans", false, 7) + 1 : 0);
    ensure(h + 3);
    doc.setDrawColor(...(x.id === "ACT-VEILIGHEID" ? RED : LINE)); doc.setLineWidth(0.25); doc.rect(M, y, CW, h, "S");
    font("serif", false, 18, ORANGE); doc.text(String(i + 1).padStart(2, "0"), M + 5, y + 10);
    icon(x.icon, M + 20, y + 4, 10, [92, 96, 104]);
    font("sans", true, 9, INK); doc.text(x.title, M + 36, y + 7);
    font("sans", false, 7.8, BODY); let ty = y + 12 + para(x.text, M + 36, y + 12, tw, 7.8);
    if (x.next) { font("sans", false, 7, MUTED); ty += para(`Volgende stap: ${x.next}`, M + 36, ty + 1, tw, 7); }
    y += h + 3;
  });

  if (v.documents.length) {
    y += 4;
    const colW = (CW - 16 - 8) / 2;
    const rows = Math.ceil(v.documents.length / 2);
    const LW = colW - 34;
    const rowH = (d: (typeof v.documents)[number]) => 2.5 + measure(d.label, LW, "sans", false, 7.8, 1.3) + (d.note ? measure(d.note, colW - 8, "sans", false, 6.6, 1.3) + 1 : 0);
    const heights = Array.from({ length: rows }, (_, i) => Math.max(rowH(v.documents[i * 2]), v.documents[i * 2 + 1] ? rowH(v.documents[i * 2 + 1]) : 0) + 3);
    const h = 26 + heights.reduce((a, b) => a + b, 0) + 6;
    ensure(h);
    doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.rect(M, y, CW, h, "FD");
    eyebrow("Handige documenten", M + 8, y + 9);
    font("serif", false, 16, INK); doc.text("Documenten om op te vragen.", M + 8, y + 19);
    const TAG: Record<DocStatus, string> = { beschikbaar: "Beschikbaar", verifieren: "Nog te verifiëren", onbekend: "Onbekend", nvt: "N.v.t." };
    let ry = y + 27;
    for (let i = 0; i < rows; i++) {
      [v.documents[i * 2], v.documents[i * 2 + 1]].forEach((d, j) => {
        if (!d) return;
        const x = M + 8 + j * (colW + 8);
        icon("doc", x, ry - 3.2, 4.5, [120, 122, 128]);
        font("sans", false, 7.8, INK); const lh2 = para(d.label, x + 6, ry, LW, 7.8, 1.3);
        font("sans", true, 6.2, d.status === "beschikbaar" ? INK : MUTED);
        const tag = TAG[d.status]; const tw = doc.getTextWidth(tag) + 3;
        doc.setDrawColor(...(d.status === "beschikbaar" ? ([120, 122, 128] as RGB) : LINE)); doc.setLineWidth(0.2); doc.rect(x + colW - tw, ry - 3, tw, 4.2, "S");
        doc.text(tag, x + colW - tw + 1.5, ry);
        if (d.note) { font("sans", false, 6.6, MUTED); para(d.note, x + 6, ry + lh2 + 0.4, colW - 8, 6.6, 1.3); }
      });
      ry += heights[i];
    }
    font("sans", false, 6.6, MUTED); doc.text("Een onbekend document is niet automatisch afwezig.", M + 8, y + h - 4);
    y += h + 6;
  }

  // Aanbeveling
  {
    const rec = v.recommendation;
    const tw = 106;
    const parts: [string, number, boolean][] = [];
    if (rec.safetyFirst) parts.push(["Volg eerst het veiligheidsadvies bovenaan dit rapport. Een Woningscan vervangt geen onmiddellijke veiligheidsmaatregel.", 7.8, true]);
    const titleH = measure(rec.title, tw, "serif", false, 19, 1.2);
    let h = 16 + titleH + measure(rec.motivation, tw, "sans", false, 8.2) + 3 + (rec.gains ? measure(rec.gains, tw, "sans", false, 7.6) + 2 : 0) + rec.benefits.length * 5 + (rec.price !== null ? 12 : 0) + (rec.drone ? measure(`Optioneel: drone-dakscreening + ${formatEuro(rec.drone.price)} ${VAT_LABEL}. ${rec.drone.text}`, tw, "sans", false, 7.4) + 3 : 0) + 14 + (rec.secondary ? measure(rec.secondary.text, tw, "sans", false, 7.2) + 2 : 0) + 12 + parts.reduce((n, p) => n + measure(p[0], tw, "sans", true, p[1]) + 2, 0);
    h = Math.max(h + 14, 70);
    ensure(h);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.rect(M, y, CW, h, "S");
    draw(ILLUSTRATIONS[v.illustration], W - M - 50, y + h - 40, 46, 220, [214, 214, 218], 0.45);
    let ry = y + 9;
    eyebrow("Uw aanbevolen volgende stap", M + 8, ry); ry += 5;
    for (const [t, s] of parts) { font("sans", true, s, RED); ry += para(t, M + 8, ry + 2, tw, s) + 2; }
    font("serif", false, 19, INK); ry += para(rec.title, M + 8, ry + 6, tw, 19, 1.2) + 4;
    font("sans", false, 8.2, BODY); ry += para(rec.motivation, M + 8, ry + 2, tw, 8.2) + 3;
    if (rec.gains) { font("sans", false, 7.6, BODY); ry += para(rec.gains, M + 8, ry + 1, tw, 7.6) + 2; }
    for (const b of rec.benefits) {
      doc.setDrawColor(...ORANGE); doc.setLineWidth(0.45); doc.lines([[1, 1], [2.2, -2.4]], M + 8, ry + 1.6, [1, 1], "S", false);
      font("sans", false, 8, INK); doc.text(b, M + 13, ry + 2.6); ry += 5;
    }
    if (rec.price !== null) {
      font("serif", false, 18, INK); doc.text(model.priceLabel!, M + 8, ry + 9);
      const pw = doc.getTextWidth(model.priceLabel!);
      font("sans", false, 7.6, MUTED); doc.text(VAT_LABEL, M + 11 + pw, ry + 9);
      if (rec.availability === "coming_soon") { font("sans", true, 6.4, ORANGE); const t = "BINNENKORT BESCHIKBAAR"; const w2 = doc.getTextWidth(t) + 4; doc.setDrawColor(...ORANGE); doc.rect(M + 30 + pw, ry + 5.6, w2, 4.8, "S"); doc.text(t, M + 32 + pw, ry + 9); }
      ry += 12;
    }
    if (rec.drone) { font("sans", false, 7.4, BODY); ry += para(`Optioneel: drone-dakscreening + ${formatEuro(rec.drone.price)} ${VAT_LABEL}. ${rec.drone.text}`, M + 8, ry + 2, tw, 7.4) + 3; }
    // CTA's met werkende absolute links
    const btn = (label: string, url: string | null, x: number, primary: boolean) => {
      font("sans", true, 8, primary ? [255, 255, 255] : INK);
      const w = doc.getTextWidth(label) + 12;
      if (primary) { doc.setFillColor(...(url ? ORANGE : ([190, 190, 196] as RGB))); doc.rect(x, ry + 1, w, 9, "F"); }
      else { doc.setDrawColor(...INK); doc.setLineWidth(0.3); doc.rect(x, ry + 1, w, 9, "S"); }
      doc.text(label + (primary && url ? "  →" : ""), x + 6, ry + 6.8);
      if (url) doc.link(x, ry + 1, w, 9, { url });
      return w;
    };
    let bx = M + 8;
    if (rec.productId) bx += btn(rec.ctaLabel, model.ctaUrl, bx, true) + 4;
    btn(rec.infoLabel, model.infoUrl, bx, !rec.productId);
    ry += 14;
    if (rec.secondary) { font("sans", false, 7.2, MUTED); const t = `${rec.secondary.text} ${rec.secondary.name}: ${formatEuro(rec.secondary.price)} ${VAT_LABEL}.`; ry += para(t, M + 8, ry + 1, tw, 7.2) + 2; }
    font("sans", false, 6.6, MUTED);
    if (rec.limitation) ry += para(rec.limitation, M + 8, ry + 1, tw, 6.6);
    if (rec.price !== null) para(`${rec.priceNote} Rapportdatum: ${new Date(meta.date).toLocaleDateString("nl-BE")}.`, M + 8, ry + 1.5, tw, 6.6);
    y += h + 6;
  }

  {
    const h = measure(r.limits, CW, "sans", false, 6.8) + 6;
    ensure(h);
    eyebrow("Grenzen van de Quickscan", M, y + 3, MUTED);
    font("sans", false, 6.8, MUTED); para(r.limits, M, y + 8, CW, 6.8);
  }

  // Voetteksten en paginering
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M, 282, W - M, 282);
    if (logo) doc.addImage(logo.data, logo.fmt, M - 1, 283.5, 9 * logo.ratio, 9, undefined, "FAST");
    font("sans", false, 5.8, MUTED);
    doc.text("BOUWKUNDIGE EXPERTISE", M + 10, 287.2, { charSpace: 0.5 });
    doc.text("VOOR EEN ZEKERE WONING", M + 10, 290.2, { charSpace: 0.5 });
    doc.text(meta.reportNumber, W - M, 287.2, { align: "right" });
    doc.text("WONINGSCAN / QUICKSCAN", W - M, 290.2, { align: "right", charSpace: 0.5 });
    font("sans", false, 6.5, MUTED); doc.text(`${String(i).padStart(2, "0")} / ${String(pages).padStart(2, "0")}`, W - M, 19, { align: "right" });
  }
  void H;
  return opts.arrayBuffer ? (doc.output("arraybuffer") as unknown as Blob) : doc.output("blob");
}
