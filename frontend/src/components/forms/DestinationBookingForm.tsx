import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Building,
  DollarSign,
  Plane,
  Sparkles,
  Heart,
  MessageSquare,
  ShieldCheck,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Send,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useCountries } from '../../lib/hooks/useDestinations';
import type { InquiryCreate } from '../../lib/types/api';

// Options Constants
export const TRAVEL_TYPES = [
  'Holiday / Vacation',
  'Safari',
  'Honeymoon',
  'Family Holiday',
  'Luxury Travel',
  'Adventure',
  'Beach Holiday',
  'City Break',
  'Business Travel',
  'MICE / Group Travel',
  'School Trip',
  'Other'
] as const;

export const CONTACT_METHODS = ['WhatsApp', 'Email', 'Phone'] as const;

export const BEST_TIME_TO_CONTACT = [
  'Morning (08:00 - 12:00)',
  'Afternoon (12:00 - 17:00)',
  'Evening (17:00 - 20:00)',
  'Any Time'
] as const;

export const DATE_FLEXIBILITY_OPTIONS = [
  'Exact Dates Only',
  'Yes, Flexible',
  '± 3 Days',
  '± 1 Week'
] as const;

export const ACCOMMODATION_CATEGORIES = [
  '3★ Standard',
  '4★ Superior',
  '5★ Luxury',
  'Ultra-Luxury',
  'Boutique Hotel',
  'Resort',
  'Lodge / Safari Camp',
  'Flexible / Any'
] as const;

export const ROOM_PREFERENCES = [
  'Single',
  'Double',
  'Twin',
  'Family Room',
  'Suite',
  'Flexible'
] as const;

export const MEAL_PLANS = [
  'Room Only',
  'Bed & Breakfast',
  'Half Board (Breakfast & Dinner)',
  'Full Board (All Meals)',
  'All Inclusive',
  'Flexible'
] as const;

export const BUDGET_RANGES = [
  'Under $1,000 per person',
  '$1,000 - $2,500 per person',
  '$2,500 - $5,000 per person',
  '$5,000 - $10,000 per person',
  '$10,000+ per person',
  'Flexible / Not Sure'
] as const;

export const FLIGHT_OPTIONS = ['Yes', 'No', 'Already Booked'] as const;

export const CABIN_CLASSES = [
  'Economy',
  'Premium Economy',
  'Business Class',
  'First Class'
] as const;

export const TRANSPORT_OPTIONS = ['Private', 'Shared', 'Self-drive', 'None'] as const;

export const EXPERIENCE_ACTIVITIES = [
  'Sightseeing',
  'Wildlife / Safari',
  'Beaches',
  'Water Sports',
  'Shopping',
  'Adventure',
  'Cultural Experiences',
  'Nightlife',
  'Food & Dining',
  'Theme Parks',
  'Cruises',
  'Desert Safari',
  'Luxury Experiences',
  'Wellness / Spa',
  'Photography',
  'Other'
];

export const SPECIAL_OCCASIONS = [
  'None',
  'Honeymoon',
  'Anniversary',
  'Birthday',
  'Wedding',
  'Proposal',
  'Family Celebration',
  'Other'
] as const;

export const LEAD_SOURCES = [
  'Google Search',
  'Facebook',
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Referral',
  'Friend / Family',
  'Travel Agent',
  'Previous Customer',
  'Website',
  'Other'
] as const;

export const TRAVEL_TIMEFRAMES = [
  'Within 1 month',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  'More than 12 months',
  'Just researching'
] as const;

