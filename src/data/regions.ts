import type { FAQItem } from "@/data/services";

export interface RegionContent {
  slug: string;
  name: string;
  /** Alleen actieve regio's krijgen een indexeerbare route, sitemapvermelding en interne links. */
  enabled: boolean;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    h1: string;
    intro: string;
  };
  questions: {
    title: string;
    intro?: string;
    items: string[];
  };
  approach: {
    title: string;
    paragraphs: string[];
  };
  localContext: {
    title: string;
    paragraphs: string[];
  };
  /** Slugs uit src/data/services.ts. */
  relevantServices: string[];
  /** Alleen bevestigde lokale realisaties. Blijft leeg zolang die er niet zijn. */
  projectReferences: { label: string; to: string }[];
  serviceArea: string[];
  faq: FAQItem[];
  /** Slugs uit src/data/articles.ts. */
  relatedArticles: string[];
  finalCta: {
    title: string;
    text: string;
    primary: { label: string; to: string };
    secondary?: { label: string; to: string };
  };
}

export const regions: RegionContent[] = [
  {
    slug: "diest",
    name: "Diest",
    enabled: true,
    meta: {
      title: "Aannemer in Diest | Renovatie en nieuwbouw | Dimac",
      description:
        "Dimac is uw aannemer in Diest voor renovatie, nieuwbouw en technieken. Lokale aanpak, technische voorbereiding en coördinatie van alle werken.",
    },
    hero: {
      eyebrow: "Werkgebied",
      h1: "Aannemer in Diest",
      intro:
        "Dimac werkt in Diest en de omliggende deelgemeenten aan renovaties, verbouwingen en nieuwbouw. Wij bereiden de werken technisch voor, stemmen de vakgebieden op elkaar af en volgen de uitvoering op de werf op.",
    },
    questions: {
      title: "Vragen die in Diest vaak op tafel liggen",
      intro:
        "De meeste gesprekken starten niet met een plan, maar met een vraag over de woning zelf.",
      items: [
        "Is deze woning uit de jaren zestig of zeventig nog zinvol te renoveren, of weegt een gefaseerde aanpak beter door?",
        "Wat moet er eerst gebeuren wanneer dak, elektriciteit en sanitair alle drie verouderd zijn?",
        "Hoe pakt u een smalle rijwoning in het centrum aan wanneer de werf moeilijk bereikbaar is?",
        "Welke werken kunnen samen worden uitgevoerd om de woning maar één keer open te leggen?",
        "Hoe houdt u het budget beheersbaar wanneer de staat van de woning pas tijdens de afbraak duidelijk wordt?",
      ],
    },
    approach: {
      title: "Hoe Dimac een project in Diest aanpakt",
      paragraphs: [
        "Wij starten met een analyse van de woning en van wat u effectief wil bereiken. Pas daarna bepalen wij de volgorde van de werken, de technische randvoorwaarden en de raakpunten tussen ruwbouw, technieken en afwerking.",
        "Tijdens de uitvoering coördineert Dimac de vakgebieden onderling. Dat betekent dat elektriciteit, sanitair en verwarming ingetekend zijn voordat er wordt gekapt of gegoten, en dat de afwerking niet moet worden aangepast aan keuzes die te laat gemaakt zijn.",
        "U krijgt tijdens de werf één contactpersoon die de planning kent en die weet welke beslissing wanneer nodig is.",
      ],
    },
    localContext: {
      title: "Bouwcontext in Diest",
      paragraphs: [
        "Diest combineert een historisch afgebakende kern met woonwijken en lintbebouwing daarrond, en met deelgemeenten zoals Schaffen, Deurne, Kaggevinne, Molenstede en Webbekom. Die spreiding levert erg verschillende renovatievragen op binnen dezelfde gemeente.",
        "In en rond de binnenstad gaat het vaak om smalle rijwoningen en panden binnen beschermd stadsgezicht. Daar bepalen de aanvoer van materiaal, de beperkte werfruimte, de gevelvoorschriften en de aansluiting op de buurpanden mee hoe de werken worden ingepland.",
        "In de woonwijken en langs de invalswegen staan veel gezinswoningen uit de periode 1950 tot 1980. Typische aandachtspunten daar zijn een ongeïsoleerde of licht geïsoleerde daksectie, een verouderd elektrisch bord zonder differentieelbeveiliging per kring, enkel glas of vroeg dubbel glas, en een badkamer en keuken die nog op de oorspronkelijke leidingen zitten.",
        "Voor vergunningsplichtige werken en voor de stedenbouwkundige voorschriften is de stad Diest het aanspreekpunt. Wij houden er in de planning rekening mee dat een vergunningstraject tijd vraagt en zetten die periode in voor de technische voorbereiding.",
      ],
    },
    relevantServices: [
      "totaalrenovatie",
      "nieuwbouw",
      "badkamer-renovatie",
      "keuken-renovatie",
      "dakwerken",
      "elektriciteit",
      "sanitair",
      "technieken",
    ],
    projectReferences: [],
    serviceArea: [
      "Diest",
      "Schaffen",
      "Deurne",
      "Kaggevinne",
      "Molenstede",
      "Webbekom",
      "Scherpenheuvel-Zichem",
      "Halen",
      "Tessenderlo",
      "Bekkevoort",
    ],
    faq: [
      {
        q: "Werkt Dimac in heel Diest, ook in de deelgemeenten?",
        a: "Ja. Wij werken in de Diestse binnenstad en in de deelgemeenten Schaffen, Deurne, Kaggevinne, Molenstede en Webbekom, en in de omliggende gemeenten.",
      },
      {
        q: "Kan Dimac ook één afzonderlijke werf uitvoeren, zoals enkel de badkamer?",
        a: "Dat kan. Wij bekijken dan wel of de installaties eronder die renovatie aankunnen, zodat u dezelfde ruimte niet binnen enkele jaren opnieuw moet openleggen.",
      },
      {
        q: "Hoe verloopt een werf in de smalle straten van het centrum?",
        a: "Wij bekijken vooraf de aanvoer, de stockage van materiaal en de eventuele inname van het openbaar domein. Die aanvraag verloopt via de stad Diest en wordt in de planning meegenomen.",
      },
      {
        q: "Vraagt Dimac de vergunning aan?",
        a: "De vergunningsaanvraag verloopt via uw architect of via de stad Diest. Wij stemmen onze planning en de technische uitvoering af op wat vergund is.",
      },
      {
        q: "Wat is een goede eerste stap wanneer u nog niet weet wat er nodig is?",
        a: "Een woningscan. Daarbij wordt de volledige woning bekeken, van kelder tot dak, zodat u weet welke werken noodzakelijk zijn en in welke volgorde ze best gebeuren.",
      },
    ],
    relatedArticles: ["welke-volgorde-bij-renovatie", "wat-controleert-een-woningscan"],
    finalCta: {
      title: "Uw project in Diest bespreken?",
      text: "Vertel kort wat u wil aanpakken en in welke straat of deelgemeente uw woning staat. Wij bekijken welke stappen in uw situatie logisch zijn.",
      primary: { label: "Neem contact op", to: "/contact" },
      secondary: { label: "Plan uw woningscan", to: "/woningscan" },
    },
  },

  // Onderstaande regio's blijven concept tot er voldoende unieke, bevestigde
  // lokale inhoud beschikbaar is. Concept betekent: niet indexeerbaar, niet in
  // de sitemap, niet in de footer en niet via interne links bereikbaar.
  {
    slug: "scherpenheuvel-zichem",
    name: "Scherpenheuvel-Zichem",
    enabled: false,
    meta: {
      title: "Aannemer in Scherpenheuvel-Zichem | Dimac",
      description: "Renovatie, nieuwbouw en technieken in Scherpenheuvel-Zichem door Dimac.",
    },
    hero: {
      eyebrow: "Werkgebied",
      h1: "Aannemer in Scherpenheuvel-Zichem",
      intro: "Deze pagina wordt aangevuld met bevestigde lokale inhoud.",
    },
    questions: { title: "Lokale vragen", items: [] },
    approach: { title: "Onze aanpak", paragraphs: [] },
    localContext: { title: "Bouwcontext", paragraphs: [] },
    relevantServices: ["totaalrenovatie", "dakwerken", "badkamer-renovatie"],
    projectReferences: [],
    serviceArea: ["Scherpenheuvel", "Zichem", "Testelt", "Averbode", "Messelbroek"],
    faq: [],
    relatedArticles: [],
    finalCta: {
      title: "Uw project bespreken?",
      text: "Neem contact op voor een gesprek over uw project.",
      primary: { label: "Neem contact op", to: "/contact" },
    },
  },
  {
    slug: "halen",
    name: "Halen",
    enabled: false,
    meta: {
      title: "Aannemer in Halen | Dimac",
      description: "Renovatie, nieuwbouw en technieken in Halen door Dimac.",
    },
    hero: {
      eyebrow: "Werkgebied",
      h1: "Aannemer in Halen",
      intro: "Deze pagina wordt aangevuld met bevestigde lokale inhoud.",
    },
    questions: { title: "Lokale vragen", items: [] },
    approach: { title: "Onze aanpak", paragraphs: [] },
    localContext: { title: "Bouwcontext", paragraphs: [] },
    relevantServices: ["totaalrenovatie", "dakwerken", "elektriciteit"],
    projectReferences: [],
    serviceArea: ["Halen", "Loksbergen", "Zelem"],
    faq: [],
    relatedArticles: [],
    finalCta: {
      title: "Uw project bespreken?",
      text: "Neem contact op voor een gesprek over uw project.",
      primary: { label: "Neem contact op", to: "/contact" },
    },
  },
  {
    slug: "tessenderlo-ham",
    name: "Tessenderlo-Ham",
    enabled: false,
    meta: {
      title: "Aannemer in Tessenderlo-Ham | Dimac",
      description: "Renovatie, nieuwbouw en technieken in Tessenderlo-Ham door Dimac.",
    },
    hero: {
      eyebrow: "Werkgebied",
      h1: "Aannemer in Tessenderlo-Ham",
      intro: "Deze pagina wordt aangevuld met bevestigde lokale inhoud.",
    },
    questions: { title: "Lokale vragen", items: [] },
    approach: { title: "Onze aanpak", paragraphs: [] },
    localContext: { title: "Bouwcontext", paragraphs: [] },
    relevantServices: ["totaalrenovatie", "nieuwbouw", "technieken"],
    projectReferences: [],
    serviceArea: ["Tessenderlo", "Ham", "Kwaadmechelen", "Oostham"],
    faq: [],
    relatedArticles: [],
    finalCta: {
      title: "Uw project bespreken?",
      text: "Neem contact op voor een gesprek over uw project.",
      primary: { label: "Neem contact op", to: "/contact" },
    },
  },
];

export const activeRegions = regions.filter((r) => r.enabled);

export function getRegion(slug: string): RegionContent | undefined {
  return regions.find((r) => r.slug === slug);
}

export function getActiveRegion(slug: string): RegionContent | undefined {
  return activeRegions.find((r) => r.slug === slug);
}
