import React, { useState } from 'react';
import { useNewsletterSubscribe } from '../../hooks/useNewsletterSubscribe';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const { mutate, isPending, isSuccess, isError, error } = useNewsletterSubscribe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      mutate({ email });
    }
  };

  return (
    <div className="py-16 bg-charcoal text-paper">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-h2 font-playfair font-bold mb-2">Your Travel Journey Starts Here</h2>
        <p className="text-body font-lato mb-6 text-paper/80">Sign up and we'll send the best deals to you</p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-l-md text-charcoal bg-paper focus:outline-none focus:ring-2 focus:ring-butter font-lato"
              disabled={isPending || isSuccess}
            />
            <button
              type="submit"
              className="bg-butter text-charcoal font-lato font-bold px-6 py-3 rounded-r-md hover:bg-butter/80 transition-colors disabled:bg-paper/50"
              disabled={isPending || isSuccess}
            >
              {isPending ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {isSuccess && (
            <p className="mt-4 text-mint font-lato">Thank you for subscribing!</p>
          )}
          {isError && (
            <p className="mt-4 text-red-300 font-lato">{(error as Error)?.message || 'An error occurred. Please try again.'}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
