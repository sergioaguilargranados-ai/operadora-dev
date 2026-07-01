-- Migration 054: Tabla de contenido por destino (cache de contenido generado por IA)
-- Fecha: 01 Jul 2026
-- Propósito: Almacenar contenido turístico generado por IA para cada destino,
--            reutilizable entre itinerarios que visiten el mismo lugar.

CREATE TABLE IF NOT EXISTS destination_content (
    id SERIAL PRIMARY KEY,
    destination_key VARCHAR(150) UNIQUE NOT NULL,  -- "santorini-grecia", "paris-francia"
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    
    -- Contenido generado (mismo formato que days JSONB en itineraries)
    general_description TEXT,
    foods JSONB DEFAULT '[]',           -- [{name, desc, img}]
    places JSONB DEFAULT '[]',          -- [{name, desc, img}]
    souvenirs JSONB DEFAULT '[]',       -- [{name, desc, img}]
    phrases JSONB DEFAULT '[]',         -- [{es, local, pronunciation}]
    practical_info JSONB DEFAULT '{}',  -- {currency, language, climate, timezone, voltage, emergency}
    travel_tips TEXT[] DEFAULT '{}',
    hero_image_url TEXT,
    
    -- Metadatos
    generated_by VARCHAR(50) DEFAULT 'gemini',
    language VARCHAR(10) DEFAULT 'es',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dest_key ON destination_content(destination_key);
CREATE INDEX IF NOT EXISTS idx_dest_city_country ON destination_content(city, country);
