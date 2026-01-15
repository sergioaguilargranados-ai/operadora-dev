/**
 * ApprovalService - Gestión de aprobaciones de viajes corporativos
 *
 * Flujo:
 * 1. Empleado crea booking con requiresApproval=true
 * 2. Se crea registro en travel_approvals (status=pending)
 * 3. Manager recibe notificación
 * 4. Manager aprueba/rechaza
 * 5. Se actualiza booking y se notifica a empleado
 */

import { db } from '@/lib/db'
import NotificationService from './NotificationService'

interface CreateApprovalParams {
  bookingId: number
  requestedBy: number
  tenantId: number
  amount: number
  destination: string
  travelDates: string
}

interface ApprovalAction {
  approvalId: number
  approvedBy: number
  status: 'approved' | 'rejected'
  reason?: string
}

interface Approval {
  id: number
  booking_id: number
  requested_by: number
  approved_by: number | null
  status: string
  reason: string | null
  created_at: Date
  updated_at: Date
  // Datos enriquecidos
  employee_name?: string
  employee_email?: string
  manager_name?: string
  booking_details?: any
}

export class ApprovalService {

  /**
   * Crear solicitud de aprobación
   */
  static async createApproval(params: CreateApprovalParams): Promise<Approval> {
    const { bookingId, requestedBy, tenantId } = params

    // Obtener manager del empleado
    const employee = await db.queryOne<any>(
      `SELECT u.*, tu.manager_id
       FROM users u
       JOIN tenant_users tu ON u.id = tu.user_id
       WHERE u.id = $1 AND tu.tenant_id = $2`,
      [requestedBy, tenantId]
    )

    if (!employee) {
      throw new Error('Empleado no encontrado')
    }

    // Crear registro de aprobación
    const approval = await db.insertOne<Approval>(
      `INSERT INTO travel_approvals
       (booking_id, requested_by, status, created_at)
       VALUES ($1, $2, 'pending', NOW())
       RETURNING *`,
      [bookingId, requestedBy]
    )

    // Enviar notificación al manager
    if (employee.manager_id) {
      await this.notifyManager(employee.manager_id, approval, params)
    }

    return approval
  }

  /**
   * Obtener aprobaciones pendientes
   */
  static async getPendingApprovals(
    tenantId: number,
    managerId?: number
  ): Promise<Approval[]> {
    let query = `
      SELECT
        ta.*,
        emp.name as employee_name,
        emp.email as employee_email,
        mgr.name as manager_name,
        ta.estimated_cost as total_price,
        ta.reason_for_travel as destination,
        CURRENT_DATE as start_date,
        CURRENT_DATE + 7 as end_date,
        'flight' as service_type,
        json_build_object(
          'id', COALESCE(b.id, 0),
          'total_price', ta.estimated_cost,
          'destination', ta.reason_for_travel,
          'start_date', CURRENT_DATE,
          'end_date', CURRENT_DATE + 7,
          'service_type', 'flight',
          'details', '{}'::jsonb
        ) as booking_details
      FROM travel_approvals ta
      LEFT JOIN bookings b ON ta.booking_id = b.id
      JOIN users emp ON ta.requested_by = emp.id
      LEFT JOIN users mgr ON ta.approved_by = mgr.id
      WHERE ta.status = 'pending'
        AND ta.tenant_id = $1
    `

    const params: any[] = [tenantId]

    if (managerId) {
      // Filtrar por manager si se proporciona
      query += ` AND ta.approved_by = $2`
      params.push(managerId)
    }

    query += ` ORDER BY ta.created_at DESC`

    return await db.queryMany<Approval>(query, params)
  }

