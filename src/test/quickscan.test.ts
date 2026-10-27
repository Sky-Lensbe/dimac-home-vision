import { describe, it, expect } from "vitest";
import {
  activeAnswers, apartmentSection, barometer, buildReport, droneAdvice, isComplete, questionText, safetyFlags,
  visibleQuestions, QUESTIONS, QUESTION_MAP, QUESTION_VERSION, RENOVATION_AGE, STEP_TITLES, type Answers,
} from "@/lib/quickscan";
import { assertAllowedRecipient, resolveRecipients, MAIL_MODE } from "../../supabase/functions/_shared/quickscan/mail-policy";

const base: Answers = { Q01: "eigenaar", Q02: "open", Q03: "1991-2010", Q04: ["geen"], Q14: "geen", Q18: "geen", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "ab", Q35: "lt5", H01: "gas", H02: "0-5", Q42: "normaal", Q44: "12m", Q40: "conform", Q41: "geen", Q46: ["geen"], Q48: "nee", Q49: "later" };
const apt: Answers = { ...base, Q02: "appartement", A01: "geen", A02: "nee", A03: "nee" };
const ids = (qid: string) => QUESTION_MAP[qid].options.map((o) => o.id);
const order = (a: Answers) => visibleQuestions(a).map((q) => q.id);

describe("vragenbank 2.1", () => {
  it("heeft een nieuwe versie", () => expect(QUESTION_VERSION).toBe("qs-questions-2.1"));
  it("vier stappen met de nieuwe titels", () => expect(STEP_TITLES).toEqual(["Uw woning", "Bouwkundige toestand", "Energie en installaties", "Renovatieplannen"]));
  it("unieke vraag-ID's", () => expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length));
  it("basiswoning is volledig ingevuld", () => expect(isComplete(base)).toBe(true));
});

describe("bouwjaar", () => {
  it("heeft exact zes opties met vóór 1945 en 1945–1969", () => {
    expect(ids("Q03")).toEqual(["voor1945", "1945-1969", "1970-1990", "1991-2010", "vanaf2011", "onbekend"]);
  });
  it.each(["voor1945", "1945-1969"])("%s activeert de isolatievraag zoals vroeger vóór 1970", (y) => {
    expect(order({ ...base, Q03: y })).toContain("Q36");
  });
  it("bouwjaar alleen verhoogt de score niet", () => {
    expect(barometer({ ...base, Q03: "voor1945" }).score).toBe(barometer(base).score);
  });
  it("oud antwoord voor1970 is ongeldig", () => expect(activeAnswers({ ...base, Q03: "voor1970" }).Q03).toBeUndefined());
  it("andere vraagtekst bij appartement", () => expect(questionText(QUESTION_MAP.Q03, apt)).toBe("Wanneer werd het appartementsgebouw gebouwd?"));
});

describe("renovatieleeftijd", () => {
  it("gebruikt de vijf nieuwe categorieën voor dak, ramen en elektriciteit", () => {
    const expected = ["0-5", "6-10", "11-20", "gt20", "onbekend"];
    expect(RENOVATION_AGE.map((o) => o.id)).toEqual(expected);
    for (const q of ["Q08", "Q09", "Q10"]) expect(ids(q)).toEqual(expected);
  });
  it("vraagt de verwarmingsleeftijd niet dubbel", () => {
    const v = order({ ...base, Q04: ["verwarming", "elektriciteit"] });
    expect(v.filter((x) => /verwarming.*(vernieuwd)|oud is de huidige verwarming/i.test(QUESTION_MAP[x].text)).length).toBe(1);
  });
});

