import React from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { SITE_URL, SITE_NAME } from '../../lib/seo-config';
import HeroSection from './home/sections/HeroSection';
import ThreeStepsSection from './home/sections/ThreeStepsSection';
import SpecialTopDeals from './home/sections/SpecialTopDeals';
import HolidayByType from './home/sections/HolidayByType';
import TopTrendingDestinations from './home/sections/TopTrendingDestinations';
import ContactUsCard from './home/sections/ContactUsCard';
import RecommendedHotels from './home/sections/RecommendedHotels';
import PopularSafariPackages from './home/sections/PopularSafariPackages';
import PopularHolidayPackages from './home/sections/PopularHolidayPackages';
import TrendingActivities from './home/sections/TrendingActivities';
import TrendingAttractions from './home/sections/TrendingAttractions';
import InspirationForNextTrip from './home/sections/InspirationForNextTrip';
import CustomerReviews from './home/sections/CustomerReviews';
import WhyChooseUs from './home/sections/WhyChooseUs';
import OurPartners from './home/sections/OurPartners';

const HomePage: React.FC = () => {
  return (
    <>
      <SeoHead
        title="Discover Extraordinary Destinations"
        description="Discover extraordinary destinations and create unforgettable travel experiences with Allbound Vacations. Explore tour packages, group trips, hotels, and activities across Africa and beyond."
        canonicalPath="/"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            '@id': `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo/main_logo.png`,
              width: 200,
              height: 60,
            },
            contactPoint: [
              { '@type': 'ContactPoint', telephone: '+256-782-594-008', contactType: 'customer service', areaServed: 'UG' },
              { '@type': 'ContactPoint', telephone: '+254-723-927-458', contactType: 'customer service', areaServed: 'KE' },
            ],
            sameAs: [
              'https://facebook.com/AllboundVacations',
              'https://instagram.com/AllboundVacations',
              'https://twitter.com/AllboundVacations',
              'https://youtube.com/AllboundVacations',
            ],
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'UG',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            publisher: { '@id': `${SITE_URL}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <div className="min-h-screen bg-white">
        <HeroSection />
        <ThreeStepsSection />
        <SpecialTopDeals />
        <TopTrendingDestinations />
        <HolidayByType />
        <ContactUsCard />
        <RecommendedHotels />
        <PopularSafariPackages />
        <PopularHolidayPackages />
        <TrendingActivities />
        <TrendingAttractions />
        <WhyChooseUs />
        <InspirationForNextTrip />
        <CustomerReviews />
        <OurPartners />
      </div>
    </>
  );
};

export default HomePage;
