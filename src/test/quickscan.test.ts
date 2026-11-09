import { describe, it, expect } from "vitest";
import {
  activeAnswers, apartmentSection, barometer, buildReport, contextNotices, domainScores, energyNotes, isComplete,
  migrateAnswers, questionText, safetyFlags, stepTitle, visibleQuestions, DOMAINS, QUESTIONS, QUESTION_MAP,
  QUESTION_VERSION, REPORT_VERSION, RULE_VERSION, SKIP, VME_QUESTIONS, type Answers, type Question,
} from "@/lib/quickscan";
import { readSaved, OLD_SESSION_KEY, SESSION_KEY } from "@/lib/quickscanSession";
import { storedReport } from "@/lib/quickscanSnapshot";
import { assertAllowedRecipient, resolveRecipients, MAIL_MODE } from "../../supabase/functions/_shared/quickscan/mail-policy";

/** Vult alle zichtbare vragen in: eerst de opgegeven antwoorden, anders de eerste (gunstige of exclusieve) optie. */
const defaultFor = (q: Question) => (q.multi ? [q.options.find((o) => o.exclusive)?.id ?? q.options[0].id] : q.options[0].id);
function fill(seed: Answers): Answers {
  let a: Answers = { ...seed };
  for (let i = 0; i < 80; i++) {
    const open = visibleQuestions(a).find((q) => activeAnswers(a)[q.id] === undefined);
    if (!open) break;
    a = { ...a, [open.id]: seed[open.id] ?? defaultFor(open) };
  }
  return activeAnswers(a);
}
const ids = (qid: string) => QUESTION_MAP[qid].options.map((o) => o.id);
const shown = (a: Answers) => visibleQuestions(fill(a)).map((q) => q.id);
const count = (a: Answers) => visibleQuestions(fill(a)).length;
const HOUSE: Answers = { Q01: "eigenaar", Q02: "open", Q03: "1991-2010", R01: "11-20", Q34: "c", H01: "gas", H02: "6-10" };
const APT: Answers = { Q01: "eigenaar", Q02: "appartement", Q03: "1991-2010", R01: "6-10", Q34: "c", H01: "gas", H02: "6-10" };

describe("versies en vragenbank 2.2", () => {
  it("vraag-, regel- en rapportversie zijn 2.2.2", () => {
    expect([QUESTION_VERSION, RULE_VERSION, REPORT_VERSION]).toEqual(["qs-questions-2.3.3", "qs-rules-2.2.2", "qs-report-2.2.2"]);
  });
  it("unieke vraag-ID's", () => expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length));
  it("bevat alle nieuwe onderwerpen", () => {
    for (const q of ["O01", "O02", "R01", "DI01", "G01", "MI01", "VL01", "VL02", "SL01", "AS01", "AS02", "RI01", "K01", "Z01", "B01", "ST01", "AK01", "AB01", "AB02", "CL01", "CD01", "A06", "A07"]) expect(QUESTION_MAP[q]).toBeDefined();
  });
  it("oppervlakte heeft aparte reeksen voor woning en appartement", () => {
    expect(ids("O01")).toEqual(["lt100", "100-149", "150-199", "200-299", "gte300", "onbekend"]);
    expect(ids("O02")).toEqual(["lt75", "75-99", "100-149", "gte150", "onbekend"]);
  });
  it("EPC is opgesplitst en B staat apart", () => expect(ids("Q34")).toEqual(["aplus", "b", "c", "d", "e", "f", "onbekend"]));
  it("vochthoofdvraag houdt exact vier opties", () => expect(ids("Q24")).toEqual(["geen", "terugkerend", "vochtplekken", "onbekend"]));
  it("scheurvraag heeft verzakking en geen 'onverklaarde scheuren'", () => {
    expect(ids("Q30")).toEqual(["geen", "haar", "groot", "verzakking", "onbekend"]);
  });
  it("documentenvraag houdt bouwplannen, EPC en keuring; geen en weet ik niet zijn exclusief", () => {
    expect(ids("Q06")).toEqual(expect.arrayContaining(["plannen", "epc", "keuring"]));
    expect(activeAnswers(fill({ ...HOUSE, Q01: "koper", Q06: ["geen", "epc"] })).Q06).not.toEqual(["geen", "epc"]);
  });
  it("VME-documenten: geen en weet ik niet exclusief", () => {
    const a = fill({ ...APT, Q01: "koper", A05: ["geen", "verslagen"] });
    expect(a.A05).not.toEqual(["geen", "verslagen"]);
  });
  it("stap 3 krijgt bij appartementen 'mede-eigendom' in de titel", () => {
    expect(stepTitle(3, fill(APT))).toContain("mede-eigendom");
    expect(stepTitle(3, fill(HOUSE))).toBe("Energie en installaties");
  });
});

