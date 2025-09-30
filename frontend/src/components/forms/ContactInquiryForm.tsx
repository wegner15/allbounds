import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';

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

const ContactInquiryForm: React.FC = () => {
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
      toast.success('Thank you for your inquiry! We\'ll get back to you within 24 hours.');
      reset();
    },
    onError: () => {
      toast.error('Failed to send inquiry. Please try again.');
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    await inquiryMutation.mutateAsync(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
        <p className="text-gray-600">
          Get in touch with us - we'll respond within 24 hours
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            {...register('subject')}
            error={errors.subject?.message}
            placeholder="What's your inquiry about?"
            className="w-full"
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

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || inquiryMutation.isPending}
            className="px-8"
          >
            {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactInquiryForm;