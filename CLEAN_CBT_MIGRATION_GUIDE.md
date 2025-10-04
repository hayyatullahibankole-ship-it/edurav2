# Clean CBT Module - Migration Guide

## Overview
The CBT module has been completely reconstructed with a clean, standardized architecture that eliminates answer handling inconsistencies.

## What Changed

### ✅ **Before (Problems)**
- Stored full option text: `"A) The correct answer is..."`
- Mixed formats in DB: `"A"`, `0`, `1`, `"B)"`, objects
- Complex parsing in multiple places
- Client-side recomputation of correctness
- Answers "changing" due to format mismatches

### ✅ **After (Solutions)**
- Store integer indices only: `0`, `1`, `2`, `3`
- Single validation function: `validate_answer_simple()`
- Server validates once, stores `is_correct` flag
- No client-side recomputation
- Consistent format everywhere

---

## New Architecture

```
┌─────────────────────────────────────┐
│         FRONTEND                     │
│  • useCBTExam Hook                   │
│  • CleanCBTInterface Component       │
│  • Stores answers as integers        │
└─────────────────────────────────────┘
              ↓ Submit (integer indices)
┌─────────────────────────────────────┐
│         DATABASE RPC                 │
│  • validate_answer_simple()          │
│  • Simple integer comparison         │
│  • Returns boolean                   │
└─────────────────────────────────────┘
              ↓ Store results
┌─────────────────────────────────────┐
│         DATABASE                     │
│  • questions.correct_answer: INTEGER │
│  • attempt_answers.answer: INTEGER   │
│  • attempt_answers.is_correct: BOOL  │
└─────────────────────────────────────┘
```

---

## Migration Steps

### 1. **Normalize Existing Questions**

Visit `/admin-normalize` as an admin to:
- Preview how existing questions will be converted
- Convert all `correct_answer` values to 0-based integers
- See before/after comparison

### 2. **New Database Functions**

✅ **`validate_answer_simple(question_id, submitted_index)`**
- Simple integer comparison: `submitted_index === correct_answer`
- Returns boolean
- No complex parsing

✅ **`normalize_question_answers()`**
- Preview normalization changes
- Shows old format → new format conversion

✅ **`apply_answer_normalization()`**
- Admin-only function
- Converts all questions to integer format
- Returns count of updated questions

### 3. **New Components**

#### Frontend Hooks:
- `useCBTExam` - Manages exam state with integer answers
- `useCleanAnswerReview` - Fetches stored results (no recomputation)
- `useCleanResults` - Fetches exam results

#### UI Components:
- `CleanCBTInterface` - Clean exam interface
- `CleanAnswerReviewCard` - Review with clear visual indicators
- `AdminNormalize` - Admin tool for normalization

### 4. **Updated Pages**

- ✅ `CBTExam.tsx` - Uses new clean architecture
- ✅ `AnswerReview.tsx` - Uses stored correctness flags
- ✅ `TestResults.tsx` - Uses clean results data
- ✅ `AdminNormalize.tsx` - NEW: Admin normalization tool

---

## Testing Checklist

### ✅ **Step 1: Normalize Database**
1. Log in as admin
2. Visit `/admin-normalize`
3. Click "Preview Changes"
4. Review the conversions
5. Click "Apply Normalization"
6. Verify questions were updated

### ✅ **Step 2: Test Exam Flow**
1. Start a new practice test
2. Answer questions by clicking options
3. Navigate between questions
4. Submit exam
5. Verify correct score on results page

### ✅ **Step 3: Test Answer Review**
1. Click "Review Answers" from results
2. Check that:
   - Correct answers are marked green
   - Incorrect answers are marked red
   - Your selected answer is highlighted
   - Correct answer is shown
   - Explanations display properly

### ✅ **Step 4: Verify Data Consistency**
1. Take another test
2. Pick different answers
3. Submit and check results
4. Verify answers don't "change" in review
5. Verify scores match what you selected

---

## Database Schema Changes

### Questions Table
```sql
-- Before: Mixed formats
correct_answer: "A", "0", "B)", { index: 1 }

-- After: Consistent integers
correct_answer: 0, 1, 2, 3
```

### Attempt Answers Table
```sql
-- Before: Mixed formats, computed correctness
answer: "A) Text", "B", 1, { letter: "C" }
is_correct: null (computed later)

-- After: Integer indices, stored correctness
answer: 0, 1, 2, 3
is_correct: true/false (validated on submission)
```

---

## Rollback Plan

If issues occur:

1. **Database**: Old functions still exist (`validate_student_answer`)
2. **Components**: Old components are still in codebase
3. **To rollback**: 
   - Revert page imports to old components
   - Old data remains intact
   - New integer format is compatible with old parsing

---

## Benefits

### 🎯 **Accuracy**
- ✅ No more answer format mismatches
- ✅ No more "changing" answers
- ✅ No more incorrect marking

### ⚡ **Performance**
- ✅ Simple integer comparison (fast)
- ✅ No complex parsing overhead
- ✅ No client-side recomputation

### 🔒 **Security**
- ✅ Server-side validation only
- ✅ Correctness stored in database
- ✅ No tampering possible

### 🧹 **Maintainability**
- ✅ Single source of truth
- ✅ Clear data flow
- ✅ Easy to debug

---

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify database normalization completed
3. Check that questions have integer `correct_answer`
4. Verify RLS policies allow data access
5. Review attempt_answers for stored correctness

---

## Technical Notes

### Answer Storage Format
```typescript
// Frontend state
answers: {
  [questionId: string]: number  // 0, 1, 2, 3
}

// Database storage
attempt_answers: {
  answer: INTEGER  // 0, 1, 2, 3
  is_correct: BOOLEAN  // validated on server
}

// Database questions
questions: {
  correct_answer: INTEGER  // 0, 1, 2, 3
  options: TEXT[]  // ["Option A", "Option B", ...]
}
```

### Validation Flow
```typescript
1. User selects option (index 0-3)
2. Frontend stores integer index
3. On submit: call validate_answer_simple(questionId, index)
4. Server compares: submitted === correct_answer
5. Store result in attempt_answers.is_correct
6. Review displays stored is_correct flag
```

---

## Migration Complete! 🎉

Your CBT module now has:
- ✅ Consistent answer handling
- ✅ Accurate scoring
- ✅ Reliable answer review
- ✅ No more "changing" answers
- ✅ Clean, maintainable code
