import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import type { PriceChartDetail } from '../../lib/types/api';
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
  Check
} from 'lucide-react';

interface BookingSidebarProps {
  packageSlug: string;
  price?: number;
  durationDays?: number;
  priceCharts?: PriceChartDetail[];
  onBookNow?: () => void;
  onRequestQuote?: () => void;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
  packageSlug,
  price,
  durationDays,
  priceCharts = [],
  onBookNow,
  onRequestQuote,
}) => {
  const [showPriceChart, setShowPriceChart] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate lowest price from price charts or use base price
  const lowestPrice = React.useMemo(() => {
    if (priceCharts && priceCharts.length > 0) {
      const activePrices = priceCharts
        .filter(chart => chart.is_active)
        .map(chart => chart.price);
      
      if (activePrices.length > 0) {
        return Math.min(...activePrices);
      }
    }
    return price || 0;
  }, [priceCharts, price]);

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    } else {
      // Default behavior: navigate to booking form
      window.location.href = `/packages/${packageSlug}/book`;
    }
  };

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote();
    } else {
      // Default behavior: navigate to inquiry form
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
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">From</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-charcoal font-playfair">
              ${lowestPrice?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-sm sm:text-base text-gray-600 font-medium">per person</span>
          </div>
          
          {/* Price Chart Dropdown */}
          {priceCharts && priceCharts.length > 0 && (
            <button
              onClick={() => setShowPriceChart(!showPriceChart)}
              className="mt-2 text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors"
            >
              View price chart
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showPriceChart ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {showPriceChart && priceCharts && priceCharts.length > 0 && (
            <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg space-y-2.5 border border-gray-200 animate-slide-down">
              {priceCharts.map((chart) => (
                <div key={chart.id} className="flex justify-between items-start text-sm border-b border-gray-100 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-charcoal">{chart.title}</span>
                    <span className="text-gray-500 text-xs font-medium">
                      {new Date(chart.start_date).toLocaleDateString()} - {new Date(chart.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-primary">${chart.price.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Per Person</span>
                  </div>
                </div>
              ))}
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
