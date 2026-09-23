import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  User,
  Plus,
  Search,
  DollarSign,
  AlertCircle,
  FileText,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowUpRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { clientsApi } from '../../../../lib/api/clients';
import type { Client } from '../../../../lib/types/finance';
import { ClientEditorModal } from './ClientEditorModal';

export const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const limit = 25;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await clientsApi.getClients({
        skip,
        limit,
        search: search.trim() || undefined,
        client_type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setClients(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load client directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [skip, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchClients();
  };

  const handleClientSaved = () => {
    fetchClients();
  };

  const handleDeleteClient = async (client: Client) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove ${client.display_name}?`)) return;
    try {
      await clientsApi.deleteClient(client.id);
      fetchClients();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete client');
    }
  };

  // Aggregate stats from current view
  const totalReceivables = clients.reduce((acc, c) => acc + (c.outstanding_balance_usd || 0), 0);
  const totalBilled = clients.reduce((acc, c) => acc + (c.total_invoiced_usd || 0), 0);
  const corporateCount = clients.filter((c) => c.client_type === 'corporate').length;

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
            Clients CRM & Accounts Receivable
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage individual and corporate travelers, invoice histories, and statements of account
          </p>
        </div>
        <button
          onClick={() => {
            setClientToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Clients</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Corporate Clients</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{corporateCount}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Receivables</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">
              ${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Billed</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, company, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setSkip(0);
            }}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Client Types</option>
            <option value="individual">Individuals Only</option>
            <option value="corporate">Corporates Only</option>
          </select>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p>{error}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <Users className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-base font-medium">No clients found matching the search criteria.</p>
            <button
              onClick={() => {
                setClientToEdit(null);
                setIsModalOpen(true);
              }}
              className="text-teal-700 hover:underline text-sm font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add your first client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Client Name / Org</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4 text-right">Invoiced (USD)</th>
                  <th className="py-3.5 px-4 text-right">Paid (USD)</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100/60 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/admin/finance/clients/${c.id}`}
                            className="font-semibold text-gray-900 hover:text-teal-700 transition-colors block"
                          >
                            {c.display_name}
                          </Link>
                          {c.client_type === 'corporate' && c.contact_person && (
                            <span className="text-xs text-gray-400 block">Attn: {c.contact_person}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.client_type === 'corporate'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {c.client_type === 'corporate' ? (
                          <>
                            <Building className="w-3 h-3" /> Corporate
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" /> Individual
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div>{c.email}</div>
                      {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {c.country_of_origin || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                      ${c.total_invoiced_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      ${c.total_paid_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.outstanding_balance_usd > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs">
                          ${c.outstanding_balance_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium text-xs">Cleared</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/finance/clients/${c.id}`}
                          title="View Statement & History"
                          className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setClientToEdit(c);
                            setIsModalOpen(true);
                          }}
                          title="Edit Profile"
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c)}
                          title="Deactivate / Delete"
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Client Modal */}
      <ClientEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleClientSaved}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};
