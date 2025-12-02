-- Make the site-images bucket public for display
UPDATE storage.buckets 
SET public = true 
WHERE id = 'site-images';

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;

-- Add RLS policies for the storage bucket
CREATE POLICY "Anyone can view site images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update site images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'site-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete site images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'site-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);