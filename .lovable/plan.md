# Mobile redesign: one home, two workspaces, one nav

Rebuild the logged-in mobile experience around three screens for exam candidates — **Home**, **CBT**, **Services** — with a single bottom navigation. Undergraduates and graduates never see these; they get the Campus dashboard only, with the same navigation language.

## Who sees what

- **SS3 / WAEC / NECO / JAMB candidates** → Home, CBT, Services, Wallet.
- **Undergraduate / Graduate** → Campus only (Home, Academics, Tools, Projects, Opportunities).
- No stage saved yet → the journey setup screen once, then routed as above.
- The CBT-vs-Services choice screen is retired. Nobody "picks a side" anymore — both live behind the same home.

## The new Home (candidates)

A calm command centre, not a wall of cards:

1. **Greeting strip** — name, stage pill, wallet balance, notifications.
2. **"I've been admitted" upgrade card** — prominent on Home. Opens the short form (institution, faculty, department, level, matric no.), flips the account to Campus and lands the student on the Campus dashboard.
3. **Two workspace tiles** — CBT Practice and Services, each with a one-line status (e.g. "3 tests this week", "1 request in progress").
4. **Continue where you left off** — last attempt or pending service request, single tap to resume.
5. **Key numbers** — tests taken, average score, rank, streak, as compact stat tiles.
6. **Discover** — study hub, resources, forum, referrals as a quiet list, not big colour blocks.

## The CBT page

Everything exam-practice in one screen: start a practice test, exam type shortcuts (JAMB / WAEC / NECO / Post-UTME), subject progress, recent results, school-assigned exams, study hub and resources entry points.

## The Services page

Unchanged in content, restyled to the same card system: service grid, active requests, wallet actions, scratch cards.

## Navigation

One bottom tab bar everywhere in the app, keeping the raised centre button:

```text
Candidates:  Home   CBT   [ Services ]   Study   Wallet
Campus:      Home   Academics  [ Tools ]  Projects  Opportunities
```

Desktop keeps the left rail with the same items. Any attempt to reach the other world's routes redirects home.

## Design rules applied throughout

Flat surfaces, no gradients, one radius scale, one type scale, shared tile primitives (stat tile, action tile, list row, empty state) used by Home, CBT, Services and Campus so the screens can't drift apart again. Mobile and desktop render the same components.

## Technical notes

- New `src/pages/CBTHome.tsx` (practice hub) and a rewritten `src/pages/Dashboard.tsx` as the unified Home; new route `/cbt`.
- Shared tiles in `src/components/edura/tiles.tsx`; `Dashboard`, `CBTHome`, `ServicesHome`, `CampusHome`, `CampusTools` refactor onto them.
- `AppShell` nav lists updated (candidate + campus); `useAppSide` and `ChooseSide` removed, `/choose` redirects to `/dashboard`.
- `PlatformRouter` keeps `CoreOnly` / `CampusOnly` guards; `DashboardBySide` collapses to a stage guard only.
- `UpgradeToCampus` moves from the header into a Home card; no schema changes — `academic_stage` and institution columns already exist on `users`.
