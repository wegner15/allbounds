export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate_to_usd: number;
  is_base_currency: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch?: string;
  swift_bic?: string;
  currency: string;
  bank_address?: string;
  is_primary?: boolean;
}

export interface MobileMoneyAccount {
  network: string;
  merchant_number: string;
  account_name: string;
  currency?: string;
  is_primary?: boolean;
}

export interface CompanyFinanceSettings {
  id: number;
  company_name: string;
  legal_company_name: string;
  tagline: string;
  physical_address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  tin_number?: string;
  company_registration_number?: string;
  vat_number?: string;
  bank_accounts: BankAccount[];
  mobile_money_accounts: MobileMoneyAccount[];
  card_payment_info?: string;
  default_invoice_notes?: string;
  default_invoice_terms?: string;
  default_receipt_notice?: string;
  default_voucher_supplier_instructions?: string;
  default_voucher_client_instructions?: string;
  default_voucher_terms?: string;
}

export interface ClientDetails {
  full_name?: string;
  name?: string;
  email?: string;
  telephone?: string;
  phone?: string;
  address?: string;
  country?: string;
  company_name?: string;
  company?: string;
  contact_person?: string;
  tin_vat?: string;
  purchase_order_number?: string;
  [key: string]: any;
}

export interface TripSummary {
  lead_traveller?: string;
  destinations?: string;
  travel_type?: string;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
  duration_days?: number | null;
  duration_nights?: number | null;
  accommodation_category?: string;
  meal_plan?: string;
  transportation_type?: string;
  tour_package_name?: string;
}

export interface InvoiceLineItem {
  id?: number;
  invoice_id?: number;
  category: 'accommodation' | 'transportation' | 'activities' | 'flights' | 'other' | string;
  title: string;
  description?: string;
  travel_date?: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  cost_price?: number;
  supplier_id?: number | null;
  metadata_json?: Record<string, any>;
  sort_order?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id?: number | null;
  quote_number?: string;
  invoice_status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  booking_date?: string | null;
  due_date: string;
  currency: string;
  exchange_rate_to_usd: number;
  consultant_id?: number | null;
  consultant_name?: string;
  payment_terms?: string;
  client_type: 'individual' | 'corporate';
  client_details: ClientDetails;
  trip_summary: TripSummary;
  subtotal: number;
  discount_amount: number;
  promotional_discount: number;
  taxable_amount: number;
  vat_amount: number;
  other_taxes_amount: number;
  service_fee: number;
  booking_fee: number;
  payment_processing_fee: number;
  total_amount: number;
  amount_paid: number;
  credit_applied: number;
  balance_due: number;
  payment_methods_snapshot?: {
    bank_accounts?: BankAccount[];
    mobile_money_accounts?: MobileMoneyAccount[];
    card_payment_info?: string;
  };
  notes?: string;
  terms_and_conditions?: string;
  verification_token: string;
  created_at?: string;
  updated_at?: string;
  line_items: InvoiceLineItem[];
  receipts: PaymentReceipt[];
}

export interface InvoiceCreateRequest {
  invoice_number?: string;
  booking_id?: number | null;
  quote_number?: string;
  invoice_status?: string;
  invoice_date: string;
  booking_date?: string | null;
  due_date: string;
  currency: string;
  exchange_rate_to_usd?: number;
  consultant_id?: number | null;
  consultant_name?: string;
  payment_terms?: string;
  client_type: 'individual' | 'corporate';
  client_details: ClientDetails;
  trip_summary: TripSummary;
  subtotal: number;
  discount_amount: number;
  promotional_discount: number;
  taxable_amount: number;
  vat_amount: number;
  other_taxes_amount: number;
  service_fee: number;
  booking_fee: number;
  payment_processing_fee: number;
  total_amount: number;
  credit_applied: number;
  payment_methods_snapshot?: any;
  notes?: string;
  terms_and_conditions?: string;
  line_items: InvoiceLineItem[];
}

export type InvoiceUpdateRequest = Partial<InvoiceCreateRequest>;

export interface PaymentAllocation {
  description?: string;
  invoice_amount?: number;
  previously_paid?: number;
  this_payment?: number;
  balance?: number;
  total_paid?: number;
}

