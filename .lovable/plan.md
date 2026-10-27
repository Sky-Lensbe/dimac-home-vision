# DIMAC Quickscan 2.2 — uitbreiding vragenlijst, appartementroute en rapport

Gerichte update van de bestaande Quickscan 2.1 op `/woningscan/quickscan`. Geen herbouw, geen AI, geen budgetberekening, geen betaalfunctie, geen publicatie. Testmodus en mailbeleid (alleen info@sky-lens.be, geen automatische mails) blijven ongewijzigd.

## Fase A — Vragenbank en contextvelden
Nieuwe vragen (met de exacte antwoordopties uit de brief):
- Stap 1: geschatte bewoonbare oppervlakte (aparte reeksen woning/appartement), laatste grondige renovatie (woning / appartement zelf, met hulptekst), kelder of kruipruimte, zolder, bijgebouwen, stedenbouwkundige aandachtspunten (optioneel).
- Stap 2: dakisolatie (alleen woningen; appartementen via VME-deel), type beglazing (direct bij de ramenvraag), muurisolatie (met uitleg dat massief niet = ongeïsoleerd), vloeropbouw en vloerisolatie (alleen woningen, vloerisolatie ook als opbouw onbekend), asbest met vervolgvraag bij gekende toepassingen (beschadigd / werken gepland), riolering/afvoer (woningen).
- Stap 3: leeftijd sanitaire leidingen (bij appartement: binnen het appartement), EPC opgesplitst in A+/A, B, C, D, E, F, weet ik niet.
- Contextgegevens (oppervlakte, bouwjaar, kelder, zolder, bijgebouwen, renovatiehistoriek, plannen, stedenbouw) worden apart van de technische score bewaard voor latere hergebruik in de budgetindicator.
- Documentenvraag behoudt bouwplannen, EPC en keuring; "Geen documenten" en "Weet ik niet" exclusief.

## Fase B — Appartement en VME
- Keuken- en badkamerleeftijd (alleen bij oudere renovatiehistoriek of geplande interieurwerken), badkamer met vervolgvraag over vocht/waterdichting.
- Gemeenschappelijke leidingen, gemeenschappelijk dak en gevel, omvang geplande VME-werken en de overige VME-punten uit de brief.
- Privatief versus gemeenschappelijk strikt gescheiden: VME-besluiten of beperkt reservefonds wijzigen de privatieve barometer niet; ernstige collectieve signalen blijven wel zichtbaar in het rapport.
- Stap 3 krijgt bij appartementen de titel met "Mede-eigendom".

## Fase C — Volgorde, triggers en scoring
- Vier stappen in de volgorde uit de brief; samenhangende vragen na elkaar; circa twintig vragen bij een normale scan, extra vervolgvragen bij gemelde problemen; veiligheidsvragen nooit weggelaten.
- Kelderwater alleen bij kelder of eerder vochtsignaal; zolder stuurt alleen zoldervervolgvragen, dakvragen blijven.
- Vochthoofdvraag behoudt exact de vier opties; slimmere vervolgvragen (waar, wanneer, terugkerend, meerdere ruimtes, effectieve insijpeling) met onderscheid condens/schimmel, vochtplekken, mogelijke infiltratie, actieve lekkage, keldervocht. Actieve lekkage blijft een urgentiemelding.
- Scheurenvraag krijgt "Zichtbare verzakking of vervorming" met gerichte veiligheidswaarschuwing; "Onverklaarde scheuren" komt niet terug.
- Vijf domeinen, gewichten en barometercategorieën blijven. Nieuwe vragen krijgen alleen onderbouwde scorewaarden zonder dubbeltelling; onbekend en niet-gesteld nooit gunstig of ongunstig; geen betrouwbaarheidspercentage. EPC B niet als ernstig probleem; asbest, stedenbouw en vloeropbouw beïnvloeden de technische barometer niet rechtstreeks.

## Fase D — Rapport en PDF
- Nieuwe antwoorden verwerkt in woningprofiel, barometer, technische en energetische aandachtspunten, informatiezekerheid, ontbrekende info, renovaties combineren, samenvatting en vervolgstap.
- Appartementhoofdstuk "Gemeenschappelijke delen en mogelijke toekomstige kosten" splitst technische info, geplande werken en financiële onzekerheden, met maximaal drie vragen voor de syndicus; geen bedragen.
- Asbest: geen diagnose of asbestvrij-claim; stedenbouw: geen conformiteitsuitspraak; isolatie: gekend afwezig versus onbekend.
- Vervolgstap blijft productneutraal; geen link naar een niet-bestaande budgetindicator of verzonnen prijzen.

## Fase E — Versies, migratie en tests
- Vraag-, regel- en rapportversie naar 2.2; oude rapporten blijven met hun versie zichtbaar in het dashboard.
- Opgeslagen voortgang: de oude gecombineerde EPC-waarde en andere gewijzigde antwoorden worden opnieuw gevraagd i.p.v. gegokt; geldige antwoorden blijven.
- Server herberekent en valideert met dezelfde regels.
- Regressietests voor alle 36 scenario's uit de brief, plus testmailbeleid. Daarna een browserdoorloop voor woning en appartement tot het volledige rapport en PDF, met verwijdering van de testinzending.

## Technische details
- Alle regels in `supabase/functions/_shared/quickscan/engine.ts`; rapportweergave in `ReportView.tsx` en `quickscanPdf.ts`; sessiesleutel in `Quickscan.tsx` naar v2.2; `quickscan-submit` opnieuw uitrollen.
- Contextvelden komen in een apart `context`-object in de rapportsnapshot (bestaande JSON-kolom); geen databasewijziging nodig tenzij inspectie anders uitwijst.
- Geen wijzigingen aan andere pagina's, roadmap of mail-policy.
