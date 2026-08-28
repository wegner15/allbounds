import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that whenever a user navigates to a new page or changes routes in the SPA,
 * the window and document scroll position is immediately and reliably reset to (0, 0).
 * If a hash anchor exists (e.g. #itinerary), it scrolls smoothly to that specific element.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor is provided (e.g., #reviews or #itinerary), attempt to scroll to it
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Explicitly reset scroll on window, documentElement, and body
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {
      // Ignore if not supported in environment
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
