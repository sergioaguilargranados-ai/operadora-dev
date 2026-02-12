/**
 * CRMService — Servicio Centralizado del CRM
 * v2.314 — 11 Feb 2026
 * 
 * Módulos:
 *   - Contacts: CRUD, búsqueda, vista 360°
 *   - Pipeline: Gestión de etapas, movimiento, métricas
 *   - Scoring: Cálculo automático de lead score
 *   - Tasks: Seguimientos, recordatorios, tareas automatizadas
 *   - Analytics: Funnel, KPIs por agente, por fuente
 * 
 * Reglas de oro:
 *   1. Cada contacto SIEMPRE tiene un pipeline_stage
 *   2. Cada cambio de etapa genera interacción automática
 *   3. El scoring se recalcula en cada actualización relevante
 *   4. Las notificaciones inteligentes se disparan por eventos
 */

import { query, queryOne } from '@/lib/db'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface CRMContactInput {
  tenant_id?: number
  user_id?: number
  agency_client_id?: number
  contact_type?: string
  full_name: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  position?: string
  avatar_url?: string
  source?: string
  source_detail?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  pipeline_stage?: string
  assigned_agent_id?: number
  interested_destination?: string
  travel_dates_start?: string
  travel_dates_end?: string
  num_travelers?: number
  budget_min?: number
  budget_max?: number
  budget_currency?: string
  travel_type?: string
  special_requirements?: string
  tags?: string[]
  notes?: string
  birthday?: string
}

export interface CRMContact extends CRMContactInput {
  id: number
  lead_score: number
  score_signals: Record<string, number>
  is_hot_lead: boolean
  ltv: number
  total_bookings: number
  total_quotes: number
  total_interactions: number
  stage_changed_at: Date
  days_in_stage: number
  first_contact_at: Date
  last_contact_at: Date | null
  next_followup_at: Date | null
  status: string
  created_at: Date
  updated_at: Date
  // Joined fields
  assigned_agent_name?: string
  assigned_agent_email?: string
  tenant_name?: string
}

export interface CRMInteractionInput {
  tenant_id?: number
  contact_id: number
  interaction_type: string
  channel?: string
  direction?: string
  subject?: string
  body?: string
  summary?: string
  outcome?: string
  next_action?: string
  quote_id?: number
  booking_id?: number
  thread_id?: number
  duration_seconds?: number
  performed_by?: number
  performed_by_name?: string
  is_automated?: boolean
  metadata?: Record<string, unknown>
}

export interface CRMTaskInput {
  tenant_id?: number
  contact_id?: number
  quote_id?: number
  booking_id?: number
  assigned_to: number
  created_by?: number
  task_type: string
  title: string
  description?: string
  due_date: string
  reminder_at?: string
  priority?: string
  is_recurring?: boolean
  recurrence_pattern?: string
  parent_task_id?: number
  is_automated?: boolean
  source_trigger?: string
}

export interface PipelineStage {
  id: number
  stage_key: string
  stage_label: string
  stage_order: number
  color: string
  icon: string
  is_win_stage: boolean
  is_loss_stage: boolean
  sla_hours: number | null
  count?: number
  total_value?: number
}

export interface PipelineMetrics {
  total_contacts: number
  total_value: number
  avg_days_to_close: number
  conversion_rate: number
  stages: PipelineStage[]
  by_source: { source: string; count: number; conversion_rate: number }[]
  by_agent: { agent_id: number; agent_name: string; count: number; won: number; conversion_rate: number }[]
}

export interface ContactTimeline {
  type: 'interaction' | 'task' | 'stage_change' | 'quote' | 'booking' | 'notification'
  id: number
  title: string
  description: string
  icon: string
  color: string
  created_at: Date
  metadata?: Record<string, unknown>
}

// ═══════════════════════════════════════════
// SCORING SIGNALS (puntos por señal)
// ═══════════════════════════════════════════
const SCORE_WEIGHTS: Record<string, number> = {
  has_destination: 20,
  has_dates: 15,
  has_travelers: 10,
  has_budget: 15,
  asked_payment: 25,
  visited_3_tours: 10,
  existing_client: 30,
  from_referral: 15,
  from_campaign: 10,
  family_travel: 10,
  urgent_travel: 20,     // < 30 días
  quote_opened: 5,
  quote_stale: -5,       // > 24h sin respuesta
  no_response_48h: -10,
  responded_quickly: 10,
}

// ═══════════════════════════════════════════
// CRM SERVICE
// ═══════════════════════════════════════════

export class CRMService {

  // ─────────────────────────────────────────
  // CONTACTS: CRUD
  // ─────────────────────────────────────────

  /**
   * Crear contacto CRM con auto-scoring
   */
  async createContact(data: CRMContactInput): Promise<CRMContact> {
    // Calcular score inicial
    const signals = this.calculateScoreSignals(data)
    const score = Object.values(signals).reduce((sum, v) => sum + v, 0)
    const isHot = score >= 70

    const result = await query(`
      INSERT INTO crm_contacts (
        tenant_id, user_id, agency_client_id, contact_type,
        full_name, email, phone, whatsapp, company, position, avatar_url,
        source, source_detail, utm_source, utm_medium, utm_campaign,
        pipeline_stage, assigned_agent_id, assigned_at,
        interested_destination, travel_dates_start, travel_dates_end,
        num_travelers, budget_min, budget_max, budget_currency,
        travel_type, special_requirements,
        lead_score, score_signals, is_hot_lead,
        tags, notes, birthday,
        stage_changed_at, first_contact_at, last_contact_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19,
        $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28,
        $29, $30, $31,
        $32, $33, $34,
        NOW(), NOW(), NOW()
      ) RETURNING *
    `, [
      data.tenant_id || null,
      data.user_id || null,
      data.agency_client_id || null,
      data.contact_type || 'lead',
      data.full_name,
      data.email || null,
      data.phone || null,
      data.whatsapp || null,
      data.company || null,
      data.position || null,
      data.avatar_url || null,
      data.source || 'web',
      data.source_detail || null,
      data.utm_source || null,
      data.utm_medium || null,
      data.utm_campaign || null,
      data.pipeline_stage || 'new',
      data.assigned_agent_id || null,
      data.assigned_agent_id ? new Date() : null,
      data.interested_destination || null,
      data.travel_dates_start || null,
      data.travel_dates_end || null,
      data.num_travelers || null,
      data.budget_min || null,
      data.budget_max || null,
      data.budget_currency || 'MXN',
      data.travel_type || null,
      data.special_requirements || null,
      Math.max(0, Math.min(100, score)),
      JSON.stringify(signals),
      isHot,
      data.tags || [],
      data.notes || null,
      data.birthday || null,
    ])

    const contact = result.rows[0]

    // Crear interacción automática de creación
    await this.createInteraction({
      tenant_id: data.tenant_id,
      contact_id: contact.id,
      interaction_type: 'system_auto',
      channel: 'system',
      direction: 'internal',
      subject: 'Contacto creado',
      body: `Contacto "${data.full_name}" registrado. Fuente: ${data.source || 'web'}. Score: ${score}.`,
      is_automated: true,
    })

    return contact
  }

  /**
   * Actualizar contacto + recalcular score
   */
  async updateContact(id: number, data: Partial<CRMContactInput>): Promise<CRMContact | null> {
    // Obtener contacto actual para recalcular score
    const current = await this.getContactById(id)
    if (!current) return null

    const merged = { ...current, ...data }
    const signals = this.calculateScoreSignals(merged)
    const score = Math.max(0, Math.min(100, Object.values(signals).reduce((sum, v) => sum + v, 0)))
    const isHot = score >= 70

    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    const addField = (name: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${name} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    // Mapear campos actualizables
    addField('full_name', data.full_name)
    addField('email', data.email)
    addField('phone', data.phone)
    addField('whatsapp', data.whatsapp)
    addField('company', data.company)
    addField('position', data.position)
    addField('avatar_url', data.avatar_url)
    addField('contact_type', data.contact_type)
    addField('source', data.source)
    addField('source_detail', data.source_detail)
    addField('assigned_agent_id', data.assigned_agent_id)
    addField('interested_destination', data.interested_destination)
    addField('travel_dates_start', data.travel_dates_start)
    addField('travel_dates_end', data.travel_dates_end)
    addField('num_travelers', data.num_travelers)
    addField('budget_min', data.budget_min)
    addField('budget_max', data.budget_max)
    addField('budget_currency', data.budget_currency)
    addField('travel_type', data.travel_type)
    addField('special_requirements', data.special_requirements)
    addField('notes', data.notes)
    addField('birthday', data.birthday)
    addField('next_followup_at', data.tags !== undefined ? null : undefined) // skip
    addField('status', (data as Record<string, unknown>).status as string | undefined)

    if (data.tags !== undefined) {
      fields.push(`tags = $${paramIndex}`)
      values.push(data.tags)
      paramIndex++
    }

    // Siempre actualizar score
    fields.push(`lead_score = $${paramIndex}`)
    values.push(score)
    paramIndex++

    fields.push(`score_signals = $${paramIndex}`)
    values.push(JSON.stringify(signals))
    paramIndex++

    fields.push(`is_hot_lead = $${paramIndex}`)
    values.push(isHot)
    paramIndex++

    fields.push(`updated_at = NOW()`)
    fields.push(`last_contact_at = NOW()`)

    if (data.assigned_agent_id && data.assigned_agent_id !== current.assigned_agent_id) {
      fields.push(`assigned_at = NOW()`)
    }

    values.push(id)
    const result = await query(
      `UPDATE crm_contacts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0] || null
  }

  /**
   * Obtener contacto por ID
   */
  async getContactById(id: number): Promise<CRMContact | null> {
    const result = await queryOne(`
      SELECT c.*,
        u.name AS assigned_agent_name,
        u.email AS assigned_agent_email,
        t.company_name AS tenant_name
      FROM crm_contacts c
      LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
      LEFT JOIN users u ON tu.user_id = u.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE c.id = $1
    `, [id])

    return result || null
  }

  /**
   * Listar contactos con filtros y paginación
   */
  async listContacts(filters: {
    tenant_id?: number
    agent_id?: number
    pipeline_stage?: string
    contact_type?: string
    source?: string
    status?: string
    is_hot_lead?: boolean
    search?: string
    tags?: string[]
    min_score?: number
    sort_by?: string
    sort_order?: string
    limit?: number
    offset?: number
  }): Promise<{ contacts: CRMContact[]; total: number }> {
    const conditions: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (filters.tenant_id) {
      conditions.push(`c.tenant_id = $${paramIndex++}`)
      values.push(filters.tenant_id)
    }
    if (filters.agent_id) {
      conditions.push(`c.assigned_agent_id = $${paramIndex++}`)
      values.push(filters.agent_id)
    }
    if (filters.pipeline_stage) {
      conditions.push(`c.pipeline_stage = $${paramIndex++}`)
      values.push(filters.pipeline_stage)
    }
    if (filters.contact_type) {
      conditions.push(`c.contact_type = $${paramIndex++}`)
      values.push(filters.contact_type)
    }
    if (filters.source) {
      conditions.push(`c.source = $${paramIndex++}`)
      values.push(filters.source)
    }
    if (filters.status) {
      conditions.push(`c.status = $${paramIndex++}`)
      values.push(filters.status)
    }
    if (filters.is_hot_lead !== undefined) {
      conditions.push(`c.is_hot_lead = $${paramIndex++}`)
      values.push(filters.is_hot_lead)
    }
    if (filters.min_score) {
      conditions.push(`c.lead_score >= $${paramIndex++}`)
      values.push(filters.min_score)
    }
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`c.tags && $${paramIndex++}`)
      values.push(filters.tags)
    }
    if (filters.search) {
      conditions.push(`(
        c.full_name ILIKE $${paramIndex} OR
        c.email ILIKE $${paramIndex} OR
        c.phone ILIKE $${paramIndex} OR
        c.company ILIKE $${paramIndex}
      )`)
      values.push(`%${filters.search}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sortField = filters.sort_by || 'created_at'
    const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC'
    const validSortFields = ['created_at', 'updated_at', 'lead_score', 'full_name', 'last_contact_at', 'next_followup_at', 'ltv']
    const safeSort = validSortFields.includes(sortField) ? sortField : 'created_at'

    const limit = Math.min(filters.limit || 50, 200)
    const offset = filters.offset || 0

    const [contactsResult, countResult] = await Promise.all([
      query(`
        SELECT c.*,
          u.name AS assigned_agent_name,
          u.email AS assigned_agent_email,
          t.company_name AS tenant_name
        FROM crm_contacts c
        LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
        LEFT JOIN users u ON tu.user_id = u.id
        LEFT JOIN tenants t ON c.tenant_id = t.id
        ${whereClause}
        ORDER BY c.${safeSort} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...values, limit, offset]),
      query(`SELECT COUNT(*) AS total FROM crm_contacts c ${whereClause}`, values)
    ])

    return {
      contacts: contactsResult.rows,
      total: parseInt(countResult.rows[0]?.total || '0')
    }
  }

  /**
   * Búsqueda full-text en contactos
   */
  async searchContacts(searchQuery: string, tenantId?: number, limit = 20): Promise<CRMContact[]> {
    const conditions = [`to_tsvector('spanish', COALESCE(full_name,'') || ' ' || COALESCE(email,'') || ' ' || COALESCE(phone,'') || ' ' || COALESCE(company,'')) @@ plainto_tsquery('spanish', $1)`]
    const values: unknown[] = [searchQuery]

    if (tenantId) {
      conditions.push(`tenant_id = $2`)
      values.push(tenantId)
    }

    values.push(limit)
    const result = await query(`
      SELECT * FROM crm_contacts
      WHERE ${conditions.join(' AND ')}
      ORDER BY lead_score DESC, last_contact_at DESC NULLS LAST
      LIMIT $${values.length}
    `, values)

    return result.rows
  }

  /**
   * Vista 360° del contacto (todo unificado)
   */
  async getContact360(contactId: number): Promise<{
    contact: CRMContact
    timeline: ContactTimeline[]
    pending_tasks: unknown[]
    stats: {
      total_interactions: number
      total_tasks: number
      completed_tasks: number
      overdue_tasks: number
      total_quotes: number
      total_bookings: number
    }
  } | null> {
    const contact = await this.getContactById(contactId)
    if (!contact) return null

    const [timeline, tasks, stats] = await Promise.all([
      this.getContactTimeline(contactId, 30),
      query(`
        SELECT * FROM crm_tasks
        WHERE contact_id = $1 AND status IN ('pending', 'in_progress')
        ORDER BY due_date ASC
      `, [contactId]),
      query(`
        SELECT
          (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = $1) AS total_interactions,
          (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = $1) AS total_tasks,
          (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = $1 AND status = 'completed') AS completed_tasks,
          (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = $1 AND status = 'pending' AND due_date < NOW()) AS overdue_tasks,
          $2::integer AS total_quotes,
          $3::integer AS total_bookings
      `, [contactId, contact.total_quotes || 0, contact.total_bookings || 0])
    ])

    return {
      contact,
      timeline,
      pending_tasks: tasks.rows,
      stats: stats.rows[0]
    }
  }

  /**
   * Timeline cronológico del contacto
   */
  async getContactTimeline(contactId: number, limit = 50): Promise<ContactTimeline[]> {
    const result = await query(`
      SELECT * FROM (
        -- Interacciones
        SELECT
          'interaction' AS type,
          id,
          COALESCE(subject, interaction_type) AS title,
          COALESCE(body, '') AS description,
          CASE interaction_type
            WHEN 'call_outbound' THEN '📞'
            WHEN 'call_inbound' THEN '📲'
            WHEN 'email_sent' THEN '📧'
            WHEN 'email_received' THEN '📩'
            WHEN 'whatsapp_sent' THEN '💬'
            WHEN 'whatsapp_received' THEN '💬'
            WHEN 'meeting' THEN '🤝'
            WHEN 'note' THEN '📝'
            WHEN 'system_auto' THEN '⚙️'
            WHEN 'quote_sent' THEN '💰'
            WHEN 'booking_created' THEN '📅'
            WHEN 'payment_received' THEN '💳'
            ELSE '📋'
          END AS icon,
          CASE outcome
            WHEN 'positive' THEN '#22C55E'
            WHEN 'negative' THEN '#EF4444'
            ELSE '#6B7280'
          END AS color,
          created_at,
          metadata::text AS metadata
        FROM crm_interactions
        WHERE contact_id = $1

        UNION ALL

        -- Tareas completadas
        SELECT
          'task' AS type,
          id,
          title,
          COALESCE(completion_notes, description, '') AS description,
          CASE task_type
            WHEN 'call' THEN '📞'
            WHEN 'email' THEN '📧'
            WHEN 'followup' THEN '🔄'
            WHEN 'meeting' THEN '🤝'
            WHEN 'whatsapp' THEN '💬'
            ELSE '✅'
          END AS icon,
          CASE status
            WHEN 'completed' THEN '#22C55E'
            WHEN 'cancelled' THEN '#EF4444'
            ELSE '#F59E0B'
          END AS color,
          COALESCE(completed_at, created_at) AS created_at,
          '{}'::text AS metadata
        FROM crm_tasks
        WHERE contact_id = $1 AND status IN ('completed', 'cancelled')
      ) timeline
      ORDER BY created_at DESC
      LIMIT $2
    `, [contactId, limit])

    return result.rows
  }

  // ─────────────────────────────────────────
  // PIPELINE
  // ─────────────────────────────────────────

  /**
   * Obtener etapas del pipeline (custom by tenant or defaults)
   */
  async getPipelineStages(tenantId?: number): Promise<PipelineStage[]> {
    const result = await query(`
      SELECT ps.*,
        COALESCE(counts.contact_count, 0) AS count,
        COALESCE(counts.total_value, 0) AS total_value
      FROM crm_pipeline_stages ps
      LEFT JOIN LATERAL (
        SELECT 
          COUNT(*) AS contact_count,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS total_value
        FROM crm_contacts
        WHERE pipeline_stage = ps.stage_key
          AND status = 'active'
          AND ($1::integer IS NULL OR tenant_id = $1 OR tenant_id IS NULL)
      ) counts ON true
      WHERE (ps.tenant_id = $1 OR ps.tenant_id IS NULL)
        AND ps.is_active = true
      ORDER BY ps.stage_order ASC
    `, [tenantId || null])

    return result.rows
  }

  /**
   * Mover contacto de etapa en el pipeline
   */
  async moveToStage(contactId: number, newStage: string, options?: {
    lost_reason?: string
    performed_by?: number
    performed_by_name?: string
  }): Promise<CRMContact | null> {
    const contact = await this.getContactById(contactId)
    if (!contact) return null

    const oldStage = contact.pipeline_stage

    if (oldStage === newStage) return contact

    // Actualizar contacto
    const updateFields: string[] = [
      'pipeline_stage = $1',
      'stage_changed_at = NOW()',
      'days_in_stage = 0',
      'updated_at = NOW()'
    ]
    const updateValues: unknown[] = [newStage]
    let paramIdx = 2

    if (newStage === 'lost' && options?.lost_reason) {
      updateFields.push(`lost_reason = $${paramIdx++}`)
      updateValues.push(options.lost_reason)
    }

    // Si ganó, marcar como cliente
    if (newStage === 'won' || newStage === 'reserved' || newStage === 'paid') {
      updateFields.push(`contact_type = 'client'`)
    }

    updateValues.push(contactId)
    const result = await query(
      `UPDATE crm_contacts SET ${updateFields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      updateValues
    )

    // Registrar interacción de cambio de etapa
    await this.createInteraction({
      tenant_id: contact.tenant_id ? Number(contact.tenant_id) : undefined,
      contact_id: contactId,
      interaction_type: 'system_auto',
      channel: 'system',
      direction: 'internal',
      subject: `Pipeline: ${oldStage} → ${newStage}`,
      body: `Contacto movido de "${oldStage}" a "${newStage}"${options?.lost_reason ? `. Razón: ${options.lost_reason}` : ''}.`,
      performed_by: options?.performed_by,
      performed_by_name: options?.performed_by_name,
      is_automated: !options?.performed_by,
    })

    return result.rows[0] || null
  }

  /**
   * Vista Kanban del pipeline
   */
  async getPipelineView(filters?: {
    tenant_id?: number
    agent_id?: number
    search?: string
  }): Promise<{ stages: (PipelineStage & { contacts: CRMContact[] })[] }> {
    const stages = await this.getPipelineStages(filters?.tenant_id)

    const conditions: string[] = [`c.status = 'active'`]
    const values: unknown[] = []
    let paramIdx = 1

    if (filters?.tenant_id) {
      conditions.push(`c.tenant_id = $${paramIdx++}`)
      values.push(filters.tenant_id)
    }
    if (filters?.agent_id) {
      conditions.push(`c.assigned_agent_id = $${paramIdx++}`)
      values.push(filters.agent_id)
    }
    if (filters?.search) {
      conditions.push(`(c.full_name ILIKE $${paramIdx} OR c.email ILIKE $${paramIdx} OR c.company ILIKE $${paramIdx})`)
      values.push(`%${filters.search}%`)
      paramIdx++
    }

    const contactsResult = await query(`
      SELECT c.*,
        u.name AS assigned_agent_name
      FROM crm_contacts c
      LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.lead_score DESC, c.created_at DESC
    `, values)

    const contactsByStage = new Map<string, CRMContact[]>()
    for (const contact of contactsResult.rows) {
      const stageKey = contact.pipeline_stage || 'new'
      if (!contactsByStage.has(stageKey)) contactsByStage.set(stageKey, [])
      contactsByStage.get(stageKey)!.push(contact)
    }

    return {
      stages: stages.map(stage => ({
        ...stage,
        contacts: contactsByStage.get(stage.stage_key) || []
      }))
    }
  }

  /**
   * Métricas del pipeline (funnel)
   */
  async getPipelineMetrics(tenantId?: number, dateRange?: { start: string; end: string }): Promise<PipelineMetrics> {
    const conditions: string[] = [`status = 'active'`]
    const values: unknown[] = []
    let paramIdx = 1

    if (tenantId) {
      conditions.push(`tenant_id = $${paramIdx++}`)
      values.push(tenantId)
    }
    if (dateRange?.start) {
      conditions.push(`created_at >= $${paramIdx++}`)
      values.push(dateRange.start)
    }
    if (dateRange?.end) {
      conditions.push(`created_at <= $${paramIdx++}`)
      values.push(dateRange.end)
    }

    const whereClause = conditions.join(' AND ')

    const [totals, stages, sources, agents] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) AS total_contacts,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS total_value,
          COALESCE(AVG(
            CASE WHEN pipeline_stage IN ('won', 'reserved', 'paid')
            THEN EXTRACT(EPOCH FROM (stage_changed_at - first_contact_at)) / 86400
            END
          ), 0) AS avg_days_to_close,
          CASE WHEN COUNT(*) > 0 
            THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0 
          END AS conversion_rate
        FROM crm_contacts WHERE ${whereClause}
      `, values),

      this.getPipelineStages(tenantId),

      query(`
        SELECT 
          COALESCE(source, 'Desconocido') AS source,
          COUNT(*) AS count,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0
          END AS conversion_rate
        FROM crm_contacts WHERE ${whereClause}
        GROUP BY source ORDER BY count DESC LIMIT 10
      `, values),

      query(`
        SELECT 
          c.assigned_agent_id AS agent_id,
          COALESCE(u.name, 'Sin asignar') AS agent_name,
          COUNT(*) AS count,
          COUNT(*) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid')) AS won,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0
          END AS conversion_rate
        FROM crm_contacts c
        LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
        LEFT JOIN users u ON tu.user_id = u.id
        WHERE ${whereClause.split('status').map(s => 'c.status' + s.substring(s.indexOf("'"))).join('')}
        GROUP BY c.assigned_agent_id, u.name
        ORDER BY count DESC
      `, values).catch(() => ({ rows: [] }))
    ])

    return {
      total_contacts: parseInt(totals.rows[0]?.total_contacts || '0'),
      total_value: parseFloat(totals.rows[0]?.total_value || '0'),
      avg_days_to_close: parseFloat(totals.rows[0]?.avg_days_to_close || '0'),
      conversion_rate: parseFloat(totals.rows[0]?.conversion_rate || '0'),
      stages,
      by_source: sources.rows,
      by_agent: agents.rows
    }
  }

  // ─────────────────────────────────────────
  // INTERACTIONS
  // ─────────────────────────────────────────

  /**
   * Registrar interacción
   */
  async createInteraction(data: CRMInteractionInput): Promise<unknown> {
    const result = await query(`
      INSERT INTO crm_interactions (
        tenant_id, contact_id, interaction_type, channel, direction,
        subject, body, summary, outcome, next_action,
        quote_id, booking_id, thread_id,
        duration_seconds, performed_by, performed_by_name,
        is_automated, metadata
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18
      ) RETURNING *
    `, [
      data.tenant_id || null,
      data.contact_id,
      data.interaction_type,
      data.channel || null,
      data.direction || null,
      data.subject || null,
      data.body || null,
      data.summary || null,
      data.outcome || null,
      data.next_action || null,
      data.quote_id || null,
      data.booking_id || null,
      data.thread_id || null,
      data.duration_seconds || null,
      data.performed_by || null,
      data.performed_by_name || null,
      data.is_automated || false,
      JSON.stringify(data.metadata || {}),
    ])

    // Incrementar contador y actualizar última interacción
    await query(`
      UPDATE crm_contacts 
      SET total_interactions = total_interactions + 1,
          last_contact_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `, [data.contact_id])

    return result.rows[0]
  }

  /**
   * Listar interacciones de un contacto
   */
  async getInteractions(contactId: number, limit = 50, offset = 0): Promise<{ interactions: unknown[]; total: number }> {
    const [interactions, count] = await Promise.all([
      query(`
        SELECT i.*, u.name AS performer_name
        FROM crm_interactions i
        LEFT JOIN users u ON i.performed_by = u.id
        WHERE i.contact_id = $1
        ORDER BY i.created_at DESC
        LIMIT $2 OFFSET $3
      `, [contactId, limit, offset]),
      query(`SELECT COUNT(*) AS total FROM crm_interactions WHERE contact_id = $1`, [contactId])
    ])

    return {
      interactions: interactions.rows,
      total: parseInt(count.rows[0]?.total || '0')
    }
  }

  // ─────────────────────────────────────────
  // TASKS
  // ─────────────────────────────────────────

  /**
   * Crear tarea
   */
  async createTask(data: CRMTaskInput): Promise<unknown> {
    const result = await query(`
      INSERT INTO crm_tasks (
        tenant_id, contact_id, quote_id, booking_id,
        assigned_to, created_by, task_type, title, description,
        due_date, reminder_at, priority, status,
        is_recurring, recurrence_pattern, parent_task_id,
        is_automated, source_trigger
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, 'pending',
        $13, $14, $15,
        $16, $17
      ) RETURNING *
    `, [
      data.tenant_id || null,
      data.contact_id || null,
      data.quote_id || null,
      data.booking_id || null,
      data.assigned_to,
      data.created_by || null,
      data.task_type,
      data.title,
      data.description || null,
      data.due_date,
      data.reminder_at || null,
      data.priority || 'medium',
      data.is_recurring || false,
      data.recurrence_pattern || null,
      data.parent_task_id || null,
      data.is_automated || false,
      data.source_trigger || null,
    ])

    return result.rows[0]
  }

  /**
   * Obtener tareas de un agente
   */
  async getAgentTasks(userId: number, filters?: {
    status?: string
    priority?: string
    contact_id?: number
    include_overdue?: boolean
    limit?: number
    offset?: number
  }): Promise<{ tasks: unknown[]; total: number; overdue_count: number }> {
    const conditions: string[] = []
    const values: unknown[] = []
    let paramIdx = 1

    // userId=0 means all tasks (admin view)
    if (userId > 0) {
      conditions.push(`t.assigned_to = $${paramIdx++}`)
      values.push(userId)
    }

    if (filters?.status) {
      conditions.push(`t.status = $${paramIdx++}`)
      values.push(filters.status)
    } else {
      conditions.push(`t.status IN ('pending', 'in_progress')`)
    }

    if (filters?.priority) {
      conditions.push(`t.priority = $${paramIdx++}`)
      values.push(filters.priority)
    }

    if (filters?.contact_id) {
      conditions.push(`t.contact_id = $${paramIdx++}`)
      values.push(filters.contact_id)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const [tasks, count, overdue] = await Promise.all([
      query(`
        SELECT t.*, 
          c.full_name AS contact_name,
          c.email AS contact_email,
          c.lead_score AS contact_score,
          c.is_hot_lead AS contact_is_hot,
          c.pipeline_stage AS contact_stage
        FROM crm_tasks t
        LEFT JOIN crm_contacts c ON t.contact_id = c.id
        ${whereClause}
        ORDER BY 
          CASE t.priority 
            WHEN 'urgent' THEN 0 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            ELSE 3 
          END,
          t.due_date ASC
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
      `, [...values, limit, offset]),
      query(`SELECT COUNT(*) AS total FROM crm_tasks t ${whereClause}`, values),
      query(`
        SELECT COUNT(*) AS overdue_count 
        FROM crm_tasks 
        WHERE status = 'pending' AND due_date < NOW()
        ${userId > 0 ? `AND assigned_to = ${userId}` : ''}
      `, [])
    ])

    return {
      tasks: tasks.rows,
      total: parseInt(count.rows[0]?.total || '0'),
      overdue_count: parseInt(overdue.rows[0]?.overdue_count || '0')
    }
  }

  /**
   * Completar tarea
   */
  async completeTask(taskId: number, notes?: string, outcome?: string): Promise<unknown> {
    const result = await query(`
      UPDATE crm_tasks SET
        status = 'completed',
        completed_at = NOW(),
        completion_notes = $2,
        outcome = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [taskId, notes || null, outcome || null])

    const task = result.rows[0]
    if (!task) return null

    // Registrar interacción si tiene contacto
    if (task.contact_id) {
      await this.createInteraction({
        tenant_id: task.tenant_id,
        contact_id: task.contact_id,
        interaction_type: task.task_type === 'call' ? 'call_outbound' : 'system_auto',
        channel: task.task_type === 'call' ? 'phone' : 'system',
        direction: 'outbound',
        subject: `Tarea completada: ${task.title}`,
        body: notes || `Tarea "${task.title}" completada.`,
        outcome: outcome || 'neutral',
        performed_by: task.assigned_to,
        is_automated: false,
      })
    }

    return task
  }

  /**
   * Obtener tareas vencidas (para cron job)
   */
  async getOverdueTasks(): Promise<unknown[]> {
    const result = await query(`
      SELECT t.*, 
        c.full_name AS contact_name,
        u.name AS agent_name,
        u.email AS agent_email
      FROM crm_tasks t
      LEFT JOIN crm_contacts c ON t.contact_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status = 'pending' AND t.due_date < NOW()
      ORDER BY t.due_date ASC
    `)
    return result.rows
  }

  // ─────────────────────────────────────────
  // SCORING
  // ─────────────────────────────────────────

  /**
   * Calcular señales de score basándose en datos del contacto
   */
  calculateScoreSignals(data: Partial<CRMContactInput>): Record<string, number> {
    const signals: Record<string, number> = {}

    if (data.interested_destination) signals.has_destination = SCORE_WEIGHTS.has_destination
    if (data.travel_dates_start) signals.has_dates = SCORE_WEIGHTS.has_dates
    if (data.num_travelers && data.num_travelers > 0) signals.has_travelers = SCORE_WEIGHTS.has_travelers
    if (data.budget_min || data.budget_max) signals.has_budget = SCORE_WEIGHTS.has_budget
    if (data.source === 'referral') signals.from_referral = SCORE_WEIGHTS.from_referral
    if (data.utm_source || data.utm_campaign) signals.from_campaign = SCORE_WEIGHTS.from_campaign
    if (data.travel_type === 'family') signals.family_travel = SCORE_WEIGHTS.family_travel
    if (data.contact_type === 'client') signals.existing_client = SCORE_WEIGHTS.existing_client

    // Urgencia de viaje
    if (data.travel_dates_start) {
      const days = Math.ceil((new Date(data.travel_dates_start as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (days <= 30 && days > 0) signals.urgent_travel = SCORE_WEIGHTS.urgent_travel
    }

    return signals
  }

  /**
   * Agregar señal de scoring y recalcular
   */
  async addScoreSignal(contactId: number, signal: string, value?: number): Promise<void> {
    const contact = await this.getContactById(contactId)
    if (!contact) return

    const signals = typeof contact.score_signals === 'string'
      ? JSON.parse(contact.score_signals)
      : (contact.score_signals || {})

    signals[signal] = value ?? (SCORE_WEIGHTS[signal] || 5)
    const totalScore = Math.max(0, Math.min(100, Object.values(signals).reduce((sum: number, v) => sum + (v as number), 0)))
    const isHot = totalScore >= 70

    await query(`
      UPDATE crm_contacts SET
        lead_score = $1,
        score_signals = $2,
        is_hot_lead = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [totalScore, JSON.stringify(signals), isHot, contactId])
  }

  /**
   * Obtener hot leads
   */
  async getHotLeads(tenantId?: number, limit = 20): Promise<CRMContact[]> {
    const conditions = [`is_hot_lead = true`, `status = 'active'`]
    const values: unknown[] = []

    if (tenantId) {
      conditions.push(`tenant_id = $1`)
      values.push(tenantId)
    }

    values.push(limit)
    const result = await query(`
      SELECT c.*, u.name AS assigned_agent_name
      FROM crm_contacts c
      LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY lead_score DESC, last_contact_at DESC NULLS LAST
      LIMIT $${values.length}
    `, values)

    return result.rows
  }

  // ─────────────────────────────────────────
  // DASHBOARD / ANALYTICS
  // ─────────────────────────────────────────

  /**
   * KPIs del dashboard CRM
   */
  async getDashboardKPIs(tenantId?: number): Promise<{
    total_contacts: number
    new_today: number
    new_this_week: number
    new_this_month: number
    hot_leads: number
    total_value: number
    conversion_rate: number
    avg_response_time_hours: number
    overdue_tasks: number
    unassigned_contacts: number
  }> {
    const filter = tenantId ? `AND tenant_id = ${tenantId}` : ''

    const result = await query(`
      SELECT
        COUNT(*) AS total_contacts,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS new_today,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS new_this_week,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS new_this_month,
        COUNT(*) FILTER (WHERE is_hot_lead = true) AS hot_leads,
        COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS total_value,
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
          ELSE 0 
        END AS conversion_rate,
        0 AS avg_response_time_hours,
        (SELECT COUNT(*) FROM crm_tasks WHERE status = 'pending' AND due_date < NOW()) AS overdue_tasks,
        COUNT(*) FILTER (WHERE assigned_agent_id IS NULL AND pipeline_stage NOT IN ('won', 'lost')) AS unassigned_contacts
      FROM crm_contacts
      WHERE status = 'active' ${filter}
    `)

    const row = result.rows[0]
    return {
      total_contacts: parseInt(row.total_contacts || '0'),
      new_today: parseInt(row.new_today || '0'),
      new_this_week: parseInt(row.new_this_week || '0'),
      new_this_month: parseInt(row.new_this_month || '0'),
      hot_leads: parseInt(row.hot_leads || '0'),
      total_value: parseFloat(row.total_value || '0'),
      conversion_rate: parseFloat(row.conversion_rate || '0'),
      avg_response_time_hours: parseFloat(row.avg_response_time_hours || '0'),
      overdue_tasks: parseInt(row.overdue_tasks || '0'),
      unassigned_contacts: parseInt(row.unassigned_contacts || '0'),
    }
  }

  /**
   * Distribución por fuente (para gráfica de pie)
   */
  async getSourceDistribution(tenantId?: number): Promise<{ source: string; count: number; percentage: number }[]> {
    const filter = tenantId ? `AND tenant_id = ${tenantId}` : ''
    const result = await query(`
      SELECT 
        COALESCE(source, 'Desconocido') AS source,
        COUNT(*) AS count,
        ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER(), 0) * 100, 1) AS percentage
      FROM crm_contacts
      WHERE status = 'active' ${filter}
      GROUP BY source
      ORDER BY count DESC
    `)
    return result.rows
  }

  /**
   * Actividad reciente (para feed del dashboard)
   */
  async getRecentActivity(tenantId?: number, limit = 20): Promise<unknown[]> {
    const filter = tenantId ? `AND i.tenant_id = ${tenantId}` : ''
    const result = await query(`
      SELECT 
        i.id,
        i.interaction_type,
        i.subject,
        i.created_at,
        i.is_automated,
        c.full_name AS contact_name,
        c.pipeline_stage,
        c.lead_score,
        u.name AS performed_by_name
      FROM crm_interactions i
      JOIN crm_contacts c ON i.contact_id = c.id
      LEFT JOIN users u ON i.performed_by = u.id
      WHERE 1=1 ${filter}
      ORDER BY i.created_at DESC
      LIMIT $1
    `, [limit])
    return result.rows
  }

  // ─────────────────────────────────────────
  // ANALYTICS AVANZADOS
  // ─────────────────────────────────────────

  /**
   * Rendimiento por agente
   */
  async getAgentPerformance(tenantId?: number): Promise<{
    agents: {
      agent_id: number
      agent_name: string
      agent_email: string
      total_contacts: number
      hot_leads: number
      won: number
      lost: number
      conversion_rate: number
      avg_score: number
      total_tasks: number
      completed_tasks: number
      overdue_tasks: number
      total_interactions: number
      avg_response_hours: number
      total_pipeline_value: number
    }[]
  }> {
    const filter = tenantId ? `AND c.tenant_id = ${tenantId}` : ''

    const result = await query(`
      SELECT
        tu.id AS agent_id,
        COALESCE(u.name, 'Sin nombre') AS agent_name,
        COALESCE(u.email, '') AS agent_email,
        COUNT(DISTINCT c.id) AS total_contacts,
        COUNT(DISTINCT c.id) FILTER (WHERE c.is_hot_lead = true) AS hot_leads,
        COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage = 'won') AS won,
        COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage = 'lost') AS lost,
        CASE WHEN COUNT(DISTINCT c.id) > 0
          THEN ROUND(
            COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid'))::numeric
            / COUNT(DISTINCT c.id)::numeric * 100, 1
          ) ELSE 0
        END AS conversion_rate,
        COALESCE(ROUND(AVG(c.lead_score)::numeric, 1), 0) AS avg_score,
        COALESCE((SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = tu.user_id), 0) AS total_tasks,
        COALESCE((SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = tu.user_id AND t.status = 'completed'), 0) AS completed_tasks,
        COALESCE((SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = tu.user_id AND t.status = 'pending' AND t.due_date < NOW()), 0) AS overdue_tasks,
        COALESCE((SELECT COUNT(*) FROM crm_interactions i WHERE i.performed_by = tu.user_id), 0) AS total_interactions,
        0 AS avg_response_hours,
        COALESCE(SUM(COALESCE(c.budget_max, c.budget_min, 0)), 0) AS total_pipeline_value
      FROM tenant_users tu
      JOIN users u ON tu.user_id = u.id
      LEFT JOIN crm_contacts c ON c.assigned_agent_id = tu.id ${filter}
      WHERE tu.role IN ('AGENT', 'AGENCY_ADMIN')
      GROUP BY tu.id, u.name, u.email, tu.user_id
      ORDER BY won DESC, total_contacts DESC
    `)

    return {
      agents: result.rows.map(r => ({
        agent_id: r.agent_id,
        agent_name: r.agent_name,
        agent_email: r.agent_email,
        total_contacts: parseInt(r.total_contacts || '0'),
        hot_leads: parseInt(r.hot_leads || '0'),
        won: parseInt(r.won || '0'),
        lost: parseInt(r.lost || '0'),
        conversion_rate: parseFloat(r.conversion_rate || '0'),
        avg_score: parseFloat(r.avg_score || '0'),
        total_tasks: parseInt(r.total_tasks || '0'),
        completed_tasks: parseInt(r.completed_tasks || '0'),
        overdue_tasks: parseInt(r.overdue_tasks || '0'),
        total_interactions: parseInt(r.total_interactions || '0'),
        avg_response_hours: parseFloat(r.avg_response_hours || '0'),
        total_pipeline_value: parseFloat(r.total_pipeline_value || '0'),
      }))
    }
  }

  /**
   * Funnel de conversión con tasas entre etapas
   */
  async getConversionFunnel(tenantId?: number): Promise<{
    stages: {
      stage: string
      label: string
      count: number
      percentage: number
      drop_rate: number
      avg_days: number
      value: number
    }[]
    overall_rate: number
  }> {
    const filter = tenantId ? `AND tenant_id = ${tenantId}` : ''

    const stageOrder = [
      { key: 'new', label: 'Nuevo' },
      { key: 'qualified', label: 'Calificado' },
      { key: 'quoted', label: 'Cotizado' },
      { key: 'negotiation', label: 'Negociación' },
      { key: 'reserved', label: 'Reservado' },
      { key: 'paid', label: 'Pagado' },
      { key: 'won', label: 'Ganado' },
    ]

    const result = await query(`
      SELECT
        pipeline_stage,
        COUNT(*) AS count,
        COALESCE(AVG(days_in_stage), 0) AS avg_days,
        COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS value
      FROM crm_contacts
      WHERE status = 'active' ${filter}
      GROUP BY pipeline_stage
    `)

    const stageCounts: Record<string, { count: number; avg_days: number; value: number }> = {}
    for (const row of result.rows) {
      stageCounts[row.pipeline_stage] = {
        count: parseInt(row.count || '0'),
        avg_days: parseFloat(row.avg_days || '0'),
        value: parseFloat(row.value || '0'),
      }
    }

    const totalAll = Object.values(stageCounts).reduce((s, v) => s + v.count, 0)

    const stages = stageOrder.map((s, i) => {
      const data = stageCounts[s.key] || { count: 0, avg_days: 0, value: 0 }
      const prevCount = i === 0 ? totalAll : (stageCounts[stageOrder[i - 1].key]?.count || 0)
      const dropRate = prevCount > 0 ? Math.round((1 - data.count / prevCount) * 100) : 0

      return {
        stage: s.key,
        label: s.label,
        count: data.count,
        percentage: totalAll > 0 ? Math.round((data.count / totalAll) * 100) : 0,
        drop_rate: Math.max(0, dropRate),
        avg_days: Math.round(data.avg_days * 10) / 10,
        value: data.value,
      }
    })

    const wonCount = stageCounts['won']?.count || 0
    const overallRate = totalAll > 0 ? Math.round((wonCount / totalAll) * 100 * 10) / 10 : 0

    return { stages, overall_rate: overallRate }
  }

  /**
   * Tendencias temporales (leads e interacciones por día)
   */
  async getTrendData(days = 30, tenantId?: number): Promise<{
    leads_by_day: { date: string; count: number }[]
    interactions_by_day: { date: string; count: number }[]
    tasks_by_day: { date: string; created: number; completed: number }[]
  }> {
    const filter = tenantId ? `AND tenant_id = ${tenantId}` : ''

    const [leads, interactions, tasks] = await Promise.all([
      query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM crm_contacts
        WHERE created_at >= NOW() - ($1 || ' days')::interval ${filter}
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days]),
      query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM crm_interactions
        WHERE created_at >= NOW() - ($1 || ' days')::interval ${filter}
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days]),
      query(`
        SELECT
          d.date,
          COALESCE(c.created, 0) AS created,
          COALESCE(comp.completed, 0) AS completed
        FROM generate_series(
          (NOW() - ($1 || ' days')::interval)::date,
          CURRENT_DATE,
          '1 day'::interval
        ) AS d(date)
        LEFT JOIN (
          SELECT DATE(created_at) AS date, COUNT(*) AS created
          FROM crm_tasks GROUP BY DATE(created_at)
        ) c ON c.date = d.date
        LEFT JOIN (
          SELECT DATE(completed_at) AS date, COUNT(*) AS completed
          FROM crm_tasks WHERE completed_at IS NOT NULL GROUP BY DATE(completed_at)
        ) comp ON comp.date = d.date
        ORDER BY d.date
      `, [days]),
    ])

    return {
      leads_by_day: leads.rows.map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        count: parseInt(r.count || '0'),
      })),
      interactions_by_day: interactions.rows.map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        count: parseInt(r.count || '0'),
      })),
      tasks_by_day: tasks.rows.map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        created: parseInt(r.created || '0'),
        completed: parseInt(r.completed || '0'),
      })),
    }
  }

  /**
   * Velocidad del pipeline (días promedio en cada etapa)
   */
  async getPipelineVelocity(tenantId?: number): Promise<{
    stages: { stage: string; avg_days: number; median_days: number; count: number }[]
    avg_total_days: number
  }> {
    const filter = tenantId ? `AND tenant_id = ${tenantId}` : ''

    const result = await query(`
      SELECT
        pipeline_stage,
        ROUND(AVG(days_in_stage)::numeric, 1) AS avg_days,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_in_stage) AS median_days,
        COUNT(*) AS count
      FROM crm_contacts
      WHERE status = 'active' AND days_in_stage > 0 ${filter}
      GROUP BY pipeline_stage
      ORDER BY
        CASE pipeline_stage
          WHEN 'new' THEN 1 WHEN 'qualified' THEN 2 WHEN 'interested' THEN 3
          WHEN 'quoted' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'reserved' THEN 6
          WHEN 'paid' THEN 7 WHEN 'traveling' THEN 8 WHEN 'post_trip' THEN 9
          WHEN 'won' THEN 10 ELSE 11
        END
    `)

    const avgTotal = await query(`
      SELECT ROUND(AVG(
        EXTRACT(EPOCH FROM (COALESCE(stage_changed_at, NOW()) - first_contact_at)) / 86400
      )::numeric, 1) AS avg_total_days
      FROM crm_contacts
      WHERE pipeline_stage IN ('won', 'reserved', 'paid') ${filter}
    `)

    return {
      stages: result.rows.map(r => ({
        stage: r.pipeline_stage,
        avg_days: parseFloat(r.avg_days || '0'),
        median_days: parseFloat(r.median_days || '0'),
        count: parseInt(r.count || '0'),
      })),
      avg_total_days: parseFloat(avgTotal.rows[0]?.avg_total_days || '0'),
    }
  }

  // ─────────────────────────────────────────
  // VINCULAR DATOS EXISTENTES
  // ─────────────────────────────────────────

  /**
   * Importar agency_clients existentes como contactos CRM
   * (Migración one-time o ejecutable múltiples veces de forma segura)
   */
  async importExistingClients(): Promise<{ imported: number; skipped: number }> {
    // Obtener clientes de agencia que no tienen contacto CRM vinculado
    const clients = await query(`
      SELECT ac.*, u.name, u.email AS user_email
      FROM agency_clients ac
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE NOT EXISTS (
        SELECT 1 FROM crm_contacts cc WHERE cc.agency_client_id = ac.id
      )
    `)

    let imported = 0
    let skipped = 0

    for (const client of clients.rows) {
      try {
        await this.createContact({
          tenant_id: client.tenant_id || client.agency_id,
          user_id: client.user_id,
          agency_client_id: client.id,
          contact_type: 'client',
          full_name: client.client_name || client.name || 'Sin nombre',
          email: client.client_email || client.user_email,
          phone: client.client_phone,
          source: client.source || 'referral',
          pipeline_stage: client.total_bookings > 0 ? 'won' : 'qualified',
          assigned_agent_id: client.agent_id,
        })
        imported++
      } catch (e) {
        console.error(`Error importando cliente ${client.id}:`, e)
        skipped++
      }
    }

    return { imported, skipped }
  }

  /**
   * Importar cotizaciones existentes como contactos CRM
   */
  async importExistingQuotes(): Promise<{ imported: number; skipped: number }> {
    const quotes = await query(`
      SELECT tq.*
      FROM tour_quotes tq
      WHERE NOT EXISTS (
        SELECT 1 FROM crm_contacts cc 
        WHERE cc.email = tq.contact_email
          AND cc.full_name = tq.contact_name
      )
    `)

    let imported = 0
    let skipped = 0

    for (const quote of quotes.rows) {
      try {
        const contact = await this.createContact({
          contact_type: 'lead',
          full_name: quote.contact_name,
          email: quote.contact_email,
          phone: quote.contact_phone,
          source: 'web',
          source_detail: `Cotización de tour: ${quote.tour_name}`,
          pipeline_stage: quote.status === 'confirmed' ? 'reserved' : 'quoted',
          interested_destination: quote.tour_region,
          num_travelers: quote.num_personas,
          budget_max: quote.total_price,
          budget_currency: 'USD',
        })

        // Registrar interacción de cotización
        await this.createInteraction({
          contact_id: contact.id,
          interaction_type: 'quote_sent',
          channel: 'email',
          direction: 'outbound',
          subject: `Cotización: ${quote.tour_name}`,
          body: `Folio: ${quote.folio}. Tour: ${quote.tour_name}. Total: $${quote.total_price} USD.`,
          quote_id: quote.id,
          is_automated: true,
        })

        imported++
      } catch (e) {
        console.error(`Error importando quote ${quote.id}:`, e)
        skipped++
      }
    }

    return { imported, skipped }
  }

  // ═══════════════════════════════════════════
  // SMART NOTIFICATIONS
  // ═══════════════════════════════════════════

  /**
   * Crear notificación inteligente
   */
  async createNotification(data: {
    tenant_id?: number
    contact_id?: number
    user_id?: number
    notification_type: string
    priority?: string
    title: string
    message?: string
    action_url?: string
    action_label?: string
    auto_dismiss_hours?: number
    metadata?: Record<string, unknown>
  }): Promise<unknown> {
    const result = await query(`
      INSERT INTO crm_smart_notifications (
        tenant_id, contact_id, user_id, notification_type, priority,
        title, message, action_url, action_label, auto_dismiss_hours,
        metadata, expires_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        CASE WHEN $10 > 0 THEN NOW() + ($10 || ' hours')::interval ELSE NULL END
      )
      RETURNING *
    `, [
      data.tenant_id || null, data.contact_id || null, data.user_id || null,
      data.notification_type, data.priority || 'medium',
      data.title, data.message || null, data.action_url || null,
      data.action_label || null, data.auto_dismiss_hours || 0,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ])
    return result.rows[0]
  }

  /**
   * Listar notificaciones (para un usuario o todas)
   */
  async listNotifications(filters: {
    user_id?: number
    tenant_id?: number
    is_read?: boolean
    priority?: string
    notification_type?: string
    limit?: number
    offset?: number
  }): Promise<{ notifications: unknown[]; total: number; unread: number }> {
    const conditions: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (filters.user_id) {
      conditions.push(`n.user_id = $${idx++}`)
      values.push(filters.user_id)
    }
    if (filters.tenant_id) {
      conditions.push(`n.tenant_id = $${idx++}`)
      values.push(filters.tenant_id)
    }
    if (filters.is_read !== undefined) {
      conditions.push(`n.is_read = $${idx++}`)
      values.push(filters.is_read)
    }
    if (filters.priority) {
      conditions.push(`n.priority = $${idx++}`)
      values.push(filters.priority)
    }
    if (filters.notification_type) {
      conditions.push(`n.notification_type = $${idx++}`)
      values.push(filters.notification_type)
    }

    // Exclude expired
    conditions.push(`(n.expires_at IS NULL OR n.expires_at > NOW())`)
    conditions.push(`n.is_dismissed = false`)

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = filters.limit || 50
    const offset = filters.offset || 0

    const [rows, count, unread] = await Promise.all([
      query(`
        SELECT n.*,
          c.full_name AS contact_name,
          c.lead_score AS contact_score,
          c.is_hot_lead AS contact_is_hot
        FROM crm_smart_notifications n
        LEFT JOIN crm_contacts c ON n.contact_id = c.id
        ${whereClause}
        ORDER BY
          CASE n.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
          n.created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1}
      `, [...values, limit, offset]),
      query(`SELECT COUNT(*) AS total FROM crm_smart_notifications n ${whereClause}`, values),
      query(`
        SELECT COUNT(*) AS unread FROM crm_smart_notifications n
        ${whereClause ? whereClause + ' AND' : 'WHERE'} n.is_read = false
      `, values),
    ])

    return {
      notifications: rows.rows,
      total: parseInt(count.rows[0]?.total || '0'),
      unread: parseInt(unread.rows[0]?.unread || '0'),
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationRead(notificationId: number): Promise<void> {
    await query(`UPDATE crm_smart_notifications SET is_read = true, read_at = NOW() WHERE id = $1`, [notificationId])
  }

  /**
   * Marcar todas como leídas
   */
  async markAllNotificationsRead(userId?: number): Promise<number> {
    const res = userId
      ? await query(`UPDATE crm_smart_notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false`, [userId])
      : await query(`UPDATE crm_smart_notifications SET is_read = true, read_at = NOW() WHERE is_read = false`)
    return res.rowCount || 0
  }

  /**
   * Descartar notificación
   */
  async dismissNotification(notificationId: number): Promise<void> {
    await query(`UPDATE crm_smart_notifications SET is_dismissed = true WHERE id = $1`, [notificationId])
  }

  /**
   * Generar notificaciones automáticas por condiciones
   */
  async generateAutoNotifications(): Promise<number> {
    let count = 0

    // 1. Hot leads sin contactar en >24h
    const staleHotLeads = await query(`
      SELECT c.id, c.full_name, c.lead_score
      FROM crm_contacts c
      WHERE c.is_hot_lead = true
        AND c.status = 'active'
        AND (c.last_contact_at IS NULL OR c.last_contact_at < NOW() - INTERVAL '24 hours')
        AND NOT EXISTS (
          SELECT 1 FROM crm_smart_notifications n
          WHERE n.contact_id = c.id AND n.notification_type = 'hot_lead_stale'
          AND n.created_at > NOW() - INTERVAL '24 hours'
        )
    `)
    for (const lead of staleHotLeads.rows) {
      await this.createNotification({
        contact_id: lead.id,
        notification_type: 'hot_lead_stale',
        priority: 'critical',
        title: `🔥 Lead caliente sin contactar: ${lead.full_name}`,
        message: `Score ${lead.lead_score}. Lleva más de 24h sin contacto. ¡Acción urgente!`,
        action_url: `/dashboard/crm/contacts/${lead.id}`,
        action_label: 'Ver contacto',
        auto_dismiss_hours: 48,
      })
      count++
    }

    // 2. Tareas vencidas
    const overdueTasks = await query(`
      SELECT t.id, t.title, t.due_date, c.full_name AS contact_name, c.id AS contact_id
      FROM crm_tasks t
      LEFT JOIN crm_contacts c ON t.contact_id = c.id
      WHERE t.status = 'pending' AND t.due_date < NOW()
        AND NOT EXISTS (
          SELECT 1 FROM crm_smart_notifications n
          WHERE n.notification_type = 'task_overdue'
          AND n.metadata->>'task_id' = t.id::text
          AND n.created_at > NOW() - INTERVAL '12 hours'
        )
    `)
    for (const task of overdueTasks.rows) {
      await this.createNotification({
        contact_id: task.contact_id,
        notification_type: 'task_overdue',
        priority: 'high',
        title: `⏰ Tarea vencida: ${task.title}`,
        message: task.contact_name ? `Contacto: ${task.contact_name}` : undefined,
        action_url: `/dashboard/crm/tasks`,
        action_label: 'Ver tareas',
        auto_dismiss_hours: 24,
        metadata: { task_id: task.id },
      })
      count++
    }

    // 3. Contactos sin actividad > 7 días en etapas activas
    const staleContacts = await query(`
      SELECT c.id, c.full_name, c.pipeline_stage, c.days_in_stage
      FROM crm_contacts c
      WHERE c.status = 'active'
        AND c.pipeline_stage NOT IN ('won', 'lost', 'post_trip')
        AND c.days_in_stage > 7
        AND NOT EXISTS (
          SELECT 1 FROM crm_smart_notifications n
          WHERE n.contact_id = c.id AND n.notification_type = 'contact_stale'
          AND n.created_at > NOW() - INTERVAL '3 days'
        )
      ORDER BY c.lead_score DESC
      LIMIT 20
    `)
    for (const contact of staleContacts.rows) {
      await this.createNotification({
        contact_id: contact.id,
        notification_type: 'contact_stale',
        priority: 'medium',
        title: `⚠️ ${contact.full_name} lleva ${contact.days_in_stage} días en "${contact.pipeline_stage}"`,
        message: 'Considera dar seguimiento o actualizar la etapa.',
        action_url: `/dashboard/crm/contacts/${contact.id}`,
        action_label: 'Ver contacto',
        auto_dismiss_hours: 72,
      })
      count++
    }

    return count
  }

  // ═══════════════════════════════════════════
  // AUTOMATION RULES
  // ═══════════════════════════════════════════

  /**
   * Listar reglas de automatización
   */
  async listAutomationRules(tenantId?: number): Promise<unknown[]> {
    const res = tenantId
      ? await query(`SELECT * FROM crm_automation_rules WHERE tenant_id = $1 ORDER BY priority ASC, name ASC`, [tenantId])
      : await query(`SELECT * FROM crm_automation_rules ORDER BY priority ASC, name ASC`)
    return res.rows
  }

  /**
   * Crear/actualizar regla de automatización
   */
  async upsertAutomationRule(data: {
    id?: number
    tenant_id?: number
    name: string
    description?: string
    trigger_event: string
    trigger_conditions?: Record<string, unknown>
    action_type: string
    action_config: Record<string, unknown>
    is_active?: boolean
    priority?: number
  }): Promise<unknown> {
    if (data.id) {
      const res = await query(`
        UPDATE crm_automation_rules SET
          name = $2, description = $3, trigger_event = $4,
          trigger_conditions = $5, action_type = $6, action_config = $7,
          is_active = $8, priority = $9, updated_at = NOW()
        WHERE id = $1 RETURNING *
      `, [
        data.id, data.name, data.description || null,
        data.trigger_event, JSON.stringify(data.trigger_conditions || {}),
        data.action_type, JSON.stringify(data.action_config),
        data.is_active !== false, data.priority || 50,
      ])
      return res.rows[0]
    }

    const res = await query(`
      INSERT INTO crm_automation_rules (
        tenant_id, name, description, trigger_event,
        trigger_conditions, action_type, action_config,
        is_active, priority
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      data.tenant_id || null, data.name, data.description || null,
      data.trigger_event, JSON.stringify(data.trigger_conditions || {}),
      data.action_type, JSON.stringify(data.action_config),
      data.is_active !== false, data.priority || 50,
    ])
    return res.rows[0]
  }

  /**
   * Activar/desactivar regla
   */
  async toggleAutomationRule(ruleId: number, isActive: boolean): Promise<void> {
    await query(`UPDATE crm_automation_rules SET is_active = $2, updated_at = NOW() WHERE id = $1`, [ruleId, isActive])
  }

  /**
   * Eliminar regla
   */
  async deleteAutomationRule(ruleId: number): Promise<void> {
    await query(`DELETE FROM crm_automation_rules WHERE id = $1`, [ruleId])
  }

  /**
   * Obtener log de automatización
   */
  async getAutomationLog(filters?: {
    rule_id?: number
    contact_id?: number
    limit?: number
  }): Promise<{ logs: unknown[]; total: number }> {
    const conditions: string[] = []
    const values: unknown[] = []
    let idx = 1
    if (filters?.rule_id) { conditions.push(`l.rule_id = $${idx++}`); values.push(filters.rule_id) }
    if (filters?.contact_id) { conditions.push(`l.contact_id = $${idx++}`); values.push(filters.contact_id) }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = filters?.limit || 50

    const [rows, count] = await Promise.all([
      query(`
        SELECT l.*, r.name AS rule_name, c.full_name AS contact_name
        FROM crm_automation_log l
        LEFT JOIN crm_automation_rules r ON l.rule_id = r.id
        LEFT JOIN crm_contacts c ON l.contact_id = c.id
        ${whereClause}
        ORDER BY l.executed_at DESC
        LIMIT $${idx}
      `, [...values, limit]),
      query(`SELECT COUNT(*) AS total FROM crm_automation_log l ${whereClause}`, values),
    ])

    return {
      logs: rows.rows,
      total: parseInt(count.rows[0]?.total || '0'),
    }
  }