// Zod Form Schema (High-converting: only essential fields marked mandatory)
const destinationBookingSchema = z.object({
  // 1. Destination & Contact
  destination: z.string().min(1, 'Please select or enter your target destination'),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone / WhatsApp number is required'),
  country_of_residence: z.string().optional(),
  preferred_contact_method: z.enum(CONTACT_METHODS),
  best_time_to_contact: z.string().optional(),

  // 2. Travel Type & Dates
  travel_type: z.string().min(1, 'Please select a travel type'),
  start_date: z.string().min(1, 'Preferred start date is required'),
  return_date: z.string().optional(),
  date_flexibility: z.string().optional(),
  number_of_nights: z.string().optional(),

  // 3. Travellers
  adults: z.number().min(1, 'At least 1 adult is required'),
  children: z.number().min(0).optional(),
  children_ages: z.string().optional(),
  infants: z.number().min(0).optional(),
  rooms_required: z.number().min(1).optional(),

  // 4. Accommodation Preferences
  accommodation_category: z.string().optional(),
  room_preference: z.string().optional(),
  meal_plan: z.string().optional(),

  // 5. Budget & Customization
  budget_per_person: z.string().min(1, 'Please select an estimated budget range'),
  has_preferred_package: z.string().optional(),
  preferred_package_name: z.string().optional(),
  interested_in_custom_itinerary: z.string().optional(),

  // 6. Flights & Transportation
  need_flights: z.string().optional(),
  departure_city: z.string().optional(),
  preferred_cabin: z.string().optional(),
  need_transfers: z.string().optional(),
  transportation_during_trip: z.string().optional(),

  // 7. Experiences & Activities
  selected_activities: z.array(z.string()).optional(),

  // 8. Special Requirements
  special_occasion: z.string().optional(),
  dietary_requirements: z.string().optional(),
  special_requests: z.string().optional(),

  // 9. Lead Source & Follow-Up
  lead_source: z.string().optional(),
  travel_timeframe: z.string().optional(),
  message: z.string().min(10, 'Please provide brief details or special notes (min 10 chars)'),

  // 10. Consent
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy to submit an inquiry'
  }),
  marketing_consent: z.boolean().optional()
});

export type DestinationBookingFormData = z.infer<typeof destinationBookingSchema>;

interface DestinationBookingFormProps {
  defaultDestination?: string;
  countryId?: number;
  onSuccess?: () => void;
  isModal?: boolean;
}

