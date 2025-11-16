-- Link user_roles to profiles table instead of auth.users
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update tour_bookings table for photo upload and date range
ALTER TABLE public.tour_bookings
ADD COLUMN photo_url TEXT,
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Copy existing visit_date to start_date
UPDATE public.tour_bookings 
SET start_date = visit_date, end_date = visit_date 
WHERE start_date IS NULL;

-- Make start_date and end_date required
ALTER TABLE public.tour_bookings
ALTER COLUMN start_date SET NOT NULL,
ALTER COLUMN end_date SET NOT NULL;

-- Drop old visit_date column
ALTER TABLE public.tour_bookings
DROP COLUMN visit_date;

-- Create RLS policy for admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.tour_bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policy for admins to update bookings
CREATE POLICY "Admins can update bookings"
ON public.tour_bookings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policy for admins to delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.tour_bookings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add storage policies for booking photos
CREATE POLICY "Users can upload booking photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' 
  AND (storage.foldername(name))[1] = 'bookings'
);

CREATE POLICY "Anyone can view booking photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-images' AND (storage.foldername(name))[1] = 'bookings');