describe("woningen (acceptatie 1–14)", () => {
  it("1. woning vóór 1945: asbest-, riolerings- en vloervragen worden gesteld, bouwjaar alleen verhoogt de score niet", () => {
    const s = shown({ ...HOUSE, Q03: "voor1945" });
    expect(s).toEqual(expect.arrayContaining(["AS01", "RI01", "VL01"]));
    expect(barometer(fill({ ...HOUSE, Q03: "voor1945" })).score).toBe(barometer(fill(HOUSE)).score);
  });
  it("2. recente woning: geen vloer-, riolerings- of leidingvragen", () => {
    const s = shown({ ...HOUSE, Q03: "vanaf2011" });
    for (const q of ["VL01", "RI01", "SL01"]) expect(s).not.toContain(q);
  });
  it("3. onbekende vloeropbouw: vloerisolatie mag nog gevraagd worden, opbouw scoort niet", () => {
    const a = fill({ ...HOUSE, Q03: "1970-1990", VL01: "onbekend" });
    expect(visibleQuestions(a).map((q) => q.id)).toContain("VL02");
    expect(QUESTION_MAP.VL01.options.every((o) => o.score === undefined)).toBe(true);
  });
  it("4. ontbrekende dakisolatie geeft een energiepunt (E 7)", () => {
    const a = fill({ ...HOUSE, DI01: "niet" });
    expect(domainScores(a).E).toBe(7);
    expect(buildReport(a).points.map((p) => p.id)).toContain("AP-DAKISOL");
  });
  it("5. enkel glas is energetisch (E), niet bouwtechnisch (B)", () => {
    const a = fill({ ...HOUSE, G01: "enkel" });
    expect(domainScores(a).E).toBe(6);
    expect(domainScores(a).B).toBe(0);
  });
  it("6. onvolledige isolatie: gekende afwezigheid en onbekende toestand worden onderscheiden", () => {
    const n = energyNotes(fill({ ...HOUSE, DI01: "gedeeltelijk", MI01: "massief" }));
    expect(n.some((t) => t.startsWith("Dak: gedeeltelijk"))).toBe(true);
    expect(n.some((t) => t.startsWith("Buitenmuren: isolatietoestand onbekend"))).toBe(true);
  });
  it("7. gekende asbestmaterialen: vervolgvraag en melding zonder barometerimpact", () => {
    const a = fill({ ...HOUSE, Q03: "1970-1990", AS01: "gekend", AS02: "werken" });
    expect(visibleQuestions(a).map((q) => q.id)).toContain("AS02");
    expect(contextNotices(a).map((n) => n.id)).toContain("NOT-ASBEST-WERK");
    expect(barometer(a).score).toBe(barometer(fill({ ...HOUSE, Q03: "1970-1990" })).score);
  });
  it("8. geen asbestattest: geen diagnose, wel een melding", () => {
    const n = contextNotices(fill({ ...HOUSE, Q03: "1970-1990", AS01: "geen_attest" }));
    expect(n.find((x) => x.id === "NOT-ASBEST-ATTEST")?.text).toContain("niet dat er asbest aanwezig of afwezig is");
  });
  it("9. kelder met vochtproblemen vraagt naar water in de kelder", () => {
    expect(shown({ ...HOUSE, K01: "kelder", Q24: "vochtplekken" })).toContain("Q28");
  });
  it("10. zonder kelder geen keldervraag", () => {
    expect(shown({ ...HOUSE, K01: "geen", Q24: "vochtplekken", Q25: ["buitenmuur"] })).not.toContain("Q28");
  });
  it("11. zonder zolder blijven de dakvragen", () => {
    const s = shown({ ...HOUSE, Z01: "nee", Q14: "slijtage" });
    expect(s).toEqual(expect.arrayContaining(["Q14", "Q15", "DI01"]));
  });
  it("12. rioleringsprobleem leidt tot de afvoervraag en een melding", () => {
    const a = fill({ ...HOUSE, Q01: "koper", RI01: "septisch", Q45: "terugkerend" });
    expect(visibleQuestions(a).map((q) => q.id)).toContain("Q45");
    expect(buildReport(a).points.map((p) => p.id)).toContain("AP-SANITAIR");
    expect(contextNotices(a).map((n) => n.id)).toContain("NOT-RIOLERING");
  });
  it("13. verzakking geeft een gerichte veiligheidsmelding en prioritaire beoordeling", () => {
    const a = fill({ ...HOUSE, Q30: "verzakking" });
    expect(safetyFlags(a)).toContain("SAFE-06");
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("14. nooit grondig gerenoveerd: andere formulering voor afzonderlijke onderdelen, geen score", () => {
    const a = fill({ ...HOUSE, R01: "nooit" });
    expect(questionText(QUESTION_MAP.Q04, a)).toBe("Werden er wel afzonderlijke onderdelen vernieuwd?");
    expect(barometer(a).score).toBe(barometer(fill(HOUSE)).score);
  });
});

describe("appartementen (acceptatie 15–24)", () => {
  it("15. recent gerenoveerd appartement: geen keuken- of badkamervragen, geen woningvragen", () => {
    const s = shown({ ...APT, R01: "0-5" });
    for (const q of ["AK01", "AB01", "Q14", "DI01", "MI01", "K01", "Q08"]) expect(s).not.toContain(q);
  });
  it("16. oude privatieve leidingen: aandachtspunt, vraagtekst verwijst naar het appartement", () => {
    const a = fill({ ...APT, R01: "gt30", SL01: "origineel" });
    expect(questionText(QUESTION_MAP.SL01, a)).toContain("binnen het appartement");
    expect(domainScores(a).T).toBe(3);
  });
  it("17. verouderde keuken en badkamer: vragen gesteld, geen automatische score", () => {
    const a = fill({ ...APT, R01: "gt30", AK01: "gt20", AB01: "gt20", AB02: "geen" });
    expect(visibleQuestions(a).map((q) => q.id)).toEqual(expect.arrayContaining(["AK01", "AB01", "AB02"]));
    expect(barometer(a).score).toBe(barometer(fill({ ...APT, R01: "gt30", AK01: "0-5", AB01: "0-5" })).score);
  });
  it("18. collectieve verwarming: geen privatieve score voor de werking", () => {
    const a = fill({ ...APT, H01: "collectief", Q42: "storingen" });
    expect(domainScores(a).T).toBe(0);
  });
  it("19. oude gemeenschappelijke leidingen: alleen in het mede-eigendomsonderdeel", () => {
    const a = fill({ ...APT, CL01: "nee" });
    expect(apartmentSection(a)!.groups[0].signals.join(" ")).toContain("gemeenschappelijke leidingen");
    expect(barometer(a).score).toBe(barometer(fill(APT)).score);
  });
  it("20. geplande grote VME-werken: werkenvragen verschijnen, barometer ongewijzigd", () => {
    const a = fill({ ...APT, A02: "ingrijpend", A07: "goedgekeurd" });
    expect(visibleQuestions(a).map((q) => q.id)).toEqual(expect.arrayContaining(["A06", "A07"]));
    expect(apartmentSection(a)!.groups[1].signals.join(" ")).toContain("goedgekeurd");
    expect(barometer(a).score).toBe(barometer(fill(APT)).score);
  });
  it("21. beperkt reservefonds: financiële melding zonder toereikendheidsclaim", () => {
    const a = fill({ ...APT, Q01: "koper", A04: "beperkt" });
    expect(apartmentSection(a)!.groups[2].signals.join(" ")).toContain("kan de Quickscan niet beoordelen");
  });
  it("22. substantiële bijzondere bijdragen: melding zonder bedragen", () => {
    const t = apartmentSection(fill({ ...APT, A03: "substantieel" }))!.groups[2].signals.join(" ");
    expect(t).toContain("substantiële");
    expect(t).not.toMatch(/€|\d+\s?euro/i);
  });
  it("23. kandidaat-koper zonder VME-documenten: maximaal drie syndicusvragen", () => {
    const sec = apartmentSection(fill({ ...APT, Q01: "koper", A02: "besproken", A03: "omvang", A04: "onbekend", A05: ["geen"], CD01: "onbekend" }))!;
    expect(sec.syndic.length).toBe(3);
  });
  it("24. technisch gunstig appartement met ongunstige VME-context blijft 'beperkt'", () => {
    const a = fill({ ...APT, Q01: "koper", A01: "duidelijk", CD01: "problemen", A02: "ingrijpend", A03: "substantieel", A04: "geen" });
    expect(barometer(a).category.id).toBe("beperkt");
    expect(apartmentSection(a)!.signals.length).toBeGreaterThan(2);
  });
});

describe("algemene logica (25–36)", () => {
  it("25. EPC B wordt apart behandeld en is geen ernstig probleem", () => {
    const a = fill({ ...HOUSE, Q34: "b" });
    expect(QUESTION_MAP.Q34.options.find((o) => o.id === "b")!.score).toEqual({ d: "E", v: 1 });
    expect(buildReport(a).points.map((p) => p.id)).not.toContain("AP-EPC");
  });
  it("26. onbekend scoort niet slecht", () => {
    const a = fill({ ...HOUSE, DI01: "onbekend", MI01: "onbekend", G01: "onbekend" });
    expect(domainScores(a).E).toBe(domainScores(fill({ ...HOUSE, DI01: "degelijk", MI01: "geisoleerd", G01: "hr" })).E);
  });
  it("27. niet-gestelde vragen leveren geen gunstige score op", () => {
    const a = fill({ ...APT });
    expect(a.DI01).toBeUndefined();
    expect(Object.keys(domainScores(a))).toHaveLength(5);
    expect(apartmentSection(a)).not.toBeNull();
  });
  it("28. rapport bewaart vraagversie en antwoordlabels", () => {
    const r = buildReport(fill(HOUSE));
    expect(r.questionVersion).toBe("qs-questions-2.3.3");
    expect(r.answerLabels.Q02.a).toBe("Open bebouwing");
  });
  it("29. type wijzigen verwijdert niet-toepasselijke antwoorden", () => {
    const a = fill({ ...HOUSE, DI01: "niet", K01: "kelder" });
    const b = activeAnswers({ ...a, Q02: "appartement" });
    expect(b.DI01).toBeUndefined();
    expect(b.K01).toBeUndefined();
  });
  it("30. volgorde is stabiel bij herberekening (Vorige/Volgende)", () => {
    const a = fill(HOUSE);
    expect(visibleQuestions(a).map((q) => q.id)).toEqual(visibleQuestions(activeAnswers(a)).map((q) => q.id));
  });
  it("31. geen vervolgvragen zonder trigger", () => {
    const s = shown(HOUSE);
    for (const q of ["Q15", "Q16", "Q25", "Q31", "AS02", "A06", "Q43"]) expect(s).not.toContain(q);
  });
  it("32. geen dubbele vragen: oude algemene isolatievraag is vervangen", () => {
    expect(QUESTION_MAP.Q36).toBeUndefined();
    expect(new Set(shown(HOUSE)).size).toBe(shown(HOUSE).length);
  });
  it("33. veiligheidsmeldingen blijven direct werken", () => {
    expect(safetyFlags({ Q42: "gas" })).toContain("SAFE-01");
    expect(safetyFlags({ Q41: "rook" })).toContain("SAFE-02");
    expect(safetyFlags({ M01: "actief" })).toContain("SAFE-04");
  });
  it("34. volledig rapport bevat alle secties", () => {
    const r = buildReport(fill({ ...APT, Q01: "koper", A02: "ingrijpend" }));
    for (const k of ["profile", "points", "energy", "notices", "unknown", "combinations", "summary", "nextStep", "apartment", "context", "limits"]) expect(r).toHaveProperty(k);
  });
  it("35. testmailbeleid is ongewijzigd", () => {
    expect(MAIL_MODE).toBe("test");
    expect(resolveRecipients("report", "klant@example.com")).toEqual(["info@sky-lens.be"]);
  });
  it("36. geen mails naar klanten of DIMAC", () => {
    expect(() => assertAllowedRecipient("info@dimac.be")).toThrow();
    expect(() => assertAllowedRecipient("klant@example.com")).toThrow();
    expect(resolveRecipients("lead_notification", null)).toEqual(["info@sky-lens.be"]);
  });
});

describe("voorwaarde 1: deterministische prioritering en vraagaantallen", () => {
  it("dakvervolgvragen schalen met de ernst", () => {
    const oud = shown({ ...HOUSE, Q14: "oud" }).filter((q) => ["Q17", "Q15", "Q16", "Q19"].includes(q));
    const slijt = shown({ ...HOUSE, Q14: "slijtage" }).filter((q) => ["Q17", "Q15", "Q16", "Q19"].includes(q));
    const lek = shown({ ...HOUSE, Q14: "lek" }).filter((q) => ["Q17", "Q15", "Q16", "Q19"].includes(q));
    expect(oud).toEqual(["Q17"]);
    expect(slijt).not.toContain("Q19");
    expect(lek).toContain("Q19");
    expect(slijt.length).toBeGreaterThan(oud.length);
  });
  it("vochtvervolgvragen (locatie, frequentie, aard, timing) vallen nooit weg bij gemeld vocht (2.3.3)", () => {
    const vocht = ["Q25", "Q26", "Q29", "Q27"];
    const licht = shown({ ...HOUSE, Q24: "terugkerend", Q25: ["badkamer"], Q26: "afentoe" }).filter((q) => vocht.includes(q));
    expect(licht).toEqual(expect.arrayContaining(vocht));
    expect(shown({ ...HOUSE, Q24: "vochtplekken" })).toContain("Q27");
  });
  it("VME-vervolgvragen: eigenaar zonder werken krijgt er minder dan kandidaat-koper", () => {
    const vme = (a: Answers) => shown(a).filter((q) => ["A04", "A05", "A06", "A07"].includes(q)).length;
    expect(vme({ ...APT, A02: "geen", A03: "nee" })).toBeLessThan(vme({ ...APT, Q01: "koper", A02: "ingrijpend" }));
  });
  it("veiligheidsvragen vallen nooit onder het budget", () => {
    expect(shown({ ...HOUSE, Q14: "slijtage" })).toContain("Q16");
    expect(shown({ ...HOUSE, Q42: "gas" })).toContain("Q43");
  });
  const SCEN: [string, Answers][] = [
    ["recente woning, geen problemen", { ...HOUSE, Q03: "vanaf2011", R01: "0-5", H02: "0-5" }],
    ["woning 1991–2010, geen problemen", HOUSE],
    ["oude woning, kandidaat-koper, problemen", { ...HOUSE, Q01: "koper", Q03: "voor1945", R01: "nooit", Q14: "slijtage", Q24: "vochtplekken", K01: "kelder", Q30: "groot" }],
    ["appartement, eigenaar, geen problemen", APT],
    ["appartement, kandidaat-koper, VME-werken", { ...APT, Q01: "koper", R01: "gt30", A02: "ingrijpend", A03: "substantieel" }],
  ];
  it.each(SCEN)("aantal vragen: %s", (name, a) => {
    const n = count(a);
    console.log(`[vraagaantal] ${name}: ${n}`);
    expect(n).toBeGreaterThan(10);
    expect(n).toBeLessThan(60);
  });
  it("een normale scan blijft compact (≤ 27 vragen; +1 voor de bouwjaarverduidelijking 2.3.3)", () => {
    expect(count(HOUSE)).toBeLessThanOrEqual(27);
    expect(count(APT)).toBeLessThanOrEqual(27);
  });
});

describe("voorwaarde 2: overslaan", () => {
  it("optionele vraag mag overgeslagen worden en telt als ontbrekende informatie", () => {
    const a = fill({ ...HOUSE, O01: SKIP });
    expect(a.O01).toBe(SKIP);
    expect(isComplete(a)).toBe(true);
    expect(buildReport(a).unknown.skipped.map((s) => s.id)).toContain("SKIP-O01");
  });
  it("overslaan is nooit gunstig: dezelfde score als niet beantwoord", () => {
    const a = fill({ ...HOUSE, Q03: "1970-1990", VL01: "beton", VL02: SKIP });
    expect(domainScores(a).E).toBe(domainScores(fill({ ...HOUSE, Q03: "1970-1990", VL01: "beton", VL02: "onbekend" })).E);
  });
  it("veiligheidsvragen kunnen niet overgeslagen worden (ook niet via de server)", () => {
    for (const q of QUESTIONS.filter((x) => x.safety)) expect(q.optional).toBeFalsy();
    const a = fill(HOUSE);
    expect(isComplete({ ...a, Q24: SKIP })).toBe(false);
    expect(isComplete({ ...a, Q41: SKIP })).toBe(false);
  });
  it("hoofdvragen zijn niet optioneel", () => {
    for (const q of QUESTIONS.filter((x) => x.main)) expect(q.optional).toBeFalsy();
  });
});

describe("voorwaarde 3: migratie v2.1 → v2.2", () => {
  const OLD = { Q01: "koper", Q02: "appartement", Q03: "1970-1990", Q34: "ab", Q36: "weinig", A02: "nee", A03: "ja", A04: "ja", A05: ["verslagen", "onderhoud"], Q24: "geen" };
  it("eenduidige antwoorden blijven, dubbelzinnige worden opnieuw gevraagd", () => {
    const m = migrateAnswers(OLD, "2.1");
    expect(m).toMatchObject({ Q01: "koper", Q03: "1970-1990", A02: "geen", A04: "aanwezig", Q24: "geen" });
    for (const q of ["Q34", "Q36", "A03", "A05"]) expect(m[q]).toBeUndefined();
  });
  it("sessie onder de oude sleutel wordt gemigreerd en verwijderd", () => {
    const store = new Map<string, string>([[OLD_SESSION_KEY, JSON.stringify({ stage: "questions", answers: OLD, index: 3, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => void store.delete(k) });
    expect(s!.answers.Q34).toBeUndefined();
    expect(s!.answers.A04).toBe("aanwezig");
    expect(store.has(OLD_SESSION_KEY)).toBe(false);
    expect(SESSION_KEY).toBe("dimac-quickscan-v2.3.3");
  });
});

describe("voorwaarde 4: historische rapporten onveranderlijk", () => {
  it("een opgeslagen 2.1-rapport behoudt zijn uitkomst en versie", () => {
    const old = { ...buildReport(fill(HOUSE)), reportVersion: "qs-report-2.1", ruleVersion: "qs-rules-2.1", category: { id: "verhoogd", label: "Verhoogde renovatiesignalen", text: "x" }, answers: { Q34: "ab" }, meta: { reportNumber: "QS-1", name: "T", municipality: "Diest", date: "2026-01-01" } };
    const s = storedReport(old as never);
    expect(s.category.id).toBe("verhoogd");
    expect(s.reportVersion).toBe("qs-report-2.1");
    expect(Object.isFrozen(s)).toBe(true);
  });
  it("de snapshotmodule importeert de rekenregels niet", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/lib/quickscanSnapshot.ts", "utf8");
    expect(src).not.toMatch(/import\s+\{[^}]*\}\s+from\s+"@\/lib\/quickscan"/);
  });
});

describe("voorwaarde 5: mede-eigendom", () => {
  it("alle VME-vragen staan in stap 3 en enkel bij appartementen", () => {
    for (const q of VME_QUESTIONS) {
      expect(QUESTION_MAP[q].step).toBe(3);
      expect(QUESTION_MAP[q].showIf?.(fill(HOUSE))).toBe(false);
    }
  });
  it("VME-vragen staan na alle privatieve installatievragen", () => {
    const order = QUESTIONS.map((q) => q.id);
    expect(order.indexOf("A01")).toBeGreaterThan(order.indexOf("Q45"));
  });
  it("VME-vragen hebben geen technische score", () => {
    for (const q of VME_QUESTIONS) expect(QUESTION_MAP[q].options.every((o) => o.score === undefined)).toBe(true);
  });
  it("geen dubbele VME-vragen in een route", () => {
    const s = shown({ ...APT, Q01: "koper", A02: "ingrijpend" });
    expect(new Set(s).size).toBe(s.length);
  });
});

describe("voorwaarde 6: scoringsmatrix en gewichten", () => {
  it("domeingewichten zijn ongewijzigd", () => {
    expect(DOMAINS.map((d) => [d.code, d.weight])).toEqual([["B", 0.25], ["V", 0.25], ["E", 0.2], ["T", 0.2], ["S", 0.1]]);
  });
  it("de matrix documenteert elke nieuwe technische vraag", async () => {
    const fs = await import("node:fs");
    const doc = fs.readFileSync("docs/quickscan-2.2-scoringsmatrix.md", "utf8");
    for (const q of ["DI01", "G01", "MI01", "VL02", "SL01", "M01", "AB02", "Q30", "Q34"]) expect(doc).toContain(q);
  });
  it("contextvragen scoren niet", () => {
    for (const q of ["O01", "O02", "R01", "K01", "Z01", "B01", "ST01", "VL01", "AS01", "AS02", "RI01", "AK01", "AB01"]) {
      expect(QUESTION_MAP[q].options.every((o) => o.score === undefined)).toBe(true);
    }
  });
  it("geen dubbeltelling: meerdere energiesignalen geven het maximum, geen som", () => {
    expect(domainScores(fill({ ...HOUSE, DI01: "niet", MI01: "niet", G01: "enkel" })).E).toBe(7);
  });
});
