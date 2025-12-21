import { query, queryOne, queryMany, insertOne, updateOne } from '@/lib/db'

export interface Tenant {
  id: number
  tenant_type: 'individual' | 'corporate' | 'agency'
  company_name: string
  legal_name?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  custom_domain?: string
  is_active: boolean
  subscription_plan?: string
  subscription_expires_at?: Date
  created_at: Date
  updated_at: Date
}

export interface TenantUser {
  id: number
  user_id: number
  tenant_id: number
  role: string
  department?: string
  cost_center?: string
  is_active: boolean
  created_at: Date
}

export interface WhiteLabelConfig {
  id: number
  tenant_id: number
  favicon_url?: string
  footer_text?: string
  support_email?: string
  support_phone?: string
  terms_url?: string
  privacy_url?: string
  meta_title?: string
  meta_description?: string
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  created_at: Date
  updated_at: Date
}

class TenantService {
  /**
   * Obtener tenant por ID
   */
  async getTenantById(id: number): Promise<Tenant | null> {
    return queryOne<Tenant>(
      'SELECT * FROM tenants WHERE id = $1 AND is_active = true',
      [id]
    )
  }

  /**
   * Obtener tenant por dominio personalizado
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    return queryOne<Tenant>(
      'SELECT * FROM tenants WHERE custom_domain = $1 AND is_active = true',
      [domain]
    )
  }

  /**
   * Obtener tenant por subdominio
   * Ej: agencia1.asoperadora.com → buscar tenant con company_name slug = 'agencia1'
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    // Intentar match exacto primero
    const exactMatch = await queryOne<Tenant>(
      `SELECT * FROM tenants
       WHERE LOWER(REPLACE(company_name, ' ', '-')) = LOWER($1)
       AND is_active = true`,
      [subdomain]
    )

    if (exactMatch) return exactMatch

    // Intentar match por custom_domain que incluya el subdomain
    return queryOne<Tenant>(
      `SELECT * FROM tenants
       WHERE custom_domain LIKE $1
       AND is_active = true`,
      [`%${subdomain}%`]
    )
  }

  /**
   * Detectar tenant desde request (dominio o subdomain)
   */
  async detectTenant(host: string): Promise<Tenant | null> {
    // Si es dominio personalizado (no contiene asoperadora.com)
    if (!host.includes('asoperadora.com') && !host.includes('localhost')) {
      return this.getTenantByDomain(host)
    }

    // Si es subdomain (agencia.asoperadora.com)
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'asoperadora') {
      return this.getTenantBySubdomain(subdomain)
    }

