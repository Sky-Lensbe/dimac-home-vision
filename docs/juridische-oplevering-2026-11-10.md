# DIMAC — juridische afwerking in preview

Datum: 10 november 2026. Status: concept, niet gepubliceerd en niet definitief juridisch goedgekeurd.

## Opgeleverd

- `/algemene-voorwaarden`: uitsluitend gratis Quickscan, Woningscan, Plus en drone; actuele catalogusprijzen; geen verplaatsingskosten; zeven werkdagen rapportlevering; betaling binnen veertien kalenderdagen na rapportoplevering; kosteloze annulering vanaf 48 werkelijke uren; voorgestelde 50%-clausule expliciet niet toepasbaar zonder juridische goedkeuring; voorrang wettelijk herroepingsrecht; evenwichtige onderzoeksbeperkingen.
- `/privacy`: officiële DIMAC BV-controllergegevens, werkelijke gegevenscategorieën, onderscheiden rechtsgronden, vrijwillige DIMAC-only marketing, technische rollen en test-only rapportmail; twaalfmaandenbeleid zonder fictieve automatische verwijdering.
- `/cookies`: session storage voor voortgang, beheerderauth in local storage, dataLayer alleen in geheugen, Google Fonts-verbindingen. Geen nieuwe tracker of banner.
- `/wettelijke-vermeldingen`: alle aangeleverde officiële bedrijfsgegevens, klikbare telefoon/e-mail en documentverwijzingen.
- Toegankelijk herroepingsmodel op de voorwaardenpagina en als downloadbaar tekstbestand.
- Footerlinks naar alle vier pagina’s; nieuwe paden in sitemapgenerator; bestaande noindex-instelling behouden.
- Contact en Woningscan: verplichte privacytoestemming verwijderd, informatie over noodzakelijke aanvraagverwerking toegevoegd; mailto blijft behouden, geen bestelling, betaling of ontvangstbevestiging.
- Quickscan: correcte toelichting op genereren, bewaren, beschikbaar stellen en voorwaardelijke e-maillevering; standaard uitgevinkte marketing alleen voor DIMAC, intrekking mogelijk.

De brief verwijst naar eerdere juridische concepten. Afzonderlijke volledige algemene voorwaarden/privacyconcepten waren niet beschikbaar tussen de aangeleverde bestanden. De nieuwe concepttekst is gebaseerd op de huidige privacytekst, deze implementatiebrief en officiële consumentenvoorlichting; vergelijking met andere juridische concepten blijft nodig indien die bestaan.

## Uitgevoerde technische audit

### E-mail en toestemming

Broncode: Quickscan MAIL_MODE=test, uitsluitend info@sky-lens.be op de allowlist. De actuele lokale verzendroute gebruikt Resend voor toegestane tests; andere bezoekers krijgen geen automatische rapportmail. De toekomstige delivery-worker is afzonderlijk uitgeschakeld en bewijst niet dat de bestaande testmailroute uitstaat. Woningscan-mailto blijft in testmodus, contact-mailto gaat naar info@dimac.be. Geen instelling, geheim of ontvanger gewijzigd.

Toestemming wordt server-side opgeslagen als marketing_consent, consent_version en consent_timestamp. De bestaande serverversie blijft onveranderd. De schermtekst verduidelijkt alleen dezelfde DIMAC-toestemming; exacte koppeling van de uitgerolde toestemmingsversie aan gearchiveerde tekst moet vóór lancering worden gecontroleerd.

De uitgerolde functionele mailconfiguratie is in deze ronde niet opnieuw end-to-end aangeroepen: dat zou nieuwe leads en/of testmails produceren. Eerdere mailtests zijn geen nieuwe runtimeverificatie. De privacytekst maakt geen algemene leveringsbelofte.

### Opslag en retentie

Live schemametadata, zonder persoonsgegevens op te vragen:

| Gegevens | Tabel | Afhankelijkheid |
| --- | --- | --- |
| Contact, toestemming, administratieve status/notities | quickscan_leads | Hoofdrecord; created_at bepaalt registratie |
| Antwoorden | quickscan_responses | lead_id, ON DELETE CASCADE |
| Rapport, score, snapshot, verzendstatus | quickscan_reports | lead_id, ON DELETE CASCADE |
| Gebeurtenissen | quickscan_events | lead_id, ON DELETE CASCADE |
| Gehashte IP-afleiding, uurvenster, teller | quickscan_rate_limits | Geen lead-FK; eigen opschoning vereist |

De planningslijst gaf geen taken terug. In de bestaande app is geen aantoonbare twaalfmaanden-verwijderprocedure gevonden. De metadataweergave van publieke routines gaf bovendien geen quickscan_register terug, terwijl de lokale servercode deze functie aanroept. Dit is een verificatieverschil, geen bewezen defect: vóór lancering moet de transactionele opslag via een afzonderlijk goedgekeurde livecontrole opnieuw worden bevestigd. Geen migratie of reparatie uitgevoerd.

### Browserinventaris

Echte schone desktopbrowsersessie: geen cookies, geen localStorage-items, alleen sessionStorage `dimac-quickscan-v2.3.4` na starten Quickscan. Authopslag bestaat in de bron maar is niet als ingelogde beheerder opnieuw getest. De sidebar-cookie uit een ongebruikte UI-bibliotheek wordt nergens gemount en is niet als actief geïnventariseerd.

Geen app-GTM/GA/Meta/Hotjar/Clarity of externe analyticsverzending gevonden. dataLayer bevat alleen tijdelijke geheugen-events zonder persoonsgegevens. Externe lettertypen zijn wel werkelijk aangetroffen: fonts.googleapis.com en fonts.gstatic.com. Preview-/editoropslag kan buiten deze schone localhostsessie afwijken; afzonderlijke platformcontrole nodig vóór lancering.

## Veilig bewaarbeleid — ontwerp, niet geactiveerd

1. Definieer eerst expliciet en auditeerbaar welke lead een klant is. Gebruik niet alleen vrij tekstveld notes of een vrijblijvende opvolgstatus als bewijs van een uitzondering.
2. Uiterste grens: twaalf kalendermaanden na created_at voor niet-klanten, niet 365 dagen en niet vanaf laatste contact. Laat dagelijkse selectie met veiligheidstesten geen record later dan die grens bewaren; plan uitvoering op tijd of vaker waar nodig.
3. Leg per gerechtvaardigde uitzondering categorie, grondslag, noodzakelijke gegevens, verantwoordelijke, herbeoordeling en einddatum vast. Marketingtoestemming verlengt de twaalfmaandengrens niet.
4. Maak eerst een read-only proefselectie met uitsluitend aantallen en uitzonderingscategorieën, geen persoonsgegevens in logs. Blokkeer bij onduidelijke klantstatus of ontbrekende uitzonderingsbeoordeling; los onzekerheid vóór de uiterste grens op, geen onbeperkt uitstel.
5. Verwijder toegelaten hoofddossiers transactioneel in beperkte batches. De bestaande CASCADE-relaties verwijderen antwoorden, rapporten en gebeurtenissen mee. Hercontroleer alle afhankelijkheden en eventuele toekomstige mailjobs vóór uitvoering.
6. Vergrendel/coördineer gelijktijdige maillevering en verwijdering; geen verzending van een dossier dat voor verwijdering geselecteerd is. Provider-onzekerheid moet eerst worden gereconcilieerd, niet blind opnieuw verzonden.
7. Definieer een korte aparte termijn voor rate-limits; leverancierslogs, e-mails, downloads en eventuele reservekopieën hebben eigen scope. Een verwijdering uit de hoofdtabellen wist die niet automatisch.
8. Bewaar alleen een niet-persoonlijke/aangepast geminimaliseerde uitvoeringsteller; geen rapportsnapshots/contactgegevens in verwijderlogs. Documenteer monitoring, foutafhandeling, herhaalbaarheid en alarmen.
9. Reservekopieën: bevestig leverancierstermijnen, toegangsbeperking, uitfasering en herstelprocedure die verwijderde dossiers niet opnieuw actief maakt. De beschikbare platformdocumentatie noemt dagelijkse databasekopieën en ongeveer veertien dagen retentie; de concrete inventaris is niet ingezien en dit is geen garantiebewijs voor deze omgeving.
10. Pas na afzonderlijk akkoord: benodigde migraties voor uitzonderingen, toegangsbeveiligde verwijderfunctie, taak en tests invoeren. Test grensgevallen, cascade, uitzonderingen, concurrentie en herstel met synthetische dossiers; geen echte gegevens gebruiken of verwijderen in deze fase.

## Open voorwaarden vóór publieke lancering

