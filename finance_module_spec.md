# Finance Module — Development Specification

> Purpose: a complete, implementation-agnostic description of the Finance module so it can be rebuilt in any language/stack.
> Brand names, company data and technology choices are deliberately excluded. Anything that was a hard-coded company value in the original is described as a **configurable setting** or a **placeholder** (`{{...}}`).

---

## 1. Overview

A back-office finance system for a travel / tour operator. It covers both sides of the business:

| Side | Entities | Direction of money |
|---|---|---|
| **Receivables** (sales) | Clients, Invoices, Payment Receipts | Money in |
| **Payables** (costs) | Suppliers, Supplier Bills, Supplier Payments (disbursements) | Money out |
| **Operational documents** | Travel Vouchers (service orders to suppliers), Payment/Expense Authorization Vouchers (internal staff advances) | Documents / internal cash out |
| **Reference data** | Currencies, Company Finance Settings, Staff Registry, Category lists | — |
| **Analytics** | Dashboard stats, Client & Supplier statements, 6 financial reports | — |
| **Public access** | Token/code-based verification pages, invoice view page, employee signing portal | — |

Key principles:
- Every document stores its **own currency and exchange rate** (to USD); all aggregates are normalised to USD (the **base currency**).
- Documents are **immutable snapshots**: client details, payment methods, staff details, terms are copied onto the document at creation time.
- Every customer-facing document has a **public verification code/token** (QR-friendly) so third parties can validate authenticity without logging in.
- Human-readable **sequential document numbers** per year.

### 1.1 External dependencies (owned by other modules, must be provided)
- **Users & Roles**: users have `first_name`, `last_name`, `email`, `is_superuser`, and a set of roles. A role named `finance` exists.
- **Bookings**: a booking record from which invoices/vouchers can be auto-generated. Fields used: `id`, `contact_name`, `contact_email`, `contact_phone`, `country_of_origin`, `entity_slug` (package slug), `booking_type` (`package` | other → "Group Tour"), `number_of_adults`, `number_of_children`, `number_of_nights`, `selected_hotel_name`, `selected_room_type`, `selected_meal_plan`, `calculated_total_price`, `special_requests`, `created_at`, `client_id`, and a list of `travelers` (`full_name`, `age`, `traveler_type` = `adult|child`).
- **Email sender**: able to send HTML email with a title, body, optional call-to-action button, and optional inline images.
- **Image generation** (for the document stamp, §13).

---

## 2. Access Control

- Every endpoint of the module requires an authenticated user who is **either a superuser or has the `finance` role**, otherwise `403 "Finance role or superuser privilege required"`.
- Exceptions (no auth):
  - `GET currencies`, `GET settings`
  - Public invoice-by-token, public payment-voucher signing (GET/POST), the three `verify/*` endpoints.
- A finance user may also **read bookings** (needed to invoice/voucher).
- UI: a "Finance" navigation group visible to `admin` and `finance`. A finance-only (non-superuser) user lands on the finance overview as their home page.

---

## 3. Conventions

### 3.1 Numeric / money
- Amounts are floating point (2-dp display). Reports round results to 2 dp; percentages to 1 dp.
- **Exchange rate semantics**: `exchange_rate_to_usd` = *units of document currency per 1 USD* (e.g. UGX = 3700, EUR = 0.92). To convert to USD: `usd = amount / rate`. If `rate <= 0` or null, treat as `1.0`.
- Default currency on documents: `USD`. Default rate: `1.0`.

### 3.2 Document number formats (prefix + current year + zero-padded sequence)
| Document | Format | Padding |
|---|---|---|
| Invoice | `INV-{YYYY}-{seq}` | 5 |
| Payment receipt | `{RECEIPT_PREFIX}-{YYYY}-{seq}` (original: 3-letter org prefix + `R`) | 6 |
| Travel voucher | `VCH-{YYYY}-{seq}` | 5 |
| Payment voucher | `PV-{YYYY}-{seq}` | 5 |
| Supplier bill | `BIL-{YYYY}-{seq}` | 4 |
| Supplier payment | `DISB-{YYYY}-{seq}` | 4 |
| Staff member id | `{ORG}-EMP-{seq}` | 3 |

Generation algorithm: find the most recently created record whose number starts with `{prefix}{year}-`; parse the trailing integer; `next = last + 1`; if none or unparseable → `1`. A caller may supply an explicit number instead. **Recommendation for the rebuild:** make this atomic (DB sequence or row lock + unique constraint) — the original has a race condition.
- Suppliers: `supplier_code`, if not supplied → `SUP-{initials of first two words of name, uppercased}-{count+1 padded 3}` (fallback initials `SUP`). Model-level default (when no code at all) is `SUP-` + 6 random hex chars uppercased.

### 3.3 Verification / security tokens
- Verification token/code: `{ORG}-` + 8 random hex chars, uppercase (used on invoices as `verification_token`, receipts/vouchers/payment-vouchers as `verification_code`). Must be unique.
- Payment-voucher signing token: `sgn_` + 32 random hex chars. Unique, unguessable.
- Public lookups by code also accept the human document number as an alternative key (receipts, travel vouchers, payment vouchers).

### 3.4 Lists
All list endpoints return `{ items: [...], total, skip, limit }`, support `skip` (default 0) and `limit` (default 50; payment-vouchers 1–100), ordered newest first (`created_at desc`) unless stated.

### 3.5 Timestamps
All entities have `created_at` (set on insert) and `updated_at` (set on every update).

### 3.6 Errors
- Validation / business-rule failure → `400` with `detail` message.
- Missing resource → `404`.
- Auth → `401/403`.

---

## 4. Data Model

Types: `int`, `string(n)`, `text`, `bool`, `float`, `date`, `datetime(tz)`, `json` (arbitrary nested structure). `FK` = foreign key; `SET NULL`/`CASCADE` = delete behaviour of the *referenced* row being removed.

### 4.1 Currency
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| code | string(10) | unique, indexed, stored uppercase |
| name | string(100) | |
| symbol | string(10) | |
| exchange_rate_to_usd | float | default 1.0, must be > 0 |
| is_base_currency | bool | default false; only one may be true |
| is_active | bool | default true |

### 4.2 CompanyFinanceSettings (singleton — exactly one row, created lazily)
Identity: `company_name`, `legal_company_name`, `tagline`, `physical_address`, `phone`, `whatsapp`, `email`, `website`, `tin_number`, `company_registration_number`, `vat_number` (all configurable; seed defaults are placeholders).

Payment instructions:
- `bank_accounts` : json list of objects (free-form, e.g. bank name, account name/number, swift, branch, currency)
- `mobile_money_accounts` : json list (network, number, account name)
- `card_payment_info` : text

Configurable lists:
- `invoice_categories` : list of `{id, label, is_default?}`
- `supplier_categories` : list of `{id, label, is_default?}`
- `staff_members` : list of staff records (§9)

Default text templates: `default_invoice_notes`, `default_invoice_terms`, `default_receipt_notice`, `default_voucher_supplier_instructions`, `default_voucher_client_instructions`, `default_voucher_terms`.

**Defaults when lists are empty (auto-restored on read):**

Invoice categories: `accommodation`=Accommodation, `transportation`=Transportation, `activities`=Activities & Permits, `flights`=Flights, `meals`=Meals & Catering, `guide`=Guide / Tour Leader, `other`=Other Services.

