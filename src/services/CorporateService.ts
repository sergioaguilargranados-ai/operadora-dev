/**
 * CorporateService - Gestión de funcionalidades corporativas
 *
 * - Gestión de empleados
 * - Estadísticas del dashboard
 * - Políticas de viaje
 * - Reportes corporativos
 */

import { db } from '@/lib/db'
import csvParser from 'csv-parser'
import { Readable } from 'stream'

interface Employee {
  id: number
  name: string
  email: string
  role: string
  department: string
  cost_center: string
  manager_id: number | null
  is_active: boolean
  created_at: Date
}

interface CorporateStats {
  totalBookings: number
  totalExpenses: number
  pendingApprovals: number
  policyCompliance: number
  topDestinations: Array<{ destination: string; count: number }>
  topTravelers: Array<{ name: string; trips: number; expenses: number }>
  expensesByDepartment: Array<{ department: string; total: number }>
}

interface TravelPolicy {
  id: number
  tenant_id: number
  max_flight_class: string
  max_hotel_price: number
  min_advance_days: number
  requires_approval: boolean
  created_at: Date
}

export class CorporateService {

  // ==================== EMPLEADOS ====================

  /**
   * Listar empleados del tenant
   */
  static async getEmployees(
    tenantId: number,
    filters?: {
      department?: string
      role?: string
      isActive?: boolean
      search?: string
    }
  ): Promise<Employee[]> {
    let query = `
      SELECT
        u.id,
        u.name,
        u.email,
        tu.role,
        tu.department,
        tu.cost_center,
        tu.manager_id,
        u.is_active,
        u.created_at
      FROM users u
      JOIN tenant_users tu ON u.id = tu.user_id
      WHERE tu.tenant_id = $1
    `

    const params: any[] = [tenantId]
    let paramIndex = 2

    if (filters?.department) {
      query += ` AND tu.department = $${paramIndex}`
      params.push(filters.department)
      paramIndex++
    }

    if (filters?.role) {
      query += ` AND tu.role = $${paramIndex}`
      params.push(filters.role)
      paramIndex++
    }

    if (filters?.isActive !== undefined) {
      query += ` AND u.is_active = $${paramIndex}`
      params.push(filters.isActive)
      paramIndex++
    }

    if (filters?.search) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    query += ` ORDER BY u.name ASC`

    return await db.queryMany<Employee>(query, params)
  }

  /**
   * Crear empleado
   */
  static async createEmployee(
    tenantId: number,
    employeeData: {
      name: string
      email: string
      password: string
      role: string
      department: string
      costCenter?: string
      managerId?: number
    }
  ): Promise<Employee> {
    const { name, email, password, role, department, costCenter, managerId } = employeeData

    // Verificar que email no exista
    const existing = await db.queryOne<any>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing) {
      throw new Error('El email ya está registrado')
    }

