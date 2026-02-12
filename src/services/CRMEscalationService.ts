/**
 * CRM Escalation Service
 * 
 * Servicio de escalación multi-nivel para notificaciones CRM.
 * 
 * Niveles:
 *   1. Agente asignado (inmediato)
 *   2. Supervisor / Admin (30 min sin atender)
 *   3. Gerencia / Todos los admins (2h sin atender)
 *   4. Push + Email urgente (4h sin atender)
 * 
 * También detecta situaciones críticas:
 *   - Hot leads sin contactar > 1h
 *   - Tareas vencidas > 24h
 *   - Contactos estancados > 14 días
 */

import { query } from '@/lib/db'
import { PushNotificationService } from './PushNotificationService'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface EscalationRule {
    level: number
    label: string
    delay_minutes: number
    target: 'assigned_agent' | 'supervisors' | 'all_admins' | 'all_admins_push'
    channels: ('notification' | 'push' | 'email')[]
}

interface EscalationResult {
    escalated: number
    by_level: Record<number, number>
    hot_leads_notified: number
    stale_contacts_flagged: number
    overdue_tasks_escalated: number
}

// ═══════════════════════════════════════════
// REGLAS DE ESCALACIÓN
// ═══════════════════════════════════════════

const ESCALATION_LEVELS: EscalationRule[] = [
    {
        level: 1,
        label: 'Agente asignado',
        delay_minutes: 0,
        target: 'assigned_agent',
        channels: ['notification'],
    },
    {
        level: 2,
        label: 'Supervisor',
        delay_minutes: 30,
        target: 'supervisors',
        channels: ['notification', 'push'],
    },
    {
        level: 3,
        label: 'Gerencia',
        delay_minutes: 120, // 2 horas
        target: 'all_admins',
        channels: ['notification', 'push'],
    },
    {
        level: 4,
        label: 'Escalación máxima',
        delay_minutes: 240, // 4 horas
        target: 'all_admins_push',
        channels: ['notification', 'push', 'email'],
    },
]

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMEscalationService {

    /**
     * Ejecutar ciclo completo de escalación
     * Diseñado para ser llamado periódicamente (cron cada 15 min)
     */
    async runEscalationCycle(): Promise<EscalationResult> {
        const result: EscalationResult = {
            escalated: 0,
            by_level: {},
            hot_leads_notified: 0,
            stale_contacts_flagged: 0,
            overdue_tasks_escalated: 0,
        }

        // 1. Escalar notificaciones sin leer
        await this.escalateUnreadNotifications(result)

        // 2. Detectar hot leads sin contactar
        await this.flagUnattendedHotLeads(result)

        // 3. Detectar contactos estancados
        await this.flagStaleContacts(result)

        // 4. Escalar tareas vencidas
        await this.escalateOverdueTasks(result)

        return result
    }

    /**
     * Escalar notificaciones urgentes que no han sido leídas
     */
    private async escalateUnreadNotifications(result: EscalationResult): Promise<void> {
        // Buscar notificaciones con prioridad alta/urgente no leídas
        const unread = await query(`
      SELECT n.*, c.assigned_agent_id, c.full_name AS contact_name,
             EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 60 AS minutes_unread
      FROM crm_notifications n
      LEFT JOIN crm_contacts c ON n.contact_id = c.id
      WHERE n.is_read = false
        AND n.priority IN ('high', 'urgent')
        AND n.created_at >= NOW() - INTERVAL '12 hours'
      ORDER BY n.created_at ASC
    `)

        for (const notif of unread.rows) {
            const minutesUnread = parseFloat(notif.minutes_unread || '0')
            const currentLevel = this.getMetadataLevel(notif.metadata)

            // Determinar siguiente nivel de escalación
            for (const level of ESCALATION_LEVELS) {
                if (level.level <= currentLevel) continue
                if (minutesUnread < level.delay_minutes) break

                // Escalar
                await this.executeEscalation(level, notif, notif.contact_name)

                // Actualizar metadata con nivel actual
                await query(`
          UPDATE crm_notifications SET
            metadata = COALESCE(metadata, '{}')::jsonb || $2::jsonb,
            updated_at = NOW()
          WHERE id = $1
        `, [notif.id, JSON.stringify({ escalation_level: level.level })])

                result.escalated++
                result.by_level[level.level] = (result.by_level[level.level] || 0) + 1
            }
        }
    }

    /**
     * Detectar hot leads sin contactar en la última hora
     */
    private async flagUnattendedHotLeads(result: EscalationResult): Promise<void> {
        const hotLeads = await query(`
      SELECT c.id, c.full_name, c.lead_score, c.assigned_agent_id,
             c.interested_destination, c.pipeline_stage
      FROM crm_contacts c
      WHERE c.is_hot_lead = true
        AND c.status = 'active'
        AND c.pipeline_stage NOT IN ('won', 'lost')
        AND NOT EXISTS (
          SELECT 1 FROM crm_interactions i
          WHERE i.contact_id = c.id
          AND i.created_at >= NOW() - INTERVAL '1 hour'
        )
        AND NOT EXISTS (
          SELECT 1 FROM crm_notifications n
          WHERE n.contact_id = c.id
          AND n.notification_type = 'escalation'
          AND n.title LIKE '%Hot lead sin atender%'
          AND n.created_at >= NOW() - INTERVAL '2 hours'
        )
    `)

        for (const lead of hotLeads.rows) {
            await query(`
        INSERT INTO crm_notifications (
          contact_id, notification_type, priority, title, message,
          action_url, action_label, metadata, created_at
        ) VALUES ($1, 'escalation', 'urgent',
          $2, $3, $4, 'Contactar ahora',
          $5, NOW())
      `, [
                lead.id,
                `🔥 Hot lead sin atender: ${lead.full_name}`,
                `${lead.full_name} tiene score ${lead.lead_score} y está interesado en ${lead.interested_destination || 'destino sin definir'}. ¡No se ha contactado en la última hora!`,
                `/dashboard/crm/contacts/${lead.id}`,
                JSON.stringify({ escalation_type: 'hot_lead_unattended', escalation_level: 1 }),
            ])

            // Push al agente asignado
            if (lead.assigned_agent_id) {
                await this.sendPushToAgent(lead.assigned_agent_id, {
                    title: `🔥 Hot lead: ${lead.full_name}`,
                    body: `Score ${lead.lead_score} — ${lead.interested_destination || 'Contactar AHORA'}`,
                })
            }

            result.hot_leads_notified++
        }
    }

    /**
     * Detectar contactos estancados (>14 días en misma etapa)
     */
    private async flagStaleContacts(result: EscalationResult): Promise<void> {
        const stale = await query(`
      SELECT c.id, c.full_name, c.pipeline_stage, c.days_in_stage,
             c.assigned_agent_id, c.lead_score
      FROM crm_contacts c
      WHERE c.status = 'active'
        AND c.days_in_stage > 14
        AND c.pipeline_stage NOT IN ('won', 'lost', 'post_trip')
        AND NOT EXISTS (
          SELECT 1 FROM crm_notifications n
          WHERE n.contact_id = c.id
          AND n.notification_type = 'escalation'
          AND n.title LIKE '%estancado%'
          AND n.created_at >= NOW() - INTERVAL '3 days'
        )
    `)

        for (const contact of stale.rows) {
            await query(`
        INSERT INTO crm_notifications (
          contact_id, notification_type, priority, title, message,
          action_url, action_label, metadata, created_at
        ) VALUES ($1, 'escalation', 'medium',
          $2, $3, $4, 'Revisar contacto',
          $5, NOW())
      `, [
                contact.id,
                `⚠️ Contacto estancado: ${contact.full_name}`,
                `${contact.full_name} lleva ${contact.days_in_stage} días en etapa "${contact.pipeline_stage}". Score: ${contact.lead_score}. Necesita acción.`,
                `/dashboard/crm/contacts/${contact.id}`,
                JSON.stringify({ escalation_type: 'stale_contact', days: contact.days_in_stage }),
            ])

            result.stale_contacts_flagged++
        }
    }

    /**
     * Escalar tareas vencidas hace más de 24h
     */
    private async escalateOverdueTasks(result: EscalationResult): Promise<void> {
        const overdue = await query(`
      SELECT t.id, t.title, t.contact_id, t.assigned_to, t.priority, t.due_date,
             c.full_name AS contact_name,
             EXTRACT(EPOCH FROM (NOW() - t.due_date)) / 3600 AS hours_overdue
      FROM crm_tasks t
      LEFT JOIN crm_contacts c ON t.contact_id = c.id
      WHERE t.status = 'pending'
        AND t.due_date < NOW() - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM crm_notifications n
          WHERE n.contact_id = t.contact_id
          AND n.notification_type = 'escalation'
          AND n.title LIKE '%tarea vencida%'
          AND n.created_at >= NOW() - INTERVAL '24 hours'
        )
    `)

        for (const task of overdue.rows) {
            const hoursOverdue = Math.round(parseFloat(task.hours_overdue || '0'))

            await query(`
        INSERT INTO crm_notifications (
          contact_id, notification_type, priority, title, message,
          action_url, action_label, metadata, created_at
        ) VALUES ($1, 'escalation', 'high',
          $2, $3, $4, 'Completar tarea',
          $5, NOW())
      `, [
                task.contact_id,
                `⏰ Tarea vencida hace ${hoursOverdue}h: ${task.title}`,
                `La tarea "${task.title}" para ${task.contact_name || 'contacto'} lleva ${hoursOverdue} horas vencida. Prioridad: ${task.priority}.`,
                `/dashboard/crm/contacts/${task.contact_id}`,
                JSON.stringify({ escalation_type: 'task_overdue', task_id: task.id, hours_overdue: hoursOverdue }),
            ])

            // Push si hay agente asignado
            if (task.assigned_to) {
                await this.sendPushToAgent(task.assigned_to, {
                    title: `⏰ Tarea vencida: ${task.title}`,
                    body: `${task.contact_name || 'Contacto'} — vencida hace ${hoursOverdue}h`,
                })
            }

            result.overdue_tasks_escalated++
        }
    }

    // ═══════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════

    private getMetadataLevel(metadata: unknown): number {
        if (!metadata) return 0
        try {
            const m = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
            return (m as Record<string, number>).escalation_level || 0
        } catch {
            return 0
        }
    }

    private async executeEscalation(
        level: EscalationRule,
        notification: Record<string, unknown>,
        contactName: string
    ): Promise<void> {
        const escalationTitle = `🚨 Escalación Nivel ${level.level}: ${notification.title}`
        const escalationMsg = `[${level.label}] ${notification.message} — Sin atender por ${level.delay_minutes} minutos.`

        // Determinar destinatarios según el nivel
        let targetUserIds: number[] = []

        switch (level.target) {
            case 'assigned_agent': {
                const agentId = notification.assigned_agent_id
                if (agentId) {
                    const user = await query(`SELECT user_id FROM tenant_users WHERE id = $1`, [agentId])
                    if (user.rows.length > 0) targetUserIds = [user.rows[0].user_id]
                }
                break
            }

            case 'supervisors': {
                const supervisors = await query(`
          SELECT user_id FROM tenant_users WHERE role IN ('AGENCY_ADMIN') LIMIT 5
        `)
                targetUserIds = supervisors.rows.map((r: { user_id: number }) => r.user_id)
                break
            }

            case 'all_admins':
            case 'all_admins_push': {
                const admins = await query(`
          SELECT user_id FROM tenant_users WHERE role IN ('AGENCY_ADMIN', 'SUPER_ADMIN') LIMIT 10
        `)
                targetUserIds = admins.rows.map((r: { user_id: number }) => r.user_id)
                break
            }
        }

        // Enviar push si el canal lo requiere
        if (level.channels.includes('push') && targetUserIds.length > 0) {
            await PushNotificationService.sendToMultipleUsers(targetUserIds, {
                title: escalationTitle,
                body: `${contactName}: ${escalationMsg}`.substring(0, 200),
                data: {
                    type: 'crm_escalation',
                    notification_id: String(notification.id),
                    contact_id: String(notification.contact_id),
                    level: level.level,
                },
            })
        }

        console.log(`[CRM Escalation] Level ${level.level} (${level.label}) for notification #${notification.id} — ${contactName}`)
    }

    private async sendPushToAgent(
        agentTenantUserId: number,
        notification: { title: string; body: string }
    ): Promise<void> {
        try {
            const user = await query(`SELECT user_id FROM tenant_users WHERE id = $1`, [agentTenantUserId])
            if (user.rows.length > 0) {
                await PushNotificationService.sendToUser(user.rows[0].user_id, {
                    title: notification.title,
                    body: notification.body,
                    data: { type: 'crm_escalation' },
                })
            }
        } catch (e) {
            console.error('[CRM Escalation] Error sending push:', e)
        }
    }
}

export const crmEscalationService = new CRMEscalationService()
