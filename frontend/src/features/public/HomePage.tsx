import React from 'react';
import SeoHead from '../../components/seo/SeoHead';
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
        title="Home"
        description="Discover extraordinary destinations and create unforgettable memories with Allbound Vacations."
        canonicalPath="/"
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
