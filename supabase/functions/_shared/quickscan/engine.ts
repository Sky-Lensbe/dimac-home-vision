/**
 * DIMAC Quickscan-engine. Deterministisch, zonder AI en zonder imports,
 * zodat browser en server exact dezelfde regels gebruiken.
 * De server herberekent altijd zelf; scores uit de browser worden nooit vertrouwd.
 * Gewichten en drempels zijn ontwerpwaarden, geen gevalideerde technische schaal.
 * De scoringsmatrix van nieuwe vragen staat in docs/quickscan-2.2-scoringsmatrix.md.
 * Patch 2.2.1: strikte scheiding tussen privatieve en gemeenschappelijke signalen bij appartementen,
 * en veiligheid los van de technische barometer. Geen nieuwe scorewaarden of gewichten.
 */

export const RULE_VERSION = "qs-rules-2.2.2";
export const QUESTION_VERSION = "qs-questions-2.3.2";
export const REPORT_VERSION = "qs-report-2.2.2";

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
  /** Optionele vraag: mag overgeslagen worden en telt dan als ontbrekende informatie. */
  optional?: boolean;
  /** Veiligheidskritisch: nooit overslaan en nooit door het vervolgvragenbudget weggelaten. */
  safety?: boolean;
  /** Vervolgvragengroep: binnen een groep bepaalt een budget hoeveel vragen (in prioriteitsvolgorde) getoond worden. */
  group?: FollowUpGroup;
  options: Option[];
  showIf?: (a: Answers) => boolean;
  /** Vraagtekst afhankelijk van eerdere antwoorden (zelfde antwoordopties). */
  textFor?: (a: Answers) => string | undefined;
}

/** Waarde voor een bewust overgeslagen optionele vraag. Nooit gunstig, altijd ontbrekende informatie. */
export const SKIP = "__skip";

const o = (id: string, label: string, d?: Domain, v?: number | null, exclusive?: boolean): Option => {
  const opt: Option = { id, label };
  if (d !== undefined) opt.score = v === null || v === undefined ? null : { d, v };
  if (exclusive) opt.exclusive = true;
  return opt;
};
const x = (id: string, label: string) => o(id, label, undefined, undefined, true);
const unk = (d: Domain) => o("onbekend", "Weet ik niet", d, null);
const unkCtx = o("onbekend", "Weet ik niet");
const has = (a: Answers, q: string, ...ids: string[]) => {
  const v = a[q];
  if (v === undefined) return false;
  return Array.isArray(v) ? v.some((y) => ids.includes(y)) : ids.includes(v);
};
const answered = (a: Answers, q: string) => a[q] !== undefined && a[q] !== SKIP;
/** Routeafhankelijke vraag-ID's (woning / appartement) met dezelfde betekenis voor de vervolglogica. */
const ROUTE_PAIRS: Record<string, string> = { Q04: "Q04A", Q07: "Q07A", Q13: "Q13A", Q25: "Q25A", Q46: "Q46A" };
const hasR = (a: Answers, q: string, ...ids: string[]) => has(a, q, ...ids) || has(a, ROUTE_PAIRS[q], ...ids);
const valR = (a: Answers, q: string) => a[q] ?? a[ROUTE_PAIRS[q]];

/** Gedeelde leeftijdscategorieën voor eerder vernieuwde onderdelen. Geen technische score: ouderdom is geen gebrek. */
export const RENOVATION_AGE = [o("0-5", "0–5 jaar geleden"), o("6-10", "6–10 jaar geleden"), o("11-20", "11–20 jaar geleden"), o("gt20", "Meer dan 20 jaar geleden"), o("onbekend", "Weet ik niet")];
const ROOM_AGE = [o("0-5", "0–5 jaar geleden"), o("6-10", "6–10 jaar geleden"), o("11-20", "11–20 jaar geleden"), o("gt20", "Meer dan 20 jaar geleden"), o("nooit", "Nooit vernieuwd voor zover bekend"), unkCtx];
const RENOVATED = ["dak", "ramen", "gevel", "isolatie", "elektriciteit", "verwarming", "sanitair"];
const WORKS = ["dak", "ramen", "gevel", "isolatie", "elektriciteit", "verwarming", "sanitair", "vloeren", "interieur", "volledig"];
const plannedCount = (a: Answers) => { const v = valR(a, "Q46"); return Array.isArray(v) ? v.filter((y) => WORKS.includes(y)).length : 0; };
/** Expliciet gekozen werk (2.3.2): "volledig" bevestigt geen afzonderlijke deelwerken meer. */
const plans = (a: Answers, w: string) => hasR(a, "Q46", w);
/** Brede renovatie-intentie zonder bepaalde scope. */
export const fullIntent = (a: Answers) => hasR(a, "Q46", "volledig");
/** Alleen voor vraagtoepasselijkheid: bij een volledige renovatie verzamelen we wel de relevante voorbereidende informatie. */
const plansOrFull = (a: Answers, w: string) => plans(a, w) || fullIntent(a);
export const isApartment = (a: Answers) => has(a, "Q02", "appartement");
const house = (a: Answers) => a.Q02 !== undefined && !isApartment(a);
export const OLD_BUILDING = ["voor1945", "1945-1969"];
const oldBuild = (a: Answers) => has(a, "Q03", "voor1945", "1945-1969", "1970-1990", "onbekend");
const notRecent = (a: Answers) => has(a, "Q03", "voor1945", "1945-1969", "1970-1990", "1991-2010", "onbekend");
const buyer = (a: Answers) => has(a, "Q01", "koper");
const moistureReported = (a: Answers) => has(a, "Q24", "terugkerend", "vochtplekken");
/** 2.2.2: herkomst van vochtsignalen bij appartementen. */
const Q25A_PRIVATE = ["plafond", "buitenmuur", "ramen", "badkamer", "meerdere"];
/** Vocht uitsluitend in de gemeenschappelijke kelder of berging: geen privatieve vochtscore. */
export const commonMoistureOnly = (a: Answers) => {
  const v = a.Q25A;
  return isApartment(a) && Array.isArray(v) && v.length > 0 && v.every((y) => y === "gemkelder");
};
/** Scheuren of vervormingen uitsluitend aan gemeenschappelijke delen: geen privatieve structurele score. */
export const commonCracksOnly = (a: Answers) => isApartment(a) && has(a, "SC01", "gemeenschappelijk");
const COMMON_MOISTURE_QS = ["Q24", "Q25A", "Q26", "Q27", "Q29", "M01"];
const COMMON_CRACK_QS = ["Q30", "SC01", "Q31", "Q32", "Q33"];
/** Vragen waarvan het antwoord uitsluitend naar gemeenschappelijke delen verwijst (herkomst = gemeenschappelijk). */
export function commonOriginQuestions(a: Answers): string[] {
  return [...(commonMoistureOnly(a) ? COMMON_MOISTURE_QS : []), ...(commonCracksOnly(a) ? COMMON_CRACK_QS : [])];
}
/** Antwoorden met alleen de privatieve signalen; basis voor privatieve score, aandachtspunten en privatieve veiligheid. */
export function privateSignals(a: Answers): Answers {
  const out = { ...a };
  for (const q of commonOriginQuestions(a)) delete out[q];
  return out;
}
const roofIssue = (a: Answers) => has(a, "Q14", "slijtage", "beschadigd", "lek", "los");
const hasBasement = (a: Answers) => has(a, "K01", "kelder", "beide");
const oldRenovation = (a: Answers) => has(a, "R01", "11-20", "21-30", "gt30", "nooit", "onbekend");
const COMBUSTION = ["gas", "mazout", "hout", "andere"];
const OWN_HEATING = [...COMBUSTION, "warmtepomp", "elektrisch"];
const VME_WORKS = ["klein", "middel", "ingrijpend", "besproken"];

// ---------- Vervolgvragenbudget (deterministische prioritering) ----------
export type FollowUpGroup = "dak" | "ramen" | "vocht" | "scheur" | "comfort" | "vme";
/**
 * Hoeveel vervolgvragen per groep getoond worden, afhankelijk van de ernst van de melding.
 * Vragen binnen een groep staan in de vragenbank in prioriteitsvolgorde; de eerste N geschikte worden gesteld.
 * Veiligheidsvragen (safety) vallen nooit onder het budget.
 */
export function followUpBudget(g: FollowUpGroup, a: Answers): number {
  switch (g) {
    case "dak": return has(a, "Q14", "lek", "los") ? 9 : has(a, "Q14", "beschadigd") ? 3 : has(a, "Q14", "slijtage") ? 1 : has(a, "Q14", "oud", "onbekend") ? 1 : 0;
    case "ramen": return has(a, "Q20", "tocht", "beschadigd") ? 2 : has(a, "Q20", "verouderd") ? 1 : 0;
    case "vocht": {
      if (!moistureReported(a)) return 0;
      const base = has(a, "Q24", "vochtplekken") ? 4 : 3;
      return base + (has(a, "Q26", "regelmatig", "voortdurend") || hasR(a, "Q25", "meerdere") ? 1 : 0);
    }
    case "scheur": return has(a, "Q30", "groot", "verzakking") ? 9 : 0;
    case "comfort": return has(a, "Q34", "e", "f") || has(a, "DI01", "niet") || has(a, "MI01", "niet") || has(a, "G01", "enkel") ? 2 : 1;
    case "vme": return buyer(a) ? 9 : has(a, "A02", ...VME_WORKS) || has(a, "A03", "beperkt", "substantieel", "omvang") ? 4 : 1;
  }
}

