# Projecten
- [x] Vijf projecten toegevoegd, Diest met drie aangeleverde foto's; geen eigendomsvermelding of verzonnen details.
- [x] Projectoverzicht en alle detailpagina's gecontroleerd; tests geslaagd, geen runtimefouten. CDN-foto's kunnen lokaal niet visueel bevestigd worden.

# Quickscan 2.0 (testmodus)
- [x] Plus verwijderd; aanbod Quickscan, Basis, Compleet
- [x] Vragenlijst, rekenregels, veiligheidsmeldingen, rapport met PDF en printen
- [x] Leads veilig opgeslagen; dashboard /admin/quickscan voor info@sky-lens.be
- [x] Testmodus e-mail afgedwongen op de server (alleen info@sky-lens.be)
- [ ] Rapport- en leadmails versturen — wacht op koppeling en verificatie van sky-lens.be als verzenddomein
- [ ] Beheerdersaccount info@sky-lens.be aanmaken — wacht op gebruiker (wachtwoord)

# Quickscan 2.2 (testmodus)
- [x] Nieuwe vragen, appartement/VME-onderdeel, scoring, rapport en PDF (versie 2.2)
- [x] Zes acceptatievoorwaarden: prioritering met gemeten vraagaantallen, Overslaan, sessiemigratie 2.1→2.2, onveranderlijke oude rapporten, VME-scheiding, scoringsmatrix (docs/quickscan-2.2-scoringsmatrix.md)
- [x] Patch 2.2.1: scheiding privatief/gemeenschappelijk, veiligheid los van barometer, betrouwbare opslag zonder dubbele records, 50 extra tests
- [ ] Twijfelgevallen ouderdomsscores (Q14 oud, Q41/Q42 verouderd, H02 >20j, SL01 oud) — wacht op goedkeuring DIMAC
- [ ] Volledige woning- en appartementroute 2.2.1 in de browser tot PDF doorlopen
- [x] 83 tests geslaagd; volledige doorloop appartement tot rapport en PDF; testinzending verwijderd

# Quickscan 2.3 (testmodus)
- [x] Nieuw rapport (cover, analyse, advies) online en als PDF in Architectural Intelligence-stijl met origineel logo
- [x] Deterministische productaanbeveling (Woningscan, Plus, budgetindicator, geen) met drone alleen bij aanleiding
- [x] Asbestadvies volgens OVAM-grens 2001; 1991–2010 eerst bouwjaar verifiëren
- [x] Doorklik naar aanvraag met juist pakket, drone uit, rapportnummer als referentie
- [x] Tessenderlo-case end-to-end in de browser; 188 tests geslaagd
- [ ] Prijzen/teksten in productkaarten laten nalezen door DIMAC — wacht op gebruiker

# Quickscan 2.3.1 (testmodus)
- [x] Terughoudend productadvies, conditionele verbanden, consistente informatiezekerheid
- [x] Volwaardige VME-presentatie online en PDF; dynamische leesbare PDF
- [x] 205 tests geslaagd; echte inschrijving→rapport→PDF→Plus-aanvraag gecontroleerd, testgegevens verwijderd; VME desktop/mobiel, vier PDF-profielen gecontroleerd; serverpatch uitgerold zonder publicatie
- [x] PDF-paginatie 2.3.1: keep-with-next/keep-together-laag, y-correctie disclaimer, aanbeveling zonder volledige paginareservatie, adviestitel-fontmeting, geen lege adviestitel; vier profielen visueel gecontroleerd

# Quickscan 2.3.2 (testmodus)
- [x] Vragenresolver, renovatie-intentie, verbanden, EPC/wettelijk, documenten, fasen, acties, rapport/PDF
- [x] Tests, typecheck, lokale PDF- en browsercontroles
- [x] Heruitrol quickscan-submit + end-to-end-tests (testgegevens verwijderd)
- [ ] Dashboardtest met beheerdersaccount — wacht op beheerdersaccount
- [ ] Publicatie — wacht op toestemming

# Quickscan 2.3.3 (testmodus) — goedgekeurd plan + 5 aanvullende voorwaarden
- [x] Stap A: vijf praktijkcases als fixtures; 2.3.2-uitkomsten vastleggen
- [x] Condens/schimmel/vocht: Q29-optie, semantische regels, followUpBudget
- [x] Verbanden: prioriteitsprincipes, exacte antwoordgegevens, geen geforceerde verbanden
- [x] Geen niet-gemelde werken als gepland (fasen/acties herleidbaar naar antwoorden)
- [x] Documentstatussen: beschikbaarheid/inhoud/geldigheid, relevantie
- [ ] Informatiedekking: vier gebruikersgerichte niveaus nog afwerken; bestaande interne codes behouden
- [x] VME compacter: thematisch, max. vijf kernvragen, geen doublures
- [x] Asbest 1991–2010: bouwjaarvervolgvraag, consequent in alle lagen
- [x] Persoonlijke conclusie
- [ ] PDF-paginering: onafhankelijk bewijs van oorspronkelijke historische layout en expliciete renderer-isolatie nog nodig
- [x] Sessiemigratie 2.3.2→2.3.3
- [x] Tests: 5 cases + randgevallen + historische regressie (292/292); typecheck; build OK
- [x] Lokale rapport-/PDF-generatie en visuele controle per case
- [x] Browsercontroles (BJ01-vraag, mobiele weergave)
- [x] docs/quickscan-2.3.3-oplevering.md met case-vergelijking en bewijsvoering
- [ ] Server-side end-to-end — wacht op afzonderlijke uitroltoestemming

# Quickscan 2.3.3 — Final Quality & Email Delivery
- [x] Concreet kwaliteits-, implementatie- en migratievoorstel opgesteld vóór gedeelde wijzigingen
- [ ] Onafhankelijke oorspronkelijke 2.3.2-scorebaseline en historische PDF-layoutreferenties verifiëren
- [x] Vier gebruikersgerichte informatiedekkingsniveaus, commerciële codes ongewijzigd (13 gerichte kwaliteitstests)
- [ ] Veilige persoonlijke PDF-bijlage: lokale Deno-generator en 25 mail/worker-tests gereed; productie-adapters/volledige outbox wachten op providerconfiguratie en afzonderlijke migratie-/uitrolfase
- [ ] 330/330 tests, vijf lokale Deno-PDF's en sessiemigratie op desktop/mobiel uitgevoerd; volledige oorspronkelijke historische referenties ontbreken, VME-slotpagina en Plus-blok nog niet volledig aanvaard
- [ ] Provider/domein/secrets configureren — wacht op afzonderlijke toestemming en verificatie
- [ ] Gedeelde migratie/uitrol en echte testmail met PDF — wacht op afzonderlijke toestemming
- [ ] Publieke activering blijft uitgesloten zonder afzonderlijk akkoord