export interface PaymentReceipt {
  id: number;
  receipt_number: string;
  invoice_id: number;
  booking_id?: number | null;
  payment_reference: string;
  receipt_date: string;
  payment_date: string;
  amount_received: number;
  amount_in_words: string;
  currency: string;
  exchange_rate_to_usd: number;
  payment_method: 'bank_transfer' | 'mobile_money' | 'card' | 'cash' | 'eft' | 'cheque' | 'other' | string;
  payment_provider?: string;
  payment_status: 'completed' | 'cleared' | 'reversed' | string;
  received_from: ClientDetails;
  payment_allocation: PaymentAllocation;
  verification_code: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentReceiptCreateRequest {
  receipt_number?: string;
  invoice_id: number;
  booking_id?: number | null;
  payment_reference: string;
  receipt_date: string;
  payment_date: string;
  amount_received: number;
  amount_in_words?: string;
  currency?: string;
  exchange_rate_to_usd?: number;
  payment_method: string;
  payment_provider?: string;
  payment_status?: string;
  received_from?: ClientDetails;
  notes?: string;
}

export interface SupplierDetails {
  supplier_name: string;
  company_name?: string;
  hotel_name?: string;
  contact_person?: string;
  reservation_email?: string;
  telephone?: string;
  address?: string;
  supplier_confirmation_number?: string;
}

export interface TravellerDetails {
  lead_traveller: string;
  travellers_list: string[];
  adults: number;
  children: number;
  children_ages?: (number | null)[];
  infants?: number;
  nationality?: string;
  passport_info?: string;
  country_of_origin?: string;
}

export interface SpecialRequestItem {
  request: string;
  status: 'confirmed' | 'subject_to_availability' | 'requested';
}

export interface TravelVoucher {
  id: number;
  voucher_number: string;
  booking_id?: number | null;
  invoice_id?: number | null;
  confirmation_number?: string;
  version: number;
  voucher_status: 'confirmed' | 'pending' | 'amended' | 'cancelled' | string;
  voucher_type: 'accommodation' | 'transportation' | 'activity' | 'safari' | 'flight' | 'general' | string;
  issue_date: string;
  issued_by_id?: number | null;
  issued_by_name?: string;
  supplier_details: SupplierDetails;
  traveller_details: TravellerDetails;
  service_details: Record<string, any>;
  supplier_instructions?: string;
  client_instructions?: string;
  inclusions: string[];
  exclusions: string[];
  special_requests: SpecialRequestItem[];
  emergency_contacts?: Record<string, string>;
  voucher_terms?: string;
  verification_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface TravelVoucherCreateRequest {
  voucher_number?: string;
  booking_id?: number | null;
  invoice_id?: number | null;
  confirmation_number?: string;
  version?: number;
  voucher_status?: string;
  voucher_type: string;
  issue_date: string;
  supplier_details: SupplierDetails;
  traveller_details: TravellerDetails;
  service_details: Record<string, any>;
  supplier_instructions?: string;
  client_instructions?: string;
  inclusions?: string[];
  exclusions?: string[];
  special_requests?: SpecialRequestItem[];
  emergency_contacts?: Record<string, string>;
  voucher_terms?: string;
}

export interface TravelVoucherUpdateRequest extends Partial<TravelVoucherCreateRequest> {
  bump_version?: boolean;
}

export interface FinanceDashboardStats {
  total_invoiced_usd: number;
  total_collected_usd: number;
  total_outstanding_usd: number;
  overdue_invoices_count: number;
  pending_vouchers_count: number;
  invoices_by_status: Record<string, number>;
  recent_receipts: PaymentReceipt[];
  recent_invoices: Invoice[];
}

export interface PublicVoucherVerificationResponse {
  is_valid: boolean;
  voucher_number: string;
  booking_number?: string;
  version: number;
  voucher_status: string;
  voucher_type: string;
  issue_date: string;
  supplier_name: string;
  lead_traveller: string;
  passenger_count: number;
  service_summary: string;
  service_dates: string;
  verification_timestamp: string;
}

export interface PublicReceiptVerificationResponse {
  is_valid: boolean;
  receipt_number: string;
  invoice_number?: string;
  booking_number?: string;
  receipt_date: string;
  amount_received: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  payer_name: string;
  verification_timestamp: string;
}

// ==========================================
// CLIENT CRM TYPES
// ==========================================

export interface Client {
  id: number;
  client_type: 'individual' | 'corporate';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  contact_person?: string;
  email: string;
  phone?: string;
  alt_phone?: string;
  country_of_origin?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  tin_number?: string;
  vat_number?: string;
  passport_number?: string;
  nationality?: string;
  dietary_requirements?: string;
  special_notes?: string;
  is_active: boolean;
  display_name: string;
  total_invoiced_usd: number;
  total_paid_usd: number;
  outstanding_balance_usd: number;
  invoices_count: number;
  bookings_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface StatementTransaction {
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  reference_number: string;
  description: string;
  currency: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface ClientStatement {
  client: Client;
  statement_date: string;
  start_date?: string;
  end_date?: string;
  opening_balance: number;
  total_billed: number;
  total_paid: number;
  closing_balance: number;
  transactions: StatementTransaction[];
}

// ==========================================
// SUPPLIERS & PAYABLES TYPES
// ==========================================

export interface Supplier {
  id: number;
  name: string;
  supplier_code: string;
  category: 'lodge_hotel' | 'safari_operator' | 'transporter' | 'airline' | 'park_authority' | 'guide' | 'other' | string;
  contact_person?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  physical_address?: string;
  country?: string;
  currency: string;
  tax_pin_number?: string;
  bank_details?: Record<string, any>;
  mobile_money_details?: Record<string, any>;
  payment_terms?: string;
  rating?: number;
  notes?: string;
  is_active: boolean;
  total_billed_usd: number;
  total_paid_usd: number;
  balance_payable_usd: number;
  pending_bills_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierPayment {
  id: number;
  payment_number: string;
  supplier_bill_id: number;
  supplier_id: number;
  payment_date: string;
  amount_paid: number;
  currency: string;
  exchange_rate_to_usd: number;
  payment_method: string;
  reference_code: string;
  disbursed_from_account?: string;
  notes?: string;
  created_at?: string;
}

export interface SupplierBill {
  id: number;
  bill_number: string;
  supplier_reference?: string;
  supplier_id: number;
  supplier_name?: string;
  booking_id?: number;
  invoice_id?: number;
  bill_date: string;
  due_date: string;
  service_date?: string;
  currency: string;
  exchange_rate_to_usd: number;
  amount_billed: number;
  amount_paid: number;
  balance_payable: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  description?: string;
  notes?: string;
  attachment_url?: string;
  created_at?: string;
  updated_at?: string;
  payments: SupplierPayment[];
}

export interface SupplierLedgerTransaction {
  date: string;
  type: 'BILL' | 'PAYMENT';
  reference_number: string;
  supplier_reference?: string;
  description: string;
  currency: string;
  bill_amount: number;
  paid_amount: number;
  running_payable: number;
}

export interface SupplierLedger {
  supplier: Supplier;
  statement_date: string;
  start_date?: string;
  end_date?: string;
  total_billed: number;
  total_paid: number;
  closing_payable: number;
  transactions: SupplierLedgerTransaction[];
}

// ==========================================
// FINANCIAL REPORTS TYPES
// ==========================================

export interface SalesReport {
  start_date?: string;
  end_date?: string;
  total_invoiced_usd: number;
  total_collected_usd: number;
  total_outstanding_usd: number;
  invoices_count: number;
  average_order_value_usd: number;
  period_breakdown: {
    period: string;
    invoices_count: number;
    gross_revenue_usd: number;
    discount_usd: number;
    net_revenue_usd: number;
    collected_usd: number;
    outstanding_usd: number;
  }[];
  destination_breakdown: {
    destination: string;
    bookings_count: number;
    total_sales_usd: number;
    percentage_of_total: number;
  }[];
  consultant_breakdown: {
    consultant_name: string;
    invoices_count: number;
    total_sales_usd: number;
  }[];
}

export interface AgingBucket {
  bucket_label: string;
  count: number;
  total_amount_usd: number;
  percentage: number;
}

export interface ReceivablesAgingReport {
  as_of_date: string;
  total_receivable_usd: number;
  buckets: AgingBucket[];
  overdue_invoices: {
    invoice_id: number;
    invoice_number: string;
    client_name: string;
    invoice_date: string;
    due_date: string;
    days_overdue: number;
    currency: string;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    balance_due_usd: number;
    status: string;
  }[];
}

export interface PayablesAgingReport {
  as_of_date: string;
  total_payable_usd: number;
  buckets: AgingBucket[];
  pending_bills: {
    bill_id: number;
    bill_number: string;
    supplier_name: string;
    bill_date: string;
    due_date: string;
    days_overdue: number;
    currency: string;
    amount_billed: number;
    amount_paid: number;
    balance_payable: number;
    balance_payable_usd: number;
    status: string;
  }[];
}

export interface ProfitabilityItem {
  booking_id?: number;
  invoice_id: number;
  invoice_number: string;
  client_name: string;
  service_description: string;
  destination?: string;
  revenue_usd: number;
  cost_usd: number;
  gross_profit_usd: number;
  gross_margin_percent: number;
}

export interface ProfitabilityReport {
  start_date?: string;
  end_date?: string;
  total_revenue_usd: number;
  total_cost_usd: number;
  total_gross_profit_usd: number;
  average_margin_percent: number;
  items: ProfitabilityItem[];
}

export interface CashFlowReport {
  start_date?: string;
  end_date?: string;
  total_inflow_usd: number;
  total_outflow_usd: number;
  net_cash_flow_usd: number;
  inflows_by_method: Record<string, number>;
  outflows_by_method: Record<string, number>;
  daily_timeline: {
    date: string;
    inflow_usd: number;
    outflow_usd: number;
    net_usd: number;
  }[];
}

export interface InvoiceProfitability {
  invoice_id: number;
  invoice_number: string;
  currency: string;
  exchange_rate_to_usd: number;
  total_revenue: number;
  total_revenue_usd: number;
  total_expenses: number;
  total_expenses_usd: number;
  gross_profit: number;
  gross_profit_usd: number;
  gross_margin_percent: number;
  bills_count: number;
  supplier_bills: SupplierBill[];
}

