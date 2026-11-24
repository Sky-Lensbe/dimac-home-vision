import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { DevelopmentGrid } from "@/components/site/Developments";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema, websiteSchema } from "@/lib/site";
import { developments } from "@/data/developments";
import { DRONE_PRICE, PRODUCTS, VAT_LABEL, formatEuro, formatPrice, getProduct } from "@/data/woningscan";
import { track } from "@/lib/analytics";
import heroAsset from "@/assets/hero-living.jpg?url";
import renoAsset from "@/assets/total-realisation.jpg?url";

const cta = (label: string) => () => track("cta_click", { page_type: "home", cta_label: label });
const scanClick = (label: string) => () => track("woningscan_click", { page_type: "home", cta_label: label });

const paths = [
  {
    situatie: "kopen",
    eyebrow: "Aankoop",
    title: "Ik wil een woning kopen",
    text: "Bij een aankoop kijkt u verder dan de uitstraling en vraagprijs. Een Woningscan helpt u om zichtbare technische aandachtspunten en mogelijke renovatiebehoeften beter te begrijpen.",
  },
  {
    situatie: "renoveren",
    eyebrow: "Renovatie",
    title: "Ik wil mijn woning renoveren",
    text: "Niet elke renovatie begint met uitbreken. Eerst bepalen welke werken nodig zijn en in welke volgorde ze best gebeuren, kan onnodig dubbel werk helpen vermijden.",
  },
];


const expertise = [
  {
    title: "Vastgoedontwikkeling",
    text: "Wij herkennen het potentieel van bestaande panden en realiseren eigen vastgoedontwikkelingen met aandacht voor kwaliteit en toekomstwaarde.",
    cta: "Onze ontwikkelingsaanpak",
    to: "/projecten",
  },
  {
    title: "Totaalrenovaties",
    text: "Van technische voorbereiding tot een samenhangende uitvoering. We bekijken een volledige renovatie als één geïntegreerd project.",
    cta: "Ontdek totaalrenovaties",
    to: "/totaalrenovaties",
  },
  {
    title: "Woningscans",
    text: "Dezelfde praktische blik op vastgoed, toegepast op de woning die u wilt kopen of renoveren.",
    cta: "Ontdek de Woningscan",
    to: "/woningscan",
  },
];

const devSteps = [
  { title: "Potentieel beoordelen", text: "Wij zoeken panden en percelen waar meer mogelijk is dan op het eerste gezicht zichtbaar." },
  { title: "Mogelijkheden onderzoeken", text: "Renoveren, transformeren of nieuw bouwen: we kiezen wat het pand en de plek toelaten." },
  { title: "Doordacht voorbereiden", text: "Technische analyse, planning en de juiste volgorde van werken vóór de uitvoering start." },
  { title: "Realiseren", text: "Uitvoering met aandacht voor techniek, afwerking en duurzame meerwaarde." },
];

const H2 = "font-display text-3xl md:text-5xl leading-[1.06] tracking-tight text-primary text-balance";

