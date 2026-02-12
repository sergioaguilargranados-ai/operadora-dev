/**
 * API: HR Module (Recursos Humanos)
 * Endpoints centralizados para el módulo RRHH
 * v2.316 — 12 Feb 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { HRService } from '@/services/HRService'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'dashboard'
        const tenantId = parseInt(searchParams.get('tenant_id') || '1')

        // ─── Dashboard Stats ───
        if (action === 'dashboard') {
            const stats = await HRService.getDashboardStats(tenantId)
            return NextResponse.json({ success: true, data: stats })
        }

        // ─── Employees ───
        if (action === 'employees') {
            const result = await HRService.listEmployees({
                tenant_id: tenantId,
                employee_type: searchParams.get('employee_type') || undefined,
                department_id: searchParams.get('department_id') ? parseInt(searchParams.get('department_id')!) : undefined,
                employment_status: searchParams.get('employment_status') || undefined,
                agency_id: searchParams.get('agency_id') ? parseInt(searchParams.get('agency_id')!) : undefined,
                search: searchParams.get('search') || undefined,
                sort_by: searchParams.get('sort_by') || undefined,
                sort_order: searchParams.get('sort_order') || undefined,
                limit: parseInt(searchParams.get('limit') || '50'),
                offset: parseInt(searchParams.get('offset') || '0')
            })
            return NextResponse.json({ success: true, data: result.employees, meta: { total: result.total } })
        }

        // ─── Employee Detail ───
        if (action === 'employee_detail') {
            const id = parseInt(searchParams.get('id') || '0')
            if (!id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
            const employee = await HRService.getEmployeeById(id)
            if (!employee) return NextResponse.json({ success: false, error: 'Empleado no encontrado' }, { status: 404 })
            return NextResponse.json({ success: true, data: employee })
        }

        // ─── Departments ───
        if (action === 'departments') {
            const departments = await HRService.listDepartments(tenantId)
            return NextResponse.json({ success: true, data: departments })
        }

        // ─── Positions ───
        if (action === 'positions') {
            const deptId = searchParams.get('department_id') ? parseInt(searchParams.get('department_id')!) : undefined
            const positions = await HRService.listPositions(tenantId, deptId)
            return NextResponse.json({ success: true, data: positions })
        }

        // ─── Contracts ───
        if (action === 'contracts') {
            const empId = searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!) : undefined
            const contracts = await HRService.listContracts(tenantId, empId)
            return NextResponse.json({ success: true, data: contracts })
        }

        // ─── Attendance ───
        if (action === 'attendance') {
            const records = await HRService.getAttendance(tenantId, {
                employee_id: searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!) : undefined,
                start_date: searchParams.get('start_date') || undefined,
                end_date: searchParams.get('end_date') || undefined,
                status: searchParams.get('status') || undefined
            })
            return NextResponse.json({ success: true, data: records })
        }

        // ─── Leave Requests ───
        if (action === 'leaves') {
            const leaves = await HRService.listLeaveRequests(tenantId, {
                employee_id: searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!) : undefined,
                status: searchParams.get('status') || undefined
            })
            return NextResponse.json({ success: true, data: leaves })
        }

        // ─── Payroll ───
        if (action === 'payroll') {
            const payroll = await HRService.listPayroll(tenantId, {
                employee_id: searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!) : undefined,
                status: searchParams.get('status') || undefined,
                period_start: searchParams.get('period_start') || undefined,
                period_end: searchParams.get('period_end') || undefined
            })
            return NextResponse.json({ success: true, data: payroll })
        }

        // ─── Recruitment ───
        if (action === 'recruitment') {
            const candidates = await HRService.listRecruitment(tenantId, searchParams.get('stage') || undefined)
            return NextResponse.json({ success: true, data: candidates })
        }

        // ─── Audit Log ───
        if (action === 'audit') {
            const logs = await HRService.getAuditLog(tenantId, {
                employee_id: searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!) : undefined,
                action: searchParams.get('audit_action') || undefined,
                limit: parseInt(searchParams.get('limit') || '100')
            })
            return NextResponse.json({ success: true, data: logs })
        }

        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })

    } catch (error: unknown) {
        console.error('❌ HR GET error:', error)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        // ─── Create Employee ───
        if (action === 'create_employee') {
            if (!body.first_name || !body.last_name || !body.employee_type) {
                return NextResponse.json({
                    success: false,
                    error: 'Campos requeridos: first_name, last_name, employee_type'
                }, { status: 400 })
            }
            const employee = await HRService.createEmployee({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: employee }, { status: 201 })
        }

        // ─── Update Employee ───
        if (action === 'update_employee') {
            if (!body.id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
            const employee = await HRService.updateEmployee(body.id, body)
            return NextResponse.json({ success: true, data: employee })
        }

        // ─── Create Department ───
        if (action === 'create_department') {
            if (!body.name) return NextResponse.json({ success: false, error: 'name requerido' }, { status: 400 })
            const dept = await HRService.createDepartment(body.tenant_id || 1, body.name, body.description, body.manager_id)
            return NextResponse.json({ success: true, data: dept }, { status: 201 })
        }

        // ─── Create Position ───
        if (action === 'create_position') {
            if (!body.title) return NextResponse.json({ success: false, error: 'title requerido' }, { status: 400 })
            const pos = await HRService.createPosition({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: pos }, { status: 201 })
        }

        // ─── Create Contract ───
        if (action === 'create_contract') {
            if (!body.employee_id || !body.contract_type || !body.start_date) {
                return NextResponse.json({
                    success: false,
                    error: 'Campos requeridos: employee_id, contract_type, start_date'
                }, { status: 400 })
            }
            const contract = await HRService.createContract({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: contract }, { status: 201 })
        }

        // ─── Check In ───
        if (action === 'check_in') {
            if (!body.employee_id) return NextResponse.json({ success: false, error: 'employee_id requerido' }, { status: 400 })
            const record = await HRService.checkIn({
                tenant_id: body.tenant_id || 1,
                employee_id: body.employee_id,
                attendance_date: body.attendance_date || new Date().toISOString().split('T')[0],
                check_in: body.check_in,
                check_in_method: body.check_in_method,
                status: body.status
            })
            return NextResponse.json({ success: true, data: record })
        }

        // ─── Check Out ───
        if (action === 'check_out') {
            if (!body.employee_id) return NextResponse.json({ success: false, error: 'employee_id requerido' }, { status: 400 })
            const record = await HRService.checkOut(
                body.employee_id,
                body.attendance_date || new Date().toISOString().split('T')[0],
                body.check_out_method
            )
            return NextResponse.json({ success: true, data: record })
        }

        // ─── Create Leave Request ───
        if (action === 'create_leave') {
            if (!body.employee_id || !body.leave_type || !body.start_date || !body.end_date) {
                return NextResponse.json({
                    success: false,
                    error: 'Campos requeridos: employee_id, leave_type, start_date, end_date'
                }, { status: 400 })
            }
            const leave = await HRService.createLeaveRequest({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: leave }, { status: 201 })
        }

        // ─── Approve/Reject Leave ───
        if (action === 'approve_leave' || action === 'reject_leave') {
            if (!body.id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
            const result = await HRService.approveLeaveRequest(
                body.id,
                body.user_id || 1,
                action === 'approve_leave',
                body.reason
            )
            return NextResponse.json({ success: true, data: result })
        }

        // ─── Create Payroll ───
        if (action === 'create_payroll') {
            if (!body.employee_id || !body.pay_period_start || !body.pay_period_end) {
                return NextResponse.json({
                    success: false,
                    error: 'Campos requeridos: employee_id, pay_period_start, pay_period_end, gross_pay, net_pay'
                }, { status: 400 })
            }
            const payroll = await HRService.createPayroll({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: payroll }, { status: 201 })
        }

        // ─── Create Candidate (Recruitment) ───
        if (action === 'create_candidate') {
            if (!body.candidate_name) return NextResponse.json({ success: false, error: 'candidate_name requerido' }, { status: 400 })
            const candidate = await HRService.createCandidate({
                tenant_id: body.tenant_id || 1,
                ...body
            })
            return NextResponse.json({ success: true, data: candidate }, { status: 201 })
        }

        // ─── Update Candidate Stage ───
        if (action === 'update_candidate_stage') {
            if (!body.id || !body.stage) return NextResponse.json({ success: false, error: 'id y stage requeridos' }, { status: 400 })
            const result = await HRService.updateCandidateStage(body.id, body.stage, body.notes)
            return NextResponse.json({ success: true, data: result })
        }

        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })

    } catch (error: unknown) {
        console.error('❌ HR POST error:', error)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}
