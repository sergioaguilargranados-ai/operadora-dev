-- Migration: Cost Centers
-- Date: Dec 15, 2025
-- Description: Add cost_centers table and update related tables

-- Create cost_centers table
CREATE TABLE IF NOT EXISTS cost_centers (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2),
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code)
);

-- Add cost_center_id to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cost_center_id INTEGER REFERENCES cost_centers(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_cost_centers_tenant ON cost_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_active ON cost_centers(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_cost_center ON bookings(cost_center_id);

-- Insert example cost centers (optional)
INSERT INTO cost_centers (tenant_id, code, name, description, budget, is_active)
VALUES
  (1, 'CC-VENTAS', 'Ventas', 'Centro de costo del departamento de ventas', 50000, true),
  (1, 'CC-MKT', 'Marketing', 'Centro de costo de marketing y publicidad', 30000, true),
  (1, 'CC-IT', 'Tecnología', 'Centro de costo de TI y desarrollo', 40000, true),
  (1, 'CC-RH', 'Recursos Humanos', 'Centro de costo de RH', 20000, true),
  (1, 'CC-FIN', 'Finanzas', 'Centro de costo de finanzas', 25000, true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Comment on table
COMMENT ON TABLE cost_centers IS 'Cost centers for tracking expenses by project or department';
COMMENT ON COLUMN cost_centers.code IS 'Unique code for the cost center within tenant';
COMMENT ON COLUMN cost_centers.budget IS 'Monthly budget allocation for this cost center';
