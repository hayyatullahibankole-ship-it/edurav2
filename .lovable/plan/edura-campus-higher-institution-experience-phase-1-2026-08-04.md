# Edura Campus — higher-institution experience (Phase 1)

One account, multiple journey dashboards. A student keeps the same profile, wallet, subscription and history; only the dashboard changes based on their academic stage.

```text
EDURA Account (one login, one wallet, one profile)
├── Student Dashboard  (JSS / SSS / WAEC / JAMB)   ← exists today
├── Services Hub       (e-PINs, admissions, scratch cards) ← exists today
└── Campus Dashboard   (Undergraduate / Graduate)  ← NEW
       ├── Academics (courses, materials, past questions)
       ├── Projects
       ├── SIWES / Teaching Practice
       ├── NYSC
       ├── Career & Skills
       └── Opportunities (scholarships, internships, campus news)
```

## How a student lands there

- **At registration**: a new step asks "Where are you in your academic journey?" — Junior Secondary, Senior Secondary, WAEC/NECO Candidate, JAMB Candidate, Undergraduate, Graduate. Undergraduate/Graduate go straight to Campus; everyone else keeps the current dashboard.
- **Later**: existing users see a one-time "Continue your journey" card — *You've reached a new academic milestone. Switch to the Undergraduate experience and keep your account, wallet, achievements and history.* One tap moves them; nothing is lost.
- **Always reversible**: Profile > Academic Journey shows Current stage and Previous stage, and lets them switch back. The side switcher gains a third option (Practice / Services / Campus).
- Undergraduates additionally supply institution, faculty/department and level — used to personalise Academics and opportunities.

## Access & pricing

Recommendation: **free hub, paid depth**. Browsing Campus, the dashboard, opportunity feed, logbook and planner tools are free — they drive daily habit. Paid items ride on the existing wallet/Paystack rails:
- Course material packs and past-question bundles: paid per item (or per department per semester).
- Project help, CV review, plagiarism/formatting: sold as service requests through the existing Services catalog.
- Existing Edura premium members get a discount rather than a new subscription, so we avoid a second recurring charge.

## Phase 1 scope (what gets built now)

Building all eleven hubs at once would be shallow everywhere. Phase 1 delivers the shell plus the three areas you selected, with the rest visible as clearly-marked "coming soon" tiles so the structure reads complete.

1. **Journey system** — stage on the profile, onboarding step, transition prompt, profile setting, three-way side switcher, routing so Campus users land on `/campus`.
2. **Campus dashboard home** — stage-aware bento: my courses, next deadline, active project milestone, SIWES/NYSC reminder, wallet balance, opportunity highlights. Matches the Deep Ink + Edura Green flat system, no gradients, responsive on mobile web, desktop and the installed app.
3. **Academics** — add courses (code, title, unit, semester, lecturer), upload/attach personal materials, browse admin-published department materials and past questions, mark studied.
4. **Project Hub** — project record with chapter checklist, milestone dates, supervisor feedback log, file vault.
5. **Opportunities** — scholarships, internships, graduate trainee and campus news feed, filterable by level/field, admin-managed and shareable to WhatsApp.
6. **Admin** — new Campus section in the admin portal: institutions/departments, course material library, past-question uploads, opportunities CRUD, and a Campus users view.

Phase 2 (after this ships): SIWES logbook, Teaching Practice diary, NYSC hub, Career hub with CV builder, skills roadmaps, AI academic companion scoped to the student's own courses and documents.

## Technical notes

- New column `academic_stage` (plus `previous_stage`, `institution_id`, `department`, `level`) on the student profile; stage drives routing in `PlatformRouter` and `useAppSide` gets a `campus` value.
- New tables: `campus_courses`, `campus_materials`, `campus_projects`, `campus_project_milestones`, `campus_opportunities`, with RLS scoping personal rows to `auth.uid()` and published library/opportunity rows readable by authenticated users. Storage bucket for student uploads and material files.
- Reuse `user_wallets` / `service_requests` for paid items — no new payment plumbing.
- New pages under `src/pages/campus/`, admin modules under `src/components/admin/campus/`.
