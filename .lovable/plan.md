# Homepage restructure — BOFU conversion page

Rewrite `src/pages/Index.tsx` from the current 8-section layout into the 14-section flow you provided. No other pages, no navigation, no data files, no placeholder images/reviews/stats change. Existing components (`Section`, `CTABlock`, `WorkflowSteps`, `BulletList`, `ImagePlaceholder`, `Button`) are reused. Styling stays white background with `#D7641D` accent, hairline borders, editorial serif headings, generous whitespace.

## Section-by-section mapping

1. **Hero** — bright hero (keep `hero.jpg`), lighter overlay so background reads as white/near-white, not dark. Badge "Aannemer in ruime regio Diest", new H1 "Renoveren of bouwen met overzicht — van eerste analyse tot afwerking.", new subhead, CTAs "Vraag een gesprek aan" (→ /contact) + "Ontdek de woningscan" (→ /woningscan), microcopy line with regions.
2. **Trust cards** — 4 white cards with thin borders + small orange accent (Eén aanspreekpunt / Duidelijke voorbereiding / Renovatie en nieuwbouw / Lokaal actief). Keep the 3 placeholder stats (5/5, regio Diest, 20+ jaar) as a small muted strip below the cards, clearly labelled "Placeholder".
3. **Two entry paths** — reuse the 01/02 two-column pattern, updated titles/copy/CTA labels ("Bekijk onze diensten" / "Ontdek de woningscan"), plus intro paragraph.
4. **Problem recognition** — editorial text section on `bg-surface` with serif title and structured body lines (keuken / badkamer / dak / technieken / afwerking) as thin-bordered items.
5. **Positioning block** — "Geen losse werken. Wel één logisch geheel." intro + 3 cards (Voorbereiding / Coördinatie / Opvolging) + CTA "Bespreek uw project" → /contact.
6. **Woningscan** — replaces current teaser. Image left (keep `preparation.jpg`), right column with new title, intro, 5 numbered points (incl. "Scanbedrag wordt verrekend bij uitvoering") and CTA "Plan uw woningscan".
7. **Services** — keep the existing 6 `services` cards (totaalrenovatie, nieuwbouw, badkamer, keuken, dakwerken, technieken). Update section title/intro to the new copy. Keep per-card link to `/diensten/{slug}` and section CTA "Bekijk alle diensten".
8. **BOFU objection block** — "U wil geen verrassingen halverwege de werken." with the 6 questions as a hairline-bordered checklist, closing text, CTA "Vraag een gesprek aan".
9. **Werkwijze** — reuse `WorkflowSteps` with the 5 new steps (Kennismaking / Analyse of woningscan / Voorstel en offerte / Planning en voorbereiding / Uitvoering en oplevering) + CTA "Bekijk onze werkwijze".
10. **Wat u niet ziet** — serif title + refined list of 8 items + closing lines. Light surface.
11. **Realisaties** — keep the 4 placeholder project images, replace captions with the 4 new captions, keep section CTA "Bekijk realisaties".
12. **Reviews / trust** — keep 3 existing placeholder quotes (still labelled "Voorbeeldreview · Placeholder"), add a 4-card trust theme row underneath (Duidelijke communicatie / Eén partij die het overzicht bewaakt / Technische voorbereiding / Afwerking met oog voor detail).
13. **Over Dimac** — new copy, image right (keep `total.jpg`), fix `"Team Dimac"` placeholder label (single occurrence, no duplication), CTA "Leer Dimac beter kennen".
14. **Final CTA** — reuse `CTABlock` with new eyebrow/title/text and primary "Vraag een gesprek aan" + secondary "Plan uw woningscan". Microcopy line rendered under the CTAs.

## Technical notes

- Only `src/pages/Index.tsx` is modified. If the section 8 checklist and section 10 list benefit from a shared visual style, they are implemented inline (no new component file) to keep the change scoped.
- Footer (`src/components/site/Footer.tsx`) is out of scope; the "Footer intro" copy in the brief already matches the existing footer intent and won't be changed unless you ask.
- Brand name stays "Dimac" everywhere in body copy (per earlier rule). The brief's "Dimac BV" line in the footer section is ignored on the homepage — footer is not touched.
- Hero overlay changed from `from-primary/75` to a soft white gradient so the hero reads bright; text switches to `text-primary` on the light area. No new assets.
- All CTAs use existing `Button` variants (`solid` for primary orange, `outline` for secondary). No new colors, no new fonts, no new dependencies.
- Placeholder stats and reviews retain their "Placeholder" labels.

## Verification

After the edit: Playwright screenshot of `/` at 1280×1800 and 390×844 to confirm the new flow renders, spacing is calm, orange is only used on accents/CTAs, and no dark hero remains.
