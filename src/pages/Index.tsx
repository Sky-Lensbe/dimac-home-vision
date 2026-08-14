import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { PhaseStrip } from "@/components/site/PhaseStrip";
import { DisciplineGrid } from "@/components/site/DisciplineGrid";
import { ProjectCard } from "@/components/site/ProjectCard";
import { TeamSection } from "@/components/site/TeamSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema, websiteSchema } from "@/lib/site";
import { visibleProjects } from "@/data/projects";
import { activeRegions } from "@/data/regions";
import { track } from "@/lib/analytics";
import heroAsset from "@/assets/hero-dimac.jpg.asset.json";
import prep from "@/assets/preparation.jpg";

const hero = heroAsset.url;

/* ---------- Homepagecontent ---------- */

const HERO = {
  eyebrow: "Aannemer in ruime regio Diest",
  title: "Renoveren zonder zelf alles te moeten coördineren.",
  sub: "Van technieken en dakwerken tot keuken, badkamer en afwerking. Dimac stemt de verschillende werken op elkaar af en blijft je centrale aanspreekpunt.",
  region: "Actief in regio Diest, Scherpenheuvel-Zichem, Halen, Tessenderlo-Ham en omgeving.",
};

const problems = [
  "Verschillende aannemers zijn afhankelijk van elkaars planning.",
  "Technieken beïnvloeden vloer, keuken en badkamer.",
  "Wijzigingen hebben gevolgen voor andere werkzaamheden.",
  "Zonder centrale coördinatie raakt het overzicht versnipperd.",
];

const phases = [
  { title: "Analyse", text: "We brengen in kaart wat de woning technisch en praktisch vraagt." },
  { title: "Planning", text: "De werken krijgen een volgorde die technisch klopt." },
  { title: "Coördinatie", text: "De disciplines worden op elkaar afgestemd." },
  { title: "Uitvoering", text: "De fases volgen elkaar op vanuit één plan." },
  { title: "Afwerking", text: "De aansluitingen en details worden samen overlopen." },
];

const capabilities = [
  { slug: "totaalrenovatie", label: "Totaalrenovatie", text: "Meerdere werken gebundeld in één traject." },
  { slug: "dakwerken", label: "Dakwerken", text: "Opbouw, isolatie en afwatering die technisch kloppen." },
  { slug: "elektriciteit", label: "Elektriciteit", text: "Aansluitingen afgestemd op hoe je woont." },
  { slug: "sanitair", label: "Sanitair", text: "Leidingen en afvoer voorbereid vóór de afwerking." },
  { slug: "hernieuwbare-energie", label: "Verwarming en warmtepompen", text: "Technieken die passen bij de staat van de woning." },
  { slug: "badkamer-renovatie", label: "Badkamerrenovatie", text: "Waterdichting, technieken en afwerking als één geheel." },
  { slug: "keuken-renovatie", label: "Keukenrenovatie", text: "Aansluitingen en indeling klaar vóór plaatsing." },
  { slug: "afwerking", label: "Afwerking", text: "Overgangen en details die het geheel afmaken." },
];

const paths = [
  {
    title: "Ik weet wat ik wil aanpakken",
    text: "Heb je al een concreet renovatieproject of specifieke werken in gedachten? Dan bekijken we samen de mogelijkheden en volgende stappen.",
    cta: "Bespreek je project",
    to: "/contact",
    event: "project_contact_start" as const,
  },
  {
    title: "Ik weet nog niet wat eerst moet",
    text: "Wil je renoveren maar ontbreekt er nog een duidelijke volgorde of prioriteit? Start dan met een woningscan.",
    cta: "Start met een woningscan",
    to: "/woningscan",
    event: "woningscan_click" as const,
  },
];

const scanPoints = [
  { title: "Voor wie", text: "Voor eigenaars met renovatieplannen die nog geen duidelijke volgorde of prioriteit hebben." },
  { title: "Wat bekeken kan worden", text: "De staat van de volledige woning: van dak en technieken tot vochtpunten, isolatie en afwerking." },
  { title: "Waarom volgorde telt", text: "Werken in de verkeerde volgorde betekent later opnieuw openbreken wat net afgewerkt was." },
  { title: "Wat je erna weet", text: "Welke werken prioritair zijn, welke keuzes elkaar beïnvloeden en wat een logische eerste stap is." },
];

const werkwijze = [
  { title: "Kennismaking", text: "Een eerste gesprek over je plannen en je woning." },
  { title: "Project begrijpen", text: "We bekijken wat er technisch en praktisch nodig is." },
  { title: "Voorstel en analyse", text: "Je krijgt een duidelijk beeld van scope en aanpak." },
  { title: "Planning", text: "De werken en disciplines worden ingepland." },
  { title: "Uitvoering", text: "De fases volgen elkaar op vanuit één plan." },
  { title: "Opvolging", text: "Je aanspreekpunt blijft het overzicht bewaken tot de oplevering." },
];