  /**
   * Aprobar solicitud
   */
  static async approve(action: ApprovalAction): Promise<Approval> {
    const { approvalId, approvedBy, reason } = action

    // Actualizar aprobación
    const approvalResult = await db.query<Approval>(
      `UPDATE travel_approvals
       SET status = 'approved',
           approved_by = $1,
           reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [approvedBy, reason || 'Aprobado', approvalId]
    )

    const approval = approvalResult.rows[0]
    if (!approval) {
      throw new Error('Aprobación no encontrada')
    }

    // Actualizar booking a confirmado
    await db.query(
      `UPDATE bookings
       SET status = 'confirmed',
           approved_at = NOW()
       WHERE id = $1`,
      [approval.booking_id]
    )

    // Notificar a empleado
    await this.notifyEmployee(approval, 'approved')

    // Notificar a travel manager
    await this.notifyTravelManager(approval)

    return approval
  }

  /**
   * Rechazar solicitud
   */
  static async reject(action: ApprovalAction): Promise<Approval> {
    const { approvalId, approvedBy, reason } = action

    if (!reason) {
      throw new Error('Se requiere una razón para rechazar')
    }

    // Actualizar aprobación
    const approvalResult = await db.query<Approval>(
      `UPDATE travel_approvals
       SET status = 'rejected',
           approved_by = $1,
           reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [approvedBy, reason, approvalId]
    )

    const approval = approvalResult.rows[0]
    if (!approval) {
      throw new Error('Aprobación no encontrada')
    }

    // Actualizar booking a cancelado
    await db.query(
      `UPDATE bookings
       SET status = 'cancelled',
           cancelled_at = NOW()
       WHERE id = $1`,
      [approval.booking_id]
    )

    // Notificar a empleado
    await this.notifyEmployee(approval, 'rejected')

    return approval
  }

  /**
   * Obtener historial de aprobaciones
   */
  static async getHistory(
    tenantId: number,
    filters?: {
      employeeId?: number
      managerId?: number
      status?: string
      dateFrom?: string
      dateTo?: string
    }
  ): Promise<Approval[]> {
    let query = `
      SELECT
        ta.*,
        emp.name as employee_name,
        emp.email as employee_email,
        mgr.name as manager_name,
        b.total_price,
        b.destination,
        b.start_date,
        b.end_date
      FROM travel_approvals ta
      JOIN bookings b ON ta.booking_id = b.id
      JOIN users emp ON ta.requested_by = emp.id
      LEFT JOIN users mgr ON ta.approved_by = mgr.id
      WHERE b.tenant_id = $1
    `

    const params: any[] = [tenantId]
    let paramIndex = 2

    if (filters?.employeeId) {
      query += ` AND ta.requested_by = $${paramIndex}`
      params.push(filters.employeeId)
      paramIndex++
    }

    if (filters?.managerId) {
      query += ` AND ta.approved_by = $${paramIndex}`
      params.push(filters.managerId)
      paramIndex++
    }

    if (filters?.status) {
      query += ` AND ta.status = $${paramIndex}`
      params.push(filters.status)
      paramIndex++
    }

    if (filters?.dateFrom) {
      query += ` AND ta.created_at >= $${paramIndex}`
      params.push(filters.dateFrom)
      paramIndex++
    }

    if (filters?.dateTo) {
      query += ` AND ta.created_at <= $${paramIndex}`
      params.push(filters.dateTo)
      paramIndex++
    }

    query += ` ORDER BY ta.created_at DESC`

    return await db.queryMany<Approval>(query, params)
  }

  /**
   * Obtener detalles de aprobación
   */
  static async getApprovalDetails(approvalId: number): Promise<Approval | null> {
    return await db.queryOne<Approval>(
      `SELECT
        ta.*,
        emp.name as employee_name,
        emp.email as employee_email,
        emp.department,
        mgr.name as manager_name,
        b.*,
        json_build_object(
          'id', b.id,
          'total_price', b.total_price,
          'destination', b.destination,
          'start_date', b.start_date,
          'end_date', b.end_date,
          'service_type', b.service_type,
          'status', b.status,
          'details', b.details
        ) as booking_details
      FROM travel_approvals ta
      JOIN bookings b ON ta.booking_id = b.id
      JOIN users emp ON ta.requested_by = emp.id
      LEFT JOIN users mgr ON ta.approved_by = mgr.id
      LEFT JOIN tenant_users tu ON emp.id = tu.user_id
      WHERE ta.id = $1`,
      [approvalId]
    )
  }

