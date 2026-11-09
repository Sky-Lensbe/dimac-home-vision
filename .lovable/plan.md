# Implementatieplan — DIMAC Quickscan 2.3.3 (kwaliteitscorrectie)

## Doel en versies
Gerichte correctie van de tien vastgestelde kwaliteitsproblemen uit de vijf praktijkcases. Geen nieuwe producten, budgetberekeningen, AI of herschrijving van de vragenlijst.

- Rapport: `qs-report-2.3.2` → `qs-report-2.3.3`
- Vragen: `qs-questions-2.3.2` → `qs-questions-2.3.3` (antwoordopties en vraagvoorwaarden veranderen: Q29-optie, asbest-vervolgvraag)
- Scoreregels: `qs-rules-2.2.2` ongewijzigd — geen scorewaarden, domeingewichten, barometerdrempels, veiligheidsregels, prijzen of catalogus aangepast
- Nieuwe rapportinhoud wordt uitsluitend in de gedeelde rapportmodule opgebouwd (browser en PDF lezen dezelfde gegevens)

## Werkvolgorde (conform brief, stap A–G)

### Stap A — Reproductie
De vijf praktijkcases (Tessenderlo, Halen, woning 1962, woning 1976, recente rijwoning) als vaste testfixtures vastleggen en de actuele 2.3.2-uitkomsten vastleggen, zodat elke correctie aantoonbaar is.

### Stap B — Correcties per onderdeel

**1. Condens / schimmel / vocht (engine + rapport)**
- Q29 krijgt neutrale optie "Geen zichtbare schimmel, alleen condens" (geen score-effect).
- Semantische regels: condens ≠ schimmel; schimmel ≠ automatisch ventilatieprobleem; condens tussen glas ≠ condens binnenzijde; vochtplekken ≠ actieve instroom; keldervocht ≠ ventilatieprobleem woonruimtes; de vochtbron wordt nooit als bewezen oorzaak voorgesteld.
- Bij uitsluitend condens verschijnt nergens "vastgestelde schimmelvorming"; bij schimmel staat dat de gebruiker dit zelf meldde; bij waterinstroom expliciet onderscheid vochtsporen vs. binnenkomend water.
- `followUpBudget()`: vragen over vochtlocatie, -frequentie, -timing en -aard mogen niet wegvallen door budgetuitputting; geen standaard volledige vochtvragenreeks voor iedereen.

**2. Persoonlijke verbanden (report.ts)**
- Rangschikking op: veiligheid, concrete gemelde problemen, exacte locatie/aard, terugkerende/actieve problemen, relevantie voor geplande werken, renovatievolgorde, bewijssterkte, overlap.
- Specifiek verband over gemelde waterinstroom krijgt doorgaans voorrang op generieke werkafstemming. Maximaal twee verbandkaarten blijft, maar belangrijke informatie die niet past blijft zichtbaar in technische prioriteiten of actieplan.
- Exacte antwoordgegevens gebruiken: "Volgens uw antwoorden is het dak niet geïsoleerd." in plaats van onzekerheidsformulering wanneer het antwoord bekend is.
- Geen geforceerde causale verbanden zonder antwoordonderbouwing.

**3. Geen niet-gemelde werkzaamheden als gepland (report.ts)**
- Strikte scheiding: A. expliciet geplande werken, B. gemelde technische problemen, C. mogelijke bijkomende controles, D. onbekende scope bij alleen "Volledige renovatie".
- Toegestaan: "Controleer vóór de nieuwe vloerafwerking of de bestaande onderliggende technieken aanpassingen vereisen." Niet toegestaan: sanitaire/keuken-/badkamerwerken als fase zonder melding.
- Elke fase en elk onderdeel moet herleidbaar zijn naar concrete antwoorden (getest).

**4. Documentstatussen (report.ts)**
- Drie dimensies waar mogelijk: beschikbaarheid (beschikbaar / niet beschikbaar / nog te verifiëren / niet gevraagd / onbekend / n.v.t.), inhoud (gekend / niet gecontroleerd / bevat aandachtspunt), geldigheid (bevestigd / te verifiëren / n.v.t.).
- Voorbeeld: Q06 beschikbaar + Q40 inhoud onbekend → "Keuringsverslag beschikbaar volgens uw antwoorden. De inhoud en eventuele opmerkingen zijn nog te controleren."
- Prominente documenten afhankelijk van koper/eigenaar, bouwperiode, woning/appartement, gemelde problemen, geplande werken, wettelijke context; geen uitgebreide checklist zonder meerwaarde.

