import React, { useRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BackToTopButton from './BackToTopButton';

function setWindowScrollMetrics({
  scrollY,
  scrollHeight,
  innerHeight,
}: {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
}) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value: scrollY,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: innerHeight,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    writable: true,
    value: scrollHeight,
  });
  Object.defineProperty(document.documentElement, 'scrollTop', {
    configurable: true,
    writable: true,
    value: scrollY,
  });
}

describe('BackToTopButton', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    setWindowScrollMetrics({ scrollY: 0, scrollHeight: 2400, innerHeight: 800 });
  });

  afterEach(() => {
    rafSpy.mockRestore();
  });

  it('is hidden initially at the top of a scrollable page', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <BackToTopButton />
      </MemoryRouter>
    );

    const button = getByLabelText('Scroll to top');
    expect(button).toHaveAttribute('data-visible', 'false');
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('never appears on short non-scrollable pages', () => {
    setWindowScrollMetrics({ scrollY: 0, scrollHeight: 900, innerHeight: 800 });

    const { getByLabelText } = render(
      <MemoryRouter>
        <BackToTopButton threshold={50} minScrollableOverflow={200} />
      </MemoryRouter>
    );

    setWindowScrollMetrics({ scrollY: 80, scrollHeight: 900, innerHeight: 800 });
    act(() => {
      fireEvent.scroll(window);
    });

    const button = getByLabelText('Scroll to top');
    expect(button).toHaveAttribute('data-visible', 'false');
  });

  it('becomes visible after scrolling past threshold and updates progress ring', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <BackToTopButton threshold={320} />
      </MemoryRouter>
    );

    // Scroll halfway down: maxScroll = 2400 - 800 = 1600, scrollY = 800 => 50%
    setWindowScrollMetrics({ scrollY: 800, scrollHeight: 2400, innerHeight: 800 });
    act(() => {
      fireEvent.scroll(window);
    });

    const button = getByLabelText('Scroll to top');
    expect(button).toHaveAttribute('data-visible', 'true');
    expect(button).toHaveAttribute('aria-hidden', 'false');
    expect(button).toHaveAttribute('tabindex', '0');

    const circles = button.querySelectorAll('circle');
    const progressCircle = circles[1] as SVGCircleElement;
    const expectedHalfOffset = 2 * Math.PI * 21 * 0.5;
    expect(parseFloat(progressCircle.style.strokeDashoffset)).toBeCloseTo(
      expectedHalfOffset,
      1
    );
  });

  it('scrolls smoothly to top on click', () => {
    setWindowScrollMetrics({ scrollY: 600, scrollHeight: 2400, innerHeight: 800 });

    const { getByLabelText } = render(
      <MemoryRouter>
        <BackToTopButton />
      </MemoryRouter>
    );

    const button = getByLabelText('Scroll to top');
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });

  it('uses instant scroll behavior when prefers-reduced-motion is enabled', () => {
    vi.mocked(window.matchMedia).mockImplementationOnce((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    setWindowScrollMetrics({ scrollY: 600, scrollHeight: 2400, innerHeight: 800 });

    const { getByLabelText } = render(
      <MemoryRouter>
        <BackToTopButton />
      </MemoryRouter>
    );

    fireEvent.click(getByLabelText('Scroll to top'));

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  });

  it('supports a custom scrollContainerRef (e.g. AdminLayout main pane)', () => {
    const scrollToMock = vi.fn();

    const ContainerHarness: React.FC = () => {
      const containerRef = useRef<HTMLDivElement>(null);
      return (
        <div>
          <div ref={containerRef} data-testid="scroll-container" />
          <BackToTopButton scrollContainerRef={containerRef} threshold={200} />
        </div>
      );
    };

    const { getByTestId, getByLabelText } = render(
      <MemoryRouter>
        <ContainerHarness />
      </MemoryRouter>
    );

    const container = getByTestId('scroll-container');
    Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2000 });
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 600 });
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 450,
    });
    container.scrollTo = scrollToMock;

    act(() => {
      fireEvent.scroll(container);
    });

    const button = getByLabelText('Scroll to top');
    expect(button).toHaveAttribute('data-visible', 'true');

    fireEvent.click(button);
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('hides and resets when navigating from a long scrolled page to a short page', () => {
    setWindowScrollMetrics({ scrollY: 600, scrollHeight: 2400, innerHeight: 800 });

    const RouteHarness: React.FC = () => {
      const navigate = useNavigate();
      return (
        <div>
          <button type="button" onClick={() => navigate('/short-page')}>
            Go Short
          </button>
          <BackToTopButton />
        </div>
      );
    };

    const { getByText, getByLabelText } = render(
      <MemoryRouter initialEntries={['/long-page']}>
        <RouteHarness />
      </MemoryRouter>
    );

    const button = getByLabelText('Scroll to top');
    expect(button).toHaveAttribute('data-visible', 'true');

    // Simulate route reset to short page
    setWindowScrollMetrics({ scrollY: 0, scrollHeight: 700, innerHeight: 800 });
    act(() => {
      fireEvent.click(getByText('Go Short'));
    });

    expect(button).toHaveAttribute('data-visible', 'false');
  });
});
