# Dimac Restyle — Premium White & Orange

Transform the current warm-dark aesthetic into a clean, editorial, white-and-orange renovation brand. All placeholder text, images, reviews and stats stay untouched — only visual system, tokens and component styling change.

## Scope guardrails
- No changes to page structure, routes, navigation labels or copy.
- No changes to data files (`src/data/services.ts`), placeholder images, reviews, stats.
- No new dependencies. Keep React + Tailwind + shadcn stack.
- Fully responsive; existing breakpoints preserved.

## 0. Brand name
Use **"Dimac"** only — never "Dimac BV". Sweep all components, meta, footer, navbar, alt text, and `index.html` (title, description, og:*, twitter:*) to drop the "BV" suffix. Logo alt becomes "Dimac". Remove the small "BV" chip currently rendered next to the logo in Navbar and Footer.

## 1. Design tokens (`src/index.css`)
Replace the current warm off-white / charcoal / copper palette with a strict white + charcoal + Dimac orange system, all in HSL:

- `--background` → #FFFFFF
- `--surface` → #F9F9FB
- `--surface-strong` → slightly deeper neutral for hover/zebra
- `--foreground` / `--primary` → #1A1C20
- `--muted-foreground` → #4B5563
- `--border` → rgba(26,28,32,0.10) equivalent
- `--accent` → #D7641D
- `--accent-hover` → darker ~#B5521A
- `--accent-soft` → very light warm tint (~#FDF2EA), used sparingly
- `--ring` → accent
- Shadows: near-zero hairline; remove glow.

Typography swap:
- Replace Fraunces + Manrope with **Playfair Display** (headings) and **Inter** (body/UI).
- Update `body` and heading font-family + `tailwind.config.ts` `fontFamily.display` / `fontFamily.sans`.

## 2. Component-level cleanup (presentation only)
- **Button**: solid = orange bg + white text, hover darker orange; outline = 1px charcoal border on white; ghost = orange on hover. No heavy shadows.
- **Navbar**: white bg always, border-b on scroll, active link orange, dropdown = white card + 1px border, no glow. Drop "BV" chip.
- **Footer**: light bg (`--surface` or white) with charcoal text, thin top border, orange used only on CTA / small accents. Drop "BV" chip. Brand text = "Dimac".
- **Section**: `bg="primary"` variant retuned from dark fill → light neutral band with charcoal type.
- **CTABlock** `variant="dark"`: convert to light card + orange CTA.
- **ServicePage** "Outcome" band: switch from `bg-primary text-primary-foreground` to light surface with orange eyebrow.
- **FAQ / WorkflowSteps / BulletList / ImagePlaceholder / Card**: hairline borders, no elevated shadows, whiter card bg, more padding.
- Eyebrow keeps orange + hairline (fits 10% orange rule).

## 3. Spacing & rhythm
- `Section` padding `py-20 md:py-28` → `py-24 md:py-36`.
- Larger card internal padding, wider grid gaps.
- Thin 1px `border-border` dividers instead of filled surfaces.

## 4. Pages sweep (visual only)
Audit and neutralize dark fills, heavy shadows, and orange backgrounds on: `Index`, `Woningscan`, `Werkwijze`, `Realisaties`, `Reviews`, `Over`, `Contact`, `Diensten`, `DienstDetail`. Replace with white / `--surface` + hairline borders. Orange only on CTAs, eyebrows, active states, small accents.

## 5. Verification
- Playwright headless on `/`, `/diensten/totaalrenovatie`, `/werkwijze`, `/contact` at 1280×1800 and mobile 390×844.
- Confirm: white dominance, orange only on accents/CTAs, no dark bands, editorial serif headings, generous whitespace, no "Dimac BV" strings anywhere.

## Technical notes
- All colors via semantic tokens (`bg-background`, `bg-surface`, `text-primary`, `text-accent`, `border-border`). No hex literals or `text-white`/`bg-black` introduced.
- Only `index.css` values change for palette; Tailwind config already exposes semantic tokens. Font families updated in both files.
- Google Fonts `@import` swapped to Playfair Display + Inter with the weights used.
