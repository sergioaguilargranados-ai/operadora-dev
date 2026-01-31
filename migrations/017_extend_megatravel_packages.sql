-- Migración 017: Agregar campos faltantes a megatravel_packages
-- Build: 31 Ene 2026 - v2.255 - FINAL
-- Propósito: Agregar supplements y detailed_hotels (visa_requirements ya existe)

-- 1. Agregar campos faltantes
ALTER TABLE megatravel_packages 
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_hotels JSONB DEFAULT '[]'::jsonb;

-- 2. Agregar índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_megatravel_supplements 
ON megatravel_packages USING gin (supplements);

CREATE INDEX IF NOT EXISTS idx_megatravel_detailed_hotels 
ON megatravel_packages USING gin (detailed_hotels);

-- 3. Comentarios para documentación
COMMENT ON COLUMN megatravel_packages.supplements IS 
'Array de suplementos por fecha: [{dates[], price_usd, description}]';

COMMENT ON COLUMN megatravel_packages.detailed_hotels IS 
'Array de hoteles detallados: [{city, hotel_names[], category, country, stars}]';

-- 4. Actualizar timestamp de migración
INSERT INTO app_settings (key, value, description)
VALUES (
    'MIGRATION_017_EXECUTED',
    NOW()::text,
    'Migración 017: Campos supplements y detailed_hotels agregados'
)
ON CONFLICT (key) DO UPDATE 
SET value = NOW()::text, updated_at = NOW();

-- Verificación
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'megatravel_packages' 
  AND column_name IN ('supplements', 'detailed_hotels')
ORDER BY column_name;
