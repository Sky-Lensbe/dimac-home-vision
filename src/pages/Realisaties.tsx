import { useState } from "react";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { ProjectCard } from "@/components/site/ProjectCard";
import { PageSEO } from "@/components/seo/PageSEO";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, organizationSchema } from "@/lib/site";
import { cn } from "@/lib/utils";
import { projectTypes, visibleProjects } from "@/data/projects";

const crumbs = [{ label: "Home", to: "/" }, { label: "Realisaties" }];
const filters = ["Alle", ...projectTypes] as const;

const Realisaties = () => {
  const [filter, setFilter] = useState<string>("Alle");
  const filtered =
    filter === "Alle" ? visibleProjects : visibleProjects.filter((p) => p.projectType === filter);

  return (
    <>
      <PageSEO
        path="/realisaties"
        title="Realisaties in regio Diest | Dimac"
        description="Renovatieprojecten van Dimac in regio Diest: situatie, uitdaging, aanpak en resultaat van uitgevoerde totaalrenovaties, badkamers, keukens en dakwerken."
        schemas={[organizationSchema(), breadcrumbSchema(crumbs)]}
      />

      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <Breadcrumbs items={crumbs} />
          <span className="eyebrow mb-6 mt-6">Realisaties</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Realisaties in regio Diest
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Projecten waarin verschillende werken samenkomen. Per realisatie lees je wat de situatie
            was, waar de complexiteit zat en hoe de uitvoering werd aangepakt.
          </p>
        </div>
      </section>

      <Section>
        <div className="stagger-list flex flex-wrap gap-2 mb-14" data-reveal>
          {filters.map((c) => (
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
        <div className="stagger-list grid gap-10 md:gap-12 md:grid-cols-2" data-reveal>
          {filtered.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Herken je je eigen project?"
        text="Vertel ons kort wat je wilt aanpakken. We bekijken samen hoe de werken op elkaar kunnen aansluiten."
        primary={{ label: "Bespreek je project", to: "/contact" }}
        secondary={{ label: "Start met een woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Realisaties;
