import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { track } from "@/lib/analytics";
import type { Project } from "@/data/projects";

interface Props {
  project: Project;
  pageType?: string;
}

export const ProjectCard = ({ project: p, pageType = "realisaties" }: Props) => (
  <article className="group/proj flex flex-col">
    <Link
      to={`/realisaties/${p.slug}`}
      className="focus-ring block"
      onClick={() => track("view_project", { page_type: pageType, item_id: p.slug, cta_label: p.title })}
      aria-label={`Bekijk het project: ${p.title}`}
    >
      <ImagePlaceholder
        src={p.images[0]?.src}
        label={p.images[0]?.alt ?? p.title}
        aspect="landscape"
        showLabelOverlay={false}
      />
    </Link>
    <div className="mt-5">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {p.projectType} · {p.municipality}
      </span>
      <h3 className="font-display text-xl text-primary leading-snug mt-2">
        <Link
          to={`/realisaties/${p.slug}`}
          className="focus-ring transition-colors duration-300 fine:lg:group-hover/proj:text-accent"
          onClick={() => track("view_project", { page_type: pageType, item_id: p.slug, cta_label: p.title })}
        >
          {p.title}
        </Link>
      </h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">{p.summary}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-accent">
        Bekijk het project
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/proj:translate-x-1" />
      </span>
    </div>
  </article>
);
