import { describe, it, expect } from "vitest";
import {
  activeAnswers, apartmentSection, barometer, buildReport, collectiveSafetyFlags, domainScores, energyNotes, migrateAnswers,
  safetyFlags, visibleQuestions, QUESTION_MAP, type Answers, type Question,
} from "@/lib/quickscan";
import { readSaved, SESSION_KEY_22 } from "@/lib/quickscanSession";
import { storedReport } from "@/lib/quickscanSnapshot";
import { MAIL_MODE, resolveRecipients } from "../../supabase/functions/_shared/quickscan/mail-policy";
import { persistQuickscan, reportNumberFor, SAVE_ERROR } from "../../supabase/functions/_shared/quickscan/persist";
import { fakeDb, input } from "./fakeQuickscanDb";
import { readFileSync } from "node:fs";

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
const shown = (a: Answers) => visibleQuestions(fill(a)).map((q) => q.id);
const ids = (q: string) => QUESTION_MAP[q].options.map((o) => o.id);
const APT: Answers = { Q01: "eigenaar", Q02: "appartement", Q03: "1991-2010", R01: "6-10", Q34: "c", H01: "gas", H02: "6-10" };
const HOUSE: Answers = { Q01: "eigenaar", Q02: "open", Q03: "1991-2010", R01: "11-20", Q34: "c", H01: "gas", H02: "6-10" };

describe("2.2.1 privatief en gemeenschappelijk bij appartementen", () => {
  it("appartement krijgt Q04A zonder dak/gevel; woning behoudt Q04 met dak en gevel", () => {
    expect(ids("Q04A")).not.toContain("dak");
    expect(ids("Q04A")).not.toContain("gevel");
    expect(ids("Q04")).toEqual(expect.arrayContaining(["dak", "gevel"]));
    expect(shown(APT)).toContain("Q04A");
    expect(shown(APT)).not.toContain("Q04");
    expect(shown(HOUSE)).not.toContain("Q04A");
  });
  it("1. vernieuwd gemeenschappelijk dak, verder in orde: geen privatieve bouwscore", () => {
    const a = fill({ ...APT, CD01: "beide" });
    expect(domainScores(a).B ?? 0).toBe(0);
    expect(barometer(a).category.id).not.toBe("prioritair");
  });
  it("2. terugkerend probleem aan gemeenschappelijk dak: VME-signaal, geen privatieve bouwscore", () => {
    const a = fill({ ...APT, Q04A: ["sanitair"], Q07A: "gemeenschappelijk" });
    expect(a.Q07A).toBe("gemeenschappelijk");
    expect(domainScores(a).B ?? 0).toBe(0);
    expect(apartmentSection(a)!.signals.join(" ")).toContain("gemeenschappelijke delen");
    expect(buildReport(a).points.map((p) => p.id)).not.toContain("AP-DAK-TERUG");
  });
  it("3. waterinfiltratie binnen het appartement: privatief vochtsignaal en melding", () => {
    const a = fill({ ...APT, Q24: "vochtplekken", Q25A: ["plafond"], M01: "actief" });
    expect(domainScores(a).V).toBe(10);
    expect(safetyFlags(a)).toContain("SAFE-04");
    expect(collectiveSafetyFlags(a)).not.toContain("SAFE-04");
  });
  it("4. vocht in gemeenschappelijke kelder: VME-context, geen privatieve vochtscore door de kelder", () => {
    const a = fill({ ...APT, Q24: "terugkerend", Q25A: ["gemkelder"], KV01: "regelmatig" });
    expect(visibleQuestions(a).map((q) => q.id)).not.toContain("Q28");
    // 2.2.2: vocht uitsluitend in de gemeenschappelijke kelder telt niet meer privatief (2.2.1 gaf hier V = 5).
    expect(domainScores(a).V).toBe(0);
    expect(apartmentSection(a)!.signals.join(" ")).toContain("gemeenschappelijke kelder");
  });
  it("4b. actieve instroom in gemeenschappelijke kelder: melding, maar barometer niet verhoogd", () => {
    const base = fill({ ...APT, Q24: "terugkerend", Q25A: ["gemkelder"], KV01: "nee" });
    const a = fill({ ...APT, Q24: "terugkerend", Q25A: ["gemkelder"], KV01: "actief" });
    expect(safetyFlags(a)).toContain("SAFE-04");
    expect(collectiveSafetyFlags(a)).toContain("SAFE-04");
    expect(barometer(a).level).toBe(barometer(base).level);
  });
});

