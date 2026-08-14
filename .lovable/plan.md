# Dimac: van bouwsite naar conversiegerichte customer journey

De visuele identiteit blijft ongewijzigd: wit, charcoal, Dimac-oranje als accent, Playfair voor editoriale koppen, Inter voor UI en body, echte projectfotografie, ingetogen animatie. Wat verandert is de informatiearchitectuur, de verhaallijn en de conversielogica. Elke sectie beantwoordt één vraag van de bezoeker en leidt naar één volgende stap.

Centrale boodschap: Dimac bewaakt de samenhang tussen planning, technieken en uitvoering, met één aanspreekpunt. Geen losse dienstenlijst.

## Inhoudelijke integriteit

- Geen verzonnen bedrijfsfeiten, reviews, teamleden, attesten of commerciële voorwaarden.
- De vijf aangeleverde cases komen in één projectdatamodel (`title`, `slug`, `municipality`, `projectType`, `summary`, `situation`, `challenge`, `approach`, `result`, `images`, `relatedServices`, `confirmed`, `isTestContent`) met `confirmed: false` en `isTestContent: true`, plus een developer comment dat verificatie vereist is. Ze zijn zichtbaar in preview, maar krijgen `noindex`, staan niet in de sitemap en leveren geen publieke structured data. Bij `confirmed: true` schakelt dat alles vanzelf om. Publiek verschijnt nergens een label.
- Team en reviews: lege data-arrays. Is de array leeg, dan rendert de sectie niet. Geen placeholderpersonen, geen stockportretten, geen verzonnen citaten.
- Woningscan: geen korting of verrekening. Het datamodel krijgt `commercialCondition: null`; zolang dat leeg is, rendert er niets.


## Homepage, nieuwe volgorde

1. **Hero** — "Renoveren zonder zelf alles te moeten coördineren." met de aangeleverde ondertitel, CTA's "Bespreek je project" en "Ontdek de woningscan", en de subtiele regioregel. Bestaande hero-foto en mobiele overlay blijven. Geen badges, iconen of cijfers.
2. **Probleemherkenning** — "Een renovatie wordt pas complex wanneer alles op elkaar moet aansluiten." Vier korte, feitelijke punten (afhankelijke planningen, technieken die vloer/keuken/badkamer raken, wijzigingen met gevolgen, versnipperd overzicht), afgesloten met "Daarom bewaakt Dimac de samenhang tussen planning, technieken en uitvoering." Herkenning, geen angst.
3. **Werkmodel** — "Eén aanspreekpunt. Meerdere disciplines. Eén plan." Een rustige horizontale fasestrip (Analyse → Planning → Coördinatie → Uitvoering → Afwerking) met daaronder de acht disciplines binnen dezelfde omkadering, verbonden door hairlines in plaats van acht losse kaarten, plus de ondersteunende zin. Architecturaal, geen corporate diagram.
4. **Twee klantpaden** — "Waar sta je vandaag?" met twee visueel gelijkwaardige kaarten en de aangeleverde koppen, teksten en CTA's ("Bespreek je project" / "Start met een woningscan").
5. **Capabilities** — "Wat Dimac binnen één renovatie kan verbinden": compact, tekstgeleid raster met de acht capabilities, elk doorlinkend naar de eigen intentiepagina. Visueel ondergeschikt aan de journey.
6. **Woningscan** — "Wel plannen om te renoveren, maar geen idee wat eerst moet?" Voor wie, wat beoordeeld kan worden, waarom volgorde telt, wat het oplevert. CTA "Bekijk hoe de woningscan werkt".
7. **Realisaties** — "Zo ziet die aanpak eruit in de praktijk." Drie casekaarten met titel, gemeente, projecttype en beeld.
8. **Werkwijze** — wat er gebeurt na contact: Kennismaking, Project begrijpen, Voorstel/analyse, Planning, Uitvoering, Opvolging. Kort, gericht op onzekerheid wegnemen, en niet overlappend met het werkmodel.
9. **Team** — rendert alleen bij gevulde data.
10. **Reviews** — rendert alleen bij gevulde data.
11. **Werkingsgebied** — Diest, Scherpenheuvel-Zichem, Halen, Tessenderlo-Ham en omliggende gemeenten, natuurlijk verwoord, gelinkt aan de regiopagina's. Geen keywordlijst.
12. **Slotconversie** — "Een renovatie gepland?" met de aangeleverde tekst en beide CTA's.

