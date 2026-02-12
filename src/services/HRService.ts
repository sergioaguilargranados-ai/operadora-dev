/**
 * HRService.ts
 * Servicio centralizado del módulo de Recursos Humanos
 * v2.316 — 12 Feb 2026
 *
 * Módulos:
 *   - Employees: CRUD, búsqueda, perfiles diferenciados
 *   - Contracts: Gestión de contratos
 *   - Attendance: Control de asistencia
 *   - Leaves: Solicitudes de ausencia
 *   - Payroll: Nómina y compensaciones
 *   - Commissions: Comisiones de agentes
 *   - Recruitment: Pipeline de reclutamiento
 *   - Audit: Log de auditoría
 */

import { query, queryOne } from '@/lib/db'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface HREmployeeInput {
    tenant_id: number
    user_id?: number
    tenant_user_id?: number
    agency_id?: number
    employee_number?: string
    first_name: string
    last_name: string
    middle_name?: string
    email?: string
    phone?: string
    mobile?: string
    personal_email?: string
    date_of_birth?: string
    gender?: string
    nationality?: string
    marital_status?: string
    photo_url?: string
    address_street?: string
    address_city?: string
    address_state?: string
    address_zip?: string
    address_country?: string
    employee_type: 'internal' | 'agent' | 'freelance' | 'contractor'
    department_id?: number
    position_id?: number
    hire_date?: string
    employment_status?: string
    rfc?: string
    curp?: string
    nss?: string
    tax_regime?: string
    clabe?: string
    bank_name?: string
    bank_account?: string
    agent_referral_code?: string
    agent_commission_rate?: number
    agent_commission_split?: number
    agent_certification?: string
    agent_license_number?: string
    agent_license_expiry?: string
    agent_territory?: string
    agent_monthly_target?: number
    base_salary?: number
    salary_currency?: string
    salary_period?: string
    work_schedule?: string
    weekly_hours?: number
    shift?: string
    direct_manager_id?: number
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    notes?: string
    tags?: string[]
}

export interface HREmployee extends HREmployeeInput {
    id: number
    full_name: string
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined
    department_name?: string
    position_title?: string
    manager_name?: string
    agency_name?: string
}

export interface HRContractInput {
    tenant_id: number
    employee_id: number
    contract_type: string
    contract_number?: string
    start_date: string
    end_date?: string
    renewal_date?: string
    salary?: number
    salary_currency?: string
    salary_period?: string
    commission_percentage?: number
    bonus_structure?: Record<string, unknown>
    vacation_days?: number
    sick_days?: number
    benefits?: Record<string, unknown>
    document_url?: string
    notes?: string
}

export interface HRContract extends HRContractInput {
    id: number
    status: string
    signed_at: string | null
    signed_by_employee: boolean
    signed_by_employer: boolean
    created_at: string
    updated_at: string
    employee_name?: string
}

export interface HRAttendanceInput {
    tenant_id: number
    employee_id: number
    attendance_date: string
    check_in?: string
    check_out?: string
    check_in_method?: string
    check_out_method?: string
    worked_hours?: number
    overtime_hours?: number
    break_minutes?: number
    status?: string
    notes?: string
}

export interface HRLeaveInput {
    tenant_id: number
    employee_id: number
    leave_type: string
    start_date: string
    end_date: string
    total_days: number
    half_day?: boolean
    reason?: string
    supporting_document_url?: string
}

export interface HRPayrollInput {
    tenant_id: number
    employee_id: number
    pay_period_start: string
    pay_period_end: string
    pay_date?: string
    payroll_type?: string
    base_salary?: number
    overtime_pay?: number
    commission_amount?: number
    bonus_amount?: number
    other_earnings?: number
    gross_pay: number
    tax_isr?: number
    tax_imss?: number
    other_deductions?: number
    total_deductions?: number
    net_pay: number
    currency?: string
    payment_method?: string
    earnings_detail?: Record<string, unknown>
    deductions_detail?: Record<string, unknown>
    notes?: string
}

