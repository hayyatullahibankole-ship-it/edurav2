import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageRequest {
  userId: string;
  subject: string;
  message: string;
  type: 'email' | 'whatsapp' | 'both';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, subject, message, type }: MessageRequest = await req.json();

    console.log('Sending message to user:', userId, 'Type:', type);

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email, phone')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const results: any = {
      email: null,
      whatsapp: null
    };

    // Send Email
    if (type === 'email' || type === 'both') {
      try {
        const emailResponse = await resend.emails.send({
          from: "Edura <onboarding@resend.dev>",
          to: [userData.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af 0%, #059669 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Edura</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #111827; margin-bottom: 20px;">Hello ${userData.first_name},</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  This is an official communication from the Edura team.
                </p>
              </div>
              <div style="background-color: #111827; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2025 Edura. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });

        console.log("Email sent successfully:", emailResponse);
        results.email = { success: true, id: emailResponse.id };
      } catch (emailError: any) {
        console.error("Email sending failed:", emailError);
        results.email = { success: false, error: emailError.message };
      }
    }

    // Send WhatsApp (placeholder - requires WhatsApp Business API)
    if (type === 'whatsapp' || type === 'both') {
      if (userData.phone) {
        // Note: You'll need to implement actual WhatsApp Business API integration
        // For now, this is a placeholder
        console.log('WhatsApp message would be sent to:', userData.phone);
        results.whatsapp = { 
          success: false, 
          error: 'WhatsApp Business API not configured. Contact support to enable.' 
        };
      } else {
        results.whatsapp = { 
          success: false, 
          error: 'User has no phone number on file' 
        };
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-customer-message function:", error);
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
