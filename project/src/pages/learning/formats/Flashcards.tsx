import React, { useState, useEffect } from 'react';
import { BookOpen, RotateCw, ChevronLeft, ChevronRight, Brain, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { aiService } from '../../../lib/ai';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  course_id?: string;
  created_at?: string;
}

const Flashcards = () => {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchFlashcards();
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

  const fetchFlashcards = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // For now, we'll use static flashcards since we don't have a flashcards table
      // In a real implementation, you'd create a flashcards table
      const staticFlashcards: Flashcard[] = [
        {
          id: '1',
          category: 'Machine Learning',
          front: 'What is a Neural Network?',
          back: 'A computing system inspired by biological neural networks that can learn and improve from experience without explicit programming.'
        },
        {
          id: '2',
          category: 'Data Structures',
          front: 'What is a Binary Search Tree?',
          back: 'A tree data structure where each node has at most two children, with all left descendants less than the current node and all right descendants greater.'
        },
        {
          id: '3',
          category: 'Web Development',
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces, particularly single-page applications where UI updates are frequent and dynamic.'
        },
        {
          id: '4',
          category: 'Machine Learning',
          front: 'What is supervised learning?',
          back: 'A type of machine learning where the algorithm learns from labeled training data to make predictions on new, unseen data.'
        },
        {
          id: '5',
          category: 'Data Structures',
          front: 'What is the time complexity of binary search?',
          back: 'O(log n) - Binary search eliminates half of the remaining elements with each comparison.'
        }
      ];

      setFlashcards(staticFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcardsFromCourse = async (courseId: string) => {
    try {
      setGenerating(true);
      
      // Get course lessons
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;

      // Simulate content extraction and AI generation
      const courseContent = lessons?.map(lesson => lesson.description).join(' ') || '';
      const generatedCards = await aiService.generateFlashcards(courseContent);
      
      const course = courses.find(c => c.id === courseId);
      const newFlashcards: Flashcard[] = generatedCards.map((card, index) => ({
        id: `generated-${courseId}-${index}`,
        front: card.front,
        back: card.back,
        category: course?.title || 'Generated',
        course_id: courseId
      }));

      setFlashcards(prev => [...prev, ...newFlashcards]);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setGenerating(false);
    }
  };

  const categories = Array.from(new Set(flashcards.map(card => card.category)));
  
  const filteredCards = selectedCategory
    ? flashcards.filter(card => card.category === selectedCategory)
    : flashcards;

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((currentIndex + 1) % filteredCards.length);
  };

  const handlePrevious = () => {
    setFlipped(false);
    setCurrentIndex(currentIndex === 0 ? filteredCards.length - 1 : currentIndex - 1);
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">AI-Generated Flashcards</h1>
          <p className="text-gray-600">
            Review and memorize key concepts with interactive flashcards generated from your course materials
          </p>
        </div>

        {/* Generate Flashcards Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Generate New Flashcards
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => generateFlashcardsFromCourse(course.id)}
                disabled={generating}
                className="p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all duration-300 text-left"
              >
                <h3 className="font-medium text-primary mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                <div className="flex items-center text-secondary text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Generate Flashcards
                </div>
              </button>
            ))}
          </div>
          {generating && (
            <div className="mt-4 flex items-center justify-center text-secondary">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary mr-2"></div>
              Generating flashcards with AI...
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-secondary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({flashcards.length})
          </button>
          {categories.map((category) => {
            const count = flashcards.filter(card => card.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-secondary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No Flashcards Available</h3>
            <p className="text-gray-600 mb-4">
              Generate flashcards from your courses or upload new course materials
            </p>
          </div>
        ) : (
          <>
            {/* Flashcard */}
            <div className="max-w-2xl mx-auto">
              <div
                className="relative h-96 cursor-pointer perspective-1000"
                onClick={() => setFlipped(!flipped)}
              >
                <div
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d ${
                    flipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-xl shadow-lg p-8 flex flex-col border-2 border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        {filteredCards[currentIndex].category}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {currentIndex + 1} / {filteredCards.length}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h2 className="text-2xl font-semibold text-primary text-center">
                        {filteredCards[currentIndex].front}
                      </h2>
                    </div>
                    <div className="text-center text-gray-500 text-sm">Click to reveal answer</div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden bg-secondary text-white rounded-xl shadow-lg p-8 rotate-y-180 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        Answer
                      </span>
                      <span className="text-white/70 text-sm">
                        {currentIndex + 1} / {filteredCards.length}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xl text-center leading-relaxed">
                        {filteredCards[currentIndex].back}
                      </p>
                    </div>
                    <div className="text-center opacity-75 text-sm">Click to see question</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                
                <div className="flex items-center space-x-6">
                  <span className="text-gray-600 font-medium">
                    {currentIndex + 1} of {filteredCards.length}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentIndex(0);
                      setFlipped(false);
                    }}
                    className="flex items-center space-x-2 text-secondary hover:text-secondary/80 font-medium"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span>Restart</span>
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6 text-primary" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Flashcards;