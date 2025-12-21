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
   * Obtener estadísticas del dashboard corporativo
   */
  static async getDashboardStats(
    tenantId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<CorporateStats> {
    const dateFilter = dateFrom && dateTo
      ? `AND b.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`
      : `AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE)`

    // Total de reservas (usar COALESCE para evitar null)
    const totalBookings = await db.queryOne<{ count: string }>(
      `SELECT COALESCE(COUNT(*), 0)::text as count
       FROM bookings b
       WHERE (b.tenant_id = $1 OR $1 IS NULL)`,
      [tenantId]
    )

    // Total de gastos (usar total_amount en vez de total_price)
    const totalExpenses = await db.queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text as total
       FROM bookings b
       WHERE (b.tenant_id = $1 OR $1 IS NULL)
         AND b.status != 'cancelled'`,
      [tenantId]
    )

    // Pendientes de aprobación
    const pendingApprovals = await db.queryOne<{ count: string }>(
      `SELECT COALESCE(COUNT(*), 0)::text as count
       FROM travel_approvals ta
       WHERE ta.tenant_id = $1
         AND ta.status = 'pending'`,
      [tenantId]
    )

    // Cumplimiento de políticas (simplificado)
    const policyCompliance = await db.queryOne<{ percentage: string }>(
      `SELECT COALESCE(100, 0)::text as percentage`
    )

    // Top destinos (simplificado, sin datos reales por ahora)
    const topDestinations: Array<{ destination: string; count: number }> = []

    // Top viajeros (simplificado)
    const topTravelers: Array<{ name: string; trips: number; expenses: number }> = []

    // Gastos por departamento (simplificado)
    const expensesByDepartment: Array<{ department: string; total: number }> = []

    return {
      totalBookings: parseInt(totalBookings?.count || '0'),
      totalExpenses: parseFloat(totalExpenses?.total || '0'),
      pendingApprovals: parseInt(pendingApprovals?.count || '0'),
      policyCompliance: parseFloat(policyCompliance?.percentage || '100'),
      topDestinations,
      topTravelers,
      expensesByDepartment
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
