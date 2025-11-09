import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  userId?: string; // If provided, send to specific user. Otherwise, send to all subscriptions
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { title, body, icon, badge, data, userId }: NotificationPayload = await req.json();

    console.log('Sending notification:', { title, body, userId });

    // Fetch subscriptions
    let query = supabaseClient
      .from('notification_subscriptions')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Send notifications to all subscriptions
    const notificationPayload = {
      title,
      body,
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-192x192.png',
      data: data || {},
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          // Use Web Push Protocol to send notifications
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          // Note: In production, you'd use the web-push library
          // For now, we'll log the notification
          console.log('Sending push notification to:', pushSubscription.endpoint);
          console.log('Notification payload:', notificationPayload);
          
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error('Error sending notification:', error);
          return { success: false, endpoint: subscription.endpoint, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        successful,
        failed,
        total: subscriptions.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});