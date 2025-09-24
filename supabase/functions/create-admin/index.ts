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

    // Create the admin user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email for admin accounts
      user_metadata: {
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone || '',
        created_by_admin: true
      }
    })

    if (userError) {
      console.error('Error creating user:', userError)
      return new Response(
        JSON.stringify({ 
          error: userError.message.includes('already registered') 
            ? 'An account with this email already exists'
            : 'Failed to create admin account'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the created user profile
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', userData.user.id)
      .single()

    if (!userProfile) {
      console.error('User profile not found after creation')
      return new Response(
        JSON.stringify({ error: 'User profile creation failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Assign admin role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userProfile.id,
        role: 'admin',
        assigned_by: null // System assigned
      })

    if (roleError) {
      console.error('Error assigning admin role:', roleError)
      
      // Clean up: delete the created user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to assign admin privileges' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Admin account created successfully for ${body.email}`)
    
    return new Response(
      JSON.stringify({ 
        message: 'Admin account created successfully',
        user: {
          id: userData.user.id,
          email: userData.user.email
        }
      }),
      { 
        status: 201, 
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