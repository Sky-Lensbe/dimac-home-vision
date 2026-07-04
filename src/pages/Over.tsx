import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { BulletList } from "@/components/site/BulletList";
import { usePageMeta } from "@/hooks/use-page-meta";
import total from "@/assets/project-total.jpg";
import prep from "@/assets/preparation.jpg";

const Over = () => {
  usePageMeta({
    title: "Over Dimac | Aannemer in regio Diest",
    description: "Dimac is een lokale bouwpartner met meer dan 20 jaar ervaring. Vakmanschap, persoonlijke aanpak en duidelijke communicatie.",
  });
  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="fade-up">
            <span className="eyebrow mb-6">Over Dimac</span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
              Uw aannemer in regio Diest
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Dimac is een lokale bouwpartner met meer dan 20 jaar ervaring in renovatie en nieuwbouw.
              Wij combineren vakmanschap met een persoonlijke aanpak en duidelijke communicatie.
            </p>
          </div>
          <div className="fade-up delay-2">
            <ImagePlaceholder label="Team Dimac" src={total} aspect="portrait" />
          </div>
        </div>
      </section>

      <Section eyebrow="Positie" title="Eén aanspreekpunt van eerste analyse tot oplevering">
        <div className="grid gap-14 lg:grid-cols-2 max-w-5xl">
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>
              U heeft één aanspreekpunt voor uw volledige project. Wij coördineren de verschillende vakgebieden
              en zorgen dat alles samenkomt.
            </p>
            <p>
              Zo blijft de rode draad bewaard van voorbereiding tot afwerking, met minder risico op fouten en betere afstemming.
            </p>
          </div>
          <div>
            <ImagePlaceholder label="Detail voorbereiding" src={prep} aspect="landscape" />
          </div>
        </div>
      </Section>

      <Section eyebrow="Wat ons drijft" title="Vakmanschap, overzicht en duidelijkheid" bg="surface">
        <BulletList
          columns={2}
          items={[
            "Persoonlijke aanpak met korte communicatielijnen",
            "Technisch correcte voorbereiding vóór uitvoering",
            "Duidelijke offertes en planning",
            "Coördinatie van alle trades binnen één traject",
            "Aandacht voor detail en afwerking",
            "Lokale verankering in regio Diest",
          ]}
        />
      </Section>

      <Section eyebrow="Team" title="Mensen achter Dimac">
        <div className="grid gap-6 md:grid-cols-3">
          {["Zaakvoerder & projectleider", "Werfleiding & coördinatie", "Vaste equipe & partners"].map((role) => (
            <div key={role} className="border border-border p-8 bg-background">
              <ImagePlaceholder label={`Portret ${role.toLowerCase()}`} aspect="portrait" />
              <p className="mt-5 font-display text-lg text-primary">{role}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">Placeholder</p>
            </div>
          ))}
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
};

export default Over;
