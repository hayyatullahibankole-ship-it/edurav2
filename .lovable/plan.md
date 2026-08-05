# Play Store readiness, onboarding redesign, payments policy, performance

## 1. Is the app Play Store ready?

Technically the Android project builds and is configured correctly (package `com.edura.app`, target SDK 35, icons, splash, permissions). What is **not** ready is policy compliance and store paperwork.

Blocking items:

- **Google Play Payments policy.** Paystack is currently used inside the app for wallet funding, CBT subscriptions and scratch-card (e-PIN) purchases. Subscriptions and e-PINs are digital content consumed in the app, so Google requires Google Play Billing for them. Shipping as-is is the most likely rejection/suspension cause.
- **Permissions.** `CAMERA`, `RECORD_AUDIO`, `READ_MEDIA_*` are declared. Each must be justified in the Data Safety form and prompted in-context, or removed if only the Akboy mock proctoring uses them.
- Store-side work you do yourself: Play Console account, upload key, screenshots, feature graphic, privacy policy URL, data safety form, content rating.

## 2. Payments: in-app or web?

Recommended split, which keeps you compliant without adding Play Billing:

- **Inside the Android app:** no purchase UI for wallet top-up, CBT subscription or scratch cards. Show balance, history and "already paid" states only.
- **Outside the app:** all payment happens on `edura.space` in the system browser. The app opens the checkout in an external browser (Capacitor Browser/`window.open`), the Paystack webhook credits the wallet or grants the subscription, and the app refreshes state on resume.
- **Real-world services** (admission processing, Post-UTME application handling) are exempt from Play Billing, so those may keep in-app Paystack checkout.
- Play also forbids in-app *links/nudges* to external payment for digital goods, so the wallet screen must simply say the balance is managed on the web dashboard, without a "buy" call to action.

Alternative if you want in-app purchases later: add Google Play Billing for subscriptions and coin/wallet packs (Google takes 15–30%). That is a bigger, separate project.

**Wallet balance / virtual account / balance updates on their own are fine** — displaying balance, transaction history, dedicated virtual account details and auto-crediting are not purchases and do not breach policy. Only the *act of paying for digital content in-app* does.

## 3. Mobile onboarding redesign

Rebuild `src/pages/MobileOnboarding.tsx` in the new Sora/Manrope app language:

- Full-bleed swipeable pager (touch + drag, not just a Next button), 4 slides:
  1. Welcome / what Edura is
  2. Practice — CBT for JAMB, WAEC, NECO, Post-UTME
  3. Services & wallet — results checking, admissions support
  4. Pick your journey — "Preparing for an exam" vs "Already in higher institution"
- Slide 4 stores the choice locally and deep-links straight into `/auth`, then into the matching workspace after signup, so the journey step is not asked twice.
- Visual language: dark Deep Ink canvas, Edura green accent, no gradients-on-white, large display type, animated illustration card, spring press feedback, safe-area padding.
- Segmented progress bar instead of dots; persistent Skip; haptics on native.
- New onboarding artwork generated to match the flat brand style (replacing the current stock-style photos).

## 4. Performance / lag removal

- Split the tab-bar routes (`Dashboard`, `CBTHome`, `ServicesHome`, `Wallet`) with prefetch on tab hover/mount so switching does not show a loader each time.
- Replace ad-hoc `useEffect` fetching in the dashboard, wallet and CBT home with React Query (already installed) so returning to a tab renders cached data instantly and revalidates in the background.
- Remove the 15s wallet polling interval in `useWallet.tsx`; refresh on focus/resume and after known events only.
- Defer heavy vendor chunks (`recharts`, `jspdf`, `html2canvas`, `react-pdf`, `katex`) so they never load on app start.
- Reduce animation cost: use transform/opacity only, cap simultaneous blurred orbs, respect `prefers-reduced-motion`.
- Verify with a Lighthouse/profiling pass on the mobile viewport after changes.

## Technical notes

- Files touched: `src/pages/MobileOnboarding.tsx`, `src/pages/MobileSplash.tsx`, `src/hooks/useWallet.tsx`, `src/pages/Wallet.tsx`, `src/components/edura/AppShell.tsx`, `src/pages/Dashboard.tsx`, `src/pages/CBTHome.tsx`, `src/pages/ServicesHome.tsx`, `vite.config.ts`, plus a native-payment gate helper reading `Capacitor.isNativePlatform()`.
- No schema changes required.
