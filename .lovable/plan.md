# Fix the AI Tutor: real page + working floating button

## What's wrong today

- `CBTHome.tsx` links to `/ai-tutor`, but no such route exists, so it lands on the 404 page.
- The AI tutor only exists as a cramped floating popup widget (`AIAssistant.tsx`) rendered on Dashboard, MobileHome and SchoolDashboard.

## What to build

### 1. Shared chat engine
Extract the chat logic already in `AIAssistant.tsx` (streaming from the `ai-assistant` edge function, session refresh + 401 anonymous retry, image upload, camera, voice input, KaTeX/markdown rendering) into a reusable `AITutorChat` component so both the page and any compact usage share one implementation. No backend or prompt changes.

### 2. Chat history saved to the student's account (multiple threads)

Two new tables:
- `ai_tutor_threads` — owner (`auth.uid()`), title (auto-set from the first message), timestamps.
- `ai_tutor_messages` — thread id, role (user/assistant), content, optional image attachments, created_at.

Both with grants and RLS so a student can only read/write their own threads and messages. Messages are saved after each turn (user message on send, assistant message when the stream completes), so history survives reloads and appears on any device the student signs in to.

Guests (not signed in) can still chat, but nothing is saved and a small note invites them to sign in to keep history.

### 3. New pages: `/ai-tutor` and `/ai-tutor/:threadId`

- `/ai-tutor` opens the most recent thread, or an empty new chat if there are none.
- `/ai-tutor/:threadId` is a real URL per conversation — reloading restores that exact conversation.
- Thread list: sidebar on desktop, slide-over sheet ("History" button) on mobile, showing title, last-message snippet and relative time, with rename and delete.
- "New chat" creates a thread and navigates to its URL.

The tutor screen itself, built app-standard:
- Header with back button, tutor identity (Edura AI), History and New chat actions.
- Empty state with suggested starter prompts (explain a topic, solve this equation, snap a question, study plan tips).
- Full-height scrolling transcript, distinct user vs assistant styling, streaming "Thinking..." indicator, copy button on answers.
- Sticky composer: textarea with Enter-to-send, attach image, camera capture, voice input, send button; safe-area padding so it clears the mobile tab bar.
- Math rendered with KaTeX, markdown formatting preserved.
- Errors (429 / 402 / network) shown inline with retry instead of a silent failure.

### 4. Floating button behaviour
`AIAssistant.tsx` becomes a floating launcher only: tapping it navigates to `/ai-tutor` instead of opening the popup. It hides itself while already on the tutor pages and on exam routes.

### 5. Routing
Register the tutor pages as lazy routes inside the protected Edura routes in `PlatformRouter.tsx`, wrapped in the standard layout so the mobile tab bar and back navigation behave like other pages.

## Out of scope
- No changes to the `ai-assistant` edge function, model, or system prompt.
- No Akboy or school-side changes beyond the floating button behaviour.

## Design
Existing Deep Ink + Edura Green flat tokens, Sora/Manrope type, no gradients.
