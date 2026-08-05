# Fix the AI Tutor: real page + working floating button

## What's wrong today

- `CBTHome.tsx` links to `/ai-tutor`, but no such route exists, so it lands on the 404 page.
- The AI tutor only exists as a cramped floating popup widget (`AIAssistant.tsx`) rendered on Dashboard, MobileHome and SchoolDashboard.

## What to build

### 1. Shared chat engine
Extract the chat logic already in `AIAssistant.tsx` (streaming from the `ai-assistant` edge function, session refresh + 401 anonymous retry, image upload, camera, voice input, KaTeX/markdown rendering) into a reusable `AITutorChat` component so both the page and any compact usage share one implementation. No backend or prompt changes.

### 2. New full page: `src/pages/AITutor.tsx` at `/ai-tutor`
A properly built, app-standard tutor screen:
- Header with back button, tutor identity (Edura AI), and a "New chat" action.
- Empty state with suggested starter prompts (explain a topic, solve this equation, snap a question, study plan tips).
- Full-height scrolling transcript, distinct user vs assistant styling, streaming "Thinking..." indicator, copy button on answers.
- Sticky composer: textarea with Enter-to-send, attach image, camera capture, voice input, send button; safe-area padding so it clears the mobile tab bar.
- Math rendered with KaTeX, markdown formatting preserved.
- Errors (429 / 402 / network) shown inline with retry instead of a silent failure.
- Conversation kept for the session and restored from `sessionStorage` so navigating away and back doesn't wipe it.

### 3. Floating button behaviour
`AIAssistant.tsx` becomes a floating launcher only: tapping it navigates to `/ai-tutor` instead of opening the popup. It hides itself while already on `/ai-tutor` and on exam routes.

### 4. Routing
Register `AITutor` as a lazy route inside the protected Edura routes in `PlatformRouter.tsx`, wrapped in the standard layout so the mobile tab bar and back navigation behave like other pages.

## Out of scope
- No changes to the `ai-assistant` edge function, model, or system prompt.
- No chat history persistence in the database (session-only).
- No Akboy or school-side changes beyond the floating button behaviour.

## Design
Existing Deep Ink + Edura Green flat tokens, Sora/Manrope type, no gradients.
