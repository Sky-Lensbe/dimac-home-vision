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

export const REPORT_VERSION_23 = "qs-report-2.3.1";
const { has, plans, plannedCount, buyer, label } = answerHelpers;

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
};

function findings(a: Answers): Finding[] {
  const p = privateSignals(a);
  const pts = attentionPoints(a, 20).map((x, order) => ({
    id: x.id, domain: x.domain, title: POINT_TITLE[x.id]?.(p) ?? x.title, short: POINT_SHORT[x.id] ?? x.text.split(". ")[0] + ".", icon: POINT_ICON_BY_ID[x.id] ?? POINT_ICON[x.domain], severity: x.severity, safety: x.safety, next: x.next, order,
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
export interface Connection { id: string; title: string; text: string; nodes: LinkNode[] }

export function connections(a: Answers): Connection[] {
  const p = privateSignals(a);
  const moisture = has(p, "Q24", "terugkerend", "vochtplekken");
  const vent = has(p, "Q39", "beperkt", "defect", "onbekend") || has(p, "V01", "geen");
  const windows = has(p, "Q20", "tocht", "verouderd", "beschadigd") || has(p, "Q22", "beperkt", "duidelijk");
  const V = { icon: "drop" as IconId, label: "Vocht", caption: has(p, "Q24", "terugkerend") ? "Condens en schimmel wijzen op een verhoogde vochtbelasting." : "Vochtplekken met een nog onbekende oorzaak." };
  const VENT = { icon: "fan" as IconId, label: "Ventilatie", caption: "Onvoldoende ventilatie kan vochtproblemen versterken." };
  const RAMEN = { icon: "window" as IconId, label: "Schrijnwerk", caption: "Tocht en sluitproblemen kunnen leiden tot koudebruggen en condens." };
  const out: Connection[] = [];
  const add = (c: Connection, ok: boolean) => { if (ok) out.push(c); };
  add({ id: "LINK-VOCHT-VENT-RAMEN", title: "Vocht, ventilatie en schrijnwerk", nodes: [V, RAMEN, VENT], text: `Uw antwoorden vermelden ${has(p, "Q24", "terugkerend") ? "terugkerende condens of schimmel" : "vochtplekken"}, tocht${has(p, "Q39", "onbekend") ? " en een ventilatiewerking die u niet kent" : has(p, "V01", "geen") ? " en geen duidelijk ventilatiesysteem" : " en een mogelijk beperkte ventilatiewerking"}. Deze signalen kunnen verband houden. Een plaatsbeoordeling kan helpen om mogelijke oorzaken beter van elkaar te onderscheiden.` }, moisture && vent && windows);
  add({ id: "LINK-VOCHT-VENT", title: "Vocht en ventilatie", nodes: [V, VENT], text: "U meldt vochtproblemen en een ventilatie die beperkt of onduidelijk werkt. Beide kunnen samenhangen; laat ze samen bekijken voor u ingrijpt." }, moisture && vent && !windows);
  add({ id: "LINK-DAK-ISOL", title: "Dak en dakisolatie", nodes: [{ icon: "roof", label: "Dak", caption: "Gemelde aandachtspunten of geplande dakwerken." }, { icon: "leaf", label: "Dakisolatie", caption: "Isolatie is beperkt, gedeeltelijk of onbekend." }], text: "Wanneer het dak aandacht vraagt of werken gepland zijn, loont het om de dakisolatie in dezelfde beoordeling mee te nemen. Zo hoeft het dak maar één keer geopend te worden." }, (has(p, "Q14", "slijtage", "beschadigd", "lek", "los") || plans(a, "dak")) && has(p, "DI01", "niet", "gedeeltelijk", "beperkt", "onbekend"));
  add({ id: "LINK-GEVEL-RAMEN", title: "Gevel en schrijnwerk", nodes: [{ icon: "building", label: "Gevel", caption: "Verwering, voegen of infiltratie." }, RAMEN], text: "Gevelproblemen en schrijnwerk raken elkaar aan de raamaansluitingen. Bekijk ze samen, zeker wanneer u werken plant." }, (has(p, "Q18", "verwering", "voegen", "infiltratie") && windows) || (plans(a, "gevel") && plans(a, "ramen")));
  add({ id: "LINK-VOCHT-AFWERKING", title: "Vocht en binnenafwerking", nodes: [V, { icon: "house", label: "Binnenafwerking", caption: "Geplande vloer- of interieurwerken." }], text: "U plant binnenwerken terwijl er vochtsignalen gemeld zijn. Onderzoek eerst de mogelijke oorzaak, zodat nieuwe afwerkingen niet opnieuw beschadigd raken." }, (moisture || (scoreOf(p, "M01") >= 6)) && (plans(a, "interieur") || plans(a, "vloeren")));
  add({ id: "LINK-VERW-ISOL", title: "Verwarming en isolatie", nodes: [{ icon: "flame", label: "Verwarming", caption: "Geplande vervanging of aanpassing." }, { icon: "leaf", label: "Isolatie", caption: "Bepaalt de toekomstige warmtebehoefte." }], text: "U overweegt werken aan de verwarming. De isolatie bepaalt mee hoeveel warmte de woning later nodig heeft; beoordeel beide samen voor u een installatie kiest." }, plans(a, "verwarming") && (plans(a, "isolatie") || has(p, "DI01", "niet", "gedeeltelijk", "beperkt") || has(p, "MI01", "niet", "gedeeltelijk") || has(p, "Q34", "d", "e", "f")));
  add({ id: "LINK-SANITAIR-VLOER", title: "Leidingen en vloerwerken", nodes: [{ icon: "pipe", label: "Leidingen", caption: has(p, "SL01", "gt25", "origineel") ? "Ouderdom gemeld, geen bewezen gebrek." : "Aanpassing van leidingen nog te verifiëren." }, { icon: "house", label: "Vloeren", caption: "Geplande vloerwerken." }], text: has(p, "Q45", "actief", "terugkerend", "verstopping") ? "U meldt sanitaire of afvoerproblemen en plant vloerwerken. Laat de gemelde problemen beoordelen vóór de definitieve vloerafwerking." : plans(a, "sanitair") ? "Wanneer bij de geplande sanitaire werken ook leidingen worden aangepast, is het verstandig deze werkzaamheden met de nieuwe vloerafwerking af te stemmen. De Quickscan kan niet bepalen of leidingen vervangen moeten worden." : "U vermeldt oudere leidingen en plant vloerwerken. Verifieer vóór de nieuwe vloerafwerking of leidingwerken nodig zijn; ouderdom alleen bewijst geen gebrek of noodzaak tot vervanging." }, (plans(a, "sanitair") || has(p, "SL01", "gt25", "origineel") || has(p, "Q45", "actief", "terugkerend", "verstopping")) && plans(a, "vloeren"));
  const sequence = workSequence(a);
  add({ id: "LINK-WERKVOLGORDE", title: "Afstemming van uw geplande werken", nodes: [{ icon: "plan", label: "Werkvolgorde", caption: "Afstemming, geen veronderstelde omvang." }, { icon: "house", label: "Geplande werken", caption: sequence.labels.join(", ") }], text: sequence.text }, sequence.relevant);
  add({ id: "LINK-VME-KOSTEN", title: "Appartement en gemeenschappelijke kosten", nodes: [{ icon: "building", label: "Mede-eigendom", caption: "Aangekondigde werken of bijdragen." }, { icon: "doc", label: "VME-documenten", caption: "Verslagen, reservefonds en besluiten." }], text: "Er zijn werken of bijkomende bijdragen in de mede-eigendom aangekondigd. Die staan los van de privatieve barometer, maar kunnen uw kosten beïnvloeden. De VME-documenten geven daar meer duidelijkheid over." }, isApartment(a) && (has(a, "A02", "middel", "ingrijpend", "besproken") || has(a, "A03", "beperkt", "substantieel", "omvang")));
  return out.slice(0, 2);
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

/** Asbestcontext volgens OVAM: attest verplicht bij verkoop van een gebouw(deel) gebouwd vóór 2001. */
export function asbestosContext(a: Answers): { applies: "ja" | "verifieren" | "nee" | "onbekend"; note: string } {
  const apt = isApartment(a);
  if (has(a, "Q03", ...PRE_2001)) return { applies: "ja", note: `Voor een ${apt ? "appartement in een gebouw" : "gebouw"} van vóór 2001 is bij verkoop een geldig asbestattest verplicht (OVAM).${apt ? " Voor de gemene delen moet de VME uiterlijk eind 2026 over een eigen attest beschikken." : ""} Het attest zegt welke materialen asbest bevatten, niet de Quickscan.` };
  if (has(a, "Q03", "1991-2010")) return { applies: "verifieren", note: "De bouwperiode 1991–2010 overschrijdt de grens van 2001. Verifieer eerst het exacte bouwjaar (kadaster): alleen voor gebouwen van vóór 2001 is een asbestattest bij verkoop verplicht." };
  if (has(a, "Q03", "vanaf2011")) return { applies: "nee", note: "Voor gebouwen vanaf 2001 geldt de verplichting van een asbestattest bij verkoop niet. Dat is geen bevestiging dat er geen asbesthoudende materialen aanwezig zijn." };
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
  const questions = base.syndic.filter((q) => !/reservefonds|onderhoudsplan|algemene vergaderingen/.test(q));
  const add = (ok: boolean, text: string) => { if (ok) questions.push(text); };
  add(unknown("A01") || has(a, "A01", "enkele", "duidelijk"), "Welke aandachtspunten zijn gekend aan lift, balkons en collectieve installaties, en welke controles of herstellingen zijn uitgevoerd?");
  add(unknown("CD01") || unknown("CL01") || has(a, "CD01", "problemen", "verouderd"), "Wat is gekend over de toestand van dak, gevel en gemeenschappelijke leidingen? Kunt u inspectie- en onderhoudsgegevens bezorgen?");
  add(unknown("A02") || has(a, "A02", "besproken"), "Welke gemeenschappelijke werken zijn besproken of gepland, welke onderdelen betreffen ze en wat is al door de VME beslist?");
  add(unknown("A04") || !has(a, "A05", "reservefonds"), "Kunt u de actuele informatie over het reservefonds, de bestemming ervan en de laatst goedgekeurde rekeningen bezorgen?");
  add(unknown("A03") || !has(a, "A05", "bijdragen"), "Zijn bijzondere bijdragen beslist of besproken, hoe worden ze verdeeld en wanneer zijn ze verschuldigd?");
  add(!has(a, "A05", "verslagen"), "Kunt u de verslagen van de laatste algemene vergaderingen bezorgen? De beschikbaarheid is nog niet bevestigd.");
  add(!has(a, "A05", "onderhoudsplan"), "Is er een meerjarig onderhoudsplan beschikbaar? Zo ja, kunt u dit bezorgen?");
  add(!has(a, "A05", "besluiten"), "Kunt u de relevante VME-beslissingen en goedgekeurde renovatiebesluiten bezorgen?");
  return { cards, questions: [...new Set(questions)], checklist: ["Basisakte en afbakening privatieve/gemeenschappelijke delen", "Verslagen algemene vergadering en relevante VME-beslissingen", "Reservefonds, rekeningen en bijzondere bijdragen", "Meerjarig onderhoudsplan, indien beschikbaar"] };
}

// ---------- Productaanbeveling (deterministisch, los van de scoring) ----------
export type ReasonCode =
  | "PLUS-COMPLEX-TECH" | "PLUS-COMPLEX-SEQUENCE" | "PLUS-BUYER-RENOVATION"
  | "WS-TECH-BUYER" | "WS-TECH-OWNER" | "WS-APT-COMMON" | "WS-UNKNOWN-BUYER"
  | "BUDGET-COST" | "NONE-NEUTRAL";

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
  const tech = technicalDomains(ctx.domainScores).length;
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
  else if (apt && buy && ctx.apartmentSignals > 0) code = "WS-APT-COMMON";
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
  };
}
export type QuickscanReport23 = ReturnType<typeof composeReport>;
export type ReportV23 = QuickscanReport23["v23"];
