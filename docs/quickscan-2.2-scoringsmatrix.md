# DIMAC Quickscan 2.2 — scoringsmatrix nieuwe en gewijzigde technische vragen

Schaal 0–10 per antwoord; per domein telt alleen het **hoogste** signaal (maximum, geen som), zodat overlappende vragen nooit dubbel tellen.
"null" = onbekend: telt niet als gunstig of ongunstig en verlaagt alleen de informatiezekerheid.
"—" = geen technische score (context). Domeingewichten blijven ongewijzigd: B 0,25 · V 0,25 · E 0,2 · T 0,2 · S 0,1.

| Vraag | Antwoord | Domein | Score | Motivatie | Overlap |
|---|---|---|---|---|---|
| DI01 dakisolatie | Recent/degelijk | E | 0 | Geen energetisch signaal | Q13 (dak geïsoleerd): enkel context |
| DI01 | Beperkt of ouder | E | 3 | Verbetermogelijkheid, geen gebrek | max met Q34/MI01/G01 |
| DI01 | Gedeeltelijk | E | 4 | Gedeeltelijk = gekende lacune | idem |
| DI01 | Niet geïsoleerd | E | 7 | Gekende afwezigheid; grootste energiepost bij woningen | idem |
| DI01 | Weet ik niet | E | null | Onbekend is geen slecht resultaat | — |
| G01 beglazing | Enkel glas | E | 6 | Energetische eigenschap, niet B | Q20 (staat ramen) blijft B; geen dubbeltelling over domeinen |
| G01 | Ouder dubbel / verschillende soorten | E | 3 | Beperkte verbetermogelijkheid | — |
| G01 | HR / driedubbel | E | 0 | — | — |
| G01 | Weet ik niet | E | null | — | — |
| MI01 muurisolatie | Geïsoleerd | E | 0 | — | — |
| MI01 | Gedeeltelijk | E | 3 | Gekende lacune | — |
| MI01 | Spouw/massief, isolatie onbekend | E | null | Muurtype zegt niets over isolatie | — |
| MI01 | Niet geïsoleerd | E | 6 | Gekende afwezigheid | — |
| VL02 vloerisolatie | Ja / Gedeeltelijk / Nee | E | 0 / 2 / 4 | Kleinere energiepost dan dak of muur | VL01 (opbouw) is context |
| VL02 | Weet ik niet / Niet van toepassing | E | null / — | — | — |
| Q34 EPC | A+ of A / B / C / D / E / F | E | 0 / 1 / 2 / 4 / 7 / 9 | B apart van A; B is geen ernstig probleem | Vervangt gecombineerde "A+/A/B" (0) |
| SL01 leidingen | 0–15 / 16–25 / >25 / gedeeltelijk / origineel | T | 0 / 1 / 3 / 1 / 3 | Ouderdom is context, laag gewicht | Q45 (lekkage tot 9) weegt via maximum zwaarder |
| M01 water binnen | Nee / mogelijk / bij regen / actieve lekkage | V | 0 / 6 / 8 / 10 | Onderscheid vochtplek, mogelijke infiltratie en lekkage; actief → SAFE-04 | Q24/Q16/Q23: maximum, één vochtpunt in de top |
| AB02 badkamer (appartement) | Geen / beperkt / duidelijk | V | 0 / 4 / 7 | Privatief vochtsignaal | Q24: maximum |
| Q30 scheuren | Zichtbare verzakking of vervorming (nieuw) | S | 10 | Veiligheidsrelevant → SAFE-06, prioritair | Q32 (vloeren verzakt): maximum |

## Zonder technische score (bewust)

O01/O02 oppervlakte, R01 renovatiehistoriek, K01 kelder, Z01 zolder, B01 bijgebouwen, ST01 stedenbouw, VL01 vloeropbouw, AS01/AS02 asbest, RI01 riolering, AK01/AB01 keuken- en badkamerleeftijd, en alle mede-eigendomsvragen (A01–A07, CD01, CL01).
Ze worden opgeslagen als contextgegevens (`context` in het rapport) en verschijnen als meldingen of in het hoofdstuk over mede-eigendom, maar wijzigen de barometer niet.

## Verwijderd

Q36 (algemene isolatievraag) is vervangen door DI01, MI01 en VL02, zodat isolatie niet dubbel gevraagd wordt.

## Patch 2.2.1 — inhoudelijke correcties (vraag-, regel- en rapportversie 2.2.1)

Geen nieuwe scorewaarden en geen gewijzigde domeingewichten. Nieuwe vraag-ID's hergebruiken uitsluitend bestaande scores.

| Wijziging | Vraag / regel | Antwoord | Domein | Score | Motivatie |
|---|---|---|---|---|---|
| Routesplitsing | Q04 (woning) / Q04A (appartement) | Q04A zonder dak en gevel | — | — | Dak/gevel van een appartementsgebouw zijn meestal gemeenschappelijk; die informatie zit in CD01. Ramen blijven, met verwijzing naar de basisakte |
| Routesplitsing | Q07 (woning) / Q07A (appartement) | vocht binnen het appartement | V | 7 | Zelfde waarde als Q07 vocht |
| | Q07A | technieken binnen het appartement | T | 7 | Zelfde waarde als Q07 technieken |
| | Q07A | gemeenschappelijke delen (dak, gevel) | — | — | Niet privatief; VME-signaal en syndicusvraag. Vervangt Q07 dak (B 7) voor appartementen |
| Routesplitsing | Q13 / Q13A | Q13A zonder dak en gevel | — | — | Context, geen score |
| Routesplitsing | Q25 / Q25A | Q25A: plafond, buitenmuur, ramen, badkamer, meerdere, gemeenschappelijke kelder | — | — | Geen eigen kelder of zolder bij appartementen |
| Nieuw (context) | KV01 water in gemeenschappelijke kelder | alle | — | — | VME-context; 'actief' geeft SAFE-04 als gemeenschappelijke melding zonder barometerimpact |
| Nieuw (toewijzing) | SC01 locatie scheuren (appartement) | alle | — | — | Bepaalt alleen privatief/gemeenschappelijk, nooit de verantwoordelijkheid |
| Regel | Q30/Q31 bij SC01 = alleen gemeenschappelijk | — | S | niet geteld | Zichtbaar via SAFE-03/06 en VME-hoofdstuk. 'Binnen', 'beide' en 'weet ik niet' blijven privatief geteld (niet geruststellen bij onzekerheid). Q32/Q33 (eigen vloeren, ramen en deuren) blijven tellen |
| Regel | Q42 bij collectieve verwarming | ook 'gas' | T | niet geteld | Was T 10 in 2.2. SAFE-01 blijft altijd getoond, maar als gemeenschappelijke melding zonder barometerimpact |
| Regel | Barometer | — | — | — | Alleen privatieve veiligheidsmeldingen verhogen de categorie. Gemeenschappelijke meldingen worden apart getoond (titel met "(gemeenschappelijke delen of installatie)") en in de samenvatting vermeld |
| Trigger | Q28 kelderwater | — | V | ongewijzigd | Enkel woningen; niet bij K01 = geen of kruipruimte |
| Trigger | M01 waterinfiltratie | — | V | ongewijzigd | Ook bij Q25A plafond/buitenmuur; niet opnieuw gevraagd bij Q14 = actieve lekkage (al V 10 en SAFE-04) |
| Trigger | Q45 sanitair | — | T | ongewijzigd | Trigger via Q41 'weet ik niet' (elektriciteit) verwijderd; badkamer, vernieuwd sanitair, oud gebouw, oude leidingen en riolering blijven |
| Routesplitsing | Q46 / Q46A | Q46A zonder dak en gevel | — | — | Gemeenschappelijke werken beslist de VME (A02) |

### Twijfelgevallen (ouderdom ≠ bewezen gebrek) — scores behouden, goedkeuring DIMAC gevraagd

| Vraag | Antwoord | Huidige score | Vraag aan DIMAC |
|---|---|---|---|
| Q14 | Ouder dak zonder gekende problemen | B 3 | Behouden als laag signaal of naar 1? Geen aandachtspunttekst over schade |
| Q41 | Verouderd, zonder gekende problemen | T 3 | Idem |
| Q42 | Functioneert, maar is verouderd | T 3 | Idem; de tekst van AP-VERW vermeldt nu dat ouderdom alleen geen gebrek is |
| H02 | Meer dan 20 jaar | T 3 | Idem |
| SL01 | Meer dan 25 jaar / vermoedelijk origineel | T 3 | Idem |
| Q07A | 'Ja, iets anders' | B 4 (via AP-HERHAALD-ANDERS) | Onderdeel onbekend; mogelijk gemeenschappelijk bij appartementen |

### Migratie
- Sessies 2.2 → 2.2.1: woningen ongewijzigd. Appartementen: Q04/Q13/Q46 met dak of gevel, Q25 met zolder of kelder, en Q07 behalve 'nee' worden opnieuw gevraagd. Gemigreerde sessies hervatten in de vragenlijst.
- Opgeslagen rapporten (2.1, 2.2) blijven onveranderde snapshots en worden niet herberekend.