describe("2.2.1 vocht en kelder", () => {
  it("5. woning zonder kelder: geen keldervraag, ook niet als 'kelder' als plaats gekozen wordt", () => {
    expect(shown({ ...HOUSE, K01: "geen" })).not.toContain("Q28");
    expect(shown({ ...HOUSE, K01: "geen", Q24: "vochtplekken", Q25: ["kelder"] })).not.toContain("Q28");
  });
  it("6. woning met kelder en actieve waterinstroom: veiligheidsmelding", () => {
    const a = fill({ ...HOUSE, K01: "kelder", Q24: "vochtplekken", Q28: "actief" });
    expect(a.Q28).toBe("actief");
    expect(safetyFlags(a)).toContain("SAFE-04");
    expect(domainScores(a).V).toBe(10);
  });
  it("actieve daklekkage: M01 wordt niet nogmaals gevraagd en de melding blijft", () => {
    const a = fill({ ...HOUSE, Q14: "lek", Q24: "vochtplekken" });
    expect(visibleQuestions(a).map((q) => q.id)).not.toContain("M01");
    expect(safetyFlags(a)).toContain("SAFE-04");
  });
  it("vochthoofdvraag houdt exact vier opties", () => expect(ids("Q24")).toEqual(["geen", "terugkerend", "vochtplekken", "onbekend"]));
});

describe("2.2.1 collectieve verwarming en veiligheid", () => {
  it("7. collectieve verwarming met normale werking: geen privatief installatiedefect", () => {
    const a = fill({ ...APT, H01: "collectief", Q42: "storingen" });
    expect(domainScores(a).T ?? 0).toBeLessThan(7);
    expect(buildReport(a).points.map((p) => p.id)).not.toContain("AP-VERW");
  });
  it("8. collectieve verwarming met gas/CO: urgente melding, geen privatieve score of barometerverhoging", () => {
    const base = fill({ ...APT, H01: "collectief", Q42: "normaal" });
    const a = fill({ ...APT, H01: "collectief", Q42: "gas", Q43: "ja" });
    expect(safetyFlags(a)).toContain("SAFE-01");
    expect(collectiveSafetyFlags(a)).toContain("SAFE-01");
    expect(domainScores(a).T).toBe(domainScores(base).T);
    expect(barometer(a).level).toBe(barometer(base).level);
    const r = buildReport(a);
    expect(r.safety.find((s) => s.id === "SAFE-01")!.collective).toBe(true);
    expect(r.summary).toContain("gemeenschappelijke delen of een collectieve installatie");
  });
  it("eigen gasverwarming met gas/CO blijft prioritair", () => {
    const a = fill({ ...APT, H01: "gas", Q42: "gas", Q43: "ja" });
    expect(barometer(a).category.id).toBe("prioritair");
  });
});

