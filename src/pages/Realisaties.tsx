import { useState } from "react";
import { Section } from "@/components/site/Section";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { CTABlock } from "@/components/site/CTABlock";
import { usePageMeta } from "@/hooks/use-page-meta";
import { cn } from "@/lib/utils";
import bathroom from "@/assets/project-bathroom.jpg";
import kitchen from "@/assets/project-kitchen.jpg";
import roof from "@/assets/project-roof.jpg";
import total from "@/assets/project-total.jpg";
import hero from "@/assets/hero.jpg";
import prep from "@/assets/preparation.jpg";

const CATEGORIES = ["Alle", "Badkamer", "Keuken", "Dak", "Totaalrenovatie", "Nieuwbouw"] as const;

const PROJECTS = [
  { img: bathroom, label: "Badkamerrenovatie met zorg voor afwerking", cat: "Badkamer", place: "Diest" },
  { img: kitchen, label: "Keukenrenovatie waar technieken en maatwerk samenkomen", cat: "Keuken", place: "Scherpenheuvel" },
  { img: roof, label: "Dakwerken met aandacht voor details", cat: "Dak", place: "Halen" },
  { img: total, label: "Totaalrenovatie met één duidelijke planning", cat: "Totaalrenovatie", place: "Tessenderlo" },
  { img: hero, label: "Volledig gerenoveerd woonhuis met open indeling", cat: "Totaalrenovatie", place: "Diest" },
  { img: prep, label: "Voorbereiding technieken en materialen", cat: "Nieuwbouw", place: "Diest" },
];

const Realisaties = () => {
  usePageMeta({
    title: "Realisaties in regio Diest | Dimac",
    description: "Bekijk realisaties van Dimac in Diest en omgeving. Placeholder projecten in afwachting van actuele fotografie.",
  });
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("Alle");
  const filtered = filter === "Alle" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter);

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Realisaties</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Realisaties in regio Diest
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Een greep uit onze projecten. Bekijk hoe wij woningen omvormen tot duurzame en kwalitatieve leefruimtes,
            met oog voor detail en afwerking.
          </p>
        </div>
      </section>

      <Section>
        <div className="flex flex-wrap gap-2 mb-14">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-5 py-2 text-xs uppercase tracking-[0.2em] border transition-colors",
                filter === c
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-primary/70 border-border hover:border-accent hover:text-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {filtered.map((p, i) => (
            <figure key={i} className="fade-up group">
              <ImagePlaceholder src={p.img} label={p.label} aspect={i % 3 === 0 ? "landscape" : "wide"} />
              <figcaption className="mt-5 flex items-start justify-between gap-6">
                <p className="font-display text-lg text-primary leading-snug max-w-md">{p.label}</p>
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground shrink-0 pt-1">
                  {p.cat} · {p.place}
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