describe("vocht en scheuren", () => {
  it("vochtvraag heeft enkel de vier toegelaten opties", () => expect(ids("Q24")).toEqual(["geen", "terugkerend", "vochtplekken", "onbekend"]));
  it("geschrapte vochtantwoorden zijn ongeldig", () => {
    expect(activeAnswers({ ...base, Q24: "occasioneel" }).Q24).toBeUndefined();
    expect(activeAnswers({ ...base, Q24: "infiltratie" }).Q24).toBeUndefined();
  });
  it("vochtvervolgvragen komen direct na de vochtvraag", () => {
    const v = order({ ...base, Q24: "vochtplekken" });
    const i = v.indexOf("Q24");
    expect(v.slice(i + 1, i + 4)).toEqual(["Q25", "Q26", "Q27"]);
  });
  it("geen vochtmodule zonder vochtproblemen", () => expect(order(base)).not.toContain("Q25"));
  it("onverklaarde scheuren bestaan niet meer", () => {
    expect(ids("Q30")).not.toContain("onverklaard");
    expect(activeAnswers({ ...base, Q30: "onverklaard" }).Q30).toBeUndefined();
  });
  it("grote scheuren tonen vervolgvragen en SAFE-03", () => {
    const a = { ...base, Q30: "groot" };
    expect(order(a)).toEqual(expect.arrayContaining(["Q31", "Q32", "Q33"]));
    expect(safetyFlags(a)).toContain("SAFE-03");
  });
});

