import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageSEO } from "@/components/seo/PageSEO";
import { BLOG_LABEL, publishedArticles } from "@/data/articles";
import { services } from "@/data/services";
import { COMPANY, absoluteUrl, breadcrumbSchema, organizationSchema, type Crumb } from "@/lib/site";

const crumbs: Crumb[] = [{ label: "Home", to: "/" }, { label: BLOG_LABEL }];

const Blog = () => {
  const highlighted = services.filter((s) =>
    ["totaalrenovatie", "badkamer-renovatie", "dakwerken"].includes(s.slug),
  );

  return (
    <>
      <PageSEO
        path="/blog"
        title="Advies over renovatie en nieuwbouw | Dimac"
        description="Praktische artikels over renovatiebudget, volgorde van werken, de woningscan en de keuze tussen één aannemer of losse vakmannen."
        schemas={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": absoluteUrl("/blog") + "#webpage",
            url: absoluteUrl("/blog"),
            name: "Advies over renovatie en nieuwbouw",
            isPartOf: { "@id": COMPANY.id },
          },
          breadcrumbSchema(crumbs),
        ]}
      />

      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight max-w-3xl fade-up">
          <Breadcrumbs items={crumbs} className="mb-8" />
          <span className="eyebrow mb-6">{BLOG_LABEL}</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Advies bij uw renovatiebeslissing
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Artikels voor wie voor een keuze staat: wat kost het, wat gebeurt er eerst, en wie houdt het
            geheel in de gaten. Geschreven vanuit de praktijk op de werf, zonder schijnexacte cijfers.
          </p>
        </div>
      </section>

      <Section eyebrow="Artikels" title="Recent advies">
        {publishedArticles.length === 0 ? (
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed" data-reveal>
            Er staan momenteel nog geen artikels online. Heeft u een concrete vraag over uw project?{" "}
            <Link to="/contact" className="link-underline text-accent focus-ring">
              Stel ze rechtstreeks aan Dimac
            </Link>
            .
          </p>
        ) : (
          <div className="stagger-list grid gap-px bg-border border border-border md:grid-cols-2" data-reveal>
            {publishedArticles.map((a) => (
              <article key={a.slug} className="card-flush group/card bg-background">
                <Link
                  to={`/blog/${a.slug}`}
                  className="focus-ring-inset flex h-full flex-col p-8 md:p-10"
                >
                  <span className="eyebrow mb-5">{a.category}</span>
                  <h2 className="font-display text-2xl md:text-3xl text-primary leading-tight mb-4">
                    {a.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed flex-1">{a.excerpt}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent">
                    Lees {a.title.toLowerCase()}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow="Diensten" title="Van advies naar uitvoering" bg="surface">
        <div className="stagger-list grid gap-6 md:grid-cols-3" data-reveal>
          {highlighted.map((s) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="focus-ring card-interactive group/card border border-border bg-background p-8 flex flex-col"
            >
              <h3 className="font-display text-xl text-primary mb-3">{s.overviewTitle}</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
                Meer over {s.navLabel.toLowerCase()}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/card:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CTABlock
        eyebrow="Woningscan"
        title="Liever eerst weten wat uw woning nodig heeft?"
        text="Een woningscan brengt de volledige woning in kaart voordat u werken vastlegt."
        primary={{ label: "Plan uw woningscan", to: "/woningscan" }}
        secondary={{ label: "Neem contact op", to: "/contact" }}
      />
    </>
  );
};

export default Blog;
