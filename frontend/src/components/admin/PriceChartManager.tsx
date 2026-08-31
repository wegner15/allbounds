import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import { Plus, Trash2, Hotel as HotelIcon, Star } from 'lucide-react';
import {
  useEntityPriceCharts,
  useCreateEntityPriceChart,
  useUpdateEntityPriceChart,
  useDeleteEntityPriceChart,
  type PriceChart,
  type PriceChartEntityType
} from '../../lib/hooks/usePackagePriceCharts';
import { useHotels } from '../../lib/hooks/useHotels';
import type { PriceChartHotelOption } from '../../lib/types/api';

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
  const { data: priceCharts, isLoading } = useEntityPriceCharts(entityType, targetId);
  const { data: hotelsList = [] } = useHotels();
  const createPriceChart = useCreateEntityPriceChart(entityType);
  const deletePriceChart = useDeleteEntityPriceChart(entityType);

  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<EditingChart | null>(null);
  const [currentPriceChartId, setCurrentPriceChartId] = useState<number | null>(null);
  const [hotelOptions, setHotelOptions] = useState<PriceChartHotelOption[]>([]);
  const [selectedNewHotelId, setSelectedNewHotelId] = useState<number | ''>('');

  const updatePriceChart = useUpdateEntityPriceChart(entityType, currentPriceChartId || 0);

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

  const handleAddHotelOption = () => {
    if (!selectedNewHotelId) return;
    const hotel = hotelsList.find(h => h.id === Number(selectedNewHotelId));
    if (!hotel) return;

    if (hotelOptions.some(opt => opt.hotel_id === hotel.id)) {
      alert('This hotel is already added to this price chart.');
      return;
    }

    const isFirst = hotelOptions.length === 0;
    const newOption: PriceChartHotelOption = {
      hotel_id: hotel.id,
      price_supplement: 0,
      room_type: 'Standard Room',
      is_default: isFirst,
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

    setHotelOptions([...hotelOptions, newOption]);
    setSelectedNewHotelId('');
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
      const payload: any = {
        entityId: targetId,
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        price: data.price,
        booking_price: data.booking_price !== undefined && !isNaN(data.booking_price) ? data.booking_price : data.price,
        notes: data.notes || '',
        is_active: data.is_active,
        hotel_options: (entityType === 'package' || entityType === 'group_trip') ? hotelOptions : undefined
      };

      if (editingChart) {
        await updatePriceChart.mutateAsync(payload);
        setEditingChart(null);
      } else {
        await createPriceChart.mutateAsync(payload);
      }
      reset();
      setHotelOptions([]);
      setShowForm(false);
      setCurrentPriceChartId(null);
    } catch (error) {
      console.error('Error saving price chart:', error);
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
    setCurrentPriceChartId(chart.id);
    setHotelOptions(chart.hotel_options ? [...chart.hotel_options] : []);

    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof PriceChartFormData, value as any);
    });

    setShowForm(true);
  };

  const handleDelete = async (chartId: number) => {
    if (window.confirm('Are you sure you want to delete this price chart? This action cannot be undone.')) {
      try {
        await deletePriceChart.mutateAsync({ priceChartId: chartId, entityId: targetId });
      } catch (error) {
        console.error('Error deleting price chart:', error);
      }
    }
  };

  const handleCancel = () => {
    reset();
    setHotelOptions([]);
    setShowForm(false);
    setEditingChart(null);
    setCurrentPriceChartId(null);
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

  return (
    <div className="space-y-6">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  Booking Deposit Price (USD) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="booking_price"
                    {...register('booking_price', { valueAsNumber: true })}
                    className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                    placeholder="Defaults to full price"
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

            {isTourEntity && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <HotelIcon className="w-5 h-5 text-teal" />
                      <h4 className="font-bold text-gray-900 text-base">Attached Hotel Options & Supplements</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Add hotels that travelers can select for this season. Set a $0 supplement for standard/included hotels, or a positive amount (e.g. +$350) for luxury upgrades.
                    </p>
                  </div>
                </div>

                {hotelOptions.length > 0 ? (
                  <div className="space-y-2.5">
                    {hotelOptions.map((opt, idx) => {
                      const hotelObj = opt.hotel || hotelsList.find(h => h.id === opt.hotel_id);
                      return (
                        <div
                          key={opt.hotel_id || idx}
                          className={`p-3.5 rounded-lg border transition-all ${
                            opt.is_default ? 'bg-teal/5 border-teal' : 'bg-white border-gray-200'
                          } flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}
                        >
                          <div className="flex items-center gap-3 min-w-[200px]">
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
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-gray-900">{hotelObj?.name || `Hotel #${opt.hotel_id}`}</span>
                                {hotelObj?.stars && (
                                  <span className="inline-flex items-center text-xs font-semibold text-amber-600">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                    {hotelObj.stars}★
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{hotelObj?.city || 'Selected Accommodation'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto flex-1 max-w-xl">
                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Room / Tier Label</label>
                              <input
                                type="text"
                                value={opt.room_type || ''}
                                onChange={(e) => handleUpdateHotelOption(idx, 'room_type', e.target.value)}
                                placeholder="e.g. Luxury Tent"
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-teal outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Extra Cost (+USD)</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 text-xs font-bold">+$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={opt.price_supplement}
                                  onChange={(e) => handleUpdateHotelOption(idx, 'price_supplement', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-teal outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-2 pt-4">
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
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors self-end md:self-center"
                            title="Remove hotel option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center bg-white text-gray-500 text-xs">
                    No hotel options attached yet. Add hotel options below to offer accommodation choices to customers.
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                  <select
                    value={selectedNewHotelId}
                    onChange={(e) => setSelectedNewHotelId(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                  >
                    <option value="">-- Choose a hotel to attach --</option>
                    {hotelsList
                      .filter(h => !hotelOptions.some(opt => opt.hotel_id === h.id))
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} {h.stars ? `(${h.stars}★)` : ''} {h.city ? `— ${h.city}` : ''}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddHotelOption}
                    disabled={!selectedNewHotelId}
                    className="px-4 py-2 bg-charcoal hover:bg-charcoal/90 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hotel Tier
                  </button>
                </div>
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
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-teal hover:bg-teal-dark disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : editingChart ? 'Update Price Chart' : 'Create Price Chart'}
              </button>
            </div>
          </form>
        </div>
      )}

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
              Create seasonal rates and attach hotel upgrade tiers for customers to choose during booking.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setHotelOptions([]);
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
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  opt.is_default
                                    ? 'bg-teal/10 text-teal-dark border-teal/30'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {opt.hotel?.name || `Hotel #${opt.hotel_id}`}
                                {opt.price_supplement > 0 ? ` (+${opt.price_supplement})` : ' (Incl.)'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Standard (No specific hotels attached)</span>
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