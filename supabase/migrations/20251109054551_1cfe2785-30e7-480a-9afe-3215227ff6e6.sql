-- Create table for push notification subscriptions
CREATE TABLE public.notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

-- Enable RLS
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.notification_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.notification_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
ON public.notification_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.notification_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for user_id lookups
CREATE INDEX idx_notification_subscriptions_user_id ON public.notification_subscriptions(user_id);