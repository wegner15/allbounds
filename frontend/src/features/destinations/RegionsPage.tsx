import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';

// Components
import Button from '../../components/ui/Button';
import { TextDisplay } from '../../components/ui/RichTextDisplay';
import Breadcrumb from '../../components/layout/Breadcrumb';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// API Hooks
import { useRegionsWithCountries } from '../../lib/hooks/useDestinations';

const RegionsPage: React.FC = () => {
    // Fetch data from API
    const { data: regionsData, isLoading, error } = useRegionsWithCountries();

    return (
        <div className="bg-paper min-h-screen">
            <SeoHead
                title="Regions"
                description="Explore our diverse regions. From the savannas of East Africa to the deserts of North Africa, discover unique destinations."
                canonicalPath="/regions"
            />

            {/* Hero Section */}
            <div className="bg-cover bg-center h-80 md:h-96 flex items-center justify-center relative"
                style={{ backgroundImage: 'url(/home-heros/hero1.jpeg)' }}>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="text-center text-white p-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-playfair mb-4">Explore Our Regions</h1>
                    <p className="text-xl md:text-2xl mb-6">Discover the unique beauty of each destination</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Destinations', path: '/destinations' },
                        { label: 'Regions' },
                    ]}
                    className="mb-8"
                />

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
                        <p className="mt-2">Loading regions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>Error loading regions. Please try again later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(regionsData || []).map(region => (
                            <div key={region.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                                <Link to={`/destinations/regions/${region.slug}`}>
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={getImageUrlWithFallback(region.image_id || region.image_url, IMAGE_VARIANTS.LARGE, '/home-heros/hero2.webp')}
                                            alt={region.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                            <h3 className="text-xl font-playfair text-white mb-0 group-hover:text-butter transition-colors">
                                                {region.name}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-6 flex-1 flex flex-col">
                                    {region.description && (
                                        <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            <TextDisplay content={region.description} />
                                        </div>
                                    )}

                                    {/* Countries in Region */}
                                    {region.countries && region.countries.length > 0 && (
                                        <div className="mb-4 mt-auto">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Including:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {region.countries.slice(0, 5).map(country => (
                                                    <Link
                                                        key={country.id}
                                                        to={`/destinations/countries/${country.slug}`}
                                                        className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded hover:bg-teal-100 transition-colors"
                                                    >
                                                        {country.name}
                                                    </Link>
                                                ))}
                                                {region.countries.length > 5 && (
                                                    <span className="text-xs text-gray-400 px-2 py-1">
                                                        +{region.countries.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Link to={`/destinations/regions/${region.slug}`} className="mt-4">
                                        <Button variant="outline" className="w-full">
                                            Explore Region
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegionsPage;
