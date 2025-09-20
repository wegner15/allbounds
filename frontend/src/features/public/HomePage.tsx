import React from 'react';
import HeroSection from './home/sections/HeroSection';
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
import Newsletter from './home/sections/Newsletter';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SpecialTopDeals />
      <HolidayByType />
      <TopTrendingDestinations />
      <ContactUsCard />
      <RecommendedHotels />
      <PopularTrips />
      <TrendingActivities />
      <TrendingAttractions />
      <WhyChooseUs />
      <InspirationForNextTrip />
      <CustomerReviews />
      <Newsletter />
    </div>
  );
};

export default HomePage;
