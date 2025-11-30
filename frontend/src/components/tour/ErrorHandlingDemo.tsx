/**
 * ErrorHandlingDemo Component
 * 
 * This component demonstrates all error handling states for the tour page.
 * Use this for testing and showcasing error handling capabilities.
 * 
 * To use: Import and render in a test route or development page
 */

import React, { useState } from 'react';
import ErrorDisplay, { SectionError, EmptyState } from './ErrorDisplay';
import { 
  PackageDetailSkeleton,
  HeroSkeleton,
  OverviewSkeleton,
  ItinerarySkeleton,
  HotelsSkeleton,
  AttractionsSkeleton,
  ReviewsSkeleton,
  BookingSidebarSkeleton
} from './LoadingSkeletons';
import { Star, Hotel, Landmark } from 'lucide-react';

const ErrorHandlingDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('full-skeleton');

  const demos = [
    { id: 'full-skeleton', label: 'Full Page Skeleton' },
    { id: 'hero-skeleton', label: 'Hero Skeleton' },
    { id: 'overview-skeleton', label: 'Overview Skeleton' },
    { id: 'itinerary-skeleton', label: 'Itinerary Skeleton' },
    { id: 'hotels-skeleton', label: 'Hotels Skeleton' },
    { id: 'attractions-skeleton', label: 'Attractions Skeleton' },
    { id: 'reviews-skeleton', label: 'Reviews Skeleton' },
    { id: 'sidebar-skeleton', label: 'Sidebar Skeleton' },
    { id: 'network-error', label: 'Network Error' },
    { id: 'server-error', label: 'Server Error' },
    { id: 'notfound-error', label: 'Not Found Error' },
    { id: 'generic-error', label: 'Generic Error' },
    { id: 'section-error', label: 'Section Error' },
    { id: 'empty-state', label: 'Empty State' },
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'full-skeleton':
        return <PackageDetailSkeleton />;
      
      case 'hero-skeleton':
        return (
          <div className="max-w-7xl mx-auto">
            <HeroSkeleton />
          </div>
        );
      
      case 'overview-skeleton':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <OverviewSkeleton />
          </div>
        );
      
      case 'itinerary-skeleton':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <ItinerarySkeleton />
          </div>
        );
      
      case 'hotels-skeleton':
        return (
          <div className="max-w-6xl mx-auto p-4">
            <HotelsSkeleton />
          </div>
        );
      
      case 'attractions-skeleton':
        return (
          <div className="max-w-6xl mx-auto p-4">
            <AttractionsSkeleton />
          </div>
        );
      
      case 'reviews-skeleton':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <ReviewsSkeleton />
          </div>
        );
      
      case 'sidebar-skeleton':
        return (
          <div className="max-w-sm mx-auto p-4">
            <BookingSidebarSkeleton />
          </div>
        );
      
      case 'network-error':
        return (
          <ErrorDisplay
            type="network"
            onRetry={() => alert('Retry clicked!')}
            showBackButton={true}
            showHomeButton={true}
          />
        );
      
      case 'server-error':
        return (
          <ErrorDisplay
            type="server"
            onRetry={() => alert('Retry clicked!')}
            showBackButton={true}
            showHomeButton={true}
          />
        );
      
      case 'notfound-error':
        return (
          <ErrorDisplay
            type="notfound"
            showBackButton={true}
            showHomeButton={true}
          />
        );
      
      case 'generic-error':
        return (
          <ErrorDisplay
            type="generic"
            title="Custom Error Title"
            message="This is a custom error message that can be displayed."
            onRetry={() => alert('Retry clicked!')}
            showBackButton={true}
            showHomeButton={true}
          />
        );
      
      case 'section-error':
        return (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Hotels Section</h3>
              <SectionError 
                message="Failed to load hotels"
                onRetry={() => alert('Retry hotels!')}
              />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Attractions Section</h3>
              <SectionError 
                message="Failed to load attractions"
                onRetry={() => alert('Retry attractions!')}
              />
            </div>
          </div>
        );
      
      case 'empty-state':
        return (
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold mb-4">Reviews Empty State</h3>
              <EmptyState
                icon={<Star className="w-12 h-12" />}
                title="No reviews yet"
                message="Be the first to share your experience with this tour!"
              />
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold mb-4">Hotels Empty State</h3>
              <EmptyState
                icon={<Hotel className="w-12 h-12" />}
                title="No hotels available"
                message="Hotels will be added soon for this tour package."
              />
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold mb-4">Attractions Empty State</h3>
              <EmptyState
                icon={<Landmark className="w-12 h-12" />}
                title="No attractions listed"
                message="Check back later for featured attractions on this tour."
              />
            </div>
          </div>
        );
      
      default:
        return <div>Select a demo from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Error Handling Demo
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Showcase of all error handling and loading states
          </p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 sticky top-16">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Loading States
          </h2>
          <div className="space-y-1 mb-6">
            {demos.slice(0, 8).map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Error States
          </h2>
          <div className="space-y-1">
            {demos.slice(8).map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderDemo()}
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;
