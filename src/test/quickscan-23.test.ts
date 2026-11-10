import { describe, it, expect } from "vitest";
import { activeAnswers, buildReport, visibleQuestions, RULE_VERSION, QUESTION_VERSION, type Answers, type Question } from "@/lib/quickscan";
import { composeReport, recommendProduct, withReportRef, asbestosContext, REPORT_VERSION_23 } from "@/lib/quickscanReport";
import { storedReport } from "@/lib/quickscanSnapshot";
import { getProduct, getPackage, parseScanParams, DRONE_PRICE, formatEuro } from "@/data/woningscan";
import { reportPdfModel } from "@/lib/quickscanPdf";

const defaultFor = (q: Question) => (q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id);
function fill(seed: Answers): Answers {
  let a: Answers = { ...seed };
  for (let i = 0; i < 90; i++) {
    const open = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined);
    if (!open) break;
    a = { ...a, [open.id]: seed[open.id] ?? defaultFor(open) };
  }
  return activeAnswers(a);
}

/** Praktijkcase Tessenderlo (zonder adres, prijs of Immoweb-gegevens). */
const TESSENDERLO: Answers = {
  Q01: "koper", Q02: "halfopen", Q03: "vanaf2011", O01: "100-149", R01: "nooit", Q04: ["geen"], Q06: ["onbekend"], K01: "geen", B01: "nee", ST01: "nee",
  Q14: "geen", Z01: "bereikbaar", DI01: "onbekend", Q18: "geen", MI01: "onbekend", G01: "onbekend",
  Q20: "tocht", Q22: "beperkt", Q21: "nee", Q24: "terugkerend", Q25: ["buitenmuur", "ramen"], Q26: "afentoe", Q29: "plaatselijk", Q27: "koude", M01: "nee", Q23: "nee",
  Q30: "haar", AS01: "onbekend", RI01: "riolering",
  Q34: "aplus", Q35: "lt5", H01: "gas", H02: "6-10", Q42: "normaal", Q44: "12m", Q41: "geen", Q40: "onbekend", V01: "mechanisch", Q39: "beperkt", Q45: "geen",
  Q46: ["ramen", "verwarming"], Q47: "nee", Q48: "twijfel", Q49: "3m",
};
const RECENT_OK: Answers = { Q01: "interesse", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q34: "aplus", G01: "hr", DI01: "degelijk", MI01: "geisoleerd", Q46: ["geen"], Q48: "nee", H01: "warmtepomp", H02: "0-5" };

describe("2.3 Tessenderlo-acceptatie", () => {
  const r = composeReport(fill(TESSENDERLO));
  it("barometer blijft 'Enkele aandachtspunten' en de scoring is identiek aan buildReport", () => {
    expect(r.category.label).toBe("Enkele aandachtspunten");
    const base = buildReport(fill(TESSENDERLO));
    expect(r.scoreInternal).toBe(base.scoreInternal);
    expect(r.domainScores).toEqual(base.domainScores);
  });
  it("primaire aanbeveling Woningscan €299, Plus hoogstens secundair, geen drone", () => {
    const rec = r.v23.recommendation;
    expect(rec.productId).toBe("woningscan");
    expect(rec.reasonCode).toBe("WS-TECH-BUYER");
    expect(rec.price).toBe(299);
    expect(rec.drone).toBeNull();
    expect(rec.secondary?.productId === undefined || rec.secondary?.productId === "woningscan-plus").toBe(true);
    expect(rec.ctaPath).toBe("/woningscan?pakket=woningscan#aanvraag");
    expect(rec.ctaLabel).toBe("Vraag mijn Woningscan aan");
  });
  it("highlights: schimmel/condens, tocht en sluitproblemen, ventilatie", () => {
    expect(r.v23.highlights.map((h) => h.id)).toEqual(["AP-SCHIMMEL", "AP-TOCHT", "AP-VENT"]);
  });
  it("verbandenanalyse bespreekt vocht, schrijnwerk en ventilatie samen, zonder causaliteit te claimen", () => {
    const l = r.v23.connections[0];
    expect(l.id).toBe("LINK-VOCHT-VENT-RAMEN");
    expect(l.text).toContain("kunnen verband houden");
    expect(r.v23.connections.length).toBeLessThanOrEqual(2);
  });
  it("EPC A correct geïnterpreteerd en haarscheur niet genegeerd", () => {
    const e = r.v23.domains.find((d) => d.code === "E")!;
    expect(e.analysis).toContain("geen bouwkundige keuring");
    expect(e.missing).toContain("dakisolatie");
    const s = r.v23.domains.find((d) => d.code === "S")!;
    expect(s.status).toBe("beperkt");
    expect(s.analysis).toContain("stabiele scheuren");
  });
  it("actieplan steunt op de antwoorden en toont ontbrekende informatie", () => {
    const ids = r.v23.actions.map((x) => x.id);
    expect(ids.slice(0, 3)).toEqual(["ACT-VOCHT", "ACT-RAMEN", "ACT-VENT"]);
    expect(ids).toContain("ACT-KEURING");
    expect(r.v23.adviceTitle).toBe("Wat controleert u best vóór uw aankoopbeslissing?");
  });
  it("geen ongefundeerde asbestwaarschuwing voor een woning vanaf 2011", () => {
    expect(r.v23.documents.find((d) => d.id === "DOC-ASBEST")).toBeUndefined();
    const n = r.notices.find((x) => x.id === "NOT-ASBEST-ATTEST");
    if (n) expect(n.text).toContain("geldt de verplichting van een asbestattest bij verkoop niet");
    expect(JSON.stringify(r.v23)).not.toMatch(/asbestvrij/i);
  });
});

