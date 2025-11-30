import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { ItineraryItemDetail } from '../../lib/types/api';

interface ItineraryMapProps {
  itineraryItems: ItineraryItemDetail[];
  packageName: string;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ itineraryItems, packageName }) => {
  // Extract unique locations from itinerary
  const locations = itineraryItems
    .filter(item => item.location)
    .map((item, index) => ({
      day: item.day_number,
      location: item.location!,
      title: item.title,
      isFirst: index === 0,
      isLast: index === itineraryItems.length - 1,
    }));

  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
          <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
            Tour Route
          </h2>
          <p className="text-sm text-gray-600 mt-1">Follow your journey across destinations</p>
        </div>
      </div>

      {/* Map Placeholder - Can be replaced with actual map integration */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 mb-6 border-2 border-dashed border-primary/20">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
          <p className="text-sm text-gray-500 mt-2">
            Visualize your journey across {locations.length} destinations
          </p>
        </div>
      </div>

      {/* Location Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
          Your Journey
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-success" />
          
          {/* Location Points */}
          <div className="space-y-6">
            {locations.map((loc, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-2">
                {/* Day Badge */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                  loc.isFirst 
                    ? 'bg-gradient-to-br from-success to-green-600 text-white' 
                    : loc.isLast 
                    ? 'bg-gradient-to-br from-error to-red-600 text-white'
                    : 'bg-gradient-to-br from-primary to-primary-dark text-white'
                }`}>
                  {loc.day}
                </div>
                
                {/* Location Info */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <h4 className="font-semibold text-charcoal">{loc.location}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{loc.title}</p>
                    </div>
                    
                    {/* Start/End Badges */}
                    {loc.isFirst && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/20">
                        Start
                      </span>
                    )}
                    {loc.isLast && (
                      <span className="px-2 py-1 bg-error/10 text-error text-xs font-semibold rounded-full border border-error/20">
                        End
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary font-playfair">{locations.length}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Destinations</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
            <div className="text-2xl font-bold text-accent font-playfair">{itineraryItems.length}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Days</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20 col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-success font-playfair">
              {itineraryItems.reduce((acc, item) => 
                acc + (item.attractions?.length || 0) + (item.custom_activities?.length || 0), 0
              )}
            </div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Activities</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryMap;
