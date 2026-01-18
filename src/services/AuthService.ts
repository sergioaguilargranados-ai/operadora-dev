import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '15m' // 15 minutos
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7 días

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  user_type: 'cliente' | 'corporativo' | 'agencia' | 'interno'
  company_name?: string
  company_id?: number
  agency_name?: string
  agency_id?: number
  corporate_role?: 'admin' | 'employee'
  agency_role?: 'admin' | 'operator'
  internal_role?: 'director' | 'ventas' | 'operativo' | 'administrativo' | 'it'
}

export interface LoginData {
  email: string
  password: string
  device_fingerprint?: string
  ip_address?: string
  user_agent?: string
}

export class AuthService {
  /**
   * Registrar nuevo usuario
   */
  static async register(data: RegisterData, ipAddress?: string) {
    try {
      // Verificar si el email ya existe
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      )

      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está registrado')
      }

      // Hash de contraseña
      const passwordHash = await bcrypt.hash(data.password, 10)

      // Determinar rol y status según tipo de usuario
      let role = 'cliente'
      let status = 'active'
      let companyId = data.company_id
      let agencyId = data.agency_id

      // Procesar según tipo de usuario
      if (data.user_type === 'corporativo') {
        // Si hay nombre de empresa pero no ID, buscar o crear
        if (data.company_name && !companyId) {
          const company = await this.findOrCreateCompany(data.company_name)
          companyId = company.id
        }

        // Verificar si es el primer usuario de la empresa
        if (companyId) {
          const existingUsers = await query(
            'SELECT COUNT(*) as count FROM users WHERE company_id = $1',
            [companyId]
          )

          const isFirstUser = existingUsers.rows[0].count === '0'

          if (isFirstUser || data.corporate_role === 'admin') {
            role = 'corporativo_admin'
            status = isFirstUser ? 'active' : 'pending' // Primer admin se aprueba automáticamente
          } else {
            role = 'corporativo_employee'
            status = 'pending' // Requiere aprobación del admin corporativo
          }
        }
      } else if (data.user_type === 'agencia') {
        // Si hay nombre de agencia pero no ID, buscar o crear
        if (data.agency_name && !agencyId) {
          const agency = await this.findOrCreateAgency(data.agency_name)
          agencyId = agency.id
        }

        // Verificar si es el primer usuario de la agencia
        if (agencyId) {
          const existingUsers = await query(
            'SELECT COUNT(*) as count FROM users WHERE agency_id = $1',
            [agencyId]
          )

          const isFirstUser = existingUsers.rows[0].count === '0'

          if (isFirstUser || data.agency_role === 'admin') {
            role = 'agencia_admin'
            status = isFirstUser ? 'active' : 'pending'
          } else {
            role = 'agencia_operator'
            status = 'pending'
          }
        }
      } else if (data.user_type === 'interno') {
        // Usuarios internos SIEMPRE requieren aprobación
        role = data.internal_role || 'operativo'
        status = 'pending'
      }

      // Crear usuario
      const result = await query(
        `INSERT INTO users (
          name, email, password_hash, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, name, email, is_active`,
        [
          data.name,
          data.email,
          passwordHash,
          status === 'active'
        ]
      )

      const user = result.rows[0]

      console.log('✅ Usuario creado en BD:', { id: user.id, email: user.email })

      // Log de registro (comentado por ahora)
      // await this.logAccess({
      //   user_id: user.id,
      //   ip_address: ipAddress || '0.0.0.0',
      //   action: 'register',
      //   action_details: { user_type: data.user_type, role, status },
      //   success: true
      // })

      // Si requiere aprobación, notificar a admins (comentado por ahora)
      // if (status === 'pending') {
      //   await this.notifyAdminsForApproval(user)
      // }

