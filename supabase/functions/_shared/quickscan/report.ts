/**
 * Quickscan-rapport 2.3: compositielaag bovenop de rekenregels.
 *
 * Afhankelijkheden lopen in één richting: report.ts → engine.ts en catalog.ts. De engine importeert
 * deze module nooit. Browser en server gebruiken allebei composeReport(), zodat scherm, PDF en opgeslagen
 * snapshot dezelfde conclusies en productaanbeveling bevatten.
 *
 * Niets hier wijzigt scores, drempels of veiligheidsregels. De productaanbeveling leest de technische
 * uitkomst, maar beïnvloedt ze nooit.
 */
import {
  answerHelpers, attentionPoints, buildReport, droneAdvice, isApartment, privateSignals, QUESTION_MAP, SKIP,
  type Answers, type Domain, type SafetyId,
} from "./engine.ts";
import { DRONE_OPTION, getProduct, VAT_RATE, type ProductId } from "./catalog.ts";
import { ASBESTOS, LEGAL_SOURCES, LEGAL_VERIFIED_AT, LEGAL_VERSION, RENOVATION_OBLIGATION, type LegalSourceId } from "./legal.ts";

export const REPORT_VERSION_23 = "qs-report-2.3.3";
export const REPORT_EXTENSION_232 = "v232";
export const REPORT_EXTENSION_233 = "v233";
const { has, plans, fullIntent, plannedCount, buyer, label } = answerHelpers;

const scoreOf = (a: Answers, qid: string): number => {
  const v = a[qid];
  const q = QUESTION_MAP[qid];
  if (v === undefined || v === SKIP || !q) return 0;
  return Math.max(0, ...(Array.isArray(v) ? v : [v]).map((id) => q.options.find((y) => y.id === id)?.score?.v ?? 0));
};
const joinNl = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} en ${xs[xs.length - 1]}`);
const lower = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

export type IconId = "roof" | "drop" | "leaf" | "gear" | "crack" | "window" | "fan" | "bolt" | "doc" | "house" | "shield" | "plan" | "building" | "pipe" | "flame";

// ---------- Woningprofiel voor de cover ----------
export type IllustrationId = "open" | "halfopen" | "gesloten" | "appartement" | "ander";
function heroFacts(a: Answers) {
  const facts: { label: string; value: string }[] = [];
  const add = (l: string, q: string) => {
    const v = a[q];
    if (v === undefined || v === SKIP || v === "onbekend") return;
    facts.push({ label: l, value: label(q, v) });
  };
  add("Woningtype", "Q02");
  if (a.Q03 && a.Q03 !== "onbekend") facts.push({ label: "Bouwperiode", value: a.Q03 === "vanaf2011" ? "Vanaf 2011" : label("Q03", a.Q03) });
  add("Geschatte oppervlakte", isApartment(a) ? "O02" : "O01");
  if (a.Q34 && a.Q34 !== "onbekend" && a.Q34 !== SKIP) facts.push({ label: "EPC-label", value: `EPC ${label("Q34", a.Q34)}` });
  return facts;
}

// ---------- Domeinkaarten ----------
export type DomainStatus = "geen" | "beperkt" | "duidelijk" | "ernstig" | "onvoldoende";
export const DOMAIN_STATUS_LABEL: Record<DomainStatus, string> = {
  geen: "Geen gekende problemen gemeld",
  beperkt: "Beperkte signalen",
  duidelijk: "Duidelijke aandachtspunten",
  ernstig: "Ernstige signalen",
  onvoldoende: "Onvoldoende informatie",
};
const DOMAIN_CARD: Record<Domain, { title: string; icon: IconId }> = {
  B: { title: "Dak, gevel en buitenschrijnwerk", icon: "roof" },
  V: { title: "Vocht en waterinfiltratie", icon: "drop" },
  E: { title: "Energie en isolatie", icon: "leaf" },
  T: { title: "Technische installaties", icon: "gear" },
  S: { title: "Scheuren en vervormingen", icon: "crack" },
};
const SAFETY_DOMAIN: Record<SafetyId, Domain> = { "SAFE-01": "T", "SAFE-02": "T", "SAFE-03": "S", "SAFE-04": "V", "SAFE-05": "B", "SAFE-06": "S" };
/** Korte onderwerpnaam per gescoorde vraag, voor leesbare domeinanalyses. */
const SHORT: Record<string, string> = {
  Q07: "eerder hersteld probleem", Q07A: "eerder hersteld probleem", Q12: "eerdere vochtbehandeling", Q14: "dak", Q15: "dakschade", Q16: "vochtsporen onder het dak",
  Q19: "dakgoten en afvoer", DI01: "dakisolatie", Q18: "gevel", MI01: "muurisolatie", G01: "beglazing", Q20: "ramen", Q22: "tocht langs ramen of deuren",
  Q21: "condens tussen de glasplaten", VL02: "vloerisolatie", Q24: "vocht", Q26: "frequentie", Q29: "schimmelvorming", M01: "binnenkomend water", Q23: "vocht rond ramen of gevel",
  Q28: "water in de kelder", AB02: "badkamer", Q30: "scheuren", Q31: "evolutie van de scheuren", Q32: "vloeren", Q33: "klemmende ramen of deuren",
  Q34: "EPC", Q37: "temperatuurcomfort", H02: "ouderdom verwarming", Q42: "verwarming", Q44: "onderhoud verwarming", Q41: "elektriciteit",
  Q40: "elektrische keuring", Q39: "ventilatie", SL01: "sanitaire leidingen", Q45: "sanitair en afvoer",
};
const MAIN_BY_DOMAIN: Record<Domain, { q: string; name: string; ids: string[] }[]> = {
  B: [{ q: "Q14", name: "de toestand van het dak", ids: ["onbekend"] }, { q: "Q20", name: "de toestand van de ramen", ids: ["onbekend"] }, { q: "Q18", name: "de gevel", ids: ["onbekend"] }],
  V: [{ q: "Q24", name: "mogelijke vochtproblemen", ids: ["onbekend"] }],
  E: [{ q: "Q34", name: "het EPC-label", ids: ["onbekend"] }, { q: "DI01", name: "de dakisolatie", ids: ["onbekend"] }, { q: "MI01", name: "de muurisolatie", ids: ["onbekend", "spouw", "massief"] }, { q: "G01", name: "het exacte beglazingstype", ids: ["onbekend"] }],
  T: [{ q: "Q41", name: "de elektrische installatie", ids: ["onbekend"] }, { q: "Q40", name: "het elektrische keuringsverslag", ids: ["onbekend", "geen"] }, { q: "Q42", name: "de verwarming", ids: ["onbekend"] }, { q: "H01", name: "de verwarming", ids: ["onbekend"] }, { q: "SL01", name: "sanitair en afvoer", ids: ["onbekend"] }, { q: "Q45", name: "sanitair en afvoer", ids: ["onbekend"] }, { q: "Q39", name: "de ventilatie", ids: ["onbekend"] }],
  S: [{ q: "Q30", name: "scheuren of vervormingen", ids: ["onbekend"] }],
};

/** Hoofdvragen per domein (zoals in de barometer). Zijn ze allemaal onbekend, dan is het domein niet beoordeeld. */
const CORE: Record<Domain, string[]> = { B: ["Q14", "Q20"], V: ["Q24"], E: ["Q34", "DI01", "MI01", "G01"], T: ["Q41", "Q42"], S: ["Q30"] };

export interface DomainCard { code: Domain; title: string; icon: IconId; status: DomainStatus; statusLabel: string; analysis: string; missing: string | null; missingItems: string[]; scopeNote: string | null }

function domainCards(a: Answers, ds: Record<Domain, number | null>, privateFlags: SafetyId[], collectiveFlags: SafetyId[]): DomainCard[] {
  const p = privateSignals(a);
  const apt = isApartment(a);
  return (Object.keys(DOMAIN_CARD) as Domain[]).map((code) => {
    const v = ds[code];
    const severe = privateFlags.some((f) => SAFETY_DOMAIN[f] === code);
  const mainUnknown = CORE[code].every((q) => p[q] === undefined || p[q] === SKIP || has(p, q, "onbekend", "spouw", "massief"));
    const status: DomainStatus = v === null || (v === 0 && mainUnknown) ? "onvoldoende" : severe || v >= 9 ? "ernstig" : v >= 5 ? "duidelijk" : v >= 1 ? "beperkt" : "geen";
    const signals: string[] = [];
    for (const [qid, val] of Object.entries(p)) {
      const q = QUESTION_MAP[qid];
      if (!q || val === SKIP || !SHORT[qid]) continue;
      const ids = Array.isArray(val) ? val : [val];
      const hit = ids.filter((id) => { const s = q.options.find((y) => y.id === id)?.score; return s && s.d === code && s.v > 0; });
      if (hit.length) signals.push(`${SHORT[qid]}: ${lower(label(qid, hit))}`);
    }
    let analysis = signals.length ? `U vermeldt ${joinNl(signals.slice(0, 3))}.` : "U meldt hier geen problemen. Dat betekent niet dat dit onderdeel gecontroleerd of in orde is.";
    if (code === "E" && has(a, "Q34", "aplus", "b")) analysis = `${signals.length ? `U vermeldt ${joinNl(signals.slice(0, 3))}. ` : ""}Het EPC-label (${label("Q34", a.Q34)}) wijst op een goede energieprestatie. Een EPC is geen bouwkundige keuring.`;
    if (code === "S" && has(p, "Q30", "haar")) analysis = "U meldt een kleine, volgens u stabiele haarscheur. Dat is op zich geen ernstig structureel signaal. Volg op of ze groter wordt.";
    if (code === "V" && v === null && has(a, "Q24", "onbekend")) analysis = "U weet niet of er vochtproblemen zijn.";
    const unknown = missingTopics(a, code);
    let scopeNote: string | null = null;
    if (apt) {
      const commonHere = collectiveFlags.some((f) => SAFETY_DOMAIN[f] === code) || (code === "V" && has(a, "Q25A", "gemkelder")) || (code === "S" && has(a, "SC01", "gemeenschappelijk", "beide")) || (code === "T" && has(a, "H01", "collectief"));
      scopeNote = commonHere ? "Beoordeling binnen het appartement. Signalen aan gemeenschappelijke delen staan apart bij de mede-eigendom." : "Beoordeling binnen het appartement.";
    }
    return { code, ...DOMAIN_CARD[code], status, statusLabel: DOMAIN_STATUS_LABEL[status], analysis, missing: unknown.length ? `Nog onbekend: ${joinNl(unknown)}.` : null, missingItems: unknown, scopeNote };
  });
}

/** Eén lijst van unieke privatieve technische onderwerpen voor samenvatting, domeinen en detail. */
export function missingTopics(a: Answers, code: Domain): string[] {
  const p = privateSignals(a);
  return [...new Set(MAIN_BY_DOMAIN[code].filter((m) => has(p, m.q, ...m.ids) || p[m.q] === SKIP).map((m) => m.name))];
}
export function informationOverview(a: Answers) {
  const topics = (Object.keys(MAIN_BY_DOMAIN) as Domain[]).flatMap((code) => missingTopics(a, code).map((name) => ({ code, name })));
  return { topics, sentence: topics.length ? `Over ${joinNl(topics.map((t) => t.name))} ontbreken nog gegevens. Onbekende informatie betekent niet dat een onderdeel defect is.` : "Over de beantwoorde technische onderwerpen zijn geen bijkomende onzekerheden gemeld. Niet alle onderdelen zijn daarmee onderzocht." };
}

// ---------- Bevindingen en highlights ----------
export interface Finding { id: string; domain: Domain; title: string; short: string; icon: IconId; severity: number; safety: boolean; next: string }
const POINT_ICON: Record<Domain, IconId> = { B: "roof", V: "drop", E: "leaf", T: "gear", S: "crack" };
const POINT_SHORT: Record<string, string> = {
  "AP-SCHIMMEL": "Mogelijke vochtproblemen of onvoldoende afvoer van vocht. De oorzaak is nog niet gekend.",
  "AP-VOCHTPLEKKEN": "Vochtplekken waarvan de herkomst nog niet gekend is.",
  "AP-VOCHT-REGEN": "Vochtsporen of binnenkomend water tijdens of na regen.",
  "AP-VOCHT-TERUG": "Een eerder behandeld vochtprobleem treedt opnieuw op.",
  "AP-KELDER": "Water in de kelder, afhankelijk van de omstandigheden.",
  "AP-BADKAMER": "Vocht of waterdichtingsproblemen in de badkamer.",
  "AP-DAK-SLIJTAGE": "Zichtbare slijtage of beschadiging aan het dak.",
  "AP-DAK-LOS": "Mogelijk losse dakonderdelen: houd afstand en laat dit snel bekijken.",
  "AP-EPC": "Het EPC-label wijst op energetische verbetermogelijkheden.",
  "AP-ELEK": "Aandachtspunten bij de elektrische installatie.",
  "AP-TOCHT": "Signalen van luchtlekken of een slechte afstelling ter hoogte van het schrijnwerk.",
  "AP-VENT": "De ventilatie werkt volgens u beperkt, onduidelijk of onvoldoende.",
  "AP-VERW": "De verwarming is verouderd, vertoont problemen of werd lang niet onderhouden.",
};

const WINDOW_POINTS = ["AP-TOCHT", "AP-RAMEN-OUD", "AP-CONDENS-GLAS"];
const POINT_ICON_BY_ID: Record<string, IconId> = { "AP-TOCHT": "window", "AP-RAMEN-OUD": "window", "AP-CONDENS-GLAS": "window", "AP-VENT": "fan", "AP-ELEK": "bolt", "AP-VERW": "flame", "AP-GEVEL": "building", "AP-SANITAIR": "pipe", "AP-LEIDINGEN": "pipe" };
const POINT_TITLE: Record<string, (p: Answers) => string> = {
  "AP-TOCHT": (p) => (has(p, "Q20", "tocht") ? "Tocht en sluitproblemen" : "Tocht"),
  "AP-VENT": () => "Werking van de ventilatie",
  // 2.3.3: condens is geen schimmel; schimmel wordt alleen benoemd wanneer de gebruiker ze zelf meldde.
  "AP-SCHIMMEL": (p) => (has(p, "Q29", "geen") ? "Terugkerende condens" : has(p, "Q29", "plaatselijk", "meerdere", "ruimtes") ? "Schimmelvorming (door u gemeld)" : "Condens of schimmel"),
};
/** 2.3.3: dynamische korte tekst waar de vaste formulering de melding zou overdrijven. */
const POINT_SHORT_DYNAMIC: Record<string, (p: Answers) => string> = {
  "AP-SCHIMMEL": (p) => has(p, "Q29", "geen")
    ? "U meldt terugkerende condens zonder zichtbare schimmel. De oorzaak is nog niet gekend."
    : has(p, "Q29", "plaatselijk", "meerdere", "ruimtes")
      ? "U meldt zelf zichtbare schimmelvorming. De oorzaak is nog niet gekend."
      : "Mogelijke vochtproblemen of onvoldoende afvoer van vocht. De oorzaak is nog niet gekend.",
};

function findings(a: Answers): Finding[] {
  const p = privateSignals(a);
  const pts = attentionPoints(a, 20).map((x, order) => ({
    id: x.id, domain: x.domain, title: POINT_TITLE[x.id]?.(p) ?? x.title, short: POINT_SHORT_DYNAMIC[x.id]?.(p) ?? POINT_SHORT[x.id] ?? x.text.split(". ")[0] + ".", icon: POINT_ICON_BY_ID[x.id] ?? POINT_ICON[x.domain], severity: x.severity, safety: x.safety, next: x.next, order,
  }));
  const ids = new Set(pts.map((x) => x.id));
  const extra: (Finding & { order: number })[] = [];
  const ramen = Math.max(scoreOf(p, "Q20"), scoreOf(p, "Q22"), scoreOf(p, "Q21"));
  if (!WINDOW_POINTS.some((id) => ids.has(id)) && (ramen >= 5 || has(p, "Q20", "tocht", "beschadigd"))) {
    extra.push({ id: "FND-RAMEN", domain: "B", title: has(p, "Q20", "beschadigd") ? "Beschadigd schrijnwerk" : "Tocht en sluitproblemen", short: "Signalen van luchtlekken of een slechte afstelling ter hoogte van het schrijnwerk.", icon: "window", severity: ramen, safety: false, next: "Laat de raamafstelling, dichtingen en aansluitingen bekijken.", order: 100 });
  }
  if (!ids.has("AP-VENT") && has(p, "Q39", "beperkt", "defect")) {
    extra.push({ id: "FND-VENT", domain: "T", title: "Werking van de ventilatie", short: has(p, "Q39", "defect") ? "De ventilatie is volgens u defect of duidelijk onvoldoende." : "De ventilatie werkt volgens u beperkt of is onduidelijk.", icon: "fan", severity: scoreOf(p, "Q39"), safety: false, next: "Verifieer de werking en het onderhoud van het ventilatiesysteem.", order: 101 });
  }
  return [...pts, ...extra]
    .sort((x, y) => Number(y.safety) - Number(x.safety) || y.severity - x.severity || x.order - y.order)
    .map(({ order: _o, ...f }) => f);
}

// ---------- Verbanden ----------
export interface LinkNode { icon: IconId; label: string; caption: string }
export interface Connection { id: string; title: string; text: string; nodes: LinkNode[]; evidence?: string[]; relevance?: number }

/** Alle kandidaatverbanden (ongerangschikt). */
export function connectionCandidates(a: Answers): Connection[] {
  const p = privateSignals(a);
  const moisture = has(p, "Q24", "terugkerend", "vochtplekken");
  const vent = has(p, "Q39", "beperkt", "defect", "onbekend") || has(p, "V01", "geen");
  const windows = has(p, "Q20", "tocht", "verouderd", "beschadigd") || has(p, "Q22", "beperkt", "duidelijk");
  const V = { icon: "drop" as IconId, label: "Vocht", caption: has(p, "Q24", "terugkerend") ? (has(p, "Q29", "plaatselijk", "meerdere", "ruimtes") ? "Condens en door u gemelde schimmel wijzen op een verhoogde vochtbelasting." : has(p, "Q29", "geen") ? "Terugkerende condens wijst op een verhoogde vochtbelasting." : "Condens of vocht wijst op een verhoogde vochtbelasting.") : "Vochtplekken met een nog onbekende oorzaak." };
  const VENT = { icon: "fan" as IconId, label: "Ventilatie", caption: "Onvoldoende ventilatie kan vochtproblemen versterken." };
  const RAMEN = { icon: "window" as IconId, label: "Schrijnwerk", caption: "Tocht en sluitproblemen kunnen leiden tot koudebruggen en condens." };
  const out: Connection[] = [];
  const add = (c: Connection, ok: boolean) => { if (ok) out.push(c); };
  add({ id: "LINK-VOCHT-VENT-RAMEN", title: "Vocht, ventilatie en schrijnwerk", nodes: [V, RAMEN, VENT], text: `Uw antwoorden vermelden ${has(p, "Q24", "terugkerend") ? "terugkerende condens of schimmel" : "vochtplekken"}, tocht${has(p, "Q39", "onbekend") ? " en een ventilatiewerking die u niet kent" : has(p, "V01", "geen") ? " en geen duidelijk ventilatiesysteem" : " en een mogelijk beperkte ventilatiewerking"}. Deze signalen kunnen verband houden. Een plaatsbeoordeling kan helpen om mogelijke oorzaken beter van elkaar te onderscheiden.` }, moisture && vent && windows);
  add({ id: "LINK-VOCHT-VENT", title: "Vocht en ventilatie", nodes: [V, VENT], text: "U meldt vochtproblemen en een ventilatie die beperkt of onduidelijk werkt. Beide kunnen samenhangen; laat ze samen bekijken voor u ingrijpt." }, moisture && vent && !windows);
  // 2.3.3: exacte antwoordgegevens; een onzekerheidsformulering alleen wanneer de toestand werkelijk onbekend is.
  const di01Caption = has(p, "DI01", "niet") ? "Volgens uw antwoorden is het dak niet geïsoleerd." : has(p, "DI01", "gedeeltelijk") ? "Volgens uw antwoorden is het dak gedeeltelijk geïsoleerd." : has(p, "DI01", "beperkt") ? "Volgens uw antwoorden is de dakisolatie beperkt of ouder." : "De dakisolatie is onbekend.";
  add({ id: "LINK-DAK-ISOL", title: "Dak en dakisolatie", nodes: [{ icon: "roof", label: "Dak", caption: "Gemelde aandachtspunten of geplande dakwerken." }, { icon: "leaf", label: "Dakisolatie", caption: di01Caption }], text: "Wanneer het dak aandacht vraagt of werken gepland zijn, loont het om de dakisolatie in dezelfde beoordeling mee te nemen. Zo hoeft het dak maar één keer geopend te worden." }, (has(p, "Q14", "slijtage", "beschadigd", "lek", "los") || plans(a, "dak")) && has(p, "DI01", "niet", "gedeeltelijk", "beperkt", "onbekend"));
  add({ id: "LINK-GEVEL-RAMEN", title: "Gevel en schrijnwerk", nodes: [{ icon: "building", label: "Gevel", caption: "Verwering, voegen of infiltratie." }, RAMEN], text: "Gevelproblemen en schrijnwerk raken elkaar aan de raamaansluitingen. Bekijk ze samen, zeker wanneer u werken plant." }, (has(p, "Q18", "verwering", "voegen", "infiltratie") && windows) || (plans(a, "gevel") && plans(a, "ramen")));
  add({ id: "LINK-VOCHT-AFWERKING", title: "Vocht en binnenafwerking", nodes: [V, { icon: "house", label: "Binnenafwerking", caption: "Geplande vloer- of interieurwerken." }], text: "U plant binnenwerken terwijl er vochtsignalen gemeld zijn. Onderzoek eerst de mogelijke oorzaak, zodat nieuwe afwerkingen niet opnieuw beschadigd raken." }, (moisture || (scoreOf(p, "M01") >= 6)) && (plans(a, "interieur") || plans(a, "vloeren")));
  add({ id: "LINK-VERW-ISOL", title: "Verwarming en isolatie", nodes: [{ icon: "flame", label: "Verwarming", caption: "Geplande vervanging of aanpassing." }, { icon: "leaf", label: "Isolatie", caption: "Bepaalt de toekomstige warmtebehoefte." }], text: "U overweegt werken aan de verwarming. De isolatie bepaalt mee hoeveel warmte de woning later nodig heeft; beoordeel beide samen voor u een installatie kiest." }, plans(a, "verwarming") && (plans(a, "isolatie") || has(p, "DI01", "niet", "gedeeltelijk", "beperkt") || has(p, "MI01", "niet", "gedeeltelijk") || has(p, "Q34", "d", "e", "f")));
  add({ id: "LINK-SANITAIR-VLOER", title: "Leidingen en vloerwerken", nodes: [{ icon: "pipe", label: "Leidingen", caption: has(p, "SL01", "gt25", "origineel") ? "Ouderdom gemeld, geen bewezen gebrek." : "Aanpassing van leidingen nog te verifiëren." }, { icon: "house", label: "Vloeren", caption: "Geplande vloerwerken." }], text: has(p, "Q45", "actief", "terugkerend", "verstopping") ? "U meldt sanitaire of afvoerproblemen en plant vloerwerken. Laat de gemelde problemen beoordelen vóór de definitieve vloerafwerking." : plans(a, "sanitair") ? "Wanneer bij de geplande sanitaire werken ook leidingen worden aangepast, is het verstandig deze werkzaamheden met de nieuwe vloerafwerking af te stemmen. De Quickscan kan niet bepalen of leidingen vervangen moeten worden." : "U vermeldt oudere leidingen en plant vloerwerken. Verifieer vóór de nieuwe vloerafwerking of leidingwerken nodig zijn; ouderdom alleen bewijst geen gebrek of noodzaak tot vervanging." }, (plans(a, "sanitair") || has(p, "SL01", "gt25", "origineel") || has(p, "Q45", "actief", "terugkerend", "verstopping")) && plans(a, "vloeren"));
  const sequence = workSequence(a);
  add({ id: "LINK-WERKVOLGORDE", title: "Afstemming van uw geplande werken", nodes: [{ icon: "plan", label: "Werkvolgorde", caption: "Afstemming, geen veronderstelde omvang." }, { icon: "house", label: "Geplande werken", caption: sequence.labels.join(", ") }], text: sequence.text }, sequence.relevant);
  const basementOnly = has(p, "Q25", "kelder") && Array.isArray(p.Q25) && p.Q25.length === 1;
  const basementWater = has(p, "Q28", "soms", "regelmatig", "actief");
  const active = has(p, "Q28", "actief");
  add({ id: "LINK-KELDER-REGEN", title: "Keldervocht en mogelijke vochtbron", nodes: [{ icon: "drop", label: active ? "Waterinstroom" : "Keldervocht", caption: active ? "Actieve instroom gemeld." : has(p, "Q28", "soms") ? "Vooral na regen." : "Vocht of water in de kelder." }, { icon: "building", label: "Mogelijke bron", caption: "Grondwater, afvoer, aansluitingen of buitenwanden." }], text: active ? "U meldt actieve waterinstroom in de kelder. Dat is iets anders dan vochtplekken: laat de instroomroute gericht onderzoeken (bijvoorbeeld afvoer, aansluitingen, buitenwanden of grondwater) vóór u afwerkt of isoleert." : "U meldt vocht in de kelder, vooral in samenhang met regen. Een gericht onderzoek naar de mogelijke vochtbron helpt bepalen of het om insijpeling, afvoer of condensatie gaat. Dit staat los van eventuele ventilatie in de woonruimtes." }, basementWater || (has(p, "Q25", "kelder") && has(p, "Q27", "regen")));
  // 2.3.3: alleen condens gemeld → nooit over schimmel spreken; schimmel alleen wanneer de gebruiker ze zelf meldde.
  const moldReported = has(p, "Q29", "plaatselijk", "meerdere", "ruimtes");
  const condensOnly = has(p, "Q29", "geen");
  const raamTitle = moldReported ? "Condens en schimmel rond ramen" : "Condens rond ramen";
  const raamCaption = moldReported ? "Condens of schimmel aan de binnenzijde." : "Condens aan de binnenzijde van ramen.";
  const raamWhat = moldReported ? "condens of schimmel rond ramen" : condensOnly ? "condens rond ramen, zonder zichtbare schimmel" : "condens of vocht rond ramen";
  add({ id: "LINK-RAAM-CONDENS", title: raamTitle, nodes: [{ icon: "window", label: "Rond ramen", caption: raamCaption }, VENT, { icon: "leaf", label: "Koude oppervlakken", caption: "Glas, kaders en aansluitingen." }], text: `U meldt ${raamWhat}. Dat kan samenhangen met ventilatie, koude oppervlakken en de aansluiting van het schrijnwerk; de Quickscan stelt geen oorzaak vast. ${has(p, "Q21", "ja") ? "Condens tussen de glasplaten is een afzonderlijk signaal van de beglazing zelf. " : ""}Laat deze factoren samen bekijken voor u kiest wat u aanpakt.` }, (has(p, "Q25", "ramen") || has(p, "Q25A", "ramen")) && has(p, "Q24", "terugkerend", "vochtplekken"));
  add({ id: "LINK-VME-KOSTEN", title: "Appartement en gemeenschappelijke kosten", nodes: [{ icon: "building", label: "Mede-eigendom", caption: "Aangekondigde werken of bijdragen." }, { icon: "doc", label: "VME-documenten", caption: "Verslagen, reservefonds en besluiten." }], text: "Er zijn werken of bijkomende bijdragen in de mede-eigendom aangekondigd. Die staan los van de privatieve barometer, maar kunnen uw kosten beïnvloeden. De VME-documenten geven daar meer duidelijkheid over." }, isApartment(a) && (has(a, "A02", "middel", "ingrijpend", "besproken") || has(a, "A03", "beperkt", "substantieel", "omvang")));
  return out.filter((c) => !(basementOnly && ["LINK-VOCHT-VENT-RAMEN", "LINK-VOCHT-VENT"].includes(c.id)));
}

/** Bewijsgrond en deterministische relevantie per verband (hoger = relevanter). */
const LINK_EVIDENCE: Record<string, string[]> = {
  "LINK-KELDER-REGEN": ["Q28", "Q25", "Q27"], "LINK-RAAM-CONDENS": ["Q24", "Q25", "Q25A", "Q39", "Q21"], "LINK-VOCHT-VENT-RAMEN": ["Q24", "Q20", "Q22", "Q39", "V01"],
  "LINK-VOCHT-VENT": ["Q24", "Q39", "V01"], "LINK-DAK-ISOL": ["Q14", "Q15", "DI01", "Q46"], "LINK-GEVEL-RAMEN": ["Q18", "Q20", "Q46"],
  "LINK-VOCHT-AFWERKING": ["Q24", "M01", "Q46", "Q46A"], "LINK-VERW-ISOL": ["Q46", "Q46A", "DI01", "MI01", "Q34"], "LINK-SANITAIR-VLOER": ["Q46", "Q46A", "SL01", "Q45"],
  "LINK-WERKVOLGORDE": ["Q46", "Q46A", "Q47"], "LINK-VME-KOSTEN": ["A02", "A03"],
};
const LINK_SPECIFIC: Record<string, number> = { "LINK-KELDER-REGEN": 3, "LINK-RAAM-CONDENS": 3, "LINK-VOCHT-VENT-RAMEN": 2, "LINK-DAK-ISOL": 2, "LINK-VERW-ISOL": 2, "LINK-SANITAIR-VLOER": 1, "LINK-VOCHT-VENT": 1, "LINK-GEVEL-RAMEN": 1, "LINK-VOCHT-AFWERKING": 1, "LINK-VME-KOSTEN": 1, "LINK-WERKVOLGORDE": 0 };
const OVERLAP: Record<string, string[]> = { "LINK-VOCHT-VENT-RAMEN": ["LINK-VOCHT-VENT", "LINK-RAAM-CONDENS"], "LINK-RAAM-CONDENS": ["LINK-VOCHT-VENT"], "LINK-SANITAIR-VLOER": ["LINK-WERKVOLGORDE"], "LINK-VERW-ISOL": ["LINK-WERKVOLGORDE"] };

export function connectionRelevance(a: Answers, c: Connection): number {
  const p = privateSignals(a);
  const ev = (LINK_EVIDENCE[c.id] ?? []).filter((q) => p[q] !== undefined && p[q] !== SKIP);
  const severity = Math.max(0, ...ev.map((q) => scoreOf(p, q)));
  const planned = ev.some((q) => q === "Q46" || q === "Q46A") && selectedWorks(a).length > 0 ? 2 : 0;
  const unknown = ev.filter((q) => has(p, q, "onbekend")).length;
  // 2.3.3: actieve of terugkerende concrete problemen en veiligheidsrelevantie wegen zwaarder dan generieke afstemming.
  const activeWater = has(p, "Q28", "actief", "regelmatig") || has(p, "M01", "actief", "regen") || has(p, "Q16", "actief") || has(p, "Q14", "lek");
  const recurring = has(p, "Q26", "regelmatig", "voortdurend") || has(p, "Q28", "soms", "regelmatig", "actief");
  const evSet = new Set(ev);
  const safetyLink = evSet.has("Q14") && has(p, "Q14", "lek", "los") || evSet.has("Q28") && has(p, "Q28", "actief") || evSet.has("M01") && has(p, "M01", "actief") || evSet.has("Q16") && has(p, "Q16", "actief");
  const activeBonus = (evSet.has("Q28") || evSet.has("M01") || evSet.has("Q16") || evSet.has("Q14")) && activeWater ? 4 : 0;
  const recurBonus = evSet.has("Q26") || evSet.has("Q28") ? (recurring ? 2 : 0) : 0;
  const safetyBonus = safetyLink ? 4 : 0;
  return severity + (LINK_SPECIFIC[c.id] ?? 0) * 2 + planned + Math.min(ev.length, 4) - unknown + activeBonus + recurBonus + safetyBonus;
}

/** Maximaal twee werkelijk relevante verbanden, gerangschikt; specifiekere verbanden vervangen overlappende. */
export function connections(a: Answers): Connection[] {
  const p = privateSignals(a);
  const scored = connectionCandidates(a).map((c, i) => ({ ...c, evidence: (LINK_EVIDENCE[c.id] ?? []).filter((q) => p[q] !== undefined && p[q] !== SKIP && a[q] !== undefined), relevance: connectionRelevance(a, c), i }));
  const ids = new Set(scored.map((c) => c.id));
  const kept = scored.filter((c) => !Object.entries(OVERLAP).some(([k, v]) => ids.has(k) && v.includes(c.id)));
  return kept.sort((x, y) => y.relevance - x.relevance || x.i - y.i).slice(0, 2).map(({ i: _i, ...c }) => c);
}

// ---------- Actiekaarten ----------
export interface ActionCard { id: string; icon: IconId; title: string; text: string; next: string | null }
const MOISTURE_POINTS = ["AP-SCHIMMEL", "AP-VOCHTPLEKKEN", "AP-VOCHT-REGEN", "AP-VOCHT-TERUG", "AP-KELDER", "AP-BADKAMER"];

function actions(a: Answers, fs: Finding[], links: Connection[], syndic: string[], hasPrivateSafety: boolean): ActionCard[] {
  const out: ActionCard[] = [];
  const buy = buyer(a);
  const seen = new Set<string>();
  const push = (c: ActionCard) => { if (!seen.has(c.id)) { seen.add(c.id); out.push(c); } };
  if (hasPrivateSafety) push({ id: "ACT-VEILIGHEID", icon: "shield", title: "Volg eerst het veiligheidsadvies", text: "U meldt een veiligheidsrelevant signaal. Volg het advies bovenaan dit rapport voor u andere stappen zet.", next: null });
  for (const f of fs) {
    if (MOISTURE_POINTS.includes(f.id)) {
      push({ id: "ACT-VOCHT", icon: "drop", title: "Onderzoek de vochtplek", text: `De gemelde ${f.id === "AP-SCHIMMEL" ? "condens- of schimmelvorming" : lower(f.title)} verdient een gerichte beoordeling. Noteer waar en wanneer het optreedt; dat helpt om de oorzaak te bepalen.`, next: f.next });
    } else if (f.id === "FND-RAMEN" || WINDOW_POINTS.includes(f.id)) {
      push({ id: "ACT-RAMEN", icon: "window", title: "Controleer het schrijnwerk", text: "Onderzoek de raamafstelling, de dichtingen en de aansluitingen tussen raamkaders en muren.", next: null });
    } else if (f.id === "FND-VENT" || f.id === "AP-VENT") {
      push({ id: "ACT-VENT", icon: "fan", title: "Controleer de ventilatie", text: has(a, "V01", "mechanisch") ? "Verifieer de werking van het mechanische systeem en vraag de onderhoudsinformatie op." : "Ga na hoe de woning geventileerd wordt en of roosters of afvoeren goed werken.", next: null });
    } else {
      push({ id: `ACT-${f.id}`, icon: f.icon, title: `Laat ${lower(f.title)} beoordelen`, text: f.short, next: f.next });
    }
    if (out.length >= 4) break;
  }
  if (has(a, "DI01", "onbekend") || has(a, "MI01", "onbekend", "spouw", "massief")) push({ id: "ACT-ISOLATIE", icon: "leaf", title: "Verduidelijk de isolatie", text: `Vraag na hoe dak en buitenmuren geïsoleerd zijn. Het volledige EPC-verslag bevat vaak die gegevens${buy ? "; vraag het op bij de verkoper" : ""}.`, next: null });
  if (has(a, "Q40", "geen", "onbekend")) push({ id: "ACT-KEURING", icon: "bolt", title: "Vraag het elektrische keuringsverslag op", text: "Een ontbrekend verslag bewijst geen defect, maar het verslag geeft duidelijkheid over de installatie.", next: null });
  if (links.some((l) => l.id === "LINK-WERKVOLGORDE")) push({ id: "ACT-VOLGORDE", icon: "plan", title: "Leg een logische werkvolgorde vast", text: workSequence(a).text, next: null });
  if (syndic.length) push({ id: "ACT-SYNDICUS", icon: "building", title: "Stel uw vragen aan de syndicus", text: syndic[0], next: null });
  return out.slice(0, 5);
}

// ---------- Documentenchecklist ----------
export type DocStatus = "beschikbaar" | "verifieren" | "onbekend" | "nvt";
export const DOC_STATUS_LABEL: Record<DocStatus, string> = { beschikbaar: "Beschikbaar", verifieren: "Nog te verifiëren", onbekend: "Onbekend", nvt: "Niet van toepassing" };
export interface DocItem { id: string; label: string; status: DocStatus; statusLabel: string; note: string | null }
const PRE_2001 = ["voor1945", "1945-1969", "1970-1990"];

/** Asbestcontext volgens OVAM: attest verplicht bij verkoop van een gebouw(deel) gebouwd vóór 2001. 2.3.3: BJ01 verduidelijkt de periode 1991–2010. */
export function asbestosContext(a: Answers): { applies: "ja" | "verifieren" | "nee" | "onbekend"; note: string } {
  const apt = isApartment(a);
  if (has(a, "Q03", ...PRE_2001) || has(a, "BJ01", "voor2001")) return { applies: "ja", note: `Voor een ${apt ? "appartement in een gebouw" : "gebouw"} van vóór 2001 is bij verkoop een geldig asbestattest verplicht (OVAM).${apt ? " Voor de gemene delen moet de VME uiterlijk eind 2026 over een eigen attest beschikken." : ""} Het attest zegt welke materialen asbest bevatten, niet de Quickscan.` };
  if (has(a, "Q03", "vanaf2011") || has(a, "BJ01", "vanaf2001")) return { applies: "nee", note: "Voor gebouwen vanaf 2001 geldt de verplichting van een asbestattest bij verkoop niet. Dat is geen bevestiging dat er geen asbesthoudende materialen aanwezig zijn." };
  if (has(a, "Q03", "1991-2010")) return { applies: "verifieren", note: "De bouwperiode 1991–2010 overschrijdt de grens van 2001. Verifieer eerst het exacte bouwjaar (kadaster): alleen voor gebouwen van vóór 2001 is een asbestattest bij verkoop verplicht." };
  return { applies: "onbekend", note: "Het bouwjaar is niet gekend. Verifieer het in het kadaster: voor gebouwen van vóór 2001 is een asbestattest bij verkoop verplicht." };
}

function documents(a: Answers): DocItem[] {
  const q06 = Array.isArray(a.Q06) ? a.Q06 : null;
  const fromQ06 = (key: string): DocStatus => (q06?.includes(key) ? "beschikbaar" : q06?.includes("onbekend") || !q06 ? "onbekend" : "verifieren");
  const items: Omit<DocItem, "statusLabel">[] = [];
  const buy = buyer(a);
  const apt = isApartment(a);
  const epcKnown = a.Q34 !== undefined && a.Q34 !== SKIP && a.Q34 !== "onbekend";
  items.push({ id: "DOC-EPC", label: "Volledig EPC-verslag", status: q06?.includes("epc") ? "beschikbaar" : epcKnown ? "verifieren" : fromQ06("epc"), note: epcKnown && !q06?.includes("epc") ? "Het label is gekend; het volledige verslag bevat ook de isolatiegegevens." : null });
  const keuring: DocStatus = has(a, "Q40", "conform", "beperkt", "inbreuken") ? "beschikbaar" : has(a, "Q40", "geen") ? "verifieren" : has(a, "Q40", "onbekend") ? "onbekend" : fromQ06("keuring");
  items.push({ id: "DOC-KEURING", label: "Keuringsverslag elektrische installatie", status: keuring, note: keuring !== "beschikbaar" ? "Een ontbrekend verslag bewijst geen defect." : null });
  if (buy || plannedCount(a) > 0 || has(a, "ST01", "ja", "onduidelijk")) items.push({ id: "DOC-PLANNEN", label: "Bouwplannen en vergunningen", status: fromQ06("plannen"), note: has(a, "ST01", "ja", "onduidelijk") ? "U vermeldt mogelijke stedenbouwkundige aandachtspunten." : null });
  const asb = asbestosContext(a);
  const asbStatus: DocStatus = has(a, "AS01", "attest_geen", "attest_toepassingen") ? "beschikbaar" : has(a, "AS01", "geen_attest") ? "verifieren" : has(a, "AS01", "onbekend") ? "onbekend" : fromQ06("asbest");
  const asbKnownMaterial = has(a, "AS01", "attest_toepassingen", "gekend");
  if (asb.applies !== "nee" || asbKnownMaterial) items.push({ id: "DOC-ASBEST", label: "Asbestattest", status: asbStatus, note: asbKnownMaterial ? "U vermeldt gekende asbesthoudende toepassingen; raadpleeg het attest vóór werken." : asb.note });
  if (buy && (has(a, "Q03", "1991-2010", "vanaf2011") || has(a, "R01", "0-5", "6-10", "11-20"))) items.push({ id: "DOC-PID", label: "Postinterventiedossier", status: "onbekend", note: "Voor werken sinds mei 2001 hoort een postinterventiedossier te bestaan. Het beschrijft de gebruikte materialen en technieken." });
  if (has(a, "DI01", "onbekend") || has(a, "MI01", "onbekend", "spouw", "massief") || has(a, "G01", "onbekend") || has(a, "VL02", "onbekend")) items.push({ id: "DOC-ISOLATIE", label: "Isolatiegegevens", status: "onbekend", note: "Bijvoorbeeld facturen, het EPC-verslag of technische fiches." });
  if (has(a, "H01", "gas", "mazout", "hout", "andere", "warmtepomp")) items.push({ id: "DOC-ONDERHOUD", label: "Onderhoudsverslagen verwarming", status: fromQ06("onderhoud"), note: null });
  if (has(a, "V01", "mechanisch")) items.push({ id: "DOC-VENTILATIE", label: "Informatie over het ventilatiesysteem", status: "onbekend", note: "Type, inregeling en onderhoud." });
  if (apt) {
    const a05 = Array.isArray(a.A05) ? a.A05 : null;
    const vme = (key: string): DocStatus => (a05?.includes(key) ? "beschikbaar" : !a05 || a05.includes("onbekend") ? "onbekend" : "verifieren");
    items.push({ id: "DOC-VME-AV", label: "Verslagen van de algemene vergadering", status: vme("verslagen"), note: null });
    items.push({ id: "DOC-VME-FONDS", label: "Informatie over het reservefonds", status: vme("reservefonds"), note: null });
    items.push({ id: "DOC-VME-PLAN", label: "Meerjarig onderhoudsplan", status: vme("onderhoudsplan"), note: "Indien beschikbaar; onbekend betekent niet onbestaand." });
    items.push({ id: "DOC-VME-BIJDRAGEN", label: "Informatie over bijzondere bijdragen", status: vme("bijdragen"), note: null });
    items.push({ id: "DOC-VME-BASISAKTE", label: "Basisakte", status: "onbekend", note: "Afbakening van privatieve en gemeenschappelijke delen." });
    if (has(a, "A02", "klein", "middel", "ingrijpend", "besproken") || has(a, "A03", "beperkt", "substantieel", "omvang")) items.push({ id: "DOC-VME-BESLUIT", label: "Renovatiebesluiten en bijzondere bijdragen", status: vme("besluiten"), note: null });
  }
  return items.map((d) => ({ ...d, statusLabel: DOC_STATUS_LABEL[d.status] }));
}

export interface CoOwnership { cards: { id: string; title: string; icon: IconId; text: string; uncertain: boolean }[]; questions: string[]; checklist: string[] }
export function coOwnership(a: Answers, base: ReturnType<typeof buildReport>["apartment"]): CoOwnership | null {
  if (!base) return null;
  const unknown = (q: string) => a[q] === undefined || a[q] === SKIP || has(a, q, "onbekend");
  const value = (q: string) => unknown(q) ? "Nog te verifiëren bij de verkoper of syndicus." : `Volgens uw antwoorden: ${label(q, a[q])}.`;
  const cards: CoOwnership["cards"] = [
    { id: "VME-STATE", title: "Gemeenschappelijke delen", icon: "building", text: value("A01"), uncertain: unknown("A01") },
    { id: "VME-SHELL", title: "Dak, gevel en leidingen", icon: "roof", text: `${value("CD01")} Leidingen: ${unknown("CL01") ? "toestand en vernieuwing nog te verifiëren" : lower(label("CL01", a.CL01))}. De basisakte bepaalt welke delen gemeenschappelijk zijn.`, uncertain: unknown("CD01") || unknown("CL01") },
    { id: "VME-WORKS", title: "Werken en beslissingen", icon: "plan", text: `${value("A02")}${a.A06 && a.A06 !== SKIP && !has(a, "A06", "onbekend") ? ` Betrokken onderdelen: ${label("A06", a.A06)}.` : ""}${a.A07 && a.A07 !== SKIP ? ` Stand van zaken: ${label("A07", a.A07)}.` : ""}`, uncertain: unknown("A02") || has(a, "A02", "besproken") },
    { id: "VME-FUNDS", title: "Reservefonds en bijdragen", icon: "doc", text: `Reservefonds: ${unknown("A04") ? "nog te verifiëren" : lower(label("A04", a.A04))}. Bijzondere bijdragen: ${unknown("A03") ? "nog te verifiëren" : lower(label("A03", a.A03))}. De Quickscan bepaalt geen bedragen of toekomstige kosten en beoordeelt niet of het fonds toereikend is.`, uncertain: unknown("A04") || unknown("A03") || has(a, "A03", "omvang") },
  ];
  // 2.3.3: thematisch gebundelde kernvragen voor de syndicus (max. vijf), zonder semantische doublures.
  // Een specifieke veiligheids- of constructievraag blijft altijd behouden.
  const questions: string[] = [];
  const specific = base.syndic.filter((q) => /scheuren|herstellingen aan dak, gevel of kelder/.test(q));
  questions.push(...specific.slice(0, 1));
  const techUnknown = unknown("A01") || has(a, "A01", "enkele", "duidelijk") || unknown("CD01") || unknown("CL01") || has(a, "CD01", "problemen", "verouderd");
  if (techUnknown) questions.push("Wat is gekend over de technische toestand van de gemeenschappelijke delen (dak, gevel, leidingen, lift, balkons)? Kunt u beschikbare inspectie- en onderhoudsgegevens bezorgen?");
  const worksUnknown = unknown("A02") || has(a, "A02", "besproken", "klein", "middel", "ingrijpend");
  if (worksUnknown) questions.push("Welke werken aan de gemeenschappelijke delen zijn besproken, gepland of goedgekeurd, welke onderdelen betreffen ze en wat is de stand van zaken?");
  const fundsUnknown = unknown("A04") || unknown("A03") || has(a, "A03", "beperkt", "substantieel", "omvang") || !has(a, "A05", "reservefonds") || !has(a, "A05", "bijdragen");
  if (fundsUnknown) questions.push("Kunt u de actuele informatie over het reservefonds en eventuele besliste of besproken bijzondere bijdragen bezorgen, inclusief de verdeling en het tijdstip?");
  const docsMissing = !has(a, "A05", "verslagen") || !has(a, "A05", "onderhoudsplan") || !has(a, "A05", "besluiten");
  if (docsMissing) questions.push("Kunt u de verslagen van de laatste algemene vergaderingen, de relevante VME-beslissingen en het meerjarig onderhoudsplan (indien beschikbaar) bezorgen?");
  const scopeUnclear = has(a, "SC01", "onbekend") || has(a, "Q25A", "onbekend");
  if (scopeUnclear && questions.length < 5) questions.push("Kunt u op basis van de basisakte bevestigen welke delen privatief en welke gemeenschappelijk zijn, bijvoorbeeld voor de gemelde aandachtspunten?");
  return { cards, questions: [...new Set(questions)].slice(0, 5), checklist: ["Basisakte en afbakening privatieve/gemeenschappelijke delen", "Verslagen algemene vergadering en relevante VME-beslissingen", "Reservefonds, rekeningen en bijzondere bijdragen", "Meerjarig onderhoudsplan, indien beschikbaar"] };
}

// ---------- Productaanbeveling (deterministisch, los van de scoring) ----------
export type ReasonCode =
  | "PLUS-COMPLEX-TECH" | "PLUS-COMPLEX-SEQUENCE" | "PLUS-BUYER-RENOVATION"
  | "WS-TECH-BUYER" | "WS-TECH-OWNER" | "WS-APT-COMMON" | "WS-UNKNOWN-BUYER"
  | "BUDGET-COST" | "NONE-NEUTRAL" | "NONE-VME";

export interface Recommendation {
  productId: ProductId | null;
  reasonCode: ReasonCode;
  title: string;
  motivation: string;
  gains: string;
  benefits: string[];
  price: number | null;
  vatRate: number;
  availability: "available" | "coming_soon" | null;
  ctaLabel: string;
  /** Relatief pad; null = geen bestelknop (product nog niet beschikbaar of neutrale afsluiting). */
  ctaPath: string | null;
  infoPath: string;
  infoLabel: string;
  comparePath: string;
  drone: { price: number; text: string; condition: string } | null;
  secondary: { productId: ProductId; name: string; price: number; text: string; path: string } | null;
  safetyFirst: boolean;
  limitation: string;
  priceNote: string;
}

const PLUS_OLD = ["voor1945", "1945-1969", "1970-1990"];
const BENEFIT_INDEX: Partial<Record<ProductId, number[]>> = { woningscan: [0, 1, 3], "woningscan-plus": [2, 5, 4], "online-budgetindicator": [0, 3, 4] };

/** Technische domeinen met een duidelijk privatief signaal (score ≥ 5). Bepaalt mee de commerciële keuze, nooit omgekeerd. */
export function technicalDomains(ds: Record<Domain, number | null>): Domain[] {
  return (Object.keys(ds) as Domain[]).filter((d) => (ds[d] ?? 0) >= 5);
}

/** Expliciete werkkeuze: 'volledig' is geen bewijs dat elk onderdeel wordt vervangen. */
export function selectedWorks(a: Answers): string[] {
  const value = a[isApartment(a) ? "Q46A" : "Q46"];
  return Array.isArray(value) ? value.filter((w) => w !== "geen" && w !== "volledig") : [];
}
const WORK_DOMAIN: Record<string, Domain> = { dak: "B", gevel: "B", ramen: "B", isolatie: "E", elektriciteit: "T", verwarming: "T", sanitair: "T" };
export function renovationEvidence(a: Answers, scores: Record<Domain, number | null>) {
  const relevant = technicalDomains(scores);
  const matchedDomains = [...new Set(selectedWorks(a).map((w) => WORK_DOMAIN[w]).filter((d) => d && relevant.includes(d)))];
  // Uitgebreid traject: meerdere technische domeinen én een volledige renovatie of werken
  // die minstens twee van die domeinen daadwerkelijk raken. Q47 of cosmetische werken volstaan nooit.
  return { matchedDomains, complex: relevant.length >= 2 && (plans(a, "volledig") || matchedDomains.length >= 2) };
}
export function workSequence(a: Answers) {
  const works = selectedWorks(a);
  const shell = works.filter((w) => ["dak", "gevel", "ramen", "isolatie"].includes(w));
  const systems = works.filter((w) => ["elektriciteit", "verwarming", "sanitair"].includes(w));
  const finishes = works.filter((w) => ["vloeren", "interieur"].includes(w));
  const labels = works.map((w) => label(isApartment(a) ? "Q46A" : "Q46", w));
  const relevant = (shell.length > 0 && systems.length > 0) || (systems.length > 0 && finishes.length > 0) || (works.includes("vloeren") && works.includes("interieur") && has(a, "Q47", "ja"));
  const text = shell.length && systems.length
    ? `Stem de geplande ${joinNl(shell.map((w) => lower(label("Q46", w))))} af op ${joinNl(systems.map((w) => lower(label("Q46", w))))}. Leg de aansluitingen en volgorde vast vóór de uitvoering${finishes.length ? "; voorzie de definitieve afwerking daarna" : ""}.`
    : systems.length && finishes.length
      ? `Wanneer bij de geplande ${joinNl(systems.map((w) => lower(label("Q46", w))))} ingrepen in wanden of vloeren nodig zijn, stemt u die best af vóór de nieuwe ${joinNl(finishes.map((w) => lower(label("Q46", w))))}.`
      : "Stem de geplande vloer- en interieurafwerking op elkaar af. De geschikte volgorde hangt af van de gekozen materialen en de werkelijke ingrepen.";
  return { relevant, labels, text };
}

export function recommendProduct(a: Answers, ctx: { domainScores: Record<Domain, number | null>; flags: SafetyId[]; unknownLevel: string; findings: Finding[]; apartmentSignals: number }): Recommendation {
  // 2.3.2: een zwak EPC-label alleen is geen reden voor een plaatsbezoek; het EPC-verslag bevat de officiële aanbevelingen.
  const pp = privateSignals(a);
  const energyOnlyLabel = !has(pp, "DI01", "niet", "gedeeltelijk", "beperkt") && !has(pp, "MI01", "niet", "gedeeltelijk") && !has(pp, "G01", "enkel");
  const tech = technicalDomains(ctx.domainScores).filter((d) => !(d === "E" && energyOnlyLabel)).length;
  const planned = plannedCount(a);
  const full = plans(a, "volledig");
  const evidence = renovationEvidence(a, ctx.domainScores);
  const buy = buyer(a);
  const apt = isApartment(a);
  const cost = has(a, "Q48", "ja");

  let code: ReasonCode;
  if (evidence.complex && tech >= 2) code = "PLUS-COMPLEX-TECH";
  else if (buy && has(a, "Q03", ...PLUS_OLD) && has(a, "R01", "gt30", "nooit") && tech >= 2 && evidence.matchedDomains.length >= 2) code = "PLUS-BUYER-RENOVATION";
  else if (buy && tech >= 1) code = "WS-TECH-BUYER";
  else if (tech >= 1) code = "WS-TECH-OWNER";
  // 2.3.2: uitsluitend VME-signalen rechtvaardigen geen fysieke Woningscan van de privatieve delen;
  // "WS-APT-COMMON" blijft alleen bestaan voor historische snapshots.
  else if (apt && ctx.apartmentSignals > 0 && !(buy && ctx.unknownLevel === "beperkt")) code = "NONE-VME";
  else if (cost && planned >= 1 && ctx.unknownLevel !== "beperkt") code = "BUDGET-COST";
  else if (buy && ctx.unknownLevel === "beperkt") code = "WS-UNKNOWN-BUYER";
  else code = "NONE-NEUTRAL";

  const topics = joinNl(ctx.findings.slice(0, 3).map((f) => lower(f.title)));
  const productId: ProductId | null = code.startsWith("PLUS") ? "woningscan-plus" : code.startsWith("WS") ? "woningscan" : code === "BUDGET-COST" ? "online-budgetindicator" : null;
  const p = productId ? getProduct(productId) ?? null : null;
  const safetyFirst = ctx.flags.length > 0;
  const decision = buy ? "voordat u een aankoopbeslissing neemt" : "voordat u werken laat uitvoeren";

  const MOTIVATION: Record<ReasonCode, string> = {
    "PLUS-COMPLEX-TECH": `U overweegt ${full ? "een volledige renovatie" : "werken aan verschillende technische onderdelen"} en meldt daarnaast technische aandachtspunten${topics ? ` (${topics})` : ""}. Woningscan Plus brengt die punten uitgebreider in kaart en vertaalt ze naar een renovatiestappenplan.`,
    "PLUS-COMPLEX-SEQUENCE": `U overweegt ${full ? "een volledige renovatie" : "werken aan verschillende technische onderdelen"} en wilt ze in een logische volgorde plannen. Woningscan Plus combineert een uitgebreidere inspectie met een renovatiestappenplan.`,
    "PLUS-BUYER-RENOVATION": `U overweegt een oudere woning die volgens u nooit of lang geleden grondig gerenoveerd werd, met meerdere technische aandachtspunten${topics ? ` (${topics})` : ""} en geplande werken. Woningscan Plus helpt u de toestand en de renovatieprioriteiten grondig voor te bereiden ${decision}.`,
    "WS-TECH-BUYER": `Uw antwoorden wijzen op enkele technische aandachtspunten die online niet definitief beoordeeld kunnen worden. Een plaatsbezoek kan helpen om ${topics ? `de gemelde ${topics}` : "de gemelde signalen"} gerichter te beoordelen ${decision}.`,
    "WS-TECH-OWNER": `Uw antwoorden bevatten technische aandachtspunten${topics ? ` (${topics})` : ""} die online niet definitief beoordeeld kunnen worden. Een plaatsbezoek helpt om prioriteiten te bepalen ${decision}.`,
    "WS-APT-COMMON": "U meldt vooral aandachtspunten aan de gemeenschappelijke delen. Een Woningscan beoordeelt de privatieve delen van het appartement ter plaatse en helpt u de juiste vragen aan de syndicus te stellen. De gemeenschappelijke delen worden niet volledig geïnspecteerd.",
    "WS-UNKNOWN-BUYER": "Meerdere belangrijke onderdelen zijn voor u nog onbekend. Een plaatsbezoek kan die onderdelen visueel beoordelen voor u een aankoopbeslissing neemt.",
    "BUDGET-COST": "U wilt vooral weten wat uw geplande werken ongeveer kosten, en uw antwoorden bevatten geen duidelijke technische aandachtspunten die eerst ter plaatse beoordeeld moeten worden. Een online budgetindicatie sluit daar het best bij aan.",
    "NONE-VME": "U meldt vooral aandachtspunten aan de gemeenschappelijke delen, zonder duidelijke technische signalen in het appartement zelf. Een Woningscan beoordeelt de privatieve delen en is daarom nu geen logische volgende stap. Vraag eerst de VME-documenten op en bespreek de gemeenschappelijke punten met de syndicus.",
    "NONE-NEUTRAL": "Op basis van de gekende antwoorden is er onvoldoende aanleiding voor een specifieke betalende vervolgstap. Verduidelijk eerst eventuele ontbrekende informatie en de omvang van uw plannen; de Quickscan kan die niet bepalen.",
  };
  const GAINS: Partial<Record<ReasonCode, string>> = {
    "PLUS-COMPLEX-TECH": "Extra inzicht: fotodocumentatie, gedetailleerdere aanbevelingen en een logische volgorde van de werken.",
    "PLUS-COMPLEX-SEQUENCE": "Extra inzicht: een gestructureerd stappenplan dat dubbel werk helpt voorkomen.",
    "PLUS-BUYER-RENOVATION": "Extra inzicht: een uitgebreider overzicht van de toestand en de renovatieprioriteiten.",
    "WS-TECH-BUYER": "Extra zekerheid: een deskundige bekijkt de gemelde punten ter plaatse en zet de vaststellingen in volgorde van belang.",
    "WS-TECH-OWNER": "Extra zekerheid: een deskundige bekijkt de gemelde punten ter plaatse en zet de vaststellingen in volgorde van belang.",
    "WS-APT-COMMON": "Extra zekerheid over de privatieve delen, en duidelijkere vragen voor de VME.",
    "WS-UNKNOWN-BUYER": "Extra zekerheid over de onderdelen die u nu niet kent.",
    "BUDGET-COST": "Extra inzicht: indicatieve budgetvorken per renovatiecategorie, met duidelijke aannames.",
  };

  let secondary: Recommendation["secondary"] = null;
  const sec = (id: ProductId, text: string) => {
    const s = getProduct(id);
    if (!s) return;
    secondary = { productId: id, name: s.name, price: s.price, text, path: s.ctaTo ?? "/woningscan#pakketten" };
  };
  if (productId === "woningscan" && (planned >= 2 || has(a, "Q47", "ja"))) sec("woningscan-plus", "Wenst u uitgebreidere documentatie en een renovatiestappenplan, dan is Woningscan Plus een alternatief.");
  else if (productId === "woningscan" && cost && planned >= 1) sec("online-budgetindicator", "Wilt u daarna de kosten van uw werken inschatten, dan wordt de online budgetindicator binnenkort beschikbaar.");
  else if (productId === "woningscan-plus") sec("woningscan", "Wenst u enkel een eerste bouwtechnisch overzicht, dan volstaat de Woningscan.");
  else if (productId === "online-budgetindicator" && ctx.unknownLevel === "beperkt") sec("woningscan", "Omdat meerdere onderdelen onbekend zijn, kan een Woningscan ter plaatse de technische toestand eerst verduidelijken.");

  const physical = p?.delivery === "ter-plaatse";
  const drone = physical && p?.droneAllowed && droneAdvice(a)
    ? { price: DRONE_OPTION.price, text: "Omdat u aandachtspunten aan het dak vermeldt of het dak moeilijk zichtbaar is, kan een drone-dakscreening zichtbare dakonderdelen van bovenaf bekijken. Een drone detecteert geen verborgen gebreken.", condition: DRONE_OPTION.condition }
    : null;

  const available = p?.availability === "available";
  return {
    productId,
    reasonCode: code,
    title: p ? (p.id === "woningscan" ? "Woningscan ter plaatse" : p.name) : "Uw rapport als vertrekpunt",
    motivation: MOTIVATION[code],
    gains: GAINS[code] ?? "",
    benefits: p ? (BENEFIT_INDEX[p.id] ?? [0, 1, 2]).map((i) => p.items[i]).filter(Boolean) : [],
    price: p ? p.price : null,
    vatRate: VAT_RATE,
    availability: p ? p.availability : null,
    ctaLabel: !p ? "Bekijk de Woningscans" : !available ? "Binnenkort beschikbaar" : p.id === "woningscan" ? "Vraag mijn Woningscan aan" : `Vraag mijn ${p.name} aan`,
    ctaPath: p && available ? p.ctaTo : null,
    infoPath: "/woningscan#pakketten",
    infoLabel: p && !available ? "Bekijk de productinformatie" : "Vergelijk de Woningscans",
    comparePath: "/woningscan#pakketten",
    drone,
    secondary,
    safetyFirst,
    limitation: physical ? "Een Woningscan is een visuele, niet-destructieve beoordeling. Ze vervangt geen wettelijke keuring, destructief onderzoek of stabiliteitsstudie." : p ? "Een online budgetindicatie is geen bindende offerte." : "",
    priceNote: "Prijs en beschikbaarheid zoals op de rapportdatum; die kunnen later wijzigen.",
  };
}

/** Voegt het rapportnummer als referentie toe aan een productlink (nooit persoonsgegevens of antwoorden). */
export function withReportRef(path: string, reportNumber: string | null | undefined): string {
  if (!reportNumber || !/^QS-\d{8}-[A-Z0-9]{8}$/.test(reportNumber)) return path;
  const [base, hash] = path.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}rapport=${reportNumber}${hash ? `#${hash}` : ""}`;
}

// ---------- Titels en conclusie ----------
function adviceTitle(a: Answers) {
  const apt = isApartment(a);
  if (buyer(a)) return apt ? "Wat controleert u best vóór de aankoop van dit appartement?" : "Wat controleert u best vóór uw aankoopbeslissing?";
  if (has(a, "Q01", "eigenaar")) return apt ? "Hoe pakt u de renovatie van uw appartement verstandig aan?" : "Hoe pakt u uw renovatie verstandig aan?";
  return "Wat kunt u nu best doen?";
}
const OPENING: Record<string, string> = {
  beperkt: "Uw antwoorden bevatten weinig signalen. Dat is een goed vertrekpunt, maar geen bevestiging dat alles in orde is.",
  enkele: "Uw antwoorden wijzen niet op ernstige problemen, maar wel op enkele punten die gerichte aandacht verdienen.",
  verhoogd: "Uw antwoorden bevatten meerdere of duidelijke signalen. Het loont om prioriteiten te bepalen voor u verdere beslissingen neemt.",
  prioritair: "Uw antwoorden bevatten ernstige of veiligheidsrelevante signalen. Laat die eerst beoordelen.",
  onvoldoende: "Er ontbreekt te veel informatie voor een algemene indicatie. De belangrijkste stap is die gegevens eerst te verzamelen.",
};
function conclusion(a: Answers, categoryId: string, links: Connection[], unknownCount: number) {
  const parts = [OPENING[categoryId] ?? ""];
  if (links[0]) parts.push(`De gemelde signalen of geplande werken rond ${joinNl(links[0].nodes.map((n) => lower(n.label)))} worden best in samenhang bekeken, zonder dat dit een bewezen oorzaak of noodzakelijke ingreep betekent.`);
  if (unknownCount > 0) parts.push(unknownCount === 1 ? "Over een technisch onderwerp ontbreekt nog informatie; het detailoverzicht geeft aan welke gegevens u nog kunt verduidelijken." : "Over verschillende technische onderwerpen ontbreekt nog informatie; het detailoverzicht geeft aan welke gegevens u nog kunt verduidelijken.");
  if (buyer(a) && categoryId !== "beperkt") parts.push("Voor een aankoopbeslissing loont het om deze punten eerst te verduidelijken.");
  if (isApartment(a)) parts.push("De barometer beoordeelt de privatieve delen; gemeenschappelijke delen staan apart.");
  return parts.filter(Boolean).join(" ");
}

