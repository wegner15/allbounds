import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../lib/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: (newSubscription: { email: string; source: string }) => 
      apiClient.post(endpoints.newsletter.subscribe(), newSubscription),
    onSuccess: () => {
      // You can add a success message or toast here
      console.log('Successfully subscribed!');
      setEmail('');
    },
    onError: (error: unknown) => {
      // You can add an error message or toast here
      console.error('Subscription failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email, source: 'footer' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Stay Updated</h3>
      <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest deals and travel inspiration.</p>
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          noMargin
          className="flex-grow bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-primary focus:border-primary py-2"
        />
        <Button 
          type="submit" 
          variant="primary"
          size="md"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      {mutation.isSuccess && (
        <p className="text-green-400 mt-2 text-sm">Thank you for subscribing!</p>
      )}
      {mutation.isError && (
        <p className="text-red-400 mt-2 text-sm">
          {mutation.error.response?.data?.detail || 'An error occurred. Please try again.'}
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
