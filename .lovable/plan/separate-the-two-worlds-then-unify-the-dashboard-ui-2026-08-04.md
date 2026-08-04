# Separate the two worlds, then unify the dashboard UI

Two problems to fix: (1) CBT/Services and Campus are still wired together through the side switcher and routing, and (2) the dashboards still look like three different products.

## 1. Stage decides everything

**At sign up**: the registration form gains a required "Where are you now?" step — SS 3, WAEC/NECO candidate, JAMB candidate, Undergraduate, Graduate. Higher-institution picks also capture institution, faculty, department and level. This is saved on the student profile at signup, so the journey screen is no longer the first thing after login for new users.

**After login**:
- SS 3 / WAEC / JAMB → lands on the CBT vs Services choice, then CBT or Services. Campus is not reachable.
- Undergraduate / Graduate → lands directly on Campus. CBT and Services are not reachable.
- No stage on the account (existing users) → the journey screen once, then routed as above.

**The only bridge**: an "I've been admitted — upgrade my account" action, shown to WAEC/JAMB candidates on their dashboard and in My Journey. It opens a short form (institution, faculty, department, level, matric number), flips the stage to undergraduate, and moves the account to Campus. Campus students get the reverse only as a support-style "change my journey" link, not a switcher.

**Side switcher** becomes stage-scoped: candidates see CBT and Services only; campus students see no switcher (Campus is their whole app). Any attempt to reach a route from the other world redirects home.

## 2. One design language across dashboards

Every logged-in home renders through the existing `AppShell` — desktop left rail, mobile bottom nav, same topbar — and shares one card system:

- Same tile primitives: stat tile, action tile, list card, empty state. Defined once, used by CBT, Services and Campus.
- Same bento grid rhythm (12-column, same gaps, same radii), same typography scale, flat surfaces, no gradients.
- Mobile and desktop render the same content from the same components — the separate mobile-only home for CBT goes away so the two views can't drift again.
- Campus home, Services home and CBT home get matched section ordering: greeting + key numbers → primary actions → progress/activity → discovery.

## Technical notes

- `academic_stage` (plus institution fields) written during signup via the existing profile creation path; no schema change needed — the columns already exist on `users`.
- `PlatformRouter` gains a single stage guard: campus routes 404/redirect for core stages, CBT/Services routes redirect for campus stages.
- `useAppSide` restricted to `cbt | services`; campus stops being a "side" and becomes a stage outcome.
- `MobileHome` is retired in favour of the responsive `Dashboard`; `ChooseSide` keeps only the two candidate options.
- Shared tiles live in a new `src/components/edura/tiles.tsx`; `Dashboard`, `ServicesHome`, `CampusHome` and `CampusTools` refactor onto them.
