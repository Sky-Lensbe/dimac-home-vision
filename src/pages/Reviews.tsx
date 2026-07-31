import { Link } from "react-router-dom";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema } from "@/lib/site";

/**
 * Er zijn nog geen geverifieerde klantbeoordelingen beschikbaar.
 * Daarom worden hier bewust geen reviews, sterren of scores getoond en
 * wordt er geen review- of ratingschema toegevoegd.
 */
const WORKING_AGREEMENTS = [
  {
    title: "Communicatie tijdens de werf",
    text: "U heeft één contactpersoon die de planning kent. Beslismomenten worden vooraf aangekondigd, zodat u niet ter plekke moet kiezen.",
  },
  {
    title: "Afspraken en offerte",
    text: "De offerte beschrijft de volledige scope, inclusief afbraak, herstelwerk en afwerking rond de raakpunten. Wat niet inbegrepen is, staat er expliciet in.",
  },
  {
    title: "Opvolging van de planning",
    text: "De vakgebieden worden op elkaar afgestemd voordat de werf start. Wanneer een fase uitloopt, wordt de rest van de planning bijgestuurd.",
  },
  {
    title: "Technische uitvoering",
    text: "Elektriciteit, sanitair en verwarming worden samen voorbereid, zodat leidingtracés en doorvoeren één keer worden aangelegd.",
  },
  {
    title: "Afwerking en oplevering",
    text: "De laatste detailpunten worden samen overlopen. Keuringen en attesten worden mee opgevolgd.",
  },
];

const Reviews = () => (
  <>
    <PageSEO
      path="/reviews"
      title="Werken met Dimac: afspraken en opvolging | Dimac Diest"
      description="Hoe Dimac werkt op de werf: communicatie, afspraken, planning, technische uitvoering en afwerking. Beoordelingen van klanten volgen zodra ze beschikbaar zijn."
      schemas={[organizationSchema()]}
    />

    <section className="pt-32 md:pt-40 pb-16 bg-surface">
      <div className="container-tight fade-up max-w-3xl">
        <span className="eyebrow mb-6">Samenwerken</span>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
          Wat u van Dimac mag verwachten
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Op deze pagina staan geen klantbeoordelingen. Wij tonen pas beoordelingen wanneer die van
          echte klanten komen en verifieerbaar zijn. Tot dan leest u hier welke afspraken wij maken
          en hoe een werf bij Dimac verloopt.
        </p>
      </div>
    </section>

    <Section eyebrow="Afspraken" title="Vijf afspraken die op elke werf gelden">
      <div className="stagger-list grid gap-6 md:grid-cols-2" data-reveal>
        {WORKING_AGREEMENTS.map((item) => (
          <div key={item.title} className="card-interactive border border-border p-8 md:p-10 bg-background">
            <h2 className="font-display text-xl md:text-2xl leading-snug text-primary">{item.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-muted-foreground leading-relaxed" data-reveal>
        Meer over de opeenvolgende fases leest u op de{" "}
        <Link to="/werkwijze" className="link-underline text-accent focus-ring">
          werkwijze van Dimac
        </Link>
        .
      </p>
    </Section>

    <CTABlock
      eyebrow="Volgende stap"
      title="Werk aan uw eigen renovatie?"
      text="Vraag een offerte aan of plan een woningscan om eerst inzicht te krijgen."
      primary={{ label: "Vraag een offerte aan", to: "/contact" }}
      secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
    />
  </>
);

export default Reviews;
