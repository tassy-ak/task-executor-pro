-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create threats table
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  destination_ip TEXT,
  description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  blocked BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create blocked_ips table
CREATE TABLE public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  threat_count INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for threats (authenticated users can view, only system can insert)
CREATE POLICY "Authenticated users can view threats"
  ON public.threats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert threats"
  ON public.threats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update threats"
  ON public.threats FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blocked_ips
CREATE POLICY "Authenticated users can view blocked IPs"
  ON public.blocked_ips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blocked IPs"
  ON public.blocked_ips FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update blocked IPs"
  ON public.blocked_ips FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_threats_source_ip ON public.threats(source_ip);
CREATE INDEX idx_threats_detected_at ON public.threats(detected_at DESC);
CREATE INDEX idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_status ON public.blocked_ips(status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);