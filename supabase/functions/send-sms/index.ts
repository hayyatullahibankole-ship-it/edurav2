import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  type: 'test_reminder' | 'test_result' | 'study_tip' | 'custom';
  userId?: string;
  phone?: string;
  message?: string;
  attemptId?: string;
  scheduledTime?: string;
}

interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId, phone, message, attemptId }: SMSRequest = await req.json();

    let targetPhone = phone;
    let smsMessage = message;
    let userName = '';

    // If userId provided, get user info and check SMS preferences
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, phone, first_name, last_name')
        .eq('auth_user_id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      targetPhone = user.phone;
      userName = user.first_name || 'Student';

      // Check user SMS preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('sms_test_reminders, sms_results')
        .eq('user_id', user.id)
        .single();

      // Check if user has opted in for SMS notifications
      if (type === 'test_reminder' && !preferences?.sms_test_reminders) {
        console.log('User has disabled SMS test reminders');
        return new Response(
          JSON.stringify({ message: 'User has disabled SMS test reminders' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (type === 'test_result' && !preferences?.sms_results) {
        console.log('User has disabled SMS result notifications');
        return new Response(
          JSON.stringify({ message: 'User has disabled SMS result notifications' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Check if user has premium subscription for SMS
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(resource_access_level)')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .gte('end_date', new Date().toISOString())
        .single();

      if (!subscription || subscription.subscription_plans?.resource_access_level !== 'premium') {
        console.log('User does not have premium subscription for SMS');
        return new Response(
          JSON.stringify({ error: 'Premium subscription required for SMS notifications' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    if (!targetPhone) {
      throw new Error('No phone number provided');
    }

    // Generate message based on type
    if (!smsMessage) {
      switch (type) {
        case 'test_reminder':
          smsMessage = `Hi ${userName}! 📚 Your scheduled exam is coming up in 1 hour. Good luck! - Edura`;
          break;
        case 'test_result':
          if (attemptId) {
            // Get test results
            const { data: result } = await supabase
              .from('results')
              .select('percentage, total_questions, correct_answers')
              .eq('attempt_id', attemptId)
              .single();

            if (result) {
              smsMessage = `Hi ${userName}! 🎯 Your test results are ready: ${result.correct_answers}/${result.total_questions} (${result.percentage.toFixed(1)}%). View details in the app! - Edura`;
            } else {
              smsMessage = `Hi ${userName}! Your test results are now available in the app. Check your performance dashboard! - Edura`;
            }
          } else {
            smsMessage = `Hi ${userName}! Your test results are now available in the app. Check your performance dashboard! - Edura`;
          }
          break;
        case 'study_tip':
          const tips = [
            '📖 Consistency is key! Study a little bit every day rather than cramming.',
            '🧠 Take regular breaks while studying to improve retention.',
            '📝 Practice active recall by testing yourself without looking at notes.',
            '🎯 Focus on your weak areas to maximize improvement.',
            '⏰ Create a study schedule and stick to it for better results.'
          ];
          smsMessage = `Hi ${userName}! ${tips[Math.floor(Math.random() * tips.length)]} - Edura`;
          break;
        default:
          smsMessage = message || `Hi ${userName}! You have a notification from Edura. Check the app for details!`;
      }
    }

    // Format phone number (ensure it starts with +)
    if (!targetPhone.startsWith('+')) {
      // Assume Nigerian number if no country code
      if (targetPhone.startsWith('0')) {
        targetPhone = '+234' + targetPhone.slice(1);
      } else if (targetPhone.startsWith('234')) {
        targetPhone = '+' + targetPhone;
      } else {
        targetPhone = '+234' + targetPhone;
      }
    }

    console.log(`Sending SMS to ${targetPhone}: ${smsMessage}`);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', targetPhone);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', smsMessage);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const twilioResponse = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', twilioResponse);
      throw new Error(`Twilio error: ${twilioResponse.message || 'Unknown error'}`);
    }

    // Log SMS in database for tracking
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        action_type: 'SMS_SENT',
        target_type: 'notification',
        details: {
          type,
          phone: targetPhone,
          message: smsMessage,
          twilio_sid: twilioResponse.sid,
          status: twilioResponse.status,
          user_id: userId
        }
      });

    if (logError) {
      console.error('Failed to log SMS:', logError);
    }

    console.log('SMS sent successfully:', twilioResponse.sid);

    return new Response(JSON.stringify({
      success: true,
      message: 'SMS sent successfully',
      sid: twilioResponse.sid,
      status: twilioResponse.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-sms function:', error);
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