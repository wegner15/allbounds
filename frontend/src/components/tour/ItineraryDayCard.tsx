import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../utils/imageUtils';
import type { 
  ItineraryItemDetail, 
  HotelSummary, 
  AttractionSummary, 
  ItineraryActivityDetail 
} from '../../lib/types/api';
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Coffee, 
  Utensils, 
  Moon,
  Clock
} from 'lucide-react';

interface ItineraryDayCardProps {
  itineraryItem: ItineraryItemDetail;
  isExpanded: boolean;
  onToggle: () => void;
}

const ItineraryDayCard: React.FC<ItineraryDayCardProps> = ({
  itineraryItem,
  isExpanded,
  onToggle,
}) => {
  const { 
    day_number, 
    title, 
    location, 
    description, 
    custom_activities,
    hotels, 
    attractions, 
    accommodation_notes 
  } = itineraryItem;

  // Group activities by meal type
  const meals = custom_activities?.filter(a => a.is_meal) || [];
  const hasMeals = meals.length > 0;
  const hasBreakfast = meals.some(m => m.meal_type?.toLowerCase() === 'breakfast');
  const hasLunch = meals.some(m => m.meal_type?.toLowerCase() === 'lunch');
  const hasDinner = meals.some(m => m.meal_type?.toLowerCase() === 'dinner');

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-primary/30 animate-fade-in">
      {/* Day Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 md:p-6 flex items-start justify-between hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-200 text-left touch-manipulation min-h-[60px]"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm flex-shrink-0 shadow-md">
              {day_number}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-charcoal truncate font-playfair">{title}</h3>
              {itineraryItem.date && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(itineraryItem.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
          
          {location && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 ml-10 sm:ml-13">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{location}</span>
            </div>
          )}

          {/* Meal Indicators */}
          {hasMeals && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 ml-10 sm:ml-13">
              {hasBreakfast && (
                <div className="flex items-center gap-1.5 text-gray-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200" title="Breakfast included">
                  <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-600" />
                  <span className="text-xs font-medium">Breakfast</span>
                </div>
              )}
              {hasLunch && (
                <div className="flex items-center gap-1.5 text-gray-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200" title="Lunch included">
                  <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-orange-600" />
                  <span className="text-xs font-medium">Lunch</span>
                </div>
              )}
              {hasDinner && (
                <div className="flex items-center gap-1.5 text-gray-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200" title="Dinner included">
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-indigo-600" />
                  <span className="text-xs font-medium">Dinner</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-3 sm:ml-4 flex-shrink-0 flex items-center">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-gray-100 animate-slide-down">
          {/* Description */}
          {description && (
            <div className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}

          {/* Activities Timeline */}
          {custom_activities && custom_activities.length > 0 && (
            <div className="mt-4 sm:mt-5 md:mt-6">
              <h4 className="text-base sm:text-lg font-semibold text-charcoal mb-3 sm:mb-4 font-playfair">Activities</h4>
              <div className="space-y-4">
                {custom_activities
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {hotels && hotels.length > 0 && (
            <div className="mt-4 sm:mt-5 md:mt-6">
              <h4 className="text-base sm:text-lg font-semibold text-charcoal mb-3 sm:mb-4 font-playfair">Accommodation</h4>
              <div className="space-y-2 sm:space-y-3">
                {hotels.map((hotel) => (
                  <HotelItem key={hotel.id} hotel={hotel} />
                ))}
              </div>
              {accommodation_notes && (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 italic">{accommodation_notes}</p>
              )}
            </div>
          )}

          {/* Attractions */}
          {attractions && attractions.length > 0 && (
            <div className="mt-4 sm:mt-5 md:mt-6">
              <h4 className="text-base sm:text-lg font-semibold text-charcoal mb-3 sm:mb-4 font-playfair">Attractions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {attractions.map((attraction) => (
                  <AttractionItem key={attraction.id} attraction={attraction} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{ activity: ItineraryActivityDetail }> = ({ activity }) => {
  return (
    <div className="flex gap-3 pl-4 border-l-2 border-primary relative before:absolute before:left-[-5px] before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-primary before:shadow-md">
      <div className="flex-shrink-0 pt-1">
        {activity.time && (
          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">{activity.time}</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-charcoal">{activity.activity_title}</h5>
        {activity.activity_description && (
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{activity.activity_description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          {activity.location && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="font-medium">{activity.location}</span>
            </span>
          )}
          {activity.duration_hours && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">{activity.duration_hours}h</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Hotel Item Component
const HotelItem: React.FC<{ hotel: HotelSummary }> = ({ hotel }) => {
  return (
    <Link
      to={`/hotels/${hotel.slug}`}
      className="group flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl hover:shadow-md active:shadow-sm transition-all duration-200 touch-manipulation min-h-[60px] border border-gray-200 hover:border-primary/30"
    >
      {hotel.image_id && (
        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shadow-sm">
          <OptimizedImage
            imageId={hotel.image_id}
            alt={hotel.name}
            variant="thumbnail"
            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
            objectFit="cover"
            loading="lazy"
            showSkeleton={true}
            sizes={getResponsiveImageSizes('thumbnail')}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-semibold text-sm sm:text-base text-charcoal truncate group-hover:text-primary transition-colors">{hotel.name}</h5>
          {hotel.stars && (
            <div className="flex items-center flex-shrink-0">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm drop-shadow-sm">★</span>
              ))}
            </div>
          )}
        </div>
        {hotel.city && (
          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{hotel.city}</p>
        )}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs bg-white text-gray-700 border border-gray-200 shadow-sm"
              >
                {amenity.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

// Attraction Item Component
const AttractionItem: React.FC<{ attraction: AttractionSummary }> = ({ attraction }) => {
  return (
    <Link
      to={`/attractions/${attraction.slug}`}
      className="group flex gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg hover:shadow-md active:shadow-sm transition-all duration-200 touch-manipulation min-h-[60px] border border-primary/20 hover:border-primary/40"
    >
      {attraction.image_id && (
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shadow-sm">
          <OptimizedImage
            imageId={attraction.image_id}
            alt={attraction.name}
            variant="thumbnail"
            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
            objectFit="cover"
            loading="lazy"
            showSkeleton={true}
            sizes={getResponsiveImageSizes('thumbnail')}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-charcoal text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">{attraction.name}</h5>
        {attraction.city && (
          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 truncate font-medium">{attraction.city}</p>
        )}
        {attraction.summary && (
          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">{attraction.summary}</p>
        )}
      </div>
    </Link>
  );
};

export default ItineraryDayCard;
