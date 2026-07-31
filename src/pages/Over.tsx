import { Link } from "react-router-dom";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { BulletList } from "@/components/site/BulletList";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema } from "@/lib/site";
import prep from "@/assets/preparation.jpg";

const Over = () => (
  <>
    <PageSEO
      path="/over"
      title="Over Dimac | Aannemer in regio Diest"
      description="Dimac is een lokale bouwpartner in regio Diest voor renovatie en nieuwbouw. Technische voorbereiding, coördinatie van de vakgebieden en opvolging op de werf."
      schemas={[organizationSchema()]}
    />

    <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
      <div className="container-tight max-w-3xl fade-up">
        <span className="eyebrow mb-6">Over Dimac</span>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
          Uw aannemer in regio Diest
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Dimac is een lokale bouwpartner voor renovatie en nieuwbouw. Wij bereiden de werken technisch
          voor, stemmen de vakgebieden op elkaar af en blijven aanspreekbaar tot de oplevering.
        </p>
      </div>
    </section>

    <Section eyebrow="Positie" title="Eén aanspreekpunt van eerste analyse tot oplevering">
      <div className="grid gap-14 lg:grid-cols-2 max-w-5xl">
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          <p>
            U heeft één aanspreekpunt voor uw volledige project. Wij coördineren de verschillende vakgebieden
            en zorgen dat de raakpunten tussen ruwbouw, technieken en afwerking vooraf zijn opgelost.
          </p>
          <p>
            Zo blijft de rode draad bewaard van voorbereiding tot afwerking, met minder risico op herwerk
            en betere afstemming tussen de mensen op de werf.
          </p>
          <p>
            <Link to="/werkwijze" className="link-underline text-accent focus-ring">
              Lees hoe een traject bij Dimac verloopt
            </Link>
          </p>
        </div>
        <div>
          <ImagePlaceholder label="Voorbereiding van technieken en materialen op de werf" src={prep} aspect="landscape" />
        </div>
      </div>
    </Section>

    <Section eyebrow="Wat ons drijft" title="Vakmanschap, voorbereiding en heldere afspraken" bg="surface">
      <BulletList
        columns={2}
        items={[
          "Persoonlijke aanpak met korte communicatielijnen",
          "Technisch correcte voorbereiding vóór uitvoering",
          "Duidelijke offertes die de volledige scope beschrijven",
          "Coördinatie van alle vakgebieden binnen één traject",
          "Aandacht voor detail en afwerking",
          "Lokale verankering in regio Diest",
        ]}
      />
    </Section>

    <Section eyebrow="Organisatie" title="Hoe Dimac is opgebouwd">
      <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
        <p>
          Dimac werkt met een vaste equipe en met vaste partners per vakgebied. De projectleiding, de
          werfopvolging en het contact met u blijven altijd bij Dimac zelf.
        </p>
        <p>
          Wij werken bewust binnen een beperkte straal rond Diest, zodat een werfleider dezelfde dag kan
          langsgaan wanneer een beslissing of een controle nodig is.{" "}
          <Link to="/regio" className="link-underline text-accent focus-ring">
            Bekijk ons werkgebied
          </Link>
          .
        </p>
      </div>
    </Section>

    <CTABlock
      eyebrow="Volgende stap"
      title="Kennismaken?"
      text="Vertel ons kort wat u wil aanpakken. Dan bekijken we samen welke stappen logisch zijn."
      primary={{ label: "Neem contact op", to: "/contact" }}
      secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
    />
  </>
);

export default Over;
