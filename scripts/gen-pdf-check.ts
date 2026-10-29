/**
 * Tijdelijk controlescript: genereert Quickscan-PDF's voor vier profielen
 * met de actuele code en echte fonts (via de dev server), voor visuele QA.
 * Gebruik: bun scripts/gen-pdf-check.ts  (dev server moet draaien)
 */
import { writeFileSync, mkdirSync } from "fs";
import { activeAnswers, visibleQuestions, type Answers, type Question } from "@/lib/quickscan";
import { composeReport } from "@/lib/quickscanReport";
import { buildReportPdf23 } from "@/lib/quickscanPdf23";

const defaults = (q: Question) => (q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id);
const clean: Answers = { Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q34: "aplus", G01: "hr", DI01: "degelijk", MI01: "geisoleerd", H01: "warmtepomp", H02: "0-5", Q46: ["geen"], Q48: "nee" };
function fill(seed: Answers) {
  const a = { ...seed };
  for (let i = 0; i < 100; i++) {
    const q = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined);
    if (!q) break;
    a[q.id] = seed[q.id] ?? defaults(q);
  }
  return activeAnswers(a);
}

const profiles: Record<string, Answers> = {
  "1-eenvoudig": fill(clean),
  "2-highlights": fill({ ...clean, Q01: "koper", Q14: "beschadigd", Q41: "beschadigd", Q46: ["dak", "elektriciteit", "interieur"], Q47: "ja", Q48: "ja" }),
  "3-renovatie-drone": fill({ ...clean, Q01: "koper", Q14: "beschadigd", Q41: "beschadigd", Q46: ["dak", "isolatie", "gevel", "ramen", "sanitair", "vloeren"], Q47: "ja", Q48: "ja", DI01: "onbekend" }),
  "4-appartement-vme": fill({ ...clean, Q01: "koper", Q02: "appartement", Q46A: ["geen"], A01: "onbekend", A02: "onbekend", A03: "onbekend", A04: "onbekend", A05: ["onbekend"], CD01: "onbekend", CL01: "onbekend" }),
};

const load = async (url: string) => {
  const res = await fetch(`http://localhost:8080${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.arrayBuffer();
};

mkdirSync("/tmp/pdfcheck", { recursive: true });
for (const [name, answers] of Object.entries(profiles)) {
  const report = composeReport(answers);
  const meta = { reportNumber: "QS-20261029-CHECK01", name: "Test Profiel", municipality: "3290 Diest", date: "2026-10-29" };
  const buf = (await buildReportPdf23(report as never, meta, { load, arrayBuffer: true })) as unknown as ArrayBuffer;
  writeFileSync(`/tmp/pdfcheck/${name}.pdf`, Buffer.from(buf));
  console.log(name, "pages:", (buf as unknown as { byteLength: number }).byteLength, "bytes");
}
console.log("klaar");
