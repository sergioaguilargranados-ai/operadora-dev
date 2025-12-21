-- ==============================================
-- MIGRACIÓN: Auto-guardado de Hoteles desde APIs
-- ==============================================

-- Agregar nuevos campos a la tabla de hoteles
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS data_completeness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS star_rating INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MXN';

-- Crear índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_external_provider
ON hotels(external_id, provider)
WHERE external_id IS NOT NULL;

-- Crear índice para búsqueda de hoteles que necesitan revisión
CREATE INDEX IF NOT EXISTS idx_hotels_needs_review
ON hotels(needs_review, data_completeness)
WHERE needs_review = true;

-- Actualizar hoteles existentes para que tengan data_completeness = 100
UPDATE hotels
SET data_completeness = 100,
    provider = 'manual',
    needs_review = false
WHERE data_completeness IS NULL OR data_completeness = 0;

-- Comentarios para documentación
COMMENT ON COLUMN hotels.provider IS 'Proveedor de donde provienen los datos: amadeus, booking, expedia, manual';
COMMENT ON COLUMN hotels.external_id IS 'ID del hotel en el sistema del proveedor externo';
COMMENT ON COLUMN hotels.data_completeness IS 'Porcentaje de completitud de datos (0-100)';
COMMENT ON COLUMN hotels.needs_review IS 'Indica si el hotel necesita revisión manual';
COMMENT ON COLUMN hotels.star_rating IS 'Categoría del hotel en estrellas (1-5)';
COMMENT ON COLUMN hotels.review_count IS 'Número de reseñas del hotel';
COMMENT ON COLUMN hotels.currency IS 'Moneda del precio (ISO 4217)';
