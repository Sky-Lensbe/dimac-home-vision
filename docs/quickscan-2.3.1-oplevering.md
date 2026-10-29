# Quickscan 2.3.1 — controleerbare oplevering

## Vastgestelde oorzaken
- `recommendProduct`: `full || planned >= 3` plus één technisch domein of Q47=ja kon Plus opleveren; werkcategorieën bewezen geen omvang.
- `LINK-SANITAIR-VLOER` leidde uit plannen een generieke leidingaanpak af; `LINK-WERKVOLGORDE` noemde niet-geselecteerde buitenschilwerken.
- Domeinonzekerheden en executive conclusie gebruikten een andere lijst dan de engine, die bovendien slechts vier onbekende items toont; verwarmingstype en toestand konden dubbel verschijnen.
- PDF hoofdstukken begonnen verplicht op een nieuwe pagina; kaarten en aanbeveling waren grote ondeelbare blokken met kleine tekst. VME was een tekstblok en onbekende documenten kregen een dubbelzinnige afwezigheidsformulering.

## Wijzigingen
- `supabase/functions/_shared/quickscan/report.ts`: rapportversie `qs-report-2.3.1`; afzonderlijk testbare `selectedWorks`, `renovationEvidence`, `workSequence`, `connections`, `informationOverview`, `missingTopics`, `coOwnership`.
- `src/components/quickscan/Report23.tsx`: één/twee/drie highlights, vier VME-kaarten, onzekerheden, aankoopchecklist, acht gerichte vragen bij volledig onbekende VME-informatie; historische snapshots zonder extra patchvelden gebruiken de bestaande gegevens.
- `src/lib/quickscanPdf23.ts`: doorlopende hoofdstukken, titels met eerste inhoud bij elkaar, per verband/document/VME-kaart ruimtecontrole, leesbare 8–10pt inhoud, volle-breedte productadvies met werkende links en optionele drone. Algemene afbakening vóór productadvies voorkomt een lege disclaimer-slotpagina.
- `src/test/quickscan-231.test.ts`: 17 nieuwe inhoudelijke tests; `AGENTS.md` en roadmap bijgewerkt.
- `quickscan-submit` opnieuw uitgerold met gedeelde rapportmodule; geen vragen, technische score-engine, catalogus, prijzen, veiligheidsregels of toegangsregels gewijzigd.

## Commerciële keuze
- Plus: minstens twee duidelijke privatieve technische domeinen (bestaande rapportcriterium ≥5), plus expliciet volledige renovatie of geplande technische ingrepen die minstens twee gemelde domeinen raken. Cosmetische categorieën en Q47 alleen zijn onvoldoende.
- Eén duidelijk technisch domein: Woningscan €299, ook bij meerdere cosmetische werken. Hoge barometer alleen is geen Plus-bewijs.
- Kostenvraag en plannen zonder duidelijke technische signalen en zonder sterk beperkte informatie: budgetindicator €39,99, coming_soon, geen bestelknop en geen automatische fysieke vervanging.
- Onvoldoende onderbouwing: terughoudende afsluiting; koper met belangrijke onbekende onderdelen kan gewone Woningscan krijgen. Gemeenschappelijke problemen blijven apart; inspectiebelofte blijft beperkt tot privatieve delen.
- Veiligheid blijft eerst. Drone €125 alleen bij bestaand dakadvies en fysiek pakket, nooit vooraf geselecteerd.

## Verbanden en zekerheid
- Sanitair/vloeren: conditionele afstemming; gemelde afvoerproblemen onderscheiden van leeftijd of plannen. Geen claim dat leidingen vervangen moeten worden.
- Werkvolgorde: alleen werkelijk geselecteerde werken, geen dak/gevel/isolatie bij cosmetisch traject. Geen verband indien niet onderbouwd, maximum twee.
- Eén lijst van unieke privatieve technische onderwerpen voor domeinkaarten en detail; type/toestand verwarming samen. Conclusie gebruikt kwalitatieve onzekerheidstaal. VME onzekerheid apart, geen verzonnen bedragen of afwezigheidsclaims.