describe("2.3 technische rapportage", () => {
  it("1. recente woning zonder problemen: geen ernstige statussen, geen geforceerde aanbeveling", () => {
    const r = composeReport(fill(RECENT_OK));
    expect(r.v23.domains.every((d) => d.status === "geen" || d.status === "beperkt" || d.status === "onvoldoende")).toBe(true);
    expect(r.v23.recommendation.productId).toBeNull();
    expect(r.v23.recommendation.reasonCode).toBe("NONE-NEUTRAL");
    expect(r.v23.highlights.length).toBe(0);
  });
  it("3. oude renovatiewoning met EPC E: energie als duidelijk aandachtspunt en asbestattest verplicht", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "gesloten", Q03: "1945-1969", R01: "nooit", Q34: "e", Q14: "slijtage", Q20: "verouderd", Q46: ["dak", "ramen", "isolatie"] }));
    expect(r.v23.domains.find((d) => d.code === "E")!.status).toBe("duidelijk");
    const asb = r.v23.documents.find((d) => d.id === "DOC-ASBEST")!;
    expect(asb.note).toContain("vóór 2001");
  });
  it("4. actieve waterinfiltratie: vochtdomein ernstig", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990", Q24: "vochtplekken", Q25: ["buitenmuur"], M01: "actief" }));
    expect(r.v23.domains.find((d) => d.code === "V")!.status).toBe("ernstig");
  });
  it("5./13. gas- of CO-signaal: veiligheid eerst, aanbeveling apart gemarkeerd", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990", H01: "gas", Q42: "gas", Q43: "ja" }));
    expect(r.safety.some((s) => s.id === "SAFE-01")).toBe(true);
    expect(r.v23.recommendation.safetyFirst).toBe(true);
    expect(r.v23.actions[0].id).toBe("ACT-VEILIGHEID");
  });
  it("6./16. appartement met uitsluitend gemeenschappelijke problemen: privatief geen signaal, geen fysieke Woningscan zonder privatieve inspectiebehoefte (2.3.2)", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "appartement", Q03: "1970-1990", G01: "hr", A01: "duidelijk", CD01: "problemen", A02: "ingrijpend", A03: "substantieel" }));
    expect(r.v23.recommendation.reasonCode).toBe("NONE-VME");
    expect(r.v23.recommendation.productId).toBeNull();
    expect(r.v23.recommendation.motivation).toContain("VME-documenten");
    expect(r.v23.domains.every((d) => d.scopeNote?.startsWith("Beoordeling binnen het appartement"))).toBe(true);
    expect(r.v23.documents.some((d) => d.id === "DOC-VME-AV")).toBe(true);
  });
  it("6b. eigenaar van een appartement met alleen VME-problemen: geen geforceerde verkoop", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "appartement", Q03: "1970-1990", G01: "hr", A01: "duidelijk", Q46A: ["geen"], Q48: "nee" }));
    expect(r.v23.recommendation.productId).toBeNull();
  });
  it("7. appartement met privatieve en gemeenschappelijke problemen: domeinkaart vermeldt de scheiding", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "appartement", Q03: "1991-2010", Q24: "terugkerend", Q25A: ["badkamer", "gemkelder"], KV01: "regelmatig" }));
    expect(r.v23.domains.find((d) => d.code === "V")!.scopeNote).toContain("gemeenschappelijke delen staan apart");
  });
  it("8. veel onbekende antwoorden: onbekende domeinen nooit als gecontroleerd getoond", () => {
    const seed: Answers = { Q01: "koper", Q02: "open", Q03: "onbekend", Q14: "onbekend", Q20: "onbekend", Q24: "onbekend", Q30: "onbekend", Q34: "onbekend", DI01: "onbekend", MI01: "onbekend", G01: "onbekend", Q41: "onbekend", Q42: "onbekend", H01: "onbekend" };
    const r = composeReport(fill(seed));
    const v = r.v23.domains.find((d) => d.code === "V")!;
    expect(v.status).toBe("onvoldoende");
    expect(r.v23.domains.filter((d) => d.status === "onvoldoende").length).toBeGreaterThanOrEqual(3);
  });
});

