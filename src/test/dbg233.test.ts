import { it } from "vitest";
import { activeAnswers, visibleQuestions, buildReport, answerHelpers, type Answers, type Question } from "@/lib/quickscan";
import { composeReport, technicalDomains } from "@/lib/quickscanReport";
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
it("dbg", () => {
  const a5 = fill({ Q01: "eigenaar", Q02: "rij", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "b", G01: "hr", Q46: ["vloeren", "interieur"], Q48: "ja" });
  console.log("Q46:", JSON.stringify(a5.Q46), "Q48:", JSON.stringify(a5.Q48));
  console.log("plannedCount:", answerHelpers.plannedCount(a5), "cost:", answerHelpers.has(a5, "Q48", "ja"));
  const ds = buildReport(a5).domainScores;
  console.log("domains:", JSON.stringify(ds), "tech:", JSON.stringify(technicalDomains(ds)));
  console.log("reasonCode:", composeReport(a5).v23.recommendation.reasonCode);
});
