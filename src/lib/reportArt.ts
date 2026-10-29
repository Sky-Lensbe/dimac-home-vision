/**
 * Lijnkunst voor het Quickscan-rapport: technische iconen en architecturale illustraties.
 * Eén vectorbron voor scherm (SVG) en PDF (jsPDF), zodat beide identiek ogen.
 * Alles is illustratief; de Quickscan verzamelt geen foto van de woning.
 */
import type { IconId, IllustrationId } from "@/lib/quickscanReport";

export type Pt = [number, number];
export type Shape =
  | { k: "l"; p: Pt[]; c?: boolean; w?: number; dash?: boolean; accent?: boolean; fill?: boolean }
  | { k: "c"; x: number; y: number; r: number; w?: number; dash?: boolean; accent?: boolean; fill?: boolean };

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 16): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [+(cx + r * Math.cos(t)).toFixed(2), +(cy + r * Math.sin(t)).toFixed(2)] as Pt;
  });
const rect = (x: number, y: number, w: number, h: number, o: Partial<Shape> = {}): Shape => ({ k: "l", p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c: true, ...o } as Shape);
const line = (a: Pt, b: Pt, o: Partial<Shape> = {}): Shape => ({ k: "l", p: [a, b], ...o } as Shape);

// ---------- Iconen (24×24) ----------
const drop = (): Pt[] => {
  // Druppel: punt bovenaan, cirkel onderaan (r 5.5 rond 12,15).
  const tip: Pt = [12, 3.2];
  const a = Math.asin(5.5 / 11.8) * (180 / Math.PI);
  return [tip, ...arc(12, 15, 5.5, -a, 180 + a, 24), tip];
};

export const ICONS: Record<IconId, Shape[]> = {
  roof: [{ k: "l", p: [[2.5, 11.5], [12, 3.5], [21.5, 11.5]] }, { k: "l", p: [[5, 9.5], [5, 20.5], [19, 20.5], [19, 9.5]] }, { k: "l", p: [[10, 20.5], [10, 14.5], [14, 14.5], [14, 20.5]] }],
  house: [{ k: "l", p: [[3, 11], [12, 4], [21, 11]] }, rect(5.5, 10, 13, 10.5), rect(10, 14, 4, 6.5)],
  drop: [{ k: "l", p: drop(), c: true }, { k: "l", p: arc(12, 15, 3, 100, 170, 6) }],
  leaf: [{ k: "l", p: [...arc(16, 16, 12, 180, 270, 12), ...arc(8, 8, 12, 0, 90, 12)], c: true }, line([5, 19], [17, 7])],
  gear: [{ k: "c", x: 12, y: 12, r: 3 }, { k: "c", x: 12, y: 12, r: 6.5 }, ...Array.from({ length: 8 }, (_, i) => {
    const t = (i * Math.PI) / 4;
    return line([12 + 6.5 * Math.cos(t), 12 + 6.5 * Math.sin(t)], [12 + 9 * Math.cos(t), 12 + 9 * Math.sin(t)], { w: 1.6 });
  })],
  crack: [{ k: "l", p: [[12.5, 2], [10, 7], [14, 11], [10.5, 15.5], [13, 19], [11, 22]] }, line([14, 11], [17, 12.5]), line([10.5, 15.5], [7.5, 16])],
  window: [rect(5, 3.5, 14, 17), line([12, 3.5], [12, 20.5]), line([5, 12], [19, 12]), line([3.5, 20.5], [20.5, 20.5])],
  fan: [{ k: "c", x: 12, y: 12, r: 9.5 }, { k: "c", x: 12, y: 12, r: 1.6 }, ...[0, 120, 240].map((r): Shape => ({ k: "l", p: [...arc(12, 12, 1.6, r - 30, r + 10, 3), ...arc(12, 12, 7.5, r + 20, r - 20, 8)], c: true }))],
  bolt: [{ k: "l", p: [[13.5, 2.5], [6, 13.5], [11.5, 13.5], [10, 21.5], [18, 10], [12.5, 10]], c: true }],
  doc: [{ k: "l", p: [[6, 2.5], [14.5, 2.5], [19, 7], [19, 21.5], [6, 21.5]], c: true }, { k: "l", p: [[14.5, 2.5], [14.5, 7], [19, 7]] }, line([9, 11.5], [16, 11.5]), line([9, 14.5], [16, 14.5]), line([9, 17.5], [13.5, 17.5])],
  shield: [{ k: "l", p: [[12, 2.5], [19.5, 5.5], [19.5, 11.5], ...arc(12, 11.5, 7.5, 0, 90, 6), ...arc(12, 11.5, 7.5, 90, 180, 6), [4.5, 5.5]], c: true }, line([12, 7.5], [12, 13]), { k: "c", x: 12, y: 16, r: 0.6, fill: true }],
  plan: [rect(3, 4, 18, 16), line([3, 10], [12, 10]), line([12, 4], [12, 20]), line([12, 14], [21, 14]), line([7, 10], [7, 20], { dash: true })],
  building: [rect(6, 3, 12, 18), ...[7, 11, 15].flatMap((y) => [rect(8.5, y, 2.5, 2.2), rect(13, y, 2.5, 2.2)]), line([3, 21], [21, 21])],
  pipe: [{ k: "l", p: [[3, 8], [14, 8], ...arc(14, 13, 5, -90, 0, 6), [19, 21]] }, { k: "l", p: [[3, 12], [14, 12], ...arc(14, 13, 1, -90, 0, 3), [15, 21]] }, line([7, 6.5], [7, 13.5])],
  flame: [{ k: "l", p: [[12, 2.5], [16, 8], [17.5, 13], ...arc(12, 15, 5.5, 0, 180, 12), [7, 11], [9.5, 12.5], [10, 7]], c: true }],
};

