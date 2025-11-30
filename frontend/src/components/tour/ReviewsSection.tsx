import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { ReviewDetail } from '../../lib/types/api';

interface ReviewsSectionProps {
  reviews: ReviewDetail[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [visibleReviews, setVisibleReviews] = useState(5);

  // Filter only approved reviews
  const approvedReviews = reviews.filter(review => review.is_approved);

  // Handle case when no reviews exist
  if (approvedReviews.length === 0) {
    return (
      <section id="reviews" className="bg-white rounded-lg shadow-md p-6 md:p-8 scroll-mt-20" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Reviews
        </h2>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4" aria-hidden="true">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience with this tour!
          </p>
        </div>
      </section>
    );
  }

  // Calculate overall rating and breakdown
  const totalReviews = approvedReviews.length;
  const averageRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  // Calculate rating breakdown (5 stars, 4 stars, etc.)
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = approvedReviews.filter(review => Math.floor(review.rating) === stars).length;
    const percentage = (count / totalReviews) * 100;
    return { stars, count, percentage };
  });

  // Get visible reviews
  const displayedReviews = approvedReviews.slice(0, visibleReviews);
  const hasMoreReviews = visibleReviews < approvedReviews.length;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="reviews" className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 scroll-mt-20 border border-gray-100 animate-fade-in" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal mb-6 md:mb-8 font-playfair">
        Reviews
      </h2>

      {/* Overall Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
        {/* Left: Overall Rating */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 sm:p-8 border border-primary/20 shadow-sm">
          <div className="text-5xl sm:text-6xl font-bold text-primary mb-3 font-playfair">
            {averageRating.toFixed(1)}
          </div>
          {renderStars(Math.round(averageRating), 'lg')}
          <p className="text-sm sm:text-base text-gray-600 mt-3 text-center font-medium">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Right: Rating Breakdown */}
        <div className="space-y-2.5 sm:space-y-3">
          {ratingBreakdown.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium text-gray-700">{stars}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Review Cards */}
      <div className="space-y-4 sm:space-y-6" role="list" aria-label="Customer reviews">
        {displayedReviews.map((review) => (
          <article
            key={review.id}
            className={`border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 ${
              review.is_featured ? 'bg-teal-50 border-teal-200' : 'bg-white'
            }`}
            role="listitem"
          >
            {/* Review Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Reviewer Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </div>
                
                {/* Reviewer Info */}
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {review.reviewer_name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex-shrink-0">
                {renderStars(Math.round(review.rating), 'sm')}
              </div>
            </div>

            {/* Review Title */}
            {review.title && (
              <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">
                {review.title}
              </h5>
            )}

            {/* Review Content */}
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {review.content}
            </p>

            {/* Featured Badge */}
            {review.is_featured && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-teal-200">
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-teal-600 text-white">
                  Featured Review
                </span>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreReviews && (
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => setVisibleReviews(prev => prev + 5)}
            className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation min-h-[44px]"
          >
            Load More Reviews
            <svg
              className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Showing {displayedReviews.length} of {approvedReviews.length} reviews
          </p>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
