import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { activeAnswers, buildReport, isComplete, visibleQuestions, QUESTION_MAP, QUESTION_VERSION, RULE_VERSION, SKIP, type Answers, type Question } from "@/lib/quickscan";
import { asbestosContext, composeReport, connections, documents233, renovationPhases, REPORT_EXTENSION_233, REPORT_VERSION_23, type QuickscanReport23 } from "@/lib/quickscanReport";
import { readSaved, SESSION_KEY, SESSION_KEY_232 } from "@/lib/quickscanSession";
import { storedReport } from "@/lib/quickscanSnapshot";
import { buildReportPdf23 } from "@/lib/quickscanPdf23";
import { Report23 } from "@/components/quickscan/Report23";
import snap23 from "./fixtures/snapshot-2.3.json";
import snap231 from "./fixtures/snapshot-2.3.1.json";

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
const ids = (a: Answers) => visibleQuestions(a).map((q) => q.id);
const meta = { reportNumber: "QS-TEST", name: "Test", municipality: "Diest", date: "2026-11-09" };
const allText = (r: QuickscanReport23) => JSON.stringify(r);

// ---------- De vijf praktijkcases uit de 2.3.3-brief ----------
const CASE01_TESSENDERLO: Answers = { Q01: "eigenaar", Q02: "halfopen", Q03: "vanaf2011", R01: "0-5", Q20: "tocht", Q24: "terugkerend", Q25: ["ramen"], Q26: "afentoe", Q29: "geen", Q34: "a", G01: "hr", Q46: ["geen"], Q48: "nee" };
const CASE02_HALEN: Answers = { Q01: "koper", Q02: "appartement", Q03: "1991-2010", BJ01: "vanaf2001", R01: "11-20", Q04A: ["geen"], Q24: "geen", Q34: "a", G01: "hr", FL01: "d", FL02: "d", A02: "ingrijpend", A03: "onbekend", Q46A: ["geen"], Q48: "nee" };
const CASE03_1962: Answers = { Q01: "koper", Q02: "open", Q03: "1945-1969", R01: "gt30", Q14: "slijtage", DI01: "niet", Q34: "f", Q40: "inbreuken", Q46: ["dak", "isolatie", "elektriciteit", "verwarming"], Q48: "nee" };
const CASE04_1976: Answers = { Q01: "eigenaar", Q02: "open", Q03: "1970-1990", R01: "gt30", Q14: "slijtage", Q24: "vochtplekken", Q25: ["kelder"], Q26: "regelmatig", Q28: "actief", M01: "regen", Q34: "f", H01: "mazout", H02: "gt20", Q46: ["volledig"], Q48: "nee" };
const CASE05_RECENT: Answers = { Q01: "eigenaar", Q02: "gesloten", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "b", G01: "hr", Q46: ["vloeren", "interieur"], Q48: "ja" };

describe("2.3.3 versies en score-invariantie", () => {
  it("vragen 2.3.3, scoreregels en veiligheidsregels ongewijzigd 2.2.2, rapport 2.3.3", () => {
    expect([QUESTION_VERSION, RULE_VERSION, REPORT_VERSION_23, REPORT_EXTENSION_233]).toEqual(["qs-questions-2.3.3", "qs-rules-2.2.2", "qs-report-2.3.3", "v233"]);
  });
  it("identieke bestaande antwoorden geven gelijke domeinscores, barometer en veiligheidsmeldingen", () => {
    // Q29 'geen' is neutraal (geen score): toevoegen ervan mag niets aan de scoring veranderen.
    const met = fill({ ...CASE01_TESSENDERLO });
    const { Q29: _drop, ...zonderSeed } = CASE01_TESSENDERLO;
    const zonder = fill(zonderSeed);
    const rm = buildReport(met); const rz = buildReport(zonder);
    expect(rm.domainScores).toEqual(rz.domainScores);
    expect(rm.level).toBe(rz.level);
    expect(rm.safety).toEqual(rz.safety);
  });
  it("Q29-optie 'geen' heeft geen technische score", () => {
    const opt = QUESTION_MAP.Q29.options.find((o) => o.id === "geen");
    expect(opt).toBeDefined();
    expect(opt!.score).toBeUndefined();
  });
});

