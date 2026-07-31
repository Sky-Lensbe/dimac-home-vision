import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { BulletList } from "@/components/site/BulletList";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import NotFound from "@/pages/NotFound";
import { getActiveRegion } from "@/data/regions";
import { getService } from "@/data/services";
import { publishedArticles } from "@/data/articles";
import {
  COMPANY,
  absoluteUrl,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  type Crumb,
} from "@/lib/site";

const RegioDetail = () => {
  const { slug } = useParams();
  const region = slug ? getActiveRegion(slug) : undefined;

  // Onbekende of conceptregio's geven een echte niet-gevonden toestand,
  // geen stille doorverwijzing naar het overzicht.
  if (!region) return <NotFound />;

  const path = `/regio/${region.slug}`;
  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "Werkgebied", to: "/regio" },
    { label: region.name },
  ];

  const linkedServices = region.relevantServices
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const linkedArticles = region.relatedArticles
    .map((a) => publishedArticles.find((p) => p.slug === a))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <>
      <PageSEO
        path={path}
        title={region.meta.title}
        description={region.meta.description}
        schemas={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": absoluteUrl(path) + "#webpage",
            url: absoluteUrl(path),
            name: region.meta.title,
            description: region.meta.description,
            isPartOf: { "@id": COMPANY.id },
            about: { "@id": COMPANY.id },
          },
          breadcrumbSchema(crumbs),
          ...(region.faq.length ? [faqSchema(region.faq)] : []),
        ]}
      />

      {/* 1 + 2. Breadcrumbs en hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight max-w-3xl fade-up">
          <Breadcrumbs items={crumbs} className="mb-8" />
          <span className="eyebrow mb-6">{region.hero.eyebrow}</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            {region.hero.h1}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{region.hero.intro}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button asChild variant="solid" size="lg">
              <Link to="/contact">
                Vraag een offerte aan <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/woningscan">Plan uw woningscan</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Herkenbare projectvragen */}
      <Section eyebrow="Herkenning" title={region.questions.title}>
        {region.questions.intro && (
          <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-10" data-reveal>
            {region.questions.intro}
          </p>
        )}
        <BulletList items={region.questions.items} columns={1} className="max-w-3xl" />
      </Section>

      {/* 4. Aanpak */}
      <Section eyebrow="Aanpak" title={region.approach.title} bg="surface">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          {region.approach.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Section>

      {/* 5. Relevante diensten */}
      <Section eyebrow="Diensten" title={`Diensten in ${region.name}`}>
        <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
          {linkedServices.map((s) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="focus-ring-inset card-flush group/card bg-background p-8 flex flex-col"
            >
              <h3 className="font-display text-xl md:text-2xl text-primary leading-tight mb-3">
                {s.overviewTitle}
              </h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
                {s.navLabel} in {region.name}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 6. Werkwijze */}
      <Section eyebrow="Werkwijze" title="Zo verloopt een traject" bg="surface">
        <WorkflowSteps
          steps={[
            { title: "Plaatsbezoek", text: "Wij bekijken de woning en bespreken wat u wil bereiken." },
            { title: "Advies en offerte", text: "U krijgt een voorstel met de volledige scope van de werken." },
            { title: "Planning", text: "De vakgebieden en leveringen worden op elkaar afgestemd." },
            { title: "Uitvoering", text: "Dimac coördineert de werf en volgt de raakpunten op." },
            { title: "Oplevering", text: "Detailpunten, keuringen en afwerking worden afgerond." },
          ]}
        />
        <p className="mt-10 text-muted-foreground" data-reveal>
          <Link to="/werkwijze" className="link-underline text-accent focus-ring">
            Lees de volledige werkwijze van Dimac
          </Link>
        </p>
      </Section>

      {/* 7. Lokale realisaties, alleen bij bevestigde gegevens */}
      <Section eyebrow="Realisaties" title="Uitgevoerde projecten bekijken">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed" data-reveal>
          {region.projectReferences.length > 0 ? (
            <ul className="space-y-3">
              {region.projectReferences.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="link-underline text-accent focus-ring">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p>
                Wij tonen alleen projecten waarvan de gegevens en de beelden bevestigd zijn. Voor {region.name}
                {" "}staat er op dit moment nog geen afzonderlijk project op de site.
              </p>
              <p>
                <Link to="/realisaties" className="link-underline text-accent focus-ring">
                  Bekijk de realisaties van Dimac
                </Link>
              </p>
            </>
          )}
        </div>
      </Section>

      {/* 8. Woningscan als eerste stap */}
      <CTABlock
        eyebrow="Woningscan"
        title="Nog niet zeker wat uw woning nodig heeft?"
        text="Met een woningscan wordt de volledige woning doorgelicht, van kelder tot dak. U weet daarna welke werken noodzakelijk zijn en in welke volgorde ze best gebeuren."
        primary={{ label: "Ontdek de woningscan", to: "/woningscan" }}
      />

      {/* 9. Werkgebied */}
      <Section eyebrow="Bereik" title={`Werkgebied rond ${region.name}`} bg="surface">
        <div className="max-w-3xl" data-reveal>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Binnen en rond {region.name} werken wij onder meer in:
          </p>
          <ul className="flex flex-wrap gap-2">
            {region.serviceArea.map((place) => (
              <li
                key={place}
                className="border border-border bg-background px-4 py-2 text-sm text-primary/80"
              >
                {place}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-muted-foreground">
            <Link to="/regio" className="link-underline text-accent focus-ring">
              Bekijk ons volledige werkgebied
            </Link>
          </p>
        </div>
      </Section>

      {/* 10. Lokale FAQ */}
      <Section eyebrow="FAQ" title={`Veelgestelde vragen over werken in ${region.name}`}>
        <div data-reveal>
          <FAQ items={region.faq} className="max-w-3xl" />
        </div>
      </Section>

      {/* Advies */}
      {linkedArticles.length > 0 && (
        <Section eyebrow="Advies" title="Verder lezen voor u beslist" bg="surface">
          <div className="stagger-list grid gap-6 md:grid-cols-2" data-reveal>
            {linkedArticles.map((a) => (
              <Link
                key={a.slug}
                to={`/blog/${a.slug}`}
                className="focus-ring card-interactive group/card border border-border bg-background p-8 flex flex-col"
              >
                <span className="eyebrow mb-4">{a.category}</span>
                <h3 className="font-display text-xl text-primary leading-snug mb-3">{a.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{a.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
                  {a.title}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 11. Finale CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title={region.finalCta.title}
        text={region.finalCta.text}
        primary={region.finalCta.primary}
        secondary={region.finalCta.secondary}
      />
    </>
  );
};

export default RegioDetail;
