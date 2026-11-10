import { describe, expect, it } from "vitest";
import { composeReport } from "../../supabase/functions/_shared/quickscan/report";
import {
  activeAnswers, questionOptions, questionText, safetyFlags, visibleQuestions, RULE_VERSION, QUESTION_MAP,
  type Answers,
} from "../../supabase/functions/_shared/quickscan/engine";
import { readSaved, SESSION_KEY } from "@/lib/quickscanSession";

/**
 * 2.3.4: score-invariantie tegenover 2.3.3 (baseline vastgelegd vóór de wijziging),
 * meerkeuzeverwarming, warmteverdeling, vloerverwarming, comfort en premies.
 */

// De vijf referentiecases met hun 2.3.3-baseline (H01 nog als enkelvoudige string).
const CASES: Record<string, { answers: Answers; domainScores: Record<string, number | null>; category: string; level: number; flags: string[]; product: string | null; reason: string; drone: boolean }> = {
  tessenderlo: {
    answers: { Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", R01: "11-20", Q04: ["ramen"], Q05: "mondeling", K01: "geen", Q14: "geen", DI01: "beperkt", Q18: "geen", MI01: "spouw", G01: "dubbel", Q20: "verouderd", Q22: "beperkt", Q24: "terugkerend", Q25: ["ramen"], Q26: "regelmatig", Q29: "geen", Q27: "koude", Q30: "geen", Q34: "e", Q37: "kamers", Q38: "leef", H01: "gas", H02: "11-20", Q42: "normaal", Q44: "1-3j", Q41: "geen", V01: "natuurlijk", Q39: "beperkt", Q46: ["ramen", "isolatie"], Q47: "ja", Q48: "nee", Q49: "3m" },
    domainScores: { B: 3, V: 7, E: 7, T: 3, S: 0 }, category: "verhoogd", level: 2, flags: [], product: "woningscan", reason: "WS-TECH-OWNER", drone: false,
  },
  halen: {
    answers: { Q01: "koper", Q02: "appartement", Q03: "1991-2010", BJ01: "vanaf2001", R01: "6-10", Q04A: ["geen"], Q06: ["epc"], Q24: "geen", Q30: "geen", Q34: "c", H01: "collectief", Q42: "normaal", Q41: "geen", A01: "enkele", CD01: "verouderd", CL01: "onbekend", A02: "middel", A06: ["dak", "gevel"], A07: "goedgekeurd", A03: "beperkt", A04: "beperkt", A05: ["verslagen"], Q46A: ["geen"], Q48: "nee", Q49: "1j" },
    domainScores: { B: null, V: 0, E: 2, T: 0, S: 0 }, category: "beperkt", level: 0, flags: [], product: null, reason: "NONE-VME", drone: false,
  },
  woning1962: {
    answers: { Q01: "eigenaar", Q02: "open", Q03: "1945-1969", R01: "nooit", Q04: ["geen"], K01: "kelder", Q14: "oud", Q17: "gedeeltelijk", DI01: "niet", Q18: "verwering", MI01: "niet", G01: "enkel", Q20: "verouderd", Q22: "duidelijk", VL01: "grond", VL02: "nee", Q24: "geen", Q30: "haar", Q34: "f", Q37: "sterk", Q38: "heel", H01: "mazout", H02: "gt20", Q42: "ouder", Q44: "gt3j", Q41: "gedateerd", Q40: "geen", V01: "natuurlijk", Q39: "beperkt", SL01: "origineel", Q45: "geen", RI01: "riolering", AS01: "geen_attest", Q46: ["dak", "isolatie", "ramen", "verwarming", "vloeren"], Q47: "ja", Q48: "ja", Q49: "3m", Q50: "ja" },
    domainScores: { B: 6, V: 0, E: 9, T: 3, S: 2 }, category: "verhoogd", level: 2, flags: [], product: "woningscan-plus", reason: "PLUS-COMPLEX-TECH", drone: true,
  },
  woning1976: {
    answers: { Q01: "eigenaar", Q02: "halfopen", Q03: "1970-1990", R01: "21-30", Q04: ["elektriciteit"], Q05: "facturen", K01: "kelder", Q14: "slijtage", Q15: "randen", Q16: "recent", Q19: "verstopt", DI01: "gedeeltelijk", Q18: "voegen", MI01: "gedeeltelijk", G01: "dubbel", Q20: "geen", VL01: "beton", VL02: "gedeeltelijk", Q24: "vochtplekken", Q25: ["kelder"], Q26: "regelmatig", Q27: "regen", Q28: "actief", Q30: "geen", Q34: "e", H01: "gas", H02: "6-10", Q42: "normaal", Q44: "12m", Q41: "geen", Q46: ["isolatie", "vloeren"], Q47: "twijfel", Q48: "ja", Q49: "1j" },
    domainScores: { B: 7, V: 10, E: 7, T: 0, S: 0 }, category: "verhoogd", level: 2, flags: ["SAFE-04"], product: "woningscan", reason: "WS-TECH-OWNER", drone: true,
  },
  recent: {
    answers: { Q01: "interesse", Q02: "gesloten", Q03: "vanaf2011", R01: "0-5", Q04: ["geen"], K01: "geen", Q14: "geen", DI01: "degelijk", Q18: "geen", MI01: "geisoleerd", G01: "hr", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "b", H01: "warmtepomp", H02: "0-5", Q42: "normaal", Q41: "geen", Q46: ["interieur"], Q48: "ja", Q49: "later" },
    domainScores: { B: 0, V: 0, E: 1, T: 0, S: 0 }, category: "beperkt", level: 0, flags: [], product: "online-budgetindicator", reason: "BUDGET-COST", drone: false,
  },
};

describe("2.3.4 score-invariantie (vijf referentiecases)", () => {
  for (const [name, c] of Object.entries(CASES)) {
    it(`${name}: identieke scores, categorie, veiligheid en aanbeveling als 2.3.3`, () => {
      const r = composeReport(c.answers);
      expect(r.ruleVersion).toBe(RULE_VERSION);
      expect(r.ruleVersion).toBe("qs-rules-2.3.4");
      expect(r.reportVersion).toBe("qs-report-2.3.4");
      expect(r.domainScores).toEqual(c.domainScores);
      expect(r.category.id).toBe(c.category);
      expect(r.level).toBe(c.level);
      expect(r.safety.map((s) => s.id)).toEqual(c.flags);
      expect(r.v23.recommendation.productId).toBe(c.product);
      expect(r.v23.recommendation.reasonCode).toBe(c.reason);
      expect(!!r.v23.recommendation.drone).toBe(c.drone);
    });
  }
});

describe("2.3.4 beglazing", () => {
  const base: Answers = { Q01: "eigenaar", Q02: "gesloten", Q03: "vanaf2011", R01: "0-5", Q04: ["geen"], K01: "geen", Q14: "geen", DI01: "degelijk", Q18: "geen", MI01: "geisoleerd", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "b", H01: ["warmtepomp"], H02: "0-5", Q42: "normaal", Q41: "geen", Q46: ["geen"], Q48: "ja", Q49: "later" };
  it("recent dubbel glas geeft exact E=2 en verschijnt in de energienotities", () => {
    const r = composeReport({ ...base, G01: "dubbel-recent" });
    expect(r.domainScores.E).toBe(2);
    expect(r.energy.some((n) => n.includes("recent dubbel glas"))).toBe(true);
  });
  it("de optie is zichtbaar in de vragenlijst", () => {
    const g01 = QUESTION_MAP.G01;
    expect(g01.options.some((o) => o.id === "dubbel-recent" && o.score?.v === 2)).toBe(true);
  });
});

describe("2.3.4 meerkeuzeverwarming", () => {
  const h01b = QUESTION_MAP.H01B;
  it("H01B verschijnt alleen bij twee of meer gekozen systemen", () => {
    const one = visibleQuestions(activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["gas"] }));
    expect(one.some((q) => q.id === "H01B")).toBe(false);
    const two = visibleQuestions(activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["gas", "hout"] }));
    expect(two.some((q) => q.id === "H01B")).toBe(true);
  });
  it("H01B toont uitsluitend de effectief gekozen systemen", () => {
    const opts = questionOptions(h01b, { H01: ["gas", "hout"] });
    expect(opts.map((o) => o.id)).toEqual(["gas", "hout"]);
  });
  it("een H01B-antwoord buiten de selectie vervalt bij de servervalidatie", () => {
    const act = activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["gas", "hout"], H01B: "mazout" });
    expect(act.H01B).toBeUndefined();
  });
  it("een oud enkelvoudig H01-antwoord wordt als eenkeuze-array gelezen", () => {
    const act = activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: "gas" });
    expect(act.H01).toEqual(["gas"]);
    const vis = visibleQuestions(act);
    expect(vis.some((q) => q.id === "H02")).toBe(true);
    expect(vis.some((q) => q.id === "H01B")).toBe(false);
  });
  it("'geen vaste verwarmingsinstallatie' is exclusief en blokkeert vervolgvragen", () => {
    const act = activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["geen", "gas"] });
    expect(act.H01).toBeUndefined();
    const vis = visibleQuestions(activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["geen"] }));
    for (const id of ["H01B", "H02", "H03", "Q42", "Q44"]) expect(vis.some((q) => q.id === id)).toBe(false);
  });
  it("een defect nevensysteem behoudt zijn verwarmingssignaal", () => {
    const r = composeReport({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", R01: "11-20", Q04: ["geen"], K01: "geen", Q14: "geen", DI01: "degelijk", Q18: "geen", MI01: "geisoleerd", G01: "hr", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "b", H01: ["gas", "hout"], H01B: "gas", H02: "11-20", H03: ["radiatoren"], Q42: "ouder", Q44: "1-3j", Q41: "geen", Q46: ["geen"], Q48: "ja", Q49: "3m" });
    expect(r.points.map((p) => p.id)).toContain("AP-VERW");
  });
  it("onderhoud blijft relevant zodra één geselecteerd systeem verbranding of een warmtepomp betreft", () => {
    const vis = visibleQuestions(activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["elektrisch", "warmtepomp"], H01B: "elektrisch", H02: "6-10" }));
    expect(vis.some((q) => q.id === "Q44")).toBe(true);
  });
  it("de staatsvraag blijft bij elk aanwezig verbrandingssysteem; de leeftijd volgt de hoofdverwarming", () => {
    const vis = visibleQuestions(activeAnswers({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["gas", "hout"], H01B: "hout" }));
    expect(vis.some((q) => q.id === "Q42")).toBe(true);
    expect(questionText(QUESTION_MAP.H02, { H01: ["gas", "hout"], H01B: "hout" })).toBe("Hoe oud is de hoofdverwarming ongeveer?");
  });
});