export interface HRDepartment {
    id: number
    tenant_id: number
    name: string
    description: string | null
    parent_department_id: number | null
    manager_id: number | null
    is_active: boolean
    created_at: string
    employee_count?: number
    manager_name?: string
}

export interface HRPosition {
    id: number
    tenant_id: number
    department_id: number | null
    title: string
    description: string | null
    level: string | null
    salary_min: number | null
    salary_max: number | null
    is_active: boolean
    department_name?: string
    employee_count?: number
}

export interface HRRecruitmentInput {
    tenant_id: number
    candidate_name: string
    candidate_email?: string
    candidate_phone?: string
    candidate_cv_url?: string
    position_id?: number
    position_title?: string
    department_id?: number
    agency_id?: number
    candidate_type?: string
    source?: string
    referred_by?: number
    notes?: string
}

// ═══════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════

export class HRService {

    // ─────────────────── EMPLOYEES ───────────────────

    static async createEmployee(data: HREmployeeInput): Promise<HREmployee> {
        const empNumber = data.employee_number || `EMP-${Date.now().toString(36).toUpperCase()}`

        const result = await queryOne<HREmployee>(
            `INSERT INTO hr_employees (
        tenant_id, user_id, tenant_user_id, agency_id,
        employee_number, first_name, last_name, middle_name,
        email, phone, mobile, personal_email,
        date_of_birth, gender, nationality, marital_status, photo_url,
        address_street, address_city, address_state, address_zip, address_country,
        employee_type, department_id, position_id, hire_date, employment_status,
        rfc, curp, nss, tax_regime, clabe, bank_name, bank_account,
        agent_referral_code, agent_commission_rate, agent_commission_split,
        agent_certification, agent_license_number, agent_license_expiry,
        agent_territory, agent_monthly_target,
        base_salary, salary_currency, salary_period,
        work_schedule, weekly_hours, shift,
        direct_manager_id,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        notes, tags
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
        $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52
      ) RETURNING *`,
            [
                data.tenant_id, data.user_id || null, data.tenant_user_id || null, data.agency_id || null,
                empNumber, data.first_name, data.last_name, data.middle_name || null,
                data.email || null, data.phone || null, data.mobile || null, data.personal_email || null,
                data.date_of_birth || null, data.gender || null, data.nationality || null,
                data.marital_status || null, data.photo_url || null,
                data.address_street || null, data.address_city || null, data.address_state || null,
                data.address_zip || null, data.address_country || 'México',
                data.employee_type, data.department_id || null, data.position_id || null,
                data.hire_date || null, data.employment_status || 'active',
                data.rfc || null, data.curp || null, data.nss || null,
                data.tax_regime || null, data.clabe || null, data.bank_name || null, data.bank_account || null,
                data.agent_referral_code || null, data.agent_commission_rate || null,
                data.agent_commission_split || null,
                data.agent_certification || null, data.agent_license_number || null,
                data.agent_license_expiry || null,
                data.agent_territory || null, data.agent_monthly_target || null,
                data.base_salary || null, data.salary_currency || 'MXN', data.salary_period || 'monthly',
                data.work_schedule || 'full_time', data.weekly_hours || 48, data.shift || null,
                data.direct_manager_id || null,
                data.emergency_contact_name || null, data.emergency_contact_phone || null,
                data.emergency_contact_relationship || null,
                data.notes || null, data.tags || '{}'
            ]
        )

        // Audit log
        await this.logAudit(data.tenant_id, result!.id, null, 'created', 'employee', result!.id, null, data, `Empleado ${data.first_name} ${data.last_name} creado`)

        return result!
    }

