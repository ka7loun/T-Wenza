import React from 'react';
import { Users, Target, History } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const team = [
    {
      name: 'Nour Jeday',
      role: 'CEO',
      image: '/nourjeday.jpg',
    },
    {
      name: 'Ahmed Kahloun',
      role: 'CTO',
      image: '/ahmedkahloun.jpg',
    },
    {
      name: 'Nour Nsiri',
      role: 'CFO',
      image: '/nournsiri.jpg',
    },
  ];

  return (
    <div className="pt-20">
      {/* Mission & Vision */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary to-[#064973]">
        <div className="max-w-7xl mx-auto text-white">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6">Our Mission</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transforming education through AI-powered personalized learning experiences, making quality education accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Target className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2">Vision</h3>
              <p className="text-gray-300">To become the world's leading AI-powered educational platform.</p>
            </div>
            <div className="text-center p-6">
              <History className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2">History</h3>
              <p className="text-gray-300">Founded in 2023 with a mission to revolutionize learning.</p>
            </div>
            <div className="text-center p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-300">Over 100,000 students growing together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={ref} className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind T-Wenza's mission to transform education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className={`fade-in ${inView ? 'visible' : ''} 
                           bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-primary text-center mb-2">{member.name}</h3>
                <p className="text-gray-600 text-center">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;