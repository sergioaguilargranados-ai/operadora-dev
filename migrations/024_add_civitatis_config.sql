-- Migration 024: Agregar configuración de Civitatis
-- Fecha: 03 Feb 2026
-- Propósito: Almacenar ID de agencia de Civitatis para enlaces de afiliado

-- Insertar configuración de Civitatis en app_settings
INSERT INTO app_settings (key, value, description, category, updated_at)
VALUES 
  ('CIVITATIS_AGENCY_ID', '67114', 'ID de agencia de Civitatis para enlaces de afiliado', 'integrations', NOW())
ON CONFLICT (key) DO UPDATE 
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verificar inserción
SELECT key, value, description FROM app_settings WHERE key = 'CIVITATIS_AGENCY_ID';
