/**
 * Realisaties van Dimac.
 *
 * LET OP — VERIFICATIE VEREIST VOOR PUBLICATIE.
 * De onderstaande vijf cases zijn aangeleverde testcontent en zijn nog niet
 * bevestigd door Dimac. Ze staan daarom op `confirmed: false` en
 * `isTestContent: true`. Zolang `confirmed` false is:
 *   - krijgt de casepagina noindex,
 *   - staat de case niet in de sitemap,
 *   - wordt er geen publieke structured data gegenereerd.
 * Vervang of bevestig gemeente, werkzaamheden, uitdaging en resultaat aan de
 * hand van echte projecten en zet dan `confirmed: true` en
 * `isTestContent: false`.
 */

import bathroomAsset from "@/assets/bathroom-realisation.jpg.asset.json";
import kitchenAsset from "@/assets/kitchen-realisation.jpg.asset.json";
import roofAsset from "@/assets/roof-realisation.jpg.asset.json";
import totalAsset from "@/assets/total-realisation.jpg.asset.json";
import prep from "@/assets/preparation.jpg";

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  title: string;
  slug: string;
  municipality: string;
  projectType: string;
  summary: string;
  situation: string;
  challenge: string;
  approach: string;
  result: string;
  images: ProjectImage[];
  /** Slugs uit src/data/services.ts. */
  relatedServices: string[];
  /** Alleen bevestigde projecten worden geïndexeerd en in de sitemap opgenomen. */
  confirmed: boolean;
  /** Interne markering; nooit zichtbaar in de publieke UI. */
  isTestContent: boolean;
}

