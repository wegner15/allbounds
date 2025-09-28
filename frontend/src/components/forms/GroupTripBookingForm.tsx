import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import type { GroupTrip, GroupTripWithGallery, Traveler, BookingCreate } from '../../lib/types/api';

// Validation schema
const travelerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  traveler_type: z.enum(['adult', 'child']),
  age: z.number().optional(),
});

const bookingSchema = z.object({
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().min(10, 'Valid phone number is required'),
  country_of_origin: z.string().min(2, 'Country of origin is required'),
  number_of_adults: z.number().min(1, 'At least 1 adult is required'),
  number_of_children: z.number().min(0, 'Number of children is required'),
  travelers: z.array(travelerSchema).min(1, 'At least one traveler is required'),
  special_requests: z.string().optional(),
  source: z.string().min(1, 'Please tell us how you found us'),
  departure_id: z.number().optional(),
}).refine((data) => {
  const totalTravelers = data.travelers.length;
  const expectedTravelers = data.number_of_adults + data.number_of_children;
  return totalTravelers === expectedTravelers;
}, {
  message: "Number of travelers doesn't match adults + children count",
  path: ["travelers"],
}).refine((data) => {
  // Validate that all children have ages
  const childrenWithoutAge = data.travelers.filter(
    t => t.traveler_type === 'child' && (!t.age || t.age <= 0)
  );
  return childrenWithoutAge.length === 0;
}, {
  message: "All children must have a valid age",
  path: ["travelers"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface GroupTripBookingFormProps {
  groupTripData: GroupTrip | GroupTripWithGallery;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GroupTripBookingForm: React.FC<GroupTripBookingFormProps> = ({
  groupTripData,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'details' | 'travelers' | 'confirmation'>('details');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>({
    mode: 'onChange',
    defaultValues: {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      country_of_origin: '',
      number_of_adults: 1,
      number_of_children: 0,
      travelers: [{ full_name: '', traveler_type: 'adult' }],
      special_requests: '',
      source: 'website',
      departure_id: groupTripData.departures?.[0]?.id,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'travelers',
  });

  const handlePhoneChange = useCallback((value: string) => {
    setValue('contact_phone', value);
  }, [setValue]);

  const watchedAdults = watch('number_of_adults') || 0;
  const watchedChildren = watch('number_of_children') || 0;

  // Update travelers array when adult/child counts change
  React.useEffect(() => {
    const currentTravelers = fields.length;
    const expectedTravelers = watchedAdults + watchedChildren;

    if (currentTravelers < expectedTravelers) {
      // Add travelers
      const toAdd = expectedTravelers - currentTravelers;
      for (let i = 0; i < toAdd; i++) {
        const isChild = currentTravelers + i >= watchedAdults;
        append({
          full_name: '',
          traveler_type: isChild ? 'child' : 'adult',
          age: isChild ? undefined : undefined,
        });
      }
    } else if (currentTravelers > expectedTravelers) {
      // Remove travelers
      const toRemove = currentTravelers - expectedTravelers;
      for (let i = 0; i < toRemove; i++) {
        remove(currentTravelers - 1 - i);
      }
    }

    // Update traveler types
    fields.forEach((field, index) => {
      const isChild = index >= watchedAdults;
      if (isChild && field.traveler_type !== 'child') {
        setValue(`travelers.${index}.traveler_type`, 'child');
      } else if (!isChild && field.traveler_type !== 'adult') {
        setValue(`travelers.${index}.traveler_type`, 'adult');
        setValue(`travelers.${index}.age`, undefined);
      }
    });
  }, [watchedAdults, watchedChildren, fields, append, remove, setValue]);

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingData: BookingCreate = {
        booking_type: 'group_trip',
        entity_id: groupTripData.id,
        entity_slug: groupTripData.slug,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        country_of_origin: data.country_of_origin,
        number_of_adults: data.number_of_adults,
        number_of_children: data.number_of_children,
        travelers: data.travelers,
        special_requests: data.special_requests,
        source: data.source,
        departure_id: data.departure_id,
      };

      return apiClient.post('/api/v1/bookings/', bookingData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      onSuccess?.();
      reset();
      setStep('details');
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    console.log('onSubmit called, step:', step, 'data:', data);
    if (step === 'details') {
      let fields: (keyof BookingFormData)[];
      if (groupTripData.departures && groupTripData.departures.length > 1) {
        fields = ['contact_name', 'contact_email', 'contact_phone', 'country_of_origin', 'number_of_adults', 'number_of_children', 'source', 'departure_id'];
      } else {
        fields = ['contact_name', 'contact_email', 'contact_phone', 'country_of_origin', 'number_of_adults', 'number_of_children', 'source'];
      }
      const isValid = await trigger(fields);
      console.log('details validation:', isValid, 'errors:', errors);
      if (isValid) {
        setStep('travelers');
      }
    } else if (step === 'travelers') {
      const isValid = await trigger('travelers');
      console.log('travelers validation:', isValid, 'errors:', errors);
      if (isValid) {
        setStep('confirmation');
      }
    } else {
      console.log('submitting booking', data);
      // Validate the entire data with zod
      const result = bookingSchema.safeParse(data);
      console.log('validation result', result);
      if (result.success) {
        setIsSubmitted(true);
        try {
          await bookingMutation.mutateAsync(data);
          console.log('booking submitted successfully');
        } catch (error) {
          console.error('booking submission failed', error);
          setIsSubmitted(false);
          // Optionally set a submit error
          setError('root', { message: 'Failed to submit booking. Please try again.' });
        }
      } else {
        // Set errors
        result.error.issues.forEach((err) => {
          const path = err.path.join('.');
          setError(path as any, { message: err.message });
          console.log('validation error', path, err.message);
        });
      }
    }
  };

  const goBack = () => {
    if (step === 'travelers') {
      setStep('details');
    } else if (step === 'confirmation') {
      setStep('travelers');
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">Your booking has been submitted. We'll contact you soon with confirmation details.</p>
          <Button onClick={onClose} variant="primary" className="w-full">
            Continue Browsing
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Submitting your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Join {groupTripData.name}</h2>
            <p className="text-gray-600 mt-1">
              {step === 'details' && 'Enter your contact details'}
              {step === 'travelers' && 'Add traveler information'}
              {step === 'confirmation' && 'Review and confirm your booking'}
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

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'details' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'details' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`flex-1 h-px ${step === 'travelers' || step === 'confirmation' ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step === 'travelers' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'travelers' || step === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Travelers</span>
            </div>
            <div className={`flex-1 h-px ${step === 'confirmation' ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step === 'confirmation' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {step === 'details' && (
            <div className="space-y-6">
              {/* Departure Selection */}
              {groupTripData.departures && groupTripData.departures.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Departure Date
                  </label>
                  <FormSelect
                    label="Select Departure Date"
                    {...register('departure_id', { valueAsNumber: true })}
                    error={errors.departure_id}
                  >
                    {groupTripData.departures.map((departure) => (
                      <option key={departure.id} value={departure.id}>
                        {new Date(departure.start_date).toLocaleDateString()} - {new Date(departure.end_date).toLocaleDateString()}
                        ({departure.available_spots} spots available)
                      </option>
                    ))}
                  </FormSelect>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="contact_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Full Name"
                      {...field}
                      error={errors.contact_name?.message}
                      placeholder="Enter your full name"
                    />
                  )}
                />
                <Controller
                  name="contact_email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Email Address"
                      type="email"
                      {...field}
                      error={errors.contact_email?.message}
                      placeholder="your@email.com"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <PhoneInput
                   label="Phone Number"
                   value={watch('contact_phone')}
                   onChange={handlePhoneChange}
                   error={errors.contact_phone}
                   placeholder="Enter your phone number"
                 />
                <CountrySelect
                  label="Country of Origin"
                  value={watch('country_of_origin')}
                  onChange={(value) => setValue('country_of_origin', value)}
                  error={errors.country_of_origin}
                  placeholder="Select your country"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Number of Adults"
                  {...register('number_of_adults', { valueAsNumber: true })}
                  error={errors.number_of_adults}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </FormSelect>
                <FormSelect
                  label="Number of Children"
                  {...register('number_of_children', { valueAsNumber: true })}
                  error={errors.number_of_children}
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </FormSelect>
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
                <option value="other">Other</option>
              </FormSelect>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  {...register('special_requests')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or preferences..."
                />
              </div>
            </div>
          )}

          {step === 'travelers' && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                Please provide details for each traveler. All children must include their age.
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Traveler {index + 1} {field.traveler_type === 'child' ? '(Child)' : '(Adult)'}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name={`travelers.${index}.full_name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Full Name"
                          {...field}
                          error={errors.travelers?.[index]?.full_name?.message}
                          placeholder="Enter full name"
                        />
                      )}
                    />

                    {field.traveler_type === 'child' && (
                      <Input
                        label="Age"
                        type="number"
                        {...register(`travelers.${index}.age`, { valueAsNumber: true })}
                        error={errors.travelers?.[index]?.age?.message}
                        placeholder="Age in years"
                        min={1}
                        max={17}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Group Trip:</strong> {groupTripData.name}</div>
                  <div><strong>Contact:</strong> {watch('contact_name')} ({watch('contact_email')})</div>
                  <div><strong>Travelers:</strong> {watch('number_of_adults')} adults, {watch('number_of_children')} children</div>
                  <div><strong>Country:</strong> {watch('country_of_origin')}</div>
                  {watch('special_requests') && (
                    <div><strong>Special Requests:</strong> {watch('special_requests')}</div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-blue-800 font-medium">Next Steps</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      After submitting, you'll receive a confirmation email with payment instructions.
                      Our team will contact you within 24 hours to finalize your booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {step !== 'details' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
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
                disabled={isSubmitting || bookingMutation.isPending}
              >
                {step === 'confirmation'
                  ? (bookingMutation.isPending ? 'Submitting...' : 'Confirm Booking')
                  : 'Continue'
                }
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupTripBookingForm;