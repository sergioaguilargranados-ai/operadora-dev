-- ============================================
-- AS OPERADORA DE VIAJES Y EVENTOS
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- PostgreSQL 14+
-- ============================================

-- ============================================
-- PARTE 1: TABLAS CORE (USUARIOS Y AUTENTICACIÓN)
-- ============================================

-- Usuarios principales
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'es',
    preferred_currency VARCHAR(3) DEFAULT 'MXN',
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_points INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- PARTE 2: MULTI-TENANCY (MULTI-EMPRESA)
-- ============================================

-- Tipos de tenant: 'individual', 'corporate', 'agency'
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_type VARCHAR(20) NOT NULL CHECK (tenant_type IN ('individual', 'corporate', 'agency')),
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50), -- RFC en México
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'México',
    postal_code VARCHAR(20),
    -- Branding (para agencias white-label)
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    custom_domain VARCHAR(100) UNIQUE,
    -- Estado
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50), -- 'free', 'basic', 'pro', 'enterprise'
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_type ON tenants(tenant_type);
CREATE INDEX idx_tenants_active ON tenants(is_active);

-- Relación usuarios-tenants (un usuario puede pertenecer a múltiples tenants)
CREATE TABLE IF NOT EXISTS tenant_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'manager', 'employee', 'agent', 'client'
    department VARCHAR(100),
    cost_center VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);

-- Configuración white-label para agencias
CREATE TABLE IF NOT EXISTS white_label_config (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Branding
    favicon_url TEXT,
    footer_text TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    terms_url TEXT,
    privacy_url TEXT,
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    -- Redes sociales
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Políticas de viaje corporativas
CREATE TABLE IF NOT EXISTS travel_policies (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_name VARCHAR(255),
    max_flight_class VARCHAR(20), -- 'economy', 'premium_economy', 'business', 'first'
    max_hotel_price_per_night DECIMAL(10,2),
    max_car_rental_daily DECIMAL(10,2),
    min_advance_booking_days INTEGER,
    requires_approval BOOLEAN DEFAULT true,
    approval_amount_threshold DECIMAL(10,2), -- Aprobar si supera este monto
    allowed_destinations JSONB, -- Array de ciudades/países permitidos
    restricted_destinations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aprobaciones de viajes corporativos
CREATE TABLE IF NOT EXISTS travel_approvals (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER, -- Referencia a bookings (se creará después)
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    requested_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    estimated_cost DECIMAL(10,2),
    reason_for_travel TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_travel_approvals_status ON travel_approvals(status);
CREATE INDEX idx_travel_approvals_tenant ON travel_approvals(tenant_id);

-- ============================================
-- PARTE 3: MULTI-MONEDA
-- ============================================

-- Monedas soportadas
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de monedas
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('MXN', 'Peso Mexicano', '$', 2),
('USD', 'Dólar Estadounidense', 'US$', 2),
('EUR', 'Euro', '€', 2),
('CAD', 'Dólar Canadiense', 'C$', 2),
('GBP', 'Libra Esterlina', '£', 2),
('JPY', 'Yen Japonés', '¥', 0)
ON CONFLICT (code) DO NOTHING;

-- Tipos de cambio
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(3) DEFAULT 'MXN' REFERENCES currencies(code),
    target_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    rate DECIMAL(12, 6) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50), -- 'exchangerate-api.com', 'manual', etc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency, date)
);

CREATE INDEX idx_exchange_rates_date ON exchange_rates(date DESC);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);

-- ============================================
-- PARTE 4: PROVEEDORES DE APIS
-- ============================================

