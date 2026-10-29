import { describe, it, expect } from "vitest";
import {
  activeAnswers, apartmentSection, barometer, buildReport, collectiveSafetyFlags, domainScores, privateSafetyFlags,
  safetyFlags, visibleQuestions, APARTMENT_BAROMETER_NOTE, REPORT_VERSION, RULE_VERSION, QUESTION_VERSION, type Answers, type Question,
} from "@/lib/quickscan";
import { storedReport } from "@/lib/quickscanSnapshot";
import { readSaved, SESSION_KEY } from "@/lib/quickscanSession";
import { persistQuickscan, SAVE_ERROR, UNCERTAIN_ERROR } from "../../supabase/functions/_shared/quickscan/persist";
import { fakeDb, input } from "./quickscan-221.test";
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
const APT: Answers = { Q01: "eigenaar", Q02: "appartement", Q03: "1991-2010", R01: "6-10", Q34: "c", H01: "gas", H02: "6-10" };
const CELLAR: Answers = { ...APT, Q24: "terugkerend", Q25A: ["gemkelder"], Q26: "regelmatig", Q29: "ruimtes" };

describe("2.2.2 vocht: privatief versus gemeenschappelijk", () => {
  it("1. uitsluitend vocht in de gemeenschappelijke kelder: geen privatieve V-score", () => {
    const a = fill({ ...CELLAR, KV01: "regelmatig" });
    expect(domainScores(a).V).toBe(0);
    expect(barometer(a).level).toBe(barometer(fill(APT)).level);
    expect(apartmentSection(a)!.signals.join(" ")).toContain("uitsluitend in de gemeenschappelijke kelder");
  });
  it("2. actieve waterinstroom in de gemeenschappelijke kelder: urgente melding zonder privatieve verhoging", () => {
    const a = fill({ ...CELLAR, KV01: "actief" });
    expect(safetyFlags(a)).toContain("SAFE-04");
    expect(collectiveSafetyFlags(a)).toContain("SAFE-04");
    expect(privateSafetyFlags(a)).not.toContain("SAFE-04");
    expect(domainScores(a).V).toBe(0);
    expect(buildReport(a).safety.find((s) => s.id === "SAFE-04")!.collective).toBe(true);
  });
  it("3. uitsluitend privatief badkamervocht: normale V-score", () => {
    const a = fill({ ...APT, Q24: "terugkerend", Q25A: ["badkamer"], Q26: "regelmatig", AB02: "duidelijk" });
    expect(domainScores(a).V).toBe(7);
  });
  it("4. keldervocht en privatief badkamerprobleem: alleen privatieve signalen tellen", () => {
    const a = fill({ ...APT, Q24: "terugkerend", Q25A: ["badkamer", "gemkelder"], Q26: "afentoe", Q29: "plaatselijk", AB02: "beperkt", KV01: "actief" });
    expect(domainScores(a).V).toBe(5);
    expect(collectiveSafetyFlags(a)).toContain("SAFE-04");
    expect(privateSafetyFlags(a)).not.toContain("SAFE-04");
    expect(apartmentSection(a)!.signals.join(" ")).toContain("zowel in het appartement als in de gemeenschappelijke kelder");
  });
  it("5. onbekende vochtlocatie: voorzichtig meegewogen en onzekerheid expliciet vermeld", () => {
    const a = fill({ ...APT, Q24: "vochtplekken", Q25A: ["onbekend"] });
    expect(domainScores(a).V).toBeGreaterThanOrEqual(8);
    expect(apartmentSection(a)!.signals.join(" ")).toContain("niet bepalen of het privatieve of gemeenschappelijke delen betreft");
  });
  it("'Weet ik niet' bij de vochtlocatie sluit andere locaties uit", () => {
    const a = activeAnswers({ ...fill(APT), Q24: "vochtplekken", Q25A: ["onbekend", "badkamer"] });
    expect(a.Q25A).toEqual(["onbekend"]);
  });
  it("6. actieve privatieve waterinfiltratie blijft altijd herkenbaar, ook naast keldervocht", () => {
    const a = fill({ ...APT, Q24: "vochtplekken", Q25A: ["plafond", "gemkelder"], M01: "actief", KV01: "actief" });
    expect(privateSafetyFlags(a)).toContain("SAFE-04");
    expect(collectiveSafetyFlags(a)).toContain("SAFE-04");
    const s = buildReport(a).safety.filter((x) => x.id === "SAFE-04");
    expect(s.map((x) => x.collective).sort()).toEqual([false, true]);
    expect(barometer(a).level).toBeGreaterThanOrEqual(2);
  });
  it("7. geen dubbele watervraag: bij uitsluitend keldervocht vraagt alleen KV01 naar instroom", () => {
    const ids = visibleQuestions(fill({ ...APT, Q24: "vochtplekken", Q25A: ["gemkelder"], Q27: "regen" })).map((q) => q.id);
    expect(ids).toContain("KV01");
    expect(ids).not.toContain("M01");
  });
});

