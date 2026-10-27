# DIMAC Quickscan 2.1 — vragenlijst, logica en rapport bijwerken

Gerichte aanpassing van de bestaande Quickscan. Geen herbouw, geen nieuwe betaalde functies, geen publicatie, testmodus (alleen info@sky-lens.be) blijft ongewijzigd.

## Wat verandert voor de bezoeker

1. **Bouwjaar**: Vóór 1945 · 1945–1969 · 1970–1990 · 1991–2010 · Vanaf 2011 · Weet ik niet. Bij appartement: "Wanneer werd het appartementsgebouw gebouwd?". Regels die vroeger voor "vóór 1970" golden, gelden voor beide oudste categorieën. Bouwjaar telt nooit als gebrek.
2. **Renovatieleeftijd** (dak, ramen, verwarming, …): 0–5 · 6–10 · 11–20 · Meer dan 20 jaar geleden · Weet ik niet.
3. **Vocht**: enkel Geen gekende problemen · Terugkerende condens of schimmel · Vochtplekken · Weet ik niet. Vervolgvragen (waar, wanneer, meerdere ruimtes) direct erna.
4. **Scheuren**: optie "Onverklaarde scheuren" verdwijnt; waarschuwing bij grote/toenemende scheuren blijft.
5. **Verwarming** in vier stappen: type → leeftijd → werking → onderhoud (onderhoud enkel waar relevant). Collectieve verwarming/warmtenet bij appartementen weegt niet als eigen verantwoordelijkheid. Gaslucht/CO-alarm geeft meteen een veiligheidsmelding.
6. **Elektriciteit, ventilatie, sanitair**: eerst wat aanwezig/bekend is, dan toestand, dan problemen. Rook/vonken/brandlucht-melding blijft.
7. **Volgorde** volgens de vier stappen uit het document (Uw woning · Bouwkundige toestand · Energie en installaties · Renovatieplannen); vervolgvragen komen onmiddellijk na hun onderwerp.
8. **Timing**: Binnen twee weken · Binnen drie maanden · Binnen het jaar · Later dan een jaar · Weet ik nog niet, met vraagtekst afhankelijk van eigenaar / kandidaat-koper / algemene interesse. Timing beïnvloedt de barometer nooit.
9. **Appartementroute** in dezelfde vragenlijst: privatieve vs. gemeenschappelijke delen, plus vragen over geplande VME-werken, reservefonds, bijzondere bijdragen, verslagen algemene vergadering. Rapport krijgt een apart onderdeel "Gemeenschappelijke delen en mogelijke toekomstige kosten" met de gevraagde voorbehouden, zonder bedragen.
10. **Voortgang**: "Stap X van 4 — titel" in plaats van "Vraag X van circa N"; balk blijft, gaat nooit achteruit.
11. **Vervolgstap in rapport**: geen automatische Basis/Compleet-pakketadvies of prijzen meer; in de plaats een productneutrale, vrijblijvende professionele vervolgstap.

## Wat gelijk blijft

Vijf domeinen en hun gewichten, "Weet ik niet telt niet als nul", categorie "Onvoldoende informatie", rapportopbouw en adviesteksten (alleen geraakte teksten bijgewerkt), leadopslag, beheerpagina-beveiliging, testmodus, andere pagina's.

## Technische details

- Alles in `supabase/functions/_shared/quickscan/engine.ts` (gedeeld browser/server); vraag- en antwoord-ID's, `showIf`, scores, flags, `visibleQuestions/activeAnswers/isComplete` en rapport bijwerken. Veiligheidsvervolgvragen vallen nooit weg door de beperking op vervolgvragen.
- Versie van vragenbank/regels verhogen (bv. `2.1`); bewaarde rapporten behouden hun oude versie en inhoud. Server berekent opnieuw met v2.1.
- Halfingevulde sessies: opgeslagen antwoorden met oude/ongeldige antwoord-ID's worden bij laden verwijderd (sessie-sleutel naar v2), zodat de vraag opnieuw gesteld wordt. Server weigert onbekende antwoord-ID's.
- `packageAdvice` niet meer in het rapport tonen; PDF en `ReportView` krijgen de neutrale vervolgstap en het appartementsonderdeel.
- `Quickscan.tsx`: dynamische vraagtekst, voortgangstekst per stap.
- Edge function opnieuw deployen; geen databasewijziging verwacht (versie zit al per rapport opgeslagen — wordt bij bouw gecontroleerd).
- Tests in `src/test/quickscan.test.ts` uitbreiden met de 22 scenario's uit het document waar automatisch testbaar; daarna één volledige doorloop in de browser (woning en appartement) met verwijdering van de testinzending.

## Open punten voor DIMAC na oplevering

Inhoudelijke bevestiging van nieuwe vraagteksten, appartementsvragen, scoregewichten van nieuwe antwoorden en de tekst van de neutrale vervolgstap.
