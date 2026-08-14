import type { Project } from "@/data/projects";

interface Props {
  project: Project;
}

/** De vier vaste inhoudsblokken van een case. */
export const CaseStudy = ({ project: p }: Props) => {
  const blocks = [
    { title: "Situatie", text: p.situation },
    { title: "Uitdaging", text: p.challenge },
    { title: "Aanpak", text: p.approach },
    { title: "Resultaat", text: p.result },
  ];

  return (
    <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
      {blocks.map((b) => (
        <section key={b.title} className="bg-background p-8 md:p-10">
          <span className="eyebrow mb-4">{b.title}</span>
          <p className="text-muted-foreground leading-relaxed">{b.text}</p>
        </section>
      ))}
    </div>
  );
};
