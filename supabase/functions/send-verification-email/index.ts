import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import React from "https://esm.sh/react@18.3.1";
import { VerificationEmail } from "./_templates/verification-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Edura <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    console.log("Processing email verification request...");

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verify webhook signature if secret is configured
    let emailData: any;
    if (hookSecret) {
      try {
        const wh = new Webhook(hookSecret);
        const verified = wh.verify(payload, headers) as {
          user: { email: string };
          email_data: {
            token: string;
            token_hash: string;
            redirect_to: string;
            email_action_type: string;
          };
        };
        emailData = verified;
      } catch (err) {
        console.error("Webhook verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // For testing without webhook secret
      emailData = JSON.parse(payload);
    }

    const { user, email_data } = emailData;
    const { token_hash, redirect_to, email_action_type } = email_data;

    console.log(`Sending ${email_action_type} email to ${user.email}`);

    // Render email template
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        token_hash,
        email_action_type,
        redirect_to: redirect_to || `${Deno.env.get("SUPABASE_URL")}/`,
        supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
      })
    );

    // Determine subject based on action type
    let subject = "Verify your Edura account";
    if (email_action_type === "recovery") {
      subject = "Reset your Edura password";
    } else if (email_action_type === "email_change") {
      subject = "Confirm your new email address";
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