const Index = () => {
  const featured = visibleProjects.slice(0, 3);

  useEffect(() => {
    track("woningscan_view", { page_type: "home" });
  }, []);

  return (
    <>
      <PageSEO
        path="/"
        title="Aannemer regio Diest | Renovatie met één aanspreekpunt | Dimac"
        description="Dimac coördineert renovatieprojecten in regio Diest, Scherpenheuvel-Zichem, Halen en Tessenderlo-Ham. Eén aanspreekpunt voor technieken, dakwerken, badkamer, keuken en afwerking."
        schemas={[organizationSchema(), websiteSchema()]}
      />

      {/* 1 — HERO (mobiel en tablet: overlay op de foto) */}
      <section className="relative lg:hidden pt-24 sm:pt-28 pb-12 bg-background">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-sm bg-surface-strong min-h-[32rem] sm:min-h-[36rem] flex items-end">
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
                {HERO.eyebrow}
              </span>
              {/* Visueel de mobiele titel; de semantische h1 staat in de desktophero. */}
              <div role="text" className="font-display text-[2rem] sm:text-4xl leading-[1.08] tracking-tight text-primary-foreground" data-reveal data-reveal-delay="1">
                {HERO.title}
              </div>
              <p className="mt-5 text-base text-primary-foreground/85 leading-relaxed" data-reveal data-reveal-delay="2">
                {HERO.sub}
              </p>
              <div className="mt-7 flex flex-col gap-3" data-reveal data-reveal-delay="3">
                <Button asChild variant="solid" size="lg" className="w-full">
                  <Link
                    to="/contact"
                    onClick={() => track("project_contact_start", { page_type: "home", cta_label: "Bespreek je project" })}
                  >
                    Bespreek je project <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground fine:hover:bg-primary-foreground fine:hover:text-primary"
                >
                  <Link
                    to="/woningscan"
                    onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Ontdek de woningscan" })}
                  >
                    Ontdek de woningscan
                  </Link>
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-primary-foreground/80 flex items-start gap-2 leading-relaxed" data-reveal data-reveal-delay="4">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{HERO.region}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1 — HERO (desktop) */}
      <section className="relative hidden lg:block pt-32 pb-20 lg:pt-[8.5rem] md:pb-24 overflow-hidden bg-background">
        <div className="container-wide relative grid gap-16 lg:grid-cols-[1.15fr_1fr] items-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-8">
              <span className="h-px w-8 bg-accent" />
              {HERO.eyebrow}
            </span>
            <h1 className="font-display text-5xl lg:text-[4rem] xl:text-7xl leading-[1.03] tracking-tight text-primary xl:max-w-[16ch]">
              {HERO.title}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {HERO.sub}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link
                  to="/contact"
                  onClick={() => track("project_contact_start", { page_type: "home", cta_label: "Bespreek je project" })}
                >
                  Bespreek je project <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  to="/woningscan"
                  onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Ontdek de woningscan" })}
                >
                  Ontdek de woningscan
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{HERO.region}</span>
            </p>
          </div>
          <div className="fade-up delay-2">
            <ImagePlaceholder
              src={hero}
              label="Renovatieproject van Dimac in regio Diest"
              aspect="portrait"
              showLabelOverlay={false}
            />
          </div>
        </div>
      </section>

      {/* 2 — PROBLEEMHERKENNING */}
      <Section
        eyebrow="Herkenbaar?"
        title="Een renovatie wordt pas complex wanneer alles op elkaar moet aansluiten."
        bg="surface"
      >
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] items-start">
          <p className="text-lg text-muted-foreground leading-relaxed" data-reveal>
            De losse werken zijn zelden het probleem. De samenhang ertussen wel: wat eerst moet,
            wat op elkaar wacht en wie het geheel bewaakt.
          </p>
          <ul className="stagger-list divide-y divide-border border-y border-border" data-reveal>
            {problems.map((line) => (
              <li key={line} className="py-5 text-primary/90 leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 max-w-3xl font-display text-2xl md:text-3xl leading-snug text-primary" data-reveal>
          Daarom bewaakt Dimac de samenhang tussen planning, technieken en uitvoering.
        </p>
      </Section>

      {/* 3 — DIMAC-AANPAK */}
      <Section eyebrow="De aanpak" title="Eén aanspreekpunt. Meerdere disciplines. Eén plan.">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-12" data-reveal>
          Jij hebt één aanspreekpunt. Wij zorgen dat de verschillende werken op elkaar aansluiten.
        </p>
        <PhaseStrip phases={phases} />
        <div className="mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/werkwijze">Bekijk onze aanpak <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* 4 — TWEE KLANTPADEN */}
      <Section eyebrow="Instappen" title="Waar sta je vandaag?" bg="surface">
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
          {paths.map((p) => (
            <div key={p.title} className="card-flush group/card bg-background p-8 sm:p-10 md:p-14 flex flex-col min-w-0">
              <h3 className="font-display text-2xl md:text-3xl text-primary leading-tight">{p.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{p.text}</p>
              <div className="mt-8">
                <Button asChild variant="solid" size="lg">
                  <Link
                    to={p.to}
                    onClick={() => track(p.event, { page_type: "home", cta_label: p.cta })}
                  >
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5 — CAPABILITIES */}
      <Section eyebrow="Disciplines" title="Wat Dimac binnen één renovatie kan verbinden">
        <DisciplineGrid
          items={capabilities.map((c) => ({
            label: c.label,
            text: c.text,
            slug: c.slug,
            to: `/diensten/${c.slug}`,
          }))}
        />
        <div className="mt-10">
          <Link to="/diensten" className="link-underline text-accent focus-ring text-sm">
            Alle diensten bekijken
          </Link>
        </div>
      </Section>

      {/* 6 — WONINGSCAN */}
      <section className="py-24 md:py-36 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-[1fr_1.1fr] items-start">
          <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
            <ImagePlaceholder label="Analyse van een woning tijdens de woningscan" src={prep} aspect="portrait" />
          </div>
          <div>
            <span className="eyebrow mb-5" data-reveal>Woningscan</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] text-primary mb-6" data-reveal data-reveal-delay="1">
              Wel plannen om te renoveren, maar geen idee wat eerst moet?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl" data-reveal data-reveal-delay="2">
              Met de woningscan bekijken we de volledige woning en vertalen we de aandachtspunten
              naar een logische volgorde van werken.
            </p>
            <ol className="stagger-list space-y-6 mb-10" data-reveal>
              {scanPoints.map((p, i) => (
                <li key={p.title} className="flex gap-5 pb-6 border-b border-border last:border-0">
                  <span className="font-display text-accent text-lg leading-none pt-1 min-w-[2rem]">
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
              <Link
                to="/woningscan"
                onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Bekijk hoe de woningscan werkt" })}
              >
                Bekijk hoe de woningscan werkt <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7 — REALISATIES */}
      <Section eyebrow="Realisaties" title="Zo ziet die aanpak eruit in de praktijk.">
        <div className="stagger-list grid gap-10 md:grid-cols-2 lg:grid-cols-3" data-reveal>
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} pageType="home" />
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline" size="lg">
            <Link to="/realisaties">Bekijk alle realisaties <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* 8 — WERKWIJZE */}
      <Section eyebrow="Werkwijze" title="Wat gebeurt er nadat je contact opneemt?" bg="surface">
        <ol className="stagger-list grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {werkwijze.map((s, i) => (
            <li key={s.title} className="bg-background p-8">
              <span className="font-display text-accent text-sm">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl text-primary leading-snug mt-3">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9 — TEAM (rendert enkel bij echte data) */}
      <TeamSection />

      {/* 10 — REVIEWS (rendert enkel bij echte data) */}
      <ReviewsSection />

      {/* 11 — WERKINGSGEBIED */}
      <Section eyebrow="Werkingsgebied" title="Lokaal actief in en rond Diest.">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          <p>
            Dimac werkt in Diest, Scherpenheuvel-Zichem, Halen, Tessenderlo-Ham en de omliggende
            gemeenten. Kort bij de werf zijn maakt opvolging eenvoudiger: overleg gebeurt ter plaatse
            en bijsturen kan snel.
          </p>
          <p>
            We kennen de lokale bouwcontext, de gangbare woningtypes in de regio en de partners
            waarmee we samenwerken.
          </p>
        </div>
        {activeRegions.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3" data-reveal>
            {activeRegions.map((r) => (
              <li key={r.slug}>
                <Link to={`/regio/${r.slug}`} className="link-underline text-accent focus-ring text-sm">
                  Aannemer in {r.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 12 — SLOTCONVERSIE */}
      <CTABlock
        eyebrow="Volgende stap"
        title="Een renovatie gepland?"
        text="Vertel ons kort wat je wilt aanpakken. We bekijken samen wat een logische volgende stap is."
        primary={{ label: "Bespreek je project", to: "/contact" }}
        secondary={{ label: "Start met een woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Index;
