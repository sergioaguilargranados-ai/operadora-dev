-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN 041: HR (Recursos Humanos) Module Core Tables
-- Build: 12 Feb 2026 - v2.316
-- Descripción: Sistema completo de RRHH para gestionar empleados
--              internos y agentes externos con perfiles diferenciados,
--              contratos, asistencia, nómina y comisiones.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 1. Departamentos
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_departments (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  parent_department_id INTEGER REFERENCES hr_departments(id),
  manager_id INTEGER,  -- FK a hr_employees (se agrega después)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_dept_tenant ON hr_departments(tenant_id);

-- ───────────────────────────────────────────
-- 2. Posiciones / Puestos
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_positions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES hr_departments(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  level VARCHAR(50),   -- 'junior', 'mid', 'senior', 'lead', 'director'
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'MXN',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_pos_tenant ON hr_positions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_pos_dept ON hr_positions(department_id);

-- ───────────────────────────────────────────
-- 3. Empleados (tabla central — perfil diferenciado)
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_employees (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  tenant_user_id INTEGER REFERENCES tenant_users(id),
  agency_id INTEGER REFERENCES tenants(id),  -- agencia a la que pertenece

  -- Datos personales
  employee_number VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  full_name VARCHAR(300) GENERATED ALWAYS AS (
    TRIM(COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, ''))
  ) STORED,
  email VARCHAR(200),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  personal_email VARCHAR(200),
  date_of_birth DATE,
  gender VARCHAR(20),
  nationality VARCHAR(100),
  marital_status VARCHAR(30),  -- 'single', 'married', 'divorced', 'widowed'
  photo_url TEXT,

  -- Dirección
  address_street VARCHAR(500),
  address_city VARCHAR(200),
  address_state VARCHAR(200),
  address_zip VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'México',

  -- Tipo de perfil (clave para diferenciar)
  employee_type VARCHAR(30) NOT NULL DEFAULT 'internal',
  -- 'internal' = Empleado interno (nómina fija, horarios)
  -- 'agent'    = Agente de ventas (comisiones, metas)
  -- 'freelance' = Freelancer / externo
  -- 'contractor' = Contratista

  -- Datos laborales
  department_id INTEGER REFERENCES hr_departments(id),
  position_id INTEGER REFERENCES hr_positions(id),
  hire_date DATE,
  termination_date DATE,
  employment_status VARCHAR(30) DEFAULT 'active',
  -- 'active', 'inactive', 'on_leave', 'terminated', 'probation', 'suspended'

  -- Datos fiscales / legales (México)
  rfc VARCHAR(20),
  curp VARCHAR(20),
  nss VARCHAR(20),   -- Número de Seguro Social (IMSS)
  tax_regime VARCHAR(100),  -- Régimen fiscal
  clabe VARCHAR(25),        -- CLABE interbancaria
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),

  -- Datos de agente (solo si employee_type = 'agent')
  agent_referral_code VARCHAR(50),
  agent_commission_rate NUMERIC(5,2),    -- % comisión base
  agent_commission_split NUMERIC(5,2),   -- % split con agencia
  agent_certification VARCHAR(200),      -- Certificaciones
  agent_license_number VARCHAR(100),
  agent_license_expiry DATE,
  agent_territory VARCHAR(200),          -- Zona de ventas
  agent_monthly_target NUMERIC(12,2),    -- Meta mensual
  agent_ytd_sales NUMERIC(12,2) DEFAULT 0,

  -- Salario (empleados internos)
  base_salary NUMERIC(12,2),
  salary_currency VARCHAR(3) DEFAULT 'MXN',
  salary_period VARCHAR(20) DEFAULT 'monthly',  -- 'monthly', 'biweekly', 'weekly'
  salary_type VARCHAR(20) DEFAULT 'gross',       -- 'gross', 'net'

  -- Jornada
  work_schedule VARCHAR(50) DEFAULT 'full_time',
  -- 'full_time', 'part_time', 'flexible', 'remote', 'hybrid'
  weekly_hours NUMERIC(4,1) DEFAULT 48,
  shift VARCHAR(30),   -- 'morning', 'afternoon', 'night', 'rotating'

  -- Supervisor
  direct_manager_id INTEGER REFERENCES hr_employees(id),

  -- Emergencia
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(50),

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Control
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT hr_employees_type_check CHECK (employee_type IN ('internal', 'agent', 'freelance', 'contractor')),
  CONSTRAINT hr_employees_status_check CHECK (employment_status IN ('active', 'inactive', 'on_leave', 'terminated', 'probation', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_hr_emp_tenant ON hr_employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_emp_user ON hr_employees(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hr_emp_type ON hr_employees(employee_type);
CREATE INDEX IF NOT EXISTS idx_hr_emp_status ON hr_employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_hr_emp_dept ON hr_employees(department_id);
CREATE INDEX IF NOT EXISTS idx_hr_emp_pos ON hr_employees(position_id);
CREATE INDEX IF NOT EXISTS idx_hr_emp_agency ON hr_employees(agency_id) WHERE agency_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hr_emp_manager ON hr_employees(direct_manager_id);
CREATE INDEX IF NOT EXISTS idx_hr_emp_number ON hr_employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_hr_emp_name ON hr_employees USING gin(to_tsvector('spanish', COALESCE(first_name,'') || ' ' || COALESCE(last_name,'') || ' ' || COALESCE(email,'')));

-- Ahora agregar FK de manager en departments
ALTER TABLE hr_departments ADD CONSTRAINT fk_hr_dept_manager FOREIGN KEY (manager_id) REFERENCES hr_employees(id) ON DELETE SET NULL;

-- ───────────────────────────────────────────
-- 4. Contratos
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_contracts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

  contract_type VARCHAR(50) NOT NULL,
  -- 'indefinite'   = Contrato indefinido / planta
  -- 'fixed_term'   = Contrato a plazo fijo
  -- 'probation'    = Periodo de prueba
  -- 'commission'   = Contrato de comisión (agentes)
  -- 'freelance'    = Honorarios / independiente
  -- 'internship'   = Prácticas profesionales

  contract_number VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,         -- NULL = indefinido
  renewal_date DATE,     -- Para alertas de renovación

  -- Condiciones
  salary NUMERIC(12,2),
  salary_currency VARCHAR(3) DEFAULT 'MXN',
  salary_period VARCHAR(20) DEFAULT 'monthly',
  commission_percentage NUMERIC(5,2),
  bonus_structure JSONB,     -- Estructura de bonos

  -- Beneficios
  vacation_days INTEGER DEFAULT 12,
  sick_days INTEGER DEFAULT 5,
  benefits JSONB DEFAULT '{}',  -- Seguro, vales, etc.

  -- Documentos
  document_url TEXT,           -- URL del contrato firmado (Vercel Blob)
  signed_at TIMESTAMP,
  signed_by_employee BOOLEAN DEFAULT false,
  signed_by_employer BOOLEAN DEFAULT false,

  -- Estado
  status VARCHAR(30) DEFAULT 'active',
  -- 'draft', 'active', 'expired', 'terminated', 'renewed', 'cancelled'

  termination_reason TEXT,
  termination_date DATE,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_contracts_type_check CHECK (contract_type IN (
    'indefinite', 'fixed_term', 'probation', 'commission', 'freelance', 'internship'
  )),
  CONSTRAINT hr_contracts_status_check CHECK (status IN (
    'draft', 'active', 'expired', 'terminated', 'renewed', 'cancelled'
  ))
);

CREATE INDEX IF NOT EXISTS idx_hr_contracts_tenant ON hr_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_contracts_emp ON hr_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_contracts_status ON hr_contracts(status);
CREATE INDEX IF NOT EXISTS idx_hr_contracts_end ON hr_contracts(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hr_contracts_renewal ON hr_contracts(renewal_date) WHERE renewal_date IS NOT NULL;

-- ───────────────────────────────────────────
-- 5. Asistencia / Control de Tiempos
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_attendance (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

  attendance_date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  check_in_method VARCHAR(30) DEFAULT 'manual',  -- 'manual', 'biometric', 'gps', 'qr'
  check_out_method VARCHAR(30),

  -- Horas
  worked_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,

  -- Ubicación (para GPS)
  check_in_lat NUMERIC(10,7),
  check_in_lng NUMERIC(10,7),
  check_out_lat NUMERIC(10,7),
  check_out_lng NUMERIC(10,7),

  -- Estado
  status VARCHAR(20) DEFAULT 'present',
  -- 'present', 'absent', 'late', 'half_day', 'holiday', 'remote'

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_attendance_status_check CHECK (status IN (
    'present', 'absent', 'late', 'half_day', 'holiday', 'remote'
  )),
  CONSTRAINT hr_attendance_unique UNIQUE (employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_hr_att_tenant ON hr_attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_att_emp ON hr_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_att_date ON hr_attendance(attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_hr_att_status ON hr_attendance(status);

-- ───────────────────────────────────────────
-- 6. Solicitudes de Ausencia (Vacaciones, Permisos, Incapacidades)
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

  leave_type VARCHAR(50) NOT NULL,
  -- 'vacation', 'sick', 'personal', 'maternity', 'paternity',
  -- 'bereavement', 'training', 'unpaid', 'other'

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(4,1) NOT NULL,
  half_day BOOLEAN DEFAULT false,

  reason TEXT,
  supporting_document_url TEXT,  -- Comprobante médico, etc.

  -- Aprobación
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected', 'cancelled'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_leave_type_check CHECK (leave_type IN (
    'vacation', 'sick', 'personal', 'maternity', 'paternity',
    'bereavement', 'training', 'unpaid', 'other'
  )),
  CONSTRAINT hr_leave_status_check CHECK (status IN (
    'pending', 'approved', 'rejected', 'cancelled'
  ))
);

CREATE INDEX IF NOT EXISTS idx_hr_leave_tenant ON hr_leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_emp ON hr_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_status ON hr_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_hr_leave_dates ON hr_leave_requests(start_date, end_date);

-- ───────────────────────────────────────────
-- 7. Nómina / Payroll
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_payroll (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

  -- Periodo
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE,
  payroll_type VARCHAR(30) DEFAULT 'regular',
  -- 'regular', 'bonus', 'commission', 'settlement', 'aguinaldo'

  -- Percepciones
  base_salary NUMERIC(12,2) DEFAULT 0,
  overtime_pay NUMERIC(12,2) DEFAULT 0,
  commission_amount NUMERIC(12,2) DEFAULT 0,
  bonus_amount NUMERIC(12,2) DEFAULT 0,
  other_earnings NUMERIC(12,2) DEFAULT 0,
  gross_pay NUMERIC(12,2) NOT NULL,

  -- Deducciones
  tax_isr NUMERIC(12,2) DEFAULT 0,
  tax_imss NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,

  -- Neto
  net_pay NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Método de pago
  payment_method VARCHAR(30) DEFAULT 'transfer',
  -- 'transfer', 'check', 'cash'
  payment_reference VARCHAR(100),

  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'approved', 'paid', 'cancelled'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,

  -- Desglose
  earnings_detail JSONB DEFAULT '{}',
  deductions_detail JSONB DEFAULT '{}',

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_payroll_type_check CHECK (payroll_type IN (
    'regular', 'bonus', 'commission', 'settlement', 'aguinaldo'
  )),
  CONSTRAINT hr_payroll_status_check CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  ))
);

CREATE INDEX IF NOT EXISTS idx_hr_payroll_tenant ON hr_payroll(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_payroll_emp ON hr_payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_payroll_period ON hr_payroll(pay_period_start, pay_period_end);
CREATE INDEX IF NOT EXISTS idx_hr_payroll_status ON hr_payroll(status);

-- ───────────────────────────────────────────
-- 8. Comisiones de Agentes (vinculado a ventas)
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_agent_commissions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id),
  agency_commission_id INTEGER,  -- FK a agency_commissions existentes

  -- Monto
  booking_amount NUMERIC(12,2),
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Periodo
  commission_period_start DATE,
  commission_period_end DATE,

  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'approved', 'paid', 'cancelled'
  
  paid_in_payroll_id INTEGER REFERENCES hr_payroll(id),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_agent_comm_status_check CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  ))
);

CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_tenant ON hr_agent_commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_emp ON hr_agent_commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_booking ON hr_agent_commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_status ON hr_agent_commissions(status);

-- ───────────────────────────────────────────
-- 9. Documentos de Empleados (repositorio)
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_employee_documents (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

  document_type VARCHAR(50) NOT NULL,
  -- 'ine', 'passport', 'curp', 'rfc', 'nss', 'comprobante_domicilio',
  -- 'contract', 'acta_nacimiento', 'cedula_profesional',
  -- 'certificado_medico', 'photo', 'cv', 'carta_recomendacion',
  -- 'constancia_fiscal', 'clabe_bancaria', 'other'

  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,

  document_number VARCHAR(100),
  expiry_date DATE,
  issuing_authority VARCHAR(200),
  
  category VARCHAR(50) DEFAULT 'identification',
  -- 'identification', 'legal', 'financial', 'medical', 'academic', 'other'

  -- Verificación
  verified BOOLEAN DEFAULT false,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  status VARCHAR(30) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'expired'

  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hr_edocs_tenant ON hr_employee_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_edocs_emp ON hr_employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_edocs_type ON hr_employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_hr_edocs_expiry ON hr_employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hr_edocs_status ON hr_employee_documents(status);

-- ───────────────────────────────────────────
-- 10. Pipeline de Reclutamiento
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_recruitment (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Candidato
  candidate_name VARCHAR(200) NOT NULL,
  candidate_email VARCHAR(200),
  candidate_phone VARCHAR(50),
  candidate_cv_url TEXT,
  candidate_photo_url TEXT,

  -- Posición
  position_id INTEGER REFERENCES hr_positions(id),
  position_title VARCHAR(200),
  department_id INTEGER REFERENCES hr_departments(id),
  agency_id INTEGER REFERENCES tenants(id),

  -- Tipo de candidato
  candidate_type VARCHAR(30) DEFAULT 'internal',
  -- 'internal', 'agent', 'freelance'

  -- Pipeline
  stage VARCHAR(50) DEFAULT 'applied',
  -- 'applied', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected', 'withdrawn'

  -- Proceso
  applied_at TIMESTAMP DEFAULT NOW(),
  interview_date TIMESTAMP,
  interview_notes TEXT,
  interviewer_id INTEGER REFERENCES users(id),
  
  offer_salary NUMERIC(12,2),
  offer_date DATE,
  
  hired_date DATE,
  hired_employee_id INTEGER REFERENCES hr_employees(id),

  -- Evaluación
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  evaluation_notes TEXT,

  -- Fuente
  source VARCHAR(100),  -- 'referral', 'job_portal', 'social_media', 'internal', 'other'
  referred_by INTEGER REFERENCES hr_employees(id),

  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT hr_recruitment_stage_check CHECK (stage IN (
    'applied', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected', 'withdrawn'
  ))
);

CREATE INDEX IF NOT EXISTS idx_hr_recruit_tenant ON hr_recruitment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_recruit_stage ON hr_recruitment(stage);
CREATE INDEX IF NOT EXISTS idx_hr_recruit_pos ON hr_recruitment(position_id);

-- ───────────────────────────────────────────
-- 11. Log de Auditoría RRHH
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_audit_log (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES hr_employees(id),
  performed_by INTEGER REFERENCES users(id),

  action VARCHAR(50) NOT NULL,
  -- 'created', 'updated', 'status_changed', 'promoted', 'transferred',
  -- 'terminated', 'salary_changed', 'document_uploaded', 'leave_approved'

  entity_type VARCHAR(50) NOT NULL,
  -- 'employee', 'contract', 'attendance', 'leave', 'payroll', 'commission', 'document', 'recruitment'

  entity_id INTEGER,
  
  old_values JSONB,
  new_values JSONB,
  description TEXT,

  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_audit_tenant ON hr_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_audit_emp ON hr_audit_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_audit_action ON hr_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_hr_audit_date ON hr_audit_log(created_at DESC);

-- ───────────────────────────────────────────
-- 12. Trigger para updated_at automático
-- ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION hr_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas HR con updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'hr_departments', 'hr_positions', 'hr_employees',
      'hr_contracts', 'hr_leave_requests', 'hr_payroll',
      'hr_employee_documents', 'hr_recruitment'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trigger_hr_updated_%s ON %I; CREATE TRIGGER trigger_hr_updated_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp()',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════
-- FIN DE MIGRACIÓN 041
-- Tablas creadas: 10 (hr_departments, hr_positions, hr_employees,
--                      hr_contracts, hr_attendance, hr_leave_requests,
--                      hr_payroll, hr_agent_commissions, hr_employee_documents,
--                      hr_recruitment, hr_audit_log)
-- Índices creados: ~40
-- ═══════════════════════════════════════════
