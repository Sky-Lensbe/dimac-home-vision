# Homepage aanscherpen (alleen `src/pages/Index.tsx`)

Kortere, conversiegerichte homepage van 14 naar 11 secties. Enkel `src/pages/Index.tsx` wordt gewijzigd. Geen componentbestanden, globale styling, navigatie, datafiles of andere pagina's. Niet publiceren.

## Verwijderen

- BOFU-vragenlijst "U wil geen verrassingen halverwege de werken"
- De uitgebreide `WorkflowSteps`-sectie op de homepage
- De sectie "Wat u niet ziet"
- Alle voorbeeldreviews, sterren, auteurs en "Placeholder"-teksten (ook de statistiekenstrip 5/5 en 20+ jaar)
- De realisatiefoto met label "Team Dimac"

## Definitieve volgorde

1. **Hero** — huidige foto behouden met `aspect="tall"` en `fit="contain"`. Eyebrow, H1 "Renoveren of bouwen zonder zelf alles te moeten coördineren.", één ondertekst, CTA's "Bespreek uw project" (/contact) en "Ontdek de woningscan" (/woningscan), microcopy met regio's.
2. **Vertrouwensbalk** — vier compacte items zonder cijfers of claims: Eén aanspreekpunt, Duidelijke voorbereiding, Eigen vakmensen en vaste partners, Actief in regio Diest.
3. **Probleemherkenning** — nieuwe titel, korte intro, compacte lijst van vijf herkenbare situaties, afsluitzin.
4. **Positionering** — drie blokken: Voorbereiding, Coördinatie, Opvolging. CTA "Bekijk onze werkwijze" → /werkwijze.
5. **Twee instappaden** — bestaand 01/02-patroon, kortere copy. CTA's "Bekijk onze diensten" → /diensten en "Ontdek de woningscan" → /woningscan.
6. **Diensten** — dezelfde zes diensten, maar met lokale korte beschrijvingen (max twee korte zinnen) in een array bovenaan het bestand. `src/data/services.ts` blijft ongewijzigd; alleen slug en titel worden daaruit gebruikt. Kaartlinks naar `/diensten/{slug}`, sectie-CTA "Bekijk alle diensten" → /diensten.
7. **Woningscan** — huidige foto behouden, nieuwe titel en tekst, vier voordelen inclusief verrekening van het scanbedrag. CTA "Plan uw woningscan" → /woningscan.
8. **Realisaties** — dezelfde vier foto's met beschrijvende labels, per project projecttype plus één korte zin. CTA "Bekijk realisaties" → /realisaties.
9. **Vertrouwenssectie** — neutraal, zonder reviews: "Duidelijkheid tijdens het volledige traject." met vier elementen uit één lokale array (`trustElements`), zodat die later één-op-één vervangen kan worden door een array met echte Google-reviews. Geen sterren, auteurs of scores.
10. **Over Dimac** — twee compacte alinea's, één kolom zonder afbeelding. CTA "Leer Dimac kennen" → /over.
11. **Finale CTA** — bestaande `CTABlock` met nieuwe titel, tekst, "Bespreek uw project" en "Plan uw woningscan", plus microcopy.

## Technische punten

- Alle homepage-specifieke teksten en arrays staan bovenaan `src/pages/Index.tsx`.
- Opruimen van ongebruikte imports en variabelen: `WorkflowSteps`, `Star`, `Hammer` en alle content van verwijderde secties.
- Meta title en description licht bijgesteld op de nieuwe kernboodschap, met behoud van lokale SEO op aannemer, renovatie, nieuwbouw en regio Diest.
- Bestaande componenten, designtokens, oranje accentgebruik en responsive principes blijven ongewijzigd. Beschrijvende `label`-waarden op elke `ImagePlaceholder`.

## Controle

TypeScript- en buildcheck, controle op ongebruikte imports, alle CTA-bestemmingen, horizontale overflow, en Playwright-screenshots van `/` op 1280 px en 390 px inclusief een test van de mobiele navigatie en de diensten-dropdown.
