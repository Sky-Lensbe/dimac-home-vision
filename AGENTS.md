# AGENTS.md

- Woningscan prices and drone option live only in `src/data/woningscan.ts`; UI and tests read from there so prices never drift.
- Contact and Woningscan forms have no backend: they build a `mailto:` via `src/lib/mailto.ts` and must never show a "received" confirmation; the Woningscan form recipient comes from `woningscanRecipient()` (code-constant test mode, never env-based). The Quickscan is the exception and stores leads through the `quickscan-submit` function.
- Confirmed projects live in `src/data/developments.ts`; missing images and descriptive fields remain optional so incomplete records never require invented content. When empty, pages show the development approach instead of cards.
- Indexing is off unless `VITE_ALLOW_INDEXING=true` (PageSEO forces noindex; robots.txt disallows) because the site is not live yet.
- Analytics events go to `window.dataLayer` via `track()`; never include personal data, and a mailto handoff is not a sent message.
- Do not put lead-qualification/scoring logic in frontend code; it belongs behind a secured backend.
- Quickscan rules live only in `supabase/functions/_shared/quickscan/engine.ts` (no imports), shared by browser and server; the server always recomputes. Stored reports are immutable snapshots shown via `src/lib/quickscanSnapshot.ts`, which must never import the engine so old reports are never silently recomputed.
- Quickscan email recipients are decided only by `supabase/functions/_shared/quickscan/mail-policy.ts`; test mode is a code constant with a server-side allowlist so it can never switch to production automatically.
- Quickscan tables allow no anonymous access; inserts go through the service-role function and only `has_role(admin)` users can read, so lead data is never public.