describe("2.3.4 warmteverdeling (H03)", () => {
  const pre: Answers = { Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", H01: ["gas"] };
  it("verschijnt zodra minstens één verwarmingssysteem gekozen is", () => {
    expect(visibleQuestions(activeAnswers(pre)).some((q) => q.id === "H03")).toBe(true);
  });
  it("'Weet ik niet' is exclusief; een combinatie ervan vervalt", () => {
    const act = activeAnswers({ ...pre, H03: ["onbekend", "radiatoren"] });
    expect(act.H03).toBeUndefined();
  });
  it("'Andere' is combineerbaar met concrete keuzes", () => {
    const act = activeAnswers({ ...pre, H03: ["radiatoren", "andere"] });
    expect(act.H03).toEqual(["radiatoren", "andere"]);
  });
});

describe("2.3.4 vloerverwarming (VL03)", () => {
  const pre: Answers = { Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", R01: "11-20", Q04: ["geen"], K01: "geen", Q14: "geen", DI01: "degelijk", Q18: "geen", MI01: "geisoleerd", G01: "hr", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "b", H01: ["gas"], H02: "6-10", H03: ["radiatoren"], Q42: "normaal", Q44: "12m", Q41: "geen", Q48: "ja", Q49: "3m" };
  it("verschijnt alleen bij geplande vloerwerken zonder bekende vloerverwarming", () => {
    const withPlan = visibleQuestions(activeAnswers({ ...pre, Q46: ["vloeren"] }));
    expect(withPlan.some((q) => q.id === "VL03")).toBe(true);
    const noPlan = visibleQuestions(activeAnswers({ ...pre, Q46: ["ramen"] }));
    expect(noPlan.some((q) => q.id === "VL03")).toBe(false);
    const already = visibleQuestions(activeAnswers({ ...pre, H03: ["vloerverwarming"], Q46: ["vloeren"] }));
    expect(already.some((q) => q.id === "VL03")).toBe(false);
  });
  it("overwogen vloerverwarming geeft het voorwaardelijke COM-11-advies", () => {
    const r = composeReport({ ...pre, Q46: ["vloeren"], VL03: "ja" });
    const c = r.combinations.find((x) => x.id === "COM-11");
    expect(c?.text).toContain("laat dan vooraf controleren");
    expect(c?.text).not.toContain("uitgebroken");
  });
  it("bestaande vloerverwarming verschijnt in de afwerkingsfase", () => {
    const r = composeReport({ ...pre, H03: ["vloerverwarming"], Q46: ["vloeren"] });
    const d = r.v232?.phases.find((p) => p.id === "D");
    expect(d?.items.some((t) => t.includes("vloerverwarming aanwezig"))).toBe(true);
  });
});

describe("2.3.4 comfortadvies", () => {
  it("de verwarming is nooit automatisch de oorzaak; zonwering staat bij oververhitting", () => {
    const r = composeReport({ Q01: "eigenaar", Q02: "gesloten", Q03: "1970-1990", R01: "11-20", Q04: ["geen"], K01: "geen", Q14: "geen", DI01: "gedeeltelijk", Q18: "geen", MI01: "geisoleerd", G01: "hr", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "b", Q37: "sterk", Q38: "heel", H01: ["gas"], H02: "6-10", H03: ["radiatoren"], Q42: "normaal", Q44: "12m", Q41: "geen", Q46: ["geen"], Q48: "ja", Q49: "3m" });
    const comfort = r.points.find((p) => p.id === "AP-COMFORT");
    expect(comfort?.text).toContain("zonwering");
    expect(comfort?.text).not.toContain("WARMTECOMFORT");
    const act = r.v232?.actions.technical.find((a) => a.id === "ACT-COMFORT");
    expect(act?.text).toContain("mogelijke aandachtspunten");
    expect(act?.next).toContain("mogelijke oorzaak");
  });
});

describe("2.3.4 premies en financiële ondersteuning", () => {
  it("de premiesectie verwijst naar de vier officiële bronnen met disclaimers", () => {
    const r = composeReport(CASES.woning1962.answers);
    const p = r.v234?.premiums;
    expect(p).toBeTruthy();
    const urls = p!.sources.map((s) => s.url);
    expect(urls).toContain("https://www.premiezoeker.be/");
    expect(urls).toContain("https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie");
    expect(urls).toContain("https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie");
    expect(urls).toContain("https://www.vlaanderen.be/bouwen-wonen-en-energie/lenen-voor-een-woning/mijn-verbouwlening");
    expect(p!.intro).toContain("persoonlijke situatie");
    expect(p!.closing).toContain("Controleer steeds de actuele voorwaarden");
    expect(p!.note).toContain("Energiehuis");
  });
  it("de relevantie volgt de gemelde werken of toestand, zonder geschiktheidsgarantie", () => {
    const r = composeReport(CASES.woning1962.answers);
    expect(r.v234!.premiums.relevant).toContain("vloerisolatie");
    expect(r.v234!.premiums.relevant).toContain("dakisolatie");
    const r2 = composeReport(CASES.recent.answers);
    expect(r2.v234!.premiums.relevant).toEqual(["warmtepompinstallaties"]);
  });
});

describe("2.3.4 sessiemigratie", () => {
  const store = (entries: Record<string, string>) => {
    const m = new Map(Object.entries(entries));
    return { getItem: (k: string) => m.get(k) ?? null, removeItem: (k: string) => { m.delete(k); }, has: (k: string) => m.has(k) };
  };
  it("een 2.3.3-sessie migreert naar 2.3.4 met H01 als array en hervat in de vragenlijst", () => {
    const s = store({ "dimac-quickscan-v2.3.3": JSON.stringify({ stage: "questions", answers: { Q01: "eigenaar", H01: "gas" }, index: 3, startedAt: 1 }) });
    const got = readSaved(s);
    expect(got?.answers.H01).toEqual(["gas"]);
    expect(got?.stage).toBe("questions");
    expect(s.has("dimac-quickscan-v2.3.3")).toBe(false);
  });
  it("een 2.3.4-sessie wordt rechtstreeks gelezen", () => {
    const s = store({ [SESSION_KEY]: JSON.stringify({ stage: "preview", answers: { Q01: "eigenaar", H01: ["gas"] }, index: 2, startedAt: 1 }) });
    const got = readSaved(s);
    expect(got?.stage).toBe("preview");
    expect(got?.answers.H01).toEqual(["gas"]);
  });
});
