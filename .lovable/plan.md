# Website refresh + Akboy brand separation + Play Store asset pack

Three pieces of work: bring the public Edura website up to date with everything the platform now does, make the Akboy site fully independent of Edura branding, and produce the actual files needed for the Play Console upload.

## 1. Edura public website redesign

Keep the current "Deep Ink + Edura Green" system (flat, no gradients) but rebuild the marketing pages so they reflect the product as it is today, not the old CBT-only story.

**Landing page (`Home.tsx`)**
- New hero positioning: one platform for exam prep, admissions and campus life — not "chat platform" or "CBT app".
- A three-pillar block: **Prepare** (CBT practice, mock exams, offline mode), **Process** (result e-PINs, admission/Post-UTME processing, scholarships), **Progress** (Edura Campus for undergraduates — courses, materials, projects).
- Wallet + automated e-PIN delivery section (fund wallet, instant scratch card, pay for services).
- Schools section teaser linking to the school landing page.
- Real app section: phone mockups, "Get it on the app" + PWA install, pointing at `/install-app`.
- Trust row (numbers/subjects/schools), FAQ, and a single clear footer CTA.

**Services page (`ServicesLanding.tsx`)**
- Rebuild around the live service catalog: result checker e-PINs (JAMB/WAEC/NECO), admission & Post-UTME processing with per-institution pricing, scholarship guidance, document services.
- Show the real flow: choose service → pay (card or wallet) → submit details → track status.

**Schools page (`SchoolLanding.tsx`)**
- Update to current features: exam creation, seat-based subscription with top-ups, staff management, mock exams free, performance rankings and reports.

**Mobile web landing (`MobileWebLanding.tsx`)**
- Align copy and visuals with the new landing page, keep the install-app push.

Also: refresh `Resources.tsx` / any stale links, and update page titles + meta descriptions per page for SEO.

## 2. Akboy: remove all Edura traces

Confirmed issue: there is a single `LoadingAnimation` component, hard-coded with the Edura logo and the "EDURA" wordmark, and it is used as the Suspense fallback for the Akboy routes too.

- Add a brand-aware loader: Akboy routes get an Akboy-branded loader (forest green / butter, Akboy mark, no Edura wordmark), Edura routes keep the current one.
- Sweep the Akboy pages, layout, navbar and footer for Edura logos, colours, wording, links and shared components that leak Edura branding; replace with Akboy tokens (`akboy-forest`, `akboy-butter`, cream background, Fraunces/Playfair).
- Ebook library and reader, when reached from Akboy, must show Akboy branding rather than Edura.
- Akboy document title, favicon and meta stay Akboy on `akboy.space`.
- Refresh Akboy pages (`AkboyHome`, `AkboyServices`, `AkboyAbout`, campus hub, events, portfolio) so the copy matches the current offering: tutorials, mock exams, ebooks, events, tech services.

## 3. Play Store submission pack

Generated into your Files panel so you can download and upload directly:

- **Phone screenshots** — 8 clean 1080x1920 PNGs captured from the running app (onboarding, home/command centre, CBT practice, exam interface, services, wallet, campus, results), each with a short caption band.
- **Feature graphic** — 1024x500 PNG in Edura green/deep ink.
- **App icon** — 512x512 PNG export.
- **Store listing document** — app name, short description (80 chars), full description (4000 chars), category, contact details, privacy policy URL and account-deletion URL.
- **Data Safety answers sheet** — exact answers for the Play Console form, matched to what the app actually collects (account data, camera/mic for proctoring, payment info via Paystack, no data sold, deletion available).
- **Content rating questionnaire answers** and a release checklist (versionCode bump, signing, testing track).

Note: 7-inch/10-inch tablet screenshots are optional unless you opt into tablet distribution — I'll generate phone only unless you want tablets too.

## Technical notes

- Marketing pages stay presentational: no changes to auth, payments, wallet or database logic.
- Loader split is done via a small brand check in `PlatformRouter` so Akboy Suspense fallbacks use the Akboy loader.
- Screenshots are captured headlessly against the local dev server at a 1080x1920 device scale, then composited; store assets are written to `/mnt/documents/play-store/`.
- No gradients anywhere, per the existing design rule.
