# Fix stale app updates + fully in-app ebook reading

## What's actually happening

The route audit confirms two different issues:

- `/leaderboard`, `/ai-tutor`, `/ebooks`, and `/ebooks/:slug` are registered in the app router. A native build that still shows 404 for those screens is running an **older bundled copy of the app** whose router does not include them yet.
- **Battle Mode is a real broken link in the current code**: the CBT page links to `/battle`, but no `/battle` route or Battle page exists. The existing competition feature is registered at `/challenge-arena`.

Two things cause that today:

1. The installed app caches the whole app shell and only swaps in a new version after the cached service worker decides to update. There is no cleanup of outdated caches, no forced activation, and no reload after an update lands — so a phone can stay on an old build indefinitely.
2. There is a leftover, unused service worker file (`public/pwabuilder-sw.js`) from an old setup that still contains a "serve from cache first" rule. Anyone whose phone registered it in the past keeps getting old pages.

For the Android APK specifically: the app bundles its own copy of the web build, so an APK built before these changes will always 404 on the new pages until it is rebuilt (`npx cap sync` + rebuild) — no code change can fix an already-installed old APK.

## What will be done

### 1. Make updates land reliably on installed apps
- Turn on outdated-cache cleanup, immediate activation, and client claim in the PWA config.
- Serve page navigations network-first (fall back to cache only when offline) so a new build is picked up as soon as there is internet.
- Add a small guarded update handler: when a new version is detected, refresh the app once automatically so the student always lands on the current build.
- Remove the obsolete `public/pwabuilder-sw.js` and ship a one-time cleanup worker at that same path so phones that registered it get it evicted instead of keeping stale pages.

### 2. A visible escape hatch
- On the in-app 404 screen, add "Refresh app" (clears app caches, unregisters old workers, reloads) plus a "Go home" button, so a stuck student can self-recover instead of seeing a dead end.
- Show the running build version in Settings so it is obvious which version a device is on.

### 3. Fix Battle Mode and audit every student-app destination
- Replace the dead `/battle` destination with the existing Challenge Arena and add a `/battle` compatibility redirect so old app links/bookmarks also recover.
- Rename the tile to accurately describe the available feature instead of promising a separate friend-battle flow that does not exist.
- Audit every clickable destination in Dashboard, CBT, Services, Campus, Settings, mobile navigation, floating AI button, and onboarding against the router.
- Add compatibility redirects for renamed legacy routes and correct any other destinations that currently fall through to 404.
- Verify each student-facing destination in a native-sized viewport, including Android back behavior.

### 4. Ebook reading fully inside the app
- The reader will never leave the app: the book opens as a page inside the app shell, keeping the bottom navigation and a proper in-app back button (Android hardware back returns to the library, not out of the app).
- Style the reader for Edura when opened from the Edura app (Akboy styling stays on the Akboy site), so it does not look like an outside website.
- Keep the existing page-by-page PDF rendering, watermark, and copy/print protection; add page loading feedback and swipe/next-previous page controls sized for phones.
- Ebook library and reader links stay internal routes — no browser, no external tab.

## Technical notes

- `vite.config.ts` PWA workbox block: add `cleanupOutdatedCaches: true`, `skipWaiting`/`clientsClaim`, and a `NetworkFirst` navigation route for HTML; keep `/~oauth` denylisted.
- Add a single guarded registration/update wrapper module using `virtual:pwa-register` (never registers in dev, iframe, or Lovable preview hosts), replacing reliance on the auto-injected default.
- Replace `public/pwabuilder-sw.js` content with a self-unregistering kill-switch worker that deletes only its own `pwabuilder-offline-page` cache.
- `src/pages/NotFound.tsx`: add cache-clear + reload action.
- `src/pages/CBTHome.tsx` and `src/components/PlatformRouter.tsx`: route Battle Mode to Challenge Arena and preserve `/battle` as a redirect.
- Cross-check all internal destinations from app navigation components against `PlatformRouter.tsx`, then correct/alias mismatches in one pass.
- `src/pages/EbookReader.tsx`: wrap in the Edura app shell when `useInstalledApp`/Edura domain, use `useAndroidBackButton` for back handling, keep pdf.js rendering path as is.
- Native APK: after merge, run `npx cap sync` and rebuild; the new pages ship with that build.
