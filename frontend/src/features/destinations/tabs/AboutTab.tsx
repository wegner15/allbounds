import React, { lazy, Suspense } from 'react';
import type { CountryWithDetails } from '../../../lib/types/api';
import DestinationOverviewSection from '../components/DestinationOverviewSection';
import BestTimeToVisitSection from '../components/BestTimeToVisitSection';

// Lazy loaded components
const InteractiveMapSection = lazy(() => import('../components/InteractiveMapSection'));
const SocialSharingCard = lazy(() => import('../components/SocialSharingCard'));
const RelatedDestinationsSection = lazy(() => import('../components/RelatedDestinationsSection'));

interface AboutTabProps {
    country: CountryWithDetails;
    pageDescription?: string;
    pageImage?: string;
}

const SectionLoader: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    </div>
);

const AboutTab: React.FC<AboutTabProps> = ({ country, pageDescription, pageImage }) => {
    return (
        <div className="space-y-6 md:space-y-8">{/* removed py-6 since sections handle spacing */}
            {/* Overview Section */}
            <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                <DestinationOverviewSection country={country} />
            </section>

            {/* Best Time to Visit Section */}
            <BestTimeToVisitSection visitInfo={country.visit_info} />

            {/* Interactive Map Section */}
            <Suspense fallback={<SectionLoader />}>
                <InteractiveMapSection country={country} />
            </Suspense>

            {/* Social Sharing Section */}
            <Suspense fallback={<SectionLoader />}>
                <SocialSharingCard
                    countryName={country.name}
                    description={pageDescription}
                    imageUrl={pageImage}
                />
            </Suspense>

        </div>
    );
};

export default AboutTab;
