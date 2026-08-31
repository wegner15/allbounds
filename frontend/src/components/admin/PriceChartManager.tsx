import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import { Plus, Trash2, Hotel as HotelIcon, Star, Check, Sparkles, X, Moon, Calendar, Clock } from 'lucide-react';
import {
  useEntityPriceCharts,
  useCreateEntityPriceChart,
  useUpdateEntityPriceChart,
  useDeleteEntityPriceChart,
  type PriceChart,
  type PriceChartEntityType
} from '../../lib/hooks/usePackagePriceCharts';
import { useHotels } from '../../lib/hooks/useHotels';
import type { PriceChartHotelOption, HotelPriceChartNightRate } from '../../lib/types/api';

const priceChartSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  price: z.number().min(0, 'Price must be 0 or greater').max(100000, 'Price must be less than $100,000'),
  booking_price: z.number().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
}).refine((data) => {
  const startDate = parseISO(data.start_date);
  const endDate = parseISO(data.end_date);
  return isAfter(endDate, startDate);
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type PriceChartFormData = z.infer<typeof priceChartSchema>;

interface PriceChartManagerProps {
  packageId?: number;
  entityType?: PriceChartEntityType;
  entityId?: number;
}

interface EditingChart {
  id: number;
  data: PriceChartFormData;
}

const PriceChartManager: React.FC<PriceChartManagerProps> = ({ packageId, entityType = 'package', entityId }) => {
  const targetId = entityId || packageId || 0;
  const { data: priceCharts, isLoading, refetch } = useEntityPriceCharts(entityType, targetId);
  const { data: hotelsList = [] } = useHotels();
  const createPriceChart = useCreateEntityPriceChart(entityType);
  const updatePriceChart = useUpdateEntityPriceChart(entityType);
  const deletePriceChart = useDeleteEntityPriceChart(entityType);

  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<EditingChart | null>(null);
  const [hotelOptions, setHotelOptions] = useState<PriceChartHotelOption[]>([]);

  // Hotel addition staging state (for tour packages)
  const [stagedHotelId, setStagedHotelId] = useState<number | ''>('');
  const [stagedRoomType, setStagedRoomType] = useState<string>('Standard Room');
  const [stagedSupplement, setStagedSupplement] = useState<number>(0);
  const [stagedIsDefault, setStagedIsDefault] = useState<boolean>(false);

  // Hotel Night Rates Matrix state (for hotels)
  const [nightRates, setNightRates] = useState<HotelPriceChartNightRate[]>([]);
  const [stagedNights, setStagedNights] = useState<number>(3);
  const [stagedNightPrice, setStagedNightPrice] = useState<number | ''>(450);
  const [stagedNightRoomType, setStagedNightRoomType] = useState<string>('Standard Room');
  const [stagedNightMealPlan, setStagedNightMealPlan] = useState<string>('Bed & Breakfast');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors, isSubmitting } } = useForm<PriceChartFormData>({
    resolver: zodResolver(priceChartSchema),
    defaultValues: {
      title: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
      price: 0,
      booking_price: undefined,
      notes: '',
      is_active: true,
    }
  });

  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');

  useEffect(() => {
    if (watchedStartDate && (!watchedEndDate || parseISO(watchedEndDate) <= parseISO(watchedStartDate))) {
      const newEndDate = format(addMonths(parseISO(watchedStartDate), 1), 'yyyy-MM-dd');
      setValue('end_date', newEndDate);
    }
  }, [watchedStartDate, watchedEndDate, setValue]);

  // Handle preset nights selection for hotels
  const applyPresetNights = (nights: number) => {
    setStagedNights(nights);
    const existingRate = nightRates.find(r => r.nights === nights);
    if (existingRate) {
      setStagedNightPrice(existingRate.price);
      setStagedNightRoomType(existingRate.room_type || 'Standard Room');
      setStagedNightMealPlan(existingRate.meal_plan || 'Bed & Breakfast');
    } else {
      const existingPerNight = nightRates.length > 0 && nightRates[0].price_per_night ? nightRates[0].price_per_night : 150;
      setStagedNightPrice(Math.round(existingPerNight * nights));
    }
  };

  const handleAddNightRate = () => {
    if (!stagedNights || stagedNights <= 0 || stagedNightPrice === '' || Number(stagedNightPrice) <= 0) {
      alert('Please enter a valid number of nights and price');
      return;
    }

    const priceNum = Number(stagedNightPrice);
    const existingIdx = nightRates.findIndex(nr => nr.nights === stagedNights && (nr.room_type || '') === stagedNightRoomType.trim());
    
    const newRate: HotelPriceChartNightRate = {
      nights: stagedNights,
      price: priceNum,
      price_per_night: Math.round((priceNum / stagedNights) * 100) / 100,
      room_type: stagedNightRoomType.trim() || 'Standard Room',
      meal_plan: stagedNightMealPlan.trim() || 'Bed & Breakfast',
      is_default: nightRates.length === 0,
      is_active: true,
      order_index: nightRates.length
    };

    let updated: HotelPriceChartNightRate[];
    if (existingIdx >= 0) {
      updated = [...nightRates];
      updated[existingIdx] = newRate;
    } else {
      updated = [...nightRates, newRate];
    }

    updated.sort((a, b) => a.nights - b.nights);
    setNightRates(updated);

    // Auto sync base price in form if unset or 0
    const formPrice = watch('price');
    if (!formPrice || formPrice === 0) {
      setValue('price', priceNum);
    }
  };

  const handleRemoveNightRate = (index: number) => {
    const updated = nightRates.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some(nr => nr.is_default)) {
      updated[0].is_default = true;
    }
    setNightRates(updated);
  };

  const handleUpdateNightRate = (index: number, field: keyof HotelPriceChartNightRate, value: any) => {
    const updated = [...nightRates];
    if (field === 'is_default' && value === true) {
      updated.forEach((nr, idx) => {
        nr.is_default = idx === index;
      });
    } else {
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'price' || field === 'nights') {
        const p = field === 'price' ? Number(value) : updated[index].price;
        const n = field === 'nights' ? Number(value) : updated[index].nights;
        if (p && n) {
          updated[index].price_per_night = Math.round((p / n) * 100) / 100;
        }
      }
    }
    setNightRates(updated);
  };

  const handleSelectHotelForStaging = (hotelId: number | '') => {
    setStagedHotelId(hotelId);
    if (hotelId) {
      setStagedRoomType('Standard Room');
      setStagedSupplement(0);
      setStagedIsDefault(hotelOptions.length === 0);
    }
  };

  const handleConfirmAddStagedHotel = () => {
    if (!stagedHotelId) return;
    const hotel = hotelsList.find(h => h.id === Number(stagedHotelId));
    if (!hotel) return;

    if (hotelOptions.some(opt => opt.hotel_id === hotel.id)) {
      alert('This hotel is already added to this price chart.');
      return;
    }

    const shouldBeDefault = stagedIsDefault || hotelOptions.length === 0;

    const newOption: PriceChartHotelOption = {
      hotel_id: hotel.id,
      price_supplement: Number(stagedSupplement) || 0,
      room_type: stagedRoomType.trim() || 'Standard Room',
      is_default: shouldBeDefault,
      is_active: true,
      order_index: hotelOptions.length,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        stars: hotel.stars,
        address: hotel.address,
        city: hotel.city,
        price_category: hotel.price_category,
        image_url: hotel.image_url,
        cover_image: hotel.cover_image
      }
    };

    let updated = [...hotelOptions];
    if (shouldBeDefault) {
      updated = updated.map(opt => ({ ...opt, is_default: false }));
    }
    setHotelOptions([...updated, newOption]);

    // Reset staging
    setStagedHotelId('');
    setStagedRoomType('Standard Room');
    setStagedSupplement(0);
    setStagedIsDefault(false);
  };

  const handleCancelStaging = () => {
    setStagedHotelId('');
    setStagedRoomType('Standard Room');
    setStagedSupplement(0);
    setStagedIsDefault(false);
  };

  const handleRemoveHotelOption = (index: number) => {
    const updated = hotelOptions.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some(opt => opt.is_default)) {
      updated[0].is_default = true;
    }
    setHotelOptions(updated);
  };

  const handleUpdateHotelOption = (index: number, field: keyof PriceChartHotelOption, value: any) => {
    const updated = [...hotelOptions];
    if (field === 'is_default' && value === true) {
      updated.forEach((opt, idx) => {
        opt.is_default = idx === index;
      });
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setHotelOptions(updated);
  };

  const onSubmit = async (data: PriceChartFormData) => {
    try {
      const cleanHotelOptions = (entityType === 'package' || entityType === 'group_trip')
        ? hotelOptions.map((opt, idx) => ({
            hotel_id: Number(opt.hotel_id),
            price_supplement: Number(opt.price_supplement) || 0,
            room_type: opt.room_type || 'Standard Room',
            is_default: Boolean(opt.is_default),
            is_active: opt.is_active !== false,
            order_index: idx,
          }))
        : undefined;

      const cleanNightRates = entityType === 'hotel'
        ? nightRates.map((nr, idx) => ({
            nights: Number(nr.nights),
            price: Number(nr.price),
            price_per_night: nr.price_per_night ? Number(nr.price_per_night) : Math.round((Number(nr.price) / Number(nr.nights)) * 100) / 100,
            room_type: nr.room_type || 'Standard Room',
            meal_plan: nr.meal_plan || 'Bed & Breakfast',
            is_default: Boolean(nr.is_default),
            is_active: nr.is_active !== false,
            order_index: idx,
          }))
        : undefined;

      const effectivePrice = data.price > 0 
        ? data.price 
        : (cleanNightRates && cleanNightRates.length > 0 ? cleanNightRates[0].price : 0);

      const payload: any = {
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        price: effectivePrice,
        booking_price: data.booking_price !== undefined && !isNaN(data.booking_price) ? data.booking_price : effectivePrice,
        notes: data.notes || '',
        is_active: data.is_active,
        hotel_options: cleanHotelOptions,
        night_rates: cleanNightRates
      };

      if (editingChart) {
        await updatePriceChart.mutateAsync({
          entityId: targetId,
          priceChartId: editingChart.id,
          ...payload
        });
        setSaveSuccessMsg(`Price chart "${data.title}" updated successfully!`);
      } else {
        await createPriceChart.mutateAsync({
          entityId: targetId,
          ...payload
        });
        setSaveSuccessMsg(`Price chart "${data.title}" created successfully!`);
      }

      await refetch();
      reset();
      setHotelOptions([]);
      setNightRates([]);
      setShowForm(false);
      setEditingChart(null);
      handleCancelStaging();

      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Error saving price chart:', error);
      alert('Failed to save price chart. Please check the form and try again.');
    }
  };

  const handleEdit = (chart: PriceChart) => {
    const formData: PriceChartFormData = {
      title: chart.title,
      start_date: format(parseISO(chart.start_date), 'yyyy-MM-dd'),
      end_date: format(parseISO(chart.end_date), 'yyyy-MM-dd'),
      price: chart.price,
      booking_price: chart.booking_price,
      notes: chart.notes || '',
      is_active: chart.is_active,
    };

    setEditingChart({ id: chart.id, data: formData });
    setHotelOptions(chart.hotel_options ? [...chart.hotel_options] : []);
    setNightRates(chart.night_rates ? [...chart.night_rates] : []);
    handleCancelStaging();

    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof PriceChartFormData, value as any);
    });

    setShowForm(true);
  };

  const handleDelete = async (chartId: number) => {
    if (window.confirm('Are you sure you want to delete this price chart? This action cannot be undone.')) {
      try {
        await deletePriceChart.mutateAsync({ priceChartId: chartId, entityId: targetId });
        await refetch();
      } catch (error) {
        console.error('Error deleting price chart:', error);
      }
    }
  };

  const handleCancel = () => {
    reset();
    setHotelOptions([]);
    setNightRates([]);
    setShowForm(false);
    setEditingChart(null);
    handleCancelStaging();
  };

  const getStatusBadge = (chart: PriceChart) => {
    const now = new Date();
    const endDate = parseISO(chart.end_date);

    if (!chart.is_active) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }

    if (isBefore(endDate, now)) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }

    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  const isTourEntity = entityType === 'package' || entityType === 'group_trip';
  const stagedHotelObj = stagedHotelId ? hotelsList.find(h => h.id === Number(stagedHotelId)) : null;

  return (
    <div className="space-y-6">
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Seasonal Rates & Price Charts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage seasonal pricing periods, default base rates, and optional hotel accommodation upgrade supplements.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              reset();
              setHotelOptions([]);
              handleCancelStaging();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Price Chart Period
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-teal/30 shadow-md p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editingChart ? 'Edit Price Chart Period' : 'Create New Price Chart Period'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Set travel period dates, base prices, and attach hotel upgrade tiers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              ✕ Close
            </button>
          </div>

          <div
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(onSubmit)(e);
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                Season / Chart Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                placeholder="e.g., High Season 2026, Peak Migration Rate, Standard Period"
                className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
              />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                  Base Price per Person (USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    {...register('price', { valueAsNumber: true })}
                    className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="booking_price" className="block text-sm font-semibold text-gray-700">
                  Deposit / Booking Rate (USD) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="booking_price"
                    {...register('booking_price', {
                      setValueAs: (v) => (v === '' || isNaN(v) ? undefined : parseFloat(v)),
                    })}
                    className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                    placeholder="Defaults to Base Price if blank"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  {...register('start_date')}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                />
                {errors.start_date && <p className="text-xs text-red-600">{errors.start_date.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  {...register('end_date')}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                />
                {errors.end_date && <p className="text-xs text-red-600">{errors.end_date.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                Inclusions & Policy Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                placeholder="e.g., Includes park & concession fees, ground transfers, full board safari meals."
                className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
              />
            </div>

            {/* Hotel Options Section */}
            {isTourEntity && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <HotelIcon className="w-5 h-5 text-teal" />
                      <h4 className="font-bold text-gray-900 text-base">Attached Hotel Options & Supplements</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Attach hotels that travelers can select for this season. Set a $0 supplement for included/standard hotels, or an extra amount (e.g. +$350) for luxury upgrades.
                    </p>
                  </div>
                  {hotelOptions.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 text-teal-dark">
                      {hotelOptions.length} {hotelOptions.length === 1 ? 'Hotel Attached' : 'Hotels Attached'}
                    </span>
                  )}
                </div>

                {/* List of Already Attached Hotels */}
                {hotelOptions.length > 0 ? (
                  <div className="space-y-2.5">
                    {hotelOptions.map((opt, idx) => {
                      const hotelObj = opt.hotel || hotelsList.find(h => h.id === opt.hotel_id);
                      return (
                        <div
                          key={opt.hotel_id || idx}
                          className={`p-4 rounded-xl border transition-all ${
                            opt.is_default ? 'bg-teal/5 border-teal shadow-xs' : 'bg-white border-gray-200 shadow-2xs'
                          } flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}
                        >
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
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
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-gray-900">{hotelObj?.name || `Hotel #${opt.hotel_id}`}</span>
                                {hotelObj?.stars && (
                                  <span className="inline-flex items-center text-xs font-semibold text-amber-600">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                    {hotelObj.stars}★
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{hotelObj?.city || 'Accommodation Option'}</span>
                                {opt.is_default && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal text-white">
                                    Default (Base)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-xl">
                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 mb-1">Room / Tier Label</label>
                              <input
                                type="text"
                                value={opt.room_type || ''}
                                onChange={(e) => handleUpdateHotelOption(idx, 'room_type', e.target.value)}
                                placeholder="e.g. Standard, Luxury Tent"
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 mb-1">Extra Cost (+USD / person)</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500 text-xs font-bold">+$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={opt.price_supplement}
                                  onChange={(e) => handleUpdateHotelOption(idx, 'price_supplement', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-teal outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-2 pt-4 sm:pt-5">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="default_hotel_option"
                                  checked={opt.is_default}
                                  onChange={() => handleUpdateHotelOption(idx, 'is_default', true)}
                                  className="text-teal focus:ring-teal"
                                />
                                <span className="text-xs font-medium text-gray-700">Default (Base)</span>
                              </label>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveHotelOption(idx)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-end md:self-center"
                            title="Remove hotel option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center bg-white text-gray-500 text-xs">
                    No hotel options attached yet. Select a hotel below to configure and attach accommodation choices.
                  </div>
                )}

                {/* Hotel Selector & Staging Form */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Select Hotel to Attach
                    </label>
                    <select
                      value={stagedHotelId}
                      onChange={(e) => handleSelectHotelForStaging(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                    >
                      <option value="">-- Choose a hotel from directory to attach --</option>
                      {hotelsList
                        .filter(h => !hotelOptions.some(opt => opt.hotel_id === h.id))
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} {h.stars ? `(${h.stars}★)` : ''} {h.city ? `— ${h.city}` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Dedicated Staging Area for Configuring Hotel Additionals Before Attaching */}
                  {stagedHotelObj && (
                    <div className="p-4 bg-teal/5 border border-teal/30 rounded-xl space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-teal/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-teal/20">
                            {stagedHotelObj.image_url || stagedHotelObj.cover_image ? (
                              <img
                                src={stagedHotelObj.image_url || stagedHotelObj.cover_image}
                                alt={stagedHotelObj.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HotelIcon className="w-5 h-5 text-teal" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{stagedHotelObj.name}</span>
                              {stagedHotelObj.stars && (
                                <span className="text-xs font-semibold text-amber-600">
                                  ★ {stagedHotelObj.stars}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{stagedHotelObj.city || 'Selected Hotel'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelStaging}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Room / Tier Label *
                          </label>
                          <input
                            type="text"
                            value={stagedRoomType}
                            onChange={(e) => setStagedRoomType(e.target.value)}
                            placeholder="e.g. Standard Room, Luxury Tent, Suite"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal outline-none"
                          />
                          <div className="flex gap-1.5 flex-wrap pt-1">
                            {['Standard Room', 'Luxury Safari Tent', 'Deluxe Suite', 'Executive Villa'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setStagedRoomType(chip)}
                                className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-600 hover:border-teal hover:text-teal transition-colors"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Price Supplement (+USD per person)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold text-sm">+$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={stagedSupplement}
                              onChange={(e) => setStagedSupplement(parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-teal outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 pt-0.5">
                            Set 0 for included standard hotel, or positive supplement (e.g. +$350) for luxury upgrade.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stagedIsDefault}
                            onChange={(e) => setStagedIsDefault(e.target.checked)}
                            className="h-4 w-4 text-teal focus:ring-teal rounded border-gray-300"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            Set as default selected accommodation for this season
                          </span>
                        </label>

                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={handleCancelStaging}
                            className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmAddStagedHotel}
                            className="px-4 py-1.5 bg-teal hover:bg-teal-dark text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Attach Hotel Option
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hotel Night Rates Matrix Builder Section (for entityType === 'hotel') */}
            {entityType === 'hotel' && (
              <div className="p-5 bg-teal/5 rounded-xl border border-teal/20 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-teal" />
                      <h4 className="font-bold text-gray-900 text-base">Stay Durations & Night Rates Matrix</h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Configure custom rates for various night stay durations (e.g. 3 Nights, 4 Nights, 5 Nights, 7 Nights). These populate the public pricing table columns.
                    </p>
                  </div>
                  {nightRates.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 text-teal-dark border border-teal/20">
                      {nightRates.length} {nightRates.length === 1 ? 'Duration Tier' : 'Duration Tiers'}
                    </span>
                  )}
                </div>

                {/* Preset Quick-Add Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal" /> Quick Presets:
                  </span>
                  {[3, 4, 5, 7, 10, 14].map(n => {
                    const exists = nightRates.some(r => r.nights === n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => applyPresetNights(n)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          exists 
                            ? 'bg-teal text-white border-teal shadow-xs' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal hover:text-teal'
                        }`}
                      >
                        {n} Nights {exists ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>

                {/* Staging / Input row for adding a duration tier */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span>Add / Configure Stay Duration Tier</span>
                    {stagedNights && stagedNightPrice && Number(stagedNightPrice) > 0 && (
                      <span className="text-teal font-semibold">
                        = ${(Number(stagedNightPrice) / stagedNights).toFixed(2)}/night
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Number of Nights *
                      </label>
                      <div className="relative">
                        <Moon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={stagedNights}
                          onChange={(e) => setStagedNights(parseInt(e.target.value) || 1)}
                          className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white focus:ring-1 focus:ring-teal outline-none"
                          placeholder="e.g. 3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Total Price (USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={stagedNightPrice}
                          onChange={(e) => setStagedNightPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full pl-7 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 bg-white focus:ring-1 focus:ring-teal outline-none"
                          placeholder="e.g. 450"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Room / Suite Category
                      </label>
                      <input
                        type="text"
                        value={stagedNightRoomType}
                        onChange={(e) => setStagedNightRoomType(e.target.value)}
                        placeholder="e.g. Standard Room, Ocean Villa"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Meal Plan
                      </label>
                      <input
                        type="text"
                        value={stagedNightMealPlan}
                        onChange={(e) => setStagedNightMealPlan(e.target.value)}
                        placeholder="e.g. Bed & Breakfast, All-Inclusive"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddNightRate}
                      className="px-4 py-1.5 bg-teal hover:bg-teal-dark text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add / Update {stagedNights} Nights Tier
                    </button>
                  </div>
                </div>

                {/* List of Configured Night Tiers for this Season */}
                {nightRates.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-700">Configured Duration Rates for this Season:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nightRates.map((nr, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            nr.is_default ? 'bg-teal/10 border-teal shadow-xs' : 'bg-white border-gray-200 shadow-2xs'
                          } flex flex-col justify-between gap-2`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-teal/10 text-teal-dark text-xs font-extrabold">
                                {nr.nights} Nights
                              </span>
                              {nr.is_default && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-teal text-white px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveNightRate(idx)}
                              className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove tier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-baseline justify-between border-t border-gray-100 pt-2">
                            <div>
                              <div className="text-sm font-extrabold text-gray-900">
                                USD {nr.price.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-gray-500 font-medium">
                                ~${(nr.price / nr.nights).toFixed(0)}/night
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] font-semibold text-gray-700">
                                {nr.room_type || 'Standard'}
                              </div>
                              <div className="text-[10px] text-teal-dark font-medium">
                                {nr.meal_plan || 'Bed & Breakfast'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-teal/30 bg-white/70 rounded-xl text-center text-gray-500 text-xs">
                    No night duration rates added yet. Click one of the quick preset buttons above or enter duration tiers to populate the rate matrix.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                      Active (visible to public customers)
                    </label>
                  </div>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(onSubmit)(e);
                }}
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-teal hover:bg-teal-dark disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : editingChart ? 'Update Price Chart' : 'Create Price Chart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Price Charts List */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal"></div>
            <p className="mt-3 text-sm text-gray-500">Loading seasonal price charts...</p>
          </div>
        ) : !priceCharts || priceCharts.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-12 w-12 text-gray-300 flex items-center justify-center rounded-full bg-gray-50 mb-3">
              <HotelIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No seasonal price charts yet</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {entityType === 'hotel' 
                ? 'Create seasonal rate periods and define variable stay durations (3 Nights, 4 Nights, 5 Nights, 7 Nights).'
                : 'Create seasonal rates and attach hotel upgrade tiers for customers to choose during booking.'}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setHotelOptions([]);
                  setNightRates([]);
                  handleCancelStaging();
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-teal hover:bg-teal-dark transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Price Chart
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Season Title
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Travel Dates
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Base Rate
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Deposit
                  </th>
                  {isTourEntity && (
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Attached Hotel Options
                    </th>
                  )}
                  {entityType === 'hotel' && (
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Stay Durations (Nights & Rates)
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceCharts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{chart.title}</div>
                      {chart.notes && (
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">{chart.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-900">
                        {format(parseISO(chart.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {format(parseISO(chart.end_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">${chart.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-teal">
                        ${(chart.booking_price ?? chart.price).toLocaleString()}
                      </div>
                    </td>
                    {isTourEntity && (
                      <td className="px-6 py-4">
                        {chart.hotel_options && chart.hotel_options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {chart.hotel_options.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border ${
                                  opt.is_default
                                    ? 'bg-teal/10 text-teal-dark border-teal/30 font-semibold'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {opt.hotel?.name || `Hotel #${opt.hotel_id}`}
                                {opt.room_type ? ` (${opt.room_type})` : ''}
                                {opt.price_supplement > 0 ? ` +$${opt.price_supplement}` : ' (Incl.)'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Standard (No specific hotels attached)</span>
                        )}
                      </td>
                    )}
                    {entityType === 'hotel' && (
                      <td className="px-6 py-4">
                        {chart.night_rates && chart.night_rates.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {chart.night_rates.map((nr, nIdx) => (
                              <span
                                key={nIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal/10 text-teal-dark border border-teal/20"
                              >
                                {nr.nights} Nts: ${nr.price.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">1 Tier (${chart.price.toLocaleString()})</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(chart)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(chart)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(chart.id)}
                          className="px-3 py-1 border border-red-200 rounded-md text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChartManager;