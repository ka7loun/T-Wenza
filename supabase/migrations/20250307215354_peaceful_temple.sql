/*
  # Fix Course RLS Policies

  1. Security
    - Add user_id column if not exists
    - Enable RLS if not already enabled
    - Add policies for CRUD operations if they don't exist
    
  2. Changes
    - Safe column addition with IF NOT EXISTS
    - Safe policy creation with DO blocks
*/

-- Add user_id column to courses table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE courses 
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$ 
BEGIN
  -- View policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Courses are viewable by everyone'
  ) THEN
    CREATE POLICY "Courses are viewable by everyone"
    ON courses
    FOR SELECT
    USING (true);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Users can create their own courses'
  ) THEN
    CREATE POLICY "Users can create their own courses"
    ON courses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Users can update their own courses'
  ) THEN
    CREATE POLICY "Users can update their own courses"
    ON courses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Users can delete their own courses'
  ) THEN
    CREATE POLICY "Users can delete their own courses"
    ON courses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;