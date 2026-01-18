// ============================================
// TIPOS PRINCIPALES - AS OPERADORA
// ============================================

// --------------------------------------------
// USUARIOS
// --------------------------------------------

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  avatar_url?: string
  preferred_language?: string
  preferred_currency?: string
  member_since: Date
  member_points: number
  email_verified: boolean
  phone_verified: boolean
  is_active: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface UserRegistration {
  name: string
  email: string
  password: string
  phone?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user: Omit<User, 'password_hash'>
  token: string
}

// --------------------------------------------
// MULTI-TENANCY
// --------------------------------------------

export type TenantType = 'individual' | 'corporate' | 'agency'

export interface Tenant {
  id: number
  tenant_type: TenantType
  company_name: string
  legal_name?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  custom_domain?: string
  is_active: boolean
  subscription_plan?: string
  subscription_expires_at?: Date
  created_at: Date
  updated_at: Date
}

export interface TenantUser {
  id: number
  user_id: number
  tenant_id: number
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'agent' | 'client'
  department?: string
  cost_center?: string
  is_active: boolean
  created_at: Date
}

// --------------------------------------------
// MULTI-MONEDA
// --------------------------------------------

export interface Currency {
  code: string
  name: string
  symbol: string
  decimal_places: number
  is_active: boolean
}

export interface ExchangeRate {
  id: number
  base_currency: string
  target_currency: string
  rate: number
  date: Date
  source: string
  created_at: Date
}

export interface MoneyAmount {
  amount: number
  currency: string
}

export interface ConvertedAmount {
  original: MoneyAmount
  converted: MoneyAmount
  rate: number
  date: Date
}

// --------------------------------------------
// HOTELES
// --------------------------------------------

