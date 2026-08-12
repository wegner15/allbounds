import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api';
import { AuthProvider } from './lib/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary, { RouteErrorFallback } from './components/ErrorBoundary';
import SeoHead from './components/seo/SeoHead';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Import feature pages
import PackagesPage from './features/packages/PackagesPage';
import PackageDetailPage from './features/packages/PackageDetailPage';
import PackageDetailPageNew from './features/packages/PackageDetailPageNew';
import HolidayTypesPage from './features/holiday-types/HolidayTypesPage';
import HolidayTypeDetailPage from './features/holiday-types/HolidayTypeDetailPage';

// Import form showcase components
import FormShowcase from './components/forms/FormShowcase';
import ContactForm from './components/forms/ContactForm';

// Import destination pages
import DestinationsPage from './features/destinations/DestinationsPage';
import CountryDetailPage from './features/destinations/CountryDetailPage';
import CountryDetailPageNew from './features/destinations/CountryDetailPageNew';
import RegionDetailPage from './features/destinations/RegionDetailPage';
import CountryCategoryPage from './features/destinations/CountryCategoryPage';
import RegionsPage from './features/destinations/RegionsPage';

// Import auth pages
import LoginPage from './features/auth/LoginPage';

// Import admin pages
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import PackagesListPage from './features/admin/packages/PackagesListPage';
import CreatePackagePage from './features/admin/packages/CreatePackagePage';
import EditPackagePage from './features/admin/packages/EditPackagePage';
// Media-related imports removed

// Import admin destination pages
import DestinationsListPage from './features/admin/destinations/DestinationsListPage';
import CountriesListPage from './features/admin/destinations/CountriesListPage';
import CreateRegionPage from './features/admin/destinations/CreateRegionPage';
import EditRegionPage from './features/admin/destinations/EditRegionPage';
import CreateCountryPage from './features/admin/destinations/CreateCountryPage';
import EditCountryPage from './features/admin/destinations/EditCountryPage';
import ManageCountryVisitInfoPage from './features/admin/countries/ManageCountryVisitInfoPage';

// Import admin holiday types pages
import HolidayTypesListPage from './features/admin/holiday-types/HolidayTypesListPage';
import CreateHolidayTypePage from './features/admin/holiday-types/CreateHolidayTypePage';
import EditHolidayTypePage from './features/admin/holiday-types/EditHolidayTypePage';

// Import admin group trips pages
import GroupTripsListPage from './features/admin/group-trips/GroupTripsListPage';
import CreateGroupTripPage from './features/admin/group-trips/CreateGroupTripPage';
import EditGroupTripPage from './features/admin/group-trips/EditGroupTripPage';

// Import admin hotel pages
import HotelsListPage from './features/admin/hotels/HotelsListPage';
import CreateHotelPage from './features/admin/hotels/CreateHotelPage';
import EditHotelPage from './features/admin/hotels/EditHotelPage';
import HotelRelationshipsPage from './features/admin/hotels/HotelRelationshipsPage';

// Import admin hotel types pages
import HotelTypesListPage from './features/admin/hotel-types/HotelTypesListPage';
import CreateHotelTypePage from './features/admin/hotel-types/CreateHotelTypePage';
import EditHotelTypePage from './features/admin/hotel-types/EditHotelTypePage';

// Import admin partners pages
import PartnersListPage from './features/admin/partners/PartnersListPage';
import CreatePartnerPage from './features/admin/partners/CreatePartnerPage';
import EditPartnerPage from './features/admin/partners/EditPartnerPage';

// Import admin amenities pages
import AmenitiesListPage from './features/admin/amenities/AmenitiesListPage';
import CreateAmenityPage from './features/admin/amenities/CreateAmenityPage';
import EditAmenityPage from './features/admin/amenities/EditAmenityPage';
import AttractionsListPage from './features/admin/attractions/AttractionsListPage';
import CreateAttractionPage from './features/admin/attractions/CreateAttractionPage';
import EditAttractionPage from './features/admin/attractions/EditAttractionPage';
import AttractionRelationshipsPage from './features/admin/attractions/AttractionRelationshipsPage';
import BlogsListPage from './features/admin/blog/BlogsListPage';
import CreateBlogPage from './features/admin/blog/CreateBlogPage';
import EditBlogPage from './features/admin/blog/EditBlogPage';

