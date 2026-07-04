import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Hammer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { usePageMeta } from "@/hooks/use-page-meta";
import { services } from "@/data/services";
import hero from "@/assets/hero.jpg";
import bathroom from "@/assets/project-bathroom.jpg";
import kitchen from "@/assets/project-kitchen.jpg";
import roof from "@/assets/project-roof.jpg";
import total from "@/assets/project-total.jpg";
import prep from "@/assets/preparation.jpg";

const trustCards = [
  { title: "Eén aanspreekpunt", text: "Voor uw volledige project, van eerste vraag tot oplevering." },
  { title: "Duidelijke voorbereiding", text: "Zodat keuzes, timing en technieken vooraf beter op elkaar afgestemd zijn." },
  { title: "Renovatie en nieuwbouw", text: "Voor projecten waar meerdere werken samen moeten kloppen." },
  { title: "Lokaal actief", text: "In ruime regio Diest en omgeving." },
];

const positioningCards = [
  { title: "Voorbereiding", text: "We bekijken wat technisch, praktisch en budgettair nodig is vóór de werken starten." },
  { title: "Coördinatie", text: "We stemmen de verschillende werken op elkaar af, zodat planning, technieken en uitvoering niet naast elkaar lopen." },
  { title: "Opvolging", text: "U heeft één aanspreekpunt dat het overzicht bewaakt en het project opvolgt tot de afwerking klopt." },
];

const woningscanPoints = [
  { title: "Inzicht vóór u beslist", text: "U weet beter welke werken nodig zijn en welke keuzes impact hebben op elkaar." },
  { title: "Minder verrassingen tijdens de werken", text: "Aandachtspunten worden vroeger zichtbaar, zodat ze niet pas tijdens de uitvoering opduiken." },
  { title: "Technisch en praktisch advies", text: "U krijgt een duidelijker beeld van wat haalbaar, logisch en verstandig is voor uw woning." },
  { title: "Een betere basis voor offerte en planning", text: "Hoe duidelijker de uitgangssituatie, hoe correcter de volgende stappen kunnen worden voorbereid." },
  { title: "Scanbedrag wordt verrekend bij uitvoering", text: "Beslist u nadien om het project door Dimac te laten uitvoeren, dan wordt het bedrag van de woningscan verrekend." },
];

const objectionQuestions = [
  "Wat moet eerst gebeuren?",
  "Welke keuzes beïnvloeden elkaar?",
  "Welke werken moeten technisch voorbereid zijn?",
  "Waar zitten mogelijke risico's?",
  "Wie bewaakt het overzicht?",
  "Wat gebeurt er als planning, materialen of technieken niet goed op elkaar afgestemd zijn?",
];

const invisibleItems = [
  "De aansluitingen",
  "De technieken",
  "De opbouw achter de muur",
  "De waterdichting",
  "De ventilatie",
  "De afstemming tussen materialen",
  "De volgorde van de werken",
  "De details in de afwerking",
];

const trustThemes = [
  { title: "Duidelijke communicatie", text: "U weet wie uw aanspreekpunt is en wat de volgende stap wordt." },
  { title: "Eén partij die het overzicht bewaakt", text: "Niet elke aannemer apart aansturen, maar één traject met duidelijke opvolging." },
  { title: "Technische voorbereiding", text: "Aandacht voor wat moet kloppen vóór de werken zichtbaar worden." },
  { title: "Afwerking met oog voor detail", text: "Omdat kwaliteit vaak zichtbaar wordt in aansluitingen, overgangen en praktische afwerking." },
];