// ---------- 2.3.2: energie, wettelijke context, documenten, fasen, actiegroepen ----------
const answeredQ = (a: Answers, q: string) => a[q] !== undefined && a[q] !== SKIP;
const EPC_TEXT: Record<string, string> = { aplus: "A+ of A", b: "B", c: "C", d: "D", e: "E", f: "F" };

export interface EnergyContext { label: string | null; band: "gunstig" | "midden" | "zwak" | "onbekend"; title: string; text: string; points: string[]; evidence: string[] }
export function energyContext(a: Answers): EnergyContext {
  const p = privateSignals(a);
  const v = typeof p.Q34 === "string" && p.Q34 !== SKIP ? p.Q34 : null;
  const lbl = v && EPC_TEXT[v] ? EPC_TEXT[v] : null;
  const evidence = ["Q34", "Q35", "DI01", "MI01", "VL02", "G01", "H01", "H02", "Q42"].filter((q) => answeredQ(p, q));
  const points: string[] = [];
  if (has(p, "DI01", "niet", "gedeeltelijk", "beperkt")) points.push("Volgens uw antwoorden is de dakisolatie beperkt of onvolledig.");
  if (has(p, "MI01", "niet", "gedeeltelijk")) points.push("De buitenmuren zijn volgens u niet of gedeeltelijk geïsoleerd.");
  if (has(p, "VL02", "nee", "gedeeltelijk")) points.push("De vloer op het gelijkvloers is volgens u niet of gedeeltelijk geïsoleerd.");
  if (has(p, "G01", "enkel", "dubbel", "gemengd")) points.push(`Beglazing: ${lower(label("G01", p.G01))}.`);
  if (has(p, "H02", "gt20")) points.push("De verwarmingsinstallatie is volgens u meer dan 20 jaar oud; ouderdom alleen is geen gebrek.");
  const unknownInsul = ["DI01", "MI01", "G01"].filter((q) => has(p, q, "onbekend") || p[q] === SKIP).length;
  if (unknownInsul) points.push("Een deel van de isolatie- of beglazingsgegevens is onbekend; het volledige EPC-verslag kan die aanvullen.");
  if (has(p, "Q35", "ouder")) points.push("Het EPC is ouder; de gegevens weerspiegelen mogelijk niet de huidige toestand.");
  const plan = selectedWorks(a).filter((w) => ["isolatie", "ramen", "verwarming", "dak", "gevel"].includes(w));
  if (!lbl) return { label: null, band: "onbekend", title: "Energieprestatie nog niet gekend", text: "Het EPC-label is niet gekend. Het EPC is een officiële bron voor de energieprestatie en bevat aanbevelingen; vraag het op of raadpleeg het voor u beslissingen neemt.", points, evidence };
  if (["aplus", "b"].includes(v!)) return { label: lbl, band: "gunstig", title: `EPC-label ${lbl}: gunstige energieprestatie`, text: `Een EPC-label ${lbl} wijst op een gunstige energieprestatie. Het zegt niets over vocht, stabiliteit, elektriciteit of veiligheid; die onderdelen blijven afzonderlijk beoordeeld in dit rapport.`, points, evidence };
  if (["c", "d"].includes(v!)) return { label: lbl, band: "midden", title: `EPC-label ${lbl}: gerichte verbeterpunten`, text: `Met label ${lbl} zijn er doorgaans gerichte energetische verbeterpunten, zonder dat een ingrijpende energetische renovatie automatisch nodig is. ${points.length ? "Uw antwoorden geven al enkele aanknopingspunten." : "Het volledige EPC-verslag bevat de officiële aanbevelingen."}`, points, evidence };
  return { label: lbl, band: "zwak", title: `EPC-label ${lbl}: duidelijke energetische prioriteit`, text: `Label ${lbl} wijst op een zwakke energieprestatie. Raadpleeg het volledige EPC-verslag met de officiële aanbevelingen: het label alleen vertelt niet welke werken exact nodig zijn${plan.length ? `. Uw geplande ${joinNl(plan.map((w) => lower(label("Q46", w))))} sluiten hier mogelijk bij aan; laat de onderlinge afstemming beoordelen` : ""}. De Quickscan voorspelt geen toekomstig label en belooft geen besparing.`, points, evidence };
}

export interface LegalItem { id: string; title: string; text: string; verify: string[]; sources: { label: string; url: string }[]; level: "melding" | "verificatie" | "info" }
const src = (...ids: LegalSourceId[]) => ids.map((i) => ({ ...LEGAL_SOURCES[i] }));
export function legalContext(a: Answers): LegalItem[] {
  const out: LegalItem[] = [];
  const apt = isApartment(a);
  const buy = buyer(a);
  const epc = typeof a.Q34 === "string" ? a.Q34 : null;
  const ef = epc !== null && (RENOVATION_OBLIGATION.labels as readonly string[]).includes(epc);
  const unit = apt ? "het appartement" : "de woning";
  const R = RENOVATION_OBLIGATION;
  if (ef && buy) out.push({ id: "LEG-RENO-KOPER", level: "melding", title: "Mogelijke renovatieverplichting", text: `Bij een toepasselijke aankoop of andere overdracht van ${unit} met label ${EPC_TEXT[epc!]} geldt in principe de verplichting om binnen ${R.years} jaar minimaal label ${R.minimumLabel} te behalen. De termijn start op ${R.start}. De verbetering moet met een nieuw EPC aangetoond worden.`, verify: ["Controleer of de verplichting op uw overdracht van toepassing is en welke uitzonderingen kunnen gelden.", "Vraag na of er voor het pand al een lopende renovatieverplichting bestaat uit een eerdere overdracht; bij doorverkoop kan een bestaande verplichting en resterende termijn relevant zijn.", ...(apt ? ["De verplichting betreft het individuele appartement; werken aan gemeenschappelijke delen beslist de VME."] : [])], sources: src("renovatieplicht") });
  else if (ef) out.push({ id: "LEG-RENO-VERIFIEER", level: "verificatie", title: "Renovatieverplichting: te verifiëren", text: `Voor ${unit} is label ${EPC_TEXT[epc!]} opgegeven. Of er een renovatieverplichting geldt, hangt af van de datum en aard van de verwerving. Er kan al een lopende verplichting bestaan uit een eerdere overdracht. De Quickscan berekent geen persoonlijke termijn.`, verify: ["Ga na wanneer en hoe het eigendom verworven werd en of daarbij een renovatieverplichting ontstond.", `Indien van toepassing: minimaal label ${R.minimumLabel} binnen ${R.years} jaar, aan te tonen met een nieuw EPC.`], sources: src("renovatieplicht") });
  else if (buy && (epc === null || epc === "onbekend")) out.push({ id: "LEG-RENO-EPC-ONBEKEND", level: "verificatie", title: "EPC-label opvragen vóór aankoop", text: "Het EPC-label is niet gekend. Bij een label E of F kan na aankoop een renovatieverplichting gelden. Vraag het EPC op bij de verkoper.", verify: ["Vraag het geldige EPC en het volledige verslag op."], sources: src("renovatieplicht") });
  if (apt) {
    out.push({ id: "LEG-EPC-GD", level: "info", title: "EPC van de gemeenschappelijke delen", text: "Een appartementsgebouw moet in principe over een afzonderlijk EPC voor de gemeenschappelijke delen beschikken, behalve wanneer het volledige gebouw nieuwbouw is. Een gebouw of appartement dat een ingrijpende energetische renovatie onderging, geldt daarbij niet als nieuwbouw. Dit EPC staat los van het EPC van het appartement.", verify: ["Vraag de syndicus of het EPC gemeenschappelijke delen beschikbaar is en welke collectieve maatregelen het aanbeveelt."], sources: src("epcGd") });
    // 2.3.3: geen attestmelding voor de gemene delen bij een bevestigd bouwjaar vanaf 2001 (BJ01), tenzij asbesttoepassingen gemeld zijn.
    if (asbestosContext(a).applies !== "nee" || has(a, "AS01", "attest_toepassingen", "gekend")) out.push({ id: "LEG-ASBEST-GD", level: has(a, "Q03", "1991-2010", "onbekend") && !has(a, "BJ01", "voor2001") ? "verificatie" : "info", title: "Asbestattest gemene delen", text: `Voor gebouwen van vóór ${ASBESTOS.cutoffYear} moet de VME uiterlijk op ${ASBESTOS.commonPartsDeadline} over een asbestattest voor de gemene delen beschikken. Vanaf ${ASBESTOS.commonPartsTransferFrom} moet bij elke overdracht van een appartement zowel het attest van het appartement als dat van de gemene delen overhandigd worden.${has(a, "Q03", "1991-2010", "onbekend") && !has(a, "BJ01", "voor2001") ? " Verifieer eerst het exacte bouwjaar." : ""}`, verify: ["Vraag de syndicus naar de stand van het asbestattest voor de gemene delen."], sources: src("asbestGd") });
  }
  if (buy) {
    const pv = typeof a.FL01 === "string" ? a.FL01 : null; const gv = typeof a.FL02 === "string" ? a.FL02 : null;
    const high = ["c", "d"].includes(pv ?? "") || ["c", "d"].includes(gv ?? "");
    const known = (pv && !["onbekend", SKIP].includes(pv)) || (gv && !["onbekend", SKIP, "nvt"].includes(gv));
    if (high) out.push({ id: "LEG-OVERSTROMING", level: "verificatie", title: "Overstromingsgevoeligheid nagaan", text: `U vermeldt ${[pv && ["c", "d"].includes(pv) ? `P-score ${pv.toUpperCase()}` : "", gv && ["c", "d"].includes(gv) ? `G-score ${gv.toUpperCase()}` : ""].filter(Boolean).join(" en ")}. Dat is administratieve informatie over de overstromingskans, geen bewijs van vochtproblemen. Raadpleeg het officiële overstromingsrapport en bespreek de betekenis voor uw aankoop.`, verify: ["Raadpleeg het officiële overstromingsrapport (Waterinfo)."], sources: src("overstroming") });
    else if (!known) out.push({ id: "LEG-OVERSTROMING-ONBEKEND", level: "info", title: "Overstromingsinformatie", text: "De P- en G-score zijn niet gekend. Ze staan in de vastgoedadvertentie of het officiële overstromingsrapport. De Quickscan maakt geen inschatting van overstromingsrisico.", verify: ["Raadpleeg de scores in de advertentie of het overstromingsrapport."], sources: src("overstroming") });
  }
  return out;
}

