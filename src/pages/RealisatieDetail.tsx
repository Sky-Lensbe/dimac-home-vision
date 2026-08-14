import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { CaseStudy } from "@/components/site/CaseStudy";
import { ProjectGallery } from "@/components/site/ProjectGallery";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import NotFound from "@/pages/NotFound";
import { getProject, visibleProjects } from "@/data/projects";
import { getService } from "@/data/services";
import { track } from "@/lib/analytics";
import {
  COMPANY,
  absoluteUrl,
  breadcrumbSchema,
  organizationSchema,
  type Crumb,
} from "@/lib/site";

const RealisatieDetail = () => {
  const { slug } = useParams();
  const project = slug ? getProject(slug) : undefined;

  useEffect(() => {
    if (project) track("view_project", { page_type: "project", item_id: project.slug });
  }, [project]);

  if (!project) return <NotFound />;

  const path = `/realisaties/${project.slug}`;
  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "Realisaties", to: "/realisaties" },
    { label: project.title },
  ];

  const services = project.relatedServices
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const others = visibleProjects.filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <>
      <PageSEO
        path={path}
        title={`${project.title} | Realisatie in ${project.municipality} | Dimac`}
        description={project.summary}
        ogType="article"
        ogImage={project.images[0]?.src}
        // Onbevestigde cases worden niet geïndexeerd tot de inhoud is nagekeken.
        robots={project.confirmed ? "index, follow" : "noindex, follow"}
        schemas={
          project.confirmed
            ? [
                organizationSchema(),
                {
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  "@id": absoluteUrl(path) + "#webpage",
                  url: absoluteUrl(path),
                  name: project.title,
                  description: project.summary,
                  isPartOf: { "@id": COMPANY.id },
                  about: { "@id": COMPANY.id },
                },
                breadcrumbSchema(crumbs),
              ]
            : []
        }
      />

      <section className="pt-32 md:pt-40 pb-14 bg-surface">
        <div className="container-tight max-w-3xl fade-up">
          <Breadcrumbs items={crumbs} className="mb-8" />
          <span className="eyebrow mb-6">
            {project.projectType} · {project.municipality}
          </span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            {project.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{project.summary}</p>
        </div>
      </section>

      <Section className="pt-14 md:pt-16">
        <ProjectGallery images={project.images} />
        <div className="mt-16">
          <CaseStudy project={project} />
        </div>

        {services.length > 0 && (
          <div className="mt-16" data-reveal>
            <span className="eyebrow mb-5">Disciplines in dit project</span>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/diensten/${s.slug}`}
                    onClick={() =>
                      track("view_service", { page_type: "project", item_id: s.slug, cta_label: s.title })
                    }
                    className="link-underline text-accent focus-ring text-sm"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-14 flex flex-wrap gap-4">
          <Button asChild variant="solid" size="lg">
            <Link
              to="/contact"
              onClick={() =>
                track("project_contact_start", {
                  page_type: "project",
                  item_id: project.slug,
                  cta_label: "Bespreek een gelijkaardig project",
                })
              }
            >
              Bespreek een gelijkaardig project <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/realisaties">Alle realisaties</Link>
          </Button>
        </div>
      </Section>

      {others.length > 0 && (
        <Section eyebrow="Meer realisaties" title="Andere projecten" bg="surface">
          <div className="stagger-list grid gap-10 md:grid-cols-2" data-reveal>
            {others.map((p) => (
              <ProjectCard key={p.slug} project={p} pageType="project" />
            ))}
          </div>
        </Section>
      )}

      <CTABlock
        eyebrow="Volgende stap"
        title="Een gelijkaardig project in gedachten?"
        text="Vertel ons kort wat je wilt aanpakken. We bekijken samen wat een logische volgende stap is."
        primary={{ label: "Bespreek je project", to: "/contact" }}
        secondary={{ label: "Start met een woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default RealisatieDetail;
