import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  WifiOff,
  ServerCrash
} from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  type?: 'network' | 'server' | 'notfound' | 'generic';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  onRetry,
  showBackButton = true,
  showHomeButton = true,
  type = 'generic'
}) => {
  // Determine icon and default messages based on error type
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Network Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
        };
      case 'server':
        return {
          icon: <ServerCrash className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Our team has been notified and is working to fix it.'
        };
      case 'notfound':
        return {
          icon: <AlertCircle className="w-16 h-16 text-amber-500" />,
          defaultTitle: 'Package Not Found',
          defaultMessage: 'The package you\'re looking for doesn\'t exist or has been removed.'
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Error Loading Package',
          defaultMessage: 'We couldn\'t load the package details. Please try again later.'
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
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
              <Link
                to="/packages"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Packages
              </Link>
            )}

            {showHomeButton && (
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border-2 border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            )}
          </div>

          {/* Additional Help Text */}
          {type === 'network' && (
            <p className="mt-6 text-sm text-gray-500">
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
}

export const SectionError: React.FC<SectionErrorProps> = ({ 
  message = 'Failed to load this section',
  onRetry 
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-700 font-medium mb-3">{message}</p>
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
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon,
  title,
  message 
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {message && (
        <p className="text-gray-500 text-sm">{message}</p>
      )}
    </div>
  );
};

export default ErrorDisplay;