// Import admin activity pages
import ActivityListPage from './features/admin/activities/ActivityListPage';
import ActivityCreatePage from './features/admin/activities/ActivityCreatePage';
import ActivityEditPage from './features/admin/activities/ActivityEditPage';

// Import admin inclusion/exclusion pages
import InclusionsListPage from './features/admin/inclusions/InclusionsListPage';
import CreateInclusionPage from './features/admin/inclusions/CreateInclusionPage';
import EditInclusionPage from './features/admin/inclusions/EditInclusionPage';
import ExclusionsListPage from './features/admin/exclusions/ExclusionsListPage';
import CreateExclusionPage from './features/admin/exclusions/CreateExclusionPage';
import EditExclusionPage from './features/admin/exclusions/EditExclusionPage';

// Import public pages
import BlogListPage from './features/public/blog/BlogListPage';
import BlogDetailPage from './features/public/blog/BlogDetailPage';
import ContentPage from './features/public/content/ContentPage';
import ContactUsPage from './features/public/ContactUsPage';
import HotelListPage from './features/public/hotels/HotelListPage';
import HotelDetailPage from './features/public/hotels/HotelDetailPage';
import AttractionListPage from './features/public/attractions/AttractionListPage';
import AttractionDetailPage from './features/attractions/AttractionDetailPage';
import PublicActivityListPage from './features/public/activities/ActivityListPage';
import ActivityDetailPage from './features/public/activities/ActivityDetailPage';
import PaymentPlansPage from './features/public/content/PaymentPlansPage';
import GroupTripsPage from './features/group-trips/GroupTripsPage';
import GroupTripDetailPage from './features/group-trips/GroupTripDetailPage';

// Import admin user management pages
import UsersListPage from './features/admin/users/UsersListPage';
import CreateUserPage from './features/admin/users/CreateUserPage';
import EditUserPage from './features/admin/users/EditUserPage';
import SubscriberList from './features/admin/newsletter/SubscriberList';

// Import admin booking pages
import PackageBookingsPage from './features/admin/bookings/PackageBookingsPage';
import GroupTripBookingsPage from './features/admin/bookings/GroupTripBookingsPage';
import GeneralInquiriesPage from './features/admin/bookings/GeneralInquiriesPage';
import VisaApplicationsPage from './features/admin/bookings/VisaApplicationsPage';
import FlightBookingsPage from './features/admin/bookings/FlightBookingsPage';

// Import admin content pages
import ContentListPage from './features/admin/content/ContentListPage';
import ContentForm from './features/admin/content/ContentForm';

import HomePage from './features/public/HomePage';
import SearchPage from './features/search/SearchPage';
import FlightBookingPage from './features/public/flights/FlightBookingPage';
import VisaApplicationPage from './features/public/visa/VisaApplicationPage';
import AboutUsPage from './features/public/about/AboutUsPage';
import StartPlanningPage from './features/public/planning/StartPlanningPage';

// Import Admin Settings
import AdminSettingsPage from './features/admin/settings/AdminSettingsPage';

// Import Admin Logs
import EmailLogsPage from './features/admin/logs/EmailLogsPage';

// Import Admin Content Tags pages
import TagsListPage from './features/admin/tags/TagsListPage';
import CreateTagPage from './features/admin/tags/CreateTagPage';
import EditTagPage from './features/admin/tags/EditTagPage';

// Placeholder pages for routes we haven't fully implemented yet


