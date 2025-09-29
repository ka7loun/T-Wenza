import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Briefcase, Award, Code, Rocket } from 'lucide-react';

const opportunities = [
  {
    icon: Briefcase,
    title: 'Internships',
    description: 'Connect with top companies offering internships tailored to your skills and interests.',
    count: '500+',
  },
  {
    icon: Award,
    title: 'Scholarships',
    description: 'Access exclusive scholarships from universities and organizations worldwide.',
    count: '200+',
  },
  {
    icon: Code,
    title: 'Hackathons',
    description: 'Participate in exciting hackathons to showcase your skills and win prizes.',
    count: '50+',
  },
  {
    icon: Rocket,
    title: 'Job Opportunities',
    description: 'Find your dream job through our curated job board and career guidance.',
    count: '1000+',
  },
];

const Opportunities = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="opportunities" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Career Opportunities
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take your career to new heights with our extensive network of opportunities
          </p>
        </div>

        <div
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {opportunities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`fade-in ${inView ? 'visible' : ''} 
                           relative overflow-hidden group`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-full
                               transform group-hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="text-2xl font-bold text-secondary/20">{item.count}</span>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button className="btn-primary">
            Explore All Opportunities
          </button>
        </div>
      </div>
    </section>
  );
};

export default Opportunities;