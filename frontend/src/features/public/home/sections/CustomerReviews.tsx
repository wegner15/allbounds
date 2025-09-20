import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useCustomerReviews } from '../../hooks/useCustomerReviews';

const CustomerReviews: React.FC = () => {
  const { data: reviews, isLoading, error } = useCustomerReviews();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex(prevIndex => (prevIndex + 1) % reviews.length);
      }, 5000); // Change testimonial every 5 seconds

      return () => clearInterval(interval);
    }
  }, [reviews]);

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-start">
        <div className="w-16 h-16 rounded-full mr-6 bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What our customers are saying about us?</h2>
            <p className="text-gray-600 mb-6">
              At Allbound Vacations, customer satisfaction is very important to us. That's why we like to regularly check in with our customers and ask them how we're doing.
            </p>
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-4xl font-bold text-blue-600">120+</p>
                <p className="text-gray-600">Happy People</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">4.70</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">Overall rating</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            {isLoading ? renderSkeleton() : error ? (
              <div className="text-center text-red-500">Failed to load reviews.</div>
            ) : reviews && reviews.length > 0 ? (
              <>
                <div className="relative h-48 overflow-hidden">
                  {reviews.map((review, index) => (
                      <div 
                          key={review.id}
                          className={`absolute w-full transition-opacity duration-500 ease-in-out ${
                              index === activeIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                      >
                          <div className="flex items-start">
                              <img 
                                  src={`https://i.pravatar.cc/150?u=${review.author_email}`}
                                  alt={review.author_name}
                                  className="w-16 h-16 rounded-full mr-6"
                              />
                              <div>
                                  <p className="text-gray-700 text-lg italic mb-4">"{review.content}"</p>
                                  <p className="font-bold text-gray-900">{review.author_name}</p>
                                  {/* Placeholder for author title/location */}
                              </div>
                          </div>
                      </div>
                  ))}
                </div>
                <div className="flex items-center mt-6">
                    <span className="text-gray-700 font-bold mr-4">
                        {String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${((activeIndex + 1) / reviews.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-gray-500 ml-4">
                        {String(reviews.length).padStart(2, '0')}
                    </span>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">No customer reviews yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
