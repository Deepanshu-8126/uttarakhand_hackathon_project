import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemStatement from '../components/home/ProblemStatement';
import ExploreSection from '../components/ExploreSection';
import ThankYouSection from '../components/ThankYouSection';
import ReviewSection from '../components/ReviewSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        <HeroSection />
        <ProblemStatement />
        <ExploreSection />
        <ThankYouSection />
        <ReviewSection targetId="general" targetType="site" />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