    static async updateEmployee(id: number, data: Partial<HREmployeeInput>): Promise<HREmployee | null> {
        const fields: string[] = []
        const values: unknown[] = []
        let idx = 2

        const addField = (name: string, value: unknown) => {
            if (value !== undefined) {
                fields.push(`${name} = $${idx++}`)
                values.push(value)
            }
        }

        addField('first_name', data.first_name)
        addField('last_name', data.last_name)
        addField('middle_name', data.middle_name)
        addField('email', data.email)
        addField('phone', data.phone)
        addField('mobile', data.mobile)
        addField('personal_email', data.personal_email)
        addField('date_of_birth', data.date_of_birth)
        addField('gender', data.gender)
        addField('nationality', data.nationality)
        addField('marital_status', data.marital_status)
        addField('photo_url', data.photo_url)
        addField('address_street', data.address_street)
        addField('address_city', data.address_city)
        addField('address_state', data.address_state)
        addField('address_zip', data.address_zip)
        addField('address_country', data.address_country)
        addField('employee_type', data.employee_type)
        addField('department_id', data.department_id)
        addField('position_id', data.position_id)
        addField('hire_date', data.hire_date)
        addField('employment_status', data.employment_status)
        addField('rfc', data.rfc)
        addField('curp', data.curp)
        addField('nss', data.nss)
        addField('tax_regime', data.tax_regime)
        addField('clabe', data.clabe)
        addField('bank_name', data.bank_name)
        addField('bank_account', data.bank_account)
        addField('agent_referral_code', data.agent_referral_code)
        addField('agent_commission_rate', data.agent_commission_rate)
        addField('agent_commission_split', data.agent_commission_split)
        addField('agent_certification', data.agent_certification)
        addField('agent_license_number', data.agent_license_number)
        addField('agent_license_expiry', data.agent_license_expiry)
        addField('agent_territory', data.agent_territory)
        addField('agent_monthly_target', data.agent_monthly_target)
        addField('base_salary', data.base_salary)
        addField('salary_currency', data.salary_currency)
        addField('salary_period', data.salary_period)
        addField('work_schedule', data.work_schedule)
        addField('weekly_hours', data.weekly_hours)
        addField('shift', data.shift)
        addField('direct_manager_id', data.direct_manager_id)
        addField('emergency_contact_name', data.emergency_contact_name)
        addField('emergency_contact_phone', data.emergency_contact_phone)
        addField('emergency_contact_relationship', data.emergency_contact_relationship)
        addField('notes', data.notes)
        addField('tags', data.tags)
        addField('agency_id', data.agency_id)

        if (fields.length === 0) return this.getEmployeeById(id)

        const result = await queryOne<HREmployee>(
            `UPDATE hr_employees SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...values]
        )

        return result
    }

    static async getEmployeeById(id: number): Promise<HREmployee | null> {
        return queryOne<HREmployee>(
            `SELECT e.*,
        d.name AS department_name,
        p.title AS position_title,
        m.first_name || ' ' || m.last_name AS manager_name,
        t.company_name AS agency_name
      FROM hr_employees e
      LEFT JOIN hr_departments d ON e.department_id = d.id
      LEFT JOIN hr_positions p ON e.position_id = p.id
      LEFT JOIN hr_employees m ON e.direct_manager_id = m.id
      LEFT JOIN tenants t ON e.agency_id = t.id
      WHERE e.id = $1 AND e.is_active = true`,
            [id]
        )
    }

    static async listEmployees(filters: {
        tenant_id: number
        employee_type?: string
        department_id?: number
        employment_status?: string
        agency_id?: number
        search?: string
        sort_by?: string
        sort_order?: string
        limit?: number
        offset?: number
    }): Promise<{ employees: HREmployee[]; total: number }> {
        let where = `WHERE e.tenant_id = $1 AND e.is_active = true`
        const params: unknown[] = [filters.tenant_id]
        let idx = 2

        if (filters.employee_type) {
            where += ` AND e.employee_type = $${idx++}`
            params.push(filters.employee_type)
        }
        if (filters.department_id) {
            where += ` AND e.department_id = $${idx++}`
            params.push(filters.department_id)
        }
        if (filters.employment_status) {
            where += ` AND e.employment_status = $${idx++}`
            params.push(filters.employment_status)
        }
        if (filters.agency_id) {
            where += ` AND e.agency_id = $${idx++}`
            params.push(filters.agency_id)
        }
        if (filters.search) {
            where += ` AND (e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.email ILIKE $${idx} OR e.employee_number ILIKE $${idx})`
            params.push(`%${filters.search}%`)
            idx++
        }

        const countResult = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM hr_employees e ${where}`,
            params
        )

        const sortCol = filters.sort_by || 'created_at'
        const sortDir = filters.sort_order === 'asc' ? 'ASC' : 'DESC'

        let dataSql = `
      SELECT e.*,
        d.name AS department_name,
        p.title AS position_title,
        m.first_name || ' ' || m.last_name AS manager_name,
        t.company_name AS agency_name
      FROM hr_employees e
      LEFT JOIN hr_departments d ON e.department_id = d.id
      LEFT JOIN hr_positions p ON e.position_id = p.id
      LEFT JOIN hr_employees m ON e.direct_manager_id = m.id
      LEFT JOIN tenants t ON e.agency_id = t.id
      ${where}
      ORDER BY e.${sortCol} ${sortDir}
    `

        const dataParams = [...params]
        if (filters.limit) {
            dataSql += ` LIMIT $${idx++}`
            dataParams.push(filters.limit)
        }
        if (filters.offset) {
            dataSql += ` OFFSET $${idx++}`
            dataParams.push(filters.offset)
        }

        const dataResult = await query<HREmployee>(dataSql, dataParams)

        return {
            employees: dataResult.rows,
            total: parseInt(countResult?.total || '0')
        }
    }

