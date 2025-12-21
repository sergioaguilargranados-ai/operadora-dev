-- Migration 008: Add role column to users table
-- Date: 18 Dec 2025
-- Purpose: Support role-based access control

-- Add role column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'EMPLOYEE';

-- Update existing users with roles
UPDATE users SET role = 'ADMIN'
WHERE email IN ('admin@asoperadora.com', 'admin2@asoperadora.com');

UPDATE users SET role = 'SUPER_ADMIN'
WHERE email = 'superadmin@asoperadora.com';

UPDATE users SET role = 'MANAGER'
WHERE email IN ('manager@empresa.com', 'maria.garcia@empresa.com');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE';
