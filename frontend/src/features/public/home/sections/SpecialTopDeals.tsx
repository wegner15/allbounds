import React from 'react';
import { Link } from 'react-router-dom';
import { useSpecialDeals } from '../../hooks/useSpecialDeals';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';
import FromPriceDisplay from '../../../../components/ui/FromPriceDisplay';

const SpecialTopDeals: React.FC = () => {
  const { data: deals, isLoading, error } = useSpecialDeals();

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 336; // 320px (w-80) + 16px (gap)
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () => (
    [...Array(6)].map((_, index) => (
      <div key={index} className="relative flex-shrink-0 w-80 h-96 rounded-lg overflow-hidden bg-charcoal/10 animate-pulse"></div>
    ))
  );

  if (error) {
    return (
      <div className="py-16 bg-paper">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500 font-lato">Failed to load special deals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-paper">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h2 font-playfair font-bold text-charcoal mb-2">Our Special Top Deals</h2>
            <p className="text-body font-lato text-charcoal/70 max-w-2xl">
              Enjoy our seasonal holiday special offers, meticulously curated to provide you with unforgettable experiences at exceptional value.
            </p>
          </div>
          <Link
            to="/packages"
            className="text-teal hover:text-teal/80 flex items-center font-lato font-medium"
          >
            View All Deals
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="special-deals-container">
            {isLoading ? renderSkeletons() : deals?.map(deal => (
              <Link
                key={deal.id}
                to={`/packages/${deal.slug}`}
                className="relative flex-shrink-0 w-80 h-96 rounded-lg overflow-hidden group cursor-pointer block"
              >
                <img
                  src={getImageUrlWithFallback(deal.image_id, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80')}
                  alt={deal.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                 <div className="p-4">
                     <h3 className="text-white font-semibold text-lg">{deal.name}</h3>
                     <FromPriceDisplay
                       packageId={deal.id}
                       basePrice={deal.price}
                       currency="$"
                       className="text-white/80 text-sm"
                     />
                   </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollContainer('special-deals-container', 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-paper/90 hover:bg-paper text-charcoal hover:text-charcoal/80 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('special-deals-container', 'right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-paper/90 hover:bg-paper text-charcoal hover:text-charcoal/80 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialTopDeals;