    // Si es dominio principal o localhost, sin tenant específico
    return null
  }

  /**
   * Crear nuevo tenant
   */
  async createTenant(data: {
    tenant_type: 'corporate' | 'agency'
    company_name: string
    legal_name?: string
    tax_id?: string
    email?: string
    phone?: string
    subscription_plan?: string
  }): Promise<Tenant> {
    return insertOne<Tenant>('tenants', {
      ...data,
      is_active: true
    })
  }

  /**
   * Actualizar tenant
   */
  async updateTenant(id: number, data: Partial<Tenant>): Promise<Tenant | null> {
    return updateOne<Tenant>('tenants', id, data)
  }

  /**
   * Obtener configuración white-label del tenant
   */
  async getWhiteLabelConfig(tenantId: number): Promise<WhiteLabelConfig | null> {
    return queryOne<WhiteLabelConfig>(
      'SELECT * FROM white_label_config WHERE tenant_id = $1',
      [tenantId]
    )
  }

  /**
   * Actualizar configuración white-label
   */
  async updateWhiteLabelConfig(
    tenantId: number,
    config: Partial<WhiteLabelConfig>
  ): Promise<WhiteLabelConfig> {
    // Verificar si ya existe
    const existing = await this.getWhiteLabelConfig(tenantId)

    if (existing) {
      const result = await query<WhiteLabelConfig>(
        `UPDATE white_label_config
         SET ${Object.keys(config).map((k, i) => `${k} = $${i + 2}`).join(', ')},
             updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = $1
         RETURNING *`,
        [tenantId, ...Object.values(config)]
      )
      return result.rows[0]
    } else {
      return insertOne<WhiteLabelConfig>('white_label_config', {
        tenant_id: tenantId,
        ...config
      })
    }
  }

  /**
   * Agregar usuario a tenant
   */
  async addUserToTenant(
    userId: number,
    tenantId: number,
    role: string,
    options?: { department?: string; cost_center?: string }
  ): Promise<TenantUser> {
    return insertOne<TenantUser>('tenant_users', {
      user_id: userId,
      tenant_id: tenantId,
      role,
      department: options?.department,
      cost_center: options?.cost_center,
      is_active: true
    })
  }

  /**
   * Obtener usuarios de un tenant
   */
  async getTenantUsers(tenantId: number, role?: string): Promise<TenantUser[]> {
    if (role) {
      return queryMany<TenantUser>(
        `SELECT tu.*, u.name, u.email
         FROM tenant_users tu
         JOIN users u ON tu.user_id = u.id
         WHERE tu.tenant_id = $1 AND tu.role = $2 AND tu.is_active = true`,
        [tenantId, role]
      )
    }

    return queryMany<TenantUser>(
      `SELECT tu.*, u.name, u.email
       FROM tenant_users tu
       JOIN users u ON tu.user_id = u.id
       WHERE tu.tenant_id = $1 AND tu.is_active = true`,
      [tenantId]
    )
  }

  /**
   * Obtener tenants de un usuario
   */
  async getUserTenants(userId: number): Promise<Tenant[]> {
    return queryMany<Tenant>(
      `SELECT t.*
       FROM tenants t
       JOIN tenant_users tu ON t.id = tu.tenant_id
       WHERE tu.user_id = $1 AND tu.is_active = true AND t.is_active = true`,
      [userId]
    )
  }

  /**
   * Verificar si usuario pertenece a tenant
   */
  async userBelongsToTenant(userId: number, tenantId: number): Promise<boolean> {
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM tenant_users
       WHERE user_id = $1 AND tenant_id = $2 AND is_active = true`,
      [userId, tenantId]
    )

    return parseInt(result?.count || '0', 10) > 0
  }

  /**
   * Obtener rol de usuario en tenant
   */
  async getUserRoleInTenant(userId: number, tenantId: number): Promise<string | null> {
    const result = await queryOne<{ role: string }>(
      `SELECT role
       FROM tenant_users
       WHERE user_id = $1 AND tenant_id = $2 AND is_active = true`,
      [userId, tenantId]
    )

    return result?.role || null
  }

  /**
   * Remover usuario de tenant (soft delete)
   */
  async removeUserFromTenant(userId: number, tenantId: number): Promise<boolean> {
    const result = await query(
      `UPDATE tenant_users
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    )

    return (result.rowCount ?? 0) > 0
  }

  /**
   * Obtener estadísticas del tenant
   */
  async getTenantStats(tenantId: number) {
    const [users, bookings, revenue] = await Promise.all([
      // Total de usuarios
      queryOne<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM tenant_users
         WHERE tenant_id = $1 AND is_active = true`,
        [tenantId]
      ),

      // Total de reservas
      queryOne<{ count: string; total: string }>(
        `SELECT COUNT(*) as count, SUM(total_price) as total
         FROM bookings
         WHERE tenant_id = $1`,
        [tenantId]
      ),

      // Ingresos del mes
      queryOne<{ total: string }>(
        `SELECT SUM(total_price) as total
         FROM bookings
         WHERE tenant_id = $1
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [tenantId]
      )
    ])

    return {
      total_users: parseInt(users?.count || '0', 10),
      total_bookings: parseInt(bookings?.count || '0', 10),
      total_revenue: parseFloat(bookings?.total || '0'),
      monthly_revenue: parseFloat(revenue?.total || '0')
    }
  }

  /**
   * Listar todos los tenants (con paginación)
   */
  async listTenants(filters?: {
    tenant_type?: string
    is_active?: boolean
    page?: number
    limit?: number
  }) {
    let conditions: string[] = []
    let params: any[] = []
    let paramIndex = 1

    if (filters?.tenant_type) {
      conditions.push(`tenant_type = $${paramIndex++}`)
      params.push(filters.tenant_type)
    }

    if (filters?.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`)
      params.push(filters.is_active)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    const [tenants, countResult] = await Promise.all([
      queryMany<Tenant>(
        `SELECT * FROM tenants ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      ),

      queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM tenants ${whereClause}`,
        params
      )
    ])

    const total = parseInt(countResult?.count || '0', 10)

    return {
      data: tenants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export default new TenantService()
