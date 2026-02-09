import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Auth client to verify user
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });

    // Service role client for inserts
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify user
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authUserId = userRes.user.id;

    // Get user's internal ID
    const { data: userData, error: userDataErr } = await adminClient
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (userDataErr || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is a school admin
    const { data: school } = await adminClient
      .from('schools')
      .select('id')
      .eq('admin_user_id', userData.id)
      .eq('is_active', true)
      .single();

    if (!school) {
      return new Response(JSON.stringify({ error: 'Not a school admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'bulk_insert_questions': {
        const { questions, exam_id } = body;
        
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          return new Response(JSON.stringify({ error: 'No questions provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Prepare questions for insertion
        const questionsToInsert = questions.map((q: any) => ({
          question_text: q.question_text,
          type: q.type || 'MCQ_SINGLE',
          subject_id: q.subject_id,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          difficulty_level: q.difficulty_level || 1,
          points: q.points || 1,
          time_limit_seconds: q.time_limit_seconds || 90,
          created_by: userData.id,
          is_active: true,
        }));

        // Insert questions using service role (bypasses RLS)
        const { data: insertedQuestions, error: insertError } = await adminClient
          .from('questions')
          .insert(questionsToInsert)
          .select('id, subject_id');

        if (insertError) {
          console.error('Insert error:', insertError);
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // If exam_id is provided, link questions to exam
        if (exam_id && insertedQuestions) {
          const examQuestions = insertedQuestions.map((q: any, idx: number) => ({
            exam_id,
            question_id: q.id,
            display_order: idx,
          }));

          const { error: linkError } = await adminClient
            .from('exam_questions')
            .insert(examQuestions);

          if (linkError) {
            console.error('Link error:', linkError);
            // Don't fail entirely, questions were already inserted
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          count: insertedQuestions?.length || 0,
          question_ids: insertedQuestions?.map((q: any) => q.id) || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'link_questions_to_exam': {
        const { exam_id, question_ids } = body;
        
        if (!exam_id || !question_ids || !Array.isArray(question_ids)) {
          return new Response(JSON.stringify({ error: 'Missing exam_id or question_ids' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Verify exam belongs to school
        const { data: exam } = await adminClient
          .from('exams')
          .select('id, school_id')
          .eq('id', exam_id)
          .eq('school_id', school.id)
          .single();

        if (!exam) {
          return new Response(JSON.stringify({ error: 'Exam not found or not owned by your school' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Clear existing links
        await adminClient
          .from('exam_questions')
          .delete()
          .eq('exam_id', exam_id);

        // Insert new links
        const examQuestions = question_ids.map((qid: string, idx: number) => ({
          exam_id,
          question_id: qid,
          display_order: idx,
        }));

        const { error: linkError } = await adminClient
          .from('exam_questions')
          .insert(examQuestions);

        if (linkError) {
          return new Response(JSON.stringify({ error: linkError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update exam total_questions
        await adminClient
          .from('exams')
          .update({ total_questions: question_ids.length })
          .eq('id', exam_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_school_questions': {
        const { subject_id, limit: queryLimit = 200 } = body;

        let query = adminClient
          .from('questions')
          .select('id, question_text, type, options, correct_answer, subject_id, difficulty_level, created_at, subjects(name)', { count: 'exact' })
          .eq('created_by', userData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(Math.min(queryLimit, 500));

        if (subject_id) {
          query = query.eq('subject_id', subject_id);
        }

        const { data, error, count } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ questions: data || [], count: count ?? 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('School bulk questions error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