-- Proveedores de vuelos
CREATE TABLE IF NOT EXISTS flight_providers (
    id SERIAL PRIMARY KEY,
    provider_type VARCHAR(50) NOT NULL, -- 'gds', 'aggregator', 'airline'
    provider_name VARCHAR(100) NOT NULL, -- 'amadeus', 'kiwi', 'sabre'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Orden de búsqueda
    rate_limit_per_second INTEGER,
    rate_limit_per_day INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aerolíneas
CREATE TABLE IF NOT EXISTS airlines (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(2) UNIQUE NOT NULL,
    icao_code VARCHAR(3) UNIQUE,
    airline_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aeropuertos
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE,
    airport_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(11, 7),
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_airports_city ON airports(city);
CREATE INDEX idx_airports_country ON airports(country);

-- Proveedores de hoteles
CREATE TABLE IF NOT EXISTS hotel_providers (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL, -- 'booking', 'expedia', 'hotelbeds'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    commission_model VARCHAR(20), -- 'percentage', 'net_rate'
    default_commission DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores de atracciones/tours
CREATE TABLE IF NOT EXISTS attraction_providers (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL, -- 'getyourguide', 'viator'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    commission_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores de transporte
CREATE TABLE IF NOT EXISTS transport_providers (
    id SERIAL PRIMARY KEY,
    provider_type VARCHAR(50) NOT NULL, -- 'taxi', 'transfer', 'car_rental'
    provider_name VARCHAR(100) NOT NULL, -- 'mozio', 'uber'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTE 5: HOTELES
-- ============================================

CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES hotel_providers(id),
    provider_hotel_id VARCHAR(100), -- ID en el sistema del proveedor
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'México',
    address TEXT,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(11, 7),
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    price_per_night DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN' REFERENCES currencies(code),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    image_url TEXT,
    images JSONB, -- Array de URLs de imágenes
    amenities JSONB, -- {"wifi": true, "pool": true, etc}
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '12:00',
    cancellation_policy TEXT,
    is_active BOOLEAN DEFAULT true,
    provider_url TEXT,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_price ON hotels(price_per_night);
CREATE INDEX idx_hotels_rating ON hotels(rating);
CREATE INDEX idx_hotels_provider ON hotels(provider_id);

-- Mapping de hoteles multi-proveedor (mismo hotel en diferentes proveedores)
CREATE TABLE IF NOT EXISTS hotel_provider_mapping (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES hotel_providers(id),
    provider_hotel_id VARCHAR(100) NOT NULL,
    provider_hotel_name VARCHAR(255),
    last_price_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(hotel_id, provider_id)
);

-- Tipos de habitación
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES hotel_providers(id),
    room_type_code VARCHAR(50),
    room_name VARCHAR(255) NOT NULL,
    description TEXT,
    max_occupancy INTEGER NOT NULL,
    bed_type VARCHAR(50), -- 'single', 'double', 'queen', 'king', 'twin'
    size_sqm DECIMAL(5,2),
    amenities JSONB,
    images JSONB,
    base_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'MXN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache de disponibilidad y precios de hoteles
CREATE TABLE IF NOT EXISTS hotel_availability_cache (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES hotel_providers(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_type_id INTEGER REFERENCES room_types(id),
    available_rooms INTEGER,
    price_per_night DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    meal_plan VARCHAR(50), -- 'room_only', 'breakfast', 'half_board', 'full_board', 'all_inclusive'
    cancellation_policy JSONB,
    raw_data JSONB, -- Datos completos del proveedor
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_hotel_avail_dates (hotel_id, check_in, check_out),
    INDEX idx_hotel_avail_expires (expires_at)
);

-- ============================================
-- PARTE 6: VUELOS
-- ============================================

-- Cache de búsquedas de vuelos
CREATE TABLE IF NOT EXISTS flight_search_cache (
    id SERIAL PRIMARY KEY,
    search_hash VARCHAR(64) UNIQUE NOT NULL, -- MD5 de parámetros
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    adults INTEGER NOT NULL,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    cabin_class VARCHAR(20), -- 'economy', 'premium_economy', 'business', 'first'
    results JSONB NOT NULL, -- Resultados completos
    provider VARCHAR(50) NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_flight_search_hash (search_hash),
    INDEX idx_flight_search_expires (expires_at)
);

-- Ofertas de vuelos normalizadas
CREATE TABLE IF NOT EXISTS flight_offers (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(100) UNIQUE NOT NULL, -- ID del proveedor
    provider VARCHAR(50) NOT NULL,
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP NOT NULL,
    return_departure_datetime TIMESTAMP,
    return_arrival_datetime TIMESTAMP,
    airline_code VARCHAR(2) NOT NULL,
    flight_number VARCHAR(10),
    cabin_class VARCHAR(20),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    available_seats INTEGER,
    stops INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    raw_data JSONB, -- Datos completos del proveedor
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_flight_offers_route (origin_code, destination_code),
    INDEX idx_flight_offers_expires (expires_at)
);

-- ============================================
-- PARTE 7: ATRACCIONES Y TOURS
-- ============================================

-- Categorías de atracciones
CREATE TABLE IF NOT EXISTS attraction_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER REFERENCES attraction_categories(id),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO attraction_categories (category_name) VALUES
('Parques Temáticos'),
('Museos'),
('Tours'),
('Actividades de Aventura'),
('Espectáculos'),
('Deportes')
ON CONFLICT DO NOTHING;

-- Atracciones
CREATE TABLE IF NOT EXISTS attractions (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES attraction_providers(id),
    provider_attraction_id VARCHAR(100),
    attraction_name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES attraction_categories(id),
    destination VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    min_age INTEGER,
    max_group_size INTEGER,
    includes JSONB,
    excludes JSONB,
    images JSONB,
    rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    base_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'MXN',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Precios de atracciones (diferentes tipos de ticket)
CREATE TABLE IF NOT EXISTS attraction_pricing (
    id SERIAL PRIMARY KEY,
    attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    ticket_type VARCHAR(50) NOT NULL, -- 'adult', 'child', 'senior', 'family', 'group'
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disponibilidad de atracciones
CREATE TABLE IF NOT EXISTS attraction_availability (
    id SERIAL PRIMARY KEY,
    attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TIME,
    available_spots INTEGER NOT NULL,
    booked_spots INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'limited', 'sold_out'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attraction_avail_date (attraction_id, date)
);

-- ============================================
-- PARTE 8: RESERVAS (BOOKINGS)
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    -- Relaciones
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES tenants(id), -- NULL si es usuario individual
    -- Tipo de reserva
    booking_type VARCHAR(50) NOT NULL, -- 'hotel', 'flight', 'attraction', 'package', 'transport'
    -- Detalles generales
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- Código de confirmación
    booking_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
    -- Moneda y precios
    currency VARCHAR(3) DEFAULT 'MXN' REFERENCES currencies(code),
    exchange_rate DECIMAL(12,6) DEFAULT 1.0, -- Tipo de cambio usado
    original_price DECIMAL(10, 2) NOT NULL, -- Precio en moneda original
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    -- Datos del viajero principal
    lead_traveler_name VARCHAR(255),
    lead_traveler_email VARCHAR(255),
    lead_traveler_phone VARCHAR(50),
    -- Viaje
    destination VARCHAR(255),
    check_in DATE,
    check_out DATE,
    adults INTEGER,
    children INTEGER DEFAULT 0,
    -- Solicitudes especiales
    special_requests TEXT,
    internal_notes TEXT, -- Solo para admin
    -- Fechas
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

-- Reservas de vuelos (detalles específicos)
CREATE TABLE IF NOT EXISTS flight_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    offer_id VARCHAR(100), -- ID de flight_offers
    provider VARCHAR(50) NOT NULL,
    pnr VARCHAR(10), -- Passenger Name Record
    airline_code VARCHAR(2),
    flight_number VARCHAR(10),
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP NOT NULL,
    -- Retorno (si aplica)
    return_departure_datetime TIMESTAMP,
    return_arrival_datetime TIMESTAMP,
    cabin_class VARCHAR(20),
    -- Pasajeros
    passenger_name VARCHAR(255) NOT NULL,
    seat_number VARCHAR(10),
    ticket_number VARCHAR(20),
    eticket_url TEXT,
    booking_reference TEXT, -- Confirmación de aerolínea
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservas de hoteles (detalles específicos)
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id),
    room_type_id INTEGER REFERENCES room_types(id),
    provider VARCHAR(50),
    provider_confirmation VARCHAR(100),
    number_of_rooms INTEGER DEFAULT 1,
    meal_plan VARCHAR(50),
    voucher_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservas de atracciones
CREATE TABLE IF NOT EXISTS attraction_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    attraction_id INTEGER NOT NULL REFERENCES attractions(id),
    provider_reference VARCHAR(100),
    booking_date DATE NOT NULL,
    time_slot TIME,
    ticket_type VARCHAR(50),
    quantity INTEGER NOT NULL,
    voucher_url TEXT,
    qr_code TEXT,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTE 9: FAVORITOS
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'hotel', 'flight_route', 'attraction'
    item_id INTEGER NOT NULL, -- ID del hotel, atracción, etc
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================
-- PARTE 10: RESEÑAS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'hotel', 'attraction', etc
    item_id INTEGER NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false, -- Solo si tiene booking
    is_approved BOOLEAN DEFAULT false, -- Moderación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_item ON reviews(item_type, item_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- PARTE 11: DOCUMENTOS DE VIAJEROS
-- ============================================

-- Viajeros (pueden ser el usuario u otras personas)
CREATE TABLE IF NOT EXISTS travelers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    nationality VARCHAR(3), -- ISO country code
    is_primary BOOLEAN DEFAULT false, -- Es el usuario mismo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_travelers_user ON travelers(user_id);

-- Pasaportes (encriptados)
CREATE TABLE IF NOT EXISTS passports (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
    passport_number_encrypted TEXT NOT NULL,
    country_of_issue VARCHAR(3) NOT NULL,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    full_name VARCHAR(255), -- Como aparece en pasaporte
    file_url_encrypted TEXT, -- URL del scan encriptado
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visas
CREATE TABLE IF NOT EXISTS visas (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
    visa_type VARCHAR(50),
    country VARCHAR(3) NOT NULL,
    visa_number_encrypted TEXT,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url_encrypted TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documentos de identificación
CREATE TABLE IF NOT EXISTS identification_documents (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'ine', 'license', 'cedula', etc
    document_number_encrypted TEXT,
    issue_date DATE,
    expiry_date DATE,
    file_url_encrypted TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de acceso a documentos (auditoría)
CREATE TABLE IF NOT EXISTS document_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL,
    document_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'view', 'download', 'upload', 'delete'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_logs_user ON document_access_logs(user_id);
CREATE INDEX idx_doc_logs_date ON document_access_logs(accessed_at);

-- ============================================
-- PARTE 12: NOTIFICACIONES
-- ============================================

-- Preferencias de notificaciones por usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Transaccionales (no se pueden desactivar completamente)
    booking_confirmation_email BOOLEAN DEFAULT true,
    booking_confirmation_sms BOOLEAN DEFAULT false,
    booking_confirmation_whatsapp BOOLEAN DEFAULT false,
    -- Marketing (opt-in)
    marketing_email BOOLEAN DEFAULT false,
    marketing_sms BOOLEAN DEFAULT false,
    marketing_whatsapp BOOLEAN DEFAULT false,
    -- Operacionales
    flight_changes_email BOOLEAN DEFAULT true,
    flight_changes_sms BOOLEAN DEFAULT true,
    flight_changes_whatsapp BOOLEAN DEFAULT false,
    price_alerts_email BOOLEAN DEFAULT false,
    -- Configuración general
    preferred_channel VARCHAR(20) DEFAULT 'email',
    phone_verified BOOLEAN DEFAULT false,
    whatsapp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registro de notificaciones enviadas
CREATE TABLE IF NOT EXISTS notifications_sent (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'flight_change', etc
    channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'whatsapp'
    recipient VARCHAR(255) NOT NULL, -- Email o teléfono
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'opened'
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    provider VARCHAR(50), -- 'sendgrid', 'twilio', etc
    provider_message_id VARCHAR(255)
);

CREATE INDEX idx_notifications_user ON notifications_sent(user_id);
CREATE INDEX idx_notifications_type ON notifications_sent(notification_type);
CREATE INDEX idx_notifications_status ON notifications_sent(status);

-- ============================================
-- PARTE 13: COMISIONES A AGENCIAS
-- ============================================

-- Configuración de comisiones por agencia
CREATE TABLE IF NOT EXISTS agency_commission_config (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    commission_type VARCHAR(20) NOT NULL, -- 'fixed', 'tiered', 'by_service'
    default_rate DECIMAL(5,2), -- Porcentaje default
    payment_frequency VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly'
    payment_method VARCHAR(20) DEFAULT 'transfer', -- 'transfer', 'check'
    minimum_payout DECIMAL(10,2) DEFAULT 0,
    withholding_tax BOOLEAN DEFAULT false,
    withholding_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comisiones escalonadas (si commission_type = 'tiered')
CREATE TABLE IF NOT EXISTS commission_tiers (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL REFERENCES agency_commission_config(id) ON DELETE CASCADE,
    min_bookings INTEGER NOT NULL,
    max_bookings INTEGER,
    commission_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comisiones por tipo de servicio (si commission_type = 'by_service')
CREATE TABLE IF NOT EXISTS commission_by_service (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL REFERENCES agency_commission_config(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- 'flight', 'hotel', 'package', 'attraction'
    commission_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registro de comisiones
CREATE TABLE IF NOT EXISTS agency_commissions (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER NOT NULL REFERENCES tenants(id),
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    withholding_amount DECIMAL(10,2) DEFAULT 0,
    net_commission DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
    payment_batch_id INTEGER, -- Referencia a lote de pago
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_agency ON agency_commissions(agency_id);
CREATE INDEX idx_commissions_status ON agency_commissions(status);

-- Clientes de agencias
CREATE TABLE IF NOT EXISTS agency_clients (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER NOT NULL REFERENCES tenants(id),
    client_user_id INTEGER NOT NULL REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id), -- Agente asignado
    referral_code VARCHAR(50) UNIQUE,
    commission_rate DECIMAL(5,2), -- Override de comisión para este cliente
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, client_user_id)
);

-- ============================================
-- PARTE 14: FACTURACIÓN ELECTRÓNICA (CFDI México)
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    -- Tipo y relaciones
    invoice_type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'payment'
    tenant_id INTEGER REFERENCES tenants(id),
    booking_id INTEGER REFERENCES bookings(id),
    customer_user_id INTEGER REFERENCES users(id),
    -- Datos fiscales del cliente
    customer_rfc VARCHAR(13) NOT NULL,
    customer_legal_name VARCHAR(255) NOT NULL,
    customer_tax_regime VARCHAR(10),
    customer_postal_code VARCHAR(10),
    customer_email VARCHAR(255),
    -- Factura
    series VARCHAR(10),
    folio INTEGER,
    invoice_number VARCHAR(50) UNIQUE, -- Serie + Folio
    currency VARCHAR(3) DEFAULT 'MXN',
    exchange_rate DECIMAL(12,6) DEFAULT 1.0,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(10), -- 'PUE' (pago en una exhibición), 'PPD' (pago en parcialidades)
    payment_form VARCHAR(10), -- '01'=Efectivo, '03'=Transferencia, '04'=Tarjeta
    -- CFDI
    cfdi_use VARCHAR(10), -- 'G03'=Gastos en general, 'P01'=Por definir
    uuid VARCHAR(100) UNIQUE, -- UUID del SAT (timbrado)
    xml_url TEXT,
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'stamped', 'cancelled'
    stamped_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    -- Auditoría
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_uuid ON invoices(uuid);
CREATE INDEX idx_invoices_customer ON invoices(customer_rfc);

-- Conceptos de factura
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_code VARCHAR(20), -- Código SAT de producto/servicio
    unit VARCHAR(10), -- Clave de unidad SAT (E48=Servicio, H87=Pieza)
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 16.00, -- IVA 16%
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL
);

-- Configuración de facturación
CREATE TABLE IF NOT EXISTS tax_configuration (
    id SERIAL PRIMARY KEY,
    -- Certificados (encriptados)
    cer_file TEXT, -- Certificado .cer (base64)
    key_file TEXT, -- Llave privada .key (base64)
    key_password_encrypted TEXT,
    -- Datos fiscales de AS Operadora
    rfc VARCHAR(13) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_regime VARCHAR(10), -- '601'=General de Ley, '612'=Personas Físicas
    postal_code VARCHAR(10),
    -- API de Facturación
    api_provider VARCHAR(50), -- 'facturama', 'sw_sapien', etc
    api_key_encrypted TEXT,
    api_url TEXT,
    -- Estado
    is_active BOOLEAN DEFAULT true,
    cert_expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTE 15: CUENTAS POR COBRAR (CxC)
-- ============================================

CREATE TABLE IF NOT EXISTS accounts_receivable (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    booking_id INTEGER REFERENCES bookings(id),
    customer_user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id), -- Cliente corporativo o agencia
    -- Montos
    currency VARCHAR(3) DEFAULT 'MXN',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    -- Fechas
    due_date DATE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    last_payment_date DATE,
    -- Estado
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue', 'uncollectible'
    days_overdue INTEGER DEFAULT 0,
    -- Cobranza
    last_reminder_sent TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    assigned_collector INTEGER REFERENCES users(id),
    collection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ar_status ON accounts_receivable(status);
CREATE INDEX idx_ar_due_date ON accounts_receivable(due_date);

-- Pagos recibidos (CxC)
CREATE TABLE IF NOT EXISTS ar_payments (
    id SERIAL PRIMARY KEY,
    ar_id INTEGER NOT NULL REFERENCES accounts_receivable(id),
    payment_method VARCHAR(50), -- 'cash', 'transfer', 'card', 'check'
    payment_reference VARCHAR(100), -- Número de transacción/cheque
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    received_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Límites de crédito para corporativos/agencias
CREATE TABLE IF NOT EXISTS credit_limits (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER UNIQUE NOT NULL REFERENCES tenants(id),
    credit_limit DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) DEFAULT 0,
    available_credit DECIMAL(10,2),
    payment_terms_days INTEGER DEFAULT 30, -- Días de crédito
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notas de crédito
CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    original_invoice_id INTEGER REFERENCES invoices(id),
    ar_id INTEGER REFERENCES accounts_receivable(id),
    reason VARCHAR(100), -- 'cancellation', 'discount', 'refund', 'correction'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    uuid VARCHAR(100) UNIQUE, -- UUID del CFDI de egreso
    xml_url TEXT,
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTE 16: CUENTAS POR PAGAR (CxP) Y PROVEEDORES
-- ============================================

-- Proveedores (aerolíneas, hoteles, servicios)
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_type VARCHAR(50) NOT NULL, -- 'airline', 'hotel', 'agency', 'insurance', 'tech', 'service'
    legal_name VARCHAR(255) NOT NULL,
    commercial_name VARCHAR(255),
    tax_id VARCHAR(50), -- RFC, Tax ID, etc
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    -- Datos bancarios (encriptados)
    bank_name VARCHAR(100),
    account_number_encrypted TEXT,
    clabe_encrypted TEXT, -- México
    swift_code VARCHAR(20), -- Internacional
    -- Términos comerciales
    payment_terms INTEGER DEFAULT 30, -- Días de crédito
    credit_limit DECIMAL(12,2),
    commission_rate DECIMAL(5,2), -- Para agencias que nos pagan
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_type ON suppliers(supplier_type);

-- Cuentas por pagar
CREATE TABLE IF NOT EXISTS accounts_payable (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    booking_id INTEGER REFERENCES bookings(id),
    invoice_number VARCHAR(100), -- Factura del proveedor
    invoice_xml_url TEXT,
    invoice_pdf_url TEXT,
    -- Montos
    currency VARCHAR(3) DEFAULT 'MXN',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    -- Fechas
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    last_payment_date DATE,
    -- Estado
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'scheduled', 'partial', 'paid'
    approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    -- Pago
    payment_method VARCHAR(50), -- 'transfer', 'check', 'card'
    payment_reference VARCHAR(100),
    scheduled_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ap_status ON accounts_payable(status);
CREATE INDEX idx_ap_due_date ON accounts_payable(due_date);

-- Pagos realizados (CxP)
CREATE TABLE IF NOT EXISTS ap_payments (
    id SERIAL PRIMARY KEY,
    ap_id INTEGER NOT NULL REFERENCES accounts_payable(id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    payment_date DATE DEFAULT CURRENT_DATE,
    bank_account_id INTEGER, -- Cuenta desde la que se pagó
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lotes de pago (batch payments)
CREATE TABLE IF NOT EXISTS payment_batches (
    id SERIAL PRIMARY KEY,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12,2),
    payment_count INTEGER,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'processing', 'completed'
    scheduled_date DATE,
    processed_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items de lote de pago
CREATE TABLE IF NOT EXISTS batch_payments (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES payment_batches(id) ON DELETE CASCADE,
    ap_id INTEGER NOT NULL REFERENCES accounts_payable(id),
    amount DECIMAL(10,2) NOT NULL
);

-- ============================================
-- PARTE 17: CRM
-- ============================================

-- Contactos CRM
CREATE TABLE IF NOT EXISTS crm_contacts (
    id SERIAL PRIMARY KEY,
    contact_type VARCHAR(20) NOT NULL, -- 'lead', 'client', 'agency', 'corporate'
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id), -- Account manager
    -- Información
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(100),
    -- Estado
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'churned'
    source VARCHAR(50), -- 'web', 'referral', 'marketing', 'cold_call'
    ltv DECIMAL(10,2), -- Lifetime value
    -- Fechas
    first_contact_date DATE,
    last_contact_date DATE,
    next_followup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crm_contacts_type ON crm_contacts(contact_type);
CREATE INDEX idx_crm_contacts_assigned ON crm_contacts(assigned_to);

-- Interacciones CRM
CREATE TABLE IF NOT EXISTS crm_interactions (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'whatsapp'
    subject VARCHAR(255),
    notes TEXT,
    outcome VARCHAR(50), -- 'positive', 'negative', 'neutral', 'closed_deal'
    performed_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tareas CRM
CREATE TABLE IF NOT EXISTS crm_tasks (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    task_type VARCHAR(50), -- 'call', 'email', 'followup', 'meeting'
    description TEXT,
    due_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline de ventas
CREATE TABLE IF NOT EXISTS crm_pipeline (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES crm_contacts(id),
    stage VARCHAR(50) NOT NULL, -- 'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    estimated_value DECIMAL(10,2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    notes TEXT,
    moved_to_stage_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTE 18: WEBHOOKS Y SINCRONIZACIÓN
-- ============================================

-- Suscripciones a webhooks
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'booking_confirmed', 'flight_cancelled', 'price_change'
    webhook_url TEXT NOT NULL,
    secret_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eventos de webhooks recibidos
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES webhook_subscriptions(id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Logs de sincronización con proveedores
CREATE TABLE IF NOT EXISTS provider_sync_log (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL, -- 'search', 'booking', 'status_check', 'inventory_update'
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'timeout'
    error_message TEXT,
    duration_ms INTEGER, -- Tiempo de respuesta en milisegundos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_log_provider ON provider_sync_log(provider);
CREATE INDEX idx_sync_log_created ON provider_sync_log(created_at);

-- Rate limiting de APIs
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    limit_type VARCHAR(20) NOT NULL, -- 'per_second', 'per_minute', 'per_hour', 'per_day'
    max_requests INTEGER NOT NULL,
    current_requests INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP NOT NULL,
    UNIQUE(provider, limit_type, window_start)
);

-- ============================================
-- PARTE 19: BÚSQUEDAS Y OFERTAS
-- ============================================

-- Historial de búsquedas
CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100), -- Para usuarios no autenticados
    search_type VARCHAR(50) NOT NULL, -- 'flight', 'hotel', 'package', 'attraction'
    destination VARCHAR(255),
    origin VARCHAR(255),
    check_in DATE,
    check_out DATE,
    adults INTEGER,
    children INTEGER,
    rooms INTEGER,
    search_params JSONB, -- Parámetros completos de búsqueda
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_searches_user ON searches(user_id);
CREATE INDEX idx_searches_created ON searches(created_at);

-- Ofertas especiales
CREATE TABLE IF NOT EXISTS special_offers (
    id SERIAL PRIMARY KEY,
    offer_type VARCHAR(50) NOT NULL, -- 'flash', 'package', 'seasonal', 'early_bird'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20), -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10,2),
    applicable_to VARCHAR(50), -- 'flight', 'hotel', 'package', 'all'
    min_purchase_amount DECIMAL(10,2),
    -- Validez
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    -- Restricciones
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    destinations JSONB, -- Array de destinos aplicables
    blackout_dates JSONB, -- Fechas no aplicables
    -- Media
    image_url TEXT,
    banner_url TEXT,
    -- Estado
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_valid_dates ON special_offers(valid_from, valid_until);
CREATE INDEX idx_offers_active ON special_offers(is_active);

-- Códigos promocionales
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    -- Validez
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    max_uses INTEGER,
    max_uses_per_user INTEGER,
    current_uses INTEGER DEFAULT 0,
    -- Estado
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uso de códigos promocionales
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id SERIAL PRIMARY KEY,
    promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id),
    user_id INTEGER REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    discount_applied DECIMAL(10,2),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travelers_updated_at BEFORE UPDATE ON travelers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular balance en CxC
CREATE OR REPLACE FUNCTION update_ar_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance = NEW.total_amount - NEW.paid_amount;

    -- Actualizar estado según balance
    IF NEW.balance <= 0 THEN
        NEW.status = 'paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status = 'partial';
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.balance > 0 THEN
        NEW.status = 'overdue';
        NEW.days_overdue = CURRENT_DATE - NEW.due_date;
    ELSE
        NEW.status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ar_balance_trigger BEFORE INSERT OR UPDATE ON accounts_receivable
    FOR EACH ROW EXECUTE FUNCTION update_ar_balance();

-- Similar para CxP
CREATE OR REPLACE FUNCTION update_ap_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance = NEW.total_amount - NEW.paid_amount;

    IF NEW.balance <= 0 THEN
        NEW.status = 'paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status = 'partial';
    ELSE
        NEW.status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ap_balance_trigger BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW EXECUTE FUNCTION update_ap_balance();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de dashboard de reservas
CREATE OR REPLACE VIEW bookings_dashboard AS
SELECT
    b.id,
    b.booking_reference,
    b.booking_type,
    b.booking_status,
    b.payment_status,
    b.total_price,
    b.currency,
    b.destination,
    b.check_in,
    b.check_out,
    u.name as customer_name,
    u.email as customer_email,
    t.company_name as tenant_name,
    b.created_at
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN tenants t ON b.tenant_id = t.id;

-- Vista de comisiones por agencia
CREATE OR REPLACE VIEW agency_commissions_summary AS
SELECT
    t.id as agency_id,
    t.company_name,
    COUNT(ac.id) as total_commissions,
    SUM(ac.commission_amount) as total_commission_amount,
    SUM(CASE WHEN ac.status = 'pending' THEN ac.net_commission ELSE 0 END) as pending_amount,
    SUM(CASE WHEN ac.status = 'paid' THEN ac.net_commission ELSE 0 END) as paid_amount,
    ac.currency
FROM tenants t
LEFT JOIN agency_commissions ac ON t.id = ac.agency_id
WHERE t.tenant_type = 'agency'
GROUP BY t.id, t.company_name, ac.currency;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_type_status ON bookings(booking_type, booking_status);
CREATE INDEX idx_hotels_city_active ON hotels(city, is_active) WHERE is_active = true;
CREATE INDEX idx_commission_agency_status ON agency_commissions(agency_id, status);

-- ============================================
-- COMENTARIOS EN TABLAS (DOCUMENTACIÓN)
-- ============================================

COMMENT ON TABLE users IS 'Usuarios principales del sistema';
COMMENT ON TABLE tenants IS 'Organizaciones: corporativos y agencias';
COMMENT ON TABLE bookings IS 'Reservas de todos los tipos (vuelos, hoteles, etc)';
COMMENT ON TABLE agency_commissions IS 'Registro de comisiones a agencias';
COMMENT ON TABLE invoices IS 'Facturas electrónicas CFDI 4.0';
COMMENT ON TABLE accounts_receivable IS 'Cuentas por cobrar';
COMMENT ON TABLE accounts_payable IS 'Cuentas por pagar a proveedores';

-- ============================================
-- FIN DEL ESQUEMA
-- Total de tablas: 75+
-- ============================================
