import React, { useState } from 'react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useActivePackagePriceCharts, useUpdatePriceChart, type PriceChart } from '../../lib/hooks/usePackagePriceCharts';

interface PriceChartDisplayProps {
  packageId: number;
  basePrice?: number;
}

const PriceChartDisplay: React.FC<PriceChartDisplayProps> = ({ packageId, basePrice }) => {
  const { data: priceCharts, isLoading } = useActivePackagePriceCharts(packageId);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    start_date: '',
    end_date: '',
    price: 0,
    is_active: true
  });

  // Create update mutation for the currently editing chart
  const updatePriceChart = useUpdatePriceChart(editingId || 0);

  const handleEdit = (chart: PriceChart) => {
    console.log('Editing chart:', chart);
    setEditingId(chart.id);
    setEditForm({
      title: chart.title,
      start_date: format(parseISO(chart.start_date), 'yyyy-MM-dd'),
      end_date: format(parseISO(chart.end_date), 'yyyy-MM-dd'),
      price: chart.price,
      is_active: chart.is_active
    });
  };

  const handleSave = async () => {
    console.log('Saving chart:', editingId, editForm);
    if (!editingId) return;

    try {
      await updatePriceChart.mutateAsync({
        title: editForm.title,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        price: editForm.price,
        is_active: editForm.is_active
      });
      console.log('Save successful');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating price chart:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      start_date: '',
      end_date: '',
      price: 0,
      is_active: true
    });
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!priceCharts || priceCharts.length === 0) {
    return null; // Don't show anything if no price charts
  }

  // Sort price charts by start date
  const sortedCharts = [...priceCharts].sort((a, b) =>
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // Find the current active price chart
  const now = new Date();
  const currentChart = sortedCharts.find(chart => {
    const startDate = parseISO(chart.start_date);
    const endDate = parseISO(chart.end_date);
    return isAfter(now, startDate) && isBefore(now, endDate);
  });

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Pricing & Special Offers</h3>

      {/* Current Price Display */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {currentChart ? currentChart.title : 'Standard Price'}
            </h4>
            <p className="text-sm text-gray-600">
              {currentChart
                ? `Valid until ${format(parseISO(currentChart.end_date), 'MMM dd, yyyy')}`
                : 'Year-round pricing'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              ${currentChart ? currentChart.price.toFixed(2) : (basePrice || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">per person</div>
            {currentChart && basePrice && currentChart.price < basePrice && (
              <div className="text-sm text-red-500 line-through">
                ${basePrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Price Charts */}
      {sortedCharts.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-gray-900">Upcoming Rates</h4>
          <div className="grid gap-3">
            {sortedCharts
              .filter(chart => {
                const startDate = parseISO(chart.start_date);
                return isAfter(startDate, now);
              })
              .slice(0, 3) // Show next 3 upcoming charts
              .map((chart) => (
                <div key={chart.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{chart.title}</h5>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(chart.start_date), 'MMM dd')} - {format(parseISO(chart.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900">
                        ${chart.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Price Charts Table (Collapsible) */}
      {sortedCharts.length > 1 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
            View all pricing periods ({sortedCharts.length} total)
          </summary>
          <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCharts.map((chart) => {
                    const startDate = parseISO(chart.start_date);
                    const endDate = parseISO(chart.end_date);
                    const isCurrent = isAfter(now, startDate) && isBefore(now, endDate);
                    const isUpcoming = isAfter(startDate, now);
                    const isEditing = editingId === chart.id;

                    let statusText = 'Expired';
                    let statusColor = 'text-red-600 bg-red-100';

                    if (isCurrent) {
                      statusText = 'Current';
                      statusColor = 'text-green-600 bg-green-100';
                    } else if (isUpcoming) {
                      statusText = 'Upcoming';
                      statusColor = 'text-blue-600 bg-blue-100';
                    }

                    return (
                      <tr key={chart.id} className={`${isCurrent ? 'bg-green-50' : ''} ${isEditing ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Chart title"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{chart.title}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <input
                                type="date"
                                value={editForm.start_date}
                                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="date"
                                value={editForm.end_date}
                                onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditing ? (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              ${chart.price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editForm.is_active}
                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Active</span>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                              {statusText}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSave();
                                }}
                                disabled={updatePriceChart.isPending}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                {updatePriceChart.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCancel();
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEdit(chart);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

export default PriceChartDisplay;