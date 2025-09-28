import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user is authenticated admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Check admin status
    const { data: isAdminData, error: adminError } = await supabaseServiceClient
      .rpc('is_admin', { _user_id: user.id })
    
    if (adminError || !isAdminData) {
      return new Response('Forbidden', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    const { action, target_subject } = await req.json()

    if (action === 'scan') {
      // Find incomplete questions
      const { data, error } = await supabaseServiceClient
        .rpc('find_incomplete_questions', { target_subject })
      
      if (error) throw error

      // Get question details for display
      if (data && data.length > 0) {
        const questionIds = data.map((q: any) => q.id)
        const { data: questionDetails, error: detailsError } = await supabaseServiceClient
          .from('questions')
          .select(`
            id,
            question_text,
            subjects!inner(name)
          `)
          .in('id', questionIds)

        if (detailsError) throw detailsError

        const enrichedQuestions = data.map((inc: any) => {
          const details = questionDetails?.find((q: any) => q.id === inc.id)
          return {
            ...inc,
            question_text: details?.question_text || 'No text',
            subject_name: (details?.subjects as any)?.name || 'Unknown'
          }
        })

        return new Response(
          JSON.stringify({ success: true, questions: enrichedQuestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ success: true, questions: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'fix_latex') {
      // Fix LaTeX formatting in questions
      const { data, error } = await supabaseServiceClient
        .rpc('fix_latex_questions', { target_subject })
      
      if (error) throw error

      const fixedCount = data?.[0]?.updated_count || 0
      return new Response(
        JSON.stringify({ success: true, fixed_count: fixedCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete_incomplete') {
      // Delete incomplete questions
      const { data, error } = await supabaseServiceClient
        .rpc('delete_incomplete_questions', { target_subject })
      
      if (error) throw error

      const deletedCount = data?.[0]?.deleted || 0
      return new Response(
        JSON.stringify({ success: true, deleted_count: deletedCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Invalid action', { 
      status: 400, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Error in question-cleanup function:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})