export type DocStatus232 = "beschikbaar" | "niet-beschikbaar" | "verifieren" | "onbekend" | "overgeslagen" | "niet-gevraagd" | "nvt";
export const DOC_STATUS_LABEL_232: Record<DocStatus232, string> = { beschikbaar: "Beschikbaar", "niet-beschikbaar": "Niet beschikbaar", verifieren: "Nog te verifiëren", onbekend: "Onbekend", overgeslagen: "Overgeslagen", "niet-gevraagd": "Nog te verifiëren", nvt: "Niet van toepassing" };
export interface DocItem232 { id: string; label: string; status: DocStatus232; statusLabel: string; note: string | null }
/** Persoonlijke documentenchecklist. Niet uitgevraagd is nooit "ontbrekend"; een ontbrekend verslag bewijst geen defect. */
export function documents232(a: Answers): DocItem232[] {
  const q06 = a.Q06;
  const fromQ06 = (key: string): DocStatus232 => q06 === undefined ? "niet-gevraagd" : q06 === SKIP ? "overgeslagen" : !Array.isArray(q06) ? "onbekend" : q06.includes(key) ? "beschikbaar" : q06.includes("geen") ? "niet-beschikbaar" : q06.includes("onbekend") ? "onbekend" : "verifieren";
  const items: Omit<DocItem232, "statusLabel">[] = [];
  const buy = buyer(a); const apt = isApartment(a);
  const epcKnown = typeof a.Q34 === "string" && a.Q34 !== SKIP && a.Q34 !== "onbekend";
  items.push({ id: "DOC-EPC", label: "EPC en volledig EPC-verslag", status: fromQ06("epc") === "beschikbaar" ? "beschikbaar" : epcKnown ? "verifieren" : fromQ06("epc"), note: epcKnown ? "Het label is gekend; het volledige verslag bevat de isolatiegegevens en de officiële aanbevelingen." : null });
  const keuring: DocStatus232 = has(a, "Q40", "conform", "beperkt", "inbreuken") ? "beschikbaar" : has(a, "Q40", "geen") ? "niet-beschikbaar" : has(a, "Q40", "onbekend") ? "onbekend" : fromQ06("keuring");
  items.push({ id: "DOC-KEURING", label: "Keuringsverslag elektrische installatie", status: keuring, note: keuring !== "beschikbaar" ? "Een ontbrekend verslag bewijst geen technisch defect." : null });
  const asb = asbestosContext(a);
  const asbStatus: DocStatus232 = has(a, "AS01", "attest_geen", "attest_toepassingen") ? "beschikbaar" : has(a, "AS01", "geen_attest") ? "niet-beschikbaar" : has(a, "AS01", "onbekend") ? "onbekend" : a.AS01 === SKIP ? "overgeslagen" : fromQ06("asbest");
  if (asb.applies !== "nee" || has(a, "AS01", "attest_toepassingen", "gekend")) items.push({ id: "DOC-ASBEST", label: apt ? "Asbestattest van het appartement" : "Asbestattest", status: asbStatus, note: has(a, "AS01", "attest_toepassingen", "gekend") ? "Er zijn asbesthoudende toepassingen vermeld; laat ze passend beoordelen vóór ingrijpende werken." : has(a, "AS01", "attest_geen") ? "Een attest zonder vermelde toepassingen is geen absolute garantie dat het gebouw asbestvrij is." : asb.note });
  if (buy || plannedCount(a) > 0 || has(a, "ST01", "ja", "onduidelijk")) items.push({ id: "DOC-PLANNEN", label: "Bouwplannen en relevante vergunningen", status: fromQ06("plannen"), note: has(a, "ST01", "ja", "onduidelijk") ? "U vermeldt mogelijke stedenbouwkundige aandachtspunten." : null });
  if (!apt && (buy || has(a, "RI01", "septisch", "niet", "onbekend"))) items.push({ id: "DOC-RIOLERING", label: "Informatie over riolering en afvalwater", status: has(a, "RI01", "riolering", "riolering_septisch") ? "verifieren" : has(a, "RI01", "onbekend") ? "onbekend" : a.RI01 === undefined ? "niet-gevraagd" : "verifieren", note: "Dit is geen conformiteitsbeoordeling." });
  if (has(a, "H01", "gas", "mazout", "hout", "andere", "warmtepomp")) items.push({ id: "DOC-ONDERHOUD", label: "Onderhoudsdocumenten verwarming", status: fromQ06("onderhoud"), note: null });
  if (has(a, "H01", "mazout")) items.push({ id: "DOC-STOOKOLIE", label: "Documentatie stookolietank", status: "niet-gevraagd", note: "Bijvoorbeeld keuringen van de tank, indien van toepassing." });
  if (buy) items.push({ id: "DOC-OVERSTROMING", label: "Officieel overstromingsrapport (P- en G-score)", status: (["a", "b", "c", "d"].includes(a.FL01 as string) || ["a", "b", "c", "d"].includes(a.FL02 as string)) ? "verifieren" : a.FL01 === SKIP && a.FL02 === SKIP ? "overgeslagen" : "onbekend", note: "Administratieve informatie; geen bewijs van vochtproblemen." });
  if (apt) {
    const a05 = a.A05;
    const vme = (key: string): DocStatus232 => a05 === undefined ? "niet-gevraagd" : !Array.isArray(a05) ? "onbekend" : a05.includes(key) ? "beschikbaar" : a05.includes("geen") ? "niet-beschikbaar" : a05.includes("onbekend") ? "onbekend" : "verifieren";
    items.push({ id: "DOC-EPC-GD", label: "EPC gemeenschappelijke delen", status: "niet-gevraagd", note: "Niet uitgevraagd; vraag het na bij de syndicus." });
    if (!has(a, "Q03", "vanaf2011")) items.push({ id: "DOC-ASBEST-GD", label: "Asbestattest gemene delen", status: "niet-gevraagd", note: `Verplicht voor VME's van gebouwen vóór ${ASBESTOS.cutoffYear}, uiterlijk ${ASBESTOS.commonPartsDeadline}.` });
    items.push({ id: "DOC-VME-AV", label: "Verslagen van de algemene vergadering", status: vme("verslagen"), note: null });
    items.push({ id: "DOC-VME-FONDS", label: "Reservefonds", status: vme("reservefonds"), note: null });
    items.push({ id: "DOC-VME-BIJDRAGEN", label: "Bijzondere bijdragen", status: vme("bijdragen"), note: null });
  }
  return items.map((d) => ({ ...d, statusLabel: DOC_STATUS_LABEL_232[d.status] }));
}

