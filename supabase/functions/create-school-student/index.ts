import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { schoolId, fullName, classLevel } = await req.json();

    if (!schoolId || !fullName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the requesting user is the school admin
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('admin_user_id, users!schools_admin_user_id_fkey(auth_user_id)')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return new Response(
        JSON.stringify({ error: 'School not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the requesting user is the school admin
    const schoolAdminAuthId = (school as any).users?.auth_user_id;
    if (schoolAdminAuthId !== authUser.id) {
      return new Response(
        JSON.stringify({ error: 'Only school admin can add students' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate credentials
    const cleanName = fullName.toLowerCase().replace(/\s+/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${cleanName}${randomNum}`;
    const password = `edura${randomNum}`;
    const email = `${username}@${schoolId}.edu.ng`;

    // Create auth user (bypass email verification)
    const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'school_student',
        school_id: schoolId,
      }
    });

    if (createAuthError || !newAuthUser.user) {
      console.error('Error creating auth user:', createAuthError);
      return new Response(
        JSON.stringify({ error: createAuthError?.message || 'Failed to create auth user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create users record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: newAuthUser.user.id,
        email: email,
        first_name: fullName.split(' ')[0],
        last_name: fullName.split(' ').slice(1).join(' ') || fullName.split(' ')[0],
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('Error creating user record:', userError);
      // Cleanup: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create user record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create school_students record
    const { error: studentError } = await supabaseAdmin
      .from('school_students')
      .insert({
        school_id: schoolId,
        user_id: userData.id,
        student_username: username,
        student_password_hash: password,
        full_name: fullName,
        class_level: classLevel || null,
        is_active: true,
      });

    if (studentError) {
      console.error('Error creating school student record:', studentError);
      // Cleanup: delete user and auth user
      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create student record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign school_student role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newAuthUser.user.id,
        role: 'school_student'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Non-critical, continue
    }

    // Increment students count
    const { error: incrementError } = await supabaseAdmin.rpc('increment_students_added', {
      school_id_param: schoolId
    });

    if (incrementError) {
      console.error('Error incrementing students count:', incrementError);
      // Non-critical, continue
    }

    console.log(`Student created successfully: ${username}`);

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          username,
          password,
          email,
        },
        student: {
          id: userData.id,
          fullName,
          classLevel,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});