Supplier categories: `lodge_hotel`=Safari Lodge / Hotel, `safari_operator`=DMC / Safari Operator, `transporter`=Transport & 4×4 Hire, `airline`=Airline / Flight Charter, `park_authority`=Wildlife / Park Permits, `guide`=Tour Guide, `other`=Other Service.

(UI: users may add custom categories; the category `id` is a slug of the label: lowercase, non-alphanumerics → `_`, trimmed of `_`, fallback `custom_category`. Lists are normalised/deduplicated with defaults as fallback.)

### 4.3 Client
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| client_type | string(50) | `individual` \| `corporate`, indexed |
| first_name, last_name | string(100) | individual |
| company_name, contact_person | string(255) | corporate |
| email | string(255) | **unique**, required |
| phone, alt_phone | string(50) | |
| country_of_origin | string(100) | |
| address | text | |
| city | string(100) | |
| postal_code | string(50) | |
| tin_number, vat_number, passport_number | string(100) | |
| nationality | string(100) | |
| dietary_requirements | string(255) | |
| special_notes | text | |
| is_active | bool | default true |

Derived `display_name`: if corporate and `company_name` → company name; else `first_name + " " + last_name` (non-empty parts); else email.
Relations: one client → many invoices, receipts, bookings.

### 4.4 Invoice
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| invoice_number | string(100) | unique |
| booking_id | FK Booking, SET NULL | optional |
| client_id | FK Client, SET NULL | optional |
| quote_number | string(100) | optional |
| invoice_status | string(50) | `draft` \| `issued` \| `partially_paid` \| `paid` \| `overdue` \| `cancelled`; default `draft`; indexed |
| invoice_date | date | required |
| booking_date | date | optional |
| due_date | date | required |
| currency | string(10) | default `USD` |
| exchange_rate_to_usd | float | default 1 |
| consultant_id | FK User, SET NULL | |
| consultant_name | string(255) | snapshot |
| payment_terms | string(255) | |
| client_type | string(50) | `individual` \| `corporate` |
| client_details | json | snapshot: `full_name, email, telephone, country, address, company_name, contact_person, tin_vat, purchase_order_number` |
| trip_summary | json | `lead_traveller, destinations, travel_type, travel_start_date, travel_end_date, adults, children, infants, duration_days, duration_nights, accommodation_category, meal_plan, transportation_type, tour_package_name` |
| subtotal, discount_amount, promotional_discount, taxable_amount, vat_amount, other_taxes_amount, service_fee, booking_fee, payment_processing_fee, total_amount, amount_paid, credit_applied, balance_due | float | all default 0 |
| payment_methods_snapshot | json | `{bank_accounts[], mobile_money_accounts[], card_payment_info}` copied from settings |
| notes, terms_and_conditions | text | |
| verification_token | string(100) | unique, auto-generated |

Children (ordered): `line_items` (by `sort_order`), `receipts` (newest first). Deleting an invoice **cascades** to its line items and receipts. Related: supplier bills linked by `invoice_id`.

### 4.5 InvoiceLineItem
`id`, `invoice_id` (FK CASCADE), `category` (string(50), default `other`; an invoice-category id), `title` (required), `description`, `travel_date`, `quantity` (default 1), `unit_price`, `discount`, `tax_rate`, `tax_amount`, `total_amount`, **cost side:** `cost_price` (per unit), `supplier_id` (FK Supplier, SET NULL), `cost_narration`, `metadata_json` (category-specific structured data; may contain `supplier_expenses`), `sort_order`.

`supplier_expenses` (inside `metadata_json`): list of cost rows `{supplier_id, narration, net_price (or amount), quantity (or qty), markup, tax, total}`.

### 4.6 PaymentReceipt
`id`, `receipt_number` (unique), `invoice_id` (FK CASCADE, required), `booking_id` (FK SET NULL), `client_id` (FK SET NULL), `payment_reference` (string(150), required — bank/mobile txn id), `receipt_date` (date), `payment_date` (datetime), `amount_received` (float, **> 0**), `amount_in_words` (string(500)), `currency`, `exchange_rate_to_usd`, `payment_method` (`bank_transfer|mobile_money|card|cash|eft|cheque|other`, default `bank_transfer`), `payment_provider`, `payment_status` (`completed|cleared|reversed`, default `completed`), `received_from` (json payer snapshot), `payment_allocation` (json, §6.2), `verification_code` (unique), `notes`.

### 4.7 TravelVoucher (service confirmation sent to a supplier / given to the client)
`id`, `voucher_number` (unique), `booking_id` (FK SET NULL), `invoice_id` (FK SET NULL), `supplier_id` (FK SET NULL), `confirmation_number`, `version` (int, default 1), `voucher_status` (`confirmed|pending|amended|cancelled`, default `confirmed`), `voucher_type` (`accommodation|transportation|activity|safari|flight|general`, default `general`), `issue_date`, `issued_by_id` (FK User SET NULL), `issued_by_name`, `supplier_details` (json), `traveller_details` (json: `lead_traveller, travellers_list[], adults, children, children_ages[], infants, country_of_origin`), `service_details` (json, shape depends on type), `supplier_instructions`, `client_instructions`, `inclusions` (list of strings), `exclusions` (list of strings), `special_requests` (list of `{request, status}`), `emergency_contacts` (json: `office_phone, whatsapp, emergency_24h, email`), `voucher_terms`, `verification_code` (unique).

### 4.8 PaymentVoucher (internal staff advance / expense authorization)
`id`, `voucher_number` (unique, `PV-…`), `voucher_status` (`pending_signature|signed|disbursed|reconciled|cancelled`; public verification also treats `rejected` as invalid), `category` (default `safari_field_advance`; see §8.3), `issue_date`, `due_date` (accountability deadline), `booking_id` (FK SET NULL), `employee_id` (FK User SET NULL), `employee_details` (json snapshot: `staff_id, name, role, department, phone, email, id_number, payment_account`), `amount`, `currency`, `exchange_rate_to_usd`, `amount_in_words`, `title` (required), `description`, `line_items` (list `{item, quantity, unit_price, total, notes}`), **authorization:** `authorized_by_id`, `authorized_by_name`, `authorized_at`, `authorized_signature_url`; **employee signature/audit:** `signing_token` (unique), `is_signed`, `signed_at`, `signed_by_name`, `signature_data` (base64 image data URL), `signed_ip_address`, `signed_user_agent`, `signer_declaration`; **disbursement:** `disbursement_method` (`cash|mobile_money|bank_transfer|company_card|cheque`, default `cash`), `disbursed_from_account`, `disbursement_reference`, `disbursed_at`; **retirement:** `reconciliation_notes`, `actual_amount_spent`, `refund_amount`; `notes`, `terms_and_conditions`, `verification_code` (unique).

### 4.9 Supplier
`id`, `name` (required, indexed), `supplier_code` (unique), `category` (supplier-category id, default `lodge_hotel`), `contact_person`, `email`, `phone`, `whatsapp`, `physical_address`, `country` (default configurable), `currency` (default `USD`), `tax_pin_number`, `bank_details` (json — list of `{bank_name, account_name, account_number, swift_code, branch, currency}`), `mobile_money_details` (json — list of `{network, number, account_name}`), `payment_terms` (default `Net 30`; free text e.g. "On Confirmation", "50% Deposit"), `rating` (float, default 5.0), `notes`, `is_active` (default true).
Relations: bills (cascade delete), payments, travel vouchers.

