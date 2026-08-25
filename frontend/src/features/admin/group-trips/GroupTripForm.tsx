import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateGroupTrip, useUpdateGroupTrip, useGroupTripDetailsById } from '../../../lib/hooks/useGroupTrips';
import { useCountries } from '../../../lib/hooks/useDestinations';
import { usePackages } from '../../../lib/hooks/usePackages';
import { useInclusions } from '../../../lib/hooks/useInclusions';
import { useExclusions } from '../../../lib/hooks/useExclusions';
import { useContentTags } from '../../../lib/hooks/useContentTags';
import TagSelector from '../../../components/admin/TagSelector';
import GalleryManager from '../../../components/admin/GalleryManager';
import { SimpleItineraryManager } from '../../../components/admin/SimpleItineraryManager';
import ImageSelector from '../../../components/ui/ImageSelector';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import PriceChartManager from '../../../components/admin/PriceChartManager';
import ConversionTriggersManager from '../../../components/admin/ConversionTriggersManager';

const groupTripSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  summary: z.string().max(255, 'Summary must be less than 255 characters').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  country_id: z.number().min(1, 'Please select a destination'),
  package_id: z.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  min_participants: z.number().optional(),
  max_participants: z.number().min(1, 'Maximum participants must be at least 1'),
  price: z.number().min(0, 'Price must be a positive number'),
  inclusion_ids: z.array(z.number()).optional(),
  exclusion_ids: z.array(z.number()).optional(),
  country_ids: z.array(z.number()).optional(),
  tag_ids: z.array(z.number()).optional(),
  image_id: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  itinerary: z.string().optional(),
  conversion_triggers: z.array(z.object({
    value: z.string().min(1, 'Trigger text is required'),
  })).optional(),
});

type GroupTripFormData = z.infer<typeof groupTripSchema>;

interface GroupTripFormProps {
  groupTripData?: any;
  isEdit?: boolean;
  groupTripId?: number;
}

