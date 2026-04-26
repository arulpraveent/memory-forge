## Mindset
- Act as a Senior Full-Stack Vue/Nuxt Developer.
- Prioritize type safety, modularity, and strict adherence to the Gundam design system.
- Write clean, DRY code. Do not explain the code unless specifically requested; prioritize delivering working code.
- **Living Document**: Whenever a new architectural decision, convention, constraint, or tooling choice is made for this project, update this file immediately so it stays the single source of truth.
- **No Limbo**: The user must always know what is happening. Every async action must surface a loading state, and every failure must surface a clear error. Never leave the UI silent or frozen.

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
- **State Management**: Use **Pinia** for global state and business logic (`@pinia/nuxt` module installed).
  - Define stores in `app/stores/`.
  - Always use the "Setup Store" syntax (functions) instead of "Options API".
  - Always type `useSupabaseClient<Database>()` inside stores — import `Database` from `~/types/database.types`.
- **Data Fetching**: Always use Nuxt's `useFetch` or `useAsyncData` for component-level data fetching. Use `$fetch` for client-side interactions or inside Pinia/Nitro actions. Do not use Axios.
- **Icons**: We use the **Nuxt Icon** module. Always use the `<Icon name="collection:icon-name" />` component for icons.
- **Store vs Composable Split**: Business logic and Supabase calls belong in Pinia stores (`app/stores/`). Composables (`app/composables/`) own component-level UI state (form fields, `loading`, `error`, `showPassword`) and call store actions — they are the bridge between the store and the page. Pages are pure UI consumers that destructure from composables.
- **Async Safety**: Always wrap async handlers in `try/finally` so `loading` state is guaranteed to reset even on unexpected errors. Disable all interactive elements (buttons, inputs) for the duration of any in-flight operation to prevent duplicate submissions.
- **Event Safety**: Use `@click.prevent` on non-submit buttons inside forms to guarantee they never accidentally trigger form submission or bubble unexpectedly.

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
- **Error States**: Inputs with errors get a `border-decal-500` red border via `:class` binding. Errors are shown in a crimson banner with a decal accent dot — never just raw text dropped inline. Generic fallback message: "An unexpected error occurred. Please try again."
- **Loading States**: Buttons show an animated spinner alongside text (e.g. "Authenticating...") during loading. Use `disabled:opacity-50` and `disabled:cursor-not-allowed` to make the disabled state visually obvious.
- **Animations**: Add motion wherever it makes the UI feel more alive. All animation tokens (keyframes + `--animate-*` variables) are defined in `app/assets/css/main.css` inside `@theme` and `@keyframes` blocks — this generates Tailwind utilities like `animate-slide-up`. Available tokens:
  - `animate-slide-up` — page/card entrance (fade + translate-y)
  - `animate-expand-x` — horizontal expand from left (e.g. accent bars)
  - `animate-pulse-decal` — slow crimson pulse for decal accent dots
  - `animate-fade-in` — simple opacity fade
  - `animate-spin` — Tailwind built-in, used for loading spinners
  - Use Vue's `<Transition name="error-slide">` (CSS defined in `main.css`) for conditionally rendered elements like error banners — never use `v-show` animations with raw CSS on `v-if` blocks without a `<Transition>` wrapper.
  - Buttons get `active:scale-95` for tactile press feedback.
- **Custom Components**: Build all UI components from scratch as Vue SFCs inside `app/components/`. No third-party component libraries. All styling via Tailwind utility classes and the design tokens in `main.css`.
- **Gundam-Themed Copy**: All user-facing text — placeholders, labels, loading messages, empty states, and button labels — must use Gundam / military-operations vocabulary (e.g. "Module Designation", "Briefing", "Deploy Module", "Decommission", "No data modules detected."). Generic error fallback: "An unexpected error occurred. Please try again."
- **Check Previous Components First**: When in doubt about UI patterns, spacing, or clip-path values, read existing pages/components (`app/pages/`, `app/components/`) before writing new ones to maintain visual consistency.

## Security
- **Supabase RLS**: EVERY table MUST have RLS enabled with strict policies. Users can only read, update, and delete their own rows (verified via `auth.uid()`).
- **Nitro API Validation**: All incoming requests to `server/api/*` MUST validate `body` and `query` params using Zod schemas from `@shared/schemas`. Never trust frontend data.
- **Authentication Check**: Frontend route protection is handled via Supabase auth middleware, but Nitro routes MUST independently verify the session via `serverSupabaseUser(event)` before fulfilling any restricted request.
- **Preventing XSS**: Avoid `v-html` entirely. If rendering formatted/markdown text, sanitize through DOMPurify or Nuxt MDC before rendering. Default to `{{ }}` interpolation.
- **Secret Management**: Backend-only secrets go in the root `runtimeConfig` only. Only browser-safe values (public Supabase URL/key) go in `runtimeConfig.public`.

## Testing
- **Framework & Tools**: We use **Vitest** alongside **@nuxt/test-utils** for testing. Server route unit tests use plain Vitest (`environment: 'node'`). Frontend component/composable tests use `@nuxt/test-utils` with `environment: 'nuxt'` and `@vue/test-utils` for mounting.
- **File Location**: Co-locate test files next to the files they test using the `.spec.ts` suffix (e.g., `app/components/DeckCard.spec.ts`, `server/api/decks/index.get.spec.ts`).
- **Vitest Config**: `vitest.config.ts` at the project root. Uses `environmentMatchGlobs` to apply `nuxt` env for `app/**` and `node` env for `server/**`. Alias `#supabase/server` → `tests/__mocks__/supabase-server.ts`.
- **Nuxt 4 Mocking Utilities**:
  - Use `mockNuxtImport()` for mocking auto-imported composables (e.g. `useSupabaseClient`) in frontend tests.
  - Use `registerEndpoint()` to mock Nitro API routes in frontend/composable tests.
  - Use `vi.stubGlobal()` to override Nitro auto-import globals (`getRouterParam`, `readBody`) in server route tests.
- **Core Testing Priorities**:
  - **Nitro Backend**: Unit test all route handlers — success responses, 401 unauthenticated, 422 validation errors, 404 not found, 500 DB errors.
  - **Pinia Stores**: Validate state transitions, data mapping, and actions.
  - **Components & Composables**: Focus on emitted events, loading/error state surfacing, and computed UI variations.
- **Mocking Rule**: ALWAYS mock the database and network calls. Never hit the live Supabase instance during tests.
- **Global Setup**: `tests/vitest.setup.ts` assigns h3 functions (`defineEventHandler`, `createError`, `getRouterParam`, `readBody`) to `globalThis` to simulate Nitro auto-imports in the Node test environment.

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