// Draait vóór `vite dev` en `vite build` (predev/prebuild); schrijft public/sitemap.xml.
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.dimac.be";

// Projectslugs rechtstreeks uit de bron lezen (datafile importeert beelden).
const src = readFileSync(resolve("src/data/developments.ts"), "utf8");
const projectSlugs = [...src.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);

const paths = [
  "/",
  "/woningscan",
  "/totaalrenovaties",
  "/projecten",
  ...projectSlugs.map((s) => `/projecten/${s}`),
  "/over",
  "/contact",
  "/privacy",
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${paths.length} entries)`);
