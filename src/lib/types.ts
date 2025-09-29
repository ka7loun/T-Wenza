export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_duration: number;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  university: string;
  major: string;
  graduation_year: number;
  interests: string[];
  skills: string[];
  avatar_url: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  created_at: string;
  updated_at: string;
}