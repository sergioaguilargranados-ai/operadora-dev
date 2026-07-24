-- Migration: Create custom itineraries table for AI generated content
-- Description: Stores dynamic, AI-generated itineraries for generic non-MegaTravel bookings
-- Date: 11 Jul 2026

CREATE TABLE IF NOT EXISTS custom_itineraries (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES tenants(id),
    title VARCHAR(500),
    description TEXT,
    total_days INTEGER,
    start_date DATE,
    end_date DATE,
    destination VARCHAR(200),
    generated_by VARCHAR(50) DEFAULT 'gemini-1.5-pro',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(booking_id)
);

CREATE TABLE IF NOT EXISTS custom_itinerary_days (
    id SERIAL PRIMARY KEY,
    itinerary_id INTEGER NOT NULL REFERENCES custom_itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    title VARCHAR(500),
    description TEXT,
    meals VARCHAR(50), 
    hotel VARCHAR(500),
    city VARCHAR(200),
    activities TEXT[], 
    highlights TEXT[], 
    optional_activities TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(itinerary_id, day_number)
);

-- Índices para mejorar performance
CREATE INDEX idx_custom_itinerary_booking ON custom_itineraries(booking_id);
CREATE INDEX idx_custom_itinerary_day ON custom_itinerary_days(itinerary_id);
CREATE INDEX idx_custom_itinerary_day_num ON custom_itinerary_days(day_number);

-- Comentarios
COMMENT ON TABLE custom_itineraries IS 'Itinerarios dinámicos generados por IA para reservas genéricas';
COMMENT ON TABLE custom_itinerary_days IS 'Detalle día por día de los itinerarios personalizados';