describe("verwarming", () => {
  it("type komt vóór leeftijd, werking en onderhoud", () => {
    const v = order(base);
    expect(v.indexOf("H01")).toBeLessThan(v.indexOf("H02"));
    expect(v.indexOf("H02")).toBeLessThan(v.indexOf("Q42"));
    expect(v.indexOf("Q42")).toBeLessThan(v.indexOf("Q44"));
  });
  it("gaslucht of CO-alarm geeft SAFE-01 en prioritaire beoordeling", () => {
    const a = { ...base, Q42: "gas" };
    expect(safetyFlags(a)).toContain("SAFE-01");
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("collectieve verwarming: geen leeftijds- of onderhoudsvraag en storingen tellen niet mee", () => {
    const a = { ...apt, H01: "collectief", Q42: "storingen" };
    const v = order(a);
    expect(v).not.toContain("H02");
    expect(v).not.toContain("Q44");
    expect(barometer(a).domainScores.T).toBe(0);
  });
  it("individuele verwarming met storingen telt wel mee", () => {
    expect(barometer({ ...base, Q42: "storingen" }).domainScores.T).toBe(7);
  });
  it("een oude installatie alleen geeft geen ernstige score", () => {
    expect(barometer({ ...base, H02: "gt20" }).domainScores.T).toBeLessThanOrEqual(3);
  });
  it("geen vaste verwarming slaat werking over", () => expect(order({ ...base, H01: "geen" })).not.toContain("Q42"));
});

describe("elektriciteit", () => {
  it("keuring wordt eerst gevraagd, daarna problemen", () => {
    const v = order(base);
    expect(v.indexOf("Q40")).toBeLessThan(v.indexOf("Q41"));
  });
  it("rook, vonken of brandlucht activeert SAFE-02", () => expect(safetyFlags({ ...base, Q41: "rook" })).toContain("SAFE-02"));
  it("ontbrekend verslag is geen gebrek", () => expect(barometer({ ...base, Q40: "geen" }).domainScores.T).toBe(0));
});

describe("renovatietiming", () => {
  it("bevat 'Binnen het jaar'", () => expect(ids("Q49")).toEqual(["2w", "3m", "1j", "later", "onbekend"]));
  it("eigenaar en kandidaat-koper krijgen een andere vraag", () => {
    expect(questionText(QUESTION_MAP.Q49, base)).toBe("Wanneer wilt u met de renovatiewerken starten?");
    expect(questionText(QUESTION_MAP.Q49, { ...base, Q01: "koper" })).toBe("Wanneer verwacht u een beslissing te nemen over de woning?");
    expect(questionText(QUESTION_MAP.Q49, { ...base, Q01: "interesse" })).toBe("Wanneer verwacht u verdere stappen te zetten?");
  });
  it.each(["2w", "3m", "1j", "later", "onbekend"])("timing %s verandert de barometer niet", (t) => {
    expect(barometer({ ...base, Q49: t }).score).toBe(barometer(base).score);
  });
});

describe("appartementen", () => {
  it("geen dak-, gevel- of dronevragen", () => {
    const v = order(apt);
    for (const q of ["Q14", "Q18", "Q50"]) expect(v).not.toContain(q);
    expect(droneAdvice(apt)).toBe(false);
  });
  it("VME-vragen enkel bij appartementen", () => {
    expect(order(base).some((x) => x.startsWith("A0"))).toBe(false);
    expect(order(apt)).toEqual(expect.arrayContaining(["A01", "A02", "A03"]));
  });
  it("onbekende gemeenschappelijke delen geven een signaal in het rapport", () => {
    const s = apartmentSection({ ...apt, A01: "onbekend" })!;
    expect(s.signals.some((t) => t.includes("weinig bekend"))).toBe(true);
  });
  it("aangekondigde VME-werken tonen reservefonds en documenten", () => {
    const a = { ...apt, A02: "beslist" };
    expect(order(a)).toEqual(expect.arrayContaining(["A04", "A05"]));
  });
  it("bijzondere bijdragen geven een signaal, zonder bedrag", () => {
    const s = apartmentSection({ ...apt, A03: "ja" })!;
    expect(s.signals.some((t) => t.includes("bijzondere bijdragen"))).toBe(true);
    expect(JSON.stringify(s)).not.toMatch(/€/);
  });
  it("rapport bevat het appartementsonderdeel enkel bij appartementen", () => {
    expect(buildReport(apt).apartment?.title).toBe("Gemeenschappelijke delen en mogelijke toekomstige kosten");
    expect(buildReport(base).apartment).toBeNull();
  });
});

describe("barometer en rapport", () => {
  it("woning zonder problemen geeft beperkte signalen", () => expect(barometer(base).category.id).toBe("beperkt"));
  it("domeinscore 7 verhindert beperkt", () => expect(barometer({ ...base, Q20: "beschadigd" }).category.id).not.toBe("beperkt"));
  it("weet ik niet geeft onvoldoende informatie", () => {
    expect(barometer({ ...base, Q14: "onbekend", Q20: "onbekend", Q24: "onbekend", Q34: "onbekend" }).category.id).toBe("onvoldoende");
  });
  it("meerdere problemen: maximaal drie aandachtspunten", () => {
    const r = buildReport({ ...base, Q20: "beschadigd", Q34: "f", Q41: "zekeringen", Q42: "storingen", Q24: "vochtplekken" });
    expect(r.points.length).toBe(3);
  });
  it("geen pakketnamen of prijzen in de vervolgstap", () => {
    const r = buildReport({ ...base, Q48: "ja" });
    expect(r).not.toHaveProperty("packageAdvice");
    expect(r.nextStep.text).not.toMatch(/Basis|Compleet|€/);
  });
  it("drone-advies bij zichtbare dakschade, niet bij ouder bouwjaar", () => {
    expect(droneAdvice({ ...base, Q14: "beschadigd", Q15: "bedekking" })).toBe(true);
    expect(droneAdvice({ ...base, Q03: "voor1945" })).toBe(false);
  });
});

describe("e-mail testmodus", () => {
  it("staat standaard in testmodus", () => expect(MAIL_MODE).toBe("test"));
  it("stuurt enkel naar info@sky-lens.be", () => {
    expect(resolveRecipients("report", "klant@example.com")).toEqual(["info@sky-lens.be"]);
    expect(resolveRecipients("lead_notification", null)).toEqual(["info@sky-lens.be"]);
  });
  it("weigert klant- en DIMAC-adressen", () => {
    expect(() => assertAllowedRecipient("klant@example.com")).toThrow();
    expect(() => assertAllowedRecipient("info@dimac.be")).toThrow();
    expect(() => assertAllowedRecipient("info@sky-lens.be")).not.toThrow();
  });
});
