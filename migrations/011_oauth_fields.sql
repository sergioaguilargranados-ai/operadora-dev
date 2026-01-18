-- Migración 011: Agregar campos OAuth a tabla users
-- Fecha: 21 Dic 2025
-- Propósito: Soporte para autenticación con Google y Facebook

-- Agregar columnas para OAuth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Crear índices únicos para IDs de OAuth
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN users.google_id IS 'ID único de Google para autenticación OAuth';
COMMENT ON COLUMN users.facebook_id IS 'ID único de Facebook para autenticación OAuth';
COMMENT ON COLUMN users.profile_image IS 'URL de la imagen de perfil (de OAuth o subida)';
