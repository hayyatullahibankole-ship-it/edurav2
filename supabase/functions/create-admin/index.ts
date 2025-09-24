import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAdminRequest {
  token: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the admin creation token from secrets
    const ADMIN_CREATION_TOKEN = Deno.env.get('ADMIN_CREATION_TOKEN')
    
    if (!ADMIN_CREATION_TOKEN) {
      console.error('ADMIN_CREATION_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: CreateAdminRequest = await req.json()
    
    // Validate required fields
    if (!body.token || !body.email || !body.password || !body.firstName || !body.lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate admin creation token
    if (body.token !== ADMIN_CREATION_TOKEN) {
      console.log('Invalid admin creation token provided')
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate password strength
    if (body.password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let userData;
    let isNewUser = false;

    // Try to create new auth user first
    try {
      const { data: newUserData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          first_name: body.firstName,
          last_name: body.lastName,
          phone: body.phone || '',
          created_by_admin: true
        }
      });

      if (userError) {
        if (userError.message.includes('already registered')) {
          console.log(`User with email ${body.email} already exists, will update profile/role`);
          
          // Get existing user by email
          const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (listError) {
            console.error('Error listing users:', listError);
            return new Response(
              JSON.stringify({ error: 'Failed to check existing users' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          const existingUser = existingUsers.users.find(u => u.email === body.email);
          if (!existingUser) {
            return new Response(
              JSON.stringify({ error: 'User lookup failed' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          userData = { user: existingUser };
        } else {
          throw userError;
        }
      } else {
        userData = newUserData;
        isNewUser = true;
        console.log(`Created new auth user for ${body.email}`);
      }
    } catch (error) {
      console.error('Error with user creation/lookup:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process admin account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to process user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user profile exists
    let userProfile;
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', userData.user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking user profile:', profileCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!existingProfile) {
      // Create user profile
      console.log(`Creating profile for user ${body.email}`);
      const { data: newProfile, error: createProfileError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_user_id: userData.user.id,
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          phone: body.phone || null
        })
        .select('id')
        .single();

      if (createProfileError) {
        console.error('Error creating user profile:', createProfileError);
        
        // Clean up auth user if it was newly created
        if (isNewUser) {
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      userProfile = newProfile;
    } else {
      userProfile = existingProfile;
      console.log(`Using existing profile for user ${body.email}`);
    }

    // Check if admin role exists
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userProfile.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking admin role:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to check admin role' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!existingRole) {
      // Assign admin role
      console.log(`Assigning admin role to user ${body.email}`);
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userProfile.id,
          role: 'admin',
          assigned_by: null // System assigned
        })

      if (roleError) {
        console.error('Error assigning admin role:', roleError)
        
        // Clean up if this was a new user creation
        if (isNewUser) {
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to assign admin privileges' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    const messageText = isNewUser 
      ? `New admin account created successfully for ${body.email}`
      : existingRole 
        ? `User ${body.email} already has admin privileges`
        : `Admin privileges granted to existing user ${body.email}`;
    
    console.log(messageText);
    
    return new Response(
      JSON.stringify({ 
        message: messageText,
        user: {
          id: userData.user.id,
          email: userData.user.email
        }
      }),
      { 
        status: isNewUser || !existingRole ? 201 : 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})