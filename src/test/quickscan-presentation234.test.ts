import { describe, expect, it } from "vitest";
import { composeReport } from "../../supabase/functions/_shared/quickscan/report";
import { presentReport234 } from "../../supabase/functions/_shared/quickscan/presentation234";

describe("2.3.4 presentation boundaries", () => {
  const input = { Q01: "eigenaar", Q02: "open", Q03: "1945-1969", Q24: "vochtplekken", Q25: ["kelder"], Q26: "regelmatig", Q27: "regen", Q28: "actief", Q46: ["dak", "vloeren"], Q48: "ja", Q49: "3m" };
  it("preserves every score and the renovation barometer", () => {
    const r = composeReport(input);
    const shown = presentReport234(r);
    expect(shown.domainScores).toEqual(r.domainScores);
    expect(shown.level).toBe(r.level);
    expect(shown.category).toEqual(r.category);
  });
  it("keeps acute safety information intact", () => {
    const r = composeReport(input);
    expect(r.safety.map((s) => s.id)).toContain("SAFE-04");
    expect(presentReport234(r).safety).toEqual(r.safety);
  });
  it("preserves product routing, package prices and drone conditions", () => {
    const r = composeReport(input);
    expect(presentReport234(r).v23.recommendation).toEqual(r.v23.recommendation);
  });
  it("never mutates the stored snapshot", () => {
    const r = composeReport(input);
    const original = JSON.stringify(r);
    const shown = presentReport234(r);
    expect(shown).not.toBe(r);
    expect(JSON.stringify(r)).toBe(original);
  });
  for (const version of ["qs-report-2.3", "qs-report-2.3.1", "qs-report-2.3.2", "qs-report-2.3.3"]) {
    it(`bypasses historical ${version} without transformation`, () => {
      const r = { ...composeReport(input), reportVersion: version };
      expect(presentReport234(r)).toBe(r);
    });
  }
});