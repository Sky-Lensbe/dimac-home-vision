# Roadmap

## Finale rapportoptimalisatie 2.3.4
- [ ] Gedeelde presentatie zonder wijzigingen aan scores, veiligheid, routing of snapshots
- [ ] Originele tekeningen online; compacte A4-cover en inhoudsgestuurde paginering
- [ ] Eén afsluitend voorbehoud, contextuele waarschuwingen behouden, duidelijke premielinks
- [ ] Vijf rapportlengtes lokaal genereren en elke pagina inspecteren; desktop/mobiel en download controleren
- [ ] Voorbeeld-PDF, screenshots en vergelijking opleveren
- [ ] Serveruitrol van deze presentatiecorrecties — wacht op afzonderlijke toestemming

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