### 4.10 SupplierBill (accounts payable)
`id`, `bill_number` (unique), `supplier_reference` (supplier's own invoice/quote #), `supplier_id` (FK CASCADE, required), `booking_id` (FK SET NULL), `invoice_id` (FK SET NULL — links cost to a client invoice), `bill_date`, `due_date`, `service_date`, `currency`, `exchange_rate_to_usd`, `amount_billed`, `amount_paid`, `balance_payable`, `status` (`pending|partially_paid|paid|overdue|cancelled`, default `pending`, indexed), `category` (`accommodation|transport|permits|flight|guide|activity|other`, default `accommodation`), `description`, `notes`, `attachment_url`. Children: payments (cascade).

### 4.11 SupplierPayment (disbursement)
`id`, `payment_number` (unique), `supplier_bill_id` (FK CASCADE), `supplier_id` (FK CASCADE), `payment_date`, `amount_paid`, `currency`, `exchange_rate_to_usd`, `payment_method` (`bank_transfer|mobile_money|card|cash|cheque`), `reference_code` (required), `disbursed_from_account` (e.g. which company account), `notes`.

---

## 5. Currency Management

| Endpoint | Auth | Behaviour |
|---|---|---|
| `GET /currencies?active_only=true` | public | Ordered base currency first, then code ascending. |
| `POST /currencies` | finance | Code uppercased; reject duplicate code (400). If `is_base_currency=true`, demote all others first. |
| `PUT /currencies/{id}` | finance | Partial update. Setting `is_base_currency=true` demotes all other currencies. 404 if missing. |
| `DELETE /currencies/{id}` | finance | 400 if it is the base currency ("set another as base first"). |

Seeded defaults expected: USD (base, rate 1), UGX, KES, EUR, GBP (rates configurable).

---

## 6. Receivables

### 6.1 Invoices

**Endpoints** (all finance-only except by-token)
- `GET /invoices/next-number` → `{invoice_number}` preview.
- `GET /invoices?skip&limit&status&client_search&currency` — `status="all"` = no filter; `currency` matched uppercased; `client_search` = case-insensitive contains over invoice_number, quote_number, `client_details.full_name`, `.email`, `.company_name`.
- `POST /invoices` — create manual invoice. If `consultant_id` omitted → set to current user, `consultant_name` = "first last" or email.
- `POST /invoices/from-booking` `{booking_id, due_date?, currency?="USD", payment_terms?, notes?}` — see §6.1.3.
- `GET /invoices/{id}`; `GET /invoices/{id}/profitability`; `GET /invoices/by-token/{token}` (**public**, returns the same invoice response).
- `PUT /invoices/{id}`; `POST /invoices/{id}/cancel`; `DELETE /invoices/{id}` (hard delete, cascades).
- `POST /invoices/{id}/send-email` (§12).

#### 6.1.1 Create calculation (server authoritative)
```
for each line item:
    item.total_amount = max(0, quantity*unit_price - discount + tax_amount)
    computed_subtotal += quantity*unit_price
subtotal        = request.subtotal if request.subtotal > 0 else computed_subtotal
taxable_amount  = max(0, subtotal - discount_amount - promotional_discount)
total_amount    = taxable_amount + vat_amount + other_taxes_amount
                  + service_fee + booking_fee + payment_processing_fee
amount_paid     = 0
balance_due     = max(0, total_amount - credit_applied)
```
- If `payment_methods_snapshot` not supplied, copy `{bank_accounts, mobile_money_accounts, card_payment_info}` from company settings.
- `invoice_number` auto-generated unless supplied. Initial status = request value (default `draft`).
- **Line-item cost derivation** for each line: `meta = metadata_json`; if `supplier_expenses` given, store them in `meta.supplier_expenses`. Then, if expenses exist: if `cost_price <= 0` → `cost_price = Σ (net_price||amount) × (quantity||qty||1)`; if no `supplier_id` → first expense with a supplier id; if no `cost_narration` → expense narrations joined by `"; "`.
- Line items get `sort_order` = index.

#### 6.1.2 Update
- Only provided fields change (partial).
- If `line_items` provided: **delete all existing lines and recreate** them. Line `total_amount` = given value if > 0, else `max(0, qty*unit_price - discount + tax_amount)`. Same cost derivation as create. If `subtotal` not provided, `subtotal = Σ line total_amount` (note: differs from create, which uses qty×price).
- After applying fields, **always recompute**:
```
taxable_amount = max(0, subtotal - discount_amount - promotional_discount)
total_amount   = taxable_amount + vat + other_taxes + service_fee + booking_fee + payment_processing_fee
balance_due    = max(0, total_amount - amount_paid - credit_applied)
if balance_due <= 0.01 and amount_paid > 0 and status != cancelled: status = "paid"
```

#### 6.1.3 Create from booking (1-click)
Builds an **issued** invoice (`invoice_date = today`, `due_date = given or today`, `exchange_rate = 1`, `client_type = individual`):
- `client_details` ← booking contact (name, email, phone, country; others empty).
- `trip_summary` ← package name (`entity_slug` with `-`→space, title-cased), lead traveller, travel type (`Safari` if booking_type = package else `Group Tour`), adults, children, infants 0, `duration_nights`, `duration_days = nights + 1`, accommodation category (room type or "Standard"), meal plan (or "Full Board"), transportation type default.
- One line item: title `"{package} Package Booking"`, description with pax counts + hotel, qty 1, `unit_price = booking.calculated_total_price`, category `accommodation` if a hotel is selected else `other`, metadata `{hotel_name, room_type, meal_plan, nights}`.
- Totals: `subtotal = taxable = total = balance_due = price`; all other amounts 0.
- `payment_terms` = given → settings default terms → `"Due upon receipt"`; `notes` = given → settings default notes; `terms_and_conditions` = settings default; payment methods snapshot from settings. `booking_date` = booking creation date.
- 400 if booking not found.

#### 6.1.4 Status lifecycle
`draft → issued → partially_paid → paid`; `cancelled` is terminal-ish; `overdue` exists as a value but is **not set automatically** — "overdue" in reports/dashboards is computed as `due_date < today AND status ∉ {paid, cancelled}`. Status transitions otherwise driven by receipts (§6.2) and manual edits. Cancelling sets status only; it does not touch receipts or amounts.

#### 6.1.5 Invoice profitability (internal only)
```
rate            = invoice.rate or 1
revenue         = invoice.total_amount;  revenue_usd = revenue / rate
bills           = supplier bills with invoice_id = this invoice and status != cancelled
if bills exist: expenses_usd = Σ bill.amount_billed / bill.rate
else (fallback): for each line item:
        if metadata.supplier_expenses: Σ (net||amount) × (quantity||qty||1) / rate
        else: cost_price × quantity / rate
expenses        = expenses_usd × rate
gross_profit    = revenue − expenses ; gross_profit_usd = revenue_usd − expenses_usd
margin_percent  = gross_profit_usd / revenue_usd × 100  (0 if revenue_usd ≤ 0)
```
Response: `invoice_id, invoice_number, currency, exchange_rate_to_usd, total_revenue(+_usd), total_expenses(+_usd), gross_profit(+_usd), gross_margin_percent(1dp), bills_count, supplier_bills[]` (money rounded to 2 dp).

### 6.2 Payment Receipts

- `GET /receipts?skip&limit&invoice_id`; `GET /receipts/{id}`; `POST /receipts`; `POST /receipts/{id}/send-email`.
- **Create** (400 if invoice not found; `amount_received > 0` enforced):
```
receipt_number  = supplied or auto
currency        = supplied or invoice.currency
amount_in_words = supplied or number_to_words(amount_received, currency)   (§14)
prev_paid       = invoice.amount_paid
new_paid        = prev_paid + amount_received
remaining       = max(0, invoice.total_amount − new_paid − invoice.credit_applied)
payment_allocation = {
   description: "{trip_summary.tour_package_name or 'Travel Booking'} — Invoice #{invoice_number}",
   invoice_amount: invoice.total_amount, previously_paid: prev_paid,
   this_payment: amount_received, balance: remaining, total_paid: new_paid }
invoice.amount_paid = new_paid; invoice.balance_due = remaining
invoice.invoice_status = "paid" if remaining <= 0.01 else "partially_paid"
```
  `booking_id` is taken from the invoice; `client_id` = supplied or invoice's. No check prevents overpayment (balance is clamped at 0). Receipt creation and invoice update happen in one transaction.
- **`received_from` normalisation**: merge payer info with invoice `client_details`; resolved keys (first non-empty wins, left→right):
  - `name`/`full_name`: receipt `name` → receipt `full_name` → invoice `full_name` → invoice `contact_person` → invoice `name`
  - `company`/`company_name`: receipt `company` → `company_name` → invoice `company_name` → `company`
  - `contact_person`, `email`, `phone`/`telephone` (receipt `phone` → `telephone` → invoice `telephone` → `phone`), `country`, `address`
  - Result = `{...invoice_client, ...receipt_payer, name: full_name||contact_person||company, full_name, company, company_name, contact_person, email, phone, telephone, country, address}` (both aliases always populated).
- **Lazy backfill on read**: when reading a receipt, if its `received_from` lacks name/phone/email (or lacks company where one is derivable) and the invoice has data, re-merge and persist.
- **Known gaps to decide on in the rebuild**: reversing a receipt (`payment_status = reversed`) is only honoured by reports/verification; it does **not** roll back the invoice's `amount_paid`/`balance_due`/status. There is no receipt update/delete endpoint.
- Public lookup by `verification_code` **or** `receipt_number` (§11).

### 6.3 Clients

Endpoints under `/clients` (finance-only): `GET ""` (filters `search`, `client_type`, `is_active`, paging), `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}/statement?start_date&end_date`.

- Search: case-insensitive contains on first_name, last_name, company_name, email, phone, country_of_origin. Order: newest first.
- Create/Update: reject duplicate email (400, message `A client with email '…' already exists.`).
- Delete: **soft-delete** (`is_active=false`) if the client has any invoices; otherwise hard delete.
- **Response enrichment** (computed per client, excluding cancelled invoices): `total_invoiced_usd = Σ total/rate`, `total_paid_usd = Σ paid/rate`, `outstanding_balance_usd = Σ balance/rate`, `invoices_count`, `bookings_count`, plus `display_name`.
- **Client statement** (ledger): events from non-cancelled invoices (type `INVOICE`, **debit** = total) and non-reversed receipts (type `PAYMENT`, **credit** = amount received) within the optional date range, merged and sorted by date ascending; `running_balance` accumulates in **USD** (`debit_usd − credit_usd`) while each row also shows original-currency `debit`/`credit` and `currency`. Descriptions: invoice → `"Invoice for booking {booking_id or 'Custom Safari'}"`; payment → `"Payment received via {Method Title Case} (Ref: {reference})"`. Response: `client, statement_date (today), start_date, end_date, opening_balance (always 0), total_billed, total_paid, closing_balance, transactions[]`.

---

## 7. Payables

### 7.1 Suppliers (`/suppliers`, finance-only)
- `GET ""` (filters `search` over name/code/contact/email/phone, `category`, `is_active`; ordered by name asc), `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}/ledger?start_date&end_date`.
- **Delete**: soft-delete (`is_active=false`) if supplier has bills; else hard delete. Response message "Supplier deleted or archived successfully".
- **Response enrichment** (non-cancelled bills): `total_billed_usd`, `total_paid_usd`, `balance_payable_usd` (each converted with the bill's rate), `pending_bills_count` (bills with status `pending|partially_paid|overdue`).
- **Supplier ledger**: events from non-cancelled bills (type `BILL`, `bill_amount`) and **all** supplier payments (type `PAYMENT`, `paid_amount`) within range, sorted by date asc, with `running_payable += bill − paid`. NOTE: running/total figures here are in **document currency summed without conversion** (mixed-currency suppliers will be wrong) — consider converting to USD or per-currency ledgers in the rebuild. Descriptions: bill → `description` or `"Bill for {category}"`; payment → `"Payment disbursed via {Method} (Ref: {reference_code})"`. Response: `supplier, statement_date, start_date, end_date, total_billed, total_paid, closing_payable, transactions[]`.

### 7.2 Supplier Bills (`/suppliers/bills`)
- `GET /next-bill-number`, `GET /next-payment-number` (previews).
- `GET /bills?skip&limit&supplier_id&invoice_id&status&search` (search joins supplier: bill_number, supplier_reference, supplier name, description; ordered by `bill_date desc`). Response is `{items,total,skip,limit}`.
- `POST /bills`: number auto; `amount_paid=0`, `balance_payable=amount_billed`, `status="pending"`, `category` default `accommodation`, currency default USD.
- `GET /bills/{id}` (includes `supplier_name` and nested `payments`), `PUT /bills/{id}`.
- **Update recalculation** (after applying fields):
```
balance_payable = max(0, amount_billed − amount_paid)
if balance_payable == 0:            status = "paid"
elif amount_paid > 0:               status = "partially_paid"
elif due_date < today and status != "cancelled": status = "overdue"
```
  Caveat: an explicit status change in the update (e.g. `cancelled`) can be overridden by this recompute; the rebuild should let `cancelled` win.
- No bill delete endpoint.

### 7.3 Supplier Payments (disbursements) — `POST /suppliers/payments`
- 400 if bill not found. `supplier_id` inherited from the bill. `payment_date` default today. Payment number auto.
- Effects on bill: `amount_paid += amount`; `balance_payable = max(0, billed − paid)`; `status = "paid"` if balance == 0 else `"partially_paid"`.
- No validation against overpayment; no payment update/delete.

---

## 8. Vouchers

### 8.1 Travel Vouchers (`/vouchers`)
- `GET /vouchers?skip&limit&voucher_type&status&supplier_search` (`all` = no filter; search over voucher_number, `supplier_details.supplier_name`, `traveller_details.lead_traveller`).
- `POST /vouchers`: number auto; `issued_by` defaults to current user; `emergency_contacts` default from company settings (`office_phone`=phone, `whatsapp`, `emergency_24h`=phone, `email`); `supplier_instructions`, `client_instructions`, `voucher_terms` default to the settings templates; `version` default 1.
- `POST /vouchers/from-booking` `{booking_id, voucher_type="general", supplier_details?, issue_date?}`:
  - Traveller details from booking travelers (fallback: contact name only); `infants=0`.
  - `accommodation` type: supplier name = selected hotel (or given or "Partner Hotel"); supplier block `{supplier_name, hotel_name, contact_person ("Reservations Manager"), reservation_email, telephone, address, supplier_confirmation_number = "HTL-{booking_id:04d}"}`; service details `{property_name, check_in_date, check_out_date, number_of_nights (≥1), number_of_rooms=1, room_type ("Standard Room"), meal_plan/board_basis ("Full Board"), special_requests}`.
  - Other types: supplier block is the company itself `{supplier_name, company_name, contact_person ("Ground Handler"), reservation_email=company email, telephone=company phone, supplier_confirmation_number = "OPS-{booking_id:04d}"}`; service details `{package_name, duration_nights, special_requests}`.
  - Status `confirmed`, version 1, default inclusions `["Accommodation as specified","Meals as specified","Ground transport and transfers","Park entry fees"]`, default exclusions `["Personal expenses & tips","Alcoholic beverages","Travel insurance","Visa fees"]`, special-request list from booking (`status:"requested"`), instructions/terms/emergency contacts from settings.
- `GET /vouchers/{id}`; `PUT /vouchers/{id}` (partial; `bump_version=true` → `version += 1` and, unless cancelled, `status="amended"`).
- `POST /vouchers/{id}/send-email` (§12).
- No delete.

### 8.2 Payment (Expense Authorization) Vouchers (`/payment-vouchers`)
Internal control document: management authorizes cash to an employee; the employee **digitally signs** to acknowledge responsibility; the cash is disbursed; then the advance is **reconciled/retired** against receipts.

- `GET /payment-vouchers?skip&limit(1..100)&status&category&employee_id&staff_id&booking_id&search` — `staff_id` matches `employee_details.staff_id` exactly; `search` over voucher_number, title, `employee_details.name`, notes.
- `POST`: number auto; status default `pending_signature`; `amount_in_words` auto from amount+currency when absent; `authorized_by_id` = current user, `authorized_by_name` = supplied → current user's name → `"Finance Administrator"`; `authorized_at = now`; `signing_token` and `verification_code` auto.
- `GET /{id}`; `PUT /{id}` (partial). On update: if `amount` changes and no explicit words → regenerate `amount_in_words` using new/old currency; if `voucher_status` is set to `disbursed` and `disbursed_at` empty → `disbursed_at = now`. Reconciliation fields (`reconciliation_notes`, `actual_amount_spent`, `refund_amount`) are updated through this endpoint.
- `POST /{id}/send-email` (§12) — sends the signing link.
- **Status flow:** `pending_signature → signed → disbursed → reconciled`, or `cancelled`. `signed` is set automatically by signing (§8.4); the others are manual updates.

### 8.3 Payment-voucher categories
The backend stores an arbitrary string. The original UI offered: `safari_advance` (Safari / Field Advance — UI default), `per_diem`, `fuel_transport`, `field_allowance`, `staff_salary`, `commission`, `reimbursement`, `medical_emergency`, `contingency`, `other`. (Backend schema default `safari_field_advance`; unify the list in the rebuild.) Display rule: replace `_` with space and title-case.

### 8.4 Public employee signing portal
- `GET /payment-vouchers/sign/{token}` (**public**): returns a restricted view `{voucher_number, voucher_status, category, issue_date, due_date, employee_name (name→full_name→"Authorized Employee"), employee_role (role→department), employee_phone, employee_email, amount, currency, amount_in_words, title, description, line_items, authorized_by_name, is_signed, signed_at, signed_by_name, signature_data, verification_code, terms_and_conditions}`. 404 `"Signing link is invalid or expired."`
- `POST /payment-vouchers/sign/{token}` with `{signed_by_name, signature_data (image data URL), signer_declaration?}` (**public**):
  - 404 if token unknown; 400 if voucher `cancelled`.
  - Sets `is_signed=true`, `signed_at=now`, `signed_by_name`, `signature_data`, records **client IP** and **user-agent (truncated to 250 chars)**.
  - Default declaration: `"I, {name}, hereby acknowledge receipt/authorization of {currency} {amount:,.2f} for '{title}' and agree to submit receipts and account for these company funds accordingly."`
  - If status was `pending_signature` → `signed`.
  - Re-signing is currently allowed (overwrites); consider locking after first signature.
  - Returns the same restricted view.
- UI: signature canvas (finger/mouse), declaration text, name field.

---

## 9. Staff Registry (embedded in settings)

Stored as the `staff_members` list inside company settings. Record: `{id, name, role, department, phone, email, id_number, is_active}`.

- `GET /staff?active_only=false` — list (`active_only` filters `is_active != false`).
- `POST /staff` — create or update by `id`:
  - `name` required (trimmed) else 400 `"Staff member name is required."`
  - Email normalised to lowercase (nullable); **email must be unique** across other members → 400 `"Email {email} already belongs to {name} ({id})."`
  - No `id` → generate `{ORG}-EMP-{max numeric suffix + 1, 3-digit}`.
  - `id_number` defaults to the staff id; `is_active` defaults true.
  - Existing id → merge (`{...old, ...new}`); otherwise append. Matching is by `id` only, so two people with the same name stay separate. Returns the full updated list.
- `DELETE /staff/{id}` — 404 if not found; returns updated list. Issued vouchers keep their own snapshot.
- UI: registry page (CRUD, active toggle); voucher creation picks a staff member and snapshots details into `employee_details` (incl. `staff_id`).

---

## 10. Company Settings Endpoints
- `GET /settings` (public): returns singleton. **Lazy creation** on first access with default categories; if category lists are empty, restore defaults; if `staff_members` is null → `[]`.
- `PUT /settings` (finance): partial update of any field.
- UI "Finance Settings" page edits: company identity, bank accounts, mobile money accounts, card info, default notes/terms/instructions, category managers (add/rename/delete custom categories), currencies & rates.

---

## 11. Public Verification Endpoints (no auth)

Each returns `is_valid`, a small safe subset of fields, and `verification_timestamp` (now). 404 for unknown code.

| Endpoint | Lookup key | `is_valid` when | Returned fields |
|---|---|---|---|
| `GET /verify/voucher/{code}` | verification_code or voucher_number | status ≠ cancelled | voucher_number, booking_number, version, status, type, issue_date, supplier_name, lead_traveller, passenger_count (adults+children), service_summary (property_name → package_name → "{Type} Service"), service_dates (check-in "to" check-out if present, else "Issued on {dd Mon YYYY}") |
| `GET /verify/receipt/{code}` | verification_code or receipt_number | payment_status ≠ reversed | receipt_number, invoice_number, booking_number, receipt_date, amount_received, currency, payment_method (title-cased), payment_status, payer_name (company_name → company → full_name → name → "Client") |
| `GET /verify/payment-voucher/{code}` | verification_code or voucher_number | status ∉ {cancelled, rejected} | voucher_number, status, category, issue_date, amount, currency, employee_name, authorized_by_name, is_signed, signed_by_name, signed_at |

`booking_number` display format: `{ORG}-BK-{booking_id padded 5}` or null.
Public **invoice view** uses `GET /invoices/by-token/{token}` and a read-only invoice page. Frontend public routes: `verify/invoice/:token`, `verify/receipt/:code`, `verify/voucher/:code`, `verify/payment-voucher/:code`, `sign/voucher/:token`.

---

## 12. Email Dispatch

Request body for all: `{recipient_email (valid email, required), recipient_name?, subject?, message?, copy_me=true, base_url?}`.
All emails use a branded HTML wrapper (title, body, optional CTA button). `base_url` (when provided) overrides the default site origin used to build links.

| Email | Default subject | Body summary | CTA link |
|---|---|---|---|
| Invoice | `Invoice {number} from {company}` | Greeting (recipient name → client `full_name` → "Valued Client"), optional custom message, box with invoice #, due date (`dd Mon YYYY`), total, paid, **balance due** (formatted `{CUR} 1,234.56`); inline **stamp** image (status `paid` if balance ≤ 0 else `invoice`). | `{origin}/verify/invoice/{verification_token}` "View Official Invoice Online" |
| Receipt | `Payment Receipt {number} — {company}` | Recipient (arg → company_name → company → full_name → name → "Valued Client"); box with receipt #, reference, method (title-case), payment date (`dd Mon YYYY HH:MM`), amount, amount in words; inline stamp `receipt`. | `{origin}/verify/receipt/{verification_code}` |
| Travel voucher | `Travel Voucher {number} — {company}` | Recipient (arg → supplier_name → "Service Provider"); highlighted custom-message block; box with voucher # (+ `Version NN`), status uppercase, lead guest + traveller count, service type, issue date. | `{origin}/verify/voucher/{verification_code}` |
| Payment voucher | `Action Required: Payment Voucher {number} — Sign Digitally` | Recipient (arg → employee name → "Team Member"); box with number, title, category, issue date, accountability due date (if any), disbursement method, authorized amount (+ words); how-to-sign note; reminder to account with fiscal receipts and return unspent balance. | `{origin}/sign/voucher/{signing_token}` "Review & Sign Voucher Digitally" |

Return `404` if the document doesn't exist; `400` if the email provider fails (voucher emails). Invoice/receipt endpoints return `{message: "... dispatched successfully"}`.

---

## 13. Document Stamp (visual authenticity mark)

A generated transparent PNG that imitates a rubber stamp, used on invoice/receipt emails and printable documents.
- Canvas 560×400 (render 2× and downsample), tilted `-2°`.
- Elements: double rounded border (thick outer, thin inner), company logo mark (monochrome), company name (large, letter-spaced), subtitle (legal entity suffix), divider line, **status label** in large tracked caps, `NO. {document_number}`, **date** (`D MON YYYY`, uppercase, no leading zero) in a contrasting **red** ink, two contact lines (phone, postal address) at the bottom.
- Colours: ink blue ≈ `#1F3A93`, red ≈ `#C42828`.
- Status labels: `invoice, receipt, paid, received, void, authorized, approved, voucher` (anything else → uppercased text). Smaller font when label > 8 chars.
- Ink texture: speckle noise seeded deterministically from `status|number|date` (same document → identical stamp), slight blur/bleed, ~92% opacity.
- Email embedding: base64 inline attachment with a stable content-id derived from slug of `status-number`.
- All stamp text (company name, contacts) should come from company settings in the rebuild.
- The UI also renders an equivalent **DocumentStamp** component on screen/print views.

---

## 14. Amount-to-Words Algorithm

`number_to_words(amount, currency_code)`:
- Null/NaN → `"Zero"`.
- Currency unit table (singular, plural, fraction singular, fraction plural): USD → US Dollar(s)/Cent(s); EUR → Euro(s)/Cent(s); GBP → British Pound(s)/Penny/Pence; UGX → Uganda Shilling(s)/Cent(s); KES → Kenya Shilling(s)/Cent(s); unknown → the code itself for both, fraction "Cent(s)".
- `integer = floor(|amount|)`, `decimals = round((|amount| − integer) × 100)`.
- Both zero → `"Zero {plural} Only"`.
- Prefix `"Negative"` if amount < 0. Integer 0 → `"Zero"`.
- Split integer into groups of 3 digits; each group → hundreds text; append scale (`Thousand, Million, Billion`); join high→low.
  - Hundreds text: `"{Ones} Hundred"` + remainder; < 20 uses word list; ≥ 20 → tens word, hyphenated with ones (`Twenty-Five`). No "and" between hundreds and tens.
- Then currency unit (singular only if integer == 1), then, if decimals > 0, `"and {words(decimals)} {Cent|Cents}"`, then `"Only"`.
- Examples: `3500, USD → "Three Thousand Five Hundred US Dollars Only"`; `150.25, EUR → "One Hundred Fifty Euros and Twenty-Five Cents Only"`.
- Known gap: no handling above billions; decimals rounding of 100 (e.g. x.995) is not carried.

---

## 15. Dashboard Stats — `GET /stats`

Computed across all invoices (USD-normalised via rate):
- `total_invoiced_usd`, `total_collected_usd`, `total_outstanding_usd`: sums over **non-cancelled** invoices of `total/rate`, `amount_paid/rate`, `balance_due/rate`.
- `invoices_by_status`: count per status key (always includes draft, issued, partially_paid, paid, overdue, cancelled; unknown statuses added dynamically). Includes cancelled invoices.
- `overdue_invoices_count`: invoices with status ∉ {paid, cancelled} and `due_date < today`.
- `pending_vouchers_count`: travel vouchers with status `pending` or `amended`.
- `recent_receipts` (5 newest), `recent_invoices` (5 newest).

---

## 16. Financial Reports (`/reports`, finance-only)

### 16.1 Shared rules
- All amounts normalised to USD using each document's own rate.
- **Cancelled** documents are always excluded; **draft** invoices are excluded unless `include_drafts=true`.
- Invoices are selected by `invoice_date` within `[start_date, end_date]` (inclusive, both optional).
- **Granularity** (`day|week|month|quarter`): if omitted, auto from span in days: ≤45 → day, ≤140 → week, ≤800 → month, else quarter.
- Period start: day = date; week = Monday; month = 1st; quarter = first day of quarter. Period key/label: day `YYYY-MM-DD` / `DD Mon YYYY`; week `YYYY-Www` (ISO) / `Wk DD Mon YYYY`; month `YYYY-MM` / `Mon YYYY`; quarter `YYYY-Qn` / `Qn YYYY`. Trend series are **gap-filled** (empty periods shown as zeros; guard of 2000 periods).
- Helper definitions: `pct(part, whole) = round(part/whole×100, 1)` or 0 if whole = 0; `change%(cur, prev) = round((cur−prev)/|prev|×100, 1)` or null if prev = 0.
- Humanise label: `_` → space, title-case, empty → "Other".
- **Client name for an invoice**: linked client's display_name → (corporate) `client_details.company_name|company` → `full_name|name|company_name|company` → "Unnamed Client".
- **Destination for an invoice**: `trip_summary.destinations|destination|country` (list → joined with ", "), whitespace-collapsed, title-cased if fully lower/upper; empty → "Unspecified".
- **Invoice description**: package name → first line title (+ " + N more") → "Travel services".
- **Receipt payer**: linked client display name → `received_from.company|company_name|name|full_name` → invoice client name → "Unknown Payer".
- "Top-N labels" helper: sort by amount desc, take N (default 10), output `{label, count, amount_usd, percentage}`.

### 16.2 Sales report — `GET /reports/sales?start_date&end_date&granularity&include_drafts`
Per invoice (USD): gross = `subtotal/rate`; discount = `(discount_amount+promotional_discount)/rate`; net = `total/rate`; paid; balance.
Output: `start_date, end_date, granularity, include_drafts, total_gross_usd, total_discount_usd, total_invoiced_usd (net), total_collected_usd, total_outstanding_usd, collection_rate_percent = paid/net, invoices_count, average_order_value_usd = net/count, comparison, period_breakdown[], destination_breakdown[], consultant_breakdown[], status_breakdown[]`.
- Period item: `period, period_label, period_start, invoices_count, gross_revenue_usd, discount_usd, net_revenue_usd, collected_usd, outstanding_usd`.
- Destination item: `destination, bookings_count, total_sales_usd, percentage_of_total` (sorted by sales desc).
- Consultant item: `consultant_name ("Unassigned / Website" if blank), invoices_count, total_sales_usd, collected_usd, outstanding_usd, percentage_of_total` (sorted desc).
- Status breakdown: humanised status → label list (limit 20).
- **Comparison** (only when both dates given and end ≥ start): previous window of identical length ending the day before `start_date`; returns `previous_start_date, previous_end_date, previous_invoiced_usd, previous_collected_usd, previous_invoices_count, invoiced_change_percent, collected_change_percent, invoices_count_change_percent`.
- Effective trend range when dates missing: first invoice date → max(last invoice date, start); empty set → today.

### 16.3 Receivables aging — `GET /reports/receivables-aging?as_of`
- `as_of = min(as_of or today, today)`; "historical" if `as_of < today`.
- Include invoices with status ∉ {cancelled, draft} and `invoice_date ≤ as_of`.
  - Current: also status ≠ paid and `balance_due > 0.005`; use stored `amount_paid`/`balance_due`.
  - Historical: **reconstruct** paid = Σ receipts not reversed with `receipt_date ≤ as_of` (if receipt currency ≠ invoice currency: `amount / receipt_rate × invoice_rate`); `balance = max(0, total − credit_applied − paid)`.
- Skip if balance ≤ 0.005. `days = (as_of − due_date).days`; `balance_usd = balance / rate`.
- **Buckets** by days overdue: `≤0` current; `1–30`; `31–60`; `61–90`; `>90`. Labels (receivables): Current, 1–30 Days, 31–60 Days, 61–90 Days, 90+ Days.
- Output: `as_of_date, total_receivable_usd, total_overdue_usd (days>0), overdue_percent, documents_count, weighted_avg_days_overdue (Σ balance×days / Σ overdue balance, 1dp), buckets[{key, bucket_label, count, total_amount_usd, percentage}], by_party[], overdue_invoices[]`.
- `by_party` (per client; key = client id or lowercased name): `party_id, party_name, documents_count, current_usd, d1_30_usd, d31_60_usd, d61_90_usd, d90_plus_usd, total_usd, oldest_days_overdue`; sorted by total desc.
- Invoice detail: `invoice_id, invoice_number, client_id, client_name, invoice_date, due_date, days_overdue (≥0), bucket, currency, total_amount, amount_paid, balance_due, balance_due_usd, status`; sorted by days overdue desc then balance_usd desc.

### 16.4 Payables aging — `GET /reports/payables-aging?as_of`
Mirror of 16.3 over supplier bills (status ≠ cancelled, `bill_date ≤ as_of`; current also status ≠ paid and balance_payable > 0.005; historical reconstructs paid from payments dated ≤ as_of with the same currency-conversion rule). Bucket labels: Not Yet Due, 1–30 Days Overdue, 31–60 Days Overdue, 61–90 Days Overdue, 90+ Days Overdue.
Extra outputs: `due_next_7_days_usd` (balance_usd where `−7 ≤ days ≤ 0`), `due_next_30_days_usd` (`−30 ≤ days ≤ 0`), `pending_bills[]` (`bill_id, bill_number, supplier_id, supplier_name, bill_date, due_date, days_overdue, bucket, currency, amount_billed, amount_paid, balance_payable, balance_payable_usd, status`), sorted by days overdue desc then due date asc. `by_party` is per supplier.

### 16.5 Profitability — `GET /reports/profitability?start_date&end_date&include_drafts`
Per invoice: `revenue_usd = total/rate`; `cost_usd` and `cost_source` resolved in priority order (single bills query, no N+1):
1. **`bills`** — Σ non-cancelled linked supplier bills `amount_billed / bill_rate`.
2. **`supplier_expenses`** — Σ across line items; items with `metadata.supplier_expenses` use `(net_price ?? amount) × (quantity ?? qty)/inv_rate`; items without use `cost_price × quantity / inv_rate` (source still labelled `supplier_expenses` if any item had breakdowns).
3. **`line_items`** — only `cost_price × quantity / rate`.
4. **`none`** — total cost ≤ 0.
`profit = revenue − cost`; margin = profit/revenue.
Output: `total_revenue_usd, total_cost_usd, total_gross_profit_usd, average_margin_percent, invoices_count, loss_making_count (profit<0), missing_cost_count (source none), by_destination[], by_consultant[]` (group: `label, invoices_count, revenue_usd, cost_usd, gross_profit_usd, gross_margin_percent`, sorted by profit desc), `items[]` (`booking_id, invoice_id, invoice_number, invoice_date, client_name, consultant_name, service_description, destination, cost_source, revenue_usd, cost_usd, gross_profit_usd, gross_margin_percent`, newest first).

### 16.6 Cash flow — `GET /reports/cash-flow?start_date&end_date&granularity`
- Defaults: `end = today`, `start = end − 29 days`; swap if start > end.
- Inflows: receipts with `receipt_date` in range and not reversed. Outflows: supplier payments with `payment_date` in range. Each converted by its own rate.
- Output: `total_inflow_usd, total_outflow_usd, net_cash_flow_usd, receipts_count, payments_count, inflows_by_method{} , outflows_by_method{}` (humanised method → USD, sorted desc), `inflows_by_client[]`, `outflows_by_supplier[]` (top-N labels), `daily_timeline[]` (despite the name, bucketed by granularity): `date, period, period_label, inflow_usd, outflow_usd, net_usd, cumulative_net_usd (running sum), receipts_count, payments_count`.

### 16.7 Executive summary — `GET /reports/executive-summary?start_date&end_date&granularity&include_drafts`
- Defaults: `end = today`, `start = Jan 1 of end's year` (year-to-date); swap if reversed; if granularity resolves to `day` and span > 31 days → `week`.
- Composes: sales, profitability, cash flow over the range; receivables & payables aging as of `min(end, today)`.
- Output: `start_date, end_date, as_of_date, granularity, invoiced_usd, invoices_count, average_order_value_usd, invoiced_change_percent, gross_profit_usd, gross_margin_percent, cash_in_usd, cash_out_usd, net_cash_usd, receivables_usd, receivables_overdue_usd, payables_usd, payables_overdue_usd, net_working_position_usd (= receivables − payables), trend (sales periods), cash_trend, top_destinations (6), top_consultants (6), top_debtors (6), receivable_buckets, payable_buckets`.

---

## 17. User Interface Specification

Navigation group **Finance** (roles: admin, finance):
Finance Overview · Invoices · E-Receipts · Clients (Receivables) · Suppliers Directory · Supplier Bills (Payables) · Travel Vouchers · Staff Registry · Financial Reports · Finance Settings.

### 17.1 Admin routes
| Path | Screen |
|---|---|
| `/finance` | **Overview**: KPI cards (invoiced, collected, outstanding, overdue count, pending vouchers), status distribution, recent invoices & receipts, quick actions. |
| `/finance/invoices` | List with status filter, currency filter, search, pagination; create button. |
| `/finance/invoices/new`, `/:id/edit` | **Invoice editor** (below). |
| `/finance/invoices/:id` | **Invoice detail**: printable document view, status badge, receipts list, record-payment action, send-email modal, cancel/delete, profitability panel (staff only), linked supplier bills, link to create bill. |
| `/finance/receipts`, `/:id` | Receipt list; receipt detail with printable document + QR/verification + email. |
| `/finance/vouchers`, `/new`, `/:id`, `/:id/edit` | Travel-voucher list (type/status/search), editor, detail/printable view, email. List also hosts **payment vouchers** (create modal; status filters; staff filter). |
| `/finance/payment-vouchers/:id` | Payment-voucher detail: document view, signature status & audit trail (IP, UA, timestamp), status actions (disburse, reconcile with actual spent/refund), send signing email, copy signing link. |
| `/finance/staff` | Staff registry CRUD. |
| `/finance/clients`, `/:id` | Client list (search, type, active filter, balance columns); client editor modal; client detail with invoices, receipts, statement (date range, printable/exportable). |
| `/finance/suppliers`, `/:id` | Supplier list (category/active/search; billed/paid/payable columns); editor modal (bank & mobile-money repeaters); detail with bills, payments, ledger statement. |
| `/finance/bills` | Supplier bills list (status/supplier/search); bill modal (create/edit, link to invoice/booking, attachment URL); **payment modal** (amount, method, reference, from-account, date). |
| `/finance/reports` | Reports hub with tabs: Executive Summary, Sales, Receivables, Payables, Profitability, Cash Flow. |
| `/finance/settings` | Company settings, banks, mobile money, notes/terms templates, category managers, currencies. |

### 17.2 Invoice editor behaviour
- Auto-fetches next invoice number (read-only, "auto-generated on save"); client mode toggle **Individual / Corporate**; client search picker that auto-fills client fields (and TIN/VAT from client `tin_number` or `vat_number`); creating/linking `client_id`.
- Sections: invoice meta (dates, due date, currency & rate, payment terms, quote #, consultant), client details, trip summary (destinations, dates, pax, accommodation category, meal plan, transport), **line items**, adjustments, notes & terms.
- Line item: category (from configured list), title, description, travel date, qty, unit price, discount, tax, total; plus an expandable **supplier-cost breakdown** (rows: supplier, narration, net price, **markup**, quantity, tax, total). Row logic: `total = (net + markup) × qty + tax`; editing `total` back-solves `markup = max(0,(total − tax)/qty − net)`; show markup % = `markup/net×100`. Line item `unit_price`/`cost_price` derive from these rows; show total markup (margin).
- Client-side totals: `subtotal = Σ(total_amount || qty×unit_price)`; `items_discount = Σ discount`; `taxable = max(0, subtotal − items_discount − promotional_discount)`; `total = taxable + vat + other_taxes + service_fee + booking_fee` (payment-processing fee is a backend field not exposed in the UI); `balance = max(0, total − credit_applied)`.
- Validation: name or company required; at least one line item with a title.
- Save as **Draft** or **Issue** (status override).

### 17.3 Printable documents (Invoice, Receipt, Travel Voucher, Payment Voucher, Statements)
Shared **document header** (company logo, legal name, address, contacts, TIN/registration), **document stamp**, QR code linking to the verification URL, amount-in-words (receipts/payment vouchers), payment methods block (from snapshot), notes & terms, print stylesheet (A4, hides app chrome), PDF/print action.
Reports support **PDF export** (header/footer, KPI strip, sections per report) and **CSV export** with date presets (e.g. this month, last month, quarter, YTD, last 12 months).

### 17.4 Reports UI
Filter bar (date presets + custom range, granularity, include-drafts toggle, as-of date for aging); KPI cards; SVG charts (trend bars/lines, cash flow with cumulative line, donut/bars for breakdowns); sortable data tables; party-matrix table for aging (rows = party, columns = buckets); drill-through links to invoice/bill/client/supplier.

---

## 18. API Summary

Base prefixes: `/finance`, `/clients`, `/suppliers`, `/reports`.

```
FINANCE
GET/POST            /finance/currencies            PUT/DELETE /finance/currencies/{id}
GET/PUT             /finance/settings
GET                 /finance/stats
GET                 /finance/invoices/next-number
GET/POST            /finance/invoices              POST /finance/invoices/from-booking
GET/PUT/DELETE      /finance/invoices/{id}         POST /finance/invoices/{id}/cancel
GET                 /finance/invoices/{id}/profitability
GET (public)        /finance/invoices/by-token/{token}
POST                /finance/invoices/{id}/send-email
GET/POST            /finance/receipts              GET /finance/receipts/{id}
POST                /finance/receipts/{id}/send-email
GET/POST            /finance/vouchers              POST /finance/vouchers/from-booking
GET/PUT             /finance/vouchers/{id}         POST /finance/vouchers/{id}/send-email
GET/POST            /finance/payment-vouchers      GET/PUT /finance/payment-vouchers/{id}
POST                /finance/payment-vouchers/{id}/send-email
GET/POST (public)   /finance/payment-vouchers/sign/{token}
GET/POST            /finance/staff                 DELETE /finance/staff/{member_id}
GET (public)        /finance/verify/voucher/{code}
GET (public)        /finance/verify/receipt/{code}
GET (public)        /finance/verify/payment-voucher/{code}

CLIENTS
GET/POST /clients     GET/PUT/DELETE /clients/{id}     GET /clients/{id}/statement

SUPPLIERS
GET/POST /suppliers   GET/PUT/DELETE /suppliers/{id}   GET /suppliers/{id}/ledger
GET /suppliers/next-bill-number   GET /suppliers/next-payment-number
GET/POST /suppliers/bills   GET/PUT /suppliers/bills/{id}
POST /suppliers/payments

REPORTS
GET /reports/executive-summary | sales | receivables-aging | payables-aging | profitability | cash-flow
```
> Routing note: fixed paths (`next-number`, `by-token`, `bills`, `payments`, `next-*`) must be matched **before** `{id}` wildcard routes.

---

## 19. Business-Rule Cheat Sheet

1. Invoice total = (subtotal − discounts) + VAT + other taxes + service fee + booking fee + processing fee. Balance = total − paid − credit applied (min 0).
2. Recording a receipt raises `amount_paid`, recomputes balance, sets status `paid` (balance ≤ 0.01) else `partially_paid`.
3. "Overdue" is computed from dates, not stored automatically (invoices); for supplier bills the status can become `overdue` on update only.
4. Supplier payment raises bill `amount_paid`, status `paid` (balance 0) else `partially_paid`.
5. Clients/suppliers with history are soft-deleted (deactivated); otherwise removed.
6. Only one base currency; base currency can't be deleted; all aggregates in USD.
7. Documents snapshot client/employee/payment-method/terms data at creation.
8. Every public-facing document has an unguessable verification code; payment vouchers additionally have a one-time-style signing token that captures signature, IP, user agent, timestamp.
9. Cancelled documents never count in financial reports; reversed receipts never count in cash flow, aging, statements, or verification validity.
10. Profit uses linked supplier bills first; falls back to estimated costs on invoice lines.

---

## 20. Known Defects / Improvement Opportunities (decide during rebuild)

- Sequence numbering is race-prone → use atomic sequences per document type & year.
- Receipt reversal doesn't reverse invoice balances; no receipt edit/delete or credit-note concept.
- No overpayment guard for receipts or supplier payments.
- Supplier ledger sums mixed currencies without conversion; client statement mixes native and USD columns.
- Bill update status recompute can override an explicit `cancelled`.
- Invoice create vs update compute `subtotal` differently (qty×price vs Σ line totals) — unify.
- `overdue` status never auto-applied (consider a scheduled job).
- Payment vouchers can be re-signed; no lock after signature; no `rejected` state setter even though verification honours it.
- Category lists for payment vouchers differ between UI and backend default.
- Floats used for money — use fixed-point/decimal types in the rebuild.
- Email links default to a hard-coded origin → make configurable.
- Public settings and currency endpoints expose company banking details without auth (intentional for the website, but review).
