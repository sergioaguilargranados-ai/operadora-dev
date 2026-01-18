-- Migración 015: Agregar hotels_count a explore_destinations
-- También agrega price_from a accommodation_favorites

-- Agregar columna hotels_count a explore_destinations
ALTER TABLE explore_destinations
ADD COLUMN IF NOT EXISTS hotels_count INTEGER DEFAULT 250;

-- Actualizar valores de hotels_count
UPDATE explore_destinations SET hotels_count = 1234 WHERE destination_name = 'Cancún';
UPDATE explore_destinations SET hotels_count = 856 WHERE destination_name = 'Ciudad de México';
UPDATE explore_destinations SET hotels_count = 523 WHERE destination_name = 'Tulum';
UPDATE explore_destinations SET hotels_count = 312 WHERE destination_name = 'San Miguel de Allende';
UPDATE explore_destinations SET hotels_count = 445 WHERE destination_name = 'Los Cabos';
UPDATE explore_destinations SET hotels_count = 289 WHERE destination_name = 'Oaxaca';

-- Agregar columna title y price_from a accommodation_favorites si no existen
ALTER TABLE accommodation_favorites
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

ALTER TABLE accommodation_favorites
ADD COLUMN IF NOT EXISTS price_from DECIMAL(10, 2);

-- Actualizar title con name si está vacío
UPDATE accommodation_favorites SET title = name WHERE title IS NULL;

-- Actualizar price_from con price_per_night si está vacío
UPDATE accommodation_favorites SET price_from = price_per_night WHERE price_from IS NULL;
