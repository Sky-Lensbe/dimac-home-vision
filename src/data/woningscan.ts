/**
 * Woningscan-aanbod. Prijzen zijn inclusief btw.
 * De drone-dakscreening is een losse optie en staat standaard uit.
 */

export type PackageId = "basis" | "plus" | "compleet";

export interface ScanPackage {
  id: PackageId;
  name: string;
  price: number;
  tagline: string;
  includesFrom?: string;
  items: string[];
  audience: string;
  note?: string;
  /** Wat niet standaard inbegrepen is. */
  excludes?: string[];
  /** Kernresultaat in één oogopslag. */
  result: string;
  cta: string;
}

export const DRONE_PRICE = 125;

export const DRONE_OPTION = {
  name: "Drone-dakscreening",
  price: DRONE_PRICE,
  text: "Zichtbare delen van het dak van bovenaf bekeken: dakbedekking, nokken, schouwen, zichtbare aansluitingen en andere bereikbare aandachtspunten. Relevante beelden en bevindingen komen in uw rapport, ook bij Basis.",
  condition: "Uitvoering is afhankelijk van weersomstandigheden, vliegveiligheid, privacy en de geldende droneregels. Vervangt geen fysieke dakinspectie.",
};

export const SCAN_PACKAGES: ScanPackage[] = [
  {
    id: "basis",
    name: "Basis",
    price: 299,
    tagline: "Weet hoe uw woning ervoor staat.",
    items: [
      "Visuele woninginspectie van circa 90 minuten",
      "Controle van 25 bouwtechnische aandachtspunten",
      "Beknopt digitaal rapport",
      "Overzicht van zichtbare vaststellingen",
      "Renovatieprioriteiten",
    ],
    audience: "Voor kandidaat-kopers en eigenaars die een eerste technisch overzicht wensen.",
    excludes: ["Uitgebreide fotodocumentatie", "Renovatiestappenplan zoals bij Plus", "Indicatieve kostenraming"],
    result: "Inzicht",
    cta: "Kies Basis",
  },
  {
    id: "plus",
    name: "Plus",
    price: 449,
    tagline: "Weet wat u moet aanpakken. En vooral: wat eerst.",
    includesFrom: "Alles uit Basis, aangevuld met:",
    items: [
      "Uitgebreidere visuele inspectie van circa twee uur",
      "Fotodocumentatie",
      "Gerichte aanbevelingen",
      "Logische renovatievolgorde",
      "Onderscheid tussen prioritaire en latere werken",
      "Praktisch renovatiestappenplan",
    ],
    audience: "Voor wie inzicht wil in de aanpak en volgorde van een renovatie.",
    note: "Plus bevat geen renovatiekostenraming.",
    result: "Inzicht + plan",
    cta: "Kies Plus",
  },
  {
    id: "compleet",
    name: "Compleet",
    price: 649,
    tagline: "Zie het complete plaatje.",
    includesFrom: "Alles uit Plus, aangevuld met:",
    items: [
      "Analyse van de geplande renovatie",
      "Indicatieve renovatiekostenraming",
      "Budgetverdeling per belangrijke renovatiecategorie",
      "Inzicht in de financiële haalbaarheid van de geplande werken",
      "Mogelijkheid om een totaalrenovatie door DIMAC te laten beoordelen, zonder verplichting",
    ],
    audience: "Voor kandidaat-kopers en eigenaars die ook een inschatting van hun mogelijke investering willen.",
    result: "Inzicht + plan + budgetindicatie",
    note: "Een kostenraming is indicatief, niet bindend en vormt geen gedetailleerde aannemersofferte of vastgoedtaxatie.",
    cta: "Kies Compleet",
  },
];

export function getPackage(id: string | null | undefined): ScanPackage | undefined {
  return SCAN_PACKAGES.find((p) => p.id === id);
}

export function scanTotal(id: PackageId, drone: boolean): number {
  const pkg = getPackage(id);
  if (!pkg) throw new Error(`Onbekend pakket: ${id}`);
  return pkg.price + (drone ? DRONE_PRICE : 0);
}

export function formatEuro(value: number): string {
  return `€${value.toLocaleString("nl-BE")}`;
}

export type Situation = "kopen" | "renoveren";

/** Leest pakket- en situatieparameters uit de URL; ongeldige waarden worden genegeerd. */
export function parseScanParams(params: URLSearchParams): { pakket: PackageId | null; situatie: Situation | null } {
  const pakket = getPackage(params.get("pakket"))?.id ?? null;
  const s = params.get("situatie");
  return { pakket, situatie: s === "kopen" || s === "renoveren" ? s : null };
}
