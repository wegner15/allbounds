import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import type { PriceChartDetail, PriceChartHotelOption } from '../../lib/types/api';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Share2, 
  Mail, 
  Phone,
  Facebook,
  Twitter,
  Copy,
  Check,
  Hotel as HotelIcon,
  Star,
  ChevronDown,
  FileDown
} from 'lucide-react';

interface BookingSidebarProps {
  packageSlug: string;
  price?: number;
  durationDays?: number;
  priceCharts?: PriceChartDetail[];
  onBookNow?: (chart?: PriceChartDetail | null, hotel?: PriceChartHotelOption | null) => void;
  onRequestQuote?: (chart?: PriceChartDetail | null, hotel?: PriceChartHotelOption | null) => void;
  onDownloadBrochure?: () => void;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
  packageSlug,
  price,
  durationDays,
  priceCharts = [],
  onBookNow,
  onRequestQuote,
  onDownloadBrochure,
}) => {
  const activeCharts = useMemo(() => {
    return (priceCharts || []).filter(chart => chart.is_active !== false);
  }, [priceCharts]);

  const [selectedChartId, setSelectedChartId] = useState<number | null>(() => {
    return activeCharts.length > 0 ? activeCharts[0].id : null;
  });

  const selectedChart = useMemo(() => {
    return activeCharts.find(c => c.id === selectedChartId) || (activeCharts.length > 0 ? activeCharts[0] : null);
  }, [activeCharts, selectedChartId]);

  const hotelOptions = useMemo(() => {
    return (selectedChart?.hotel_options || []).filter(opt => opt.is_active !== false);
  }, [selectedChart]);

  const [selectedHotelOption, setSelectedHotelOption] = useState<PriceChartHotelOption | null>(() => {
    if (hotelOptions.length > 0) {
      return hotelOptions.find(opt => opt.is_default) || hotelOptions[0];
    }
    return null;
  });

  // Keep selected hotel option synced when chart changes
  React.useEffect(() => {
    if (hotelOptions.length > 0) {
      const defaultOpt = hotelOptions.find(opt => opt.is_default) || hotelOptions[0];
      setSelectedHotelOption(defaultOpt);
    } else {
      setSelectedHotelOption(null);
    }
  }, [selectedChartId, hotelOptions]);

  const [showPriceChart, setShowPriceChart] = useState(false);
  const [showHotelMenu, setShowHotelMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic calculated price per person
  const currentBasePrice = selectedChart?.price || price || 0;
  const currentSupplement = selectedHotelOption?.price_supplement || 0;
  const calculatedPricePerPerson = currentBasePrice + currentSupplement;

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(selectedChart, selectedHotelOption);
    } else {
      window.location.href = `/packages/${packageSlug}/book`;
    }
  };

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(selectedChart, selectedHotelOption);
    } else {
      window.location.href = `/contact?package=${packageSlug}`;
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = document.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Booking Card */}
      <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 border border-gray-100">
        {/* Price Display */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">
              {selectedHotelOption?.price_supplement ? 'Estimated Rate' : 'From'}
            </span>
            {activeCharts.length > 1 && (
              <span className="text-[11px] font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                {selectedChart?.title || 'Seasonal Rate'}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-charcoal font-playfair transition-all">
              ${calculatedPricePerPerson ? calculatedPricePerPerson.toLocaleString() : (price || 0).toLocaleString()}
            </span>
            <span className="text-sm sm:text-base text-gray-600 font-medium">per person</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-0.5">
            Based on min. 2 travellers sharing
          </div>

          {/* Breakdown if supplement selected */}
          {selectedHotelOption && selectedHotelOption.price_supplement > 0 && (
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
              <span>Tour: ${currentBasePrice.toLocaleString()}</span>
              <span>+</span>
              <span className="text-teal font-bold">{selectedHotelOption.hotel?.name || 'Hotel Upgrade'}: +${selectedHotelOption.price_supplement.toLocaleString()}</span>
            </div>
          )}

          {/* Season Selector Dropdown if multiple active price charts */}
          {activeCharts.length > 1 && (
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Select Travel Season
              </label>
              <select
                value={selectedChartId || ''}
                onChange={(e) => setSelectedChartId(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-teal outline-none"
              >
                {activeCharts.map(chart => (
                  <option key={chart.id} value={chart.id}>
                    {chart.title} (${chart.price.toLocaleString()}/pp)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Accommodation Option Selector in Sidebar */}
          {hotelOptions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <HotelIcon className="w-3.5 h-3.5 text-teal" />
                  Accommodation Tier
                </span>
                <span className="text-[10px] text-teal font-semibold">
                  {hotelOptions.length} available
                </span>
              </div>

              <div className="space-y-1.5">
                {hotelOptions.map((opt, idx) => {
                  const isSelected = selectedHotelOption?.hotel_id === opt.hotel_id;
                  const hotelName = opt.hotel?.name || `Hotel Option #${opt.hotel_id}`;

                  return (
                    <button
                      key={opt.hotel_id || idx}
                      type="button"
                      onClick={() => setSelectedHotelOption(opt)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-teal/5 border-teal shadow-2xs font-semibold text-teal-dark'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border flex-shrink-0 ${
                            isSelected ? 'bg-teal border-teal text-white' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{hotelName}</span>
                        {opt.hotel?.stars && (
                          <span className="text-[10px] text-amber-500 flex-shrink-0">
                            {opt.hotel.stars}★
                          </span>
                        )}
                      </div>

                      <span className="flex-shrink-0 text-[11px] font-bold">
                        {opt.price_supplement > 0 ? `+$${opt.price_supplement}` : 'Incl.'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-5 sm:mb-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBookNow}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation min-h-[52px] rounded-lg"
          >
            Book Now
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleRequestQuote}
            className="bg-quote-btn hover:bg-quote-btn-dark active:bg-quote-btn-dark text-white border-none font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation min-h-[52px] rounded-lg shadow-lg hover:shadow-xl"
          >
            Request Quote
          </Button>

          {onDownloadBrochure && (
            <button
              type="button"
              onClick={onDownloadBrochure}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-teal-50 hover:bg-teal-100/90 active:scale-95 border border-teal-200 text-teal-900 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-teal" />
              <span>Download PDF Brochure</span>
            </button>
          )}
        </div>

        {/* Quick Facts */}
        <div className="border-t border-gray-200 pt-5 space-y-3 sm:space-y-3.5">
          <h4 className="font-bold text-sm sm:text-base text-charcoal mb-3 font-playfair">Quick Facts</h4>
          
          {durationDays && (
            <div className="flex items-center gap-3 text-sm bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-gray-600 text-xs">Duration</span>
                <span className="block font-bold text-charcoal">{durationDays} days</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm bg-accent/5 p-3 rounded-lg border border-accent/10">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-gray-600 text-xs">Group Size</span>
              <span className="block font-bold text-charcoal">Small groups</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm bg-success/5 p-3 rounded-lg border border-success/10">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <span className="text-gray-600 text-xs">Difficulty</span>
              <span className="block font-bold text-charcoal">Moderate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Card */}
      <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm sm:text-base text-charcoal font-playfair">Share this tour</h4>
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation min-h-[44px] border border-blue-200 hover:shadow-md"
            title="Share on Facebook"
            aria-label="Share on Facebook"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center p-3 rounded-lg bg-sky-50 hover:bg-sky-100 active:bg-sky-200 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation min-h-[44px] border border-sky-200 hover:shadow-md"
            title="Share on Twitter"
            aria-label="Share on Twitter"
          >
            <Twitter className="w-5 h-5 text-sky-600" />
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation min-h-[44px] border border-gray-200 hover:shadow-md"
            title="Share via Email"
            aria-label="Share via Email"
          >
            <Mail className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation min-h-[44px] border border-gray-200 hover:shadow-md"
            title="Copy Link"
            aria-label="Copy Link"
          >
            {copied ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Contact Card */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-xl p-5 sm:p-6 border border-primary/20">
        <h4 className="font-bold text-sm sm:text-base text-charcoal mb-4 font-playfair">Need help?</h4>
        <div className="space-y-3">
          <a
            href="tel:+256782594008"
            className="flex items-center gap-3 text-sm text-charcoal hover:text-primary transition-colors touch-manipulation min-h-[44px] py-2 bg-white/50 rounded-lg px-3 hover:bg-white hover:shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">+(256) 782 594008</span>
          </a>
          <a
            href="mailto:bookings@allboundvacations.com"
            className="flex items-center gap-3 text-sm text-charcoal hover:text-primary transition-colors touch-manipulation min-h-[44px] py-2 bg-white/50 rounded-lg px-3 hover:bg-white hover:shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">bookings@allboundvacations.com</span>
          </a>
        </div>
        <Link
          to="/contact"
          className="mt-4 block text-center text-sm font-bold text-primary hover:text-primary-dark py-3 touch-manipulation min-h-[44px] flex items-center justify-center bg-white rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
};

export default BookingSidebar;
