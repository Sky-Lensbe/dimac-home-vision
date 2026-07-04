import { Section } from "@/components/site/Section";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { CTABlock } from "@/components/site/CTABlock";
import { usePageMeta } from "@/hooks/use-page-meta";

const Werkwijze = () => {
  usePageMeta({
    title: "Werkwijze | Dimac Diest",
    description: "Onze werkwijze in 5 stappen. Van kennismaking tot oplevering, met één aanspreekpunt.",
  });
  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Werkwijze</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Zo verloopt een traject bij Dimac
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Een duidelijke structuur van eerste kennismaking tot oplevering, met één aanspreekpunt gedurende het volledige traject.
          </p>
        </div>
      </section>

      <Section>
        <WorkflowSteps
          steps={[
            { title: "Kennismaking of woningscan", text: "We bekijken uw woning en situatie, en luisteren naar uw plannen." },
            { title: "Analyse en advies", text: "U krijgt duidelijke inzichten en concrete mogelijkheden." },
            { title: "Offerte", text: "Een transparante prijs en duidelijke planning." },
            { title: "Planning & voorbereiding", text: "Materialen, timing en trades worden op elkaar afgestemd." },
            { title: "Uitvoering & oplevering", text: "Wij realiseren en werken correct af tot bij de oplevering." },
          ]}
        />
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Wilt u weten hoe uw traject eruitziet?"
        text="Vertel ons kort wat u wil aanpakken. Dan bekijken we samen welke stappen logisch zijn."
        primary={{ label: "Neem contact op", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Werkwijze;
