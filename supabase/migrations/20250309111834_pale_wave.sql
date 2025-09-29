/*
  # Create storage bucket for course materials

  1. Storage
    - Create bucket 'course-materials' for storing course PDFs and other materials
    - Set up public access policies for authenticated users
    - Configure proper security settings

  2. Security
    - Allow authenticated users to upload files
    - Allow public access to read files
    - Restrict file types to PDFs
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'course-materials',
    'course-materials',
    true,
    5368709120, -- 5GB limit
    ARRAY['application/pdf']::text[]
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials' 
  AND owner = auth.uid()
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-materials' AND owner = auth.uid())
WITH CHECK (bucket_id = 'course-materials' AND owner = auth.uid());

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-materials' AND owner = auth.uid());

-- Allow public access to read files
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'course-materials');