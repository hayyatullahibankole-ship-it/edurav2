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

    console.log('Running daily SMS notifications check...');

    // Get all premium users who have SMS notifications enabled
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        first_name,
        phone,
        user_preferences!inner(sms_test_reminders, sms_results),
        subscriptions!inner(
          status,
          end_date,
          subscription_plans!inner(resource_access_level)
        )
      `)
      .eq('user_preferences.sms_test_reminders', true)
      .eq('subscriptions.status', 'ACTIVE')
      .eq('subscriptions.subscription_plans.resource_access_level', 'premium')
      .gte('subscriptions.end_date', new Date().toISOString());

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users eligible for SMS notifications`);

    const results = [];

    // Send study tips to premium users (3 times per week - Mon, Wed, Fri)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if ([1, 3, 5].includes(dayOfWeek)) { // Monday, Wednesday, Friday
      console.log('Sending study tips to premium users...');
      
      for (const user of users || []) {
        try {
          const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
            body: {
              type: 'study_tip',
              userId: user.auth_user_id
            }
          });

          if (smsError) {
            console.error(`Failed to send study tip to user ${user.id}:`, smsError);
            results.push({
              userId: user.id,
              type: 'study_tip',
              success: false,
              error: smsError.message
            });
          } else {
            console.log(`Study tip sent to user ${user.id}`);
            results.push({
              userId: user.id,
              type: 'study_tip',
              success: true,
              result: smsResult
            });
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error: any) {
          console.error(`Error sending study tip to user ${user.id}:`, error);
          results.push({
            userId: user.id,
            type: 'study_tip',
            success: false,
            error: error.message
          });
        }
      }
    }

    // Check for upcoming scheduled tests (this would require a bookings/scheduled tests table)
    // For now, we'll implement the basic framework
    console.log('Checking for upcoming test reminders...');

    // Send reminder notifications 24 hours before scheduled tests
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Get bookings scheduled for tomorrow
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        start_time,
        title,
        users(
          auth_user_id,
          first_name,
          user_preferences(sms_test_reminders)
        )
      `)
      .gte('start_time', tomorrow.toISOString())
      .lt('start_time', dayAfterTomorrow.toISOString())
      .eq('status', 'CONFIRMED')
      .eq('users.user_preferences.sms_test_reminders', true);

    if (!bookingsError && upcomingBookings) {
      console.log(`Found ${upcomingBookings.length} upcoming bookings for tomorrow`);
      
      for (const booking of upcomingBookings) {
        try {
          const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
            body: {
              type: 'test_reminder',
              userId: (booking as any).users?.auth_user_id,
              message: `Hi ${(booking as any).users?.first_name}! 📚 Your ${booking.title} session is scheduled for tomorrow at ${new Date(booking.start_time).toLocaleTimeString()}. Be prepared! - Edura`
            }
          });

          if (smsError) {
            console.error(`Failed to send reminder to user ${booking.user_id}:`, smsError);
            results.push({
              userId: booking.user_id,
              type: 'test_reminder',
              success: false,
              error: smsError.message
            });
          } else {
            console.log(`Test reminder sent to user ${booking.user_id}`);
            results.push({
              userId: booking.user_id,
              type: 'test_reminder',
              success: true,
              result: smsResult
            });
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error: any) {
          console.error(`Error sending reminder to user ${booking.user_id}:`, error);
          results.push({
            userId: booking.user_id,
            type: 'test_reminder',
            success: false,
            error: error.message
          });
        }
      }
    }

    const summary = {
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      studyTips: results.filter(r => r.type === 'study_tip').length,
      testReminders: results.filter(r => r.type === 'test_reminder').length
    };

    console.log('SMS notification check completed:', summary);

    return new Response(JSON.stringify({
      success: true,
      message: 'Daily SMS notifications processed',
      summary,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in daily-sms-notifications function:', error);
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