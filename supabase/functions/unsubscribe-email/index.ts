import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const emailType = url.searchParams.get('type') || 'all';

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unsubscribe token is required' }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`📭 Processing unsubscribe request for token: ${token.substring(0, 10)}...`);

    // Find user by unsubscribe token
    const { data: prefs, error: findError } = await supabase
      .from('email_preferences')
      .select('user_id, welcome_emails, subscription_reminders, marketing_emails, product_updates')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !prefs) {
      console.error('Invalid token:', findError);
      return new Response(
        JSON.stringify({ error: 'Invalid unsubscribe token' }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Update preferences based on type
    const updates: Record<string, boolean> = {};
    
    switch (emailType) {
      case 'welcome':
        updates.welcome_emails = false;
        break;
      case 'subscription_reminder':
        updates.subscription_reminders = false;
        break;
      case 'marketing':
        updates.marketing_emails = false;
        break;
      case 'product_update':
        updates.product_updates = false;
        break;
      case 'all':
      default:
        updates.welcome_emails = false;
        updates.subscription_reminders = false;
        updates.marketing_emails = false;
        updates.product_updates = false;
    }

    const { error: updateError } = await supabase
      .from('email_preferences')
      .update(updates)
      .eq('user_id', prefs.user_id);

    if (updateError) {
      throw updateError;
    }

    // Log the unsubscribe event
    await supabase.rpc('log_security_event', {
      action_type: 'EMAIL_UNSUBSCRIBE',
      target_type: 'email_preferences',
      target_id: prefs.user_id,
      details: { 
        email_type: emailType,
        updates 
      }
    });

    console.log(`✅ Unsubscribed user from ${emailType} emails`);

    // Return HTML success page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - Edura</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #1e40af 0%, #059669 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 48px;
              border-radius: 16px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              text-align: center;
            }
            h1 {
              color: #111827;
              font-size: 32px;
              margin: 0 0 16px 0;
            }
            p {
              color: #6b7280;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 24px 0;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1e40af 0%, #059669 100%);
              color: white;
              padding: 12px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 16px;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footnote {
              font-size: 14px;
              color: #9ca3af;
              margin-top: 32px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You've been unsubscribed from ${emailType === 'all' ? 'all email notifications' : emailType + ' emails'}.</p>
            <p>You can update your email preferences anytime from your dashboard.</p>
            <a href="${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/dashboard" class="button">
              Go to Dashboard
            </a>
            <p class="footnote">
              © ${new Date().getFullYear()} Edura. All rights reserved.
            </p>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in unsubscribe-email function:", error);
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