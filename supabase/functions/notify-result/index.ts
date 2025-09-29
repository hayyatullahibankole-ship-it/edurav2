import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { attemptId, userId } = await req.json();

    if (!attemptId) {
      throw new Error('Attempt ID is required');
    }

    console.log(`Sending result notification for attempt: ${attemptId}`);

    // Send SMS notification via the send-sms function
    const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
      body: {
        type: 'test_result',
        userId: userId,
        attemptId: attemptId
      }
    });

    if (smsError) {
      console.error('Failed to send SMS:', smsError);
      throw new Error(`SMS sending failed: ${smsError.message}`);
    }

    console.log('Result notification sent successfully:', smsResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Result notification sent successfully',
      smsResult
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in notify-result function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);