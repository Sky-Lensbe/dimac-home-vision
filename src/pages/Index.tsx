import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema, websiteSchema } from "@/lib/site";
import { services } from "@/data/services";
import heroAsset from "@/assets/hero-dimac.jpg.asset.json";
const hero = heroAsset.url;
import bathroomAsset from "@/assets/bathroom-realisation.jpg.asset.json";
const bathroom = bathroomAsset.url;
import kitchenAsset from "@/assets/kitchen-realisation.jpg.asset.json";
const kitchen = kitchenAsset.url;
import roofAsset from "@/assets/roof-realisation.jpg.asset.json";
const roof = roofAsset.url;
import totalAsset from "@/assets/total-realisation.jpg.asset.json";
const total = totalAsset.url;
import prep from "@/assets/preparation.jpg";

/* ---------- Homepage content ---------- */

const trustBar = [
  { title: "Eén aanspreekpunt", text: "Voor uw volledige project, van eerste vraag tot oplevering." },
  { title: "Duidelijke voorbereiding", text: "Keuzes, timing en technieken worden vooraf op elkaar afgestemd." },
  { title: "Eigen vakmensen en vaste partners", text: "Mensen die weten hoe hun werk aansluit op de volgende stap." },
  { title: "Actief in regio Diest", text: "Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving." },
];

const problemLines = [
  "Een keuken vraagt correcte aansluitingen.",
  "Een badkamer vraagt technische voorbereiding achter de muur.",
  "Een dak beïnvloedt isolatie, comfort en energieverbruik.",
  "Elektriciteit, sanitair en verwarming moeten afgestemd zijn op hoe u woont.",
  "Afwerking klopt pas wanneer de voorbereiding juist zat.",
];

const positioningCards = [
  { title: "Voorbereiding", text: "We bekijken wat technisch, praktisch en budgettair nodig is vóór de werken starten." },
  { title: "Coördinatie", text: "We stemmen de verschillende werken op elkaar af, zodat planning en uitvoering niet naast elkaar lopen." },
  { title: "Opvolging", text: "Uw aanspreekpunt volgt het project op tot de afwerking klopt." },
];

const entryPaths = [
  {
    n: "01",
    title: "Ik wil mijn project laten uitvoeren",
    text: "U weet wat u wil aanpakken en zoekt een aannemer die de werken voorbereidt, coördineert en uitvoert.",
    cta: "Bekijk onze diensten",
    to: "/diensten",
  },
  {
    n: "02",
    title: "Ik wil eerst duidelijkheid voor ik beslis",
    text: "U wil eerst weten wat technisch nodig is, welke keuzes belangrijk zijn en in welke volgorde de werken best gebeuren.",
    cta: "Ontdek de woningscan",
    to: "/woningscan",
  },
];

const serviceSummaries: Record<string, string> = {
  totaalrenovatie: "Meerdere werken gebundeld in één traject. Eén planning, één aanspreekpunt.",
  nieuwbouw: "Van ruwbouw tot afwerking. Technieken en uitvoering op elkaar afgestemd.",
  "badkamer-renovatie": "Waterdichting, technieken en afwerking in één geheel voorbereid.",
  "keuken-renovatie": "Aansluitingen, indeling en afwerking die op elkaar aansluiten.",
  dakwerken: "Opbouw, isolatie en afwatering die technisch kloppen.",
  technieken: "Elektriciteit, sanitair en verwarming afgestemd op uw gebruik.",
};

const woningscanPoints = [
  { title: "Inzicht vóór u beslist", text: "U weet welke werken nodig zijn en welke keuzes elkaar beïnvloeden." },
  { title: "Minder verrassingen tijdens de werken", text: "Aandachtspunten worden vroeger zichtbaar in plaats van tijdens de uitvoering." },
  { title: "Technisch en praktisch advies", text: "Een duidelijk beeld van wat haalbaar en logisch is voor uw woning." },
  { title: "Scanbedrag wordt verrekend", text: "Laat u het project nadien door Dimac uitvoeren, dan wordt het bedrag van de scan verrekend." },
];

