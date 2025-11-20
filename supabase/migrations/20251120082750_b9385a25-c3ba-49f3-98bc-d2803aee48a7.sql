-- Fix Critical Security Issues

-- 1. Make user_id required and enforce authentication for bookings
ALTER TABLE tour_bookings ALTER COLUMN user_id SET NOT NULL;

-- 2. Drop the unsafe RLS policy that allows anyone to create bookings
DROP POLICY IF EXISTS "Users can create bookings" ON tour_bookings;

-- 3. Create a secure policy that requires authentication
CREATE POLICY "Authenticated users can create their own bookings"
ON tour_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Make storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE name = 'site-images';

-- 5. Create RLS policies for storage bucket - only authenticated users can upload
CREATE POLICY "Authenticated users can upload booking photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' 
  AND auth.uid() IS NOT NULL
);

-- 6. Allow users to view their own uploaded photos
CREATE POLICY "Users can view booking photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'site-images');

-- 7. Allow admins to view all photos
CREATE POLICY "Admins can view all photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 8. Allow admins to delete photos
CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);