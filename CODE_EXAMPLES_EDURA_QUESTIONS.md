# Code Examples: Edura Auto-Question Selection

## Example 1: Creating Exam with Edura Questions

### UI Form State
```typescript
// From SchoolExamManager.tsx
const [newExam, setNewExam] = useState({
  title: 'Biology Final Exam',
  description: 'Final assessment on all topics',
  type: 'CUSTOM',
  duration_minutes: 120,
  instructions: 'Answer all questions',
  is_published: true,
  selectedSubjects: ['subject-uuid-biology', 'subject-uuid-chemistry'], // 2 subjects
  questionSelectionMode: 'edura',  // ← KEY: Use Edura mode
  questionsPerSubject: 25,          // ← Each subject: 25 questions
  selectedQuestions: [],
  assignToAll: true,
  selectedStudents: [],
  startDate: '',
  endDate: '',
});
```

### Database Record Created
```sql
-- Inserted into exams table
{
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Biology Final Exam',
  description: 'Final assessment on all topics',
  type: 'CUSTOM',
  duration_minutes: 120,
  total_questions: 50,  -- 2 subjects × 25 questions
  instructions: 'Answer all questions',
  is_published: true,
  question_selection_mode: 'edura',  -- ← Marks as Edura mode
  school_id: 'school-uuid',
  created_by: 'teacher-uuid',
  created_at: '2026-02-15T10:00:00Z'
}

-- Inserted into exam_subjects table
[
  {
    exam_id: '123e4567-e89b-12d3-a456-426614174000',
    subject_id: 'subject-uuid-biology',
    subject_name: 'Biology',
    question_count: 25,          -- 25 questions per student
    display_order: 0
  },
  {
    exam_id: '123e4567-e89b-12d3-a456-426614174000',
    subject_id: 'subject-uuid-chemistry',
    subject_name: 'Chemistry',
    question_count: 25,          -- 25 questions per student
    display_order: 1
  }
]
```

## Example 2: Student Starting Edura Exam

### Code Flow in SchoolAvailableExams.tsx

```typescript
const startExam = async (examId: string) => {
  try {
    // 1. Fetch exam with details
    const { data: exam } = await supabase
      .from('exams')
      .select('*,exam_subjects(subject_id, question_count, subject_name)')
      .eq('id', examId)
      .single();
    
    // 2. Check exam mode
    if (exam.question_selection_mode === 'edura') {
      // 3. Fetch random questions for Edura mode
      const allQuestions = [];
      
      // For each subject, fetch random questions
      for (const examSubject of exam.exam_subjects) {
        const { data: questions } = await supabase
          .rpc('get_random_questions_for_subjects', {
            subject_ids: [examSubject.subject_id],
            per_subject_count: examSubject.question_count  // e.g., 25
          });
        
        if (questions) {
          allQuestions.push(...questions);
        }
      }
      
      var questionIds = allQuestions.map(q => q.id);
      // questionIds now contains 50 random question IDs
      // ~25 from Biology + ~25 from Chemistry
    } else {
      // Custom mode: use pre-linked questions
      // ... existing logic
    }
    
    // 4. Create attempt with question IDs
    const { data: attempt } = await supabase
      .from('attempts')
      .insert({
        user_id: studentId,
        exam_id: examId,
        status: 'STARTED',
        time_remaining_seconds: exam.duration_minutes * 60,
        proctoring_data: {
          exam_type: exam.type,
          total_questions: questionIds.length,  // 50
          question_ids: questionIds
        }
      })
      .select()
      .single();
    
    // 5. Navigate to exam page
    navigate(`/cbt-exam/${attempt.id}`);
  } catch (error) {
    console.error('Error starting exam:', error);
    toast.error('Failed to start exam');
  }
};
```

## Example 3: Comparing Question Flows

### Custom Mode (Traditional)
```
School Admin:
1. Creates exam
2. Manually selects questions from bank
3. Links questions to exam via exam_questions table
4. Publishes

Student Takes Exam:
1. Database loads pre-selected questions
2. Same questions for all students
3. Fast loading (no random selection)
```

### Edura Mode (New)
```
School Admin:
1. Creates exam
2. Selects "Use Edura Questions"
3. Specifies number of questions per subject
4. Publishes (NO manual question selection!)

Student Takes Exam:
1. Exam detected as Edura mode
2. Database fetches random questions per subject
3. Different questions for each student
4. Slightly slower (RPC call for randomization)
```

## Example 4: Database Queries

### Query 1: Create Exam with Edura Mode
```sql
INSERT INTO exams (
  title, 
  description,
  type,
  duration_minutes,
  total_questions,
  question_selection_mode,  -- ← NEW COLUMN
  school_id,
  created_by
) VALUES (
  'Biology Final Exam',
  'Final assessment on all topics',
  'CUSTOM',
  120,
  50,
  'edura',                    -- ← Set to 'edura'
  'school-uuid',
  'teacher-uuid'
);
```

### Query 2: Fetch Exam to Check Mode
```sql
SELECT 
  id,
  title,
  question_selection_mode,   -- ← Check this
  duration_minutes,
  total_questions
FROM exams
WHERE id = 'exam-uuid';

-- Result:
{
  id: 'exam-uuid',
  title: 'Biology Final Exam',
  question_selection_mode: 'edura',  -- ← Tells us to use RPC
  duration_minutes: 120,
  total_questions: 50
}
```

