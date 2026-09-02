import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/api';
import { useCountries } from '../../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../../lib/hooks/useHolidayTypes';
import { useCreatePackage, useUpdatePackage } from '../../../lib/hooks/usePackages';
import { useInclusions } from '../../../lib/hooks/useInclusions';
import { useExclusions } from '../../../lib/hooks/useExclusions';
import { useBlogs } from '../../../lib/hooks/useBlogs';
import { useContentTags } from '../../../lib/hooks/useContentTags';
import ImageSelector from '../../../components/ui/ImageSelector';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import GalleryManager from '../../../components/admin/GalleryManager';
import PriceChartManager from '../../../components/admin/PriceChartManager';
import { SimpleItineraryManager } from '../../../components/admin/SimpleItineraryManager';
import TagSelector from '../../../components/admin/TagSelector';
import ConversionTriggersManager from '../../../components/admin/ConversionTriggersManager';
import type { GalleryImage } from '../../../lib/types/api';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

// Form validation schema
const packageSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  summary: z.string().max(255, 'Summary cannot exceed 255 characters').optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  country_id: z.number().min(1, 'Please select a country'),
  holiday_type_ids: z.array(z.number()).min(1, 'Please select at least one holiday type'),
  inclusion_ids: z.array(z.number()).optional(),
  exclusion_ids: z.array(z.number()).optional(),
  blog_post_ids: z.array(z.number()).optional(),
  country_ids: z.array(z.number()).optional(),
  tag_ids: z.array(z.number()).optional(),
  image_id: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_deal: z.boolean(),
  package_type: z.enum(['safari', 'holiday']),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).optional(),
  highlights_raw: z.string().optional(),
  conversion_triggers: z.array(z.object({
    value: z.string().min(1, 'Trigger text is required'),
  })).optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  packageData?: any;
  isEdit?: boolean;
}