const Index = () => (
  <>
    <PageSEO
      path="/"
      title="DIMAC | Woningscan Diest, renovatie & vastgoedontwikkeling"
      description="Een woning kopen of renoveren? DIMAC biedt een gratis online Quickscan, Woningscans ter plaatse, totaalrenovaties en eigen vastgoedontwikkeling in regio Diest."
      schemas={[organizationSchema(), websiteSchema()]}
    />

    {/* 1 — HERO */}
    <section className="relative overflow-hidden bg-background" aria-labelledby="hero-title">
      <img
        src={heroAsset}
        alt=""
        width={1920}
        height={1280}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[60%_center] lg:object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/10 lg:bg-gradient-to-r lg:from-background lg:via-background/85 lg:to-background/10"
        aria-hidden="true"
      />
      <div className="relative container-wide pt-40 sm:pt-60 pb-12 sm:pb-16 lg:pt-44 lg:pb-40 fade-up">
        <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-5 lg:mb-8">
          <span className="h-px w-8 bg-accent" />
          Vastgoedontwikkeling & bouwexpertise
        </span>
        <h1
          id="hero-title"
          className="font-display text-[2.1rem] sm:text-5xl lg:text-[4rem] xl:text-[4.6rem] leading-[1.03] tracking-tight text-primary max-w-[15ch] text-balance"
        >
          Vastgoed met potentieel. Ontwikkeld met inzicht.
        </h1>
        <p className="mt-5 lg:mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Een woning kopen of renoveren? Maak onderbouwde keuzes dankzij onze praktijkervaring in
          vastgoedontwikkeling. Met de Woningscan ontdekt u de zichtbare aandachtspunten,
          renovatieprioriteiten en de stappen die mogelijk volgen.
        </p>
        <div className="mt-7 lg:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/woningscan" onClick={scanClick("Hero Ontdek de Woningscan")}>
              Ontdek de Woningscan <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-primary/70 text-primary">
            <Link to="/over" onClick={cta("Hero Ontdek DIMAC")}>Ontdek DIMAC</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Gratis online Quickscan · Woningscan ter plaatse {formatEuro(getProduct("woningscan")!.price)} {VAT_LABEL}
        </p>
        <Link
          to="/totaalrenovaties"
          onClick={cta("Hero totaalrenovaties")}
          className="focus-ring mt-5 inline-flex items-center gap-2 text-sm text-primary underline-offset-4 fine:hover:text-accent transition-colors"
        >
          Een volledige renovatie plannen? Ontdek onze totaalrenovaties <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>

    {/* 2 — PROBLEEMHERKENNING */}
    <section className="py-20 md:py-32 bg-background" aria-labelledby="start-title">
      <div className="container-tight">
        <div className="max-w-3xl">
          <h2 id="start-title" className={H2} data-reveal>
            Een woning kopen of renoveren? Start met een Woningscan.
          </h2>
          <div className="mt-6 space-y-4 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="1">
            <p>
              Een woning kan heel wat mogelijkheden bieden. Maar voordat u koopt of verbouwt, wilt u weten waar u aan begint.
            </p>
            <p>
              Welke aandachtspunten zijn zichtbaar? Welke werken hebben prioriteit? En hoe krijgt u meer inzicht in de
              mogelijke renovatiekosten? De juiste informatie helpt u om betere beslissingen te nemen.
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {paths.map((p, i) => (
            <Link
              key={p.situatie}
              to={`/woningscan?situatie=${p.situatie}`}
              onClick={scanClick(`Pad ${p.title}`)}
              data-reveal
              data-reveal-delay={String(i + 1)}
              className="focus-ring group/card flex flex-col border border-border bg-surface p-8 md:p-10 transition-colors fine:hover:border-accent"
            >
              <span className="text-[11px] uppercase tracking-[0.24em] text-accent">{p.eyebrow}</span>
              <h3 className="mt-4 font-display text-2xl md:text-3xl text-primary">{p.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{p.text}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary fine:group-hover/card:text-accent transition-colors">
                Bekijk de Woningscan voor uw situatie
                <ArrowRight className="w-4 h-4 transition-transform motion-safe:fine:group-hover/card:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* 3 — PAKKETTEN */}
    <section className="py-20 md:py-32 bg-surface border-y border-border" aria-labelledby="pakketten-title">
      <div className="container-tight">
        <div className="max-w-3xl">
          <span className="eyebrow mb-5" data-reveal>DIMAC Woningscan</span>
          <h2 id="pakketten-title" className={H2} data-reveal data-reveal-delay="1">
            Vier manieren om uw woning beter te begrijpen.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="2">
            Van een gratis eerste analyse tot een uitgebreide inspectie ter plaatse.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PRODUCTS.map((p, i) => {
            const soon = p.availability === "coming_soon";
            return (
              <article
                key={p.id}
                data-reveal
                data-reveal-delay={String((i % 2) + 1)}
                className="relative flex flex-col bg-background p-7 md:p-8 border border-border transition-colors fine:hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-primary">{p.shortTitle}</h3>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {p.delivery === "online" ? "Online" : "Ter plaatse"}
                  </span>
                </div>
                <p className="mt-3">
                  <span className="font-display text-4xl text-primary tabular-nums">{formatPrice(p)}</span>
                  {p.price > 0 && <span className="ml-2 text-sm text-muted-foreground">{VAT_LABEL}</span>}
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{p.summary}</p>
                {soon || !p.ctaTo ? (
                  <Button type="button" variant="outline" className="mt-6 w-full" disabled aria-disabled="true">
                    Binnenkort beschikbaar
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <Link to={p.ctaTo} onClick={() => track("woningscan_click", { page_type: "home", cta_label: p.cta, item_id: p.id })}>
                      {p.cta} <ArrowRight />
                    </Link>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Optioneel bij Woningscan en Woningscan Plus: drone-dakscreening (+{formatEuro(DRONE_PRICE)} {VAT_LABEL}). Elke Woningscan
          is een zelfstandige dienst, zonder verplichting voor latere werken.
        </p>
        <div className="mt-10 text-center" data-reveal>
          <Button asChild size="lg" variant="outline">
            <Link to="/woningscan#pakketten" onClick={scanClick("Vergelijk de vier mogelijkheden")}>
              Vergelijk de vier mogelijkheden <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>

    {/* 4 — EXPERTISE */}
    <section className="py-20 md:py-32 bg-background" aria-labelledby="expertise-title">
      <div className="container-tight">
        <div className="max-w-3xl">
          <span className="eyebrow mb-5" data-reveal>Onze expertise</span>
          <h2 id="expertise-title" className={H2} data-reveal data-reveal-delay="1">
            Vastgoedontwikkeling vanuit praktijkervaring.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="2">
            DIMAC ontwikkelt eigen vastgoedprojecten, van nieuwbouw tot grondige transformaties. Die ervaring vormt ook
            de basis voor onze Woningscans en totaalrenovaties.
          </p>
        </div>
        <div className="mt-14 grid border-t border-border md:grid-cols-3">
          {expertise.map((e, i) => (
            <div
              key={e.to}
              data-reveal
              data-reveal-delay={String(i + 1)}
              className={"flex flex-col py-10 md:px-8 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 border-border " + (i > 0 ? "md:border-l" : "")}
            >
              <span className="font-display text-xl text-accent tabular-nums">0{i + 1}</span>
              <h3 className="mt-4 font-display text-2xl text-primary">{e.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{e.text}</p>
              <Link
                to={e.to}
                onClick={cta(e.cta)}
                className="focus-ring mt-8 inline-flex items-center gap-2 text-sm text-primary fine:hover:text-accent transition-colors"
              >
                {e.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 5 — FILOSOFIE */}
    <section className="py-24 md:py-40 bg-surface border-y border-border" aria-labelledby="filosofie-title">
      <div className="container-tight grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <h2 id="filosofie-title" className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-tight text-primary" data-reveal>
          Eerst begrijpen.
          <br />
          <span className="text-accent">Dan ontwikkelen.</span>
        </h2>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="1">
          <p>
            Bij DIMAC begint vastgoedontwikkeling niet bij bouwen, maar bij begrijpen wat een pand nodig heeft en welke
            mogelijkheden het biedt.
          </p>
          <p>
            Technische analyse, bouwervaring en een doordachte voorbereiding vormen de basis van onze aanpak. Want de
            juiste keuzes vóór de uitvoering bepalen mee de kwaliteit van het resultaat.
          </p>
        </div>
      </div>
    </section>

    {/* 6 — EIGEN ONTWIKKELING */}
    <section className="py-20 md:py-32 bg-background" aria-labelledby="ontwikkeling-title">
      <div className="container-tight">
        <div className="max-w-3xl">
          <span className="eyebrow mb-5" data-reveal>{developments.length ? "Onze projecten" : "Eigen vastgoedontwikkeling"}</span>
          <h2 id="ontwikkeling-title" className={H2} data-reveal data-reveal-delay="1">
            Van vastgoedpotentieel naar duurzame meerwaarde.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="2">
            {developments.length ? "Ontdek onze projecten en bekijk onze bouwexpertise in de praktijk." : "DIMAC ontwikkelt vastgoed voor eigen rekening. Zo verloopt een ontwikkeling bij ons."}
          </p>
        </div>
        <div className="mt-12">
          {developments.length > 0 ? (
            <DevelopmentGrid items={developments.slice(0, 3)} />
          ) : (
            <ol className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-4">
              {devSteps.map((s, i) => (
                <li key={s.title} className="bg-background p-6 md:p-8" data-reveal data-reveal-delay={String(i + 1)}>
                  <span className="font-display text-3xl text-accent tabular-nums">0{i + 1}</span>
                  <h3 className="mt-4 text-primary font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <Link
          to="/projecten"
          onClick={cta(developments.length ? "Bekijk onze projecten" : "Ontdek onze ontwikkelingsaanpak")}
          className="focus-ring mt-10 inline-flex items-center gap-2 text-sm text-primary fine:hover:text-accent transition-colors"
        >
          {developments.length ? "Bekijk onze projecten" : "Ontdek onze ontwikkelingsaanpak"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>

    {/* 7 — TOTAALRENOVATIES */}
    <section className="py-20 md:py-32 bg-surface border-t border-border" aria-labelledby="renovatie-title">
      <div className="container-tight grid gap-12 lg:grid-cols-2 lg:items-center">
        <div data-reveal>
          <ImagePlaceholder src={renoAsset} label="Lichte, gerenoveerde woonruimte" aspect="portrait" showLabelOverlay={false} />
        </div>
        <div>
          <span className="eyebrow mb-5" data-reveal>Totaalrenovaties</span>
          <h2 id="renovatie-title" className={H2} data-reveal data-reveal-delay="1">
            Totaalrenovaties met een doordachte aanpak.
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="2">
            <p>
              Een woning volledig vernieuwen vraagt meer dan vakmanschap. Het vraagt overzicht, technische kennis en een
              goede afstemming tussen de verschillende werken.
            </p>
            <p>
              DIMAC combineert zijn ervaring in vastgoedontwikkeling met een gestructureerde aanpak van volledige
              renovatieprojecten.
            </p>
          </div>
          <div className="mt-10" data-reveal data-reveal-delay="3">
            <Button asChild size="lg" variant="outline">
              <Link to="/totaalrenovaties" onClick={cta("Bespreek uw renovatieplannen")}>
                Bespreek uw renovatieplannen <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* 8 — SLOTCONVERSIE */}
    <section className="bg-primary text-primary-foreground" aria-labelledby="slot-title">
      <div className="container-tight py-20 md:py-28">
        <h2 id="slot-title" className="font-display text-3xl md:text-5xl leading-tight max-w-3xl" data-reveal>
          De juiste beslissing begint met inzicht.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-primary-foreground/75 leading-relaxed" data-reveal data-reveal-delay="1">
          Of u nu een woning overweegt te kopen, een renovatie wilt voorbereiden of een volledige transformatie plant:
          DIMAC helpt u de mogelijkheden helder te krijgen.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4" data-reveal data-reveal-delay="2">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/woningscan" onClick={scanClick("Slot Ontdek de Woningscan")}>
              Ontdek de Woningscan <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/40 text-primary-foreground">
            <Link to="/totaalrenovaties" onClick={cta("Slot renovatie")}>
              Bespreek uw renovatieplannen <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default Index;
