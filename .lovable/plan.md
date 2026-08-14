# Dimac: van bouwsite naar conversiegerichte customer journey

Het bestaande visuele DNA blijft: wit, charcoal, Dimac-oranje, Playfair/Inter, echte fotografie, ingetogen animaties. Wat verandert is de opbouw en de verhaallijn: elke sectie beantwoordt één vraag van de bezoeker en leidt naar één logische volgende stap.

## Uitgangspunten

- Geen verzonnen inhoud. De vijf aangeleverde cases worden gemarkeerd als testcontent en zijn met één schakelaar publiceerbaar zodra ze bevestigd zijn.
- Geen team- of reviewinhoud: die secties worden als lege, klaar-om-te-vullen structuren gebouwd (data-array leeg, sectie rendert niet). Zodra je foto's of reviews aanlevert, volstaat het de array te vullen.
- De woningscan-korting wordt niet vermeld zolang de exacte voorwaarde niet bevestigd is. De sectie is er wel op voorbereid.
- Analytics: alleen een event-laag, geen tags, geen fake data.

## 1. Homepage (nieuwe volgorde)

1. Hero: uitkomst in plaats van diensten. Kop "Renoveren zonder zelf alles te moeten coördineren.", ondertitel over technieken tot afwerking, CTA's "Bespreek je project" en "Ontdek de woningscan", plus de regioregel. Bestaande hero-foto en mobiele overlay blijven.
2. Probleemherkenning: vier korte, feitelijke knelpunten (wachtende aannemers, technieken die vloer/keuken/badkamer raken, wijzigingen met planningsgevolgen, niemand bewaakt het geheel), met de brugzin "Daarom werkt Dimac vanuit één centraal projectoverzicht."
3. Werkmodel: "Eén aanspreekpunt. Meerdere disciplines. Eén plan." Een horizontale fasestrip (Analyse → Planning → Coördinatie → Uitvoering → Afwerking) met daaronder de disciplines als één samenhangend raster binnen dezelfde omkadering, niet als losse dienstkaarten.
4. Twee klantpaden: "Waar sta je vandaag?" met twee visueel gelijkwaardige kaarten (project bekend / geen idee waar te beginnen).
5. Diensten als capaciteiten, kort, met doorklik naar de intentiepagina's.
6. Woningscan-teaser als kernproduct: wat wordt beoordeeld, voor wie, wat het oplevert. CTA "Bekijk hoe de woningscan werkt".
7. Uitgelichte realisaties: drie cases met titel, gemeente, projecttype en één zin uitdaging, doorklik naar de casepagina.
8. Werkwijze in het kort, met doorklik.
9. Team (leeg tot foto's er zijn).
10. Reviews (leeg tot echte reviews er zijn).
11. Werkingsgebied: de gemeenten, gelinkt aan de regiopagina's.
12. Slot-CTA: "Bespreek je project", met de woningscan als zachte tweede optie.

Alles wat daarna nog herhaalt (dubbele positioneringsblokken, herhaalde offerte-CTA's) verdwijnt.

## 2. Realisaties als cases

Nieuw databestand met projecten: titel, gemeente, projecttype, situatie, uitdaging, aanpak, resultaat, beelden, gerelateerde diensten en een `confirmed`-vlag. De vijf aangeleverde cases komen erin met `confirmed: false`, waardoor ze in de preview zichtbaar zijn maar niet in de sitemap staan en `noindex` krijgen tot je ze bevestigt.

- `/realisaties`: overzicht met filter op projecttype, kaarten met gemeente en type.
- `/realisaties/:slug`: casepagina met de vier blokken, beelden, gerelateerde diensten en CTA "Een gelijkaardig project bespreken?".
- Diensten- en regiopagina's linken naar de relevante cases in plaats van naar een galerij.

## 3. Dienstenpagina's als intentiepagina's

De bestaande `ServicePage` wordt uitgebreid met twee blokken: gerelateerde disciplines en een echte case. Ontbrekende diensten worden toegevoegd volgens hetzelfde stramien: dakwerken en warmtepompen/hernieuwbare energie, naast de bestaande totaalrenovatie, badkamer, keuken, elektriciteit en sanitair. De woningscan behoudt haar eigen conversiepagina.

## 4. Woningscan-landingspagina

De bestaande pagina wordt conversiegericht herschikt: probleem, wat er beoordeeld wordt, voor wie, wat je krijgt, hoe het verloopt, wat het voorkomt, FAQ, één duidelijke CTA. De plek voor de verrekeningsvoorwaarde staat klaar en blijft leeg tot je de exacte formulering bevestigt.

## 5. CTA-hiërarchie

Per bewustzijnsniveau één CTA: "Bekijk onze aanpak" bovenaan de funnel, "Bekijk een vergelijkbaar project" bij dienstinteresse, "Ontdek de woningscan" bij twijfel, "Bespreek je project" bij hoge intentie, "Vraag een offerte aan" alleen op het slotmoment van contact. De navigatie-CTA wordt "Bespreek je project".

## 6. Formulier

Het contactformulier wordt teruggebracht tot: naam, e-mail, telefoon, gemeente, type project, korte omschrijving en een optionele startperiode. Geen technische details in stap één.

## 7. Navigatie

Diensten (dropdown met de intentiepagina's), Realisaties, Woningscan, Werkwijze, Over Dimac, Contact, plus de CTA-knop. Blog en regio blijven bereikbaar via de footer.

## 8. Herbruikbare contentcomponenten

Case-kaart, FAQ-blok, reviewkaart, teamkaart, before/after-beeld en videoblok worden als losse componenten gebouwd die op elke pagina vanuit data gevoed worden, zodat nieuwe content zonder codewerk kan worden toegevoegd.

## 9. Meting

Een kleine `track()`-helper die naar `window.dataLayer` pusht, aangeroepen bij `view_service`, `view_project`, `woningscan_click`, `project_contact_start`, `project_contact_submit`, `phone_click` en `email_click`. Geen GA4- of Meta-script, geen ID's, geen nepdata.

## 10. Lokale SEO

Gemeenten blijven natuurlijk verwerkt in cases, dienstteksten, titels, metadata en FAQ. Structured data krijgt er `Project`/`CreativeWork`-items voor de cases bij. Geen extra dunne stadspagina's.

## Technische samenvatting

- Nieuw: `src/data/projects.ts`, `src/data/team.ts`, `src/data/reviews.ts` (leeg), `src/pages/RealisatieDetail.tsx`, `src/lib/analytics.ts`, componenten `ProjectCard`, `CaseStudy`, `DisciplineGrid`, `PhaseStrip`, `ReviewCard`, `TeamCard`.
- Aangepast: `Index.tsx`, `Realisaties.tsx`, `Woningscan.tsx`, `Contact.tsx`, `Navbar.tsx`, `ServicePage.tsx`, `services.ts`, `App.tsx`, `scripts/generate-sitemap.ts`.
- Ongewijzigd: `index.css`, `tailwind.config.ts`, kleuren, fonts, logo, reveal-systeem.
- Niet publiceren; controle met typecheck en Playwright-screenshots op 390, 768 en 1280 px.

## Nog nodig van jou

Echte teamfoto's, echte reviews, de exacte woningscan-voorwaarde en bevestiging van de vijf cases. Zonder die gegevens blijven de betrokken blokken leeg of ongeïndexeerd.
