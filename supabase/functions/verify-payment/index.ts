import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reference, userId } = await req.json()

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const verificationData = await verificationResponse.json()

    if (!verificationData.status || verificationData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const paymentData = verificationData.data
    const amount = paymentData.amount / 100 // Convert from kobo to naira
    const planType = paymentData.metadata?.plan_type || 'premium'

    // Find the user in our database
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the appropriate subscription plan
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('name', planType === 'premium' ? 'Premium Plan' : 'Basic Plan')
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      console.error('Plan not found:', planError)
      return new Response(
        JSON.stringify({ error: 'Subscription plan not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: 'NGN',
        status: 'SUCCESS',
        gateway: 'paystack',
        gateway_reference: reference,
        payment_method: paymentData.channel,
        metadata: {
          plan_type: planType,
          customer_email: paymentData.customer.email,
          fees: paymentData.fees,
        }
      })

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError)
    }

    // Deactivate existing active subscriptions
    const { error: deactivateError } = await supabaseClient
      .from('subscriptions')
      .update({ status: 'EXPIRED' })
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')

    if (deactivateError) {
      console.error('Failed to deactivate existing subscriptions:', deactivateError)
    }

    // Create new subscription
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000))

    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: 'ACTIVE',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_reference: reference,
        auto_renew: false
      })

    if (subscriptionError) {
      console.error('Failed to create subscription:', subscriptionError)
      return new Response(
        JSON.stringify({ error: 'Failed to activate subscription' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create success notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Payment Successful',
        message: `Your ${plan.name} subscription has been activated successfully!`,
        type: 'success',
        metadata: {
          payment_reference: reference,
          amount: amount,
          plan_name: plan.name
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        amount: amount,
        plan_name: plan.name,
        reference: reference,
        subscription_end_date: endDate.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})