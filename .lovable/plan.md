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

## Wallet — shared by both worlds

The wallet is one product, not a candidate-only feature. Campus students fund it, pay for services and see the same transaction history, virtual account and top-up flow. It gets a tab in the Campus navigation too, and the balance appears on both Home screens.

## Settings — one page, stage-aware

A single `/settings` screen replaces the scattered profile/account tabs, reachable from the avatar in the topbar (mobile and desktop) and from the Profile tab:

- **Profile** — name, photo, phone, email.
- **My journey** — current stage, institution / faculty / department / level for campus students; "I've been admitted" upgrade lives here as well as on Home.
- **Appearance** — light / dark / system (dashboard scope only).
- **Notifications** — email and push preferences.
- **Security** — change password, active session, sign out everywhere.
- **Account** — referrals, subscription status, delete account.

Same page for candidates and campus students; only the journey block changes shape by stage.

## Navigation

One bottom tab bar everywhere, keeping the raised centre button. Settings is reached from the topbar avatar, not a tab.

```text
Candidates:  Home   CBT        [ Services ]   Wallet     Profile
Campus:      Home   Academics  [ Tools ]      Projects   Wallet
```

Campus keeps Opportunities and Settings inside the Home "more" list; candidates keep Study, Resources and Forum inside Home's discover list. Desktop shows the full set in the left rail (including Settings and Log out). Any attempt to reach the other world's routes redirects home.

## Design rules applied throughout

Flat surfaces, no gradients, one radius scale, one type scale, shared tile primitives (stat tile, action tile, list row, empty state) used by Home, CBT, Services, Wallet, Settings and Campus so the screens can't drift apart again. Mobile and desktop render the same components.

## Technical notes

- New `src/pages/CBTHome.tsx` (practice hub), new `src/pages/Settings.tsx`, rewritten `src/pages/Dashboard.tsx` as unified Home; new routes `/cbt` and `/settings`.
- `Settings.tsx` composes the existing `ProfileSettings`, `AccountSettings`, theme menu and `UpgradeToCampus` rather than rewriting their logic.
- `/wallet` moves out of the `CoreOnly` guard so campus students can use it; `AppShell` gains the Wallet item in the campus nav.
- Shared tiles in `src/components/edura/tiles.tsx`; `Dashboard`, `CBTHome`, `ServicesHome`, `CampusHome`, `CampusTools`, `Wallet` refactor onto them.
- `AppShell` nav lists updated (candidate + campus) plus a topbar avatar menu; `useAppSide` and `ChooseSide` removed, `/choose` redirects to `/dashboard`.
- `PlatformRouter` keeps `CoreOnly` / `CampusOnly` guards; `DashboardBySide` collapses to a stage guard only.
- No schema changes — `academic_stage`, institution columns and the wallet tables already exist.

