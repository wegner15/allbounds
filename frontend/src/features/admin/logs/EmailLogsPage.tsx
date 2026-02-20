import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, CheckCircle, XCircle, AlertCircle, Eye, Calendar, User } from 'lucide-react';
import { useEmailLogs } from '../../../lib/hooks/useEmailLogs';

const EmailLogsPage: React.FC = () => {
    const { data: logs, isLoading, isError } = useEmailLogs(0, 500);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: number | null) => {
        if (!status) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" /> Unknown</span>;
        }
        if (status >= 200 && status < 300) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Success</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</span>;
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading email logs...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Failed to load email logs.</div>;
    }

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Email Logs | AllBounds Admin</title>
            </Helmet>

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-2 text-primary" />
                        System Outbound Emails
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A complete audit trail of all emails sent via Zoho ZeptoMail.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No email logs found. Wait for the system to send an email.
                                    </td>
                                </tr>
                            ) : (
                                logs?.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{log.recipient}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">{log.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(log.response_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-primary hover:text-primary-dark inline-flex items-center"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View JSON
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedLog(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="w-full">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between border-b pb-4">
                                        <span>Email Delivery Details</span>
                                        <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-500">
                                            <span className="sr-only">Close</span>
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Recipient</p>
                                            <p className="text-base font-bold text-gray-900">{selectedLog.recipient}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Sent At</p>
                                            <p className="text-base font-bold text-gray-900">{formatDate(selectedLog.created_at)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
                                            <p className="text-base font-bold text-gray-900">{selectedLog.subject}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-2">Outgoing Payload</h4>
                                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                                                {JSON.stringify(selectedLog.payload, null, 2)}
                                            </pre>
                                        </div>
                                        <div>
                                            <h4 className="flex items-center text-sm font-bold text-charcoal uppercase tracking-wider mb-2 mt-4">
                                                ZeptoMail API Response
                                                <span className="ml-3 inline-block">
                                                    {getStatusBadge(selectedLog.response_status)}
                                                </span>
                                            </h4>
                                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                                                {JSON.stringify(selectedLog.response_data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-charcoal text-base font-medium text-white hover:bg-gray-900 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailLogsPage;
