# Quickscan 2.3.3 — oplevering

Datum: 9 november 2026. Status: geïmplementeerd in preview, testmodus (MAIL_MODE=test), niets gepubliceerd, geen serveruitrol.

## Aanvullende kwaliteitsaudit — Final Quality & Email Delivery

De eerdere testtelling hieronder blijft een historisch resultaat, maar drie acceptatieclaims zijn nog niet afdoende bewezen:
- De invariantietest gebruikt de huidige engine aan beide kanten; onafhankelijke vergelijking met de oorspronkelijke ongewijzigde 2.3.2-engine ontbreekt.
- Historische PDF-generatie en inhoudstests bewijzen geen behoud van de oorspronkelijke layout. Een oorspronkelijke renderer en geanonimiseerde referenties voor 2.3, 2.3.1 en 2.3.2 moeten worden geverifieerd, inclusief pagina-aantallen, positionering en hyperlinks.
- Vier gebruikersgerichte informatiedekkingsniveaus zijn nog niet volledig geïmplementeerd; bestaande interne niveaus en productroutering blijven behouden.

De eerste audit had geen nieuwe tests uitgevoerd. De lokale uitvoering hieronder heeft inmiddels aanvullende tests uitgevoerd; de onafhankelijke oorspronkelijke referenties blijven open. Bestaande snapshots zijn niet gewijzigd.

### Transactionele rapportlevering — onderzoeksstatus

Er is geen e-maildomein voor Lovable Emails ingesteld, geen beschikbare Resend-verbinding en geen geconfigureerde Resend-secret aangetroffen. SPF, DKIM, DMARC, providerlimieten en aflevering zijn niet geverifieerd. Lovable Emails ondersteunt geen PDF-bijlagen; de aangevraagde bijlage wordt daarom niet stilzwijgend door een link vervangen. Het voorstel kiest de door DIMAC genoemde Resend-oplossing, onder voorbehoud van koppeling en verificatie.

De huidige PDF wordt lokaal uit de snapshot opgebouwd. Server-side hergebruik vereist een runtime-onafhankelijke renderer en aantoonbare font-, logo-, inhouds- en layoutpariteit. Het voorstel omvat een duurzame verzendopdracht, beveiligde verwerking, begrensde retries, ondertekende aflevermeldingen en waarheidsgetrouwe status. Er zijn nog geen wijzigingen aan de gedeelde database, opslag, secrets, DNS of serverfuncties uitgevoerd; geen mails verstuurd en niets gepubliceerd. MAIL_MODE blijft test.

## Final Quality — lokaal werkelijk uitgevoerd

### Resultaten
- Automatische tests: **330/330 geslaagd, 12 testbestanden**, inclusief 38 nieuwe tests (13 kwaliteit/PDF-isolatie, 18 mailbeleid, 7 worker). De vroegere 292 blijven onderdeel van deze reeks. Mailtests gebruiken gesimuleerde poorten, geen echte provider.
- Previewcontrole: laatste beschikbare controle `build OK` op 9 november 2026 om 12:25:29 UTC, inclusief automatische typecontrole. Geen afzonderlijke handmatige build/typecheck uitgevoerd.
- Lokale Deno/jsPDF-generatie: vijf volledige synthetische snapshots met **originele Playfair Display-/Inter-fonts en DIMAC-logo**, verplichte assetcontrole zonder stilzwijgende fallback. Pagina-aantallen: **5 / 7 / 7 / 7 / 5**. Oorspronkelijke assets via de projectassetdienst gelezen, geen nieuwe uploads.
- Visuele PDF-controle: laatste pagina van Halen, woning 1976 en recente rijwoning bekeken. De recente rijwoning toont nu de hele aanbeveling, prijs, beschikbaarheid en link samen in plaats van alleen de laatste link/slottekst. Halen toont geen betaald product, maar de laatste pagina blijft ruim leeg: verdere verdichting nodig. Woning 1976 heeft prijs/drone/CTA samen, maar de producttitel staat op de vorige pagina: commerciële samenhang nog niet volledig aanvaard. Niet iedere pagina van alle PDF's visueel nagekeken.
- Echte browsercontrole: gemigreerde 2.3.2-appartementsessie heropend op 1280 en 390 px; nieuwe BJ01-vraag verschijnt, uitleg zichtbaar onder de bovenbalk, geen horizontale overflow. De eerste locator gebruikte de woningtekst en vond nul matches; de zichtbare appartementtekst daarna correct bevestigd op beide formaten. Logo in lokale browser niet beschikbaar via de relatieve assetdienst; server-PDF-logo wel bewezen aanwezig.
- Geen volledige server-side inzending/opslagtest, dashboardtest, echte provideroproep of mailboxontvangst. Geen synthetische databasegegevens aangemaakt, dus geen cleanup of mutatie aan bestaande data nodig.

