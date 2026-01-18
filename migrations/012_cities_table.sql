-- Migración 012: Tabla de ciudades con códigos IATA
-- Fecha: 21 Dic 2025
-- Propósito: Almacenar ciudades dinámicamente para búsquedas de hoteles

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL, -- lowercase, sin acentos
  city_code VARCHAR(10), -- Código IATA (CUN, MEX, etc)
  country VARCHAR(100),
  country_code VARCHAR(3), -- ISO 3166-1 alpha-3
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE UNIQUE INDEX IF NOT EXISTS idx_cities_normalized_name ON cities(normalized_name);
CREATE INDEX IF NOT EXISTS idx_cities_city_code ON cities(city_code);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_code);

-- Función para normalizar nombres (lowercase, sin acentos)
CREATE OR REPLACE FUNCTION normalize_city_name(city_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    TRANSLATE(
      city_name,
      'áéíóúÁÉÍÓÚñÑ',
      'aeiouAEIOUnN'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para mantener normalized_name actualizado
CREATE OR REPLACE FUNCTION update_normalized_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_name := normalize_city_name(NEW.name);
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cities_normalize_name
BEFORE INSERT OR UPDATE ON cities
FOR EACH ROW
EXECUTE FUNCTION update_normalized_name();

-- Comentarios
COMMENT ON TABLE cities IS 'Catálogo de ciudades con códigos IATA para búsquedas';
COMMENT ON COLUMN cities.normalized_name IS 'Nombre normalizado (lowercase, sin acentos) para búsquedas';
COMMENT ON COLUMN cities.city_code IS 'Código IATA de 3 letras (CUN, MEX, GDL, etc)';
