import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, RefreshCw, Brain, Trophy, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { aiService } from '../../../lib/ai';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  course_id: string;
  created_at: string;
}

const Quizzes = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
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

  const fetchQuizzes = async () => {
    try {
      // Static quizzes for demonstration
      const staticQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Neural Networks Fundamentals',
          course_id: '1',
          created_at: new Date().toISOString(),
          questions: [
            {
              id: '1',
              text: 'What is the primary purpose of a neural network?',
              options: [
                'To store data',
                'To process and learn from patterns in data',
                'To connect computers',
                'To create websites'
              ],
              correctAnswer: 1,
              explanation: 'Neural networks are designed to recognize patterns and learn from data, similar to how the human brain processes information.',
              difficulty: 'easy'
            },
            {
              id: '2',
              text: 'What is backpropagation?',
              options: [
                'A way to move data forward',
                'An algorithm for training neural networks by adjusting weights',
                'A type of neural network',
                'A programming language'
              ],
              correctAnswer: 1,
              explanation: 'Backpropagation is the key algorithm used to train neural networks by calculating gradients and adjusting weights to minimize error.',
              difficulty: 'medium'
            },
            {
              id: '3',
              text: 'Which activation function is most commonly used in hidden layers of modern neural networks?',
              options: [
                'Sigmoid',
                'Tanh',
                'ReLU',
                'Linear'
              ],
              correctAnswer: 2,
              explanation: 'ReLU (Rectified Linear Unit) is widely used because it helps solve the vanishing gradient problem and is computationally efficient.',
              difficulty: 'hard'
            }
          ]
        },
        {
          id: '2',
          title: 'Data Structures Quiz',
          course_id: '2',
          created_at: new Date().toISOString(),
          questions: [
            {
              id: '4',
              text: 'Which data structure uses LIFO (Last In, First Out)?',
              options: [
                'Queue',
                'Array',
                'Stack',
                'Linked List'
              ],
              correctAnswer: 2,
              explanation: 'A stack follows the LIFO principle, where the last element added is the first one to be removed.',
              difficulty: 'easy'
            },
            {
              id: '5',
              text: 'What is the average time complexity of searching in a hash table?',
              options: [
                'O(n)',
                'O(log n)',
                'O(1)',
                'O(n²)'
              ],
              correctAnswer: 2,
              explanation: 'Hash tables provide O(1) average time complexity for search, insert, and delete operations through direct key-to-index mapping.',
              difficulty: 'medium'
            }
          ]
        }
      ];

      setQuizzes(staticQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuizFromCourse = async (courseId: string) => {
    try {
      setGenerating(true);
      
      const course = courses.find(c => c.id === courseId);
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;

      const courseContent = lessons?.map(lesson => `${lesson.title}: ${lesson.description}`).join('\n') || '';
      const generatedQuestions = await aiService.generateQuiz(courseContent);
      
      const newQuiz: Quiz = {
        id: `generated-${courseId}-${Date.now()}`,
        title: `${course?.title} - AI Generated Quiz`,
        course_id: courseId,
        created_at: new Date().toISOString(),
        questions: generatedQuestions.map((q, index) => ({
          id: `gen-${index}`,
          text: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: 'This question was generated based on your course content.',
          difficulty: 'medium' as const
        }))
      };

      setQuizzes(prev => [newQuiz, ...prev]);
      setSelectedQuiz(newQuiz);
      resetQuiz();
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);
    
    if (answerIndex === selectedQuiz!.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers([]);
  };

  const getScorePercentage = () => {
    return selectedQuiz ? Math.round((score / selectedQuiz.questions.length) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Interactive AI Quizzes</h1>
          <p className="text-gray-600">
            Test your knowledge with adaptive questions generated from your course materials
          </p>
        </div>

        {!selectedQuiz ? (
          <>
            {/* Generate Quiz Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Generate New Quiz
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => generateQuizFromCourse(course.id)}
                    disabled={generating}
                    className="p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all duration-300 text-left"
                  >
                    <h3 className="font-medium text-primary mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                    <div className="flex items-center text-secondary text-sm">
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Generate Quiz
                    </div>
                  </button>
                ))}
              </div>
              {generating && (
                <div className="mt-4 flex items-center justify-center text-secondary">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary mr-2"></div>
                  Generating quiz with AI...
                </div>
              )}
            </div>

            {/* Available Quizzes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Available Quizzes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quizzes.map(quiz => (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      resetQuiz();
                    }}
                    className="p-6 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all duration-300 text-left"
                  >
                    <h3 className="font-semibold text-primary mb-2">{quiz.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{quiz.questions.length} questions</span>
                      <span>~{quiz.questions.length * 2} min</span>
                    </div>
                    <div className="mt-3 flex items-center text-secondary">
                      <Target className="w-4 h-4 mr-1" />
                      <span className="text-sm">Start Quiz</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : quizCompleted ? (
          /* Quiz Results */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${getScoreColor()}`} />
            <h2 className="text-2xl font-bold text-primary mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-6">Here's how you performed:</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold mb-2 ${getScoreColor()}">
                {score}/{selectedQuiz.questions.length}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {getScorePercentage()}% Correct
              </div>
              
              {/* Performance Message */}
              <div className="text-sm text-gray-600">
                {getScorePercentage() >= 80 && "Excellent work! You've mastered this material."}
                {getScorePercentage() >= 60 && getScorePercentage() < 80 && "Good job! Consider reviewing some concepts."}
                {getScorePercentage() < 60 && "Keep studying! Review the material and try again."}
              </div>
            </div>

            {/* Question Review */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Question Review</h3>
              <div className="space-y-4">
                {selectedQuiz.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-800">{question.text}</p>
                      {userAnswers[index] === question.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                    </p>
                    {question.explanation && (
                      <p className="text-sm text-gray-500">{question.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retake Quiz
              </button>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="btn-primary"
              >
                Choose Another Quiz
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Question */
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {selectedQuiz.questions.length}</span>
                <span>Score: {score}/{selectedQuiz.questions.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary">
                  {selectedQuiz.questions[currentQuestion].text}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedQuiz.questions[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  selectedQuiz.questions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedQuiz.questions[currentQuestion].difficulty}
                </span>
              </div>
              
              <div className="space-y-4">
                {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                      showResult
                        ? index === selectedQuiz.questions[currentQuestion].correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : index === selectedAnswer
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'bg-gray-50 text-gray-500'
                        : selectedAnswer === index
                        ? 'bg-secondary text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } border-2 ${
                      showResult && index === selectedQuiz.questions[currentQuestion].correctAnswer
                        ? 'border-green-500'
                        : showResult && index === selectedAnswer
                        ? 'border-red-500'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && (
                        index === selectedQuiz.questions[currentQuestion].correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : index === selectedAnswer ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : null
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && selectedQuiz.questions[currentQuestion].explanation && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                  <p className="text-blue-700">{selectedQuiz.questions[currentQuestion].explanation}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="btn-secondary"
              >
                Back to Quizzes
              </button>
              
              {showResult && (
                <button
                  onClick={handleNextQuestion}
                  className="btn-primary"
                >
                  {currentQuestion < selectedQuiz.questions.length - 1 ? 'Next Question' : 'View Results'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;