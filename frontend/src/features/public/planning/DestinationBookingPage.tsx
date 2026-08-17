import React from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import SeoHead from '../../../components/seo/SeoHead';
import DestinationBookingForm from '../../../components/forms/DestinationBookingForm';
import { ShieldCheck, Award, Clock, HeartHandshake, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCountries } from '../../../lib/hooks/useDestinations';

export const DestinationBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();

  // Fetch countries to match slug if provided in route URL (e.g. /destinations/dubai/book)
  const { data: countries = [] } = useCountries();

  let targetDestination = searchParams.get('destination') || searchParams.get('country') || '';

  if (!targetDestination && slug) {
    const matched = countries.find((c) => c.slug === slug);
    if (matched) {
      targetDestination = matched.name;
    } else {
      // Capitalize slug words
      targetDestination = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  return (
    <>
      <SeoHead
        title={
          targetDestination
            ? `Book ${targetDestination} Travel & Vacations | AllBound Vacations`
            : 'Book Your Dream Destination | AllBound Vacations'
        }
        description={`Submit a customized destination booking inquiry for ${
          targetDestination || 'your next vacation'
        }. Get tailor-made safaris, luxury packages, and travel itineraries.`}
        canonicalPath={slug ? `/destinations/${slug}/book` : '/book-destination'}
      />

      <div className="min-h-screen bg-gray-50/50 py-10 md:py-16">
        <div className="fluid-container">
          {/* Top Back Breadcrumb Link */}
          <div className="mb-6">
            <Link
              to={slug ? `/destinations/${slug}` : '/destinations'}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-dark hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {targetDestination || 'Destinations'}</span>
            </Link>
          </div>

          {/* Page Banner Header */}
          <div className="bg-gradient-to-r from-charcoal via-gray-800 to-charcoal text-white rounded-3xl p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            <div className="relative z-10 max-w-3xl">
              <span className="inline-block px-3.5 py-1 rounded-full bg-primary/20 text-primary-light font-bold text-xs uppercase tracking-wider mb-4 border border-primary/30">
                Tailor-Made Destination Booking
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-playfair mb-4 leading-tight">
                {targetDestination ? `Book Your ${targetDestination} Experience` : 'Start Your Destination Booking Inquiry'}
              </h1>
              <p className="text-base md:text-lg text-gray-200 font-sans leading-relaxed">
                Whether you desire an exhilarating African safari, a luxury beach getaway, or a custom guided tour, complete your preferences below to receive a personalized itinerary and quote.
              </p>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>100% Customized Itineraries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>24-Hour Fast Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Local Travel Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>No Hidden Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-5xl mx-auto">
            <DestinationBookingForm defaultDestination={targetDestination} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DestinationBookingPage;
