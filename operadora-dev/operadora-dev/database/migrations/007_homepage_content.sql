-- =====================================================
-- MIGRATION 007: Homepage Dynamic Content
-- Fecha: 18 Diciembre 2025
-- Descripción: Tablas para contenido dinámico de homepage
-- =====================================================

-- NOTA: Las siguientes tablas YA EXISTEN y se reutilizarán:
-- - promotions (para ofertas especiales)
-- - featured_packages (para paquetes vacacionales)
-- - featured_destinations (se puede usar para destinos)
-- - unique_stays (ya existe con estructura similar)

-- 1. DESTINO DESTACADO (hero section grande)
CREATE TABLE IF NOT EXISTS featured_hero (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VUELOS A DESTINOS FAVORITOS
CREATE TABLE IF NOT EXISTS flight_destinations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'México',
  price_from DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MXN',
  image_url TEXT NOT NULL,
  airport_code VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HOSPEDAJES FAVORITOS
CREATE TABLE IF NOT EXISTS accommodation_favorites (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_from DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MXN',
  image_url TEXT NOT NULL,
  accommodation_type VARCHAR(50), -- resort, villa, hotel, etc
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. OFERTAS DE ÚLTIMA HORA (Weekend deals)
CREATE TABLE IF NOT EXISTS weekend_deals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MXN',
  discount_percentage INTEGER,
  dates_label VARCHAR(100), -- "Este fin de semana", "Vie - Dom"
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXPLORA EL MUNDO (Grid de destinos)
CREATE TABLE IF NOT EXISTS explore_destinations (
  id SERIAL PRIMARY KEY,
  destination VARCHAR(255) NOT NULL,
  hotels_count INTEGER DEFAULT 0,
  image_url TEXT NOT NULL,
  city_code VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERTAR DATOS INICIALES (Contenido actual)
-- =====================================================

-- DESTINO DESTACADO (Hero)
INSERT INTO featured_hero (title, subtitle, description, image_url, cta_text, cta_link) VALUES
('Descubre playas paradisíacas', 'DESTINO DESTACADO', 'Desde carreras de caballos hasta rutas de bourbon, te espera un mundo de aventuras.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop', 'Explorar destinos', '/destinos')
ON CONFLICT DO NOTHING;

-- VUELOS A DESTINOS FAVORITOS
INSERT INTO flight_destinations (city, price_from, image_url, airport_code, display_order) VALUES
('Cancún', 2450, 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600', 'CUN', 1),
('Ciudad de México', 1200, 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600', 'MEX', 2),
('Los Cabos', 2800, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600', 'SJD', 3),
('Guadalajara', 1450, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop', 'GDL', 4)
ON CONFLICT DO NOTHING;

-- HOSPEDAJES FAVORITOS
INSERT INTO accommodation_favorites (title, location, price_from, image_url, accommodation_type, display_order) VALUES
('Resort Todo Incluido', 'Riviera Maya', 2500, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop', 'resort', 1),
('Villa Frente al Mar', 'Playa del Carmen', 3200, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop', 'villa', 2),
('Hotel Familiar', 'Cancún', 1800, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop', 'hotel', 3)
ON CONFLICT DO NOTHING;

-- OFERTAS DE ÚLTIMA HORA
INSERT INTO weekend_deals (title, location, price_per_night, discount_percentage, dates_label, image_url, display_order, valid_until) VALUES
('Hotel Centro Histórico', 'Ciudad de México', 1100, 30, 'Este fin de semana', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', 1, CURRENT_TIMESTAMP + INTERVAL '7 days'),
('Cabaña en Montaña', 'Valle de Bravo', 1650, 25, 'Vie - Dom', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop', 2, CURRENT_TIMESTAMP + INTERVAL '7 days'),
('Hotel Boutique', 'San Miguel de Allende', 1450, 35, 'Este fin de semana', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop', 3, CURRENT_TIMESTAMP + INTERVAL '7 days'),
('Resort Playa', 'Puerto Vallarta', 2200, 40, 'Vie - Dom', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop', 4, CURRENT_TIMESTAMP + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- HOSPEDAJES ÚNICOS (actualizar tabla existente con datos faltantes)
INSERT INTO unique_stays (property_name, location, price_per_night, rating, total_reviews, image_url, property_type, display_order) VALUES
('Casa en el árbol', 'Chiapas, México', 2100, 4.9, 234, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop', 'Casa en el árbol', 1),
('Hotel Boutique Colonial', 'Oaxaca, México', 1950, 4.8, 189, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 'Hotel Boutique', 2),
('Villa con Piscina Privada', 'Tulum, México', 4500, 5.0, 156, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 'Villa', 3),
('Hacienda Histórica', 'Yucatán, México', 3200, 4.7, 312, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', 'Hacienda', 4),
('Bungalow Frente al Mar', 'Oaxaca, México', 2850, 4.9, 267, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', 'Bungalow', 5),
('Eco-Lodge en la Selva', 'Quintana Roo, México', 2400, 4.8, 198, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', 'Eco-Lodge', 6)
ON CONFLICT DO NOTHING;

-- PAQUETES VACACIONALES (actualizar tabla existente)
INSERT INTO featured_packages (package_name, destination, description, image_url, price, nights, includes, display_order) VALUES
('Paquete Playa del Carmen All-Inclusive', 'Playa del Carmen', 'Todo incluido en resort 5 estrellas', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', 12500, 5, 'Vuelo + Hotel + Traslados', 1),
('Europa Romántica - París', 'Europa - París', 'Incluye tours a principales atracciones', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=500&fit=crop', 28900, 7, 'Vuelo + Hotel + Tours', 2),
('Escapada Los Cabos Premium', 'Los Cabos', 'Resort frente al mar con spa', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=500&fit=crop', 15800, 4, 'Vuelo + Resort + Actividades', 3)
ON CONFLICT DO NOTHING;

-- EXPLORA EL MUNDO
INSERT INTO explore_destinations (destination, hotels_count, image_url, city_code, display_order) VALUES
('Cancún', 1234, 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600', 'CUN', 1),
('Playa del Carmen', 856, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', 'PDC', 2),
('Tulum', 478, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'TUL', 3),
('Los Cabos', 623, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600', 'SJD', 4),
('Puerto Vallarta', 745, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', 'PVR', 5),
('Guadalajara', 567, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop', 'GDL', 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_featured_hero_active ON featured_hero(is_active);
CREATE INDEX IF NOT EXISTS idx_flight_destinations_active ON flight_destinations(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_accommodation_favorites_active ON accommodation_favorites(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_weekend_deals_active ON weekend_deals(is_active, display_order, valid_until);
CREATE INDEX IF NOT EXISTS idx_explore_destinations_active ON explore_destinations(is_active, display_order);

-- =====================================================
-- FIN MIGRATION 007
-- =====================================================
