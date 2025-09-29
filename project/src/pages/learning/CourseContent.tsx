import React from 'react';
import { CheckCircle, Circle, PlayCircle, FileText, Download } from 'lucide-react';

interface Section {
  title: string;
  lessons: {
    title: string;
    duration: string;
    type: 'video' | 'quiz' | 'reading';
    completed: boolean;
  }[];
}

const CourseContent = () => {
  const sections: Section[] = [
    {
      title: 'Getting Started',
      lessons: [
        {
          title: 'Course Introduction',
          duration: '5:20',
          type: 'video',
          completed: true,
        },
        {
          title: 'Setting Up Your Environment',
          duration: '10:15',
          type: 'video',
          completed: true,
        },
        {
          title: 'Knowledge Check',
          duration: '10 questions',
          type: 'quiz',
          completed: false,
        },
      ],
    },
    {
      title: 'Core Concepts',
      lessons: [
        {
          title: 'Understanding the Basics',
          duration: '15:30',
          type: 'video',
          completed: false,
        },
        {
          title: 'Essential Reading Material',
          duration: '20 mins',
          type: 'reading',
          completed: false,
        },
        {
          title: 'Practice Exercise',
          duration: '15 questions',
          type: 'quiz',
          completed: false,
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary mb-6">Course Content</h2>
        
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-lg font-semibold text-primary mb-4">
                {section.title}
              </h3>
              
              <div className="space-y-2">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lessonIndex}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      
                      {lesson.type === 'video' && (
                        <PlayCircle className="w-5 h-5 text-secondary" />
                      )}
                      {lesson.type === 'quiz' && (
                        <FileText className="w-5 h-5 text-secondary" />
                      )}
                      {lesson.type === 'reading' && (
                        <Download className="w-5 h-5 text-secondary" />
                      )}
                      
                      <span className="text-gray-700">{lesson.title}</span>
                    </div>
                    
                    <span className="text-sm text-gray-500">{lesson.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;