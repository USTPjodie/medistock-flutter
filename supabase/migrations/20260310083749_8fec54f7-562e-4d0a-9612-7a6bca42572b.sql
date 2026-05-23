
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.dose_status AS ENUM ('taken', 'missed', 'pending', 'skipped', 'upcoming');
CREATE TYPE public.notification_type AS ENUM ('missed_dose', 'low_stock', 'system', 'high_risk');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE(user_id, role)
);

-- Create devices table
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Dispenser',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compartments table
CREATE TABLE public.compartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  index INT NOT NULL,
  current_count INT NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 30,
  medication_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_id, index)
);

-- Create medication_schedule table
CREATE TABLE public.medication_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  compartment_id UUID REFERENCES public.compartments(id) ON DELETE SET NULL,
  dose_time TIME NOT NULL,
  days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '1 pill',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dose_events table
CREATE TABLE public.dose_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.medication_schedule(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_taken_time TIMESTAMP WITH TIME ZONE,
  status dose_status NOT NULL DEFAULT 'pending',
  missed_retries INT NOT NULL DEFAULT 0,
  escalated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_receive_notifications BOOLEAN NOT NULL DEFAULT true,
  can_view_dashboard BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user has access to a device (owner or family member)
CREATE OR REPLACE FUNCTION public.has_device_access(_user_id UUID, _device_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.devices WHERE id = _device_id AND owner_id = _user_id
    UNION ALL
    SELECT 1 FROM public.family_members WHERE device_id = _device_id AND user_id = _user_id AND can_view_dashboard = true
  )
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Devices RLS
CREATE POLICY "Users can view accessible devices" ON public.devices FOR SELECT USING (public.has_device_access(auth.uid(), id));
CREATE POLICY "Users can create devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update devices" ON public.devices FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete devices" ON public.devices FOR DELETE USING (auth.uid() = owner_id);

-- Compartments RLS
CREATE POLICY "Users can view compartments of accessible devices" ON public.compartments FOR SELECT USING (public.has_device_access(auth.uid(), device_id));
CREATE POLICY "Owners can insert compartments" ON public.compartments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update compartments" ON public.compartments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete compartments" ON public.compartments FOR DELETE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));

-- Medication schedule RLS
CREATE POLICY "Users can view schedules of accessible devices" ON public.medication_schedule FOR SELECT USING (public.has_device_access(auth.uid(), device_id));
CREATE POLICY "Owners can insert schedules" ON public.medication_schedule FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update schedules" ON public.medication_schedule FOR UPDATE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete schedules" ON public.medication_schedule FOR DELETE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));

-- Dose events RLS
CREATE POLICY "Users can view dose events of accessible devices" ON public.dose_events FOR SELECT USING (public.has_device_access(auth.uid(), device_id));
CREATE POLICY "Owners can insert dose events" ON public.dose_events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update dose events" ON public.dose_events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Family members RLS
CREATE POLICY "Users can view family members of accessible devices" ON public.family_members FOR SELECT USING (public.has_device_access(auth.uid(), device_id));
CREATE POLICY "Owners can insert family members" ON public.family_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update family members" ON public.family_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete family members" ON public.family_members FOR DELETE USING (EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND owner_id = auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compartments_updated_at BEFORE UPDATE ON public.compartments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medication_schedule_updated_at BEFORE UPDATE ON public.medication_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dose_events_updated_at BEFORE UPDATE ON public.dose_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.dose_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compartments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
