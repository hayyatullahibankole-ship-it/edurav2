# Edura Campus — AI Course Companion + Project Assistant

Two new pillars for the Campus dashboard, both powered by AI and scoped to the student's own courses, materials and project. Free students get a small daily allowance; Edura premium members get generous use.

## 1. AI Course Companion (`/campus/companion`)

A study assistant that only talks about the courses the student has added.

- **Course picker** — pick one of your `campus_courses` (code, title, level) as the working context.
- **Explain a topic** — type any topic in that course and get a structured explanation (definition, breakdown, worked example, exam-style summary). Renders markdown and maths, same renderer as the AI Tutor.
- **Generate past questions** — choose type (objective / theory / mixed), count and difficulty; get a generated question set with answers and short explanations. Save the set to the course, retake it later, or share it.
- **Summarise my material** — pick a material already uploaded to the course and get a summary + key points + likely exam questions from it.
- **Exam predictor** — from the course outline and saved sets, produce a "most likely to come out" list.
- Everything the student generates is saved per course so it can be reopened offline-ish later; nothing regenerates unless asked.

## 2. Project Assistant (`/campus/projects` — expanded)

The project record already exists (chapters, milestones, supervisor log, files). It gains an AI layer:

- **Topic finder** — enter department + area of interest, get 8–10 researchable project topics with a one-line justification and feasibility note; save a topic to the project.
- **Chapter outline** — generate the standard Nigerian undergraduate structure (Ch.1 Introduction … Ch.5 Summary/Recommendations) with sub-headings tailored to the chosen topic, written into the existing chapter checklist.
- **Chapter coach** — for a selected chapter, get guidance on what to write, what to include, and a draft skeleton the student expands themselves (framed as guidance, not ghost-writing).
- **Abstract & proposal builder** — generate a proposal/abstract from the topic, objectives and methodology fields.
- **Supervisor feedback helper** — paste supervisor comments, get a clear action list added to the milestone checklist.
- **Reference formatter** — paste sources, get them formatted APA/MLA/Harvard.

## Access and limits

- Free students: a small daily allowance of AI actions (e.g. 5/day) with a clear counter and an upgrade prompt when exhausted.
- Edura premium members (existing `has_premium_access`): a high daily ceiling, effectively unlimited for normal use.
- Usage is counted server-side so the limit cannot be bypassed from the app.

## Campus home updates

The "coming soon" tiles change: Course Companion and Project Assistant become live entries with a recent-activity line (last topic explained, next chapter due). Career/CV, portfolio, SIWES and NYSC stay marked coming soon.

## Phase 2 (next, after this ships)

Graduate hub: CV generator with PDF download, public portfolio page at a shareable link, and AI CV review/scoring — plus SIWES logbook and NYSC tools.

## Technical notes

- New edge function `campus-ai` (streaming, Lovable AI Gateway, `openai/gpt-5.6-sol` via the Responses API) with task modes: `explain`, `questions`, `summarise`, `predict`, `topics`, `outline`, `chapter`, `abstract`, `feedback`, `references`. Validates the JWT, loads the student's course/material/project rows server-side so prompts are grounded in real data, and refuses off-course requests.
- New tables: `campus_ai_sessions` (per-course saved outputs: kind, title, content, course_id), `campus_question_sets` + `campus_generated_questions` (saved practice sets with answers), and `campus_ai_usage` (user_id, day, count) for metering. All RLS-scoped to `auth.uid()` with the required GRANTs.
- Premium check reuses the existing `has_premium_access` function inside the edge function; the client only displays the remaining count.
- New pages `src/pages/campus/CampusCompanion.tsx` and AI panels under `src/components/campus/ai/`, reusing `CampusShell`, the markdown/KaTeX renderer from `src/lib/aiTutor.ts`, and the existing flat Deep Ink + Edura Green system (no gradients).
- Routes registered in `App.tsx`; Campus nav in `AppShell`/`CampusShell` gains the Companion entry.
