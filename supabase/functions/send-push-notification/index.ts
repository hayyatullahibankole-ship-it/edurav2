import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data } = await req.json() as NotificationPayload;

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's push token and preferences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('push_token, push_notifications_enabled')
      .eq('user_id', user.id)
      .single();

    if (prefError || !preferences) {
      throw new Error('User preferences not found');
    }

    if (!preferences.push_notifications_enabled || !preferences.push_token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User has not enabled push notifications or no token found' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For FCM (Firebase Cloud Messaging) - Android
    const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
    
    if (FCM_SERVER_KEY && preferences.push_token) {
      const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${FCM_SERVER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: preferences.push_token,
          notification: {
            title,
            body,
            sound: 'default',
            badge: 1
          },
          data: data || {}
        })
      });

      const fcmResult = await fcmResponse.json();
      console.log('FCM Response:', fcmResult);
    }

    // For APNs (Apple Push Notification service) - iOS
    // You would need to set up APNs certificates and implement the sending logic here
    // This typically requires using Apple's HTTP/2 API with JWT authentication

    // Log notification sent
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message: body,
        type: 'push',
        metadata: data || {}
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Push notification sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
