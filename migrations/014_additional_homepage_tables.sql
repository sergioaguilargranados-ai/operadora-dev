-- Migración 014: Tablas adicionales de Homepage
-- Crea tablas que aún faltan

-- Tabla de hospedajes únicos (ya debería existir de la migración 005, pero la creamos por si acaso)
CREATE TABLE IF NOT EXISTS unique_stays (
  id SERIAL PRIMARY KEY,
  property_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  rating DECIMAL(2, 1),
  total_reviews INTEGER,
  property_type VARCHAR(100),
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de destinos para explorar
CREATE TABLE IF NOT EXISTS explore_destinations (
  id SERIAL PRIMARY KEY,
  destination_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  image_url TEXT NOT NULL,
  price_from DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'MXN',
  category VARCHAR(50), -- 'playa', 'ciudad', 'naturaleza', 'aventura'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_unique_stays_featured ON unique_stays(is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_explore_destinations_active ON explore_destinations(is_active, display_order);

-- Datos iniciales para hospedajes únicos
INSERT INTO unique_stays (property_name, location, description, image_url, price_per_night, rating, total_reviews, property_type, display_order) VALUES
('Casa en el árbol', 'Chiapas, México', 'Experiencia única rodeado de naturaleza', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop', 2100, 4.9, 234, 'treehouse', 1),
('Hotel Boutique Colonial', 'Oaxaca, México', 'Arquitectura colonial con lujo moderno', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 1950, 4.8, 189, 'boutique', 2),
('Villa con Piscina Privada', 'Tulum, México', 'Exclusividad y confort frente al mar', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 4500, 5.0, 156, 'villa', 3),
('Cabaña en el Bosque', 'Valle de Bravo, México', 'Escapada romántica en el bosque', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop', 1800, 4.7, 98, 'cabin', 4),
('Glamping Domo', 'Hidalgo, México', 'Experiencia bajo las estrellas', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', 2200, 4.6, 87, 'glamping', 5),
('Casa de Playa', 'Puerto Escondido, México', 'Relax frente a las olas', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 3200, 4.9, 145, 'beach_house', 6)
ON CONFLICT DO NOTHING;

-- Datos iniciales para destinos a explorar
INSERT INTO explore_destinations (destination_name, city, country, image_url, price_from, category, display_order) VALUES
('Cancún', 'Cancún', 'México', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop', 2500, 'playa', 1),
('Ciudad de México', 'CDMX', 'México', 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=600&h=400&fit=crop', 1200, 'ciudad', 2),
('Tulum', 'Tulum', 'México', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 2800, 'playa', 3),
('San Miguel de Allende', 'San Miguel de Allende', 'México', 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop', 1800, 'ciudad', 4),
('Los Cabos', 'Los Cabos', 'México', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop', 3500, 'playa', 5),
('Oaxaca', 'Oaxaca', 'México', 'https://images.unsplash.com/photo-1547995886-6dc09384c6e6?w=600&h=400&fit=crop', 1600, 'ciudad', 6)
ON CONFLICT DO NOTHING;

-- Corregir precios de accommodation_favorites (que muestran NaN)
UPDATE accommodation_favorites
SET price_per_night =
  CASE
    WHEN name LIKE '%Tulum%' THEN 3500
    WHEN name LIKE '%San Miguel%' THEN 2800
    WHEN name LIKE '%Valle%' THEN 1800
    ELSE 2500
  END
WHERE price_per_night IS NULL OR price_per_night = 0;
