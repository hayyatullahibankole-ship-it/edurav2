# Mobile App UI/UX Overhaul — Student-Grade, Play Store Standard

Goal: make the mobile app feel like a real, modern student app — fast, motivating, and visually confident — instead of a website in a shell. Same features, far better presentation and flow.

## Design direction (locked)

- **Palette**: keep Edura Green as the brand, but restructure surfaces for app-grade depth. Light mode gets a warm-neutral canvas with pure-white elevated cards; dark mode gets a deep ink canvas (`#0B1520`) with green as the single accent. One accent only — support colors (amber for streaks, red for wrong answers) used sparingly and semantically. No gradients as decoration; only a single subtle brand wash on the home header.
- **Typography**: Sora for headings/numbers (geometric, confident, great for scores and stats), Manrope for body/UI. Tight display sizes, generous body line-height, tabular numerals for all stats.
- **Layout**: Hero + bento. Home opens with a personal progress hero (greeting, streak ring, today's goal), then a bento of mixed-size tiles (Continue practice, Wallet, Rank, Services), then a scrollable "for you" strip.
- **Feel**: 12–20px radii, soft single-layer shadows, 44px minimum tap targets, safe-area padding, spring-y press states (scale 0.97), skeletons instead of spinners.

## What changes

### 1. Design tokens and motion (`src/index.css`, `tailwind.config.ts`)
- Add Sora + Manrope, new surface/elevation tokens, app-radius scale, safe-area spacing utilities.
- Add motion utilities: press-scale, slide-up sheet, stagger fade, streak-ring fill, count-up numbers, shimmer skeleton.

### 2. App shell (`src/components/edura/AppShell.tsx`)
- Tab bar: refined floating pill with active-tab indicator that animates between tabs, icon fill-on-active, label micro-scale, haptic-style press feedback.
- Header: collapses on scroll to a slim bar; avatar + streak flame + notifications only.
- Page transitions: consistent fade/slide-up between routes.

### 3. Home (`src/pages/Dashboard.tsx`) — the big one
Reordered around what a student wants first:
1. Greeting + streak ring + daily goal progress ("3 of 10 questions today").
2. Primary CTA card: **Continue where you left off** / **Start today's practice** — one tap to a session.
3. Bento row: Wallet balance, Rank, Average score, Tests taken (animated count-up).
4. Weak-topic nudge: "Your weakest topic this week is Algebra — 10 quick questions".
5. Services + "I've been admitted" as compact rows, not big cards.
6. Access code moves into a collapsed row (it's occasional, not daily).

### 4. Gamification layer (new, `src/components/edura/gamify/`)
- **Streak**: day counter with flame, 7-day dot strip, freeze-safe copy.
- **Daily goal**: questions-per-day ring, celebrates on completion.
- **XP + levels**: XP from completed sessions and correct answers; level badge on avatar.
- **Badges**: milestone achievements (first 100 questions, 7-day streak, 90%+ score, subject mastery) shown on Home and Settings.
- **Leaderboard tie-in**: rank tile links to existing leaderboard with position delta.
- Data: derived from existing attempt/results tables where possible; add lightweight tables for daily activity, XP totals and earned badges (with RLS + grants).

### 5. CBT workspace (`src/pages/CBTHome.tsx`)
- Subject picker as horizontal chips, per-subject mastery bar.
- "Quick practice" (10 questions) vs "Full mock" as two clear entry modes.
- Recent attempts as compact rows with score chip and trend arrow.

### 6. Services + Wallet
- Services: category chips, uniform compact cards, price and turnaround visible upfront, sheet-based flow instead of full-page jumps.
- Wallet: balance hero with fund/history split, transaction rows with clear status pills.

### 7. Empty, loading and error states
- Every list gets a purposeful empty state with one action; every fetch gets a skeleton matching its layout; failures get an inline retry instead of a bare toast.

## Technical notes

- Frontend-only for the visual work; gamification needs a small backend addition (daily activity, XP, badges) with RLS and explicit grants.
- All colors via semantic tokens in `index.css` — no hardcoded utility colors in components.
- Motion via CSS keyframes + Tailwind utilities; no heavy animation dependency.
- Respects `prefers-reduced-motion`.
- Safe-area insets applied for notched devices and the Android nav bar.

## Out of scope

Desktop/web marketing pages, Akboy site, admin portal — untouched.