1. **Juridische goedkeuring:** voorgestelde 50%-vergoeding, proportionaliteit, wederkerigheid, overmacht, volledige consumenteninformatie en model/herroepingsprocedure laten beoordelen. Clausule blijft concept en niet toepasbaar.
2. **Retentie:** bovenstaande procedure daadwerkelijk implementeren, activeren en controleren na afzonderlijk akkoord. Klant- en uitzonderingscriteria, technische logs, e-mails en reservekopieën vastleggen; huidige tekst vervangt dit niet.
3. **Verwerkersrelatie DIMAC–Sky-Lens:** passende artikel 28-overeenkomst, instructies, rollen en noodzakelijke toegang aantonen. Geen zelfstandige marketingrechten.
4. **Externe leveranciers:** toepasselijke Lovable Cloud- en Resend-overeenkomsten, onderliggende gegevensdienst/subverwerkers, locaties, internationale doorgiften en bescherming bevestigen. Standaard DPA’s zijn vindbaar, maar concrete afsluiting/planvoorwaarden en keten zijn niet bevestigd. Geen Europese locatiegarantie.
5. **Lettertypen:** Google Fonts-gegevensverwerking juridisch beoordelen of de bestaande lettertypen lokaal aanbieden; geen tracking toevoegen. Nog geen lokale omschakeling verricht.
6. **Productie-mail/aanvragen:** testmodus blijft behouden. Een live-omschakeling, juiste afzender/ontvangers, volledige PDF-bijlage en toestemmingsevidentie moeten afzonderlijk goedgekeurd en end-to-end gevalideerd worden. Deze ronde verstuurde geen mail.
7. **Live beveiliging/registratie:** bevestig alleen noodzakelijke beheerderstoegang en de actuele transactionele registratiefunctie; metadata-audit is geen bewijs van het volledige gebruikersproces. Geen account/rolwijziging verricht.
8. **Historische presentatie-mailuitrol:** eerdere presentatiecorrecties zijn nog niet afzonderlijk uitgerold. Dit bestaande aandachtspunt blijft staan.
9. **Publicatie:** uitsluitend na expliciete toestemming en afsluiten van juridische/technische voorwaarden; geen publicatie of indexeringswijziging gedaan.

## Onderzoek online herroepingsfunctie

De actuele officiële FOD-voorlichting noemt een herroepingsfunctie voor online gesloten overeenkomsten. De Europese richtlijn 2023/2673 voegt artikel 11a toe voor overeenkomsten via online interfaces; nationale omzetting en toepasselijkheid op de toekomstige DIMAC-route moeten bij ontwikkeling opnieuw juridisch gecontroleerd worden.

Nu is er geen online contractsluiting: het formulier bereidt alleen een vrijblijvende e-mail voor. Daarom is geen fictieve bestel-/herroepingsfunctie gebouwd. Bij een toekomstige echte online overeenkomst moet naast de precontractuele informatie een geschikte online herroepingsfunctie, ontvangstbevestiging op duurzame drager en verklaring voor vervroegde uitvoering worden ingericht. Een mailto-link mag dan niet zonder onderzoek als vervanging worden beschouwd.

Bronnen geraadpleegd op 10 november 2026:
- https://consumerconnect.be/nl/themas/aankoop-product-of-dienst/herroepingsrecht/aankoop-op-afstand/algemene-regel
- https://news.economie.fgov.be/270128-een-impulsieve-online-aankoop-er-is-een-weg-terug/
- https://eur-lex.europa.eu/eli/dir/2023/2673/oj
- https://lovable.dev/data-processing-agreement
- https://resend.com/legal/dpa

## Testresultaten en grenzen

- 381/381 automatische tests geslaagd, 15 bestanden: inclusief 17 nieuwe regeltests met concrete bedrijfsgegevens, prijzen, termijnen, grenzen en privacyvoorwaarden; bestaande Quickscan-score-, historische snapshot-, PDF- en deliverytests blijven groen.
- Laatste previewcontrole: build OK. Geen afzonderlijke handmatige TypeScriptcontrole uitgevoerd; automatische projectcontrole is leidend.
- Alle vier pagina’s op 1280×1800 en 390×844 geopend; één H1, correcte canonical en noindex, geen horizontale overflow. Desktop- en mobiele screenshots visueel bekeken.
- Contact en Woningscan met synthetische invoer tot mailto-handoff: geen verplichte privacycheckbox, geen ontvangstclaim, relevante links aanwezig. Geen e-mail verzonden.
- Quickscan werkelijk vanaf eerste vraag tot het contactformulier doorlopen. Marketingvakje uitgevinkt, niet required. Submit-payload had marketingConsent=false. Aanvraag bewust vóór de server geaborteerd: foutmelding correct; geen lead of rapport opgeslagen en geen mail verzonden.
- Geen browserruntimefouten. Geen nieuwe server-end-to-end-, ingelogde dashboard- of echte mailleveringstest in deze ronde; geen bewijs van ongewijzigde runtimelevering geclaimd.
- Rapporten, scores, routering, prijzen, mailconfiguratie, serverfuncties, databank en bestaande gegevens niet gewijzigd.

Bewijsbestanden staan in de tijdelijke browseraudit; deze oplevering blijft de permanente samenvatting.