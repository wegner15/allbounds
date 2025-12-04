import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  WifiOff,
  ServerCrash,
  MapPin,
  Globe
} from 'lucide-react';

interface DestinationErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  type?: 'network' | 'server' | 'notfound' | 'generic';
  destinationSlug?: string;
}

export const DestinationErrorDisplay: React.FC<DestinationErrorDisplayProps> = ({
  title,
  message,
  onRetry,
  showBackButton = true,
  showHomeButton = true,
  type = 'generic',
  destinationSlug
}) => {
  const navigate = useNavigate();

  // Determine icon and default messages based on error type
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Network Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'server':
        return {
          icon: <ServerCrash className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Our team has been notified and is working to fix it.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'notfound':
        return {
          icon: <MapPin className="w-16 h-16 text-amber-500" />,
          defaultTitle: 'Destination Not Found',
          defaultMessage: destinationSlug 
            ? `We couldn't find the destination "${destinationSlug}". It may have been removed or the URL might be incorrect.`
            : 'The destination you\'re looking for doesn\'t exist or has been removed.',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Error Loading Destination',
          defaultMessage: 'We couldn\'t load the destination details. Please try again later.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <div className={`${config.bgColor} rounded-2xl shadow-xl p-8 text-center border ${config.borderColor}`}>
          {/* Icon */}
          <div className="flex justify-center mb-6 animate-bounce">
            {config.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-playfair">
            {displayTitle}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {displayMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}

            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            )}
          </div>

          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Looking for something else?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/destinations"
                className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                <Globe className="w-4 h-4" />
                Browse All Destinations
              </Link>
              {showHomeButton && (
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              )}
            </div>
          </div>

          {/* Additional Help Text */}
          {type === 'network' && (
            <p className="mt-6 text-xs text-gray-500">
              If the problem persists, please contact our support team.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact error display for sections
interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
  sectionName?: string;
}

export const SectionError: React.FC<SectionErrorProps> = ({ 
  message,
  onRetry,
  sectionName
}) => {
  const displayMessage = message || `Failed to load ${sectionName || 'this section'}`;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-700 font-medium mb-3">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty state display for sections with no data
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon,
  title,
  message,
  actionLabel,
  actionLink
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {message && (
        <p className="text-gray-500 text-sm mb-4">{message}</p>
      )}
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          {actionLabel}
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      )}
    </div>
  );
};

// Not Found Error Component
export const NotFoundError: React.FC<{ destinationSlug?: string; onRetry?: () => void }> = ({ 
  destinationSlug,
  onRetry 
}) => {
  return (
    <DestinationErrorDisplay
      type="notfound"
      destinationSlug={destinationSlug}
      onRetry={onRetry}
      showBackButton={true}
      showHomeButton={true}
    />
  );
};

// Network Error Component
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <DestinationErrorDisplay
      type="network"
      title="Connection Error"
      message="Unable to load destination details. Please check your internet connection and try again."
      onRetry={onRetry}
      showBackButton={true}
      showHomeButton={true}
    />
  );
};

export default DestinationErrorDisplay;
