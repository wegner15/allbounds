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
    <div className="py-16 bg-blue-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Your Travel Journey Starts Here</h2>
        <p className="mb-6">Sign up and we'll send the best deals to you</p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex items-center">
            <input 
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isPending || isSuccess}
            />
            <button 
              type="submit"
              className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-r-md hover:bg-yellow-500 transition-colors disabled:bg-gray-400"
              disabled={isPending || isSuccess}
            >
              {isPending ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {isSuccess && (
            <p className="mt-4 text-green-300">Thank you for subscribing!</p>
          )}
          {isError && (
            <p className="mt-4 text-red-300">{(error as Error)?.message || 'An error occurred. Please try again.'}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
