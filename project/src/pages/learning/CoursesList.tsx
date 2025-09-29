import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, BarChart } from 'lucide-react';

const CoursesList = () => {
  const navigate = useNavigate();
  
  const courses = [
    {
      id: 1,
      title: 'Introduction to AI and Machine Learning',
      description: 'Learn the fundamentals of AI and ML with hands-on projects',
      progress: 75,
      duration: '8 hours',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 2,
      title: 'Advanced Data Structures',
      description: 'Master complex data structures and algorithms',
      progress: 45,
      duration: '12 hours',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      description: 'Build modern web applications from scratch',
      progress: 90,
      duration: '15 hours',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">My Courses</h1>
          <button className="btn-primary">
            Browse All Courses
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="px-2 py-1 bg-secondary/90 rounded-full text-sm">
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="w-4 h-4" />
                      <span>{course.progress}% Complete</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondary rounded-full h-2"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Continue Learning</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesList;