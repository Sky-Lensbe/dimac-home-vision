/**
 * DIMAC Quickscan-engine. Deterministisch, zonder AI en zonder imports,
 * zodat browser en server exact dezelfde regels gebruiken.
 * De server herberekent altijd zelf; scores uit de browser worden nooit vertrouwd.
 * Gewichten en drempels zijn ontwerpwaarden, geen gevalideerde technische schaal.
 */

export const RULE_VERSION = "qs-rules-2026.10-1";
export const QUESTION_VERSION = "qs-questions-2026.10-1";
export const REPORT_VERSION = "qs-report-2026.10-1";

export type Domain = "B" | "V" | "E" | "T" | "S";
export const DOMAINS: { code: Domain; name: string; weight: number }[] = [
  { code: "B", name: "Dak, gevel en buitenschrijnwerk", weight: 0.25 },
  { code: "V", name: "Vocht en waterinfiltratie", weight: 0.25 },
  { code: "E", name: "Energie en isolatie", weight: 0.2 },
  { code: "T", name: "Technische installaties", weight: 0.2 },
  { code: "S", name: "Scheuren en vervormingen", weight: 0.1 },
];

export interface Option {
  id: string;
  label: string;
  /** undefined = geen technische score; null = onbekend */
  score?: { d: Domain; v: number } | null;
  exclusive?: boolean;
}
export type Answers = Record<string, string | string[]>;
export interface Question {
  id: string;
  step: 1 | 2 | 3 | 4;
  text: string;
  help?: string;
  multi?: boolean;
  main?: boolean;
  options: Option[];
  showIf?: (a: Answers) => boolean;
}

const o = (id: string, label: string, d?: Domain, v?: number | null, exclusive?: boolean): Option => {
  const opt: Option = { id, label };
  if (d !== undefined) opt.score = v === null || v === undefined ? null : { d, v };
  if (exclusive) opt.exclusive = true;
  return opt;
};
const unk = (d: Domain) => o("onbekend", "Weet ik niet", d, null);
const has = (a: Answers, q: string, ...ids: string[]) => {
  const v = a[q];
  if (v === undefined) return false;
  return Array.isArray(v) ? v.some((x) => ids.includes(x)) : ids.includes(v);
};
const PERIOD = [o("lt10", "Minder dan 10 jaar geleden"), o("10-20", "10 tot 20 jaar geleden"), o("ouder", "Langer geleden"), o("onbekend", "Weet ik niet")];
const RENOVATED = ["dak", "ramen", "gevel", "isolatie", "elektriciteit", "verwarming", "sanitair"];
const WORKS = ["dak", "ramen", "gevel", "isolatie", "elektriciteit", "verwarming", "sanitair", "vloeren", "interieur", "volledig"];
const plannedCount = (a: Answers) => (Array.isArray(a.Q46) ? a.Q46.filter((x) => WORKS.includes(x)).length : 0);
const plans = (a: Answers, w: string) => has(a, "Q46", w, "volledig");
const moistureReported = (a: Answers) => has(a, "Q24", "occasioneel", "terugkerend", "vochtplekken", "infiltratie");
const roofIssue = (a: Answers) => has(a, "Q14", "slijtage", "beschadigd", "lek", "los");

