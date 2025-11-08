-- Fix 1: Restrict threat intelligence to admins only
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can view threats" ON public.threats;
DROP POLICY IF EXISTS "Authenticated users can insert threats" ON public.threats;
DROP POLICY IF EXISTS "Authenticated users can view blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Authenticated users can insert blocked IPs" ON public.blocked_ips;

-- Create admin-only policies for threats
CREATE POLICY "Admins can view all threats"
ON public.threats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert threats"
ON public.threats
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only policies for blocked_ips
CREATE POLICY "Admins can view all blocked IPs"
ON public.blocked_ips
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocked IPs"
ON public.blocked_ips
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();