// Draait vóór `vite dev` en `vite build` (predev/prebuild); schrijft public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { services } from "../src/data/services";
import { activeRegions } from "../src/data/regions";
import { publishedArticles } from "../src/data/articles";

const BASE_URL = "https://dimac.be";

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
