import React from 'react';
import Hero from '../components/Hero';
import FeaturesSection from '../components/Features';
import Opportunities from '../components/Opportunities';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <Opportunities />
      <Testimonials />
    </>
  );
};

export default Home;