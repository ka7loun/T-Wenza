import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nour Jeday',
    role: 'CS Student / PFE',
    image: 'https://scontent.ftun10-1.fna.fbcdn.net/v/t39.30808-1/455079092_2138851949819543_7304587416349355874_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=McP12MGygAAQ7kNvwEQAsBf&_nc_oc=Adn2wGxV3hJoQ4QMVxN64qlN9lITcdbiwtirwZ5VCpQBaXNZpVz65Qd5FRMh0GMIJSg&_nc_zt=24&_nc_ht=scontent.ftun10-1.fna&_nc_gid=1Ged2wATPareVpT1VUAhRg&oh=00_AfNjlkQtuAxDQI_nftJwn2GMbh60gUmJhtUrNZJrTeQc8g&oe=6853B375',
    quote: 'T-Wenza transformed my learning experience. The personalized paths and AI assistant helped me master complex topics at my own pace.',
  },
  {
    name: 'Ahmed Kahloun',
    role: 'CS Student ',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQHZM4AduJZoMw/profile-displayphoto-shrink_400_400/B4DZWLwbCvGcAg-/0/1741806488553?e=1764806400&v=beta&t=m4SIlKsTMnu1eUr0-MaiKosdiTUjS2fJiGrBTR4J2z0',
    quote: 'The community aspect of T-Wenza is incredible. I found study partners and mentors who helped me land my dream job.',
  },
  {
    name: 'Nour Nsiri',
    role: 'CS Student',
    image: 'https://scontent.ftun10-2.fna.fbcdn.net/v/t39.30808-1/458969929_3786362025025955_3354053683432114440_n.jpg?stp=cp6_dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=OwFmEgY-1cIQ7kNvwHEtjBG&_nc_oc=AdkEXs7aX6ZgBBaQYujToAhpPEtKc3v8ZJUpK4Y5piuvn1_1eJqxNgD0AHuN7RnzTnc&_nc_zt=24&_nc_ht=scontent.ftun10-2.fna&_nc_gid=-CnOncrWW-UkgVAlM_ZMwg&oh=00_AfPelpSn0mpBbsO4DoyReEgGB0bXlnUeYY8xsmaj9alU4A&oe=6853AD3E',
    quote: "Thanks to T-Wenza's career opportunities section, I secured an internship that kickstarted my career in data science.",
  },
];

const Testimonials = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="testimonials" className="section-padding bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join thousands of students who have transformed their learning journey with T-Wenza
          </p>
        </div>

        <div
          ref={ref}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`fade-in ${inView ? 'visible' : ''} 
                         bg-white rounded-xl p-6 shadow-xl transform hover:-translate-y-2 transition-all duration-300`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-primary">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <Quote className="w-8 h-8 text-secondary/20 mb-2" />
              <p className="text-gray-600">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
