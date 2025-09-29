import React from 'react';
import { Brain, BookOpen, Users, Notebook as Robot } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: Brain,
    title: 'Personalized Learning Paths',
    description: 'AI-driven customization based on your knowledge level and learning style preferences.'
  },
  {
    icon: BookOpen,
    title: 'Adaptive Course Formats',
    description: 'Transform university courses into your preferred format - videos, flashcards, or summaries.'
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    description: 'Connect with peers, share achievements, and grow together in a supportive environment.'
  },
  {
    icon: Robot,
    title: 'AI Assistant Wenza',
    description: 'Your personal virtual assistant for motivation, reminders, and guidance.'
  }
];

const Features = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Empowering Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how T-Wenza transforms your educational journey with cutting-edge AI technology
            and collaborative learning tools.
          </p>
        </div>

        <div 
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`fade-in ${inView ? 'visible' : ''} 
                           bg-white p-6 rounded-xl shadow-lg hover:shadow-xl 
                           transform hover:-translate-y-1 transition-all duration-300`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;