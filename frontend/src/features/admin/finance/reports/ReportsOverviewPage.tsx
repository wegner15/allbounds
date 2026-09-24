import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Calendar,
  Download,
  Printer,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Percent,
  Layers,
  Building2,
  Users,
  Loader2,
} from 'lucide-react';
import { reportsApi } from '../../../../lib/api/reports';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';
import type {
  SalesReport,
  ReceivablesAgingReport,
  PayablesAgingReport,
  ProfitabilityReport,
  CashFlowReport,
} from '../../../../lib/types/finance';

export const ReportsOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'receivables' | 'payables' | 'profitability' | 'cash_flow'>('sales');

  // Date Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Report States
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [receivablesReport, setReceivablesReport] = useState<ReceivablesAgingReport | null>(null);
  const [payablesReport, setPayablesReport] = useState<PayablesAgingReport | null>(null);
  const [profitabilityReport, setProfitabilityReport] = useState<ProfitabilityReport | null>(null);
  const [cashFlowReport, setCashFlowReport] = useState<CashFlowReport | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // PDF Export
  const reportRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();

  const handleDownloadPdf = () => {
    downloadPdf(
      reportRef.current,
      `Financial-Report-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`,
      { orientation: activeTab === 'profitability' || activeTab === 'sales' ? 'landscape' : 'portrait', marginMm: 8 }
    );
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'sales') {
        const data = await reportsApi.getSalesReport(startDate || undefined, endDate || undefined);
        setSalesReport(data);
      } else if (activeTab === 'receivables') {
        const data = await reportsApi.getReceivablesAging();
        setReceivablesReport(data);
      } else if (activeTab === 'payables') {
        const data = await reportsApi.getPayablesAging();
        setPayablesReport(data);
      } else if (activeTab === 'profitability') {
        const data = await reportsApi.getProfitability(startDate || undefined, endDate || undefined);
        setProfitabilityReport(data);
      } else if (activeTab === 'cash_flow') {
        const data = await reportsApi.getCashFlow(startDate || undefined, endDate || undefined);
        setCashFlowReport(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load financial report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  // CSV export generator for currently active tab
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'sales' && salesReport) {
      csvContent += 'Period,Invoices Count,Gross Revenue USD,Discount USD,Net Revenue USD,Collected USD,Outstanding USD\r\n';
      salesReport.period_breakdown.forEach((row) => {
        csvContent += `"${row.period}",${row.invoices_count},${row.gross_revenue_usd},${row.discount_usd},${row.net_revenue_usd},${row.collected_usd},${row.outstanding_usd}\r\n`;
      });
    } else if (activeTab === 'profitability' && profitabilityReport) {
      csvContent += 'Invoice #,Client Name,Destination,Description,Revenue USD,Cost USD,Gross Profit USD,Gross Margin %\r\n';
      profitabilityReport.items.forEach((item) => {
        csvContent += `"${item.invoice_number}","${item.client_name}","${item.destination || ''}","${item.service_description.replace(/"/g, '""')}",${item.revenue_usd},${item.cost_usd},${item.gross_profit_usd},${item.gross_margin_percent}\r\n`;
      });
    } else if (activeTab === 'receivables' && receivablesReport) {
      csvContent += 'Invoice #,Client Name,Invoice Date,Due Date,Days Overdue,Currency,Total Amount,Balance Due USD\r\n';
      receivablesReport.overdue_invoices.forEach((inv) => {
        csvContent += `"${inv.invoice_number}","${inv.client_name}","${inv.invoice_date}","${inv.due_date}",${inv.days_overdue},"${inv.currency}",${inv.total_amount},${inv.balance_due_usd}\r\n`;
      });
    } else if (activeTab === 'payables' && payablesReport) {
      csvContent += 'Bill #,Supplier Name,Bill Date,Due Date,Days Overdue,Currency,Amount Billed,Balance Payable USD\r\n';
      payablesReport.pending_bills.forEach((bill) => {
        csvContent += `"${bill.bill_number}","${bill.supplier_name}","${bill.bill_date}","${bill.due_date}",${bill.days_overdue},"${bill.currency}",${bill.amount_billed},${bill.balance_payable_usd}\r\n`;
      });
    } else if (activeTab === 'cash_flow' && cashFlowReport) {
      csvContent += 'Date,Inflow USD,Outflow USD,Net USD\r\n';
      cashFlowReport.daily_timeline.forEach((d) => {
        csvContent += `"${d.date}",${d.inflow_usd},${d.outflow_usd},${d.net_usd}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
            Financial & Profitability Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Executive performance analytics: sales revenue, debtor aging, vendor payables, cost tracking, and cash-flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Export CSV
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'sales'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Sales & Invoiced Revenue
        </button>
        <button
          onClick={() => setActiveTab('profitability')}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'profitability'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Trip & Booking Profitability
        </button>
        <button
          onClick={() => setActiveTab('receivables')}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'receivables'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Receivables Aging (Debtors)
        </button>
        <button
          onClick={() => setActiveTab('payables')}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'payables'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Payables Aging (Suppliers)
        </button>
        <button
          onClick={() => setActiveTab('cash_flow')}
          className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'cash_flow'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Cash-Flow Statement
        </button>
      </div>

      {/* Date Filter Bar (for applicable reports) */}
      {['sales', 'profitability', 'cash_flow'].includes(activeTab) && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Date Range:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-teal-700 hover:underline font-medium"
              >
                Reset Dates
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-100 text-center text-red-600 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p>{error}</p>
        </div>
      ) : (
        <div ref={reportRef} className="print-container space-y-6 print:p-0 print:border-none print:shadow-none">
          {/* Printable Letterhead Header */}
          <div className="border-b border-gray-200 pb-5 hidden print:flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-teal-800">
                ALLBOUND VACATIONS LTD
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Plot 335 , Block 13 Najjanankumbi , Entebbe Road, Kampala Uganda</p>
              <p className="text-xs text-gray-500">finance@allboundvacations.com | Executive Financial Intelligence</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900">
                {activeTab.replace('_', ' ')} Report
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          {/* ======================================================== */}
          {/* TAB 1: SALES REPORT */}
          {/* ======================================================== */}
          {activeTab === 'sales' && salesReport && (
            <div className="space-y-6">
              {/* Sales KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Invoiced</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${salesReport.total_invoiced_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{salesReport.invoices_count} total invoices</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Collected</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    ${salesReport.total_collected_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {salesReport.total_invoiced_usd > 0
                      ? `${Math.round((salesReport.total_collected_usd / salesReport.total_invoiced_usd) * 100)}% collection rate`
                      : '—'}
                  </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Outstanding Due</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    ${salesReport.total_outstanding_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Accounts receivable</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Avg Booking Value</p>
                  <p className="text-2xl font-bold text-teal-800 mt-1">
                    ${salesReport.average_order_value_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Per safari invoice</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Invoices Count</p>
                  <p className="text-2xl font-bold text-purple-700 mt-1">{salesReport.invoices_count}</p>
                  <p className="text-xs text-gray-400 mt-1">Processed</p>
                </div>
              </div>

              {/* Destination Breakdown & Consultant Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Destination breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900">Revenue by Safari Destination</h3>
                  <div className="space-y-3">
                    {salesReport.destination_breakdown.length > 0 ? (
                      salesReport.destination_breakdown.map((dest, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-gray-700">
                            <span>{dest.destination}</span>
                            <span>
                              ${dest.total_sales_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({dest.percentage_of_total}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, dest.percentage_of_total)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4">No destination sales data available.</p>
                    )}
                  </div>
                </div>

                {/* Consultant Performance */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900">Sales by Travel Consultant</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Consultant</th>
                          <th className="py-2.5 px-3 text-center">Invoices</th>
                          <th className="py-2.5 px-3 text-right">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {salesReport.consultant_breakdown.length > 0 ? (
                          salesReport.consultant_breakdown.map((c, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/70">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{c.consultant_name}</td>
                              <td className="py-2.5 px-3 text-center font-mono">{c.invoices_count}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                                ${c.total_sales_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">
                              No consultant breakdown data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Periodic Breakdown Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Period Revenue Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-3 px-4">Period</th>
                        <th className="py-3 px-4 text-center">Invoices</th>
                        <th className="py-3 px-4 text-right">Gross Sales</th>
                        <th className="py-3 px-4 text-right">Discounts</th>
                        <th className="py-3 px-4 text-right">Net Revenue</th>
                        <th className="py-3 px-4 text-right">Collected</th>
                        <th className="py-3 px-4 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salesReport.period_breakdown.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="py-3 px-4 font-semibold text-gray-900">{p.period}</td>
                          <td className="py-3 px-4 text-center font-mono text-xs">{p.invoices_count}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-700">
                            ${p.gross_revenue_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500">
                            ${p.discount_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-teal-800">
                            ${p.net_revenue_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                            ${p.collected_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-amber-700">
                            ${p.outstanding_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TRIP & BOOKING PROFITABILITY */}
          {/* ======================================================== */}
          {activeTab === 'profitability' && profitabilityReport && (
            <div className="space-y-6">
              {/* Profitability KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Client Revenue (USD)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${profitabilityReport.total_revenue_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Total invoiced receivables</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Supplier Costs (USD)</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">
                    ${profitabilityReport.total_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Total vendor payables</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Gross Profit (USD)</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    ${profitabilityReport.total_gross_profit_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Revenue minus supplier costs</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Average Profit Margin</p>
                  <p className="text-2xl font-bold text-teal-800 mt-1">
                    {profitabilityReport.average_margin_percent}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Overall margin across trips</p>
                </div>
              </div>

              {/* Profitability Items Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-900">Trip & Invoice Profitability Analysis</h3>
                  <span className="text-xs text-gray-500">{profitabilityReport.items.length} trips analyzed</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Trip Details</th>
                        <th className="py-3 px-4 text-right">Revenue (USD)</th>
                        <th className="py-3 px-4 text-right">Cost (USD)</th>
                        <th className="py-3 px-4 text-right">Gross Profit</th>
                        <th className="py-3 px-4 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {profitabilityReport.items.length > 0 ? (
                        profitabilityReport.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-teal-800 text-xs">
                              {item.invoice_number}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                              {item.client_name}
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-600">
                              {item.destination || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-500 max-w-xs truncate">
                              {item.service_description}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-800">
                              ${item.revenue_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-rose-600">
                              ${item.cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">
                              ${item.gross_profit_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  item.gross_margin_percent >= 25
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : item.gross_margin_percent >= 10
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}
                              >
                                {item.gross_margin_percent}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                            No trip profitability records found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: RECEIVABLES AGING (DEBTORS) */}
          {/* ======================================================== */}
          {activeTab === 'receivables' && receivablesReport && (
            <div className="space-y-6">
              {/* Buckets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {receivablesReport.buckets.map((b, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{b.bucket_label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${b.total_amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>{b.count} invoices</span>
                      <span>{b.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overdue Invoices Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-900">Unpaid & Overdue Invoices</h3>
                  <span className="text-xs text-rose-600 font-semibold">
                    Total Outstanding: ${receivablesReport.total_receivable_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Invoice Date</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Aging Status</th>
                        <th className="py-3 px-4 text-right">Invoiced Amount</th>
                        <th className="py-3 px-4 text-right">Amount Paid</th>
                        <th className="py-3 px-4 text-right">Balance Due (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receivablesReport.overdue_invoices.length > 0 ? (
                        receivablesReport.overdue_invoices.map((inv) => (
                          <tr key={inv.invoice_id} className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-teal-800 text-xs">
                              {inv.invoice_number}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-900 text-xs">{inv.client_name}</td>
                            <td className="py-3 px-4 text-xs text-gray-500">{inv.invoice_date}</td>
                            <td className="py-3 px-4 text-xs text-gray-500">{inv.due_date}</td>
                            <td className="py-3 px-4">
                              {inv.days_overdue > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                  <Clock className="w-3 h-3" /> {inv.days_overdue} days overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">
                              {inv.currency} {inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                              {inv.currency} {inv.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-rose-700">
                              ${inv.balance_due_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                            No overdue or unpaid receivables at this time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PAYABLES AGING (SUPPLIERS) */}
          {/* ======================================================== */}
          {activeTab === 'payables' && payablesReport && (
            <div className="space-y-6">
              {/* Buckets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {payablesReport.buckets.map((b, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{b.bucket_label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${b.total_amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>{b.count} vendor bills</span>
                      <span>{b.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Bills Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-900">Pending & Overdue Vendor Liabilities</h3>
                  <span className="text-xs text-rose-600 font-semibold">
                    Total Balance Payable: ${payablesReport.total_payable_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-3 px-4">Bill #</th>
                        <th className="py-3 px-4">Supplier</th>
                        <th className="py-3 px-4">Bill Date</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Aging Status</th>
                        <th className="py-3 px-4 text-right">Amount Billed</th>
                        <th className="py-3 px-4 text-right">Paid</th>
                        <th className="py-3 px-4 text-right">Balance Payable (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payablesReport.pending_bills.length > 0 ? (
                        payablesReport.pending_bills.map((bill) => (
                          <tr key={bill.bill_id} className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-teal-800 text-xs">
                              {bill.bill_number}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-900 text-xs">{bill.supplier_name}</td>
                            <td className="py-3 px-4 text-xs text-gray-500">{bill.bill_date}</td>
                            <td className="py-3 px-4 text-xs text-gray-500">{bill.due_date}</td>
                            <td className="py-3 px-4">
                              {bill.days_overdue > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                  <Clock className="w-3 h-3" /> {bill.days_overdue} days overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                  Due Soon
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">
                              {bill.currency} {bill.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                              {bill.currency} {bill.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-rose-700">
                              ${bill.balance_payable_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                            No pending vendor liabilities at this time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CASH-FLOW STATEMENT */}
          {/* ======================================================== */}
          {activeTab === 'cash_flow' && cashFlowReport && (
            <div className="space-y-6">
              {/* Cash-Flow KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Inflow</p>
                    <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mt-2">
                    ${cashFlowReport.total_inflow_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Receipts from clients</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Outflow</p>
                    <ArrowUpRight className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-2xl font-bold text-rose-700 mt-2">
                    ${cashFlowReport.total_outflow_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Disbursements to suppliers</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Net Cash Flow</p>
                  <p
                    className={`text-2xl font-bold mt-2 ${
                      cashFlowReport.net_cash_flow_usd >= 0 ? 'text-teal-800' : 'text-rose-700'
                    }`}
                  >
                    ${cashFlowReport.net_cash_flow_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Inflow minus outflow</p>
                </div>
              </div>

              {/* Inflows & Outflows by Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-gray-900">Inflows by Payment Channel</h4>
                  <div className="space-y-2">
                    {Object.entries(cashFlowReport.inflows_by_method).length > 0 ? (
                      Object.entries(cashFlowReport.inflows_by_method).map(([method, amt]) => (
                        <div key={method} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                          <span className="capitalize font-medium text-gray-700">{method.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-emerald-700">
                            ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No inflow channel data.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-gray-900">Outflows by Payment Channel</h4>
                  <div className="space-y-2">
                    {Object.entries(cashFlowReport.outflows_by_method).length > 0 ? (
                      Object.entries(cashFlowReport.outflows_by_method).map(([method, amt]) => (
                        <div key={method} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                          <span className="capitalize font-medium text-gray-700">{method.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-rose-700">
                            ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No outflow channel data.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Daily Cash Movement</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Inflow (USD)</th>
                        <th className="py-3 px-4 text-right">Outflow (USD)</th>
                        <th className="py-3 px-4 text-right">Net Flow (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cashFlowReport.daily_timeline.length > 0 ? (
                        cashFlowReport.daily_timeline.map((d, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-medium text-gray-900 text-xs">{d.date}</td>
                            <td className="py-3 px-4 text-right font-medium text-emerald-600">
                              {d.inflow_usd > 0 ? `+$${d.inflow_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-rose-600">
                              {d.outflow_usd > 0 ? `-$${d.outflow_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={d.net_usd >= 0 ? 'text-teal-800' : 'text-rose-700'}>
                                {d.net_usd >= 0 ? '+' : ''}${d.net_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                            No cash movements recorded during this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
