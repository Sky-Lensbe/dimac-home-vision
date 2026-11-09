import { it } from "vitest";
import { activeAnswers, visibleQuestions, buildReport, type Answers, type Question } from "@/lib/quickscan";
import { composeReport } from "@/lib/quickscanReport";
const defaultFor = (q: Question) => (q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id);
function fill(seed: Answers): Answers {
  let a: Answers = { ...seed };
  for (let i = 0; i < 120; i++) {
    const open = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined);
    if (!open) break;
    a = { ...a, [open.id]: seed[open.id] ?? defaultFor(open) };
  }
  return activeAnswers(a);
}
const CASE01: Answers = { Q01: "eigenaar", Q02: "halfopen", Q03: "vanaf2011", R01: "0-5", Q20: "tocht", Q24: "terugkerend", Q25: ["ramen"], Q26: "afentoe", Q29: "geen", Q34: "a", G01: "hr", Q46: ["geen"], Q48: "nee" };
const CASE02: Answers = { Q01: "koper", Q02: "appartement", Q03: "1991-2010", BJ01: "vanaf2001", R01: "11-20", Q04A: ["geen"], Q24: "geen", Q34: "a", G01: "hr", FL01: "d", FL02: "d", A02: "ingrijpend", A03: "onbekend", Q46A: ["geen"], Q48: "nee" };
const CASE05: Answers = { Q01: "eigenaar", Q02: "rij", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "b", G01: "hr", Q46: ["vloeren", "interieur"], Q48: "ja" };
it("dbg", () => {
  const schim = composeReport(fill({ ...CASE01, Q29: "plaatselijk" }));
  console.log("SCHIMMEL highlights:", JSON.stringify(schim.v23.highlights.map((f) => f.id + "|" + f.title)));
  console.log("SCHIMMEL conn:", JSON.stringify(schim.v23.connections.map((c) => c.id + "|" + c.title)));
  const a2 = fill(CASE02);
  const r2 = composeReport(a2);
  console.log("CASE02 reasonCode:", r2.v23.recommendation.reasonCode, "domains:", JSON.stringify(buildReport(a2).domainScores));
  const a5 = fill(CASE05);
  const r5 = composeReport(a5);
  console.log("CASE05 reasonCode:", r5.v23.recommendation.reasonCode, "unknown:", r5.unknown.level, "domains:", JSON.stringify(buildReport(a5).domainScores));
  const unk = fill({ Q01: "eigenaar", Q02: "open", Q03: "onbekend", R01: "onbekend", Q24: "geen", Q34: "onbekend", G01: "onbekend", Q46: ["geen"], Q48: "nee" });
  const ru = composeReport(unk);
  console.log("UNKNOWN reasonCode:", ru.v23.recommendation.reasonCode, "domains:", JSON.stringify(buildReport(unk).domainScores));
  const mix = fill({ ...CASE02, Q24: "terugkerend", Q25A: ["ramen"], Q29: "plaatselijk" });
  const rm = composeReport(mix);
  console.log("MIX highlights:", JSON.stringify(rm.v23.highlights.map((f) => f.id)), "aptGroups:", rm.apartment?.groups?.length);
});