const Index = () => {
  usePageMeta({
    title: "Aannemer in regio Diest | Renovatie & nieuwbouw | Dimac",
    description:
      "Dimac begeleidt uw renovatie- of bouwproject in regio Diest met één aanspreekpunt, duidelijke voorbereiding en correcte opvolging van de werken.",
  });

  const homeServices = services.filter((s) =>
    ["totaalrenovatie", "nieuwbouw", "badkamer-renovatie", "keuken-renovatie", "dakwerken", "technieken"].includes(s.slug)
  );

  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 overflow-hidden bg-background">
        <div className="container-wide relative grid gap-16 lg:grid-cols-[1.15fr_1fr] items-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-8">
              <span className="h-px w-8 bg-accent" />
              Aannemer in ruime regio Diest
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.03] tracking-tight text-primary">
              Renoveren of bouwen met overzicht, van eerste analyse tot afwerking.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Een renovatie of bouwproject vraagt meer dan goede vakmensen alleen. Planning,
              technieken, materialen, uitvoering en afwerking moeten op elkaar afgestemd zijn.
            </p>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Dimac begeleidt uw project met één aanspreekpunt, duidelijke voorbereiding en
              correcte opvolging van de werken. Zo weet u beter waar u aan toe bent vóór de eerste
              werken starten.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Vraag een gesprek aan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/woningscan">Ontdek de woningscan</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Actief in Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving.
            </p>
          </div>
          <div className="fade-up">
            <ImagePlaceholder src={hero} label="Hero — renovatieproject" aspect="portrait" />
          </div>
        </div>
      </section>

      {/* SECTION 2 — TRUST CARDS */}
      <section className="pb-8 md:pb-16 bg-background">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustCards.map((c) => (
              <div key={c.title} className="bg-background border border-border p-8">
                <span className="block h-px w-8 bg-accent mb-6" />
                <h3 className="font-display text-xl text-primary leading-snug mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 border-t border-border pt-5 text-center">
              <Star className="w-4 h-4 text-accent fill-accent" strokeWidth={0} />
              <span className="text-sm text-primary">5/5 klanttevredenheid<span className="block text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Placeholder</span></span>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-border pt-5 text-center">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm text-primary">Actief in regio Diest<span className="block text-[10px] text-muted-foreground uppercase tracking-widest mt-1">& omgeving</span></span>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-border pt-5 text-center">
              <Hammer className="w-4 h-4 text-accent" />
              <span className="text-sm text-primary">20+ jaar ervaring<span className="block text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Placeholder</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TWO ENTRY PATHS */}
      <Section eyebrow="Twee instappaden" title="Wat is voor u de juiste eerste stap?">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-14">
          Niet elk project begint op hetzelfde punt. Sommige klanten weten al precies wat ze willen
          laten uitvoeren. Anderen willen eerst duidelijkheid over de staat van hun woning, de
          technische aandachtspunten en de logische volgorde van de werken.
        </p>
        <div className="grid gap-px bg-border border border-border md:grid-cols-2">
          {[
            {
              n: "01",
              title: "Ik wil mijn project laten uitvoeren",
              text: "U weet wat u wil aanpakken en zoekt een betrouwbare aannemer die de werken correct voorbereidt, coördineert en uitvoert.",
              extra: "Ideaal voor renovatie, nieuwbouw, badkamer, keuken, dakwerken, technieken of totaalprojecten.",
              cta: "Bekijk onze diensten",
              to: "/diensten",
            },
            {
              n: "02",
              title: "Ik wil eerst duidelijkheid voor ik beslis",
              text: "U wil eerst weten wat technisch nodig is, welke keuzes belangrijk zijn en hoe u uw renovatie of bouwproject best aanpakt.",
              extra: "Ideaal voor woningen waar nog veel vragen openstaan over budget, volgorde, haalbaarheid of technische staat.",
              cta: "Ontdek de woningscan",
              to: "/woningscan",
            },
          ].map((p) => (
            <div key={p.n} className="bg-background p-10 md:p-14 hover:bg-surface transition-colors duration-500">
              <span className="font-display text-accent text-2xl">{p.n}</span>
              <h3 className="font-display text-2xl md:text-3xl mt-4 mb-4 text-primary leading-tight">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{p.text}</p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed mb-8">{p.extra}</p>
              <Button asChild variant="ghost" className="px-0 h-auto text-accent hover:bg-transparent hover:text-primary">
                <Link to={p.to}>{p.cta} <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 4 — PROBLEM RECOGNITION */}
      <Section eyebrow="Waarom overzicht telt" title="Een project loopt zelden vast op één beslissing." bg="surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] items-start">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Bij renoveren of bouwen hangt bijna alles aan elkaar vast. Daarom is het gevaarlijk om
            elk onderdeel als een losse opdracht te bekijken. Een goed project begint met overzicht.
            Niet met losse beslissingen.
          </p>
          <ul className="divide-y divide-border border-y border-border">
            {[
              "Een keuken vraagt correcte aansluitingen.",
              "Een badkamer vraagt technische voorbereiding achter de muur.",
              "Een dak beïnvloedt isolatie, comfort en energieverbruik.",
              "Elektriciteit, sanitair en verwarming moeten afgestemd zijn op hoe u de woning wil gebruiken.",
              "Afwerking kan pas kloppen wanneer de voorbereiding juist zat.",
            ].map((line) => (
              <li key={line} className="py-5 text-primary/90 leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* SECTION 5 — POSITIONING */}
      <Section eyebrow="Positionering" title="Geen losse werken. Wel één logisch geheel.">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-14">
          Dimac helpt u om renovatie- en bouwprojecten gestructureerd aan te pakken. Niet door elk
          onderdeel apart te bekijken, maar door vooraf te begrijpen hoe alles samenkomt.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {positioningCards.map((c, i) => (
            <div key={c.title} className="border border-border p-8 md:p-10 bg-background">
              <span className="font-display text-accent text-sm">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl mt-4 mb-3 text-primary leading-tight">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="solid" size="lg">
            <Link to="/contact">Bespreek uw project <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 6 — WONINGSCAN */}
      <section className="py-24 md:py-36 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-[1fr_1.1fr] items-start">
          <div>
            <ImagePlaceholder label="Detail voorbereiding & analyse" src={prep} aspect="portrait" />
          </div>
          <div>
            <span className="eyebrow mb-5">Woningscan</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] text-primary mb-6">
              Twijfelt u over de juiste aanpak? Begin met inzicht.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5 max-w-xl">
              Niet elke woning vraagt meteen een offerte. Soms is eerst duidelijkheid nodig.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Met de woningscan krijgt u een helder beeld van de staat van uw woning, de technische
              aandachtspunten en de logische volgorde van uw renovatie. Zo neemt u beslissingen op
              basis van inzicht, niet op basis van losse vermoedens.
            </p>
            <ol className="space-y-6 mb-10">
              {woningscanPoints.map((p, i) => (
                <li key={p.title} className="flex gap-5 pb-6 border-b border-border last:border-0">
                  <span className="font-display text-accent text-lg leading-none pt-1 min-w-[2rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-display text-lg text-primary mb-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button asChild variant="solid" size="lg">
              <Link to="/woningscan">Plan uw woningscan <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 7 — SERVICES */}
      <Section eyebrow="Diensten" title="Voor renovatie- en bouwprojecten waar alles moet kloppen.">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-14">
          Dimac voert zowel renovatie- als nieuwbouwprojecten uit. Van aparte werken tot
          totaaltrajecten waarbij meerdere disciplines samenkomen.
        </p>
        <div className="grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-3">
          {homeServices.map((s, i) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="group bg-background p-8 md:p-10 flex flex-col hover:bg-surface transition-colors duration-500"
            >
              <span className="font-display text-accent text-sm">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl mt-4 mb-3 text-primary leading-tight">{s.overviewTitle}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent group-hover:gap-3 transition-all">
                Meer over deze dienst <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/diensten">Bekijk alle diensten</Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 8 — BOFU OBJECTION */}
      <Section eyebrow="Voor u tekent" title="U wil geen verrassingen halverwege de werken." bg="surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] items-start">
          <div className="space-y-6 text-muted-foreground leading-relaxed max-w-md">
            <p className="text-lg">
              Bij een renovatie of bouwproject gaat het vaak om een grote investering. Dan wil u
              vooraf weten waar u aan toe bent.
            </p>
            <p>
              Dat zijn vragen die u beter stelt vóór de werken starten. Daarom werkt Dimac met een
              duidelijke aanpak, één aanspreekpunt en een voorbereiding die verder gaat dan alleen
              een prijs op papier.
            </p>
            <div className="pt-2">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Vraag een gesprek aan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            {objectionQuestions.map((q) => (
              <li key={q} className="bg-background p-6 flex gap-4 items-start">
                <Check className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-primary leading-snug">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* SECTION 9 — WERKWIJZE */}
      <Section eyebrow="Werkwijze" title="Zo krijgt uw project structuur.">
        <WorkflowSteps
          steps={[
            { title: "Kennismaking", text: "We luisteren naar uw plannen en bekijken waar u vandaag staat. Gaat het om een concrete uitvoering, een totaalproject of eerst nood aan duidelijkheid?" },
            { title: "Analyse of woningscan", text: "We brengen de situatie, aandachtspunten en technische noden in kaart. Zo vermijden we dat belangrijke keuzes te laat genomen worden." },
            { title: "Voorstel en offerte", text: "U krijgt een duidelijk voorstel met scope, aanpak en prijs. Geen losse beloftes, maar een concreet beeld van wat er moet gebeuren." },
            { title: "Planning en voorbereiding", text: "Materialen, technieken, timing en uitvoering worden op elkaar afgestemd vóór de werken starten." },
            { title: "Uitvoering en oplevering", text: "Dimac coördineert de werken, volgt op en werkt toe naar een correcte oplevering." },
          ]}
        />
        <div className="mt-14">
          <Button asChild variant="link" className="text-accent">
            <Link to="/werkwijze">Bekijk onze werkwijze <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 10 — WAT U NIET ZIET */}
      <Section eyebrow="Onder de afwerking" title="Wat u niet ziet, bepaalt vaak de kwaliteit van het resultaat." bg="surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] items-start">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Een project voelt pas kwalitatief wanneer alles klopt in gebruik. Niet alleen wat
            zichtbaar is, maar vooral wat vooraf juist werd voorbereid.
          </p>
          <div>
            <ul className="grid sm:grid-cols-2 gap-px bg-border border border-border">
              {invisibleItems.map((item) => (
                <li key={item} className="bg-background p-5 text-primary flex items-center gap-3">
                  <span className="h-px w-6 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-muted-foreground leading-relaxed">
              Dat zijn zaken waar u achteraf niet altijd bij stilstaat, maar die elke dag verschil
              maken. Dimac kijkt daarom verder dan het zichtbare eindresultaat.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 11 — REALISATIES */}
      <Section eyebrow="Realisaties" title="Projecten waar voorbereiding en afwerking samenkomen.">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-14">
          Een goed resultaat ontstaat niet toevallig. Het is het gevolg van duidelijke keuzes,
          correcte voorbereiding en vakmensen die weten hoe hun werk aansluit op het volgende.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { src: bathroom, title: "Badkamerrenovatie met zorg voor afwerking", caption: "Techniek, waterdichting, materiaalkeuze en afwerking in één geheel." },
            { src: kitchen, title: "Keukenrenovatie waar technieken en maatwerk samenkomen", caption: "Een correcte voorbereiding van aansluitingen, indeling en afwerking." },
            { src: roof, title: "Dakwerken met aandacht voor details", caption: "Opbouw, isolatie, afwatering en aansluitingen die technisch kloppen." },
            { src: total, title: "Totaalproject met één duidelijke planning", caption: "Meerdere werken gebundeld in één overzichtelijk traject." },
          ].map((p) => (
            <figure key={p.title} className="fade-up">
              <ImagePlaceholder src={p.src} label={p.title} aspect="landscape" />
              <figcaption className="mt-4 max-w-md">
                <h3 className="font-display text-lg text-primary leading-snug">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline">
            <Link to="/realisaties">Bekijk realisaties <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 12 — REVIEWS + TRUST */}
      <Section eyebrow="Reviews" title="Waar klanten Dimac voor kiezen." bg="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Zeer tevreden over de communicatie en het eindresultaat. Alles verliep volgens afspraak.",
            "Correcte planning, duidelijke offerte en mooie afwerking. Aanrader.",
            "Goede opvolging en professioneel uitgevoerd werk. Wij zijn zeer tevreden.",
          ].map((q, i) => (
            <blockquote key={i} className="bg-background p-8 md:p-10 border border-border">
              <div className="flex gap-1 mb-6 text-accent">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent" strokeWidth={0} />
                ))}
              </div>
              <p className="font-display text-lg leading-snug text-primary">"{q}"</p>
              <footer className="mt-8 pt-6 border-t border-border text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Voorbeeldreview · Placeholder
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustThemes.map((t) => (
            <div key={t.title} className="bg-background border border-border p-8">
              <span className="block h-px w-8 bg-accent mb-6" />
              <h3 className="font-display text-lg text-primary leading-snug mb-3">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 13 — OVER DIMAC */}
      <Section eyebrow="Over Dimac" title="Uw aannemer voor renovatie en nieuwbouw in regio Diest.">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] items-start">
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
            <p>
              Dimac is een lokale bouwpartner voor renovatie- en nieuwbouwprojecten in ruime regio
              Diest.
            </p>
            <p>
              We combineren vakmanschap met duidelijke communicatie, technische voorbereiding en
              praktische opvolging van de werken. Onze meerwaarde zit niet alleen in de uitvoering,
              maar vooral in het overzicht over het volledige traject.
            </p>
            <p>
              Bij Dimac staat u niet tussen verschillende partijen die elk hun eigen onderdeel
              uitvoeren. U krijgt één aanspreekpunt dat het project mee bewaakt van eerste analyse
              tot oplevering.
            </p>
            <p>
              Zo wordt uw renovatie of bouwproject geen verzameling losse beslissingen, maar één
              logisch geheel.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline">
                <Link to="/over">Leer Dimac beter kennen</Link>
              </Button>
            </div>
          </div>
          <div>
            <ImagePlaceholder label="Team Dimac" src={total} aspect="landscape" />
          </div>
        </div>
      </Section>

      {/* SECTION 14 — FINAL CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title="Klaar om uw renovatie of bouwproject juist aan te pakken?"
        text="Vertel ons kort wat u wil bouwen of renoveren. Dan bekijken we samen welke aanpak logisch is: meteen richting uitvoering of eerst meer duidelijkheid via de woningscan."
        primary={{ label: "Vraag een gesprek aan", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
        microcopy="Geen verplichting. Eerst een duidelijk gesprek over uw plannen, vragen en volgende stap."
      />
    </>
  );
};

export default Index;
