import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useRegions, useCreateCountry, useUpdateCountry } from '../../../lib/hooks/useDestinations';
import FormInput from '../../../components/ui/FormInput';
import FormTextarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import FormGroup from '../../../components/ui/FormGroup';
import FormSelect from '../../../components/ui/FormSelect';
import Button from '../../../components/ui/Button';
import ImageSelector from '../../../components/ui/ImageSelector';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import GalleryManager from '../../../components/admin/GalleryManager';
import CountryVisitInfoEditor from '../countries/CountryVisitInfoEditor';
import CountryTravelGuideEditor from '../countries/CountryTravelGuideEditor';
import type { GalleryImage } from '../../../lib/types/api';

// Form validation schema
const countrySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  summary: z.string().max(255, 'Summary cannot exceed 255 characters').optional(),
  region_id: z.number().min(1, 'Please select a region'),
  image_id: z.string(),
  is_active: z.boolean(),
  is_favorite: z.boolean(),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).optional(),
  highlights: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    desc: z.string().min(1, 'Description is required'),
  })).optional(),
});

type CountryFormData = z.infer<typeof countrySchema>;

interface CountryFormProps {
  countryData?: any;
  isEdit?: boolean;
}

type TabType = 'basic' | 'highlights' | 'faqs' | 'category_intros' | 'gallery' | 'visit_info' | 'travel_guide';