export const DestinationBookingForm: React.FC<DestinationBookingFormProps> = ({
  defaultDestination = '',
  countryId,
  onSuccess,
  isModal = false
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Fetch available countries for destination dropdown
  const { data: countries = [] } = useCountries();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<DestinationBookingFormData>({
    resolver: zodResolver(destinationBookingSchema),
    defaultValues: {
      destination: defaultDestination,
      full_name: '',
      email: '',
      phone: '',
      country_of_residence: '',
      preferred_contact_method: 'WhatsApp',
      best_time_to_contact: 'Any Time',
      travel_type: 'Holiday / Vacation',
      start_date: '',
      return_date: '',
      date_flexibility: '± 3 Days',
      number_of_nights: '',
      adults: 2,
      children: 0,
      children_ages: '',
      infants: 0,
      rooms_required: 1,
      accommodation_category: '4★ Superior',
      room_preference: 'Double',
      meal_plan: 'Bed & Breakfast',
      budget_per_person: '$1,000 - $2,500 per person',
      has_preferred_package: 'No',
      preferred_package_name: '',
      interested_in_custom_itinerary: 'Yes',
      need_flights: 'No',
      departure_city: '',
      preferred_cabin: 'Economy',
      need_transfers: 'Yes',
      transportation_during_trip: 'Private',
      selected_activities: ['Sightseeing', 'Wildlife / Safari', 'Cultural Experiences'],
      special_occasion: 'None',
      dietary_requirements: '',
      special_requests: '',
      lead_source: 'Website',
      travel_timeframe: '1–3 months',
      message: '',
      privacy_consent: true as any,
      marketing_consent: true
    }
  });

  const watchDestination = watch('destination');
  const watchChildren = watch('children');
  const watchHasPackage = watch('has_preferred_package');
  const watchNeedFlights = watch('need_flights');
  const watchSelectedActivities = watch('selected_activities') || [];

  // Inquiry Mutation
  const inquiryMutation = useMutation({
    mutationFn: async (data: DestinationBookingFormData) => {
      const inquiryData: InquiryCreate = {
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        country_of_origin: data.country_of_residence || undefined,
        subject: `Destination Booking Inquiry: ${data.destination}`,
        message: data.message,
        source: `Destination Booking Form (${data.lead_source || 'Website'})`,
        details: {
          form_type: 'destination_booking',
          destination: data.destination,
          country_id: countryId,
          preferred_contact_method: data.preferred_contact_method,
          best_time_to_contact: data.best_time_to_contact,
          travel_type: data.travel_type,
          start_date: data.start_date,
          return_date: data.return_date,
          date_flexibility: data.date_flexibility,
          number_of_nights: data.number_of_nights,
          adults: data.adults,
          children: data.children,
          children_ages: data.children_ages,
          infants: data.infants,
          rooms_required: data.rooms_required,
          accommodation_category: data.accommodation_category,
          room_preference: data.room_preference,
          meal_plan: data.meal_plan,
          budget_per_person: data.budget_per_person,
          has_preferred_package: data.has_preferred_package,
          preferred_package_name: data.preferred_package_name,
          interested_in_custom_itinerary: data.interested_in_custom_itinerary,
          need_flights: data.need_flights,
          departure_city: data.departure_city,
          preferred_cabin: data.preferred_cabin,
          need_transfers: data.need_transfers,
          transportation_during_trip: data.transportation_during_trip,
          selected_activities: data.selected_activities,
          special_occasion: data.special_occasion,
          dietary_requirements: data.dietary_requirements,
          special_requests: data.special_requests,
          lead_source: data.lead_source,
          travel_timeframe: data.travel_timeframe,
          uploaded_filename: uploadedFile ? uploadedFile.name : undefined,
          marketing_consent: data.marketing_consent
        }
      };

      return apiClient.post('/api/v1/bookings/inquiries/', inquiryData);
    },
    onSuccess: () => {
      toast.success(
        'Thank you! Your destination booking inquiry has been submitted. Our destination specialists will contact you shortly.',
        { autoClose: 6000 }
      );
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to submit inquiry. Please check your details and try again.');
      console.error('Submission error:', err);
    }
  });

  const onSubmit = async (data: DestinationBookingFormData) => {
    await inquiryMutation.mutateAsync(data);
  };

  // Step Validation Helper
  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof DestinationBookingFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['destination', 'full_name', 'email', 'phone', 'preferred_contact_method'];
    } else if (step === 2) {
      fieldsToValidate = ['travel_type', 'start_date', 'adults'];
    } else if (step === 3) {
      fieldsToValidate = ['budget_per_person'];
    } else if (step === 4) {
      fieldsToValidate = ['message', 'privacy_consent'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const toggleActivity = (act: string) => {
    const current = watchSelectedActivities;
    if (current.includes(act)) {
      setValue('selected_activities', current.filter((item) => item !== act));
    } else {
      setValue('selected_activities', [...current, act]);
    }
  };

  return (
    <div className={`bg-white rounded-2xl ${isModal ? 'p-4 sm:p-6' : 'p-6 sm:p-10 shadow-xl border border-gray-100'}`}>
      {/* Header Banner */}
      <div className="mb-8 text-center border-b border-gray-100 pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary-dark font-bold text-xs uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Destination Booking Inquiry</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 leading-tight">
          Book Your Dream Destination
        </h2>
        <p className="text-sm sm:text-base text-gray-600 font-sans mt-2 max-w-xl mx-auto">
          Fill out your travel preferences below. Our expert travel consultants will craft a customized itinerary and get back to you within 24 hours.
        </p>

        {/* Stepper Progress Bar */}
        <div className="mt-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {[
              { num: 1, label: 'Contact & Destination' },
              { num: 2, label: 'Trip & Group' },
              { num: 3, label: 'Preferences' },
              { num: 4, label: 'Requirements' }
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <button
                  type="button"
                  key={step.num}
                  onClick={async () => {
                    if (step.num < currentStep) setCurrentStep(step.num);
                    else await validateStep(currentStep);
                  }}
                  className={`relative z-10 flex flex-col items-center group cursor-pointer`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isDone
                        ? 'bg-primary text-white shadow-md'
                        : isCurrent
                        ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md'
                        : 'bg-white text-gray-400 border-2 border-gray-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-primary font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: DESTINATION & CONTACT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900 font-playfair">
                1. Destination & Contact Information
              </h3>
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Target Destination <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('destination')}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-sans ${
                    errors.destination ? 'border-red-500' : 'border-gray-250'
                  }`}
                >
                  <option value="">-- Select a Destination --</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name} {country.region?.name ? `(${country.region.name})` : ''}
                    </option>
                  ))}
                  <option value="Dubai, UAE">Dubai, UAE</option>
                  <option value="Kenya Safaris">Kenya Safaris</option>
                  <option value="Tanzania & Zanzibar">Tanzania & Zanzibar</option>
                  <option value="Uganda Gorilla Trekking">Uganda Gorilla Trekking</option>
                  <option value="Maldives Luxury">Maldives Luxury</option>
                  <option value="Egypt & Nile Cruise">Egypt & Nile Cruise</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Europe Tour">Europe Tour</option>
                  <option value="Multiple Destinations / Custom">Multiple Destinations / Custom</option>
                </select>
              </div>
              {errors.destination && (
                <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>
              )}
            </div>

            {/* Traveller Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    {...register('full_name')}
                    placeholder="e.g. Sarah Johnson"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                      errors.full_name ? 'border-red-500' : 'border-gray-250'
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="sarah@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-250'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-250'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              {/* Country of Residence */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Country of Residence
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    {...register('country_of_residence')}
                    placeholder="e.g. United States, United Kingdom, Kenya"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Contact Method & Best Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Preferred Contact Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CONTACT_METHODS.map((method) => {
                    const isSelected = watch('preferred_contact_method') === method;
                    return (
                      <label
                        key={method}
                        className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary-dark shadow-2xs'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          value={method}
                          {...register('preferred_contact_method')}
                          className="sr-only"
                        />
                        <span>{method}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Best Time to Contact
                </label>
                <select
                  {...register('best_time_to_contact')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                >
                  {BEST_TIME_TO_CONTACT.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRAVEL DETAILS & GROUP */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900 font-playfair">
                2. Travel Dates & Group Composition
              </h3>
            </div>

            {/* Travel Type / Interest */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Travel Type / Primary Interest <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {TRAVEL_TYPES.map((type) => {
                  const isSelected = watch('travel_type') === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setValue('travel_type', type)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-2xs font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              {errors.travel_type && (
                <p className="text-xs text-red-500 mt-1">{errors.travel_type.message}</p>
              )}
            </div>

            {/* Dates & Flexibility Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Travel Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('start_date')}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                    errors.start_date ? 'border-red-500' : 'border-gray-250'
                  }`}
                />
                {errors.start_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Return Date (Optional)
                </label>
                <input
                  type="date"
                  {...register('return_date')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Date Flexibility
                </label>
                <select
                  {...register('date_flexibility')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                >
                  {DATE_FLEXIBILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration / Nights */}
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Number of Nights (e.g., 7 Nights)
              </label>
              <input
                type="text"
                {...register('number_of_nights')}
                placeholder="e.g. 7 Nights"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            {/* Group Composition Section */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Group Members & Room Requirements
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Adults */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Adults (18+) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    {...register('adults', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 text-center"
                  />
                </div>

                {/* Children */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Children (2-12)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    {...register('children', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 text-center"
                  />
                </div>

                {/* Infants */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Infants (0-2)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    {...register('infants', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 text-center"
                  />
                </div>

                {/* Rooms Required */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rooms Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    {...register('rooms_required', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 text-center"
                  />
                </div>
              </div>

              {/* Children's Ages input if children > 0 */}
              {watchChildren > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Children&apos;s Ages (Comma separated)
                  </label>
                  <input
                    type="text"
                    {...register('children_ages')}
                    placeholder="e.g. 5, 8, 11"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES & BUDGET */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900 font-playfair">
                3. Accommodation, Flights & Budget Preferences
              </h3>
            </div>

            {/* Accommodation Category & Room Preference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Accommodation Category
                </label>
                <select
                  {...register('accommodation_category')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                >
                  {ACCOMMODATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Room Preference
                </label>
                <select
                  {...register('room_preference')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                >
                  {ROOM_PREFERENCES.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Meal Plan Preference
                </label>
                <select
                  {...register('meal_plan')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                >
                  {MEAL_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget Range Section */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Estimated Budget Per Person{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {BUDGET_RANGES.map((bRange) => {
                  const isSelected = watch('budget_per_person') === bRange;
                  return (
                    <button
                      type="button"
                      key={bRange}
                      onClick={() => setValue('budget_per_person', bRange)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                          : 'bg-white border-emerald-200 text-gray-700 hover:bg-emerald-100/50'
                      }`}
                    >
                      {bRange}
                    </button>
                  );
                })}
              </div>
              {errors.budget_per_person && (
                <p className="text-xs text-red-500 mt-2">{errors.budget_per_person.message}</p>
              )}
            </div>

            {/* Custom Itinerary & Preferred Package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Interested in a Customized Itinerary?
                </label>
                <div className="flex items-center gap-4">
                  {['Yes', 'No'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        watch('interested_in_custom_itinerary') === opt
                          ? 'bg-primary/10 border-primary text-primary-dark'
                          : 'bg-gray-50 border-gray-250 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt}
                        {...register('interested_in_custom_itinerary')}
                        className="sr-only"
                      />
                      <span>{opt === 'Yes' ? 'Yes, Custom Itinerary' : 'No, Standard Package'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Do you already have a preferred package?
                </label>
                <div className="flex items-center gap-4">
                  {['Yes', 'No'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        watchHasPackage === opt
                          ? 'bg-primary/10 border-primary text-primary-dark'
                          : 'bg-gray-50 border-gray-250 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt}
                        {...register('has_preferred_package')}
                        className="sr-only"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {watchHasPackage === 'Yes' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Package Name or Link
                </label>
                <input
                  type="text"
                  {...register('preferred_package_name')}
                  placeholder="e.g. 7-Day Dubai Discovery Experience"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            )}

            {/* Flights & Transportation */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-primary" /> Flights & Local Transportation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Do you need flights?</label>
                  <select
                    {...register('need_flights')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                  >
                    {FLIGHT_OPTIONS.map((fOpt) => (
                      <option key={fOpt} value={fOpt}>
                        {fOpt}
                      </option>
                    ))}
                  </select>
                </div>

                {watchNeedFlights === 'Yes' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Departure Airport / City</label>
                      <input
                        type="text"
                        {...register('departure_city')}
                        placeholder="e.g. London LHR, New York JFK"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Cabin</label>
                      <select
                        {...register('preferred_cabin')}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                      >
                        {CABIN_CLASSES.map((cab) => (
                          <option key={cab} value={cab}>
                            {cab}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Airport Transfers Required?</label>
                  <select
                    {...register('need_transfers')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="Yes">Yes, Both Arrival & Departure</option>
                    <option value="Arrival Only">Arrival Only</option>
                    <option value="Departure Only">Departure Only</option>
                    <option value="No">No, I will manage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Trip Ground Transport</label>
                  <select
                    {...register('transportation_during_trip')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                  >
                    {TRANSPORT_OPTIONS.map((tOpt) => (
                      <option key={tOpt} value={tOpt}>
                        {tOpt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EXPERIENCES, SPECIAL REQUIREMENTS & FINAL SUBMIT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900 font-playfair">
                4. Experiences, Special Requests & Submission
              </h3>
            </div>

            {/* Experiences & Activities Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Experiences & Activities You Wish to Include (Select multiple)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {EXPERIENCE_ACTIVITIES.map((act) => {
                  const isChecked = watchSelectedActivities.includes(act);
                  return (
                    <button
                      type="button"
                      key={act}
                      onClick={() => toggleActivity(act)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-primary/15 border-primary text-primary-dark font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-gray-400 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{act}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Occasion & Dietary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Special Occasion
                </label>
                <select
                  {...register('special_occasion')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  {SPECIAL_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Dietary Requirements / Allergies
                </label>
                <input
                  type="text"
                  {...register('dietary_requirements')}
                  placeholder="e.g. Vegetarian, Halal, Gluten-Free, Peanut Allergy"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            {/* Lead Source & Timeframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  How did you hear about us?
                </label>
                <select
                  {...register('lead_source')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  How soon are you planning to travel?
                </label>
                <select
                  {...register('travel_timeframe')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  {TRAVEL_TIMEFRAMES.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message / Additional Information */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Additional Information / Specific Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register('message')}
                placeholder="Tell us more about your ideal trip, preferred pace, must-see places, or any special requests..."
                className={`w-full p-4 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                  errors.message ? 'border-red-500' : 'border-gray-250'
                }`}
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            {/* File Upload (Optional) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-primary" /> Upload Documents / Itinerary Draft (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedFile(e.target.files[0]);
                  }
                }}
                className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20 cursor-pointer"
              />
              {uploadedFile && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  Selected file: {uploadedFile.name}
                </p>
              )}
            </div>

            {/* Privacy & Marketing Consents */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('privacy_consent')}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs text-gray-600 leading-normal">
                  I agree to the <a href="/privacy-policy" className="text-primary font-bold hover:underline" target="_blank">Privacy Policy</a> and consent to Allbound Vacations processing my details to plan and manage my trip inquiry. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.privacy_consent && (
                <p className="text-xs text-red-500">{errors.privacy_consent.message}</p>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('marketing_consent')}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs text-gray-600 leading-normal">
                  Send me exclusive destination travel deals, seasonal discounts, and newsletter inspiration. (Optional)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-150">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => validateStep(currentStep)}
              className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary-dark transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || inquiryMutation.isPending}
              className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white font-bold text-base rounded-xl shadow-lg hover:bg-emerald-700 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{inquiryMutation.isPending ? 'Submitting Inquiry...' : 'Submit Destination Inquiry'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DestinationBookingForm;
