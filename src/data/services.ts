import bathroom from "@/assets/project-bathroom.jpg";
import kitchen from "@/assets/project-kitchen.jpg";
import roof from "@/assets/project-roof.jpg";
import total from "@/assets/project-total.jpg";
import hero from "@/assets/hero.jpg";
import prep from "@/assets/preparation.jpg";

export interface FAQItem {
  q: string;
  a: string;
}

export interface WorkflowStep {
  title: string;
  text: string;
}

export interface ServiceContent {
  slug: string;
  navLabel: string;
  overviewTitle: string;         // shown on /diensten card
  overviewText: string;          // 2-3 sentence card explanation
  hero: {
    eyebrow?: string;
    h1: string;
    sub: string;
    image: string;
    imageLabel: string;
  };
  meta: {
    title: string;
    description: string;
  };
  intro: { h2: string; text: string[] };
  problem: { h2: string; text: string[] };
  solution: { h2: string; text: string[] };
  scanBridge?: { h2: string; text: string[]; cta: string; to: string };
  scope: { h2: string; intro?: string; bullets: string[] };
  forWho: { h2: string; bullets: string[] };
  benefits: { h2: string; bullets: string[] };
  workflow: { h2: string; steps: WorkflowStep[] };
  outcome: { h2: string; text: string[] };
  local: { h2: string; text: string[] };
  faq: { h2: string; items: FAQItem[] };
  finalCta: {
    h2: string;
    text: string;
    primary: { label: string; to: string };
    secondary?: { label: string; to: string };
  };
}

const defaultLocal = {
  h2: "Actief in regio Diest",
  text: [
    "Dimac realiseert bouw- en renovatieprojecten in Diest, Scherpenheuvel, Tessenderlo, Halen en omliggende gemeenten.",
    "Wij kennen de lokale bouwcontext en zorgen voor een correcte en efficiënte uitvoering van uw project.",
  ],
};

const defaultFinalCta = (h2: string, text: string) => ({
  h2,
  text,
  primary: { label: "Vraag een offerte aan", to: "/contact" },
  secondary: { label: "Plan uw woningscan", to: "/woningscan" },
});