const GroupTripForm: React.FC<GroupTripFormProps> = ({ groupTripData, isEdit = false, groupTripId }) => {
  const navigate = useNavigate();
  
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: packages } = usePackages();
  const { data: inclusions } = useInclusions();
  const { data: exclusions } = useExclusions();
  const { data: allTags = [] } = useContentTags();
  
  const { data: groupTripDetails } = useGroupTripDetailsById(groupTripId || 0);
  
  const createGroupTripMutation = useCreateGroupTrip();
  const updateGroupTripMutation = useUpdateGroupTrip();
  
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  
  useEffect(() => {
    if (isEdit && (groupTripDetails as any)?.gallery) {
      setGalleryImages((groupTripDetails as any).gallery);
      const coverImage = (groupTripDetails as any).gallery.find((img: any) => img.id === (groupTripDetails as any).cover_image_id);
      if (coverImage) {
        setCoverImageId(coverImage.id);
      }
    }
  }, [isEdit, groupTripDetails]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<GroupTripFormData>({
    resolver: zodResolver(groupTripSchema),
    defaultValues: isEdit && groupTripData
      ? {
          name: groupTripData.name,
          summary: groupTripData.summary || '',
          slug: groupTripData.slug,
          description: groupTripData.description,
          country_id: groupTripData.country_id,
          package_id: groupTripData.package_id || 0,
          duration_days: groupTripData.duration_days || 1,
          min_participants: groupTripData.min_participants || 0,
          max_participants: groupTripData.max_participants || 10,
          price: groupTripData.price || 0,
          inclusion_ids: groupTripData.inclusion_items?.map((item: any) => item.id) || [],
          exclusion_ids: groupTripData.exclusion_items?.map((item: any) => item.id) || [],
          country_ids: groupTripData.countries?.map((c: any) => c.id) || [],
          tag_ids: groupTripData.tags?.map((t: any) => t.id) || groupTripData.tag_ids || [],
          image_id: groupTripData.image_id || '',
          is_active: groupTripData.is_active !== undefined ? groupTripData.is_active : true,
          is_featured: groupTripData.is_featured !== undefined ? groupTripData.is_featured : false,
          start_date: groupTripData.start_date || '',
          end_date: groupTripData.end_date || '',
          itinerary: groupTripData.itinerary || '',
          conversion_triggers: groupTripData.conversion_triggers?.map((t: string) => ({ value: t })) || [],
        }
      : {
          name: '',
          summary: '',
          slug: '',
          description: '',
          country_id: 0,
          package_id: 0,
          duration_days: 1,
          min_participants: 0,
          max_participants: 10,
          price: 0,
          inclusion_ids: [],
          exclusion_ids: [],
          country_ids: [],
          tag_ids: [],
          image_id: '',
          is_active: true,
          is_featured: false,
          start_date: '',
          end_date: '',
          itinerary: '',
          conversion_triggers: [],
        },
  });

  const { fields: triggerFields, append: appendTrigger, remove: removeTrigger } = useFieldArray({
    control,
    name: 'conversion_triggers',
  });

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

  const onSubmit = async (formData: GroupTripFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...formData,
        package_id: formData.package_id || undefined,
        conversion_triggers: formData.conversion_triggers?.map((t: any) => t.value) || [],
      };

      if (isEdit && groupTripId) {
        await updateGroupTripMutation.mutateAsync({ id: groupTripId, ...payload });
      } else {
        await createGroupTripMutation.mutateAsync(payload);
      }

      navigate('/admin/group-trips');
    } catch (error) {
      console.error('Error saving group trip:', error);
      setServerError('An error occurred while saving the group trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  if (isLoadingCountries) {
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
    { id: 'triggers_publish', label: 'Triggers & Publishing', icon: '⚡', badge: triggerFields.length },
  ];

  return (
    <div className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-xs">
          <span className="font-bold text-sm">Please fix validation errors before saving:</span>
          <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Group Trip Sections</h3>
            <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{watch('name') || 'New Group Trip'}</p>
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
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Group Trip' : 'Create Group Trip'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/group-trips')}
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
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>📝</span> Basic Details & Schedule
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Trip name, slug, departure dates, pricing, and destination</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Name */}
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
                      Group Trip Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="e.g. Serengeti Great Migration Expedition 2026"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('name')}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>

                  {/* Slug */}
                  <div className="sm:col-span-4">
                    <label htmlFor="slug" className="block text-sm font-semibold text-gray-800 mb-1">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      placeholder="serengeti-great-migration-expedition-2026"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal font-mono text-xs"
                      {...register('slug')}
                    />
                    {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-6">
                    <label htmlFor="summary" className="block text-sm font-semibold text-gray-800 mb-1">
                      Summary Overview
                    </label>
                    <textarea
                      id="summary"
                      rows={2}
                      placeholder="Concise summary for group trip cards..."
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('summary')}
                    />
                    {errors.summary && <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>}
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-6">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TinyMCEEditor
                          value={field.value}
                          onChange={field.onChange}
                          label="Full Description"
                          placeholder="Detailed itinerary overview and highlights..."
                          height={320}
                          error={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                  </div>

                  {/* Dates & Duration */}
                  <div className="sm:col-span-2">
                    <label htmlFor="start_date" className="block text-sm font-semibold text-gray-800 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('start_date')}
                    />
                    {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="end_date" className="block text-sm font-semibold text-gray-800 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('end_date')}
                    />
                    {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
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

                  {/* Price & Participants */}
                  <div className="sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-1">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      placeholder="1500.00"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="min_participants" className="block text-sm font-semibold text-gray-800 mb-1">
                      Min Participants
                    </label>
                    <input
                      type="number"
                      id="min_participants"
                      min="0"
                      placeholder="4"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('min_participants', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="max_participants" className="block text-sm font-semibold text-gray-800 mb-1">
                      Max Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="max_participants"
                      min="1"
                      placeholder="12"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('max_participants', { valueAsNumber: true })}
                    />
                    {errors.max_participants && <p className="mt-1 text-xs text-red-600">{errors.max_participants.message}</p>}
                  </div>

                  {/* Destination & Package Link */}
                  <div className="sm:col-span-3">
                    <label htmlFor="country_id" className="block text-sm font-semibold text-gray-800 mb-1">
                      Destination Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country_id"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('country_id', { valueAsNumber: true })}
                    >
                      <option value={0}>Select a country</option>
                      {countries?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.country_id && <p className="mt-1 text-xs text-red-600">{errors.country_id.message}</p>}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="package_id" className="block text-sm font-semibold text-gray-800 mb-1">
                      Link Base Package <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      id="package_id"
                      className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-teal"
                      {...register('package_id', { valueAsNumber: true })}
                    >
                      <option value={0}>Standalone Group Trip (No Base Package)</option>
                      {packages?.map((pkg: any) => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
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
                          helperText="Categorizes this group trip for public site filters."
                        />
                      )}
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Primary Cover Image</label>
                    <ImageSelector
                      initialImageId={watch('image_id')}
                      onImageSelected={(imageId) => {
                        setValue('image_id', imageId);
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
                  <p className="text-xs text-gray-500 mt-1">Configure daily schedule, activities, and included meals</p>
                </div>
                {isEdit && groupTripId ? (
                  <SimpleItineraryManager
                    entityType="group_trip"
                    entityId={groupTripId}
                    countryId={watch('country_id')}
                  />
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Save the group trip first to manage day-by-day itinerary schedule.</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: PRICE CHARTS */}
            {activeSection === 'pricing' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>💵</span> Seasonal Price Charts
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Rates, seasonal pricing, and single supplement tiers</p>
                </div>
                {isEdit && groupTripId ? (
                  <PriceChartManager entityType="group_trip" entityId={groupTripId} />
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Save the group trip first to configure price charts.</p>
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
                  <p className="text-xs text-gray-500 mt-1">Specify included services and excluded items for travelers</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal uppercase tracking-wider mb-2">Included Services</label>
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

                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Excluded Services</label>
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
                    <span>🖼️</span> Group Trip Gallery
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Upload and manage photo gallery images</p>
                </div>
                <GalleryManager
                  entityType="group_trip"
                  entityId={groupTripId}
                  images={galleryImages}
                  coverImageId={coverImageId}
                  onImagesChange={setGalleryImages}
                  onCoverImageChange={setCoverImageId}
                />
              </div>
            )}

            {/* SECTION 6: TRIGGERS & PUBLISHING */}
            {activeSection === 'triggers_publish' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>⚡</span> Triggers & Publication Status
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Conversion triggers and trip visibility toggles</p>
                </div>

                {/* Conversion Triggers Manager */}
                <ConversionTriggersManager control={control} register={register} />

                {/* Publication Controls */}
                <div className="pt-4 border-t border-gray-150 space-y-4">
                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Active Status</span>
                      <span className="text-xs text-gray-500">Makes this group trip visible on public pages</span>
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
                      <span className="font-bold text-sm text-gray-900 block">Featured Trip</span>
                      <span className="text-xs text-gray-500">Displays this trip in homepage featured group trips</span>
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
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupTripForm;
