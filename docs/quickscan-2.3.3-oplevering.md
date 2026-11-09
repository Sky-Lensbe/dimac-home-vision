# Quickscan 2.3.3 — oplevering

Datum: 9 november 2026. Status: geïmplementeerd in preview, testmodus (MAIL_MODE=test), niets gepubliceerd, geen serveruitrol.

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
