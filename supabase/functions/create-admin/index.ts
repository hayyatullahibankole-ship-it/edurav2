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
    const { email, password, first_name, last_name, token } = await req.json();
    
    console.log('Admin creation request for:', email);

    // Validate admin creation token
    const expectedToken = Deno.env.get('ADMIN_CREATION_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin creation token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    if (!email || !password || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user with admin role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name,
        last_name,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The user profile and role assignment will be handled by database triggers
    console.log('Admin user created successfully:', authData.user?.id);

    // Log admin creation action
    if (authData.user?.id) {
      const { error: logError } = await supabaseAdmin
        .rpc('log_admin_action', {
          action_type: 'admin_created',
          admin_id: authData.user.id,
          target_id: authData.user.id
        });

      if (logError) {
        console.error('Error logging admin creation:', logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Admin account created successfully',
        user_id: authData.user?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create admin error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});