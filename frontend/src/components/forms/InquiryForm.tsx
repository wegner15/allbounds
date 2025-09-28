import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Components
import Button from '../ui/Button';
import Input from '../ui/Input';
import FormSelect from '../ui/FormSelect';
import PhoneInput from '../ui/PhoneInput';
import CountrySelect from '../ui/CountrySelect';

// API
import { apiClient } from '../../lib/api';

// Types
import type { InquiryCreate } from '../../lib/types/api';

// Validation schema
const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  country_of_origin: z.string().min(2, 'Country of origin is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.string().min(1, 'Please tell us how you found us'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultSubject?: string;
  defaultMessage?: string;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultSubject = '',
  defaultMessage = '',
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      source: 'website',
      subject: defaultSubject,
      message: defaultMessage,
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      const inquiryData: InquiryCreate = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        country_of_origin: data.country_of_origin,
        subject: data.subject,
        message: data.message,
        source: data.source,
      };

      return apiClient.post('/api/v1/bookings/inquiries/', inquiryData);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
      reset();
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    await inquiryMutation.mutateAsync(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Inquiry</h2>
            <p className="text-gray-600 mt-1">
              Get in touch with us - we'll respond within 24 hours
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Enter your full name"
              />
              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoneInput
                label="Phone Number (Optional)"
                value={watch('phone')}
                onChange={(value) => setValue('phone', value)}
                error={errors.phone}
                placeholder="Enter your phone number"
                required={false}
              />
              <CountrySelect
                label="Country of Origin"
                value={watch('country_of_origin')}
                onChange={(value) => setValue('country_of_origin', value)}
                error={errors.country_of_origin}
                placeholder="Select your country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <Input
                {...register('subject')}
                error={errors.subject?.message}
                placeholder="What's your inquiry about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                {...register('message')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={6}
                placeholder="Tell us more about your travel plans, questions, or requirements..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>

            <FormSelect
              label="How did you find us?"
              {...register('source')}
              error={errors.source}
            >
              <option value="website">Website</option>
              <option value="google">Google Search</option>
              <option value="social_media">Social Media</option>
              <option value="friend">Friend/Family</option>
              <option value="travel_agent">Travel Agent</option>
              <option value="advertisement">Advertisement</option>
              <option value="other">Other</option>
            </FormSelect>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-blue-800 font-medium">What happens next?</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    We'll review your inquiry and get back to you within 24 hours with personalized recommendations
                    and answers to your questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || inquiryMutation.isPending}
            >
              {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;