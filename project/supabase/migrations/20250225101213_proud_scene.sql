/*
  # Course Management System

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `thumbnail` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `youtube_url` (text)
      - `duration` (text)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `lesson_id` (uuid, foreign key)
      - `completed` (boolean)
      - `watched_duration` (integer)
      - `last_watched_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  youtube_url text NOT NULL,
  duration text,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  watched_duration integer DEFAULT 0,
  last_watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Courses are viewable by everyone"
  ON courses
  FOR SELECT
  TO public
  USING (true);

-- Policies for lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons
  FOR SELECT
  TO public
  USING (true);

-- Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data for front-end development course
DO $$
DECLARE
  course_id uuid;
BEGIN
  -- Insert course
  INSERT INTO courses (title, description, category, thumbnail)
  VALUES (
    'Complete Front-End Development Course',
    'Learn front-end development from scratch with HTML, CSS, JavaScript, and React',
    'Front-End Development',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80'
  ) RETURNING id INTO course_id;

  -- Insert lessons
  INSERT INTO lessons (course_id, title, description, youtube_url, duration, "order") VALUES
  (
    course_id,
    'Introduction to HTML',
    'Learn the basics of HTML and document structure',
    'https://www.youtube.com/watch?v=9He4UBLyk8Y',
    '15:30',
    1
  ),
  (
    course_id,
    'CSS Fundamentals',
    'Master CSS styling and layouts',
    'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    '20:45',
    2
  ),
  (
    course_id,
    'JavaScript Basics',
    'Get started with JavaScript programming',
    'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    '25:15',
    3
  );
END $$;