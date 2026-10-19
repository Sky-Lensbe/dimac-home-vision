import { describe, it, expect } from "vitest";
import { activeAnswers, barometer, buildReport, droneAdvice, packageAdvice, safetyFlags, visibleQuestions, QUESTIONS } from "@/lib/quickscan";
import { assertAllowedRecipient, resolveRecipients, MAIL_MODE } from "../../supabase/functions/_shared/quickscan/mail-policy";

const base = { Q01: "eigenaar", Q02: "open", Q03: "1991-2010", Q04: ["geen"], Q14: "geen", Q20: "geen", Q24: "geen", Q30: "geen", Q34: "ab", Q40: "gunstig", Q42: "normaal", Q46: ["geen"], Q48: "nee", Q49: "later" };

describe("quickscan vragenbank", () => {
  it("bevat 50 vragen met 14 hoofdvragen", () => {
    expect(QUESTIONS.length).toBe(50);
    expect(QUESTIONS.filter((q) => q.main).length).toBe(14);
  });
  it("toont geen vochtmodule bij geen vochtproblemen", () => {
    expect(visibleQuestions(base).some((q) => q.id === "Q25")).toBe(false);
  });
  it("verwijdert antwoorden van vervallen vervolgvragen", () => {
    expect(activeAnswers({ ...base, Q25: ["kelder"] }).Q25).toBeUndefined();
  });
});

describe("barometer", () => {
  it("geen signalen geeft beperkte renovatiesignalen", () => {
    expect(barometer(base).category.id).toBe("beperkt");
  });
  it("een domeinscore van 7 verhindert de categorie beperkt", () => {
    expect(barometer({ ...base, Q20: "beschadigd" }).category.id).not.toBe("beperkt");
  });
  it("een domeinscore van 9 geeft minstens verhoogde signalen", () => {
    expect(["verhoogd", "prioritair"]).toContain(barometer({ ...base, Q34: "f" }).category.id);
  });
  it("weet ik niet telt niet als nul en geeft onvoldoende informatie", () => {
    const a = { ...base, Q14: "onbekend", Q20: "onbekend", Q24: "onbekend", Q34: "onbekend" };
    expect(barometer(a).category.id).toBe("onvoldoende");
  });
});

describe("veiligheid", () => {
  it("gaslucht activeert SAFE-01 en prioritaire beoordeling", () => {
    const a = { ...base, Q42: "gas" };
    expect(safetyFlags(a)).toContain("SAFE-01");
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("rook aan de elektriciteit activeert SAFE-02", () => {
    expect(safetyFlags({ ...base, Q40: "rook" })).toContain("SAFE-02");
  });
});

describe("pakket- en droneadvies", () => {
  it("adviseert Basis zonder kosten- of planningswens", () => {
    expect(packageAdvice(base).pkg).toBe("basis");
  });
  it("adviseert Compleet bij een gewenste kostenindicatie", () => {
    expect(packageAdvice({ ...base, Q48: "ja" }).pkg).toBe("compleet");
  });
  it("een hoge barometer geeft geen automatische upsell naar Compleet", () => {
    expect(packageAdvice({ ...base, Q42: "gas", Q34: "f" }).pkg).toBe("basis");
  });
  it("geen drone-advies enkel door een ouder bouwjaar", () => {
    expect(droneAdvice({ ...base, Q03: "voor1970" })).toBe(false);
  });
  it("drone-advies bij zichtbare dakschade", () => {
    expect(droneAdvice({ ...base, Q14: "beschadigd", Q15: "bedekking" })).toBe(true);
  });
  it("rapport toont maximaal drie aandachtspunten", () => {
    const r = buildReport({ ...base, Q20: "beschadigd", Q34: "f", Q40: "zekeringen", Q42: "storingen", Q30: "onverklaard" });
    expect(r.points.length).toBeLessThanOrEqual(3);
  });
});

describe("e-mail testmodus", () => {
  it("staat standaard in testmodus", () => {
    expect(MAIL_MODE).toBe("test");
  });
  it("stuurt rapporten en leadmeldingen enkel naar info@sky-lens.be", () => {
    expect(resolveRecipients("report", "klant@example.com")).toEqual(["info@sky-lens.be"]);
    expect(resolveRecipients("lead_notification", null)).toEqual(["info@sky-lens.be"]);
  });
  it("weigert klantadressen en DIMAC-adressen", () => {
    expect(() => assertAllowedRecipient("klant@example.com")).toThrow();
    expect(() => assertAllowedRecipient("info@dimac.be")).toThrow();
    expect(() => assertAllowedRecipient("info@sky-lens.be")).not.toThrow();
  });
});
