import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-primary via-primary to-[#064973]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center opacity-10"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Revolutionize Your Learning Journey with <br />T-Wenza
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Personalized courses, career opportunities, and a thriving community at your fingertips.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn-primary flex items-center justify-center gap-2">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary bg-white">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="relative group cursor-pointer">
              <img 
                src="/hero_elephent_image-removebg-preview.png"
                alt="T-Wenza Elephant Mascot"
                className="rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105 float-animation"
              />
              {/* Speech Bubble */}
              <div className="absolute -top-16 -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white p-4 rounded-lg shadow-lg relative">
                  <p className="text-primary font-medium">Hi! I'm Wenza, your AI learning companion! 👋</p>
                  {/* Speech Bubble Triangle */}
                  <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45"></div>
                </div>
              </div>
              {/* THIS IS THE ELEMENT YOU'RE LOOKING FOR - Animated Glow Effect */}
              <div className="absolute inset-0 bg-secondary/20 rounded-lg filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;