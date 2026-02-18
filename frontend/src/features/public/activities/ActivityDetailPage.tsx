import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActivityBySlug, useActivityTrips } from '../../../lib/hooks/useActivities';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import ImageCarousel from '../../../components/ui/ImageCarousel';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import FromPriceDisplay from '../../../components/ui/FromPriceDisplay';
import { MapPin, Clock, Users, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const ActivityDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: activity, isLoading, error } = useActivityBySlug(slug || '');
    const { data: trips } = useActivityTrips(slug || '');

    // Keyboard navigation for gallery
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!activity) return;
            // ImageCarousel handles its own internal navigation
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activity]);

    // Build gallery images from media_assets + cover_image
    const getAllImages = () => {
        if (!activity) return [];

        const images: Array<{
            id: number;
            filename: string;
            alt_text?: string;
            title?: string;
            caption?: string;
            file_path: string;
        }> = [];

        // Add gallery images from media_assets
        const activityResponse = activity as any; // ActivityResponse has media_assets
        if (activityResponse.media_assets && activityResponse.media_assets.length > 0) {
            activityResponse.media_assets.forEach((asset: any) => {
                const url = getImageUrlWithFallback(asset.id || asset.image_id, IMAGE_VARIANTS.LARGE) || asset.url || asset.file_path;
                if (url) {
                    images.push({
                        id: asset.id,
                        filename: url,
                        file_path: url,
                        alt_text: asset.alt_text || activity.name,
                        title: asset.title,
                        caption: asset.caption,
                    });
                }
            });
        }

        // Add cover image if not already included
        const coverUrl = activity.cover_image?.url || (activity as any).image_url;
        if (coverUrl && !images.some(img => img.file_path === coverUrl)) {
            images.unshift({
                id: 0,
                filename: coverUrl,
                file_path: coverUrl,
                alt_text: `${activity.name} Cover Image`,
            });
        }

        return images;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
                        <div className="grid gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-xl p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity not found</h2>
                    <p className="text-gray-600 mb-6">The activity you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/activities"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Activities
                    </Link>
                </div>
            </div>
        );
    }

    const allImages = getAllImages();
    const primaryCountry = activity.countries && activity.countries.length > 0 ? activity.countries[0] : null;

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>{activity.name} | AllBounds Vacations</title>
                <meta name="description" content={activity.summary || activity.description?.substring(0, 160)} />
            </Helmet>

            {/* Breadcrumb */}
            <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-gray-500">
                                    <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                    <span className="sr-only">Home</span>
                                </Link>
                            </li>
                            {primaryCountry && (
                                <li>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <Link to={`/destinations/${primaryCountry.slug}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                            {primaryCountry.name}
                                        </Link>
                                    </div>
                                </li>
                            )}
                            {primaryCountry && (
                                <li>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <Link to={`/destinations/${primaryCountry.slug}/activities`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                            {primaryCountry.name} Activities
                                        </Link>
                                    </div>
                                </li>
                            )}
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                                        {activity.name}
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Image Gallery Carousel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ImageCarousel
                    images={allImages}
                    className="rounded-2xl overflow-hidden shadow-2xl h-[480px]"
                />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-playfair">
                                {activity.name}
                            </h1>

                            {activity.countries && activity.countries.length > 0 && (
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                                    {activity.countries.map(c => c.name).join(', ')}
                                </div>
                            )}

                            {activity.summary && (
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {activity.summary}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        {activity.description && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Activity</h2>
                                <div
                                    className="prose max-w-none text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description) }}
                                />
                            </div>
                        )}

                        {/* Activity Details */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Information</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {activity.countries && activity.countries.length > 0 && (
                                    <div className="flex items-center">
                                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">Location</span>
                                            <p className="text-sm text-gray-600">{activity.countries.map(c => c.name).join(', ')}</p>
                                        </div>
                                    </div>
                                )}

                                {(activity as any).duration_minutes && (
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">Duration</span>
                                            <p className="text-sm text-gray-600">
                                                {Math.floor((activity as any).duration_minutes / 60) > 0
                                                    ? `${Math.floor((activity as any).duration_minutes / 60)}h `
                                                    : ''}
                                                {(activity as any).duration_minutes % 60 > 0
                                                    ? `${(activity as any).duration_minutes % 60}m`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommended Tours Section */}
                        {trips && (trips.packages.length > 0 || trips.group_trips.length > 0) && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Recommended Tours including {activity.name}
                                </h2>

                                {/* Holiday Packages */}
                                {trips.packages.length > 0 && (
                                    <div className="mb-10">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                            <span className="w-7 h-7 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mr-2">
                                                <MapPin className="w-4 h-4" />
                                            </span>
                                            Holiday Packages
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {trips.packages.map(pkg => (
                                                <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-gray-100">
                                                    <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`} className="relative h-48 overflow-hidden group">
                                                        <img
                                                            src={getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM)}
                                                            alt={pkg.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        {pkg.holiday_types && pkg.holiday_types.length > 0 && (
                                                            <div className="absolute top-3 left-3">
                                                                <span className="bg-white/90 backdrop-blur-sm text-teal-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                                    {pkg.holiday_types[0].name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div className="p-5 flex flex-col flex-grow">
                                                        <div className="flex items-center text-xs text-teal-600 font-semibold mb-1.5">
                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                            {pkg.country?.name}
                                                        </div>
                                                        <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`}>
                                                            <h4 className="text-base font-bold text-gray-900 mb-2 hover:text-teal-600 transition-colors line-clamp-1 font-playfair">
                                                                {pkg.name}
                                                            </h4>
                                                        </Link>
                                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">From</span>
                                                                <FromPriceDisplay packageId={pkg.id} basePrice={pkg.price} className="text-lg font-bold text-gray-900" />
                                                            </div>
                                                            <div className="flex items-center text-gray-500 text-sm">
                                                                <Clock className="w-4 h-4 mr-1 text-teal-500" />
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
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                            <span className="w-7 h-7 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-2">
                                                <Users className="w-4 h-4" />
                                            </span>
                                            Scheduled Group Trips
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {trips.group_trips.map(trip => (
                                                <div key={trip.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                                    <Link to={`/group-trips/${trip.slug}`} className="md:w-2/5 relative overflow-hidden group">
                                                        <img
                                                            src={getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.MEDIUM)}
                                                            alt={trip.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 min-h-[200px]"
                                                        />
                                                        <div className="absolute top-3 left-3">
                                                            <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg uppercase">
                                                                Group Tour
                                                            </span>
                                                        </div>
                                                    </Link>
                                                    <div className="p-6 md:w-3/5 flex flex-col">
                                                        <div className="flex items-center text-xs text-amber-600 font-semibold mb-1.5">
                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                            {trip.country?.name}
                                                        </div>
                                                        <Link to={`/group-trips/${trip.slug}`}>
                                                            <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-amber-600 transition-colors line-clamp-1 font-playfair">
                                                                {trip.name}
                                                            </h4>
                                                        </Link>
                                                        <div className="space-y-3 mb-6">
                                                            {trip.departures && trip.departures.length > 0 && (
                                                                <div className="flex items-center text-sm text-gray-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                                                    <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                                                                    <div>
                                                                        <span className="block text-xs text-gray-500 font-medium">Next Departure</span>
                                                                        <span className="font-bold">{format(new Date(trip.departures[0].start_date), 'MMM d, yyyy')}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                                Up to {trip.max_participants || 12} people
                                                            </div>
                                                        </div>
                                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">From</span>
                                                                <span className="text-xl font-black text-gray-900">${trip.price}</span>
                                                            </div>
                                                            <Link
                                                                to={`/group-trips/${trip.slug}`}
                                                                className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-gray-200"
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

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Activity Details</h3>

                            {/* Location */}
                            {activity.countries && activity.countries.length > 0 && (
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 block">Location</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {activity.countries.map(c => (
                                                    <Link
                                                        key={c.id}
                                                        to={`/destinations/${c.slug}`}
                                                        className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                                                    >
                                                        {c.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status badge */}
                            <div className="mb-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${activity.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {activity.is_active ? '✓ Available' : 'Currently Unavailable'}
                                </span>
                                {activity.is_featured && (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        ★ Featured
                                    </span>
                                )}
                            </div>

                            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3">
                                Book This Activity
                            </button>

                            <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors mb-6">
                                Add to Itinerary
                            </button>

                            <div className="text-sm text-gray-600 space-y-2">
                                <p>✓ Expert local guides</p>
                                <p>✓ Small group sizes</p>
                                <p>✓ Flexible booking</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-medium text-gray-900 mb-2">Need help planning?</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Get personalized recommendations and travel tips for this activity.
                                </p>
                                <Link to="/contact" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                                    Contact us →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;
