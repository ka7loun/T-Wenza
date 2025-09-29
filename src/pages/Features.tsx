import React from 'react';
import { Brain, BookOpen, Users, Notebook, Bot, Rocket, Award, Target } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const Features = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms analyze your learning style and create personalized study paths.',
    },
    {
      icon: BookOpen,
      title: 'Content Adaptation',
      description: 'Transform any course material into your preferred learning format.',
    },
    {
      icon: Bot,
      title: 'AI Assistant Wenza',
      description: 'Your personal AI tutor available 24/7 for guidance and support.',
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with peers and form study groups for collaborative learning.',
    },
    {
      icon: Rocket,
      title: 'Career Growth',
      description: 'Access AI-matched job opportunities and career development resources.',
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Earn recognized certificates upon completing courses and assessments.',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and monitor your learning objectives with detailed progress analytics.',
    },
    {
      icon: Notebook,
      title: 'Smart Notes',
      description: 'AI-powered note-taking system that organizes and summarizes content.',
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary to-[#064973] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">
            Powerful Features for Enhanced Learning
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how T-Wenza's innovative features transform your educational journey
            with cutting-edge AI technology and personalized learning tools.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={ref} className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              )}
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already benefiting from our AI-powered learning platform.
          </p>
          <a href="/auth" className="btn-primary">
            Get Started Today
          </a>
        </div>
      </section>
    </div>
  );
};

export default Features;