describe("2.3 asbest en bouwjaar (OVAM: verplicht bij verkoop vóór 2001)", () => {
  it("bouwperiode volledig vóór 2001: attestplicht", () => expect(asbestosContext({ Q03: "1970-1990" }).applies).toBe("ja"));
  it("1991–2010: eerst exacte bouwjaar verifiëren, geen automatische uitspraak", () => {
    const c = asbestosContext({ Q03: "1991-2010" });
    expect(c.applies).toBe("verifieren");
    expect(c.note).toContain("exacte bouwjaar");
  });
  it("vanaf 2011: geen waarschuwing over een ontbrekend verplicht attest", () => expect(asbestosContext({ Q03: "vanaf2011" }).applies).toBe("nee"));
  it("onbekend bouwjaar: neutrale verificatie", () => expect(asbestosContext({ Q03: "onbekend" }).applies).toBe("onbekend"));
  it("gekende asbesttoepassing blijft zichtbaar, ook bij een recent bouwjaar", () => {
    const r = composeReport(fill({ ...TESSENDERLO, AS01: "gekend", AS02: "nee" }));
    expect(r.v23.documents.find((d) => d.id === "DOC-ASBEST")).toBeDefined();
    expect(r.notices.some((n) => n.id === "NOT-ASBEST")).toBe(true);
  });
});

