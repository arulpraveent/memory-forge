# Memory Forge

A Gundam-themed spaced repetition flashcard app inspired by the **Gundam Astray Gold Frame Amatsu Mina**. Built with Nuxt 4, Supabase, and the FSRS algorithm via `ts-fsrs`.

## Stack

- **Framework**: Nuxt 4 (`compatibilityVersion: 4`)
- **Backend**: Nitro API routes
- **Database & Auth**: Supabase (RLS enforced on all tables)
- **Styling**: Tailwind CSS v4 (CSS-first, no config file)
- **State**: Pinia (Setup Store syntax)
- **SRS Engine**: `ts-fsrs` — all scheduling runs server-side only

## Features

- **Decks** — create, edit, and decommission flashcard modules
- **Cards** — deploy data cards (front/back) into any deck
- **Review flow** — step-through sortie with FSRS-powered scheduling; floating rating bar shows projected next-review time per rating (Abort / Challenging / Confirmed / Optimal)
- **Sortie dashboard** — home page shows only decks with cards currently due
- **Pilot callsign** — Gundam-themed display name generated from `data/names.json`; holographic scramble animation in the header

## Routes

| Path | Description |
|---|---|
| `/` | Active sorties — decks with due cards |
| `/decks` | Hangar Bay — full deck management |
| `/decks/:id/manage` | Card management for a specific deck |
| `/decks/:id/review` | Review session for a specific deck |

## Project Structure

```
Memory-Forge/
├── app/
│   ├── assets/css/main.css   # Design tokens (@theme), all Tailwind config
│   ├── components/
│   ├── composables/
│   ├── data/names.json       # Gundam name lists for display-name generation
│   ├── pages/
│   │   └── decks/[id]/       # manage.vue, review.vue
│   └── stores/
├── server/api/
│   ├── decks/                # CRUD + due endpoint
│   └── cards/                # CRUD + due + [id]/{review, schedule}
├── shared/schemas/           # Supabase TS types + Zod schemas
└── nuxt.config.ts
```

## Setup

```bash
cp .env.example .env   # add Supabase URL and anon key
npm install
npm run dev
```

## Commands

```bash
npm run dev       # Dev server
npm run build     # SSR production build
npm run test      # Vitest unit tests
```

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

---

*Built by Arul Praveen T in collaboration with [Claude Code](https://claude.ai/code) — powered by **claude-sonnet-4-6** (Anthropic).*
