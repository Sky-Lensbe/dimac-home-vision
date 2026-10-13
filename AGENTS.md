# AGENTS.md

- Woningscan prices and drone option live only in `src/data/woningscan.ts`; UI and tests read from there so prices never drift.
- Forms have no backend: they build a `mailto:` via `src/lib/mailto.ts` and must never show a "received" confirmation; tell the visitor to send the mail themselves.
- Confirmed projects live in `src/data/developments.ts`; missing images and descriptive fields remain optional so incomplete records never require invented content. When empty, pages show the development approach instead of cards.
- Indexing is off unless `VITE_ALLOW_INDEXING=true` (PageSEO forces noindex; robots.txt disallows) because the site is not live yet.
- Analytics events go to `window.dataLayer` via `track()`; never include personal data, and a mailto handoff is not a sent message.
- Do not put lead-qualification/scoring logic in frontend code; it belongs behind a secured backend.
