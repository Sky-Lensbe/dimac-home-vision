import { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Crumb } from "@/lib/site";

interface Props {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}

/** Rustige, typografische paginaopening voor binnenpagina's. */
export const PageHero = ({ eyebrow, title, intro, crumbs, children }: Props) => (
  <section className="pt-28 md:pt-40 pb-14 md:pb-24 bg-background border-b border-border">
    <div className="container-tight fade-up">
      {crumbs && <Breadcrumbs items={crumbs} className="mb-10" />}
      <span className="eyebrow mb-6">{eyebrow}</span>
      <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-6xl leading-[1.04] tracking-tight text-primary max-w-4xl text-balance">
        {title}
      </h1>
      {intro && (
        <div className="mt-8 max-w-2xl space-y-4 text-lg text-muted-foreground leading-relaxed">{intro}</div>
      )}
      {children}
    </div>
  </section>
);