describe("2.3.3 condens versus schimmel", () => {
  it("alleen condens gemeld: nooit 'schimmel' als vaststaand feit in bevindingen, verbanden of acties", () => {
    const r = composeReport(fill(CASE01_TESSENDERLO));
    const schimmel = r.v23.findings.find((f) => f.id === "AP-SCHIMMEL");
    expect(schimmel?.title).toBe("Terugkerende condens");
    expect(schimmel?.title).not.toContain("chimmel");
    expect(schimmel?.short).not.toContain("chimmel");
    const link = r.v23.connections.find((c) => c.id === "LINK-RAAM-CONDENS");
    expect(link?.title).toBe("Condens rond ramen");
    expect(link?.title).not.toContain("chimmel");
    expect(link?.text).toContain("zonder zichtbare schimmel");
  });
  it("door de gebruiker gemelde schimmel wordt als zodanig benoemd", () => {
    const r = composeReport(fill({ ...CASE01_TESSENDERLO, Q29: "plaatselijk" }));
    expect(r.v23.findings.find((f) => f.id === "AP-SCHIMMEL")?.title).toContain("Schimmelvorming (door u gemeld)");
    expect(r.v23.connections.find((c) => c.id === "LINK-RAAM-CONDENS")?.title).toBe("Condens en schimmel rond ramen");
  });
  it("schimmel zonder gekende oorzaak: oorzaak blijft onbekend, geen diagnose", () => {
    const r = composeReport(fill({ ...CASE01_TESSENDERLO, Q29: "meerdere" }));
    const f = r.v23.findings.find((x) => x.id === "AP-SCHIMMEL");
    expect(f?.short).toContain("oorzaak is nog niet gekend");
  });
});

describe("2.3.3 asbest: bouwjaarverduidelijking BJ01 in alle lagen", () => {
  it("BJ01 verschijnt enkel bij bouwperiode 1991–2010", () => {
    expect(ids(fill({ Q01: "eigenaar", Q02: "open", Q03: "1991-2010" }))).toContain("BJ01");
    expect(ids(fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990" }))).not.toContain("BJ01");
    expect(ids(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011" }))).not.toContain("BJ01");
  });
  it("bevestigd bouwjaar vanaf 2001 zonder gemelde toepassingen: geen prominente attestwaarschuwing", () => {
    const a = fill({ ...CASE02_HALEN });
    expect(asbestosContext(a).applies).toBe("nee");
    const r = composeReport(a);
    expect(r.notices.some((n) => n.id === "NOT-ASBEST-ATTEST")).toBe(false);
    expect(r.v233.documents.some((d) => d.id === "DOC-ASBEST" || d.id === "DOC-ASBEST-GD")).toBe(false);
    expect(r.v232.legal.some((l) => l.id === "LEG-ASBEST-GD")).toBe(false);
  });
  it("gebouw 1999 (BJ01 vóór 2001): attestplicht blijft; 2007 (vanaf 2001): niet", () => {
    expect(asbestosContext(fill({ ...CASE02_HALEN, BJ01: "voor2001" })).applies).toBe("ja");
    expect(asbestosContext(fill({ ...CASE02_HALEN, BJ01: "vanaf2001" })).applies).toBe("nee");
  });
  it("expliciet gemelde asbesttoepassingen behouden waarschuwingen, ongeacht bouwjaar", () => {
    const a = fill({ ...CASE02_HALEN, AS01: "attest_toepassingen" });
    const r = composeReport(a);
    expect(r.v233.documents.find((d) => d.id === "DOC-ASBEST")?.content).toBe("aandachtspunt");
    expect(r.v232.legal.some((l) => l.id === "LEG-ASBEST-GD")).toBe(true);
  });
  it("1991–2010 zonder verduidelijking blijft 'verifieren'", () => {
    expect(asbestosContext(fill({ ...CASE02_HALEN, BJ01: "onbekend" })).applies).toBe("verifieren");
  });
});

describe("2.3.3 verbanden: prioriteit en exacte antwoordgegevens", () => {
  it("actieve waterinstroom krijgt voorrang op generieke afstemming", () => {
    const r = composeReport(fill(CASE04_1976));
    const first = r.v23.connections[0];
    expect(first).toBeDefined();
    // Het eerste verband betreft het gemelde actieve waterprobleem, geen generieke categorieafstemming.
    expect(["LINK-KELDER-REGEN", "LINK-KELDER-GROND", "LINK-VOCHT-AFVOER"]).toContain(first.id);
  });
  it("dakisolatie-caption gebruikt de exacte antwoordgegevens", () => {
    const r = composeReport(fill(CASE03_1962));
    const link = r.v23.connections.find((c) => c.id === "LINK-DAK-ISOL");
    expect(link?.nodes.find((n) => n.label === "Dakisolatie")?.caption).toBe("Volgens uw antwoorden is het dak niet geïsoleerd.");
  });
  it("geen verbanden zonder concrete aanleiding (geen problemen, geen werken)", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "aplus", G01: "hr", Q46: ["geen"], Q48: "nee" }));
    expect(r.v23.connections.length).toBe(0);
  });
});

