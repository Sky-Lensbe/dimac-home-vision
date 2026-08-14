// Draait vóór `vite dev` en `vite build` (predev/prebuild); schrijft public/sitemap.xml.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

/**
 * De datafiles importeren afbeeldingen, wat buiten Vite niet laadbaar is.
 * Daarom lezen we de slugs rechtstreeks uit de bron, zodat de sitemap
 * altijd synchroon blijft met de data.
 */
function slugsFrom(file: string, opts: { requireEnabled?: boolean; requirePublished?: boolean; requireConfirmed?: boolean } = {}) {
  const src = readFileSync(resolve(file), "utf8");
  const blocks = src.split(/\n\s*\{\s*\n/).slice(1);
  const found: string[] = [];
  for (const block of blocks) {
    const slug = block.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
    if (!slug || found.includes(slug)) continue;
    if (opts.requireEnabled && /^\s*enabled:\s*false/m.test(block)) continue;
    if (opts.requirePublished && !/^\s*status:\s*"published"/m.test(block)) continue;
    if (opts.requireConfirmed && !/^\s*confirmed:\s*true/m.test(block)) continue;
    found.push(slug);
  }
  return found;
}

const services = slugsFrom("src/data/services.ts").map((slug) => ({ slug }));
const activeRegions = slugsFrom("src/data/regions.ts", { requireEnabled: true }).map((slug) => ({ slug }));
const publishedArticles = slugsFrom("src/data/articles.ts", { requirePublished: true }).map((slug) => ({ slug }));
// Alleen bevestigde realisaties horen in de sitemap; testcases blijven eruit.
const confirmedProjects = slugsFrom("src/data/projects.ts", { requireConfirmed: true }).map((slug) => ({ slug }));

const BASE_URL = "https://www.dimac.be";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/woningscan", changefreq: "monthly", priority: "0.9" },
  { path: "/diensten", changefreq: "monthly", priority: "0.9" },
  ...services.map((s) => ({
    path: `/diensten/${s.slug}`,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  { path: "/regio", changefreq: "monthly", priority: "0.7" },
  ...activeRegions.map((r) => ({
    path: `/regio/${r.slug}`,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  ...publishedArticles.map((a) => ({
    path: `/blog/${a.slug}`,
    changefreq: "yearly" as const,
    priority: "0.6",
  })),
  { path: "/werkwijze", changefreq: "yearly", priority: "0.7" },
  { path: "/realisaties", changefreq: "monthly", priority: "0.7" },
  ...confirmedProjects.map((p) => ({
    path: `/realisaties/${p.slug}`,
    changefreq: "yearly" as const,
    priority: "0.6",
  })),
  { path: "/reviews", changefreq: "yearly", priority: "0.5" },
  { path: "/over", changefreq: "yearly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.8" },
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
