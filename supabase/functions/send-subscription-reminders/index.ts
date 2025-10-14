import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Edura <onboarding@resend.dev>';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createReminderEmailHtml = (firstName: string, planName: string, endDate: string, renewalPrice: string, manageUrl: string, unsubscribeToken?: string) => {
  const unsubscribeUrl = unsubscribeToken 
    ? `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com')}/unsubscribe?token=${unsubscribeToken}`
    : null;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #059669 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .content h2 { color: #111827; margin: 0 0 20px 0; font-size: 24px; }
          .message-box { background: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 30px; line-height: 1.6; color: #374151; }
          .info-box { 
            background: #eff6ff; 
            border-left: 4px solid #1e40af; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
          }
          .info-box h3 { color: #1e40af; margin: 0 0 10px 0; font-size: 18px; }
          .info-box p { margin: 5px 0; color: #374151; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1e40af 0%, #059669 100%); 
            color: white; 
            padding: 16px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 20px 0;
          }
          .cta-button:hover { opacity: 0.9; }
          .footer { background-color: #111827; padding: 24px 30px; text-align: center; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          .highlight { color: #1e40af; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Subscription Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <div class="message-box">
              <p>This is a friendly reminder about your <strong>Edura ${planName}</strong> subscription.</p>
              <p>Your learning journey continues, and we want to make sure you never miss a moment!</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Subscription Details</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Renewal Date:</strong> ${endDate}</p>
              <p><strong>Amount:</strong> ${renewalPrice}</p>
              <p><strong>Status:</strong> Active</p>
            </div>

            <div class="message-box">
              <p><strong>What's included in your subscription:</strong></p>
              <ul style="margin: 15px 0; padding-left: 20px; color: #374151;">
                <li>Unlimited practice tests</li>
                <li>Advanced analytics & progress tracking</li>
                <li>Premium study materials & video lessons</li>
                <li>Priority support</li>
                <li>Downloadable resources</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${manageUrl}" class="cta-button">Manage Subscription</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              Your subscription will automatically renew on <span class="highlight">${endDate}</span>. 
              If you wish to make changes, click the button above.
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
              Thank you for being a valued member of the Edura community! 🎓
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edura. All rights reserved.</p>
            <p style="margin-top: 10px;">Need help? Contact us at support@edura.space</p>
            ${unsubscribeUrl ? `<p style="margin-top: 15px;"><a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Unsubscribe from these emails</a></p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Fetching users with active monthly subscriptions...');

    // Query for users with active monthly subscriptions (30 days duration)
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        end_date,
        users!inner (
          id,
          first_name,
          last_name,
          email
        ),
        subscription_plans!inner (
          name,
          price,
          currency,
          duration_days
        )
      `)
      .eq('status', 'ACTIVE')
      .eq('subscription_plans.duration_days', 30)
      .gt('end_date', new Date().toISOString())
      .lt('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // Ending within next 7 days

    if (subsError) {
      throw new Error(`Failed to fetch subscriptions: ${subsError.message}`);
    }

    console.log(`📧 Found ${subscriptions?.length || 0} users to notify`);

    const results = {
      total: subscriptions?.length || 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No monthly subscriptions due for renewal reminder');
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send reminder emails
    for (const subscription of subscriptions) {
      const user = Array.isArray(subscription.users) ? subscription.users[0] : subscription.users;
      const plan = Array.isArray(subscription.subscription_plans) ? subscription.subscription_plans[0] : subscription.subscription_plans;

      if (!user || !user.email) {
        results.failed++;
        results.errors.push(`User (ID: ${subscription.user_id}): No email address`);
        continue;
      }

      if (!plan) {
        results.failed++;
        results.errors.push(`${user.email}: No plan information`);
        continue;
      }

      try {
        // Check email rate limit
        const { data: rateLimitOk } = await supabase.rpc('check_email_rate_limit', {
          recipient_email: user.email
        });
        
        if (!rateLimitOk) {
          console.warn(`⚠️ Rate limit exceeded for ${user.email}`);
          results.failed++;
          results.errors.push(`${user.email}: Rate limit exceeded`);
          continue;
        }

        // Check if user wants subscription reminders
        const { data: canSend } = await supabase.rpc('can_send_email', {
          target_user_id: subscription.user_id,
          email_type: 'subscription_reminder'
        });
        
        if (canSend === false) {
          console.log(`📭 User ${user.email} has unsubscribed from reminders`);
          continue;
        }

        // Get unsubscribe token
        const { data: prefs } = await supabase
          .from('email_preferences')
          .select('unsubscribe_token')
          .eq('user_id', subscription.user_id)
          .single();

        const firstName = user.first_name || 'there';
        const endDate = new Date(subscription.end_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const renewalPrice = `${plan.currency} ${Number(plan.price).toLocaleString()}`;
        const manageUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/dashboard` || 'https://edura.space/dashboard';

        const emailHtml = createReminderEmailHtml(
          firstName,
          plan.name,
          endDate,
          renewalPrice,
          manageUrl,
          prefs?.unsubscribe_token
        );

        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [user.email],
          subject: `📅 Your ${plan.name} Subscription Renewal Reminder`,
          html: emailHtml,
        });

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        // Log successful delivery
        await supabase.from('email_delivery_log').insert({
          user_id: subscription.user_id,
          recipient_email: user.email,
          email_type: 'subscription_reminder',
          subject: `📅 Your ${plan.name} Subscription Renewal Reminder`,
          status: 'sent',
          provider_message_id: emailResponse.data?.id,
          sent_at: new Date().toISOString()
        });

        // Log for rate limiting
        await supabase.rpc('log_security_event', {
          action_type: 'EMAIL_SENT',
          target_type: 'email',
          target_id: subscription.user_id,
          details: { recipient: user.email, type: 'subscription_reminder' }
        });

        console.log(`✅ Reminder sent to ${user.email}`);
        results.sent++;
      } catch (emailError: any) {
        console.error(`❌ Failed to send to ${user.email}:`, emailError);
        results.failed++;
        results.errors.push(`${user.email}: ${emailError.message}`);
        
        // Log failed delivery
        try {
          await supabase.from('email_delivery_log').insert({
            user_id: subscription.user_id,
            recipient_email: user.email,
            email_type: 'subscription_reminder',
            status: 'failed',
            error_message: emailError.message
          });
        } catch (logError) {
          console.error("Failed to log error:", logError);
        }
      }
    }

    console.log(`📊 Summary: ${results.sent} sent, ${results.failed} failed`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-subscription-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
