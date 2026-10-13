import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/site/Section";
import { PageHero } from "@/components/site/PageHero";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { PageSEO } from "@/components/seo/PageSEO";
import { breadcrumbSchema, organizationSchema } from "@/lib/site";
import { getDevelopment } from "@/data/developments";
import { track } from "@/lib/analytics";

const ProjectDetail = () => {
  const { slug } = useParams();
  const d = getDevelopment(slug);

  useEffect(() => {
    if (d) track("view_project", { page_type: "project", item_id: d.slug });
  }, [d]);

  if (!d) return <Navigate to="/projecten" replace />;

  const crumbs = [
    { label: "Home", to: "/" },
    { label: "Onze projecten", to: "/projecten" },
    { label: d.name },
  ];

  return (
    <>
      <PageSEO
        path={`/projecten/${d.slug}`}
        title={`${d.name}, ${d.location} | Dimac`}
        description={d.summary ?? `${d.name}. Bekijk het project van Dimac in ${d.location}.`}
        ogImage={d.cover}
        schemas={[organizationSchema(), breadcrumbSchema(crumbs)]}
      />
      <PageHero crumbs={crumbs} eyebrow={`${d.type ? `${d.type} · ` : ""}${d.location}${d.status ? ` · ${d.status}` : ""}`} title={d.name} intro={d.summary ? <p>{d.summary}</p> : undefined} />
      {d.cover && <div className="container-wide -mt-px">
        <ImagePlaceholder src={d.cover} label={d.coverAlt} aspect="wide" fit="contain" showLabelOverlay={false} />
      </div>}
      <Section>
        <div className="grid gap-12 md:grid-cols-2 max-w-5xl">
          {[
            ["Oorspronkelijke situatie", d.originalSituation],
            ["Ontwikkelingsvisie", d.vision],
            ["Resultaat", d.result],
          ].filter(([, x]) => Boolean(x)).map(([t, x]) => (
            <div key={t}>
              <h2 className="eyebrow mb-4">{t}</h2>
              <p className="text-muted-foreground leading-relaxed">{x}</p>
            </div>
          ))}
           {d.interventions && d.interventions.length > 0 && <div>
            <h2 className="eyebrow mb-4">Technische en esthetische ingrepen</h2>
            <ul className="space-y-2 text-muted-foreground">
              {d.interventions.map((i) => (
                <li key={i}>— {i}</li>
              ))}
            </ul>
           </div>}
        </div>
        {d.gallery && (
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {d.gallery.map((g) => (
              <ImagePlaceholder key={g.src} src={g.src} label={g.alt} fit="contain" showLabelOverlay={false} />
            ))}
          </div>
        )}
        {d.video && <video src={d.video} controls className="mt-16 w-full" preload="metadata" />}
        <Link to="/projecten" className="focus-ring mt-16 inline-flex items-center gap-2 text-sm text-accent">
          <ArrowLeft className="w-4 h-4" /> Alle projecten
        </Link>
      </Section>
    </>
  );
};

export default ProjectDetail;
