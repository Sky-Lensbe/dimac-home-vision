import type { FAQItem } from "@/data/services";

export type ArticleSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "note"; title?: string; text: string }
  | { type: "faq"; title?: string; items: FAQItem[] }
  | { type: "cta"; text: string; label: string; to: string };

export interface ArticleContent {
  slug: string;
  status: "draft" | "published";
  title: string;
  excerpt: string;
  category: string;
  publishedAt?: string;
  modifiedAt?: string;
  readingTime?: string;
  meta: {
    title: string;
    description: string;
  };
  hero?: {
    eyebrow?: string;
    image?: string;
    imageAlt?: string;
  };
  intro: string;
  sections: ArticleSection[];
  /** Slugs uit src/data/services.ts. Het eerste item is de primaire dienst. */
  relatedServices: string[];
  /** Slugs uit src/data/regions.ts. Alleen actieve regio's worden getoond. */
  relatedRegions: string[];
  relatedArticles: string[];
  finalCta: {
    title: string;
    text: string;
    primary: { label: string; to: string };
    secondary?: { label: string; to: string };
  };
}

export const articles: ArticleContent[] = [
  {
    slug: "wat-kost-een-totaalrenovatie",
    status: "published",
    title: "Wat kost een totaalrenovatie?",
    excerpt:
      "Waarom prijzen per project sterk verschillen, welke posten het budget bepalen en hoe u een raming leert lezen zonder vals gevoel van zekerheid.",
    category: "Budget",
    publishedAt: "2026-02-10",
    modifiedAt: "2026-07-31",
    readingTime: "7 minuten",
    meta: {
      title: "Wat kost een totaalrenovatie? Zo bepaalt u uw budget | Dimac",
      description:
        "Welke factoren bepalen de prijs van een totaalrenovatie, welke posten worden vaak vergeten en hoe leest u een raming correct? Praktische uitleg zonder schijnexacte cijfers.",
    },
    hero: { eyebrow: "Budget" },
    intro:
      "Op de vraag wat een totaalrenovatie kost, bestaat geen eerlijk kort antwoord. De prijs hangt af van de staat van de woning, van de omvang van de werken en van keuzes die u pas later maakt. Wel kunt u vooraf begrijpen waaruit dat budget is opgebouwd, en dat is precies wat u nodig heeft om te beslissen.",
    sections: [
      { type: "heading", level: 2, text: "Waarom er geen vaste prijs per vierkante meter bestaat" },
      {
        type: "paragraph",
        text: "Prijzen per vierkante meter circuleren veel, maar ze zeggen weinig over uw woning. Twee woningen van dezelfde oppervlakte kunnen een sterk verschillend budget vragen omdat de ene een gezonde draagstructuur en een recent dak heeft, en de andere niet.",
      },
      {
        type: "paragraph",
        text: "Wat het verschil maakt, is niet de oppervlakte maar de hoeveelheid werk die onder de afwerking zit. Een woning waar de elektriciteit, het sanitair, de verwarming en de isolatie allemaal vervangen moeten worden, vraagt een ander traject dan een woning waar enkel de leefruimtes worden aangepakt.",
      },
      { type: "heading", level: 2, text: "De posten die het budget bepalen" },
      {
        type: "list",
        items: [
          "Afbraak en afvoer, inclusief containers en eventuele verwijdering van asbesthoudende materialen door een erkende partij.",
          "Structurele werken, zoals het wegnemen van een dragende muur, funderingswerk of het herstellen van balklagen.",
          "Dak en isolatie, waarbij de opbouw van het dak bepaalt of isoleren langs binnen of langs buiten realistisch is.",
          "Buitenschrijnwerk en beglazing, vaak samen met de aanpassing van dorpels en aansluitingen.",
          "Technieken: elektriciteit, sanitair, verwarming en ventilatie, inclusief de leidingtracés en de keuringen.",
          "Vaste afwerking: pleisterwerk, chape, vloeren, binnendeuren en schilderwerk.",
          "Keuken en badkamer, waar de spreiding tussen budgetten het grootst is.",
          "Studie en begeleiding: architect, EPB-verslaggeving, veiligheidscoördinatie en eventuele stabiliteitsstudie.",
        ],
      },
      {
        type: "note",
        title: "Reken ook met wat u nog niet ziet",
        text: "Bij een renovatie komt een deel van het werk pas in beeld na de afbraak. Voorzie daarom een reserve binnen uw totaalbudget. Wie die marge niet inbouwt, moet later beknibbelen op de afwerking, en dat is net het deel dat u elke dag ziet.",
      },
      { type: "heading", level: 2, text: "Btw van zes of eenentwintig procent" },
      {
        type: "paragraph",
        text: "Voor renovatiewerken aan een voldoende oude woning geldt in België onder voorwaarden een verlaagd btw-tarief. De voorwaarden hebben onder meer te maken met de ouderdom van de woning, het gebruik als privéwoning en het feit dat de werken door een aannemer worden gefactureerd. Bij nieuwbouw geldt het standaardtarief.",
      },
      {
        type: "paragraph",
        text: "Het verschil tussen beide tarieven weegt zwaar door op een totaalbudget. Vraag daarom altijd of een offerte inclusief of exclusief btw is opgesteld, en welk tarief werd toegepast. De actuele voorwaarden vindt u bij de FOD Financiën.",
      },
      { type: "heading", level: 2, text: "Hoe u een raming correct leest" },
      {
        type: "list",
        ordered: true,
        items: [
          "Kijk eerst wat er niet in staat. Ontbrekende posten verklaren meestal het prijsverschil tussen twee offertes.",
          "Controleer of stelposten duidelijk zijn benoemd, bijvoorbeeld een bedrag voor sanitaire toestellen of voor vloerafwerking.",
          "Ga na of afbraak, afvoer en herstelwerk zijn opgenomen, of enkel de nieuwe elementen.",
          "Vraag welke keuringen en attesten in de prijs zitten, zoals de elektrische keuring.",
          "Vergelijk pas prijzen nadat u zeker bent dat beide offertes dezelfde scope beschrijven.",
        ],
      },
      { type: "heading", level: 2, text: "Waar u budget wint zonder aan kwaliteit in te boeten" },
      {
        type: "paragraph",
        text: "De grootste besparing zit zelden in goedkopere materialen. Ze zit in de volgorde en de gelijktijdigheid van de werken. Wanneer elektriciteit, sanitair en verwarming samen worden getrokken terwijl de muren toch open liggen, betaalt u die voorbereiding één keer in plaats van drie keer.",
      },
      {
        type: "paragraph",
        text: "Ook de keuzemomenten spelen mee. Een keuken die pas wordt gekozen nadat de chape ligt, betekent vaak dat leidingen en aansluitpunten moeten worden verlegd. Vroeg beslissen kost niets extra en voorkomt herwerk.",
      },
      {
        type: "faq",
        title: "Veelgestelde vragen over het budget",
        items: [
          {
            q: "Kan Dimac een prijs geven zonder de woning te bezoeken?",
            a: "Een ernstige raming vraagt een plaatsbezoek. Zonder zicht op de staat van dak, structuur en installaties zou een cijfer enkel een indruk wekken van zekerheid die er niet is.",
          },
          {
            q: "Hoeveel reserve houdt u best aan?",
            a: "Dat hangt af van de leeftijd en de staat van de woning. Hoe ouder de woning en hoe minder er geweten is over eerdere verbouwingen, hoe ruimer die marge moet zijn.",
          },
          {
            q: "Is gefaseerd renoveren goedkoper?",
            a: "Gespreid betalen is niet hetzelfde als goedkoper. Elke fase brengt opnieuw voorbereiding, opstart en afwerking mee. Faseren is vooral zinvol wanneer u de volgorde bewust kiest.",
          },
        ],
      },
      {
        type: "cta",
        text: "Wil u eerst weten welke werken uw woning effectief nodig heeft voordat u een budget vastlegt?",
        label: "Bekijk de woningscan",
        to: "/woningscan",
      },
    ],
    relatedServices: ["totaalrenovatie", "badkamer-renovatie", "keuken-renovatie"],
    relatedRegions: ["diest"],
    relatedArticles: ["welke-volgorde-bij-renovatie", "aannemer-of-verschillende-vakmannen"],
    finalCta: {
      title: "Uw renovatiebudget concreet maken?",
      text: "Vertel ons wat u wil aanpakken. Wij bekijken de woning en geven u een raming die de volledige scope beschrijft.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
      secondary: { label: "Bekijk totaalrenovatie", to: "/diensten/totaalrenovatie" },
    },
  },

  {
    slug: "welke-volgorde-bij-renovatie",
    status: "published",
    title: "In welke volgorde voert u een renovatie uit?",
    excerpt:
      "Van dak en structuur tot afwerking: waarom de volgorde van de werken uw budget en uw resultaat bepaalt, en welke fouten het vaakst terugkomen.",
    category: "Aanpak",
    publishedAt: "2026-03-04",
    modifiedAt: "2026-07-31",
    readingTime: "6 minuten",
    meta: {
      title: "Volgorde bij een renovatie: welke werken eerst? | Dimac",
      description:
        "Welke renovatiewerken voert u eerst uit en welke pas later? Praktische uitleg over volgorde, raakpunten tussen vakgebieden en veelgemaakte fouten.",
    },
    hero: { eyebrow: "Aanpak" },
    intro:
      "De volgorde van de werken is bij een renovatie belangrijker dan de keuze van de materialen. Wie in de juiste volgorde werkt, betaalt elke voorbereiding één keer. Wie de volgorde omdraait, betaalt twee keer voor hetzelfde werk en levert bovendien in op het resultaat.",
    sections: [
      { type: "heading", level: 2, text: "Het principe: van buiten naar binnen, van ruw naar fijn" },
      {
        type: "paragraph",
        text: "Een renovatie volgt in grote lijnen altijd dezelfde logica. Eerst maakt u de woning wind- en waterdicht en structureel gezond. Daarna komen de technieken in de muren en de vloeren. Pas daarna volgt de afwerking die u later ziet.",
      },
      {
        type: "paragraph",
        text: "Die logica lijkt vanzelfsprekend, maar in de praktijk wordt ze doorbroken zodra iemand een ruimte al wil kunnen gebruiken, of zodra een deelaannemer vroeger beschikbaar is dan gepland.",
      },
      { type: "heading", level: 2, text: "De fases op een rij" },
      {
        type: "list",
        ordered: true,
        items: [
          "Analyse en plan: opmeting, staat van de woning, keuzes over indeling en over wat behouden blijft.",
          "Afbraak en opruiming, inclusief de vaststelling van wat achter de muren zit.",
          "Structuur en fundering: draagmuren, balklagen, doorbraken en eventuele uitbreiding.",
          "Dak: herstel of vernieuwing, isolatie, dakdichting en regenwaterafvoer.",
          "Buitenschrijnwerk: ramen en deuren, zodat de woning droog en beveiligd is.",
          "Technieken: elektriciteit, sanitair, verwarming en ventilatie, samen ingetekend en samen geplaatst.",
          "Isolatie en dichting binnen, gevolgd door pleisterwerk.",
          "Chape en vloeropbouw, met de leidingen die er correct in liggen.",
          "Vaste afwerking: vloeren, binnendeuren, keuken, badkamer, schilderwerk.",
          "Oplevering, keuringen en de laatste detailpunten.",
        ],
      },
      { type: "heading", level: 2, text: "Waarom de technieken samen moeten worden getekend" },
      {
        type: "paragraph",
        text: "Elektriciteit, sanitair en verwarming delen dezelfde muren, dezelfde vloeropbouw en dezelfde doorvoeren. Wanneer die drie na elkaar worden ingepland zonder gezamenlijk plan, wordt er drie keer gekapt en drie keer hersteld.",
      },
      {
        type: "paragraph",
        text: "Er speelt ook een inhoudelijk argument. De plaats van een stopcontact hangt af van de keukenopstelling, en de plaats van een afvoer hangt af van de badkamerindeling. Die keuzes moeten dus vroeger gemaakt worden dan veel mensen verwachten.",
      },
      {
        type: "note",
        title: "Beslis vroeg over keuken en badkamer",
        text: "U hoeft nog geen materiaal te kiezen, maar de indeling en de posities van toestellen moeten vastliggen voordat de leidingen worden gelegd. Dat ene beslismoment voorkomt het grootste deel van het herwerk op een renovatiewerf.",
      },
      { type: "heading", level: 2, text: "Fouten die het vaakst terugkomen" },
      {
        type: "list",
        items: [
          "De badkamer vernieuwen terwijl de leidingen en de elektrische kring eronder verouderd blijven.",
          "Isoleren voordat vocht- of dakproblemen zijn opgelost, waardoor het probleem verdwijnt uit het zicht maar niet uit de woning.",
          "Chape gieten voordat alle leidingtracés definitief zijn.",
          "Ramen plaatsen voordat duidelijk is of er nog structurele aanpassingen aan de gevelopeningen komen.",
          "Afwerken in een ruimte waar later nog zware werken moeten passeren.",
        ],
      },
      { type: "heading", level: 2, text: "Gefaseerd renoveren zonder later te moeten terugkomen" },
      {
        type: "paragraph",
        text: "Niet iedereen kan of wil alles in één keer laten uitvoeren. Faseren kan, op voorwaarde dat u de latere fases al meeneemt in de voorbereiding. Wachtleidingen, voldoende ruimte in het elektrisch bord en een doordacht tracé voor ventilatie maken een tweede fase later eenvoudig in plaats van ingrijpend.",
      },
      {
        type: "faq",
        title: "Veelgestelde vragen over de volgorde",
        items: [
          {
            q: "Kan ik in de woning blijven wonen tijdens de werken?",
            a: "Bij een gefaseerde renovatie is dat vaak mogelijk. Bij een totaalrenovatie waarbij chape, technieken en pleisterwerk samenvallen, is bewoning meestal niet realistisch.",
          },
          {
            q: "Wat als tijdens de afbraak blijkt dat de structuur slechter is dan verwacht?",
            a: "Dan wordt de planning aangepast voordat er verder wordt gewerkt. Structurele problemen oplossen na de afwerking is altijd duurder dan ze meteen aanpakken.",
          },
          {
            q: "Moet het dak altijd eerst?",
            a: "Wanneer het dak lekt of onvoldoende geïsoleerd is, wel. Binnenwerk afwerken onder een dak dat nog moet worden aangepakt, is verloren werk.",
          },
        ],
      },
      {
        type: "cta",
        text: "Weet u nog niet welke werken uw woning nodig heeft en in welke volgorde?",
        label: "Bekijk de woningscan",
        to: "/woningscan",
      },
    ],
    relatedServices: ["totaalrenovatie", "technieken", "dakwerken"],
    relatedRegions: ["diest"],
    relatedArticles: ["wat-kost-een-totaalrenovatie", "wat-controleert-een-woningscan"],
    finalCta: {
      title: "Een planning die klopt voor uw woning",
      text: "Wij bekijken uw woning en bepalen samen met u welke werken eerst aan bod komen.",
      primary: { label: "Neem contact op", to: "/contact" },
      secondary: { label: "Bekijk totaalrenovatie", to: "/diensten/totaalrenovatie" },
    },
  },

  {
    slug: "wat-controleert-een-woningscan",
    status: "published",
    title: "Wat controleert een woningscan precies?",
    excerpt:
      "Welke onderdelen van uw woning worden bekeken, welke vragen een scan beantwoordt en wanneer een scan zinvol is voordat u beslist.",
    category: "Woningscan",
    publishedAt: "2026-04-08",
    modifiedAt: "2026-07-31",
    readingTime: "5 minuten",
    meta: {
      title: "Wat controleert een woningscan? Van kelder tot dak | Dimac",
      description:
        "Een woningscan bekijkt de volledige woning: structuur, dak, isolatie, elektriciteit, sanitair, verwarming, ventilatie en afwerking. Ontdek wat u eruit leert.",
    },
    hero: { eyebrow: "Woningscan" },
    intro:
      "Een woningscan is geen offerte en geen keuring. Het is een technische doorlichting van de volledige woning, bedoeld om te weten wat er moet gebeuren voordat u beslist wat u laat uitvoeren.",
    sections: [
      { type: "heading", level: 2, text: "Wat er wordt bekeken" },
      {
        type: "paragraph",
        text: "Bij een woningscan wordt de woning integraal doorlopen, van kelder tot dak. Het doel is de samenhang zien tussen de onderdelen, niet één losse ruimte beoordelen.",
      },
      {
        type: "list",
        items: [
          "Draagstructuur, muren en zichtbare vochtsporen.",
          "Dakopbouw, dakbedekking, isolatie en waterafvoer.",
          "Buitenschrijnwerk, beglazing en luchtdichtheid.",
          "Elektrische installatie: bord, kringen, beveiliging en zichtbare toestand.",
          "Sanitair: leidingen, materiaalsoort, afvoer en warmwaterproductie.",
          "Verwarming en ventilatie, en hoe die zich verhouden tot de isolatiegraad.",
          "Vloeropbouw en afwerking, voor zover zichtbaar.",
          "Indeling en gebruik, in functie van wat u met de woning wil doen.",
        ],
      },
      { type: "heading", level: 2, text: "Welke vragen een scan beantwoordt" },
      {
        type: "list",
        items: [
          "Welke werken zijn technisch noodzakelijk en welke zijn een keuze?",
          "In welke volgorde gebeuren die werken best?",
          "Welke onderdelen hangen samen en moeten dus samen worden uitgevoerd?",
          "Welke ingrepen kunnen wachten zonder risico?",
          "Waar liggen de grootste onzekerheden die het budget kunnen beïnvloeden?",
        ],
      },
      {
        type: "note",
        title: "Een scan is geen keuring",
        text: "Een woningscan vervangt geen wettelijke keuring van de elektrische installatie, geen EPC en geen stabiliteitsstudie. Wanneer zo een onderzoek nodig blijkt, komt dat als aanbeveling uit de scan.",
      },
      { type: "heading", level: 2, text: "Wanneer een scan het meeste oplevert" },
      {
        type: "paragraph",
        text: "Een scan is vooral zinvol wanneer u nog voor een beslissing staat. Bij een woning die u overweegt te kopen, bij een woning die u geërfd heeft, of bij uw eigen woning wanneer u twijfelt tussen gefaseerd renoveren en één groot traject.",
      },
      {
        type: "paragraph",
        text: "Wie al precies weet wat er moet gebeuren en enkel een prijs zoekt, heeft eerder een offerte nodig dan een scan.",
      },
      {
        type: "faq",
        title: "Veelgestelde vragen over de woningscan",
        items: [
          {
            q: "Wordt altijd de volledige woning gescand?",
            a: "Ja. De scan bekijkt steeds de volledige woning, van kelder tot dak, omdat de onderdelen technisch met elkaar samenhangen.",
          },
          {
            q: "Moet ik daarna met Dimac verder werken?",
            a: "Neen. De scan levert u inzicht op. Wat u daarna beslist, blijft uw keuze.",
          },
          {
            q: "Wat krijg ik na de scan?",
            a: "Een overzicht van de vaststellingen, de aanbevolen werken en een logische volgorde van uitvoering.",
          },
        ],
      },
      {
        type: "cta",
        text: "Bekijk hoe een woningscan bij Dimac verloopt en wat u erna in handen heeft.",
        label: "Naar de woningscan",
        to: "/woningscan",
      },
    ],
    relatedServices: ["totaalrenovatie", "elektriciteit", "sanitair"],
    relatedRegions: ["diest"],
    relatedArticles: ["welke-volgorde-bij-renovatie", "aannemer-of-verschillende-vakmannen"],
    finalCta: {
      title: "Eerst weten, dan beslissen",
      text: "Plan een woningscan en krijg zicht op de staat van uw woning voordat u werken vastlegt.",
      primary: { label: "Plan uw woningscan", to: "/woningscan" },
      secondary: { label: "Neem contact op", to: "/contact" },
    },
  },

  {
    slug: "aannemer-of-verschillende-vakmannen",
    status: "published",
    title: "Eén aannemer of verschillende vakmannen?",
    excerpt:
      "Wat het verschil is tussen zelf coördineren en het uitbesteden van de coördinatie, en in welke situaties elke aanpak verdedigbaar is.",
    category: "Aanpak",
    publishedAt: "2026-05-19",
    modifiedAt: "2026-07-31",
    readingTime: "6 minuten",
    meta: {
      title: "Eén aannemer of losse vakmannen kiezen? | Dimac",
      description:
        "Zelf vakmannen samenbrengen of de coördinatie uitbesteden? Een nuchtere vergelijking van planning, aansprakelijkheid, budget en risico bij renovatie.",
    },
    hero: { eyebrow: "Aanpak" },
    intro:
      "Bij een renovatie kunt u zelf elk vakgebied afzonderlijk aanstellen, of het volledige traject bij één partij leggen. Beide werken, maar ze verschuiven het werk en het risico naar een andere plaats. De vraag is dus niet welke aanpak beter is, maar wie de coördinatie draagt.",
    sections: [
      { type: "heading", level: 2, text: "Wat coördinatie in de praktijk inhoudt" },
      {
        type: "paragraph",
        text: "Coördinatie is niet hetzelfde als plannen. Het is beslissen welke vakman op welk moment op de werf staat, controleren of het vorige werk klaar en correct is, en de raakpunten tussen vakgebieden vooraf oplossen.",
      },
      {
        type: "list",
        items: [
          "De volgorde bewaken zodat niemand werk moet openbreken dat al af was.",
          "De raakpunten vastleggen: leidingtracés, doorvoeren, vloeropbouw, aansluitpunten.",
          "Beslismomenten op tijd op tafel leggen, zoals de keukenindeling of de badkamerposities.",
          "Bij vertraging de rest van de planning bijsturen.",
          "Bij een tekortkoming bepalen wie het herstelt.",
        ],
      },
      { type: "heading", level: 2, text: "Zelf vakmannen samenbrengen" },
      {
        type: "paragraph",
        text: "Deze aanpak geeft u directe controle over elke keuze en over elke prijs. U spreekt met de mensen die het werk uitvoeren en u kunt per vakgebied vergelijken.",
      },
      {
        type: "paragraph",
        text: "De keerzijde is dat u de coördinatie zelf draagt, en dat vraagt beschikbaarheid tijdens de werkdag. Wanneer twee vakgebieden elkaar tegenspreken, is er niemand anders die de knoop doorhakt. Ook de aansprakelijkheid is versnipperd: bij een probleem op een raakpunt verwijst elke partij naar de andere.",
      },
      { type: "heading", level: 2, text: "De coördinatie uitbesteden" },
      {
        type: "paragraph",
        text: "Bij deze aanpak legt u het traject bij één partij die de vakgebieden op elkaar afstemt en die aanspreekbaar is op het geheel. U verliest een deel van de directe controle per deelprijs, maar u wint tijd en u krijgt één verantwoordelijke voor de samenhang.",
      },
      {
        type: "paragraph",
        text: "Dat is de manier waarop Dimac werkt: de technieken worden samen voorbereid, de volgorde ligt vast voor de start, en tijdens de werf is er één contactpersoon die de planning kent.",
      },
      {
        type: "note",
        title: "Let op de scope, niet op het uurtarief",
        text: "Losse offertes lijken vaak voordeliger omdat ze elk een beperkt stuk beschrijven. Het verschil zit meestal in wat er tussen die stukken valt: herstelwerk, doorvoeren, aansluitingen en afwerking rond de raakpunten.",
      },
      { type: "heading", level: 2, text: "Wanneer welke aanpak verdedigbaar is" },
      {
        type: "list",
        items: [
          "Eén afgebakende werf, zoals één ruimte zonder technische ingrepen: zelf coördineren is haalbaar.",
          "Meerdere vakgebieden die dezelfde muren en vloeren delen: één coördinerende partij beperkt het risico op herwerk.",
          "U werkt overdag en kunt niet op de werf zijn: coördinatie uitbesteden is dan realistischer.",
          "U heeft zelf bouwervaring en tijd: zelf sturen kan een bewuste keuze zijn.",
        ],
      },
      {
        type: "faq",
        title: "Veelgestelde vragen",
        items: [
          {
            q: "Kan ik bepaalde werken zelf laten uitvoeren en de rest uitbesteden?",
            a: "Dat kan, op voorwaarde dat vooraf duidelijk is waar de grens ligt en wie welk raakpunt afwerkt. Die afspraak wordt best in de offerte vastgelegd.",
          },
          {
            q: "Werkt Dimac met eigen mensen of met onderaannemers?",
            a: "Dimac werkt met een vaste equipe en met vaste partners per vakgebied. De coördinatie en de aanspreekbaarheid blijven bij Dimac.",
          },
          {
            q: "Wat gebeurt er bij een probleem na de oplevering?",
            a: "Bij één coördinerende partij spreekt u die partij aan, ook wanneer het probleem op een raakpunt tussen twee vakgebieden ligt.",
          },
        ],
      },
      {
        type: "cta",
        text: "Wil u weten hoe uw project concreet zou verlopen en welke werken samen horen?",
        label: "Bekijk de werkwijze",
        to: "/werkwijze",
      },
    ],
    relatedServices: ["totaalrenovatie", "technieken", "elektriciteit"],
    relatedRegions: ["diest"],
    relatedArticles: ["welke-volgorde-bij-renovatie", "wat-kost-een-totaalrenovatie"],
    finalCta: {
      title: "Uw project doorspreken?",
      text: "Vertel ons wat u wil aanpakken. Wij bekijken welke vakgebieden samen moeten en hoe de planning eruitziet.",
      primary: { label: "Neem contact op", to: "/contact" },
      secondary: { label: "Plan uw woningscan", to: "/woningscan" },
    },
  },

  // Concept: nog onvoldoende bevestigde inhoud. Niet zichtbaar op /blog,
  // niet in de sitemap en niet indexeerbaar.
  {
    slug: "woning-kopen-met-renovatie",
    status: "draft",
    title: "Een woning kopen die u wil renoveren",
    excerpt: "Waarop letten voor u tekent, en hoe u renovatiekost meeweegt in uw bod.",
    category: "Aankoop",
    meta: {
      title: "Een woning kopen om te renoveren | Dimac",
      description: "Waarop letten bij de aankoop van een renovatiewoning.",
    },
    intro: "",
    sections: [],
    relatedServices: ["totaalrenovatie"],
    relatedRegions: ["diest"],
    relatedArticles: [],
    finalCta: {
      title: "Uw project bespreken?",
      text: "Neem contact op.",
      primary: { label: "Neem contact op", to: "/contact" },
    },
  },
  {
    slug: "renovatiebudget-opstellen",
    status: "draft",
    title: "Een realistisch renovatiebudget opstellen",
    excerpt: "Van ruwe raming tot een budget dat de volledige scope dekt.",
    category: "Budget",
    meta: {
      title: "Een renovatiebudget opstellen | Dimac",
      description: "Hoe u een renovatiebudget opbouwt dat de volledige scope dekt.",
    },
    intro: "",
    sections: [],
    relatedServices: ["totaalrenovatie"],
    relatedRegions: ["diest"],
    relatedArticles: [],
    finalCta: {
      title: "Uw project bespreken?",
      text: "Neem contact op.",
      primary: { label: "Neem contact op", to: "/contact" },
    },
  },
];

export const publishedArticles = articles
  .filter((a) => a.status === "published")
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

export function getArticle(slug: string): ArticleContent | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getPublishedArticle(slug: string): ArticleContent | undefined {
  return publishedArticles.find((a) => a.slug === slug);
}

/** Zichtbare benaming van de blogsectie in de interface. */
export const BLOG_LABEL = "Advies";
