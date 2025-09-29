/*
  # User Connections System

  1. New Tables
    - `user_connections`
      - `id` (uuid, primary key)
      - `user_id_1` (uuid, foreign key to auth.users)
      - `user_id_2` (uuid, foreign key to auth.users)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on user_connections table
    - Add policies for authenticated users to manage connections
    - Prevent duplicate connection requests

  3. Constraints
    - Unique constraint on (user_id_1, user_id_2)
    - Check constraint to prevent self-connections
*/

-- Create user_connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 != user_id_2)
);

-- Enable RLS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Policies for user_connections
CREATE POLICY "Users can view connections they are part of"
  ON user_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create connection requests"
  ON user_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can update connections they are part of"
  ON user_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete connections they are part of"
  ON user_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON user_connections
    FOR EACH ROW
    EXECUTE FUNCTION handle_connections_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id_1 ON user_connections(user_id_1);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id_2 ON user_connections(user_id_2);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);