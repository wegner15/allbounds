import React, { useState, useEffect } from 'react';
import PriceChartManager from '../../../components/admin/PriceChartManager';
import { useNavigate } from 'react-router-dom';

import { useCountries } from '../../../lib/hooks/useCountries';
import { useHotelTypes } from '../../../lib/hooks/useHotelTypes';
import { useAmenities } from '../../../lib/hooks/useAmenities';
import { apiClient } from '../../../lib/api';
import LocationPicker from '../../../components/LocationPicker';
import TimeSelector from '../../../components/TimeSelector';
import GalleryManager from '../../../components/admin/GalleryManager';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import TagSelector from '../../../components/admin/TagSelector';
import { useContentTags } from '../../../lib/hooks/useContentTags';
import ErrorModal from '../../../components/ui/ErrorModal';
import type { Hotel, HotelCreateInput, HotelUpdateInput } from '../../../lib/hooks/useHotels';
import type { GalleryImage } from '../../../lib/types/api';

interface HotelFormProps {
  initialData?: Hotel;
  onSubmit: (data: HotelCreateInput | HotelUpdateInput) => void;
  isLoading: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { data: countries } = useCountries();
  const { data: hotelTypes } = useHotelTypes();
  const { data: allTags = [] } = useContentTags();
  const { data: amenitiesData } = useAmenities(1, 100);
  const amenities = amenitiesData?.items || [];

  const [activeSection, setActiveSection] = useState<string>('basic');
  const [formData, setFormData] = useState<HotelCreateInput & { is_active?: boolean; is_featured?: boolean }>({
    name: '',
    country_id: 0,
    hotel_type_id: 0,
    stars: 0,
    is_active: true,
    is_featured: false,
    tag_ids: [],
  });

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      const {
        id,
        slug,
        created_at,
        updated_at,
        country,
        tags,
        ...rest
      } = initialData;

      setFormData({
        ...rest,
        tag_ids: tags?.map((t) => t.id) || initialData.tag_ids || []
      });

