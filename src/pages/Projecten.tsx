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
      title="Onze projecten | Diest, Herk-de-Stad, Paal, Schaffen en Schulen | Dimac"
      description="Bekijk de projecten van Dimac in Diest, Herk-de-Stad, Paal, Schaffen en Schulen."
      schemas={[organizationSchema(), breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Onze projecten" }])]}
    />
    <PageHero
      crumbs={[{ label: "Home", to: "/" }, { label: "Onze projecten" }]}
      eyebrow="Onze projecten"
      title="Bouwexpertise in de praktijk."
      intro={
        <p>
          Ontdek onze projecten in Diest, Herk-de-Stad, Paal, Schaffen en Schulen.
        </p>
      }
    />

    <Section bg="surface" eyebrow="Projecten" title={developments.length ? "Onze projecten" : "Projecten volgen binnenkort"}>
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
