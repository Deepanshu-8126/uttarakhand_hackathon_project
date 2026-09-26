import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemStatement from '../components/home/ProblemStatement';
import ExploreSection from '../components/ExploreSection';
import ThankYouSection from '../components/ThankYouSection';
import ReviewSection from '../components/ReviewSection';
import Footer from '../components/Footer';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/explore' || location.hash === '#explore' || window.location.hash === '#explore') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('explore');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        <HeroSection />
        <ExploreSection />
        <ProblemStatement />
        <ThankYouSection />
        <ReviewSection targetId="general" targetType="site" />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
