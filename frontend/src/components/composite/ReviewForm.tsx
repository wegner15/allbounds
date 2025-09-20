import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Rating from '../ui/Rating';

// Extended review schema with title field
const extendedReviewSchema = z.object({
  rating: z.number().min(1, { message: 'Rating is required' }).max(5),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  content: z.string().min(20, { message: 'Review must be at least 20 characters' }),
  author_name: z.string().min(2, { message: 'Name is required' }),
  author_email: z.string().email({ message: 'Please enter a valid email address' }),
  entity_type: z.enum(['package', 'group_trip', 'accommodation']),
  entity_id: z.number(),
  honeypot: z.string().optional(),
});

type ReviewFormData = z.infer<typeof extendedReviewSchema>;

export interface ReviewFormProps {
  onSubmit: (review: ReviewFormData) => Promise<void>;
  entityType: 'package' | 'group_trip' | 'accommodation';
  entityId: number;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  entityType,
  entityId,
  className = '',
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(extendedReviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      content: '',
      author_name: '',
      author_email: '',
      entity_type: entityType,
      entity_id: entityId,
      honeypot: '',
    },
  });
  
  const onSubmitHandler = async (data: ReviewFormData) => {
    // If honeypot field is filled, silently reject the submission
    if (data.honeypot) {
      console.log('Potential spam detected');
      setIsSubmitted(true);
      return;
    }
    
    try {
      await onSubmit(data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <svg
          className="h-12 w-12 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-green-800 mb-2">Thank you for your review!</h3>
        <p className="text-green-700">
          Your review has been submitted and will be published after moderation.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-xl font-playfair font-medium text-charcoal mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        {/* Honeypot field - hidden from users but bots will fill it */}
        <div className="hidden">
          <label htmlFor="honeypot">Leave this field empty</label>
          <input
            type="text"
            id="honeypot"
            {...register('honeypot')}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-charcoal font-medium mb-1">Your Rating</label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rating
                value={field.value}
                readOnly={false}
                onChange={field.onChange}
                size="lg"
              />
            )}
          />
          {errors.rating && (
            <p className="mt-1 text-red-500 text-sm">{errors.rating.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              label="Your Name"
              id="author_name"
              error={errors.author_name?.message}
              fullWidth
              required
              {...register('author_name')}
            />
          </div>
          
          <div>
            <Input
              label="Your Email"
              id="author_email"
              type="email"
              error={errors.author_email?.message}
              fullWidth
              required
              {...register('author_email')}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <Input
            label="Review Title"
            id="title"
            error={errors.title?.message}
            fullWidth
            required
            {...register('title')}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-charcoal font-medium mb-1">
            Review Content
          </label>
          <textarea
            id="content"
            rows={4}
            className={`
              w-full rounded border px-4 py-2 font-lato
              ${
                errors.content
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal'
              }
              focus:outline-none
            `}
            required
            {...register('content')}
          />
          {errors.content && (
            <p className="mt-1 text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          All reviews are moderated and will be published after approval. By submitting a review, you agree to our terms and conditions.
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;