      if (id) {
        fetchGalleryImages(id);
      }
    }
  }, [initialData]);

  const fetchGalleryImages = async (hotelId: number) => {
    try {
      const response = await apiClient.get<GalleryImage[]>(`/api/v1/media?entity_type=hotel&entity_id=${hotelId}`);
      setGalleryImages(response);

      if (initialData?.image_id) {
        setCoverImageId(parseInt(initialData.image_id));
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string; city?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || prev.address,
      city: location.city || prev.city
    }));
  };

  const handleStarsChange = (stars: number) => {
    setFormData(prev => ({
      ...prev,
      stars
    }));
  };

  const handleAmenitiesChange = (amenityId: number, checked: boolean) => {
    const currentAmenityIds = formData.amenity_ids || [];
    setFormData(prev => ({
      ...prev,
      amenity_ids: checked
        ? [...currentAmenityIds, amenityId]
        : currentAmenityIds.filter(id => id !== amenityId)
    }));
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.hotel_type_id) {
      setErrorMessage('Please select a hotel type before saving.');
      return;
    }
    onSubmit(formData);
  };

  const amenitiesByCategory = amenities?.reduce((acc, amenity) => {
    const category = amenity.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Array<typeof amenities[number]>>);

  const SECTIONS = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'location_times', label: 'Location & Times', icon: '🗺️' },
    { id: 'amenities', label: 'Amenities', icon: '🛋️', badge: formData.amenity_ids?.length || 0 },
    { id: 'description', label: 'Description', icon: '📄' },
    { id: 'pricing', label: 'Price Charts', icon: '💵' },
    { id: 'gallery', label: 'Photo Gallery', icon: '🖼️', badge: galleryImages.length },
    { id: 'status', label: 'Publication Status', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* STICKY VERTICAL LEFT NAVIGATION */}
        <div className="w-full lg:w-64 flex-shrink-0 sticky top-20 bg-white rounded-2xl border border-gray-200/80 p-3 shadow-2xs space-y-1.5 z-10">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Hotel Sections</h3>
            <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{formData.name || 'New Hotel'}</p>
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
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Saving...' : initialData ? 'Update Hotel' : 'Create Hotel'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/hotels')}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-all text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT DISPLAY */}
        <div className="flex-1 min-w-0 space-y-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: BASIC INFO */}
            {activeSection === 'basic' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>📝</span> Basic Information
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Hotel name, star rating, address, and category tags</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
                      Hotel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Grand Oasis Resort & Spa"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div>
                    <label htmlFor="country_id" className="block text-sm font-semibold text-gray-800 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country_id"
                      name="country_id"
                      required
                      value={formData.country_id || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal"
                    >
                      <option value="">Select a country</option>
                      {countries?.map((country) => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-800 mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      placeholder="e.g. Dubai"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div>
                    <label htmlFor="hotel_type_id" className="block text-sm font-semibold text-gray-800 mb-1">
                      Hotel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="hotel_type_id"
                      name="hotel_type_id"
                      required
                      value={formData.hotel_type_id || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal"
                    >
                      <option value="">Select hotel type</option>
                      {hotelTypes?.map((hotelType) => (
                        <option key={hotelType.id} value={hotelType.id}>{hotelType.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Star Rating</label>
                    <div className="flex items-center gap-1.5 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200/80">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarsChange(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${star <= (formData.stars || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-gray-700">{formData.stars} Stars</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-1">Street Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={formData.address || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  {/* Content Tags */}
                  <div className="md:col-span-2">
                    <TagSelector
                      tags={allTags}
                      selectedTagIds={formData.tag_ids || []}
                      onChange={(newTagIds) => setFormData(prev => ({ ...prev, tag_ids: newTagIds }))}
                      label="Content Tags"
                      helperText="Categorize hotel for dynamic frontend filtering."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: LOCATION & TIMES */}
            {activeSection === 'location_times' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>🗺️</span> Location & Check-in / Check-out Times
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Set map coordinates and check-in times</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Interactive Location Map</label>
                    <LocationPicker
                      initialLocation={
                        formData.latitude && formData.longitude
                          ? {
                            latitude: formData.latitude,
                            longitude: formData.longitude,
                            address: formData.address,
                            city: formData.city,
                          }
                          : undefined
                      }
                      onLocationSelect={handleLocationSelect}
                      height="350px"
                    />
                    {formData.latitude && formData.longitude && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600">
                        <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <TimeSelector
                        id="check_in_time"
                        name="check_in_time"
                        label="Check-in Time"
                        placeholder="e.g. 14:00"
                        value={formData.check_in_time || ''}
                        onChange={(time) => setFormData(prev => ({ ...prev, check_in_time: time }))}
                      />
                    </div>

                    <div>
                      <TimeSelector
                        id="check_out_time"
                        name="check_out_time"
                        label="Check-out Time"
                        placeholder="e.g. 11:00"
                        value={formData.check_out_time || ''}
                        onChange={(time) => setFormData(prev => ({ ...prev, check_out_time: time }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: AMENITIES */}
            {activeSection === 'amenities' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>🛋️</span> Hotel Amenities & Facilities
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Select all available guest amenities</p>
                </div>

                {amenitiesByCategory && Object.keys(amenitiesByCategory).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
                      <div key={category} className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 space-y-3">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {categoryAmenities?.map((amenity) => (
                            <label key={amenity.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                id={`amenity-${amenity.id}`}
                                checked={(formData.amenity_ids || []).includes(amenity.id)}
                                onChange={(e) => handleAmenitiesChange(amenity.id, e.target.checked)}
                                className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
                              />
                              <span>{amenity.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No amenities available.</p>
                )}
              </div>
            )}

            {/* SECTION 4: DESCRIPTION */}
            {activeSection === 'description' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>📄</span> Hotel Description
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Summary and full hotel overview</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <TinyMCEEditor
                      value={formData.summary || ''}
                      onChange={(content) => setFormData(prev => ({ ...prev, summary: content }))}
                      label="Summary Overview"
                      helperText="Concise summary for card previews"
                      placeholder="Write a short overview..."
                      height={200}
                    />
                  </div>

                  <div>
                    <TinyMCEEditor
                      value={formData.description || ''}
                      onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                      label="Full Hotel Description"
                      helperText="Comprehensive description of rooms, facilities, and unique features"
                      placeholder="Write full hotel description..."
                      height={350}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: PRICE CHARTS */}
            {activeSection === 'pricing' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>💵</span> Seasonal Price Charts
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure room rates and seasonal rate tables</p>
                </div>
                {initialData?.id ? (
                  <PriceChartManager entityType="hotel" entityId={initialData.id} />
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Save the hotel first to manage room rates and price charts.</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 6: PHOTO GALLERY */}
            {activeSection === 'gallery' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>🖼️</span> Hotel Photo Gallery
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Upload photos of rooms, grounds, and facilities</p>
                </div>
                <GalleryManager
                  entityType="hotel"
                  entityId={initialData?.id}
                  images={galleryImages}
                  coverImageId={coverImageId}
                  onImagesChange={setGalleryImages}
                  onCoverImageChange={setCoverImageId}
                />
              </div>
            )}

            {/* SECTION 7: STATUS */}
            {activeSection === 'status' && (
              <div className="bg-white shadow-sm rounded-2xl border border-gray-200/80 p-6 space-y-6">
                <div className="border-b border-gray-150 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <span>⚙️</span> Publication Status
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Controls website visibility and featured status</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Active Status</span>
                      <span className="text-xs text-gray-500">Makes this hotel visible on the website</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active === true}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Featured Hotel</span>
                      <span className="text-xs text-gray-500">Displays in featured accommodation carousels</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured === true}
                        onChange={handleCheckboxChange}
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

      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Validation Error"
        message={errorMessage || ''}
      />
    </div>
  );
};

export default HotelForm;
