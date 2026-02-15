import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActivityBySlug } from '../../../lib/hooks/useActivities';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import { MapPin, Clock } from 'lucide-react';

const ActivityDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: activity, isLoading, error } = useActivityBySlug(slug || '');

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
                                        ? [{ label: activity.countries[0].name, path: `/destinations/${activity.countries[0].slug}` }]
                                        : []),
                                    { label: 'Activities', path: '/activities' },
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
        </div>
    );
};

export default ActivityDetailPage;