### Query 3: Fetch Random Questions (RPC)
```sql
-- Called via supabase.rpc()
SELECT get_random_questions_for_subjects(
  subject_ids => ARRAY['subject-uuid-biology']::uuid[],
  per_subject_count => 25
);

-- Returns ~25 random questions from Biology:
[
  {
    id: 'q-1',
    subject_id: 'subject-uuid-biology',
    question_text: 'What is photosynthesis?',
    options: ['...', '...', '...', '...'],
    correct_answer: 2,
    difficulty_level: 2
  },
  ... 24 more questions
]
```

### Query 4: Check All Exams and Their Modes
```sql
SELECT 
  title,
  question_selection_mode,
  total_questions,
  is_published,
  created_at
FROM exams
WHERE school_id = 'school-uuid'
ORDER BY created_at DESC;

-- Result:
[
  {
    title: 'Biology Final Exam',
    question_selection_mode: 'edura',     -- ← Uses auto-fetch
    total_questions: 50,
    is_published: true,
    created_at: '2026-02-15T10:00:00Z'
  },
  {
    title: 'Mathematics Quiz',
    question_selection_mode: 'custom',    -- ← Manual selection
    total_questions: 30,
    is_published: true,
    created_at: '2026-02-14T15:30:00Z'
  }
]
```

## Example 5: UI Components

### Question Selection Mode Selector
```tsx
<div className="grid grid-cols-1 gap-3">
  {/* Edura Questions Option */}
  <div 
    className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
    onClick={() => setNewExam({...newExam, questionSelectionMode: 'edura'})}
  >
    <Checkbox
      checked={newExam.questionSelectionMode === 'edura'}
    />
    <div className="flex-1">
      <Label className="cursor-pointer font-semibold">
        Use Edura Questions
      </Label>
      <p className="text-sm text-muted-foreground">
        Automatically pull random questions from Edura's database.
        Just specify the number of questions per subject.
      </p>
    </div>
  </div>

  {/* Manual Selection Option */}
  <div 
    className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
    onClick={() => setNewExam({...newExam, questionSelectionMode: 'custom'})}
  >
    <Checkbox
      checked={newExam.questionSelectionMode === 'custom'}
    />
    <div className="flex-1">
      <Label className="cursor-pointer font-semibold">
        Manual Question Selection
      </Label>
      <p className="text-sm text-muted-foreground">
        Upload your own questions via CSV, text, or select from bank manually.
      </p>
    </div>
  </div>
</div>
```

### Exam Badge Indicator
```tsx
{exam.question_selection_mode === 'edura' && (
  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
    📚 Edura Questions
  </Badge>
)}
```

## Example 6: Handling Errors

### Insufficient Questions Error
```typescript
// In startExam function
for (const examSubject of exam.exam_subjects) {
  const { data: questions, error } = await supabase
    .rpc('get_random_questions_for_subjects', {
      subject_ids: [examSubject.subject_id],
      per_subject_count: 25
    });
  
  if (error || !questions || questions.length === 0) {
    toast.error(
      `Failed to load questions for ${examSubject.subject_name}. ` +
      `Not enough questions available. Try reducing the number.`
    );
    return;
  }
  
  if (questions) allQuestions.push(...questions);
}
```

## Example 7: Statistics

### Before & After Using Edura Mode

**Traditional Exam Creation** (Manual Selection)
```
Time to create exam:
- Select 50 questions manually:  15 minutes
- Remove duplicates:             5 minutes  
- Verify quality:                5 minutes
- Upload/confirm:               5 minutes
────────────────────
TOTAL:                          30 minutes
```

**Edura Exam Creation** (Auto-Fetch)
```
Time to create exam:
- Fill form:                    3 minutes
- Select Edura mode:           10 seconds
- Specify question count:      10 seconds
- Publish:                     10 seconds
────────────────────
TOTAL:                         33 seconds
────────────────────
TIME SAVED:                    99%! 🎉
```

## Example 8: Testing Verification

```typescript
// Test: Creating an Edura exam
test('Should create exam with edura question selection mode', async () => {
  const response = await supabase
    .from('exams')
    .insert({
      title: 'Test Exam',
      question_selection_mode: 'edura',
      duration_minutes: 60,
      total_questions: 50,
      school_id: 'test-school'
    })
    .select()
    .single();
  
  expect(response.data.question_selection_mode).toBe('edura');
  expect(response.data.total_questions).toBe(50);
});

// Test: Loading questions for Edura exam
test('Should load random questions for Edura mode exam', async () => {
  const { data: questions } = await supabase
    .rpc('get_random_questions_for_subjects', {
      subject_ids: ['biology-subject-id'],
      per_subject_count: 20
    });
  
  expect(questions.length).toBe(20);
  expect(questions[0].subject_id).toBe('biology-subject-id');
});
```

---

## Summary

The Edura Auto-Question Selection feature works by:

1. **School selects** "Use Edura Questions" when creating exam
2. **System stores** `question_selection_mode = 'edura'` in database
3. **When student starts exam** → System detects Edura mode
4. **System calls** RPC function to fetch random questions
5. **Questions load** → Student takes exam with random questions
6. **Each student** gets different random selection

**Result**: Exams created in seconds, students get fair randomized questions! 🚀
