/**
 * COMMUNICATION SERVICE
 * Servicio completo de mensajería multicanal con trazabilidad
 */

import { query, queryOne, queryMany } from '@/lib/db'
import { emailService } from './EmailService'

// ================================================================
// TIPOS E INTERFACES
// ================================================================

export interface CommunicationThread {
  id: number
  thread_type: string
  subject: string
  reference_type?: string
  reference_id?: number
  client_id: number
  assigned_agent_id?: number
  status: string
  priority: string
  last_message_at?: Date
  last_message_by?: number
  message_count: number
  unread_count_client: number
  unread_count_agent: number
  sla_deadline?: Date
  tags: string[]
  category?: string
  is_archived: boolean
  tenant_id: number
  created_at: Date
  updated_at: Date
}

export interface Message {
  id: number
  thread_id: number
  sender_id?: number
  sender_type: string
  sender_name: string
  sender_email?: string
  subject?: string
  body: string
  body_html?: string
  message_type: string
  attachments: any[]
  metadata: any
  is_internal: boolean
  requires_response: boolean
  requires_moderation: boolean
  moderation_status: string
  status: string
  sent_at?: Date
  tenant_id: number
  created_at: Date
}

export interface MessageDelivery {
  id: number
  message_id: number
  channel: string
  recipient: string
  status: string
  provider?: string
  provider_message_id?: string
  error_message?: string
  sent_at?: Date
  delivered_at?: Date
  read_at?: Date
  retry_count: number
}

export interface CommunicationPreferences {
  user_id: number
  email_enabled: boolean
  sms_enabled: boolean
  whatsapp_enabled: boolean
  in_app_enabled: boolean
  email_address?: string
  phone_number?: string
  whatsapp_number?: string
  booking_confirmations: boolean
  payment_reminders: boolean
  itinerary_changes: boolean
  promotional: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  timezone: string
}

// ================================================================
// CLASE PRINCIPAL
// ================================================================

export class CommunicationService {

  // ================================================================
  // THREADS - Hilos de conversación
  // ================================================================

