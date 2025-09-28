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
    const { reference } = await req.json();
    
    console.log('Payment verification request for:', reference);

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

    // Get user by email from transaction
    const { data: users, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', transaction.customer.email)
      .single();

    if (userError || !users) {
      console.error('User not found:', transaction.customer.email);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: users.id,
        amount: transaction.amount / 100, // Convert from kobo to naira
        currency: transaction.currency,
        gateway: 'paystack',
        gateway_reference: reference,
        status: 'SUCCESS',
        payment_method: transaction.channel,
        metadata: {
          paystack_data: transaction,
          customer_code: transaction.customer.customer_code
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
            user_id: users.id,
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
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});