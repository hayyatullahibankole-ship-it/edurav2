import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zqapbmllkywsuywpfava.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXBibWxsa3l3c3V5d3BmYXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTA5NDgsImV4cCI6MjA3NDI4Njk0OH0.uZmBzHcTI3oBiigUv_QCVkYF5Nh5_dK21qQtdpzjkUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    if (!email || !password) {
      console.error('Usage: node create_edura_exam.mjs <email> <password> [questionsPerSubject] [durationMinutes]');
      process.exit(1);
    }

    const questionsPerSubject = parseInt(process.argv[4]) || 5;
    const durationMinutes = parseInt(process.argv[5]) || 30;

    console.log('Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('Sign-in error:', signInError);
      process.exit(1);
    }
    const authUser = signInData.user;
    if (!authUser) {
      console.error('No user returned from sign-in');
      process.exit(1);
    }
    console.log('Signed in as auth user id:', authUser.id);

    // Find local user record
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (userError || !userRow) {
      console.error('Failed to find user row in users table:', userError);
      process.exit(1);
    }
    const userId = userRow.id;
    console.log('Mapped to users.id:', userId);

    // Find staff record to get school_id
    const { data: staffRow } = await supabase
      .from('school_staff')
      .select('school_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    const schoolId = staffRow?.school_id;
    if (!schoolId) {
      console.warn('No school_id found for this staff user. Attempting to infer from school_students...');
      const { data: studentRow } = await supabase
        .from('school_students')
        .select('school_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (studentRow?.school_id) {
        console.log('Found school_id via student record.');
      }
    }

    // Fetch active subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .limit(3);

    if (!subjects || subjects.length === 0) {
      console.error('No active subjects found to attach to the exam. Aborting.');
      process.exit(1);
    }

    const subjectIds = subjects.map(s => s.id);
    console.log('Using subjects:', subjectIds);

    // Create exam
    const totalQuestions = subjectIds.length * questionsPerSubject;
    const examPayload = {
      title: 'Sample Edura Exam',
      description: 'Auto-created Edura sample exam',
      type: 'CUSTOM',
      duration_minutes: durationMinutes,
      total_questions: totalQuestions,
      instructions: 'Answer all questions.',
      is_published: true,
      school_id: schoolId || null,
      created_by: userId,
      requires_subscription: false,
      question_selection_mode: 'edura',
      questions_per_subject: questionsPerSubject,
    };

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert(examPayload)
      .select()
      .single();

    if (examError) {
      console.error('Failed to create exam:', examError);
      process.exit(1);
    }

    console.log('Created exam id:', exam.id);

    // Create exam_subjects
    const examSubjects = subjectIds.map((subId, idx) => ({
      exam_id: exam.id,
      subject_id: subId,
      subject_name: subjects[idx]?.name || '',
      question_count: questionsPerSubject,
      display_order: idx,
    }));

    const { error: esError } = await supabase.from('exam_subjects').insert(examSubjects);
    if (esError) {
      console.error('Failed to insert exam_subjects:', esError);
    } else {
      console.log('Inserted exam_subjects');
    }

    // Create assignment to all students if schoolId is present
    if (schoolId) {
      const { error: assignError } = await supabase.from('school_exam_assignments').insert([{
        exam_id: exam.id,
        school_id: schoolId,
        assigned_to_all: true,
        is_active: true,
        start_date: null,
        end_date: null,
        created_by: userId,
      }]);
      if (assignError) console.error('Failed to create assignment:', assignError);
      else console.log('Created assignment for all students at school', schoolId);
    } else {
      console.warn('No school_id available; skipping assignment creation. If you want the exam assigned, provide a school_id.');
    }

    console.log('Done. Exam ready.');
    console.log('Exam URL (if using dev app): http://localhost:8080/');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