const CountriesPage = () => (
  <>
    <SeoHead
      title="Countries"
      description="Explore countries with unique cultures and experiences."
      canonicalPath="/countries"
    />
    <div>
      <h1 className="text-4xl font-playfair mb-6">Discover Countries</h1>
      <p className="text-lg mb-4">Explore countries with unique cultures and experiences.</p>
    </div>
  </>
);

const StaysPage = () => (
  <>
    <SeoHead
      title="Stays"
      description="Find the perfect accommodation for your journey."
      canonicalPath="/stays"
    />
    <div>
      <h1 className="text-4xl font-playfair mb-6">Luxury Stays</h1>
      <p className="text-lg mb-4">Find the perfect accommodation for your journey.</p>
    </div>
  </>
);

// Remove placeholder ActivitiesPage since we now have proper public ActivityListPage

// Remove the placeholder BlogPage since we now have proper public blog pages

const NotFoundPage = () => (
  <>
    <SeoHead
      title="Page Not Found"
      canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      noIndex={true}
    />
    <div className="text-center py-16">
      <h1 className="text-4xl font-playfair mb-6">Page Not Found</h1>
      <p className="text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
        Back to Home
      </a>
    </div>
  </>
);

// Admin pages
const AdminPreviewPage = () => (
  <>
    <SeoHead
      title="Content Preview"
      canonicalPath="/admin"
      noIndex={true}
    />
    <div>
      <h1 className="text-4xl font-playfair mb-6">Content Preview</h1>
      <p className="text-lg mb-4">Preview content before publishing.</p>
    </div>
  </>
);

