# AGENTS.md

Astro portfolio site for Titouan Blaize, with an embedded chat widget backed by the [MeMyself-RAG_Backend](../MeMyself-RAG_Backend) API (FastAPI + Postgres/pgvector + Claude, deployed on Render). This file covers what's easy to miss; see `README.md` for the rest.

## Run locally
```
npm install
cp .env.example .env   # set PUBLIC_API_URL (defaults to the deployed Render backend)
npm run dev
```
No local backend needed — `.env.example` points at the production API by default. Point `PUBLIC_API_URL` at `http://localhost:8000` only if you're also running the backend locally.

## No test suite
No automated tests in this repo — verify changes by running the dev server and using the page/chat widget directly in a browser.

## Stack
Astro 7 (static site) + `@astrojs/react` (for the one interactive island) + Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js` — v4 is CSS-first, see `src/styles/global.css`).

## Architecture
- `src/pages/index.astro` — the entire site: one page (hero, chat, experience/formation timelines). `experiences`/`formations` arrays are hardcoded in the frontmatter, sourced from Titouan's CV — not pulled from a CMS or the backend.
- `src/layouts/Layout.astro` — HTML shell; imports `src/styles/global.css` (Tailwind entrypoint).
- `src/components/Chat.tsx` — the only interactive part, a React island mounted with `client:load`. POSTs `{ question }` to `${PUBLIC_API_URL}/chat`, expects `{ answer, sources }` back. Renders `answer` with `react-markdown` — **do not** revert to a raw `<p>{answer}</p>`, the backend's answers contain Markdown (e.g. `**bold**`) that must be parsed, not shown literally.
- `src/assets/titouan.jpg` — portrait, rendered via `astro:assets`'s `<Image>` component (not a plain `<img>`), so the ~5MB source gets resized/compressed at build time. Passing both `width` and `height` (480×480) triggers Sharp's default `cover` fit, cropping it to a centered square — don't add a `fit` prop, it's not needed.

## Gotchas
- **`PUBLIC_` prefix is mandatory** on any env var read client-side (`import.meta.env.PUBLIC_API_URL` in `Chat.tsx`). Astro/Vite strips unprefixed vars from the client bundle — renaming it without the prefix silently breaks the chat with no build error.
- **Color palette is intentional, not default Tailwind**: `stone` (background/text) + `emerald` (headings, timeline borders, chat button) were chosen to echo the green foliage in the portrait photo. Don't reintroduce `neutral`/`gray` when touching styles.
- **Backend CORS is wide open** (`allow_origins=["*"]` in the backend's `app/main.py`) — fine while this site has no fixed domain yet, but must be restricted to the real Cloudflare Pages domain before/at launch.
- **Backend cold starts**: the Render free-tier backend spins down after ~15 min idle; the first `/chat` call after that can take 10–30s. `Chat.tsx`'s loading state (button shows `...`) already covers this — it's not a bug if a first request feels slow.

## Deploy
Target is Cloudflare Pages (not yet set up). Build command `npm run build` → static output in `dist/`. Set `PUBLIC_API_URL` as a Cloudflare Pages environment variable (production backend URL) rather than relying on the committed `.env`.
