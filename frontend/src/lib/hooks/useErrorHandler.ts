import { useState } from 'react';

interface ErrorState {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    isOpen: false,
    title: '',
    message: '',
    details: '',
  });

  const showError = (title: string, message: string, details?: string) => {
    setError({
      isOpen: true,
      title,
      message,
      details,
    });
  };

  const hideError = () => {
    setError({
      isOpen: false,
      title: '',
      message: '',
      details: '',
    });
  };

  const handleApiError = (error: unknown, defaultTitle = 'Error', defaultMessage = 'An unexpected error occurred') => {
    let title = defaultTitle;
    let message = defaultMessage;
    let details: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      details = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
      if ('details' in error) {
        details = String(error.details);
      }
    }

    showError(title, message, details);
  };

  return {
    error,
    showError,
    hideError,
    handleApiError,
  };
};