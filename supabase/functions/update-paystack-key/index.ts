import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publicKey } = await req.json();
    
    console.log('Updating Paystack public key');

    if (!publicKey || !publicKey.startsWith('pk_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Paystack public key format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Update the Paystack public key in system_settings
    const { error } = await supabaseClient
      .from('system_settings')
      .update({ value: publicKey })
      .eq('key', 'paystack_public_key');

    if (error) {
      console.error('Error updating Paystack key:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update Paystack key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Paystack public key updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Paystack public key updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update Paystack key error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});