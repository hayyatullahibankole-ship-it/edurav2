# Edura Auto-Question Selection Feature

## Overview
This feature allows schools to quickly create exams by selecting "Use Edura Questions" instead of manually selecting questions. When students take the exam, random questions from the Edura database are automatically loaded based on the subject and question count specifications.

## How It Works

### For Schools (Creating Exams)

1. **Access Exam Creation**
   - Navigate to School Dashboard → Exam Management → "Create Exam"

2. **Choose Question Selection Method**
   At the "Question Selection Method" step, choose one of two options:
   - **Use Edura Questions** (Recommended for quick setup)
     - Automatically pulls random questions from Edura database
     - Only requires specifying number of questions per subject
     - No manual question selection needed
     - Students will get random questions when they start the exam
   
   - **Manual Question Selection** (For custom questions)
     - Upload your own questions via CSV or text
     - Or select from Edura question bank manually

3. **Configure for Edura Mode**
   When "Use Edura Questions" is selected:
   - Select the subjects for your exam
   - Specify "Questions per Subject" (e.g., 10 questions per subject)
   - Set exam duration and other settings
   - Click "Publish" to make available to students
   - You're done! No need to manually select questions.

4. **Example Setup**
   - Exam Title: "Mid-Term Mathematics & Physics Test"
   - Question Selection: "Use Edura Questions"
   - Subjects: Mathematics, Physics
   - Questions per Subject: 15  
   - Total Questions: 30 (15 math + 15 physics per student)
   - Each student gets 30 random questions when they start

### For Students (Taking Exams)

1. **Starting the Exam**
   - View available exams in their dashboard
   - Click "Start Exam"
   - The system automatically loads the specified number of random questions from the database for each subject

2. **Question Loading**
   - If exam uses "Edura Questions" mode:
     - 15 random Mathematics questions are loaded
     - 15 random Physics questions are loaded
     - Questions are shuffled and presented
   - Different students get different random questions (unless they have the same seed)

3. **Taking the Exam**
   - Students see their allocated questions
   - Submit answers as usual
   - Results are calculated and displayed

## Technical Implementation

### Database Changes
- Added `question_selection_mode` column to `exams` table
  - Values: `'edura'` or `'custom'` (defaults to `'custom'` for backward compatibility)

### Key Components Modified

1. **SchoolExamManager.tsx** - Updated UI
   - Added question selection radio buttons
   - Show "Questions per Subject" only for Edura mode
   - Added visual descriptions for each mode
   - Save `question_selection_mode` when creating exam

2. **SchoolAvailableExams.tsx** - Updated Logic
   - Enhanced exam question loading logic
   - If `question_selection_mode` is 'edura':
     - Fetch random questions using `get_random_questions_for_subjects` RPC
     - Pull `question_count` questions per subject
   - If `question_selection_mode` is 'custom':
     - Load pre-linked questions from exam_questions table
     - Fallback to random if no pre-linked questions exist

3. **Supabase Types** - Updated TypeScript
   - Added `question_selection_mode` to exams table type definitions

### Database Migration
- File: `20260215_add_question_selection_mode.sql`
- Adds `question_selection_mode` column
- Default value: `'custom'` (backward compatible)
- Includes index for faster queries

## Query Used to Fetch Random Questions

```sql
SELECT * FROM get_random_questions_for_subjects(
  subject_ids => [subject_uuid],
  per_subject_count => 15
);
```

This RPC function:
- Fetches random questions from the questions table
- Respects subject filtering
- Returns the specified count per subject
- Ensures randomization across all students

## Advantages

✅ **Speed**: Schools create exams in seconds (no question selection)  
✅ **Fairness**: Each student gets random questions (prevents cheating)  
✅ **Variety**: Large question pool ensures diverse exams  
✅ **Flexibility**: Can still use custom mode for specific exams  
✅ **Scalability**: Works with any number of students  
✅ **Quality**: Uses Edura's vetted question database  

## Example Workflow

```
School Admin:
1. Navigate to Exam Management
2. Click "Create Exam"
3. Enter Title: "Biology Mid-Term"
4. Select "Use Edura Questions"
5. Select Subject: Biology
6. Set: 20 questions per subject
7. Set Duration: 60 minutes
8. Click Publish
9. Exam is ready! (30 seconds total)

Student:
1. View exam dashboard
2. Click "Start Biology Mid-Term"
3. System loads 20 random Biology questions
4. Student answers all 20 questions
5. Submit and see results
```

## Backward Compatibility

- Existing exams with `question_selection_mode = 'custom'` work as before
- New exams default to `'custom'` for safety
- Schools must explicitly choose "Use Edura Questions"
- No breaking changes to existing exam logic

## Future Enhancements

Possible improvements:
- Let schools specify difficulty level (easy/medium/hard)
- Filter by question tags/topics
- Create exam templates with pre-configured Edura settings
- Set randomization seed for specific question distributions
- Support conditional question selection (e.g., "only WAEC questions")

## Troubleshooting

**Problem**: "No questions available for this exam"
- **Cause**: Selected subject has fewer questions than requested
- **Solution**: 
  - Reduce questions per subject
  - Add more questions to Edura database
  - Use subject with more questions

**Problem**: Different students seeing same questions
- **Cause**: This shouldn't happen - check if custom mode was used instead
- **Solution**: Verify exam is in 'edura' mode; regenerate exam if needed

**Problem**: Questions not loading when student starts exam
- **Cause**: RPC function error or subject ID mismatch
- **Check**: 
  - Ensure exam_subjects has correct subject_ids
  - Verify subject exists in questions table
  - Check Supabase logs for RPC errors

## Related Files

- `/src/components/school/SchoolExamManager.tsx` - Exam creation UI
- `/src/components/school/SchoolAvailableExams.tsx` - Question loading logic
- `/src/integrations/supabase/types.ts` - Type definitions
- `/supabase/migrations/20260215_add_question_selection_mode.sql` - Database migration
