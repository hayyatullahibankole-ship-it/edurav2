# Edura Campus public website update

Add Edura Campus (the higher-institution workspace) to the public marketing site so visitors know it exists and can index it as a standalone product.

## Decision

Do both: a dedicated public Campus landing page AND a clear Campus section on the Home page. This gives SEO/search ads a focused URL while keeping the homepage story complete.

## Scope

### 1. New public page: `CampusLanding.tsx` on `/campus-landing`

A flat, Deep Ink + Edura Green marketing page with:

- Hero for undergraduates/graduates: "Your university workspace" — courses, CGPA, projects, deadlines, opportunities.
- Feature grid: course management, CGPA/study tools, project timeline, opportunity board, same Edura wallet, offline mode.
- How it works: pick your institution/department → register as undergraduate/graduate → access Campus dashboard.
- "Who it's for" chips: 100–500 level students, final-year/project students, PG students, SIWES/IT and NYSC prep.
- CTA buttons: "Create free account" (/auth) and "I'm already a student" (/auth).
- No protected data calls; purely presentational.

### 2. Update `Home.tsx`

Insert a new "Edura Campus" section (or expand the existing third pillar) that highlights the higher-institution workspace and links to `/campus-landing`.

### 3. Update `ServicesLanding.tsx`

Add a small note or card mentioning that undergraduates can use Edura Campus for project help and opportunity alerts, linking to `/campus-landing`.

### 4. Routing in `PlatformRouter.tsx`

- Add lazy import for `CampusLanding`.
- Add public route `/campus-landing` inside `EduraRoutes` wrapped in `Layout`.
- Keep existing protected `/campus/*` routes unchanged (still the actual dashboard).

### 5. SEO

- Set page-specific `<title>` and `<meta name="description">` via `react-helmet-async` if available, otherwise `document.title` in `useEffect`.
- Mention "Nigerian university students", "CGPA", "project management", "undergraduate workspace" in copy and meta.

## Out of scope

- No changes to the protected Campus dashboard (`CampusHome.tsx`, `CampusShell.tsx`) or its database tables.
- No new backend logic.
- No Akboy changes; those are covered by the existing refresh plan.

## Design constraints

- Deep Ink + Edura Green flat palette only.
- No gradients.
- Use existing tokens (`bg-ink`, `text-primary`, etc.) and `font-display`.
