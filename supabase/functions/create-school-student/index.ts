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
    const { schoolCode, fullName, classLevel } = await req.json();

    if (!schoolCode || !fullName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find school by code
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, school_code, admin_user_id, users!schools_admin_user_id_fkey(auth_user_id)')
      .eq('school_code', schoolCode)
      .single();

    if (schoolError || !school) {
      return new Response(
        JSON.stringify({ error: 'School not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schoolId = school.id;

    // Check if the requesting user is the school admin
    const schoolAdminAuthId = (school as any).users?.auth_user_id;
    if (schoolAdminAuthId !== authUser.id) {
      return new Response(
        JSON.stringify({ error: 'Only school admin can add students' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanName = fullName.toLowerCase().replace(/\s+/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${cleanName}${randomNum}`;
    const password = `edura${randomNum}`;
    const email = `${username}@${schoolCode}.edu.ng`;

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

    // Wait briefly for trigger to complete, then fetch the user record
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let finalUserId: string;
    
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select()
      .eq('auth_user_id', newAuthUser.user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user record:', userError);
      // If user record doesn't exist, create it manually
      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_user_id: newAuthUser.user.id,
          email: email,
          first_name: fullName.split(' ')[0],
          last_name: fullName.split(' ').slice(1).join(' ') || fullName.split(' ')[0],
        })
        .select()
        .single();
      
      if (createError || !createdUser) {
        console.error('Error creating user record:', createError);
        // Cleanup: delete auth user
        await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create user record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      finalUserId = createdUser.id;
    } else {
      finalUserId = userData.id;
    }

    // Create school_students record
    const { error: studentError } = await supabaseAdmin
      .from('school_students')
      .insert({
        school_id: schoolId,
        user_id: finalUserId,
        student_username: username,
        student_password_hash: password,
        full_name: fullName,
        class_level: classLevel || null,
        is_active: true,
      });

    if (studentError) {
      console.error('Error creating school student record:', studentError);
      // Cleanup: delete user and auth user
      await supabaseAdmin.from('users').delete().eq('id', finalUserId);
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

    // Get school subscription end date to match student subscription
    const { data: schoolSub } = await supabaseAdmin
      .from('school_subscriptions')
      .select('end_date')
      .eq('school_id', schoolId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get pro plan ID
    const { data: proPlan } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Pro')
      .single();

    // Create active pro subscription for the student
    if (proPlan) {
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: finalUserId,
          plan_id: proPlan.id,
          status: 'ACTIVE',
          start_date: new Date().toISOString(),
          end_date: schoolSub?.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Match school sub or 1 year
          amount: 0, // Free for school students
          auto_renew: false
        });

      if (subError) {
        console.error('Error creating student subscription:', subError);
        // Non-critical, continue
      } else {
        console.log(`Pro subscription created for student: ${username}`);
      }
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
          id: finalUserId,
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