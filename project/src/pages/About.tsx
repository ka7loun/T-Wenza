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
      image: 'https://scontent.ftun10-1.fna.fbcdn.net/v/t39.30808-1/455079092_2138851949819543_7304587416349355874_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=McP12MGygAAQ7kNvwEQAsBf&_nc_oc=Adn2wGxV3hJoQ4QMVxN64qlN9lITcdbiwtirwZ5VCpQBaXNZpVz65Qd5FRMh0GMIJSg&_nc_zt=24&_nc_ht=scontent.ftun10-1.fna&_nc_gid=1Ged2wATPareVpT1VUAhRg&oh=00_AfNjlkQtuAxDQI_nftJwn2GMbh60gUmJhtUrNZJrTeQc8g&oe=6853B375https://scontent.ftun10-1.fna.fbcdn.net/v/t39.30808-1/455079092_2138851949819543_7304587416349355874_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=McP12MGygAAQ7kNvwEQAsBf&_nc_oc=Adn2wGxV3hJoQ4QMVxN64qlN9lITcdbiwtirwZ5VCpQBaXNZpVz65Qd5FRMh0GMIJSg&_nc_zt=24&_nc_ht=scontent.ftun10-1.fna&_nc_gid=1Ged2wATPareVpT1VUAhRg&oh=00_AfNjlkQtuAxDQI_nftJwn2GMbh60gUmJhtUrNZJrTeQc8g&oe=6853B375',
    },
    {
      name: 'Ahmed Kahloun',
      role: 'CTO',
      image: 'https://scontent.ftun10-2.fna.fbcdn.net/v/t39.30808-1/411483150_3151966641613788_4884627781505345009_n.jpg?stp=dst-jpg_s160x160_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=EvuaR-5GTC4Q7kNvwGrMErk&_nc_oc=AdkgJ3ggngiMV1IT8rvkjfctti0vfiu8YnONLqhfWtj0WqoJP8v0D8V0kzw9FctiJFU&_nc_zt=24&_nc_ht=scontent.ftun10-2.fna&_nc_gid=-n54_teZ1qx2xMcewkhBWg&oh=00_AfOSIFsZ0v_dGJfz62fSd12n9Rz7Bijjpwgr446GAOhWWg&oe=6853CC75',
    },
    {
      name: 'Nour Nsiri',
      role: 'CFO',
      image: 'https://scontent.ftun10-2.fna.fbcdn.net/v/t39.30808-1/458969929_3786362025025955_3354053683432114440_n.jpg?stp=cp6_dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=OwFmEgY-1cIQ7kNvwHEtjBG&_nc_oc=AdkEXs7aX6ZgBBaQYujToAhpPEtKc3v8ZJUpK4Y5piuvn1_1eJqxNgD0AHuN7RnzTnc&_nc_zt=24&_nc_ht=scontent.ftun10-2.fna&_nc_gid=-CnOncrWW-UkgVAlM_ZMwg&oh=00_AfPelpSn0mpBbsO4DoyReEgGB0bXlnUeYY8xsmaj9alU4A&oe=6853AD3E',
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