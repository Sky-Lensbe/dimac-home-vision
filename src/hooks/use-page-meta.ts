import { PageSEO, type PageSEOProps } from "@/components/seo/PageSEO";

/**
 * Backwards-compatible wrapper rond de centrale SEO-oplossing.
 * Nieuwe pagina's gebruiken bij voorkeur rechtstreeks <PageSEO />.
 */
export function usePageMeta(_props: { title?: string; description?: string }) {
  // Bewust leeg gelaten: de titel- en descriptionlogica zit nu in PageSEO.
  // Deze hook blijft bestaan zodat oudere imports niet breken.
}

export { PageSEO };
export type { PageSEOProps };