export const QUESTIONS: Question[] = [
  // STAP 1 — Uw woning
  { id: "Q01", step: 1, main: true, text: "Wat is uw situatie?", options: [o("eigenaar", "Eigenaar met renovatieplannen"), o("koper", "Kandidaat-koper"), o("interesse", "Algemene interesse in de woningtoestand")] },
  { id: "Q02", step: 1, main: true, text: "Welk type woning betreft het?", options: [o("open", "Open bebouwing"), o("halfopen", "Halfopen bebouwing"), o("gesloten", "Gesloten bebouwing"), o("appartement", "Appartement"), o("ander", "Ander type woning")] },
  { id: "Q03", step: 1, main: true, text: "Wanneer werd de woning gebouwd?", options: [o("voor1970", "Vóór 1970"), o("1970-1990", "1970–1990"), o("1991-2010", "1991–2010"), o("vanaf2011", "Vanaf 2011"), o("onbekend", "Weet ik niet")] },
  {
    id: "Q04", step: 1, main: true, multi: true, text: "Welke onderdelen werden volgens u ooit vernieuwd?", help: "Meerdere antwoorden mogelijk.",
    options: [o("dak", "Dak"), o("ramen", "Ramen"), o("gevel", "Gevel"), o("isolatie", "Isolatie"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Verwarming"), o("sanitair", "Sanitair"), o("geen", "Geen gekende renovaties", undefined, undefined, true), o("onbekend", "Weet ik niet", undefined, undefined, true)],
  },
  { id: "Q05", step: 1, text: "Beschikt u over bewijs van de uitgevoerde renovaties?", showIf: (a) => has(a, "Q04", ...RENOVATED), options: [o("facturen", "Facturen of attesten"), o("mondeling", "Enkel mondelinge informatie"), o("geen", "Geen documenten"), o("onbekend", "Weet ik niet")] },
  {
    id: "Q06", step: 1, multi: true, text: "Welke documenten zijn beschikbaar?", help: "Meerdere antwoorden mogelijk.",
    showIf: (a) => has(a, "Q01", "koper") || has(a, "Q05", "mondeling", "geen", "onbekend"),
    options: [o("epc", "EPC"), o("keuring", "Elektrische keuring"), o("plannen", "Bouwplannen"), o("onderhoud", "Onderhoudsverslagen"), o("andere", "Andere"), o("geen", "Geen", undefined, undefined, true), o("onbekend", "Weet ik niet", undefined, undefined, true)],
  },
  { id: "Q07", step: 1, text: "Is een eerder hersteld probleem opnieuw opgedoken?", showIf: (a) => has(a, "Q04", ...RENOVATED), options: [o("nee", "Nee"), o("vocht", "Ja, vocht", "V", 7), o("dak", "Ja, dak", "B", 7), o("technieken", "Ja, technieken", "T", 7), o("anders", "Ja, iets anders")] },
  { id: "Q08", step: 1, text: "Wanneer werd het dak vernieuwd?", showIf: (a) => has(a, "Q04", "dak"), options: PERIOD },
  { id: "Q09", step: 1, text: "Wanneer werden de ramen vernieuwd?", showIf: (a) => has(a, "Q04", "ramen"), options: PERIOD },
  { id: "Q10", step: 1, text: "Wanneer werden elektriciteit of verwarming vernieuwd?", showIf: (a) => has(a, "Q04", "elektriciteit", "verwarming"), options: PERIOD },
  { id: "Q11", step: 1, text: "Welke gevelwerken werden uitgevoerd?", showIf: (a) => has(a, "Q04", "gevel"), options: [o("reiniging", "Reiniging"), o("voegwerk", "Voegwerk"), o("isolatie", "Gevelisolatie"), o("grondig", "Grondige gevelrenovatie"), o("onbekend", "Weet ik niet")] },
  { id: "Q12", step: 1, text: "Heeft de eerdere vochtbehandeling geholpen?", showIf: (a) => has(a, "Q07", "vocht"), options: [o("ja", "Ja", "V", 0), o("gedeeltelijk", "Gedeeltelijk", "V", 5), o("nee", "Nee", "V", 8), unk("V")] },
  { id: "Q13", step: 1, multi: true, text: "Welke isolatiewerken zijn uitgevoerd?", showIf: (a) => has(a, "Q04", "isolatie"), options: [o("dak", "Dak"), o("gevel", "Gevel"), o("vloer", "Vloer"), o("beglazing", "Beglazing"), o("andere", "Andere"), o("onbekend", "Weet ik niet", undefined, undefined, true)] },

  // STAP 2 — De zichtbare toestand
  {
    id: "Q14", step: 2, main: true, text: "Wat is de gekende toestand van het dak?",
    options: [o("geen", "Geen gekende problemen", "B", 0), o("oud", "Ouder dak zonder gekende problemen", "B", 3), o("slijtage", "Zichtbare slijtage", "B", 5), o("beschadigd", "Beschadigde onderdelen", "B", 7), o("lek", "Actieve lekkage", "V", 10), o("los", "Mogelijk gevaarlijk losse dakonderdelen", "B", 10), unk("B")],
  },
  { id: "Q15", step: 2, text: "Welke schade merkt u op?", showIf: (a) => has(a, "Q14", "slijtage", "beschadigd"), options: [o("bedekking", "Beschadigde dakbedekking", "B", 6), o("los", "Losse onderdelen", "B", 9), o("randen", "Problemen aan dakranden of aansluitingen", "B", 7), o("meerdere", "Meerdere signalen", "B", 9), unk("B")] },
  { id: "Q16", step: 2, text: "Zijn er vochtsporen onder het dak?", showIf: (a) => roofIssue(a), options: [o("nee", "Nee", "V", 0), o("oud", "Oude, droge sporen", "V", 3), o("recent", "Recente sporen na regen", "V", 8), o("actief", "Actieve waterinsijpeling", "V", 10), unk("V")] },
  { id: "Q17", step: 2, text: "Zijn de dakvlakken goed zichtbaar vanaf de grond?", showIf: (a) => has(a, "Q14", "oud", "slijtage", "beschadigd", "onbekend", "los", "lek"), options: [o("ja", "Ja"), o("gedeeltelijk", "Gedeeltelijk"), o("nauwelijks", "Nauwelijks"), o("onbekend", "Weet ik niet")] },
  { id: "Q19", step: 2, text: "Zijn er problemen met de dakgoten of regenafvoer?", showIf: (a) => roofIssue(a), options: [o("geen", "Geen gekende problemen", "B", 0), o("verstopt", "Regelmatig verstopt", "B", 3), o("lekkend", "Lekkende of beschadigde goten", "B", 7), o("overstromend", "Overstromende afvoer", "B", 8), unk("B")] },
  { id: "Q20", step: 2, main: true, text: "Wat is de toestand van de ramen?", options: [o("geen", "Geen gekende problemen", "B", 0), o("verouderd", "Verouderd", "B", 3), o("tocht", "Tocht of sluitproblemen", "B", 5), o("beschadigd", "Beschadigd", "B", 7), unk("B")] },
  { id: "Q21", step: 2, text: "Is er condens tussen de glasplaten?", showIf: (a) => has(a, "Q20", "verouderd", "tocht", "beschadigd"), options: [o("nee", "Nee", "B", 0), o("ja", "Ja", "B", 5), unk("B")] },
  { id: "Q22", step: 2, text: "Voelt u tocht langs gesloten ramen of deuren?", showIf: (a) => has(a, "Q20", "verouderd", "tocht"), options: [o("nee", "Nee", "B", 0), o("beperkt", "Beperkt", "B", 3), o("duidelijk", "Duidelijk", "B", 6), unk("B")] },
  {
    id: "Q24", step: 2, main: true, text: "Zijn er vocht-, schimmel- of waterproblemen?",
    options: [o("geen", "Geen gekende problemen", "V", 0), o("occasioneel", "Occasionele condensatie", "V", 2), o("terugkerend", "Terugkerende condens of schimmel", "V", 5), o("vochtplekken", "Vochtplekken", "V", 8), o("infiltratie", "Actieve waterinfiltratie", "V", 10), unk("V")],
  },
  { id: "Q25", step: 2, multi: true, text: "Waar merkt u dit probleem?", help: "Meerdere antwoorden mogelijk.", showIf: (a) => moistureReported(a), options: [o("zolder", "Dak of zolder"), o("buitenmuur", "Buitenmuur"), o("ramen", "Rond ramen"), o("badkamer", "Badkamer"), o("kelder", "Kelder"), o("meerdere", "Meerdere ruimtes")] },
  { id: "Q26", step: 2, text: "Hoe vaak komt het voor?", showIf: (a) => has(a, "Q24", "terugkerend", "vochtplekken", "infiltratie"), options: [o("eenmalig", "Eenmalig", "V", 2), o("afentoe", "Af en toe", "V", 4), o("regelmatig", "Regelmatig", "V", 7), o("voortdurend", "Vrijwel voortdurend", "V", 8)] },
  { id: "Q27", step: 2, text: "Wanneer treedt het probleem vooral op?", showIf: (a) => moistureReported(a), options: [o("regen", "Na regen"), o("koude", "In koude periodes"), o("douchen", "Na douchen of koken"), o("geenpatroon", "Geen duidelijk patroon")] },
  { id: "Q28", step: 2, text: "Komt er water in kelder of kruipruimte?", showIf: (a) => has(a, "Q25", "kelder"), options: [o("nee", "Nee", "V", 0), o("soms", "Soms na regen", "V", 7), o("regelmatig", "Regelmatig", "V", 8), o("actief", "Actieve waterinstroom", "V", 10), unk("V"), o("nvt", "Niet van toepassing")] },
  { id: "Q29", step: 2, text: "Hoe uitgebreid is de zichtbare schimmelvorming?", showIf: (a) => has(a, "Q24", "terugkerend"), options: [o("plaatselijk", "Plaatselijk", "V", 3), o("meerdere", "Meerdere plekken", "V", 6), o("ruimtes", "In verschillende ruimtes", "V", 8), unk("V")] },
  { id: "Q18", step: 2, text: "Hoe is de zichtbare toestand van de gevel?", showIf: (a) => has(a, "Q04", "gevel") || has(a, "Q25", "buitenmuur") || plans(a, "gevel"), options: [o("geen", "Geen gekende problemen", "B", 0), o("verwering", "Plaatselijke verwering", "B", 3), o("voegen", "Beschadigde voegen of afwerking", "B", 6), o("infiltratie", "Waterinfiltratie via gevel of aansluitingen", "V", 9), unk("B")] },
  { id: "Q23", step: 2, text: "Zijn er vochtplekken rond ramen of gevel na regen?", showIf: (a) => has(a, "Q25", "ramen", "buitenmuur") || has(a, "Q27", "regen"), options: [o("nee", "Nee", "V", 0), o("soms", "Soms", "V", 5), o("herhaaldelijk", "Herhaaldelijk", "V", 8), unk("V")] },
  { id: "Q30", step: 2, main: true, text: "Zijn er scheuren of vervormingen?", options: [o("geen", "Geen gekende problemen", "S", 0), o("haar", "Kleine, volgens u stabiele haarscheuren", "S", 2), o("onverklaard", "Onverklaarde scheuren", "S", 6), o("groot", "Grote of toenemende scheuren", "S", 10), unk("S")] },
  { id: "Q31", step: 2, text: "Zijn de scheuren groter geworden?", showIf: (a) => has(a, "Q30", "onverklaard", "groot"), options: [o("nee", "Niet voor zover bekend", "S", 2), o("onzeker", "Onzeker", "S", null), o("groter", "Duidelijk groter", "S", 10)] },
  { id: "Q32", step: 2, text: "Zijn vloeren opvallend verzakt of vervormd?", showIf: (a) => has(a, "Q30", "groot") || has(a, "Q31", "groter"), options: [o("nee", "Nee", "S", 0), o("licht", "Mogelijk licht", "S", 5), o("duidelijk", "Duidelijk", "S", 9), unk("S")] },
  { id: "Q33", step: 2, text: "Klemmen ramen of deuren zonder duidelijke oorzaak?", showIf: (a) => has(a, "Q30", "onverklaard", "groot"), options: [o("nee", "Nee", "S", 0), o("ja", "Ja", "S", 4), unk("S")] },

  // STAP 3 — Energie en installaties
  { id: "Q34", step: 3, main: true, text: "Wat is het EPC-label?", help: "Het EPC-label is context voor de energieprestatie, geen volledige bouwtechnische beoordeling.", options: [o("ab", "A+, A of B", "E", 0), o("c", "C", "E", 2), o("d", "D", "E", 4), o("e", "E", "E", 7), o("f", "F", "E", 9), unk("E")] },
  { id: "Q35", step: 3, text: "Hoe oud is het EPC?", showIf: (a) => has(a, "Q34", "ab", "c", "d", "e", "f"), options: [o("lt5", "Minder dan 5 jaar"), o("5-10", "5 tot 10 jaar"), o("ouder", "Ouder"), o("onbekend", "Weet ik niet")] },
  { id: "Q36", step: 3, text: "Hoe is de woning geïsoleerd?", showIf: (a) => has(a, "Q34", "d", "e", "f", "onbekend") || has(a, "Q03", "voor1970", "1970-1990") || plans(a, "isolatie"), options: [o("degelijk", "Recent of aantoonbaar degelijk", "E", 0), o("gedeeltelijk", "Gedeeltelijk", "E", 3), o("weinig", "Weinig of niet", "E", 7), unk("E")] },
  { id: "Q37", step: 3, text: "Ervaart u temperatuurproblemen?", showIf: (a) => has(a, "Q34", "e", "f", "onbekend") || has(a, "Q36", "gedeeltelijk", "weinig", "onbekend"), options: [o("nee", "Nee", "E", 0), o("kamers", "Bepaalde kamers zijn moeilijk warm", "E", 3), o("sterk", "Sterke koude of oververhitting", "E", 5), unk("E")] },
  { id: "Q38", step: 3, text: "Waar ervaart u de meeste comfortproblemen?", showIf: (a) => has(a, "Q37", "kamers", "sterk"), options: [o("dak", "Dakverdieping"), o("leef", "Leefruimte"), o("slaap", "Slaapkamers"), o("heel", "Hele woning"), o("wisselend", "Wisselend")] },
  { id: "Q39", step: 3, text: "Hoe is de ventilatie?", showIf: (a) => has(a, "Q24", "occasioneel", "terugkerend", "vochtplekken") || plans(a, "isolatie") || plans(a, "ramen"), options: [o("normaal", "Functioneert normaal voor zover bekend", "T", 0), o("beperkt", "Beperkt of onduidelijk", "T", 3), o("defect", "Defect of duidelijk onvoldoende", "T", 7), unk("T")] },
  { id: "Q40", step: 3, main: true, text: "Wat weet u over de elektriciteit?", options: [o("gunstig", "Recent gunstig keuringsresultaat", "T", 0), o("gedateerd", "Gedateerd, zonder gekende problemen", "T", 3), o("zekeringen", "Regelmatig uitvallende zekeringen", "T", 6), o("beschadigd", "Beschadigde onderdelen", "T", 9), o("rook", "Rook, vonken of brandlucht", "T", 10), unk("T")] },
  { id: "Q41", step: 3, text: "Zijn er opmerkingen in het elektrische keuringsverslag?", showIf: (a) => has(a, "Q40", "gedateerd", "zekeringen", "beschadigd") || has(a, "Q06", "keuring"), options: [o("geen", "Geen gekende opmerkingen", "T", 0), o("beperkt", "Beperkte opmerkingen", "T", 4), o("belangrijk", "Belangrijke inbreuken", "T", 8), o("ontbreekt", "Verslag ontbreekt", "T", null), unk("T")] },
  { id: "Q42", step: 3, main: true, text: "Wat is de toestand van de verwarming?", options: [o("normaal", "Functioneert normaal", "T", 0), o("ouder", "Ouder maar functionerend", "T", 3), o("storingen", "Regelmatige storingen", "T", 7), o("gas", "Gaslucht of CO-alarm", "T", 10), unk("T")] },
  { id: "Q43", step: 3, text: "Is er momenteel een CO-alarm of vermoeden van een gaslek?", showIf: (a) => has(a, "Q42", "gas"), options: [o("nee", "Nee"), o("ja", "Ja")] },
  { id: "Q44", step: 3, text: "Is de verwarming recent onderhouden?", showIf: (a) => has(a, "Q42", "ouder", "storingen"), options: [o("ja", "Ja"), o("nee", "Nee"), o("onbekend", "Weet ik niet")] },
  { id: "Q45", step: 3, text: "Zijn er problemen met sanitair of afvoer?", showIf: (a) => has(a, "Q25", "badkamer") || has(a, "Q04", "sanitair") || has(a, "Q42", "onbekend") || has(a, "Q40", "onbekend"), options: [o("geen", "Geen gekende problemen", "T", 0), o("verstopping", "Occasionele verstopping", "T", 3), o("terugkerend", "Terugkerende lekkage of rioolgeur", "T", 7), o("actief", "Actieve lekkage", "T", 9), unk("T")] },

  // STAP 4 — Uw renovatieplannen
  {
    id: "Q46", step: 4, main: true, multi: true, text: "Welke werken overweegt u?", help: "Meerdere antwoorden mogelijk.",
    options: [o("geen", "Geen concrete werken", undefined, undefined, true), o("dak", "Dak"), o("ramen", "Ramen"), o("gevel", "Gevel"), o("isolatie", "Isolatie"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Verwarming"), o("sanitair", "Sanitair"), o("vloeren", "Vloeren"), o("interieur", "Interieur"), o("volledig", "Volledige renovatie")],
  },
  { id: "Q47", step: 4, text: "Wilt u de verschillende werken in een logische volgorde plannen?", showIf: (a) => plannedCount(a) >= 2 || has(a, "Q46", "volledig"), options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel")] },
  { id: "Q48", step: 4, main: true, text: "Wilt u weten hoeveel uw renovatie ongeveer kan kosten?", options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel")] },
  { id: "Q49", step: 4, main: true, text: "Wanneer wilt u beslissen of starten?", options: [o("2w", "Binnen twee weken"), o("3m", "Binnen drie maanden"), o("later", "Later"), o("onbekend", "Weet ik niet")] },
  { id: "Q50", step: 4, text: "Wilt u moeilijk zichtbare delen van het dak beter laten beoordelen?", showIf: (a) => has(a, "Q14", "oud", "slijtage", "beschadigd", "los", "onbekend") || has(a, "Q17", "gedeeltelijk", "nauwelijks") || plans(a, "dak"), options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel"), o("nvt", "Niet van toepassing")] },
];

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const STEP_TITLES = ["Uw woning", "De zichtbare toestand", "Energie en installaties", "Uw renovatieplannen"];

/** Geldige antwoorden filteren op toegestane opties en exclusieve keuzes. */
function sanitize(q: Question, v: unknown): string | string[] | undefined {
  const ids = new Set(q.options.map((x) => x.id));
  if (q.multi) {
    if (!Array.isArray(v)) return undefined;
    const vals = [...new Set(v.filter((x): x is string => typeof x === "string" && ids.has(x)))];
    if (!vals.length) return undefined;
    const excl = vals.filter((x) => q.options.find((op) => op.id === x)?.exclusive);
    if (excl.length) return vals.length === 1 ? vals : undefined;
    return vals;
  }
  return typeof v === "string" && ids.has(v) ? v : undefined;
}

/** Zichtbare vragen in volgorde, op basis van enkel actieve (zichtbare) antwoorden. */
export function visibleQuestions(answers: Answers): Question[] {
  const active: Answers = {};
  const out: Question[] = [];
  for (const q of QUESTIONS) {
    if (q.showIf && !q.showIf(active)) continue;
    out.push(q);
    const v = sanitize(q, answers[q.id]);
    if (v !== undefined) active[q.id] = v;
  }
  return out;
}

/** Alleen beantwoorde, toepasselijke vragen. Vervallen vervolgvragen verdwijnen. */
export function activeAnswers(answers: Answers): Answers {
  const active: Answers = {};
  for (const q of QUESTIONS) {
    if (q.showIf && !q.showIf(active)) continue;
    const v = sanitize(q, answers[q.id]);
    if (v !== undefined) active[q.id] = v;
  }
  return active;
}

export function isComplete(answers: Answers): boolean {
  const a = activeAnswers(answers);
  return visibleQuestions(a).every((q) => a[q.id] !== undefined);
}

// ---------- Veiligheid ----------
export type SafetyId = "SAFE-01" | "SAFE-02" | "SAFE-03" | "SAFE-04" | "SAFE-05";
export const SAFETY_TEXT: Record<SafetyId, { title: string; text: string }> = {
  "SAFE-01": { title: "Mogelijk gas- of CO-gevaar", text: "Ruikt u gas of gaat een CO-alarm af? Verlaat de woning veilig, laat ramen en deuren open als dat zonder risico kan, gebruik geen schakelaars of open vuur, en contacteer onmiddellijk de storingsdienst van uw netbeheerder of de hulpdiensten (112). Wacht hiervoor niet op een inspectie." },
  "SAFE-02": { title: "Mogelijk gevaar aan de elektrische installatie", text: "Rook, vonken of brandlucht kunnen wijzen op een gevaarlijke situatie. Schakel de installatie alleen uit als dat veilig kan, en contacteer een erkend elektricien of bij acuut gevaar de hulpdiensten (112). Voer zelf geen herstellingen uit." },
  "SAFE-03": { title: "Constructieve signalen: laat dit prioritair beoordelen", text: "Grote, nieuwe of toenemende scheuren of duidelijke vervormingen verdienen een prioritaire beoordeling door een geschikte deskundige, zoals een ingenieur of architect. De Quickscan kan geen uitspraak doen over de stabiliteit." },
  "SAFE-04": { title: "Actieve waterinfiltratie", text: "Laat actieve waterinfiltratie tijdig controleren en neem waar mogelijk maatregelen om verdere schade te beperken, zoals het beschermen van inboedel en afwerking." },
  "SAFE-05": { title: "Mogelijk losse dakonderdelen", text: "Houd afstand van de zone onder het dak en schakel passende deskundige hulp in. Betreed het dak niet zelf." },
};

export function safetyFlags(a: Answers): SafetyId[] {
  const f: SafetyId[] = [];
  if (has(a, "Q42", "gas") || has(a, "Q43", "ja")) f.push("SAFE-01");
  if (has(a, "Q40", "rook")) f.push("SAFE-02");
  if (has(a, "Q30", "groot") || has(a, "Q31", "groter") || has(a, "Q32", "duidelijk")) f.push("SAFE-03");
  if (has(a, "Q14", "lek") || has(a, "Q16", "actief") || has(a, "Q24", "infiltratie") || has(a, "Q28", "actief") || has(a, "Q45", "actief")) f.push("SAFE-04");
  if (has(a, "Q14", "los") || has(a, "Q15", "los")) f.push("SAFE-05");
  return f;
}

// ---------- Barometer ----------
export const CATEGORIES = [
  { id: "beperkt", label: "Beperkte renovatiesignalen", text: "Op basis van uw antwoorden zijn er weinig signalen gemeld. Dat is geen bewijs dat alle onderdelen in orde zijn." },
  { id: "enkele", label: "Enkele aandachtspunten", text: "U meldt enkele signalen die een gerichte beoordeling verdienen." },
  { id: "verhoogd", label: "Verhoogde renovatiesignalen", text: "U meldt meerdere of duidelijke signalen. Een verdere beoordeling helpt om prioriteiten te bepalen." },
  { id: "prioritair", label: "Prioritaire beoordeling aanbevolen", text: "U meldt ernstige of veiligheidsrelevante signalen. Laat deze onderdelen tijdig beoordelen." },
] as const;
export const INSUFFICIENT = { id: "onvoldoende", label: "Onvoldoende informatie", text: "Onvoldoende informatie voor een algemene renovatie-indicatie." } as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"] | "onvoldoende";

export type DomainScores = Record<Domain, number | null>;

export function domainScores(a: Answers): DomainScores {
  const s: DomainScores = { B: null, V: null, E: null, T: null, S: null };
  for (const [qid, v] of Object.entries(a)) {
    const q = QUESTION_MAP[qid];
    if (!q) continue;
    for (const id of Array.isArray(v) ? v : [v]) {
      const sc = q.options.find((x) => x.id === id)?.score;
      if (!sc) continue;
      s[sc.d] = Math.max(s[sc.d] ?? 0, sc.v);
    }
  }
  return s;
}

const MAIN_TECH: Record<Domain, string[]> = { B: ["Q14", "Q20"], V: ["Q24"], E: ["Q34"], T: ["Q40", "Q42"], S: ["Q30"] };

function knownMain(a: Answers, qid: string): boolean {
  const v = a[qid];
  if (v === undefined) return false;
  const sc = QUESTION_MAP[qid].options.find((x) => x.id === v)?.score;
  return sc !== null && sc !== undefined;
}

export function coverage(a: Answers): { weighted: number; unknownDomains: Domain[] } {
  let w = 0;
  const unknownDomains: Domain[] = [];
  const ds = domainScores(a);
  for (const d of DOMAINS) {
    const qs = MAIN_TECH[d.code];
    const k = qs.filter((q) => knownMain(a, q)).length;
    w += d.weight * (k / qs.length);
    if (ds[d.code] === null) unknownDomains.push(d.code);
  }
  return { weighted: Math.round(w * 100) / 100, unknownDomains };
}

export function barometer(a: Answers) {
  const ds = domainScores(a);
  const flags = safetyFlags(a);
  let num = 0;
  let den = 0;
  for (const d of DOMAINS) {
    const v = ds[d.code];
    if (v === null) continue;
    num += d.weight * (v / 10);
    den += d.weight;
  }
  const score = den > 0 ? Math.round((100 * num) / den) : null;
  const cov = coverage(a);
  const insufficient = score === null || cov.weighted < 0.6 || cov.unknownDomains.length >= 3;
  let idx = score === null ? 0 : score < 20 ? 0 : score < 40 ? 1 : score < 65 ? 2 : 3;
  const max = Math.max(0, ...Object.values(ds).map((v) => v ?? 0));
  if (max >= 7) idx = Math.max(idx, 1);
  if (max >= 9) idx = Math.max(idx, 2);
  if (flags.length) idx = Math.max(idx, 2);
  if (flags.some((f) => f === "SAFE-01" || f === "SAFE-02" || f === "SAFE-03")) idx = 3;
  const strongSignal = flags.length > 0 || max >= 9;
  // Bij onvoldoende informatie geen schijnnauwkeurige categorie, tenzij ernstige signalen voorrang hebben.
  const category = insufficient && !strongSignal ? INSUFFICIENT : CATEGORIES[idx];
  return { score, category, level: insufficient && !strongSignal ? null : idx, domainScores: ds, coverage: cov, flags };
}

// ---------- Aandachtspunten ----------
interface PointDef {
  id: string;
  domain: Domain;
  title: string;
  text: string;
  next: string;
  active?: boolean;
  safety?: SafetyId;
  sev: (a: Answers) => number;
}
const sc = (a: Answers, qid: string): number => {
  const v = a[qid];
  if (v === undefined) return 0;
  const q = QUESTION_MAP[qid];
  return Math.max(0, ...(Array.isArray(v) ? v : [v]).map((id) => q.options.find((x) => x.id === id)?.score?.v ?? 0));
};
const when = (cond: boolean, n: number) => (cond ? n : 0);

export const POINTS: PointDef[] = [
  { id: "AP-DAK-LOS", domain: "B", safety: "SAFE-05", title: "Mogelijk losse dakonderdelen", text: "U vermeldt mogelijk losse dakonderdelen. Dit vraagt om een tijdige beoordeling door een geschikte vakpersoon.", next: "Houd afstand en laat het dak zo snel mogelijk deskundig bekijken.", sev: (a) => when(has(a, "Q14", "los") || has(a, "Q15", "los"), 10) },
  { id: "AP-VOCHT-REGEN", domain: "V", active: true, safety: "SAFE-04", title: "Vocht tijdens of na regen", text: "U merkt vochtsporen op tijdens of na regen. Dit maakt een gerichte beoordeling van de mogelijke oorzaken van waterinfiltratie aangewezen.", next: "Laat de mogelijke infiltratieroute (dak, aansluitingen, gevel of goten) gericht beoordelen.", sev: (a) => Math.max(when(has(a, "Q14", "lek"), 10), sc(a, "Q16") >= 8 ? sc(a, "Q16") : 0, sc(a, "Q23") >= 5 ? sc(a, "Q23") : 0, when(has(a, "Q18", "infiltratie"), 9), when(has(a, "Q27", "regen") && moistureReported(a), sc(a, "Q24"))) },
  { id: "AP-SCHEUR-TOENAME", domain: "S", safety: "SAFE-03", active: true, title: "Toenemende scheuren", text: "U geeft aan dat scheuren groter worden of dat er duidelijke vervormingen zijn. Een tijdige beoordeling door een geschikte deskundige is aangewezen.", next: "Laat de scheuren prioritair beoordelen door een ingenieur of architect.", sev: (a) => Math.max(when(has(a, "Q30", "groot") || has(a, "Q31", "groter"), 10), when(has(a, "Q32", "duidelijk"), 9)) },
  { id: "AP-ELEK", domain: "T", safety: "SAFE-02", title: "Elektrische installatie", text: "U vermeldt aandachtspunten bij de elektrische installatie. Het is aangewezen deze informatie te vergelijken met eventuele keuringsverslagen en indien nodig een bevoegde vakpersoon te raadplegen.", next: "Laat de installatie nakijken door een erkend elektricien.", sev: (a) => Math.max(sc(a, "Q40") >= 6 ? sc(a, "Q40") : 0, sc(a, "Q41") >= 4 ? sc(a, "Q41") : 0) },
  { id: "AP-VERW", domain: "T", safety: "SAFE-01", title: "Verwarming", text: "U geeft aan dat de verwarmingsinstallatie verouderd is of problemen vertoont. Een gerichte controle kan helpen om onderhoud, herstel of vervanging beter af te wegen.", next: "Laat de installatie controleren en onderhouden door een erkend technicus.", sev: (a) => (sc(a, "Q42") >= 3 ? sc(a, "Q42") : 0) },
  { id: "AP-VOCHT-TERUG", domain: "V", active: true, title: "Terugkerend vocht", text: "U geeft aan dat een eerder behandeld vochtprobleem opnieuw optreedt. Het is verstandig om de mogelijke oorzaak opnieuw te laten onderzoeken voordat herstelwerken worden herhaald.", next: "Laat eerst de oorzaak onderzoeken voordat u opnieuw herstelt.", sev: (a) => Math.max(when(has(a, "Q07", "vocht"), 7), sc(a, "Q12")) },
  { id: "AP-KELDER", domain: "V", active: true, title: "Keldervocht", text: "U vermeldt vochtproblemen in de kelder. De omstandigheden waarin het probleem ontstaat kunnen helpen bepalen welke onderdelen nader onderzocht moeten worden.", next: "Noteer wanneer het water verschijnt; dat helpt bij een gerichte beoordeling.", sev: (a) => sc(a, "Q28") },
  { id: "AP-VOCHTPLEKKEN", domain: "V", active: true, title: "Vochtplekken", text: "U vermeldt vochtplekken of waterinfiltratie in de woning. De herkomst van het vocht bepaalt welke aanpak zinvol is; dat vraagt een beoordeling ter plaatse.", next: "Laat de oorzaak beoordelen vóór u afwerkingen herstelt.", sev: (a) => (has(a, "Q24", "vochtplekken", "infiltratie") ? Math.max(sc(a, "Q24"), sc(a, "Q26")) : 0) },
  { id: "AP-SCHIMMEL", domain: "V", active: true, title: "Schimmel of condens", text: "U vermeldt terugkerende condens of schimmel. Ventilatie, vochtbelasting, oppervlaktetemperaturen en andere mogelijke oorzaken moeten in samenhang worden bekeken.", next: "Bekijk ventilatie en isolatie samen met het vochtprobleem.", sev: (a) => (has(a, "Q24", "terugkerend") ? Math.max(5, sc(a, "Q29")) : 0) },
  { id: "AP-DAK-SLIJTAGE", domain: "B", title: "Dakslijtage", text: "U geeft aan dat het dak zichtbare slijtage of beschadiging vertoont. Een gerichte controle van de dakbedekking en aansluitingen kan helpen om de nodige vervolgstappen beter te bepalen.", next: "Laat de dakbedekking en aansluitingen gericht controleren.", sev: (a) => (has(a, "Q14", "slijtage", "beschadigd") ? Math.max(sc(a, "Q14"), sc(a, "Q15")) : 0) },
  { id: "AP-DAK-TERUG", domain: "B", active: true, title: "Terugkerend dakprobleem", text: "U geeft aan dat een eerder hersteld dakprobleem opnieuw optreedt. Het is zinvol de oorzaak opnieuw te laten bekijken voordat dezelfde herstelling herhaald wordt.", next: "Laat het dak opnieuw gericht beoordelen.", sev: (a) => when(has(a, "Q07", "dak"), 7) },
  { id: "AP-GOTEN", domain: "B", title: "Dakgoten en regenafvoer", text: "U vermeldt problemen met dakgoten of regenafvoer. Een goed werkende afvoer beschermt dak, gevel en fundering tegen vocht.", next: "Laat goten en afvoeren nakijken en waar nodig herstellen.", sev: (a) => (sc(a, "Q19") >= 7 ? sc(a, "Q19") : 0) },
  { id: "AP-SANITAIR", domain: "T", active: true, title: "Sanitair en afvoer", text: "U vermeldt terugkerende problemen met sanitair of afvoer. Een verdere beoordeling kan nuttig zijn, zeker wanneer ook andere renovatiewerken gepland zijn.", next: "Laat leidingen en afvoeren bekijken vóór nieuwe afwerkingen.", sev: (a) => (sc(a, "Q45") >= 7 ? sc(a, "Q45") : 0) },
  { id: "AP-TECH-TERUG", domain: "T", active: true, title: "Terugkerend technisch probleem", text: "U geeft aan dat een eerder hersteld technisch probleem opnieuw optreedt. Een gerichte controle helpt om de oorzaak te achterhalen.", next: "Laat de betrokken installatie opnieuw nakijken.", sev: (a) => when(has(a, "Q07", "technieken"), 7) },
  { id: "AP-EPC", domain: "E", title: "Energieprestatie (EPC E/F)", text: "Het opgegeven EPC-label wijst op mogelijke kansen voor energetische verbetering. Welke ingrepen zinvol zijn, hangt af van de bestaande isolatie, technieken en renovatieplannen.", next: "Bekijk isolatie, beglazing en verwarming als één geheel.", sev: (a) => (has(a, "Q34", "e", "f") ? sc(a, "Q34") : 0) },
  { id: "AP-ISOLATIE", domain: "E", title: "Beperkte isolatie", text: "U geeft aan dat de woning weinig of niet geïsoleerd is. De volgorde van isolatiewerken en hun aansluiting op ramen, dak en ventilatie verdienen aandacht.", next: "Laat bepalen welke isolatiewerken het meest zinvol zijn en in welke volgorde.", sev: (a) => (has(a, "Q36", "weinig") ? 7 : 0) },
  { id: "AP-SCHEUR", domain: "S", title: "Scheurvorming", text: "U meldt scheurvorming in de woning. De ligging, afmetingen en eventuele evolutie verdienen verdere beoordeling. De Quickscan kan de oorzaak niet vaststellen.", next: "Noteer en fotografeer de scheuren zodat de evolutie opgevolgd kan worden.", sev: (a) => (has(a, "Q30", "onverklaard") && !has(a, "Q31", "groter") ? 6 : 0) },
  { id: "AP-VENT", domain: "T", title: "Ventilatie", text: "U geeft aan dat de ventilatie beperkt, onduidelijk of defect is. Ventilatie speelt een rol bij binnenluchtkwaliteit en vochtbeheersing.", next: "Laat de ventilatie beoordelen, zeker bij isolatie- of raamwerken.", sev: (a) => (sc(a, "Q39") >= 3 ? sc(a, "Q39") + (moistureReported(a) ? 1 : 0) : 0) },
  { id: "AP-CONDENS-GLAS", domain: "B", title: "Condens tussen glasplaten", text: "U vermeldt condens tussen de glasplaten. Dit kan wijzen op een probleem met de beglazing dat nader beoordeeld moet worden.", next: "Laat de beglazing nakijken.", sev: (a) => when(has(a, "Q21", "ja"), 5) },
  { id: "AP-TOCHT", domain: "B", title: "Tocht", text: "U ervaart tocht langs gesloten ramen of deuren. De aansluitingen, dichtingen en algemene toestand van het schrijnwerk verdienen mogelijk extra aandacht.", next: "Laat dichtingen en aansluitingen van het schrijnwerk bekijken.", sev: (a) => Math.max(when(has(a, "Q20", "tocht"), 5), sc(a, "Q22") >= 3 ? sc(a, "Q22") : 0) },
  { id: "AP-RAMEN-OUD", domain: "B", title: "Verouderde ramen", text: "U vermeldt dat uw ramen verouderd of beschadigd zijn. De werkelijke toestand, luchtdichtheid en beglazing bepalen of onderhoud, herstel of vervanging zinvol kan zijn.", next: "Laat de toestand van het schrijnwerk beoordelen vóór u kiest voor vervanging.", sev: (a) => (has(a, "Q20", "verouderd", "beschadigd") ? sc(a, "Q20") : 0) },
  { id: "AP-GEVEL", domain: "B", title: "Gevel", text: "U vermeldt verwering of beschadigde voegen of afwerking aan de gevel. Een gerichte beoordeling helpt bepalen of onderhoud of herstel nodig is.", next: "Laat de gevel en aansluitingen bekijken.", sev: (a) => (has(a, "Q18", "verwering", "voegen") ? sc(a, "Q18") : 0) },
  { id: "AP-COMFORT", domain: "E", title: "Thermisch comfort", text: "U ervaart temperatuurproblemen in bepaalde ruimtes. Isolatie, beglazing, zonwering, ventilatie en verwarming zijn mogelijke aandachtspunten voor verdere beoordeling.", next: "Bekijk comfortproblemen samen met isolatie en verwarming.", sev: (a) => sc(a, "Q37") },
  { id: "AP-HERHAALD-ANDERS", domain: "B", title: "Terugkerend probleem", text: "U geeft aan dat een eerder hersteld probleem opnieuw optreedt. Omdat het betrokken onderdeel niet gekend is, vormt dit een algemeen aandachtspunt.", next: "Bespreek het probleem tijdens een beoordeling ter plaatse.", sev: (a) => when(has(a, "Q07", "anders"), 4) },
];

export const DOMAIN_HEADLINE: Record<Domain, string> = {
  B: "Dak, gevel en schrijnwerk verdienen extra aandacht.",
  V: "Vocht en waterdichtheid verdienen extra aandacht.",
  E: "Energie en isolatie verdienen extra aandacht.",
  T: "De technische installaties verdienen extra aandacht.",
  S: "Scheuren en vervormingen verdienen extra aandacht.",
};

export interface AttentionPoint { id: string; domain: Domain; title: string; text: string; next: string; severity: number; safety: boolean }

export function attentionPoints(a: Answers, limit = 3): AttentionPoint[] {
  const flags = safetyFlags(a);
  const list = POINTS.map((p, order) => ({ p, order, sev: p.sev(a) }))
    .filter((x) => x.sev >= 3)
    .map((x) => ({ ...x, safe: !!x.p.safety && flags.includes(x.p.safety) }))
    .sort((x, y) => Number(y.safe) - Number(x.safe) || y.sev - x.sev || Number(!!y.p.active) - Number(!!x.p.active) || x.order - y.order);
  // Overlappende signalen samenvoegen: per domein maximaal één vochtpunt.
  const out: AttentionPoint[] = [];
  let vocht = false;
  for (const x of list) {
    if (x.p.domain === "V") {
      if (vocht) continue;
      vocht = true;
    }
    out.push({ id: x.p.id, domain: x.p.domain, title: x.p.title, text: x.p.text, next: x.p.next, severity: x.sev, safety: x.safe });
    if (out.length >= limit) break;
  }
  return out;
}

// ---------- Informatiezekerheid ----------
const UNKNOWN_DEFS: { id: string; label: string; q: string; ids: string[] }[] = [
  { id: "UNK-DAK", label: "de toestand van het dak", q: "Q14", ids: ["onbekend"] },
  { id: "UNK-RAMEN", label: "de toestand van de ramen", q: "Q20", ids: ["onbekend"] },
  { id: "UNK-VOCHT", label: "mogelijke vochtproblemen", q: "Q24", ids: ["onbekend"] },
  { id: "UNK-SCHEUR", label: "scheuren of vervormingen", q: "Q30", ids: ["onbekend"] },
  { id: "UNK-EPC", label: "het EPC-label", q: "Q34", ids: ["onbekend"] },
  { id: "UNK-ISOLATIE", label: "de isolatie", q: "Q36", ids: ["onbekend"] },
  { id: "UNK-ELEK", label: "de elektrische installatie", q: "Q40", ids: ["onbekend"] },
  { id: "UNK-KEURING", label: "het elektrische keuringsverslag", q: "Q41", ids: ["ontbreekt", "onbekend"] },
  { id: "UNK-VERW", label: "de verwarming", q: "Q42", ids: ["onbekend"] },
  { id: "UNK-VENT", label: "de ventilatie", q: "Q39", ids: ["onbekend"] },
  { id: "UNK-SANITAIR", label: "sanitair en afvoer", q: "Q45", ids: ["onbekend"] },
  { id: "UNK-BOUWJAAR", label: "het bouwjaar", q: "Q03", ids: ["onbekend"] },
];

export function unknownInformation(a: Answers) {
  const items = UNKNOWN_DEFS.filter((u) => has(a, u.q, ...u.ids)).map(({ id, label }) => ({ id, label }));
  const mainUnknown = ["Q14", "Q20", "Q24", "Q30", "Q34", "Q40", "Q42"].filter((q) => has(a, q, "onbekend")).length;
  const level = mainUnknown <= 1 ? "uitgebreid" : mainUnknown <= 3 ? "gedeeltelijk" : "beperkt";
  const LEVELS = {
    uitgebreid: { label: "Uitgebreide informatie", text: "Het merendeel van de relevante hoofdonderdelen is op basis van uw antwoorden voldoende beschreven voor een eerste indicatie." },
    gedeeltelijk: { label: "Gedeeltelijke informatie", text: "Enkele belangrijke gegevens ontbreken." },
    beperkt: { label: "Beperkte informatie", text: "Meerdere belangrijke bouwdelen of installaties zijn onbekend." },
  } as const;
  const shown = items.slice(0, 4);
  const sentence = shown.length
    ? `Over ${joinNl(shown.map((s) => s.label))} ontbreken nog gegevens. Daardoor blijft de beoordeling van ${shown.length > 1 ? "deze onderdelen" : "dit onderdeel"} beperkt. Onbekende informatie betekent niet dat een onderdeel defect is.`
    : "";
  return { level, ...LEVELS[level], items: shown, sentence };
}

function joinNl(xs: string[]) {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} en ${xs[xs.length - 1]}`;
}

// ---------- Combinaties ----------
export const COMBINATIONS = [
  { id: "COM-01", title: "Dak en isolatie", text: "Bereid dakwerken en dakisolatie samen voor, zodat u het dak maar één keer moet openen.", test: (a: Answers) => plans(a, "dak") && plans(a, "isolatie") },
  { id: "COM-02", title: "Ramen en gevel", text: "Stem de raamaansluitingen en de gevelafwerking of gevelisolatie op elkaar af.", test: (a: Answers) => plans(a, "ramen") && (plans(a, "gevel") || plans(a, "isolatie")) },
  { id: "COM-03", title: "Isolatie en ventilatie", text: "Beoordeel ventilatie en luchtdichtheid samen wanneer u isoleert.", test: (a: Answers) => plans(a, "isolatie") && (has(a, "Q39", "beperkt", "defect", "onbekend") || has(a, "Q24", "terugkerend", "occasioneel")) },
  { id: "COM-04", title: "Verwarming en isolatie", text: "Laat de toekomstige warmtebehoefte beoordelen vóór u een nieuwe installatie kiest.", test: (a: Answers) => plans(a, "verwarming") && plans(a, "isolatie") },
  { id: "COM-05", title: "Vocht en binnenafwerking", text: "Onderzoek eerst de mogelijke vochtoorzaak, vóór definitieve afwerking.", test: (a: Answers) => (domainScores(a).V ?? 0) >= 5 && (plans(a, "interieur") || plans(a, "vloeren")) },
  { id: "COM-06", title: "Elektriciteit en binnenrenovatie", text: "Plan elektrische aanpassingen vóór nieuwe wand- en vloerafwerkingen.", test: (a: Answers) => plans(a, "elektriciteit") && (plans(a, "interieur") || plans(a, "vloeren")) },
  { id: "COM-07", title: "Sanitair en vloeren", text: "Bekijk leidingen en afvoeren vóór de vloerafwerking.", test: (a: Answers) => plans(a, "sanitair") && plans(a, "vloeren") },
  { id: "COM-08", title: "Buitenschil als geheel", text: "Bereid dak, gevel en schrijnwerk voor als één samenhangend geheel.", test: (a: Answers) => ["dak", "gevel", "ramen"].filter((w) => plans(a, w)).length >= 2 },
];

export function combinationAdvice(a: Answers) {
  return COMBINATIONS.filter((c) => c.test(a)).slice(0, 2).map(({ id, title, text }) => ({ id, title, text }));
}

// ---------- Pakket- en droneadvies (los van de barometer) ----------
export const PACKAGE_ADVICE = {
  basis: "U wilt vooral meer inzicht in de zichtbare bouwtechnische toestand van uw woning. Daarom kan Woningscan Basis een passende volgende stap zijn. Tijdens een bezoek ter plaatse beoordeelt DIMAC de woning visueel aan de hand van 25 bouwtechnische aandachtspunten. U ontvangt een beknopt rapport met bevindingen en prioriteiten.",
  compleet: "U overweegt verschillende renovatiewerken en wilt ook inzicht in de mogelijke investering. Daarom kan Woningscan Compleet een passende vervolgstap zijn. Dit pakket combineert een uitgebreidere visuele woninginspectie met fotodocumentatie, renovatieplanning en een indicatieve renovatiekostenraming.",
  twijfel: "Twijfelt u nog? Woningscan Basis is een goede eerste stap. Compleet is relevant wanneer u ook een renovatieplanning en een indicatie van de kosten wenst.",
};

export function packageAdvice(a: Answers): { pkg: "basis" | "compleet"; text: string; doubt: boolean } {
  const many = plannedCount(a) >= 2 || has(a, "Q46", "volledig");
  const compleet = has(a, "Q48", "ja") || (has(a, "Q47", "ja") && many && !has(a, "Q48", "nee"));
  if (compleet) return { pkg: "compleet", text: PACKAGE_ADVICE.compleet, doubt: false };
  const doubt = has(a, "Q48", "twijfel") || has(a, "Q47", "twijfel");
  return { pkg: "basis", text: PACKAGE_ADVICE.basis, doubt };
}

export const DRONE_ADVICE = "Omdat u aandachtspunten aan het dak vermeldt, kan een aanvullende drone-dakscreening nuttig zijn om zichtbare dakonderdelen vanuit de lucht te bekijken. De uitvoering is afhankelijk van de plaatselijke situatie, weersomstandigheden en toepasselijke regelgeving.";

export function droneAdvice(a: Answers): boolean {
  if (has(a, "Q50", "nvt")) return false;
  const damage = has(a, "Q14", "slijtage", "beschadigd", "los") || has(a, "Q15", "bedekking", "los", "randen", "meerdere");
  const hidden = has(a, "Q17", "gedeeltelijk", "nauwelijks");
  if (has(a, "Q50", "nee") && !damage) return false;
  return damage || hidden || has(a, "Q50", "ja") || (has(a, "Q50", "twijfel") && has(a, "Q14", "onbekend"));
}

// ---------- Rapport ----------
const LABEL = (qid: string, v: string | string[] | undefined) => {
  if (v === undefined) return "Niet ingevuld";
  const q = QUESTION_MAP[qid];
  return (Array.isArray(v) ? v : [v]).map((id) => q.options.find((x) => x.id === id)?.label ?? id).join(", ");
};

export const LIMITS_TEXT = "De Quickscan is een eerste analyse op basis van uw eigen antwoorden. Er vond geen inspectie ter plaatse plaats. Deze analyse vormt geen diagnose, keuring, attest of garantie en vervangt geen beoordeling door een vakpersoon. De barometer geeft de door u opgegeven signalen weer, niet een bewezen renovatienoodzaak. De gebruikte wegingen zijn ontwerpwaarden.";

export function buildReport(answers: Answers) {
  const a = activeAnswers(answers);
  const b = barometer(a);
  const points = attentionPoints(a);
  const unknown = unknownInformation(a);
  const combos = combinationAdvice(a);
  const pkg = packageAdvice(a);
  const drone = droneAdvice(a);
  const flags = b.flags.map((id) => ({ id, ...SAFETY_TEXT[id] }));
  const profile = [
    { label: "Situatie", value: LABEL("Q01", a.Q01) },
    { label: "Woningtype", value: LABEL("Q02", a.Q02) },
    { label: "Bouwperiode", value: LABEL("Q03", a.Q03) },
    { label: "Gekende renovaties", value: LABEL("Q04", a.Q04) },
    { label: "Geplande werken", value: LABEL("Q46", a.Q46) },
  ];
  const summary = [
    b.category.id === "onvoldoende"
      ? "Op basis van uw antwoorden is er onvoldoende informatie voor een algemene renovatie-indicatie."
      : `Op basis van uw antwoorden valt uw woning in de categorie "${b.category.label}".`,
    points.length
      ? `De belangrijkste aandachtspunten zijn: ${joinNl(points.map((p) => p.title.toLowerCase()))}.`
      : "U meldt geen uitgesproken aandachtspunten.",
    flags.length ? "Er zijn veiligheidsrelevante signalen gemeld; volg de veiligheidsadviezen in dit rapport." : "",
    `Informatiezekerheid: ${unknown.label.toLowerCase()}.`,
    combos.length ? "Bij uw geplande werken loont het om enkele onderdelen samen voor te bereiden." : "",
  ].filter(Boolean).join(" ");
  const preview = {
    category: b.category,
    level: b.level,
    headline: points[0] ? DOMAIN_HEADLINE[points[0].domain] : "Er zijn op basis van uw antwoorden geen uitgesproken aandachtspunten gemeld.",
    nuance: "Dit is een eerste indicatie op basis van uw eigen antwoorden en geen vaststelling ter plaatse.",
  };
  return {
    ruleVersion: RULE_VERSION,
    reportVersion: REPORT_VERSION,
    questionVersion: QUESTION_VERSION,
    answers: a,
    scoreInternal: b.score,
    category: b.category,
    level: b.level,
    domainScores: b.domainScores,
    coverage: b.coverage,
    safety: flags,
    points,
    unknown,
    combinations: combos,
    packageAdvice: pkg,
    drone,
    droneText: drone ? DRONE_ADVICE : null,
    profile,
    summary,
    limits: LIMITS_TEXT,
    preview,
  };
}
export type QuickscanReport = ReturnType<typeof buildReport>;
