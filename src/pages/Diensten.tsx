import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { CTABlock } from "@/components/site/CTABlock";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema, breadcrumbSchema } from "@/lib/site";
import { services } from "@/data/services";

const Diensten = () => {
  return (
    <>
      <PageSEO
        path="/diensten"
        title="Aannemer Diest | Renovatie en bouw van A tot Z | Dimac"
        description="Dimac is uw aannemer in regio Diest voor renovatie, technieken en afwerking. Eén aanspreekpunt voor uw volledige project."
        schemas={[
          organizationSchema(),
          breadcrumbSchema([
            { label: "Home", to: "/" },
            { label: "Diensten" },
          ]),
        ]}
      />
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Diensten</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Renovatie en bouw in regio Diest
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Van technieken tot afwerking. Dimac begeleidt uw project van A tot Z met één aanspreekpunt en duidelijke opvolging.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button asChild variant="solid" size="lg">
              <Link to="/contact">Vraag een offerte aan <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/woningscan">Plan uw woningscan</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section eyebrow="Aanpak" title="Alles onder één dak">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          <p>
            Of het nu gaat om een volledige renovatie, een nieuwe badkamer of een uitbreiding van uw woning,
            Dimac zorgt voor een doordachte aanpak en een kwalitatieve uitvoering.
          </p>
          <p>
            Wij combineren verschillende vakgebieden in één traject, zodat u niet hoeft te werken met meerdere aannemers.
          </p>
        </div>
      </Section>

      <CTABlock
        eyebrow="Woningscan"
        title="Twijfelt u over de juiste aanpak?"
        text="Weet u nog niet exact wat er moet gebeuren of hoe u uw renovatie best aanpakt? Start dan met een woningscan. Zo krijgt u eerst inzicht in uw woning en de beste aanpak, vóór u beslissingen neemt."
        primary={{ label: "Ontdek de woningscan", to: "/woningscan" }}
      />

      <Section eyebrow="Alle diensten" title="Van ruwbouw tot afwerking">
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
          {services.map((s, i) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="focus-ring-inset card-flush group/card bg-background p-8 md:p-10 flex flex-col"
            >
              <span className="font-display text-accent text-sm inline-block transition-transform duration-300 ease-out origin-left motion-safe:fine:lg:group-hover/card:scale-110">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl md:text-3xl mt-4 mb-4 text-primary leading-tight">
                {s.overviewTitle}
              </h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent">
                Meer over {s.navLabel.toLowerCase()} <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Totaalaanpak" title="Eén aanpak voor elk project" bg="surface">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          <p>
            Wat deze diensten verbindt, is de manier waarop Dimac werkt.
          </p>
          <p>
            In plaats van losse werken uit te voeren, bekijken wij uw project als één geheel.
            Zo zorgen we voor een efficiënte uitvoering, duidelijke communicatie en een kwalitatief eindresultaat.
          </p>
        </div>
      </Section>

      <Section eyebrow="Werkwijze" title="Zo verloopt een traject bij Dimac">
        <WorkflowSteps
          steps={[
            { title: "Kennismaking of analyse", text: "We bekijken uw situatie en noden." },
            { title: "Advies en offerte", text: "U krijgt een duidelijk voorstel en plan van aanpak." },
            { title: "Uitvoering", text: "Wij coördineren en realiseren de werken." },
            { title: "Oplevering", text: "Alles wordt correct afgewerkt en opgeleverd." },
          ]}
        />
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Niet zeker waar te beginnen?"
        text="Laat u eerst begeleiden met een woningscan en krijg inzicht in de juiste aanpak voor uw project."
        primary={{ label: "Plan uw woningscan", to: "/woningscan" }}
        secondary={{ label: "Vraag een offerte aan", to: "/contact" }}
      />
    </>
  );
};

export default Diensten;
