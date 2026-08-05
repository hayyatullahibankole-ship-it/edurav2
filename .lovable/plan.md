# Show serial numbers with every scratch card PIN

## What's wrong

The vendor does send serial numbers — the app just drops them.

Checked the two most recent completed orders (WAEC and NABTEB). The vendor's raw reply contains, per card:

```text
{ "pin": "803457619377", "serial_no": "WRN203147315" }
```

The code that reads the vendor reply looks for `serial`, `serial_number`, or `serialno` — but not `serial_no`, which is the field the vendor actually uses. So the serial is thrown away and only the PIN is saved and displayed.

This affects every card type from this vendor (WAEC, NECO, NABTEB), not just WAEC.

## The fix

1. Accept `serial_no` (plus the other spellings the vendor might use) when reading the vendor reply, so serials are stored with every new purchase. The saved raw vendor reply already keeps everything, so nothing else is lost.
2. Repair the past orders: for orders already completed, pull the serial out of the stored raw vendor reply and write it onto the saved card records, so customers see the serial in their purchase history retroactively.
3. Make the serial a first-class part of the display rather than small grey text:
   - Purchase dialog: PIN and Serial each get their own labelled row with its own copy button.
   - Purchase history: same treatment, plus a "copy both" action.
   - If a card genuinely has no serial (some products don't), the serial row is simply hidden.

## Technical notes

- `extractPins` in `supabase/functions/purchase-scratch-card/index.ts`: extend the serial lookup to `serial_no ?? serial ?? serial_number ?? serialno ?? serialNo`, and apply the same in the single-card branch.
- Backfill runs as a data update over `scratch_card_orders`, rebuilding the `pins` array from `vendor_response -> cards` where a serial exists and the stored pin entry lacks one.
- `ScratchCardDialog.tsx` and `ScratchCardHistory.tsx`: render PIN and Serial as separate labelled rows with individual copy buttons.
- No schema change; `pins` is already JSON with an optional `serial` field.