describe("2.2.2 scheuren: Q30–Q33 met SC01", () => {
  const C = (x: Answers) => fill({ ...APT, ...x });
  it("8. SC01 gemeenschappelijk, Q30 groot: geen privatieve S-score", () => {
    const a = C({ Q30: "groot", SC01: "gemeenschappelijk", Q31: "groter", Q32: "nee", Q33: "ja" });
    expect(domainScores(a).S).toBe(0);
  });
  it("9. SC01 gemeenschappelijk, Q32 duidelijk: geen S-score of barometerverhoging", () => {
    const a = C({ Q30: "verzakking", SC01: "gemeenschappelijk", Q32: "duidelijk", Q33: "ja" });
    expect(domainScores(a).S).toBe(0);
    expect(barometer(a).level).toBe(barometer(fill(APT)).level);
    expect(privateSafetyFlags(a)).toEqual([]);
    expect(collectiveSafetyFlags(a)).toEqual(expect.arrayContaining(["SAFE-03", "SAFE-06"]));
  });
  it("10. SC01 gemeenschappelijk, verzakking: veiligheidsmelding blijft actief", () => {
    const a = C({ Q30: "verzakking", SC01: "gemeenschappelijk", Q32: "nee" });
    expect(safetyFlags(a)).toContain("SAFE-06");
    const r = buildReport(a);
    expect(r.safety.find((s) => s.id === "SAFE-06")!.collective).toBe(true);
    expect(r.summary).toContain(APARTMENT_BAROMETER_NOTE);
  });
  it("11. SC01 binnen: privatieve scoring blijft", () => {
    const a = C({ Q30: "groot", SC01: "binnen", Q32: "duidelijk" });
    expect(domainScores(a).S).toBe(10);
    expect(privateSafetyFlags(a)).toContain("SAFE-03");
    expect(collectiveSafetyFlags(a)).not.toContain("SAFE-03");
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("12. SC01 beide: privatieve score én afzonderlijke gemeenschappelijke melding", () => {
    const a = C({ Q30: "verzakking", SC01: "beide", Q32: "duidelijk" });
    expect(domainScores(a).S).toBe(10);
    expect(privateSafetyFlags(a)).toEqual(expect.arrayContaining(["SAFE-03", "SAFE-06"]));
    expect(collectiveSafetyFlags(a)).toEqual(expect.arrayContaining(["SAFE-03", "SAFE-06"]));
    expect(buildReport(a).safety.filter((s) => s.id === "SAFE-06")).toHaveLength(2);
  });
  it("13. SC01 onbekend: geen geruststelling, voorzichtig meegewogen met onzekerheidsmelding", () => {
    const a = C({ Q30: "groot", SC01: "onbekend", Q32: "nee" });
    expect(domainScores(a).S).toBe(10);
    expect(privateSafetyFlags(a)).toContain("SAFE-03");
    expect(apartmentSection(a)!.signals.join(" ")).toContain("bepaalt niet wie verantwoordelijk is");
  });
  it("14. privatief én gemeenschappelijk risico met hetzelfde ID blijven beide zichtbaar", () => {
    const a = C({ H01: "collectief", Q42: "gas", Q43: "ja", Q30: "groot", SC01: "beide", Q31: "groter" });
    const r = buildReport(a);
    const s03 = r.safety.filter((s) => s.id === "SAFE-03");
    expect(s03.map((s) => s.collective).sort()).toEqual([false, true]);
    expect(new Set(r.safety.map((s) => s.title)).size).toBe(r.safety.length);
    expect(barometer(a).category.id).toBe("prioritair");
  });
  it("15. online rapport en PDF gebruiken dezelfde veiligheidsmeldingen uit de snapshot", () => {
    const pdf = readFileSync("src/lib/quickscanPdf.ts", "utf8");
    expect(pdf).toMatch(/for \(const s of r\.safety\)/);
    const view = readFileSync("src/components/quickscan/ReportView.tsx", "utf8");
    expect(view).toContain("items={report.safety}");
  });
});

describe("2.2.2 opslag", () => {
  it("16. mislukte antwoordenopslag: geen succes", async () => {
    const { db, t } = fakeDb({ responses: true });
    expect(await persistQuickscan(db, input("Q-16"))).toMatchObject({ ok: false, error: SAVE_ERROR });
    expect(t.leads).toHaveLength(0);
  });
  it("17. mislukte rapportopslag: geen succes en niets vastgelegd", async () => {
    const { db, t } = fakeDb({ report: true });
    expect((await persistQuickscan(db, input("Q-17"))).ok).toBe(false);
    expect(t.leads.length + t.responses.length + t.reports.length + t.events.length).toBe(0);
  });
  it("18. onderbroken verbinding: neutrale melding zonder valse garantie", async () => {
    const { db } = fakeDb({ throw: true });
    const r = await persistQuickscan(db, input("Q-18"));
    expect(r).toMatchObject({ ok: false, uncertain: true, error: UNCERTAIN_ERROR });
    expect(UNCERTAIN_ERROR).not.toMatch(/niets geregistreerd/i);
    expect(SAVE_ERROR).not.toMatch(/niets geregistreerd/i);
  });
  it("18b. antwoord verloren na opslag: bestaand rapport wordt teruggevonden als succes", async () => {
    const { db, t } = fakeDb({ throwAfterCommit: true });
    expect(await persistQuickscan(db, input("Q-18b"))).toMatchObject({ ok: true, duplicate: true });
    expect(t.reports).toHaveLength(1);
  });
  it("19. migratie bevat referentiële integriteit, cascade en uniek rapportnummer; registratie is één functie", () => {
    const m0 = readFileSync("drizzle/migrations/0000_migration.sql", "utf8");
    expect(m0).toMatch(/quickscan_responses[\s\S]*REFERENCES public\.quickscan_leads\(id\) ON DELETE CASCADE/);
    expect(m0).toMatch(/report_number text NOT NULL UNIQUE/);
    const m1 = readFileSync("drizzle/migrations/0001_quickscan_register_atomic.sql", "utf8");
    expect(m1).toContain("pg_advisory_xact_lock");
    expect(m1).toContain("unique_violation");
    expect(m1).toMatch(/REVOKE ALL ON FUNCTION public\.quickscan_register[\s\S]*FROM PUBLIC, anon, authenticated/);
    const fn = readFileSync("supabase/functions/quickscan-submit/index.ts", "utf8");
    expect(fn).toContain('rpc("quickscan_register"');
    expect(fn).not.toContain("deleteLead");
  });
  it("20. twee identieke opeenvolgende indieningen: één rapport", async () => {
    const { db, t } = fakeDb();
    await persistQuickscan(db, input("Q-20"));
    expect(await persistQuickscan(db, input("Q-20"))).toMatchObject({ ok: true, duplicate: true });
    expect(t.reports).toHaveLength(1);
    expect(t.leads).toHaveLength(1);
  });
  it("21. twee gelijktijdige identieke indieningen: één registratie", async () => {
    const { db, t } = fakeDb();
    const [a, b] = await Promise.all([persistQuickscan(db, input("Q-21")), persistQuickscan(db, input("Q-21"))]);
    expect([a.ok, b.ok]).toEqual([true, true]);
    expect(t.leads).toHaveLength(1);
    expect(t.reports).toHaveLength(1);
  });
  it("22. herhaling na een mislukte poging slaagt normaal", async () => {
    const { db, t } = fakeDb({ report: true });
    expect((await persistQuickscan(db, input("Q-22"))).ok).toBe(false);
    const ok = fakeDb();
    ok.t.reports.push(...t.reports);
    expect(await persistQuickscan(ok.db, input("Q-22"))).toMatchObject({ ok: true, duplicate: false });
  });
  it("23. bestaande rapporten blijven behouden en een nieuwe indiening overschrijft ze niet", async () => {
    const { db, t } = fakeDb();
    t.reports.push({ lead_id: "OLD", report_number: "Q-23", report_snapshot: { oud: true } });
    expect(await persistQuickscan(db, input("Q-23"))).toMatchObject({ ok: true, duplicate: true, snapshot: { oud: true } });
    expect(t.reports).toHaveLength(1);
  });
});

describe("2.2.2 versies en historische rapporten", () => {
  it("regel-, rapport- en vraagversie zijn 2.2.2", () => {
    expect([RULE_VERSION, REPORT_VERSION, QUESTION_VERSION]).toEqual(["qs-rules-2.2.2", "qs-report-2.2.2", "qs-questions-2.2.2"]);
  });
  for (const v of ["2.1", "2.2", "2.2.1"]) {
    it(`historisch ${v}-rapport wordt niet herberekend`, () => {
      const old = { ...buildReport(fill(CELLAR)), reportVersion: `qs-report-${v}`, domainScores: { B: 0, V: 7, E: 0, T: 0, S: 0 }, category: { id: "enkele", label: "Enkele aandachtspunten", text: "x" }, meta: { reportNumber: "QS-1", name: "T", municipality: "Diest", date: "2026-01-01" } };
      const s = storedReport(old as never);
      expect(s.reportVersion).toBe(`qs-report-${v}`);
      expect(s.domainScores.V).toBe(7);
      expect(s.category.id).toBe("enkele");
    });
  }
  it("lopende 2.2.1-sessie blijft bruikbaar; ongeldig geworden antwoorden verdwijnen", () => {
    const store = new Map([[SESSION_KEY, JSON.stringify({ stage: "questions", answers: { ...APT, Q24: "vochtplekken", Q25A: ["gemkelder"], M01: "regen" }, index: 5, startedAt: 1 })]]);
    const s = readSaved({ getItem: (k) => store.get(k) ?? null, removeItem: (k) => void store.delete(k) })!;
    const a = activeAnswers(s.answers);
    expect(a.Q25A).toEqual(["gemkelder"]);
    expect(a.M01).toBeUndefined();
  });
});
