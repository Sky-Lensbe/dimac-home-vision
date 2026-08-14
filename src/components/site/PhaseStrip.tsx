import { cn } from "@/lib/utils";

interface Props {
  phases: { title: string; text?: string }[];
  className?: string;
}

/**
 * Rustige, architecturale fasestrip. Geen iconen, geen diagram: enkel
 * typografie, hairlines en een doorlopende accentlijn.
 */
export const PhaseStrip = ({ phases, className }: Props) => (
  <ol
    className={cn(
      "stagger-list relative grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-5",
      className
    )}
    data-reveal
  >
    {phases.map((p, i) => (
      <li key={p.title} className="bg-background p-6 md:p-7">
        <span className="font-display text-accent text-sm">{String(i + 1).padStart(2, "0")}</span>
        <h3 className="font-display text-lg text-primary leading-snug mt-3">{p.title}</h3>
        {p.text && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.text}</p>}
      </li>
    ))}
  </ol>
);
