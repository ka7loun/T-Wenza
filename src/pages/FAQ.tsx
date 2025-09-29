import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is T-Wenza?',
      answer: 'T-Wenza is an AI-powered educational platform that provides personalized learning experiences, career opportunities, and community collaboration. Our platform uses advanced AI technology to adapt to your learning style and help you achieve your educational goals.',
    },
    {
      question: 'How does the AI personalization work?',
      answer: 'Our AI system analyzes your learning patterns, preferences, and performance to create a customized learning path. It adapts content delivery methods, recommends relevant resources, and provides personalized feedback to optimize your learning experience.',
    },
    {
      question: 'What types of courses are available?',
      answer: 'T-Wenza offers a wide range of courses across various disciplines, including technology, business, sciences, and humanities. Our AI system can also adapt your university course materials into different learning formats.',
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial that gives you full access to our platform features. This includes personalized learning paths, AI assistance, and community features.',
    },
    {
      question: 'How can I access career opportunities?',
      answer: 'Our Career Hub provides AI-matched internships, jobs, scholarships, and hackathons based on your skills and interests. You can also network with industry professionals through our community features.',
    },
    {
      question: 'What support is available if I need help?',
      answer: 'We provide 24/7 support through our AI assistant Wenza, community forums, and dedicated support team. You can reach us through the contact form, email, or live chat.',
    },
  ];

  return (
    <div className="pt-20">
      <section className="section-padding bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Find answers to common questions about T-Wenza and our services.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-primary">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-secondary" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help!
            </p>
            <a href="/contact" className="btn-primary inline-flex">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;