const PackageForm: React.FC<PackageFormProps> = ({ packageData }) => {
  const navigate = useNavigate();
  const { id: packageId } = useParams();
  const isEdit = !!packageId;
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: holidayTypes, isLoading: isLoadingHolidayTypes } = useHolidayTypes();
  const { data: inclusions } = useInclusions();
  const { data: exclusions } = useExclusions();
  const { data: blogs, isLoading: isLoadingBlogs } = useBlogs(true);
  const { data: allTags = [] } = useContentTags();

  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage(packageData?.id || (packageId ? parseInt(packageId) : 0));

  const [activeSection, setActiveSection] = useState<string>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSavingFaqs, setIsSavingFaqs] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'info' | 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const [faqToDeleteIndex, setFaqToDeleteIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: isEdit && packageData
      ? {
        name: packageData.name,
        slug: packageData.slug,
        description: packageData.description,
        summary: packageData.summary || '',
        price: packageData.price,
        duration_days: packageData.duration_days,
        country_id: packageData.country_id,
        holiday_type_ids: packageData.holiday_types?.map((ht: any) => ht.id) || [],
        inclusion_ids: packageData.inclusion_items?.map((item: any) => item.id) || [],
        exclusion_ids: packageData.exclusion_items?.map((item: any) => item.id) || [],
        blog_post_ids: packageData.blog_posts?.map((blog: any) => blog.id) || [],
        country_ids: packageData.countries?.map((c: any) => c.id) || [],
        tag_ids: packageData.tags?.map((t: any) => t.id) || [],
        image_id: packageData.image_id || '',
        is_active: packageData.is_active,
        is_featured: packageData.is_featured,
        is_deal: packageData.is_deal || false,
        package_type: packageData.package_type || 'safari',
        highlights_raw: packageData.highlights && Array.isArray(packageData.highlights) ? packageData.highlights.join('\n') : '',
        faqs: packageData.faqs || [],
        conversion_triggers: packageData.conversion_triggers?.map((t: string) => ({ value: t })) || [],
      }
      : {
        name: '',
        slug: '',
        description: '',
        summary: '',
        price: 0,
        duration_days: 1,
        country_id: 0,
        holiday_type_ids: [],
        inclusion_ids: [],
        exclusion_ids: [],
        blog_post_ids: [],
        country_ids: [],
        tag_ids: [],
        image_id: '',
        is_active: true,
        is_featured: false,
        is_deal: false,
        package_type: 'safari',
        highlights_raw: '',
        faqs: [],
        conversion_triggers: [],
      },
  });

  useEffect(() => {
    if (isEdit && packageData) {
      if (packageData.cover_image_id) {
        setCoverImageId(packageData.cover_image_id);
      }
    }
  }, [isEdit, packageData]);

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faqs',
  });
  
  const { fields: triggerFields, append: appendTrigger, remove: removeTrigger } = useFieldArray({
    control,
    name: 'conversion_triggers',
  });

  const handleSaveFaqs = async () => {
    if (!isEdit || !packageId) return;
    
    setIsSavingFaqs(true);
    try {
      const faqs = watch('faqs');
      await apiClient.patch(`/api/v1/packages/${packageId}/faqs`, { faqs });
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'FAQs updated successfully!',
        variant: 'info',
      });
    } catch (error: any) {
      console.error('Error updating FAQs:', error);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to update FAQs. Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsSavingFaqs(false);
    }
  };

  const confirmDeleteFaq = (index: number) => {
    setFaqToDeleteIndex(index);
    setModalState({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ? This action cannot be undone and will be saved immediately.',
      variant: 'danger',
    });
  };

  const executeDeleteFaq = async () => {
    if (faqToDeleteIndex === null) return;

    removeFaq(faqToDeleteIndex);
    
    if (isEdit && packageId) {
      setIsSavingFaqs(true);
      try {
        const currentFaqs = watch('faqs') || [];
        const newFaqs = currentFaqs.filter((_, i) => i !== faqToDeleteIndex);
        
        await apiClient.patch(`/api/v1/packages/${packageId}/faqs`, { faqs: newFaqs });
        setModalState(prev => ({ ...prev, isOpen: false }));
      } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        setModalState({
          isOpen: true,
          title: 'Error',
          message: error.response?.data?.detail || 'Failed to delete FAQ from the database. Please try again.',
          variant: 'danger',
        });
      } finally {
        setIsSavingFaqs(false);
        setFaqToDeleteIndex(null);
      }
    } else {
      setModalState(prev => ({ ...prev, isOpen: false }));
      setFaqToDeleteIndex(null);
    }
  };

  const name = watch('name');
  useEffect(() => {
    if (!isEdit && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, isEdit]);

  const onSubmit = async (formData: PackageFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const parseLines = (raw?: string): string[] => {
        if (!raw) return [];
        return raw
          .split('\n')
          .map(line => line.trim().replace(/^[-•*–—\s]+/, ''))
          .filter(line => line.length > 0);
      };

      const payload = {
        ...formData,
        highlights: parseLines(formData.highlights_raw),
        is_featured: watch('is_featured'),
        is_deal: watch('is_deal'),
        image_id: formData.image_id || undefined,
        conversion_triggers: formData.conversion_triggers?.map(t => t.value) || []
      };
      delete (payload as any).highlights_raw;

      if (isEdit) {
        await updatePackageMutation.mutateAsync(payload);
      } else {
        await createPackageMutation.mutateAsync(payload);
      }

      navigate('/admin/packages');
    } catch (error) {
      console.error('Error saving package:', error);
      setServerError('An error occurred while saving the package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  if (isLoadingCountries || isLoadingHolidayTypes) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
        <p className="mt-2 text-sm text-gray-500">Loading form data...</p>
      </div>
    );
  }

  const SECTIONS = [
    { id: 'basic', label: 'Basic Details', icon: '📝' },
    { id: 'itinerary', label: 'Day-by-Day Itinerary', icon: '🗓️' },
    { id: 'pricing', label: 'Price Charts', icon: '💵' },
    { id: 'inclusions', label: 'Inclusions & Exclusions', icon: '✅' },
    { id: 'gallery', label: 'Photo Gallery', icon: '🖼️', badge: galleryImages.length },
    { id: 'triggers_blogs', label: 'Triggers & Blogs', icon: '⚡', badge: triggerFields.length },
    { id: 'faqs_publish', label: 'FAQs & Publishing', icon: '❓', badge: faqFields.length },
  ];

  return (
    <div className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-xs">
          <div className="flex items-center mb-1">
            <span className="font-bold text-sm">Please fix the following validation errors:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {Object.entries(errors).map(([key, error]: [string, any]) => (
              <li key={key}>
                <span className="capitalize font-semibold">{key.replace('_', ' ')}</span>: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {serverError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* STICKY VERTICAL LEFT NAVIGATION */}
        <div className="w-full lg:w-64 flex-shrink-0 sticky top-20 bg-white rounded-2xl border border-gray-200/80 p-3 shadow-2xs space-y-1.5 z-10">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Package Sections</h3>
            <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{watch('name') || 'New Package'}</p>
          </div>

          <div className="space-y-1">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-2xs scale-[1.01]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </span>
                  {sec.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-150 text-gray-600'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Package' : 'Create Package'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/packages')}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-all text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT DISPLAY */}
        <div className="flex-1 min-w-0 space-y-8 w-full">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* SECTION 1: BASIC DETAILS */}
            {activeSection === 'basic' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 overflow-hidden p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>📝</span> Basic Details & Overview
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Package name, slug, pricing, duration, destinations, and cover image</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Name */}
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
                      Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="e.g. 7-Day Luxury Masai Mara Safari"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal focus:border-transparent"
                      {...register('name')}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
                  </div>

                  {/* Slug */}
                  <div className="sm:col-span-4">
                    <label htmlFor="slug" className="block text-sm font-semibold text-gray-800 mb-1">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      placeholder="7-day-luxury-masai-mara-safari"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal focus:border-transparent font-mono text-xs"
                      {...register('slug')}
                    />
                    {errors.slug && <p className="mt-1 text-xs text-red-600 font-medium">{errors.slug.message}</p>}
                  </div>

                  {/* Package Type Radio Selector */}
                  <div className="sm:col-span-6 bg-gradient-to-r from-amber-50/40 via-white to-teal-50/40 border border-gray-200 rounded-xl p-5 shadow-2xs">
                    <label className="block text-base font-bold text-gray-900 mb-2">
                      Package Category <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="package_type"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            onClick={() => field.onChange('safari')}
                            className={`cursor-pointer rounded-xl border-2 p-4 flex items-start space-x-3 transition-all ${
                              field.value === 'safari'
                                ? 'border-amber-600 bg-amber-50/80 shadow-2xs'
                                : 'border-gray-200 bg-white hover:border-amber-300'
                            }`}
                          >
                            <input
                              type="radio"
                              id="type-safari"
                              checked={field.value === 'safari'}
                              onChange={() => field.onChange('safari')}
                              className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500 mt-1"
                            />
                            <div className="flex-1">
                              <label htmlFor="type-safari" className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                                <span className="text-sm flex items-center gap-1.5">
                                  <span>🦁</span> Safari Package
                                </span>
                              </label>
                              <p className="text-xs text-gray-600 mt-1">Wildlife tours, national parks, and game reserve safaris.</p>
                            </div>
                          </div>

                          <div
                            onClick={() => field.onChange('holiday')}
                            className={`cursor-pointer rounded-xl border-2 p-4 flex items-start space-x-3 transition-all ${
                              field.value === 'holiday'
                                ? 'border-teal bg-teal/10 shadow-2xs'
                                : 'border-gray-200 bg-white hover:border-teal-light'
                            }`}
                          >
                            <input
                              type="radio"
                              id="type-holiday"
                              checked={field.value === 'holiday'}
                              onChange={() => field.onChange('holiday')}
                              className="h-4 w-4 text-teal border-gray-300 focus:ring-teal mt-1"
                            />
                            <div className="flex-1">
                              <label htmlFor="type-holiday" className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                                <span className="text-sm flex items-center gap-1.5">
                                  <span>🏖️</span> Holiday Package
                                </span>
                              </label>
                              <p className="text-xs text-gray-600 mt-1">Leisure getaways, beach holidays, and international tours.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-6">
                    <label htmlFor="summary" className="block text-sm font-semibold text-gray-800 mb-1">
                      Summary Overview
                    </label>
                    <textarea
                      id="summary"
                      rows={2}
                      placeholder="Concise summary for card previews..."
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('summary')}
                    />
                    {errors.summary && <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>}
                  </div>

                  {/* Tour Highlights */}
                  <div className="sm:col-span-6 bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="highlights_raw" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span>✨</span> Tour Highlights / Key Experiences
                      </label>
                      <span className="text-[11px] font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                        Why Choose This Tour Section
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2.5">
                      Enter each highlight or unique selling point on a new line. These will be displayed as the bullet points in the public <strong>"Why Choose This Tour?"</strong> section.
                    </p>
                    <textarea
                      id="highlights_raw"
                      rows={4}
                      placeholder="6-day family Dubai adventure with desert safari & luxury dhow cruise&#10;Dubai Marina Dhow Cruise Dinner with skyline views&#10;Dubai Aquarium, Underwater Zoo & Penguin Cove admission&#10;Dubai Parks & Resorts 1-day pass with private transfers"
                      className="block w-full px-4 py-2.5 text-sm font-mono border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal bg-white"
                      {...register('highlights_raw')}
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      Tip: If left blank, highlights will automatically be generated from your summary and itinerary day titles.
                    </p>
                  </div>

                  {/* Main Description */}
                  <div className="sm:col-span-6">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TinyMCEEditor
                          value={field.value}
                          onChange={field.onChange}
                          label="Full Description"
                          placeholder="Provide a detailed description of this package..."
                          height={320}
                          maxLength={5000}
                          error={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                  </div>

                  {/* Price & Duration */}
                  <div className="sm:col-span-3">
                    <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-1">
                      Base Price (USD per person) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      placeholder="1200.00"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="duration_days" className="block text-sm font-semibold text-gray-800 mb-1">
                      Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="duration_days"
                      min="1"
                      placeholder="7"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('duration_days', { valueAsNumber: true })}
                    />
                    {errors.duration_days && <p className="mt-1 text-xs text-red-600">{errors.duration_days.message}</p>}
                  </div>

                  {/* Primary Country */}
                  <div className="sm:col-span-3">
                    <label htmlFor="country_id" className="block text-sm font-semibold text-gray-800 mb-1">
                      Primary Destination <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country_id"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('country_id', { valueAsNumber: true })}
                    >
                      <option value={0}>Select a country</option>
                      {countries?.map((country) => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                    {errors.country_id && <p className="mt-1 text-xs text-red-600">{errors.country_id.message}</p>}
                  </div>

                  {/* Additional Destinations */}
                  <div className="sm:col-span-6 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Additional Covered Destinations
                    </label>
                    <Controller
                      name="country_ids"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {countries
                            ?.filter((c) => c.id !== watch('country_id'))
                            .map((country) => {
                              const isChecked = (field.value || []).includes(country.id);
                              return (
                                <label key={country.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = field.value || [];
                                      if (e.target.checked) field.onChange([...current, country.id]);
                                      else field.onChange(current.filter((id: number) => id !== country.id));
                                    }}
                                  />
                                  <span>{country.name}</span>
                                </label>
                              );
                            })}
                        </div>
                      )}
                    />
                  </div>

                  {/* Holiday Types */}
                  <div className="sm:col-span-6 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Holiday Types <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="holiday_type_ids"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {holidayTypes?.map((type) => {
                            const isChecked = (field.value || []).includes(type.id);
                            return (
                              <label key={type.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) field.onChange([...current, type.id]);
                                    else field.onChange(current.filter((id) => id !== type.id));
                                  }}
                                />
                                <span>{type.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors.holiday_type_ids && <p className="mt-2 text-xs text-red-600 font-medium">{errors.holiday_type_ids.message}</p>}
                  </div>

                  {/* Content Tags */}
                  <div className="sm:col-span-6">
                    <Controller
                      name="tag_ids"
                      control={control}
                      render={({ field }) => (
                        <TagSelector
                          tags={allTags}
                          selectedTagIds={field.value || []}
                          onChange={field.onChange}
                          label="Content Tags"
                          helperText="Categorizes this package for dynamic filters."
                        />
                      )}
                    />
                  </div>

                  {/* Main Image */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Primary Cover Image</label>
                    <ImageSelector
                      initialImageId={watch('image_id')}
                      onImageSelected={(imageId) => {
                        setValue('image_id', imageId);
                        setCoverImageId(imageId ? parseInt(imageId) : null);
                        if (isEdit && packageId && imageId) {
                          apiClient.post(`/api/v1/packages/${packageId}/cover-image`, { image_id: imageId });
                        }
                      }}
                      variant="thumbnail"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: DAY-BY-DAY ITINERARY */}
            {activeSection === 'itinerary' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>🗓️</span> Day-by-Day Itinerary
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure the day-by-day travel schedule, activities, and meals</p>
                </div>
                {isEdit && packageData?.id ? (
                  <SimpleItineraryManager
                    entityType="package"
                    entityId={packageData.id}
                    countryId={watch('country_id')}
                    countryIds={[watch('country_id'), ...(watch('country_ids') || [])].filter(Boolean)}
                    countries={countries}
                  />
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Save the package first to manage day-by-day itinerary schedule.</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: PRICE CHARTS */}
            {activeSection === 'pricing' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>💵</span> Seasonal Price Charts & Tiers
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Define low season, peak season, and group rates</p>
                </div>
                {isEdit && packageData?.id ? (
                  <PriceChartManager packageId={packageData.id} />
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Save the package first to add seasonal pricing charts.</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: INCLUSIONS & EXCLUSIONS */}
            {activeSection === 'inclusions' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>✅</span> Inclusions & Exclusions
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Select items included in or excluded from this package price</p>
                </div>

                {/* Inclusions */}
                <div>
                  <label className="block text-xs font-bold text-teal uppercase tracking-wider mb-2">Included Items</label>
                  <Controller
                    name="inclusion_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                        {inclusions?.map((inc) => (
                          <label key={inc.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal"
                              checked={(field.value || []).includes(inc.id)}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) field.onChange([...current, inc.id]);
                                else field.onChange(current.filter((id) => id !== inc.id));
                              }}
                            />
                            <span>{inc.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Exclusions */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Excluded Items</label>
                  <Controller
                    name="exclusion_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                        {exclusions?.map((exc) => (
                          <label key={exc.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                              checked={(field.value || []).includes(exc.id)}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) field.onChange([...current, exc.id]);
                                else field.onChange(current.filter((id) => id !== exc.id));
                              }}
                            />
                            <span>{exc.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* SECTION 5: PHOTO GALLERY */}
            {activeSection === 'gallery' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>🖼️</span> Package Photo Gallery
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Upload photos showcasing destinations, accommodations, and activities</p>
                </div>
                <GalleryManager
                  entityType="package"
                  entityId={packageData?.id}
                  images={galleryImages}
                  coverImageId={coverImageId}
                  onImagesChange={setGalleryImages}
                  onCoverImageChange={setCoverImageId}
                />
              </div>
            )}

            {/* SECTION 6: TRIGGERS & BLOGS */}
            {activeSection === 'triggers_blogs' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>⚡</span> Conversion Triggers & Blog Posts
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">High-impact selling points and related blog articles</p>
                </div>

                {/* Conversion Triggers Manager */}
                <ConversionTriggersManager control={control} register={register} />

                {/* Blog Posts */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Related Blog Posts</label>
                  {isLoadingBlogs ? (
                    <p className="text-xs text-gray-500">Loading blog posts...</p>
                  ) : blogs && blogs.length > 0 ? (
                    <Controller
                      name="blog_post_ids"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                          {blogs.map((blog) => {
                            const isChecked = (field.value || []).includes(blog.id);
                            return (
                              <label key={blog.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200/70 hover:bg-gray-50 text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-teal rounded border-gray-300"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) field.onChange([...current, blog.id]);
                                    else field.onChange(current.filter((id) => id !== blog.id));
                                  }}
                                />
                                <span className="truncate">{blog.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  ) : (
                    <p className="text-xs text-gray-500 italic">No blog posts available.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 7: FAQS & PUBLISHING */}
            {activeSection === 'faqs_publish' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>❓</span> FAQs & Publication Settings
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Manage FAQs and control website visibility</p>
                </div>

                {/* FAQs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800">Frequently Asked Questions</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => appendFaq({ question: '', answer: '' })}
                        className="px-3 py-1.5 bg-teal text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-teal-dark transition-all cursor-pointer"
                      >
                        + Add FAQ
                      </button>
                      {isEdit && (
                        <button
                          type="button"
                          disabled={isSavingFaqs}
                          onClick={handleSaveFaqs}
                          className="px-3 py-1.5 border border-teal text-teal text-xs font-bold rounded-lg hover:bg-teal/5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSavingFaqs ? 'Saving...' : 'Save FAQs'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {faqFields.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-2">No FAQs added yet.</p>
                    ) : (
                      faqFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => confirmDeleteFaq(index)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Question {index + 1}</label>
                            <input
                              type="text"
                              placeholder="e.g. Is airport transfer included?"
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal"
                              {...register(`faqs.${index}.question` as const)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Answer</label>
                            <Controller
                              name={`faqs.${index}.answer` as const}
                              control={control}
                              render={({ field: cField }) => (
                                <TinyMCEEditor
                                  value={cField.value}
                                  onChange={cField.onChange}
                                  label=""
                                  placeholder="Enter detailed answer..."
                                  height={180}
                                />
                              )}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Publication Controls */}
                <div className="pt-4 border-t border-gray-150 space-y-4">
                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Active Status</span>
                      <span className="text-xs text-gray-500">Makes this package visible on public pages</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watch('is_active')}
                        onChange={(e) => setValue('is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Featured Package</span>
                      <span className="text-xs text-gray-500">Highlights this package in homepage featured carousels</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watch('is_featured')}
                        onChange={(e) => setValue('is_featured', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Special Hot Deal 🔥</span>
                      <span className="text-xs text-gray-500">Displays a "Hot Deal" badge and includes in Deals section</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watch('is_deal')}
                        onChange={(e) => setValue('is_deal', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          setFaqToDeleteIndex(null);
        }}
        onConfirm={() => {
          if (faqToDeleteIndex !== null) {
            executeDeleteFaq();
          } else {
            setModalState(prev => ({ ...prev, isOpen: false }));
          }
        }}
        title={modalState.title}
        message={modalState.message}
        variant={modalState.variant}
        confirmText={faqToDeleteIndex !== null ? 'Delete FAQ' : 'OK'}
        cancelText={faqToDeleteIndex !== null ? 'Cancel' : ''}
        isLoading={isSavingFaqs}
      />
    </div>
  );
};

export default PackageForm;
