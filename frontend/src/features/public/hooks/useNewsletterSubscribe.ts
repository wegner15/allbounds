import { useMutation } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';

interface SubscribeResponse {
  message: string;
}

export const useNewsletterSubscribe = () => {
  return useMutation<SubscribeResponse, Error, { email: string }>({
    mutationFn: ({ email }) => apiClient.post(endpoints.newsletter.subscribe(), { email, source: 'homepage-hero' }),
    onSuccess: (data) => {
      console.log('Subscription successful:', data.message);
      // Optionally, you can use a toast library to show a success message
    },
    onError: (error) => {
      console.error('Subscription failed:', error.message);
      // Optionally, you can use a toast library to show an error message
    },
  });
};
