import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActivityBySlug, useActivityTrips } from '../../../lib/hooks/useActivities';
import DOMPurify from 'dompurify';
import SeoHead from '../../../components/seo/SeoHead';
import GridGallery from '../../../components/ui/GridGallery';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import FromPriceDisplay from '../../../components/ui/FromPriceDisplay';
import Button from '../../../components/ui/Button';
import { MapPin, Clock, Users, Calendar, ArrowLeft, DollarSign, Mail, Check, X } from 'lucide-react';
import { format } from 'date-fns';

import SimilarActivities from '../../../components/recommendations/SimilarActivities';

const ActivityDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: activity, isLoading, error } = useActivityBySlug(slug || '');
    const { data: trips } = useActivityTrips(slug || '');
    const [showFullDescription, setShowFullDescription] = React.useState(false);

    // Compute Highlights
    const highlightsList = React.useMemo(() => {
        if (!activity) return [];
        if (activity.highlights && activity.highlights.length > 0) {
            return activity.highlights;
        }
        if (activity.summary) {
            const items = activity.summary
                .split(/(?<=[.!?])\s+|\n+/)
                .map(s => s.trim().replace(/^[•\-\*\s]+/, ''))
                .filter(s => s.length > 10);
            if (items.length > 1) return items;
        }
        if (activity.description) {
            const clean = activity.description.replace(/<[^>]*>/g, ' ');
            const sentences = clean
                .split(/(?<=[.!?])\s+|\n+/)
                .map(s => s.trim().replace(/^[•\-\*\s]+/, ''))
                .filter(s => s.length > 15 && s.length < 150);
            if (sentences.length >= 2) return sentences.slice(0, 5);
        }
        return [
            `Discover the history and unique charm of ${activity.name}`,
            `Explore iconic local landmarks and top attractions with expert guidance`,
            `Encounter vibrant culture, wildlife, or scenic natural landscapes`,
            `Enjoy a seamless, memorable travel experience with provided support`,
            `Capture stunning photos and create lifelong memories`
        ];
    }, [activity]);

    // Compute Inclusions
    const inclusionsList = React.useMemo(() => {
        if (!activity) return [];
        if (activity.inclusions && activity.inclusions.length > 0) {
            return activity.inclusions;
        }
        return [
            `Guided tour of ${activity.name}`,
            `Professional English-speaking local guide`,
            `All entry fees and activity tickets (if option selected)`,
            `Hotel pickup and drop-off (select options)`
        ];
    }, [activity]);

    // Compute Exclusions
    const exclusionsList = React.useMemo(() => {
        if (!activity) return [];
        if (activity.exclusions && activity.exclusions.length > 0) {
            return activity.exclusions;
        }
        return [
            `Tips`,
            `Gratuities`
        ];
    }, [activity]);

    // Keyboard navigation is handled by GridGallery's Lightbox

    // Build gallery images from media_assets + cover_image
    // media_assets objects have a direct `url` field (full Cloudflare delivery URL)
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

        // Add cover image first
        const coverUrl = activity.cover_image?.url || (activity as any).image_url;
        if (coverUrl) {
            images.push({
                id: activity.cover_image?.id ?? 0,
                filename: coverUrl,
                file_path: coverUrl,
                alt_text: `${activity.name} Cover Image`,
            });
        }

        // Add gallery images from media_assets — use asset.url directly (Cloudflare URL)
        const activityResponse = activity as any;
        if (activityResponse.media_assets && activityResponse.media_assets.length > 0) {
            activityResponse.media_assets.forEach((asset: any) => {
                const url = asset.url; // direct Cloudflare delivery URL
                if (url && !images.some(img => img.file_path === url)) {
                    images.push({
                        id: asset.id,
                        filename: asset.filename || url,
                        file_path: url,
                        alt_text: asset.alt_text || activity.name,
                        title: asset.title || undefined,
                        caption: asset.caption || undefined,
                    });
                }
            });
        }

        return images;
    };

    if (isLoading) {
        return (
            <>
                <SeoHead
                    title="Loading Activity"
                    canonicalPath={`/activities/${slug || ''}`}
                />
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
            </>
        );
    }

    if (error || !activity) {
        return (
            <>
                <SeoHead
                    title="Activity Not Found"
                    canonicalPath={`/activities/${slug || ''}`}
                    noIndex={true}
                />
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
            </>
        );
    }

    const allImages = getAllImages();
    const primaryCountry = activity.countries && activity.countries.length > 0 ? activity.countries[0] : null;

    return (
        <div className="min-h-screen bg-white">
            <SeoHead
                title={activity.name}
                description={activity.summary || activity.description?.substring(0, 160) || undefined}
                canonicalPath={`/activities/${slug}`}
            />

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

            {/* Hero Section - Header & Gallery */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
                            {activity.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-600">
                            {activity.countries && activity.countries.length > 0 && (
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                                    <span>{activity.countries.map(c => c.name).join(', ')}</span>
                                </div>
                            )}

                            {(activity as any).duration_minutes && (
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-teal-600" />
                                    <span>
                                        {Math.floor((activity as any).duration_minutes / 60) > 0 ? `${Math.floor((activity as any).duration_minutes / 60)}h ` : ''}
                                        {(activity as any).duration_minutes % 60 > 0 ? `${(activity as any).duration_minutes % 60}m` : ''}
                                        {(activity as any).duration_minutes ? ' duration' : ''}
                                    </span>
                                </div>
                            )}

                            {/* Calculate "From Price" based on available packages */}
                            {trips && trips.packages && trips.packages.length > 0 && (
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
                                    <span className="font-semibold text-gray-900">
                                        From ${Math.min(...trips.packages.map(p => p.price))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid Gallery */}
                    <GridGallery images={allImages} className="mb-8" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Sections: Highlights, Full Description, Includes */}
                        <div className="border-t border-b border-gray-200 divide-y divide-gray-200 mb-12">

                            {/* 1. Highlights Section */}
                            <div className="py-8 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                <div className="md:w-1/4 flex-shrink-0">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Highlights</h2>
                                </div>
                                <div className="md:w-3/4">
                                    <ul className="space-y-3 text-gray-700 text-base leading-relaxed">
                                        {highlightsList.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-gray-900 font-bold mr-3 select-none text-lg">•</span>
                                                <span className="pt-0.5">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 2. Full Description Section */}
                            <div className="py-8 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                <div className="md:w-1/4 flex-shrink-0">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Full description</h2>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="text-gray-700 text-base leading-relaxed">
                                        {showFullDescription || !activity.description || activity.description.length <= 300 ? (
                                            <div
                                                className="prose max-w-none text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description || activity.summary || '') }}
                                            />
                                        ) : (
                                            <div>
                                                <p className="line-clamp-4 text-gray-700 leading-relaxed">
                                                    {activity.description ? activity.description.replace(/<[^>]*>/g, '') : activity.summary}
                                                </p>
                                            </div>
                                        )}
                                        {activity.description && activity.description.length > 300 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                                className="mt-3 text-gray-900 font-semibold underline text-sm hover:text-teal-700 transition-colors inline-block cursor-pointer"
                                            >
                                                {showFullDescription ? 'See less' : 'See more'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Includes Section */}
                            <div className="py-8 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                <div className="md:w-1/4 flex-shrink-0">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Includes</h2>
                                </div>
                                <div className="md:w-3/4 space-y-3">
                                    {/* Included items */}
                                    {inclusionsList.map((item, index) => (
                                        <div key={`inc-${index}`} className="flex items-start text-gray-700 text-base leading-relaxed">
                                            <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}

                                    {/* Excluded items */}
                                    {exclusionsList.map((item, index) => (
                                        <div key={`exc-${index}`} className="flex items-start text-gray-600 text-base leading-relaxed">
                                            <X className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
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
                        </div>

                        {/* Booking / Contact CTA */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100 sticky top-[280px]">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Book This Activity</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Interested in this activity? Contact us to customize your perfect trip including {activity.name}.
                            </p>

                            <Link to="/contact" className="block w-full">
                                <Button variant="primary" className="w-full flex items-center justify-center">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Contact Us
                                </Button>
                            </Link>

                            <div className="mt-4 text-center">
                                <span className="text-xs text-gray-500">
                                    Need help planning? Our experts are here for you.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Activities Section */}
                <SimilarActivities 
                    currentActivitySlug={activity.slug} 
                    countryId={activity.countries?.[0]?.id} 
                />
            </div>
        </div>
    );
};

export default ActivityDetailPage;
