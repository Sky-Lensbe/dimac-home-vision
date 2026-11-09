import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { activeAnswers, buildReport, isComplete, visibleQuestions, QUESTION_MAP, QUESTION_VERSION, RULE_VERSION, SKIP, type Answers, type Question } from "@/lib/quickscan";
import { composeReport, connections, documents232, energyContext, legalContext, renovationPhases, REPORT_VERSION_23, type QuickscanReport23 } from "@/lib/quickscanReport";
import { LEGAL_VERIFIED_AT, RENOVATION_OBLIGATION } from "../../supabase/functions/_shared/quickscan/legal";
import { readSaved, SESSION_KEY, SESSION_KEY_221 } from "@/lib/quickscanSession";
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

/** Recente woning zonder renovatieplannen in de eerdere stappen (sanitair-, isolatievragen nog niet actief). */
const RECENT: Answers = { Q01: "eigenaar", Q02: "open", Q03: "vanaf2011", R01: "0-5", Q04: ["geen"], Q24: "geen", Q34: "aplus", G01: "hr", Q46: ["geen"], Q48: "nee" };

describe("2.3.2 vraagroutering", () => {
  it("1. sanitairwerken in stap 4 activeren eerdere vragen (RI01, SL01)", () => {
    const base = fill(RECENT);
    expect(ids(base)).not.toContain("RI01");
    expect(ids(base)).not.toContain("SL01");
    const withSan = { ...base, Q46: ["sanitair"] };
    expect(ids(withSan)).toEqual(expect.arrayContaining(["RI01", "SL01"]));
    expect(isComplete(withSan)).toBe(false);
  });
  it("2. isolatiewerken activeren ventilatie (V01) en daarna Q39", () => {
    const a = { ...fill(RECENT), Q46: ["isolatie"] };
    expect(ids(a)).toContain("V01");
    expect(ids({ ...a, V01: "natuurlijk" })).toContain("Q39");
  });
  it("3. nieuwe vragen moeten beantwoord zijn vóór registratie", () => {
    const a = { ...fill(RECENT), Q46: ["sanitair", "isolatie"] };
    expect(isComplete(a)).toBe(false);
    expect(isComplete(fill(a))).toBe(true);
  });
  it("4. plannen verwijderen laat niet-toepasselijke antwoorden vervallen", () => {
    const a = fill({ ...RECENT, Q46: ["sanitair"] });
    expect(a.RI01).toBeDefined();
    const removed = activeAnswers({ ...a, Q46: ["geen"] });
    expect(removed.RI01).toBeUndefined();
    expect(removed.SL01).toBeUndefined();
    expect(removed.Q34).toBe("aplus");
  });
  it("4b. een vervallen antwoord activeert zichzelf nooit opnieuw", () => {
    const a = fill({ ...RECENT, Q46: ["isolatie"], V01: "natuurlijk", Q39: "beperkt" });
    const after = activeAnswers({ ...a, Q46: ["geen"] });
    expect(after.V01).toBeUndefined();
    expect(after.Q39).toBeUndefined();
  });
  it("5. wissel woning → appartement behoudt alleen toepasselijke gegevens", () => {
    const a = fill({ ...RECENT, Q46: ["sanitair"] });
    const apt = activeAnswers({ ...a, Q02: "appartement" });
    expect(apt.Q04).toBeUndefined();
    expect(apt.RI01).toBeUndefined();
    expect(apt.Q34).toBe("aplus");
  });
  it("6. optionele vraag bewust overslaan blijft geldig", () => {
    const a = fill({ ...RECENT, Q46: ["sanitair"], RI01: SKIP });
    expect(a.RI01).toBe(SKIP);
    expect(isComplete(a)).toBe(true);
  });
  it("7. Q26 heeft een neutrale, niet-scorende 'Weet ik niet'", () => {
    const opt = QUESTION_MAP.Q26.options.find((o) => o.id === "onbekend");
    expect(opt).toBeDefined();
    expect(opt!.score).toBeUndefined();
    const a = fill({ ...RECENT, Q24: "terugkerend", Q26: "onbekend" });
    const b = fill({ ...RECENT, Q24: "terugkerend", Q26: "eenmalig" });
    expect(buildReport(a).domainScores.V).toBeLessThanOrEqual(buildReport(b).domainScores.V!);
  });
  it("8. hervatte 2.2.1-sessie gaat naar de vragenlijst onder de nieuwe sleutel", () => {
    const store = new Map<string, string>([[SESSION_KEY_221, JSON.stringify({ stage: "preview", answers: { Q01: "eigenaar" }, index: 9, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => { store.delete(k); } });
    expect(s?.stage).toBe("questions");
    expect(s?.index).toBe(0);
    expect(store.has(SESSION_KEY_221)).toBe(false);
    expect(SESSION_KEY).toBe("dimac-quickscan-v2.3.2");
  });
  it("9. geen navigatielussen: herhaald invullen convergeert en stabiliseert", () => {
    for (const seed of [RECENT, { ...RECENT, Q46: ["volledig"] }, { ...RECENT, Q02: "appartement", Q46A: ["sanitair", "interieur"] }]) {
      const a = fill(seed);
      expect(isComplete(a)).toBe(true);
      expect(activeAnswers(a)).toEqual(a);
    }
  });
  it("10. ontbrekende verplichte antwoorden → registratie geweigerd (isComplete false)", () => {
    const a = fill(RECENT);
    const { Q34: _drop, ...missing } = a;
    expect(isComplete(missing)).toBe(false);
  });
  it("Q46/Q46A × RI01, V01, SL01, Q39", () => {
    const h = { ...fill(RECENT), Q46: ["sanitair", "isolatie"], V01: "mechanisch" };
    expect(ids(h)).toEqual(expect.arrayContaining(["RI01", "V01", "SL01", "Q39"]));
    const apt = fill({ Q01: "eigenaar", Q02: "appartement", Q03: "vanaf2011", R01: "0-5", Q04A: ["geen"], Q24: "geen", Q34: "aplus", Q46A: ["geen"], Q48: "nee" });
    expect(ids(apt)).not.toContain("SL01");
    expect(ids({ ...apt, Q46A: ["sanitair"] })).toContain("SL01");
    expect(ids({ ...apt, Q46A: ["sanitair"] })).not.toContain("RI01");
  });
  it("versies: vragen 2.3.2, scoreregels ongewijzigd 2.2.2, rapport 2.3.2", () => {
    expect([QUESTION_VERSION, RULE_VERSION, REPORT_VERSION_23]).toEqual(["qs-questions-2.3.2", "qs-rules-2.2.2", "qs-report-2.3.2"]);
  });
});

describe("2.3.2 renovatie-intentie en verbanden", () => {
  it("volledige renovatie zonder deelwerken: scopebepaling, geen verzonnen deelwerken", () => {
    const a = fill({ ...RECENT, Q46: ["volledig"] });
    const ph = renovationPhases(a);
    expect(ph.map((p) => p.id)).toEqual(["A"]);
    expect(ph[0].items[0]).toContain("renovatiescope");
    expect(composeReport(a).v23.connections.map((c) => c.id)).not.toContain("LINK-DAK-ISOL");
  });
  it("geen plannen → geen fasenplan; cosmetisch → geen dak/gevel", () => {
    expect(renovationPhases(fill(RECENT))).toEqual([]);
    const ph = renovationPhases(fill({ ...RECENT, Q46: ["interieur"] }));
    expect(ph.flatMap((p) => p.items).join(" ")).not.toMatch(/dak|gevel/i);
  });
  it("keldervocht na regen: onderzoek vochtbron, niet gekoppeld aan raamcondens", () => {
    const a = fill({ Q01: "eigenaar", Q02: "open", Q03: "1970-1990", R01: "gt30", Q04: ["geen"], K01: "kelder", Q24: "vochtplekken", Q25: ["kelder"], Q27: "regen", Q28: "soms", Q46: ["geen"] });
    const l = connections(a);
    expect(l[0]?.id).toBe("LINK-KELDER-REGEN");
    expect(l.map((c) => c.id)).not.toContain("LINK-VOCHT-VENT-RAMEN");
    expect(l[0].evidence).toContain("Q28");
  });
  it("condens rond ramen: verband ventilatie/koude oppervlakken, glas-condens apart", () => {
    const a = fill({ ...RECENT, Q03: "1970-1990", Q24: "terugkerend", Q25: ["ramen"], Q20: "goed" });
    expect(connections(a).map((c) => c.id)).toContain("LINK-RAAM-CONDENS");
  });
  it("dak + dakisolatie: gezamenlijke beoordeling zonder volledige vervanging te veronderstellen", () => {
    const a = fill({ ...RECENT, Q03: "1945-1969", Q14: "slijtage", DI01: "niet", Q46: ["dak"] });
    const ph = renovationPhases(a).flatMap((p) => p.items).join(" ");
    expect(ph).toContain("geen volledige dakvervanging");
  });
  it("verwarming + isolatie: warmtebehoefte eerst", () => {
    const ph = renovationPhases(fill({ ...RECENT, Q46: ["verwarming", "isolatie"] })).find((p) => p.id === "C")!;
    expect(ph.items[0]).toContain("warmtebehoefte");
  });
  it("sanitair + vloeren zonder leidingproblemen: conditioneel, geen vervangingsclaim", () => {
    const a = fill({ ...RECENT, Q46: ["sanitair", "vloeren"], Q45: "geen" });
    const l = composeReport(a).v23.connections.find((c) => c.id === "LINK-SANITAIR-VLOER");
    expect(l?.text).toContain("niet bepalen");
  });
  it("hoogstens twee verbanden, gerangschikt en met bewijsreferenties", () => {
    const a = fill({ Q01: "eigenaar", Q02: "open", Q03: "voor1945", R01: "nooit", Q04: ["geen"], Q14: "slijtage", DI01: "niet", Q24: "terugkerend", Q25: ["ramen"], Q20: "tocht", Q46: ["dak", "verwarming", "isolatie", "sanitair", "vloeren"] });
    const l = connections(a);
    expect(l.length).toBeLessThanOrEqual(2);
    expect(l.every((c) => (c.evidence?.length ?? 0) > 0)).toBe(true);
    expect(l[0].relevance!).toBeGreaterThanOrEqual(l[1]?.relevance ?? 0);
  });
  it("veel technische punten: niets verdwijnt door een kaartlimiet", () => {
    const a = fill({ Q01: "eigenaar", Q02: "open", Q03: "voor1945", R01: "nooit", Q04: ["geen"], Q14: "beschadigd", Q24: "vochtplekken", Q20: "tocht", Q41: "zekeringen", Q30: "groot", Q46: ["geen"] });
    const r = composeReport(a);
    expect(r.v232.actions.technical.length).toBeGreaterThan(5);
  });
});

describe("2.3.2 EPC en wettelijke context", () => {
  const buyerF = fill({ Q01: "koper", Q02: "open", Q03: "1945-1969", R01: "gt30", Q04: ["geen"], Q34: "f", Q46: ["geen"] });
  it("1. kandidaat-koper EPC F: renovatieverplichting D binnen 6 jaar, met verificatie en bestaande verplichting", () => {
    const l = legalContext(buyerF).find((x) => x.id === "LEG-RENO-KOPER")!;
    expect(l.text).toContain(`binnen ${RENOVATION_OBLIGATION.years} jaar minimaal label D`);
    expect(l.text).toContain("nieuw EPC");
    expect(l.verify.join(" ")).toContain("lopende renovatieverplichting");
    expect(l.text).not.toMatch(/5 jaar|vijf jaar/);
  });
  it("2. eigenaar EPC F: geen fictieve deadline en geen conclusie dat er geen verplichting is", () => {
    const l = legalContext(fill({ ...RECENT, Q03: "1945-1969", Q34: "f" }));
    const t = l.map((x) => x.text).join(" ");
    expect(l[0].id).toBe("LEG-RENO-VERIFIEER");
    expect(t).toContain("lopende verplichting");
    expect(t).toContain("berekent geen persoonlijke termijn");
    expect(t).not.toMatch(/\b20\d\d\b/);
  });
  it("3. kandidaat-koper EPC A: geen renovatieplicht", () => {
    expect(legalContext(fill({ ...RECENT, Q01: "koper" })).some((x) => x.id.startsWith("LEG-RENO"))).toBe(false);
  });
  it("4. EPC F zonder isolatiegegevens: onzekerheidsmelding", () => {
    const e = energyContext(fill({ ...RECENT, Q03: "1945-1969", Q34: "f", DI01: "onbekend", MI01: "onbekend" }));
    expect(e.band).toBe("zwak");
    expect(e.points.join(" ")).toContain("onbekend");
    expect(e.text).toContain("voorspelt geen toekomstig label");
  });
  it("5. EPC F met isolatieplannen: logisch energetisch traject", () => {
    const a = fill({ ...RECENT, Q03: "1945-1969", Q34: "f", Q46: ["isolatie", "verwarming"] });
    expect(renovationPhases(a).map((p) => p.id)).toEqual(expect.arrayContaining(["A", "C"]));
  });
  it("6. EPC A met ernstige vochtproblemen: vocht blijft zichtbaar", () => {
    const r = composeReport(fill({ ...RECENT, Q24: "vochtplekken" }));
    expect(r.v232.energy.text).toContain("niets over vocht");
    expect(r.v232.actions.technical.some((x) => x.id === "ACT-VOCHT")).toBe(true);
  });
  it("7. bouwperiode 1991–2010: geen zekerheid over asbestattestplicht", () => {
    const d = documents232(fill({ ...RECENT, Q01: "koper", Q03: "1991-2010", AS01: "onbekend" })).find((x) => x.id === "DOC-ASBEST");
    expect(d?.note).toContain("Verifieer eerst het exacte bouwjaar");
  });
  it("8. oudere woning met renovatie: asbest nagaan vóór werken", () => {
    const ph = renovationPhases(fill({ ...RECENT, Q03: "1945-1969", Q46: ["dak"] }));
    expect(ph[0].items.join(" ")).toContain("asbestinformatie");
  });
  it("9–10. appartement: EPC gemeenschappelijke delen en asbestattest gemene delen afzonderlijk", () => {
    const a = fill({ Q01: "koper", Q02: "appartement", Q03: "1970-1990", R01: "11-20", Q04A: ["geen"], Q34: "c", Q46A: ["interieur"] });
    const l = legalContext(a);
    expect(l.find((x) => x.id === "LEG-EPC-GD")?.text).toContain("nieuwbouw");
    expect(l.find((x) => x.id === "LEG-ASBEST-GD")?.text).toContain("31 december 2026");
    const d = documents232(a);
    expect(d.find((x) => x.id === "DOC-EPC-GD")?.status).toBe("niet-gevraagd");
    expect(d.find((x) => x.id === "DOC-ASBEST")?.label).toContain("appartement");
  });
  it("11. P-score D zonder vochtproblemen: verificatieadvies; 12. geen invloed op vochtbarometer", () => {
    const base = fill({ ...RECENT, Q01: "koper" });
    const d = fill({ ...base, FL01: "d", FL02: "d" });
    expect(legalContext(d).some((x) => x.id === "LEG-OVERSTROMING")).toBe(true);
    expect(buildReport(d).domainScores).toEqual(buildReport(base).domainScores);
    expect(buildReport(d).level).toBe(buildReport(base).level);
  });
  it("13. onbekende P/G-score: neutrale controle, geen risicoclassificatie", () => {
    const l = legalContext(fill({ ...RECENT, Q01: "koper", FL01: "onbekend", FL02: "onbekend" }));
    expect(l.find((x) => x.id === "LEG-OVERSTROMING-ONBEKEND")?.text).toContain("geen inschatting");
  });
  it("14. ontbrekende elektrische keuring: geen defect verzonnen", () => {
    const d = documents232(fill({ ...RECENT, Q01: "koper", Q40: "geen" })).find((x) => x.id === "DOC-KEURING")!;
    expect(d.status).toBe("niet-beschikbaar");
    expect(d.note).toContain("bewijst geen technisch defect");
  });
  it("15. niet uitgevraagd document is nooit 'niet beschikbaar'", () => {
    const d = documents232(fill(RECENT));
    expect(d.find((x) => x.id === "DOC-EPC")?.status).not.toBe("niet-beschikbaar");
    expect(composeReport(fill(RECENT)).v232.legalVerifiedAt).toBe(LEGAL_VERIFIED_AT);
  });
});

describe("2.3.2 productaanbeveling", () => {
  const rec = (a: Answers) => composeReport(fill(a)).v23.recommendation;
  it("EPC F zonder verdere problemen → geen automatisch fysiek pakket", () => {
    expect(rec({ ...RECENT, Q34: "f", DI01: "degelijk", MI01: "geisoleerd", G01: "hr" }).productId).toBeNull();
  });
  it("kostenvraag zonder technische twijfels → budgetindicator (binnenkort)", () => {
    const r = rec({ ...RECENT, Q46: ["interieur"], Q48: "ja" });
    expect(r.productId).toBe("online-budgetindicator");
    expect(r.ctaPath).toBeNull();
  });
  it("één technisch aandachtspunt → Woningscan €299", () => {
    const r = rec({ ...RECENT, Q03: "1970-1990", Q14: "beschadigd" });
    expect(r.productId).toBe("woningscan");
    expect(r.price).toBe(299);
  });
  it("prijzen ongewijzigd: Plus €449 bij onderbouwde complexiteit", () => {
    const r = rec({ Q01: "eigenaar", Q02: "open", Q03: "voor1945", R01: "nooit", Q04: ["geen"], Q14: "beschadigd", Q24: "vochtplekken", Q41: "zekeringen", Q46: ["dak", "elektriciteit"] });
    expect(r.productId).toBe("woningscan-plus");
    expect(r.price).toBe(449);
  });
  it("geen drone bij budgetindicator of zonder dakindicatie", () => {
    expect(rec({ ...RECENT, Q46: ["interieur"], Q48: "ja" }).drone).toBeNull();
  });
  it("appartement met uitsluitend VME-problemen → geen fysieke Woningscan; mét privatief signaal wel", () => {
    const vme = { Q01: "koper", Q02: "appartement", Q03: "1970-1990", R01: "11-20", Q04A: ["geen"], Q24: "geen", Q34: "c", G01: "hr", Q46A: ["geen"], Q48: "nee", A01: "duidelijk", CD01: "problemen", A02: "ingrijpend", A03: "substantieel" } as Answers;
    const r = rec(vme);
    expect(r.productId).toBeNull();
    expect(r.reasonCode).toBe("NONE-VME");
    expect(r.drone).toBeNull();
    expect(rec({ ...vme, Q24: "vochtplekken" }).productId).toBe("woningscan");
  });
  it("geen relevante behoefte → geen betaald product", () => {
    expect(rec(RECENT).productId).toBeNull();
  });
});

describe("2.3.2 historische snapshots (echte vormen, geanonimiseerd)", () => {
  for (const [v, snap] of [["2.3", snap23], ["2.3.1", snap231]] as const) {
    it(`${v}: blijft onveranderd, rendert online zonder 2.3.2-secties en als PDF`, async () => {
      const s = storedReport(snap as never) as unknown as QuickscanReport23;
      expect(s.reportVersion).toBe(`qs-report-${v}`);
      expect("v232" in s).toBe(false);
      render(<MemoryRouter><Report23 report={s} reportNumber="QS-HIST" /></MemoryRouter>);
      expect(screen.queryByText("Uw voorlopig renovatietraject")).toBeNull();
      expect(screen.getAllByText(s.v23.recommendation.title).length).toBeGreaterThan(0);
      const pdf = await buildReportPdf23(s, meta, { load: () => Promise.reject(new Error("offline")) });
      expect(pdf.size).toBeGreaterThan(5000);
    });
  }
  it("nieuw rapport rendert 2.3.2-secties online", () => {
    const r = composeReport(fill({ ...RECENT, Q01: "koper", Q03: "1945-1969", Q34: "f", Q46: ["isolatie", "verwarming"] }));
    render(<MemoryRouter><Report23 report={r} reportNumber="QS-NEW" /></MemoryRouter>);
    expect(screen.getByText("Uw voorlopig renovatietraject")).toBeTruthy();
    expect(screen.getAllByText("Mogelijke renovatieverplichting").length).toBeGreaterThan(0);
  });
});
