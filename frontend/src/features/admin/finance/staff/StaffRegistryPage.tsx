import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Users, AlertCircle, Loader2 } from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { StaffMember } from '../../../../lib/types/finance';

const emptyMember: StaffMember = {
  name: '',
  role: '',
  department: '',
  phone: '',
  email: '',
  id_number: '',
  is_active: true,
};

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none';

export const StaffRegistryPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<StaffMember | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setStaff(await financeApi.getStaff());
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load staff registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((m) =>
      [m.name, m.role, m.department, m.email, m.phone, m.id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [staff, query]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError(null);
      // Empty strings -> null so the backend email validation only runs on real values
      const payload: StaffMember = Object.fromEntries(
        Object.entries(editing).map(([k, v]) => [k, v === '' ? null : v])
      ) as unknown as StaffMember;
      setStaff(await financeApi.saveStaff(payload));
      setEditing(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail.map((d: any) => d.msg).join('; ') : detail || 'Failed to save staff member'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: StaffMember) => {
    if (!m.id) return;
    if (!window.confirm(`Remove ${m.name} from the registry? Existing vouchers keep their recorded details.`)) return;
    try {
      setError(null);
      setStaff(await financeApi.deleteStaff(m.id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete staff member');
    }
  };

  const toggleActive = async (m: StaffMember) => {
    try {
      setStaff(await financeApi.saveStaff({ ...m, is_active: !(m.is_active ?? true) }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Staff Registry</h1>
            <p className="text-xs text-gray-500">
              Employees available for payment vouchers. Selecting one fills the voucher payee details.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing({ ...emptyMember });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {error && !editing && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, role, email, ID..."
          className={`${inputCls} pl-9`}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Staff ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role / Department</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  {staff.length === 0
                    ? 'No staff registered yet. Add your first staff member to use them on payment vouchers.'
                    : 'No staff match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const active = m.is_active ?? true;
                return (
                  <tr key={m.id} className={`hover:bg-gray-50 ${active ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3 font-mono text-xs text-teal-900">{m.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {m.role || '—'}
                      {m.department && <div className="text-xs text-gray-500">{m.department}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {m.email && <div>{m.email}</div>}
                      {m.phone && <div>{m.phone}</div>}
                      {!m.email && !m.phone && '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleActive(m)}
                        title="Click to toggle"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setEditing({ ...emptyMember, ...m });
                        }}
                        className="p-1.5 text-gray-500 hover:text-teal-700 cursor-pointer"
                        aria-label={`Edit ${m.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="p-1.5 text-gray-500 hover:text-red-600 cursor-pointer"
                        aria-label={`Delete ${m.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-950 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold">{editing.id ? `Edit ${editing.id}` : 'New Staff Member'}</h2>
              <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="sm:col-span-2">
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">Full Name *</span>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label>
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">Role / Position</span>
                  <input
                    value={editing.role ?? ''}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label>
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">Department</span>
                  <input
                    value={editing.department ?? ''}
                    onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label>
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">Email</span>
                  <input
                    type="email"
                    value={editing.email ?? ''}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label>
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">Phone / WhatsApp</span>
                  <input
                    value={editing.phone ?? ''}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="block font-bold uppercase text-[10px] text-gray-600 mb-1">
                    Staff ID / National ID (defaults to registry ID)
                  </span>
                  <input
                    value={editing.id_number ?? ''}
                    onChange={(e) => setEditing({ ...editing, id_number: e.target.value })}
                    className={inputCls}
                  />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffRegistryPage;
