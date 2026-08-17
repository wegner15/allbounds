import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import Button from '../../../components/ui/Button';

import { apiClient } from '../../../lib/api';
import type { Inquiry } from '../../../lib/types/api';
import { useRegions, useCountries } from '../../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../../lib/hooks/useHolidayTypes';
import { useHotelTypes } from '../../../lib/hooks/useHotelTypes';

const WizardDetailsView: React.FC<{ details: any }> = ({ details }) => {
  const { data: regions } = useRegions();
  const { data: countries } = useCountries();
  const { data: experiences } = useHolidayTypes();
  const { data: accommodations } = useHotelTypes();

  if (!details) return null;

  const getRegionName = (id: any) => {
    if (id === 'not-sure') return 'Not sure';
    const region = regions?.find(r => r.id === Number(id));
    return region ? region.name : id;
  };

  const getCountryName = (id: any) => {
    if (id === 'not-sure') return 'Not sure';
    const country = countries?.find(c => c.id === Number(id));
    return country ? country.name : id;
  };

  const getExperienceNames = (ids: any[]) => {
    if (!ids || !ids.length) return 'None selected';
    return ids.map(id => {
      const exp = experiences?.find(e => e.id === Number(id));
      return exp ? exp.name : id;
    }).join(', ');
  };

  const getAccommodationName = (id: any) => {
    if (id === 'not-sure') return 'Not sure';
    const acc = accommodations?.find(a => a.id === Number(id));
    return acc ? acc.name : id;
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Planning Wizard Selections</h4>
      <div className="bg-blue-50/50 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border border-blue-100">
        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Destination</span>
          <p className="text-sm text-gray-900 font-medium">
            {getRegionName(details.regionId)} 
            {details.countryId && ` → ${getCountryName(details.countryId)}`}
          </p>
        </div>
        
        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Travel Dates</span>
          <p className="text-sm text-gray-900">
            {details.dateType === 'exact' 
              ? `Exact: ${details.year}-${details.month} (Duration: ${details.duration || 'Exact'})` 
              : `Idea: ${details.month && details.month !== 'not-sure' ? details.month : 'Any month'} ${details.year || ''} (${details.duration || 'Not specified'})`}
          </p>
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experiences</span>
          <p className="text-sm text-gray-900">
            {details.experiencesNotSure ? 'Not sure yet' : getExperienceNames(details.experiences)}
          </p>
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Accommodation</span>
          <p className="text-sm text-gray-900">
            {getAccommodationName(details.accommodation)}
          </p>
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</span>
          <p className="text-sm text-gray-900 font-medium text-green-700">
            {details.budget === 'not-sure' ? 'Not sure' : `${details.currency || 'USD'} ${details.budget?.toLocaleString()}`}
          </p>
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Companions</span>
          <p className="text-sm text-gray-900 capitalize">
            {details.companions ? details.companions.replace('-', ' ') : 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
};

const DestinationBookingDetailsView: React.FC<{ details: any }> = ({ details }) => {
  if (!details) return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        Destination Booking Inquiry Details
      </h4>
      <div className="bg-emerald-50/60 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border border-emerald-200 text-xs">
        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Target Destination</span>
          <p className="text-sm font-bold text-emerald-900">{details.destination || 'Not specified'}</p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Contact Preferences</span>
          <p className="text-gray-900 font-medium">Method: {details.preferred_contact_method || 'WhatsApp'} | Best Time: {details.best_time_to_contact || 'Any Time'}</p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Travel Type & Timeframe</span>
          <p className="text-gray-900 font-medium">{details.travel_type || 'N/A'} (Timeframe: {details.travel_timeframe || 'N/A'})</p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Travel Dates & Flexibility</span>
          <p className="text-gray-900 font-medium">
            Start: {details.start_date || 'N/A'} {details.return_date ? `to ${details.return_date}` : ''} ({details.date_flexibility || 'Exact'}) {details.number_of_nights ? `- ${details.number_of_nights}` : ''}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Group & Rooms</span>
          <p className="text-gray-900 font-medium">
            Adults: {details.adults || 1} | Children: {details.children || 0} {details.children_ages ? `(Ages: ${details.children_ages})` : ''} | Infants: {details.infants || 0} | Rooms: {details.rooms_required || 1}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Accommodation & Meal Plan</span>
          <p className="text-gray-900 font-medium">
            Category: {details.accommodation_category || 'N/A'} | Room: {details.room_preference || 'N/A'} | Meal: {details.meal_plan || 'N/A'}
          </p>
        </div>

        <div>
          <span className="block font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Estimated Budget</span>
          <p className="text-sm font-bold text-emerald-800">{details.budget_per_person || 'N/A'}</p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Custom Itinerary & Package</span>
          <p className="text-gray-900 font-medium">
            Custom: {details.interested_in_custom_itinerary || 'Yes'} | Preferred Pkg: {details.has_preferred_package === 'Yes' ? details.preferred_package_name || 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Flights & Transfers</span>
          <p className="text-gray-900 font-medium">
            Flights: {details.need_flights || 'No'} {details.departure_city ? `from ${details.departure_city}` : ''} ({details.preferred_cabin || 'Economy'}) | Transfers: {details.need_transfers || 'Yes'} | Ground: {details.transportation_during_trip || 'Private'}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Experiences Selected</span>
          <p className="text-gray-900 font-medium">
            {details.selected_activities && details.selected_activities.length > 0 ? details.selected_activities.join(', ') : 'None selected'}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Occasion & Dietary</span>
          <p className="text-gray-900 font-medium">
            Occasion: {details.special_occasion || 'None'} | Dietary: {details.dietary_requirements || 'None'}
          </p>
        </div>

        <div>
          <span className="block font-bold text-gray-500 uppercase tracking-wider mb-0.5">Lead Source & Attachments</span>
          <p className="text-gray-900 font-medium">
            Source: {details.lead_source || 'Website'} {details.uploaded_filename ? `| Attached: ${details.uploaded_filename}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

const GeneralInquiriesPage: React.FC = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch inquiries
  const { data: inquiries, isLoading, error } = useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/bookings/inquiries/') as Inquiry[];
      return response;
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (inquiryId: number) => {
      await apiClient.put(`/api/v1/bookings/inquiries/${inquiryId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ inquiryId, status }: { inquiryId: number; status: string }) => {
      await apiClient.put(`/api/v1/bookings/inquiries/${inquiryId}`, { status, is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = async (inquiryId: number) => {
    try {
      await markAsReadMutation.mutateAsync(inquiryId);
    } catch (error) {
      console.error('Failed to mark inquiry as read:', error);
    }
  };

  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ inquiryId, status: newStatus });
      // Update selected inquiry locally to reflect immediately
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any, is_read: true });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>General Inquiries | AllBounds Admin</title>
      </Helmet>

      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">General Inquiries</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage general customer inquiries and support requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">New</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inquiries?.filter(i => i.status === 'new').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inquiries?.filter(i => i.status === 'in_progress').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inquiries?.filter(i => i.status === 'resolved').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Closed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inquiries?.filter(i => i.status === 'closed').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Inquiries
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                A list of all customer inquiries including their status and details.
              </p>
            </div>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Read Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading inquiries...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading inquiries. Please try again.</p>
            </div>
          ) : inquiries && inquiries.length > 0 ? (
            (() => {
              const filteredInquiries = inquiries.filter(inquiry => {
                if (statusFilter !== 'all' && inquiry.status !== statusFilter) return false;
                if (readFilter !== 'all') {
                  const isRead = readFilter === 'read';
                  if (inquiry.is_read !== isRead) return false;
                }
                return true;
              });

              if (filteredInquiries.length === 0) {
                return (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No inquiries match the selected filters.</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Read
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInquiries.map((inquiry) => (
                        <tr key={inquiry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {inquiry.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {inquiry.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {inquiry.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inquiry.is_read ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Unread
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          View Details
                        </Button>
                        {!inquiry.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(inquiry.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark Read
                          </Button>
                        )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries</h3>
              <p className="mt-1 text-sm text-gray-500">No inquiries have been submitted yet.</p>
            </div>
          )}
        </div>

        {/* Inquiry Details Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.country_of_origin || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message / Extra Information</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>

                {selectedInquiry.source === 'Start Planning Wizard' && selectedInquiry.details && (
                  <WizardDetailsView details={selectedInquiry.details} />
                )}

                {(selectedInquiry.source?.includes('Destination Booking') || selectedInquiry.details?.form_type === 'destination_booking') && selectedInquiry.details && (
                  <DestinationBookingDetailsView details={selectedInquiry.details} />
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                    Close
                  </Button>
                  {!selectedInquiry.is_read && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleMarkAsRead(selectedInquiry.id);
                        setSelectedInquiry(null);
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralInquiriesPage;