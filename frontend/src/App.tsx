import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api';
import { AuthProvider } from './lib/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Import feature pages
import PackagesPage from './features/packages/PackagesPage';
import PackageDetailPage from './features/packages/PackageDetailPage';
import GroupTripsPage from './features/group-trips/GroupTripsPage';
import GroupTripDetailPage from './features/group-trips/GroupTripDetailPage';
import HolidayTypesPage from './features/holiday-types/HolidayTypesPage';
import HolidayTypeDetailPage from './features/holiday-types/HolidayTypeDetailPage';

// Import form showcase components
import FormShowcase from './components/forms/FormShowcase';
import ContactForm from './components/forms/ContactForm';

// Import destination pages
import DestinationsPage from './features/destinations/DestinationsPage';
import CountryDetailPage from './features/destinations/CountryDetailPage';
import RegionDetailPage from './features/destinations/RegionDetailPage';

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

// Import public pages
import BlogListPage from './features/public/blog/BlogListPage';
import BlogDetailPage from './features/public/blog/BlogDetailPage';
import HotelListPage from './features/public/hotels/HotelListPage';
import HotelDetailPage from './features/public/hotels/HotelDetailPage';
import AttractionListPage from './features/public/attractions/AttractionListPage';
import AttractionDetailPage from './features/attractions/AttractionDetailPage';

// Import admin user management pages
import UsersListPage from './features/admin/users/UsersListPage';
import CreateUserPage from './features/admin/users/CreateUserPage';
import EditUserPage from './features/admin/users/EditUserPage';
import SubscriberList from './features/admin/newsletter/SubscriberList';

import HomePage from './features/public/HomePage';

// Placeholder pages for routes we haven't fully implemented yet
const RegionsPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Explore Regions</h1>
    <p className="text-lg mb-4">Discover our curated collection of regions around the world.</p>
  </div>
);

const CountriesPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Discover Countries</h1>
    <p className="text-lg mb-4">Explore countries with unique cultures and experiences.</p>
  </div>
);

const StaysPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Luxury Stays</h1>
    <p className="text-lg mb-4">Find the perfect accommodation for your journey.</p>
  </div>
);

const ActivitiesPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Activities</h1>
    <p className="text-lg mb-4">Discover exciting activities at your destination.</p>
  </div>
);

// Remove the placeholder BlogPage since we now have proper public blog pages

const SearchPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Search Results</h1>
    <p className="text-lg mb-4">Find your perfect travel experience.</p>
  </div>
);

const NotFoundPage = () => (
  <div className="text-center py-16">
    <h1 className="text-4xl font-playfair mb-6">Page Not Found</h1>
    <p className="text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" className="bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
      Back to Home
    </a>
  </div>
);

// Admin pages
const AdminPreviewPage = () => (
  <div>
    <h1 className="text-4xl font-playfair mb-6">Content Preview</h1>
    <p className="text-lg mb-4">Preview content before publishing.</p>
  </div>
);

// Layout wrapper
const MainLayout = () => {
  const navigationItems = [
    { label: 'Destinations', path: '/destinations' },
    { label: 'Packages', path: '/packages' },
    { label: 'Group Trips', path: '/group-trips' },
    { label: 'Stays', path: '/stays' },
    { label: 'Holiday Types', path: '/holiday-types' },
    { label: 'Blog', path: '/blog' },
  ];
  
  const footerSections = [
    {
      title: 'Destinations',
      links: [
        { label: 'Africa', path: '/regions/africa' },
        { label: 'Asia', path: '/regions/asia' },
        { label: 'Europe', path: '/regions/europe' },
        { label: 'North America', path: '/regions/north-america' },
        { label: 'South America', path: '/regions/south-america' },
      ],
    },
    {
      title: 'Holiday Types',
      links: [
        { label: 'Safari', path: '/holiday-types/safari' },
        { label: 'Beach', path: '/holiday-types/beach' },
        { label: 'Adventure', path: '/holiday-types/adventure' },
        { label: 'Cultural', path: '/holiday-types/cultural' },
        { label: 'Luxury', path: '/holiday-types/luxury' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about-us' },
        { label: 'Contact Us', path: '/contact-us' },
        { label: 'Careers', path: '/careers' },
        { label: 'Terms & Conditions', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
      ],
    },
    {
      title: 'Contact Info',
      links: [
        { label: 'Phone: +256754969593', path: 'tel:+256754969593' },
        { label: 'Email: info@allbounds.com', path: 'mailto:info@allbounds.com' },
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
        logo="/logo/android-chrome-192x192.png"
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
  <div className="text-center py-16">
    <h1 className="text-4xl font-playfair mb-6">Unauthorized</h1>
    <p className="text-lg mb-8">You don't have permission to access this page.</p>
    <a href="/" className="bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
      Back to Home
    </a>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'destinations', element: <DestinationsPage /> },
      { path: 'destinations/regions/:slug', element: <RegionDetailPage /> },
      { path: 'destinations/countries/:slug', element: <CountryDetailPage /> },
      { path: 'destinations/:slug', element: <CountryDetailPage /> },
      { path: 'regions', element: <RegionsPage /> },
      { path: 'countries', element: <CountriesPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'packages/:slug', element: <PackageDetailPage /> },
      { path: 'group-trips', element: <GroupTripsPage /> },
      { path: 'group-trips/:slug', element: <GroupTripDetailPage /> },
      { path: 'stays', element: <StaysPage /> },
      { path: 'hotels', element: <HotelListPage /> },
      { path: 'hotels/:slug', element: <HotelDetailPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'attractions', element: <AttractionListPage /> },
      { path: 'attractions/:slug', element: <AttractionDetailPage /> },
      { path: 'holiday-types', element: <HolidayTypesPage /> },
      { path: 'holiday-types/:slug', element: <HolidayTypeDetailPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'form-showcase', element: <FormShowcase /> },
      { path: 'contact', element: <ContactForm /> },
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
      // Holiday types management routes
      { path: 'holiday-types', element: <HolidayTypesListPage /> },
      { path: 'holiday-types/new', element: <CreateHolidayTypePage /> },
      { path: 'holiday-types/:id/edit', element: <EditHolidayTypePage /> },
      // Group trips management routes
      { path: 'group-trips', element: <GroupTripsListPage /> },
      { path: 'group-trips/new', element: <CreateGroupTripPage /> },
      { path: 'group-trips/:id/edit', element: <EditGroupTripPage /> },
      // Hotel management routes
      { path: 'hotels', element: <HotelsListPage /> },
      { path: 'hotels/new', element: <CreateHotelPage /> },
      { path: 'hotels/:id/edit', element: <EditHotelPage /> },
      { path: 'hotels/:id/relationships', element: <HotelRelationshipsPage /> },
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
      // Newsletter subscribers
      { path: 'newsletter', element: <SubscriberList /> },
      // Other admin routes
      { path: 'preview/:type/:id', element: <AdminPreviewPage /> },
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
