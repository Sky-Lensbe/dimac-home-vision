import { it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { activeAnswers, visibleQuestions, type Answers, type Question } from "@/lib/quickscan";
import { composeReport } from "@/lib/quickscanReport";
import { buildReportPdf23, PDF_ASSETS } from "@/lib/quickscanPdf23";
const defaultFor = (q: Question) => (q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id);
function fill(seed: Answers): Answers { let a: Answers = { ...seed }; for (let i = 0; i < 90; i++) { const open = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined); if (!open) break; a = { ...a, [open.id]: seed[open.id] ?? defaultFor(open) }; } return activeAnswers(a); }
const T: Answers = { Q01: "koper", Q02: "halfopen", Q03: "vanaf2011", O01: "100-149", R01: "nooit", Q04: ["geen"], Q06: ["onbekend"], K01: "geen", B01: "nee", ST01: "nee", Q14: "geen", Z01: "bereikbaar", DI01: "onbekend", Q18: "geen", MI01: "onbekend", G01: "onbekend", Q20: "tocht", Q22: "beperkt", Q21: "nee", Q24: "terugkerend", Q25: ["buitenmuur", "ramen"], Q26: "afentoe", Q29: "plaatselijk", Q27: "koude", M01: "nee", Q23: "nee", Q30: "haar", AS01: "onbekend", RI01: "riolering", Q34: "aplus", Q35: "lt5", H01: "gas", H02: "6-10", Q42: "normaal", Q44: "12m", Q41: "geen", Q40: "onbekend", V01: "mechanisch", Q39: "beperkt", Q45: "geen", Q46: ["ramen", "verwarming"], Q47: "nee", Q48: "twijfel", Q49: "3m" };
const map: Record<string, string> = { [PDF_ASSETS.fonts.serif[0]]: "/tmp/fonts/PlayfairDisplay-Regular.ttf", [PDF_ASSETS.fonts.serif[1]]: "/tmp/fonts/PlayfairDisplay-SemiBold.ttf", [PDF_ASSETS.fonts.sans[0]]: "/tmp/fonts/Inter-Regular.ttf", [PDF_ASSETS.fonts.sans[1]]: "/tmp/fonts/Inter-SemiBold.ttf", "/logo-dimac.png": "public/logo-dimac.png" };
const load = async (u: string) => { if (!map[u]) throw new Error("x"); const b = readFileSync(map[u]); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
it("pdf", async () => {
  for (const [n, s] of [["tessenderlo", T], ["plus", { Q01: "eigenaar", Q02: "open", Q03: "1970-1990", Q14: "slijtage", Q17: "nauwelijks", Q46: ["dak", "isolatie", "ramen", "verwarming"] }], ["apt", { Q01: "koper", Q02: "appartement", Q03: "1970-1990", G01: "hr", A01: "duidelijk", CD01: "problemen", A02: "ingrijpend", A03: "substantieel" }]] as const) {
    const r = composeReport(fill(s as Answers));
    const b = await buildReportPdf23(r, { reportNumber: "QS-20261029-ABCDEF12", name: "Test", municipality: "3980", date: "2026-10-29T10:00:00Z" }, { load, arrayBuffer: true });
    writeFileSync(`/tmp/pdf-${n}.pdf`, Buffer.from(b as unknown as ArrayBuffer));
  }
}, 60000);