  /**
   * Crear nuevo hilo de conversación
   */
  static async createThread(data: {
    client_id: number
    subject: string
    thread_type?: string
    reference_type?: string
    reference_id?: number
    assigned_agent_id?: number
    priority?: string
    tags?: string[]
    tenant_id: number
  }): Promise<CommunicationThread> {
    const result = await query<CommunicationThread>(
      `INSERT INTO communication_threads
       (client_id, subject, thread_type, reference_type, reference_id,
        assigned_agent_id, priority, tags, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.client_id,
        data.subject,
        data.thread_type || 'general',
        data.reference_type,
        data.reference_id,
        data.assigned_agent_id,
        data.priority || 'normal',
        data.tags || [],
        data.tenant_id
      ]
    )

    return result.rows[0]
  }

  /**
   * Obtener hilos de un cliente
   */
  static async getClientThreads(
    clientId: number,
    tenantId: number,
    filters?: {
      status?: string
      is_archived?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<CommunicationThread[]> {
    let sql = `
      SELECT t.*,
             u_agent.name as agent_name,
             u_client.name as client_name
      FROM communication_threads t
      LEFT JOIN users u_agent ON t.assigned_agent_id = u_agent.id
      LEFT JOIN users u_client ON t.client_id = u_client.id
      WHERE t.client_id = $1 AND t.tenant_id = $2
    `
    const params: any[] = [clientId, tenantId]
    let paramCount = 2

    if (filters?.status) {
      paramCount++
      sql += ` AND t.status = $${paramCount}`
      params.push(filters.status)
    }

    if (filters?.is_archived !== undefined) {
      paramCount++
      sql += ` AND t.is_archived = $${paramCount}`
      params.push(filters.is_archived)
    }

    sql += ` ORDER BY t.last_message_at DESC NULLS LAST, t.created_at DESC`

    if (filters?.limit) {
      paramCount++
      sql += ` LIMIT $${paramCount}`
      params.push(filters.limit)
    }

    if (filters?.offset) {
      paramCount++
      sql += ` OFFSET $${paramCount}`
      params.push(filters.offset)
    }

    const result = await query<CommunicationThread>(sql, params)
    return result.rows
  }

  /**
   * Obtener hilos asignados a un agente
   */
  static async getAgentThreads(
    agentId: number,
    tenantId: number,
    filters?: {
      status?: string
      priority?: string
      limit?: number
    }
  ): Promise<CommunicationThread[]> {
    let sql = `
      SELECT t.*,
             u_client.name as client_name,
             u_client.email as client_email
      FROM communication_threads t
      LEFT JOIN users u_client ON t.client_id = u_client.id
      WHERE t.assigned_agent_id = $1 AND t.tenant_id = $2
    `
    const params: any[] = [agentId, tenantId]
    let paramCount = 2

    if (filters?.status) {
      paramCount++
      sql += ` AND t.status = $${paramCount}`
      params.push(filters.status)
    }

    if (filters?.priority) {
      paramCount++
      sql += ` AND t.priority = $${paramCount}`
      params.push(filters.priority)
    }

    sql += ` ORDER BY
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
      END,
      t.last_message_at DESC NULLS LAST
    `

    if (filters?.limit) {
      paramCount++
      sql += ` LIMIT $${paramCount}`
      params.push(filters.limit)
    }

    const result = await query<CommunicationThread>(sql, params)
    return result.rows
  }

  /**
   * Actualizar estado de hilo
   */
  static async updateThreadStatus(
    threadId: number,
    status: string,
    userId?: number
  ): Promise<void> {
    await query(
      `UPDATE communication_threads
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, threadId]
    )
  }

  /**
   * Asignar agente a hilo
   */
  static async assignAgent(
    threadId: number,
    agentId: number
  ): Promise<void> {
    await query(
      `UPDATE communication_threads
       SET assigned_agent_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [agentId, threadId]
    )
  }

  /**
   * Marcar mensajes como leídos
   */
  static async markThreadAsRead(
    threadId: number,
    userId: number,
    userType: 'client' | 'agent'
  ): Promise<void> {
    const column = userType === 'client' ? 'unread_count_client' : 'unread_count_agent'

    await query(
      `UPDATE communication_threads
       SET ${column} = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [threadId]
    )
  }

  // ================================================================
  // MESSAGES - Mensajes individuales
  // ================================================================

  /**
   * Enviar mensaje (con moderación opcional)
   */
  static async sendMessage(data: {
    thread_id: number
    sender_id?: number
    sender_type: string
    sender_name: string
    sender_email?: string
    subject?: string
    body: string
    body_html?: string
    message_type?: string
    attachments?: any[]
    metadata?: any
    is_internal?: boolean
    requires_response?: boolean
    requires_moderation?: boolean
    tenant_id: number
  }): Promise<Message> {
    // Verificar si requiere moderación
    const settings = await this.getSettings(data.tenant_id)
    const needsModeration = data.requires_moderation ??
      (settings.moderation_enabled && data.sender_type === 'client')

    // Crear mensaje
    const result = await query<Message>(
      `INSERT INTO messages
       (thread_id, sender_id, sender_type, sender_name, sender_email,
        subject, body, body_html, message_type, attachments, metadata,
        is_internal, requires_response, requires_moderation,
        moderation_status, status, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        data.thread_id,
        data.sender_id,
        data.sender_type,
        data.sender_name,
        data.sender_email,
        data.subject,
        data.body,
        data.body_html,
        data.message_type || 'text',
        JSON.stringify(data.attachments || []),
        JSON.stringify(data.metadata || {}),
        data.is_internal || false,
        data.requires_response || false,
        needsModeration,
        needsModeration ? 'pending' : 'approved',
        needsModeration ? 'pending' : 'sent',
        data.tenant_id
      ]
    )

    const message = result.rows[0]

    // Si no requiere moderación, enviar inmediatamente
    if (!needsModeration) {
      await this.deliverMessage(message.id, data.tenant_id)
    }

    return message
  }

  /**
   * Obtener mensajes de un hilo
   */
  static async getThreadMessages(
    threadId: number,
    includeInternal: boolean = false
  ): Promise<Message[]> {
    let sql = `
      SELECT m.*,
             u.name as sender_full_name,
             u.email as sender_user_email
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.thread_id = $1
        AND m.is_deleted = false
    `

    if (!includeInternal) {
      sql += ` AND m.is_internal = false`
    }

    sql += ` ORDER BY m.created_at ASC`

    const result = await query<Message>(sql, [threadId])
    return result.rows
  }

  /**
   * Moderar mensaje (aprobar o rechazar)
   */
  static async moderateMessage(
    messageId: number,
    moderatorId: number,
    approved: boolean,
    tenantId: number
  ): Promise<void> {
    const status = approved ? 'approved' : 'rejected'

    await query(
      `UPDATE messages
       SET moderation_status = $1,
           moderated_by = $2,
           moderated_at = CURRENT_TIMESTAMP,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, moderatorId, approved ? 'sent' : 'rejected', messageId]
    )

    // Si fue aprobado, enviar
    if (approved) {
      await this.deliverMessage(messageId, tenantId)
    }
  }

  /**
   * Entregar mensaje por todos los canales habilitados
   */
  static async deliverMessage(
    messageId: number,
    tenantId: number
  ): Promise<void> {
    // Obtener mensaje y preferencias del destinatario
    const message = await queryOne<Message & { client_id: number }>(
      `SELECT m.*, t.client_id
       FROM messages m
       JOIN communication_threads t ON m.thread_id = t.id
       WHERE m.id = $1`,
      [messageId]
    )

    if (!message) {
      throw new Error('Message not found')
    }

    const prefs = await this.getUserPreferences(message.client_id)

    // Determinar canales a usar
    const channels: string[] = []

    if (prefs.email_enabled && prefs.email_address) {
      channels.push('email')
    }
    if (prefs.sms_enabled && prefs.phone_number) {
      channels.push('sms')
    }
    if (prefs.whatsapp_enabled && prefs.whatsapp_number) {
      channels.push('whatsapp')
    }
    // In-app siempre está disponible
    channels.push('in_app')

    // Crear registros de delivery
    for (const channel of channels) {
      let recipient = ''

      switch (channel) {
        case 'email':
          recipient = prefs.email_address!
          break
        case 'sms':
        case 'whatsapp':
          recipient = channel === 'sms' ? prefs.phone_number! : prefs.whatsapp_number!
          break
        case 'in_app':
          recipient = message.client_id.toString()
          break
      }

      await query(
        `INSERT INTO message_deliveries
         (message_id, channel, recipient, status, tenant_id)
         VALUES ($1, $2, $3, 'pending', $4)`,
        [messageId, channel, recipient, tenantId]
      )
    }

    // Procesar envíos
    await this.processDeliveries(messageId)
  }

  /**
   * Procesar envíos pendientes de un mensaje
   */
  static async processDeliveries(messageId: number): Promise<void> {
    const deliveries = await queryMany(
      `SELECT d.*, m.subject, m.body, m.body_html
       FROM message_deliveries d
       JOIN messages m ON d.message_id = m.id
       WHERE d.message_id = $1 AND d.status = 'pending'`,
      [messageId]
    )

    for (const delivery of deliveries) {
      try {
        switch (delivery.channel) {
          case 'email':
            await this.sendEmail(delivery)
            break
          case 'sms':
            await this.sendSMS(delivery)
            break
          case 'whatsapp':
            await this.sendWhatsApp(delivery)
            break
          case 'in_app':
            // In-app no requiere envío externo
            await query(
              `UPDATE message_deliveries
               SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [delivery.id]
            )
            break
        }
      } catch (error: any) {
        // Registrar error
        await query(
          `UPDATE message_deliveries
           SET status = 'failed',
               error_message = $1,
               failed_at = CURRENT_TIMESTAMP,
               retry_count = retry_count + 1
           WHERE id = $2`,
          [error.message, delivery.id]
        )
      }
    }
  }

  /**
   * Enviar por email
   */
  private static async sendEmail(delivery: any): Promise<void> {
    const success = await emailService.sendEmail({
      to: delivery.recipient,
      subject: delivery.subject || 'Mensaje de AS Operadora',
      html: delivery.body_html || delivery.body,
      text: delivery.body
    })

    if (success) {
      await query(
        `UPDATE message_deliveries
         SET status = 'sent',
             sent_at = CURRENT_TIMESTAMP,
             provider = 'smtp'
         WHERE id = $1`,
        [delivery.id]
      )
    } else {
      throw new Error('Email delivery failed')
    }
  }

  /**
   * Enviar por SMS (integración futura con Twilio)
   */
  private static async sendSMS(delivery: any): Promise<void> {
    // TODO: Integrar con Twilio
    console.log('[SMS] Would send to:', delivery.recipient)

    // Por ahora marcamos como enviado
    await query(
      `UPDATE message_deliveries
       SET status = 'sent',
           sent_at = CURRENT_TIMESTAMP,
           provider = 'twilio'
       WHERE id = $1`,
      [delivery.id]
    )
  }

  /**
   * Enviar por WhatsApp (integración futura)
   */
  private static async sendWhatsApp(delivery: any): Promise<void> {
    // TODO: Integrar con WhatsApp Business API
    console.log('[WhatsApp] Would send to:', delivery.recipient)

    // Por ahora marcamos como enviado
    await query(
      `UPDATE message_deliveries
       SET status = 'sent',
           sent_at = CURRENT_TIMESTAMP,
           provider = 'whatsapp_business'
       WHERE id = $1`,
      [delivery.id]
    )
  }

  /**
   * Registrar lectura de mensaje
   */
  static async registerRead(
    messageId: number,
    userId: number,
    tenantId: number,
    metadata?: {
      ip_address?: string
      user_agent?: string
      device_type?: string
    }
  ): Promise<void> {
    // Verificar si ya fue leído por este usuario
    const existing = await queryOne(
      `SELECT id FROM message_reads
       WHERE message_id = $1 AND user_id = $2`,
      [messageId, userId]
    )

    if (existing) {
      return // Ya fue leído
    }

    // Registrar lectura
    await query(
      `INSERT INTO message_reads
       (message_id, user_id, ip_address, user_agent, device_type, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        messageId,
        userId,
        metadata?.ip_address,
        metadata?.user_agent,
        metadata?.device_type,
        tenantId
      ]
    )

    // Actualizar delivery si existe
    await query(
      `UPDATE message_deliveries
       SET status = 'read',
           read_at = CURRENT_TIMESTAMP
       WHERE message_id = $1 AND channel = 'in_app'`,
      [messageId]
    )
  }

  // ================================================================
  // PREFERENCIAS
  // ================================================================

  /**
   * Obtener preferencias de usuario
   */
  static async getUserPreferences(userId: number): Promise<CommunicationPreferences> {
    let prefs = await queryOne<CommunicationPreferences>(
      `SELECT * FROM communication_preferences WHERE user_id = $1`,
      [userId]
    )

    // Si no existen, crear por defecto
    if (!prefs) {
      const user = await queryOne(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      )

      const result = await query<CommunicationPreferences>(
        `INSERT INTO communication_preferences (user_id, email_address, tenant_id)
         VALUES ($1, $2, 1)
         RETURNING *`,
        [userId, user?.email]
      )

      prefs = result.rows[0]
    }

    return prefs
  }

  /**
   * Actualizar preferencias
   */
  static async updatePreferences(
    userId: number,
    prefs: Partial<CommunicationPreferences>
  ): Promise<void> {
    const fields = Object.keys(prefs)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ')

    const values = Object.values(prefs)

    await query(
      `UPDATE communication_preferences
       SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, ...values]
    )
  }

  // ================================================================
  // CONFIGURACIÓN
  // ================================================================

  /**
   * Obtener configuración del tenant
   */
  static async getSettings(tenantId: number): Promise<any> {
    const settings = await queryOne(
      `SELECT * FROM communication_settings WHERE tenant_id = $1`,
      [tenantId]
    )

    return settings || {
      moderation_enabled: true,
      daily_message_limit: 100,
      retention_days: 2555
    }
  }

  /**
   * Verificar límite de mensajes
   */
  static async checkRateLimit(
    userId: number,
    tenantId: number
  ): Promise<boolean> {
    const settings = await this.getSettings(tenantId)

    const count = await queryOne(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE sender_id = $1
         AND tenant_id = $2
         AND created_at > NOW() - INTERVAL '1 hour'`,
      [userId, tenantId]
    )

    return (count?.count || 0) < settings.rate_limit_per_user
  }

  // ================================================================
  // TEMPLATES Y RESPUESTAS RÁPIDAS
  // ================================================================

  /**
   * Obtener templates
   */
  static async getTemplates(tenantId: number, category?: string): Promise<any[]> {
    let sql = `SELECT * FROM message_templates WHERE tenant_id = $1 AND is_active = true`
    const params: any[] = [tenantId]

    if (category) {
      sql += ` AND category = $2`
      params.push(category)
    }

    sql += ` ORDER BY name`

    const result = await query(sql, params)
    return result.rows
  }

  /**
   * Obtener respuestas rápidas
   */
  static async getQuickResponses(userId: number, tenantId: number): Promise<any[]> {
    const result = await query(
      `SELECT * FROM quick_responses
       WHERE (created_by = $1 OR is_global = true)
         AND tenant_id = $2
         AND is_active = true
       ORDER BY use_count DESC, title`,
      [userId, tenantId]
    )

    return result.rows
  }

  // ================================================================
  // ESTADÍSTICAS
  // ================================================================

  /**
   * Estadísticas de un agente
   */
  static async getAgentStats(agentId: number, tenantId: number): Promise<any> {
    const stats = await queryOne(
      `SELECT
         COUNT(*) as total_threads,
         COUNT(*) FILTER (WHERE status = 'active') as active_threads,
         COUNT(*) FILTER (WHERE status = 'closed') as closed_threads,
         AVG(response_time_minutes) as avg_response_time
       FROM communication_threads
       WHERE assigned_agent_id = $1 AND tenant_id = $2`,
      [agentId, tenantId]
    )

    return stats
  }
}

export default CommunicationService
