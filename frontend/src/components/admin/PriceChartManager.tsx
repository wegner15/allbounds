import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import {
  usePackagePriceCharts,
  useCreatePriceChart,
  useUpdatePriceChart,
  useDeletePriceChart,
  type PriceChart
} from '../../lib/hooks/usePackagePriceCharts';

const priceChartSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  price: z.number().min(0, 'Price must be 0 or greater').max(100000, 'Price must be less than $100,000'),
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
  packageId: number;
}

interface EditingChart {
  id: number;
  data: PriceChartFormData;
}

const PriceChartManager: React.FC<PriceChartManagerProps> = ({ packageId }) => {
  const { data: priceCharts, isLoading } = usePackagePriceCharts(packageId);
  const createPriceChart = useCreatePriceChart();
  const deletePriceChart = useDeletePriceChart();

  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<EditingChart | null>(null);
  const [currentPriceChartId, setCurrentPriceChartId] = useState<number | null>(null);

  const updatePriceChart = useUpdatePriceChart(currentPriceChartId || 0);

  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors, isSubmitting } } = useForm<PriceChartFormData>({
    resolver: zodResolver(priceChartSchema),
    defaultValues: {
      title: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
      price: 0,
      is_active: true,
    }
  });

  // Watch form values for validation
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');

  // Auto-adjust end date if start date changes
  useEffect(() => {
    if (watchedStartDate && (!watchedEndDate || parseISO(watchedEndDate) <= parseISO(watchedStartDate))) {
      const newEndDate = format(addMonths(parseISO(watchedStartDate), 1), 'yyyy-MM-dd');
      setValue('end_date', newEndDate);
    }
  }, [watchedStartDate, watchedEndDate, setValue]);

  const onSubmit = async (data: PriceChartFormData) => {
    try {
      if (editingChart) {
        await updatePriceChart.mutateAsync({
          title: data.title,
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          is_active: data.is_active
        });
        setEditingChart(null);
      } else {
        await createPriceChart.mutateAsync({
          package_id: packageId,
          title: data.title,
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          is_active: data.is_active
        });
      }
      reset();
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
      is_active: chart.is_active,
    };

    setEditingChart({ id: chart.id, data: formData });
    setCurrentPriceChartId(chart.id);

    // Populate form
    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof PriceChartFormData, value);
    });

    setShowForm(true);
  };

  const handleDelete = async (chartId: number) => {
    if (window.confirm('Are you sure you want to delete this price chart? This action cannot be undone.')) {
      try {
        await deletePriceChart.mutateAsync({ priceChartId: chartId, packageId });
      } catch (error) {
        console.error('Error deleting price chart:', error);
      }
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingChart(null);
    setCurrentPriceChartId(null);
  };

  const getStatusBadge = (chart: PriceChart) => {
    const now = new Date();
    const startDate = parseISO(chart.start_date);
    const endDate = parseISO(chart.end_date);

    if (!chart.is_active) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }

    if (isBefore(endDate, now)) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }

    if (isAfter(startDate, now)) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Upcoming</span>;
    }

    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Price Charts</h3>
          <p className="mt-2 text-gray-600">
            Manage seasonal pricing and special offers for this package
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-200"
        >
          <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Price Chart
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold text-gray-900">
              {editingChart ? 'Edit Price Chart' : 'Add New Price Chart'}
            </h4>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors duration-200"
                  placeholder="e.g., Summer Special 2025"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    max="100000"
                    {...register('price', { valueAsNumber: true })}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors duration-200"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  {...register('start_date')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors duration-200"
                />
                {errors.start_date && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  {...register('end_date')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors duration-200"
                />
                {errors.end_date && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

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
                      className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Active (visible to customers)
                    </label>
                  </div>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-200"
              >
                Cancel
              </button>
               <button
                 type="button"
                 onClick={handleSubmit(onSubmit)}
                 disabled={isSubmitting}
                 className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
               >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  editingChart ? 'Update Chart' : 'Create Chart'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Price Charts List */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal"></div>
            <p className="mt-4 text-base text-gray-500">Loading price charts...</p>
          </div>
        ) : !priceCharts || priceCharts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-16 w-16 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No price charts yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              Create seasonal pricing charts to offer special rates during different periods of the year.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-200"
              >
                <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Price Chart
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-8 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceCharts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{chart.title}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {format(parseISO(chart.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {format(parseISO(chart.end_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">${chart.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">per person</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {getStatusBadge(chart)}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(chart)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-200"
                        >
                          <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(chart.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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