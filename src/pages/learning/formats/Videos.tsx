import React, { useState, useEffect } from 'react';
import { Play, Clock, BookOpen, Search, Filter } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Course, Lesson } from '../../../lib/types';

const Videos = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchUserProgress();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('type', 'video')
        .order('order');

      if (error) throw error;
      setLessons(data || []);
      setSelectedLesson(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const updateProgress = async (lessonId: string, watchedDuration: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          lesson_id: lessonId,
          watched_duration: watchedDuration,
          last_watched_at: new Date().toISOString(),
          completed: watchedDuration >= 80 // Consider 80% as completed
        });

      if (error) throw error;
      fetchUserProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const getLessonProgress = (lessonId: string) => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress?.watched_duration || 0;
  };

  const categories = ['all', 'Front-End Development', 'Back-End Development', 'Data Science', 'AI/ML', 'Mobile Development'];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Video Lessons</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchCourses}
              className="btn-primary px-6"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-primary mb-6">Available Courses</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found</p>
              </div>
            ) : (
              courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full text-left rounded-lg transition-all duration-300 overflow-hidden ${
                    selectedCourse?.id === course.id
                      ? 'ring-2 ring-secondary'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-medium text-primary mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Video Player and Lessons */}
          <div className="lg:col-span-2">
            {selectedLesson && selectedCourse ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedLesson.youtube_url)}
                    title={selectedLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    onLoad={() => {
                      // Simulate watching progress
                      setTimeout(() => updateProgress(selectedLesson.id, 25), 5000);
                      setTimeout(() => updateProgress(selectedLesson.id, 50), 15000);
                      setTimeout(() => updateProgress(selectedLesson.id, 75), 25000);
                    }}
                  ></iframe>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedLesson.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getLessonProgress(selectedLesson.id)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${getLessonProgress(selectedLesson.id)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Lesson List */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Course Lessons</h3>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full p-4 rounded-lg transition-all duration-300 ${
                            selectedLesson.id === lesson.id
                              ? 'bg-secondary/10 border-secondary'
                              : 'bg-gray-50 hover:bg-gray-100'
                          } border-2`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-secondary/20 rounded-full text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center space-x-2">
                                  <Play className="w-4 h-4 text-secondary" />
                                  <span className="font-medium">{lesson.title}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                  <span>•</span>
                                  <span>{getLessonProgress(lesson.id)}% complete</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <div
                                className="w-6 h-6 bg-secondary rounded-full"
                                style={{
                                  background: `conic-gradient(#1ABC9C ${getLessonProgress(lesson.id) * 3.6}deg, #e5e7eb 0deg)`
                                }}
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Select a Course
                </h3>
                <p className="text-gray-600">
                  Choose a course from the list to start learning with video lessons
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;