const CountryForm: React.FC<CountryFormProps> = ({ countryData, isEdit = false }) => {
  const navigate = useNavigate();
  const { data: regions, isLoading: isLoadingRegions } = useRegions();

  const createCountryMutation = useCreateCountry();
  const updateCountryMutation = useUpdateCountry(countryData?.id);

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);

  // Initialize form with default values or existing country data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: isEdit && countryData
      ? {
        name: countryData.name,
        slug: countryData.slug,
        description: countryData.description,
        summary: countryData.summary || '',
        region_id: countryData.region_id,
        image_id: countryData.image_id || '',
        is_active: countryData.is_active,
        is_favorite: countryData.is_favorite || false,
        faqs: countryData.faqs || [],
        highlights: countryData.highlights || [],
      }
      : {
        name: '',
        slug: '',
        description: '',
        summary: '',
        region_id: 0,
        image_id: '',
        is_active: true,
        is_favorite: false,
        highlights: [],
      },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faqs',
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: 'highlights',
  });

  // Auto-generate slug from name
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

  // Initialize gallery images and cover image from existing country data
  useEffect(() => {
    if (isEdit && countryData) {
      if (countryData.media_assets) {
        setGalleryImages(countryData.media_assets);
      }
      if (countryData.image_id) {
        setCoverImageId(parseInt(countryData.image_id, 10));
      }
    }
  }, [isEdit, countryData]);

  const [categoryIntros, setCategoryIntros] = useState<Record<string, { title: string; description: string }>>(() => {
    return (countryData?.category_intros as Record<string, { title: string; description: string }>) || {
      packages: { title: '', description: '' },
      hotels: { title: '', description: '' },
      activities: { title: '', description: '' },
      attractions: { title: '', description: '' },
      'group-trips': { title: '', description: '' },
    };
  });

  const handleCategoryIntroChange = (catKey: string, field: 'title' | 'description', value: string) => {
    setCategoryIntros((prev) => ({
      ...prev,
      [catKey]: {
        ...(prev[catKey] || { title: '', description: '' }),
        [field]: value,
      },
    }));
  };

  const onSubmit = async (data: CountryFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const finalData = {
        ...data,
        category_intros: categoryIntros,
        media_asset_ids: galleryImages.map(img => img.id)
      };

      if (isEdit) {
        await updateCountryMutation.mutateAsync(finalData);
        navigate('/admin/destinations');
      } else {
        await createCountryMutation.mutateAsync(finalData);
        setTimeout(() => {
          navigate('/admin/destinations');
        }, 500);
      }
    } catch (error) {
      console.error('Error saving country:', error);
      setServerError('An error occurred while saving the country. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRegions) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading regions...</p>
        </div>
      </div>
    );
  }

  const handleFormSubmit = handleSubmit(onSubmit);

  const tabs: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: 'basic', label: 'Basic Details', icon: '📝' },
    { id: 'highlights', label: 'Why Visit (Highlights)', icon: '🌟', count: highlightFields.length },
    { id: 'faqs', label: 'FAQs', icon: '❓', count: faqFields.length },
    { id: 'category_intros', label: 'Category Intros & SEO', icon: '🔍' },
    { id: 'gallery', label: 'Photo Gallery', icon: '🖼️', count: galleryImages.length },
    ...(isEdit && countryData?.id ? [
      { id: 'visit_info' as TabType, label: 'Visit Friendliness', icon: '🗓️' },
      { id: 'travel_guide' as TabType, label: 'Traveler Guide', icon: '🧭' },
    ] : []),
  ];

  const isFormTab = ['basic', 'highlights', 'faqs', 'category_intros', 'gallery'].includes(activeTab);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Vertical Sub-menu Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white shadow-xs border border-gray-200/80 rounded-xl p-3 sticky top-6 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Edit Sections
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-teal text-white shadow-xs font-bold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{tab.icon}</span>
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 flex-shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Basic Country Information</h3>
                <p className="mt-1 text-sm text-gray-500">Update country name, slug, region, image, and main overview.</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                  {/* Name */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <FormInput
                        id="name"
                        type="text"
                        label="Country Name"
                        error={errors.name}
                        fullWidth
                        variant="filled"
                        placeholder="e.g. France"
                        {...register('name')}
                      />
                    </FormGroup>
                  </div>

                  {/* Slug */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <FormInput
                        id="slug"
                        type="text"
                        label="URL Slug"
                        error={errors.slug}
                        fullWidth
                        variant="filled"
                        placeholder="e.g. france"
                        helperText="Used in the URL: example.com/countries/your-slug"
                        {...register('slug')}
                      />
                    </FormGroup>
                  </div>

                  {/* Region selector */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <FormSelect
                        id="region_id"
                        label="Region"
                        error={errors.region_id}
                        fullWidth
                        variant="filled"
                        {...register('region_id', { valueAsNumber: true })}
                      >
                        <option value={0}>Select a region</option>
                        {regions?.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </FormSelect>
                    </FormGroup>
                  </div>

                  {/* Image Upload */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <ImageSelector
                        initialImageId={watch('image_id')}
                        onImageSelected={(imageId) => setValue('image_id', imageId)}
                        label="Country Image"
                        helperText="Upload a featured cover image for this country"
                      />
                    </FormGroup>
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
                          label="Main Overview & Description"
                          placeholder="Provide a detailed description of the country, including key attractions, geography, and cultural highlights..."
                          height={320}
                          error={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-6">
                    <FormGroup>
                      <FormTextarea
                        id="summary"
                        label="Summary"
                        error={errors.summary}
                        fullWidth
                        variant="filled"
                        rows={3}
                        placeholder="Brief summary for cards and previews..."
                        helperText="A concise summary that appears in country cards and search results (max 255 characters)"
                        {...register('summary')}
                      />
                    </FormGroup>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <FormCheckbox
                        id="is_active"
                        label="Active (visible on website)"
                        {...register('is_active')}
                      />
                    </FormGroup>
                  </div>

                  {/* Favorite */}
                  <div className="sm:col-span-3">
                    <FormGroup>
                      <FormCheckbox
                        id="is_favorite"
                        label="Mark as Top Trending Destination (Pin to Homepage)"
                        {...register('is_favorite')}
                      />
                    </FormGroup>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Why Visit Destination (Highlights)</h3>
                  <p className="mt-1 text-sm text-gray-500">Key reasons and highlights why travelers should visit this destination.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendHighlight({ title: '', desc: '' })}
                >
                  Add Highlight
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                      title="Remove Highlight"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      <FormGroup>
                        <FormInput
                          id={`highlights.${index}.title`}
                          label="Highlight Title"
                          error={errors.highlights?.[index]?.title}
                          fullWidth
                          variant="filled"
                          placeholder="e.g. Pristine White Sand Beaches"
                          {...register(`highlights.${index}.title`)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormTextarea
                          id={`highlights.${index}.desc`}
                          label="Description"
                          error={errors.highlights?.[index]?.desc}
                          fullWidth
                          variant="filled"
                          rows={2}
                          placeholder="e.g. Relax on the world-famous white sand beaches of Diani..."
                          {...register(`highlights.${index}.desc`)}
                        />
                      </FormGroup>
                    </div>
                  </div>
                ))}
                {highlightFields.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-3">No highlights added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendHighlight({ title: '', desc: '' })}
                    >
                      Add First Highlight
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === 'faqs' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                  <p className="mt-1 text-sm text-gray-500">Provide answers to common traveler questions regarding visas, currency, and safety.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFaq({ question: '', answer: '' })}
                >
                  Add FAQ
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {faqFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative space-y-4">
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                      title="Remove FAQ"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <FormGroup>
                      <FormInput
                        id={`faqs.${index}.question`}
                        label="Question"
                        error={errors.faqs?.[index]?.question}
                        fullWidth
                        variant="filled"
                        placeholder="e.g. What is the best time to visit?"
                        {...register(`faqs.${index}.question`)}
                      />
                    </FormGroup>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <Controller
                        name={`faqs.${index}.answer`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <TinyMCEEditor
                            value={field.value}
                            onChange={field.onChange}
                            label=""
                            placeholder="Provide a detailed answer..."
                            height={200}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}
                {faqFields.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-3">No FAQs added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFaq({ question: '', answer: '' })}
                    >
                      Add First FAQ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORY INTROS & SEO */}
          {activeTab === 'category_intros' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Category Page Intros & SEO</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Customize title headings and SEO intros for dedicated category listing pages in this country.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {[
                  { key: 'packages', label: 'Travel Packages', icon: '📦' },
                  { key: 'hotels', label: 'Accommodation & Hotels', icon: '🏨' },
                  { key: 'activities', label: 'Activities & Experiences', icon: '🧭' },
                  { key: 'attractions', label: 'Must-See Attractions', icon: '🎯' },
                  { key: 'group-trips', label: 'Group Trips', icon: '👥' },
                ].map((cat) => (
                  <div key={cat.key} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label} Page Intro</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <FormGroup>
                        <FormInput
                          id={`category_intros.${cat.key}.title`}
                          label="Custom Page Title"
                          fullWidth
                          variant="filled"
                          placeholder={`Default: ${cat.label} in ${watch('name') || 'Destination'}`}
                          value={categoryIntros[cat.key]?.title || ''}
                          onChange={(e) => handleCategoryIntroChange(cat.key, 'title', e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormTextarea
                          id={`category_intros.${cat.key}.description`}
                          label="Custom Intro / SEO Description"
                          fullWidth
                          variant="filled"
                          rows={2}
                          placeholder="Enter custom promotional or SEO description for this category..."
                          value={categoryIntros[cat.key]?.description || ''}
                          onChange={(e) => handleCategoryIntroChange(cat.key, 'description', e.target.value)}
                        />
                      </FormGroup>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Country Media & Photo Gallery</h3>
                <p className="mt-1 text-sm text-gray-500">Manage high-resolution images and set the primary cover photo for this destination.</p>
              </div>

              <div className="p-6">
                <GalleryManager
                  entityType="country"
                  entityId={countryData?.id}
                  images={galleryImages}
                  coverImageId={coverImageId}
                  onImagesChange={setGalleryImages}
                  onCoverImageChange={(imageId) => {
                    setCoverImageId(imageId);
                    if (imageId) setValue('image_id', imageId.toString());
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 6: VISIT FRIENDLINESS (EDIT MODE ONLY) */}
          {activeTab === 'visit_info' && isEdit && countryData?.id && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
              <CountryVisitInfoEditor countryId={countryData.id} />
            </div>
          )}

          {/* TAB 7: TRAVELER GUIDE (EDIT MODE ONLY) */}
          {activeTab === 'travel_guide' && isEdit && countryData?.id && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
              <CountryTravelGuideEditor countryId={countryData.id} />
            </div>
          )}

          {/* Form Actions for Form Tabs */}
          {isFormTab && (
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/admin/destinations')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : isEdit ? 'Update Country' : 'Create Country'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CountryForm;
