-- Tabla de promociones/ofertas
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  image_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hotel', 'flight', 'package', 'activity'
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  badge_text VARCHAR(50), -- 'OFERTA FLASH', 'SÚPER OFERTA', etc.
  link_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de destinos destacados
CREATE TABLE IF NOT EXISTS featured_destinations (
  id SERIAL PRIMARY KEY,
  destination_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  image_url TEXT NOT NULL,
  price_from DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'MXN',
  total_hotels INTEGER,
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de paquetes destacados
CREATE TABLE IF NOT EXISTS featured_packages (
  id SERIAL PRIMARY KEY,
  package_name VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  nights INTEGER,
  includes TEXT, -- JSON array de lo que incluye
  category VARCHAR(50), -- 'romantic', 'family', 'adventure', 'luxury'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de hospedajes únicos
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
  property_type VARCHAR(100), -- 'treehouse', 'boutique', 'villa', etc.
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_featured_destinations_order ON featured_destinations(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_packages_active ON featured_packages(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_unique_stays_featured ON unique_stays(is_featured, display_order);

-- Datos iniciales de ejemplo
INSERT INTO promotions (title, description, discount_percentage, image_url, category, badge_text, valid_until) VALUES
('Escapada de fin de semana', 'Ahorra hasta 25% en hoteles seleccionados', 25, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 'hotel', 'OFERTA FLASH', NOW() + INTERVAL '30 days'),
('Playas del Caribe', 'Descuento especial en resorts todo incluido', 30, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', 'package', 'SÚPER OFERTA', NOW() + INTERVAL '45 days'),
('Vuelo + Hotel', 'Ahorra combinando tu vuelo y hotel', 40, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 'package', 'PAQUETE', NOW() + INTERVAL '60 days');

INSERT INTO featured_destinations (destination_name, city, country, image_url, price_from, total_hotels) VALUES
('Cancún', 'Cancún', 'México', 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600', 2450, 1234),
('Ciudad de México', 'CDMX', 'México', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600', 1200, 856),
('Los Cabos', 'Los Cabos', 'México', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600', 2800, 623),
('Guadalajara', 'Guadalajara', 'México', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop', 1450, 567);

INSERT INTO featured_packages (package_name, destination, description, image_url, price, nights, includes, category) VALUES
('Playa del Carmen', 'Riviera Maya', 'Todo incluido en resort 5 estrellas', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', 12500, 5, '["Vuelo", "Hotel", "Traslados"]', 'romantic'),
('Europa - París', 'París, Francia', 'Incluye tours a principales atracciones', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=500&fit=crop', 28900, 7, '["Vuelo", "Hotel", "Tours"]', 'adventure'),
('Los Cabos', 'Baja California', 'Resort frente al mar con spa', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=500&fit=crop', 15800, 4, '["Vuelo", "Resort", "Actividades"]', 'luxury');

INSERT INTO unique_stays (property_name, location, description, image_url, price_per_night, rating, total_reviews, property_type) VALUES
('Casa en el árbol', 'Chiapas, México', 'Experiencia única rodeado de naturaleza', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop', 2100, 4.9, 234, 'treehouse'),
('Hotel Boutique Colonial', 'Oaxaca, México', 'Arquitectura colonial con lujo moderno', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 1950, 4.8, 189, 'boutique'),
('Villa con Piscina Privada', 'Tulum, México', 'Exclusividad y confort frente al mar', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 4500, 5.0, 156, 'villa');
