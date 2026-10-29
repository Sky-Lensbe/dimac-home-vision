# Quickscan 2.3 — Architectural Intelligence

Een nieuw rapport (online en als PDF) in de stijl van de goedgekeurde mock-up, met een persoonlijk actieplan en een onderbouwde aanbeveling voor het juiste DIMAC-product. De vragenlijst, scores, drempels, veiligheidsregels, prijzen en het logo veranderen niet. De testmodus blijft actief en er wordt niets gepubliceerd.

## Wat de bezoeker te zien krijgt

**Pagina 1 – Voorblad en samenvatting**
- Het echte DIMAC-logo van de websiteheader, "WONINGSCAN / QUICKSCAN", het rapportnummer en de paginering.
- "Uw woning in beeld." met alleen de gegevens die de bezoeker zelf heeft ingevuld: type, bouwperiode, oppervlakte en EPC.
- Een architecturale lijntekening per woningtype (rijwoning, halfopen, open bebouwing, appartement), duidelijk als illustratie en niet als foto van de woning.
- De renovatiebarometer zoals nu, met een korte persoonlijke uitleg.
- Hoogstens drie highlightkaarten met icoon en nummer. Zijn er minder bevindingen, dan komen er ook minder kaarten.
- Een korte eerste conclusie.

**Pagina 2 – Analyse**
- Vijf domeinkaarten met icoon, korte analyse en een status in woorden én kleur: geen gekende problemen gemeld, beperkte signalen, duidelijke aandachtspunten, ernstige signalen of onvoldoende informatie.
- Bij appartementen blijven eigen delen en gemeenschappelijke delen gescheiden.
- "Verbanden die het verschil maken": een diagram met hoogstens twee verbanden die de antwoorden echt ondersteunen, zoals vocht, ventilatie en schrijnwerk. Nooit gebracht als bewezen oorzaak.

**Pagina 3 – Advies en actieplan**
- De titel past zich aan: voor kopers "Wat controleert u best vóór uw aankoopbeslissing?", voor eigenaars "Hoe pakt u uw renovatie verstandig aan?". Appartementen krijgen een eigen variant.
- Drie tot vijf actiekaarten, gebaseerd op de antwoorden.
- "Documenten om op te vragen" met per document een status: beschikbaar, nog te verifiëren, onbekend of niet van toepassing.
- Het asbestattest verschijnt alleen voor gebouwen van vóór 2001, volgens de Vlaamse regel. Een woning uit 2020 krijgt dus geen asbestwaarschuwing.
- De kaart "Uw aanbevolen volgende stap" met:
  - de reden en twee tot drie voordelen;
  - de prijs incl. btw op de rapportdatum;
  - de drone-optie alleen als daar een aanleiding voor is;
  - een knop "Vraag mijn Woningscan aan" en de link "Vergelijk de Woningscans".

Is er weinig te zeggen, dan blijft het rapport kort. Is er veel te zeggen, dan krijgt het meer pagina's.

## Hoe de productaanbeveling beslist

```text
1. Urgente veiligheidsmelding?    → eerst veiligheidsadvies; productkaart pas daarna, ingetogen
2. Weinig signalen, geen plannen,
   geen kostenvraag                → geen aanbeveling, neutrale afsluiting
3. Meerdere geplande werkdomeinen,
   of een koper van een
   renovatiewoning met meerdere
   technische punten               → Woningscan Plus (Woningscan als alternatief)
4. Concrete technische twijfels
   (vooral bij kopers)             → Woningscan (Plus als alternatief)
5. Vooral een kostenvraag zonder
   technische twijfels             → online budgetindicator, "Binnenkort beschikbaar",
                                     zonder bestelknop, met link naar de productinfo
Drone: alleen bij een fysiek pakket én een aanleiding volgens de bestaande droneAdvice().
       Nooit vooraf aangevinkt.
Appartement met alleen VME-problemen: Woningscan van het eigen deel, zonder belofte
       van een volledige inspectie van de gemeenschappelijke delen.
```

- Een hoge barometer leidt op zich nooit tot Plus.
- De aanbeveling heeft geen invloed op de barometer.
- De knoppen gebruiken de bestaande pakketlinks. Het pakket wordt vooraf gekozen en de drone staat uit.
- De link geeft alleen het pakket en het rapportnummer mee, nooit persoonsgegevens of antwoorden.
- De PDF bevat dezelfde aanbeveling, met een volledige werkende link en de melding dat prijzen na de rapportdatum kunnen veranderen.

## Wat ik ga testen

- Alle bestaande tests, plus de 22 nieuwe scenario's uit de brief. De Tessenderlo-case moet uitkomen op "Enkele aandachtspunten", Woningscan €299, geen Plus en geen drone.
- De pakketkeuze in de browser na een klik vanuit het rapport.
- De Tessenderlo-PDF zelf genereren, elke pagina als afbeelding bekijken en naast de mock-up leggen.
- Nagaan dat oude rapporten ongewijzigd openen.

## Technische details

- **Nieuw `_shared/quickscan/catalog.ts`:** de productgegevens (prijzen, namen, voordelen, beschikbaarheid, routes) zonder imports. `src/data/woningscan.ts` haalt ze daaruit en blijft de bron voor de website. Er is dus maar één plek met prijzen. De regel in AGENTS.md wordt hierop aangepast.
- **Nieuw `_shared/quickscan/report23.ts`:** domeinstatussen, verbanden, actiekaarten, documentchecklist en `recommendProduct()` met vaste redenencodes. Het bestand gebruikt alleen de engine en de catalogus en raakt de scores niet aan.
- **Rapportversie:** wordt `qs-report-2.3`. De regel- en vragenversies blijven 2.2.2. Nieuwe velden (`domains`, `links`, `actions`, `documents`, `recommendation`, `illustration`) komen in de snapshot. Oude snapshots tonen met de bestaande weergave en worden nooit herberekend.
- **Weergave:** een nieuwe rapportweergave met een eigen lijnicoon- en illustratieset in SVG.
- **PDF:** `quickscanPdf.ts` wordt herschreven naar een A4-opmaak met het echte logo als afbeelding (eventueel een scherpe export van hetzelfde bestand), de lettertypes Playfair Display en Inter, en dezelfde rapportgegevens.
- **Statistieken:** nieuwe meetpunten via `track()`: `quickscan_recommendation_shown`, `_view`, `_cta_click`, `_compare_click` en `_drone_info_view`, telkens met product-ID en redenencode, zonder persoonsgegevens.
- **Server:** de server-side functie wordt opnieuw uitgerold met de nieuwe rapportversie. De bestaande beveiliging, de bescherming tegen dubbele inzendingen, de limiet per uur en de testmodus blijven ongewijzigd.
