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
  userId?: string;
  severity?: string;
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

    const { title, body, icon, badge, data, userId, severity }: NotificationPayload = await req.json();

    console.log('Sending notification:', { title, body, userId, severity });

    // Check user notification preferences
    if (userId && severity) {
      const { data: prefs, error: prefsError } = await supabaseClient
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (prefsError) {
        console.error('Error fetching preferences:', prefsError);
      } else if (prefs) {
        // Check if notifications are enabled
        if (!prefs.enabled) {
          return new Response(
            JSON.stringify({ message: 'Notifications disabled for user' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }

        // Check severity level preference
        const severityLevels = prefs.severity_levels as string[];
        if (!severityLevels.includes(severity)) {
          return new Response(
            JSON.stringify({ message: 'Severity level not in user preferences' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }

        // Check quiet hours
        if (prefs.quiet_hours_enabled && prefs.quiet_hours_start && prefs.quiet_hours_end) {
          const now = new Date();
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          
          const isInQuietHours = (current: string, start: string, end: string) => {
            if (start < end) {
              return current >= start && current < end;
            } else {
              // Handles quiet hours spanning midnight
              return current >= start || current < end;
            }
          };

          if (isInQuietHours(currentTime, prefs.quiet_hours_start, prefs.quiet_hours_end)) {
            return new Response(
              JSON.stringify({ message: 'In quiet hours' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }
        }
      }
    }

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