**5. Informatiedekking (report.ts)**
- Vier niveaus: voldoende voor eerste indicatie / enkele gegevens ontbreken / meerdere kerngegevens ontbreken / onvoldoende voor betrouwbare beoordeling.
- Geen woorden die volledigheid of technische zekerheid suggereren; interne antwoordcodes (`b`, `aplus`, `onbekend`) nooit als ruwe waarde in het rapport — centraal via vraag- en antwoordlabels.

**6. VME compacter (report.ts)**
- Thematische groepering: technische toestand, geplande werken, reservefonds/bijdragen, verslagen/documenten, verantwoordelijkheden privatief/gemeenschappelijk.
- Bij voorkeur maximaal vijf kernvragen voor de syndicus; belangrijke specifieke vraag mag niet verdwijnen — logisch samenbundelen; semantische doublures verwijderen.
- Bij uitsluitend gemeenschappelijke problemen: geen fysieke Woningscan, eerst VME-documenten, dan syndicus (bestaande correctie behouden).

**7. Asbest bij bouwperiode 1991–2010 (engine + legal + rapport)**
- Nieuwe compacte contextvraag "Is de woning gebouwd vóór 2001 of vanaf 2001?" (vóór 2001 / vanaf 2001 / weet ik niet), alleen bij bouwperiode 1991–2010, alleen als relevant en nog niet uit andere antwoorden bekend. Geen technische score.
- Verduidelijking doorwerken in asbestcontext en documentenchecklist; geen uitgebreide asbestwaarschuwing bij bevestigd bouwjaar vanaf 2001 zonder andere signalen; wettelijke bronnen blijven.

**8. Persoonlijke conclusie (report.ts)**
- Opgebouwd uit hoofdbevinding, belangrijkste doel, voornaamste onzekerheid, logische volgende handeling; geen generieke samenvatting, geen niet-gemelde feiten, geen bewezen oorzaken, kort bij weinig signalen, geen herhaling verderop.

**9. PDF-paginering (quickscanPdf23.ts)**
- Keep-with-next voor titels, keep-together voor kleine kaarten; commerciële afsluiting (productnaam, motivatie, meerwaarde, prijs incl. btw, status, CTA) als eenheid; neutrale afsluiting niet op bijna lege pagina; compacte klikbare bronnamen met correcte volledige URL; paginaverdeling optimaliseren vóór nieuwe pagina; geen tekstverkleining.
- Visuele identiteit behouden (logo, Playfair Display/Inter, illustraties, oranjetinten, domeinkaarten).

### Stap C — Automatische tests
- Nieuwe `src/test/quickscan-233.test.ts` met de vijf praktijkcases als regressieset plus de twintig randgevallen uit de brief (condens zonder schimmel, schimmel zonder oorzaak, vochtlocaties, kelderinstroom, dakisolatie-varianten, alleen volledige renovatie, alleen cosmetisch, documentstatussen, 1999 vs 2007, VME-only en gemengd, EPC F eigenaar, EPC A met problemen, geen signalen, veel onbekenden zonder upsell, historische snapshots 2.3/2.3.1/2.3.2, mobiel/PDF).
- Alle bestaande tests blijven slagen; typecheck en build groen.

### Stap D — Rapportcontrole
Voor alle vijf cases een volledig nieuw rapport genereren en vragen, antwoorden, scores, veiligheid, verbanden, acties, documentstatussen, traject en aanbeveling vergelijken.

### Stap E — Visuele PDF-controle
Elke pagina van alle vijf PDF's naar afbeelding renderen en paginering, leesbaarheid, samenhang en CTA controleren; korte rapportage per case met pagina-aantallen.

### Stap F — Historische regressie
Rapporten 2.3, 2.3.1 en 2.3.2 blijven ongewijzigd openen en als PDF exporteren met hun oorspronkelijke gegevens; geen stilzwijgende herberekening. Lopende sessies migreren correct naar de nieuwe vraagversie zonder tegenstrijdige antwoorden of onzichtbare verplichte vragen.

### Stap G — Opleveringsdocument
`docs/quickscan-2.3.3-oplevering.md` met gewijzigde bestanden, oorzaken, oplossingen, versies, testresultaten, verschillen per case, PDF-pagina-aantallen en open beperkingen, met duidelijk onderscheid tussen werkelijk uitgevoerde browser-/PDF-tests en uitsluitend automatische tests.

## Grenzen (ongewijzigd)
- Geen heruitrol van de serverfunctie, geen databasewijzigingen, geen publicatie zonder afzonderlijke toestemming.
- `MAIL_MODE = test` blijft; geen productiemails, geen betalingen.
- Privacyverklaring en commerciële aanvraagregistratie blijven onaangeroerd (Launch Readiness 1.0).
- Historische snapshots zijn onveranderlijk.