export interface Phase { id: "A" | "B" | "C" | "D"; title: string; why: string; items: string[]; decide: string | null }
/** Voorlopig renovatietraject: alleen toepasselijke fasen; geen traject zonder plannen; volledige renovatie zonder deelwerken = scopebepaling. */
export function renovationPhases(a: Answers): Phase[] {
  const p = privateSignals(a);
  const works = selectedWorks(a);
  const full = fullIntent(a);
  if (!works.length && !full) return [];
  const w = (...xs: string[]) => xs.some((x) => works.includes(x));
  const cosmetic = works.length > 0 && works.every((x) => ["vloeren", "interieur"].includes(x)) && !full;
  const moisture = has(p, "Q24", "terugkerend", "vochtplekken") || has(p, "Q28", "soms", "regelmatig", "actief");
  const roof = has(p, "Q14", "slijtage", "beschadigd", "lek", "los", "onbekend");
  const asb = asbestosContext(a).applies;
  const A: string[] = [];
  if (full) A.push("Bepaal eerst de concrete renovatiescope: welke bouwdelen werkelijk aangepast moeten worden.");
  if (roof && (w("dak", "isolatie") || full)) A.push("Laat de onzekere of gemelde daktoestand beoordelen.");
  if (moisture) A.push("Laat de gemelde vochtproblemen onderzoeken.");
  if (has(a, "Q40", "geen", "onbekend") && (w("elektriciteit", "interieur") || full)) A.push("Vraag de elektrische documenten op.");
  if ((asb === "ja" || asb === "verifieren" || has(a, "AS01", "gekend", "attest_toepassingen")) && !cosmetic) A.push("Ga de asbestinformatie na vóór ingrijpende werken.");
  if ((has(a, "Q34", "d", "e", "f", "onbekend") || full) && (w("isolatie", "verwarming", "ramen", "dak", "gevel") || full)) A.push("Raadpleeg het volledige EPC-verslag en de officiële aanbevelingen.");
  if (has(a, "Q34", "e", "f")) A.push("Verifieer eventuele wettelijke randvoorwaarden, zoals een renovatieverplichting.");
  const B: string[] = [];
  if (moisture && works.length) B.push("Pak de oorzaak van gemelde vochtproblemen aan vóór verdere afwerking.");
  if (!cosmetic && w("dak", "isolatie") && (w("dak") || has(p, "DI01", "niet", "gedeeltelijk", "beperkt", "onbekend"))) B.push("Bereid dak en dakisolatie samen voor; dat veronderstelt geen volledige dakvervanging.");
  if (!cosmetic && w("gevel", "ramen") && (w("isolatie") || (w("gevel") && w("ramen")))) B.push("Stem gevel, ramen en isolatie op elkaar af.");
  const C: string[] = [];
  if (w("verwarming")) C.push(w("isolatie", "dak", "gevel", "ramen") || has(p, "DI01", "niet", "gedeeltelijk", "beperkt") || has(p, "MI01", "niet", "gedeeltelijk") ? "Laat de toekomstige warmtebehoefte bepalen na de geplande isolatiewerken, voor u een definitieve installatie kiest." : "Bereid de verwarmingskeuze voor op basis van de huidige en toekomstige isolatie.");
  // 2.3.3: noem uitsluitend daadwerkelijk geselecteerde werken; nooit niet-gemelde werken als gepland.
  const sys = ["elektriciteit", "sanitair"].filter((x) => works.includes(x));
  const vent = w("isolatie") && has(p, "Q39", "beperkt", "defect", "onbekend");
  const sysLabels = [...sys.map((x) => lower(label(isApartment(a) ? "Q46A" : "Q46", x))), ...(vent ? ["ventilatie"] : [])];
  if (sys.length + (vent ? 1 : 0) >= 2 || (sys.length && w("vloeren", "interieur"))) C.push(`Plan de ${joinNl(sysLabels)} samen en houd rekening met openbreekwerken.`);
  else if (sys.length) C.push(`Bereid de ${joinNl(sysLabels)} voor vóór de afwerking.`);
  const D: string[] = [];
  if (w("vloeren")) D.push(sys.length ? "Plaats de nieuwe vloeren na de onderliggende technieken." : "Controleer vóór de nieuwe vloerafwerking of de bestaande onderliggende technieken en vloeropbouw aanpassingen vereisen.");
  if (w("interieur")) D.push("Voer de interieurafwerking uit na de technische voorbereiding.");
  const out: Phase[] = [];
  if (A.length) out.push({ id: "A", title: "Onderzoek en voorbereiding", why: "Wat u nu nog niet weet, bepaalt mee welke werken zinvol zijn.", items: A, decide: full && !works.length ? "De omvang van de renovatie hangt af van dit onderzoek." : null });
  if (B.length) out.push({ id: "B", title: "Vocht, buitenschil en isolatie", why: "De buitenschil beschermt alles wat binnen volgt.", items: B, decide: null });
  if (C.length) out.push({ id: "C", title: "Technische installaties", why: "Installaties volgen best op de schil en gaan vóór de afwerking.", items: C, decide: w("verwarming") ? "De keuze van de installatie hangt af van de toekomstige warmtebehoefte." : null });
  if (D.length) out.push({ id: "D", title: "Indeling en binnenafwerking", why: "Afwerking komt het laatst, zodat ze niet opnieuw beschadigd raakt.", items: D, decide: null });
  return out;
}

