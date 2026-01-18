// Database Entity Types

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash?: string;
  role?: string;
  tenant_id?: number;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  booking_type: string;
  service_type?: string;
  status: string;
  total_amount: number;
  currency: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  rooms?: number;
  details?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: number;
  booking_id?: number;
  user_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  provider_transaction_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TravelApproval {
  id: number;
  user_id: number;
  tenant_id: number;
  status: 'pending' | 'approved' | 'rejected';
  travel_reason?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  estimated_cost?: number;
  currency?: string;
  approver_id?: number;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: number;
  user_id: number;
  tenant_id?: number;
  booking_id?: number;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  due_date?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Quote {
  id: number;
  user_id: number;
  tenant_id?: number;
  quote_number?: string;
  client_name: string;
  client_email?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  valid_until?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  display_order?: number;
}

export interface Itinerary {
  id: number;
  user_id: number;
  tenant_id?: number;
  title: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  activities?: ItineraryActivity[];
  share_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryActivity {
  day: number;
  time?: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  cost?: number;
  currency?: string;
}

export interface Commission {
  id: number;
  tenant_id?: number;
  booking_id?: number;
  agent_id?: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  tenant_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface AccountsReceivable {
  id: number;
  tenant_id?: number;
  invoice_id?: number;
  client_name: string;
  amount: number;
  currency: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountsPayable {
  id: number;
  tenant_id?: number;
  vendor_name: string;
  amount: number;
  currency: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CostCenter {
  id: number;
  tenant_id: number;
  name: string;
  code?: string;
  description?: string;
  budget?: number;
  currency?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  tenant_id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  cost_center_id?: number;
  manager_id?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TravelPolicy {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  max_flight_cost?: number;
  max_hotel_cost?: number;
  requires_approval_above?: number;
  currency?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Generic database query result
export interface DbRow {
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}