const realisations = [
  { src: bathroom, type: "Badkamer", title: "Badkamerrenovatie met zorg voor afwerking", label: "Gerenoveerde badkamer met tegelwerk en inloopdouche" },
  { src: kitchen, type: "Keuken", title: "Keukenrenovatie waar technieken en maatwerk samenkomen", label: "Gerenoveerde keuken met maatwerkkasten" },
  { src: roof, type: "Dakwerken", title: "Dakwerken met aandacht voor detail", label: "Vernieuwd dak met nieuwe dakbedekking" },
  { src: total, type: "Totaalrenovatie", title: "Totaalproject met één duidelijke planning", label: "Volledig gerenoveerde woning met open leefruimte" },
];

// Placeholder voor echte Google-reviews: vervang deze array later door reviewdata.
const trustElements = [
  { title: "Duidelijke communicatie", text: "U weet wie uw aanspreekpunt is en wat de volgende stap wordt." },
  { title: "Eén partij die het overzicht bewaakt", text: "Geen losse aannemers aansturen, maar één traject met opvolging." },
  { title: "Technische voorbereiding", text: "Aandacht voor wat moet kloppen vóór de werken zichtbaar worden." },
  { title: "Afwerking met oog voor detail", text: "Kwaliteit zit in aansluitingen, overgangen en praktische afwerking." },
];

