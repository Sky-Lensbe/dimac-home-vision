# Quickscan 2.3.2 — Persoonlijke renovatie-intelligentie (testmodus)

Scores, gewichten, barometerdrempels, veiligheidsregels, prijzen, logo, historische rapporten, databasebeveiliging en PDF-pagineringscorrecties blijven ongewijzigd. Geen AI, betalingen, productiemails of publicatie.

## Versies
- Rapport: `qs-report-2.3.2`
- Vragen: nieuwe vragenversie (Q26 "Weet ik niet", optionele P-/G-score, eventuele andere "Weet ik niet"-hiaten)
- Scoreregels: `qs-rules-2.2.2` ongewijzigd
- Sessie: nieuwe sessiesleutel met veilige migratie vanaf 2.2.1 (hervat altijd in de vragenlijst)

## 1. Vragenlogica
- Resolver wordt afhankelijkheidsbewust: na elk antwoord herberekenen tot stabiel (fixpoint, met iteratielimiet tegen lussen).
- Vragen die door stap 4 (renovatieplannen) geactiveerd worden (RI01, V01, SL01, Q39) worden alsnog gesteld: de gebruiker wordt naar de eerste nieuw geactiveerde open vraag geleid vóór het voorbeeldresultaat.
- Niet meer toepasselijke antwoorden vervallen; geldige blijven bewaard (ook bij wissel woning/appartement).
- Vervolgvraagbudgetten herzien: veiligheidskritische en inhoudelijk noodzakelijke vragen vallen nooit weg door een budget.
- Server gebruikt dezelfde resolver en weigert registratie bij ontbrekende verplichte vragen.

## 2. Renovatieplannen
- "Volledige renovatie" = brede intentie, niet langer gelijk aan alle deelwerken. Onderscheid: intentie, expliciete werken, gemelde problemen, mogelijke toekomstige maatregelen.
- Alleen volledige renovatie → advies rond scopebepaling en technische voorbereiding. Alle afhankelijke helpers worden nagekeken.

## 3. Verbanden
- Deterministische relevantierangschikking (bewijs, locatie, frequentie, ernst, link met plannen, onzekerheid, overlap) met stabiele ID's en bewijsverwijzingen naar vraag-ID's; max twee, liever geen dan een kunstmatig.
- Minimaal: keldervocht na regen (bron onderzoeken, niet aan raamcondens koppelen), raamcondens/schimmel (binnenzijde ≠ tussen glas), dak + dakisolatie, verwarming na isolatie (warmtebehoefte eerst), sanitair + vloeren (conditioneel), VME-kosten alleen bij concrete aanwijzing.

## 4. EPC en wettelijke context
- EPC voedt de analyse: A+/A/B geen bewijs van bouwtechnische goede staat; C/D gerichte verbeterpunten; E/F duidelijke energetische prioriteit + volledig EPC-verslag raadplegen. Geen labelvoorspelling, berekening of besparingsbelofte.
- Renovatieverplichting: kandidaat-koper E/F → EPC D binnen zes jaar na toepasselijke overdracht, met verificatie van toepasselijkheid/uitzonderingen en nieuw EPC; eigenaar → geen persoonlijke deadline, wel verificatieadvies; appartement → eenheid, gemene delen en VME gescheiden.
- Juridische teksten in één centrale configuratie met bron-URL en verificatiedatum. Ik controleer eerst de officiële Vlaamse/OVAM/Waterinfo-pagina's uit de brief.

## 5. Documenten, asbest, overstroming
- Persoonlijke checklist met statussen: beschikbaar, niet beschikbaar, nog te verifiëren, onbekend, niet van toepassing. Niet-uitgevraagd ≠ ontbrekend; ontbrekende keuring ≠ defect.
- Asbest volgens OVAM (grens 2001, 1991–2010 verifiëren), apart attest gemene delen (deadline 31/12/2026, regels vanaf 2027).
- EPC Gemeenschappelijke Delen als VME-document met syndicusvragen.
- Nieuwe optionele P-score (A–D, weet ik niet) en G-score (A–D, n.v.t., weet ik niet): geen invloed op barometer; C/D → verificatieadvies.

## 6. Renovatietraject en acties
- Nieuwe sectie "Uw voorlopig renovatietraject" met fasen A–D, alleen toepasselijke fasen; geen traject zonder plannen; geen dak/gevel bij cosmetisch.
- Acties gesplitst in drie groepen (technische prioriteiten, planning via fasen, documenten/verplichtingen) zodat niets wegvalt door een kaartlimiet; vaste prioriteitsvolgorde.

