-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- Storage policies
CREATE POLICY "Public can view site images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-images' AND 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update site images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'site-images' AND 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete site images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-images' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Create site_content table for editable content
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content
CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Only admins can modify site content
CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create attractions table for manageable attractions
CREATE TABLE public.attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;

-- Everyone can view active attractions
CREATE POLICY "Anyone can view active attractions"
  ON public.attractions FOR SELECT
  USING (is_active = true);

-- Admins can view all attractions
CREATE POLICY "Admins can view all attractions"
  ON public.attractions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can modify attractions
CREATE POLICY "Admins can insert attractions"
  ON public.attractions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update attractions"
  ON public.attractions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete attractions"
  ON public.attractions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for attractions
CREATE TRIGGER update_attractions_updated_at
  BEFORE UPDATE ON public.attractions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default site content
INSERT INTO public.site_content (section, content) VALUES
('hero', '{"title": "Discover the Power & Beauty of Murchison Falls", "subtitle": "Experience wildlife, adventure, and the breathtaking Nile as it plunges through the world''s most powerful waterfall", "ctaText": "Plan Your Visit"}'),
('contact', '{"title": "Contact the Park Manager", "address": "Murchison Falls National Park, Northern Uganda", "phone": "+256 785393756", "email": "tugumesyson76@gmail.com", "hours": "Open daily: 6:00 AM - 6:00 PM"}');

-- Insert default attractions
INSERT INTO public.attractions (title, description, display_order) VALUES
('Murchison Falls', 'Witness the mighty Nile River forced through a 7-meter gap before plunging 43 meters with thunderous power.', 1),
('Game Drives', 'Spot lions, elephants, giraffes, antelopes, and buffalo on an exciting safari drive through the savannah.', 2),
('Boat Safaris', 'Cruise the Nile to see hippos, crocodiles, and numerous bird species with the falls as your backdrop.', 3),
('Bird Watching', 'Discover over 450 bird species including the rare shoebill stork, African fish eagle, and kingfishers.', 4),
('Chimpanzee Trekking', 'Explore Budongo Forest to observe chimpanzees and other primates in their natural habitat.', 5);