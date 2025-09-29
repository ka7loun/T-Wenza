import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, FileAudio, Download, Brain } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const Audio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLessons, setAudioLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAudioLessons();
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

  const fetchAudioLessons = async () => {
    try {
      // For now, using static audio lessons since we don't have audio conversion yet
      const staticAudioLessons = [
        {
          id: '1',
          title: 'Introduction to AI Concepts',
          duration: '15:30',
          progress: 45,
          size: '12.5 MB',
          course_title: 'Machine Learning Fundamentals',
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder
        },
        {
          id: '2',
          title: 'Understanding Data Structures',
          duration: '20:15',
          progress: 0,
          size: '15.8 MB',
          course_title: 'Computer Science Basics',
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder
        },
        {
          id: '3',
          title: 'Web Development Basics',
          duration: '18:45',
          progress: 100,
          size: '14.2 MB',
          course_title: 'Frontend Development',
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder
        }
      ];

      setAudioLessons(staticAudioLessons);
    } catch (error) {
      console.error('Error fetching audio lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAudioFromCourse = async (courseId: string) => {
    try {
      setGenerating(true);
      
      // Get course lessons
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;

      // Simulate audio generation
      const course = courses.find(c => c.id === courseId);
      const newAudioLessons = lessons?.map((lesson, index) => ({
        id: `generated-${courseId}-${index}`,
        title: lesson.title,
        duration: '12:30', // Simulated duration
        progress: 0,
        size: '10.2 MB',
        course_title: course?.title || 'Generated Course',
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder
      })) || [];

      setAudioLessons(prev => [...prev, ...newAudioLessons]);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedAudioData = audioLessons.find(a => a.id === selectedAudio);

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
          <h1 className="text-3xl font-bold text-primary mb-4">Audio Learning</h1>
          <p className="text-gray-600">
            Listen to your course materials converted to high-quality audio format for flexible learning
          </p>
        </div>

        {/* Generate Audio Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Generate Audio from Courses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => generateAudioFromCourse(course.id)}
                disabled={generating}
                className="p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all duration-300 text-left"
              >
                <h3 className="font-medium text-primary mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                <div className="flex items-center text-secondary text-sm">
                  <FileAudio className="w-4 h-4 mr-1" />
                  Convert to Audio
                </div>
              </button>
            ))}
          </div>
          {generating && (
            <div className="mt-4 flex items-center justify-center text-secondary">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary mr-2"></div>
              Converting to audio with AI...
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Audio List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Available Lessons</h2>
              <div className="space-y-4">
                {audioLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedAudio(lesson.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                      selectedAudio === lesson.id
                        ? 'bg-secondary/10 border-secondary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } border-2`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-primary">{lesson.title}</h3>
                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{lesson.course_title}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{lesson.size}</span>
                      <span>{lesson.progress}% completed</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-secondary rounded-full h-1 transition-all duration-300"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="lg:col-span-2">
            {selectedAudio && selectedAudioData ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {selectedAudioData.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{selectedAudioData.course_title}</p>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{selectedAudioData.duration}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedAudioData.size}</span>
                    <button className="ml-auto p-2 hover:bg-gray-100 rounded-lg">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center h-24">
                    <div className="flex items-end space-x-1">
                      {Array.from({ length: 50 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-secondary rounded-full transition-all duration-300 ${
                            i < (currentTime / duration) * 50 ? 'opacity-100' : 'opacity-30'
                          }`}
                          style={{
                            height: `${Math.random() * 60 + 20}px`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer">
                    <div
                      className="bg-secondary rounded-full h-2 transition-all duration-300"
                      style={{ width: '45%' }}
                    />
                  </div>

                  {/* Time */}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{selectedAudioData.duration}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-8">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <SkipBack className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-4 bg-secondary rounded-full text-white hover:bg-secondary/90 shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <SkipForward className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-4">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 w-8">{volume}%</span>
                  </div>

                  {/* Playback Speed */}
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-sm text-gray-600">Speed:</span>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Features */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary mb-3">Audio Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <Brain className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Transcript</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Chapters</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <FileAudio className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Notes</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <Download className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FileAudio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Select an Audio Lesson
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a lesson from the list to start listening, or generate audio from your courses
                </p>
                <p className="text-sm text-gray-500">
                  Audio lessons are perfect for learning on the go!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio;