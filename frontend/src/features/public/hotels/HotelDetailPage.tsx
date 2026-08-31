import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelBySlug } from '../../../lib/hooks/useHotels';
import SeoHead from '../../../components/seo/SeoHead';
import PackageBookingForm from '../../../components/forms/PackageBookingForm';
import InquiryForm from '../../../components/forms/InquiryForm';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import GridGallery from '../../../components/ui/GridGallery';
import SimilarHotels from '../../../components/recommendations/SimilarHotels';
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  ExternalLink,
  Navigation,
  Wifi,
  Waves,
  Dumbbell,
  Utensils,
  Wine,
  Bell,
  Sparkles,
  Car,
  Plane,
  Snowflake,
  PawPrint,
  Briefcase,
  Shirt,
  Lock,
  Home,
  Mountain,
  Ban,
  Tv,
  Coffee,
  Bath,
  ShowerHead,
  Bed,
  Bike,
  Check,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TextDisplay } from '../../../components/ui/RichTextDisplay';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
let defaultIconFixed = false;
const fixLeafletDefaultIcon = () => {
  if (!defaultIconFixed && typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      defaultIconFixed = true;
    } catch (e) {
      console.warn('Failed to fix Leaflet default icon:', e);
    }
  }
};
fixLeafletDefaultIcon();

// Helper to render relevant icon based on amenity icon or name
const renderAmenityIcon = (icon?: string, name?: string) => {
  const iconKey = (icon || '').toLowerCase();
  const nameKey = (name || '').toLowerCase();

  if (iconKey === 'wifi' || nameKey.includes('wifi') || nameKey.includes('internet')) {
    return <Wifi className="w-5 h-5" />;
  }
  if (iconKey === 'waves' || nameKey.includes('pool') || nameKey.includes('swim')) {
    return <Waves className="w-5 h-5" />;
  }
  if (iconKey === 'dumbbell' || nameKey.includes('fitness') || nameKey.includes('gym') || nameKey.includes('workout')) {
    return <Dumbbell className="w-5 h-5" />;
  }
  if (iconKey === 'utensils' || nameKey.includes('restaurant') || nameKey.includes('dining') || nameKey.includes('kitchen')) {
    return <Utensils className="w-5 h-5" />;
  }
  if (iconKey === 'wine' || nameKey.includes('bar') || nameKey.includes('lounge') || nameKey.includes('drink')) {
    return <Wine className="w-5 h-5" />;
  }
  if (iconKey === 'bell' || iconKey === 'conciergebell' || nameKey.includes('room service') || nameKey.includes('concierge')) {
    return <Bell className="w-5 h-5" />;
  }
  if (iconKey === 'sparkles' || nameKey.includes('spa') || nameKey.includes('wellness') || nameKey.includes('massage') || nameKey.includes('sauna')) {
    return <Sparkles className="w-5 h-5" />;
  }
  if (iconKey === 'car' || nameKey.includes('parking') || nameKey.includes('valet')) {
    return <Car className="w-5 h-5" />;
  }
  if (iconKey === 'plane' || nameKey.includes('airport') || nameKey.includes('shuttle') || nameKey.includes('transfer')) {
    return <Plane className="w-5 h-5" />;
  }
  if (iconKey === 'snowflake' || nameKey.includes('air conditioning') || nameKey.includes('ac') || nameKey.includes('climate')) {
    return <Snowflake className="w-5 h-5" />;
  }
  if (iconKey === 'pawprint' || iconKey === 'paw' || nameKey.includes('pet')) {
    return <PawPrint className="w-5 h-5" />;
  }
  if (iconKey === 'briefcase' || nameKey.includes('business') || nameKey.includes('meeting')) {
    return <Briefcase className="w-5 h-5" />;
  }
  if (iconKey === 'shirt' || nameKey.includes('laundry') || nameKey.includes('dry cleaning')) {
    return <Shirt className="w-5 h-5" />;
  }
  if (iconKey === 'lock' || nameKey.includes('safe')) {
    return <Lock className="w-5 h-5" />;
  }
  if (iconKey === 'coffee' || nameKey.includes('coffee') || nameKey.includes('tea') || nameKey.includes('breakfast')) {
    return <Coffee className="w-5 h-5" />;
  }
  if (iconKey === 'tv' || nameKey.includes('tv') || nameKey.includes('television')) {
    return <Tv className="w-5 h-5" />;
  }
  if (iconKey === 'bath' || nameKey.includes('bath') || nameKey.includes('tub')) {
    return <Bath className="w-5 h-5" />;
  }
  if (iconKey === 'shower' || iconKey === 'showerhead' || nameKey.includes('shower')) {
    return <ShowerHead className="w-5 h-5" />;
  }
  if (iconKey === 'mountain' || iconKey === 'water' || nameKey.includes('view') || nameKey.includes('sea view') || nameKey.includes('ocean')) {
    return <Mountain className="w-5 h-5" />;
  }
  if (iconKey === 'home' || nameKey.includes('balcony') || nameKey.includes('terrace')) {
    return <Home className="w-5 h-5" />;
  }
  if (iconKey === 'ban' || iconKey === 'banicon' || nameKey.includes('non-smoking') || nameKey.includes('no smoking')) {
    return <Ban className="w-5 h-5" />;
  }
  if (iconKey === 'bed' || nameKey.includes('bed')) {
    return <Bed className="w-5 h-5" />;
  }
  if (iconKey === 'bike' || nameKey.includes('bike')) {
    return <Bike className="w-5 h-5" />;
  }
  return <Check className="w-5 h-5" />;
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('room') || cat.includes('bedroom')) return <Bed className="w-4 h-4" />;
  if (cat.includes('bath') || cat.includes('toilet')) return <Bath className="w-4 h-4" />;
  if (cat.includes('din') || cat.includes('food') || cat.includes('restaurant') || cat.includes('kitchen')) return <Utensils className="w-4 h-4" />;
  if (cat.includes('drink') || cat.includes('bar')) return <Wine className="w-4 h-4" />;
  if (cat.includes('wellness') || cat.includes('spa') || cat.includes('fitness') || cat.includes('gym')) return <Sparkles className="w-4 h-4" />;
  if (cat.includes('pool') || cat.includes('beach') || cat.includes('water')) return <Waves className="w-4 h-4" />;
  if (cat.includes('view') || cat.includes('outdoor') || cat.includes('garden')) return <Mountain className="w-4 h-4" />;
  if (cat.includes('service') || cat.includes('front desk') || cat.includes('reception') || cat.includes('concierge')) return <Bell className="w-4 h-4" />;
  if (cat.includes('media') || cat.includes('tech') || cat.includes('entertainment')) return <Tv className="w-4 h-4" />;
  if (cat.includes('business')) return <Briefcase className="w-4 h-4" />;
  if (cat.includes('transport') || cat.includes('parking') || cat.includes('airport')) return <Car className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hotel, isLoading, error } = useHotelBySlug(slug!);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const [selectedPriceChart, setSelectedPriceChart] = useState<any>(null);
  const [selectedNightRate, setSelectedNightRate] = useState<any>(null);

  // Active seasonal price charts
  const activePriceCharts = useMemo(() => {
    return (hotel?.price_charts || []).filter((pc: any) => pc.is_active !== false);
  }, [hotel?.price_charts]);

  // Extract all unique night durations across active charts (e.g. [3, 4, 5, 7])
  const uniqueNightDurations = useMemo(() => {
    const set = new Set<number>();
    activePriceCharts.forEach((pc: any) => {
      if (pc.night_rates && pc.night_rates.length > 0) {
        pc.night_rates.forEach((nr: any) => {
          if (nr.is_active !== false && nr.nights) {
            set.add(Number(nr.nights));
          }
        });
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [activePriceCharts]);

  // Group all images for the gallery
  const getAllImages = useMemo(() => {
    if (!hotel) return [];
    const images = [...(hotel.gallery_images || [])];

    if (hotel.cover_image && !images.some(img => img.file_path === hotel.cover_image)) {
      images.unshift({
        id: 0,
        file_path: hotel.cover_image,
        filename: 'cover',
        alt_text: hotel.name,
      });
    }
    return images;
  }, [hotel]);

  // Most popular facilities highlight list
  const popularAmenities = useMemo(() => {
    if (!hotel?.amenities || hotel.amenities.length === 0) return [];

    // 1. Explicitly marked is_popular amenities
    const explicitPopular = hotel.amenities.filter(a => a.is_popular);
    if (explicitPopular.length > 0) return explicitPopular;

    // 2. Fallback to common top highlight amenities if none explicitly toggled
    const commonKeywords = [
      'wifi',
      'pool',
      'swim',
      'fitness',
      'gym',
      'restaurant',
      'dining',
      'bar',
      'spa',
      'parking',
      'airport',
      'shuttle',
      'air conditioning',
      'room service',
      'breakfast',
    ];
    return hotel.amenities.filter(a =>
      commonKeywords.some(kw => a.name.toLowerCase().includes(kw))
    );
  }, [hotel?.amenities]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Loading Hotel"
          canonicalPath={`/hotels/${slug || ''}`}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotel details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !hotel) {
    return (
      <>
        <SeoHead
          title="Hotel Not Found"
          canonicalPath={`/hotels/${slug || ''}`}
          noIndex={true}
        />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel not found</h2>
            <Link to="/hotels" className="text-blue-600 hover:text-blue-700">Back to Hotels</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={hotel.name}
        description={hotel.summary || hotel.description || `Stay at ${hotel.name} with Allbound Vacations.`}
        canonicalPath={`/hotels/${hotel.slug}`}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[
                { label: 'Destinations', path: '/destinations' },
                { label: hotel?.country?.name || 'Country', path: `/destinations/${hotel?.country?.slug}` },
                { label: `${hotel?.country?.name || ''} Hotels`, path: `/destinations/${hotel?.country?.slug}/hotels` },
                { label: hotel?.name || 'Hotel' },
              ]}
            />
          </div>
        </div>

        {/* Hero Section - Header & Gallery */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
            <div className="mb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-playfair tracking-tight leading-tight">
                  {hotel.name}
                </h1>
                {hotel.stars && (
                  <div className="flex items-center gap-1">
                    {renderStars(hotel.stars)}
                    <span className="ml-2 text-sm text-gray-600">
                      {hotel.stars} Star
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                {(hotel.city || hotel.address) && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>
                      {hotel.city || hotel.address}
                      {hotel.country && `, ${hotel.country.name}`}
                    </span>
                  </div>
                )}
                {hotel.price_category && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-1 text-primary" />
                    <span className="font-medium text-gray-900">{hotel.price_category} category</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Gallery */}
            <GridGallery images={getAllImages} className="mb-8" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {hotel.description && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">About This Hotel</h2>
                  <TextDisplay content={hotel.description} />
                </div>
              )}

              {/* Check-in/Check-out */}
              {(hotel.check_in_time || hotel.check_out_time) && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">Stay Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotel.check_in_time && (
                      <div className="bg-primary-light/10 border border-primary-light/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-primary-light/40 p-2 rounded-lg text-primary-dark">
                          <Clock size={24} />
                        </div>
                        <div>
                          <span className="block text-xs text-primary-dark uppercase font-bold tracking-wider">Check-in</span>
                          <p className="text-lg font-semibold text-gray-900">{hotel.check_in_time}</p>
                        </div>
                      </div>
                    )}

                    {hotel.check_out_time && (
                      <div className="bg-quote-btn/10 border border-quote-btn/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-quote-btn/20 p-2 rounded-lg text-quote-btn-dark">
                          <Clock size={24} />
                        </div>
                        <div>
                          <span className="block text-xs text-quote-btn-dark uppercase font-bold tracking-wider">Check-out</span>
                          <p className="text-lg font-semibold text-gray-900">{hotel.check_out_time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seasonal Stay Rates Matrix Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-5 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-playfair flex items-center gap-2">
                      Seasonal Stay Rates & Packages
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Select your travel season and stay duration for instant pricing and direct booking
                    </p>
                  </div>
                  {activePriceCharts.length > 0 ? (
                    <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 bg-teal/10 text-teal-800 rounded-full border border-teal/20">
                      {activePriceCharts.length} {activePriceCharts.length === 1 ? 'Season Rate' : 'Seasonal Rates'} Available
                    </span>
                  ) : (
                    <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      Inquiry Available
                    </span>
                  )}
                </div>

                {activePriceCharts.length > 0 ? (
                  <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
                    <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-200">
                          <th className="py-4 px-5 text-sm font-bold text-gray-900 min-w-[200px]">
                            Season / Date range
                          </th>
                          {uniqueNightDurations.length > 0 ? (
                            uniqueNightDurations.map((nights) => (
                              <th key={nights} className="py-4 px-4 text-sm font-bold text-gray-900 text-center whitespace-nowrap min-w-[130px]">
                                {nights} Nights
                              </th>
                            ))
                          ) : (
                            <th className="py-4 px-4 text-sm font-bold text-gray-900 text-center min-w-[130px]">
                              Base Rate
                            </th>
                          )}
                          <th className="py-4 px-5 text-sm font-bold text-gray-900 text-right min-w-[120px]">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {activePriceCharts.map((chart: any) => {
                          const startDateStr = chart.start_date ? format(parseISO(chart.start_date), 'MMM dd, yyyy') : '';
                          const endDateStr = chart.end_date ? format(parseISO(chart.end_date), 'MMM dd, yyyy') : '';

                          return (
                            <tr key={chart.id} className="hover:bg-teal/5 transition-colors group">
                              {/* Column 1: Season & Date Range */}
                              <td className="py-4 px-5 align-middle">
                                <div className="font-bold text-base text-gray-900 group-hover:text-teal transition-colors">
                                  {chart.title}
                                </div>
                                {(startDateStr || endDateStr) && (
                                  <div className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>{startDateStr} – {endDateStr}</span>
                                  </div>
                                )}
                                {chart.notes && (
                                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 italic">
                                    {chart.notes}
                                  </p>
                                )}
                              </td>

                              {/* Night Duration Columns */}
                              {uniqueNightDurations.length > 0 ? (
                                uniqueNightDurations.map((nights) => {
                                  const matchRate = (chart.night_rates || []).find((nr: any) => Number(nr.nights) === nights && nr.is_active !== false);

                                  if (matchRate) {
                                    return (
                                      <td key={nights} className="py-4 px-3 text-center align-middle">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedPriceChart(chart);
                                            setSelectedNightRate(matchRate);
                                            setShowBookingForm(true);
                                          }}
                                          className="w-full p-2.5 rounded-xl border border-gray-200/80 bg-gray-50 hover:bg-white hover:border-teal hover:shadow-md transition-all duration-200 text-center group/cell"
                                        >
                                          <div className="text-sm font-extrabold text-gray-900 group-hover/cell:text-teal transition-colors">
                                            USD {matchRate.price.toLocaleString()}
                                          </div>
                                          <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                            ~${(matchRate.price / nights).toFixed(0)}/nt
                                          </div>
                                          {matchRate.room_type && (
                                            <div className="text-[10px] text-gray-600 truncate max-w-[120px] mx-auto mt-0.5">
                                              {matchRate.room_type}
                                            </div>
                                          )}
                                        </button>
                                      </td>
                                    );
                                  }

                                  return (
                                    <td key={nights} className="py-4 px-3 text-center align-middle text-gray-300 font-medium text-sm">
                                      —
                                    </td>
                                  );
                                })
                              ) : (
                                <td className="py-4 px-4 text-center align-middle font-bold text-gray-900 text-sm">
                                  USD {chart.price.toLocaleString()}
                                </td>
                              )}

                              {/* Column: Action / Book */}
                              <td className="py-4 px-5 text-right align-middle">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPriceChart(chart);
                                    setSelectedNightRate(chart.night_rates && chart.night_rates.length > 0 ? chart.night_rates[0] : null);
                                    setShowBookingForm(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-4 py-2 bg-quote-btn hover:bg-quote-btn-dark text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                                >
                                  <span>Book Stay</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base font-playfair">Tailored Rates & Availability Upon Request</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Seasonal night packages for {hotel.name} can be reserved directly or customized to your stay dates.
                      </p>
                    </div>
                    <div className="flex gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(true)}
                        className="px-5 py-2.5 bg-quote-btn hover:bg-quote-btn-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        Book This Stay
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInquiryForm(true)}
                        className="px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-800 text-xs font-bold rounded-xl bg-white transition-all"
                      >
                        Send Inquiry
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Most Popular Facilities Section */}
              {popularAmenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-amber-100/60 bg-gradient-to-br from-white to-amber-50/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <h2 className="text-2xl font-bold text-gray-900 font-playfair">Most Popular Facilities</h2>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100/70 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200/60">
                      Guest Highlights
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-5">Key features and amenities most appreciated by guests staying here</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {popularAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:border-teal/50 transition-all duration-200"
                      >
                        <div className="p-2 rounded-lg bg-teal/10 text-teal-700 shrink-0">
                          {renderAmenityIcon(amenity.icon, amenity.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                            {amenity.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Hotel Amenities Section - Horizontal Layout */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-5 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 font-playfair">Hotel Amenities & Facilities</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        All room features, dining services, and on-site guest conveniences
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 bg-teal/10 text-teal-800 rounded-full border border-teal/20">
                      {hotel.amenities.length} total amenities
                    </span>
                  </div>

                  {/* Horizontal Category Rows */}
                  <div className="divide-y divide-gray-100">
                    {Object.entries(
                      hotel.amenities.reduce((acc, amenity) => {
                        const category = amenity.category || 'General';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(amenity);
                        return acc;
                      }, {} as Record<string, typeof hotel.amenities>)
                    ).map(([category, items]) => (
                      <div
                        key={category}
                        className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start"
                      >
                        {/* Category Left Header (Horizontal Anchor) */}
                        <div className="md:col-span-4 lg:col-span-3 flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-teal/10 text-teal shrink-0">
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 font-playfair tracking-tight">
                              {category}
                            </h3>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {items.length} {items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>

                        {/* Category Amenities Grid (Spanning horizontal width) */}
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2.5">
                          {items.map((amenity) => (
                            <div key={amenity.id} className="flex items-start gap-2 group">
                              <span className="mt-0.5 p-0.5 rounded-full bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white transition-colors shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-gray-950 transition-colors block leading-snug">
                                  {amenity.name}
                                </span>
                                {amenity.description && (
                                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-tight">
                                    {amenity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Location Map Section */}
              {hotel.latitude && hotel.longitude && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 font-playfair">Location & Surroundings</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Explore the location and area around {hotel.name}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark bg-primary-light/20 hover:bg-primary-light/30 px-3 py-1.5 rounded-lg transition-colors w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Google Maps
                    </a>
                  </div>

                  <div className="h-80 sm:h-96 rounded-xl overflow-hidden relative border border-gray-200 shadow-inner z-0">
                    <MapContainer
                      center={[hotel.latitude, hotel.longitude]}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[hotel.latitude, hotel.longitude]}>
                        <Popup>
                          <div className="p-1 text-center min-w-[160px]">
                            <h4 className="font-bold text-gray-900 text-sm">{hotel.name}</h4>
                            {(hotel.address || hotel.city) && (
                              <p className="text-xs text-gray-600 mt-1">
                                {[hotel.address, hotel.city, hotel.country?.name].filter(Boolean).join(', ')}
                              </p>
                            )}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                            >
                              <Navigation className="w-3 h-3" /> Get Directions
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div className="mt-4 flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-800">Address: </span>
                      {[hotel.address, hotel.city, hotel.country?.name].filter(Boolean).join(', ') || 'Address available on booking'}
                      <span className="ml-2 text-gray-400">({hotel.latitude.toFixed(5)}, {hotel.longitude.toFixed(5)})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 border border-gray-100">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{hotel.price_category}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-quote-btn hover:bg-quote-btn-dark text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Book Your Stay
                  </button>

                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full border-2 border-primary/50 hover:border-primary text-gray-700 hover:text-primary-dark font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
                  >
                    Send Inquiry
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-primary-light/20 p-1 rounded-full text-primary-dark">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Free cancellation available</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-primary-light/20 p-1 rounded-full text-primary-dark">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Instant confirmation</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">Expert Assistance</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Need help choosing the right room? Our travel specialists are here to help.
                  </p>
                  <button className="text-primary hover:text-primary-dark font-bold text-sm flex items-center gap-2">
                    Chat with an expert <Clock size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Hotels Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SimilarHotels countryId={hotel.country_id || hotel.country?.id!} currentHotelId={hotel.id} />
        </div>

        {/* Booking Form Modal */}
        {hotel && (
          <PackageBookingForm
            packageData={{
              id: hotel.id,
              name: hotel.name,
              slug: hotel.slug,
              description: hotel.description || '',
              summary: hotel.summary,
              country: hotel.country as any,
              country_id: hotel.country_id!,
              is_active: hotel.is_active,
              is_published: true,
              is_featured: hotel.is_featured,
              created_at: hotel.created_at,
              updated_at: hotel.updated_at,
            } as any}
            bookingType="hotel"
            initialPriceChart={selectedPriceChart}
            initialNightRate={selectedNightRate}
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSuccess={() => {
              console.log('Hotel booking submitted successfully');
            }}
          />
        )}

        {/* Inquiry Form Modal */}
        <InquiryForm
          isOpen={showInquiryForm}
          onClose={() => setShowInquiryForm(false)}
          onSuccess={() => {
            console.log('Inquiry submitted successfully');
          }}
          defaultSubject={hotel ? `Inquiry about ${hotel.name}` : ''}
          defaultMessage={hotel ? `I'm interested in staying at ${hotel.name}. Please provide more information about availability and rates.` : ''}
        />
      </div>
    </>
  );
};

export default HotelDetailPage;
