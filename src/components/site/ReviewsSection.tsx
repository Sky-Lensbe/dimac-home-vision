import { Link } from "react-router-dom";
import { Section } from "./Section";
import { reviews } from "@/data/reviews";
import { getProject } from "@/data/projects";

/** Rendert niets zolang er geen echte, verifieerbare reviews zijn. */
export const ReviewsSection = ({ bg = "surface" }: { bg?: "background" | "surface" }) => {
  if (!reviews.length) return null;

  return (
    <Section eyebrow="Klantervaringen" title="Wat klanten over de samenwerking zeggen." bg={bg}>
      <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
        {reviews.map((r, i) => {
          const project = r.relatedProject ? getProject(r.relatedProject) : undefined;
          return (
            <blockquote key={`${r.customerName}-${i}`} className="bg-background p-8 md:p-10">
              <p className="text-lg text-primary leading-relaxed">{r.quote}</p>
              <footer className="mt-6 text-sm text-muted-foreground">
                <span className="text-primary">{r.customerName}</span>
                {(r.projectType || r.municipality) && (
                  <span>
                    {" "}
                    — {[r.projectType, r.municipality].filter(Boolean).join(", ")}
                  </span>
                )}
                {project && (
                  <span className="mt-3 block">
                    <Link
                      to={`/realisaties/${project.slug}`}
                      className="link-underline text-accent focus-ring"
                    >
                      Bekijk het project
                    </Link>
                  </span>
                )}
              </footer>
            </blockquote>
          );
        })}
      </div>
    </Section>
  );
};
