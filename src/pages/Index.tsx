import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, KeyRound, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { DevelopmentGrid, DevelopmentApproach } from "@/components/site/Developments";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema, websiteSchema } from "@/lib/site";
import { developments } from "@/data/developments";
import { formatEuro } from "@/data/woningscan";
import { track } from "@/lib/analytics";
import heroAsset from "@/assets/hero-dimac.jpg.asset.json";
import renoAsset from "@/assets/total-realisation.jpg.asset.json";

const expertise = [
  {
    eyebrow: "Vastgoedontwikkeling",
    title: "Wij zien mogelijkheden waar anderen alleen een gebouw zien.",
    text: "Van eigen nieuwbouwprojecten tot de volledige transformatie van bestaande panden. Dimac ontwikkelt vastgoed met aandacht voor potentieel, kwaliteit en toekomstwaarde.",
    cta: "Ontdek onze projecten",
    to: "/projecten",
  },
  {
    eyebrow: "Totaalrenovaties",
    title: "Een volledige renovatie begint met een doordacht plan.",
    text: "Wanneer verschillende bouwdisciplines samenkomen, maakt een goede voorbereiding het verschil. Dimac combineert praktijkervaring met een geïntegreerde renovatieaanpak.",
    cta: "Ontdek totaalrenovaties",
    to: "/totaalrenovaties",
  },
  {
    eyebrow: "Woningscans",
    title: "Weet waar u aan begint.",
    text: "Een woning kopen of renoveren? Ontdek de aandachtspunten, renovatieprioriteiten en mogelijke kosten voordat u belangrijke beslissingen neemt.",
    cta: "Ontdek de Woningscan",
    to: "/woningscan",
  },
];

const cta = (label: string) => () => track("cta_click", { page_type: "home", cta_label: label });

