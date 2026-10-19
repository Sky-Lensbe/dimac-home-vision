# DIMAC Quickscan 2.0 (testmodus)

Een gratis online woninganalyse op `/woningscan/quickscan`. Er komen vaste rekenregels, een persoonlijk rapport, leads die veilig worden opgeslagen en een afgeschermd dashboard. Er wordt geen AI gebruikt en niets gepubliceerd.

## Aanbod
- Plus (€449) verdwijnt overal: kaarten, formulier, FAQ, homepage, types, tests en links. Een oude link met `?pakket=plus` kiest niets meer automatisch.
- Compleet neemt de inhoud van Plus over, plus de indicatieve kostenraming.
- Basis €299, Compleet €649, drone +€125. Quickscan is gratis.
- `/woningscan` toont voortaan Quickscan, Basis en Compleet.

## Klantreis
1. Landingspagina met de aangeleverde teksten. Er staat vooraf duidelijk dat een e-mailadres nodig is voor het volledige rapport.
2. Vragenlijst in vier stappen, gekozen uit een vragenbank van 50 vragen. Er zijn 14 hoofdvragen en vervolgvragen die alleen verschijnen wanneer ze van toepassing zijn.
3. Eerste resultaat: de barometercategorie en één aandachtspunt. Veiligheidsmeldingen (gas/CO, elektriciteit, constructie, waterinfiltratie, losse dakdelen) verschijnen altijd meteen.
4. Registratie: voornaam, naam, e-mail, gemeente/postcode en optioneel telefoon. Marketingtoestemming is apart en niet verplicht. Een verborgen veld weert spam.
5. Het volledige rapport verschijnt meteen op het scherm, met acht hoofdstukken. Pakketadvies (Basis/Compleet) en drone-advies staan pas onderaan en volgen eigen regels. Er zijn knoppen voor downloaden (A4-PDF), printen en een nieuwe scan.

## Rekenregels
Vijf gewogen domeinen. Per domein telt het hoogste signaal en een onbekend domein telt niet als nul. Vier categorieën met override-regels. Bij te weinig informatie volgt het label "onvoldoende informatie". Alle teksten in het rapport zijn vooraf geschreven. Elk rapport wordt bewaard met een versienummer, zodat het later niet ongemerkt verandert.

## Opslag en beveiliging (Lovable Cloud)
- Gegevens: leads, antwoorden, rapporten, gebeurtenissen en beheerdersrollen.
- De server controleert alle invoer opnieuw en berekent de score zelf. Het aantal aanvragen per bezoeker is beperkt.
- Bezoekers kunnen geen leads lezen. Een rapportnummer alleen geeft geen toegang tot persoonsgegevens.

## E-mail in testmodus
- Een vaste ontvangerslijst op de server laat alleen info@sky-lens.be toe. Alle andere adressen worden geweigerd, ook als iemand de instellingen aanpast.
- Rapportmail en melding van een nieuwe lead gaan alleen naar info@sky-lens.be. Er gaat niets naar klanten of naar DIMAC.
- Het e-mailadres van de klant wordt wel bewaard voor later.
- Ontvangers en e-mailstromen staan op één centrale plaats, zodat de overstap naar live later eenvoudig is.
- Verzenden vereist dat sky-lens.be gekoppeld en geverifieerd is. Tot dan worden geen mails verstuurd en blijft de status "niet getest".
- Een PDF-bijlage is niet mogelijk. De mail bevat daarom een beveiligde link naar het rapport die na een tijd vervalt.
- De verzendstatus toont alleen wat echt gebeurd is: aangemaakt, klaar, geaccepteerd, afgeleverd (alleen indien bevestigd) of fout. Opnieuw verzenden kan vanuit het dashboard.

## Dashboard `/admin/quickscan`
- Inloggen gebeurt met e-mail en wachtwoord. Alleen info@sky-lens.be krijgt de beheerdersrol.
- Overzicht: aantallen, categorieën, timing, advies Basis versus Compleet, drone-advies, mailstatus en opvolgstatus.
- Per lead: alle antwoorden, het rapport en de opvolging. Het dashboard wordt nooit geïndexeerd.

## Controle
- Tests voor de score- en categorieregels, de veiligheidsmeldingen, het pakketadvies, de drone-regels, de prijzen zonder Plus en de ontvangerslijst.
- Een volledige proefronde in de preview, waarbij de opgeslagen gegevens worden gecontroleerd en de testrij daarna wordt verwijderd.
- Controle op mobiel en desktop.

## Technisch
- Lovable Cloud wordt ingeschakeld.
- Edge functions: `quickscan-submit` (valideren, scoren, opslaan) en `quickscan-report` (rapport via een token ophalen).
- Daarnaast de standaard functie voor app-e-mails, met de ontvangerslijst als harde controle.
- Gedeelde scoremodule die zowel de browser als de server gebruiken.
- De PDF wordt in de browser gemaakt.
- AGENTS.md en het geheugenbestand over de Woningscan worden bijgewerkt: er is nu wel een backend, Plus is weg en de testmodus wordt vastgelegd.

## Nog nodig van u
- sky-lens.be koppelen als verzenddomein. U krijgt daarvoor een knop.
- Een wachtwoord kiezen bij de eerste login op het dashboard.
