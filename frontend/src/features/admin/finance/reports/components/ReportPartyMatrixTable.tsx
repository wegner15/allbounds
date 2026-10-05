import React, { useState, useMemo } from 'react';
import { Search, Building2, User } from 'lucide-react';
import { formatUsd } from '../utils/formatters';
import type { AgingPartyRow } from '../../../../../lib/types/finance';

interface ReportPartyMatrixTableProps {
  partyType: 'client' | 'supplier';
  parties: AgingPartyRow[];
}

export const ReportPartyMatrixTable: React.FC<ReportPartyMatrixTableProps> = ({
  partyType,
  parties,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'overdue' | 'name'>('total');

  const filtered = useMemo(() => {
    let result = [...parties];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.party_name.toLowerCase().includes(q));
    }
    if (sortBy === 'total') {
      result.sort((a, b) => b.total_usd - a.total_usd);
    } else if (sortBy === 'overdue') {
      result.sort(
        (a, b) =>
          b.d1_30_usd + b.d31_60_usd + b.d61_90_usd + b.d90_plus_usd -
          (a.d1_30_usd + a.d31_60_usd + a.d61_90_usd + a.d90_plus_usd)
      );
    } else {
      result.sort((a, b) => a.party_name.localeCompare(b.party_name));
    }
    return result;
  }, [parties, search, sortBy]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc.current += p.current_usd;
        acc.d1_30 += p.d1_30_usd;
        acc.d31_60 += p.d31_60_usd;
        acc.d61_90 += p.d61_90_usd;
        acc.d90_plus += p.d90_plus_usd;
        acc.total += p.total_usd;
        acc.docs += p.documents_count;
        return acc;
      },
      { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0, total: 0, docs: 0 }
    );
  }, [filtered]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden space-y-3">
      {/* Header with Search and Sort */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            {partyType === 'client' ? (
              <>
                <User className="w-4 h-4 text-teal-700" /> Aged Debtors Matrix (By Client)
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 text-teal-700" /> Aged Creditors Matrix (By Supplier)
              </>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Bucket breakdown per {partyType} showing aging liabilities across time windows
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${partyType}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="total">Highest Total</option>
            <option value="overdue">Highest Overdue</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">{partyType === 'client' ? 'Client' : 'Supplier'} Name</th>
              <th className="py-3 px-3 text-center">Docs</th>
              <th className="py-3 px-3 text-right">Current</th>
              <th className="py-3 px-3 text-right">1–30 Days</th>
              <th className="py-3 px-3 text-right">31–60 Days</th>
              <th className="py-3 px-3 text-right">61–90 Days</th>
              <th className="py-3 px-3 text-right">90+ Days</th>
              <th className="py-3 px-4 text-right">Total Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((party, idx) => {
                const totalOverdue =
                  party.d1_30_usd + party.d31_60_usd + party.d61_90_usd + party.d90_plus_usd;
                return (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {party.party_name}
                      {party.oldest_days_overdue > 0 && (
                        <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-100">
                          {party.oldest_days_overdue}d delay
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-gray-500">
                      {party.documents_count}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums text-emerald-700">
                      {party.current_usd > 0 ? formatUsd(party.current_usd) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums text-amber-700">
                      {party.d1_30_usd > 0 ? formatUsd(party.d1_30_usd) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums text-rose-600">
                      {party.d31_60_usd > 0 ? formatUsd(party.d31_60_usd) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums text-rose-700">
                      {party.d61_90_usd > 0 ? formatUsd(party.d61_90_usd) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-rose-800">
                      {party.d90_plus_usd > 0 ? formatUsd(party.d90_plus_usd) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-black tabular-nums text-gray-900">
                      <span className={totalOverdue > 0 ? 'text-rose-700' : 'text-gray-900'}>
                        {formatUsd(party.total_usd)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No {partyType} records match the search.
                </td>
              </tr>
            )}
          </tbody>

          {/* Matrix Totals Footer */}
          {filtered.length > 0 && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-xs">
              <tr>
                <td className="py-3 px-4 text-gray-900 uppercase tracking-wider">
                  Total ({filtered.length} {partyType}s)
                </td>
                <td className="py-3 px-3 text-center font-mono">{totals.docs}</td>
                <td className="py-3 px-3 text-right text-emerald-700 tabular-nums">
                  {formatUsd(totals.current)}
                </td>
                <td className="py-3 px-3 text-right text-amber-700 tabular-nums">
                  {formatUsd(totals.d1_30)}
                </td>
                <td className="py-3 px-3 text-right text-rose-600 tabular-nums">
                  {formatUsd(totals.d31_60)}
                </td>
                <td className="py-3 px-3 text-right text-rose-700 tabular-nums">
                  {formatUsd(totals.d61_90)}
                </td>
                <td className="py-3 px-3 text-right text-rose-800 tabular-nums">
                  {formatUsd(totals.d90_plus)}
                </td>
                <td className="py-3 px-4 text-right font-black text-gray-900 tabular-nums">
                  {formatUsd(totals.total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