## 7. Productadvies
- Eerst behoefte/onzekerheid/complexiteit bepalen, dan product. Budgetindicator blijft "binnenkort"; Woningscan bij concrete twijfel; Plus alleen bij onderbouwde complexiteit; EPC F alleen of enkel VME-onzekerheid geen automatisch Plus; drone alleen bij dakindicatie en fysiek pakket.

## 8. Rapport en PDF
- Alle inhoud samengesteld in de gedeelde rapportmodule, online en PDF tonen exact dezelfde opgeslagen gegevens.
- Volgorde: profiel + barometer, bevindingen, vijf domeinen, verbanden, energie/verplichtingen/documenten, traject, acties en ontbrekende info, vervolgstap. Oude 2.3/2.3.1-snapshots blijven ongewijzigd weergegeven.

## 9. Tests en controle
- Nieuwe testbestand met alle verplichte scenario's uit de brief (vraagroutering 10, bouwtechniek 12, EPC/wettelijk 15, commercieel 9) plus bestaande 205 regressietests.
- Vier volledige dossiers (A recente woning, B appartement, C kandidaat-koper renovatiewoning, D eigenaar totaalrenovatie) via de browser doorlopen tot rapport en PDF; PDF-pagina's renderen en visueel nakijken; testgegevens nadien verwijderen.
- Serverfunctie opnieuw uitrollen (testmodus blijft; dezelfde testomgeving als voorheen).
- Opleveringsdocument `docs/quickscan-2.3.2-oplevering.md` met de 13 gevraagde punten.

## Technische details
- `engine.ts`: fixpoint-resolver in `visibleQuestions/activeAnswers/isComplete`, budgetclassificatie, Q26-optie, P/G-vragen, `plans()` gesplitst in `renovationIntent()` en `explicitWorks()`; scorefuncties ongemoeid.
- `report.ts`: `connections()` met scoring, nieuwe modules `energyContext`, `legalContext`, `documents`, `renovationPhases`, actiegroepen; `v232`-vlag in snapshot.
- Nieuw `_shared/quickscan/legal.ts` (zonder imports): regels, bronnen, verificatiedatum.
- `Quickscan.tsx`: na antwoord springen naar eerste nieuw geactiveerde open vraag. `quickscanSession.ts`: nieuwe sleutel + migratie.
- `Report23.tsx` / `quickscanPdf23.ts`: optionele 2.3.2-secties renderen; `quickscan-submit`: volledigheidscontrole.

## Aanvullende voorwaarden (goedgekeurd met plan)
- Resolver: scheiding bron-, gevalideerde, actieve antwoorden en zichtbare vragen; vervallen antwoorden activeren niets meer; niet-convergentie faalt expliciet (geen rapport). Geen sprongen midden in de stroom: eerst huidige stroom afmaken, daarna nieuw geactiveerde vragen, dan terug naar de logische vervolgstap. Specifieke tests Q46/Q46A × RI01, V01, SL01, Q39.
- Alle aanroepen van `plans()` nagekeken, ook productadvies, drone, verbanden, vraagvoorwaarden en fasen.
- Statussen expliciet onderscheiden: onbekend, bewust overgeslagen, niet gevraagd, niet beschikbaar, niet van toepassing. P/G-score raken geen domeinen of veiligheidsregels.
- Juridisch: bestaande eigenaar E/F → geen conclusie "geen verplichting" (er kan een lopende verplichting zijn); kandidaat-koper → ook waarschuwing over bestaande verplichting en resterende termijn bij doorverkoop; nooit een individuele deadline berekenen. EPC Gemeenschappelijke Delen en asbestattest gemene delen apart met toepassingsvoorwaarden en nieuwbouwuitzonderingen; teksten getoetst aan officiële bronnen met verificatiedatum.
- Compatibiliteit: `v23`-structuur blijft intact; 2.3.2 als additieve, geversioneerde extensie. Regressietest met echte historische 2.3- en 2.3.1-snapshotvormen, online en PDF.
- Browser: vier dossiers, minstens één op mobiel; onderbreken/hervatten, terug en wijzigen, nieuwe vragen vóór rapport, geen lussen, online/PDF-consistentie, leesbaarheid nieuwe secties, pakketlinks met rapportreferentie en drone uit.
- Deployment: dezelfde backend bedient preview en de (nog niet gepubliceerde) live-omgeving. Vóór heruitrol van de serverfunctie vraag ik daarom afzonderlijk toestemming; zonder akkoord blijft het bij lokale tests en wordt de browsertest met de server als beperking gerapporteerd.
- Oplevering: per onderdeel onderscheid tussen automatische tests, echte browsercontroles, visueel gecontroleerde PDF's en open beperkingen.

## Open punt
- Twijfelgevallen ouderdomsscores blijven wachten op goedkeuring DIMAC (ongewijzigd).