    // ─────────────────── DEPARTMENTS ───────────────────

    static async createDepartment(tenantId: number, name: string, description?: string, managerId?: number): Promise<HRDepartment> {
        const result = await queryOne<HRDepartment>(
            `INSERT INTO hr_departments (tenant_id, name, description, manager_id)
      VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, name, description || null, managerId || null]
        )
        return result!
    }

    static async listDepartments(tenantId: number): Promise<HRDepartment[]> {
        const result = await query<HRDepartment>(
            `SELECT d.*,
        m.first_name || ' ' || m.last_name AS manager_name,
        COALESCE(ec.cnt, 0) AS employee_count
      FROM hr_departments d
      LEFT JOIN hr_employees m ON d.manager_id = m.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM hr_employees e WHERE e.department_id = d.id AND e.is_active = true
      ) ec ON true
      WHERE d.tenant_id = $1 AND d.is_active = true
      ORDER BY d.name`,
            [tenantId]
        )
        return result.rows
    }

    // ─────────────────── POSITIONS ───────────────────

    static async createPosition(data: { tenant_id: number; department_id?: number; title: string; description?: string; level?: string; salary_min?: number; salary_max?: number }): Promise<HRPosition> {
        const result = await queryOne<HRPosition>(
            `INSERT INTO hr_positions (tenant_id, department_id, title, description, level, salary_min, salary_max)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [data.tenant_id, data.department_id || null, data.title, data.description || null, data.level || null, data.salary_min || null, data.salary_max || null]
        )
        return result!
    }

    static async listPositions(tenantId: number, departmentId?: number): Promise<HRPosition[]> {
        let sql = `
      SELECT p.*,
        d.name AS department_name,
        COALESCE(ec.cnt, 0) AS employee_count
      FROM hr_positions p
      LEFT JOIN hr_departments d ON p.department_id = d.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM hr_employees e WHERE e.position_id = p.id AND e.is_active = true
      ) ec ON true
      WHERE p.tenant_id = $1 AND p.is_active = true
    `
        const params: unknown[] = [tenantId]
        if (departmentId) {
            sql += ` AND p.department_id = $2`
            params.push(departmentId)
        }
        sql += ` ORDER BY p.title`
        const result = await query<HRPosition>(sql, params)
        return result.rows
    }

    // ─────────────────── CONTRACTS ───────────────────

    static async createContract(data: HRContractInput): Promise<HRContract> {
        const result = await queryOne<HRContract>(
            `INSERT INTO hr_contracts (
        tenant_id, employee_id, contract_type, contract_number,
        start_date, end_date, renewal_date,
        salary, salary_currency, salary_period,
        commission_percentage, bonus_structure,
        vacation_days, sick_days, benefits,
        document_url, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) RETURNING *`,
            [
                data.tenant_id, data.employee_id, data.contract_type,
                data.contract_number || `CTR-${Date.now().toString(36).toUpperCase()}`,
                data.start_date, data.end_date || null, data.renewal_date || null,
                data.salary || null, data.salary_currency || 'MXN', data.salary_period || 'monthly',
                data.commission_percentage || null,
                data.bonus_structure ? JSON.stringify(data.bonus_structure) : null,
                data.vacation_days || 12, data.sick_days || 5,
                data.benefits ? JSON.stringify(data.benefits) : '{}',
                data.document_url || null, data.notes || null
            ]
        )

        await this.logAudit(data.tenant_id, data.employee_id, null, 'created', 'contract', result!.id, null, data, `Contrato ${data.contract_type} creado`)

        return result!
    }

    static async listContracts(tenantId: number, employeeId?: number): Promise<HRContract[]> {
        let sql = `
      SELECT c.*, e.first_name || ' ' || e.last_name AS employee_name
      FROM hr_contracts c
      JOIN hr_employees e ON c.employee_id = e.id
      WHERE c.tenant_id = $1
    `
        const params: unknown[] = [tenantId]
        if (employeeId) {
            sql += ` AND c.employee_id = $2`
            params.push(employeeId)
        }
        sql += ` ORDER BY c.created_at DESC`
        const result = await query<HRContract>(sql, params)
        return result.rows
    }

    // ─────────────────── ATTENDANCE ───────────────────

    static async checkIn(data: HRAttendanceInput): Promise<unknown> {
        return queryOne(
            `INSERT INTO hr_attendance (tenant_id, employee_id, attendance_date, check_in, check_in_method, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (employee_id, attendance_date) DO UPDATE SET check_in = $4, check_in_method = $5, status = $6
      RETURNING *`,
            [data.tenant_id, data.employee_id, data.attendance_date, data.check_in || new Date().toISOString(), data.check_in_method || 'manual', data.status || 'present']
        )
    }

    static async checkOut(employeeId: number, date: string, method?: string): Promise<unknown> {
        return queryOne(
            `UPDATE hr_attendance SET
        check_out = NOW(),
        check_out_method = $3,
        worked_hours = EXTRACT(EPOCH FROM (NOW() - check_in)) / 3600
      WHERE employee_id = $1 AND attendance_date = $2
      RETURNING *`,
            [employeeId, date, method || 'manual']
        )
    }

    static async getAttendance(tenantId: number, filters: { employee_id?: number; start_date?: string; end_date?: string; status?: string }): Promise<unknown[]> {
        let sql = `
      SELECT a.*, e.first_name || ' ' || e.last_name AS employee_name, e.employee_number
      FROM hr_attendance a
      JOIN hr_employees e ON a.employee_id = e.id
      WHERE a.tenant_id = $1
    `
        const params: unknown[] = [tenantId]
        let idx = 2

        if (filters.employee_id) { sql += ` AND a.employee_id = $${idx++}`; params.push(filters.employee_id) }
        if (filters.start_date) { sql += ` AND a.attendance_date >= $${idx++}`; params.push(filters.start_date) }
        if (filters.end_date) { sql += ` AND a.attendance_date <= $${idx++}`; params.push(filters.end_date) }
        if (filters.status) { sql += ` AND a.status = $${idx++}`; params.push(filters.status) }

        sql += ` ORDER BY a.attendance_date DESC, e.first_name`
        const result = await query(sql, params)
        return result.rows
    }

    // ─────────────────── LEAVE REQUESTS ───────────────────

    static async createLeaveRequest(data: HRLeaveInput): Promise<unknown> {
        const result = await queryOne(
            `INSERT INTO hr_leave_requests (
        tenant_id, employee_id, leave_type,
        start_date, end_date, total_days, half_day,
        reason, supporting_document_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [
                data.tenant_id, data.employee_id, data.leave_type,
                data.start_date, data.end_date, data.total_days,
                data.half_day || false, data.reason || null,
                data.supporting_document_url || null
            ]
        )

        await this.logAudit(data.tenant_id, data.employee_id, null, 'created', 'leave', (result as any)?.id, null, data, `Solicitud de ${data.leave_type} creada`)

        return result
    }

    static async approveLeaveRequest(leaveId: number, userId: number, approved: boolean, reason?: string): Promise<unknown> {
        return queryOne(
            `UPDATE hr_leave_requests SET
        status = $2,
        approved_by = $3,
        approved_at = NOW(),
        rejection_reason = $4,
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
            [leaveId, approved ? 'approved' : 'rejected', userId, reason || null]
        )
    }

    static async listLeaveRequests(tenantId: number, filters?: { employee_id?: number; status?: string }): Promise<unknown[]> {
        let sql = `
      SELECT lr.*, e.first_name || ' ' || e.last_name AS employee_name, e.employee_number
      FROM hr_leave_requests lr
      JOIN hr_employees e ON lr.employee_id = e.id
      WHERE lr.tenant_id = $1
    `
        const params: unknown[] = [tenantId]
        let idx = 2
        if (filters?.employee_id) { sql += ` AND lr.employee_id = $${idx++}`; params.push(filters.employee_id) }
        if (filters?.status) { sql += ` AND lr.status = $${idx++}`; params.push(filters.status) }
        sql += ` ORDER BY lr.created_at DESC`
        const result = await query(sql, params)
        return result.rows
    }

    // ─────────────────── PAYROLL ───────────────────

    static async createPayroll(data: HRPayrollInput): Promise<unknown> {
        return queryOne(
            `INSERT INTO hr_payroll (
        tenant_id, employee_id,
        pay_period_start, pay_period_end, pay_date, payroll_type,
        base_salary, overtime_pay, commission_amount, bonus_amount, other_earnings,
        gross_pay, tax_isr, tax_imss, other_deductions, total_deductions,
        net_pay, currency, payment_method,
        earnings_detail, deductions_detail, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING *`,
            [
                data.tenant_id, data.employee_id,
                data.pay_period_start, data.pay_period_end, data.pay_date || null,
                data.payroll_type || 'regular',
                data.base_salary || 0, data.overtime_pay || 0, data.commission_amount || 0,
                data.bonus_amount || 0, data.other_earnings || 0,
                data.gross_pay, data.tax_isr || 0, data.tax_imss || 0,
                data.other_deductions || 0, data.total_deductions || 0,
                data.net_pay, data.currency || 'MXN', data.payment_method || 'transfer',
                data.earnings_detail ? JSON.stringify(data.earnings_detail) : '{}',
                data.deductions_detail ? JSON.stringify(data.deductions_detail) : '{}',
                data.notes || null
            ]
        )
    }

    static async listPayroll(tenantId: number, filters?: { employee_id?: number; status?: string; period_start?: string; period_end?: string }): Promise<unknown[]> {
        let sql = `
      SELECT pr.*, e.first_name || ' ' || e.last_name AS employee_name, e.employee_number, e.employee_type
      FROM hr_payroll pr
      JOIN hr_employees e ON pr.employee_id = e.id
      WHERE pr.tenant_id = $1
    `
        const params: unknown[] = [tenantId]
        let idx = 2
        if (filters?.employee_id) { sql += ` AND pr.employee_id = $${idx++}`; params.push(filters.employee_id) }
        if (filters?.status) { sql += ` AND pr.status = $${idx++}`; params.push(filters.status) }
        if (filters?.period_start) { sql += ` AND pr.pay_period_start >= $${idx++}`; params.push(filters.period_start) }
        if (filters?.period_end) { sql += ` AND pr.pay_period_end <= $${idx++}`; params.push(filters.period_end) }
        sql += ` ORDER BY pr.pay_period_start DESC`
        const result = await query(sql, params)
        return result.rows
    }

    // ─────────────────── RECRUITMENT ───────────────────

    static async createCandidate(data: HRRecruitmentInput): Promise<unknown> {
        return queryOne(
            `INSERT INTO hr_recruitment (
        tenant_id, candidate_name, candidate_email, candidate_phone,
        candidate_cv_url, position_id, position_title,
        department_id, agency_id, candidate_type, source, referred_by, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
            [
                data.tenant_id, data.candidate_name, data.candidate_email || null,
                data.candidate_phone || null, data.candidate_cv_url || null,
                data.position_id || null, data.position_title || null,
                data.department_id || null, data.agency_id || null,
                data.candidate_type || 'internal', data.source || null,
                data.referred_by || null, data.notes || null
            ]
        )
    }

    static async updateCandidateStage(candidateId: number, stage: string, notes?: string): Promise<unknown> {
        return queryOne(
            `UPDATE hr_recruitment SET stage = $2, evaluation_notes = COALESCE($3, evaluation_notes), updated_at = NOW()
      WHERE id = $1 RETURNING *`,
            [candidateId, stage, notes || null]
        )
    }

    static async listRecruitment(tenantId: number, stage?: string): Promise<unknown[]> {
        let sql = `
      SELECT r.*, p.title AS position_name, d.name AS department_name
      FROM hr_recruitment r
      LEFT JOIN hr_positions p ON r.position_id = p.id
      LEFT JOIN hr_departments d ON r.department_id = d.id
      WHERE r.tenant_id = $1 AND r.status = 'active'
    `
        const params: unknown[] = [tenantId]
        if (stage) { sql += ` AND r.stage = $2`; params.push(stage) }
        sql += ` ORDER BY r.created_at DESC`
        const result = await query(sql, params)
        return result.rows
    }

    // ─────────────────── DASHBOARD STATS ───────────────────

    static async getDashboardStats(tenantId: number): Promise<{
        total_employees: number
        active_employees: number
        internal_count: number
        agent_count: number
        freelance_count: number
        on_leave: number
        pending_leaves: number
        active_contracts: number
        expiring_contracts: number
        open_positions: number
        attendance_today: number
        absent_today: number
        total_payroll_this_month: number
        pending_commissions: number
    }> {
        const [empStats, leaveStats, contractStats, recruitStats, attendanceStats, payrollStats] = await Promise.all([
            queryOne<{
                total: string; active: string; internal: string; agent: string;
                freelance: string; on_leave: string
            }>(
                `SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE employment_status = 'active') as active,
          COUNT(*) FILTER (WHERE employee_type = 'internal') as internal,
          COUNT(*) FILTER (WHERE employee_type = 'agent') as agent,
          COUNT(*) FILTER (WHERE employee_type = 'freelance') as freelance,
          COUNT(*) FILTER (WHERE employment_status = 'on_leave') as on_leave
        FROM hr_employees WHERE tenant_id = $1 AND is_active = true`,
                [tenantId]
            ),
            queryOne<{ pending: string }>(
                `SELECT COUNT(*) as pending FROM hr_leave_requests WHERE tenant_id = $1 AND status = 'pending'`,
                [tenantId]
            ),
            queryOne<{ active: string; expiring: string }>(
                `SELECT
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE end_date IS NOT NULL AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as expiring
        FROM hr_contracts WHERE tenant_id = $1`,
                [tenantId]
            ),
            queryOne<{ open_pos: string }>(
                `SELECT COUNT(*) as open_pos FROM hr_recruitment WHERE tenant_id = $1 AND status = 'active' AND stage NOT IN ('hired', 'rejected', 'withdrawn')`,
                [tenantId]
            ),
            queryOne<{ present: string; absent: string }>(
                `SELECT
          COUNT(*) FILTER (WHERE status IN ('present', 'late', 'remote')) as present,
          COUNT(*) FILTER (WHERE status = 'absent') as absent
        FROM hr_attendance WHERE tenant_id = $1 AND attendance_date = CURRENT_DATE`,
                [tenantId]
            ),
            queryOne<{ total: string; commissions: string }>(
                `SELECT
          COALESCE(SUM(net_pay), 0) as total,
          0 as commissions
        FROM hr_payroll
        WHERE tenant_id = $1 AND pay_period_start >= DATE_TRUNC('month', CURRENT_DATE)`,
                [tenantId]
            )
        ])

        return {
            total_employees: parseInt(empStats?.total || '0'),
            active_employees: parseInt(empStats?.active || '0'),
            internal_count: parseInt(empStats?.internal || '0'),
            agent_count: parseInt(empStats?.agent || '0'),
            freelance_count: parseInt(empStats?.freelance || '0'),
            on_leave: parseInt(empStats?.on_leave || '0'),
            pending_leaves: parseInt(leaveStats?.pending || '0'),
            active_contracts: parseInt(contractStats?.active || '0'),
            expiring_contracts: parseInt(contractStats?.expiring || '0'),
            open_positions: parseInt(recruitStats?.open_pos || '0'),
            attendance_today: parseInt(attendanceStats?.present || '0'),
            absent_today: parseInt(attendanceStats?.absent || '0'),
            total_payroll_this_month: parseFloat(payrollStats?.total || '0'),
            pending_commissions: parseFloat(payrollStats?.commissions || '0')
        }
    }

    // ─────────────────── AUDIT LOG ───────────────────

    static async logAudit(
        tenantId: number,
        employeeId: number | null,
        performedBy: number | null,
        action: string,
        entityType: string,
        entityId: number | null,
        oldValues: unknown,
        newValues: unknown,
        description: string
    ): Promise<void> {
        try {
            await query(
                `INSERT INTO hr_audit_log (tenant_id, employee_id, performed_by, action, entity_type, entity_id, old_values, new_values, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    tenantId, employeeId, performedBy, action, entityType,
                    entityId,
                    oldValues ? JSON.stringify(oldValues) : null,
                    newValues ? JSON.stringify(newValues) : null,
                    description
                ]
            )
        } catch (err) {
            console.error('HR Audit log error:', err)
        }
    }

    static async getAuditLog(tenantId: number, filters?: { employee_id?: number; action?: string; limit?: number }): Promise<unknown[]> {
        let sql = `
      SELECT al.*, e.first_name || ' ' || e.last_name AS employee_name, u.name AS performed_by_name
      FROM hr_audit_log al
      LEFT JOIN hr_employees e ON al.employee_id = e.id
      LEFT JOIN users u ON al.performed_by = u.id
      WHERE al.tenant_id = $1
    `
        const params: unknown[] = [tenantId]
        let idx = 2
        if (filters?.employee_id) { sql += ` AND al.employee_id = $${idx++}`; params.push(filters.employee_id) }
        if (filters?.action) { sql += ` AND al.action = $${idx++}`; params.push(filters.action) }
        sql += ` ORDER BY al.created_at DESC LIMIT $${idx++}`
        params.push(filters?.limit || 100)
        const result = await query(sql, params)
        return result.rows
    }
}
