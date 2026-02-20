import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

import Button from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api';

interface VisaApplication {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    destination_country: string;
    visa_type: string;
    nationality: string;
    status: string;
    created_at: string;
    purpose_of_travel: string;
    travel_from_date: string;
    travel_to_date: string;
}

const VisaApplicationsPage: React.FC = () => {
    const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);

    const { data: applications, isLoading, error } = useQuery<VisaApplication[]>({
        queryKey: ['visa-applications'],
        queryFn: async () => {
            const response = await apiClient.get('/api/v1/visa-applications/') as VisaApplication[];
            return response;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Helmet>
                <title>Visa Applications | AllBounds Admin</title>
            </Helmet>

            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Visa Applications</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage incoming visa applications from customers
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            All Applications
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-600">Loading applications...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">Error loading applications. Please try again.</p>
                        </div>
                    ) : applications && applications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Applicant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Destination
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
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
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {app.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {app.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {app.destination_country}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {app.visa_type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedApplication(app)}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                            <p className="mt-1 text-sm text-gray-500">No visa applications have been submitted yet.</p>
                        </div>
                    )}
                </div>

                {selectedApplication && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Visa Application Details</h3>
                                <button
                                    onClick={() => setSelectedApplication(null)}
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
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.full_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.nationality || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Destination Country</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.destination_country}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Visa Type</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.visa_type}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Travel From</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.travel_from_date}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Travel To</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.travel_to_date}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Purpose of Travel</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.purpose_of_travel}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setSelectedApplication(null)}>
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

export default VisaApplicationsPage;
