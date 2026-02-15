# School Exam Visibility Bug Fix

## Problem
Students were not seeing exams created by their school, even though the exams were created and assigned to them.

## Root Cause Analysis

### Issue 1: Inconsistent Default Publishing Status
- **File**: `SchoolExamManager.tsx`
- **Problem**: Exams were created with `is_published: false` (draft status) by default
- **Impact**: Draft exams cannot be seen by students, even though they are assigned
- **Code**: Default state had `is_published: false`

### Issue 2: Incomplete RLS Policy
- **File**: Database RLS policy "Students can view school assigned exams"
- **Problem**: The policy didn't check the `is_published` flag for school exams
- **Impact**: The policy was inconsistent with frontend expectations that only published exams should be visible
- **Security**: Could allow viewing of draft/unreleased exams if RLS wasn't properly enforced

## Solutions Implemented

### 1. Updated SchoolExamManager.tsx
**File**: `src/components/school/SchoolExamManager.tsx`

**Change**: Modified default exam creation state to publish immediately
```typescript
// Before
is_published: false,

// After  
is_published: true,
```

**Locations**: 
- Initial state definition (line 35)
- resetForm function (line 209)

**Rationale**: When a school admin creates an exam, it should be immediately available to their students. The checkbox option to "Publish immediately" is now checked by default, but can still be unchecked if admins want to create drafts.

### 2. Created Database Migration
**File**: `supabase/migrations/20260215_fix_school_exam_visibility.sql`

**Change**: Updated RLS policy to enforce `is_published = true` for school exams

**Before**:
```sql
CREATE POLICY "Students can view school assigned exams"
ON public.exams
FOR SELECT
USING (
  (school_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.school_exam_assignments sea
    -- Missing is_published check
    WHERE sea.exam_id = exams.id
    ...
  ))
  OR
  (is_published = true AND school_id IS NULL)
);
```

**After**:
```sql
CREATE POLICY "Students can view school assigned exams"
ON public.exams
FOR SELECT
USING (
  (
    school_id IS NOT NULL 
    AND is_published = true  -- Added this check
    AND EXISTS (
      SELECT 1 FROM public.school_exam_assignments sea
      ...
    )
  )
  OR
  (is_published = true AND school_id IS NULL)
);
```

**Rationale**: Ensures that both the policy and frontend have the same requirement - exams must be published for students to access them.

## How It Works Now

1. **School Admin Creates Exam**
   - Defaults to `is_published: true`
   - Can be toggled to `false` if needed for draft mode
   - Exam is assigned to students via `school_exam_assignments`

2. **RLS Policy Checks**
   - Exam must have `school_id IS NOT NULL`
   - Exam must have `is_published = true`
   - Student must have a valid assignment (either `student_id` matches OR `assigned_to_all = true`)
   - Assignment must be `is_active = true`
   - Dates must be valid (if specified)

3. **Student Sees Exam**
   - Fetches from `school_exam_assignments`
   - RLS policy allows viewing only published exams
   - Frontend filters ensure only valid exams are displayed

## Testing

To verify the fix works:

1. **As School Admin**:
   - Create a new exam
   - Verify default is "Publish immediately is checked"
   - Assign to all students or specific students
   - Verify exam is created without requiring manual publish step

2. **As Student**:
   - Check "School Assigned Exams" section
   - Newly created exams should appear immediately
   - Start any exam to verify it works

3. **Draft Exams** (if needed):
   - Can still create draft exams by unchecking "Publish immediately"
   - Drafts will not appear in students' exam lists
   - Admins can publish drafts later using the Publish button

## Files Modified

1. `src/components/school/SchoolExamManager.tsx` - Updated default is_published to true
2. `supabase/migrations/20260215_fix_school_exam_visibility.sql` - Updated RLS policy

## Backward Compatibility

The changes are backward compatible. Existing unpublished exams will remain unpublished and won't appear to students. To fix existing data, admins can:
1. Publish existing exams using the UI (Publish button)
2. Or run: `UPDATE public.exams SET is_published = true WHERE school_id IS NOT NULL AND is_published = false;`

## Additional Notes

- The `SchoolExamManagerEnhanced` component already uses `publishImmediately: true` as default, so it's aligned with this fix
- The fix maintains the ability for admins to create draft exams - they just won't appear to students until published
- Date-based exam scheduling continues to work - exams can have start/end dates
