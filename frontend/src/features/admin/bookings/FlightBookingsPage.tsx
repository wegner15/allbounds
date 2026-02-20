import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

import Button from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api';

interface FlightPassenger {
    id: number;
    full_name: string;
    dob: string;
    passport_number?: string;
    passport_expiry?: string;
    passenger_type: string;
}

interface FlightBooking {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    trip_type: string;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    return_date?: string;
    travel_class: string;
    status: string;
    created_at: string;
    passengers: FlightPassenger[];
}

const FlightBookingsPage: React.FC = () => {
    const [selectedBooking, setSelectedBooking] = useState<FlightBooking | null>(null);

    const { data: bookings, isLoading, error } = useQuery<FlightBooking[]>({
        queryKey: ['flight-bookings'],
        queryFn: async () => {
            const response = await apiClient.get('/api/v1/flight-bookings/') as FlightBooking[];
            return response;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Helmet>
                <title>Flight Bookings | AllBounds Admin</title>
            </Helmet>

            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Flight Bookings</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage incoming flight booking requests
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            All Flight Requests
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-600">Loading flight bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">Error loading flight bookings. Please try again.</p>
                        </div>
                    ) : bookings && bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requester
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Route
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trip
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
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
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.contact_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {booking.contact_email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {booking.departure_city} &rarr; {booking.destination_city}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {booking.trip_type}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.travel_class}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedBooking(booking)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                            <p className="mt-1 text-sm text-gray-500">No flight bookings have been requested yet.</p>
                        </div>
                    )}
                </div>

                {selectedBooking && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900">Flight Request Details</h3>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Requester Information</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Full Name</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.contact_name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Email</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.contact_email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Phone</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.contact_phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Flight Requirements</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Trip Type</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.trip_type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Cabin Class</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.travel_class}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Origin</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.departure_city}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Destination</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.destination_city}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Departure Date</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedBooking.departure_date}</p>
                                        </div>
                                        {selectedBooking.return_date && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Return Date</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedBooking.return_date}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Passengers ({selectedBooking.passengers?.length || 0})</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Type</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Name</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">DOB</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Passport</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedBooking.passengers && selectedBooking.passengers.length > 0 ? (
                                                    selectedBooking.passengers.map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="px-4 py-2 whitespace-nowrap">{p.passenger_type}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{p.full_name}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{p.dob}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{p.passport_number || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={4} className="px-4 py-2 text-center text-gray-500">No passengers found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FlightBookingsPage;
