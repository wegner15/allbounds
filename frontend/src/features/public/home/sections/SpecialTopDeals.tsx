import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Hotel, Car, Compass } from 'lucide-react';
import { useSpecialDeals } from '../../hooks/useSpecialDeals';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';
import FromPriceDisplay from '../../../../components/ui/FromPriceDisplay';

// Infer a deal-type badge (icon + label) from the deal's category / name
const getDealBadge = (deal: { name?: string; category?: string; package_type?: string }) => {
  const raw = (deal.category || deal.package_type || deal.name || '').toLowerCase();
  if (raw.includes('flight') || raw.includes('air'))
    return { icon: '✈️', label: 'Flight' };
  if (raw.includes('hotel') || raw.includes('resort') || raw.includes('lodge') || raw.includes('stay'))
    return { icon: '🏨', label: 'Hotel' };
  if (raw.includes('car') || raw.includes('drive') || raw.includes('transfer'))
    return { icon: '🚗', label: 'Car' };
  if (
    raw.includes('activity') ||
    raw.includes('tour') ||
    raw.includes('safari') ||
    raw.includes('adventure')
  )
    return { icon: '🎯', label: 'Activity' };
  return { icon: '🌍', label: 'Package' };
};

const renderInclusionIcons = (inclusionItems?: any[]) => {
  if (!inclusionItems || inclusionItems.length === 0) return null;
  
  const inclusions = {
    flight: false,
    hotel: false,
    car: false,
    activity: false
  };

  inclusionItems.forEach(item => {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const icon = (item.icon || '').toLowerCase();

    if (name.includes('flight') || category.includes('flight') || icon.includes('plane') || icon.includes('flight')) {
      inclusions.flight = true;
    }
    if (name.includes('hotel') || name.includes('accommodation') || name.includes('stay') || name.includes('lodge') || category.includes('hotel') || category.includes('accommodation') || icon.includes('hotel') || icon.includes('bed')) {
      inclusions.hotel = true;
    }
    if (name.includes('car') || name.includes('transfer') || name.includes('transport') || category.includes('transport') || category.includes('car') || icon.includes('car') || icon.includes('transport')) {
      inclusions.car = true;
    }
    if (name.includes('activity') || name.includes('game drive') || name.includes('safari') || name.includes('tour') || category.includes('activities') || category.includes('activity') || icon.includes('compass') || icon.includes('activity') || icon.includes('map')) {
      inclusions.activity = true;
    }
  });

  return (
    <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-sm px-2 py-1 rounded-md text-white">
      {inclusions.flight && (
        <span title="Flights Included">
          <Plane className="w-3.5 h-3.5" />
        </span>
      )}
      {inclusions.hotel && (
        <span title="Accommodation Included">
          <Hotel className="w-3.5 h-3.5" />
        </span>
      )}
      {inclusions.car && (
        <span title="Transfers Included">
          <Car className="w-3.5 h-3.5" />
        </span>
      )}
      {inclusions.activity && (
        <span title="Activities Included">
          <Compass className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
};

const SpecialTopDeals: React.FC = () => {
  const { data: deals, isLoading, error } = useSpecialDeals();

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 336; // 320px card + 16px gap
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () =>
    [...Array(6)].map((_, i) => (
      <div key={i} className="relative flex-shrink-0 w-80 h-96 rounded-xl overflow-hidden bg-charcoal/10 animate-pulse" />
    ));

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h2 font-playfair font-bold text-charcoal mb-2">Our Special Top Deals</h2>
            <p className="text-body font-lato text-charcoal/70 max-w-2xl">
              Enjoy our seasonal holiday special offers, meticulously curated to provide you with
              unforgettable experiences at exceptional value.
            </p>
          </div>
          <Link
            to="/packages"
            className="text-primary hover:text-primary-dark flex items-center font-lato font-medium transition-colors"
          >
            View All Deals
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="special-deals-container">
            {isLoading
              ? renderSkeletons()
              : deals?.map(deal => {
                  const badge = getDealBadge(
                    deal as { name?: string; category?: string; package_type?: string }
                  );
                  return (
                    <Link
                      key={deal.id}
                      to={`/packages/${deal.country?.slug || 'unknown'}/${deal.slug}`}
                      className="relative flex-shrink-0 w-80 h-96 rounded-xl overflow-hidden group cursor-pointer block shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Card image */}
                      <img
                        src={getImageUrlWithFallback(
                          deal.image_id,
                          IMAGE_VARIANTS.MEDIUM,
                          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80'
                        )}
                        alt={deal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Deal-type badge — top left */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </div>

                      {/* Bottom gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent flex items-end">
                        <div className="p-4 w-full">
                          <h3 className="text-white font-semibold text-lg leading-tight drop-shadow-sm">
                            {deal.name}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <FromPriceDisplay
                              packageId={deal.id}
                              basePrice={deal.price}
                              currency="$"
                              className="text-white/90 text-sm"
                            />
                            {renderInclusionIcons(deal.inclusion_items)}
                          </div>
                          {deal.conversion_triggers && deal.conversion_triggers.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {deal.conversion_triggers.slice(0, 2).map((trigger, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center bg-primary/80 text-white text-xs font-medium px-2 py-0.5 rounded-full"
                                >
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={() => scrollContainer('special-deals-container', 'left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('special-deals-container', 'right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 rounded-full shadow-lg transition-all duration-200 z-10"
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
