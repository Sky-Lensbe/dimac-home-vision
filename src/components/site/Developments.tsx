import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { Development } from "@/data/developments";

export const DevelopmentGrid = ({ items }: { items: Development[] }) => (
  <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
    {items.map((d, i) => (
      <Link
        key={d.slug}
        to={`/projecten/${d.slug}`}
        className="focus-ring group/card block"
        data-reveal
        data-reveal-delay={String((i % 3) + 1)}
      >
        <ImagePlaceholder src={d.cover} label={d.coverAlt} aspect="portrait" showLabelOverlay={false} />
        <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>{d.type}</span>
          <span aria-hidden="true">·</span>
          <span>{d.location}</span>
          {d.status && <span className="ml-auto text-accent">{d.status}</span>}
        </div>
        <h3 className="mt-3 font-display text-2xl text-primary fine:group-hover/card:text-accent transition-colors">
          {d.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.summary}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
          Bekijk project <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    ))}
  </div>
);

const steps = [
  { title: "Potentieel herkennen", text: "Wij zoeken panden en percelen waar meer mogelijk is dan op het eerste gezicht zichtbaar." },
  { title: "Aankopen en analyseren", text: "Elke aankoop vertrekt vanuit een grondige technische en ruimtelijke analyse." },
  { title: "Mogelijkheden onderzoeken", text: "Renoveren, transformeren of nieuw bouwen: we kiezen wat het pand en de plek toelaten." },
  { title: "Realiseren", text: "Nieuwbouw of grondige renovatie, met aandacht voor volgorde, techniek en afwerking." },
  { title: "Waarde creëren", text: "Kwaliteit en levensduur gaan voor snelle winst. Dat bepaalt de waarde van morgen." },
];

/** Uitleg over de ontwikkelingsaanpak, zolang er geen bevestigde projecten getoond worden. */
export const DevelopmentApproach = ({ compact = false }: { compact?: boolean }) => (
  <ol className={compact ? "grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-5" : "grid gap-px bg-border border border-border md:grid-cols-5"}>
    {steps.map((s, i) => (
      <li key={s.title} className="bg-background p-6 md:p-7" data-reveal data-reveal-delay={String((i % 4) + 1)}>
        <span className="font-display text-3xl text-accent tabular-nums">0{i + 1}</span>
        <h3 className="mt-4 text-primary font-medium">{s.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
      </li>
    ))}
  </ol>
);