### Vergelijking vijf cases — huidige lokale uitkomsten
| Case | Domeinscores B/V/E/T/S | Barometercategorie | Informatieniveau | Product | PDF-pagina's |
|---|---|---|---|---|---|
| Tessenderlo | 5 / 5 / 0 / onbekend / 0 | enkele | 3 | Woningscan €299, geen drone | 5 |
| Halen | 0 / 0 / 0 / onbekend / 0 | beperkt | 3 | geen betaald product | 7 |
| Woning 1962 | 6 / 0 / 9 / 8 / 0 | verhoogd | 1 | Plus €449, drone optioneel | 7 |
| Woning 1976 | 6 / 10 / 9 / 3 / 0 | verhoogd | 1 | Plus €449 | 7 |
| Recente rijwoning | 0 / 0 / 1 / 0 / 0 | beperkt | 1 | budgetindicator €39,99, binnenkort, niet bestelbaar | 5 |

De productaanbevelingen blijven volgens de vijf bestaande regressietests behouden. De extra informatieniveaus wijzigen geen interne codes of routing. Dit is **geen onafhankelijke vergelijking met de oorspronkelijke 2.3.2-engine**: die bron ontbreekt nog. Veiligheid, condenssemantiek, asbest, documenten, verbanden en fasen zijn opnieuw getest binnen de bestaande suite; geen nieuwe volledige visuele audit van elk rapportonderdeel geclaimd.

### Gewijzigde bestanden in deze lokale ronde
- `supabase/functions/_shared/quickscan/report.ts`: presentatieclassificatie met vier niveaus, toepasselijke kernvragen, private/common filtering, additief `v233.coverage`; geen scoreregelwijziging.
- `supabase/functions/_shared/quickscan/pdf/art.ts`: verplaatste gedeelde lijnkunst; `src/lib/reportArt.ts` exporteert dezelfde bron.
- `supabase/functions/_shared/quickscan/pdf/render233.ts`: runtime-onafhankelijke PDF, geïnjecteerde fonts/logo/formatting, strenge assetcontrole, vier niveaus, compacte klikbare wettelijke bronnen en aanbevelingsreservering.
- `supabase/functions/_shared/quickscan/pdf/historical-frozen.ts`: lokale historische renderer afgescheiden vóór verdere nieuwe paginering; **geen authentiek oorspronkelijke 2.3.2-renderer**. SHA-256 `6b147f570f75fce5c4dfcc7828f91aee2a90c1baf8db92b8941e561ba8ebc9fe`.
- `src/lib/quickscanPdf23.ts`: expliciete dispatcher op opgeslagen versie; injectie van bestaande assets en formatting.
- `src/components/quickscan/Report23.tsx`: optionele opgeslagen dekkingslabels met historische fallback.
- `supabase/functions/_shared/quickscan/delivery.ts`: uitgeschakeld testbeleid, centrale afzender, idempotentiesleutels, statusovergangen, vijf pogingen, Retry-After en HTML/tekstmail.
- `supabase/functions/_shared/quickscan/delivery-worker.ts`: lokaal testbare worker zonder productie-adapters; alleen opgeslagen snapshot als PDF-bron, testontvangercontrole, onduidelijke provideruitkomst naar beoordeling.
- `docs/proposals/quickscan-email-outbox.sql`: **niet-toegepast en onvolledig SQL-voorstel**, RLS/grants, unieke opdracht, auditstructuur, atomair claimen. Bewust buiten de migratiemap.
- `src/pages/Quickscan.tsx`: waarheidsgetrouwe huidige status, gevraagde rapporttitel/downloadknop, PDF-foutafhandeling.
- `src/pages/AdminQuickscan.tsx`: labels voor de voorbereide statuswaarden; geen nieuwe backendquery of actieve retryknop.
- `src/pages/Privacy.tsx`: bestaande Quickscan-opslag correct onderscheiden van mailto-formulieren; maillevering niet actief, commerciële toestemming niet verplicht. Nog geen definitieve juridische goedkeuring/bewaartermijn.
- `src/test/quickscan-quality-final.test.ts`, `quickscan-delivery.test.ts`, `quickscan-worker.test.ts`: 38 nieuwe tests.
- `scripts/check-quickscan-server-pdf.ts`: herhaalbare lokale Deno-PDF-proef, synthetische snapshot plus gecontroleerde assets, geen provider/backend.
- `AGENTS.md`, `roadmap.md`, dit document: architectuurregels, echte resultaten en blockers.