    // Crear usuario
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)

    const userResult = await db.query<any>(
      `INSERT INTO users (name, email, password_hash, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [name, email, passwordHash]
    )
    const user = userResult.rows[0]

    // Asociar a tenant
    await db.query(
      `INSERT INTO tenant_users
       (user_id, tenant_id, role, department, cost_center, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, tenantId, role, department, costCenter, managerId]
    )

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      department,
      cost_center: costCenter || '',
      manager_id: managerId || null,
      is_active: true,
      created_at: user.created_at
    }
  }

  /**
   * Actualizar empleado
   */
  static async updateEmployee(
    userId: number,
    tenantId: number,
    updates: {
      name?: string
      role?: string
      department?: string
      costCenter?: string
      managerId?: number
      isActive?: boolean
    }
  ): Promise<Employee> {
    // Actualizar users
    if (updates.name !== undefined || updates.isActive !== undefined) {
      const userUpdates: string[] = []
      const userParams: any[] = []
      let paramIndex = 1

      if (updates.name) {
        userUpdates.push(`name = $${paramIndex}`)
        userParams.push(updates.name)
        paramIndex++
      }

      if (updates.isActive !== undefined) {
        userUpdates.push(`is_active = $${paramIndex}`)
        userParams.push(updates.isActive)
        paramIndex++
      }

      if (userUpdates.length > 0) {
        userParams.push(userId)
        await db.query(
          `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${paramIndex}`,
          userParams
        )
      }
    }

    // Actualizar tenant_users
    const tenantUpdates: string[] = []
    const tenantParams: any[] = []
    let paramIndex = 1

    if (updates.role) {
      tenantUpdates.push(`role = $${paramIndex}`)
      tenantParams.push(updates.role)
      paramIndex++
    }

    if (updates.department) {
      tenantUpdates.push(`department = $${paramIndex}`)
      tenantParams.push(updates.department)
      paramIndex++
    }

    if (updates.costCenter !== undefined) {
      tenantUpdates.push(`cost_center = $${paramIndex}`)
      tenantParams.push(updates.costCenter)
      paramIndex++
    }

    if (updates.managerId !== undefined) {
      tenantUpdates.push(`manager_id = $${paramIndex}`)
      tenantParams.push(updates.managerId)
      paramIndex++
    }

    if (tenantUpdates.length > 0) {
      tenantParams.push(userId, tenantId)
      await db.query(
        `UPDATE tenant_users
         SET ${tenantUpdates.join(', ')}
         WHERE user_id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
        tenantParams
      )
    }

    // Retornar empleado actualizado
    const employee = await db.queryOne<Employee>(
      `SELECT
        u.id, u.name, u.email, u.is_active, u.created_at,
        tu.role, tu.department, tu.cost_center, tu.manager_id
       FROM users u
       JOIN tenant_users tu ON u.id = tu.user_id
       WHERE u.id = $1 AND tu.tenant_id = $2`,
      [userId, tenantId]
    )

    if (!employee) {
      throw new Error('Empleado no encontrado')
    }

    return employee
  }

  /**
   * Importar empleados desde CSV
   */
  static async importEmployeesFromCSV(
    tenantId: number,
    csvContent: string
  ): Promise<{
    success: number
    errors: Array<{ row: number; error: string }>
  }> {
    const results: any[] = []
    const errors: Array<{ row: number; error: string }> = []

    // Parse CSV
    const stream = Readable.from([csvContent])

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          let successCount = 0

          for (let i = 0; i < results.length; i++) {
            const row = results[i]
            try {
              // Expected columns: name, email, role, department, cost_center, manager_email
              const managerId = row.manager_email
                ? (await db.queryOne<any>(
                    'SELECT id FROM users WHERE email = $1',
                    [row.manager_email]
                  ))?.id
                : null

              await this.createEmployee(tenantId, {
                name: row.name,
                email: row.email,
                password: 'temp123', // Password temporal
                role: row.role || 'employee',
                department: row.department,
                costCenter: row.cost_center,
                managerId
              })

              successCount++
            } catch (error: any) {
              errors.push({
                row: i + 2, // +2 porque CSV tiene header y empieza en 1
                error: error.message
              })
            }
          }

          resolve({ success: successCount, errors })
        })
        .on('error', reject)
    })
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas completas del dashboard corporativo
   */
  static async getDashboardStats(
    tenantId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> {
    // 1. Total Empleados
    const employeesRes = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count 
       FROM tenant_users tu
       JOIN users u ON tu.user_id = u.id
       WHERE tu.tenant_id = $1 AND u.is_active = true`,
      [tenantId]
    )

    // 2. Reservas Activas (confirmed o pending)
    const activeBookingsRes = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM bookings
       WHERE tenant_id = $1 AND status IN ('confirmed', 'pending')`,
      [tenantId]
    )

    // 3. Gastos Anuales
    const annualExpensesRes = await db.queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 
         AND status != 'cancelled' 
         AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`,
      [tenantId]
    )

    // 4. Gastos Mes Actual
    const monthExpensesRes = await db.queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 
         AND status != 'cancelled' 
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [tenantId]
    )

    // 5. Total Gastos Históricos
    const totalExpensesRes = await db.queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND status != 'cancelled'`,
      [tenantId]
    )

    // 6. Aprobaciones Pendientes
    const pendingApprovalsRes = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM travel_approvals
       WHERE tenant_id = $1 AND status = 'pending'`,
      [tenantId]
    )

    // 7. Desglose por tipo de reserva (Donut)
    const breakdownRes = await db.queryMany<{ name: string; count: string; total: string }>(
      `SELECT 
         COALESCE(booking_type, 'Otros') as name, 
         COUNT(*)::text as count,
         COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND status != 'cancelled'
       GROUP BY booking_type
       ORDER BY total DESC`,
      [tenantId]
    )

    const totalBookingsCount = breakdownRes.reduce((acc, curr) => acc + parseInt(curr.count || '0'), 0)
    const bookingTypeData = breakdownRes.map(b => ({
      name: b.name.charAt(0).toUpperCase() + b.name.slice(1),
      count: parseInt(b.count || '0'),
      total: parseFloat(b.total || '0'),
      value: totalBookingsCount > 0 ? Math.round((parseInt(b.count || '0') / totalBookingsCount) * 100) : 0
    }))

    // 8. Top Destinos
    const topDestinationsRes = await db.queryMany<{ name: string; value: string }>(
      `SELECT 
         destination as name, 
         COUNT(*)::text as value 
       FROM bookings 
       WHERE tenant_id = $1 AND destination IS NOT NULL AND destination != ''
       GROUP BY destination 
       ORDER BY COUNT(*) DESC 
       LIMIT 5`,
      [tenantId]
    )

    // 9. Actividad Reciente
    const recentActivityRes = await db.queryMany<{
      id: number
      booking_type: string
      destination: string
      total_price: string
      created_at: Date
      status: string
      user_name: string
    }>(
      `SELECT 
         b.id, 
         b.booking_type, 
         b.destination, 
         b.total_price::text, 
         b.created_at, 
         b.status,
         COALESCE(u.name, 'Usuario Corporativo') as user_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.tenant_id = $1
       ORDER BY b.created_at DESC
       LIMIT 6`,
      [tenantId]
    )

    const totalExp = parseFloat(annualExpensesRes?.total || '0')
    const savingsEstimated = Math.round(totalExp * 0.151) // 15.1% tasa de ahorro corporativo promedio negociado

    return {
      totalEmployees: parseInt(employeesRes?.count || '0'),
      activeBookings: parseInt(activeBookingsRes?.count || '0'),
      annualExpenses: totalExp,
      monthExpenses: parseFloat(monthExpensesRes?.total || '0'),
      totalExpenses: parseFloat(totalExpensesRes?.total || '0'),
      estimatedSavings: savingsEstimated,
      pendingApprovals: parseInt(pendingApprovalsRes?.count || '0'),
      bookingTypeBreakdown: bookingTypeData,
      topDestinations: topDestinationsRes.map(d => ({ name: d.name, value: parseInt(d.value || '0') })),
      recentActivity: recentActivityRes.map(a => ({
        id: a.id,
        bookingType: a.booking_type,
        destination: a.destination || 'Sin destino especificado',
        amount: parseFloat(a.total_price || '0'),
        createdAt: a.created_at,
        status: a.status,
        userName: a.user_name
      }))
    }
  }

  // ==================== GASTOS Y REPORTES ====================

  /**
   * Obtener métricas y desglose de gastos corporativos
   */
  static async getExpenses(tenantId: number): Promise<any> {
    // 1. Tendencia de gastos (últimos 30 días)
    const trendRes = await db.queryMany<{ date: string; amount: string }>(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
         SUM(total_price)::text as amount 
       FROM bookings 
       WHERE tenant_id = $1 
         AND status != 'cancelled' 
         AND created_at >= NOW() - INTERVAL '30 days' 
       GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD') 
       ORDER BY date ASC`,
      [tenantId]
    )

    // 2. Gastos por departamento
    const deptRes = await db.queryMany<{ department: string; total: string; count: string }>(
      `SELECT 
         COALESCE(tu.department, 'General') as department, 
         COALESCE(SUM(b.total_price), 0)::text as total,
         COUNT(b.id)::text as count
       FROM bookings b 
       LEFT JOIN tenant_users tu ON (tu.user_id = b.user_id AND tu.tenant_id = b.tenant_id) 
       WHERE b.tenant_id = $1 AND b.status != 'cancelled'
       GROUP BY tu.department
       ORDER BY SUM(b.total_price) DESC`,
      [tenantId]
    )

    // 3. Histórico de transacciones/reservas
    const historyRes = await db.queryMany<{
      id: number
      booking_type: string
      destination: string
      total_price: string
      status: string
      created_at: Date
      user_name: string
      department: string
      cost_center: string
    }>(
      `SELECT 
         b.id,
         b.booking_type,
         b.destination,
         b.total_price::text,
         b.status,
         b.created_at,
         COALESCE(u.name, 'Usuario Corporativo') as user_name,
         COALESCE(tu.department, 'General') as department,
         COALESCE(tu.cost_center, 'CC-001') as cost_center
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN tenant_users tu ON (tu.user_id = b.user_id AND tu.tenant_id = b.tenant_id)
       WHERE b.tenant_id = $1
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [tenantId]
    )

    return {
      trend: trendRes.map(t => ({ date: t.date, amount: parseFloat(t.amount || '0') })),
      byDepartment: deptRes.map(d => ({
        department: d.department,
        total: parseFloat(d.total || '0'),
        count: parseInt(d.count || '0')
      })),
      history: historyRes.map(h => ({
        id: h.id,
        bookingType: h.booking_type,
        destination: h.destination || 'Destino general',
        amount: parseFloat(h.total_price || '0'),
        status: h.status,
        createdAt: h.created_at,
        userName: h.user_name,
        department: h.department,
        costCenter: h.cost_center
      }))
    }
  }

  // ==================== APROBACIONES DE VIAJE ====================

  /**
   * Obtener solicitudes de aprobación
   */
  static async getApprovals(tenantId: number, status?: string): Promise<any[]> {
    let sql = `
      SELECT 
        ta.id,
        ta.booking_id,
        ta.requested_by,
        ta.approved_by,
        ta.status,
        ta.estimated_cost::text,
        ta.reason_for_travel,
        ta.rejection_reason,
        ta.created_at,
        ta.updated_at,
        COALESCE(u.name, 'Empleado') as requested_by_name,
        COALESCE(u.email, '') as requested_by_email,
        COALESCE(tu.department, 'General') as department,
        COALESCE(tu.cost_center, 'CC-001') as cost_center,
        COALESCE(appr.name, '') as approved_by_name
      FROM travel_approvals ta
      LEFT JOIN users u ON ta.requested_by = u.id
      LEFT JOIN tenant_users tu ON (tu.user_id = ta.requested_by AND tu.tenant_id = ta.tenant_id)
      LEFT JOIN users appr ON ta.approved_by = appr.id
      WHERE ta.tenant_id = $1
    `
    const params: any[] = [tenantId]

    if (status) {
      sql += ` AND ta.status = $2`
      params.push(status)
    }

    sql += ` ORDER BY ta.created_at DESC`

    const rows = await db.queryMany<any>(sql, params)
    return rows.map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      requestedBy: r.requested_by,
      requestedByName: r.requested_by_name,
      requestedByEmail: r.requested_by_email,
      department: r.department,
      costCenter: r.cost_center,
      approvedBy: r.approved_by,
      approvedByName: r.approved_by_name,
      status: r.status,
      estimatedCost: parseFloat(r.estimated_cost || '0'),
      reasonForTravel: r.reason_for_travel || 'Viaje corporativo estándar',
      rejectionReason: r.rejection_reason,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))
  }

  /**
   * Ejecutar acción sobre una solicitud de aprobación
   */
  static async actionApproval(
    approvalId: number,
    tenantId: number,
    action: 'approved' | 'rejected',
    rejectionReason?: string,
    approverId?: number
  ): Promise<any> {
    const res = await db.queryOne<any>(
      `UPDATE travel_approvals
       SET status = $1,
           approved_by = $2,
           rejection_reason = $3,
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [action, approverId || null, rejectionReason || null, approvalId, tenantId]
    )

    if (!res) {
      throw new Error('Aprobación no encontrada')
    }

    return res
  }

  // ==================== MÉTRICAS Y HUELLA CO2 ====================

  /**
   * Calcular métricas de sostenibilidad y huella CO2
   */
  static async getCO2Metrics(tenantId: number): Promise<any> {
    // Vuelos del tenant
    const flightBookings = await db.queryOne<{ count: string; total: string }>(
      `SELECT COUNT(*)::text as count, COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND booking_type ILIKE '%vuelo%' AND status != 'cancelled'`,
      [tenantId]
    )

    // Hoteles del tenant
    const hotelBookings = await db.queryOne<{ count: string; total: string }>(
      `SELECT COUNT(*)::text as count, COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND booking_type ILIKE '%hotel%' AND status != 'cancelled'`,
      [tenantId]
    )

    // Autos y transportes
    const transportBookings = await db.queryOne<{ count: string; total: string }>(
      `SELECT COUNT(*)::text as count, COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND booking_type ILIKE ANY(ARRAY['%auto%', '%tren%', '%traslado%']) AND status != 'cancelled'`,
      [tenantId]
    )

    const flightsCount = parseInt(flightBookings?.count || '0')
    const hotelsCount = parseInt(hotelBookings?.count || '0')
    const transportCount = parseInt(transportBookings?.count || '0')

    // Factores estándar de emisión CO2
    const flightCO2Kg = flightsCount * 280 // ~280 kg CO2 promedio por vuelo nacional/internacional corto
    const hotelCO2Kg = hotelsCount * 25 // ~25 kg CO2 por noche de hotel
    const transportCO2Kg = transportCount * 45 // ~45 kg CO2 por alquiler de auto / traslado

    const totalCO2Kg = flightCO2Kg + hotelCO2Kg + transportCO2Kg
    const totalCO2Tons = (totalCO2Kg / 1000).toFixed(2)
    const treesNeeded = Math.ceil(totalCO2Kg / 22) // 1 árbol maduro absorbe ~22 kg CO2 al año

    return {
      totalCO2Kg,
      totalCO2Tons: parseFloat(totalCO2Tons),
      treesNeeded,
      flightsCount,
      hotelsCount,
      transportCount,
      breakdown: [
        { name: 'Vuelos Comerciales', co2Kg: flightCO2Kg, percentage: totalCO2Kg > 0 ? Math.round((flightCO2Kg / totalCO2Kg) * 100) : 70 },
        { name: 'Hospedaje & Hoteles', co2Kg: hotelCO2Kg, percentage: totalCO2Kg > 0 ? Math.round((hotelCO2Kg / totalCO2Kg) * 100) : 20 },
        { name: 'Transporte Terrestre', co2Kg: transportCO2Kg, percentage: totalCO2Kg > 0 ? Math.round((transportCO2Kg / totalCO2Kg) * 100) : 10 }
      ],
      sustainabilityScore: totalCO2Kg < 5000 ? 'Excelente (A+)' : totalCO2Kg < 15000 ? 'Bueno (B)' : 'Moderado (C)'
    }
  }

  // ==================== POLÍTICAS ====================

  /**
   * Obtener política del tenant
   */
  static async getPolicy(tenantId: number): Promise<TravelPolicy | null> {
    return await db.queryOne<TravelPolicy>(
      'SELECT * FROM travel_policies WHERE tenant_id = $1',
      [tenantId]
    )
  }

  /**
   * Crear o actualizar política
   */
  static async upsertPolicy(
    tenantId: number,
    policyData: {
      maxFlightClass?: string
      maxHotelPrice?: number
      minAdvanceDays?: number
      requiresApproval?: boolean
    }
  ): Promise<TravelPolicy> {
    const existing = await this.getPolicy(tenantId)

    if (existing) {
      // Update
      const result = await db.query<TravelPolicy>(
        `UPDATE travel_policies
         SET max_flight_class = $1,
             max_hotel_price = $2,
             min_advance_days = $3,
             requires_approval = $4
         WHERE tenant_id = $5
         RETURNING *`,
        [
          policyData.maxFlightClass || existing.max_flight_class,
          policyData.maxHotelPrice || existing.max_hotel_price,
          policyData.minAdvanceDays || existing.min_advance_days,
          policyData.requiresApproval !== undefined
            ? policyData.requiresApproval
            : existing.requires_approval,
          tenantId
        ]
      )
      return result.rows[0]
    } else {
      // Insert
      const result = await db.query<TravelPolicy>(
        `INSERT INTO travel_policies
         (tenant_id, max_flight_class, max_hotel_price, min_advance_days, requires_approval)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          tenantId,
          policyData.maxFlightClass || 'economy',
          policyData.maxHotelPrice || 2000,
          policyData.minAdvanceDays || 7,
          policyData.requiresApproval !== undefined ? policyData.requiresApproval : true
        ]
      )
      return result.rows[0]
    }
  }
}
