import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { aiService } from '../lib/ai';
import { v4 as uuidv4 } from 'uuid';
import { 
  BookOpen, Target, Award, Clock, ChevronRight, BarChart, 
  Video, FileText, FileAudio, Brain, HelpCircle, GraduationCap,
  Plus, Search, Upload, X, AlertCircle, Calendar, TrendingUp,
  Users, Zap, Star
} from 'lucide-react';

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    files: [] as File[]
  });
  const [deadlineData, setDeadlineData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [stats, setStats] = useState({
    streak: 0,
    hoursLearned: 0,
    coursesCompleted: 0,
    totalCourses: 0,
    dailyGoal: 0,
    weeklyProgress: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [universityCourses, setUniversityCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchCourses();
    fetchAchievements();
    fetchDeadlines();
    fetchRecommendations();
  }, []);

  const verifyStorageBucket = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;
      
      const courseMaterialsBucket = buckets?.find(bucket => bucket.name === 'course-materials');
      if (!courseMaterialsBucket) {
        throw new Error('Storage system not properly configured. Please contact support.');
      }
      
      return true;
    } catch (error) {
      console.error('Storage bucket verification failed:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    try {
      setError(null);
      setUploadLoading(true);

      if (!courseData.title.trim()) {
        throw new Error('Please enter a course title');
      }

      if (courseData.files.length === 0) {
        throw new Error('Please upload at least one PDF file');
      }

      // Verify storage bucket exists
      const bucketExists = await verifyStorageBucket();
      if (!bucketExists) {
        throw new Error('Storage system is not available. Please try again later or contact support.');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      // Create course record
      const courseId = uuidv4();
      const { error: courseError } = await supabase
        .from('courses')
        .insert([{
          id: courseId,
          title: courseData.title,
          description: courseData.description,
          category: 'university',
          user_id: session.user.id
        }]);

      if (courseError) throw courseError;

      // Upload files
      const uploadPromises = courseData.files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${courseId}/${uuidv4()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('course-materials')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Create lesson record
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert([{
            course_id: courseId,
            title: file.name.replace(`.${fileExt}`, ''),
            description: `PDF document: ${file.name}`,
            type: 'pdf',
            file_path: fileName,
            order: index,
            youtube_url: '', // Required field but not used for PDFs
          }]);

        if (lessonError) {
          throw new Error(`Failed to create lesson for ${file.name}: ${lessonError.message}`);
        }

        return { fileName };
      });

      await Promise.all(uploadPromises);

      // Reset form and close modal
      setCourseData({ title: '', description: '', files: [] });
      setShowUploadModal(false);
      fetchCourses(); // Refresh course list

    } catch (error: any) {
      console.error('Error uploading course:', error);
      setError(error.message || 'Failed to upload course');

      // If there was an error, attempt to clean up any created resources
      if (courseData.title) {
        await supabase
          .from('courses')
          .delete()
          .eq('title', courseData.title);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setProfile(profile);

        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', session.user.id);

        if (progress) {
          const completedLessons = progress.filter(p => p.completed).length;
          const totalHours = progress.reduce((acc, curr) => acc + (curr.watched_duration || 0), 0) / 3600;
          
          setStats({
            streak: calculateStreak(progress),
            hoursLearned: Math.round(totalHours * 10) / 10,
            coursesCompleted: completedLessons,
            totalCourses: progress.length,
            dailyGoal: calculateDailyGoal(progress),
            weeklyProgress: calculateWeeklyProgress(progress)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('achieved_at', { ascending: false })
        .limit(3);

      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(3);

      setDeadlines(data || []);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user profile and progress for AI recommendations
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id);

      const aiRecommendations = await aiService.getRecommendations(profile, progress);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const calculateDailyGoal = (progress: any[]) => {
    const today = new Date();
    const todayProgress = progress.filter(p => {
      const progressDate = new Date(p.last_watched_at);
      return progressDate.toDateString() === today.toDateString();
    });
    return Math.min((todayProgress.length / 5) * 100, 100);
  };

  const calculateWeeklyProgress = (progress: any[]) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekProgress = progress.filter(p => {
      const progressDate = new Date(p.last_watched_at);
      return progressDate >= weekStart;
    });
    return Math.min((weekProgress.length / 20) * 100, 100);
  };

  const fetchCourses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUniversityCourses(courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const calculateStreak = (progress: any[]) => {
    return progress.filter(p => {
      const lastWatched = new Date(p.last_watched_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastWatched.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1;
    }).length;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      setError('Only PDF files are accepted');
      return;
    }
    setCourseData(prev => ({
      ...prev,
      files: [...prev.files, ...pdfFiles]
    }));
  };

  const removeFile = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleAddDeadline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const { error } = await supabase
        .from('deadlines')
        .insert([{
          user_id: session.user.id,
          title: deadlineData.title,
          description: deadlineData.description,
          due_date: new Date(deadlineData.dueDate).toISOString()
        }]);

      if (error) throw error;

      setDeadlineData({ title: '', description: '', dueDate: '' });
      setShowDeadlineModal(false);
      fetchDeadlines();
    } catch (error: any) {
      console.error('Error adding deadline:', error);
      setError(error.message || 'Failed to add deadline');
    }
  };

  const CourseCard = ({ course }: { course: any }) => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{course.title}</h3>
        <span className="text-teal-400 font-bold">{course.progress || 0}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-teal-400 rounded-full h-2 transition-all duration-300"
          style={{ width: `${course.progress || 0}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
        <span>{course.description || 'No description'}</span>
        <span>{new Date(course.created_at).toLocaleDateString()}</span>
      </div>
      <Link 
        to={`/course/${course.id}`}
        className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
      >
        Continue Learning
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );

  const DeadlineModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-primary mb-4">Add New Deadline</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={deadlineData.title}
              onChange={(e) => setDeadlineData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter deadline title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={deadlineData.description}
              onChange={(e) => setDeadlineData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter deadline description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={deadlineData.dueDate}
              onChange={(e) => setDeadlineData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDeadlineModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDeadline}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deadline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-primary mb-4">Upload Course Material</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={courseData.description}
              onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter course description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Materials (PDF only)
            </label>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drop your PDF files here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: PDF files only
                </p>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </div>
            </label>

            {courseData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {courseData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={uploadLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploadLoading}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center space-x-2"
            >
              {uploadLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary via-primary to-[#064973] rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
          <p className="text-gray-300 mb-6">Ready to continue your learning journey?</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Learning Streak</h3>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold">{stats.streak} Days</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Hours Learned</h3>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{stats.hoursLearned} hrs</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Courses</h3>
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold">{stats.coursesCompleted}/{stats.totalCourses}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Rank</h3>
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold">Advanced</p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI Recommendations for You
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <h3 className="font-semibold text-primary mb-2">{rec.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* University Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary flex items-center">
              <GraduationCap className="w-6 h-6 mr-2" />
              University Courses
            </h2>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {universityCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Learning Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Daily Goal</span>
                  <span className="text-secondary font-semibold">{stats.dailyGoal}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary rounded-full h-2" style={{ width: `${stats.dailyGoal}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Weekly Progress</span>
                  <span className="text-secondary font-semibold">{stats.weeklyProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary rounded-full h-2" style={{ width: `${stats.weeklyProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No achievements yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Deadlines
              </h3>
              <button
                onClick={() => setShowDeadlineModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-secondary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {deadlines.length > 0 ? (
                deadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">{deadline.title}</h4>
                      <p className="text-sm text-gray-600">
                        Due {new Date(deadline.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No upcoming deadlines</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Study Groups
            </h3>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Join study groups to collaborate with peers</p>
                <button className="mt-2 text-secondary hover:text-secondary/80 text-sm font-medium">
                  Find Groups
                </button>
              </div>
            </div>
          </div>
        </div>

        {showUploadModal && <UploadModal />}
        {showDeadlineModal && <DeadlineModal />}
      </div>
    </div>
  );
};

export default Dashboard;