### Transactionele rapportlevering — nog niet operationeel
De voorbereiding is niet deploybaar of productie-klaar: geen Resend-adapter, providerkoppeling, webhookverificatie, duurzame volledige finish/enqueue-transactie, scheduler, bezoekerstatuscapability, gecontroleerde beheerretry of onderdrukking van bounce/klacht actief. Rapportnummerbotsingen en concurrerende rate limiting moeten nog achter de registratiegrens worden opgelost. De mailworker heeft alleen gesimuleerde afhankelijkheden; de bestaande `quickscan-submit` is onaangeroerd en MAIL_MODE blijft test.

Providerroute (gateway/direct), echte idempotentieperiode, kosten/limieten, DNS, API-secret, afleverwebhooks en mailboxbewijs vereisen aparte configuratiefase. HTML/tekstmail is voorbereid; geen echte mailclienttest uitgevoerd. Geen privacygevoelige PDF-opslag of publieke rapportlink toegevoegd.

### Onafhankelijke referenties en blockers
Geen aantoonbaar oorspronkelijke 2.3.2-engine of PDF-renderer gevonden; beschikbare CLI-diagnostiek kan de uitgerolde bron niet exporteren en een externe download heeft geen beschikbare beheerautorisatie. De lokale rollbackkopie is 2.3.1 en geen vervanging voor 2.3.2.

De nieuwe historische isolatietests vergelijken 2.3/2.3.1-dispatch met de vóór deze correcties vastgezette lokale renderer (PDF-bytes genormaliseerd voor datum/ID), niet met oorspronkelijke release-PDF's. Echte geanonimiseerde 2.3.2-snapshot/layoutreferentie, onafhankelijke pixel/positie-/hyperlinkbaseline voor alle drie oude versies en oorspronkelijke engine blijven nodig. Dit kan niet eerlijk als volledige historische acceptatie worden afgevinkt.

### Rollback en volgende toestemming
Geen gedeelde wijzigingen uitgevoerd: nu geen backendrollback nodig. Voor latere testuitrol eerst exacte functies/migratie/configuratie laten goedkeuren en werkelijk uitgerolde vorige versies veilig exporteren. Stop bij terugdraaiing eerst worker/planning, herstel vorige functies en testmodus, behoud snapshots/auditdata. Alleen herkenbare synthetische testgegevens verwijderen. Live, publicatie, betalingen en mails naar bezoekers blijven niet toegestaan.

## Versies

- Vragen: `qs-questions-2.3.3` (nieuwe contextvraag BJ01, nieuwe neutrale Q29-optie)
- Scoreregels en veiligheidsregels: ongewijzigd `qs-rules-2.2.2`
- Rapport: `qs-report-2.3.3`, additieve extensie `v233`
- Sessiesleutel: `dimac-quickscan-v2.3.3` (migratie vanuit 2.3.2, 2.2.1, 2.2 en 2.1)

## Wijzigingen per bestand