## Werkelijk uitgevoerde controles
- Definitieve volledige Vitest-run: **7 bestanden, 205/205 tests geslaagd**, waarvan **17 nieuw**. Alle oorspronkelijke 188 regressietests behouden.
- Echte publieke registratie in localhost-preview met synthetisch complex woningprofiel: HTTP 200, serverrapportversie 2.3.1, Woningscan Plus €449; schermrapport en PDF-download werkten.
- Klik op aanbevolen Plus: juiste pakketparameter en rapportreferentie, totaal €449, drone uit; geen antwoorden/persoonsgegevens in URL.
- Testlead en rapport verwijderd; databasecontrole bevestigde beide tellingen 0.
- VME-presentatie geïsoleerd weergegeven met echte component en synthetische antwoorden op 1280×1800 en 390×844; geen paginafouten, geen mobiele horizontale overflow; acht gerichte syndicusvragen.
- Vier PDF-profielen met werkelijke PDF-generator: cosmetisch **5 pagina’s**, onbekende VME **6**, complex/Plus **5**, één highlight **4**. Pagina’s gerasterd en visueel geïnspecteerd tijdens correctieronde; losse koppen en vrijwel lege disclaimer-slotpagina gecorrigeerd.
- Playfair Display en Inter ingebed bevestigd via PDF-fontinspectie; originele lokale exports van bestaande fontassets gebruikt voor lokale controle. Origineel logo uit bestaande website-export zichtbaar in PDF.
- Previewcontrole: nieuwste buildmelding **build OK**.

## Beperkingen en behouden toestand
- Geen vaste driepagina-PDF: omvang volgt inhoud en leesbaarheid. Sommige korte profielen houden royale witruimte; geen belofte van optimale paginadichtheid voor alle mogelijke antwoordcombinaties.
- Lokale asset-URL’s leveren fonts niet betrouwbaar: visuele fontcontrole gebruikte de oorspronkelijke bestanden via browser-testinterceptie. Hosted assetlevering is hiermee niet end-to-end bevestigd. App blijft originele assetpointers gebruiken; geen nieuwe logo’s of fonts toegevoegd.
- PDF-links blijven bestaande absolute `www.dimac.be`-routes; daadwerkelijke publieke bereikbaarheid wacht op livegang/domeininstelling. Pakketselectie is lokaal gecontroleerd.
- Appartement-VME is visueel en synthetisch getest; geen tweede echte appartementinschrijving uitgevoerd. Oude snapshots zijn getest op ongewijzigde versie/aanbeveling, niet als iedere historische PDF-variant opnieuw gecontroleerd.
- Testmodus en e-mailconfiguratie ongewijzigd, geen e-mails verstuurd en niets gepubliceerd. Bestaande open punten rond geverifieerd verzenddomein, beheerder en productreview blijven buiten deze patch.
## Addendum: PDF-layout- en paginatiefix (29 oktober 2026, tweede ronde)

**Oorzaak van de beoordeelde lege pagina:** de beoordeelde PDF was door een verouderde bundle gegenereerd — hij toonde de disclaimer ná de aanbeveling, terwijl de actuele code die er vóór zet. De downloadketen is geverifieerd correct: `Quickscan.tsx` → `buildReportPdf()` → dynamische import van `buildReportPdf23()` voor `v23`-snapshots; oudere snapshots behouden de legacy-generator.

**Werkelijk gevonden en hersteld in `src/lib/quickscanPdf23.ts`:**
1. `startSection(minHeight)` reserveerde titel + volledig eerste blok; vervangen door `keepWithNext(headingH, firstBlockH)` — een titel breekt alleen wanneer titel én eerste keep-together-blok niet meer samen passen.
2. Het blok "Grenzen van de Quickscan" tekende tekst zonder `y` bij te werken — de aanbeveling kon eroverheen tekenen. Nu `y += h`.
3. De aanbeveling reserveerde tot een volledige pagina (`ensure(Math.min(recommendationHeight, ...))`) waardoor een bijna lege pagina ontstond; nu keep-with-next (lijn + eyebrow + titel) en doorlopende deelblokken.
4. De adviestitel werd gemeten met het verkeerde actieve lettertype (`lines()` vóór `font()`), waardoor de toelichting de titel overlapte; nu eerst font, dan meten.
5. De adviessectie toonde een titel zonder inhoud wanneer er geen acties zijn; nu alleen gerenderd bij `v.actions.length`.

**Visuele regressietest:** vier profielen opnieuw gegenereerd met de actuele code en echte fonts (eenvoudig 3p, highlights 5p, renovatie+drone 6p, appartement-VME 6p), per pagina als afbeelding gecontroleerd plus contact sheets. Geen verweesde conclusiepagina, geen verweesde titels, geen overlap, correcte kop-/voetteksten en paginanummers. 205/205 tests en typecheck groen.