describe("2.2.1 structurele signalen", () => {
  it("9. ernstige gemeenschappelijke constructieve signalen: waarschuwing, geen verantwoordelijkheidsconclusie", () => {
    const a = fill({ ...APT, Q30: "verzakking", SC01: "gemeenschappelijk", Q32: "nee" });
    expect(safetyFlags(a)).toContain("SAFE-06");
    expect(collectiveSafetyFlags(a)).toContain("SAFE-06");
    expect(domainScores(a).S ?? 0).toBe(0);
    const txt = apartmentSection(a)!.signals.join(" ");
    expect(txt).toContain("bepaalt niet wie verantwoordelijk is");
  });
  it("10. scheuren binnen de eigen woonruimte: privatief signaal en veiligheidsnuance", () => {
    const a = fill({ ...APT, Q30: "groot", SC01: "binnen" });
    expect(domainScores(a).S).toBe(10);
    expect(safetyFlags(a)).toContain("SAFE-03");
    expect(collectiveSafetyFlags(a)).not.toContain("SAFE-03");
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("SC01 is een veiligheidsvraag en verschijnt alleen bij appartementen", () => {
    expect(QUESTION_MAP.SC01.safety).toBe(true);
    expect(shown({ ...HOUSE, Q30: "groot" })).not.toContain("SC01");
  });
});

describe("2.2.1 sanitair, ouderdom en energie", () => {
  it("11. onbekende elektriciteit zonder sanitaire signalen: geen sanitaire vervolgvraag", () => {
    expect(shown({ ...HOUSE, Q41: "onbekend" })).not.toContain("Q45");
  });
  it("12. recente woning met actieve sanitaire lekkage wordt herkend", () => {
    const a = fill({ ...HOUSE, Q03: "vanaf2011", Q24: "vochtplekken", Q25: ["badkamer"], Q45: "actief" });
    expect(a.Q45).toBe("actief");
    expect(safetyFlags(a)).toContain("SAFE-04");
  });
  it("12b. vernieuwd sanitair activeert de sanitaire vraag ook bij appartementen", () => {
    expect(shown({ ...APT, Q04A: ["sanitair"] })).toContain("Q45");
  });
  it("13. oud dak zonder gekende schade: geen tekst over bewezen defecten", () => {
    const r = buildReport(fill({ ...HOUSE, Q14: "oud" }));
    expect(r.points.map((p) => p.id)).not.toContain("AP-DAK-SLIJTAGE");
    expect(JSON.stringify(r.points)).not.toMatch(/defect|gebrek(?!kig)/i);
  });
  it("14. onbekende isolatie: geen aanname dat isolatie ontbreekt", () => {
    const n = energyNotes(fill({ ...HOUSE, DI01: "onbekend" }));
    expect(n.join(" ")).toContain("Dat betekent niet dat er geen isolatie is");
    expect(n.join(" ")).not.toContain("Dak: volgens u niet geïsoleerd");
  });
  it("15. EPC B: geen ernstig energetisch probleem", () => {
    const a = fill({ ...HOUSE, Q34: "b" });
    expect(domainScores(a).E ?? 0).toBeLessThan(7);
    expect(buildReport(a).points.map((p) => p.id)).not.toContain("AP-EPC");
  });
});

describe("2.2.1 routewissel, migratie en historische rapporten", () => {
  it("16. appartement → woning → appartement: ongeldige antwoorden verdwijnen", () => {
    const apt = fill({ ...APT, Q04A: ["ramen"], Q24: "terugkerend", Q25A: ["gemkelder"], KV01: "soms" });
    const asHouse = activeAnswers({ ...apt, Q02: "open" });
    for (const q of ["Q04A", "Q25A", "KV01", "Q46A"]) expect(asHouse[q]).toBeUndefined();
    const back = activeAnswers({ ...asHouse, Q02: "appartement", Q04: ["dak"] });
    expect(back.Q04).toBeUndefined();
  });
  it("migratie 2.2 → 2.2.1: woningantwoorden blijven, dubbelzinnige appartementantwoorden worden opnieuw gevraagd", () => {
    const house = migrateAnswers({ Q02: "open", Q04: ["dak"], Q25: ["kelder"], Q46: ["gevel"] }, "2.2");
    expect(house).toEqual({ Q02: "open", Q04: ["dak"], Q25: ["kelder"], Q46: ["gevel"] });
    const apt = migrateAnswers({ Q02: "appartement", Q04: ["dak", "ramen"], Q07: "dak", Q25: ["badkamer"], Q46: ["sanitair"], Q13: ["vloer"] }, "2.2");
    expect(apt.Q04A).toBeUndefined();
    expect(apt.Q07A).toBeUndefined();
    expect(apt.Q13A).toBeUndefined();
    expect(apt.Q25A).toEqual(["badkamer"]);
    expect(apt.Q46A).toEqual(["sanitair"]);
    expect(migrateAnswers({ Q02: "appartement", Q07: "nee" }, "2.2").Q07A).toBe("nee");
  });
  it("een 2.2-sessie wordt gemigreerd, verwijderd en hervat in de vragenlijst", () => {
    const store = new Map([[SESSION_KEY_22, JSON.stringify({ stage: "report", answers: { Q02: "appartement", Q04: ["gevel"] }, index: 30, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => void store.delete(k) })!;
    expect(s.stage).toBe("questions");
    expect(s.answers.Q04A).toBeUndefined();
    expect(store.has(SESSION_KEY_22)).toBe(false);
  });
  for (const v of ["2.1", "2.2"]) {
    it(`${v === "2.1" ? 17 : 18}. historisch ${v}-rapport blijft onveranderd`, () => {
      const old = { ...buildReport(fill(APT)), reportVersion: `qs-report-${v}`, ruleVersion: `qs-rules-${v}`, category: { id: "verhoogd", label: "Verhoogde renovatiesignalen", text: "x" }, safety: [{ id: "SAFE-01", title: "Oude titel", text: "Oude tekst" }], meta: { reportNumber: "QS-1", name: "T", municipality: "Diest", date: "2026-01-01" } };
      const s = storedReport(old as never);
      expect(s.reportVersion).toBe(`qs-report-${v}`);
      expect(s.category.id).toBe("verhoogd");
      expect(s.safety[0].title).toBe("Oude titel");
    });
  }
});

describe("2.2.1 betrouwbare opslag", () => {
  it("19. mislukte opslag van antwoorden: geen succes en geen achtergebleven records", async () => {
    const { db, t } = fakeDb({ responses: true });
    const r = await persistQuickscan(db, input("QS-A"));
    expect(r).toEqual({ ok: false, status: 500, error: SAVE_ERROR, uncertain: false });
    expect(t.leads.length + t.responses.length + t.reports.length).toBe(0);
  });
  it("20. mislukte opslag van rapportsnapshot: geen foutieve succesmelding, niets vastgelegd", async () => {
    const { db, t } = fakeDb({ report: true });
    const r = await persistQuickscan(db, input("QS-B"));
    expect(r.ok).toBe(false);
    expect(t.leads).toHaveLength(0);
    expect(t.responses).toHaveLength(0);
  });
  it("mislukte lead-opslag: geen succes", async () => {
    const { db } = fakeDb({ lead: true });
    expect((await persistQuickscan(db, input("QS-C"))).ok).toBe(false);
  });
  it("herhaalde indiening: geen tweede record, hetzelfde rapport terug", async () => {
    const { db, t } = fakeDb();
    const a = await persistQuickscan(db, input("QS-D"));
    const b = await persistQuickscan(db, input("QS-D"));
    expect(a).toMatchObject({ ok: true, duplicate: false });
    expect(b).toMatchObject({ ok: true, duplicate: true, snapshot: { nr: "QS-D" } });
    expect(t.leads).toHaveLength(1);
    expect(t.reports).toHaveLength(1);
    expect(t.responses).toHaveLength(1);
  });
  it("rapportnummer is deterministisch per indiening en verschilt bij andere antwoorden", async () => {
    const a = await reportNumberFor("A@B.be", 1_700_000_000_000, { Q01: "koper", Q02: "open" });
    expect(await reportNumberFor("a@b.be ", 1_700_000_000_000, { Q02: "open", Q01: "koper" })).toBe(a);
    expect(await reportNumberFor("a@b.be", 1_700_000_000_000, { Q01: "eigenaar", Q02: "open" })).not.toBe(a);
  });
});

describe("2.2.1 rapport, PDF en testmodus", () => {
  it("21. online rapport en PDF gebruiken dezelfde titel en het snapshot als bron", () => {
    const pdf = readFileSync("src/lib/quickscanPdf.ts", "utf8");
    const view = readFileSync("src/components/quickscan/ReportView.tsx", "utf8");
    expect(pdf).toContain("Uw renovatiebarometer");
    expect(pdf).not.toContain("Renovatienoodzakelijkheidsbarometer");
    expect(view).toContain("Uw renovatiebarometer");
    expect(pdf).not.toMatch(/from "@\/lib\/quickscan"[^;]*buildReport/);
  });
  it("22. testmodus en mailbeleid blijven ongewijzigd", () => {
    expect(MAIL_MODE).toBe("production");
    expect(resolveRecipients("report", "klant@example.com", "test")).toEqual(["info@sky-lens.be"]);
    expect(resolveRecipients("lead_notification", null, "test")).toEqual(["info@sky-lens.be"]);
  });
});
