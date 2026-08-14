import { Section } from "./Section";
import { team } from "@/data/team";

/** Rendert niets zolang er geen echte teamdata is. */
export const TeamSection = () => {
  if (!team.length) return null;

  return (
    <Section eyebrow="Het team" title="De mensen achter uw project.">
      <div className="stagger-list grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3" data-reveal>
        {team.map((m) => (
          <article key={m.name} className="bg-background">
            <img
              src={m.image}
              alt={`${m.name}, ${m.role} bij Dimac`}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover bg-surface-strong"
            />
            <div className="p-6 md:p-8">
              <h3 className="font-display text-xl text-primary leading-snug">{m.name}</h3>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {m.role}
              </span>
              {m.description && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
};
