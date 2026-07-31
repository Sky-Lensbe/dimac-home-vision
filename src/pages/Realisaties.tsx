import { useState } from "react";
import { Section } from "@/components/site/Section";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { CTABlock } from "@/components/site/CTABlock";
import { Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema } from "@/lib/site";
import { cn } from "@/lib/utils";
import bathroom from "@/assets/project-bathroom.jpg";
import kitchen from "@/assets/project-kitchen.jpg";
import roof from "@/assets/project-roof.jpg";
import total from "@/assets/project-total.jpg";
import hero from "@/assets/hero.jpg";
import prep from "@/assets/preparation.jpg";

const CATEGORIES = ["Alle", "Badkamer", "Keuken", "Dak", "Totaalrenovatie", "Nieuwbouw"] as const;

const PROJECTS = [
  { img: bathroom, label: "Badkamerrenovatie met zorg voor afwerking", cat: "Badkamer" },
  { img: kitchen, label: "Keukenrenovatie waar technieken en maatwerk samenkomen", cat: "Keuken" },
  { img: roof, label: "Dakwerken met aandacht voor details", cat: "Dak" },
  { img: total, label: "Totaalrenovatie met één duidelijke planning", cat: "Totaalrenovatie" },
  { img: hero, label: "Volledig gerenoveerd woonhuis met open indeling", cat: "Totaalrenovatie" },
  { img: prep, label: "Voorbereiding technieken en materialen", cat: "Nieuwbouw" },
];

const Realisaties = () => {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("Alle");
  const filtered = filter === "Alle" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter);

  return (
    <>
      <PageSEO
        path="/realisaties"
        title="Realisaties in regio Diest | Dimac"
        description="Beelden van uitgevoerde renovatie- en bouwwerken door Dimac: badkamer, keuken, dak, totaalrenovatie en nieuwbouw."
        schemas={[organizationSchema()]}
      />
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Realisaties</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Realisaties in regio Diest
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Beelden van uitgevoerde werken, gegroepeerd per type project. Herkent u uw eigen situatie, dan
            bespreken wij graag hoe wij die zouden aanpakken.
          </p>
        </div>
      </section>

      <Section>
        <div className="stagger-list flex flex-wrap gap-2 mb-14" data-reveal>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "focus-ring px-5 py-2 min-h-[44px] text-xs uppercase tracking-[0.2em] border transition-[background-color,border-color,color,transform] duration-300 ease-out active:scale-[0.98]",
                filter === c
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-primary/70 border-border fine:hover:border-accent fine:hover:text-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="stagger-list grid gap-6 md:gap-8 md:grid-cols-2" data-reveal>
          {filtered.map((p, i) => (
            <figure
              key={i}
              className="group/real"
            >
              <ImagePlaceholder src={p.img} label={p.label} aspect={i % 3 === 0 ? "landscape" : "wide"} showLabelOverlay={false} />
              <figcaption className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/real:-translate-y-1">
                <p className="font-display text-lg text-primary leading-snug max-w-md transition-colors duration-300 fine:lg:group-hover/real:text-accent">{p.label}</p>
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground shrink-0 pt-1">
                  {p.cat}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Herkent u uw project?"
        text="Vertel ons kort wat u wil aanpakken. We bespreken graag hoe wij uw renovatie zouden aanpakken."
        primary={{ label: "Neem contact op", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Realisaties;