  /**
   * Validar si booking requiere aprobación
   */
  static async requiresApproval(
    bookingData: any,
    tenantId: number
  ): Promise<boolean> {
    // Obtener política del tenant
    const policy = await db.queryOne<any>(
      `SELECT * FROM travel_policies WHERE tenant_id = $1`,
      [tenantId]
    )

    if (!policy) {
      return false // Sin política = no requiere aprobación
    }

    // Si la política dice que siempre requiere aprobación
    if (policy.requires_approval) {
      return true
    }

    // Validar si excede límites
    let requiresApproval = false

    // Precio de hotel excede máximo
    if (policy.max_hotel_price && bookingData.hotelPricePerNight > policy.max_hotel_price) {
      requiresApproval = true
    }

    // Clase de vuelo excede máxima
    const flightClassHierarchy: Record<string, number> = { economy: 1, business: 2, first: 3 }
    if (
      policy.max_flight_class &&
      bookingData.flightClass &&
      flightClassHierarchy[bookingData.flightClass as string] > flightClassHierarchy[policy.max_flight_class as string]
    ) {
      requiresApproval = true
    }

    // Anticipación menor a mínima
    if (policy.min_advance_days) {
      const daysInAdvance = Math.floor(
        (new Date(bookingData.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      if (daysInAdvance < policy.min_advance_days) {
        requiresApproval = true
      }
    }

    return requiresApproval
  }

  // ==================== NOTIFICACIONES ====================

  private static async notifyManager(
    managerId: number,
    approval: Approval,
    details: CreateApprovalParams
  ): Promise<void> {
    const manager = await db.queryOne<any>(
      'SELECT * FROM users WHERE id = $1',
      [managerId]
    )

    if (!manager?.email) return

    await NotificationService.sendEmail({
      to: manager.email,
      subject: 'Nueva solicitud de viaje pendiente de aprobación',
      templateId: 'approval-request',
      dynamicTemplateData: {
        managerName: manager.name,
        amount: details.amount,
        destination: details.destination,
        travelDates: details.travelDates,
        approvalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/approvals/${approval.id}`
      }
    })
  }

  private static async notifyEmployee(
    approval: Approval,
    action: 'approved' | 'rejected'
  ): Promise<void> {
    const employee = await db.queryOne<any>(
      'SELECT * FROM users WHERE id = $1',
      [approval.requested_by]
    )

    if (!employee?.email) return

    const subject = action === 'approved'
      ? 'Tu solicitud de viaje ha sido aprobada'
      : 'Tu solicitud de viaje ha sido rechazada'

    await NotificationService.sendEmail({
      to: employee.email,
      subject,
      templateId: action === 'approved' ? 'approval-approved' : 'approval-rejected',
      dynamicTemplateData: {
        employeeName: employee.name,
        reason: approval.reason,
        bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reserva/${approval.booking_id}`
      }
    })
  }

  private static async notifyTravelManager(approval: Approval): Promise<void> {
    // Obtener travel managers del tenant
    const travelManagers = await db.queryMany<any>(
      `SELECT u.*
       FROM users u
       JOIN tenant_users tu ON u.id = tu.user_id
       WHERE tu.role = 'travel_manager'
         AND tu.tenant_id = (
           SELECT tenant_id FROM bookings WHERE id = $1
         )`,
      [approval.booking_id]
    )

    for (const manager of travelManagers) {
      if (!manager.email) continue

      await NotificationService.sendEmail({
        to: manager.email,
        subject: 'Nueva reserva aprobada - Acción requerida',
        templateId: 'booking-approved-travel-manager',
        dynamicTemplateData: {
          managerName: manager.name,
          bookingId: approval.booking_id,
          bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${approval.booking_id}`
        }
      })
    }
  }
}
