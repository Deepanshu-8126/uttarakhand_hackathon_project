import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemStatement from '../components/home/ProblemStatement';
import PersonalizedNearYouSection from '../components/home/PersonalizedNearYouSection';
import ExploreSection from '../components/ExploreSection';
import HiddenLocationsSection from '../components/destinations/HiddenLocationsSection';
import ThankYouSection from '../components/ThankYouSection';
import ReviewSection from '../components/ReviewSection';
import Footer from '../components/Footer';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. If explicit /explore route or #explore anchor, scroll to explore section
    if (location.pathname === '/explore' || location.hash === '#explore') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('explore');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }

    // 2. If navigating to main Home / dashboard route without an anchor, ensure page starts at top
    if (location.pathname === '/' && !location.hash) {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        <HeroSection />
        <PersonalizedNearYouSection />
        <ExploreSection />
        <HiddenLocationsSection />
        <ProblemStatement />
        <ThankYouSection />
        <ReviewSection targetId="general" targetType="site" />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
