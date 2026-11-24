# Roadmap

## Automatische verzending
- [x] Voorlopige extra kopieën van alle aanvragen en Quickscan-PDF's naar info@sky-lens.be; bestaande ontvangers behouden, getest en uitgerold
- [x] Quickscan PDF naar aanvrager en interne melding naar DIMAC activeren
- [x] Contact-, renovatie- en Woningscan-aanvragen automatisch verzenden
- [x] Beveiligde bewaarkopie van aanvragen, met status bij mailproblemen
- [x] Tests en echte formulierinzendingen controleren; niets publiceren

## Juridische frontend en launchaudit
- [x] Audit bedrijfsgegevens, mailmodus, opslag, tracking en retentie
- [x] Vier juridische pagina’s, herroepingsmodel en footerlinks
- [x] Quickscan-, Woningscan- en contactteksten zonder verplichte marketing/privacytoestemming
- [x] Regeltests, browsercontrole desktop/mobiel en oplevering launchblokkades
- [ ] Juridische goedkeuring en bewaarbeleid activeren — afzonderlijk akkoord en contractuele controle nodig

## Finale rapportoptimalisatie 2.3.4
- [x] Gedeelde presentatie zonder wijzigingen aan scores, veiligheid, routing of snapshots
- [x] Originele tekeningen online; compacte A4-cover en inhoudsgestuurde paginering
- [x] Eén afsluitend voorbehoud, contextuele waarschuwingen behouden, duidelijke premielinks
- [x] Vijf rapportlengtes lokaal genereren en elke pagina inspecteren; desktop/mobiel en download controleren
- [x] Voorbeeld-PDF, screenshots en vergelijking opleveren
- [x] Serveruitrol van deze presentatiecorrecties — meegenomen bij goedgekeurde activering van rapportmail

## Quickscan 2.3.4 (lokale implementatie — afgerond)
- [x] Engine: G01 "Recent dubbel glas" (E2), H01 meerkeuze + H01B hoofdverwarming (dynamische opties), H03 warmteverdeling, VL03 vloerverwarming, Q30/Q37-teksten, legacy H01-normalisatie vóór resolver
- [x] Rapportlaag: comfortadvies (verwarming nooit automatisch oorzaak), COM-11 vloerverwarming, premiesectie met vier officiële bronnen, extensie v234
- [x] Sessiemigratie 2.3.3 → 2.3.4 (H01 string → array, hervat in vragenlijst)
- [x] PDF: nieuwe renderer render234 (premium A4-cover met DIMAC-tekeningen, diagonale vlakken, gradientzone, slagzin, premiesectie); dispatch per opgeslagen versie; 2.3.3 en ouder ongemoeid
- [x] Server (send-report): dispatch 2.3.4 → render234 met art-assets; allowlist/testmodus ongewijzigd
- [x] Testen: 356/356 groen (incl. 26 nieuwe 2.3.4-testen, score-invariantie vijf cases), typecheck schoon
- [x] Lokale strenge PDF-controle (Deno, strict assets): 2.3.4-PDF gegenereerd, cover visueel gecontroleerd

## Open — wacht op afzonderlijk akkoord van de gebruiker
- [x] Eerdere 2.3.4-serveruitrol en vijf synthetische servertests (zoals bevestigd in vorige oplevering); niet herhaald voor deze correctieronde
- [ ] Publicatie — geblokkeerd: nooit zonder expliciete toestemming
