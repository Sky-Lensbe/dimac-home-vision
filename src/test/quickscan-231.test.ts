import { describe, it, expect } from "vitest";
import { activeAnswers, buildReport, visibleQuestions, type Answers, type Question } from "@/lib/quickscan";
import { composeReport, recommendProduct, connections, informationOverview, renovationEvidence, workSequence } from "@/lib/quickscanReport";
import { reportPdfModel } from "@/lib/quickscanPdf23";
import { storedReport } from "@/lib/quickscanSnapshot";

const defaults = (q: Question) => q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id;
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
const context = (scores = { B: 0, V: 0, E: 0, T: 0, S: 0 }) => ({ domainScores: scores, flags: [], unknownLevel: "uitgebreid", findings: [], apartmentSignals: 0 });
describe("Quickscan rapportpatch 2.3.1", () => {
  it("drie cosmetische categorieën en werkvolgorde rechtvaardigen geen Plus", () => {
    const r = composeReport(fill({ ...clean, Q46: ["interieur", "vloeren", "sanitair"], Q47: "ja", Q48: "ja" }));
    expect(r.v23.recommendation.productId).toBe("online-budgetindicator");
    expect(r.v23.recommendation.price).toBe(39.99);
  });
  it("kostenvraag blijft coming_soon zonder fysieke vervanging of drone", () => {
    const rec = recommendProduct({ ...clean, Q46: ["interieur", "vloeren", "sanitair"], Q48: "ja" }, context());
    expect(rec.availability).toBe("coming_soon"); expect(rec.ctaPath).toBeNull(); expect(rec.secondary).toBeNull(); expect(rec.drone).toBeNull();
  });
  it("twee technische domeinen met overeenkomende geplande ingrepen onderbouwen Plus €449", () => {
    const r = composeReport(fill({ ...clean, Q14: "beschadigd", Q41: "beschadigd", Q46: ["dak", "elektriciteit", "interieur"] }));
    expect(r.v23.recommendation.productId).toBe("woningscan-plus"); expect(r.v23.recommendation.price).toBe(449);
  });
  it("één technisch domein plus drie werken of werkvolgorde blijft Woningscan €299", () => {
    const rec = recommendProduct({ Q01: "koper", Q46: ["dak", "interieur", "vloeren"], Q47: "ja" }, context({ B: 7, V: 0, E: 0, T: 0, S: 0 }));
    expect(rec.productId).toBe("woningscan"); expect(rec.price).toBe(299);
  });
  it("volledige renovatie zonder corroborerende technische signalen is geen Plus", () => {
    expect(recommendProduct({ Q01: "eigenaar", Q46: ["volledig"], Q47: "ja", Q48: "ja" }, context()).productId).toBe("online-budgetindicator");
  });
  it("onbekende omvang verzint geen complexe renovatie", () => {
    expect(renovationEvidence({ Q46: ["interieur", "vloeren", "sanitair"] }, { B: 7, V: 7, E: 0, T: 0, S: 0 }).complex).toBe(false);
  });
  it("geen plannen en weinig signalen geeft geen product", () => expect(composeReport(fill(clean)).v23.recommendation.productId).toBeNull());
  it("sanitair en vloeren zonder leidinggegevens vraagt conditionele afstemming", () => {
    const c = connections({ Q46: ["sanitair", "vloeren"], SL01: "0-15", Q45: "geen" }).find((c) => c.id === "LINK-SANITAIR-VLOER");
    expect(c?.nodes[0].caption).toBe("Aanpassing van leidingen nog te verifiëren.");
    expect(c?.text.startsWith("Wanneer")).toBe(true);
  });
  it("werkvolgorde gebruikt alleen de geselecteerde werken", () => {
    const sequence = workSequence({ Q46: ["interieur", "vloeren", "sanitair"], Q47: "ja" });
    expect(sequence.labels).toEqual(["Interieur", "Vloeren", "Sanitair"]);
    expect(sequence.text).not.toMatch(/dak|gevel|isolatie|buitenschil/i);
  });
  it("geen verbanden om lege ruimte op te vullen; maximum twee", () => {
    expect(connections({ Q46: ["geen"] })).toEqual([]);
    expect(connections({ Q46: ["dak", "isolatie", "gevel", "ramen", "sanitair", "vloeren"], DI01: "onbekend" }).length).toBeLessThanOrEqual(2);
  });
  it("VME-problemen veranderen geen privatieve score", () => {
    const seed = { ...clean, Q02: "appartement", Q46A: ["geen"] };
    const before = composeReport(fill(seed));
    const after = composeReport(fill({ ...seed, A01: "duidelijk", CD01: "problemen", A02: "ingrijpend", A03: "substantieel" }));
    expect(after.domainScores).toEqual(before.domainScores); expect(after.scoreInternal).toBe(before.scoreInternal);
  });
  it("onbekende VME-documentatie levert aankoopvragen, geen afwezigheidsclaim", () => {
    const r = composeReport(fill({ ...clean, Q01: "koper", Q02: "appartement", Q46A: ["geen"], A01: "onbekend", A02: "onbekend", A03: "onbekend", A04: "onbekend", A05: ["onbekend"], CD01: "onbekend", CL01: "onbekend" }));
    const c = r.v23.coOwnership;
    expect(c?.cards.filter((c) => c.uncertain).length).toBe(4);
    expect(c?.questions.some((q) => q.includes("algemene vergaderingen"))).toBe(true);
    expect(c?.questions.some((q) => q.includes("onderhoudsplan"))).toBe(true);
    expect(r.v23.documents.find((d) => d.id === "DOC-VME-PLAN")?.status).toBe("onbekend");
  });
  it("verwarmingstype en toestand tellen als één technisch onderwerp", () => {
    expect(informationOverview({ H01: "onbekend", Q42: "onbekend" }).topics).toEqual([{ code: "T", name: "de verwarming" }]);
  });
  it("samenvatting en detail gebruiken dezelfde unieke onderwerpen", () => {
    const r = composeReport(fill({ ...clean, H01: "onbekend", Q42: "onbekend", Q41: "onbekend", DI01: "onbekend" }));
    expect(r.v23.information.topics.map((t) => t.name)).toEqual(r.v23.domains.flatMap((d) => d.missingItems));
    expect(r.v23.information.topics.length).toBe(new Set(r.v23.information.topics.map((t) => t.name)).size);
  });
  it("online en PDF delen exact dezelfde aanbeveling", () => {
    const r = composeReport(fill({ ...clean, Q46: ["interieur", "vloeren", "sanitair"], Q48: "ja" }));
    const model = reportPdfModel(r, { reportNumber: "QS-20261029-ABCDEF12", name: "Test", municipality: "3980", date: "2026-10-29" });
    expect(model.recommendation).toBe(r.v23.recommendation); expect(model.priceLabel).toBe("€39,99"); expect(model.ctaUrl).toBeNull();
  });
  it("historische 2.3-aanbeveling wordt niet herberekend bij openen", () => {
    const current = composeReport(fill(clean));
    const historical = { ...current, reportVersion: "qs-report-2.3", v23: { ...current.v23, recommendation: { ...current.v23.recommendation, productId: "woningscan-plus", price: 449 } }, meta: { reportNumber: "QS-20261029-ABCDEF12", name: "Test", municipality: "3980", date: "2026-10-29" } };
    const result = storedReport(historical as never) as unknown as typeof historical;
    expect(result.reportVersion).toBe("qs-report-2.3"); expect(result.v23.recommendation.price).toBe(449); expect(result.v23.recommendation.productId).toBe("woningscan-plus");
  });
  it("uitsluitend rapportversie verandert, scores en veiligheidsregels blijven 2.2.2", () => {
    const a = fill(clean); const r = composeReport(a);
    expect(r.reportVersion).toBe("qs-report-2.3.2"); expect(r.ruleVersion).toBe("qs-rules-2.2.2"); expect(r.questionVersion).toBe("qs-questions-2.3.2");
    expect(r.domainScores).toEqual(buildReport(a).domainScores); expect(r.safety).toEqual(buildReport(a).safety);
  });
});