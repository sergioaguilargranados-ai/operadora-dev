-- Migración 013: Tablas de Homepage
-- Crea las tablas faltantes para la homepage

-- Tabla de destinos de vuelos
CREATE TABLE IF NOT EXISTS flight_destinations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'México',
  price_from DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  image_url TEXT NOT NULL,
  airport_code VARCHAR(5),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de hospedajes favoritos
CREATE TABLE IF NOT EXISTS accommodation_favorites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  price_per_night DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  rating DECIMAL(2, 1),
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de hero banner principal
CREATE TABLE IF NOT EXISTS featured_hero (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ofertas de fin de semana
CREATE TABLE IF NOT EXISTS weekend_deals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'MXN',
  rating DECIMAL(2, 1),
  image_url TEXT NOT NULL,
  description TEXT,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_flight_destinations_active ON flight_destinations(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_accommodation_favorites_active ON accommodation_favorites(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_featured_hero_active ON featured_hero(is_active);
CREATE INDEX IF NOT EXISTS idx_weekend_deals_active ON weekend_deals(is_active, valid_until);

-- Datos iniciales de ejemplo

-- Hero principal
INSERT INTO featured_hero (title, subtitle, description, image_url, button_text, button_link)
SELECT 'Descubre tu próximo destino', 'Ofertas exclusivas en vuelos, hoteles y paquetes', 'Encuentra los mejores precios en viajes a todo el mundo', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop', 'Explorar', '/'
WHERE NOT EXISTS (SELECT 1 FROM featured_hero WHERE is_active = true);

-- Destinos de vuelos
INSERT INTO flight_destinations (city, country, price_from, currency, image_url, airport_code, display_order) VALUES
('Cancún', 'México', 2500, 'MXN', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop', 'CUN', 1),
('Los Cabos', 'México', 3200, 'MXN', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop', 'SJD', 2),
('Puerto Vallarta', 'México', 2800, 'MXN', 'https://images.unsplash.com/photo-1512813195452-66bec2d93950?w=600&h=400&fit=crop', 'PVR', 3),
('Guadalajara', 'México', 1800, 'MXN', 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop', 'GDL', 4)
ON CONFLICT DO NOTHING;

-- Hospedajes favoritos
INSERT INTO accommodation_favorites (name, location, type, price_per_night, currency, rating, image_url, description, display_order) VALUES
('Casitas Maraika', 'Tulum, Quintana Roo', 'Boutique Hotel', 3500, 'MXN', 4.9, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop', 'Hospedaje único en la selva maya', 1),
('Casa Violeta', 'San Miguel de Allende, Gto', 'Casa Colonial', 2800, 'MXN', 4.8, 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=400&fit=crop', 'Arquitectura colonial restaurada', 2),
('Cabañas del Bosque', 'Valle de Bravo, Edo Mex', 'Cabaña', 1800, 'MXN', 4.6, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop', 'Escapada romántica en el bosque', 3)
ON CONFLICT DO NOTHING;

-- Ofertas de fin de semana
INSERT INTO weekend_deals (name, location, price_per_night, original_price, currency, rating, image_url, description, valid_until, display_order) VALUES
('Hotel Fiesta Americana', 'Cancún, Quintana Roo', 1200, 1800, 'MXN', 4.5, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop', 'Resort todo incluido frente al mar', NOW() + INTERVAL '30 days', 1),
('Grand Velas Los Cabos', 'Los Cabos, BCS', 2500, 3500, 'MXN', 5.0, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 'Lujo y confort en la playa', NOW() + INTERVAL '30 days', 2),
('Secrets Huatulco', 'Huatulco, Oaxaca', 1800, 2400, 'MXN', 4.7, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 'Solo adultos, todo incluido', NOW() + INTERVAL '30 days', 3),
('Barceló Ixtapa', 'Ixtapa, Guerrero', 1500, 2000, 'MXN', 4.3, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', 'Frente a la playa con albercas', NOW() + INTERVAL '30 days', 4)
ON CONFLICT DO NOTHING;
