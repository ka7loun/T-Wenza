import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, ThumbsUp, ThumbsDown, Brain, Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { aiService } from '../../../lib/ai';

interface Summary {
  id: string;
  title: string;
  content: string;
  course_id: string;
  lesson_id?: string;
  length: string;
  generated_at: string;
}

const Summaries = () => {
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{[key: string]: 'helpful' | 'not-helpful' | null}>({});

  useEffect(() => {
    fetchCourses();
    fetchSummaries();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSummaries = async () => {
    try {
      // For now, using static summaries since we don't have a summaries table
      const staticSummaries: Summary[] = [
        {
          id: '1',
          title: 'Introduction to Neural Networks',
          content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers. The basic architecture includes an input layer that receives data, one or more hidden layers that process information, and an output layer that produces results. Each connection has a weight that determines the strength of the signal. During training, these weights are adjusted through backpropagation to minimize prediction errors. Key concepts include activation functions (like ReLU, sigmoid, and tanh) that introduce non-linearity, allowing networks to learn complex patterns. Neural networks excel at pattern recognition, classification, and regression tasks.',
          course_id: '1',
          length: '3 min read',
          generated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Data Structures Fundamentals',
          content: 'Data structures are specialized formats for organizing, storing, and accessing data efficiently. Arrays provide constant-time access to elements by index but have fixed size in many languages. Linked lists offer dynamic sizing and efficient insertion/deletion but require sequential access. Stacks follow Last-In-First-Out (LIFO) principle, perfect for function calls and undo operations. Queues use First-In-First-Out (FIFO), ideal for scheduling and breadth-first search. Trees organize data hierarchically, with binary search trees enabling O(log n) search, insertion, and deletion. Hash tables provide average O(1) operations through key-value mapping. Graphs represent relationships between entities, supporting algorithms like shortest path and network analysis.',
          course_id: '2',
          length: '4 min read',
          generated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Web Development Basics',
          content: 'Web development involves creating websites and web applications using various technologies. HTML (HyperText Markup Language) provides the structural foundation, defining content elements like headings, paragraphs, and links. CSS (Cascading Style Sheets) handles presentation, controlling layout, colors, fonts, and responsive design across different screen sizes. JavaScript adds interactivity and dynamic behavior, enabling user interactions, animations, and real-time updates. Modern development often employs frameworks like React, Vue, or Angular for component-based architecture. Backend technologies like Node.js, Python, or PHP handle server-side logic, database interactions, and API development. Version control with Git, package managers like npm, and build tools streamline the development workflow.',
          course_id: '3',
          length: '5 min read',
          generated_at: new Date().toISOString()
        }
      ];

      setSummaries(staticSummaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummaryFromCourse = async (courseId: string) => {
    try {
      setGenerating(true);
      
      // Get course and lessons
      const course = courses.find(c => c.id === courseId);
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;

      // Simulate content extraction and AI generation
      const courseContent = lessons?.map(lesson => `${lesson.title}: ${lesson.description}`).join('\n') || '';
      const generatedSummary = await aiService.generateSummary(courseContent);
      
      const newSummary: Summary = {
        id: `generated-${courseId}-${Date.now()}`,
        title: `${course?.title} - AI Summary`,
        content: generatedSummary,
        course_id: courseId,
        length: '3 min read',
        generated_at: new Date().toISOString()
      };

      setSummaries(prev => [newSummary, ...prev]);
      setSelectedSummary(newSummary.id);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedback = (summaryId: string, type: 'helpful' | 'not-helpful') => {
    setFeedback(prev => ({
      ...prev,
      [summaryId]: prev[summaryId] === type ? null : type
    }));
  };

  const selectedSummaryData = summaries.find(s => s.id === selectedSummary);

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
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4">AI-Generated Smart Summaries</h1>
          <p className="text-gray-600">
            Get concise, AI-generated summaries that highlight key concepts and main points from your course materials
          </p>
        </div>

        {/* Generate Summaries Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate New Summaries
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => generateSummaryFromCourse(course.id)}
                disabled={generating}
                className="p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all duration-300 text-left"
              >
                <h3 className="font-medium text-primary mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                <div className="flex items-center text-secondary text-sm">
                  <Brain className="w-4 h-4 mr-1" />
                  Generate Summary
                </div>
              </button>
            ))}
          </div>
          {generating && (
            <div className="mt-4 flex items-center justify-center text-secondary">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary mr-2"></div>
              Generating summary with AI...
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summaries List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-primary mb-6">Available Summaries</h2>
            {summaries.map((summary) => (
              <button
                key={summary.id}
                onClick={() => setSelectedSummary(summary.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                  selectedSummary === summary.id
                    ? 'bg-secondary text-white shadow-lg'
                    : 'bg-white hover:bg-gray-50 shadow'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">{summary.title}</span>
                  </div>
                  <span className="text-sm opacity-75">{summary.length}</span>
                </div>
                <p className="text-sm opacity-75 line-clamp-2">
                  {summary.content.substring(0, 100)}...
                </p>
                <div className="mt-2 text-xs opacity-60">
                  Generated {new Date(summary.generated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {/* Summary Content */}
          <div className="lg:col-span-2">
            {selectedSummaryData ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary">
                      {selectedSummaryData.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Brain className="w-4 h-4" />
                      <span>AI Generated</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <span>{selectedSummaryData.length}</span>
                    <span className="mx-2">•</span>
                    <span>Generated {new Date(selectedSummaryData.generated_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedSummaryData.content}
                    </p>
                  </div>
                </div>

                {/* Key Points */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4">Key Takeaways</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-secondary rounded-full mt-2"></span>
                      <span className="text-gray-700">Core concepts are clearly explained with practical examples</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-secondary rounded-full mt-2"></span>
                      <span className="text-gray-700">Technical details are simplified for better understanding</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-secondary rounded-full mt-2"></span>
                      <span className="text-gray-700">Real-world applications and use cases are highlighted</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleFeedback(selectedSummaryData.id, 'helpful')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        feedback[selectedSummaryData.id] === 'helpful'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>Helpful</span>
                    </button>
                    <button 
                      onClick={() => handleFeedback(selectedSummaryData.id, 'not-helpful')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        feedback[selectedSummaryData.id] === 'not-helpful'
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>Not Helpful</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 text-secondary hover:text-secondary/80 font-medium">
                    <ExternalLink className="w-5 h-5" />
                    <span>View Full Course</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Select a Summary
                </h3>
                <p className="text-gray-600">
                  Choose a summary from the list to view its AI-generated content, or generate new summaries from your courses
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summaries;