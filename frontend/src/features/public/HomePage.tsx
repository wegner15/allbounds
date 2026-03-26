import React from 'react';
import HeroSection from './home/sections/HeroSection';
import ThreeStepsSection from './home/sections/ThreeStepsSection';
import SpecialTopDeals from './home/sections/SpecialTopDeals';
import HolidayByType from './home/sections/HolidayByType';
import TopTrendingDestinations from './home/sections/TopTrendingDestinations';
import ContactUsCard from './home/sections/ContactUsCard';
import RecommendedHotels from './home/sections/RecommendedHotels';
import PopularTrips from './home/sections/PopularTrips';
import TrendingActivities from './home/sections/TrendingActivities';
import TrendingAttractions from './home/sections/TrendingAttractions';
import InspirationForNextTrip from './home/sections/InspirationForNextTrip';
import CustomerReviews from './home/sections/CustomerReviews';
import WhyChooseUs from './home/sections/WhyChooseUs';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ThreeStepsSection />
      <SpecialTopDeals />
      <TopTrendingDestinations />
      <HolidayByType />
      <ContactUsCard />
      <RecommendedHotels />
      <PopularTrips />
      <TrendingActivities />
      <TrendingAttractions />
      <WhyChooseUs />
      <InspirationForNextTrip />
      <CustomerReviews />
    </div>
  );
};

export default HomePage;
