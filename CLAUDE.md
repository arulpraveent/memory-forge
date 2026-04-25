## Mindset
- Act as a Senior Full-Stack Vue/Nuxt Developer.
- Prioritize type safety, modularity, and strict adherence to the Gundam design system.
- Write clean, DRY code. Do not explain the code unless specifically requested; prioritize delivering working code.

## App Overview
- **Project Concept**: A Gundam-themed Anki clone (Spaced Repetition flashcard app).
- **Core Features**: 
  - Flashcards consisting of `front` (question/prompt) and `back` (answer/info) texts.
  - **Spaced Repetition Engine**: We use the `ts-fsrs` library for calculating the spaced repetition intervals.
- **Critical Logic Rule**: All `ts-fsrs` scheduling calculations MUST be done in the **backend (Nitro)**. The frontend should only send review logs and receive the next calculated review states/dates.

## Commands
- `npm run dev`
- `npm run build` / `npm run generate` / `npm run preview`
- `npm install` (Runs `nuxt prepare` via postinstall)

## Project Structure

```
Memory-Forge/
├── app/                    # All frontend source (~ and @ alias resolves here)
│   ├── assets/css/main.css # ONLY CSS file — all @theme tokens, Tailwind config
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── pages/
│   ├── stores/             # Pinia stores
│   └── app.vue
├── server/                 # Nitro API routes — root-level (NOT inside app/)
│   └── api/                # Route handlers e.g. server/api/cards.get.ts
├── shared/
│   └── schemas/            # Supabase TS types + Zod schemas
├── nuxt.config.ts
└── .env.example
```

## Architecture & Code
- **Nuxt 4 Layout**: Uses `future: { compatibilityVersion: 4 }`. All app source code is inside the `app/` directory. Path aliases `~` and `@` resolve to `app/`. Use the Nuxt remote MCP whenever architecture or Nuxt-based changes are needed.
- **Nitro (Backend)**: Uses Nitro as the backend. The `server/` folder lives at the **project root** (not inside `app/`). Create `server/api/` route files there — filenames define the route paths.
- **Shared**: The `@shared` folder contains schemas for DB, Zod configurations, and specialized request/response objects.
- **TypeScript**: Always prefer using objects/maps wherever possible in code for enums and data objects. Avoid plain strings or easily breakable magic values.
- **State Management**: Use **Pinia** for global state and business logic.
  - Define stores in `app/stores/`.
  - Always use the "Setup Store" syntax (functions) instead of "Options API".
- **Data Fetching**: Always use Nuxt's `useFetch` or `useAsyncData` for component-level data fetching. Use `$fetch` for client-side interactions or inside Pinia/Nitro actions. Do not use Axios.
- **Icons**: We use the **Nuxt Icon** module. Always use the `<Icon name="collection:icon-name" />` component for icons.

## Auth & Database
- **Supabase**: Used for both Database operations and Authentication via the Nuxt Supabase module.
- **Auth Implementation**: We use Supabase basic auth. The auth middleware is configured in `nuxt.config.ts`. Use built-in Supabase auth calls in both frontend and backend wherever applicable.
- **Database Operations**: Use `useSupabaseClient()` to query the DB directly. You have access to the Supabase MCP—make use of it for database operations.
- **Schema & Validation**: Table schemas are stored at `@shared/schemas`. Always use Zod to validate input data before database writes and for API payloads.

## Design System
- **Core Philosophy**: The app's aesthetic is inspired by the **"Gundam Astray Gold Frame Amatsu Mina"** Gunpla model. This means a dark, aggressive theme with sharp angles, intentional asymmetry, and glowing metallic accents.
- **Styling (Tailwind v4)**: We use **Tailwind CSS v4** with a CSS-first approach.
  - **There is NO `tailwind.config.js` file.**
  - All design tokens (colors, fonts, spacing, shadows) are defined as CSS variables inside the `@theme` block in **`app/assets/css/main.css`**. Reference this file for utility classes like `bg-armor-900`, `text-frame-500`, `font-mecha`, etc.
- **Shapes (NO Rounded Corners)**: Do not use Tailwind's `rounded-*` utility classes. All components must have sharp, angular corners using CSS `clip-path`.
  - **Example Implementation:**
    ```css
    clip-path: polygon(0 0, calc(100% - var(--spacing-cutout-md)) 0, 100% var(--spacing-cutout-md), 100% 100%, 0 100%);
    ```
- **Interactive States:** Hovering over interactive elements should switch from an `armor` background to a `frame` (gold) background, and apply the `shadow-gold` glow. Include a small `bg-decal` red accent square in components.
- **ShadCN Components**: Always use ShadCN components where applicable using the ShadCN MCP server. **CRITICAL:** Because ShadCN defaults to rounded corners, whenever you add a ShadCN component, you MUST immediately modify its source file to remove all `rounded-*` classes and apply our custom `clip-path` logic.

## Git & Workflow
- **Initial Sync**: Before starting any task, always run `git pull origin main`.
- **Branching Strategy**: Always work on a feature branch.
  - Use `git switch -c <branch-name>` for new branches (NEVER use `git checkout`).
  - Naming convention: `feat/feature-name`, `fix/fix-name`, `docs/doc-name`.
- **Commits**: Use Conventional Commits (e.g., `feat(ui): add gold-frame card`).
- **Pushing**: Once a task is complete and verified, push the branch to GitHub.
- **Cleanup**: After a branch is merged into `main`, pull the updates and delete the local merged branches when the user aks using:
  `git branch --merged | grep -v "\*" | grep -v "main" | xargs -n 1 git branch -d`

## Documentation & Env Rules
- **Environment Variables**: Never hardcode secrets. Always use `process.env` (in Nitro) or Nuxt `runtimeConfig`.
- **.env.example**: If a new feature requires a new environment variable, update the `.env.example` file immediately.
- **README Updates**: If a new command or core setup step is added, update the `README.md`.
- **Self-Documenting Code**: Prefer clear variable names over comments. Use JSDoc for complex logic in composables or server utilities.