export const QUESTIONS: Question[] = [
  // STAP 1 — Uw woning
  { id: "Q01", step: 1, main: true, text: "Wat is uw situatie?", options: [o("eigenaar", "Eigenaar met renovatieplannen"), o("koper", "Kandidaat-koper"), o("interesse", "Algemene interesse in de woningtoestand")] },
  { id: "Q02", step: 1, main: true, text: "Welk type woning betreft het?", options: [o("open", "Open bebouwing"), o("halfopen", "Halfopen bebouwing"), o("gesloten", "Gesloten bebouwing"), o("appartement", "Appartement"), o("ander", "Ander type woning")] },
  {
    id: "Q03", step: 1, main: true, text: "Wanneer werd de woning gebouwd?",
    textFor: (a) => (isApartment(a) ? "Wanneer werd het appartementsgebouw gebouwd?" : undefined),
    options: [o("voor1945", "Vóór 1945"), o("1945-1969", "1945–1969"), o("1970-1990", "1970–1990"), o("1991-2010", "1991–2010"), o("vanaf2011", "Vanaf 2011"), o("onbekend", "Weet ik niet")],
  },
  { id: "O01", step: 1, optional: true, showIf: house, text: "Wat is ongeveer de bewoonbare oppervlakte van de woning?", help: "Een schatting volstaat; dit is geen officieel vastgestelde oppervlakte. Heeft geen invloed op de barometer.", options: [o("lt100", "Minder dan 100 m²"), o("100-149", "100–149 m²"), o("150-199", "150–199 m²"), o("200-299", "200–299 m²"), o("gte300", "300 m² of meer"), unkCtx] },
  { id: "O02", step: 1, optional: true, showIf: isApartment, text: "Wat is ongeveer de bewoonbare oppervlakte van het appartement?", help: "Een schatting volstaat; dit is geen officieel vastgestelde oppervlakte. Heeft geen invloed op de barometer.", options: [o("lt75", "Minder dan 75 m²"), o("75-99", "75–99 m²"), o("100-149", "100–149 m²"), o("gte150", "150 m² of meer"), unkCtx] },
  {
    id: "R01", step: 1, main: true, text: "Wanneer werd de woning voor het laatst grondig gerenoveerd?",
    textFor: (a) => (isApartment(a) ? "Wanneer werd het appartement zelf voor het laatst grondig gerenoveerd?" : undefined),
    help: "Met een grondige renovatie bedoelen we een samenhangende vernieuwing van meerdere belangrijke onderdelen, niet één enkele herstelling.",
    options: [o("0-5", "0–5 jaar geleden"), o("6-10", "6–10 jaar geleden"), o("11-20", "11–20 jaar geleden"), o("21-30", "21–30 jaar geleden"), o("gt30", "Meer dan 30 jaar geleden"), o("nooit", "Nooit grondig gerenoveerd"), unkCtx],
  },
  {
    id: "Q04", step: 1, main: true, multi: true, showIf: house, text: "Welke onderdelen werden volgens u ooit vernieuwd?", help: "Meerdere antwoorden mogelijk.",
    textFor: (a) => (has(a, "R01", "nooit") ? "Werden er wel afzonderlijke onderdelen vernieuwd?" : undefined),
    options: [o("dak", "Dak"), o("ramen", "Ramen"), o("gevel", "Gevel"), o("isolatie", "Isolatie"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Verwarming"), o("sanitair", "Sanitair"), x("geen", "Geen gekende renovaties"), x("onbekend", "Weet ik niet")],
  },
  {
    // Appartement: alleen renovaties binnen het appartement. Dak en gevel horen bij de VME-vragen (CD01).
    id: "Q04A", step: 1, main: true, multi: true, showIf: isApartment, text: "Welke onderdelen binnen het appartement werden volgens u ooit vernieuwd?",
    help: "Meerdere antwoorden mogelijk. Werken aan het gemeenschappelijke dak of de gevel komen later aan bod bij de mede-eigendom. Of ramen privatief zijn, hangt af van de basisakte.",
    textFor: (a) => (has(a, "R01", "nooit") ? "Werden er binnen het appartement wel afzonderlijke onderdelen vernieuwd?" : undefined),
    options: [o("ramen", "Ramen"), o("isolatie", "Isolatie binnen het appartement"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Eigen verwarming"), o("sanitair", "Sanitair"), x("geen", "Geen gekende renovaties"), x("onbekend", "Weet ik niet")],
  },
  { id: "Q08", step: 1, text: "Wanneer werd het dak vernieuwd?", showIf: (a) => house(a) && has(a, "Q04", "dak"), options: RENOVATION_AGE },
  { id: "Q09", step: 1, text: "Wanneer werden de ramen vernieuwd?", showIf: (a) => hasR(a, "Q04", "ramen"), options: RENOVATION_AGE },
  { id: "Q11", step: 1, text: "Welke gevelwerken werden uitgevoerd?", showIf: (a) => house(a) && has(a, "Q04", "gevel"), options: [o("reiniging", "Reiniging"), o("voegwerk", "Voegwerk"), o("isolatie", "Gevelisolatie"), o("grondig", "Grondige gevelrenovatie"), o("onbekend", "Weet ik niet")] },
  { id: "Q13A", step: 1, multi: true, text: "Welke isolatiewerken zijn binnen het appartement uitgevoerd?", help: "Isolatie van het gemeenschappelijke dak of de gevel valt onder de mede-eigendom.", showIf: (a) => isApartment(a) && has(a, "Q04A", "isolatie"), options: [o("muren", "Binnenzijde van buitenmuren"), o("vloer", "Vloer"), o("plafond", "Plafond"), o("beglazing", "Beglazing"), o("andere", "Andere"), x("onbekend", "Weet ik niet")] },
  { id: "Q13", step: 1, multi: true, text: "Welke isolatiewerken zijn uitgevoerd?", showIf: (a) => house(a) && has(a, "Q04", "isolatie"), options: [o("dak", "Dak"), o("gevel", "Gevel"), o("vloer", "Vloer"), o("beglazing", "Beglazing"), o("andere", "Andere"), x("onbekend", "Weet ik niet")] },
  { id: "Q10", step: 1, text: "Wanneer werd de elektrische installatie vernieuwd?", showIf: (a) => hasR(a, "Q04", "elektriciteit"), options: RENOVATION_AGE },
  { id: "Q05", step: 1, text: "Beschikt u over bewijs van de uitgevoerde renovaties?", showIf: (a) => hasR(a, "Q04", ...RENOVATED), options: [o("facturen", "Facturen of attesten"), o("mondeling", "Enkel mondelinge informatie"), o("geen", "Geen documenten"), o("onbekend", "Weet ik niet")] },
  {
    id: "Q06", step: 1, multi: true, text: "Welke documenten zijn beschikbaar?", help: "Meerdere antwoorden mogelijk.",
    showIf: (a) => buyer(a) || has(a, "Q05", "mondeling", "geen", "onbekend"),
    options: [o("epc", "EPC"), o("keuring", "Elektrische keuring"), o("plannen", "Bouwplannen"), o("asbest", "Asbestattest"), o("onderhoud", "Onderhoudsverslagen"), o("andere", "Andere"), x("geen", "Geen documenten"), x("onbekend", "Weet ik niet")],
  },
  { id: "Q07", step: 1, text: "Is een eerder hersteld probleem opnieuw opgedoken?", showIf: (a) => house(a) && has(a, "Q04", ...RENOVATED), options: [o("nee", "Nee"), o("vocht", "Ja, vocht", "V", 7), o("dak", "Ja, dak", "B", 7), o("technieken", "Ja, technieken", "T", 7), o("anders", "Ja, iets anders")] },
  // Appartement: privatief en gemeenschappelijk gescheiden; een gemeenschappelijk probleem scoort niet privatief (dezelfde scores als Q07).
  { id: "Q07A", step: 1, text: "Is een eerder hersteld probleem opnieuw opgedoken?", showIf: (a) => isApartment(a) && has(a, "Q04A", ...RENOVATED), options: [o("nee", "Nee"), o("vocht", "Ja, vocht binnen het appartement", "V", 7), o("technieken", "Ja, technieken binnen het appartement", "T", 7), o("gemeenschappelijk", "Ja, aan gemeenschappelijke delen, zoals dak of gevel"), o("anders", "Ja, iets anders")] },
  { id: "Q12", step: 1, text: "Heeft de eerdere vochtbehandeling geholpen?", showIf: (a) => hasR(a, "Q07", "vocht"), options: [o("ja", "Ja", "V", 0), o("gedeeltelijk", "Gedeeltelijk", "V", 5), o("nee", "Nee", "V", 8), unk("V")] },
  { id: "K01", step: 1, showIf: house, text: "Heeft de woning een kelder of kruipruimte?", options: [o("kelder", "Kelder"), o("kruip", "Kruipruimte of kruipkelder"), o("beide", "Beide"), o("geen", "Geen"), unkCtx] },
  { id: "B01", step: 1, optional: true, showIf: (a) => buyer(a) && has(a, "Q02", "open", "halfopen", "ander"), text: "Zijn er bijgebouwen aanwezig?", help: "Bijvoorbeeld een garage, tuinhuis of berging. Enkel voor het woningprofiel.", options: [o("ja", "Ja"), o("nee", "Nee"), unkCtx] },
  { id: "ST01", step: 1, optional: true, showIf: buyer, text: "Bent u op de hoogte van mogelijke stedenbouwkundige onregelmatigheden aan het pand?", help: "Optioneel. Dit antwoord wijzigt de bouwtechnische barometer niet.", options: [o("nee", "Nee, geen gekende onregelmatigheden"), o("ja", "Ja, er zijn aandachtspunten bekend"), o("onduidelijk", "Er zijn onduidelijkheden over vergunningen"), unkCtx] },
  { id: "FL01", step: 1, optional: true, showIf: buyer, text: "Kent u de P-score (overstromingskans van het perceel)?", help: "Optioneel. U vindt de score in de vastgoedadvertentie of het officiële overstromingsrapport (Waterinfo). Ze wijzigt de technische barometer niet.", options: [o("a", "A"), o("b", "B"), o("c", "C"), o("d", "D"), unkCtx] },
  { id: "FL02", step: 1, optional: true, showIf: buyer, text: "Kent u de G-score (overstromingskans van het gebouw)?", help: "Optioneel. Ook terug te vinden in de advertentie of het overstromingsrapport. Ze wijzigt de technische barometer niet.", options: [o("a", "A"), o("b", "B"), o("c", "C"), o("d", "D"), o("nvt", "Niet van toepassing"), unkCtx] },

  // STAP 2 — Bouwkundige toestand
  {
    id: "Q14", step: 2, main: true, safety: true, text: "Wat is de gekende toestand van het dak?", showIf: house,
    options: [o("geen", "Geen gekende problemen", "B", 0), o("oud", "Ouder dak zonder gekende problemen", "B", 3), o("slijtage", "Zichtbare slijtage", "B", 5), o("beschadigd", "Beschadigde onderdelen", "B", 7), o("lek", "Actieve lekkage", "V", 10), o("los", "Mogelijk gevaarlijk losse dakonderdelen", "B", 10), unk("B")],
  },
  // Dakgroep in prioriteitsvolgorde
  { id: "Q17", step: 2, group: "dak", optional: true, text: "Zijn de dakvlakken goed zichtbaar vanaf de grond?", showIf: (a) => has(a, "Q14", "oud", "slijtage", "beschadigd", "onbekend", "los", "lek"), options: [o("ja", "Ja"), o("gedeeltelijk", "Gedeeltelijk"), o("nauwelijks", "Nauwelijks"), o("onbekend", "Weet ik niet")] },
  { id: "Q15", step: 2, group: "dak", safety: true, text: "Welke schade merkt u op?", showIf: (a) => has(a, "Q14", "slijtage", "beschadigd"), options: [o("bedekking", "Beschadigde dakbedekking", "B", 6), o("los", "Losse onderdelen", "B", 9), o("randen", "Problemen aan dakranden of aansluitingen", "B", 7), o("meerdere", "Meerdere signalen", "B", 9), unk("B")] },
  { id: "Q16", step: 2, group: "dak", safety: true, text: "Zijn er vochtsporen onder het dak?", showIf: roofIssue, options: [o("nee", "Nee", "V", 0), o("oud", "Oude, droge sporen", "V", 3), o("recent", "Recente sporen na regen", "V", 8), o("actief", "Actieve waterinsijpeling", "V", 10), unk("V")] },
  { id: "Q19", step: 2, group: "dak", text: "Zijn er problemen met de dakgoten of regenafvoer?", showIf: roofIssue, options: [o("geen", "Geen gekende problemen", "B", 0), o("verstopt", "Regelmatig verstopt", "B", 3), o("lekkend", "Lekkende of beschadigde goten", "B", 7), o("overstromend", "Overstromende afvoer", "B", 8), unk("B")] },
  { id: "Z01", step: 2, showIf: house, text: "Is er een zolderruimte aanwezig?", help: "Ook zonder zolder blijven de dakvragen van toepassing.", options: [o("bereikbaar", "Ja, bereikbaar"), o("moeilijk", "Ja, maar niet of moeilijk bereikbaar"), o("nee", "Nee"), unkCtx] },
  {
    id: "DI01", step: 2, main: true, showIf: house, text: "Weet u of het dak geïsoleerd is?",
    textFor: (a) => (has(a, "Z01", "nee") ? "Weet u of het dak (of het plafond onder het dak) geïsoleerd is?" : undefined),
    options: [o("degelijk", "Ja, recent of aantoonbaar degelijk", "E", 0), o("beperkt", "Ja, maar beperkt of ouder", "E", 3), o("gedeeltelijk", "Gedeeltelijk geïsoleerd", "E", 4), o("niet", "Niet geïsoleerd", "E", 7), unk("E")],
  },
  { id: "Q18", step: 2, showIf: house, text: "Hoe is de zichtbare toestand van de gevel?", options: [o("geen", "Geen gekende problemen", "B", 0), o("verwering", "Plaatselijke verwering", "B", 3), o("voegen", "Beschadigde voegen of afwerking", "B", 6), o("infiltratie", "Waterinfiltratie via gevel of aansluitingen", "V", 9), unk("B")] },
  {
    id: "MI01", step: 2, main: true, showIf: house, text: "Wat weet u over de isolatie van de buitenmuren?",
    help: "Een massieve muur is niet automatisch ongeïsoleerd; soms is er binnen- of buitenisolatie aangebracht.",
    options: [o("geisoleerd", "Geïsoleerd", "E", 0), o("gedeeltelijk", "Gedeeltelijk geïsoleerd", "E", 3), o("spouw", "Spouwmuur, isolatie onbekend", "E", null), o("massief", "Massieve muur, isolatie onbekend", "E", null), o("niet", "Niet geïsoleerd", "E", 6), unk("E")],
  },
  { id: "G01", step: 2, main: true, text: "Welk type beglazing is voornamelijk aanwezig?", help: "Het type beglazing zegt iets over de energieprestatie, niet over de technische staat van de ramen.", options: [o("enkel", "Enkel glas", "E", 6), o("dubbel", "Ouder dubbel glas", "E", 3), o("hr", "Hoogrendementsglas", "E", 0), o("driedubbel", "Driedubbel glas", "E", 0), o("gemengd", "Verschillende soorten", "E", 3), unk("E")] },
  { id: "Q20", step: 2, main: true, text: "Wat is de toestand van de ramen?", options: [o("geen", "Geen gekende problemen", "B", 0), o("verouderd", "Verouderd", "B", 3), o("tocht", "Tocht of sluitproblemen", "B", 5), o("beschadigd", "Beschadigd", "B", 7), unk("B")] },
  { id: "Q22", step: 2, group: "ramen", text: "Voelt u tocht langs gesloten ramen of deuren?", showIf: (a) => has(a, "Q20", "verouderd", "tocht"), options: [o("nee", "Nee", "B", 0), o("beperkt", "Beperkt", "B", 3), o("duidelijk", "Duidelijk", "B", 6), unk("B")] },
  { id: "Q21", step: 2, group: "ramen", text: "Is er condens tussen de glasplaten?", showIf: (a) => has(a, "Q20", "verouderd", "tocht", "beschadigd") && !has(a, "G01", "enkel"), options: [o("nee", "Nee", "B", 0), o("ja", "Ja", "B", 5), unk("B")] },
  { id: "VL01", step: 2, optional: true, showIf: (a) => house(a) && oldBuild(a), text: "Wat weet u over de opbouw van de vloer op het gelijkvloers?", help: "Context voor isolatie en mogelijke werken; geen beoordeling van gebreken.", options: [o("recent", "Recente vloeropbouw"), o("beton", "Beton of chape, verdere opbouw onbekend"), o("grond", "Vloer op volle grond"), o("hout", "Houten vloerconstructie"), o("andere", "Andere opbouw"), unkCtx] },
  { id: "VL02", step: 2, optional: true, showIf: (a) => house(a) && (a.VL01 !== undefined) && !has(a, "VL01", "recent"), text: "Is de vloer op het gelijkvloers geïsoleerd?", options: [o("ja", "Ja", "E", 0), o("gedeeltelijk", "Gedeeltelijk", "E", 2), o("nee", "Nee", "E", 4), unk("E"), o("nvt", "Niet van toepassing")] },
  { id: "Q24", step: 2, main: true, safety: true, text: "Zijn er vocht-, schimmel- of waterproblemen?", options: [o("geen", "Geen gekende problemen", "V", 0), o("terugkerend", "Terugkerende condens of schimmel", "V", 5), o("vochtplekken", "Vochtplekken", "V", 8), unk("V")] },
  // Vochtgroep in prioriteitsvolgorde: waar, hoe vaak, aard, wanneer, insijpeling
  { id: "Q25A", step: 2, group: "vocht", multi: true, text: "Waar merkt u dit probleem?", help: "Meerdere antwoorden mogelijk.", showIf: (a) => isApartment(a) && moistureReported(a), options: [o("plafond", "Plafond, onder dak of bovenliggende ruimte"), o("buitenmuur", "Buitenmuur van het appartement"), o("ramen", "Rond ramen"), o("badkamer", "Badkamer"), o("meerdere", "Meerdere ruimtes in het appartement"), o("gemkelder", "Gemeenschappelijke kelder of berging"), o("onbekend", "Weet ik niet of niet duidelijk", undefined, undefined, true)] },
  { id: "Q25", step: 2, group: "vocht", multi: true, text: "Waar merkt u dit probleem?", help: "Meerdere antwoorden mogelijk.", showIf: (a) => house(a) && moistureReported(a), options: [o("zolder", "Dak of zolder"), o("buitenmuur", "Buitenmuur"), o("ramen", "Rond ramen"), o("badkamer", "Badkamer"), o("kelder", "Kelder"), o("meerdere", "Meerdere ruimtes")] },
  { id: "Q26", step: 2, group: "vocht", text: "Is het probleem terugkerend?", showIf: moistureReported, options: [o("eenmalig", "Eenmalig", "V", 2), o("afentoe", "Af en toe", "V", 4), o("regelmatig", "Regelmatig", "V", 7), o("voortdurend", "Vrijwel voortdurend", "V", 8), unkCtx] },
  { id: "Q29", step: 2, group: "vocht", text: "Hoe uitgebreid is de zichtbare schimmelvorming?", showIf: (a) => has(a, "Q24", "terugkerend"), options: [o("plaatselijk", "Plaatselijk", "V", 3), o("meerdere", "Meerdere plekken", "V", 6), o("ruimtes", "In verschillende ruimtes", "V", 8), unk("V")] },
  { id: "Q27", step: 2, group: "vocht", optional: true, text: "Wanneer treedt het probleem vooral op?", showIf: moistureReported, options: [o("regen", "Na regen"), o("koude", "In koude periodes"), o("douchen", "Na douchen of koken"), o("geenpatroon", "Geen duidelijk patroon"), unkCtx] },
  { id: "M01", step: 2, safety: true, text: "Komt er daadwerkelijk water naar binnen?", help: "Bijvoorbeeld druppels, natte plekken die groeien bij regen of water dat binnenloopt.", showIf: (a) => !has(a, "Q14", "lek") && !commonMoistureOnly(a) && (has(a, "Q24", "vochtplekken") || has(a, "Q27", "regen") || has(a, "Q25", "buitenmuur", "zolder") || has(a, "Q25A", "buitenmuur", "plafond")), options: [o("nee", "Nee, alleen vochtige plekken", "V", 0), o("vermoeden", "Mogelijk, bij regen", "V", 6), o("regen", "Ja, bij regen", "V", 8), o("actief", "Ja, actieve lekkage", "V", 10), unk("V")] },
  { id: "Q23", step: 2, text: "Zijn er vochtplekken rond ramen of gevel na regen?", showIf: (a) => hasR(a, "Q25", "ramen", "buitenmuur") && !has(a, "M01", "regen", "actief"), options: [o("nee", "Nee", "V", 0), o("soms", "Soms", "V", 5), o("herhaaldelijk", "Herhaaldelijk", "V", 8), unk("V")] },
  { id: "Q28", step: 2, safety: true, text: "Komt er water in de kelder?", showIf: (a) => house(a) && ((hasBasement(a) && (moistureReported(a) || has(a, "Q03", ...OLD_BUILDING))) || (has(a, "Q25", "kelder") && !has(a, "K01", "geen", "kruip"))), options: [o("nee", "Nee", "V", 0), o("soms", "Soms na regen", "V", 7), o("regelmatig", "Regelmatig", "V", 8), o("actief", "Actieve waterinstroom", "V", 10), unk("V")] },
  // Appartement: water in een gemeenschappelijke kelder is VME-context zonder privatieve score; actieve instroom blijft een veiligheidsmelding.
  { id: "KV01", step: 2, safety: true, showIf: (a) => has(a, "Q25A", "gemkelder"), text: "Komt er water in de gemeenschappelijke kelder of berging?", help: "Dit telt niet mee in de privatieve barometer en wordt vermeld bij de gemeenschappelijke delen.", options: [o("nee", "Nee, alleen vochtig"), o("soms", "Soms na regen"), o("regelmatig", "Regelmatig"), o("actief", "Actieve waterinstroom"), unkCtx] },
  { id: "Q30", step: 2, main: true, safety: true, text: "Zijn er scheuren, verzakkingen of vervormingen?", options: [o("geen", "Geen gekende problemen", "S", 0), o("haar", "Kleine, volgens u stabiele haarscheuren", "S", 2), o("groot", "Grote of toenemende scheuren", "S", 10), o("verzakking", "Zichtbare verzakking of vervorming", "S", 10), unk("S")] },
  // Appartement: waar zit het signaal? Bepaalt alleen de toewijzing (privatief of gemeenschappelijk), nooit de juridische verantwoordelijkheid.
  { id: "SC01", step: 2, safety: true, showIf: (a) => isApartment(a) && has(a, "Q30", "haar", "groot", "verzakking"), text: "Waar ziet u deze scheuren of vervormingen?", help: "Welke delen privatief of gemeenschappelijk zijn, hangt af van de basisakte. De Quickscan bepaalt niet wie verantwoordelijk is.", options: [o("binnen", "Binnen het appartement"), o("gemeenschappelijk", "Alleen aan gemeenschappelijke delen, zoals traphal, gevel of kelder"), o("beide", "Zowel binnen als aan gemeenschappelijke delen"), o("onbekend", "Weet ik niet of niet duidelijk")] },
  { id: "Q31", step: 2, group: "scheur", safety: true, text: "Zijn de scheuren groter geworden?", showIf: (a) => has(a, "Q30", "groot"), options: [o("nee", "Niet voor zover bekend", "S", 2), o("onzeker", "Onzeker", "S", null), o("groter", "Duidelijk groter", "S", 10)] },
  { id: "Q32", step: 2, group: "scheur", safety: true, text: "Zijn vloeren opvallend verzakt of vervormd?", showIf: (a) => has(a, "Q30", "groot", "verzakking"), options: [o("nee", "Nee", "S", 0), o("licht", "Mogelijk licht", "S", 5), o("duidelijk", "Duidelijk", "S", 9), unk("S")] },
  { id: "Q33", step: 2, group: "scheur", text: "Klemmen ramen of deuren zonder duidelijke oorzaak?", showIf: (a) => has(a, "Q30", "groot", "verzakking"), options: [o("nee", "Nee", "S", 0), o("ja", "Ja", "S", 4), unk("S")] },
  { id: "AS01", step: 2, optional: true, showIf: (a) => buyer(a) || oldBuild(a), text: "Wat weet u over mogelijke asbesthoudende materialen in het pand?", help: "Een ontbrekend attest betekent niet dat er asbest aanwezig of afwezig is.", options: [o("attest_geen", "Asbestattest beschikbaar, geen gekende asbestmaterialen vermeld"), o("attest_toepassingen", "Asbestattest beschikbaar, toepassingen vermeld"), o("gekend", "Asbesthoudende materialen zijn gekend"), o("geen_attest", "Geen attest beschikbaar"), unkCtx] },
  { id: "AS02", step: 2, showIf: (a) => has(a, "AS01", "attest_toepassingen", "gekend"), text: "Zijn deze materialen beschadigd of zijn er werken aan gepland?", options: [o("nee", "Nee, niet beschadigd en geen werken gepland"), o("beschadigd", "Ja, mogelijk beschadigd"), o("werken", "Ja, er zijn werken aan gepland"), o("beide", "Beschadigd én werken gepland"), unkCtx] },
  { id: "RI01", step: 2, optional: true, showIf: (a) => house(a) && (buyer(a) || has(a, "Q03", "voor1945", "1945-1969", "1970-1990", "onbekend") || plansOrFull(a, "sanitair")), text: "Wat weet u over de aansluiting en afvoer van afvalwater?", help: "Een septische put is op zich geen technisch probleem. Dit is geen conformiteitsbeoordeling.", options: [o("riolering", "Aangesloten op de openbare riolering"), o("riolering_septisch", "Openbare riolering met septische put"), o("septisch", "Septische put of eigen behandeling, aansluiting onbekend"), o("niet", "Niet aangesloten op openbare riolering"), unkCtx] },

  // STAP 3 — Energie en installaties (appartement: ook mede-eigendom)
  { id: "Q34", step: 3, main: true, text: "Wat is het EPC-label?", help: "Het EPC-label is context voor de energieprestatie, geen volledige bouwtechnische beoordeling.", options: [o("aplus", "A+ of A", "E", 0), o("b", "B", "E", 1), o("c", "C", "E", 2), o("d", "D", "E", 4), o("e", "E", "E", 7), o("f", "F", "E", 9), unk("E")] },
  { id: "Q35", step: 3, optional: true, text: "Hoe oud is het EPC?", showIf: (a) => buyer(a) && has(a, "Q34", "aplus", "b", "c", "d", "e", "f"), options: [o("lt5", "Minder dan 5 jaar"), o("5-10", "5 tot 10 jaar"), o("ouder", "Ouder"), o("onbekend", "Weet ik niet")] },
  { id: "Q37", step: 3, group: "comfort", text: "Ervaart u temperatuurproblemen?", showIf: (a) => has(a, "Q34", "e", "f", "onbekend") || has(a, "DI01", "gedeeltelijk", "niet", "onbekend") || has(a, "MI01", "niet", "gedeeltelijk") || has(a, "G01", "enkel"), options: [o("nee", "Nee", "E", 0), o("kamers", "Bepaalde kamers zijn moeilijk warm", "E", 3), o("sterk", "Sterke koude of oververhitting", "E", 5), unk("E")] },
  { id: "Q38", step: 3, group: "comfort", optional: true, text: "Waar ervaart u de meeste comfortproblemen?", showIf: (a) => has(a, "Q37", "kamers", "sterk"), options: [o("dak", "Dakverdieping"), o("leef", "Leefruimte"), o("slaap", "Slaapkamers"), o("heel", "Hele woning"), o("wisselend", "Wisselend")] },
  {
    id: "H01", step: 3, main: true, text: "Hoe wordt de woning momenteel hoofdzakelijk verwarmd?",
    options: [o("gas", "Aardgas"), o("mazout", "Mazout"), o("warmtepomp", "Warmtepomp"), o("elektrisch", "Rechtstreekse elektrische verwarming"), o("hout", "Hout- of pelletverwarming"), o("collectief", "Collectieve verwarming / warmtenet"), o("andere", "Andere"), o("geen", "Geen vaste verwarmingsinstallatie"), o("onbekend", "Weet ik niet")],
  },
  { id: "H02", step: 3, text: "Hoe oud is de huidige verwarmingsinstallatie ongeveer?", showIf: (a) => has(a, "H01", ...OWN_HEATING), options: [o("0-5", "0–5 jaar", "T", 0), o("6-10", "6–10 jaar", "T", 0), o("11-20", "11–20 jaar", "T", 1), o("gt20", "Meer dan 20 jaar", "T", 3), o("onbekend", "Weet ik niet")] },
  {
    id: "Q42", step: 3, main: true, safety: true, text: "Hoe functioneert de verwarming momenteel?", showIf: (a) => a.H01 !== undefined && !has(a, "H01", "geen"),
    textFor: (a) => (has(a, "H01", "collectief") ? "Hoe functioneert de verwarming in uw woning momenteel?" : undefined),
    options: [o("normaal", "Functioneert normaal", "T", 0), o("ouder", "Functioneert, maar is verouderd", "T", 3), o("storingen", "Regelmatige storingen of onvoldoende werking", "T", 7), o("gas", "Mogelijk onveilige situatie, zoals gaslucht of een CO-alarm", "T", 10), unk("T")],
  },
  { id: "Q43", step: 3, safety: true, text: "Is er momenteel een CO-alarm of vermoeden van een gaslek?", showIf: (a) => has(a, "Q42", "gas"), options: [o("nee", "Nee"), o("ja", "Ja")] },
  { id: "Q44", step: 3, text: "Wanneer werd de verwarmingsinstallatie voor het laatst onderhouden?", showIf: (a) => has(a, "H01", ...COMBUSTION, "warmtepomp") && !has(a, "Q42", "gas") && !has(a, "H02", "0-5"), options: [o("12m", "In de afgelopen 12 maanden", "T", 0), o("1-3j", "Eén tot drie jaar geleden", "T", 1), o("gt3j", "Meer dan drie jaar geleden", "T", 3), o("onbekend", "Nooit of niet bekend", "T", null), o("nvt", "Niet van toepassing")] },
  { id: "Q41", step: 3, main: true, safety: true, text: "Zijn er gekende problemen met de elektriciteit?", options: [o("geen", "Geen gekende problemen", "T", 0), o("gedateerd", "Verouderd, zonder gekende problemen", "T", 3), o("zekeringen", "Regelmatig uitvallende zekeringen", "T", 6), o("beschadigd", "Beschadigde onderdelen", "T", 9), o("rook", "Rook, vonken of brandlucht", "T", 10), unk("T")] },
  { id: "Q40", step: 3, text: "Is er een recent keuringsverslag van de elektrische installatie?", help: "Een ontbrekend verslag betekent niet dat de installatie onveilig is.", showIf: (a) => buyer(a) || has(a, "Q41", "gedateerd", "zekeringen", "beschadigd", "rook", "onbekend"), options: [o("conform", "Ja, gunstig zonder opmerkingen", "T", 0), o("beperkt", "Ja, met beperkte opmerkingen", "T", 4), o("inbreuken", "Ja, met belangrijke inbreuken", "T", 8), o("geen", "Geen recent verslag", "T", null), unk("T")] },
  { id: "V01", step: 3, text: "Hoe wordt de woning geventileerd?", showIf: (a) => moistureReported(a) || hasR(a, "Q04", "isolatie", "ramen") || plansOrFull(a, "isolatie"), options: [o("natuurlijk", "Natuurlijk of via roosters"), o("mechanisch", "Mechanisch systeem"), o("geen", "Geen duidelijk systeem"), o("onbekend", "Weet ik niet")] },
  { id: "Q39", step: 3, text: "Zijn er problemen met de ventilatie?", showIf: (a) => has(a, "V01", "natuurlijk", "mechanisch", "geen"), options: [o("normaal", "Geen gekende problemen", "T", 0), o("beperkt", "Beperkt of onduidelijk", "T", 3), o("defect", "Defect of duidelijk onvoldoende", "T", 7), unk("T")] },
  {
    id: "SL01", step: 3, optional: true, showIf: (a) => (isApartment(a) ? oldRenovation(a) : oldBuild(a)) || plansOrFull(a, "sanitair"),
    text: "Hoe oud zijn de sanitaire leidingen en afvoeren ongeveer?",
    textFor: (a) => (isApartment(a) ? "Hoe oud zijn de sanitaire leidingen en afvoeren binnen het appartement ongeveer?" : undefined),
    help: "Ouderdom is context. Gekende lekkages en afvoerproblemen wegen zwaarder.",
    options: [o("0-15", "0–15 jaar", "T", 0), o("16-25", "16–25 jaar", "T", 1), o("gt25", "Meer dan 25 jaar", "T", 3), o("gedeeltelijk", "Gedeeltelijk vernieuwd", "T", 1), o("origineel", "Vermoedelijk origineel", "T", 3), unk("T")],
  },
  { id: "Q45", step: 3, safety: true, text: "Zijn er problemen met sanitair of afvoer?", showIf: (a) => hasR(a, "Q25", "badkamer") || hasR(a, "Q04", "sanitair") || has(a, "Q03", ...OLD_BUILDING) || has(a, "SL01", "gt25", "origineel", "onbekend") || has(a, "RI01", "septisch", "niet", "onbekend"), options: [o("geen", "Geen gekende problemen", "T", 0), o("verstopping", "Terugkerende verstoppingen", "T", 3), o("terugkerend", "Afvoerproblemen of rioolgeur", "T", 7), o("actief", "Actieve lekkage", "T", 9), unk("T")] },
  // Appartement — mede-eigendom (geen invloed op de privatieve barometer)
  { id: "A01", step: 3, main: true, showIf: isApartment, text: "Wat weet u over de toestand van de overige gemeenschappelijke delen?", help: "Bijvoorbeeld balkons, lift, traphal en collectieve installaties.", options: [o("geen", "Geen gekende problemen"), o("enkele", "Enkele aandachtspunten"), o("duidelijk", "Duidelijke problemen"), o("onbekend", "Weet ik niet")] },
  { id: "CD01", step: 3, main: true, showIf: isApartment, text: "Wat weet u over de renovatie van het gemeenschappelijke dak en de gevel?", help: "Welke delen gemeenschappelijk of privatief zijn, hangt af van de basisakte.", options: [o("beide", "Beide recent aangepakt"), o("dak", "Alleen dak aangepakt"), o("gevel", "Alleen gevel aangepakt"), o("verouderd", "Beide vermoedelijk verouderd"), o("problemen", "Er zijn gekende problemen"), unkCtx] },
  { id: "CL01", step: 3, showIf: isApartment, text: "Zijn de gemeenschappelijke leidingen recent vernieuwd?", options: [o("ja", "Ja"), o("gedeeltelijk", "Gedeeltelijk"), o("nee", "Nee, voor zover bekend"), unkCtx] },
  { id: "A02", step: 3, main: true, showIf: isApartment, text: "Zijn er werken aan de gemeenschappelijke delen gepland of aangekondigd?", options: [o("geen", "Geen gekende werken"), o("klein", "Kleine onderhoudswerken"), o("middel", "Middelgrote renovatiewerken"), o("ingrijpend", "Ingrijpende renovatiewerken"), o("besproken", "Werken besproken, omvang nog onbekend"), unkCtx] },
  { id: "A03", step: 3, main: true, showIf: isApartment, text: "Zijn er bijzondere bijdragen of grote bijkomende kosten aangekondigd?", options: [o("nee", "Nee, niet voor zover bekend"), o("beperkt", "Ja, beperkte bijkomende bijdragen"), o("substantieel", "Ja, substantiële bijkomende bijdragen"), o("omvang", "Ja, omvang nog onbekend"), unkCtx] },
  { id: "A06", step: 3, group: "vme", multi: true, showIf: (a) => isApartment(a) && has(a, "A02", ...VME_WORKS), text: "Op welke onderdelen hebben de aangekondigde werken betrekking?", help: "Meerdere antwoorden mogelijk.", options: [o("dak", "Dak"), o("gevel", "Gevel"), o("balkons", "Balkons"), o("leidingen", "Leidingen"), o("installaties", "Verwarming of installaties"), o("lift", "Lift"), o("andere", "Andere"), x("onbekend", "Nog niet bekend")] },
  { id: "A07", step: 3, group: "vme", showIf: (a) => isApartment(a) && has(a, "A02", ...VME_WORKS), text: "Wat is de stand van deze werken?", options: [o("besproken", "Besproken, nog niet goedgekeurd"), o("goedgekeurd", "Goedgekeurd door de algemene vergadering"), o("uitgevoerd", "Al (deels) uitgevoerd"), unkCtx] },
  { id: "A04", step: 3, group: "vme", showIf: isApartment, text: "Wat weet u over het reservefonds van de mede-eigendom?", options: [o("aanwezig", "Reservefonds aanwezig"), o("beperkt", "Reservefonds aanwezig, maar mogelijk beperkt"), o("geen", "Geen reservefonds bekend"), unkCtx] },
  { id: "A05", step: 3, group: "vme", multi: true, showIf: isApartment, text: "Welke VME-documenten zijn beschikbaar?", help: "Meerdere antwoorden mogelijk. U hoeft niets op te laden.", options: [o("verslagen", "Verslagen van de algemene vergadering"), o("reservefonds", "Informatie over het reservefonds"), o("onderhoudsplan", "Onderhoudsplan"), o("besluiten", "Goedgekeurde renovatiebesluiten"), o("bijdragen", "Informatie over bijzondere bijdragen"), o("andere", "Andere relevante documenten"), x("geen", "Geen documenten beschikbaar"), x("onbekend", "Weet ik niet")] },

  // STAP 4 — Renovatieplannen
  {
    id: "Q46A", step: 4, main: true, multi: true, showIf: isApartment, text: "Welke werken binnen het appartement overweegt u?", help: "Meerdere antwoorden mogelijk. Werken aan gemeenschappelijk dak of gevel beslist de VME; die staan bij de mede-eigendom.",
    options: [x("geen", "Geen concrete werken"), o("ramen", "Ramen"), o("isolatie", "Isolatie binnen het appartement"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Verwarming"), o("sanitair", "Sanitair"), o("vloeren", "Vloeren"), o("interieur", "Interieur"), o("volledig", "Volledige renovatie van het appartement")],
  },
  {
    id: "Q46", step: 4, main: true, multi: true, showIf: house, text: "Welke werken overweegt u?", help: "Meerdere antwoorden mogelijk.",
    options: [x("geen", "Geen concrete werken"), o("dak", "Dak"), o("ramen", "Ramen"), o("gevel", "Gevel"), o("isolatie", "Isolatie"), o("elektriciteit", "Elektriciteit"), o("verwarming", "Verwarming"), o("sanitair", "Sanitair"), o("vloeren", "Vloeren"), o("interieur", "Interieur"), o("volledig", "Volledige renovatie")],
  },
  { id: "Q47", step: 4, optional: true, text: "Wilt u de verschillende werken in een logische volgorde plannen?", showIf: (a) => plannedCount(a) >= 2 || hasR(a, "Q46", "volledig"), options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel")] },
  { id: "AK01", step: 4, optional: true, showIf: (a) => isApartment(a) && (oldRenovation(a) || plansOrFull(a, "interieur")), text: "Wanneer werd de keuken voor het laatst grondig vernieuwd?", help: "Een oudere keuken is op zich geen technisch gebrek.", options: ROOM_AGE },
  { id: "AB01", step: 4, optional: true, showIf: (a) => isApartment(a) && (oldRenovation(a) || plansOrFull(a, "interieur") || plansOrFull(a, "sanitair")), text: "Wanneer werd de badkamer voor het laatst grondig vernieuwd?", options: ROOM_AGE },
  { id: "AB02", step: 4, safety: true, showIf: (a) => isApartment(a) && (has(a, "AB01", "gt20", "nooit", "onbekend") || has(a, "Q25A", "badkamer")), text: "Zijn er gekende problemen met vocht of waterdichting in de badkamer?", options: [o("geen", "Geen gekende problemen", "V", 0), o("beperkt", "Beperkte vochtsporen of losse voegen", "V", 4), o("duidelijk", "Duidelijke vochtschade of lekkage", "V", 7), unk("V")] },
  { id: "Q48", step: 4, main: true, text: "Wilt u weten hoeveel uw renovatie ongeveer kan kosten?", options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel")] },
  {
    id: "Q49", step: 4, main: true, text: "Wanneer verwacht u verdere stappen te zetten?",
    textFor: (a) => (has(a, "Q01", "eigenaar") ? "Wanneer wilt u met de renovatiewerken starten?" : buyer(a) ? "Wanneer verwacht u een beslissing te nemen over de woning?" : undefined),
    options: [o("2w", "Binnen twee weken"), o("3m", "Binnen drie maanden"), o("1j", "Binnen het jaar"), o("later", "Later dan een jaar"), o("onbekend", "Weet ik nog niet")],
  },
  { id: "Q50", step: 4, text: "Wilt u moeilijk zichtbare delen van het dak beter laten beoordelen?", showIf: (a) => house(a) && (has(a, "Q14", "oud", "slijtage", "beschadigd", "los", "onbekend") || has(a, "Q17", "gedeeltelijk", "nauwelijks") || plans(a, "dak")), options: [o("ja", "Ja"), o("nee", "Nee"), o("twijfel", "Ik twijfel"), o("nvt", "Niet van toepassing")] },
];



/** Vraagtekst voor de huidige antwoorden (bv. appartement, eigenaar of kandidaat-koper). */
export const questionText = (q: Question, a: Answers) => q.textFor?.(a) ?? q.text;

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const STEP_TITLES = ["Uw woning", "Bouwkundige toestand", "Energie en installaties", "Renovatieplannen"];
export const stepTitle = (step: number, a: Answers) => (step === 3 && isApartment(a) ? "Energie, installaties en mede-eigendom" : STEP_TITLES[step - 1]);

/** Geldige antwoorden filteren op toegestane opties en exclusieve keuzes. Overslaan alleen bij optionele vragen. */
function sanitize(q: Question, v: unknown): string | string[] | undefined {
  if (v === SKIP) return q.optional && !q.safety ? SKIP : undefined;
  const ids = new Set(q.options.map((y) => y.id));
  if (q.multi) {
    if (!Array.isArray(v)) return undefined;
    const vals = [...new Set(v.filter((y): y is string => typeof y === "string" && ids.has(y)))];
    if (!vals.length) return undefined;
    const excl = vals.filter((y) => q.options.find((op) => op.id === y)?.exclusive);
    if (excl.length) return vals.length === 1 ? vals : undefined;
    return vals;
  }
  return typeof v === "string" && ids.has(v) ? v : undefined;
}

/**
 * Eén doorloop in bronvolgorde. `ctx` bevat de actieve antwoorden van de vorige doorloop, zodat
 * latere antwoorden (bv. renovatieplannen in stap 4) ook eerdere vragen kunnen activeren.
 * Het bronantwoord telt alleen als de vraag in deze doorloop zelf toepasselijk is.
 */
function pass(answers: Answers, ctx: Answers): { visible: Question[]; active: Answers } {
  const active: Answers = {};
  const visible: Question[] = [];
  const used: Partial<Record<FollowUpGroup, number>> = {};
  for (const q of QUESTIONS) {
    const view = { ...ctx, ...active };
    if (q.showIf && !q.showIf(view)) continue;
    if (q.group && !q.safety) {
      const n = used[q.group] ?? 0;
      if (n >= followUpBudget(q.group, view)) continue;
      used[q.group] = n + 1;
    }
    visible.push(q);
    const v = sanitize(q, answers[q.id]);
    if (v !== undefined) active[q.id] = v;
  }
  return { visible, active };
}

export class ResolverError extends Error {}
const MAX_PASSES = 12;
const sig = (r: { visible: Question[]; active: Answers }) => JSON.stringify([r.visible.map((q) => q.id), r.active]);

/**
 * Afhankelijkheidsbewuste resolver (fixpoint). Start zonder context, zodat vervallen antwoorden
 * zichzelf nooit opnieuw kunnen activeren; daarna herhalen tot zichtbare vragen en actieve antwoorden stabiel zijn.
 * Niet-convergentie faalt expliciet: nooit een schijnbaar volledig rapport.
 */
function walk(answers: Answers): { visible: Question[]; active: Answers } {
  let cur = pass(answers, {});
  let key = sig(cur);
  for (let i = 0; i < MAX_PASSES; i++) {
    const next = pass(answers, cur.active);
    const k = sig(next);
    if (k === key) return next;
    cur = next; key = k;
  }
  throw new ResolverError("Vragenlogica convergeert niet.");
}

/** Zichtbare vragen in volgorde. */
export function visibleQuestions(answers: Answers): Question[] { return walk(answers).visible; }

/** Alleen beantwoorde, toepasselijke vragen. Vervallen vervolgvragen verdwijnen. */
export function activeAnswers(answers: Answers): Answers { return walk(answers).active; }

export function isComplete(answers: Answers): boolean {
  let r: ReturnType<typeof walk>;
  try { r = walk(answers); } catch { return false; }
  const { visible, active } = r;
  return visible.every((q) => active[q.id] !== undefined);
}

// ---------- Migratie van opgeslagen voortgang ----------
/**
 * Alleen eenduidige overeenkomsten worden overgezet. Alles wat ontbreekt of niet meer geldig is,
 * wordt door sanitize verwijderd en dus opnieuw gevraagd.
 */
const MIGRATIONS_21: Record<string, Record<string, string | null>> = {
  Q34: { ab: null }, // A+/A/B gecombineerd: niet eenduidig → opnieuw vragen
  A02: { nee: "geen", onbekend: "onbekend", beslist: null, besproken: null },
  A03: { nee: "nee", onbekend: "onbekend", ja: null },
  A04: { ja: "aanwezig", nee: "geen", onbekend: "onbekend" },
  A05: { onderhoud: null },
  Q30: {},
};
const DROPPED_21 = ["Q36"];
/**
 * 2.2 → 2.2.1: bij woningen blijven alle antwoorden. Bij appartementen worden routevragen alleen overgezet
 * als ze eenduidig privatief zijn; antwoorden met dak, gevel, zolder of kelder (privatief of gemeenschappelijk?)
 * worden nooit stilzwijgend geïnterpreteerd en dus opnieuw gevraagd.
 */
const AMBIGUOUS_APT: Record<string, string[]> = { Q04: ["dak", "gevel"], Q13: ["dak", "gevel"], Q25: ["zolder", "kelder"], Q46: ["dak", "gevel"] };
function migrate22(answers: Answers): Answers {
  const apt = answers.Q02 === "appartement";
  const out: Answers = {};
  for (const [qid, v] of Object.entries(answers ?? {})) {
    if (!apt || !(qid in ROUTE_PAIRS)) { out[qid] = v; continue; }
    // Q07 'Ja, vocht/technieken/dak' maakte bij appartementen geen onderscheid privatief/gemeenschappelijk: enkel 'nee' is eenduidig.
    if (qid === "Q07") { if (v === "nee") out.Q07A = v; continue; }
    if (qid === "Q13") continue; // andere antwoordopties in Q13A: opnieuw vragen
    const vals = Array.isArray(v) ? v : [v];
    if (vals.some((y) => AMBIGUOUS_APT[qid]?.includes(y))) continue;
    out[ROUTE_PAIRS[qid]] = v;
  }
  return out;
}
export function migrateAnswers(answers: Answers, from: "2.1" | "2.2"): Answers {
  if (from === "2.2") return migrate22(answers);
  if (from !== "2.1") return {};
  return migrate22(migrate21(answers));
}
function migrate21(answers: Answers): Answers {
  const out: Answers = {};
  for (const [qid, v] of Object.entries(answers ?? {})) {
    if (DROPPED_21.includes(qid)) continue;
    const map = MIGRATIONS_21[qid];
    if (!map) { out[qid] = v; continue; }
    if (Array.isArray(v)) {
      const vals = v.flatMap((y) => (y in map ? (map[y] === null ? [] : [map[y] as string]) : [y]));
      // Een meerkeuzeantwoord waarvan een deel niet eenduidig overzetbaar is, wordt volledig opnieuw gevraagd.
      if (vals.length === v.length) out[qid] = vals;
    } else {
      const m = v in map ? map[v] : v;
      if (m !== null) out[qid] = m;
    }
  }
  return out;
}

// ---------- Veiligheid ----------
export type SafetyId = "SAFE-01" | "SAFE-02" | "SAFE-03" | "SAFE-04" | "SAFE-05" | "SAFE-06";
export const SAFETY_TEXT: Record<SafetyId, { title: string; text: string }> = {
  "SAFE-01": { title: "Mogelijk gas- of CO-gevaar", text: "Ruikt u gas of gaat een CO-alarm af? Verlaat de woning veilig, laat ramen en deuren open als dat zonder risico kan, gebruik geen schakelaars of open vuur, en contacteer onmiddellijk de storingsdienst van uw netbeheerder of de hulpdiensten (112). Wacht hiervoor niet op een inspectie." },
  "SAFE-02": { title: "Mogelijk gevaar aan de elektrische installatie", text: "Rook, vonken of brandlucht kunnen wijzen op een gevaarlijke situatie. Schakel de installatie alleen uit als dat veilig kan, en contacteer een erkend elektricien of bij acuut gevaar de hulpdiensten (112). Voer zelf geen herstellingen uit." },
  "SAFE-03": { title: "Constructieve signalen: laat dit prioritair beoordelen", text: "Grote, nieuwe of toenemende scheuren of duidelijke vervormingen verdienen een prioritaire beoordeling door een geschikte deskundige, zoals een ingenieur of architect. De Quickscan kan geen uitspraak doen over de stabiliteit." },
  "SAFE-04": { title: "Actieve waterinfiltratie", text: "Laat actieve waterinfiltratie tijdig controleren en neem waar mogelijk maatregelen om verdere schade te beperken, zoals het beschermen van inboedel en afwerking." },
  "SAFE-05": { title: "Mogelijk losse dakonderdelen", text: "Houd afstand van de zone onder het dak en schakel passende deskundige hulp in. Betreed het dak niet zelf." },
  "SAFE-06": { title: "Verzakking of vervorming", text: "U meldt een zichtbare verzakking of vervorming. Laat dit prioritair beoordelen door een geschikte bouwdeskundige, zoals een ingenieur of architect. De Quickscan doet geen uitspraak over de stabiliteit." },
};

/**
 * Veiligheidsmeldingen uit gemeenschappelijke delen of een collectieve installatie (2.2.2: herkomst expliciet).
 * Ze worden altijd getoond, maar verhogen de privatieve barometer niet. Een privatieve melding met hetzelfde
 * SAFE-ID wordt afzonderlijk bepaald (privateSafetyFlags) en dus nooit gemaskeerd.
 */
export function collectiveSafetyFlags(a: Answers): SafetyId[] {
  const f: SafetyId[] = [];
  if (has(a, "H01", "collectief") && (has(a, "Q42", "gas") || has(a, "Q43", "ja"))) f.push("SAFE-01");
  const commonCrack = isApartment(a) && has(a, "SC01", "gemeenschappelijk", "beide");
  if (commonCrack && (has(a, "Q30", "groot") || has(a, "Q31", "groter") || has(a, "Q32", "duidelijk"))) f.push("SAFE-03");
  if (has(a, "KV01", "actief")) f.push("SAFE-04");
  if (commonCrack && has(a, "Q30", "verzakking")) f.push("SAFE-06");
  return f;
}

/** Veiligheidsmeldingen uit privatieve signalen (of signalen met onbekende locatie: geen ongefundeerde geruststelling). */
export function privateSafetyFlags(a: Answers): SafetyId[] {
  const p = privateSignals(a);
  const f: SafetyId[] = [];
  if (!has(p, "H01", "collectief") && (has(p, "Q42", "gas") || has(p, "Q43", "ja"))) f.push("SAFE-01");
  if (has(p, "Q41", "rook")) f.push("SAFE-02");
  if (has(p, "Q30", "groot") || has(p, "Q31", "groter") || has(p, "Q32", "duidelijk")) f.push("SAFE-03");
  if (has(p, "Q14", "lek") || has(p, "Q16", "actief") || has(p, "Q18", "infiltratie") || has(p, "Q28", "actief") || has(p, "Q45", "actief") || has(p, "M01", "actief")) f.push("SAFE-04");
  if (has(p, "Q14", "los") || has(p, "Q15", "los")) f.push("SAFE-05");
  if (has(p, "Q30", "verzakking")) f.push("SAFE-06");
  return f;
}

/** Alle te tonen veiligheidsmeldingen (unie van privatief en gemeenschappelijk). */
export function safetyFlags(a: Answers): SafetyId[] {
  const set = new Set<SafetyId>([...privateSafetyFlags(a), ...collectiveSafetyFlags(a)]);
  return (Object.keys(SAFETY_TEXT) as SafetyId[]).filter((id) => set.has(id));
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

/** Per domein het hoogste gemelde signaal (max, geen som): overlappende vragen tellen nooit dubbel. */
export function domainScores(a: Answers): DomainScores {
  const s: DomainScores = { B: null, V: null, E: null, T: null, S: null };
  const collective = has(a, "H01", "collectief");
  // 2.2.2: signalen met gemeenschappelijke herkomst tellen niet privatief. De hoofdvraag is wel beantwoord: privatief geen signaal (0).
  const common = new Set(commonOriginQuestions(a));
  if (common.has("Q24")) s.V = 0;
  if (common.has("Q30")) s.S = 0;
  for (const [qid, v] of Object.entries(a)) {
    const q = QUESTION_MAP[qid];
    if (!q || v === SKIP) continue;
    for (const id of Array.isArray(v) ? v : [v]) {
      // Collectieve verwarming: de gebruiker is niet verantwoordelijk voor het gemeenschappelijke systeem; enkel veiligheid telt.
      // 2.2.1: ook een gas-/CO-signaal bij collectieve verwarming telt niet privatief; de veiligheidsmelding blijft (SAFE-01).
      if (qid === "Q42" && collective) continue;
      // Scheuren uitsluitend aan gemeenschappelijke delen: zichtbaar via veiligheid en VME, niet privatief gescoord.
      if (common.has(qid)) continue;
      const sc = q.options.find((y) => y.id === id)?.score;
      if (!sc) continue;
      s[sc.d] = Math.max(s[sc.d] ?? 0, sc.v);
    }
  }
  return s;
}

const MAIN_TECH: Record<Domain, string[]> = { B: ["Q14", "Q20"], V: ["Q24"], E: ["Q34", "DI01", "MI01", "G01"], T: ["Q41", "Q42"], S: ["Q30"] };

function knownMain(a: Answers, qid: string): boolean {
  const v = a[qid];
  if (v === undefined || v === SKIP) return false;
  const sc = QUESTION_MAP[qid].options.find((y) => y.id === v)?.score;
  return sc !== null && sc !== undefined;
}

export function coverage(a: Answers): { weighted: number; unknownDomains: Domain[] } {
  let w = 0;
  const unknownDomains: Domain[] = [];
  const ds = domainScores(a);
  const visible = new Set(visibleQuestions(a).map((q) => q.id));
  for (const d of DOMAINS) {
    const qs = MAIN_TECH[d.code].filter((q) => visible.has(q));
    const k = qs.filter((q) => knownMain(a, q)).length;
    w += d.weight * (qs.length ? k / qs.length : 1);
    if (ds[d.code] === null) unknownDomains.push(d.code);
  }
  return { weighted: Math.round(w * 100) / 100, unknownDomains };
}

export function barometer(a: Answers) {
  const ds = domainScores(a);
  const flags = safetyFlags(a);
  const common = collectiveSafetyFlags(a);
  const own = privateSafetyFlags(a);
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
  if (own.length) idx = Math.max(idx, 2);
  if (own.some((f) => f === "SAFE-01" || f === "SAFE-02" || f === "SAFE-03" || f === "SAFE-06")) idx = 3;
  const strongSignal = own.length > 0 || max >= 9;
  const category = insufficient && !strongSignal ? INSUFFICIENT : CATEGORIES[idx];
  return { score, category, level: insufficient && !strongSignal ? null : idx, domainScores: ds, coverage: cov, flags, collectiveFlags: common, privateFlags: own };
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
  if (v === undefined || v === SKIP) return 0;
  const q = QUESTION_MAP[qid];
  return Math.max(0, ...(Array.isArray(v) ? v : [v]).map((id) => q.options.find((y) => y.id === id)?.score?.v ?? 0));
};
const when = (cond: boolean, n: number) => (cond ? n : 0);

export const POINTS: PointDef[] = [
  { id: "AP-DAK-LOS", domain: "B", safety: "SAFE-05", title: "Mogelijk losse dakonderdelen", text: "U vermeldt mogelijk losse dakonderdelen. Dit vraagt om een tijdige beoordeling door een geschikte vakpersoon.", next: "Houd afstand en laat het dak zo snel mogelijk deskundig bekijken.", sev: (a) => when(has(a, "Q14", "los") || has(a, "Q15", "los"), 10) },
  { id: "AP-VOCHT-REGEN", domain: "V", active: true, safety: "SAFE-04", title: "Vocht tijdens of na regen", text: "U merkt vochtsporen of binnenkomend water op tijdens of na regen. Dit maakt een gerichte beoordeling van de mogelijke oorzaken van waterinfiltratie aangewezen.", next: "Laat de mogelijke infiltratieroute (dak, aansluitingen, gevel of goten) gericht beoordelen.", sev: (a) => Math.max(when(has(a, "Q14", "lek"), 10), sc(a, "Q16") >= 8 ? sc(a, "Q16") : 0, sc(a, "Q23") >= 5 ? sc(a, "Q23") : 0, sc(a, "M01") >= 6 ? sc(a, "M01") : 0, when(has(a, "Q18", "infiltratie"), 9), when(has(a, "Q27", "regen") && moistureReported(a), sc(a, "Q24"))) },
  { id: "AP-SCHEUR-TOENAME", domain: "S", safety: "SAFE-03", active: true, title: "Toenemende scheuren", text: "U geeft aan dat scheuren groot zijn of groter worden. Een tijdige beoordeling door een geschikte deskundige is aangewezen.", next: "Laat de scheuren prioritair beoordelen door een ingenieur of architect.", sev: (a) => Math.max(when(!has(a, "SC01", "gemeenschappelijk") && (has(a, "Q30", "groot") || has(a, "Q31", "groter")), 10), when(has(a, "Q32", "duidelijk") && !has(a, "Q30", "verzakking"), 9)) },
  { id: "AP-VERZAKKING", domain: "S", safety: "SAFE-06", active: true, title: "Verzakking of vervorming", text: "U meldt een zichtbare verzakking of vervorming. Laat dit prioritair beoordelen door een geschikte bouwdeskundige; de Quickscan maakt geen diagnose over de stabiliteit.", next: "Contacteer een ingenieur of architect voor een beoordeling ter plaatse.", sev: (a) => when(has(a, "Q30", "verzakking") && !has(a, "SC01", "gemeenschappelijk"), 10) },
  { id: "AP-ELEK", domain: "T", safety: "SAFE-02", title: "Elektrische installatie", text: "U vermeldt aandachtspunten bij de elektrische installatie. Het is aangewezen deze informatie te vergelijken met eventuele keuringsverslagen en indien nodig een bevoegde vakpersoon te raadplegen.", next: "Laat de installatie nakijken door een erkend elektricien.", sev: (a) => Math.max(sc(a, "Q41") >= 6 ? sc(a, "Q41") : 0, sc(a, "Q40") >= 4 ? sc(a, "Q40") : 0) },
  { id: "AP-VERW", domain: "T", safety: "SAFE-01", title: "Verwarming", text: "U geeft aan dat de verwarmingsinstallatie verouderd is, problemen vertoont of al langer niet onderhouden werd. Ouderdom alleen is geen gebrek. Een gerichte controle kan helpen om onderhoud, herstel of vervanging beter af te wegen.", next: "Laat de installatie controleren en onderhouden door een erkend technicus.", sev: (a) => Math.max(sc(a, "Q42") >= 3 && !has(a, "H01", "collectief") ? sc(a, "Q42") : 0, when(has(a, "H02", "gt20") && has(a, "Q44", "gt3j"), 3)) },
  { id: "AP-VOCHT-TERUG", domain: "V", active: true, title: "Terugkerend vocht", text: "U geeft aan dat een eerder behandeld vochtprobleem opnieuw optreedt. Het is verstandig om de mogelijke oorzaak opnieuw te laten onderzoeken voordat herstelwerken worden herhaald.", next: "Laat eerst de oorzaak onderzoeken voordat u opnieuw herstelt.", sev: (a) => Math.max(when(hasR(a, "Q07", "vocht"), 7), sc(a, "Q12")) },
  { id: "AP-KELDER", domain: "V", active: true, title: "Keldervocht", text: "U vermeldt water in de kelder. De omstandigheden waarin het probleem ontstaat kunnen helpen bepalen welke onderdelen nader onderzocht moeten worden.", next: "Noteer wanneer het water verschijnt; dat helpt bij een gerichte beoordeling.", sev: (a) => sc(a, "Q28") },
  { id: "AP-VOCHTPLEKKEN", domain: "V", active: true, title: "Vochtplekken", text: "U vermeldt vochtplekken in de woning. De herkomst van het vocht bepaalt welke aanpak zinvol is; dat vraagt een beoordeling ter plaatse.", next: "Laat de oorzaak beoordelen vóór u afwerkingen herstelt.", sev: (a) => (has(a, "Q24", "vochtplekken") ? Math.max(sc(a, "Q24"), sc(a, "Q26")) : 0) },
  { id: "AP-SCHIMMEL", domain: "V", active: true, title: "Schimmel of condens", text: "U vermeldt terugkerende condens of schimmel. Ventilatie, vochtbelasting, oppervlaktetemperaturen en andere mogelijke oorzaken moeten in samenhang worden bekeken.", next: "Bekijk ventilatie en isolatie samen met het vochtprobleem.", sev: (a) => (has(a, "Q24", "terugkerend") ? Math.max(5, sc(a, "Q29")) : 0) },
  { id: "AP-BADKAMER", domain: "V", active: true, title: "Vocht of waterdichting in de badkamer", text: "U vermeldt vocht of problemen met de waterdichting in de badkamer. Dit betekent niet automatisch dat de badkamer vernieuwd moet worden; de oorzaak bepaalt de aanpak.", next: "Laat voegen, kitwerk en waterdichting gericht nakijken.", sev: (a) => sc(a, "AB02") },
  { id: "AP-DAK-SLIJTAGE", domain: "B", title: "Dakslijtage", text: "U geeft aan dat het dak zichtbare slijtage of beschadiging vertoont. Een gerichte controle van de dakbedekking en aansluitingen kan helpen om de nodige vervolgstappen beter te bepalen.", next: "Laat de dakbedekking en aansluitingen gericht controleren.", sev: (a) => (has(a, "Q14", "slijtage", "beschadigd") ? Math.max(sc(a, "Q14"), sc(a, "Q15")) : 0) },
  { id: "AP-DAK-TERUG", domain: "B", active: true, title: "Terugkerend dakprobleem", text: "U geeft aan dat een eerder hersteld dakprobleem opnieuw optreedt. Het is zinvol de oorzaak opnieuw te laten bekijken voordat dezelfde herstelling herhaald wordt.", next: "Laat het dak opnieuw gericht beoordelen.", sev: (a) => when(has(a, "Q07", "dak"), 7) },
  { id: "AP-GOTEN", domain: "B", title: "Dakgoten en regenafvoer", text: "U vermeldt problemen met dakgoten of regenafvoer. Een goed werkende afvoer beschermt dak, gevel en fundering tegen vocht.", next: "Laat goten en afvoeren nakijken en waar nodig herstellen.", sev: (a) => (sc(a, "Q19") >= 7 ? sc(a, "Q19") : 0) },
  { id: "AP-SANITAIR", domain: "T", active: true, title: "Sanitair en afvoer", text: "U vermeldt terugkerende problemen met sanitair of afvoer. Een verdere beoordeling kan nuttig zijn, zeker wanneer ook andere renovatiewerken gepland zijn.", next: "Laat leidingen en afvoeren bekijken vóór nieuwe afwerkingen.", sev: (a) => (sc(a, "Q45") >= 7 ? sc(a, "Q45") : 0) },
  { id: "AP-TECH-TERUG", domain: "T", active: true, title: "Terugkerend technisch probleem", text: "U geeft aan dat een eerder hersteld technisch probleem opnieuw optreedt. Een gerichte controle helpt om de oorzaak te achterhalen.", next: "Laat de betrokken installatie opnieuw nakijken.", sev: (a) => when(hasR(a, "Q07", "technieken"), 7) },
  { id: "AP-EPC", domain: "E", title: "Energieprestatie (EPC E/F)", text: "Het opgegeven EPC-label wijst op mogelijke kansen voor energetische verbetering. Welke ingrepen zinvol zijn, hangt af van de bestaande isolatie, technieken en renovatieplannen.", next: "Bekijk isolatie, beglazing en verwarming als één geheel.", sev: (a) => (has(a, "Q34", "e", "f") ? sc(a, "Q34") : 0) },
  { id: "AP-DAKISOL", domain: "E", title: "Dak niet of beperkt geïsoleerd", text: "U geeft aan dat het dak niet of slechts gedeeltelijk geïsoleerd is. Dakisolatie is vaak een van de eerste energetische verbeteringen om te bekijken.", next: "Bekijk dakisolatie samen met eventuele dakwerken.", sev: (a) => (has(a, "DI01", "niet", "gedeeltelijk") ? sc(a, "DI01") : 0) },
  { id: "AP-ENKELGLAS", domain: "E", title: "Enkel glas", text: "U geeft aan dat er voornamelijk enkel glas aanwezig is. Dat is een energetisch aandachtspunt; het zegt niets over de technische staat van het schrijnwerk.", next: "Bekijk beglazing en schrijnwerk samen met de gevel en ventilatie.", sev: (a) => (has(a, "G01", "enkel") ? 6 : 0) },
  { id: "AP-MUURISOL", domain: "E", title: "Buitenmuren niet geïsoleerd", text: "U geeft aan dat de buitenmuren niet geïsoleerd zijn. Welke isolatiemethode zinvol is, hangt af van de muuropbouw en de gevel.", next: "Laat bekijken welke muurisolatie technisch past bij uw gevel.", sev: (a) => (has(a, "MI01", "niet") ? 6 : 0) },
  { id: "AP-VLOERISOL", domain: "E", title: "Vloer niet geïsoleerd", text: "U geeft aan dat de vloer op het gelijkvloers niet geïsoleerd is. Dit is vooral relevant wanneer u vloerwerken plant.", next: "Bekijk vloerisolatie samen met eventuele vloerwerken.", sev: (a) => (has(a, "VL02", "nee") && plans(a, "vloeren") ? 4 : 0) },
  { id: "AP-LEIDINGEN", domain: "T", title: "Oudere sanitaire leidingen", text: "De sanitaire leidingen zijn volgens u ouder of vermoedelijk origineel. Ouderdom alleen is geen gebrek, maar het is zinvol hun toestand te bekijken vóór nieuwe afwerkingen.", next: "Laat de leidingen bekijken wanneer u badkamer, keuken of vloeren vernieuwt.", sev: (a) => (has(a, "SL01", "gt25", "origineel") ? 3 : 0) },
  { id: "AP-VENT", domain: "T", title: "Ventilatie", text: "U geeft aan dat de ventilatie beperkt, onduidelijk of defect is. Ventilatie speelt een rol bij binnenluchtkwaliteit en vochtbeheersing.", next: "Laat de ventilatie beoordelen, zeker bij isolatie- of raamwerken.", sev: (a) => (sc(a, "Q39") >= 3 ? sc(a, "Q39") + (moistureReported(a) ? 1 : 0) : 0) },
  { id: "AP-CONDENS-GLAS", domain: "B", title: "Condens tussen glasplaten", text: "U vermeldt condens tussen de glasplaten. Dit kan wijzen op een probleem met de beglazing dat nader beoordeeld moet worden.", next: "Laat de beglazing nakijken.", sev: (a) => when(has(a, "Q21", "ja"), 5) },
  { id: "AP-TOCHT", domain: "B", title: "Tocht", text: "U ervaart tocht langs gesloten ramen of deuren. De aansluitingen, dichtingen en algemene toestand van het schrijnwerk verdienen mogelijk extra aandacht.", next: "Laat dichtingen en aansluitingen van het schrijnwerk bekijken.", sev: (a) => Math.max(when(has(a, "Q20", "tocht"), 5), sc(a, "Q22") >= 3 ? sc(a, "Q22") : 0) },
  { id: "AP-RAMEN-OUD", domain: "B", title: "Verouderde ramen", text: "U vermeldt dat uw ramen verouderd of beschadigd zijn. De werkelijke toestand, luchtdichtheid en beglazing bepalen of onderhoud, herstel of vervanging zinvol kan zijn.", next: "Laat de toestand van het schrijnwerk beoordelen vóór u kiest voor vervanging.", sev: (a) => (has(a, "Q20", "verouderd", "beschadigd") ? sc(a, "Q20") : 0) },
  { id: "AP-GEVEL", domain: "B", title: "Gevel", text: "U vermeldt verwering of beschadigde voegen of afwerking aan de gevel. Een gerichte beoordeling helpt bepalen of onderhoud of herstel nodig is.", next: "Laat de gevel en aansluitingen bekijken.", sev: (a) => (has(a, "Q18", "verwering", "voegen") ? sc(a, "Q18") : 0) },
  { id: "AP-COMFORT", domain: "E", title: "Thermisch comfort", text: "U ervaart temperatuurproblemen in bepaalde ruimtes. Isolatie, beglazing, zonwering, ventilatie en verwarming zijn mogelijke aandachtspunten voor verdere beoordeling.", next: "Bekijk comfortproblemen samen met isolatie en verwarming.", sev: (a) => sc(a, "Q37") },
  { id: "AP-HERHAALD-ANDERS", domain: "B", title: "Terugkerend probleem", text: "U geeft aan dat een eerder hersteld probleem opnieuw optreedt. Omdat het betrokken onderdeel niet gekend is, vormt dit een algemeen aandachtspunt.", next: "Bespreek het probleem tijdens een beoordeling ter plaatse.", sev: (a) => when(hasR(a, "Q07", "anders"), 4) },
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
  const flags = privateSafetyFlags(a);
  const priv = privateSignals(a);
  const list = POINTS.map((p, order) => ({ p, order, sev: p.sev(priv) }))
    .filter((y) => y.sev >= 3)
    .map((y) => ({ ...y, safe: !!y.p.safety && flags.includes(y.p.safety) }))
    .sort((p, q) => Number(q.safe) - Number(p.safe) || q.sev - p.sev || Number(!!q.p.active) - Number(!!p.p.active) || p.order - q.order);
  // Overlappende signalen samenvoegen: maximaal één vochtpunt en één energiepunt in de top.
  const out: AttentionPoint[] = [];
  const seen = new Set<Domain>();
  for (const y of list) {
    if ((y.p.domain === "V" || y.p.domain === "E") && seen.has(y.p.domain) && !y.safe) continue;
    seen.add(y.p.domain);
    out.push({ id: y.p.id, domain: y.p.domain, title: y.p.title, text: y.p.text, next: y.p.next, severity: y.sev, safety: y.safe });
    if (out.length >= limit) break;
  }
  return out;
}

/** Energetische aandachtspunten: onderscheid tussen gekende afwezigheid en onbekende toestand. */
export function energyNotes(a: Answers): string[] {
  const n: string[] = [];
  const part = (q: string, name: string) => {
    if (has(a, q, "niet", "nee")) n.push(`${name}: volgens u niet geïsoleerd.`);
    else if (has(a, q, "gedeeltelijk", "beperkt")) n.push(`${name}: gedeeltelijk of beperkt geïsoleerd.`);
    else if (has(a, q, "onbekend", "spouw", "massief") || a[q] === SKIP) n.push(`${name}: isolatietoestand onbekend. Dat betekent niet dat er geen isolatie is.`);
  };
  part("DI01", "Dak");
  part("MI01", "Buitenmuren");
  part("VL02", "Vloer");
  if (has(a, "G01", "enkel")) n.push("Beglazing: voornamelijk enkel glas.");
  else if (has(a, "G01", "dubbel", "gemengd")) n.push("Beglazing: ouder dubbel glas of verschillende soorten.");
  if (has(a, "Q34", "b")) n.push("EPC B: een goede energieprestatie; geen ernstig renovatieprobleem.");
  if (has(a, "Q34", "e", "f")) n.push("EPC E of F: er zijn waarschijnlijk energetische verbetermogelijkheden.");
  return n;
}

/** Contextmeldingen zonder invloed op de barometer: asbest, stedenbouw, riolering, vloeropbouw. */
export function contextNotices(a: Answers): { id: string; title: string; text: string }[] {
  const n: { id: string; title: string; text: string }[] = [];
  if (has(a, "AS02", "beschadigd", "werken", "beide")) n.push({ id: "NOT-ASBEST-WERK", title: "Asbesthoudende materialen en werken", text: "U vermeldt gekende asbesthoudende toepassingen die mogelijk beschadigd zijn of waaraan werken gepland zijn. Raadpleeg het asbestattest en schakel vóór werken een bevoegde deskundige in. De Quickscan stelt geen asbestdiagnose." });
  else if (has(a, "AS01", "attest_toepassingen", "gekend")) n.push({ id: "NOT-ASBEST", title: "Gekende asbesthoudende toepassingen", text: "Volgens uw antwoorden zijn er asbesthoudende toepassingen gekend. Raadpleeg het asbestattest vóór u werken plant. De Quickscan stelt geen asbestdiagnose." });
  else if (has(a, "AS01", "geen_attest", "onbekend")) n.push({ id: "NOT-ASBEST-ATTEST", title: "Asbestinformatie ontbreekt", text: "Er is geen asbestattest gekend. Dat betekent niet dat er asbest aanwezig of afwezig is. Bij verkoop of werken is een attest of beoordeling door een bevoegde deskundige aangewezen." });
  else if (has(a, "AS01", "attest_geen")) n.push({ id: "NOT-ASBEST-OK", title: "Asbestattest beschikbaar", text: "Volgens het attest zijn geen asbesthoudende materialen vermeld. De Quickscan kan niet bevestigen dat het pand asbestvrij is; het attest blijft de referentie." });
  if (has(a, "ST01", "ja", "onduidelijk")) n.push({ id: "NOT-STEDENBOUW", title: "Stedenbouwkundige aandachtspunten", text: "U vermeldt mogelijke stedenbouwkundige aandachtspunten of onduidelijkheden. Laat de documenten en de vergunningstoestand controleren. De Quickscan doet geen uitspraak over vergunningen." });
  if (has(a, "RI01", "septisch", "niet", "onbekend")) n.push({ id: "NOT-RIOLERING", title: "Afvoer van afvalwater", text: "De aansluiting op de openbare riolering is niet gekend of niet aanwezig. Een septische put is op zich geen probleem; laat de situatie bekijken als u sanitaire of buitenwerken plant. Dit is geen conformiteitsbeoordeling." });
  if (has(a, "VL01", "grond", "hout", "beton") && plans(a, "vloeren")) n.push({ id: "NOT-VLOER", title: "Vloeropbouw bij vloerwerken", text: "De bestaande vloeropbouw bepaalt mee welke vloer- en isolatiewerken mogelijk zijn. Dit wijst niet op een gebrek." });
  return n;
}

// ---------- Informatiezekerheid ----------
const UNKNOWN_DEFS: { id: string; label: string; q: string; ids: string[] }[] = [
  { id: "UNK-DAK", label: "de toestand van het dak", q: "Q14", ids: ["onbekend"] },
  { id: "UNK-RAMEN", label: "de toestand van de ramen", q: "Q20", ids: ["onbekend"] },
  { id: "UNK-VOCHT", label: "mogelijke vochtproblemen", q: "Q24", ids: ["onbekend"] },
  { id: "UNK-SCHEUR", label: "scheuren of vervormingen", q: "Q30", ids: ["onbekend"] },
  { id: "UNK-EPC", label: "het EPC-label", q: "Q34", ids: ["onbekend"] },
  { id: "UNK-DAKISOL", label: "de dakisolatie", q: "DI01", ids: ["onbekend"] },
  { id: "UNK-MUURISOL", label: "de muurisolatie", q: "MI01", ids: ["onbekend", "spouw", "massief"] },
  { id: "UNK-GLAS", label: "het type beglazing", q: "G01", ids: ["onbekend"] },
  { id: "UNK-ELEK", label: "de elektrische installatie", q: "Q41", ids: ["onbekend"] },
  { id: "UNK-KEURING", label: "het elektrische keuringsverslag", q: "Q40", ids: ["geen", "onbekend"] },
  { id: "UNK-VERW", label: "de verwarming", q: "Q42", ids: ["onbekend"] },
  { id: "UNK-VERWTYPE", label: "het type verwarming", q: "H01", ids: ["onbekend"] },
  { id: "UNK-GEMEEN", label: "de gemeenschappelijke delen", q: "A01", ids: ["onbekend"] },
  { id: "UNK-VENT", label: "de ventilatie", q: "Q39", ids: ["onbekend"] },
  { id: "UNK-SANITAIR", label: "sanitair en afvoer", q: "Q45", ids: ["onbekend"] },
  { id: "UNK-ASBEST", label: "mogelijke asbesthoudende materialen", q: "AS01", ids: ["onbekend", "geen_attest"] },
  { id: "UNK-BOUWJAAR", label: "het bouwjaar", q: "Q03", ids: ["onbekend"] },
];
const MAIN_UNKNOWN = ["Q14", "Q20", "Q24", "Q30", "Q34", "Q41", "Q42", "DI01", "MI01", "G01"];

export function unknownInformation(a: Answers) {
  const items = UNKNOWN_DEFS.filter((u) => has(a, u.q, ...u.ids)).map(({ id, label }) => ({ id, label }));
  const skipped = Object.entries(a).filter(([, v]) => v === SKIP).map(([q]) => ({ id: `SKIP-${q}`, label: QUESTION_MAP[q].text.replace(/\?$/, "").toLowerCase() }));
  const mainUnknown = MAIN_UNKNOWN.filter((q) => has(a, q, "onbekend")).length;
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
  return { level, ...LEVELS[level], items: shown, skipped, sentence };
}

function joinNl(xs: string[]) {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} en ${xs[xs.length - 1]}`;
}

// ---------- Combinaties ----------
export const COMBINATIONS = [
  { id: "COM-01", title: "Dak en isolatie", text: "Bereid dakwerken en dakisolatie samen voor, zodat u het dak maar één keer moet openen.", test: (a: Answers) => plans(a, "dak") && (plans(a, "isolatie") || has(a, "DI01", "niet", "gedeeltelijk", "beperkt")) },
  { id: "COM-02", title: "Ramen en gevel", text: "Stem de raamaansluitingen en de gevelafwerking of gevelisolatie op elkaar af.", test: (a: Answers) => plans(a, "ramen") && (plans(a, "gevel") || plans(a, "isolatie")) },
  { id: "COM-03", title: "Isolatie en ventilatie", text: "Beoordeel ventilatie en luchtdichtheid samen wanneer u isoleert.", test: (a: Answers) => plans(a, "isolatie") && (has(a, "Q39", "beperkt", "defect", "onbekend") || has(a, "Q24", "terugkerend")) },
  { id: "COM-04", title: "Verwarming en isolatie", text: "Laat de toekomstige warmtebehoefte beoordelen vóór u een nieuwe installatie kiest.", test: (a: Answers) => plans(a, "verwarming") && plans(a, "isolatie") },
  { id: "COM-05", title: "Vocht en binnenafwerking", text: "Onderzoek eerst de mogelijke vochtoorzaak, vóór definitieve afwerking.", test: (a: Answers) => (domainScores(a).V ?? 0) >= 5 && (plans(a, "interieur") || plans(a, "vloeren")) },
  { id: "COM-06", title: "Elektriciteit en binnenrenovatie", text: "Plan elektrische aanpassingen vóór nieuwe wand- en vloerafwerkingen.", test: (a: Answers) => plans(a, "elektriciteit") && (plans(a, "interieur") || plans(a, "vloeren")) },
  { id: "COM-07", title: "Sanitair en vloeren", text: "Bekijk leidingen en afvoeren vóór de vloerafwerking.", test: (a: Answers) => (plans(a, "sanitair") || has(a, "SL01", "gt25", "origineel")) && plans(a, "vloeren") },
  { id: "COM-08", title: "Buitenschil als geheel", text: "Bereid dak, gevel en schrijnwerk voor als één samenhangend geheel.", test: (a: Answers) => ["dak", "gevel", "ramen"].filter((w) => plans(a, w)).length >= 2 },
  { id: "COM-09", title: "Vloer en vloerisolatie", text: "Combineer nieuwe vloerafwerking met de beoordeling van vloerisolatie, zodat u de vloer maar één keer opbreekt.", test: (a: Answers) => plans(a, "vloeren") && has(a, "VL02", "nee", "gedeeltelijk", "onbekend") },
  { id: "COM-10", title: "Asbest vóór werken", text: "Laat gekende of mogelijke asbesthoudende toepassingen vóór de start van werken beoordelen door een bevoegde deskundige.", test: (a: Answers) => plannedCount(a) > 0 && has(a, "AS01", "attest_toepassingen", "gekend") },
];

export function combinationAdvice(a: Answers) {
  return COMBINATIONS.filter((c) => c.test(a)).slice(0, 3).map(({ id, title, text }) => ({ id, title, text }));
}

// ---------- Vervolgstap en droneadvies (los van de barometer) ----------
/** Productneutraal zolang de definitieve commerciële koppeling niet vastligt. Geen prijzen of pakketnamen. */
export const NEXT_STEP = {
  title: "Een vrijblijvende professionele vervolgstap",
  text: "Wilt u de aandachtspunten uit dit rapport laten bevestigen of beter begrijpen? Een beoordeling ter plaatse door DIMAC geeft u een onderbouwd beeld van de toestand van de woning. We bespreken graag vrijblijvend welke vervolgstap het best bij uw situatie past.",
};

// ---------- Appartement: mede-eigendom ----------
export const APARTMENT_TITLE = "Gemeenschappelijke delen en mogelijke toekomstige kosten";
export const APARTMENT_BAROMETER_NOTE = "Deze renovatiebarometer beoordeelt de opgegeven signalen binnen het appartement. Ernstige aandachtspunten aan gemeenschappelijke delen worden afzonderlijk vermeld en vereisen eveneens opvolging.";
export const APARTMENT_NOTES = [
  "Dit onderdeel is gebaseerd op de informatie die u zelf opgeeft. De gemeenschappelijke delen werden niet ter plaatse geïnspecteerd en wegen niet mee in de privatieve barometer.",
  "Welke delen gemeenschappelijk of privatief zijn (bijvoorbeeld ramen, gevels of balkons), hangt af van de basisakte en de relevante documenten.",
  "Een aangekondigde renovatie of een beperkt reservefonds betekent niet automatisch dat u persoonlijk een bepaald bedrag verschuldigd bent. De exacte impact hangt af van de beslissingen van de VME en de kostenverdeling.",
];
const VME_TECH = ["A01", "CD01", "CL01"];
const VME_PLANNED = ["A02", "A06", "A07"];
const VME_FIN = ["A03", "A04", "A05"];
export const VME_QUESTIONS = [...VME_TECH, ...VME_PLANNED, ...VME_FIN];

export function apartmentSection(a: Answers) {
  if (!isApartment(a)) return null;
  const toItems = (qs: string[]) => qs.filter((q) => a[q] !== undefined).map((q) => ({ label: QUESTION_MAP[q].text, value: LABEL(q, a[q]) }));
  const tech: string[] = [], planned: string[] = [], fin: string[] = [], syndic: string[] = [];
  if (has(a, "A01", "enkele", "duidelijk") || has(a, "CD01", "verouderd", "problemen")) tech.push("U vermeldt aandachtspunten aan de gemeenschappelijke delen. Ernstige collectieve signalen verdienen opvolging via de syndicus, ook al wegen ze niet mee in de privatieve barometer.");
  if (has(a, "Q07A", "gemeenschappelijk")) tech.push("U meldt dat een eerder hersteld probleem aan gemeenschappelijke delen, zoals dak of gevel, opnieuw optreedt. Dit telt niet mee in de privatieve barometer; laat de oorzaak via de syndicus opvolgen.");
  if (commonMoistureOnly(a)) tech.push("U meldt een vochtprobleem uitsluitend in de gemeenschappelijke kelder of berging. Dit telt niet mee in de privatieve barometer; laat de oorzaak via de syndicus opvolgen.");
  else if (has(a, "Q25A", "gemkelder")) tech.push("U meldt vocht zowel in het appartement als in de gemeenschappelijke kelder of berging. Alleen de signalen binnen het appartement tellen mee in de privatieve barometer; het keldervocht wordt hier afzonderlijk vermeld.");
  if (has(a, "Q25A", "onbekend")) tech.push("U weet niet precies waar het vochtprobleem zich bevindt. De Quickscan kan daarom niet bepalen of het privatieve of gemeenschappelijke delen betreft; de gemelde signalen worden voorzichtigheidshalve meegewogen. Laat de locatie en oorzaak ter plaatse verduidelijken.");
  if (has(a, "KV01", "soms", "regelmatig", "actief")) tech.push(has(a, "KV01", "actief") ? "U meldt actieve waterinstroom in de gemeenschappelijke kelder of berging. Verwittig de syndicus onmiddellijk." : "U meldt water in de gemeenschappelijke kelder of berging. Dit telt niet mee in de privatieve barometer; meld het aan de syndicus.");
  if (has(a, "H01", "collectief") && has(a, "Q42", "storingen", "ouder", "gas")) tech.push(has(a, "Q42", "gas") ? "U meldt een mogelijk gas- of CO-signaal bij de collectieve verwarming. Volg eerst het veiligheidsadvies; verwittig daarna de syndicus." : "U meldt aandachtspunten bij de collectieve verwarming. Dat is een gemeenschappelijke installatie en telt niet mee in de privatieve barometer; meld het aan de syndicus.");
  if (has(a, "SC01", "onbekend") && has(a, "Q30", "haar", "groot", "verzakking")) tech.push("U weet niet of de scheuren of vervormingen binnen het appartement of aan gemeenschappelijke delen zitten. Ze worden voorzichtigheidshalve meegewogen; laat de locatie en ernst ter plaatse beoordelen. De Quickscan bepaalt niet wie verantwoordelijk is.");
  if (has(a, "SC01", "gemeenschappelijk", "beide") && has(a, "Q30", "groot", "verzakking")) tech.push("U meldt scheuren of vervormingen aan gemeenschappelijke delen. Laat dit prioritair beoordelen via de syndicus door een geschikte deskundige. De Quickscan doet geen stabiliteitsdiagnose en bepaalt niet wie verantwoordelijk is.");
  if (has(a, "CL01", "nee")) tech.push("De gemeenschappelijke leidingen zijn volgens u niet recent vernieuwd. Dat is geen bewezen gebrek, maar wel een onderwerp voor het onderhoudsplan.");
  if (has(a, "A02", "ingrijpend", "middel")) planned.push("Er zijn middelgrote of ingrijpende werken aan de gemeenschappelijke delen aangekondigd.");
  else if (has(a, "A02", "klein")) planned.push("Er zijn kleine onderhoudswerken aangekondigd.");
  else if (has(a, "A02", "besproken")) planned.push("Er werden werken besproken, maar de omvang is nog niet bekend.");
  if (has(a, "A07", "besproken")) planned.push("De werken zijn besproken maar nog niet goedgekeurd door de algemene vergadering.");
  if (has(a, "A07", "goedgekeurd")) planned.push("De werken zijn goedgekeurd door de algemene vergadering.");
  if (has(a, "A07", "uitgevoerd")) planned.push("De werken zijn al (deels) uitgevoerd.");
  if (has(a, "A03", "substantieel")) fin.push("Er zijn substantiële bijkomende bijdragen aangekondigd. Vraag na waarop ze betrekking hebben en hoe ze verdeeld worden.");
  else if (has(a, "A03", "beperkt", "omvang")) fin.push("Er zijn bijkomende bijdragen aangekondigd.");
  if (has(a, "A04", "beperkt", "geen")) fin.push("Het reservefonds is volgens u beperkt of niet gekend. Of een fonds toereikend is, kan de Quickscan niet beoordelen.");
  if (has(a, "A05", "geen", "onbekend")) fin.push("Er zijn geen VME-documenten beschikbaar of gekend.");
  // Maximaal drie concrete vragen voor de syndicus, in vaste prioriteit. Veiligheid en constructie eerst.
  if (has(a, "SC01", "gemeenschappelijk", "beide") && has(a, "Q30", "groot", "verzakking")) syndic.push("Zijn de scheuren of vervormingen aan de gemeenschappelijke delen gekend en werd er al een deskundige ingeschakeld?");
  if (has(a, "Q07A", "gemeenschappelijk") || has(a, "KV01", "soms", "regelmatig", "actief")) syndic.push("Welke herstellingen aan dak, gevel of kelder zijn gepland en is de oorzaak onderzocht?");
  if (has(a, "A02", ...VME_WORKS)) syndic.push("Welke werken zijn gepland, wat is hun stand van zaken en hoe worden de kosten verdeeld?");
  if (has(a, "A03", "beperkt", "substantieel", "omvang")) syndic.push("Op welke werken hebben de bijzondere bijdragen betrekking en wanneer worden ze opgevraagd?");
  if (has(a, "A04", "beperkt", "geen", "onbekend")) syndic.push("Hoe groot is het reservefonds en waarvoor is het bestemd?");
  if (has(a, "CD01", "verouderd", "problemen", "onbekend") || has(a, "CL01", "nee", "onbekend")) syndic.push("Bestaat er een meerjarig onderhoudsplan voor dak, gevel en leidingen?");
  if (has(a, "A05", "geen", "onbekend")) syndic.push("Kunt u de verslagen van de laatste algemene vergaderingen bezorgen?");
  const groups = [
    { title: "Technische informatie over de gemeenschappelijke delen", items: toItems(VME_TECH), signals: tech },
    { title: "Geplande werken", items: toItems(VME_PLANNED), signals: planned },
    { title: "Financiële onzekerheden", items: toItems(VME_FIN), signals: fin },
  ];
  return { title: APARTMENT_TITLE, items: groups.flatMap((g) => g.items), signals: groups.flatMap((g) => g.signals), groups, syndic: syndic.slice(0, 3), notes: APARTMENT_NOTES };
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
function LABEL(qid: string, v: string | string[] | undefined) {
  if (v === undefined) return "Niet ingevuld";
  if (v === SKIP) return "Overgeslagen";
  const q = QUESTION_MAP[qid];
  return (Array.isArray(v) ? v : [v]).map((id) => q.options.find((y) => y.id === id)?.label ?? id).join(", ");
}

/** Contextgegevens apart van de technische score, voor later hergebruik (bv. budgetindicator). */
export function contextData(a: Answers) {
  const val = (q: string) => (a[q] === undefined ? null : a[q]);
  return {
    version: QUESTION_VERSION,
    propertyType: val("Q02"), buildPeriod: val("Q03"),
    livingArea: val(isApartment(a) ? "O02" : "O01"),
    lastMajorRenovation: val("R01"), renovatedParts: val(isApartment(a) ? "Q04A" : "Q04"),
    basement: val("K01"), attic: val("Z01"), outbuildings: val("B01"),
    documents: val("Q06"), urbanPlanning: val("ST01"),
    floorBuild: val("VL01"), sewer: val("RI01"), pipesAge: val("SL01"), asbestos: val("AS01"),
    kitchenAge: val("AK01"), bathroomAge: val("AB01"), plannedWorks: val(isApartment(a) ? "Q46A" : "Q46"),
  };
}

export const LIMITS_TEXT = "De Quickscan is een eerste analyse op basis van uw eigen antwoorden. Er vond geen inspectie ter plaatse plaats. Deze analyse vormt geen diagnose, keuring, attest of garantie en vervangt geen beoordeling door een vakpersoon. Er worden geen uitspraken gedaan over asbest, vergunningen of de stabiliteit. De barometer geeft de door u opgegeven signalen weer, niet een bewezen renovatienoodzaak. De gebruikte wegingen zijn ontwerpwaarden.";

export function buildReport(answers: Answers) {
  const a = activeAnswers(answers);
  const b = barometer(a);
  const points = attentionPoints(a);
  const unknown = unknownInformation(a);
  const combos = combinationAdvice(a);
  const apartment = apartmentSection(a);
  const drone = droneAdvice(a);
  const energy = energyNotes(a);
  const notices = contextNotices(a);
  // 2.2.2: per herkomst een afzonderlijke melding, zodat een privatief risico nooit door een gemeenschappelijk risico met hetzelfde ID verdwijnt.
  const flags = b.flags.flatMap((id) => [
    ...(b.privateFlags.includes(id) ? [{ id, ...SAFETY_TEXT[id], collective: false }] : []),
    ...(b.collectiveFlags.includes(id) ? [{ id, ...SAFETY_TEXT[id], title: `${SAFETY_TEXT[id].title} (gemeenschappelijke delen of installatie)`, collective: true }] : []),
  ]);
  const apt = isApartment(a);
  const profile = [
    { label: "Situatie", value: LABEL("Q01", a.Q01) },
    { label: "Woningtype", value: LABEL("Q02", a.Q02) },
    { label: "Bouwperiode", value: LABEL("Q03", a.Q03) },
    { label: "Geschatte bewoonbare oppervlakte", value: LABEL(apt ? "O02" : "O01", a[apt ? "O02" : "O01"]) },
    { label: "Laatste grondige renovatie", value: LABEL("R01", a.R01) },
    { label: apt ? "Gekende renovaties binnen het appartement" : "Gekende renovaties", value: LABEL(apt ? "Q04A" : "Q04", a[apt ? "Q04A" : "Q04"]) },
    ...(apt ? [] : [
      { label: "Kelder of kruipruimte", value: LABEL("K01", a.K01) },
      { label: "Zolder", value: LABEL("Z01", a.Z01) },
    ]),
    { label: apt ? "Geplande werken binnen het appartement" : "Geplande werken", value: LABEL(apt ? "Q46A" : "Q46", a[apt ? "Q46A" : "Q46"]) },
  ];
  const summary = [
    b.category.id === "onvoldoende"
      ? "Op basis van uw antwoorden is er onvoldoende informatie voor een algemene renovatie-indicatie."
      : `Op basis van uw antwoorden valt uw ${apt ? "appartement (privatieve delen)" : "woning"} in de categorie "${b.category.label}".`,
    points.length
      ? `De belangrijkste aandachtspunten zijn: ${joinNl(points.map((p) => p.title.toLowerCase()))}.`
      : "U meldt geen uitgesproken aandachtspunten.",
    flags.length ? "Er zijn veiligheidsrelevante signalen gemeld; volg de veiligheidsadviezen in dit rapport." : "",
    apt && (flags.some((f) => f.collective) || apartment?.signals.length) ? APARTMENT_BAROMETER_NOTE : "",
    flags.some((f) => f.collective) ? "Een deel van die signalen betreft gemeenschappelijke delen of een collectieve installatie; die tellen niet mee in de privatieve barometer." : "",
    `Informatiezekerheid: ${unknown.label.toLowerCase()}.`,
    apartment && (apartment.signals.length) ? "Voor de gemeenschappelijke delen zijn er afzonderlijke aandachtspunten; die staan los van de privatieve barometer." : "",
    combos.length ? "Bij uw geplande werken loont het om enkele onderdelen samen voor te bereiden." : "",
  ].filter(Boolean).join(" ");
  const preview = {
    category: b.category,
    level: b.level,
    headline: points[0] ? DOMAIN_HEADLINE[points[0].domain] : "Er zijn op basis van uw antwoorden geen uitgesproken aandachtspunten gemeld.",
    nuance: "Dit is een eerste indicatie op basis van uw eigen antwoorden en geen vaststelling ter plaatse.",
  };
  /** Vraag- en antwoordteksten zoals getoond, zodat een oud rapport later niet met nieuwe labels gelezen wordt. */
  const answerLabels = Object.fromEntries(Object.entries(a).map(([q, v]) => [q, { q: questionText(QUESTION_MAP[q], a), a: LABEL(q, v) }]));
  return {
    ruleVersion: RULE_VERSION,
    reportVersion: REPORT_VERSION,
    questionVersion: QUESTION_VERSION,
    answers: a,
    answerLabels,
    context: contextData(a),
    scoreInternal: b.score,
    category: b.category,
    level: b.level,
    domainScores: b.domainScores,
    coverage: b.coverage,
    safety: flags,
    points,
    energy,
    notices,
    unknown,
    combinations: combos,
    nextStep: NEXT_STEP,
    apartment,
    drone,
    droneText: drone ? DRONE_ADVICE : null,
    profile,
    summary,
    limits: LIMITS_TEXT,
    preview,
  };
}
export type QuickscanReport = ReturnType<typeof buildReport>;

/** 2.3: hulpfuncties voor de rapportlaag (report.ts). Alleen lezen; geen invloed op scoring. */
export const answerHelpers = { has, hasR, plans, fullIntent, plannedCount, buyer, label: LABEL };
