import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Video, FileText, BookOpen, FileAudio, Brain, HelpCircle, Play } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker URL for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const CoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (currentLesson?.file_path) {
      const url = supabase.storage
        .from('course-materials')
        .getPublicUrl(currentLesson.file_path)
        .data.publicUrl;
      setPdfUrl(url);
    }
  }, [currentLesson]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(course);

      // Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order');

      if (lessonsError) throw lessonsError;
      setLessons(lessons || []);
      if (lessons?.length > 0) {
        setCurrentLesson(lessons[0]);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again later.');
  };

  const learningFormats = [
    {
      id: 'pdf',
      icon: FileText,
      title: 'PDF View',
      description: 'View original PDF content'
    },
    {
      id: 'flashcards',
      icon: BookOpen,
      title: 'Flashcards',
      description: 'Review with interactive flashcards'
    },
    {
      id: 'summaries',
      icon: FileText,
      title: 'Smart Summaries',
      description: 'Quick, AI-generated summaries'
    },
    {
      id: 'audio',
      icon: FileAudio,
      title: 'Audio Learning',
      description: 'Listen to converted content'
    },
    {
      id: 'quiz',
      icon: HelpCircle,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge'
    }
  ];

  const renderContent = () => {
    if (!currentLesson) return null;

    switch (selectedFormat) {
      case 'pdf':
        return (
          <div className="bg-white rounded-lg overflow-hidden">
            {pdfError ? (
              <div className="p-6 text-center text-red-600">
                <p>{pdfError}</p>
                <button 
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="mt-4 btn-secondary"
                >
                  Open in New Tab
                </button>
              </div>
            ) : (
              <div className="p-4">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={window.innerWidth > 1024 ? 800 : undefined}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
                {numPages && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                      className="btn-secondary"
                    >
                      Previous
                    </button>
                    <p className="text-gray-600">
                      Page {pageNumber} of {numPages}
                    </p>
                    <button
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                      className="btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="bg-white p-6 rounded-lg">
            <audio
              src={pdfUrl}
              controls
              className="w-full"
            />
          </div>
        );
      default:
        return (
          <div className="bg-white p-6 rounded-lg text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              Processing Content
            </h3>
            <p className="text-gray-600">
              We're converting your content to {selectedFormat}. This may take a few minutes.
            </p>
          </div>
        );
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{course?.title}</h1>
          <p className="text-gray-600">{course?.description}</p>
        </div>

        {/* Learning Formats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {learningFormats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-lg text-left transition-all duration-300 ${
                  selectedFormat === format.id
                    ? 'bg-secondary text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <h3 className="font-semibold mb-1">{format.title}</h3>
                <p className="text-sm opacity-80">{format.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Course Content</h2>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setPageNumber(1);
                    }}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                      currentLesson?.id === lesson.id
                        ? 'bg-secondary/10 border-secondary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } border-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-secondary" />
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="lg:col-span-2">
            {selectedFormat ? (
              renderContent()
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Select a Learning Format
                </h3>
                <p className="text-gray-600">
                  Choose how you want to learn this content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;