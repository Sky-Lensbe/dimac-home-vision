import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { CTABlock } from "./CTABlock";
import { Section } from "./Section";
import { BulletList } from "./BulletList";
import { WorkflowSteps } from "./WorkflowSteps";
import { FAQ } from "./FAQ";
import { Breadcrumbs } from "./Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import { activeRegions } from "@/data/regions";
import { publishedArticles } from "@/data/articles";
import { projectsForService } from "@/data/projects";
import { services as allServices } from "@/data/services";
import { DisciplineGrid } from "./DisciplineGrid";
import { ProjectCard } from "./ProjectCard";
import { track } from "@/lib/analytics";
import {
  COMPANY,
  absoluteUrl,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  type Crumb,
} from "@/lib/site";
import type { ServiceContent } from "@/data/services";

interface Props { service: ServiceContent }

export const ServicePage = ({ service: s }: Props) => {
  const path = `/diensten/${s.slug}`;
  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "Diensten", to: "/diensten" },
    { label: s.navLabel },
  ];

  useEffect(() => {
    track("view_service", { page_type: "service", item_id: s.slug });
  }, [s.slug]);

  // Disciplines die binnen ditzelfde traject vaak samen aangepakt worden.
  const relatedDisciplines = allServices
    .filter((o) => o.slug !== s.slug)
    .filter((o) => projectsForService(s.slug).some((p) => p.relatedServices.includes(o.slug)))
    .slice(0, 4);

  const relatedProject = projectsForService(s.slug)[0];

  // Artikels die deze dienst als gerelateerd opgeven.
  const relatedArticles = publishedArticles
    .filter((a) => a.relatedServices.includes(s.slug))
    .slice(0, 2);

  return (
    <>
      <PageSEO
        path={path}
        title={s.meta.title}
        description={s.meta.description}
        schemas={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": absoluteUrl(path) + "#service",
            name: s.overviewTitle,
            description: s.meta.description,
            serviceType: s.navLabel,
            url: absoluteUrl(path),
            provider: { "@id": COMPANY.id },
            areaServed: COMPANY.areaServed.map((name) => ({ "@type": "City", name })),
          },
          breadcrumbSchema(crumbs),
          ...(s.faq.items.length ? [faqSchema(s.faq.items)] : []),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="fade-up">
            <Breadcrumbs items={crumbs} className="mb-8" />
            {s.hero.eyebrow && <span className="eyebrow mb-6">{s.hero.eyebrow}</span>}
            <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
              {s.hero.h1}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {s.hero.sub}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link
                  to="/contact"
                  onClick={() =>
                    track("project_contact_start", {
                      page_type: "service",
                      item_id: s.slug,
                      cta_label: "Bespreek je project",
                    })
                  }
                >
                  Bespreek je project <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  to="/woningscan"
                  onClick={() =>
                    track("woningscan_click", {
                      page_type: "service",
                      item_id: s.slug,
                      cta_label: "Start met een woningscan",
                    })
                  }
                >
                  Start met een woningscan
                </Link>
              </Button>
            </div>
          </div>
          <div className="fade-up delay-2">
            <ImagePlaceholder label={s.hero.imageLabel} src={s.hero.image} aspect="portrait" />
          </div>
        </div>
      </section>


      {/* Intro */}
      <Section eyebrow="Introductie" title={s.intro.h2}>
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          {s.intro.text.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>

      {/* Problem / Solution split */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-2">
          <div data-reveal>
            <span className="eyebrow mb-5">Herkenning</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-6 text-primary">{s.problem.h2}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {s.problem.text.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <div className="lg:pl-10 lg:border-l lg:border-border" data-reveal data-reveal-delay="2">
            <span className="eyebrow mb-5">Oplossing</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-6 text-primary">{s.solution.h2}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {s.solution.text.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* Scan bridge (optional) */}
      {s.scanBridge && (
        <CTABlock
          eyebrow="Woningscan"
          title={s.scanBridge.h2}
          text={s.scanBridge.text.join(" ")}
          primary={{ label: s.scanBridge.cta, to: s.scanBridge.to }}
          variant="dark"
        />
      )}

      {/* Scope */}
      <Section eyebrow="Wat omvat het" title={s.scope.h2}>
        {s.scope.intro && (
          <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-10" data-reveal>{s.scope.intro}</p>
        )}
        <BulletList items={s.scope.bullets} columns={2} />
      </Section>

      {/* For who + Benefits */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-2">
          <div data-reveal>
            <span className="eyebrow mb-5">Voor wie</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-8 text-primary">{s.forWho.h2}</h2>
            <BulletList items={s.forWho.bullets} reveal={false} />
          </div>
          <div data-reveal data-reveal-delay="2">
            <span className="eyebrow mb-5">Voordelen</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-8 text-primary">{s.benefits.h2}</h2>
            <BulletList items={s.benefits.bullets} reveal={false} />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <Section eyebrow="Werkwijze" title={s.workflow.h2}>
        <WorkflowSteps steps={s.workflow.steps} />
      </Section>

      {/* Samenhang met andere disciplines */}
      {relatedDisciplines.length > 0 && (
        <Section
          eyebrow="Samenhang"
          title="Werken die hier vaak bij horen"
        >
          <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-10" data-reveal>
            Deze werken beïnvloeden elkaar. Dimac stemt ze binnen één project op elkaar af.
          </p>
          <DisciplineGrid
            pageType="service"
            compact
            items={relatedDisciplines.map((o) => ({
              label: o.navLabel,
              slug: o.slug,
              to: `/diensten/${o.slug}`,
            }))}
          />
        </Section>
      )}

      {/* Relevante realisatie */}
      {relatedProject && (
        <Section eyebrow="Realisatie" title="Zo pakten we dit aan" bg="surface">
          <div className="max-w-xl" data-reveal>
            <ProjectCard project={relatedProject} pageType="service" />
          </div>
        </Section>
      )}

      {/* Outcome */}
      <section className="py-24 md:py-32 bg-surface border-y border-border">
        <div className="container-tight max-w-3xl">
          <span className="eyebrow mb-6" data-reveal>Resultaat</span>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6 text-primary" data-reveal data-reveal-delay="1">{s.outcome.h2}</h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed" data-reveal data-reveal-delay="2">
            {s.outcome.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Local */}
      <Section eyebrow="Lokaal" title={s.local.h2}>
        <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed text-lg" data-reveal>
          {s.local.text.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="mt-10 max-w-3xl" data-reveal data-reveal-delay="2">
          <ul className="space-y-3 text-muted-foreground">
            {activeRegions.map((r) => (
              <li key={r.slug}>
                <Link to={`/regio/${r.slug}`} className="link-underline text-accent focus-ring">
                  {s.navLabel} door een aannemer in {r.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/realisaties" className="link-underline text-accent focus-ring">
                Realisaties van Dimac bekijken
              </Link>
            </li>
            <li>
              <Link to="/woningscan" className="link-underline text-accent focus-ring">
                Woningscan als eerste stap in uw project
              </Link>
            </li>
            {relatedArticles.map((a) => (
              <li key={a.slug}>
                <Link to={`/blog/${a.slug}`} className="link-underline text-accent focus-ring">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>


      {/* FAQ */}
      <Section eyebrow="FAQ" title={s.faq.h2} bg="surface">
        <div data-reveal>
          <FAQ items={s.faq.items} className="max-w-3xl" />
        </div>
      </Section>

      {/* Final CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title={s.finalCta.h2}
        text={s.finalCta.text}
        primary={s.finalCta.primary}
        secondary={s.finalCta.secondary}
      />
    </>
  );
};
