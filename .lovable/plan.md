# AKBOY Creative Hub — Full Website Redesign (Phase 1)

This plan implements the PRD as a complete frontend redesign of the Akboy domain, reusing the existing React/Vite/Tailwind/Supabase stack (the PRD's Next.js/Sanity recommendation does not apply — this project is locked to React+Vite+Supabase, which fully satisfies the requirements).

## Scope of Phase 1 (this build)

Public marketing site only. No Academy LMS, no payments, no client portal — those are explicitly Phase 2 in the PRD.

### Pages

1. **Home** — Hero, Trusted By, About Preview, Services Overview, Why Choose Us, Featured Projects, Student Success Stories, Stats, Testimonials, Blog Preview, CTA, Footer
2. **About** — Story, Mission, Vision, Values, Founder Message, Team, Timeline
3. **Services** — Educational, Creative, Web (grouped, each with detail anchor)
4. **Portfolio** — Filterable grid (Graphic, Web, Education, Branding) + project detail page
5. **Academy** (placeholder/coming soon — Phase 2 LMS)
6. **CAMPUS HUB/ Insights** — list + post (reuse existing `CAMPUSHUB` + `AkboyBlogPost`, restyle)
7. **Resources** — Downloadable JAMB/WAEC/E-books/Templates
8. **Testimonials** — Full reviews page
9. **Contact** — Form + WhatsApp + email + socials
10. **Book Consultation** — Dedicated booking form

### Global

- New `AkboyNavbar` with mega-menu structure matching site map
- New `AkboyFooter` aligned to PRD
- WhatsApp floating button
- SEO: per-route `<Helmet>` titles, descriptions, canonical, OG tags, JSON-LD (Organization sitewide, Article on blog)
- Sitemap + robots.txt updates

## Design direction

Per Core memory (Akboy brand system): cream/white background, dark green (`akboy-forest #0F3D2E`), butter yellow accent (`akboy-butter #F4E27A`), Fraunces/Playfair display + clean sans body. Premium, editorial, youth-friendly — not magazine layout (rejected), not generic SaaS.

Before building, I will:

1. Capture the current Akboy home preview
2. Generate 3 rendered design directions (locked palette + type, varying composition/density/motion)
3. Ask you to pick one
4. Build the entire site against the chosen direction

## Data / backend

- **Portfolio**: reuse existing `akboy_portfolio` table (already in DB)
- **CAMPUS HUB**: reuse existing blog tables
- **Contact form**: new `contact_submissions` table + RLS (insert for anon, select for admins) + optional Resend edge function to email `akboycreativehub@gmail.com`
- **Consultation bookings**: new `consultation_requests` table + RLS, same email flow
- **Resources**: new `resources` table (title, category, file_url, description) — files in Supabase Storage bucket `resources`
- **Testimonials**: new `testimonials` table (name, role, type, quote, image, featured)

All new tables get explicit `GRANT` blocks per project rules.

## Admin

Reuse existing admin portal pattern — add tabs:

- Portfolio (exists)
- Blog (exists)
- Contact Inbox (new)
- Consultation Requests (new)
- Resources (new)
- Testimonials (new)

## Out of scope (Phase 2, not built now)

Student Dashboard, Online Courses, Payment Gateway, Certificates, LMS, AI Assistant, Client Portal, Job Board, Forum.

## Sequence

1. Approve plan
2. Design directions round → you pick
3. Build pages + components against chosen direction
4. DB migrations + admin tabs
5. SEO, sitemap, robots
6. Walkthrough

## Open questions before I start

- Confirm Academy should be a "Coming Soon" landing for now (not removed entirely)? YES
- Should the existing Akboy Mock Exam / Tutorial Registration flows stay linked from the new nav, or be hidden until you decide? SHOULD STAY
- Any real content (founder photo, team members, real project images, real testimonials) you want to drop in, or use polished placeholders first? PLACEHOLDER FIRST