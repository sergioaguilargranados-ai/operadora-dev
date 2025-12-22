-- ==============================================
-- AS OPERADORA DE VIAJES Y EVENTOS
-- Esquema de Base de Datos PostgreSQL
-- ==============================================

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda rápida por email
CREATE INDEX idx_users_email ON users(email);

-- Tabla de Hoteles
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'México',
    price_per_night DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    image_url TEXT,
    amenities JSONB, -- WiFi, Pool, Parking, Restaurant, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_price ON hotels(price_per_night);
CREATE INDEX idx_hotels_rating ON hotels(rating);

-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hotel_id)
);

-- Índice para obtener favoritos por usuario
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Tabla de Búsquedas (historial)
CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    destination VARCHAR(255),
    check_in DATE,
    check_out DATE,
    adults INTEGER,
    children INTEGER,
    rooms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_searches_user ON searches(user_id);
CREATE INDEX idx_searches_date ON searches(created_at);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER DEFAULT 0,
    rooms INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_hotel ON bookings(hotel_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

-- Tabla de Ofertas Especiales
CREATE TABLE IF NOT EXISTS special_offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    valid_from DATE,
    valid_until DATE,
    offer_type VARCHAR(50), -- flash, super_offer, package
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_dates ON special_offers(valid_from, valid_until);
CREATE INDEX idx_offers_active ON special_offers(is_active);

-- Tabla de Reseñas
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_hotel ON reviews(hotel_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ==============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ==============================================

-- Insertar hoteles de ejemplo
INSERT INTO hotels (name, description, location, city, price_per_night, rating, total_reviews, image_url, amenities) VALUES
('Hotel Playa del Carmen', 'Hotel frente al mar con todas las comodidades', 'Playa del Carmen, México', 'Playa del Carmen', 2500.00, 4.5, 1234, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop', '{"wifi": true, "pool": true, "restaurant": true, "parking": true}'),
('Villa Cancún Luxury', 'Villa de lujo con vista al océano', 'Cancún, México', 'Cancún', 3200.00, 4.8, 856, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop', '{"wifi": true, "pool": true, "restaurant": true, "ac": true}'),
('Resort Tulum Beach', 'Resort todo incluido en la playa', 'Tulum, México', 'Tulum', 1800.00, 4.6, 2100, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop', '{"wifi": true, "pool": true, "restaurant": true, "parking": true}'),
('Hotel Boutique Centro', 'Hotel boutique en el corazón de la ciudad', 'Ciudad de México, México', 'Ciudad de México', 1500.00, 4.3, 567, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', '{"wifi": true, "restaurant": true, "parking": true}'),
('Paradise Resort & Spa', 'Resort de lujo con spa incluido', 'Los Cabos, México', 'Los Cabos', 2800.00, 4.7, 1890, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop', '{"wifi": true, "pool": true, "restaurant": true, "parking": true, "ac": true}'),
('Casa Colonial Historic', 'Encantadora casa colonial con historia', 'Guanajuato, México', 'Guanajuato', 1200.00, 4.4, 432, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop', '{"wifi": true, "restaurant": true}');

-- Insertar ofertas especiales
INSERT INTO special_offers (title, description, discount_percentage, valid_from, valid_until, offer_type, image_url) VALUES
('Escapada de fin de semana', 'Ahorra hasta 25% en hoteles seleccionados', 25, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'flash', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'),
('Playas del Caribe', 'Descuento especial en resorts todo incluido', 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'super_offer', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'),
('Vuelo + Hotel', 'Ahorra combinando tu vuelo y hotel', 40, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'package', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop');

-- ==============================================
-- FUNCIONES ÚTILES
-- ==============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- FIN DEL ESQUEMA
-- ==============================================
