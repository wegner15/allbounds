import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export interface BackToTopButtonProps {
  /** Optional scroll container ref (defaults to window when omitted). */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Vertical scroll distance in pixels before the button appears. */
  threshold?: number;
  /** Minimum scrollable overflow in pixels required so short pages never show the button. */
  minScrollableOverflow?: number;
  /** Optional additional classes. */
  className?: string;
}

const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  scrollContainerRef,
  threshold = 320,
  minScrollableOverflow = 200,
  className = '',
}) => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const readScrollMetrics = useCallback(() => {
    const container = scrollContainerRef?.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      return { scrollTop, maxScroll };
    }

    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    return { scrollTop, maxScroll };
  }, [scrollContainerRef]);

  const syncScrollState = useCallback(() => {
    const { scrollTop, maxScroll } = readScrollMetrics();
    const isScrollable = maxScroll >= minScrollableOverflow;
    const shouldShow = isScrollable && scrollTop >= threshold;

    if (shouldShow !== isVisibleRef.current) {
      isVisibleRef.current = shouldShow;
      setIsVisible(shouldShow);
    }

    const progress =
      isScrollable && maxScroll > 0
        ? Math.min(1, Math.max(0, scrollTop / maxScroll))
        : 0;

    if (progressCircleRef.current) {
      progressCircleRef.current.style.strokeDashoffset = String(
        RING_CIRCUMFERENCE * (1 - progress)
      );
    }
  }, [readScrollMetrics, minScrollableOverflow, threshold]);

  const scheduleSync = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      syncScrollState();
    });
  }, [syncScrollState]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    const scrollTarget: EventTarget = container ?? window;

    // Initial calculation
    syncScrollState();

    scrollTarget.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(container ?? document.documentElement);
    }

    return () => {
      scrollTarget.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [scrollContainerRef, scheduleSync, syncScrollState]);

  // Recalculate when navigating between routes (e.g. long page -> short page)
  useEffect(() => {
    syncScrollState();
  }, [pathname, syncScrollState]);

  const handleScrollToTop = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    const container = scrollContainerRef?.current;

    if (container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, behavior });
      } else {
        container.scrollTop = 0;
      }
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior });
  }, [scrollContainerRef]);

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      data-visible={isVisible ? 'true' : 'false'}
      className={[
        'back-to-top-btn',
        'fixed right-4 md:right-6 z-30',
        'w-12 h-12 rounded-full',
        'flex items-center justify-center',
        'bg-charcoal/90 backdrop-blur-md text-white',
        'ring-1 ring-white/15 shadow-lg shadow-charcoal/20',
        'select-none cursor-pointer',
        'print:hidden no-print',
        isVisible ? 'pointer-events-auto' : 'pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Circular scroll progress ring */}
      <svg
        className="back-to-top-ring absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-white/15"
        />
        <circle
          ref={progressCircleRef}
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE}
          className="text-primary"
        />
      </svg>

      {/* Up arrow icon */}
      <ArrowUp
        className="back-to-top-icon relative z-10 w-5 h-5 text-white"
        strokeWidth={2.25}
        aria-hidden="true"
      />
    </button>
  );
};

export default BackToTopButton;
