import React, { useState } from 'react';
import {
  DestinationErrorDisplay,
  NotFoundError,
  NetworkError,
  SectionError,
  EmptyState
} from './DestinationErrorDisplay';
import {
  BestTimeToVisitSkeleton,
  MapSkeleton,
  SectionSkeleton
} from './DestinationLoadingSkeletons';
import { DestinationErrorBoundary } from './DestinationErrorBoundary';
import { Package, MapPin, Hotel, Compass } from 'lucide-react';

/**
 * Demo component to showcase error handling and loading states
 * This is for development/testing purposes only
 */
const ErrorHandlingDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('none');

  const demos = [
    { id: 'notfound', label: '404 Not Found', icon: MapPin },
    { id: 'network', label: 'Network Error', icon: Package },
    { id: 'server', label: 'Server Error', icon: Hotel },
    { id: 'section', label: 'Section Error', icon: Compass },
    { id: 'empty', label: 'Empty State', icon: Package },
    { id: 'skeleton-visit', label: 'Visit Info Skeleton', icon: MapPin },
    { id: 'skeleton-map', label: 'Map Skeleton', icon: MapPin },
    { id: 'skeleton-packages', label: 'Packages Skeleton', icon: Package },
    { id: 'skeleton-hotels', label: 'Hotels Skeleton', icon: Hotel },
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'notfound':
        return (
          <NotFoundError
            destinationSlug="test-destination"
            onRetry={() => alert('Retry clicked!')}
          />
        );
      
      case 'network':
        return (
          <NetworkError
            onRetry={() => alert('Retry clicked!')}
          />
        );
      
      case 'server':
        return (
          <DestinationErrorDisplay
            type="server"
            onRetry={() => alert('Retry clicked!')}
          />
        );
      
      case 'section':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <SectionError
              message="Failed to load packages"
              sectionName="Packages"
              onRetry={() => alert('Retry clicked!')}
            />
          </div>
        );
      
      case 'empty':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <EmptyState
              icon={<Package className="w-16 h-16" />}
              title="No Packages Available"
              message="There are currently no packages for this destination. Check back later!"
              actionLabel="Browse All Packages"
              actionLink="/packages"
            />
          </div>
        );
      
      case 'skeleton-visit':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <BestTimeToVisitSkeleton />
          </div>
        );
      
      case 'skeleton-map':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <MapSkeleton />
          </div>
        );
      
      case 'skeleton-packages':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <SectionSkeleton cardType="package" cardCount={6} columns={2} />
          </div>
        );
      
      case 'skeleton-hotels':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <SectionSkeleton cardType="hotel" cardCount={6} columns={2} />
          </div>
        );
      
      default:
        return (
          <div className="max-w-4xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Handling & Loading States Demo
            </h2>
            <p className="text-gray-600">
              Select a demo from the buttons above to see different error and loading states.
            </p>
          </div>
        );
    }
  };

  return (
    <DestinationErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Demo Controls */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Destination Page - Error Handling Demo
            </h1>
            <div className="flex flex-wrap gap-2">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeDemo === demo.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {demo.label}
                  </button>
                );
              })}
              {activeDemo !== 'none' && (
                <button
                  onClick={() => setActiveDemo('none')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="py-8">
          {renderDemo()}
        </div>

        {/* Info Panel */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Current Demo:</h3>
          <p className="text-sm text-gray-600">
            {activeDemo === 'none' 
              ? 'No demo selected' 
              : demos.find(d => d.id === activeDemo)?.label}
          </p>
        </div>
      </div>
    </DestinationErrorBoundary>
  );
};

export default ErrorHandlingDemo;
