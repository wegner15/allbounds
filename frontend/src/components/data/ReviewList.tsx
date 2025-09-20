import React from 'react';
import Rating from '../ui/Rating';

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
  avatar?: string;
}

export interface ReviewListProps {
  reviews: Review[];
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  className = '',
}) => {
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start">
            {review.avatar ? (
              <img 
                src={review.avatar} 
                alt={review.author} 
                className="h-10 w-10 rounded-full mr-4"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-paper flex items-center justify-center mr-4">
                <span className="text-charcoal font-medium">
                  {review.author.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-charcoal">{review.author}</h4>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <Rating value={review.rating} size="sm" className="mt-1" />
              <p className="mt-2 text-gray-700">{review.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
