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
    const { reference, userId, schoolId } = await req.json();
    
    console.log('Payment verification request for:', reference, 'userId:', userId);

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
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

    // Get Paystack secret key from environment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentData = await paystackResponse.json();

    if (!paystackResponse.ok || !paymentData.status) {
      console.error('Payment verification failed:', paymentData);
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transaction = paymentData.data;

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return new Response(
        JSON.stringify({ 
          error: 'Payment not successful',
          status: transaction.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve user: prefer explicit userId (auth uid), fallback to Paystack email
    let userRecord: { id: string } | null = null;

    if (userId) {
      const { data: byAuth } = await supabaseClient
        .from('users')
        .select('id')
        .eq('auth_user_id', userId)
        .maybeSingle();
      if (byAuth) userRecord = byAuth as { id: string };
    }

    if (!userRecord) {
      const { data: byEmail } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', transaction.customer.email)
        .maybeSingle();
      if (byEmail) userRecord = byEmail as { id: string };
    }

    // Idempotency: if we already recorded this reference, ensure SUCCESS and return
    const { data: existingTx } = await supabaseClient
      .from('transactions')
      .select('id, status')
      .eq('gateway_reference', reference)
      .maybeSingle();

    if (existingTx) {
      if (existingTx.status !== 'SUCCESS') {
        await supabaseClient
          .from('transactions')
          .update({ status: 'SUCCESS', updated_at: new Date().toISOString() })
          .eq('id', existingTx.id);
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Payment already verified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: userRecord ? userRecord.id : null,
        amount: transaction.amount / 100, // Convert from kobo to naira
        currency: transaction.currency,
        gateway: 'paystack',
        gateway_reference: reference,
        status: 'SUCCESS',
        payment_method: transaction.channel,
        metadata: {
          paystack_data: transaction,
          customer_code: transaction.customer?.customer_code,
          customer_email: transaction.customer?.email,
          plan_type: transaction.metadata?.plan_type || null
        }
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to record transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If this is a subscription payment, activate the subscription
    if (transaction.metadata && transaction.metadata.subscription) {
      const planType = transaction.metadata.plan_type;
      
      // Check if this is a school subscription
      if (planType && planType.includes('School Subscription')) {
        console.log('Processing school subscription activation...');
        console.log('Transaction metadata:', transaction.metadata);
        
        // Prefer explicit school_id from metadata/body; fallback to admin profile mapping
        const metaSchoolId = transaction?.metadata?.school_id as string | undefined;
        let school: any = null;
        let schoolError: any = null;

        if (metaSchoolId || schoolId) {
          const targetId = metaSchoolId || schoolId;
          console.log('Looking up school by provided id:', targetId);
          const res = await supabaseClient
            .from('schools')
            .select('*')
            .eq('id', targetId)
            .maybeSingle();
          school = res.data;
          schoolError = res.error;
        } else {
          console.log('Looking up school by admin_user_id (profile id):', userRecord?.id);
          const res = await supabaseClient
            .from('schools')
            .select('*')
            .eq('admin_user_id', userRecord?.id)
            .maybeSingle();
          school = res.data;
          schoolError = res.error;
        }

        console.log('Found school:', school, 'Error:', schoolError);

        if (school) {
          // Calculate end date (3 months from now)
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);

          // Check if subscription already exists for this school
          const { data: existingSub } = await supabaseClient
            .from('school_subscriptions')
            .select('id, status, student_seats, total_amount')
            .eq('school_id', school.id)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const newSeats = parseInt(transaction.metadata.student_seats) || 50;
          const currentMaxStudents = school.max_students || 0;

          if (existingSub) {
            console.log('Updating existing subscription, adding', newSeats, 'seats to existing', existingSub.student_seats);
            // Add new seats to existing subscription
            const updatedSeats = (existingSub.student_seats || 0) + newSeats;
            await supabaseClient
              .from('school_subscriptions')
              .update({ 
                status: 'ACTIVE',
                student_seats: updatedSeats,
                total_amount: (existingSub.total_amount || 0) + (transaction.amount / 100),
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
              })
              .eq('id', existingSub.id);
          } else {
            console.log('Creating new school subscription...');
            // Create new school subscription - use profile ID not auth ID
            const { error: subError } = await supabaseClient
              .from('school_subscriptions')
              .insert({
                school_id: school.id,
                student_seats: newSeats,
                price_per_student: transaction.metadata.price_per_student || 1000,
                total_amount: transaction.amount / 100,
                status: 'ACTIVE',
                admin_user_id: userRecord?.id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                payment_reference: reference,
                auto_renew: false
              });

            if (subError) {
              console.error('Error creating school subscription:', subError);
            } else {
              console.log('School subscription created successfully');
            }
          }

          // Activate the school and ADD new seats to existing max_students
          const updatedMaxStudents = currentMaxStudents + newSeats;
          const { error: activateError } = await supabaseClient
            .from('schools')
            .update({ 
              is_active: true,
              max_students: updatedMaxStudents
            })
            .eq('id', school.id);
          
          if (activateError) {
            console.error('Error activating school:', activateError);
          } else {
            console.log('School activated successfully:', school.id);
          }
        } else {
          console.error('School not found for user:', userRecord?.id);
        }
      } else {
        // Regular user subscription
        // Get the subscription plan
        const { data: plan, error: planError } = await supabaseClient
          .from('subscription_plans')
          .select('id, duration_days')
          .eq('name', planType)
          .single();

        if (planError || !plan) {
          console.error('Subscription plan not found:', planType);
        } else {
          // Create or update subscription
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration_days);

          const { error: subscriptionError } = await supabaseClient
            .from('subscriptions')
            .insert({
              user_id: userRecord ? userRecord.id : null,
              plan_id: plan.id,
              status: 'ACTIVE',
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              payment_reference: reference,
              auto_renew: false
            });

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment verified successfully',
        amount: transaction.amount / 100,
        currency: transaction.currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side but return generic message
    console.error('Payment verification error:', error);
    
    // Return generic error without exposing internal details
    return new Response(
      JSON.stringify({ 
        error: 'Payment verification failed. Please contact support if this persists.',
        errorId: crypto.randomUUID() // For support tracking
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});