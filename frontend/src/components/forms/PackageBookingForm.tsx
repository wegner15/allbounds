import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Hotel as HotelIcon, Star, Check } from 'lucide-react';

// Components
import Button from '../ui/Button';
import Input from '../ui/Input';
import FormSelect from '../ui/FormSelect';
import PhoneInput from '../ui/PhoneInput';
import CountrySelect from '../ui/CountrySelect';

// API
import { apiClient } from '../../lib/api';

// Types
import type { Package, PackageWithGallery, Traveler, BookingCreate, PriceChartHotelOption, PriceChartDetail } from '../../lib/types/api';

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
  partner_code: z.string().optional().nullable(),
  price_chart_id: z.number().optional().nullable(),
  selected_hotel_id: z.number().optional().nullable(),
  selected_hotel_name: z.string().optional().nullable(),
  selected_hotel_supplement: z.number().optional().nullable(),
  selected_room_type: z.string().optional().nullable(),
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

interface PackageBookingFormProps {
  packageData: Package | PackageWithGallery | any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  bookingType?: 'package' | 'group_trip' | 'hotel';
  initialPriceChart?: any;
  initialHotelOption?: PriceChartHotelOption | null;
}

const PackageBookingForm: React.FC<PackageBookingFormProps> = ({
  packageData,
  isOpen,
  onClose,
  onSuccess,
  bookingType = 'package',
  initialPriceChart,
  initialHotelOption
}) => {
  const [step, setStep] = useState<'details' | 'travelers' | 'confirmation'>('details');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Available price charts and hotel options
  const availablePriceCharts = useMemo<PriceChartDetail[]>(() => {
    return (packageData?.price_charts || []).filter((c: any) => c.is_active !== false);
  }, [packageData]);

  const [selectedChartId, setSelectedChartId] = useState<number | null>(() => {
    return initialPriceChart?.id || (availablePriceCharts.length > 0 ? availablePriceCharts[0].id : null);
  });

  const selectedChart = useMemo(() => {
    return availablePriceCharts.find(c => c.id === selectedChartId) || initialPriceChart || null;
  }, [availablePriceCharts, selectedChartId, initialPriceChart]);

  const availableHotelOptions = useMemo<PriceChartHotelOption[]>(() => {
    if (selectedChart?.hotel_options && selectedChart.hotel_options.length > 0) {
      return selectedChart.hotel_options.filter((opt: PriceChartHotelOption) => opt.is_active !== false);
    }
    // Fallback: check if packageData has hotels
    if (packageData?.hotels && packageData.hotels.length > 0) {
      return packageData.hotels.map((h: any, idx: number) => ({
        hotel_id: h.id,
        price_supplement: 0,
        room_type: 'Standard Room',
        is_default: idx === 0,
        is_active: true,
        hotel: h
      }));
    }
    return [];
  }, [selectedChart, packageData]);

  const [selectedHotel, setSelectedHotel] = useState<PriceChartHotelOption | null>(() => {
    if (initialHotelOption) return initialHotelOption;
    if (availableHotelOptions.length > 0) {
      return availableHotelOptions.find(opt => opt.is_default) || availableHotelOptions[0];
    }
    return null;
  });

  // Keep selectedHotel synchronized
  useEffect(() => {
    if (initialHotelOption) {
      setSelectedHotel(initialHotelOption);
    } else if (availableHotelOptions.length > 0 && !selectedHotel) {
      setSelectedHotel(availableHotelOptions.find(opt => opt.is_default) || availableHotelOptions[0]);
    }
  }, [initialHotelOption, availableHotelOptions, selectedHotel]);

  // Partner Referral states
  const [validatedPartner, setValidatedPartner] = useState<{ name: string; discount_percent: number } | null>(null);
  const [isValidatingPartner, setIsValidatingPartner] = useState(false);
  const [partnerValidationMessage, setPartnerValidationMessage] = useState<string | null>(null);

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
      partner_code: localStorage.getItem('partner_code') || '',
      price_chart_id: selectedChartId,
      selected_hotel_id: selectedHotel?.hotel_id,
      selected_hotel_name: selectedHotel?.hotel?.name,
      selected_hotel_supplement: selectedHotel?.price_supplement || 0,
      selected_room_type: selectedHotel?.room_type,
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

  // Calculate live total price
  const baseRatePerPerson = selectedChart?.price || packageData?.price || 0;
  const hotelSupplement = selectedHotel?.price_supplement || 0;
  const ratePerAdult = baseRatePerPerson + hotelSupplement;
  const ratePerChild = Math.round(ratePerAdult * 0.7);
  const calculatedTotal = (ratePerAdult * watchedAdults) + (ratePerChild * watchedChildren);

  // Update travelers array when adult/child counts change
  useEffect(() => {
    const currentTravelers = fields.length;
    const expectedTravelers = watchedAdults + watchedChildren;

    if (currentTravelers < expectedTravelers) {
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
      const toRemove = currentTravelers - expectedTravelers;
      for (let i = 0; i < toRemove; i++) {
        remove(currentTravelers - 1 - i);
      }
    }
  }, [watchedAdults, watchedChildren, fields.length, append, remove]);

  const handleValidatePartnerCode = async (code: string) => {
    if (!code || code.trim() === '') {
      setValidatedPartner(null);
      setPartnerValidationMessage(null);
      return;
    }

    setIsValidatingPartner(true);
    setPartnerValidationMessage(null);

    try {
      const response = await apiClient.get<{ valid: boolean; partner_name?: string; discount_percentage?: number; message?: string }>(
        `/partners/validate/${encodeURIComponent(code.trim().toUpperCase())}`
      );

      if (response && response.valid) {
        setValidatedPartner({
          name: response.partner_name || 'Partner',
          discount_percent: response.discount_percentage || 5,
        });
        setPartnerValidationMessage(`Promo code applied: ${response.partner_name || 'Partner discount'}`);
      } else {
        setValidatedPartner(null);
        setPartnerValidationMessage(response?.message || 'Invalid or expired referral code');
      }
    } catch {
      setValidatedPartner(null);
      setPartnerValidationMessage('Could not verify referral code');
    } finally {
      setIsValidatingPartner(false);
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingData: BookingCreate = {
        booking_type: bookingType,
        entity_id: packageData.id,
        entity_slug: packageData.slug,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        country_of_origin: data.country_of_origin,
        number_of_adults: data.number_of_adults,
        number_of_children: data.number_of_children,
        travelers: data.travelers,
        special_requests: data.special_requests,
        source: data.source,
        partner_code: data.partner_code || undefined,
        price_chart_id: selectedChart?.id,
        selected_hotel_id: selectedHotel?.hotel_id,
        selected_hotel_name: selectedHotel?.hotel?.name,
        selected_hotel_supplement: selectedHotel?.price_supplement || 0,
        selected_room_type: selectedHotel?.room_type,
        calculated_total_price: calculatedTotal,
      };

      return apiClient.post('/bookings/', bookingData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      onSuccess?.();
      reset();
      setValidatedPartner(null);
      setPartnerValidationMessage(null);
      setStep('details');
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (step === 'details') {
      const isValid = await trigger(['contact_name', 'contact_email', 'contact_phone', 'country_of_origin', 'number_of_adults', 'number_of_children', 'source', 'partner_code']);
      if (isValid) {
        setStep('travelers');
      }
    } else if (step === 'travelers') {
      const isValid = await trigger('travelers');
      if (isValid) {
        setStep('confirmation');
      }
    } else {
      const result = bookingSchema.safeParse(data);
      if (result.success) {
        setIsSubmitted(true);
        try {
          await bookingMutation.mutateAsync(data);
        } catch (error) {
          console.error('booking submission failed', error);
          setIsSubmitted(false);
          setError('root', { message: 'Failed to submit booking. Please try again.' });
        }
      } else {
        result.error.issues.forEach((err) => {
          const path = err.path.join('.');
          setError(path as any, { message: err.message });
        });
      }
    }
  };

  const goBack = () => {
    if (step === 'travelers') setStep('details');
    else if (step === 'confirmation') setStep('travelers');
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Booking Received!</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Thank you for booking with All Bounds Vacations. Our safari concierge has received your request and will contact you within 24 hours to confirm your itinerary and hotel options.
          </p>
          <Button onClick={onClose} variant="primary" className="w-full">
            Continue Browsing
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Confirming Your Booking...</h3>
          <p className="text-gray-500 text-sm">Please hold on while we secure your reservation details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 my-8 animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-serif">
              Book {packageData.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {step === 'details' ? '1' : step === 'travelers' ? '2' : '3'} of 3: {
                step === 'details' ? 'Guest & Accommodation Details' :
                step === 'travelers' ? 'Traveler Information' : 'Review & Confirm'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span className={step === 'details' ? 'text-teal font-bold' : 'text-gray-400'}>1. Details & Hotel</span>
            <span className={step === 'travelers' ? 'text-teal font-bold' : 'text-gray-400'}>2. Travelers</span>
            <span className={step === 'confirmation' ? 'text-teal font-bold' : 'text-gray-400'}>3. Confirm</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal h-full transition-all duration-300"
              style={{ width: step === 'details' ? '33.3%' : step === 'travelers' ? '66.6%' : '100%' }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {step === 'details' && (
            <div className="space-y-6">
              {availablePriceCharts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Selected Travel Season / Rate
                  </label>
                  <select
                    value={selectedChartId || ''}
                    onChange={(e) => setSelectedChartId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                  >
                    {availablePriceCharts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} — ${c.price.toLocaleString()} per person
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {availableHotelOptions.length > 0 && (
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <HotelIcon className="w-4 h-4 text-teal" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Choose Your Accommodation Option
                      </span>
                    </div>
                    {selectedHotel && (
                      <span className="text-xs font-semibold text-teal">
                        {selectedHotel.price_supplement > 0 ? `+$${selectedHotel.price_supplement} pp` : 'Base Rate'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableHotelOptions.map((opt, idx) => {
                      const isSelected = selectedHotel?.hotel_id === opt.hotel_id;
                      const hotelObj = opt.hotel;

                      return (
                        <div
                          key={opt.hotel_id || idx}
                          onClick={() => setSelectedHotel(opt)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-white border-teal ring-2 ring-teal/30 shadow-xs'
                              : 'bg-white hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {hotelObj?.image_url || hotelObj?.cover_image ? (
                                <img
                                  src={hotelObj.image_url || hotelObj.cover_image}
                                  alt={hotelObj?.name || 'Hotel'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <HotelIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-gray-900 truncate">
                                  {hotelObj?.name || `Hotel #${opt.hotel_id}`}
                                </span>
                                {hotelObj?.stars && (
                                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-500 flex-shrink-0">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                                    {hotelObj.stars}★
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500 block truncate">
                                {opt.room_type || 'Standard Accommodation'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className={`text-xs font-bold ${opt.price_supplement > 0 ? 'text-amber-700' : 'text-teal'}`}>
                              {opt.price_supplement > 0 ? `+$${opt.price_supplement}` : 'Included'}
                            </span>
                            <div className="mt-1 flex justify-end">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                                  isSelected ? 'bg-teal border-teal text-white' : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 bg-teal/5 rounded-xl border border-teal/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">Live Price Estimate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900 font-serif">
                      ${calculatedTotal.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">total for {watchedAdults + watchedChildren} traveler(s)</span>
                  </div>
                  <span className="text-[11px] text-teal-dark font-medium">
                    (${ratePerAdult.toLocaleString()} / adult)
                  </span>
                </div>
                <span className="text-xs font-semibold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                  Locked upon deposit
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="contact_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Full Name"
                      {...field}
                      error={errors.contact_name?.message}
                      placeholder="e.g. Sarah Jenkins"
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
                      placeholder="sarah@example.com"
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
                  placeholder="e.g. +1 555 123 4567"
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
                    <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                  ))}
                </FormSelect>
                <FormSelect
                  label="Number of Children (Under 18)"
                  {...register('number_of_children', { valueAsNumber: true })}
                  error={errors.number_of_children}
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                  ))}
                </FormSelect>
              </div>

              <div>
                <label htmlFor="partner_code" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Referral / Partner Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <Controller
                    name="partner_code"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        value={field.value || ''}
                        className="flex-grow px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-teal outline-none"
                        placeholder="e.g. SAFARI2026"
                        onChange={(e) => {
                          field.onChange(e);
                          if (partnerValidationMessage) {
                            setPartnerValidationMessage(null);
                            setValidatedPartner(null);
                          }
                        }}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = getValues('partner_code');
                      if (code) handleValidatePartnerCode(code);
                    }}
                    disabled={isValidatingPartner}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {isValidatingPartner ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {partnerValidationMessage && (
                  <p className={`mt-1.5 text-xs font-semibold ${
                    validatedPartner ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {partnerValidationMessage}
                  </p>
                )}
              </div>

              <FormSelect
                label="How did you hear about us?"
                {...register('source')}
                error={errors.source}
              >
                <option value="website">Website / Search</option>
                <option value="google">Google</option>
                <option value="social_media">Social Media (Instagram/Facebook)</option>
                <option value="friend">Friend or Family Recommendation</option>
                <option value="travel_agent">Travel Agent</option>
                <option value="other">Other</option>
              </FormSelect>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Special Requests / Dietary Requirements <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  {...register('special_requests')}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal outline-none"
                  rows={2}
                  placeholder="e.g. Vegetarian meals, honeymoon suite, airport pickup flight details..."
                />
              </div>
            </div>
          )}

          {step === 'travelers' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                Please enter full names matching passports. All children must include their age.
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      Traveler {index + 1} • <span className="text-teal capitalize">{field.traveler_type}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      name={`travelers.${index}.full_name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Full Legal Name"
                          {...field}
                          error={errors.travelers?.[index]?.full_name?.message}
                          placeholder="As written on passport"
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
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
                <h3 className="text-base font-bold text-gray-900 font-serif border-b pb-2">Booking Summary</h3>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Tour Package:</span>
                    <span>{packageData.name}</span>
                  </div>
                  {selectedChart && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Travel Period / Season:</span>
                      <span>{selectedChart.title}</span>
                    </div>
                  )}
                  {selectedHotel && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Accommodation Tier:</span>
                      <span className="text-teal font-bold">
                        {selectedHotel.hotel?.name || 'Selected Hotel'}
                        {selectedHotel.room_type ? ` (${selectedHotel.room_type})` : ''}
                        {selectedHotel.price_supplement > 0 ? ` [+$${selectedHotel.price_supplement} pp]` : ' [Included]'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Lead Contact:</span>
                    <span>{watch('contact_name')} ({watch('contact_email')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Party Size:</span>
                    <span>{watchedAdults} Adult(s), {watchedChildren} Child(ren)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Country of Origin:</span>
                    <span>{watch('country_of_origin')}</span>
                  </div>
                  {watch('special_requests') && (
                    <div className="pt-2 border-t text-gray-600">
                      <span className="font-semibold text-gray-900 block mb-0.5">Special Requests:</span>
                      <span>{watch('special_requests')}</span>
                    </div>
                  )}
                </div>

                {/* Total Price Breakdown */}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Estimated Total:</span>
                  <span className="text-xl font-bold text-teal font-serif">${calculatedTotal.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
                <span className="font-bold block">Next Steps:</span>
                <p>Upon submitting, our tour specialist will review your chosen hotel options and send your confirmed itinerary invoice and payment link within 24 hours.</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
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
                  ? (bookingMutation.isPending ? 'Submitting...' : 'Confirm Reservation')
                  : 'Continue to Travelers'
                }
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingForm;