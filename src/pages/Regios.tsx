import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import { activeRegions } from "@/data/regions";
import { services } from "@/data/services";
import { COMPANY, absoluteUrl, breadcrumbSchema, organizationSchema, type Crumb } from "@/lib/site";

const crumbs: Crumb[] = [
  { label: "Home", to: "/" },
  { label: "Werkgebied" },
];

const Regios = () => {
  const highlighted = services.filter((s) =>
    ["totaalrenovatie", "nieuwbouw", "dakwerken", "badkamer-renovatie"].includes(s.slug),
  );

  return (
    <>
      <PageSEO
        path="/regio"
        title="Werkgebied van Dimac | Aannemer in regio Diest"
        description="Dimac werkt in Diest en de omliggende gemeenten aan renovatie, nieuwbouw en technieken. Bekijk het werkgebied en de lokale aanpak."
        schemas={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": absoluteUrl("/regio") + "#webpage",
            url: absoluteUrl("/regio"),
            name: "Werkgebied van Dimac",
            isPartOf: { "@id": COMPANY.id },
            about: { "@id": COMPANY.id },
          },
          breadcrumbSchema(crumbs),
        ]}
      />

      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight max-w-3xl fade-up">
          <Breadcrumbs items={crumbs} className="mb-8" />
          <span className="eyebrow mb-6">Werkgebied</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Waar Dimac werkt
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Dimac werkt bewust binnen een beperkte straal rond Diest. Zo blijven de werven bereikbaar,
            kan een werfleider dezelfde dag langsgaan en kunnen leveringen en vakgebieden vlot op elkaar
            worden afgestemd.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button asChild variant="solid" size="lg">
              <Link to="/contact">
                Vertel ons over uw project <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/woningscan">Plan uw woningscan</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section eyebrow="Regio's" title="Pagina's per gemeente">
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
          {activeRegions.map((r) => (
            <Link
              key={r.slug}
              to={`/regio/${r.slug}`}
              className="focus-ring-inset card-flush group/card bg-background p-8 md:p-10 flex flex-col"
            >
              <h2 className="font-display text-2xl md:text-3xl mb-4 text-primary leading-tight">
                {r.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed flex-1">{r.hero.intro}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent">
                Bekijk onze aanpak in {r.name}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-muted-foreground leading-relaxed" data-reveal>
          Wij werken daarnaast in Scherpenheuvel-Zichem, Halen, Tessenderlo, Ham en Bekkevoort. Voor die
          gemeenten bestaat er nog geen afzonderlijke pagina. Vraag gerust of uw adres binnen het werkgebied valt.
        </p>
      </Section>

      <Section eyebrow="Diensten" title="Wat wij binnen dat werkgebied uitvoeren" bg="surface">
        <div className="stagger-list grid gap-6 md:grid-cols-2" data-reveal>
          {highlighted.map((s) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="focus-ring card-interactive group/card border border-border bg-background p-8 flex flex-col"
            >
              <h3 className="font-display text-xl text-primary mb-3">{s.overviewTitle}</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
                Meer over {s.navLabel.toLowerCase()}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-muted-foreground" data-reveal>
          <Link to="/diensten" className="link-underline text-accent focus-ring">
            Bekijk alle diensten van Dimac
          </Link>
        </p>
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Valt uw woning binnen ons werkgebied?"
        text="Laat weten waar uw woning staat en wat u wil aanpakken. Wij bekijken of en hoe wij uw project kunnen uitvoeren."
        primary={{ label: "Neem contact op", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Regios;
