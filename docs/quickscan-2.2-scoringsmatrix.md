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