- `supabase/functions/_shared/quickscan/engine.ts` — vraagversie 2.3.3; BJ01 (bouwjaarverduidelijking 1991–2010, geen score); Q29 neutrale optie "Geen zichtbare schimmel, alleen condens" (geen score); vochtbudget basis 4 zodat locatie, frequentie, aard en timing nooit wegvallen; gebruikerslabels informatiedekking zonder volledigheidssuggestie (interne niveaucodes ongewijzigd).
- `supabase/functions/_shared/quickscan/report.ts` — rapportversie 2.3.3 + extensie `v233`; `asbestosContext()` BJ01-bewust (vanaf 2001 → geen attestplichtmelding, tenzij toepassingen gemeld); condens/schimmel-semantiek in bevindingstitels, -teksten en verbanden (schimmel alleen bij eigen melding); verbandranking met bonussen voor actief water, terugkeer en veiligheid; dakisolatie-caption met exacte antwoordgegevens; renovatiefasen noemen uitsluitend geselecteerde werken; `documents233()` met beschikbaarheid, inhoud en relevantie; VME-syndicusvragen thematisch gebundeld (max. vijf, geen doublures); persoonlijke conclusie `conclusion233()`; `v23.findings` additief toegevoegd; asbest-VME-melding en -document weg bij bevestigd bouwjaar vanaf 2001.
- `src/lib/quickscanSession.ts` — nieuwe sleutel, expliciete migratie 2.3.2 → 2.3.3 (hervat in vragenlijst; nieuw toepasselijke vragen zoals BJ01 worden alsnog gesteld).
- `src/components/quickscan/Report23.tsx` — geversioneerd renderpad: `v233` (persoonlijke conclusie, inhoudslabels bij documenten) met ongewijzigde terugval voor 2.3/2.3.1/2.3.2-snapshots.
- `src/lib/quickscanPdf23.ts` — zelfde geversioneerde pad; inhoudslabels in documentenkaarten; laatste link en slotblok blijven samen zodat de laatste pagina nooit een losse slotzin bevat.
- `src/test/quickscan-233.test.tsx` — 42 nieuwe tests (zie hieronder).
- Bestaande tests bijgewerkt waar de goedgekeurde wijzigingen de oude aannames introden (versies, vochtbudget, BJ01-premisse, sessiesleutel).

## Vergelijking van de vijf praktijkcases

| Case | Probleem uit 2.3.2 | Resultaat 2.3.3 |
|---|---|---|
| 01 Tessenderlo (2020, EPC A, tocht + condens, geen schimmel) | Condens verscheen als schimmel | Bevinding "Terugkerende condens", verband "Condens rond ramen" met "zonder zichtbare schimmel"; geen asbestwaarschuwing; Woningscan € 299, geen drone |
| 02 Halen (appartement 2007, EPC A, P/G D, VME-werken) | Negen overlappende syndicusvragen; asbestmelding door bouwperiode | Vier thematische kernvragen zonder doublures; BJ01 "vanaf 2001" → geen attestmelding; privatieve barometer onveranderd; geen betaald product (NONE-VME) |
| 03 woning 1962 (koper, EPC F, dakslijtage, geen dakisolatie, elektriciteit) | Sanitaire werken in traject zonder melding; vage dakisolatietekst | Traject noemt alleen dak, isolatie, elektriciteit, verwarming; caption "Volgens uw antwoorden is het dak niet geïsoleerd."; renovatieverplichting met bron; Plus € 449 met optionele drone |
| 04 woning 1976 (eigenaar, EPC F, keldervocht na regen, waterinstroom) | Keldervocht kreeg onvoldoende prioriteit | Actief-waterverband staat eerste; fase A onderzoekt eerst de vochtbron; geen fictieve deadline; Plus € 449 |
| 05 recente rijwoning (EPC B, vloeren + interieur, kostenvraag) | Keuken/badkamer verzonnen; overbodige checklist | Traject noemt alleen vloeren en interieur; documentenlijst beperkt tot EPC en keuring; budgetindicator € 39,99 "Binnenkort beschikbaar", geen bestelknop, geen drone |

## Testresultaten (werkelijk uitgevoerd)

- Automatische tests: 292/292 geslaagd (9 bestanden), waarvan 42 nieuwe 2.3.3-tests: score-invariantie (identieke antwoorden → identieke domeinscores, barometer en veiligheid), condens/schimmel-semantiek, BJ01 in alle rapportlagen, verbandprioriteit, fasen zonder niet-gemelde werken, documentdimensies, VME-bundeling, persoonlijke conclusie, vijf cases, randgevallen, sessiemigratie, historische snapshots 2.3 en 2.3.1 (onveranderde inhoud, online én als PDF).
- Typecheck: geslaagd, geen fouten.
- Build: OK (preview).
- Lokale PDF-generatie: vijf case-PDF's gegenereerd en visueel gecontroleerd (5–7 pagina's); geen lege adviestitels, geen verweesde slotzin, documentlabels en VME-vragen correct.
- Browsercontrole: nieuwe bouwjaarvraag verschijnt correct na "1991 – 2010" met uitleg en drie opties; mobiele weergave (390 px) zonder overlap met de bovenbalk.

## Niet uitgevoerd (bewust)

- Server-side end-to-end (inzending → opslag → rapport): wacht op afzonderlijke uitroltoestemming voor `quickscan-submit`.
- Publicatie, e-mail buiten testmodus, betaalfuncties: niet geactiveerd.
- Dashboardtest met beheerdersaccount: wacht op account.
