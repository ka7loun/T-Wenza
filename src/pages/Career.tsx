import React from 'react';
import { Briefcase, Award, Code, Rocket, Search, Users, BookOpen, Target } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const Career = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const opportunities = [
    {
      category: 'Internships',
      icon: Briefcase,
      items: [
        'Software Development at Tech Giants',
        'Data Science Positions',
        'AI Research Programs',
        'Product Management Roles'
      ]
    },
    {
      category: 'Scholarships',
      icon: Award,
      items: [
        'Full-Ride University Grants',
        'Research Fellowships',
        'Merit-Based Awards',
        'International Study Programs'
      ]
    },
    {
      category: 'Hackathons',
      icon: Code,
      items: [
        'Global AI Challenges',
        'Innovation Competitions',
        'Startup Weekends',
        'Tech for Good Events'
      ]
    },
    {
      category: 'Job Opportunities',
      icon: Rocket,
      items: [
        'Remote Tech Positions',
        'AI Engineer Roles',
        'Data Scientist Positions',
        'Product Manager Openings'
      ]
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithms match you with opportunities that align with your skills and career goals.'
    },
    {
      icon: Users,
      title: 'Network Building',
      description: 'Connect with industry professionals and peers to expand your professional network.'
    },
    {
      icon: BookOpen,
      title: 'Career Resources',
      description: 'Access comprehensive guides, interview prep materials, and resume building tools.'
    },
    {
      icon: Target,
      title: 'Personalized Roadmap',
      description: 'Get a customized career development plan based on your interests and market trends.'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary to-[#064973] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">
            Launch Your Career with T-Wenza
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover AI-matched opportunities and resources to accelerate your career growth
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Career Development Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tools and resources designed to help you succeed in your career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
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

      {/* Opportunities Section */}
      <section ref={ref} className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Available Opportunities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated selection of opportunities to advance your career
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {opportunities.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className={`fade-in ${inView ? 'visible' : ''} 
                             bg-white p-6 rounded-xl shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-1 transition-all duration-300`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your profile now to get personalized opportunity recommendations
          </p>
          <a href="/auth" className="btn-primary">
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
};

export default Career;