describe("2.3.3 renovatiefasen: geen niet-gemelde werken", () => {
  it("case 03: geen sanitaire werken in het traject", () => {
    const ph = renovationPhases(fill(CASE03_1962));
    const text = ph.map((p) => [p.title, p.why, ...p.items].join(" ")).join(" ");
    expect(text.toLowerCase()).not.toContain("sanitair");
    expect(text).toContain("dakisolatie");
  });
  it("case 05: geen keuken, badkamer of sanitair bij alleen vloeren en interieur", () => {
    const ph = renovationPhases(fill(CASE05_RECENT));
    const text = ph.map((p) => [p.title, p.why, ...p.items].join(" ")).join(" ").toLowerCase();
    expect(text).not.toContain("keuken");
    expect(text).not.toContain("badkamer");
    expect(text).not.toContain("sanitair");
  });
  it("case 04: vochtbron onderzoeken vóór afwerking", () => {
    const ph = renovationPhases(fill(CASE04_1976));
    expect(ph[0].id).toBe("A");
    expect(ph[0].items.join(" ").toLowerCase()).toContain("vocht");
  });
});

describe("2.3.3 documenten: beschikbaarheid, inhoud en relevantie", () => {
  it("keuring beschikbaar maar inhoud onbekend: beschikbaar + 'Inhoud nog te controleren'", () => {
    const a = fill({ Q01: "koper", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q06: ["keuring"], Q24: "geen", Q34: "aplus", Q40: "onbekend", G01: "hr", Q46: ["geen"], Q48: "nee" });
    const d = documents233(a, buildReport(a).domainScores).find((x) => x.id === "DOC-KEURING")!;
    expect(d.status).toBe("beschikbaar");
    expect(d.content).toBe("niet-gecontroleerd");
    expect(d.contentLabel).toBe("Inhoud nog te controleren");
    expect(d.note).toContain("nog te controleren");
  });
  it("niet uitgevraagd is nooit 'niet beschikbaar'", () => {
    const a = fill(CASE05_RECENT);
    for (const d of documents233(a, buildReport(a).domainScores)) {
      if (d.status === "niet-gevraagd") expect(d.statusLabel).not.toContain("Niet beschikbaar");
    }
  });
  it("expliciet niet beschikbaar blijft eerlijk zonder defect te verzinnen", () => {
    const a = fill({ Q01: "koper", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "aplus", Q40: "geen", G01: "hr", Q46: ["geen"], Q48: "nee" });
    const d = documents233(a, buildReport(a).domainScores).find((x) => x.id === "DOC-KEURING")!;
    expect(d.status).toBe("niet-beschikbaar");
    expect(d.note).toContain("bewijst geen technisch defect");
  });
  it("recente woning met enkel cosmetische werken: compacte, relevante lijst", () => {
    const a = fill(CASE05_RECENT);
    const docs = documents233(a, buildReport(a).domainScores);
    expect(docs.some((d) => d.id === "DOC-PLANNEN")).toBe(false);
    expect(docs.some((d) => d.id === "DOC-ASBEST")).toBe(false);
    expect(docs.some((d) => d.id === "DOC-EPC")).toBe(true);
  });
  it("gekend EPC-label: inhoud 'gekend' met verwijzing naar het volledige verslag", () => {
    const a = fill(CASE05_RECENT);
    const d = documents233(a, buildReport(a).domainScores).find((x) => x.id === "DOC-EPC")!;
    expect(d.content).toBe("gekend");
    expect(d.note).toContain("volledige verslag");
  });
});

describe("2.3.3 VME: compacte thematische syndicusvragen", () => {
  it("maximaal vijf kernvragen, zonder doublures", () => {
    const r = composeReport(fill(CASE02_HALEN));
    const qs = r.v23.coOwnership!.questions;
    expect(qs.length).toBeLessThanOrEqual(5);
    expect(new Set(qs).size).toBe(qs.length);
  });
  it("appartement met uitsluitend VME-problemen: geen betaald product, privatieve barometer onveranderd", () => {
    const a = fill(CASE02_HALEN);
    const r = composeReport(a);
    expect(r.v23.recommendation.productId).toBeNull();
    expect(r.v23.recommendation.reasonCode).toBe("NONE-VME");
    // P-/G-score blijft los van de technische vochtscore.
    const zonder = buildReport(fill({ ...CASE02_HALEN, FL01: "a", FL02: "a" }));
    expect(buildReport(a).domainScores).toEqual(zonder.domainScores);
  });
  it("specifieke veiligheidsvraag blijft behouden bij bundeling", () => {
    const r = composeReport(fill({ ...CASE02_HALEN, Q30: "groot", SC01: "gemeenschappelijk" }));
    const qs = r.v23.coOwnership!.questions;
    expect(qs.length).toBeLessThanOrEqual(5);
    expect(qs[0]).toContain("scheuren");
  });
});

describe("2.3.3 persoonlijke conclusie", () => {
  it("bevat hoofdbevinding, doel en een logische volgende handeling", () => {
    const r = composeReport(fill(CASE04_1976));
    const c = r.v233.conclusion;
    expect(c.length).toBeGreaterThan(40);
    expect(c).toContain("volledige renovatie");
    expect(c.toLowerCase()).toContain("logische volgende stap");
  });
  it("blijft kort en neutraal bij weinig signalen", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q24: "geen", Q34: "aplus", G01: "hr", Q46: ["geen"], Q48: "nee" }));
    expect(r.v233.conclusion).toContain("geen duidelijke bouwtechnische problemen");
    expect(r.v233.conclusion.length).toBeLessThan(400);
  });
  it("koper met kostenbehoefte: doel en budgetverwijzing in de conclusie", () => {
    const r = composeReport(fill({ ...CASE05_RECENT, Q01: "koper" }));
    expect(r.v233.conclusion).toContain("aankoop");
    expect(r.v233.conclusion).toContain("kosten");
  });
});

describe("2.3.3 de vijf praktijkcases: aanbevelingen", () => {
  it("case 01 Tessenderlo: Woningscan € 299, geen Plus of drone", () => {
    const rec = composeReport(fill(CASE01_TESSENDERLO)).v23.recommendation;
    expect(rec.productId).toBe("woningscan");
    expect(rec.price).toBe(299);
    expect(rec.drone).toBeNull();
  });
  it("case 02 Halen: geen betaald product", () => {
    expect(composeReport(fill(CASE02_HALEN)).v23.recommendation.productId).toBeNull();
  });
  it("case 03 woning 1962: Plus € 449 met optionele drone bij dakproblemen", () => {
    const rec = composeReport(fill(CASE03_1962)).v23.recommendation;
    expect(rec.productId).toBe("woningscan-plus");
    expect(rec.price).toBe(449);
    expect(rec.drone).not.toBeNull();
  });
  it("case 04 woning 1976: Plus € 449; geen fictieve persoonlijke deadline", () => {
    const r = composeReport(fill(CASE04_1976));
    expect(r.v23.recommendation.productId).toBe("woningscan-plus");
    expect(r.v23.recommendation.price).toBe(449);
    expect(allText(r)).not.toMatch(/u moet (uiterlijk|tegen) (een )?(20\d\d)/i);
  });
  it("case 05 recente rijwoning: budgetindicator € 39,99, binnenkort beschikbaar, geen bestelknop of drone", () => {
    const rec = composeReport(fill(CASE05_RECENT)).v23.recommendation;
    expect(rec.productId).toBe("online-budgetindicator");
    expect(rec.price).toBe(39.99);
    expect(rec.availability).toBe("coming_soon");
    expect(rec.ctaPath).toBeNull();
    expect(rec.drone).toBeNull();
  });
});

