import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActivityBySlug, useActivityTrips } from '../../../lib/hooks/useActivities';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import FromPriceDisplay from '../../../components/ui/FromPriceDisplay';
import { format } from 'date-fns';

const ActivityDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: activity, isLoading, error } = useActivityBySlug(slug || '');
    const { data: trips, isLoading: tripsLoading } = useActivityTrips(slug || '');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h1>
                <Link to="/activities" className="text-teal-600 hover:text-teal-700">
                    Return to Activities
                </Link>
            </div>
        );
    }

    const coverImage = activity.cover_image?.url || activity.image_url;

    return (
        <div className="min-h-screen bg-gray-50">
            <Helmet>
                <title>{activity.name} | AllBounds Vacations</title>
                <meta name="description" content={activity.summary || activity.description.substring(0, 160)} />
            </Helmet>

            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px]">
                {coverImage ? (
                    <OptimizedImage
                        imageId={activity.image_id || undefined}
                        fallbackUrl={coverImage}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                        variant="large"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-4xl text-gray-500">Image Not Available</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col justify-end pb-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-6">
                            <Breadcrumb
                                items={[
                                    { label: 'Destinations', path: '/destinations' },
                                    // Assuming activity has at least one country, use the first one for breadcrumb
                                    ...(activity.countries && activity.countries.length > 0
                                        ? [
                                            { label: activity.countries[0].name, path: `/destinations/${activity.countries[0].slug}` },
                                            { label: `${activity.countries[0].name} Activities`, path: `/destinations/${activity.countries[0].slug}/activities` }
                                        ]
                                        : []),
                                    { label: activity.name }
                                ]}
                                variant="dark"
                            />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{activity.name}</h1>
                        {activity.summary && (
                            <p className="text-xl text-white/90 max-w-3xl">{activity.summary}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Activity</h2>
                            <div
                                className="prose max-w-none text-gray-600"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description) }}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Details</h3>

                            {/* Country info if available */}
                            {activity.countries && activity.countries.length > 0 && (
                                <div className="flex items-start mb-4 text-gray-600">
                                    <MapPin className="w-5 h-5 mr-3 mt-0.5 text-teal-600" />
                                    <div>
                                        <span className="block font-medium text-gray-900">Location</span>
                                        <span>{activity.countries.map(c => c.name).join(', ')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Add duration if available (Activity type definition in api.ts doesn't show duration, checking...) 
                   Wait, I don't see duration in Activity interface in api.ts, but `ActivitySummary` has `duration_minutes`.
                   The full `Activity` interface might not have it or it might be missing from type def.
                   I will omit it for now if it's not strictly typed, or check if I can use it.
                   Actually `api.ts` `Activity` interface lines 120-131 shows simple fields. 
                   I'll stick to what's available.
               */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Tours Section */}
            {trips && (trips.packages.length > 0 || trips.group_trips.length > 0) && (
                <div className="container mx-auto px-4 py-12 border-t border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 font-playfair">Recommended Tours including {activity.name}</h2>

                    {/* Holiday Packages */}
                    {trips.packages.length > 0 && (
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold text-charcoal mb-8 flex items-center">
                                <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mr-3">
                                    <MapPin className="w-5 h-5" />
                                </span>
                                Holiday Packages
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trips.packages.map(pkg => (
                                    <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                                        <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`} className="relative h-64 overflow-hidden group">
                                            <img
                                                src={getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM)}
                                                alt={pkg.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {pkg.holiday_types && pkg.holiday_types.length > 0 && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-sm text-teal-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm font-inter">
                                                        {pkg.holiday_types[0].name}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center text-sm text-teal-600 font-semibold mb-2">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {pkg.country?.name}
                                            </div>
                                            <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`}>
                                                <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-teal-600 transition-colors line-clamp-1 font-playfair">
                                                    {pkg.name}
                                                </h4>
                                            </Link>
                                            <div
                                                className="text-gray-600 text-sm mb-6 line-clamp-2 h-10"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.summary || pkg.description || '') }}
                                            />
                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 font-medium font-inter uppercase tracking-wider">From</span>
                                                    <FromPriceDisplay packageId={pkg.id} basePrice={pkg.price} className="text-xl font-bold text-charcoal font-inter" />
                                                </div>
                                                <div className="flex items-center text-gray-500 text-sm font-medium font-inter">
                                                    <Clock className="w-4 h-4 mr-1.5 text-teal-500" />
                                                    {pkg.duration_days} Days
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Group Trips */}
                    {trips.group_trips.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold text-charcoal mb-8 flex items-center">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-3">
                                    <Users className="w-5 h-5" />
                                </span>
                                Scheduled Group Trips
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {trips.group_trips.map(trip => (
                                    <div key={trip.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row h-full border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                        <Link to={`/group-trips/${trip.slug}`} className="md:w-2/5 relative overflow-hidden group">
                                            <img
                                                src={getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.MEDIUM)}
                                                alt={trip.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 min-h-[250px]"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg font-inter uppercase">
                                                    Group Tour
                                                </span>
                                            </div>
                                        </Link>
                                        <div className="p-8 md:w-3/5 flex flex-col">
                                            <div className="flex items-center text-sm text-amber-600 font-semibold mb-2">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {trip.country?.name}
                                            </div>
                                            <Link to={`/group-trips/${trip.slug}`}>
                                                <h4 className="text-2xl font-bold text-charcoal mb-4 hover:text-amber-600 transition-colors line-clamp-1 font-playfair">
                                                    {trip.name}
                                                </h4>
                                            </Link>

                                            <div className="space-y-4 mb-8">
                                                {trip.departures && trip.departures.length > 0 && (
                                                    <div className="flex items-center text-sm text-gray-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                                        <Calendar className="w-5 h-5 mr-3 text-amber-500" />
                                                        <div>
                                                            <span className="block text-xs text-gray-500 font-medium font-inter">Next Departure</span>
                                                            <span className="font-bold font-inter">{format(new Date(trip.departures[0].start_date), 'MMM d, yyyy')}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Users className="w-5 h-5 mr-3 text-gray-400" />
                                                    <span className="font-inter">Up to {trip.max_participants || 12} people</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-100 font-inter">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">From</span>
                                                    <span className="text-2xl font-black text-charcoal">${trip.price}</span>
                                                </div>
                                                <Link
                                                    to={`/group-trips/${trip.slug}`}
                                                    className="bg-charcoal hover:bg-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-gray-200"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityDetailPage;
