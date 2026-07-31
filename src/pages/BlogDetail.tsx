import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { FAQ } from "@/components/site/FAQ";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import NotFound from "@/pages/NotFound";
import {
  BLOG_LABEL,
  getPublishedArticle,
  publishedArticles,
  type ArticleSection,
} from "@/data/articles";
import { getService } from "@/data/services";
import { getActiveRegion } from "@/data/regions";
import {
  COMPANY,
  absoluteUrl,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  type Crumb,
} from "@/lib/site";

const dateLabel = (iso?: string) =>
  iso
    ? new Date(iso + "T00:00:00Z").toLocaleDateString("nl-BE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : undefined;

const SectionBlock = ({ block }: { block: ArticleSection }) => {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="font-display text-2xl md:text-3xl leading-tight text-primary mt-14 mb-5">
          {block.text}
        </h2>
      ) : (
        <h3 className="font-display text-xl md:text-2xl leading-snug text-primary mt-10 mb-4">
          {block.text}
        </h3>
      );
    case "paragraph":
      return <p className="text-[17px] leading-relaxed text-muted-foreground mb-5">{block.text}</p>;
    case "list":
      return block.ordered ? (
        <ol className="my-7 space-y-3 list-decimal pl-5 marker:text-accent marker:font-display">
          {block.items.map((it) => (
            <li key={it} className="pl-1 text-[17px] leading-relaxed text-muted-foreground">
              {it}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-7 space-y-3 list-disc pl-5 marker:text-accent">
          {block.items.map((it) => (
            <li key={it} className="pl-1 text-[17px] leading-relaxed text-muted-foreground">
              {it}
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <aside className="my-10 border-l-2 border-accent bg-surface p-6 md:p-8">
          {block.title && (
            <p className="font-display text-lg text-primary mb-2">{block.title}</p>
          )}
          <p className="text-[16px] leading-relaxed text-muted-foreground">{block.text}</p>
        </aside>
      );
    case "faq":
      return (
        <div className="my-12">
          {block.title && (
            <h2 className="font-display text-2xl md:text-3xl leading-tight text-primary mb-6">
              {block.title}
            </h2>
          )}
          <FAQ items={block.items} />
        </div>
      );
    case "cta":
      return (
        <div className="my-12 border border-border bg-surface p-8">
          <p className="text-[17px] leading-relaxed text-primary mb-6">{block.text}</p>
          <Button asChild variant="solid">
            <Link to={block.to}>
              {block.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      );
    default:
      return null;
  }
};

const BlogDetail = () => {
  const { slug } = useParams();
  const article = slug ? getPublishedArticle(slug) : undefined;

  // Conceptartikels en onbekende slugs geven een echte niet-gevonden toestand.
  if (!article) return <NotFound />;

  const path = `/blog/${article.slug}`;
  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: BLOG_LABEL, to: "/blog" },
    { label: article.title },
  ];

  const primaryService = getService(article.relatedServices[0] ?? "");
  const otherServices = article.relatedServices
    .slice(1)
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const regionsLinked = article.relatedRegions
    .map((r) => getActiveRegion(r))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const related = article.relatedArticles
    .map((a) => publishedArticles.find((p) => p.slug === a))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const visibleFaq = article.sections.flatMap((s) => (s.type === "faq" ? s.items : []));

  return (
    <>
      <PageSEO
        path={path}
        title={article.meta.title}
        description={article.meta.description}
        ogType="article"
        schemas={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": absoluteUrl(path) + "#article",
            headline: article.title,
            description: article.excerpt,
            mainEntityOfPage: absoluteUrl(path),
            ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
            ...(article.modifiedAt ? { dateModified: article.modifiedAt } : {}),
            author: { "@id": COMPANY.id },
            publisher: { "@id": COMPANY.id },
            image: COMPANY.image,
            articleSection: article.category,
            inLanguage: "nl-BE",
          },
          breadcrumbSchema(crumbs),
          ...(visibleFaq.length ? [faqSchema(visibleFaq)] : []),
        ]}
      />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16 bg-surface">
        <div className="container-tight max-w-3xl fade-up">
          <Breadcrumbs items={crumbs} className="mb-8" />
          <span className="eyebrow mb-6">{article.hero?.eyebrow ?? article.category}</span>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-primary">
            {article.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{article.intro}</p>
          <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {article.publishedAt && (
              <span>
                Gepubliceerd op{" "}
                <time dateTime={article.publishedAt}>{dateLabel(article.publishedAt)}</time>
              </span>
            )}
            {article.modifiedAt && article.modifiedAt !== article.publishedAt && (
              <span>
                Bijgewerkt op{" "}
                <time dateTime={article.modifiedAt}>{dateLabel(article.modifiedAt)}</time>
              </span>
            )}
            {article.readingTime && <span>{article.readingTime} lezen</span>}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container-tight">
          <div className="max-w-2xl" data-reveal>
            {article.sections.map((block, i) => (
              <SectionBlock key={i} block={block} />
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Verder" title="Wat hierbij aansluit" bg="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div data-reveal>
            <h3 className="font-display text-xl text-primary mb-4">Diensten</h3>
            <ul className="space-y-3 text-muted-foreground">
              {primaryService && (
                <li>
                  <Link
                    to={`/diensten/${primaryService.slug}`}
                    className="link-underline text-accent focus-ring"
                  >
                    {primaryService.overviewTitle} door Dimac
                  </Link>
                </li>
              )}
              {otherServices.map((s) => (
                <li key={s.slug}>
                  <Link to={`/diensten/${s.slug}`} className="link-underline text-accent focus-ring">
                    {s.overviewTitle} binnen uw project
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/woningscan" className="link-underline text-accent focus-ring">
                  Woningscan als eerste stap
                </Link>
              </li>
              {regionsLinked.map((r) => (
                <li key={r.slug}>
                  <Link to={`/regio/${r.slug}`} className="link-underline text-accent focus-ring">
                    Aannemer in {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {related.length > 0 && (
            <div data-reveal data-reveal-delay="2">
              <h3 className="font-display text-xl text-primary mb-4">Gerelateerde artikels</h3>
              <ul className="space-y-3 text-muted-foreground">
                {related.map((a) => (
                  <li key={a.slug}>
                    <Link to={`/blog/${a.slug}`} className="link-underline text-accent focus-ring">
                      {a.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/blog" className="link-underline text-accent focus-ring">
                    Alle adviesartikels van Dimac
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title={article.finalCta.title}
        text={article.finalCta.text}
        primary={article.finalCta.primary}
        secondary={article.finalCta.secondary}
      />
    </>
  );
};

export default BlogDetail;