// Layout wrapper
const MainLayout = () => {
  const [searchParams] = useSearchParams();
  const partnerParam = searchParams.get('partner') || searchParams.get('ref');

  useEffect(() => {
    if (partnerParam) {
      localStorage.setItem('partner_code', partnerParam);
      console.log('Referral tracking: partner_code set to', partnerParam);
    }
  }, [partnerParam]);

  const navigationItems = [
    { label: 'Destinations', path: '/destinations' },
    { label: 'Packages', path: '/packages' },
    { label: 'Stays', path: '/stays' },
    { label: 'Holiday Types', path: '/holiday-types' },
    { label: 'Blog', path: '/blog' },
  ];

  const footerSections = [
    {
      title: 'Destinations',
      links: [], // Will be populated dynamically from API
    },
    {
      title: 'Holiday Types',
      links: [], // Will be populated dynamically from API
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about-us' },
        { label: 'Contact Us', path: '/contact-us' },
        { label: 'Visa Application', path: '/visa-application' },
        { label: 'Flight Booking', path: '/flights' },
        { label: 'Careers', path: '/careers' },
        { label: 'Terms & Conditions', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
      ],
    },
    {
      title: 'Contact Info',
      links: [
        { label: 'UG: +(256) 782 594 008', path: 'tel:+256782594008' },
        { label: 'KE: +(254) 723 927 458', path: 'tel:+254723927458' },
        { label: 'Email: bookings@allboundvacations.com', path: 'mailto:bookings@allboundvacations.com' },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header navigationItems={navigationItems} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer
        logo="/logo/main_logo.png"
        sections={footerSections}
        socialLinks={{
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
          youtube: 'https://youtube.com',
        }}
      />
    </div>
  );
};

// Import our custom admin layout component
import AdminLayout from './components/layout/AdminLayout';

// Unauthorized page
const UnauthorizedPage = () => (
  <>
    <SeoHead
      title="Unauthorized"
      canonicalPath="/unauthorized"
      noIndex={true}
    />
    <div className="text-center py-16">
      <h1 className="text-4xl font-playfair mb-6">Unauthorized</h1>
      <p className="text-lg mb-8">You don't have permission to access this page.</p>
      <a href="/" className="bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
        Back to Home
      </a>
    </div>
  </>
);

const FormShowcasePage = () => (
  <>
    <SeoHead
      title="Form Showcase"
      canonicalPath="/form-showcase"
      noIndex={true}
    />
    <FormShowcase />
  </>
);

const ContactFormPage = () => (
  <>
    <SeoHead
      title="Contact Form"
      canonicalPath="/contact"
      noIndex={true}
    />
    <ContactForm />
  </>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'start-planning', element: <StartPlanningPage /> },
      { path: 'destinations', element: <DestinationsPage /> },
      { path: 'destinations/regions/:slug', element: <RegionDetailPage /> },
      { path: 'destinations/countries/:slug', element: <CountryDetailPageNew /> },
      { path: 'destinations/:slug', element: <CountryDetailPageNew /> },
      { path: 'destinations/:slug/:category', element: <CountryCategoryPage /> },
      { path: 'destinations-old/:slug', element: <CountryDetailPage /> },
      { path: 'regions', element: <RegionsPage /> },
      { path: 'regions/:slug', element: <RegionDetailPage /> },
      { path: 'countries', element: <CountriesPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'packages/:destination/:slug', element: <PackageDetailPageNew /> },
      { path: 'packages/:slug', element: <PackageDetailPageNew /> },
      { path: 'packages-old/:slug', element: <PackageDetailPage /> },
      { path: 'stays', element: <StaysPage /> },
      { path: 'hotels', element: <HotelListPage /> },
      { path: 'destinations/:destination/hotels/:slug', element: <HotelDetailPage /> },
      { path: 'hotels/:destination/:slug', element: <HotelDetailPage /> },
      { path: 'hotels/:slug', element: <HotelDetailPage /> },
      { path: 'activities', element: <PublicActivityListPage /> },
      { path: 'destinations/:destination/activities/:slug', element: <ActivityDetailPage /> },
      { path: 'activities/:destination/:slug', element: <ActivityDetailPage /> },
      { path: 'activities/:slug', element: <ActivityDetailPage /> },
      { path: 'attractions', element: <AttractionListPage /> },
      { path: 'destinations/:destination/attractions/:slug', element: <AttractionDetailPage /> },
      { path: 'attractions/:destination/:slug', element: <AttractionDetailPage /> },
      { path: 'attractions/:slug', element: <AttractionDetailPage /> },
      { path: 'holiday-types', element: <HolidayTypesPage /> },
      { path: 'holiday-types/:slug', element: <HolidayTypeDetailPage /> },
      { path: 'group-trips', element: <GroupTripsPage /> },
      { path: 'group-trips/:slug', element: <GroupTripDetailPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'about-us', element: <AboutUsPage /> },
      { path: 'contact-us', element: <ContactUsPage /> },
      { path: 'careers', element: <ContentPage /> },
      { path: 'terms', element: <ContentPage /> },
      { path: 'privacy', element: <ContentPage /> },
      { path: 'payment-plans', element: <PaymentPlansPage /> },
      { path: 'visa-application', element: <VisaApplicationPage /> },
      { path: 'flights', element: <FlightBookingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'form-showcase', element: <FormShowcasePage /> },
      { path: 'contact', element: <ContactFormPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireSuperuser={true}>
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboardPage /> },
      // Destination management routes
      { path: 'destinations', element: <DestinationsListPage /> },
      { path: 'destinations/regions/new', element: <CreateRegionPage /> },
      { path: 'destinations/regions/:id/edit', element: <EditRegionPage /> },
      { path: 'destinations/countries', element: <CountriesListPage /> },
      { path: 'destinations/countries/new', element: <CreateCountryPage /> },
      { path: 'destinations/countries/:id/edit', element: <EditCountryPage /> },
      { path: 'countries/:id/visit-info', element: <ManageCountryVisitInfoPage /> },
      // Holiday types management routes
      { path: 'holiday-types', element: <HolidayTypesListPage /> },
      { path: 'holiday-types/new', element: <CreateHolidayTypePage /> },
      { path: 'holiday-types/:id/edit', element: <EditHolidayTypePage /> },
      // Content tags management route
      { path: 'tags', element: <TagsListPage /> },
      // Hotel management routes
      { path: 'hotels', element: <HotelsListPage /> },
      { path: 'hotels/new', element: <CreateHotelPage /> },
      { path: 'hotels/:id/edit', element: <EditHotelPage /> },
      { path: 'hotels/:id/relationships', element: <HotelRelationshipsPage /> },
      // Hotel types management routes
      { path: 'hotel-types', element: <HotelTypesListPage /> },
      { path: 'hotel-types/new', element: <CreateHotelTypePage /> },
      { path: 'hotel-types/:id/edit', element: <EditHotelTypePage /> },
      // Partner management routes
      { path: 'partners', element: <PartnersListPage /> },
      { path: 'partners/new', element: <CreatePartnerPage /> },
      { path: 'partners/:id/edit', element: <EditPartnerPage /> },
      // Amenities management routes
      { path: 'amenities', element: <AmenitiesListPage /> },
      { path: 'amenities/new', element: <CreateAmenityPage /> },
      { path: 'amenities/:id/edit', element: <EditAmenityPage /> },
      // Inclusion management routes
      { path: 'inclusions', element: <InclusionsListPage /> },
      { path: 'inclusions/new', element: <CreateInclusionPage /> },
      { path: 'inclusions/:id/edit', element: <EditInclusionPage /> },
      // Exclusion management routes
      { path: 'exclusions', element: <ExclusionsListPage /> },
      { path: 'exclusions/new', element: <CreateExclusionPage /> },
      { path: 'exclusions/:id/edit', element: <EditExclusionPage /> },
      // Attraction management routes
      { path: 'attractions', element: <AttractionsListPage /> },
      { path: 'attractions/new', element: <CreateAttractionPage /> },
      { path: 'attractions/:id/edit', element: <EditAttractionPage /> },
      { path: 'attractions/:id/relationships', element: <AttractionRelationshipsPage /> },
      { path: 'blog', element: <BlogsListPage /> },
      { path: 'blog/create', element: <CreateBlogPage /> },
      { path: 'blog/edit/:id', element: <EditBlogPage /> },
      // Activity management routes
      { path: 'activities', element: <ActivityListPage /> },
      { path: 'activities/create', element: <ActivityCreatePage /> },
      { path: 'activities/:id/edit', element: <ActivityEditPage /> },
      // User management routes
      { path: 'users', element: <UsersListPage /> },
      { path: 'users/new', element: <CreateUserPage /> },
      { path: 'users/:id/edit', element: <EditUserPage /> },
      // Package management routes
      { path: 'packages', element: <PackagesListPage /> },
      { path: 'packages/new', element: <CreatePackagePage /> },
      { path: 'packages/:id/edit', element: <EditPackagePage /> },
      // Group trip management routes
      { path: 'group-trips', element: <GroupTripsListPage /> },
      { path: 'group-trips/new', element: <CreateGroupTripPage /> },
      { path: 'group-trips/:id/edit', element: <EditGroupTripPage /> },
      // Newsletter subscribers
      { path: 'newsletter', element: <SubscriberList /> },
      // Booking management routes
      { path: 'bookings/packages', element: <PackageBookingsPage /> },
      { path: 'bookings/group-trips', element: <GroupTripBookingsPage /> },
      { path: 'bookings/inquiries', element: <GeneralInquiriesPage /> },
      { path: 'bookings/visa-applications', element: <VisaApplicationsPage /> },
      { path: 'bookings/flights', element: <FlightBookingsPage /> },
      // Content management routes
      { path: 'content', element: <ContentListPage /> },
      { path: 'content/create', element: <ContentForm /> },
      { path: 'content/edit/:id', element: <ContentForm /> },
      // Other admin routes
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'logs/email', element: <EmailLogsPage /> },
      { path: 'preview/:type/:id', element: <AdminPreviewPage /> },
      // Content Tags management routes
      { path: 'tags', element: <TagsListPage /> },
      { path: 'tags/new', element: <CreateTagPage /> },
      { path: 'tags/:id/edit', element: <EditTagPage /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
