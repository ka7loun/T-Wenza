/*
  # Add file support to lessons table

  1. Changes
    - Add `file_path` column to store uploaded file paths
    - Add `type` column to specify lesson format (video, pdf, audio, etc.)
    - Make `youtube_url` optional since we now support other formats
    - Update existing lessons to have proper type

  2. Security
    - No RLS changes needed as existing policies cover new columns
*/

-- Add new columns to lessons table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' 
    AND column_name = 'file_path'
  ) THEN
    ALTER TABLE lessons ADD COLUMN file_path TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE lessons ADD COLUMN type TEXT DEFAULT 'video';
  END IF;
END $$;

-- Make youtube_url optional since we now support other formats
ALTER TABLE lessons ALTER COLUMN youtube_url DROP NOT NULL;

-- Update existing lessons to have proper type
UPDATE lessons SET type = 'video' WHERE type IS NULL;