import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, BookOpen, FileText, FileAudio, Brain, HelpCircle, TrendingUp, Target, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../lib/ai';

const PersonalizedLearning = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id);

      setUserProfile(profile);
      
      // Generate personalized learning path
      const recommendations = await aiService.getRecommendations(profile, progress);
      setLearningPath(recommendations);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const learningFormats = [
    {
      icon: Video,
      title: 'Video Lessons',
      description: 'AI-curated video content adapted to your learning pace and style',
      path: '/learning/videos',
      color: 'bg-blue-500',
      stats: '12 videos available',
      difficulty: 'Beginner to Advanced'
    },
    {
      icon: BookOpen,
      title: 'Smart Flashcards',
      description: 'AI-generated flashcards from your course materials for efficient review',
      path: '/learning/flashcards',
      color: 'bg-green-500',
      stats: '45 cards generated',
      difficulty: 'All levels'
    },
    {
      icon: FileText,
      title: 'Intelligent Summaries',
      description: 'Key concepts extracted and summarized by AI for quick understanding',
      path: '/learning/summaries',
      color: 'bg-purple-500',
      stats: '8 summaries ready',
      difficulty: 'Quick review'
    },
    {
      icon: Brain,
      title: 'Interactive PDFs',
      description: 'Enhanced PDF reading with AI annotations and insights',
      path: '/learning/pdfs',
      color: 'bg-red-500',
      stats: '6 documents',
      difficulty: 'Deep learning'
    },
    {
      icon: FileAudio,
      title: 'Audio Learning',
      description: 'Convert any content to audio for learning on-the-go',
      path: '/learning/audio',
      color: 'bg-yellow-500',
      stats: '3 hours available',
      difficulty: 'Flexible'
    },
    {
      icon: HelpCircle,
      title: 'Adaptive Quizzes',
      description: 'AI-powered quizzes that adapt to your knowledge level',
      path: '/learning/quizzes',
      color: 'bg-pink-500',
      stats: '15 quizzes ready',
      difficulty: 'Adaptive'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Your Personalized Learning Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI-powered learning formats tailored to your preferences, goals, and learning style
          </p>
          
          {/* Learning Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-primary">85%</span>
              </div>
              <p className="text-gray-600 text-sm">Learning Efficiency</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-2xl font-bold text-primary">12</span>
              </div>
              <p className="text-gray-600 text-sm">Goals Achieved</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold text-primary">7</span>
              </div>
              <p className="text-gray-600 text-sm">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {learningPath.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI Recommendations for {userProfile?.full_name || 'You'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {learningPath.map((item, index) => (
                <div key={index} className={`p-6 rounded-lg border-l-4 ${
                  item.priority === 'high' ? 'border-red-500 bg-red-50' :
                  item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.priority} priority
                    </span>
                    <button className="text-secondary hover:text-secondary/80 text-sm font-medium">
                      Start Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Formats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {learningFormats.map((format, index) => {
            const Icon = format.icon;
            return (
              <Link
                key={index}
                to={format.path}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 ${format.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {format.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {format.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Available:</span>
                    <span className="font-medium text-secondary">{format.stats}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Level:</span>
                    <span className="font-medium text-gray-700">{format.difficulty}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* AI Learning Assistant */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">
                Meet Wenza, Your AI Learning Companion
              </h3>
              <p className="text-gray-200 mb-6">
                Wenza analyzes your learning patterns, preferences, and goals to create a truly 
                personalized education experience. The AI continuously adapts content delivery, 
                difficulty levels, and learning formats to maximize your understanding and retention.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Smart Adaptation</h4>
                  <p className="text-sm text-gray-200">Adjusts to your learning speed and style</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Progress Tracking</h4>
                  <p className="text-sm text-gray-200">Monitors your growth and suggests improvements</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">24/7 Support</h4>
                  <p className="text-sm text-gray-200">Always available to answer questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedLearning;