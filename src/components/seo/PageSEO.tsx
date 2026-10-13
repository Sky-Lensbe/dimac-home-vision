import { useEffect } from "react";
import { ALLOW_INDEXING, DEFAULT_OG_IMAGE, SITE_URL, absoluteUrl } from "@/lib/site";

export interface PageSEOProps {
  title: string;
  description: string;
  /** Pad van de huidige pagina, bijvoorbeeld "/regio/diest". */
  path?: string;
  canonical?: string;
  robots?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  /** Eén of meerdere JSON-LD objecten. */
  schemas?: Record<string, unknown>[];
}

const MANAGED = "data-dimac-seo";

/**
 * SSR/prerender collector. Tijdens server-rendering bestaat er geen document,
 * dus verzamelen wij de headgegevens zodat de prerender-stap ze kan injecteren.
 */
export const seoCollector: { current: PageSEOProps | null } = { current: null };

export function resolveSEO(props: PageSEOProps) {
  const path = props.path ?? "/";
  const url = props.canonical ? absoluteUrl(props.canonical) : absoluteUrl(path);
  return {
    title: props.title,
    description: props.description,
    url,
    robots: ALLOW_INDEXING ? props.robots ?? "index, follow" : "noindex, nofollow",
    ogType: props.ogType ?? "website",
    ogImage: absoluteUrl(props.ogImage ?? DEFAULT_OG_IMAGE),
    schemas: props.schemas ?? [],
  };
}

/** Bouwt de volledige lijst headtags als platte data (herbruikbaar voor prerendering). */
export function seoTags(props: PageSEOProps) {
  const r = resolveSEO(props);
  return {
    title: r.title,
    metas: [
      { name: "description", content: r.description },
      { name: "robots", content: r.robots },
      { property: "og:site_name", content: "Dimac" },
      { property: "og:locale", content: "nl_BE" },
      { property: "og:title", content: r.title },
      { property: "og:description", content: r.description },
      { property: "og:url", content: r.url },
      { property: "og:type", content: r.ogType },
      { property: "og:image", content: r.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: r.title },
      { name: "twitter:description", content: r.description },
      { name: "twitter:image", content: r.ogImage },
    ],
    canonical: r.url,
    schemas: r.schemas,
  };
}

function clearManaged() {
  document.head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove());
}

/**
 * Eén centrale SEO-oplossing per pagina.
 * Alle tags van de vorige route worden opgeruimd, zodat er nooit dubbele
 * meta-, canonical- of JSON-LD-tags ontstaan bij navigatie.
 */
export const PageSEO = (props: PageSEOProps) => {
  if (typeof document === "undefined") {
    seoCollector.current = props;
  }

  const serialized = JSON.stringify(props);

  useEffect(() => {
    const parsed = JSON.parse(serialized) as PageSEOProps;
    const tags = seoTags(parsed);

    clearManaged();
    document.title = tags.title;

    // Statische tags uit index.html verwijderen zodat er geen duplicaten blijven.
    document.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]',
      )
      .forEach((el) => el.remove());

    const frag = document.createDocumentFragment();

    for (const m of tags.metas) {
      const el = document.createElement("meta");
      if ("name" in m && m.name) el.setAttribute("name", m.name);
      if ("property" in m && m.property) el.setAttribute("property", m.property);
      el.setAttribute("content", m.content);
      el.setAttribute(MANAGED, "");
      frag.appendChild(el);
    }

    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", tags.canonical);
    link.setAttribute(MANAGED, "");
    frag.appendChild(link);

    for (const schema of tags.schemas) {
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute(MANAGED, "");
      script.textContent = JSON.stringify(schema);
      frag.appendChild(script);
    }

    document.head.appendChild(frag);

    return () => clearManaged();
  }, [serialized]);

  return null;
};

export { SITE_URL };