describe("2.3 commerciële aanbeveling", () => {
  it("9./17. alleen behoefte aan budget: online budgetindicator blijft aanbevolen, zonder bestelknop", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q34: "aplus", G01: "hr", DI01: "degelijk", MI01: "geisoleerd", Q46: ["interieur", "vloeren"], Q48: "ja", H01: "warmtepomp", H02: "0-5" }));
    const rec = r.v23.recommendation;
    expect(rec.productId).toBe("online-budgetindicator");
    expect(rec.availability).toBe("coming_soon");
    expect(rec.ctaPath).toBeNull();
    expect(rec.ctaLabel).toBe("Binnenkort beschikbaar");
    expect(rec.infoPath).toBe("/woningscan#pakketten");
    expect(rec.secondary).toBeNull();
    expect(rec.drone).toBeNull();
  });
  it("10. kandidaat-koper met concrete technische twijfels: Woningscan", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "open", Q03: "1991-2010", Q24: "vochtplekken", Q25: ["buitenmuur"], Q46: ["geen"] }));
    expect(r.v23.recommendation.productId).toBe("woningscan");
  });
  it("twee afzonderlijke geplande werken leiden niet automatisch tot Plus", () => {
    const a = fill({ ...TESSENDERLO, Q47: "ja" });
    expect(composeReport(a).v23.recommendation.productId).toBe("woningscan");
  });
  it("11. complexe renovatie met technische signalen: Plus, met Woningscan als alternatief", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990", Q14: "slijtage", Q46: ["dak", "isolatie", "ramen", "verwarming"] }));
    expect(r.v23.recommendation.productId).toBe("woningscan-plus");
    expect(r.v23.recommendation.reasonCode).toBe("PLUS-COMPLEX-TECH");
    expect(r.v23.recommendation.secondary?.productId).toBe("woningscan");
  });
  it("een hoge barometer zonder renovatieplannen leidt niet automatisch tot Plus", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "open", Q03: "1970-1990", Q14: "beschadigd", Q24: "vochtplekken", Q25: ["zolder"], Q46: ["geen"] }));
    expect(r.v23.recommendation.productId).toBe("woningscan");
  });
  it("12. geen relevante renovatiebehoefte: geen product", () => {
    expect(composeReport(fill(RECENT_OK)).v23.recommendation.productId).toBeNull();
  });
  it("14. moeilijk zichtbaar beschadigd dak: drone optioneel bij het fysieke pakket", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "open", Q03: "1970-1990", Q14: "beschadigd", Q17: "nauwelijks", Q46: ["geen"] }));
    expect(r.v23.recommendation.productId).toBe("woningscan");
    expect(r.v23.recommendation.drone?.price).toBe(DRONE_PRICE);
  });
  it("15. geen dakproblemen: geen drone", () => {
    expect(composeReport(fill(TESSENDERLO)).v23.recommendation.drone).toBeNull();
  });
  it("drone nooit bij een online product", () => {
    const rec = recommendProduct(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", Q14: "geen", Q46: ["interieur"], Q48: "ja", Q50: "ja" }), { domainScores: { B: 0, V: 0, E: 0, T: 0, S: 0 }, flags: [], unknownLevel: "uitgebreid", findings: [], apartmentSignals: 0 });
    expect(rec.productId).toBe("online-budgetindicator");
    expect(rec.drone).toBeNull();
  });
  it("18. prijzen komen uit de centrale catalogus", () => {
    const r = composeReport(fill(TESSENDERLO));
    expect(r.v23.recommendation.price).toBe(getProduct("woningscan")!.price);
    expect(getProduct("woningscan-plus")!.price).toBe(449);
    expect(getProduct("online-budgetindicator")!.price).toBe(39.99);
  });
  it("19. pakketlink selecteert het juiste pakket en het rapportnummer is enkel een referentie", () => {
    const path = withReportRef("/woningscan?pakket=woningscan#aanvraag", "QS-20261029-ABCDEF12");
    expect(path).toBe("/woningscan?pakket=woningscan&rapport=QS-20261029-ABCDEF12#aanvraag");
    const params = new URLSearchParams(path.split("?")[1].split("#")[0]);
    expect(parseScanParams(params).pakket).toBe("woningscan");
    expect(withReportRef("/woningscan?pakket=woningscan#aanvraag", "naam@example.com")).not.toContain("@");
  });
  it("20. drone staat standaard uit (geen voorselectie via de link)", () => {
    const r = composeReport(fill({ Q01: "koper", Q02: "open", Q03: "1970-1990", Q14: "beschadigd", Q17: "nauwelijks" }));
    expect(r.v23.recommendation.ctaPath).not.toMatch(/drone/);
    expect(getPackage("woningscan")!.droneAllowed).toBe(true);
  });
  it("21. aanbeveling online en in PDF is dezelfde", () => {
    const r = composeReport(fill(TESSENDERLO));
    const m = reportPdfModel(r, { reportNumber: "QS-20261029-ABCDEF12", name: "Test", municipality: "3980", date: "2026-10-29T10:00:00Z" });
    expect(m.recommendation).toEqual(r.v23.recommendation);
    expect(m.ctaUrl).toMatch(/^https:\/\/.+\/woningscan\?pakket=woningscan&rapport=QS-20261029-ABCDEF12#aanvraag$/);
    expect(m.priceLabel).toBe(formatEuro(299));
  });
  it("22. historische snapshots blijven ongewijzigd en krijgen geen 2.3-velden", () => {
    const old = { ...buildReport(fill(TESSENDERLO)), meta: { reportNumber: "QS-20260101-AAAAAAAA", name: "x", municipality: "y", date: "2026-01-01" } };
    const s = storedReport(old as never);
    expect((s as { v23?: unknown }).v23).toBeUndefined();
    expect(s.reportVersion).toBe(old.reportVersion);
  });
  it("versies: rapport 2.3, regels en vragen ongewijzigd", () => {
    const r = composeReport(fill(TESSENDERLO));
    expect(r.reportVersion).toBe(REPORT_VERSION_23);
    expect(r.ruleVersion).toBe(RULE_VERSION);
    expect(r.questionVersion).toBe(QUESTION_VERSION);
    expect(RULE_VERSION).toBe("qs-rules-2.3.4");
  });
  it("aanbeveling verandert de barometer nooit", () => {
    for (const seed of [TESSENDERLO, RECENT_OK]) {
      const a = fill(seed);
      expect(composeReport(a).level).toBe(buildReport(a).level);
    }
  });
});