const Index = () => {
  const homeServices = services.filter((s) => s.slug in serviceSummaries);

  return (
    <>
      <PageSEO
        path="/"
        title="Aannemer regio Diest | Renovatie & nieuwbouw | Dimac"
        description="Dimac is uw aannemer voor renovatie en nieuwbouw in regio Diest. Eén aanspreekpunt, duidelijke voorbereiding en correcte opvolging van de werken."
        schemas={[organizationSchema(), websiteSchema()]}
      />
      {/* SECTION 1 — HERO (mobiel/tablet: overlay op foto) */}
      <section className="relative lg:hidden pt-24 sm:pt-28 pb-12 bg-background">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-sm bg-surface-strong min-h-[34rem] sm:min-h-[38rem] flex items-end">
            <img
              src={hero}
              alt="Renovatieproject van Dimac in regio Diest"
              className="absolute inset-0 h-full w-full object-cover object-[60%_30%]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/70 to-primary/25"
            />
            <div className="relative w-full p-6 sm:p-8 max-w-xl">
              <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-primary-foreground/85 mb-5" data-reveal>
                <span className="h-px w-8 bg-accent" />
                Aannemer in ruime regio Diest
              </span>
              {/* Visueel de mobiele titel; de semantische h1 staat in de desktophero,
                  zodat de pagina exact één h1 in de DOM heeft. */}
              <div role="text" className="font-display text-[2rem] sm:text-4xl leading-[1.08] tracking-tight text-primary-foreground" data-reveal data-reveal-delay="1">
                Renoveren of bouwen zonder zelf alles te moeten coördineren.
              </div>
              <p className="mt-5 text-base sm:text-lg text-primary-foreground/85 leading-relaxed" data-reveal data-reveal-delay="2">
                Dimac begeleidt uw renovatie- of bouwproject met één aanspreekpunt, een duidelijke
                voorbereiding en correcte opvolging van de werken tot de afwerking.
              </p>
              <div className="mt-7 flex flex-col gap-3" data-reveal data-reveal-delay="3">
                <Button asChild variant="solid" size="lg" className="w-full">
                  <Link to="/contact">Bespreek uw project <ArrowRight className="w-4 h-4" /></Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground fine:hover:bg-primary-foreground fine:hover:text-primary"
                >
                  <Link to="/woningscan">Ontdek de woningscan</Link>
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-primary-foreground/80 flex items-start gap-2 leading-relaxed" data-reveal data-reveal-delay="4">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>Actief in Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 — HERO (desktop) */}
      <section className="relative hidden lg:block pt-32 pb-20 md:pt-40 lg:pt-[8.5rem] md:pb-24 overflow-hidden bg-background">
        <div className="container-wide relative grid gap-16 lg:grid-cols-[1.15fr_1fr] items-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-8">
              <span className="h-px w-8 bg-accent" />
              Aannemer in ruime regio Diest
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl leading-[1.03] tracking-tight text-primary max-w-[15ch] lg:max-w-none xl:max-w-[16ch]">
              Renoveren of bouwen zonder zelf alles te moeten coördineren.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Dimac begeleidt uw renovatie- of bouwproject met één aanspreekpunt, een duidelijke
              voorbereiding en correcte opvolging van de werken tot de afwerking.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Bespreek uw project <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/woningscan">Ontdek de woningscan</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              Actief in Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving.
            </p>
          </div>
          <div className="fade-up">
            <ImagePlaceholder
              src={hero}
              label="Renovatieproject van Dimac in regio Diest"
              aspect="tall"
              fit="contain"
              className="bg-surface"
            />
          </div>
        </div>
      </section>


      {/* SECTION 2 — VERTROUWENSBALK */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-wide">
          <div className="stagger-list grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-4" data-reveal>
            {trustBar.map((c) => (
              <div key={c.title} className="card-flush bg-background p-8">
                <span className="accent-rule mb-6" />
                <h2 className="font-display text-xl text-primary leading-snug mb-3">{c.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — PROBLEEMHERKENNING */}
      <Section eyebrow="Waarom overzicht telt" title="Een project loopt zelden vast op één beslissing." bg="surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] items-start">
          <div data-reveal>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bij renoveren of bouwen hangt bijna alles aan elkaar vast. Wie elk onderdeel als een
              losse opdracht bekijkt, botst later op keuzes die elkaar tegenwerken.
            </p>
            <p className="mt-6 text-lg text-primary leading-relaxed">
              Daarom bekijkt Dimac een project als één geheel.
            </p>
          </div>
          <ul className="stagger-list divide-y divide-border border-y border-border" data-reveal>
            {problemLines.map((line) => (
              <li key={line} className="py-5 text-primary/90 leading-relaxed transition-colors duration-300 fine:lg:hover:text-primary fine:lg:hover:bg-surface/70">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* SECTION 4 — POSITIONERING */}
      <Section eyebrow="Positionering" title="Geen losse werken. Wel één logisch geheel.">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-14" data-reveal>
          Dimac pakt renovatie- en bouwprojecten gestructureerd aan: niet elk onderdeel apart, maar
          vooraf begrijpen hoe alles samenkomt.
        </p>
        <div className="stagger-list grid gap-6 md:grid-cols-3" data-reveal>
          {positioningCards.map((c, i) => (
            <div key={c.title} className="card-interactive group/card border border-border p-8 md:p-10 bg-background">
              <span className="font-display text-accent text-sm inline-block transition-transform duration-300 ease-out origin-left motion-safe:fine:lg:group-hover/card:scale-110">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl mt-4 mb-3 text-primary leading-tight">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline" size="lg">
            <Link to="/werkwijze">Bekijk onze werkwijze <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 5 — TWEE INSTAPPADEN */}
      <Section eyebrow="Twee instappaden" title="Wat is voor u de juiste eerste stap?" bg="surface">
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
          {entryPaths.map((p) => (
            <div key={p.n} className="card-flush group/card bg-background p-10 md:p-14">
              <span className="font-display text-accent text-2xl inline-block transition-transform duration-300 ease-out origin-left motion-safe:fine:lg:group-hover/card:scale-110">{p.n}</span>
              <h3 className="font-display text-2xl md:text-3xl mt-4 mb-4 text-primary leading-tight">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{p.text}</p>
              <Button asChild variant="ghost" className="px-0 h-auto text-accent fine:hover:bg-transparent fine:hover:text-primary">
                <Link to={p.to}>{p.cta} <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 6 — DIENSTEN */}
      <Section eyebrow="Diensten" title="Voor renovatie- en bouwprojecten waar alles moet kloppen.">
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-3" data-reveal>
          {homeServices.map((s, i) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="focus-ring-inset card-flush group/card bg-background p-8 md:p-10 flex flex-col"
            >
              <span className="font-display text-accent text-sm inline-block transition-transform duration-300 ease-out origin-left motion-safe:fine:lg:group-hover/card:scale-110">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl mt-4 mb-3 text-primary leading-tight">{s.overviewTitle}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{serviceSummaries[s.slug]}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent">
                Meer over deze dienst <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline" size="lg">
            <Link to="/diensten">Bekijk alle diensten</Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 7 — WONINGSCAN */}
      <section className="py-24 md:py-36 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-[1fr_1.1fr] items-start">
          <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
            <ImagePlaceholder label="Voorbereiding en analyse van een woning" src={prep} aspect="portrait" />
          </div>
          <div>
            <span className="eyebrow mb-5" data-reveal>Woningscan</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] text-primary mb-6" data-reveal data-reveal-delay="1">
              Twijfelt u over de juiste aanpak? Begin met inzicht.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl" data-reveal data-reveal-delay="2">
              Met de woningscan krijgt u een helder beeld van de staat van uw volledige woning, de technische
              aandachtspunten en de logische volgorde van uw werken.
            </p>
            <ol className="stagger-list space-y-6 mb-10" data-reveal>
              {woningscanPoints.map((p, i) => (
                <li key={p.title} className="group/point flex gap-5 pb-6 border-b border-border last:border-0">
                  <span className="font-display text-accent text-lg leading-none pt-1 min-w-[2rem] transition-transform duration-300 ease-out origin-left motion-safe:fine:lg:group-hover/point:scale-110">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-primary mb-1">{p.title}</h3>
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

      {/* SECTION 8 — REALISATIES */}
      <Section eyebrow="Realisaties" title="Projecten waar voorbereiding en afwerking samenkomen.">
        <div className="stagger-list grid gap-6 md:grid-cols-2" data-reveal>
          {realisations.map((p) => (
            <figure key={p.title} className="group/real">
              <ImagePlaceholder src={p.src} label={p.label} aspect="landscape" showLabelOverlay={false} />
              <figcaption className="mt-4 max-w-md transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/real:-translate-y-1">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{p.type}</span>
                <h3 className="font-display text-lg text-primary leading-snug mt-2 transition-colors duration-300 fine:lg:group-hover/real:text-accent">{p.title}</h3>
                <span className="mt-3 block h-px w-8 bg-accent transition-[width] duration-500 ease-out fine:lg:group-hover/real:w-16" aria-hidden="true" />
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline" size="lg">
            <Link to="/realisaties">Bekijk realisaties <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* SECTION 9 — VERTROUWENSSECTIE */}
      <Section eyebrow="Waarom Dimac" title="Duidelijkheid tijdens het volledige traject." bg="surface">
        <div className="stagger-list grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {trustElements.map((t) => (
            <div key={t.title} className="card-flush bg-background p-8">
              <span className="accent-rule mb-6" />
              <h3 className="font-display text-lg text-primary leading-snug mb-3">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 10 — OVER DIMAC */}
      <Section eyebrow="Over Dimac" title="Uw aannemer voor renovatie en nieuwbouw in regio Diest.">
        <div className="max-w-2xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          <p>
            Dimac is een lokale bouwpartner voor renovatie- en nieuwbouwprojecten in ruime regio
            Diest. We combineren vakmanschap met duidelijke communicatie, technische voorbereiding
            en praktische opvolging van de werken.
          </p>
          <p>
            U staat niet tussen verschillende partijen die elk hun eigen onderdeel uitvoeren. U
            heeft één aanspreekpunt dat het project mee bewaakt, van eerste analyse tot oplevering.
          </p>
          <div className="pt-4">
            <Button asChild variant="outline" size="lg">
              <Link to="/over">Leer Dimac kennen</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* SECTION 11 — FINALE CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title="Klaar om uw renovatie of bouwproject juist aan te pakken?"
        text="Vertel ons kort wat u wil bouwen of renoveren. Dan bekijken we samen welke aanpak logisch is: meteen richting uitvoering of eerst meer duidelijkheid via de woningscan."
        primary={{ label: "Bespreek uw project", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
        microcopy="Geen verplichting. Eerst een duidelijk gesprek over uw plannen, vragen en volgende stap."
      />
    </>
  );
};

export default Index;
