import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { PageHero } from "@/components/site/PageHero";
import { DevelopmentApproach, DevelopmentGrid } from "@/components/site/Developments";
import { PageSEO } from "@/components/seo/PageSEO";
import { breadcrumbSchema, organizationSchema } from "@/lib/site";
import { developments } from "@/data/developments";

const Projecten = () => (
  <>
    <PageSEO
      path="/projecten"
      title="Onze projecten | Vastgoedontwikkeling in regio Diest | Dimac"
      description="Dimac ontwikkelt eigen vastgoed: van nieuwbouw tot de volledige transformatie van bestaande woningen. Ontdek onze aanpak en projecten."
      schemas={[organizationSchema(), breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Onze projecten" }])]}
    />
    <PageHero
      crumbs={[{ label: "Home", to: "/" }, { label: "Onze projecten" }]}
      eyebrow="Vastgoedontwikkeling"
      title="Wij zien mogelijkheden waar anderen alleen een gebouw zien."
      intro={
        <p>
          Dimac investeert in eigen vastgoed. We kopen panden met potentieel, ontwikkelen eigen nieuwbouw en
          transformeren bestaande woningen via grondige renovaties. Die praktijk is de bron van onze bouwexpertise.
        </p>
      }
    />

    <Section eyebrow="Onze ontwikkelingsaanpak" title="Van potentieel tot blijvende waarde">
      <DevelopmentApproach />
    </Section>

    <Section bg="surface" eyebrow="Projecten" title={developments.length ? "Eigen ontwikkelingen" : "Projecten volgen binnenkort"}>
      {developments.length ? (
        <DevelopmentGrid items={developments} />
      ) : (
        <div className="max-w-2xl" data-reveal>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We tonen hier enkel projecten die effectief gerealiseerd of in ontwikkeling zijn, met de oorspronkelijke
            situatie, onze visie, de ingrepen en het resultaat. Deze pagina wordt binnenkort aangevuld.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/woningscan">
                Ontdek de Woningscan <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/totaalrenovaties">Ontdek totaalrenovaties</Link>
            </Button>
          </div>
        </div>
      )}
    </Section>
  </>
);

export default Projecten;
