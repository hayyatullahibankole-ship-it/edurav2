# Finish the open items: pricing, institutions, school accounts

## 1. Stop losing money on scratch cards (highest priority)

Vendor cost vs your current prices:

| Card | Vendor cost | Your price | Status |
| --- | --- | --- | --- |
| WAEC | ₦5,140 | ₦3,500 | loss of ₦1,640 per sale |
| NECO | ₦2,000 | ₦1,300 | loss of ₦700 per sale |
| NABTEB | ₦820 | ₦1,200 | fine |

Changes:
- Update WAEC to ₦5,500 and NECO to ₦2,300 (cost + small margin) so every sale is profitable.
- Add a safety check in the purchase function: if the vendor's live price is higher than what the customer paid, the order is rejected and refunded to wallet before any PIN is bought, instead of selling at a loss.
- Show the vendor's live availability/price to you in the admin services screen so you notice when the vendor raises prices.

## 2. Post-UTME / Admission pricing is unusable

`Post-UTME Application` is currently priced at ₦10 and there are **zero institutions** in the institutions table, so per-institution quotes cannot be selected by anyone.

Changes:
- Seed the institutions list with the main Nigerian universities, polytechnics and colleges of education, each with an editable admission-form fee and your service fee.
- Switch Post-UTME and Admission Processing to per-institution pricing so the customer picks their school and the total (form fee + your fee) is calculated automatically.
- Keep everything editable from Admin → Institutions.

## 3. School accounts — the gaps

What already works: registration, verification, student manager with CSV import, exam builder, mock exams, reports, export tools, billing screen.

What is missing and will be added:
- **Pay school subscription from wallet.** Schools currently only pay by card. Add a "Pay from wallet" option to the subscription screen, using the same atomic debit flow the CBT plans use, including seat accumulation.
- **Seat top-up.** A school that fills its seats has no way to buy more without redoing a full subscription. Add a "Add more seats" action that charges only for the extra seats and adds them to the existing plan.
- **Renewal reminders.** Email the school admin 14 and 3 days before expiry, and show an expiry banner in the school dashboard.
- **School wallet visibility.** Show the school's wallet balance and transaction history inside the school billing tab.
- **Staff invites.** Allow the school admin to invite a teacher by email so they can manage exams and see reports without sharing the main login.

## 4. Ebook access automation

Access codes are still created by hand. Add a generator in the admin ebook screen that creates a batch of codes for a specific book, marks who redeemed each one, and lets you revoke a code (which releases the device lock so the reader can be moved to a new device).

## 5. Play Store

No code change needed while the listing is in review. The PWA install page stays the primary path. Once the store listing is live, the install page gets a Play Store button and the old APK link is removed.

## Technical notes

- Price updates run as data updates on `service_catalog`; institution seeding inserts into `institutions`.
- Wallet payment for schools reuses the `pay-subscription-wallet` pattern in a new `pay-school-subscription-wallet` edge function that debits atomically, writes to `school_subscriptions`, and increments `student_seats`.
- Seat top-up extends the same function with a `seats_only` mode that preserves the existing expiry date.
- Renewal reminders extend the existing `send-subscription-reminders` scheduled function to cover `school_subscriptions`.
- Staff invites use the existing `school_staff` table plus an invite email through the current Resend functions; no schema change beyond an invite status column.
- Ebook code batches use the existing `ebook_access_codes` table; revoke clears the device fingerprint on `ebook_access`.
- The Paystack webhook already verifies the HMAC signature and `wallet_credit` already ignores duplicate references, so no hardening work is needed there.
