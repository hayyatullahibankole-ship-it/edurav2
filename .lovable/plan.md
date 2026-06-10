## Goal
Rebuild the Akboy homepage as a premium, editorial, agency-meets-edtech experience using your brand palette (Dark Green #0D4D3A, Emerald, Light Green, Yellow #F4C542, White, Soft Gray). Then propagate the new design language across the other Akboy pages so the entire site feels like one product.

## Scope — Homepage (`src/pages/akboy/AkboyHome.tsx`)
Rebuild from scratch with these 19 sections, in order:
1. Floating announcement bar (rotating: programs, admission updates, news)
2. Premium navigation (keep current `AkboyNavbar`, restyle tokens)
3. Hero — "Where Education Meets Creativity" with floating glassmorphism portfolio/mockup cluster
4. Trusted-by strip (schools, parents, businesses, partner logos, key stats)
5. About AKBOY — editorial storytelling block (mission / vision / impact / founder teaser)
6. Core Services showcase — interactive asymmetric layout (6 services)
7. Featured Programs — large cards (JAMB Orientation, Admission Assistance, Graphics, Web, Mentorship)
8. Why Choose AKBOY — animated counters
9. Student Success Stories — large before/after cards
10. Creative Portfolio — masonry showcase pulling from existing portfolio data
11. Testimonials carousel (students, parents, school owners, businesses)
12. Latest News & Insights — pulls from Campus Hub feed
13. Learning Resources Hub — links to edura.space resources + downloads
14. Founder Section — Sulaimon Abdulhakeem Sonayon bio
15. Community Section — WhatsApp, Telegram, newsletter, socials
16. FAQ accordion
17. Contact section — WhatsApp/email/phone/form
18. Premium CTA — "Ready to Learn, Create and Succeed?"
19. Modern footer (keep `AkboyFooter`, restyle)

## Scope — Design system
- Update `src/index.css` Akboy tokens: introduce `--akboy-forest #0D4D3A`, emerald scale, `--akboy-butter #F4C542`, soft-gray surface, glass tokens, shadow tokens, gradient tokens.
- Add new utility classes for glass cards, curved section dividers, floating shadows.
- Typography: pair editorial display (Fraunces) with clean sans (Inter/Manrope) — already in project.
- Add framer-motion-driven counters, smooth-scroll, hover lifts.

## Scope — Consistency pass across Akboy pages
Apply the new tokens, hero treatment, section rhythm, and footer/nav styling to:
- `AkboyAbout.tsx`
- `AkboyServices.tsx`
- `AkboyPortfolio.tsx`
- `AkboyContact.tsx`
- `AkboyCampusHub.tsx` (light touch — already recently redesigned, only color/typography harmonization)
- `AkboyFooter.tsx` & `AkboyNavbar.tsx` (token swap to forest/butter)

Other Akboy pages (Mock exam flow, Tutorial registration, Blog) get token-only updates — no structural changes — to keep scope tight.

## Out of scope
- No backend/data model changes.
- No changes to Edura (edura.space) pages.
- No changes to admin dashboard, CBT, school portal.
- Mock exam, tutorial registration, blog pages: visual token alignment only, no layout rewrites.

## Technical notes
- New homepage will be split into section components under `src/components/akboy/home/` (HeroSection, TrustedBy, ServicesShowcase, etc.) to keep `AkboyHome.tsx` thin.
- Use existing `framer-motion`, `lucide-react`, shadcn primitives. No new heavy dependencies.
- Portfolio masonry uses existing `akboy_portfolio` table data; falls back to curated samples if empty.
- Testimonials, FAQ, stats: static curated content (you can edit copy after).
- Founder image: placeholder until you upload a real photo.

## Deliverables
1. New design tokens in `index.css` + `tailwind.config.ts`.
2. ~12 new section components under `src/components/akboy/home/`.
3. Rewritten `AkboyHome.tsx`.
4. Restyled `AkboyAbout`, `AkboyServices`, `AkboyPortfolio`, `AkboyContact`, `AkboyNavbar`, `AkboyFooter`.
5. Smoke check via preview.

## What I need from you before I build
1. **Founder photo** — drop a high-res image, otherwise I'll use a styled placeholder you can swap later.
2. **Real logos** for the "Trusted By" strip (schools/partners) — otherwise styled name-chips.
3. **Confirm**: build all 19 sections now in one pass, or stage it (1–10 first, 11–19 next)?

Approve this plan and I'll start with the design tokens + homepage sections in parallel.