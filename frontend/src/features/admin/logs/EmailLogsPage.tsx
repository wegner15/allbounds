import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Filter,
    Copy,
    Check,
    X,
    Clock,
    FileText
} from 'lucide-react';
import { useEmailLogs } from '../../../lib/hooks/useEmailLogs';
import type { EmailLog } from '../../../lib/api/emailLogs';

const EmailLogsPage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
    const [copiedSection, setCopiedSection] = useState<'payload' | 'response' | null>(null);

    // Debounce search input to avoid hitting backend on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data, isLoading, isError, isFetching, refetch } = useEmailLogs({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
    });

    const logs = data?.items || [];
    const total = data?.total || 0;
    const totalPages = data?.pages || Math.ceil(total / limit) || 0;

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
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    <AlertCircle className="w-3 h-3 mr-1" /> Unknown
                </span>
            );
        }
        if (status >= 200 && status < 300) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Success
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                <XCircle className="w-3 h-3 mr-1 text-red-600" /> Failed
            </span>
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCopyJson = (content: any, section: 'payload' | 'response') => {
        navigator.clipboard.writeText(JSON.stringify(content, null, 2));
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Email Logs | AllBounds Admin</title>
            </Helmet>

            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-2 text-teal-800" />
                        System Outbound Emails
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        A complete audit trail of all emails sent via Zoho ZeptoMail.
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                        Total Recorded: <strong className="text-gray-900 font-bold">{total}</strong> emails
                    </span>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by recipient email or subject line..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                            title="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as any);
                                setPage(1);
                            }}
                            className="bg-transparent text-gray-700 font-medium outline-none cursor-pointer text-xs"
                        >
                            <option value="all">All Deliveries</option>
                            <option value="success">Success Only</option>
                            <option value="failed">Failed Only</option>
                        </select>
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                        title="Refresh email logs"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-teal-700' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Logs Table Card */}
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Recipient
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-700"></div>
                                            <span>Loading email logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-red-500">
                                        Failed to load email logs. Please try refreshing.
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {debouncedSearch || statusFilter !== 'all' ? (
                                            <div>
                                                <p className="font-medium text-gray-700">No matching email logs found</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Try modifying your search query or filter options.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setStatusFilter('all');
                                                        setPage(1);
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        ) : (
                                            'No email logs found. Waiting for system email dispatches.'
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 font-mono">
                                                {log.recipient}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-md truncate" title={log.subject}>
                                                {log.subject}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(log.response_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View JSON
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {total > 0 && (
                    <div className="bg-white px-4 py-3.5 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        {/* Mobile view pagination */}
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || isFetching}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-gray-500 self-center">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages || isFetching}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                        </div>

                        {/* Desktop view pagination */}
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-semibold">{Math.min((page - 1) * limit + 1, total)}</span> to{' '}
                                    <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-semibold">{total}</span> outbound emails
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>Show</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="border border-gray-300 rounded-lg py-1 px-2.5 text-sm bg-white focus:ring-teal-700 focus:border-teal-700 outline-none transition"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span>per page</span>
                                </div>
                            </div>

                            <div>
                                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                    {/* Previous Page Button */}
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1 || isFetching}
                                        className="relative inline-flex items-center px-2.5 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        title="Previous Page"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {/* Numbered Page Buttons with Ellipsis */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                        if (
                                            totalPages > 7 &&
                                            pageNum !== 1 &&
                                            pageNum !== totalPages &&
                                            Math.abs(page - pageNum) > 1
                                        ) {
                                            if (Math.abs(page - pageNum) === 2) {
                                                return (
                                                    <span
                                                        key={pageNum}
                                                        className="relative inline-flex items-center px-3.5 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-400 select-none"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={isFetching}
                                                className={`relative inline-flex items-center px-3.5 py-2 border text-sm font-medium transition ${
                                                    page === pageNum
                                                        ? 'z-10 bg-teal-800 border-teal-800 text-white font-bold'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {/* Next Page Button */}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages || isFetching}
                                        className="relative inline-flex items-center px-2.5 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        title="Next Page"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs transition-opacity" onClick={() => setSelectedLog(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="w-full">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    Email Delivery Details
                                                </h3>
                                                <p className="text-xs text-gray-500">Log #{selectedLog.id} &bull; ZeptoMail Outbound Audit</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Summary Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recipient</p>
                                            <p className="text-sm font-bold text-gray-900 font-mono">{selectedLog.recipient}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dispatched At</p>
                                            <p className="text-sm font-bold text-gray-900">{formatDate(selectedLog.created_at)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedLog.subject}</p>
                                        </div>
                                    </div>

                                    {/* Payloads */}
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Outgoing Payload
                                                </h4>
                                                <button
                                                    onClick={() => handleCopyJson(selectedLog.payload, 'payload')}
                                                    className="inline-flex items-center gap-1 text-xs text-teal-800 hover:text-teal-900 font-medium cursor-pointer"
                                                >
                                                    {copiedSection === 'payload' ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Copy JSON</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="bg-gray-950 text-emerald-400 p-4 rounded-xl overflow-x-auto text-xs font-mono max-h-60 border border-gray-800">
                                                {JSON.stringify(selectedLog.payload, null, 2)}
                                            </pre>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2 mt-4">
                                                <h4 className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    ZeptoMail API Response
                                                    <span className="ml-3 inline-block">
                                                        {getStatusBadge(selectedLog.response_status)}
                                                    </span>
                                                </h4>
                                                <button
                                                    onClick={() => handleCopyJson(selectedLog.response_data, 'response')}
                                                    className="inline-flex items-center gap-1 text-xs text-teal-800 hover:text-teal-900 font-medium cursor-pointer"
                                                >
                                                    {copiedSection === 'response' ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Copy JSON</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="bg-gray-950 text-teal-300 p-4 rounded-xl overflow-x-auto text-xs font-mono max-h-60 border border-gray-800">
                                                {JSON.stringify(selectedLog.response_data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-xl px-4 py-2 bg-gray-900 text-sm font-semibold text-white hover:bg-black focus:outline-none sm:ml-3 sm:w-auto transition cursor-pointer"
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
