-- Create tour packages table for managing tour categories and pricing
CREATE TABLE public.tour_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_per_person DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_packages
CREATE POLICY "Anyone can view active tour packages"
  ON public.tour_packages
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tour packages"
  ON public.tour_packages
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tour packages"
  ON public.tour_packages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tour packages"
  ON public.tour_packages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add price column to tour_bookings
ALTER TABLE public.tour_bookings
ADD COLUMN price_per_person DECIMAL(10, 2);

-- Add trigger for tour_packages updated_at
CREATE TRIGGER update_tour_packages_updated_at
  BEFORE UPDATE ON public.tour_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert some default tour packages
INSERT INTO public.tour_packages (name, description, price_per_person, display_order) VALUES
  ('Game Drive Safari', 'Experience wildlife viewing in open savannah vehicles', 150.00, 1),
  ('Boat Safari', 'Explore waterways and see aquatic wildlife', 120.00, 2),
  ('Chimpanzee Tracking', 'Trek through forests to observe chimpanzees', 200.00, 3),
  ('Bird Watching Tour', 'Guided tour for bird enthusiasts', 80.00, 4),
  ('Murchison Falls Hike', 'Hike to the top of the spectacular falls', 100.00, 5);