export const services: ServiceContent[] = [
  {
    slug: "totaalrenovatie",
    navLabel: "Totaalrenovatie",
    overviewTitle: "Totaalrenovatie",
    overviewText:
      "Volledige renovatie van uw woning, van afbraak tot afwerking, met één aanspreekpunt en een duidelijke aanpak.",
    hero: {
      eyebrow: "Renovatie van A tot Z",
      h1: "Totaalrenovatie in regio Diest",
      sub: "Van afbraak tot afwerking. Dimac begeleidt uw volledige renovatie met één aanspreekpunt en een duidelijke aanpak.",
      image: total,
      imageLabel: "Projectbeeld totaalrenovatie",
    },
    meta: {
      title: "Totaalrenovatie Diest | Renovatie van A tot Z | Dimac",
      description: "Dimac realiseert totaalrenovaties in regio Diest. Van afbraak tot afwerking met één aanspreekpunt en duidelijke aanpak.",
    },
    intro: {
      h2: "Uw woning volledig vernieuwen",
      text: [
        "Een totaalrenovatie vraagt een doordachte aanpak en een goede coördinatie van alle werken.",
        "Dimac begeleidt uw renovatie van begin tot einde, zodat u niet hoeft te werken met meerdere aannemers en alles correct op elkaar afgestemd is.",
      ],
    },
    problem: {
      h2: "Een renovatie brengt vaak onzekerheden met zich mee",
      text: [
        "Veel renovaties starten zonder duidelijk plan, wat kan leiden tot misverstanden, vertragingen en onverwachte kosten.",
        "Zonder overzicht is het moeilijk om de juiste beslissingen te nemen en het budget onder controle te houden.",
      ],
    },
    solution: {
      h2: "Eén partner voor uw volledige renovatie",
      text: [
        "Dimac neemt uw volledige renovatie in handen, van de eerste analyse tot de oplevering.",
        "Wij zorgen voor een duidelijke structuur, een efficiënte uitvoering en een correcte opvolging van alle werken.",
      ],
    },
    scanBridge: {
      h2: "Eerst weten wat nodig is?",
      text: [
        "Twijfelt u over de juiste aanpak of wil u eerst inzicht in uw woning?",
        "Start dan met een woningscan. Zo krijgt u een duidelijk beeld van de werken en de beste aanpak, vóór u beslissingen neemt.",
      ],
      cta: "Ontdek de woningscan",
      to: "/woningscan",
    },
    scope: {
      h2: "Wat omvat een totaalrenovatie?",
      intro: "Bij een totaalrenovatie bekijken we uw woning als één geheel. Afhankelijk van uw situatie omvat dit onder andere:",
      bullets: [
        "Afbraakwerken",
        "Structurele aanpassingen",
        "Elektriciteit en sanitair",
        "Verwarming en technieken",
        "Vloeren en afwerking",
        "Coördinatie van alle werken",
      ],
    },
    forWho: {
      h2: "Voor wie is een totaalrenovatie geschikt?",
      bullets: [
        "U wil uw woning volledig vernieuwen",
        "U wil verschillende werken combineren",
        "U wil één aanspreekpunt voor alles",
        "U wil een efficiënte en gestructureerde aanpak",
        "U wil vermijden dat werken op elkaar botsen",
      ],
    },
    benefits: {
      h2: "Waarom kiezen voor een totaalrenovatie met Dimac?",
      bullets: [
        "Eén aanspreekpunt voor uw volledige project",
        "Betere afstemming tussen alle werken",
        "Minder risico op fouten en vertragingen",
        "Duidelijke communicatie en opvolging",
        "Efficiënte planning en uitvoering",
      ],
    },
    workflow: {
      h2: "Hoe verloopt een totaalrenovatie?",
      steps: [
        { title: "Kennismaking of analyse", text: "We bekijken uw woning en bespreken uw plannen." },
        { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel en een plan van aanpak." },
        { title: "Planning", text: "De werken worden correct ingepland en voorbereid." },
        { title: "Uitvoering", text: "Wij coördineren en realiseren de volledige renovatie." },
        { title: "Oplevering", text: "Alles wordt afgewerkt en correct opgeleverd." },
      ],
    },
    outcome: {
      h2: "Een woning die volledig klopt",
      text: [
        "Na een totaalrenovatie is uw woning opnieuw afgestemd op uw wensen, comfort en energieverbruik.",
        "Alles is correct uitgevoerd en op elkaar afgestemd, zonder losse eindjes.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Wat kost een totaalrenovatie?", a: "De kost hangt af van de omvang en staat van de woning. U ontvangt steeds een duidelijke offerte op maat." },
        { q: "Moet ik zelf andere aannemers zoeken?", a: "Nee. Dimac coördineert het volledige project en werkt met één aanspreekpunt." },
        { q: "Kan ik eerst advies krijgen zonder meteen te starten?", a: "Ja. U kan starten met een woningscan om eerst inzicht te krijgen in uw woning en de beste aanpak." },
        { q: "Hoe lang duurt een totaalrenovatie?", a: "De duurtijd hangt af van het project, maar wordt vooraf duidelijk gecommuniceerd." },
      ],
    },
    finalCta: defaultFinalCta(
      "Uw woning volledig laten renoveren?",
      "Contacteer Dimac voor een offerte of start met een woningscan en krijg eerst inzicht in uw project."
    ),
  },
  {
    slug: "nieuwbouw",
    navLabel: "Nieuwbouw",
    overviewTitle: "Nieuwbouw",
    overviewText:
      "Realisatie van woningen met focus op kwaliteit, duurzaamheid en afwerking, van fundering tot oplevering.",
    hero: {
      eyebrow: "Bouwen van A tot Z",
      h1: "Nieuwbouw in regio Diest",
      sub: "Van eerste plannen tot oplevering. Dimac realiseert uw nieuwbouwwoning met oog voor kwaliteit, detail en een duidelijke aanpak.",
      image: hero,
      imageLabel: "Projectbeeld nieuwbouw",
    },
    meta: {
      title: "Nieuwbouw Diest | Woning bouwen van A tot Z | Dimac",
      description: "Dimac realiseert nieuwbouwwoningen in regio Diest. Van fundering tot afwerking met één aanspreekpunt en duidelijke aanpak.",
    },
    intro: {
      h2: "Uw nieuwbouwwoning van A tot Z",
      text: [
        "Een nieuwbouwproject vraagt een goede voorbereiding, duidelijke keuzes en een correcte uitvoering.",
        "Dimac begeleidt uw project van de eerste plannen tot de oplevering, met één aanspreekpunt en een gestructureerde aanpak.",
        "Indien gewenst kunnen wij ook instaan voor de afwerking rondom de woning.",
      ],
    },
    problem: {
      h2: "Nieuw bouwen vraagt doordachte keuzes",
      text: [
        "Bij een nieuwbouwproject moet u verschillende keuzes maken op vlak van indeling, technieken en afwerking.",
        "Een duidelijke aanpak en goede afstemming zijn essentieel om fouten en vertragingen te vermijden.",
      ],
    },
    solution: {
      h2: "Eén partner voor uw nieuwbouw",
      text: [
        "Dimac realiseert uw nieuwbouwwoning van begin tot einde.",
        "Wij zorgen voor een duidelijke structuur, correcte uitvoering en opvolging van alle werken, zodat uw project efficiënt verloopt.",
      ],
    },
    scope: {
      h2: "Wat omvat een nieuwbouwproject?",
      intro: "Dimac realiseert nieuwbouwwoningen als totaalproject, waarbij alle fases correct op elkaar afgestemd worden. Dit omvat onder andere:",
      bullets: [
        "Grond- en funderingswerken",
        "Ruwbouw en structurele opbouw",
        "Dakwerken",
        "Elektriciteit en sanitair",
        "Verwarming en technieken",
        "Binnenafwerking",
        "Coördinatie van alle werken",
      ],
    },
    forWho: {
      h2: "Voor wie is nieuwbouw geschikt?",
      bullets: [
        "U wil een woning bouwen op maat van uw wensen",
        "U wil een energiezuinige en duurzame woning",
        "U wil een gestructureerde aanpak",
        "U wil één aanspreekpunt voor het volledige project",
        "U wil kwaliteit en comfort op lange termijn",
      ],
    },
    benefits: {
      h2: "Waarom kiezen voor nieuwbouw met Dimac?",
      bullets: [
        "Eén aanspreekpunt voor uw volledige project",
        "Duidelijke communicatie en opvolging",
        "Efficiënte planning en coördinatie",
        "Correcte uitvoering van alle werken",
        "Kwalitatief eindresultaat",
      ],
    },
    workflow: {
      h2: "Hoe verloopt een nieuwbouwproject?",
      steps: [
        { title: "Kennismaking en analyse", text: "We bespreken uw plannen en verwachtingen." },
        { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel en plan van aanpak." },
        { title: "Voorbereiding en planning", text: "Alle fases worden correct ingepland." },
        { title: "Uitvoering", text: "Wij realiseren en coördineren de volledige bouw." },
        { title: "Oplevering", text: "Uw woning wordt afgewerkt en correct opgeleverd." },
      ],
    },
    outcome: {
      h2: "Een woning die volledig klopt",
      text: [
        "Na oplevering beschikt u over een woning die volledig afgestemd is op uw wensen, comfort en energieverbruik.",
        "Alles is correct uitgevoerd en zorgvuldig afgewerkt.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Kan Dimac ook de buitenaanleg uitvoeren?", a: "Indien gewenst kunnen wij ook instaan voor opritten, terrassen en andere buitenwerken." },
        { q: "Wat kost een nieuwbouw?", a: "De kost hangt af van de grootte, afwerking en technieken. U ontvangt steeds een duidelijke offerte op maat." },
        { q: "Begeleidt Dimac het volledige project?", a: "Ja. Dimac werkt met één aanspreekpunt en coördineert het volledige project." },
        { q: "Hoe lang duurt een nieuwbouwproject?", a: "De duurtijd hangt af van de omvang van het project en wordt vooraf duidelijk gecommuniceerd." },
      ],
    },
    finalCta: {
      h2: "Uw nieuwbouwwoning laten realiseren?",
      text: "Contacteer Dimac en bespreek uw plannen voor uw nieuwbouwproject.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
      secondary: { label: "Contacteer ons", to: "/contact" },
    },
  },
  {
    slug: "badkamer-renovatie",
    navLabel: "Badkamer renovatie",
    overviewTitle: "Badkamer renovatie",
    overviewText:
      "Van ruwbouw tot volledig afgewerkte badkamer op maat, met correcte afstemming van leidingen, technieken en afwerking.",
    hero: {
      eyebrow: "Badkamer op maat",
      h1: "Badkamer renovatie in regio Diest",
      sub: "Van afbraak tot afwerking. Dimac realiseert uw badkamer met oog voor detail, technieken en een doordachte aanpak.",
      image: bathroom,
      imageLabel: "Projectbeeld badkamer",
    },
    meta: {
      title: "Badkamer renovatie Diest | Volledige renovatie van A tot Z | Dimac",
      description: "Dimac realiseert badkamer renovaties in regio Diest. Van leidingen tot afwerking met één aanspreekpunt en kwalitatieve uitvoering.",
    },
    intro: {
      h2: "Uw badkamer volledig vernieuwd",
      text: [
        "Een badkamer renovatie vraagt meer dan alleen afwerking.",
        "Leidingen, technieken en materialen moeten correct op elkaar afgestemd zijn om een duurzaam en kwalitatief resultaat te garanderen.",
        "Dimac begeleidt uw renovatie van begin tot einde, met één aanspreekpunt en een duidelijke aanpak.",
      ],
    },
    problem: {
      h2: "Een badkamer renovatie vraagt precisie",
      text: [
        "Bij het renoveren van een badkamer komen verschillende elementen samen: water, elektriciteit en afwerking.",
        "Zonder correcte uitvoering kunnen problemen ontstaan zoals lekken, slechte afwerking of technische fouten.",
      ],
    },
    solution: {
      h2: "Een totaalaanpak voor uw badkamer",
      text: [
        "Dimac zorgt voor een volledige renovatie van uw badkamer, waarbij alle werken correct op elkaar afgestemd worden.",
        "Van voorbereidende werken tot de afwerking, alles wordt uitgevoerd met oog voor detail en kwaliteit.",
      ],
    },
    scope: {
      h2: "Wat omvat een badkamer renovatie?",
      intro: "Dimac realiseert badkamers als totaalproject, waarbij alle onderdelen correct op elkaar afgestemd worden. Dit omvat onder andere:",
      bullets: [
        "Afbraak van bestaande badkamer",
        "Aanpassing van leidingen",
        "Elektriciteit en verlichting",
        "Plaatsing van sanitair",
        "Tegelwerken en afwerking",
        "Ventilatie en vochtbeheersing",
      ],
    },
    forWho: {
      h2: "Voor wie is een badkamer renovatie geschikt?",
      bullets: [
        "U wil uw badkamer vernieuwen",
        "U wil een praktische en moderne indeling",
        "U wil een duurzame en kwalitatieve afwerking",
        "U wil één aanspreekpunt voor alle werken",
        "U wil een correcte en veilige installatie",
      ],
    },
    benefits: {
      h2: "Waarom kiezen voor Dimac?",
      bullets: [
        "Eén aanspreekpunt voor de volledige renovatie",
        "Correcte afstemming tussen technieken en afwerking",
        "Duidelijke communicatie en opvolging",
        "Kwalitatieve materialen en uitvoering",
        "Duurzaam eindresultaat",
      ],
    },
    workflow: {
      h2: "Hoe verloopt een badkamer renovatie?",
      steps: [
        { title: "Kennismaking en analyse", text: "We bekijken uw huidige badkamer en bespreken uw wensen." },
        { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel en plan van aanpak." },
        { title: "Voorbereiding", text: "De werken worden ingepland en voorbereid." },
        { title: "Uitvoering", text: "Wij realiseren de volledige renovatie." },
        { title: "Oplevering", text: "Uw badkamer wordt volledig afgewerkt en opgeleverd." },
      ],
    },
    outcome: {
      h2: "Een badkamer die volledig klopt",
      text: [
        "Na de renovatie beschikt u over een badkamer die afgestemd is op uw gebruik, comfort en stijl.",
        "Alles is correct uitgevoerd en duurzaam afgewerkt.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Wat kost een badkamer renovatie?", a: "De kost hangt af van de grootte, materialen en technieken. U ontvangt steeds een duidelijke offerte op maat." },
        { q: "Hoe lang duurt een badkamer renovatie?", a: "Gemiddeld duurt een renovatie enkele weken, afhankelijk van de omvang van de werken." },
        { q: "Moet ik zelf verschillende aannemers inschakelen?", a: "Nee. Dimac werkt met één aanspreekpunt en coördineert alle werken." },
        { q: "Kan ik mijn badkamer volledig laten herindelen?", a: "Ja. Wij bekijken samen met u de mogelijkheden voor een nieuwe indeling." },
      ],
    },
    finalCta: {
      h2: "Uw badkamer laten renoveren?",
      text: "Contacteer Dimac voor een offerte.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
    },
  },
  {
    slug: "keuken-renovatie",
    navLabel: "Keuken renovatie",
    overviewTitle: "Keuken renovatie",
    overviewText:
      "Functionele en moderne keukens, afgestemd op uw woning. Voorbereiding, technieken en afwerking in één traject.",
    hero: {
      eyebrow: "Keuken op maat",
      h1: "Keuken renovatie in regio Diest",
      sub: "Van voorbereiding tot afwerking. Dimac realiseert uw keuken met aandacht voor functionaliteit, technieken en een doordachte indeling.",
      image: kitchen,
      imageLabel: "Projectbeeld keuken",
    },
    meta: {
      title: "Keuken renovatie Diest | Volledige keukenrenovatie | Dimac",
      description: "Dimac realiseert keuken renovaties in regio Diest. Van voorbereiding tot afwerking met één aanspreekpunt en functionele oplossingen.",
    },
    intro: {
      h2: "Uw keuken volledig vernieuwd",
      text: [
        "De keuken is één van de meest gebruikte ruimtes in uw woning en vraagt een doordachte aanpak.",
        "Een renovatie gaat verder dan enkel het plaatsen van kasten en toestellen. Indeling, leidingen en technieken moeten correct op elkaar afgestemd zijn.",
        "Dimac begeleidt uw keuken renovatie van begin tot einde, met één aanspreekpunt en een duidelijke aanpak.",
      ],
    },
    problem: {
      h2: "Een keuken renovatie vraagt een doordachte indeling",
      text: [
        "Bij het vernieuwen van een keuken komen verschillende elementen samen: elektriciteit, water, toestellen en afwerking.",
        "Zonder goede voorbereiding kan dit leiden tot inefficiënt gebruik, technische problemen of een minder praktisch resultaat.",
      ],
    },
    solution: {
      h2: "Een totaalaanpak voor uw keuken",
      text: [
        "Dimac zorgt voor een volledige renovatie van uw keuken, waarbij alle werken correct op elkaar afgestemd worden.",
        "Van voorbereidende werken tot de afwerking zorgen wij voor een functioneel en duurzaam eindresultaat.",
      ],
    },
    scope: {
      h2: "Wat omvat een keuken renovatie?",
      intro: "Dimac realiseert keukens als totaalproject, waarbij alle onderdelen correct op elkaar afgestemd worden. Dit omvat onder andere:",
      bullets: [
        "Afbraak van bestaande keuken",
        "Aanpassing van leidingen en elektriciteit",
        "Voorbereiding voor toestellen",
        "Plaatsing van keukeninrichting",
        "Afwerking en aansluitingen",
        "Verlichting en ventilatie",
      ],
    },
    forWho: {
      h2: "Voor wie is een keuken renovatie geschikt?",
      bullets: [
        "U wil uw keuken vernieuwen",
        "U wil een efficiënte en praktische indeling",
        "U wil een duurzame en kwalitatieve afwerking",
        "U wil één aanspreekpunt voor alle werken",
        "U wil een moderne en functionele keuken",
      ],
    },
    benefits: {
      h2: "Waarom kiezen voor Dimac?",
      bullets: [
        "Eén aanspreekpunt voor de volledige renovatie",
        "Correcte afstemming tussen technieken en afwerking",
        "Duidelijke communicatie en opvolging",
        "Praktische en doordachte oplossingen",
        "Kwalitatief eindresultaat",
      ],
    },
    workflow: {
      h2: "Hoe verloopt een keuken renovatie?",
      steps: [
        { title: "Kennismaking en analyse", text: "We bekijken uw huidige keuken en bespreken uw wensen." },
        { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel en plan van aanpak." },
        { title: "Voorbereiding", text: "De werken worden ingepland en voorbereid." },
        { title: "Uitvoering", text: "Wij realiseren de volledige renovatie." },
        { title: "Oplevering", text: "Uw keuken wordt volledig afgewerkt en opgeleverd." },
      ],
    },
    outcome: {
      h2: "Een keuken die werkt zoals het hoort",
      text: [
        "Na de renovatie beschikt u over een keuken die afgestemd is op uw gebruik en levensstijl.",
        "Alles is correct uitgevoerd en functioneel ingericht.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Wat kost een keuken renovatie?", a: "De kost hangt af van de grootte, indeling en materialen. U ontvangt steeds een duidelijke offerte op maat." },
        { q: "Hoe lang duurt een keuken renovatie?", a: "Gemiddeld duurt een renovatie enkele weken, afhankelijk van de omvang van de werken." },
        { q: "Moet ik zelf leveranciers of aannemers regelen?", a: "Nee. Dimac coördineert het volledige traject en werkt met één aanspreekpunt." },
        { q: "Kan mijn keuken volledig heringericht worden?", a: "Ja. Wij bekijken samen met u de mogelijkheden voor een nieuwe indeling." },
      ],
    },
    finalCta: {
      h2: "Uw keuken laten renoveren?",
      text: "Contacteer Dimac voor een offerte en bespreek uw project.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
      secondary: { label: "Contacteer ons", to: "/contact" },
    },
  },
  {
    slug: "elektriciteit",
    navLabel: "Elektriciteit",
    overviewTitle: "Elektriciteit",
    overviewText:
      "Elektrische installaties binnen totaalprojecten, correct afgestemd op indeling, technieken en afwerking.",
    hero: {
      eyebrow: "Onderdeel van uw totaalproject",
      h1: "Elektriciteit als onderdeel van uw bouw- of renovatieproject",
      sub: "Dimac integreert elektrische installaties binnen totaalprojecten, met een correcte afstemming op alle andere werken.",
      image: prep,
      imageLabel: "Technieken in uitvoering",
    },
    meta: {
      title: "Elektriciteit in renovatie en nieuwbouw | Dimac Diest",
      description: "Dimac integreert elektriciteit binnen bouw- en renovatieprojecten in regio Diest. Correct afgestemd binnen het geheel.",
    },
    intro: {
      h2: "Elektriciteit als deel van het geheel",
      text: [
        "Elektriciteit is een essentieel onderdeel van elke woning, maar staat nooit op zichzelf.",
        "Binnen een bouw- of renovatieproject moet de installatie correct afgestemd zijn op indeling, technieken en afwerking.",
        "Dimac zorgt ervoor dat dit naadloos gebeurt binnen het volledige project.",
      ],
    },
    problem: {
      h2: "Afstemming is cruciaal",
      text: [
        "Bij renovaties en nieuwbouw moeten verschillende technieken samenkomen.",
        "Wanneer elektriciteit los van andere werken wordt uitgevoerd, ontstaan vaak problemen in planning, uitvoering of afwerking.",
      ],
    },
    solution: {
      h2: "Geïntegreerd binnen uw project",
      text: [
        "Dimac neemt de coördinatie van alle werken op zich, inclusief elektriciteit.",
        "Zo wordt de elektrische installatie correct ingepland en uitgevoerd in functie van het volledige project.",
      ],
    },
    scope: {
      h2: "Wat wordt voorzien binnen een project?",
      intro: "Elektriciteitswerken worden uitgevoerd als onderdeel van uw bouw- of renovatieproject. Dit omvat onder andere:",
      bullets: [
        "Nieuwe elektrische installaties",
        "Aanpassingen en uitbreidingen",
        "Verlichting en schakelingen",
        "Voorbereiding voor toestellen",
        "Integratie met andere technieken",
      ],
    },
    forWho: {
      h2: "Wanneer maakt dit deel uit van uw project?",
      bullets: [
        "Bij totaalrenovaties",
        "Bij nieuwbouwprojecten",
        "Bij keuken- of badkamerrenovaties",
        "Wanneer meerdere technieken gecombineerd worden",
        "Wanneer u één aanspreekpunt wil voor alles",
      ],
    },
    benefits: {
      h2: "Waarom deze aanpak werkt",
      bullets: [
        "Betere afstemming tussen alle werken",
        "Minder risico op fouten of aanpassingen achteraf",
        "Efficiëntere planning",
        "Duidelijke communicatie",
        "Eén aanspreekpunt voor het volledige project",
      ],
    },
    workflow: {
      h2: "Hoe wordt elektriciteit geïntegreerd?",
      steps: [
        { title: "Analyse binnen het project", text: "We bekijken de installatie in functie van de volledige woning." },
        { title: "Afstemming met andere werken", text: "Elektriciteit wordt afgestemd op indeling, sanitair en afwerking." },
        { title: "Planning", text: "De werken worden ingepland binnen het totaalproject." },
        { title: "Uitvoering", text: "De installatie wordt correct uitgevoerd als onderdeel van het geheel." },
        { title: "Afwerking", text: "Alles wordt netjes afgewerkt en geïntegreerd." },
      ],
    },
    outcome: {
      h2: "Een installatie die klopt binnen het geheel",
      text: [
        "De elektrische installatie is afgestemd op uw woning en werkt perfect samen met alle andere onderdelen van het project.",
        "Geen losse oplossingen, maar een geïntegreerd resultaat.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Voert Dimac elektriciteitswerken apart uit?", a: "Elektriciteitswerken worden voornamelijk uitgevoerd als onderdeel van een bouw- of renovatieproject." },
        { q: "Wordt alles correct afgestemd met andere technieken?", a: "Ja. Elektriciteit wordt altijd geïntegreerd binnen het volledige project." },
        { q: "Moet ik zelf een elektricien inschakelen?", a: "Nee. Dimac coördineert dit binnen het totaalproject." },
        { q: "Kan mijn bestaande installatie aangepast worden?", a: "Ja, indien dit nodig is binnen het project." },
      ],
    },
    finalCta: {
      h2: "Uw project laten uitvoeren met één aanspreekpunt?",
      text: "Contacteer Dimac en bespreek uw bouw- of renovatieproject.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
      secondary: { label: "Contacteer ons", to: "/contact" },
    },
  },
  {
    slug: "sanitair",
    navLabel: "Sanitair",
    overviewTitle: "Sanitair",
    overviewText:
      "Sanitaire installaties binnen totaalprojecten, met correcte afstemming van leidingen, aansluitingen en toestellen.",
    hero: {
      eyebrow: "Onderdeel van uw totaalproject",
      h1: "Sanitair als onderdeel van uw bouw- of renovatieproject",
      sub: "Dimac integreert sanitaire installaties binnen totaalprojecten, met een correcte afstemming op alle andere werken.",
      image: bathroom,
      imageLabel: "Detail sanitair afwerking",
    },
    meta: {
      title: "Sanitair in renovatie en nieuwbouw | Dimac Diest",
      description: "Dimac integreert sanitair binnen bouw- en renovatieprojecten in regio Diest. Correct afgestemd binnen het geheel.",
    },
    intro: {
      h2: "Sanitair als deel van het geheel",
      text: [
        "Sanitair is een essentieel onderdeel van elke woning en moet correct geïntegreerd worden in het volledige project.",
        "Binnen een bouw- of renovatieproject zorgen wij ervoor dat leidingen, aansluitingen en toestellen afgestemd zijn op de indeling en afwerking.",
        "Dimac zorgt voor een doordachte en correcte uitvoering binnen het geheel.",
      ],
    },
    problem: {
      h2: "Afstemming is essentieel",
      text: [
        "Bij renovaties en nieuwbouw moeten verschillende technieken samenkomen.",
        "Wanneer sanitair los van andere werken wordt uitgevoerd, kunnen problemen ontstaan met indeling, aansluitingen of afwerking.",
      ],
    },
    solution: {
      h2: "Geïntegreerd binnen uw project",
      text: [
        "Dimac neemt de coördinatie van alle werken op zich, inclusief sanitair.",
        "Zo wordt de installatie correct ingepland en uitgevoerd in functie van het volledige project.",
      ],
    },
    scope: {
      h2: "Wat wordt voorzien binnen een project?",
      intro: "Sanitaire werken worden uitgevoerd als onderdeel van uw bouw- of renovatieproject. Dit omvat onder andere:",
      bullets: [
        "Plaatsing en aanpassing van leidingen",
        "Aansluiting van sanitaire toestellen",
        "Afvoer- en watervoorziening",
        "Integratie in badkamers en keukens",
        "Afstemming met andere technieken",
      ],
    },
    forWho: {
      h2: "Wanneer maakt dit deel uit van uw project?",
      bullets: [
        "Bij totaalrenovaties",
        "Bij nieuwbouwprojecten",
        "Bij badkamer- en keukenrenovaties",
        "Wanneer meerdere technieken gecombineerd worden",
        "Wanneer u één aanspreekpunt wil voor alles",
      ],
    },
    benefits: {
      h2: "Waarom deze aanpak werkt",
      bullets: [
        "Betere afstemming tussen alle werken",
        "Minder risico op fouten of aanpassingen achteraf",
        "Efficiëntere planning",
        "Duidelijke communicatie",
        "Eén aanspreekpunt voor het volledige project",
      ],
    },
    workflow: {
      h2: "Hoe wordt sanitair geïntegreerd?",
      steps: [
        { title: "Analyse binnen het project", text: "We bekijken de installatie in functie van de volledige woning." },
        { title: "Afstemming met andere werken", text: "Sanitair wordt afgestemd op indeling, elektriciteit en afwerking." },
        { title: "Planning", text: "De werken worden ingepland binnen het totaalproject." },
        { title: "Uitvoering", text: "De installatie wordt correct uitgevoerd als onderdeel van het geheel." },
        { title: "Afwerking", text: "Alles wordt netjes afgewerkt en geïntegreerd." },
      ],
    },
    outcome: {
      h2: "Een installatie die perfect aansluit",
      text: [
        "De sanitaire installatie is afgestemd op uw woning en werkt naadloos samen met alle andere onderdelen van het project.",
        "Geen losse oplossingen, maar een geïntegreerd resultaat.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Voert Dimac sanitaire werken apart uit?", a: "Sanitaire werken worden voornamelijk uitgevoerd als onderdeel van een bouw- of renovatieproject." },
        { q: "Wordt alles correct afgestemd met andere technieken?", a: "Ja. Sanitair wordt altijd geïntegreerd binnen het volledige project." },
        { q: "Moet ik zelf een loodgieter inschakelen?", a: "Nee. Dimac coördineert dit binnen het totaalproject." },
        { q: "Kan mijn bestaande installatie aangepast worden?", a: "Ja, indien dit nodig is binnen het project." },
      ],
    },
    finalCta: {
      h2: "Uw project laten uitvoeren met één aanspreekpunt?",
      text: "Contacteer Dimac en bespreek uw bouw- of renovatieproject.",
      primary: { label: "Vraag een offerte aan", to: "/contact" },
      secondary: { label: "Contacteer ons", to: "/contact" },
    },
  },
  {
    slug: "dakwerken",
    navLabel: "Dakwerken",
    overviewTitle: "Dakwerken",
    overviewText:
      "Platte en hellende dakwerken. Van renovatie tot herstelling, met aandacht voor isolatie en duurzaamheid.",
    hero: {
      eyebrow: "Dak en isolatie",
      h1: "Dakwerken in regio Diest",
      sub: "Van renovatie tot herstelling. Dimac verzorgt platte en hellende daken met aandacht voor isolatie, waterdichtheid en afwerking.",
      image: roof,
      imageLabel: "Projectbeeld dakwerken",
    },
    meta: {
      title: "Dakwerken Diest | Renovatie en isolatie | Dimac",
      description: "Dimac verzorgt dakwerken in regio Diest. Platte en hellende daken, isolatie en herstellingen binnen uw bouw- of renovatieproject.",
    },
    intro: {
      h2: "Uw dak in goede handen",
      text: [
        "Het dak beschermt uw volledige woning. Correcte uitvoering, waterdichtheid en isolatie zijn essentieel voor comfort en levensduur.",
        "Dimac voert dakwerken uit als onderdeel van uw project, met een duidelijke aanpak van voorbereiding tot afwerking.",
      ],
    },
    problem: {
      h2: "Details maken het verschil",
      text: [
        "Aansluitingen, dampschermen, isolatiedikte en waterafvoer bepalen samen hoe uw dak zich houdt op lange termijn.",
        "Zonder correcte voorbereiding en afstemming ontstaan vaak problemen met vocht of warmteverlies.",
      ],
    },
    solution: {
      h2: "Vakwerk met aandacht voor detail",
      text: [
        "Dimac zorgt voor een correcte opbouw van uw dak, van onderconstructie tot afwerking.",
        "Alles wordt uitgevoerd volgens de geldende normen en afgestemd op de rest van uw woning.",
      ],
    },
    scope: {
      h2: "Wat omvatten onze dakwerken?",
      bullets: [
        "Renovatie van hellende daken",
        "Platte daken",
        "Dakisolatie",
        "Dakgoten en waterafvoer",
        "Herstellingen en aanpassingen",
        "Afstemming met andere werken",
      ],
    },
    forWho: {
      h2: "Wanneer zijn dakwerken aangewezen?",
      bullets: [
        "Bij een verouderd of lekkend dak",
        "Bij een totaalrenovatie",
        "Bij nieuwbouwprojecten",
        "Wanneer u uw isolatie wil verbeteren",
        "Wanneer u kiest voor hernieuwbare energie",
      ],
    },
    benefits: {
      h2: "Waarom kiezen voor Dimac?",
      bullets: [
        "Correcte uitvoering en waterdichtheid",
        "Aandacht voor isolatie en detail",
        "Afstemming binnen het totaalproject",
        "Duidelijke communicatie",
        "Duurzaam eindresultaat",
      ],
    },
    workflow: {
      h2: "Hoe verlopen dakwerken?",
      steps: [
        { title: "Analyse", text: "We beoordelen de staat en opbouw van uw dak." },
        { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel op maat." },
        { title: "Voorbereiding", text: "Materialen en planning worden vastgelegd." },
        { title: "Uitvoering", text: "De werken worden correct en veilig uitgevoerd." },
        { title: "Oplevering", text: "Alles wordt netjes afgewerkt en gecontroleerd." },
      ],
    },
    outcome: {
      h2: "Een dak dat klopt",
      text: [
        "Na de werken beschikt u over een dak dat waterdicht, correct geïsoleerd en zorgvuldig afgewerkt is.",
        "Klaar voor lange termijn.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Voeren jullie zowel platte als hellende daken uit?", a: "Ja. Beide types worden uitgevoerd binnen renovatie- en nieuwbouwprojecten." },
        { q: "Kan de isolatie mee vernieuwd worden?", a: "Zeker. Dakisolatie wordt vaak samen met de renovatie voorzien." },
        { q: "Hoe lang duren dakwerken?", a: "Afhankelijk van de omvang, meestal enkele dagen tot enkele weken. U krijgt vooraf een duidelijke planning." },
      ],
    },
    finalCta: defaultFinalCta(
      "Uw dak laten renoveren?",
      "Contacteer Dimac voor een offerte of start met een woningscan om eerst inzicht te krijgen."
    ),
  },
  {
    slug: "hernieuwbare-energie",
    navLabel: "Hernieuwbare energie",
    overviewTitle: "Hernieuwbare energie",
    overviewText:
      "Zonnepanelen, warmtepompen en energiezuinige oplossingen, geïntegreerd in uw bouw- of renovatieproject.",
    hero: {
      eyebrow: "Toekomstgericht bouwen",
      h1: "Hernieuwbare energie in uw woning",
      sub: "Wij integreren energiezuinige oplossingen zoals zonnepanelen en warmtepompen binnen uw bouw- of renovatieproject.",
      image: prep,
      imageLabel: "Detail installatie hernieuwbare energie",
    },
    meta: {
      title: "Hernieuwbare energie | Dimac Diest",
      description: "Dimac integreert zonnepanelen, warmtepompen en energiezuinige oplossingen in bouw- en renovatieprojecten in regio Diest.",
    },
    intro: {
      h2: "Klaar voor de toekomst",
      text: [
        "Energie-efficiëntie begint bij correcte keuzes en een goede voorbereiding.",
        "Dimac helpt u met een doordachte integratie van hernieuwbare technieken in uw woning.",
      ],
    },
    problem: {
      h2: "Techniek staat nooit los",
      text: [
        "Zonnepanelen, warmtepompen en ventilatie functioneren pas goed wanneer ze correct afgestemd zijn op isolatie, elektriciteit en indeling.",
      ],
    },
    solution: {
      h2: "Geïntegreerde aanpak",
      text: [
        "Wij plannen en integreren hernieuwbare energie binnen uw totaalproject.",
        "Zo weet u zeker dat elke keuze zijn effect heeft in de praktijk.",
      ],
    },
    scope: {
      h2: "Wat kan worden voorzien?",
      bullets: [
        "Zonnepanelen",
        "Warmtepompen",
        "Ventilatie met warmteterugwinning",
        "Voorbereiding voor batterijopslag",
        "Afstemming met elektriciteit en verwarming",
      ],
    },
    forWho: {
      h2: "Voor wie is dit geschikt?",
      bullets: [
        "Bij een totaalrenovatie",
        "Bij nieuwbouw",
        "Wanneer u uw energieverbruik wil verlagen",
        "Wanneer u toekomstgericht wil bouwen",
      ],
    },
    benefits: {
      h2: "Voordelen",
      bullets: [
        "Lager energieverbruik",
        "Meer comfort",
        "Betere afstemming met andere technieken",
        "Eén aanspreekpunt",
        "Klaar voor de toekomst",
      ],
    },
    workflow: {
      h2: "Hoe verloopt de integratie?",
      steps: [
        { title: "Analyse", text: "We bekijken uw woning en energieverbruik." },
        { title: "Advies", text: "U krijgt een concreet voorstel op maat." },
        { title: "Voorbereiding", text: "Alles wordt afgestemd op de rest van het project." },
        { title: "Uitvoering", text: "De installatie wordt correct geplaatst." },
        { title: "Oplevering", text: "Uw installatie wordt getest en toegelicht." },
      ],
    },
    outcome: {
      h2: "Een woning die met u meegaat",
      text: [
        "U beschikt over een energiezuinige woning waarin technieken op elkaar afgestemd zijn.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Kan Dimac zowel zonnepanelen als warmtepomp plaatsen?", a: "Ja. Beide oplossingen kunnen geïntegreerd worden binnen uw project." },
        { q: "Zijn premies mogelijk?", a: "Afhankelijk van uw situatie kunnen premies van toepassing zijn. We informeren u waar nuttig." },
      ],
    },
    finalCta: defaultFinalCta(
      "Werk maken van energiezuinig wonen?",
      "Contacteer Dimac voor een offerte of start met een woningscan."
    ),
  },
  {
    slug: "afwerking",
    navLabel: "Afwerking",
    overviewTitle: "Afwerking",
    overviewText:
      "Gyproc, schilderwerken en vloeren. Alle afwerkingswerken, met oog voor detail en precisie.",
    hero: {
      eyebrow: "Detail en precisie",
      h1: "Afwerking in regio Diest",
      sub: "Van gyproc tot vloeren en schilderwerken. Dimac zorgt voor een afwerking waarin elk detail klopt.",
      image: total,
      imageLabel: "Detail afwerking",
    },
    meta: {
      title: "Afwerking Diest | Gyproc, schilderwerken, vloeren | Dimac",
      description: "Dimac verzorgt de afwerking binnen renovatie- en nieuwbouwprojecten in regio Diest. Gyproc, schilderwerken en vloeren.",
    },
    intro: {
      h2: "Waar alles samenkomt",
      text: [
        "De afwerking is wat u dagelijks ziet en voelt. Zij bepaalt het karakter van uw woning.",
        "Dimac verzorgt de volledige afwerking binnen uw project, met oog voor detail en aansluitingen.",
      ],
    },
    problem: {
      h2: "Details bepalen het eindresultaat",
      text: [
        "Overgangen, hoeken, aansluitingen en waterpas. Kleine details maken het verschil tussen een goed en een uitstekend eindresultaat.",
      ],
    },
    solution: {
      h2: "Precisie in elke laag",
      text: [
        "Wij werken afwerking uit binnen het geheel van uw renovatie, in afstemming met technieken en structuur.",
      ],
    },
    scope: {
      h2: "Welke afwerkingen verzorgen wij?",
      bullets: [
        "Gyproc werken",
        "Schilderwerken",
        "Vloerwerken",
        "Plinten en overgangen",
        "Aansluitingen en detailafwerking",
      ],
    },
    forWho: {
      h2: "Voor wie?",
      bullets: [
        "Bij totaalrenovaties",
        "Bij nieuwbouw",
        "Bij badkamer- en keukenrenovaties",
        "Wanneer u kwaliteitsvolle afwerking wil",
      ],
    },
    benefits: {
      h2: "Voordelen",
      bullets: [
        "Correcte aansluitingen tussen werken",
        "Oog voor detail",
        "Duurzaam eindresultaat",
        "Eén aanspreekpunt",
      ],
    },
    workflow: {
      h2: "Hoe verloopt de afwerking?",
      steps: [
        { title: "Voorbereiding", text: "Ondergronden en aansluitingen worden gecontroleerd." },
        { title: "Uitvoering", text: "Werken worden in de juiste volgorde uitgevoerd." },
        { title: "Controle", text: "Details en overgangen worden nagegaan." },
        { title: "Oplevering", text: "Alles wordt netjes afgewerkt en gecontroleerd." },
      ],
    },
    outcome: {
      h2: "Een woning die af is",
      text: [
        "Een afwerking waarin overgangen, materialen en aansluitingen kloppen. Klaar om in te leven.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Voeren jullie ook enkel afwerking uit?", a: "Afwerking wordt in de meeste gevallen binnen een totaalproject uitgevoerd." },
        { q: "Kunnen jullie mee kleuren en materialen adviseren?", a: "Ja, we geven graag advies binnen uw project." },
      ],
    },
    finalCta: defaultFinalCta(
      "Uw project laten afwerken?",
      "Contacteer Dimac en bespreek uw project."
    ),
  },
  {
    slug: "technieken",
    navLabel: "Technieken",
    overviewTitle: "Technieken",
    overviewText:
      "Elektriciteit, sanitair, verwarming en slimme installaties, geïntegreerd binnen uw totaalproject.",
    hero: {
      eyebrow: "Alles op elkaar afgestemd",
      h1: "Technieken binnen uw bouw- of renovatieproject",
      sub: "Elektriciteit, sanitair, verwarming en ventilatie. Wij coördineren de technieken zodat alles perfect samenvalt met de rest van uw woning.",
      image: prep,
      imageLabel: "Technieken in uitvoering",
    },
    meta: {
      title: "Technieken in renovatie en nieuwbouw | Dimac Diest",
      description: "Dimac integreert alle technieken binnen bouw- en renovatieprojecten in regio Diest. Correct afgestemd binnen het geheel.",
    },
    intro: {
      h2: "Technieken zijn de ruggengraat",
      text: [
        "Elektriciteit, sanitair, verwarming en ventilatie beïnvloeden elkaar en de rest van uw woning.",
        "Dimac zorgt dat alles samen wordt bekeken en correct wordt uitgevoerd.",
      ],
    },
    problem: {
      h2: "Losse technieken leiden vaak tot problemen",
      text: [
        "Wanneer verschillende partijen los werken, ontstaan afstemmingsproblemen die later moeilijk recht te zetten zijn.",
      ],
    },
    solution: {
      h2: "Alles binnen één traject",
      text: [
        "Bij Dimac worden technieken samen bekeken, ingepland en uitgevoerd binnen uw totaalproject.",
      ],
    },
    scope: {
      h2: "Welke technieken?",
      bullets: [
        "Elektriciteit",
        "Sanitair",
        "Verwarming",
        "Ventilatie",
        "Voorbereiding voor hernieuwbare energie",
      ],
    },
    forWho: {
      h2: "Wanneer maakt dit deel uit van uw project?",
      bullets: [
        "Bij totaalrenovaties",
        "Bij nieuwbouwprojecten",
        "Bij badkamer- en keukenrenovaties",
        "Wanneer u één aanspreekpunt wil voor alles",
      ],
    },
    benefits: {
      h2: "Waarom deze aanpak werkt",
      bullets: [
        "Correcte afstemming tussen technieken",
        "Minder risico op fouten",
        "Efficiëntere planning",
        "Duidelijke communicatie",
        "Eén aanspreekpunt",
      ],
    },
    workflow: {
      h2: "Hoe werken wij?",
      steps: [
        { title: "Analyse", text: "We bekijken alle technieken samen in functie van uw woning." },
        { title: "Afstemming", text: "Technieken worden op elkaar en op de afwerking afgestemd." },
        { title: "Planning", text: "Alles wordt correct ingepland." },
        { title: "Uitvoering", text: "De installaties worden correct uitgevoerd." },
        { title: "Oplevering", text: "Alles wordt getest en netjes afgewerkt." },
      ],
    },
    outcome: {
      h2: "Een woning die technisch klopt",
      text: [
        "Uw technieken werken samen, niet naast elkaar. Klaar voor comfortabel dagelijks gebruik.",
      ],
    },
    local: defaultLocal,
    faq: {
      h2: "Veelgestelde vragen",
      items: [
        { q: "Kan Dimac alle technieken uitvoeren binnen één project?", a: "Ja. Alle technieken worden geïntegreerd binnen uw bouw- of renovatieproject." },
        { q: "Werken jullie apart voor techniekwerken?", a: "Techniekwerken worden voornamelijk uitgevoerd binnen een totaalproject." },
      ],
    },
    finalCta: defaultFinalCta(
      "Uw project met alle technieken laten uitvoeren?",
      "Contacteer Dimac en bespreek uw project."
    ),
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
