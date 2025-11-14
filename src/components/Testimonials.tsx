import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nour Jeday',
    role: 'CS Student ',
    image: '/nourjeday.jpg',
    quote: 'T-Wenza transformed my learning experience. The personalized paths and AI assistant helped me master complex topics at my own pace.',
  },
  {
    name: 'Ahmed Kahloun',
    role: 'CS Student ',
    image: '/ahmedkahloun.jpg',
    quote: 'The community aspect of T-Wenza is incredible. I found study partners and mentors who helped me land my dream job.',
  },
  {
    name: 'Nour Nsiri',
    role: 'CS Student',
    image: '/nournsiri.jpg',
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