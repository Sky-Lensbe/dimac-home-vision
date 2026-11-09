import { describe, expect, it } from "vitest";
import { activeAnswers, visibleQuestions, SKIP, type Answers } from "@/lib/quickscan";
import { composeReport, informationCoverage233 } from "@/lib/quickscanReport";
import { buildReportPdf23, pdfDependencies } from "@/lib/quickscanPdf23";
import { renderSnapshotPdf } from "../../supabase/functions/_shared/quickscan/pdf/historical-frozen";
import snap23 from "./fixtures/snapshot-2.3.json";
import snap231 from "./fixtures/snapshot-2.3.1.json";

function fill(seed: Answers): Answers {
  let a = { ...seed };
  for (let i = 0; i < 120; i++) {
    const q = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined);
    if (!q) break;
    const value = q.options.find((o) => o.exclusive)?.id ?? q.options[0].id;
    a = { ...a, [q.id]: seed[q.id] ?? (q.multi ? [value] : q.options[0].id) };
  }
  return activeAnswers(a);
}
const base = fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", Q46: ["geen"] });
describe("Four presentation-only coverage levels", () => {
  it("no missing core yields level 1", () => { expect(informationCoverage233(base).level).toBe(1); });
  it("one incomplete domain yields level 2", () => { expect(informationCoverage233({ ...base, Q14: "onbekend" }).level).toBe(2); });
  it("two incomplete domains yields level 3", () => { expect(informationCoverage233({ ...base, Q14: "onbekend", Q24: "onbekend" }).level).toBe(3); });
  it("three incomplete domains remains level 3", () => { expect(informationCoverage233({ ...base, Q14: "onbekend", Q24: "onbekend", Q34: "onbekend" }).level).toBe(3); });
  it("four incomplete domains yields level 4", () => { expect(informationCoverage233({ ...base, Q14: "onbekend", Q24: "onbekend", Q34: "onbekend", Q41: "onbekend" }).level).toBe(4); });
  it("existing insufficient assessment always yields level 4", () => { expect(informationCoverage233(base, true).level).toBe(4); });
  it("skipped core counts as missing", () => { expect(informationCoverage233({ ...base, Q14: SKIP }).incompleteDomains).toEqual(["B"]); });
  it("missing construction context is level 2", () => { expect(informationCoverage233({ ...base, Q03: "onbekend" }).level).toBe(2); });
  it("common-only roof data never creates private uncertainty", () => {
    const a = fill({ Q01: "koper", Q02: "appartement", Q03: "vanaf2011", Q04A: ["geen"], Q24: "geen", Q46A: ["geen"] });
    expect(informationCoverage233({ ...a, Q14: "onbekend" }).incompleteDomains).toEqual(informationCoverage233(a).incompleteDomains);
  });
  it("presentation classifier cannot mutate routing or scores", () => {
    const before = composeReport(base); informationCoverage233(base, true); const after = composeReport(base);
    expect(after.v23.recommendation).toEqual(before.v23.recommendation); expect(after.domainScores).toEqual(before.domainScores); expect(after.unknown.level).toBe(before.unknown.level);
  });
});
const meta = { reportNumber: "QS-20261109-ABC12345", name: "Synthetisch", municipality: "Diest", date: "2026-11-09" };
const offline = { load: async (): Promise<ArrayBuffer> => { throw new Error("offline"); } };
describe("Explicit stored-version PDF isolation", () => {
  for (const [version, snap] of [["2.3", snap23], ["2.3.1", snap231]] as const) {
    it(`${version} dispatcher matches frozen local reference, snapshot untouched`, async () => {
      const r = snap as never; const before = JSON.stringify(snap);
      const dispatched = await buildReportPdf23(r, meta, offline);
      const frozen = await renderSnapshotPdf(r, meta, pdfDependencies, offline);
      const text = (blob: Blob) => new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsBinaryString(blob); });
      const normalize = (s: string) => s.replace(/\/ID\s*\[[^\]]+\]/g, "/ID []").replace(/D:\d{14}/g, "D:DATE");
      expect(normalize(await text(dispatched))).toBe(normalize(await text(frozen)));
      expect(JSON.stringify(snap)).toBe(before);
    });
  }
  it("strict PDF refuses missing fonts instead of silently substituting", async () => {
    await expect(buildReportPdf23(composeReport(base), meta, { ...offline, strictAssets: true })).rejects.toThrow("PDF fonts unavailable");
  });
});