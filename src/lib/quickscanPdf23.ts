import { jsPDF } from "jspdf";
import { CATEGORIES } from "@/lib/quickscan";
import { withReportRef, type QuickscanReport23, type DomainStatus, type DocStatus, type IconId, type ReportV232 } from "@/lib/quickscanReport";
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
  const x = (r as { v232?: ReportV232 }).v232;
  const actionList = x ? x.actions.technical : v.actions;
  const docList: { label: string; statusLabel: string; note: string | null }[] = x ? x.documents : v.documents;
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
    font("sans", false, 6.5, MUTED); doc.text("WONINGSCAN / QUICKSCAN", W - M - 32, 19, { align: "right", charSpace: 0.7 });
  };
  const newPage = (first = false) => { if (!first) doc.addPage(); header(); y = TOP; };
  /** Paginaovergang enkel wanneer een blok van hoogte h hier echt niet meer past. */
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  /**
   * Keep-with-next voor hoofdstuktitels: breek alleen wanneer de titel én het
   * eerste blok (keep-together) er niet meer samen op passen. Zo ontstaan nooit
   * verweesde titels en nooit onnodig vroege paginawissels.
   */
  const keepWithNext = (headingH: number, firstBlockH: number) => {
    if (y + headingH + firstBlockH > BOTTOM) newPage();
  };
  const startSection = (headingH: number, firstBlockH: number) => {
    y += 9;
    keepWithNext(headingH, firstBlockH);
    sections.push(doc.getNumberOfPages());
  };

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
  font("sans", false, 5.8, MUTED); doc.text("ILLUSTRATIE, GEEN WEERGAVE VAN UW WONING", W - M, 98, { align: "right" });
  y = Math.max(cy + 10, 106);

  if (r.safety.length) {
    const items = r.safety.map((s) => ({ t: s.title, b: s.text }));
    const h = 10 + items.reduce((n, it) => n + measure(it.t, CW - 12, "sans", true, 8.6) + measure(it.b, CW - 12, "sans", false, 8) + 3, 0);
    ensure(h + 6);
    doc.setDrawColor(...RED); doc.setLineWidth(0.5); doc.rect(M, y, CW, h, "S");
    eyebrow("Veiligheid eerst", M + 6, y + 6, RED);
    let sy = y + 11;
    for (const it of items) { font("sans", true, 8.6, INK); sy += para(it.t, M + 6, sy, CW - 12, 8.6); font("sans", false, 8, BODY); sy += para(it.b, M + 6, sy, CW - 12, 8) + 3; }
    y += h + 6;
  }

  // Barometer
  {
    const textH = measure(r.category.text, CW - 16, "sans", false, 8.4);
    const h = 48 + textH;
    ensure(h + 8);
    doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.rect(M, y, CW, h, "FD");
    eyebrow("Uw renovatiebarometer", M + 8, y + 9);
    font("serif", false, 22, INK); doc.text(r.category.label, M + 8, y + 21);
    const segW = (CW - 16) / 4;
    CATEGORIES.forEach((c, i) => {
      const on = r.level === i;
      doc.setFillColor(...(on ? ORANGE : ([222, 222, 226] as RGB)));
      doc.roundedRect(M + 8 + i * segW + 0.8, y + 26, segW - 1.6, on ? 3 : 2.2, 1, 1, "F");
      font("sans", on, 7.4, on ? INK : MUTED); doc.text(lines(c.label, segW - 2), M + 8 + i * segW + 0.8, y + 34);
    });
    font("sans", false, 8.4, BODY); para(r.category.text, M + 8, y + 41, CW - 16, 8.4);
    font("sans", false, 6.8, MUTED); doc.text("Een eerste indicatie op basis van uw antwoorden, geen technische diagnose.", M + 8, y + h - 3.5);
    y += h + 8;
  }

  // Highlights
  if (v.highlights.length) {
    const gap = 4, cw = (CW - gap * (v.highlights.length - 1)) / v.highlights.length;
    const hs = v.highlights.map((h) => 26 + measure(h.title, cw - 20, "sans", true, 8.6, 1.3) + measure(h.short, cw - 10, "sans", false, 7.8));
    const ch = Math.max(...hs);
    ensure(ch + 9);
    font("serif", false, 15, INK); doc.text("Dit verdient uw aandacht", M, y + 4);
    font("sans", false, 6.2, MUTED); doc.text("OP BASIS VAN UW ANTWOORDEN", W - M, y + 4, { align: "right" });
    y += 9;
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
    const h = measure(v.conclusion, CW - 8, "serif", false, 11.5, 1.35) + 13;
    ensure(h);
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.7); doc.line(M, y, M, y + h);
    eyebrow("Eerste conclusie", M + 5, y + 3, MUTED);
    font("serif", false, 11.5, INK); para(v.conclusion, M + 5, y + 9, CW - 8, 11.5, 1.35);
    y += h + 4;
  }

  // ---------- Pagina 2: analyse ----------
  const firstDomain = v.domains[0];
  const firstDomainH = firstDomain ? 18 + [firstDomain.analysis, firstDomain.missing, firstDomain.scopeNote].filter(Boolean).reduce((n, text) => n + measure(text as string, CW - 70, "sans", false, 9), 0) : 25;
  startSection(34, firstDomainH);
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
    const h = 10 + measure(d.title, tw, "sans", true, 9, 1.25) + body.reduce((n, t, i) => n + measure(t, tw, "sans", false, i ? 8.5 : 9) + 1, 0);
    ensure(h + 3);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.25); doc.rect(M, y, CW, h, "S");
    icon(d.icon, M + 5, y + (h - 11) / 2, 11);
    font("sans", true, 9, INK); const titleHeight = para(d.title, M + 22, y + 7, tw, 9, 1.25);
    let by = y + 9 + titleHeight;
    body.forEach((t, i) => { font("sans", false, i ? 8.5 : 9, i ? MUTED : BODY); by += para(t, M + 22, by, tw, i ? 8.5 : 9) + 1; });
    const st = STATUS[d.status];
    doc.setLineDashPattern(st.dash ? [0.5, 0.5] : [], 0); doc.setDrawColor(...st.stroke); doc.setLineWidth(0.45);
    if (st.fill) { doc.setFillColor(...st.fill); doc.circle(W - M - 46, y + h / 2 - 1, 1.5, "FD"); } else doc.circle(W - M - 46, y + h / 2 - 1, 1.5, "S");
    doc.setLineDashPattern([], 0);
    font("sans", true, 8.2, INK); para(d.statusLabel, W - M - 42, y + h / 2 - 2, 38, 8.2, 1.25);
    y += h + 3;
  }

  if (v.connections.length) {
    const first = v.connections[0];
    const firstH = 48 + measure(first.title, CW - 16, "sans", true, 10) + Math.max(...first.nodes.map((n) => measure(n.caption, (CW - 24) / first.nodes.length - 8, "sans", false, 8.5))) + measure(first.text, CW - 16, "sans", false, 9);
    y += 5; keepWithNext(21, firstH);
    eyebrow("Wat vertellen uw antwoorden samen?", M, y + 4);
    font("serif", false, 18, INK); doc.text("Verbanden die het verschil maken.", M, y + 14); y += 21;
    for (const c of v.connections) {
      const titleH = measure(c.title, CW - 16, "sans", true, 10);
      const captionH = Math.max(...c.nodes.map((n) => measure(n.caption, (CW - 24) / c.nodes.length - 8, "sans", false, 8.5)));
      const textH = measure(c.text, CW - 16, "sans", false, 9);
      const h = 48 + titleH + captionH + textH;
      ensure(h + 5);
      doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.rect(M, y, CW, h, "FD");
      font("sans", true, 10, INK); para(c.title, M + 8, y + 8, CW - 16, 10);
      const ny = y + 12 + titleH;
      const nw = (CW - 24) / c.nodes.length;
      doc.setDrawColor(...ORANGE); doc.setLineDashPattern([1, 1], 0);
      doc.line(M + 12 + nw / 2, ny + 5, M + 12 + nw * (c.nodes.length - 0.5), ny + 5); doc.setLineDashPattern([], 0);
      c.nodes.forEach((node, j) => {
        const nx = M + 12 + nw * j;
        doc.setFillColor(255, 255, 255); doc.circle(nx + nw / 2, ny + 5, 7, "F");
        icon(node.icon, nx + nw / 2 - 4.5, ny + 0.5, 9);
        font("sans", true, 9, INK); doc.text(node.label, nx + nw / 2, ny + 16, { align: "center" });
        font("sans", false, 8.5, MUTED); para(node.caption, nx + 4, ny + 22, nw - 8, 8.5);
      });
      const ty = ny + 26 + captionH;
      font("sans", false, 9, BODY); para(c.text, M + 8, ty, CW - 16, 9);
      font("sans", false, 8, MUTED); doc.text("Mogelijke afstemming of samenhang, geen bewezen oorzaak.", M + 8, ty + textH + 3);
      y += h + 5;
    }
  }

  const textBlock = (title: string, body: string[], size = 9) => {
    const h = 9 + body.reduce((n, t) => n + measure(t, CW, "sans", false, size) + 1, 0);
    ensure(h);
    font("sans", true, 8.8, INK); doc.text(title, M, y + 4);
    let by = y + 9;
    for (const t of body) { font("sans", false, size, BODY); by += para(t, M, by, CW, size) + 1; }
    y = by + 1;
  };
  const chapter = (eb: string, title: string, firstH: number) => {
    y += 6; keepWithNext(22, firstH);
    eyebrow(eb, M, y + 4); font("serif", false, 18, INK); doc.text(title, M, y + 15); y += 22;
  };
  if (x) {
    const e = x.energy;
    chapter("Energie en mogelijke verplichtingen", e.title.length > 60 ? "Energie en verplichtingen" : e.title, measure(e.text, CW, "sans", false, 9) + 10);
    textBlock(e.label ? `EPC-label ${e.label}` : "EPC-label onbekend", [e.text, ...e.points.map((t) => `– ${t}`)]);
    for (const l of x.legal) textBlock(l.title, [l.text, ...l.verify.map((t) => `– ${t}`), `Bron: ${l.sources.map((s2) => `${s2.label} (${s2.url})`).join("; ")}`]);
    if (x.legal.length) textBlock("Juridische context", [`Informatieve context, geen individueel juridisch advies. Gecontroleerd op ${new Date(x.legalVerifiedAt).toLocaleDateString("nl-BE")}.`], 8.5);
  }
  if (v.information?.topics.length || r.unknown.items.length || r.unknown.skipped?.length) textBlock(`Wat weten we nog niet? ${r.unknown.label}.`, [v.information?.sentence ?? r.unknown.sentence, r.unknown.skipped?.length ? `Overgeslagen: ${r.unknown.skipped.map((s) => s.label).join("; ")}.` : ""].filter(Boolean));
  for (const n of r.notices ?? []) textBlock(n.title, [n.text]);
  if (r.apartment) {
    const firstCard = v.coOwnership?.cards[0];
    const firstCardH = firstCard ? 19 + measure(firstCard.text, CW - 30, "sans", false, 9) + (firstCard.uncertain ? 5 : 0) : 25;
    y += 6; keepWithNext(24, firstCardH);
    eyebrow("Mede-eigendom", M, y + 4);
    font("serif", false, 23, INK); doc.text("Uw appartement en de VME", M, y + 16); y += 24;
    if (v.coOwnership) {
      for (const card of v.coOwnership.cards) {
        const h = 19 + measure(card.text, CW - 30, "sans", false, 9) + (card.uncertain ? 5 : 0);
        ensure(h + 4);
        doc.setDrawColor(...LINE); doc.rect(M, y, CW, h, "S"); icon(card.icon, M + 5, y + 5, 10);
        font("sans", true, 10, INK); doc.text(card.title, M + 21, y + 8);
        font("sans", false, 9, BODY); const th = para(card.text, M + 21, y + 15, CW - 30, 9);
        if (card.uncertain) { font("sans", false, 8.5, MUTED); doc.text("Nog te verduidelijken", M + 21, y + 16 + th); }
        y += h + 4;
      }
      for (const g of r.apartment.groups ?? []) if (g.title !== "Financiële onzekerheden" && g.signals.length) textBlock(g.title, g.signals);
      const firstQH = v.coOwnership.questions[0] ? measure(v.coOwnership.questions[0], CW - 10, "sans", false, 9) + 5 : 10;
      keepWithNext(12, firstQH); font("serif", false, 17, INK); doc.text("Vragen voor de verkoper of syndicus", M, y + 5); y += 12;
      v.coOwnership.questions.forEach((q, i) => { const h = measure(q, CW - 10, "sans", false, 9) + 5; ensure(h); font("sans", true, 9, ORANGE); doc.text(`${i + 1}.`, M, y + 3); font("sans", false, 9, BODY); y += para(q, M + 10, y + 3, CW - 10, 9) + 5; });
      textBlock("Aankoopchecklist", v.coOwnership.checklist.map((q) => `– ${q}`));
      textBlock("Privatief en gemeenschappelijk", ["Onbekende documenten zijn niet automatisch onbestaand. Gemeenschappelijke problemen tellen niet mee in de privatieve barometer; veiligheidsadvies blijft van toepassing."]);
    } else {
      const sig = r.apartment.groups?.flatMap((g) => g.signals) ?? r.apartment.signals;
      textBlock(r.apartment.title, [...sig, ...r.apartment.syndic, ...r.apartment.notes]);
    }
  }

  // ---------- Advies (alleen wanneer er acties zijn; nooit een titel zonder inhoud) ----------
  if (actionList.length) {
    const firstAction = actionList[0];
    const firstActionH = 20 + measure(firstAction.text, CW - 42, "sans", false, 9) + (firstAction.next ? measure(firstAction.next, CW - 42, "sans", false, 8.5) : 0);
    // Eerst het lettertype zetten, dan pas meten: splitTextToSize gebruikt het actieve font.
    font("serif", false, 22, INK); const tl = lines(v.adviceTitle, 112);
    startSection(17 + tl.length * 9, firstActionH);
    eyebrow("Praktisch advies", M, y + 4);
    font("serif", false, 22, INK); tl.forEach((l, i) => doc.text(l, M, y + 15 + i * 9));
    font("sans", false, 7.6, MUTED); para("Met deze acties verduidelijkt u de belangrijkste aandachtspunten en onzekerheden.", 140, y + 12, W - M - 140, 7.6);
    y += 17 + tl.length * 9;
    actionList.forEach((x, i) => {
    const tw = CW - 42;
    const h = 18 + measure(x.text, tw, "sans", false, 9) + (x.next ? measure(`Volgende stap: ${x.next}`, tw, "sans", false, 8.5) + 1 : 0);
    ensure(h + 3);
    doc.setDrawColor(...(x.id === "ACT-VEILIGHEID" ? RED : LINE)); doc.setLineWidth(0.25); doc.rect(M, y, CW, h, "S");
    font("serif", false, 18, ORANGE); doc.text(String(i + 1).padStart(2, "0"), M + 5, y + 10);
    icon(x.icon, M + 20, y + 4, 10, [92, 96, 104]);
    font("sans", true, 9, INK); doc.text(x.title, M + 36, y + 7);
    font("sans", false, 9, BODY); let ty = y + 12 + para(x.text, M + 36, y + 12, tw, 9);
    if (x.next) { font("sans", false, 8.5, MUTED); ty += para(`Volgende stap: ${x.next}`, M + 36, ty + 1, tw, 8.5); }
      y += h + 3;
    });
  }

  if (x && x.phases.length) {
    const ph0 = x.phases[0];
    chapter("Voorlopig digitaal advies", "Uw voorlopig renovatietraject", 12 + ph0.items.reduce((n, t) => n + measure(t, CW, "sans", false, 9) + 1, 0));
    for (const ph of x.phases) textBlock(`Fase ${ph.id} — ${ph.title}`, [ph.why, ...ph.items.map((t) => `– ${t}`), ...(ph.decide ? [`Beslissing hangt af van: ${ph.decide}`] : [])]);
    textBlock("Afbakening traject", ["Dit traject is geen uitvoeringsbestek, technische keuring of kostenraming."], 8.5);
  }
  if (x && x.actions.documents.length) {
    const d0 = x.actions.documents[0];
    chapter("Documenten en verplichtingen", "Wat u best nagaat", measure(d0.text, CW, "sans", false, 9) + 10);
    for (const d of x.actions.documents) textBlock(d.title, [d.text]);
  }

  if (docList.length) {
    const firstDocH = 16 + measure(docList[0].label, (CW - 5) / 2 - 22, "sans", true, 9);
    y += 5; keepWithNext(22, firstDocH);
    eyebrow("Handige documenten", M, y + 4);
    font("serif", false, 18, INK); doc.text("Documenten om op te vragen.", M, y + 15); y += 22;
    const dw = (CW - 5) / 2;
    for (let i = 0; i < docList.length; i += 2) {
      const pair = docList.slice(i, i + 2);
      const heights = pair.map((d) => 16 + measure(d.label, dw - 22, "sans", true, 9) + (d.note ? measure(d.note, dw - 12, "sans", false, 8.5) : 0));
      const h = Math.max(...heights); ensure(h + 3);
      pair.forEach((d, j) => {
        const dx = M + j * (dw + 5);
        doc.setFillColor(...SURFACE); doc.setDrawColor(...LINE); doc.rect(dx, y, dw, h, "FD"); icon("doc", dx + 4, y + 4, 6, MUTED);
        font("sans", true, 9, INK); const titleH = para(d.label, dx + 13, y + 7, dw - 22, 9);
        font("sans", true, 8.5, MUTED); doc.text(d.statusLabel, dx + 6, y + 9 + titleH);
        if (d.note) { font("sans", false, 8.5, BODY); para(d.note, dx + 6, y + 15 + titleH, dw - 12, 8.5); }
      });
      y += h + 3;
    }
    textBlock("Beschikbaarheid", ["Een onbekend document is niet automatisch afwezig."], 8.5);
  }

  {
    const h = measure(r.limits, CW, "sans", false, 8) + 9;
    ensure(h);
    eyebrow("Grenzen van de Quickscan", M, y + 3, MUTED);
    font("sans", false, 8, MUTED); para(r.limits, M, y + 7, CW, 8);
    y += h;
  }


  // Aanbeveling: dezelfde snapshot, leesbare volle breedte en deelblokken die mogen doorlopen.
  {
    const rec = v.recommendation;
    const th = measure(rec.title, CW, "serif", false, 24);
    // Keep-with-next: scheidingslijn, eyebrow en titel blijven samen; de deelblokken
    // eronder (motivatie, meerwaarde, prijs, links) breken zelfstandig via ensure().
    y += 5; keepWithNext(13, (rec.safetyFirst ? 22 : 0) + th + 12);
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.6); doc.line(M, y, W - M, y);
    eyebrow("Uw aanbevolen volgende stap", M, y + 8); y += 13;
    if (rec.safetyFirst) textBlock("Veiligheid eerst", ["Volg eerst het veiligheidsadvies bovenaan dit rapport. Een Woningscan vervangt geen onmiddellijke veiligheidsmaatregel."]);
    ensure(th + 8); font("serif", false, 24, INK); y += para(rec.title, M, y + 5, CW, 24) + 3;
    textBlock("Waarom deze dienst?", [rec.motivation]);
    if (rec.gains || rec.benefits.length) textBlock("Concrete meerwaarde", [rec.gains, ...rec.benefits.map((b) => `– ${b}`)].filter(Boolean));
    if (rec.price !== null && model.priceLabel) {
      ensure(20); font("serif", false, 22, INK); doc.text(model.priceLabel, M, y + 8);
      const pw = doc.getTextWidth(model.priceLabel); font("sans", false, 9, MUTED); doc.text(VAT_LABEL, M + pw + 4, y + 8); y += 15;
      if (rec.availability === "coming_soon") { font("sans", true, 9, ORANGE); doc.text("Binnenkort beschikbaar", M, y + 3); y += 10; }
    }
    if (rec.drone) textBlock("Optionele drone-dakscreening", [`+ ${formatEuro(rec.drone.price)} ${VAT_LABEL}. ${rec.drone.text}`, `${rec.drone.condition} De optie staat standaard uit.`]);
    const pdfLink = (title: string, url: string, primary: boolean) => {
      const h = 11 + measure(url, CW - 12, "sans", false, 8);
      ensure(h + 4); doc.setDrawColor(...(primary ? ORANGE : LINE)); doc.rect(M, y, CW, h, "S");
      font("sans", true, 10, primary ? ORANGE : INK); doc.text(title, M + 6, y + 6.5);
      font("sans", false, 8, BODY); para(url, M + 6, y + 10, CW - 12, 8);
      doc.link(M, y, CW, h, { url }); y += h + 2;
    };
    if (model.ctaUrl) pdfLink(rec.ctaLabel, model.ctaUrl, true);
    pdfLink(rec.infoLabel, model.infoUrl, false);
    // Slotblok: alternatief, afbakening en prijsnota blijven samen, zodat de laatste pagina nooit
    // alleen een losse slotzin bevat.
    const altText = rec.secondary ? `${rec.secondary.text} ${rec.secondary.name}: ${formatEuro(rec.secondary.price)} ${VAT_LABEL}.` : null;
    const closing = [rec.limitation, rec.price !== null ? `${rec.priceNote} Rapportdatum: ${new Date(meta.date).toLocaleDateString("nl-BE")}.` : null].filter(Boolean).join(" ");
    const tail = [altText, closing].filter(Boolean) as string[];
    if (tail.length) textBlock(altText ? "Alternatief en afbakening" : "Afbakening", tail, 8);
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