// ---------- Architecturale illustraties (220×150) ----------
const ground = (): Shape[] => [line([0, 132], [220, 132], { w: 0.6 }), ...Array.from({ length: 22 }, (_, i) => line([4 + i * 10, 132], [0 + i * 10, 136], { w: 0.25 }))];
const tree = (x: number, s = 1): Shape[] => [
  { k: "c", x, y: 132 - 34 * s, r: 15 * s, w: 0.5 }, { k: "c", x: x - 7 * s, y: 132 - 26 * s, r: 9 * s, w: 0.35 }, { k: "c", x: x + 8 * s, y: 132 - 28 * s, r: 8 * s, w: 0.35 },
  line([x, 132], [x, 132 - 22 * s], { w: 0.6 }), line([x, 132 - 14 * s], [x - 5 * s, 132 - 22 * s], { w: 0.4 }), line([x, 132 - 16 * s], [x + 6 * s, 132 - 24 * s], { w: 0.4 }),
];
const dims = (x0: number, x1: number, y = 142): Shape[] => [line([x0, y], [x1, y], { w: 0.3, accent: true }), line([x0, y - 2], [x0, y + 2], { w: 0.3, accent: true }), line([x1, y - 2], [x1, y + 2], { w: 0.3, accent: true })];
const facadeLines = (x: number, y: number, w: number, h: number, step = 4): Shape[] => Array.from({ length: Math.floor(h / step) }, (_, i) => line([x, y + (i + 1) * step], [x + w, y + (i + 1) * step], { w: 0.15 }));

function gableHouse(x: number, w: number, eave: number, apex: number, o: { main?: boolean } = {}): Shape[] {
  const m = o.main ?? true;
  const W = m ? 1 : 0.4;
  const cx = x + w / 2;
  return [
    { k: "l", p: [[x - 5, eave + 2], [cx, apex], [x + w + 5, eave + 2]], w: W },
    { k: "l", p: [[x, eave], [x, 132], [x + w, 132], [x + w, eave]], w: W },
    ...(m ? [
      ...facadeLines(x, eave, w, 132 - eave, 5),
      rect(x + w * 0.14, eave + 12, w * 0.22, 20, { w: 0.6 }), line([x + w * 0.25, eave + 12], [x + w * 0.25, eave + 32], { w: 0.3 }),
      rect(x + w * 0.6, eave + 12, w * 0.26, 20, { w: 0.6 }),
      rect(x + w * 0.42, 132 - 30, w * 0.14, 30, { w: 0.7, accent: true }),
      rect(cx - 6, apex + 14, 12, 12, { w: 0.5 }), line([cx, apex + 14], [cx, apex + 26], { w: 0.3 }),
      line([cx, apex], [cx, apex - 14], { w: 0.25, dash: true }), line([x - 5, eave + 2], [x - 18, eave + 12], { w: 0.25, dash: true }), line([x + w + 5, eave + 2], [x + w + 18, eave + 12], { w: 0.25, dash: true }),
    ] : [rect(x + w * 0.2, eave + 14, w * 0.2, 16, { w: 0.3 }), rect(x + w * 0.6, eave + 14, w * 0.2, 16, { w: 0.3 })]),
  ];
}

export const ILLUSTRATIONS: Record<IllustrationId, Shape[]> = {
  open: [...ground(), ...gableHouse(52, 96, 72, 26), rect(148, 96, 44, 36, { w: 0.8 }), line([146, 96], [194, 96], { w: 1 }), rect(158, 106, 24, 26, { w: 0.4 }), ...facadeLines(148, 96, 44, 36, 6), ...tree(26, 1.05), ...tree(205, 0.7), ...dims(52, 192)],
  ander: [...ground(), ...gableHouse(60, 100, 72, 28), ...tree(30), ...tree(196, 0.8), ...dims(60, 160)],
  halfopen: [...ground(), ...gableHouse(26, 82, 74, 32, { main: false }), ...gableHouse(108, 82, 74, 32), ...Array.from({ length: 12 }, (_, i) => line([108, 80 + i * 4.5], [111, 77 + i * 4.5], { w: 0.25 })), ...tree(206, 0.75), ...dims(108, 190)],
  gesloten: [...ground(), ...gableHouse(10, 64, 74, 36, { main: false }), ...gableHouse(78, 64, 74, 36), ...gableHouse(146, 64, 74, 36, { main: false }), ...dims(78, 142)],
  appartement: [
    ...ground(), rect(54, 28, 112, 104, { w: 1 }), line([50, 28], [170, 28], { w: 1 }), line([50, 24], [170, 24], { w: 0.4 }),
    ...[38, 60, 82, 104].flatMap((y) => [62, 90, 118, 146].map((x) => rect(x, y, 14, 14, { w: 0.5 }))),
    ...[52, 74, 96].map((y) => line([84, y], [136, y], { w: 0.7, accent: y === 74 })),
    rect(102, 112, 16, 20, { w: 0.7 }), ...facadeLines(54, 28, 112, 104, 7), ...tree(28, 0.95), ...tree(196, 0.8), ...dims(54, 166),
  ],
};

/** SVG-pad voor een vorm (gedeeld door de React-weergave). */
export function svgPath(s: Shape): string {
  if (s.k === "c") return "";
  return `M${s.p.map(([x, y]) => `${x} ${y}`).join(" L")}${s.c ? " Z" : ""}`;
}