describe("2.3.3 randgevallen", () => {
  it("EPC A met duidelijke bouwtechnische problemen: problemen blijven zichtbaar", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q24: "vochtplekken", Q25: ["kelder"], Q26: "regelmatig", Q28: "actief", Q34: "aplus", G01: "hr", Q46: ["geen"], Q48: "nee" }));
    expect(r.v232.energy.text).toContain("niets over vocht");
    expect(r.v232.actions.technical.some((x) => x.id === "ACT-VOCHT")).toBe(true);
  });
  it("veel onbekende antwoorden zonder onterechte productupsell", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "onbekend", R01: "onbekend", Q24: "geen", Q34: "onbekend", G01: "onbekend", Q46: ["geen"], Q48: "nee" }));
    expect(r.v23.recommendation.productId).toBeNull();
  });
  it("alleen 'Volledige renovatie' zonder concrete werken: conclusie benoemt de open omvang", () => {
    const r = composeReport(fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990", R01: "11-20", Q24: "geen", Q34: "d", Q46: ["volledig"], Q48: "nee" }));
    expect(r.v233.conclusion).toContain("volledige renovatie");
  });
  it("gemengde privatieve en gemeenschappelijke problemen: beide zichtbaar", () => {
    const r = composeReport(fill({ ...CASE02_HALEN, Q24: "terugkerend", Q25A: ["ramen"], Q29: "plaatselijk" }));
    expect(r.v23.highlights.length).toBeGreaterThan(0);
    expect(r.apartment).not.toBeNull();
  });
});

describe("2.3.3 sessiemigratie en historische rapporten", () => {
  it("2.3.2-sessie migreert naar de nieuwe sleutel en hervat in de vragenlijst", () => {
    const store = new Map<string, string>([[SESSION_KEY_232, JSON.stringify({ stage: "preview", answers: { Q01: "eigenaar", Q02: "open" }, index: 12, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => { store.delete(k); } });
    expect(s?.stage).toBe("questions");
    expect(s?.index).toBe(0);
    expect(s?.answers.Q01).toBe("eigenaar");
    expect(store.has(SESSION_KEY_232)).toBe(false);
    expect(SESSION_KEY).toBe("dimac-quickscan-v2.3.3");
  });
  it("gemigreerde sessie stelt nieuw toepasselijke vragen alsnog (BJ01)", () => {
    // Oude 2.3.2-sessies kennen BJ01 nog niet; verwijder het uit de opgeslagen antwoorden.
    const { BJ01: _bj, ...stored } = fill({ Q01: "eigenaar", Q02: "open", Q03: "1991-2010", R01: "0-5", Q24: "geen", Q34: "c", G01: "hr", Q46: ["geen"], Q48: "nee" });
    const store = new Map<string, string>([[SESSION_KEY_232, JSON.stringify({ stage: "report", answers: stored, index: 20, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => { store.delete(k); } })!;
    expect(s.stage).toBe("questions");
    // BJ01 is verplicht bij 1991–2010 en ontbreekt in de oude sessie → de scan is niet compleet.
    expect(isComplete(s.answers)).toBe(false);
    expect(ids(s.answers)).toContain("BJ01");
  });
  for (const [name, snap] of [["2.3", snap23], ["2.3.1", snap231]] as const) {
    it(`historisch rapport ${name}: onveranderde inhoud, oude conclusie en aanbeveling, geen v233-secties`, async () => {
      const r = storedReport(snap as never);
      expect(r).not.toBeNull();
      expect((r as { v233?: unknown }).v233).toBeUndefined();
      // De opgeslagen conclusie en aanbeveling blijven exact zoals opgeslagen.
      expect(r!.v23.conclusion).toBe((snap as { v23: { conclusion: string } }).v23.conclusion);
      expect(r!.v23.recommendation).toEqual((snap as { v23: { recommendation: unknown } }).v23.recommendation);
      const { container } = render(<MemoryRouter><Report23 report={r!} reportNumber="QS-TEST" /></MemoryRouter>);
      expect(container.textContent).toContain((snap as { v23: { conclusion: string } }).v23.conclusion.slice(0, 40));
      const pdf = await buildReportPdf23(r!, meta, { load: async () => { throw new Error("offline"); } });
      expect(pdf.size).toBeGreaterThan(10000);
    });
  }
  it("nieuw 2.3.3-rapport rendert online met persoonlijke conclusie en inhoudslabels, en als PDF", async () => {
    const r = composeReport(fill(CASE04_1976));
    const { container } = render(<MemoryRouter><Report23 report={r} reportNumber="QS-TEST" /></MemoryRouter>);
    expect(container.textContent).toContain(r.v233.conclusion.slice(0, 40));
    const pdf = await buildReportPdf23(r, meta, { load: async () => { throw new Error("offline"); } });
    expect(pdf.size).toBeGreaterThan(10000);
  });
});
