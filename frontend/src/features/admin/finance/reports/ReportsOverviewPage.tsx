import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Printer,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  PieChart,
  DollarSign,
  TrendingUp,
  Clock,
  Building2,
  Wallet,
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { reportsApi } from '../../../../lib/api/reports';
import { financeApi } from '../../../../lib/api/finance';
import { ReportFilterBar } from './components/ReportFilterBar';
import { ExecutiveSummaryView } from './views/ExecutiveSummaryView';
import { SalesView } from './views/SalesView';
import { ProfitabilityView } from './views/ProfitabilityView';
import { ReceivablesView } from './views/ReceivablesView';
import { PayablesView } from './views/PayablesView';
import { CashFlowView } from './views/CashFlowView';
import { ReportPdfDocument, type ReportTabKey } from './pdf/ReportPdfDocument';
import { downloadCsv } from './utils/csvExport';
import { getDatePresets, type DatePresetKey } from './utils/datePresets';
import type {
  SalesReport,
  ReceivablesAgingReport,
  PayablesAgingReport,
  ProfitabilityReport,
  CashFlowReport,
  ExecutiveSummaryReport,
  CompanyFinanceSettings,
  ReportGranularity,
} from '../../../../lib/types/finance';

export const ReportsOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTabKey>('executive');

  // Filter States
  const presets = getDatePresets();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>('ytd');
  const [startDate, setStartDate] = useState<string>(presets.ytd.startDate);
  const [endDate, setEndDate] = useState<string>(presets.ytd.endDate);
  const [granularity, setGranularity] = useState<ReportGranularity>('month');
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(false);
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Report Data States
  const [executiveReport, setExecutiveReport] = useState<ExecutiveSummaryReport | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [profitabilityReport, setProfitabilityReport] = useState<ProfitabilityReport | null>(null);
  const [receivablesReport, setReceivablesReport] = useState<ReceivablesAgingReport | null>(null);
  const [payablesReport, setPayablesReport] = useState<PayablesAgingReport | null>(null);
  const [cashFlowReport, setCashFlowReport] = useState<CashFlowReport | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Load Company Finance Settings once for header/branding
  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await financeApi.getSettings();
        setSettings(s);
      } catch (err) {
        console.warn('Could not load company settings for reports branding', err);
      }
    }
    loadSettings();
  }, []);

  // Fetch Report Data based on active tab & filters
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'executive') {
        const data = await reportsApi.getExecutiveSummary({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          granularity,
          includeDrafts,
        });
        setExecutiveReport(data);
      } else if (activeTab === 'sales') {
        const data = await reportsApi.getSalesReport(
          startDate || undefined,
          endDate || undefined,
          granularity,
          includeDrafts
        );
        setSalesReport(data);
      } else if (activeTab === 'profitability') {
        const data = await reportsApi.getProfitability(
          startDate || undefined,
          endDate || undefined,
          includeDrafts
        );
        setProfitabilityReport(data);
      } else if (activeTab === 'receivables') {
        const data = await reportsApi.getReceivablesAging(asOfDate || undefined);
        setReceivablesReport(data);
      } else if (activeTab === 'payables') {
        const data = await reportsApi.getPayablesAging(asOfDate || undefined);
        setPayablesReport(data);
      } else if (activeTab === 'cash_flow') {
        const data = await reportsApi.getCashFlow(
          startDate || undefined,
          endDate || undefined,
          granularity
        );
        setCashFlowReport(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load financial report');
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, granularity, includeDrafts, asOfDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Preset selection
  const handleSelectPreset = (presetKey: DatePresetKey) => {
    setSelectedPreset(presetKey);
    const p = presets[presetKey];
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setGranularity(p.suggestedGranularity);
  };

  const handleResetFilters = () => {
    handleSelectPreset('ytd');
    setIncludeDrafts(false);
    setAsOfDate(new Date().toISOString().split('T')[0]);
  };

  // High-Fidelity Vector PDF Export using @react-pdf/renderer
  const handleDownloadPdf = async () => {
    const currentData =
      activeTab === 'executive'
        ? executiveReport
        : activeTab === 'sales'
        ? salesReport
        : activeTab === 'profitability'
        ? profitabilityReport
        : activeTab === 'receivables'
        ? receivablesReport
        : activeTab === 'payables'
        ? payablesReport
        : cashFlowReport;

    if (!currentData) return;

    try {
      setIsGeneratingPdf(true);

      const periodText =
        activeTab === 'receivables' || activeTab === 'payables'
          ? undefined
          : startDate && endDate
          ? `${startDate} to ${endDate}`
          : 'All Time';

      const asOfText =
        activeTab === 'receivables' || activeTab === 'payables'
          ? asOfDate || new Date().toISOString().split('T')[0]
          : undefined;

      const granularityText =
        activeTab === 'receivables' || activeTab === 'payables' || activeTab === 'profitability'
          ? undefined
          : granularity;

      const doc = (
        <ReportPdfDocument
          reportType={activeTab}
          data={currentData as any}
          settings={settings}
          periodText={periodText}
          asOfText={asOfText}
          granularityText={granularityText}
          generatedBy="Allbound Finance Platform"
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const filename = `Allbound-${activeTab.replace('_', '-')}-Report-${new Date().toISOString().split('T')[0]}.pdf`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to generate high-fidelity report PDF:', err);
      alert('Failed to generate report PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Robust CSV Export
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (activeTab === 'executive' && executiveReport) {
      const headers = ['Period', 'Invoices Count', 'Gross Revenue USD', 'Discount USD', 'Net Revenue USD', 'Collected USD', 'Outstanding USD'];
      const rows = executiveReport.trend.map((r) => [
        r.period_label || r.period,
        r.invoices_count,
        r.gross_revenue_usd,
        r.discount_usd,
        r.net_revenue_usd,
        r.collected_usd,
        r.outstanding_usd,
      ]);
      downloadCsv(`Allbound_Executive_Summary_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'sales' && salesReport) {
      const headers = ['Period', 'Invoices Count', 'Gross Revenue USD', 'Discount USD', 'Net Revenue USD', 'Collected USD', 'Outstanding USD'];
      const rows = salesReport.period_breakdown.map((row) => [
        row.period_label || row.period,
        row.invoices_count,
        row.gross_revenue_usd,
        row.discount_usd,
        row.net_revenue_usd,
        row.collected_usd,
        row.outstanding_usd,
      ]);
      downloadCsv(`Allbound_Sales_Report_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'profitability' && profitabilityReport) {
      const headers = ['Invoice #', 'Invoice Date', 'Client Name', 'Destination', 'Trip Description', 'Revenue USD', 'Cost USD', 'Gross Profit USD', 'Margin %', 'Cost Source'];
      const rows = profitabilityReport.items.map((item) => [
        item.invoice_number,
        item.invoice_date || '',
        item.client_name,
        item.destination || '',
        item.service_description,
        item.revenue_usd,
        item.cost_usd,
        item.gross_profit_usd,
        item.gross_margin_percent,
        item.cost_source || '',
      ]);
      downloadCsv(`Allbound_Trip_Profitability_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'receivables' && receivablesReport) {
      const headers = ['Invoice #', 'Client Name', 'Invoice Date', 'Due Date', 'Days Overdue', 'Aging Bucket', 'Currency', 'Total Amount', 'Amount Paid', 'Balance Due USD'];
      const rows = receivablesReport.overdue_invoices.map((inv) => [
        inv.invoice_number,
        inv.client_name,
        inv.invoice_date,
        inv.due_date,
        inv.days_overdue,
        inv.bucket || '',
        inv.currency,
        inv.total_amount,
        inv.amount_paid,
        inv.balance_due_usd,
      ]);
      downloadCsv(`Allbound_Aged_Debtors_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'payables' && payablesReport) {
      const headers = ['Bill #', 'Supplier Name', 'Bill Date', 'Due Date', 'Days Overdue', 'Aging Bucket', 'Currency', 'Amount Billed', 'Amount Paid', 'Balance Payable USD'];
      const rows = payablesReport.pending_bills.map((bill) => [
        bill.bill_number,
        bill.supplier_name,
        bill.bill_date,
        bill.due_date,
        bill.days_overdue,
        bill.bucket || '',
        bill.currency,
        bill.amount_billed,
        bill.amount_paid,
        bill.balance_payable_usd,
      ]);
      downloadCsv(`Allbound_Aged_Creditors_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'cash_flow' && cashFlowReport) {
      const headers = ['Date / Period', 'Cash Inflow USD', 'Cash Outflow USD', 'Net Cash USD', 'Cumulative Net USD', 'Receipts Count', 'Payments Count'];
      const rows = cashFlowReport.daily_timeline.map((d) => [
        d.period_label || d.date,
        d.inflow_usd,
        d.outflow_usd,
        d.net_usd,
        d.cumulative_net_usd ?? '',
        d.receipts_count || 0,
        d.payments_count || 0,
      ]);
      downloadCsv(`Allbound_Cash_Flow_${timestamp}.csv`, headers, rows);
    }
  };

  const tabs: { key: ReportTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'executive', label: 'Executive Summary', icon: <PieChart className="w-4 h-4" /> },
    { key: 'sales', label: 'Sales & Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'profitability', label: 'Trip Profitability', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'receivables', label: 'Receivables (Debtors)', icon: <Clock className="w-4 h-4" /> },
    { key: 'payables', label: 'Payables (Suppliers)', icon: <Building2 className="w-4 h-4" /> },
    { key: 'cash_flow', label: 'Cash-Flow Statement', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              Corporate Financial Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 mt-1">
            Financial & Profitability Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Executive performance analytics: sales revenue, debtor aging, vendor payables, cost tracking, and cash-flow
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            type="button"
            disabled={isGeneratingPdf || loading}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rendering PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Print
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto print:hidden gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? 'border-teal-800 text-teal-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <ReportFilterBar
        activeTab={activeTab}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        granularity={granularity}
        onGranularityChange={setGranularity}
        includeDrafts={includeDrafts}
        onIncludeDraftsChange={setIncludeDrafts}
        asOfDate={asOfDate}
        onAsOfDateChange={setAsOfDate}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center p-20 bg-white rounded-2xl border border-gray-200/80">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-teal-700"></div>
            <p className="text-xs text-gray-500 font-medium">Computing financial metrics...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center text-rose-600 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'executive' && executiveReport && (
            <ExecutiveSummaryView
              data={executiveReport}
              onNavigateTab={(tab) => setActiveTab(tab as ReportTabKey)}
            />
          )}

          {activeTab === 'sales' && salesReport && (
            <SalesView data={salesReport} />
          )}

          {activeTab === 'profitability' && profitabilityReport && (
            <ProfitabilityView data={profitabilityReport} />
          )}

          {activeTab === 'receivables' && receivablesReport && (
            <ReceivablesView data={receivablesReport} />
          )}

          {activeTab === 'payables' && payablesReport && (
            <PayablesView data={payablesReport} />
          )}

          {activeTab === 'cash_flow' && cashFlowReport && (
            <CashFlowView data={cashFlowReport} />
          )}
        </div>
      )}
    </div>
  );
};