export const projects: Project[] = [
  {
    title: "Totaalrenovatie van een gezinswoning",
    slug: "totaalrenovatie-gezinswoning-diest",
    municipality: "Diest",
    projectType: "Totaalrenovatie",
    summary:
      "Meerdere ruimtes tegelijk aangepakt, met één partij die de volledige renovatie overzag.",
    situation:
      "De woning was technisch en visueel verouderd. De eigenaars wilden meerdere ruimtes tegelijk aanpakken, maar zochten vooral één partij die de volledige renovatie kon overzien.",
    challenge:
      "Elektriciteit, sanitair, vloeropbouw, keuken, badkamer en afwerking moesten technisch én qua planning goed op elkaar aansluiten. Zonder centrale coördinatie zou het project snel versnipperd raken over verschillende aannemers.",
    approach:
      "Dimac bracht de verschillende werken samen in één renovatieplan, stemde de technische fases op elkaar af en coördineerde de uitvoering van ruwere ingrepen tot de finale afwerking.",
    result:
      "De woning werd integraal vernieuwd zonder dat de klant zelf verschillende partijen moest aansturen. Het resultaat is een technisch coherente renovatie met een uniforme afwerking en één duidelijk aanspreekpunt doorheen het traject.",
    images: [
      { src: totalAsset.url, alt: "Volledig gerenoveerde woning met open leefruimte" },
      { src: kitchenAsset.url, alt: "Nieuwe keuken binnen de totaalrenovatie" },
      { src: prep, alt: "Technische voorbereiding tijdens de renovatie" },
    ],
    relatedServices: ["totaalrenovatie", "elektriciteit", "sanitair", "afwerking"],
    confirmed: false,
    isTestContent: true,
  },
  {
    title: "Badkamerrenovatie met technische heropbouw",
    slug: "badkamerrenovatie-scherpenheuvel-zichem",
    municipality: "Scherpenheuvel-Zichem",
    projectType: "Badkamerrenovatie",
    summary:
      "Een badkamer opnieuw opgebouwd vanuit de technische basis, in één gecoördineerd traject.",
    situation:
      "De bestaande badkamer was verouderd en voldeed niet meer aan de verwachtingen op vlak van comfort, indeling en uitstraling.",
    challenge:
      "Een badkamerrenovatie draait niet alleen om nieuwe tegels en sanitair. Leidingen, afvoer, elektriciteit, ventilatie, waterdichting en afwerking moesten als één technisch geheel worden aangepakt.",
    approach:
      "Dimac verwijderde de bestaande inrichting, paste de technieken aan waar nodig en bouwde de badkamer opnieuw op vanuit de technische basis. De verschillende uitvoeringsfases werden centraal gepland en opgevolgd.",
    result:
      "Een moderne badkamer waarin esthetiek en techniek op elkaar zijn afgestemd. De klant kreeg één gecoördineerd traject in plaats van afzonderlijke afspraken met meerdere vakmensen.",
    images: [
      { src: bathroomAsset.url, alt: "Gerenoveerde badkamer met tegelwerk en inloopdouche" },
      { src: prep, alt: "Voorbereiding van de technieken achter de wand" },
    ],
    relatedServices: ["badkamer-renovatie", "sanitair", "elektriciteit"],
    confirmed: false,
    isTestContent: true,
  },
  {
    title: "Dakrenovatie gecombineerd met energieverbetering",
    slug: "dakrenovatie-energie-halen",
    municipality: "Halen",
    projectType: "Dakwerken & energie",
    summary:
      "Dakopbouw, isolatie en technische voorzieningen in de juiste volgorde op elkaar afgestemd.",
    situation:
      "De eigenaars wilden hun verouderde dak aanpakken en tegelijk bekijken welke ingrepen zinvol waren om de energieprestaties van de woning te verbeteren.",
    challenge:
      "Dakwerken, isolatie en mogelijke technieken zoals zonnepanelen beïnvloeden elkaar. Een verkeerde volgorde kan leiden tot dubbel werk of oplossingen die later opnieuw moeten worden aangepast.",
    approach:
      "Dimac bekeek het dak als onderdeel van het volledige gebouw en stemde de dakopbouw, isolatie en technische voorzieningen op elkaar af. De uitvoering werd gepland met aandacht voor zowel waterdichtheid als toekomstige energieprestaties.",
    result:
      "Een vernieuwd dak met een logisch opgebouwde technische oplossing en een woning die beter voorbereid is op verdere energetische verbeteringen.",
    images: [{ src: roofAsset.url, alt: "Vernieuwd dak met nieuwe dakbedekking" }],
    relatedServices: ["dakwerken", "hernieuwbare-energie"],
    confirmed: false,
    isTestContent: true,
  },
  {
    title: "Renovatie van keuken en leefruimte",
    slug: "keuken-leefruimte-tessenderlo-ham",
    municipality: "Tessenderlo-Ham",
    projectType: "Keukenrenovatie & interieur",
    summary:
      "Technieken, vloer, wanden en keuken in één volgorde uitgevoerd tot één samenhangende leefruimte.",
    situation:
      "De bestaande keuken en leefruimte sloten niet meer aan bij hoe het gezin de woning gebruikte. De eigenaars wilden een opener geheel met een nieuwe keuken en een uniforme afwerking.",
    challenge:
      "Een keukenrenovatie heeft gevolgen voor elektriciteit, sanitair, verlichting, vloer en wandafwerking. Al die onderdelen moesten klaar zijn voordat de keuken correct geplaatst kon worden.",
    approach:
      "Dimac coördineerde de voorbereidende technieken, de aanpassingen aan vloer en wanden en de verdere afwerking rond de nieuwe keuken. Zo werd elke fase uitgevoerd in functie van het eindresultaat.",
    result:
      "Een samenhangende leefruimte waarin keuken, technieken en afwerking één geheel vormen, zonder zichtbare sporen van afzonderlijke renovatiefases.",
    images: [
      { src: kitchenAsset.url, alt: "Gerenoveerde keuken met maatwerkkasten" },
      { src: totalAsset.url, alt: "Aansluitende leefruimte na de renovatie" },
    ],
    relatedServices: ["keuken-renovatie", "elektriciteit", "afwerking"],
    confirmed: false,
    isTestContent: true,
  },
  {
    title: "Woningscan als startpunt voor een gefaseerde renovatie",
    slug: "woningscan-gefaseerde-renovatie-bekkevoort",
    municipality: "Bekkevoort",
    projectType: "Woningscan & renovatieadvies",
    summary:
      "Van losse renovatieplannen naar een logische volgorde, met aandacht voor technische afhankelijkheden.",
    situation:
      "De eigenaars hadden verschillende renovatieplannen, maar wisten niet welke werken prioritair waren of in welke volgorde ze best uitgevoerd werden.",
    challenge:
      "Dak, technieken, badkamer en energetische verbeteringen stonden allemaal op de planning. Zonder duidelijke prioriteiten bestond het risico dat nieuwe afwerking later opnieuw opgebroken moest worden.",
    approach:
      "Dimac bracht tijdens de woningscan de belangrijkste aandachtspunten van de woning in kaart en vertaalde die naar een logische renovatievolgorde. Daarbij werd rekening gehouden met technische afhankelijkheden en toekomstige werken.",
    result:
      "De eigenaars kregen een duidelijke roadmap in plaats van losse offertes. Daardoor konden ze gefaseerd investeren zonder beslissingen te nemen die latere renovatiestappen zouden bemoeilijken.",
    images: [{ src: prep, alt: "Analyse van de woning tijdens de woningscan" }],
    relatedServices: ["totaalrenovatie", "dakwerken"],
    confirmed: false,
    isTestContent: true,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Projecten die publiek geïndexeerd mogen worden. */
export const confirmedProjects = projects.filter((p) => p.confirmed);

/** Projecten die in de UI getoond worden (ook onbevestigde, maar zonder indexering). */
export const visibleProjects = projects;

export const projectTypes = Array.from(new Set(projects.map((p) => p.projectType)));

export const projectsForService = (serviceSlug: string) =>
  projects.filter((p) => p.relatedServices.includes(serviceSlug));

/**
 * Optionele commerciële voorwaarde van de woningscan (bv. verrekening bij
 * opdracht). Blijft null tot Dimac de exacte voorwaarde bevestigt; zolang de
 * waarde null is, wordt er niets over getoond.
 */
export const woningscanCommercialCondition: string | null = null;
