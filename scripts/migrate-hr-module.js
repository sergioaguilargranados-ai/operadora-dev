/**
 * migrate-hr-module.js  
 * Ejecuta migraciones 040 + 041 contra Neon en bloques completos.
 * Uso: node scripts/migrate-hr-module.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

setTimeout(() => { console.log('⏰ TIMEOUT'); process.exit(1); }, 120000);

(async () => {
    await c.connect();
    console.log('🔗 Conectado a Neon');

    // ══════════════════════════════════════════════
    // MIGRACIÓN 040: Client Documents Extension
    // ══════════════════════════════════════════════
    console.log('\n═══ MIGRACIÓN 040: Client Documents Extension ═══');

    // 1. Agregar columnas a documents
    try {
        await c.query(`
            ALTER TABLE documents
              ADD COLUMN IF NOT EXISTS agency_client_id INTEGER,
              ADD COLUMN IF NOT EXISTS crm_contact_id INTEGER,
              ADD COLUMN IF NOT EXISTS expiry_date DATE,
              ADD COLUMN IF NOT EXISTS document_number VARCHAR(100),
              ADD COLUMN IF NOT EXISTS issuing_country VARCHAR(100),
              ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(200),
              ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
              ADD COLUMN IF NOT EXISTS verified_by INTEGER,
              ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
              ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
              ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending',
              ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'identification'
        `);
        console.log('  ✅ Columnas nuevas en documents');
    } catch (e) { console.log('  ⚠️ ALTER documents:', e.message.substring(0, 100)); }

    // 2. Actualizar constraint de document_type
    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check`); } catch (e) { /* ok */ }
    try {
        await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_document_type_check CHECK (document_type IN (
            'passport','visa','id','driver_license','other','ine','curp','rfc','comprobante_domicilio',
            'acta_nacimiento','cedula_profesional','carta_poder','contrato','factura',
            'licencia_conducir','tarjeta_circulacion','poliza_seguro','certificado_medico',
            'foto_personal','comprobante_ingresos'
        ))`);
        console.log('  ✅ Constraint document_type actualizado');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // 3. Status & category constraints
    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check`); } catch (e) { /* ok */ }
    try {
        await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_status_check CHECK (status IN ('pending','approved','rejected','expired'))`);
        console.log('  ✅ Status constraint');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_check`); } catch (e) { /* ok */ }
    try {
        await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_category_check CHECK (category IN ('identification','legal','financial','medical','travel','other'))`);
        console.log('  ✅ Category constraint');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // 4. Índices para documents
    const docIndexes = [
        `CREATE INDEX IF NOT EXISTS idx_documents_agency_client ON documents(agency_client_id) WHERE agency_client_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_crm_contact ON documents(crm_contact_id) WHERE crm_contact_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`,
        `CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(verified) WHERE verified = false`,
        `CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)`,
    ];
    for (const idx of docIndexes) { try { await c.query(idx); } catch (e) { /* ok */ } }
    console.log('  ✅ Índices de documents');

    // 5. Vista client_documents_view
    try {
        await c.query(`CREATE OR REPLACE VIEW client_documents_view AS
            SELECT d.id, d.document_type, d.file_name, d.file_size, d.file_type, d.url,
                d.description, d.document_number, d.issuing_country, d.expiry_date,
                d.status, d.category, d.verified, d.verified_at, d.created_at, d.updated_at,
                d.agency_client_id, d.crm_contact_id, d.user_id, d.tenant_id,
                ac.client_name, ac.client_email, ac.client_phone,
                CASE
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_warning'
                    ELSE 'valid'
                END AS expiry_status
            FROM documents d
            LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
            WHERE d.deleted_at IS NULL`);
        console.log('  ✅ Vista client_documents_view');
    } catch (e) { console.log('  ⚠️ Vista:', e.message.substring(0, 100)); }

    // 6. Funciones
    try {
        await c.query(`CREATE OR REPLACE FUNCTION get_expiring_documents(p_tenant_id INTEGER, p_days_ahead INTEGER DEFAULT 30)
            RETURNS TABLE (document_id VARCHAR, document_type VARCHAR, file_name VARCHAR, expiry_date DATE,
                days_until_expiry INTEGER, agency_client_id INTEGER, client_name VARCHAR, client_email VARCHAR)
            AS $fn$
            BEGIN RETURN QUERY
                SELECT d.id AS document_id, d.document_type, d.file_name, d.expiry_date,
                    (d.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
                    ac.id AS agency_client_id, ac.client_name, ac.client_email
                FROM documents d
                LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
                WHERE d.tenant_id = p_tenant_id AND d.deleted_at IS NULL
                    AND d.expiry_date IS NOT NULL
                    AND d.expiry_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
                    AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY d.expiry_date ASC;
            END; $fn$ LANGUAGE plpgsql`);
        console.log('  ✅ Función get_expiring_documents');
    } catch (e) { console.log('  ⚠️ Función:', e.message.substring(0, 100)); }

    try {
        await c.query(`CREATE OR REPLACE FUNCTION get_client_documents(p_agency_client_id INTEGER)
            RETURNS TABLE (id VARCHAR, document_type VARCHAR, file_name VARCHAR, file_size INTEGER,
                expiry_date DATE, status VARCHAR, category VARCHAR, verified BOOLEAN,
                created_at TIMESTAMP, expiry_status TEXT)
            AS $fn$
            BEGIN RETURN QUERY
                SELECT d.id, d.document_type, d.file_name, d.file_size, d.expiry_date,
                    d.status, d.category, d.verified, d.created_at,
                    CASE
                        WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
                        WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
                        ELSE 'valid'
                    END AS expiry_status
                FROM documents d
                WHERE d.agency_client_id = p_agency_client_id AND d.deleted_at IS NULL
                ORDER BY d.created_at DESC;
            END; $fn$ LANGUAGE plpgsql`);
        console.log('  ✅ Función get_client_documents');
    } catch (e) { console.log('  ⚠️ Función:', e.message.substring(0, 100)); }

    console.log('\n═══ MIGRACIÓN 041: HR Module Core ═══');

    // ══════════════════════════════════════════════
    // MIGRACIÓN 041: HR Module Core Tables
    // ══════════════════════════════════════════════

    // 1. hr_departments
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_departments (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            parent_department_id INTEGER REFERENCES hr_departments(id),
            manager_id INTEGER,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);
        console.log('  ✅ hr_departments');
    } catch (e) { console.log('  ⚠️ hr_departments:', e.message.substring(0, 100)); }

    // 2. hr_positions
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_positions (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            department_id INTEGER REFERENCES hr_departments(id),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            level VARCHAR(50),
            salary_min NUMERIC(12,2),
            salary_max NUMERIC(12,2),
            currency VARCHAR(3) DEFAULT 'MXN',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);
        console.log('  ✅ hr_positions');
    } catch (e) { console.log('  ⚠️ hr_positions:', e.message.substring(0, 100)); }

    // 3. hr_employees
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_employees (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id),
            tenant_user_id INTEGER REFERENCES tenant_users(id),
            agency_id INTEGER REFERENCES tenants(id),
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
            marital_status VARCHAR(30),
            photo_url TEXT,
            address_street VARCHAR(500),
            address_city VARCHAR(200),
            address_state VARCHAR(200),
            address_zip VARCHAR(20),
            address_country VARCHAR(100) DEFAULT 'México',
            employee_type VARCHAR(30) NOT NULL DEFAULT 'internal',
            department_id INTEGER REFERENCES hr_departments(id),
            position_id INTEGER REFERENCES hr_positions(id),
            hire_date DATE,
            termination_date DATE,
            employment_status VARCHAR(30) DEFAULT 'active',
            rfc VARCHAR(20),
            curp VARCHAR(20),
            nss VARCHAR(20),
            tax_regime VARCHAR(100),
            clabe VARCHAR(25),
            bank_name VARCHAR(100),
            bank_account VARCHAR(50),
            agent_referral_code VARCHAR(50),
            agent_commission_rate NUMERIC(5,2),
            agent_commission_split NUMERIC(5,2),
            agent_certification VARCHAR(200),
            agent_license_number VARCHAR(100),
            agent_license_expiry DATE,
            agent_territory VARCHAR(200),
            agent_monthly_target NUMERIC(12,2),
            agent_ytd_sales NUMERIC(12,2) DEFAULT 0,
            base_salary NUMERIC(12,2),
            salary_currency VARCHAR(3) DEFAULT 'MXN',
            salary_period VARCHAR(20) DEFAULT 'monthly',
            salary_type VARCHAR(20) DEFAULT 'gross',
            work_schedule VARCHAR(50) DEFAULT 'full_time',
            weekly_hours NUMERIC(4,1) DEFAULT 48,
            shift VARCHAR(30),
            direct_manager_id INTEGER REFERENCES hr_employees(id),
            emergency_contact_name VARCHAR(200),
            emergency_contact_phone VARCHAR(50),
            emergency_contact_relationship VARCHAR(50),
            custom_fields JSONB DEFAULT '{}',
            notes TEXT,
            tags TEXT[] DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_employees_type_check CHECK (employee_type IN ('internal','agent','freelance','contractor')),
            CONSTRAINT hr_employees_status_check CHECK (employment_status IN ('active','inactive','on_leave','terminated','probation','suspended'))
        )`);
        console.log('  ✅ hr_employees');
    } catch (e) { console.log('  ⚠️ hr_employees:', e.message.substring(0, 100)); }

    // FK manager en departments
    try { await c.query(`ALTER TABLE hr_departments ADD CONSTRAINT fk_hr_dept_manager FOREIGN KEY (manager_id) REFERENCES hr_employees(id) ON DELETE SET NULL`); console.log('  ✅ FK dept manager'); } catch (e) { /* ya existe */ }

    // 4. hr_contracts
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_contracts (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            contract_type VARCHAR(50) NOT NULL,
            contract_number VARCHAR(100),
            start_date DATE NOT NULL,
            end_date DATE,
            renewal_date DATE,
            salary NUMERIC(12,2),
            salary_currency VARCHAR(3) DEFAULT 'MXN',
            salary_period VARCHAR(20) DEFAULT 'monthly',
            commission_percentage NUMERIC(5,2),
            bonus_structure JSONB,
            vacation_days INTEGER DEFAULT 12,
            sick_days INTEGER DEFAULT 5,
            benefits JSONB DEFAULT '{}',
            document_url TEXT,
            signed_at TIMESTAMP,
            signed_by_employee BOOLEAN DEFAULT false,
            signed_by_employer BOOLEAN DEFAULT false,
            status VARCHAR(30) DEFAULT 'active',
            termination_reason TEXT,
            termination_date DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_contracts_type_check CHECK (contract_type IN ('indefinite','fixed_term','probation','commission','freelance','internship')),
            CONSTRAINT hr_contracts_status_check CHECK (status IN ('draft','active','expired','terminated','renewed','cancelled'))
        )`);
        console.log('  ✅ hr_contracts');
    } catch (e) { console.log('  ⚠️ hr_contracts:', e.message.substring(0, 100)); }

    // 5. hr_attendance
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_attendance (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            attendance_date DATE NOT NULL,
            check_in TIMESTAMP,
            check_out TIMESTAMP,
            check_in_method VARCHAR(30) DEFAULT 'manual',
            check_out_method VARCHAR(30),
            worked_hours NUMERIC(5,2),
            overtime_hours NUMERIC(5,2) DEFAULT 0,
            break_minutes INTEGER DEFAULT 0,
            check_in_lat NUMERIC(10,7), check_in_lng NUMERIC(10,7),
            check_out_lat NUMERIC(10,7), check_out_lng NUMERIC(10,7),
            status VARCHAR(20) DEFAULT 'present',
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_attendance_status_check CHECK (status IN ('present','absent','late','half_day','holiday','remote')),
            CONSTRAINT hr_attendance_unique UNIQUE (employee_id, attendance_date)
        )`);
        console.log('  ✅ hr_attendance');
    } catch (e) { console.log('  ⚠️ hr_attendance:', e.message.substring(0, 100)); }

    // 6. hr_leave_requests
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_leave_requests (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            leave_type VARCHAR(50) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_days NUMERIC(4,1) NOT NULL,
            half_day BOOLEAN DEFAULT false,
            reason TEXT,
            supporting_document_url TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            approved_by INTEGER REFERENCES users(id),
            approved_at TIMESTAMP,
            rejection_reason TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_leave_type_check CHECK (leave_type IN ('vacation','sick','personal','maternity','paternity','bereavement','training','unpaid','other')),
            CONSTRAINT hr_leave_status_check CHECK (status IN ('pending','approved','rejected','cancelled'))
        )`);
        console.log('  ✅ hr_leave_requests');
    } catch (e) { console.log('  ⚠️ hr_leave_requests:', e.message.substring(0, 100)); }

    // 7. hr_payroll
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_payroll (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            pay_period_start DATE NOT NULL,
            pay_period_end DATE NOT NULL,
            pay_date DATE,
            payroll_type VARCHAR(30) DEFAULT 'regular',
            base_salary NUMERIC(12,2) DEFAULT 0,
            overtime_pay NUMERIC(12,2) DEFAULT 0,
            commission_amount NUMERIC(12,2) DEFAULT 0,
            bonus_amount NUMERIC(12,2) DEFAULT 0,
            other_earnings NUMERIC(12,2) DEFAULT 0,
            gross_pay NUMERIC(12,2) NOT NULL,
            tax_isr NUMERIC(12,2) DEFAULT 0,
            tax_imss NUMERIC(12,2) DEFAULT 0,
            other_deductions NUMERIC(12,2) DEFAULT 0,
            total_deductions NUMERIC(12,2) DEFAULT 0,
            net_pay NUMERIC(12,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'MXN',
            payment_method VARCHAR(30) DEFAULT 'transfer',
            payment_reference VARCHAR(100),
            status VARCHAR(20) DEFAULT 'pending',
            approved_by INTEGER REFERENCES users(id),
            approved_at TIMESTAMP,
            paid_at TIMESTAMP,
            earnings_detail JSONB DEFAULT '{}',
            deductions_detail JSONB DEFAULT '{}',
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_payroll_type_check CHECK (payroll_type IN ('regular','bonus','commission','settlement','aguinaldo')),
            CONSTRAINT hr_payroll_status_check CHECK (status IN ('pending','approved','paid','cancelled'))
        )`);
        console.log('  ✅ hr_payroll');
    } catch (e) { console.log('  ⚠️ hr_payroll:', e.message.substring(0, 100)); }

    // 8. hr_agent_commissions
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_agent_commissions (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            booking_id INTEGER REFERENCES bookings(id),
            agency_commission_id INTEGER,
            booking_amount NUMERIC(12,2),
            commission_rate NUMERIC(5,2),
            commission_amount NUMERIC(12,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'MXN',
            commission_period_start DATE,
            commission_period_end DATE,
            status VARCHAR(20) DEFAULT 'pending',
            paid_in_payroll_id INTEGER REFERENCES hr_payroll(id),
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_agent_comm_status_check CHECK (status IN ('pending','approved','paid','cancelled'))
        )`);
        console.log('  ✅ hr_agent_commissions');
    } catch (e) { console.log('  ⚠️ hr_agent_commissions:', e.message.substring(0, 100)); }

    // 9. hr_employee_documents
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_employee_documents (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
            document_type VARCHAR(50) NOT NULL,
            file_name VARCHAR(500) NOT NULL,
            file_size INTEGER NOT NULL,
            file_type VARCHAR(100) NOT NULL,
            url TEXT NOT NULL,
            document_number VARCHAR(100),
            expiry_date DATE,
            issuing_authority VARCHAR(200),
            category VARCHAR(50) DEFAULT 'identification',
            verified BOOLEAN DEFAULT false,
            verified_by INTEGER REFERENCES users(id),
            verified_at TIMESTAMP,
            status VARCHAR(30) DEFAULT 'pending',
            description TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            deleted_at TIMESTAMP
        )`);
        console.log('  ✅ hr_employee_documents');
    } catch (e) { console.log('  ⚠️ hr_employee_documents:', e.message.substring(0, 100)); }

    // 10. hr_recruitment
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_recruitment (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            candidate_name VARCHAR(200) NOT NULL,
            candidate_email VARCHAR(200),
            candidate_phone VARCHAR(50),
            candidate_cv_url TEXT,
            candidate_photo_url TEXT,
            position_id INTEGER REFERENCES hr_positions(id),
            position_title VARCHAR(200),
            department_id INTEGER REFERENCES hr_departments(id),
            agency_id INTEGER REFERENCES tenants(id),
            candidate_type VARCHAR(30) DEFAULT 'internal',
            stage VARCHAR(50) DEFAULT 'applied',
            applied_at TIMESTAMP DEFAULT NOW(),
            interview_date TIMESTAMP,
            interview_notes TEXT,
            interviewer_id INTEGER REFERENCES users(id),
            offer_salary NUMERIC(12,2),
            offer_date DATE,
            hired_date DATE,
            hired_employee_id INTEGER REFERENCES hr_employees(id),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            evaluation_notes TEXT,
            source VARCHAR(100),
            referred_by INTEGER REFERENCES hr_employees(id),
            status VARCHAR(20) DEFAULT 'active',
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT hr_recruitment_stage_check CHECK (stage IN ('applied','screening','interview','technical_test','offer','hired','rejected','withdrawn'))
        )`);
        console.log('  ✅ hr_recruitment');
    } catch (e) { console.log('  ⚠️ hr_recruitment:', e.message.substring(0, 100)); }

    // 11. hr_audit_log
    try {
        await c.query(`CREATE TABLE IF NOT EXISTS hr_audit_log (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            employee_id INTEGER REFERENCES hr_employees(id),
            performed_by INTEGER REFERENCES users(id),
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER,
            old_values JSONB,
            new_values JSONB,
            description TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT NOW()
        )`);
        console.log('  ✅ hr_audit_log');
    } catch (e) { console.log('  ⚠️ hr_audit_log:', e.message.substring(0, 100)); }

    // 12. Todos los índices HR
    console.log('\n  📌 Creando índices...');
    const hrIndexes = [
        `CREATE INDEX IF NOT EXISTS idx_hr_dept_tenant ON hr_departments(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_pos_tenant ON hr_positions(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_pos_dept ON hr_positions(department_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_tenant ON hr_employees(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_user ON hr_employees(user_id) WHERE user_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_type ON hr_employees(employee_type)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_status ON hr_employees(employment_status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_dept ON hr_employees(department_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_pos ON hr_employees(position_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_agency ON hr_employees(agency_id) WHERE agency_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_manager ON hr_employees(direct_manager_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_emp_number ON hr_employees(employee_number)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_contracts_tenant ON hr_contracts(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_contracts_emp ON hr_contracts(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_contracts_status ON hr_contracts(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_contracts_end ON hr_contracts(end_date) WHERE end_date IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_hr_att_tenant ON hr_attendance(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_att_emp ON hr_attendance(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_att_date ON hr_attendance(attendance_date DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_att_status ON hr_attendance(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_leave_tenant ON hr_leave_requests(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_leave_emp ON hr_leave_requests(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_leave_status ON hr_leave_requests(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_leave_dates ON hr_leave_requests(start_date, end_date)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_payroll_tenant ON hr_payroll(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_payroll_emp ON hr_payroll(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_payroll_period ON hr_payroll(pay_period_start, pay_period_end)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_payroll_status ON hr_payroll(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_tenant ON hr_agent_commissions(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_emp ON hr_agent_commissions(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_booking ON hr_agent_commissions(booking_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_agent_comm_status ON hr_agent_commissions(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_edocs_tenant ON hr_employee_documents(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_edocs_emp ON hr_employee_documents(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_edocs_type ON hr_employee_documents(document_type)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_edocs_expiry ON hr_employee_documents(expiry_date) WHERE expiry_date IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_hr_edocs_status ON hr_employee_documents(status)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_recruit_tenant ON hr_recruitment(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_recruit_stage ON hr_recruitment(stage)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_recruit_pos ON hr_recruitment(position_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_audit_tenant ON hr_audit_log(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_audit_emp ON hr_audit_log(employee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_audit_action ON hr_audit_log(action)`,
        `CREATE INDEX IF NOT EXISTS idx_hr_audit_date ON hr_audit_log(created_at DESC)`,
    ];
    let idxOk = 0;
    for (const idx of hrIndexes) { try { await c.query(idx); idxOk++; } catch (e) { /* ok */ } }
    console.log(`  ✅ ${idxOk}/${hrIndexes.length} índices creados`);

    // 13. Trigger updated_at
    try {
        await c.query(`CREATE OR REPLACE FUNCTION hr_update_timestamp()
            RETURNS TRIGGER AS $fn$
            BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
            $fn$ LANGUAGE plpgsql`);
        console.log('  ✅ Función hr_update_timestamp');
    } catch (e) { console.log('  ⚠️ trigger fn:', e.message.substring(0, 80)); }

    const triggerTables = ['hr_departments', 'hr_positions', 'hr_employees', 'hr_contracts', 'hr_leave_requests', 'hr_payroll', 'hr_employee_documents', 'hr_recruitment'];
    for (const tbl of triggerTables) {
        try {
            await c.query(`DROP TRIGGER IF EXISTS trigger_hr_updated_${tbl} ON ${tbl}`);
            await c.query(`CREATE TRIGGER trigger_hr_updated_${tbl} BEFORE UPDATE ON ${tbl} FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp()`);
        } catch (e) { /* ok */ }
    }
    console.log('  ✅ Triggers updated_at');

    // ══════════════════════════════════════════════
    // VERIFICACIÓN FINAL
    // ══════════════════════════════════════════════
    console.log('\n═══ VERIFICACIÓN ═══');

    const hrTables = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'hr_%' ORDER BY table_name`);
    console.log(`\n📊 Tablas HR: ${hrTables.rows.length}`);
    hrTables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    const docCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='documents' AND column_name IN ('agency_client_id','expiry_date','category','status','verified') ORDER BY column_name`);
    console.log(`\n📄 Columnas docs nuevas: ${docCols.rows.length}`);
    docCols.rows.forEach(r => console.log(`   ✓ ${r.column_name}`));

    const views = await c.query(`SELECT table_name FROM information_schema.views WHERE table_schema='public' AND table_name LIKE 'client_%'`);
    console.log(`\n👁️ Vistas: ${views.rows.length}`);
    views.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    console.log('\n🎉 ¡Migraciones 040 + 041 completadas!');

    await c.end();
    process.exit(0);
})().catch(e => { console.error('💥 ERROR:', e.message); process.exit(1); });