const Index = () => {
  return (
    <>
      <PageSEO
        path="/"
        title="Dimac | Vastgoedontwikkeling, totaalrenovaties en Woningscans in regio Diest"
        description="Dimac ontwikkelt eigen vastgoed in regio Diest en deelt die bouwexpertise via doordachte totaalrenovaties en deskundige Woningscans voor kopers en eigenaars."
        schemas={[organizationSchema(), websiteSchema()]}
      />

      {/* HERO — één h1; foto als achtergrond onder lg, aparte kolom vanaf lg */}
      <section className="relative pt-20 lg:pt-32 pb-0 lg:pb-24 bg-background overflow-hidden">
        <div className="relative lg:container-wide lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:items-center">
          <div className="absolute inset-0 lg:relative lg:inset-auto lg:order-2">
            <img
              src={heroAsset.url}
              alt="Hedendaagse woning, ontwikkeld met oog voor architectuur en materiaal"
              className="absolute inset-0 h-full w-full object-cover object-[60%_35%] lg:relative lg:aspect-[4/5] lg:h-auto"
              fetchPriority="high"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/55 to-primary/10 lg:hidden"
            />
          </div>

          <div className="relative container-wide lg:px-0 pt-56 sm:pt-72 pb-10 lg:p-0 lg:order-1 fade-up">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-primary-foreground/85 lg:text-accent mb-6 lg:mb-8">
              <span className="h-px w-8 bg-accent" />
              Vastgoedontwikkeling & bouwexpertise
            </span>
            <h1 className="font-display text-[2.3rem] sm:text-5xl lg:text-[4rem] xl:text-[4.6rem] leading-[1.03] tracking-tight text-primary-foreground lg:text-primary max-w-[15ch] text-balance">
              Vastgoed met potentieel. Ontwikkeld met inzicht.
            </h1>
            <p className="mt-6 lg:mt-8 text-base md:text-lg lg:text-xl text-primary-foreground/85 lg:text-muted-foreground max-w-xl leading-relaxed">
              Bij Dimac kijken we verder dan de bestaande staat van een woning. We herkennen mogelijkheden,
              ontwikkelen eigen vastgoedprojecten en stellen onze bouwexpertise ook ter beschikking van wie een
              woning wil kopen of renoveren.
            </p>
            <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button asChild size="lg">
                <Link to="/projecten" onClick={cta("Ontdek onze projecten")}>
                  Ontdek onze projecten <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/60 text-primary-foreground bg-primary-foreground/10 lg:bg-transparent lg:border-primary/80 lg:text-primary"
              >
                <Link to="/woningscan" onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Ontdek de Woningscan" })}>
                  Ontdek de Woningscan
                </Link>
              </Button>
            </div>
            <Link
              to="/totaalrenovaties"
              onClick={cta("Hero totaalrenovaties")}
              className="focus-ring mt-6 inline-flex items-center gap-2 text-sm text-primary-foreground/85 lg:text-muted-foreground fine:hover:text-accent transition-colors"
            >
              Een volledige renovatie plannen? Bekijk onze totaalrenovaties <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <Section eyebrow="Onze expertise" title="Eén bron van kennis. Drie manieren om ze in te zetten.">
        <div className="grid border-t border-border md:grid-cols-3">
          {expertise.map((e, i) => (
            <Link
              key={e.to}
              to={e.to}
              onClick={cta(e.cta)}
              data-reveal
              data-reveal-delay={String(i + 1)}
              className={
                "focus-ring group/card flex flex-col py-10 md:px-8 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 border-border " +
                (i > 0 ? "md:border-l" : "")
              }
            >
              <span className="text-[11px] uppercase tracking-[0.24em] text-accent">
                0{i + 1} — {e.eyebrow}
              </span>
              <h3 className="mt-6 font-display text-2xl md:text-[1.7rem] leading-snug text-primary">{e.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed flex-1">{e.text}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-primary fine:group-hover/card:text-accent transition-colors">
                {e.cta}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 motion-safe:fine:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* FILOSOFIE */}
      <section className="py-24 md:py-40 bg-surface border-y border-border">
        <div className="container-tight grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-tight text-primary" data-reveal>
            Eerst begrijpen.
            <br />
            <span className="text-accent">Dan ontwikkelen.</span>
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="1">
            <p>
              Bij Dimac begint vastgoedontwikkeling niet bij bouwen, maar bij begrijpen wat een pand nodig heeft en
              welke mogelijkheden het biedt.
            </p>
            <p>
              Technische analyse, bouwervaring en een doordachte voorbereiding vormen de basis van iedere beslissing.
              De Woningscan is daarvan een logisch verlengstuk: dezelfde blik, nu voor uw woning.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECTEN */}
      <Section eyebrow="Onze projecten" title="Eigen vastgoedontwikkeling als fundament">
        {developments.length > 0 ? (
          <DevelopmentGrid items={developments.slice(0, 3)} />
        ) : (
          <DevelopmentApproach compact />
        )}
        <div className="mt-12" data-reveal>
          <Button asChild variant="outline">
            <Link to="/projecten" onClick={cta("Projecten sectie")}>
              Ontdek onze projecten <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      {/* WONINGSCAN */}
      <section className="py-24 md:py-36 bg-primary text-primary-foreground">
        <div className="container-tight">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-6" data-reveal>
              <span className="h-px w-8 bg-accent" /> Dimac Woningscan
            </span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.08]" data-reveal data-reveal-delay="1">
              Professioneel inzicht, vóór u beslist.
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/75 leading-relaxed" data-reveal data-reveal-delay="2">
              Drie heldere pakketten, vanaf {formatEuro(299)} incl. btw. Bruikbaar, ook als u later met een andere
              partij werkt.
            </p>
          </div>
          <div className="mt-14 grid gap-px bg-primary-foreground/15 md:grid-cols-2">
            {[
              {
                icon: KeyRound,
                title: "Ik wil een woning kopen.",
                text: "Wat is de technische staat? Welke renovaties zijn mogelijk nodig? Welke extra investering moet ik voorzien?",
              },
              {
                icon: Home,
                title: "Ik wil mijn woning renoveren.",
                text: "Welke werken hebben prioriteit? Wat is de juiste volgorde? Hoe bereid ik mijn renovatie voor?",
              },
            ].map((g, i) => (
              <div key={g.title} className="bg-primary p-8 md:p-10" data-reveal data-reveal-delay={String(i + 1)}>
                <g.icon className="w-6 h-6 text-accent mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-2xl">{g.title}</h3>
                <p className="mt-4 text-primary-foreground/70 leading-relaxed">{g.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12" data-reveal>
            <Button asChild size="lg">
              <Link to="/woningscan" onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Bekijk de pakketten" })}>
                Bekijk de pakketten <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TOTAALRENOVATIES */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <ImagePlaceholder src={renoAsset.url} label="Totaalrenovatie van een bestaande woning" aspect="portrait" showLabelOverlay={false} />
          </div>
          <div>
            <span className="eyebrow mb-5" data-reveal>Totaalrenovaties</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.06] tracking-tight" data-reveal data-reveal-delay="1">
              Geen losse werken. Eén samenhangend renovatieplan.
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed" data-reveal data-reveal-delay="2">
              <p>
                Bij een volledige renovatie bepalen de volgorde en afstemming van de werken het resultaat. Technieken,
                schil en afwerking beïnvloeden elkaar.
              </p>
              <p>
                Dimac benadert uw renovatie zoals een eigen ontwikkeling: eerst analyseren en plannen, dan uitvoeren
                als één geheel.
              </p>
            </div>
            <div className="mt-10" data-reveal data-reveal-delay="3">
              <Button asChild variant="outline" size="lg">
                <Link to="/totaalrenovaties" onClick={cta("Ontdek totaalrenovaties")}>
                  Ontdek totaalrenovaties <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* SLOTCONVERSIE */}
      <section className="bg-surface border-t border-border">
        <div className="container-tight py-20 md:py-28">
          <h2 className="font-display text-3xl md:text-5xl leading-tight max-w-3xl" data-reveal>
            Waar staat u vandaag?
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="bg-background border border-border p-8 md:p-10 flex flex-col" data-reveal data-reveal-delay="1">
              <span className="text-[11px] uppercase tracking-[0.24em] text-accent">Inzicht in een woning</span>
              <p className="mt-4 font-display text-2xl leading-snug flex-1">
                U wilt weten hoe een woning ervoor staat en wat ze nodig heeft.
              </p>
              <Button asChild size="lg" className="mt-8 w-full sm:w-auto sm:self-start whitespace-normal text-center h-auto min-h-14 py-4">
                <Link to="/woningscan" onClick={() => track("woningscan_click", { page_type: "home", cta_label: "Slot Woningscan" })}>
                  Ontdek de Woningscan <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="bg-background border border-border p-8 md:p-10 flex flex-col" data-reveal data-reveal-delay="2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-accent">Een volledige renovatie</span>
              <p className="mt-4 font-display text-2xl leading-snug flex-1">
                U plant een grondige renovatie en zoekt een doordachte aanpak.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-8 w-full sm:w-auto sm:self-start whitespace-normal text-center h-auto min-h-14 py-4">
                <Link to="/totaalrenovaties#intake" onClick={cta("Slot renovatie")}>
                  Bespreek uw renovatieplannen <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
