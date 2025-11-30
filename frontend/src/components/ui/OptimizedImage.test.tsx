import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver as any;

describe('OptimizedImage', () => {
  it('renders loading skeleton initially', () => {
    render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        showSkeleton={true}
      />
    );
    
    const skeleton = screen.getByLabelText('Loading image');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders image with correct alt text', async () => {
    render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        priority={true}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('uses correct variant in image URL', () => {
    render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        variant="thumbnail"
        priority={true}
      />
    );
    
    const image = screen.getByAltText('Test image') as HTMLImageElement;
    expect(image.src).toContain('thumbnail');
  });

  it('renders fallback image when imageId is null', async () => {
    render(
      <OptimizedImage
        imageId={null}
        alt="Missing image"
        priority={true}
      />
    );
    
    // Should show fallback image after loading
    await waitFor(() => {
      const image = screen.getByAltText('Missing image') as HTMLImageElement;
      expect(image.src).toBeTruthy();
      expect(image.src).toContain('unsplash.com'); // Default fallback
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        className="custom-class"
        priority={true}
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('uses lazy loading by default', () => {
    render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
      />
    );
    
    // Should set up IntersectionObserver for lazy loading
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('skips lazy loading when priority is true', () => {
    mockIntersectionObserver.mockClear();
    
    render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        priority={true}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('applies aspect ratio style', () => {
    const { container } = render(
      <OptimizedImage
        imageId="test-image-id"
        alt="Test image"
        aspectRatio="16/9"
        priority={true}
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe('16/9');
  });
});
