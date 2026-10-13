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
  cta: string;
}

export const DRONE_PRICE = 125;

export const DRONE_OPTION = {
  name: "Drone-dakscreening",
  price: DRONE_PRICE,
  text: "Visuele screening van bereikbare dakvlakken, dakbedekking, nokken, schouwen en zichtbare aandachtspunten. Detailbeelden en bevindingen worden in het rapport opgenomen.",
  condition: "Uitvoering is afhankelijk van weersomstandigheden, veiligheid en toegestane vliegmogelijkheden.",
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
    audience: "Voor kandidaat-kopers en eigenaars die een eerste bouwtechnisch overzicht willen.",
    cta: "Kies Basis",
  },
  {
    id: "plus",
    name: "Plus",
    price: 449,
    tagline: "Weet wat u moet aanpakken. En vooral: wat eerst.",
    includesFrom: "Alles uit Basis, aangevuld met:",
    items: [
      "Uitgebreidere inspectie en fotodocumentatie",
      "Gerichte aanbevelingen",
      "Logische renovatievolgorde",
      "Onderscheid tussen prioritaire en latere werken",
      "Praktisch renovatiestappenplan",
    ],
    audience: "Voor kopers en eigenaars die een renovatie willen plannen.",
    note: "Zonder kostenraming.",
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
      "Indicatieve kostenraming",
      "Budgetverdeling per belangrijke renovatiecategorie",
      "Inzicht in financiële haalbaarheid en eventuele premies",
      "Mogelijkheid om een totaalrenovatie door Dimac te laten beoordelen",
    ],
    audience: "Voor wie een substantiële renovatie overweegt en de mogelijke investering beter wil inschatten.",
    note: "De kostenraming is indicatief en geen bindende offerte of vastgoedtaxatie.",
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
