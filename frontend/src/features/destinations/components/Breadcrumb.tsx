import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

/**
 * Breadcrumb component showing navigation hierarchy
 * Displays: Home > Destinations > [Region Name] > [Country Name]
 * Includes structured data markup for SEO
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, currentPage }) => {
  // Generate structured data for breadcrumbs (JSON-LD format)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${window.location.origin}/`
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `${window.location.origin}${item.href}`
      })),
      {
        "@type": "ListItem",
        "position": items.length + 2,
        "name": currentPage,
        "item": window.location.href
      }
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb" 
        className="bg-white border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm overflow-x-auto">
            {/* Home Link */}
            <li className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-teal-600 transition-colors duration-200"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
                <span className="ml-1.5 hidden sm:inline">Home</span>
              </Link>
            </li>

            {/* Separator */}
            <li className="flex items-center flex-shrink-0" aria-hidden="true">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>

            {/* Dynamic Breadcrumb Items */}
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <li className="flex items-center min-w-0">
                  <Link
                    to={item.href}
                    className="text-gray-600 hover:text-teal-600 transition-colors duration-200 truncate"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                </li>
                
                {/* Separator */}
                <li className="flex items-center flex-shrink-0" aria-hidden="true">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </li>
              </React.Fragment>
            ))}

            {/* Current Page (not a link) */}
            <li className="flex items-center min-w-0">
              <span 
                className="text-gray-900 font-medium truncate"
                aria-current="page"
                title={currentPage}
              >
                {currentPage}
              </span>
            </li>
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumb;
