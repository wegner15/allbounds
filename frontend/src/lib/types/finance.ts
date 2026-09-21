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