  /**
   * Ejecutar reglas de automatización para un evento
   */
  async executeAutomationRules(event: string, contactId: number, eventData?: Record<string, unknown>): Promise<number> {
    const rules = await query(`
      SELECT * FROM crm_automation_rules
      WHERE trigger_event = $1 AND is_active = true
      ORDER BY priority ASC
    `, [event])

    let executed = 0

    for (const rule of rules.rows) {
      try {
        const config = typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config

        let actionResult: Record<string, unknown> = {}

        switch (rule.action_type) {
          case 'create_task': {
            const task = await this.createTask({
              contact_id: contactId,
              assigned_to: config.assigned_to || 0,
              task_type: config.task_type || 'followup',
              title: config.title || `Auto: ${rule.name}`,
              description: config.description || `Generado automáticamente por regla "${rule.name}"`,
              due_date: new Date(Date.now() + (config.due_hours || 24) * 3600000).toISOString(),
              priority: config.priority || 'medium',
              is_automated: true,
              source_trigger: event,
            })
            actionResult = { task_id: (task as Record<string, unknown>).id }
            break
          }

          case 'send_notification': {
            const notif = await this.createNotification({
              contact_id: contactId,
              notification_type: config.notification_type || 'automation',
              priority: config.priority || 'medium',
              title: config.title || rule.name,
              message: config.message,
              action_url: config.action_url || `/dashboard/crm/contacts/${contactId}`,
              action_label: config.action_label || 'Ver contacto',
            })
            actionResult = { notification_id: (notif as Record<string, unknown>).id }
            break
          }

          case 'update_score': {
            await this.addScoreSignal(contactId, config.signal || event, config.value || 5)
            actionResult = { signal: config.signal || event, value: config.value || 5 }
            break
          }

          case 'move_stage': {
            await this.moveToStage(contactId, config.new_stage, {
              performed_by_name: 'Automatización',
            })
            actionResult = { new_stage: config.new_stage }
            break
          }

          case 'add_tag': {
            await query(`
              UPDATE crm_contacts
              SET tags = array_append(
                COALESCE(tags, '{}'),
                $2
              ), updated_at = NOW()
              WHERE id = $1 AND NOT ($2 = ANY(COALESCE(tags, '{}')))
            `, [contactId, config.tag])
            actionResult = { tag: config.tag }
            break
          }

          default:
            actionResult = { skipped: true, reason: `Unknown action: ${rule.action_type}` }
        }

        // Log execution
        await query(`
          INSERT INTO crm_automation_log (rule_id, contact_id, trigger_event, action_result, status)
          VALUES ($1, $2, $3, $4, 'success')
        `, [rule.id, contactId, event, JSON.stringify(actionResult)])

        // Update execution count
        await query(`
          UPDATE crm_automation_rules SET
            execution_count = COALESCE(execution_count, 0) + 1,
            last_executed_at = NOW()
          WHERE id = $1
        `, [rule.id])

        executed++
      } catch (err) {
        // Log failure
        await query(`
          INSERT INTO crm_automation_log (rule_id, contact_id, trigger_event, action_result, status, error_message)
          VALUES ($1, $2, $3, $4, 'error', $5)
        `, [rule.id, contactId, event, '{}', (err as Error).message])
      }
    }

    return executed
  }
}

export const crmService = new CRMService()