Bestaande secties die dit herhalen (dubbele positioneringsblokken, herhaalde offerte-CTA's, de neutrale vertrouwenssectie) verdwijnen.

## Realisaties als cases

Nieuw databestand met per project: titel, gemeente, projecttype, situatie, uitdaging, aanpak, resultaat, beelden, gerelateerde diensten, `confirmed`.

- `/realisaties`: overzicht met filter op projecttype.
- `/realisaties/:slug`: de vier blokken, daarna de fotogalerij, dan "Een gelijkaardig project bespreken?" met CTA "Bespreek je project".
- Diensten- en regiopagina's linken naar de relevante case in plaats van naar een galerij.

## Dienstenpagina's als intentiepagina's

Structuur per pagina: hero, klantprobleem, aanpak van Dimac, wat inbegrepen is, verwante disciplines, relevante case, proces, FAQ, CTA. De bestaande `ServicePage` krijgt de blokken verwante disciplines en case erbij. Dakwerken en warmtepompen/hernieuwbare energie worden toegevoegd naast totaalrenovatie, badkamer, keuken, elektriciteit en sanitair. De woningscan behoudt haar eigen conversiepagina, herschikt volgens dezelfde logica.

## Navigatie en CTA-strategie

Navigatie: Diensten (dropdown), Realisaties, Woningscan, Werkwijze, Over Dimac, Contact, met knop "Bespreek je project". Blog en regio blijven in de footer. Mobiel blijft eenvoudig.

CTA's volgen intentie: "Bekijk onze aanpak" laag in de funnel, "Ontdek deze dienst" bij dienstinteresse, "Bekijk het project" bij bewijs, "Start met een woningscan" bij twijfel, "Bespreek je project" bij hoge intentie, "Vraag een offerte aan" alleen op het contactmoment.

## Formulier

Naam, e-mail, telefoon, gemeente, type project, korte omschrijving en optioneel de gewenste startperiode. Geen technische details bij eerste contact.

## Content operations

Herbruikbare, datagedreven componenten voor cases, projectbeelden, video, FAQ's, inzichten, reviews, teamleden, before/after en dienstspecifieke content. Nieuwe content wordt toegevoegd door data aan te vullen, niet door pagina's te herbouwen.

## Meting

Een `track()`-helper die naar `window.dataLayer` pusht met een consistent schema (`event`, `page_type`, `item_id`, `cta_label`). Events: `view_service`, `view_project`, `woningscan_view`, `woningscan_click`, `project_contact_start`, `project_contact_submit`, `phone_click`, `email_click`, `navigation_cta_click`. Geen GA4- of Meta-script, geen ID's, geen nepdata.

## Lokale SEO

Gemeenten natuurlijk verwerkt in cases, dienstteksten, titels, metadata, FAQ en structured data. Cases krijgen structured data mee zodra ze bevestigd zijn. Geen extra dunne gemeentepagina's.

## Mobiel en performance

Compacte hero-hoogte, leesbare typografie, duidelijke CTA-hiërarchie, stapelende paden, swipebare galerij, compact formulier, direct bruikbare telefoon-CTA, ingetogen animatie. Responsieve beelden met `srcset`, moderne formaten waar mogelijk, lazy loading onder de vouw, expliciete afmetingen tegen layout shift.

## Technische samenvatting

- Nieuw: `src/data/projects.ts`, `src/data/team.ts`, `src/data/reviews.ts`, `src/pages/RealisatieDetail.tsx`, `src/lib/analytics.ts`, componenten `PhaseStrip`, `DisciplineGrid`, `ProjectCard`, `CaseStudy`, `ProjectGallery`, `TeamCard`, `ReviewCard`.
- Aangepast: `Index.tsx`, `Realisaties.tsx`, `Woningscan.tsx`, `Werkwijze.tsx`, `Contact.tsx`, `Navbar.tsx`, `ServicePage.tsx`, `services.ts`, `App.tsx`, `scripts/generate-sitemap.ts`.
- Ongewijzigd: `index.css`, `tailwind.config.ts`, kleuren, fonts, logo, reveal-systeem.
- Niet publiceren. Controle met typecheck en Playwright-screenshots op 390, 768 en 1280 px.

## Nog nodig van jou

Echte teamfoto's, echte reviews, bevestiging van de vijf cases en, indien van toepassing, de exacte woningscan-voorwaarde. Tot dan blijven die blokken leeg of ongeïndexeerd.
