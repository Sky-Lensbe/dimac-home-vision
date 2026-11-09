/**
 * Centrale productcatalogus van het Woningscan-aanbod: de enige bron voor prijzen, namen en kenmerken.
 * Zonder imports, zodat browser (via src/data/woningscan.ts) en server (Quickscan-aanbeveling) dezelfde gegevens gebruiken.
 * Alle prijzen zijn definitief bevestigd en inclusief 21% btw. De drone is een losse optie bij fysieke inspecties.
 */

export const VAT_RATE = 0.21;

export type ProductId = "quickscan" | "online-budgetindicator" | "woningscan" | "woningscan-plus";
/** Fysieke inspecties die via het aanvraagformulier aangevraagd kunnen worden. */
export type PackageId = "woningscan" | "woningscan-plus";
export type Delivery = "online" | "ter-plaatse";
export type Availability = "available" | "coming_soon";

export interface ScanProduct {
  id: ProductId;
  name: string;
  shortTitle: string;
  delivery: Delivery;
  /** Prijs inclusief btw. 0 = gratis. */
  price: number;
  vatRate: number;
  availability: Availability;
  tagline: string;
  description: string;
  audience: string;
  items: string[];
  excludes: string[];
  /** Kenmerk op één regel voor compacte weergave (homepage). */
  summary: string;
  priceNote?: string;
  note?: string;
  cta: string;
  /** null = niet-transactioneel (nog niet beschikbaar). */
  ctaTo: string | null;
  droneAllowed: boolean;
}

export const DRONE_PRICE = 125;

export const DRONE_OPTION = {
  name: "Drone-dakscreening",
  price: DRONE_PRICE,
  text: "Zichtbare delen van het dak van bovenaf bekeken: dakbedekking, nokken, schouwen, zichtbare aansluitingen en andere bereikbare aandachtspunten. Relevante beelden en bevindingen komen in uw rapport.",
  condition:
    "Uitvoering is afhankelijk van weersomstandigheden, vliegveiligheid, privacy, de geldende droneregels en de praktische bereikbaarheid.",
};

export const PRODUCTS: ScanProduct[] = [
  {
    id: "quickscan",
    name: "Quickscan",
    shortTitle: "Quickscan",
    delivery: "online",
    price: 0,
    vatRate: VAT_RATE,
    availability: "available",
    tagline: "Ontdek welke onderdelen van uw woning extra aandacht verdienen.",
    description: "Een adaptieve online vragenlijst met een persoonlijke renovatiebarometer en rapport.",
    audience: "Voor wie een eerste online inzicht wenst, zonder plaatsbezoek.",
    items: [
      "Adaptieve online vragenlijst",
      "Aparte vragenroutes voor woningen en appartementen",
      "Persoonlijke renovatiebarometer",
      "Bouwtechnische en energetische aandachtspunten",
      "Inzicht in ontbrekende informatie",
      "Praktische renovatieaanbevelingen",
      "Persoonlijk digitaal rapport met downloadbare PDF",
    ],
    excludes: ["Renovatiebudget", "Inspectie ter plaatse", "Officiële keuring of technische diagnose", "Garantie op de staat van de woning"],
    summary: "Online renovatiebarometer.",
    cta: "Start de gratis Quickscan",
    ctaTo: "/woningscan/quickscan",
    droneAllowed: false,
  },
  {
    id: "online-budgetindicator",
    name: "Online Woningscan met budgetindicator",
    shortTitle: "Online budgetraming",
    delivery: "online",
    price: 39.99,
    vatRate: VAT_RATE,
    availability: "coming_soon",
    tagline: "Ontdek wat de renovatie van uw woning ongeveer kan kosten.",
    description:
      "Op basis van uw woninggegevens, de geplande renovatiewerken en de prijskennis van DIMAC krijgt u een persoonlijke indicatie van het mogelijke renovatiebudget, zonder plaatsbezoek.",
    audience: "Voor eigenaars en kopers die renovatiekosten online willen inschatten.",
    items: [
      "Hergebruik van eerder ingevulde Quickscan-gegevens",
      "Aanvullende vragen over de geplande renovatie",
      "Oppervlaktes, hoeveelheden en afwerkingsniveau",
      "Indicatieve budgetvorken per renovatiecategorie",
      "Totaaloverzicht met duidelijke aannames en onzekerheden",
      "Digitaal budgetrapport",
    ],
    excludes: ["Inspectie ter plaatse", "Bindende offerte"],
    summary: "Indicatieve renovatiekosten.",
    priceNote: "Eenmalige online budgetraming",
    note: "Geen bindende offerte. Werkelijke kosten kunnen afwijken door verborgen gebreken, afwijkende afmetingen, constructieve omstandigheden, bereikbaarheid, materiaalkeuzes of onvoorziene werken.",
    cta: "Binnenkort beschikbaar",
    ctaTo: null,
    droneAllowed: false,
  },
  {
    id: "woningscan",
    name: "Woningscan",
    shortTitle: "Woningscan",
    delivery: "ter-plaatse",
    price: 299,
    vatRate: VAT_RATE,
    availability: "available",
    tagline: "Een professionele blik op de bouwtechnische toestand van uw woning.",
    description:
      "Een DIMAC-deskundige bekijkt de zichtbare bouwtechnische onderdelen van uw woning en brengt relevante vaststellingen en renovatieprioriteiten overzichtelijk in kaart.",
    audience: "Voor kandidaat-kopers en eigenaars die een eerste bouwtechnisch overzicht wensen.",
    items: [
      "Inspectie ter plaatse",
      "Controle van de belangrijkste bouwtechnische onderdelen",
      "Overzicht van technische aandachtspunten",
      "Prioritering van relevante vaststellingen",
      "Digitaal rapport",
    ],
    excludes: [
      "Uitgebreide fotodocumentatie",
      "Gedetailleerd renovatiestappenplan",
      "Uitgebreide kostenraming",
      "Destructief onderzoek, wettelijke keuringen, asbest- of stabiliteitsonderzoek",
    ],
    summary: "Visuele bouwtechnische inspectie.",
    cta: "Vraag een Woningscan aan",
    ctaTo: "/woningscan?pakket=woningscan#aanvraag",
    droneAllowed: true,
  },
  {
    id: "woningscan-plus",
    name: "Woningscan Plus",
    shortTitle: "Woningscan Plus",
    delivery: "ter-plaatse",
    price: 449,
    vatRate: VAT_RATE,
    availability: "available",
    tagline: "Uitgebreid inzicht in de technische toestand en de renovatiemogelijkheden van uw woning.",
    description:
      "Woningscan Plus gaat verder dan een eerste bouwtechnisch overzicht. DIMAC brengt de relevante zichtbare aandachtspunten uitgebreider in kaart en helpt u de volgende renovatiestappen beter voorbereiden.",
    audience: "Voor wie een aankoop of renovatie grondiger wil voorbereiden.",
    items: [
      "Uitgebreidere visuele inspectie ter plaatse",
      "Systematische bouwtechnische beoordeling",
      "Fotodocumentatie van relevante vaststellingen",
      "Gedetailleerdere aandachtspunten",
      "Prioriteiten en aanbevelingen",
      "Renovatie stappenplan",
      "Uitgebreider digitaal rapport",
    ],
    excludes: ["Destructief onderzoek, wettelijke keuringen, asbest- of stabiliteitsonderzoek"],
    summary: "Uitgebreidere inspectie en renovatieanalyse.",
    cta: "Vraag Woningscan Plus aan",
    ctaTo: "/woningscan?pakket=woningscan-plus#aanvraag",
    droneAllowed: true,
  },
];

export const ONLINE_PRODUCTS = PRODUCTS.filter((p) => p.delivery === "online");
export const PHYSICAL_PRODUCTS = PRODUCTS.filter((p) => p.delivery === "ter-plaatse");

export function getProduct(id: string | null | undefined): ScanProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