export interface Hotel {
  id: number
  provider_id?: number
  provider_hotel_id?: string
  name: string
  description?: string
  location: string
  city: string
  state?: string
  country: string
  address?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  star_rating?: number
  price_per_night: number
  currency: string
  rating: number
  total_reviews: number
  image_url?: string
  images?: string[]
  amenities?: Record<string, boolean>
  check_in_time?: string
  check_out_time?: string
  cancellation_policy?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface RoomType {
  id: number
  hotel_id: number
  room_name: string
  description?: string
  max_occupancy: number
  bed_type?: string
  size_sqm?: number
  amenities?: Record<string, boolean>
  images?: string[]
  base_price: number
  currency: string
}

export interface HotelSearchParams {
  city?: string
  destination?: string
  check_in: string
  check_out: string
  adults: number
  children?: number
  rooms?: number
  min_price?: number
  max_price?: number
  min_rating?: number
  amenities?: string[]
}

// --------------------------------------------
// VUELOS
// --------------------------------------------

export interface FlightSearchParams {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children?: number
  infants?: number
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first'
}

export interface FlightOffer {
  id: number
  offer_id: string
  provider: string
  origin_code: string
  destination_code: string
  departure_datetime: Date
  arrival_datetime: Date
  return_departure_datetime?: Date
  return_arrival_datetime?: Date
  airline_code: string
  flight_number?: string
  cabin_class?: string
  price: number
  currency: string
  available_seats?: number
  stops: number
  duration_minutes?: number
  raw_data?: any
  expires_at: Date
}

// --------------------------------------------
// RESERVAS
// --------------------------------------------

export type BookingType = 'hotel' | 'flight' | 'attraction' | 'package' | 'transport'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Booking {
  id: number
  user_id: number
  tenant_id?: number
  booking_type: BookingType
  booking_reference: string
  booking_status: BookingStatus
  payment_status: PaymentStatus
  currency: string
  exchange_rate: number
  original_price: number
  subtotal: number
  tax: number
  service_fee: number
  total_price: number
  lead_traveler_name?: string
  lead_traveler_email?: string
  lead_traveler_phone?: string
  destination?: string
  check_in?: Date
  check_out?: Date
  adults?: number
  children?: number
  special_requests?: string
  internal_notes?: string
  booked_at: Date
  confirmed_at?: Date
  cancelled_at?: Date
  cancellation_reason?: string
  created_at: Date
  updated_at: Date
}

export interface FlightBooking {
  id: number
  booking_id: number
  offer_id?: string
  provider: string
  pnr?: string
  airline_code?: string
  flight_number?: string
  origin_code: string
  destination_code: string
  departure_datetime: Date
  arrival_datetime: Date
  return_departure_datetime?: Date
  return_arrival_datetime?: Date
  cabin_class?: string
  passenger_name: string
  seat_number?: string
  ticket_number?: string
  eticket_url?: string
  booking_reference?: string
}

export interface HotelBooking {
  id: number
  booking_id: number
  hotel_id: number
  room_type_id?: number
  provider?: string
  provider_confirmation?: string
  number_of_rooms: number
  meal_plan?: string
  voucher_url?: string
}

// --------------------------------------------
// DOCUMENTOS DE VIAJEROS
// --------------------------------------------

export interface Traveler {
  id: number
  user_id: number
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth: Date
  gender?: string
  nationality?: string
  is_primary: boolean
  created_at: Date
  updated_at: Date
}

export interface Passport {
  id: number
  traveler_id: number
  passport_number_encrypted: string
  country_of_issue: string
  issue_date?: Date
  expiry_date: Date
  full_name?: string
  file_url_encrypted?: string
  verified: boolean
  created_at: Date
}

// --------------------------------------------
// NOTIFICACIONES
// --------------------------------------------

export interface NotificationPreferences {
  id: number
  user_id: number
  booking_confirmation_email: boolean
  booking_confirmation_sms: boolean
  booking_confirmation_whatsapp: boolean
  marketing_email: boolean
  marketing_sms: boolean
  marketing_whatsapp: boolean
  flight_changes_email: boolean
  flight_changes_sms: boolean
  flight_changes_whatsapp: boolean
  price_alerts_email: boolean
  preferred_channel: 'email' | 'sms' | 'whatsapp'
  phone_verified: boolean
  whatsapp_verified: boolean
}

export interface NotificationSent {
  id: number
  user_id: number
  booking_id?: number
  notification_type: string
  channel: 'email' | 'sms' | 'whatsapp'
  recipient: string
  subject?: string
  message?: string
  status: 'sent' | 'delivered' | 'failed' | 'opened'
  error_message?: string
  sent_at: Date
  delivered_at?: Date
  opened_at?: Date
}

// --------------------------------------------
// COMISIONES
// --------------------------------------------

export interface AgencyCommission {
  id: number
  agency_id: number
  booking_id: number
  base_price: number
  currency: string
  commission_rate: number
  commission_amount: number
  withholding_amount: number
  net_commission: number
  status: 'pending' | 'approved' | 'paid'
  paid_at?: Date
  created_at: Date
}

export interface AgencyCommissionConfig {
  id: number
  agency_id: number
  commission_type: 'fixed' | 'tiered' | 'by_service'
  default_rate?: number
  payment_frequency: 'weekly' | 'biweekly' | 'monthly'
  payment_method: 'transfer' | 'check'
  minimum_payout: number
  withholding_tax: boolean
  withholding_percentage?: number
  is_active: boolean
}

// --------------------------------------------
// FACTURACIÓN
// --------------------------------------------

export interface Invoice {
  id: number
  invoice_type: 'income' | 'expense' | 'payment'
  tenant_id?: number
  booking_id?: number
  customer_user_id?: number
  customer_rfc: string
  customer_legal_name: string
  customer_tax_regime?: string
  customer_postal_code?: string
  customer_email?: string
  series?: string
  folio?: number
  invoice_number?: string
  currency: string
  exchange_rate: number
  subtotal: number
  tax: number
  total: number
  payment_method?: string
  payment_form?: string
  cfdi_use?: string
  uuid?: string
  xml_url?: string
  pdf_url?: string
  status: 'draft' | 'stamped' | 'cancelled'
  stamped_at?: Date
  cancelled_at?: Date
  created_at: Date
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  product_code?: string
  unit?: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  subtotal: number
  tax: number
  total: number
}

// --------------------------------------------
// CRM
// --------------------------------------------

export interface CRMContact {
  id: number
  contact_type: 'lead' | 'client' | 'agency' | 'corporate'
  tenant_id?: number
  user_id?: number
  assigned_to?: number
  full_name?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  status: 'active' | 'inactive' | 'churned'
  source?: string
  ltv?: number
  first_contact_date?: Date
  last_contact_date?: Date
  next_followup_date?: Date
  created_at: Date
  updated_at: Date
}

export interface CRMInteraction {
  id: number
  contact_id: number
  interaction_type: 'call' | 'email' | 'meeting' | 'whatsapp'
  subject?: string
  notes?: string
  outcome?: 'positive' | 'negative' | 'neutral' | 'closed_deal'
  performed_by: number
  created_at: Date
}

export interface CRMTask {
  id: number
  contact_id?: number
  assigned_to: number
  task_type?: 'call' | 'email' | 'followup' | 'meeting'
  description?: string
  due_date?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed' | 'cancelled'
  completed_at?: Date
  created_at: Date
}

// --------------------------------------------
// RESPUESTAS DE API
// --------------------------------------------

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// --------------------------------------------
// FILTROS Y BÚSQUEDAS
// --------------------------------------------

export interface SearchFilters {
  query?: string
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

export interface DateRangeFilter {
  start_date?: string
  end_date?: string
}

// --------------------------------------------
// CONTEXTOS
// --------------------------------------------

export interface TenantContext {
  tenant?: Tenant
  role?: string
  permissions?: string[]
}

export interface UserContext {
  user?: User
  tenants?: Tenant[]
  currentTenant?: TenantContext
}
