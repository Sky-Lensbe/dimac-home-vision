## Doel

Een consistente, premium interactielaag over de volledige site. Alleen visueel gedrag: geen teksten, labels, routes, data, SEO of component-API's wijzigen.

## Aanpak

### 1. Fundament (src/index.css + tailwind.config.ts)
- Reveal-utilities toevoegen: `.reveal` (start op `opacity:0; translateY(16px)`), `.is-visible` (eind-state), plus stagger-varianten via een `--reveal-delay` custom property.
- Alles binnen `@media (prefers-reduced-motion: reduce)` neutraliseren: geen translate, geen scale, geen delay, meteen zichtbaar.
- Fallback zonder JS: `.no-js`/timeout-safeguard zodat content altijd zichtbaar blijft.
- Eyebrow-accentlijn: lijn schaalt horizontaal op bij reveal en verlengt licht bij `group-hover` van de sectie.
- Nieuwe timing-tokens (ease-out, 200–350 ms micro, 350–600 ms kaarten/beelden, 500–700 ms reveals).

### 2. Scroll-reveal mechanisme
- Eén lichte hook `src/hooks/use-reveal.ts` met één gedeelde IntersectionObserver die alle `[data-reveal]`-elementen observeert (geen observer per element), unobserve na eerste keer → animatie speelt maximaal één keer.
- Aanroepen op app-niveau (Layout), zodat pagina's alleen `data-reveal` + optioneel `data-reveal-delay` als attribuut zetten.

### 3. Gedeelde componenten
- **Button**: sterkere hover/active/focus-visible; primair 1 px lift op `lg`, pijl `group-hover:translate-x-0.5`, outline/ghost rustiger; `active:translate-y-0` voor directe feedback.
- **Section**: eyebrow → titel → children stagger via reveal-attributen; `group` op de sectie voor accentlijn-hover.
- **CTABlock**: sectie reveal als geheel met korte stagger op eyebrow/titel/tekst/knoppen; subtiele accentlijn.
- **ImagePlaceholder**: zoom alleen `lg:group-hover:scale-[1.04]` (tablet max 1.02, mobiel geen zoom), overlay-reactie subtieler, `fit="contain"` blijft ongemoeid (geen zoom op contain), geen aspect-ratio- of layout-shift.
- **WorkflowSteps**: sequentiële reveal per stap, nummer/accentlijn reageert bij hover op `lg`, mobiel eenvoudige verticale volgorde.
- **FAQ**: bestaande grid-rows-animatie verfijnen (kortere duur), rij-achtergrondreactie, open item krijgt accentrand links, duidelijke `focus-visible`, keyboard blijft werken.
- **BulletList**: lichte staggered reveal per groep (niet per item apart geobserveerd).
- **Navbar**: scroll-state met subtiele achtergrond/rand/schaduw zonder hoogteverandering; hover-underline die opbouwt; dropdown met opacity + translate-y en een onzichtbare hover-brug zodat hij niet sluit tussen trigger en menu; mobiel menu met opacity/height-animatie, tapzones ≥ 44 px, submenu-animatie, geen hover-hang op touch (`lg:hover:`).
- **Footer**: linkreacties, accentlijn, duidelijke focusstates.

### 4. Pagina's
Per pagina alleen reveal-attributen en kaart-/beeld-interacties toevoegen (Index, Woningscan, Diensten, DienstDetail via ServicePage, Werkwijze, Realisaties, Reviews, Over, Contact):
- Kaarten (diensten, voordelen, vertrouwen, positionering, instappaden, realisaties): rand in accentkleur, subtiele achtergrond, `lg:hover:-translate-y-1`, pijl schuift, zeer subtiele schaduw. Volledige kaart blijft klikbaar bij eerste tik.
- Realisatiekaarten: beeldzoom + lichte overlay + tekst enkele px omhoog op `lg`; geen tekstoverlay op het beeld.
- Contactformulier: alleen focus-visible-ring, rustige hoverstate, active-feedback op submit; velden, labels, validatie en verzending onaangeroerd.
- Sticky: alleen waar functioneel (bv. beeld naast lange content) vanaf `lg`, met offset voor de vaste navbar; nooit op mobiel/tablet.

### 5. Controle
- `tsgo` typecheck en buildcheck.
- Playwright: alle hoofdroutes op 390 px en 1280 px; home/woningscan/diensten extra op 768 px en 1024 px; check op horizontale overflow, consolefouten, dropdown, mobiel menu, FAQ, formulier, en een run met `prefers-reduced-motion: reduce`.
- Niet publiceren.

## Technische details
- Geen externe animatiebibliotheek; uitsluitend CSS/Tailwind + één IntersectionObserver.
- Alleen `transform` en `opacity` animeren; geen layout shift, lazy loading blijft behouden, hero niet vertraagd.
- Responsive niveaus: mobiel = fade/opacity + active-feedback; tablet = beperkte stagger, max scale 1.02; desktop (`lg`) = volledige hover-laag.
