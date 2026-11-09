# DIMAC Quickscan 2.3.3 — Final Quality & PDF-maillevering

## Doel en toestemming
Werk de laatste kwaliteitscorrecties af en bereid automatische levering van het volledige persoonlijke PDF-rapport voor. Geen herbouw.

Dit plan geeft na goedkeuring uitsluitend ruimte voor lokale codevoorbereiding en tests. **Geen gedeelde database- of opslagwijzigingen, secrets, DNS-wijzigingen, serveruitrol, echte verzending, publicatie, betalingen of live-modus.** Voor configuratie en gecontroleerde testuitrol volgt een afzonderlijk akkoord met exacte wijzigingslijst en rollback.

Versies blijven `qs-report-2.3.3`, `qs-questions-2.3.3` en `qs-rules-2.2.2`. Domeingewichten, scores, veiligheidsregels, barometer, prijzen, catalogus en origineel logo blijven behouden.

## Vastgestelde uitgangssituatie
- De eerdere invariantietest vergelijkt de nieuwe engine met zichzelf; onafhankelijke score-invariantie is nog niet bewezen.
- Historische PDF-generatie is getest, maar niet tegenover oorspronkelijke layouts. Vier gebruikersgerichte informatiedekkingsniveaus zijn nog niet volledig gerealiseerd.
- Geen geconfigureerd Lovable-emaildomein, beschikbare Resend-verbinding of Resend-secret aangetroffen. Domeinverificatie, SPF/DKIM/DMARC, limieten en aflevering zijn nog niet gecontroleerd.
- Lovable Emails ondersteunt geen bijlagen. Daarom is **Resend**, zoals gevraagd in de brief, de voorgestelde provider. Geen vervanging van de PDF door een link.
- Er bestaat nog geen duurzame verzendopdracht of server-side PDF-generator; de huidige rapporten worden zonder maillevering opgeslagen.

## Werkstroom A — Kwaliteitsbewijs en rapportcorrecties
### 1. Echte historische referenties
Verkrijg eerst een aantoonbaar oorspronkelijke 2.3.2-engine uit een beschikbare historische bron of via een uitsluitend-lezen export van de nog uitgerolde versie, indien die werkelijk 2.3.2 is. Bewaar bron, versie en hash. Geen teruggebouwde huidige engine als vervanging.

Vergelijk uitsluitend destijds geldige antwoorden voor minstens negen profielen: condens, schimmel, keldervocht, actieve waterinstroom, dakschade, elektriciteit, constructie, VME-only en gemengd appartement. Vergelijk vijf domeinscores, gewogen totaal, barometer/categorie, veiligheid en private/gemeenschappelijke signalen. Nieuwe BJ01/Q29-antwoorden komen niet in deze historische sets. Test nieuwe neutrale Q29 apart tegen behoud van Q24 en veiligheid.

Ontbreekt een originele bron, blijft deze acceptatievoorwaarde expliciet open; claim geen onafhankelijk bewijs.

### 2. Historische PDF's isoleren
Maak een expliciete dispatcher op de opgeslagen rapportversie, met vastgezette historische renderers voor 2.3, 2.3.1 en 2.3.2. Alleen 2.3.3 krijgt nieuwe paginering. Geen herberekening of toevoeging van nieuwe juridische teksten aan oude snapshots.

Gebruik oorspronkelijke geanonimiseerde snapshots en layoutreferenties. Vergelijk inhoud, pagina-aantal, tekstposities, gerasterde pagina's en linkdoelen. Een huidige renderer vastzetten beschermt toekomstige wijzigingen, maar bewijst niet vanzelf behoud tegenover de oorspronkelijke renderer. Ontbrekende referenties worden als blocker vermeld.

### 3. Vier informatiedekkingsniveaus
Voeg uitsluitend een presentatieclassificatie aan nieuwe 2.3.3-snapshots toe; bestaande interne codes en commerciële logica blijven ongewijzigd.

Voorgestelde toetsbare criteria: bepaal per toepasselijk technisch domein of minimaal één relevant kerngegeven ontbreekt of onbekend is. Niet-toepasselijke en uitsluitend gemeenschappelijke onderwerpen tellen niet als private onbekendheid. Houd afzonderlijk bij welke relevante document-/bouwjaargegevens ontbreken.
- **Voldoende informatie voor een eerste indicatie:** geen ontbrekende kerngegevens.
- **Enkele belangrijke gegevens ontbreken:** één onvolledig domein of uitsluitend ontbrekende relevante contextgegevens.
- **Meerdere kerngegevens ontbreken:** twee of drie onvolledige domeinen.
- **Onvoldoende informatie voor een betrouwbare eerste beoordeling:** vier of vijf onvolledige domeinen, of de bestaande interne beoordeling is al onvoldoende.

Leg de exacte kernvragen per domein vast en test grensgevallen, overslaan, onbekend en VME-scheiding. Productadvies moet voor dezelfde antwoorden identiek blijven.

### 4. Vijf praktijkcases en presentatie
Behoud alle correcties voor Tessenderlo (€299, geen drone), Halen (vier syndicusvragen, geen betaald product/asbestmelding bij 2007), woning 1962 (Plus €449, drone optioneel), woning 1976 (waterbron eerst, Plus €449) en recente rijwoning (€39,99 binnenkort, niet bestelbaar).

Vergelijk antwoorden, scores, veiligheid, verbanden, fasen, documenten, aanbeveling en PDF per case. Controleer condens versus glasspouwcondens, EPC/juridische context zonder persoonlijke deadline, asbest in alle lagen, sessiemigratie en nieuw toepasselijke vragen. Controleer desktop/mobiel en iedere PDF-pagina op overlap, verweesde titels/slotpagina's en samenhang van advies/prijs/CTA. Behoud logo, fonts en leesbare tekstgrootte.

## Werkstroom B — Volledige PDF per e-mail
### 1. Eerst server-side PDF-pariteit bewijzen
Haal de versiegebonden PDF-layout uit de browserafhankelijkheden naar een runtime-onafhankelijke renderlaag, met gecontroleerde logo- en fontdata. Browserdownload en serverbijlage lezen dezelfde opgeslagen snapshot, zonder engine-import of herberekening.

Voer een lokale Deno/jsPDF-proef uit voor alle vijf cases en historische versies: fonts, logo, inhoud, paginering en links. Geen bezoeker-PDF vertrouwen. Als dit niet haalbaar blijkt binnen deze gerichte wijziging, stop de mailimplementatie en leg de opties, kosten en beperkingen voor; geen stilzwijgende linkoplossing of nieuwe renderdienst.

### 2. Verzendidentiteit en inhoud
- Afzender: `Sky-Lens voor DIMAC <info@sky-lens.be>`; Reply-To: `info@sky-lens.be`.
- Onderwerp: `Uw persoonlijk DIMAC-woningrapport | [rapportnummer]`.
- DIMAC-logo en huisstijl; persoonlijke aanhef, rapportreferentie, uitleg en afbakening volgens de brief. HTML plus tekstversie, geen overbodige persoonsgegevens of marketing.
- Centrale configuratie buiten de engine. `MAIL_MODE = test`; slechts expliciet toegestane synthetische dossiers naar `info@sky-lens.be`. Niet automatisch echte dossiers naar een testadres doorsturen. `live` vereist bewuste codewijziging en akkoord; geen interne leadmails activeren.

### 3. Betrouwbare levering en status
Registreer een unieke verzendopdracht met de definitief opgeslagen snapshot. Een beveiligde worker claimt die opdracht atomair, bouwt de PDF en biedt één mail met bijlage aan Resend aan. Providerfouten veranderen of verwijderen het rapport niet.

Statussen: `pending`, `sending`, `accepted`, `delivered`, `failed`, `retry_scheduled`; aanvullend bounce/klacht waar bevestigd. Bewaar rapport-ID, ontvangerkoppeling, provider-ID, pogingen/tijden, volgende poging en geschoonde foutcode. API-aanvaarding is geen mailboxbewijs.

Voorstel retries: maximaal vijf pogingen, exponentiële wachttijd en respect voor Retry-After. Werkers gebruiken leases en dezelfde idempotentiesleutel. Bij onduidelijk providerresultaat geen blinde herverzending buiten de provider-deduplicatieperiode; markeer voor gecontroleerde beoordeling. Een bewuste nieuwe verzending krijgt een aparte gecontroleerde generatie.

### 4. Beveiliging en bezoekerscommunicatie
Geen publieke PDF-opslag, persoonsgegevens in URL's, rapportnummer als sleutel of endpoint met vrij gekozen ontvanger. Worker alleen voor bevoegde serveraanroepen; beheeracties alleen voor beheerders. Webhooks verifiëren handtekening en dubbele events. Bounce/klacht stopt verdere pogingen. Controleer bestaande rate limiting ook op concurrentie.

Na registratie: online rapport en 'Download mijn PDF' blijven beschikbaar. Toon alleen de werkelijke status; geen 'verzonden' vóór provideracceptatie. Leveringsproblemen kunnen gecontroleerd worden gemeld zonder vrije ontvanger of onbeperkte resend. Geen marketingtoestemming eisen; privacytekst aanpassen aan de werkelijk voorbereide verwerking vóór lancering.

## Technisch implementatie- en migratievoorstel
**Lokaal voorbereiden, niet toepassen:**
- Additieve tabel `quickscan_email_outbox`: rapportverwijzing, unieke opdracht/generatie, gekoppelde ontvanger, status, lease, pogingen, volgende poging, provider-ID en foutcode.
- Pogingen/events met unieke provider-event-ID voor audit en webhook-replaybescherming; indexes voor claimbare opdrachten.
- Beveiligde RPC's voor atomair claimen, statusovergangen en gecontroleerde herverzending. RLS en expliciete grants: geen anonieme toegang; alleen beheerders lezen, servermutaties afgeschermd.
- Registratieprocedure zorgvuldig uitbreiden voor één initiële opdracht bij nieuwe registratie. Geen historische rapporten bijwerken of automatisch mailen. Opgeslagen rapport blijft onafhankelijk van providerbeschikbaarheid; controleer herstel van ontbrekende opdracht zonder dubbele lead.
- Volledige inzendingsfingerprint naast de korte rapportreferentie controleren: een botsing mag nooit een ander rapport teruggeven. Bestaande referenties blijven geldig.
- `quickscan-submit` voorbereiden op veilige opdrachtkoppeling/status; aparte beveiligde mailworker, providerwebhook en beheeractie. Geen van deze functies nu uitrollen.
- Dashboard: status, pogingen en gecontroleerde retry; geen directe browsertoegang tot provider of vrije statuswijzigingen. Beschermde statusopvraag voor de indiener zonder rapportnummer als toegangsbewijs.

**Waarschijnlijke bestanden:** gedeelde Quickscan-rapport/PDF/mailmodules, `quickscan-submit`, nieuwe worker/webhook/administratieve functies, lokale migratievoorstellen, online rapport/Quickscan/dashboard/privacy, tests, `AGENTS.md` en opleverdocument. Automatisch gegenereerde client/types/config niet handmatig wijzigen.

Providerkoppeling en exacte SPF/DKIM/DMARC-records worden pas bij afzonderlijk goedgekeurde configuratie gecontroleerd; geen DNS-waarden raden. De Resend-koppeling bepaalt of gateway of directe API gebruikt wordt. Geen keys opvragen of koppelen tijdens deze voorbereidingsfase.

## Validatie en oplevering
Rapporteer strikt afzonderlijk:
1. Automatische regressietests en lokale type-/previewbuildcontrole.
2. Lokale rapport-/PDF-generatie en historische visuele vergelijking.
3. Echte desktop-/mobiele browsercontroles, sessiemigratie en pakketdoorverwijzing.
4. Server-side volledige inzending/opslag/mailtests: **open tot afzonderlijke uitroltoestemming**.
5. Werkelijk ontvangen testmail, juiste bijlage en mailboxbewijs: **open tot configuratie, testuitrol en toegang tot goedgekeurde mailbox**. Geen 200-response als ontvangstbewijs.

Nieuwe tests dekken scorebaseline, vier niveaus zonder productwijziging, historische inhoud/layout/links, ontvangerbeleid, dubbele/concurrente inzending, rapportnummerbotsing, ongeldige adressen, statusovergangen, leaseherstel, begrensde retries, tijdelijke/permanente fouten, webhookreplay en onbevoegde toegang.

Werk `docs/quickscan-2.3.3-oplevering.md` bij met vijf-casevergelijking, bewijsbestanden, werkelijk uitgevoerde tests, gewijzigde bestanden, provider/configuratie, migratievoorstel en blockers. Geen nieuwe succesclaims zonder bewijs.

## Afzonderlijke volgende goedkeuring en rollback
Leg vóór uitvoering exact voor: betrokken functies en migraties, domein/secrets/scheduler, testontvanger, synthetische dossiers en cleanup. Bewaar vooraf de werkelijk uitgerolde functieversies en relevante configuratie, niet alleen een lokale oudere kopie.

Rollback: stop worker/scheduling en nieuwe opdrachten, herstel vorige functies en testconfiguratie, bewaar rapporten en auditdata. Geen destructieve rollback van bestaande leads/snapshots. Verwijder na goedgekeurde tests uitsluitend geïdentificeerde synthetische gegevens en vergelijk begin-/eindaantallen. Publicatie en live-verzending blijven afzonderlijk uitgesloten.