      return {
        success: true,
        user,
        requires_approval: status === 'pending'
      }
    } catch (error) {
      console.error('Error in register:', error)
      throw error
    }
  }

  /**
   * Login de usuario
   */
  static async login(data: LoginData) {
    try {
      // Buscar usuario (sin dependencias a companies/agencies)
      const result = await query(
        `SELECT * FROM users WHERE email = $1`,
        [data.email]
      )

      if (result.rows.length === 0) {
        await this.logAccess({
          ip_address: data.ip_address || '0.0.0.0',
          action: 'login_failed',
          action_details: { email: data.email, reason: 'user_not_found' },
          success: false
        })
        throw new Error('Credenciales inválidas')
      }

      const user = result.rows[0]

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(data.password, user.password_hash)

      if (!isValidPassword) {
        await this.logAccess({
          user_id: user.id,
          ip_address: data.ip_address || '0.0.0.0',
          action: 'login_failed',
          action_details: { reason: 'invalid_password' },
          success: false
        })
        throw new Error('Credenciales inválidas')
      }

      // Verificar status si existe columna
      if (user.status === 'pending') {
        throw new Error('Tu cuenta está pendiente de aprobación')
      }

      if (user.status === 'suspended') {
        throw new Error('Tu cuenta ha sido suspendida')
      }

      // Verificar si es un nuevo dispositivo (degradar si no existe tabla)
      let isNewDevice = false
      try {
        isNewDevice = await this.checkNewDevice(user.id, data.device_fingerprint)
      } catch {
        isNewDevice = false
      }
      if (isNewDevice && data.device_fingerprint) {
        try {
          await this.notifyNewDeviceLogin(user, data)
        } catch {
          // ignorar fallo de alerta
        }
      }

      // Generar tokens
      const accessToken = this.generateAccessToken(user)
      const refreshToken = this.generateRefreshToken(user)

      // Almacenar refresh token en BD
      await this.storeRefreshToken(
        user.id,
        refreshToken,
        data.device_fingerprint,
        data.ip_address
      )

      // Crear sesión (degradar si no existe tabla)
      let session: any = { id: 0 }
      try {
        session = await this.createSession({
          user_id: user.id,
          session_token: refreshToken,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          device_fingerprint: data.device_fingerprint
        })
      } catch {
        session = { id: 0 }
      }

      // Log de login exitoso (ya maneja errores internamente)
      await this.logAccess({
        user_id: user.id,
        ip_address: data.ip_address || '0.0.0.0',
        user_agent: data.user_agent,
        device_fingerprint: data.device_fingerprint,
        action: 'login',
        action_details: { session_id: session?.id },
        success: true,
        session_id: session?.id?.toString?.() || null
      })

      // Obtener permisos (degrada a {}) si no hay tabla de roles
      const permissions = await this.getUserPermissions(user.id, user.role)

      // No devolver password_hash
      const { password_hash, ...userWithoutPassword } = user

      return {
        success: true,
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        permissions
      }
    } catch (error) {
      console.error('Error in login:', error)
      throw error
    }
  }

  /**
   * Logout
   */
  static async logout(userId: number, sessionToken: string) {
    try {
      // Invalidar sesión activa
      await query(
        'UPDATE active_sessions SET is_active = false WHERE user_id = $1 AND session_token = $2',
        [userId, sessionToken]
      )

      // Revocar refresh token
      await this.revokeRefreshToken(sessionToken)

      await this.logAccess({
        user_id: userId,
        action: 'logout',
        success: true
      })

      return { success: true }
    } catch (error) {
      console.error('Error in logout:', error)
      throw error
    }
  }

  /**
   * Verificar permiso
   */
  static async hasPermission(userId: number, module: string, action: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT u.role, r.permissions
         FROM users u
         LEFT JOIN roles r ON u.role = r.name
         WHERE u.id = $1`,
        [userId]
      )

      if (result.rows.length === 0) return false

      const { role, permissions } = result.rows[0]

      // Director tiene acceso a todo
      if (role === 'director') return true

      // Verificar permisos específicos
      if (permissions && permissions[module]) {
        const modulePermissions = permissions[module]
        return modulePermissions.includes(action) || modulePermissions.includes('*')
      }

      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Obtener permisos de usuario
   */
  static async getUserPermissions(userId: number, role: string) {
    try {
      const result = await query(
        'SELECT permissions FROM roles WHERE name = $1',
        [role]
      )

      if (result.rows.length === 0) return {}

      return result.rows[0].permissions
    } catch (error) {
      console.error('Error getting permissions:', error)
      return {}
    }
  }

  /**
   * Generar access token (JWT)
   */
  private static generateAccessToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        user_type: user.user_type
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  /**
   * Generar refresh token
   */
  private static generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  }

  /**
   * Almacenar refresh token en la base de datos
   */
  private static async storeRefreshToken(
    userId: number,
    token: string,
    deviceInfo?: string,
    ipAddress?: string
  ) {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 días

      await query(
        `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (token) DO UPDATE SET
           device_info = EXCLUDED.device_info,
           ip_address = EXCLUDED.ip_address,
           expires_at = EXCLUDED.expires_at`,
        [userId, token, deviceInfo || null, ipAddress || null, expiresAt]
      )
    } catch (error) {
      console.error('Error storing refresh token:', error)
      // No lanzar error para no bloquear el login
    }
  }

  /**
   * Revocar refresh token
   */
  static async revokeRefreshToken(token: string) {
    try {
      await query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
        [token]
      )
      return { success: true }
    } catch (error) {
      console.error('Error revoking refresh token:', error)
      throw error
    }
  }

  /**
   * Rotación de refresh token (invalidar el viejo y crear uno nuevo)
   */
  static async rotateRefreshToken(oldToken: string, user: any, deviceInfo?: string, ipAddress?: string) {
    try {
      // Revocar el token anterior
      await this.revokeRefreshToken(oldToken)

      // Generar nuevo token
      const newRefreshToken = this.generateRefreshToken(user)

      // Almacenar el nuevo token
      await this.storeRefreshToken(user.id, newRefreshToken, deviceInfo, ipAddress)

      return newRefreshToken
    } catch (error) {
      console.error('Error rotating refresh token:', error)
      throw error
    }
  }

  /**
   * Crear sesión
   */
  private static async createSession(data: any) {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 días

      const result = await query(
        `INSERT INTO active_sessions (
          user_id, session_token, ip_address, user_agent,
          device_fingerprint, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          data.user_id,
          data.session_token,
          data.ip_address,
          data.user_agent,
          data.device_fingerprint,
          expiresAt
        ]
      )

      return result.rows[0]
    } catch (e) {
      // Si la tabla no existe o falla, degradar silenciosamente
      console.warn('createSession fallback:', (e as any)?.code || e)
      return { id: 0 }
    }
  }

  /**
   * Log de acceso
   */
  private static async logAccess(data: any) {
    try {
      await query(
        `INSERT INTO access_logs (
          user_id, ip_address, user_agent, device_fingerprint,
          action, action_details, success, session_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.user_id || null,
          data.ip_address || '0.0.0.0',
          data.user_agent || null,
          data.device_fingerprint || null,
          data.action,
          JSON.stringify(data.action_details || {}),
          data.success !== false,
          data.session_id || null
        ]
      )
    } catch (error) {
      console.error('Error logging access:', error)
    }
  }

  /**
   * Verificar si es un nuevo dispositivo
   */
  private static async checkNewDevice(userId: number, deviceFingerprint?: string): Promise<boolean> {
    if (!deviceFingerprint) return false
    try {
      const result = await query(
        'SELECT id FROM active_sessions WHERE user_id = $1 AND device_fingerprint = $2 LIMIT 1',
        [userId, deviceFingerprint]
      )
      return result.rows.length === 0
    } catch (e) {
      // Si la tabla no existe, asumir que no es nuevo (no bloquear login)
      console.warn('checkNewDevice fallback:', (e as any)?.code || e)
      return false
    }
  }

  /**
   * Notificar login desde nuevo dispositivo
   */
  private static async notifyNewDeviceLogin(user: any, loginData: any) {
    // TODO: Implementar envío de email
    console.log(`Nuevo dispositivo detectado para usuario ${user.email}`)
    try {
      // Crear alerta de seguridad (degradar si no existe tabla)
      await query(
        `INSERT INTO security_alerts (
          alert_type, severity, user_id, ip_address, description, alert_data
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'new_device_login',
          'medium',
          user.id,
          loginData.ip_address,
          'Login desde nuevo dispositivo detectado',
          JSON.stringify({
            user_agent: loginData.user_agent,
            device_fingerprint: loginData.device_fingerprint
          })
        ]
      )
    } catch (e) {
      console.warn('notifyNewDeviceLogin fallback:', (e as any)?.code || e)
    }
  }

  /**
   * Notificar a admins para aprobación
   */
  private static async notifyAdminsForApproval(user: any) {
    // TODO: Implementar envío de email a admins
    console.log(`Usuario ${user.email} requiere aprobación`)
  }

  /**
   * Buscar o crear empresa
   */
  private static async findOrCreateCompany(name: string) {
    // Buscar empresa existente
    const existing = await query(
      'SELECT * FROM companies WHERE LOWER(name) = LOWER($1)',
      [name]
    )

    if (existing.rows.length > 0) {
      return existing.rows[0]
    }

    // Crear nueva empresa
    const result = await query(
      'INSERT INTO companies (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      [name]
    )

    return result.rows[0]
  }

  /**
   * Buscar o crear agencia
   */
  private static async findOrCreateAgency(name: string) {
    // Buscar agencia existente
    const existing = await query(
      'SELECT * FROM agencies WHERE LOWER(name) = LOWER($1)',
      [name]
    )

    if (existing.rows.length > 0) {
      return existing.rows[0]
    }

    // Crear nueva agencia
    const result = await query(
      'INSERT INTO agencies (name, created_at, updated_at) RETURNING *',
      [name]
    )

    return result.rows[0]
  }
}

export default AuthService
