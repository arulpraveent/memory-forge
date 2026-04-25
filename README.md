# Memory Forge

A Gundam-themed spaced repetition flashcard app inspired by the **Gundam Astray Gold Frame Amatsu Mina**. Built with Nuxt 4, Supabase, and the FSRS algorithm via `ts-fsrs`.

## Stack

- **Framework**: Nuxt 4 (`compatibilityVersion: 4`)
- **Backend**: Nitro API routes
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v4 (CSS-first, no config file)
- **State**: Pinia (Setup Store syntax)
- **SRS**: `ts-fsrs` (server-side only)

## Project Structure

```
Memory-Forge/
├── app/                    # Frontend source (~ and @ alias here)
│   ├── assets/css/main.css # Design tokens (@theme), all Tailwind customization
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── pages/
│   ├── stores/             # Pinia stores
│   └── app.vue
├── server/                 # Nitro API routes (root-level, Nuxt 4 convention)
│   └── api/
├── shared/
│   └── schemas/            # Supabase-generated TS types + Zod schemas
├── nuxt.config.ts
└── .env.example
```

## Setup

```bash
cp .env.example .env      # Add your Supabase URL and anon key
npm install
npm run dev
```

## Commands

```bash
npm run dev       # Dev server
npm run build     # SSR production build
npm run generate  # Static generation
npm run preview   # Preview production build
```

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

## Auth

Routes `/`, `/register`, and `/confirm` are public. All others require a Supabase session. Redirects configured in `nuxt.config.ts`.
