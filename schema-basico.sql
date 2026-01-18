-- Esquema básico para datos de prueba
-- Solo las tablas esenciales

BEGIN;

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  is_active BOOLEAN DEFAULT true,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  employee_number VARCHAR(50),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_number, tenant_id)
);

-- Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code, tenant_id)
);

-- Travel Policies
CREATE TABLE IF NOT EXISTS travel_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_flight_cost DECIMAL(10,2),
  max_hotel_cost DECIMAL(10,2),
  max_daily_expenses DECIMAL(10,2),
  requires_approval BOOLEAN DEFAULT false,
  tenant_id INTEGER REFERENCES tenants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tenant_id INTEGER REFERENCES tenants(id),
  type VARCHAR(50),
  status VARCHAR(50),
  origin VARCHAR(100),
  destination VARCHAR(255),
  departure_date DATE,
  return_date DATE,
  passengers INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  confirmation_code VARCHAR(100),
  provider VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  cost_center_id INTEGER REFERENCES cost_centers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  approver_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  notes TEXT,
  approver_notes TEXT,
  tenant_id INTEGER REFERENCES tenants(id)
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  provider VARCHAR(50),
  provider_transaction_id VARCHAR(255),
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  invoice_number VARCHAR(100) UNIQUE,
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) DEFAULT 'pending',
  issued_at TIMESTAMP,
  due_date TIMESTAMP,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts Receivable
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts Payable
CREATE TABLE IF NOT EXISTS accounts_payable (
  id SERIAL PRIMARY KEY,
  vendor VARCHAR(255),
  description TEXT,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  percentage DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  provider VARCHAR(100),
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  item_type VARCHAR(50),
  item_id INTEGER,
  destination VARCHAR(255),
  notes TEXT,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id INTEGER,
  ip_address VARCHAR(50),
  user_agent TEXT,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;

SELECT 'Schema básico creado exitosamente' as resultado;
