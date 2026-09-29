import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Guarantees that every page navigation starts smoothly at top (scrollTop: 0)
 * eliminating mid-page scroll jumps when opening destinations or navigation links.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}