export interface ActionGroups { technical: ActionCard[]; documents: ActionCard[] }
/** Drie informatietypen concurreren niet om dezelfde kaarten: technische prioriteiten, planning (via fasen) en documenten/verplichtingen. */
export function actionGroups(a: Answers, fs: Finding[], syndic: string[], hasPrivateSafety: boolean, legal: LegalItem[]): ActionGroups {
  const technical: ActionCard[] = [];
  const seen = new Set<string>();
  const push = (arr: ActionCard[], c: ActionCard) => { if (!seen.has(c.id)) { seen.add(c.id); arr.push(c); } };
  if (hasPrivateSafety) push(technical, { id: "ACT-VEILIGHEID", icon: "shield", title: "Volg eerst het veiligheidsadvies", text: "U meldt een veiligheidsrelevant signaal. Volg het advies bovenaan dit rapport voor u andere stappen zet.", next: null });
  for (const f of [...fs].sort((x, y) => Number(y.safety) - Number(x.safety) || y.severity - x.severity)) {
    if (MOISTURE_POINTS.includes(f.id)) push(technical, { id: "ACT-VOCHT", icon: "drop", title: "Onderzoek de vochtbron", text: `De gemelde ${f.id === "AP-SCHIMMEL" ? "condens- of schimmelvorming" : lower(f.title)} verdient een gerichte beoordeling. Noteer waar en wanneer het optreedt.`, next: f.next });
    else if (f.id === "FND-RAMEN" || WINDOW_POINTS.includes(f.id)) push(technical, { id: "ACT-RAMEN", icon: "window", title: "Controleer het schrijnwerk", text: "Onderzoek de raamafstelling, de dichtingen en de aansluitingen tussen raamkaders en muren.", next: null });
    else if (f.id === "FND-VENT" || f.id === "AP-VENT") push(technical, { id: "ACT-VENT", icon: "fan", title: "Controleer de ventilatie", text: has(a, "V01", "mechanisch") ? "Verifieer de werking van het mechanische systeem en vraag de onderhoudsinformatie op." : "Ga na hoe de woning geventileerd wordt en of roosters of afvoeren goed werken.", next: null });
    else push(technical, { id: `ACT-${f.id}`, icon: f.icon, title: `Laat ${lower(f.title)} beoordelen`, text: f.short, next: f.next });
  }
  const documents: ActionCard[] = [];
  for (const l of legal.filter((x) => x.level !== "info")) push(documents, { id: `ACT-${l.id}`, icon: "doc", title: l.title, text: l.verify[0] ?? l.text, next: null });
  if (has(a, "Q34", "e", "f", "d") || has(a, "DI01", "onbekend") || has(a, "MI01", "onbekend", "spouw", "massief")) push(documents, { id: "ACT-EPC-VERSLAG", icon: "leaf", title: "Raadpleeg het volledige EPC-verslag", text: `Het verslag bevat de isolatiegegevens en de officiële aanbevelingen${buyer(a) ? "; vraag het op bij de verkoper" : ""}.`, next: null });
  if (has(a, "Q40", "geen", "onbekend")) push(documents, { id: "ACT-KEURING", icon: "bolt", title: "Vraag het elektrische keuringsverslag op", text: "Een ontbrekend verslag bewijst geen defect, maar geeft duidelijkheid over de installatie.", next: null });
  if (has(a, "AS01", "gekend", "attest_toepassingen") && plannedCount(a) > 0) push(documents, { id: "ACT-ASBEST", icon: "shield", title: "Laat asbesttoepassingen beoordelen vóór werken", text: "Bij gekende of vermelde asbesthoudende toepassingen is een passende beoordeling nodig vóór ingrijpende werken. De Quickscan stelt geen asbestdiagnose.", next: null });
  if (syndic.length) push(documents, { id: "ACT-SYNDICUS", icon: "building", title: "Stel uw vragen aan de syndicus", text: syndic[0], next: null });
  return { technical, documents };
}

// ---------- Compositie ----------
export function composeReport(answers: Answers) {
  const base = buildReport(answers);
  const a = base.answers;
  const b = { privateFlags: base.safety.filter((s) => !s.collective).map((s) => s.id as SafetyId), collectiveFlags: base.safety.filter((s) => s.collective).map((s) => s.id as SafetyId) };
  const fs = findings(a);
  const links = connections(a);
  const cards = domainCards(a, base.domainScores, b.privateFlags, b.collectiveFlags);
  const information = informationOverview(a);
  const unknownCount = information.topics.length;
  const apartmentSignals = base.apartment?.signals.length ?? 0;
  const recommendation = recommendProduct(a, { domainScores: base.domainScores, flags: [...b.privateFlags, ...b.collectiveFlags], unknownLevel: base.unknown.level, findings: fs, apartmentSignals });
  // Asbestmelding afgestemd op de bouwjaargrens van 2001; gekende toepassingen blijven ongewijzigd.
  const asb = asbestosContext(a);
  const notices = base.notices.map((n) => (n.id === "NOT-ASBEST-ATTEST" ? { ...n, text: `Er is geen asbestattest gekend. Dat betekent niet dat er asbest aanwezig of afwezig is. ${asb.note}` } : n));
  const legal = legalContext(a);
  const groups = actionGroups(a, fs, coOwnership(a, base.apartment)?.questions ?? [], b.privateFlags.length > 0, legal);
  const illustration: IllustrationId = (["open", "halfopen", "gesloten", "appartement"].includes(a.Q02 as string) ? a.Q02 : "ander") as IllustrationId;
  return {
    ...base,
    reportVersion: REPORT_VERSION_23,
    notices,
    // Neutrale vervolgstap blijft bewaard voor compatibiliteit; de 2.3-weergave gebruikt de aanbeveling.
    v23: {
      illustration,
      information,
      coOwnership: coOwnership(a, base.apartment),
      facts: heroFacts(a),
      conclusion: conclusion(a, base.category.id, links, unknownCount),
      highlights: fs.slice(0, 3),
      domains: cards,
      connections: links,
      adviceTitle: adviceTitle(a),
      actions: actions(a, fs, links, coOwnership(a, base.apartment)?.questions ?? [], b.privateFlags.length > 0),
      documents: documents(a),
      recommendation,
    },
    // 2.3.2: additieve, geversioneerde extensie. v23 blijft functioneel intact voor oudere weergaven.
    v232: {
      version: REPORT_EXTENSION_232,
      legalVersion: LEGAL_VERSION,
      legalVerifiedAt: LEGAL_VERIFIED_AT,
      energy: energyContext(a),
      legal,
      documents: documents232(a),
      phases: renovationPhases(a),
      actions: groups,
    },
  };
}
export type QuickscanReport23 = ReturnType<typeof composeReport>;
export type ReportV23 = QuickscanReport23["v23"];
export type ReportV232 = QuickscanReport23["v232"];
