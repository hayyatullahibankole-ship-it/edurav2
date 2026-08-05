# Fix Education News link + build a real Leaderboard

Two dead links in the student dashboard are causing the 404s you're seeing, and neither page exists yet.

## What's happening now

- The "Education news" row points at `/news` — no such page exists, so the app shows the 404 screen.
- The "Leaderboard" row (CBT workspace) and the "Rank" tile on the home dashboard both point at `/leaderboard` — that page has never been built, so it 404s in the mobile app too.

## 1. Education news → Akboy Campus Hub

The Akboy campus hub already exists and is the education news feed. Point the dashboard row at it instead of the dead `/news` route.

- Inside the mobile app: open it in the system in-app browser (Chrome Custom Tab on Android) with an Edura-green toolbar and a back/close button, so the student stays in the app flow.
- On web: open in a new tab.

### Play Store impact

None. Opening an external informational website in a Custom Tab is standard and fully allowed. The only rules to keep respecting are the ones already handled: no purchase of digital goods through that external page. The Akboy campus hub is a news/article feed with no checkout, so nothing changes for billing compliance. The linked site will be listed as an external destination — no new permission or data-safety declaration is required.

## 2. Real Leaderboard page

New route `/leaderboard` with a page built to match the current Bento/Sora dashboard style:

- **Your standing card** at the top: your rank, average score, tests taken, and how far you are from the next position.
- **Top performers list**: ranked rows with position badge (gold/silver/bronze for the top three), display name, school where available, average score, and number of tests. Your own row is highlighted and pinned into view if you're outside the visible top.
- **Filters**: All time / This month / This week.
- **Privacy**: only first name + last initial is shown for other students; no emails or phone numbers.
- Empty state for students with no attempts yet ("Take your first test to enter the ranking"), plus loading skeletons.
- Reachable from the Rank tile, the CBT workspace row, and the home dashboard.

## Technical notes

- Add a Postgres security-definer function `get_leaderboard(period, limit)` that aggregates `results` per user (average percentage, attempt count, minimum 3 attempts to qualify) joined to `profiles` for display name, plus a companion that returns the caller's own rank. Doing the aggregation server-side keeps it to a single fast query and avoids exposing other students' rows through RLS. Indexed on `(user_id, created_at)` to stay within the project's IO constraints.
- New page `src/pages/Leaderboard.tsx`, lazily loaded and registered in `PlatformRouter.tsx` for the candidate side, with route prefetch from `AppShell` like the other tabs.
- Add `@capacitor/browser` and a small `openExternal(url)` helper in `src/lib/` that uses the in-app browser on native and `window.open` on web; reuse it for the news link (and it's ready for other outbound links later). Requires `npx cap sync` on your machine before the next Android build.
- Point the news row at `https://akboy.space/campus-hub` (the live campus hub route; `/campus` is not a valid path on that domain).
