/**
 * CRM Calendar Service
 * 
 * Gestión de eventos y calendario para el CRM.
 * 
 * Funcionalidades:
 *   - Vista de calendario con tareas, seguimientos y viajes
 *   - Creación de eventos desde el CRM
 *   - Sincronización con Google Calendar (cuando se configure API)
 *   - Generación de links iCal / Google Calendar
 *   - Feed semanal de eventos próximos
 */

import { query } from '@/lib/db'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

export interface CalendarEvent {
    id: string
    title: string
    description: string
    start: string
    end: string
    type: 'task' | 'followup' | 'travel' | 'meeting' | 'call' | 'deadline' | 'campaign'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    contact_id?: number
    contact_name?: string
    status: 'pending' | 'completed' | 'overdue' | 'cancelled'
    color: string
    metadata?: Record<string, unknown>
}

interface WeeklyDigest {
    period: { start: string; end: string }
    total_events: number
    by_type: Record<string, number>
    overdue: CalendarEvent[]
    today: CalendarEvent[]
    upcoming: CalendarEvent[]
    travel_departures: CalendarEvent[]
}

// ═══════════════════════════════════════════
// COLORES POR TIPO
// ═══════════════════════════════════════════

const TYPE_COLORS: Record<string, string> = {
    task: '#3B82F6',       // blue
    followup: '#8B5CF6',   // violet
    travel: '#10B981',     // emerald
    meeting: '#F59E0B',    // amber
    call: '#06B6D4',       // cyan
    deadline: '#EF4444',   // red
    campaign: '#EC4899',   // pink
}

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMCalendarService {

    /**
     * Obtener eventos del calendario en un rango de fechas
     */
    async getEvents(dateFrom: string, dateTo: string, agentId?: number): Promise<CalendarEvent[]> {
        const events: CalendarEvent[] = []

        // 1. Tareas del CRM
        const agentFilter = agentId ? `AND t.assigned_to = ${agentId}` : ''
        const tasks = await query(`
      SELECT t.id, t.title, t.description, t.task_type, t.status, t.priority,
             t.due_date, t.contact_id,
             c.full_name AS contact_name
      FROM crm_tasks t
      LEFT JOIN crm_contacts c ON t.contact_id = c.id
      WHERE t.due_date BETWEEN $1 AND $2
        ${agentFilter}
      ORDER BY t.due_date ASC
    `, [dateFrom, dateTo])

        for (const t of tasks.rows) {
            const dueDate = new Date(t.due_date)
            const isOverdue = t.status === 'pending' && dueDate < new Date()
            events.push({
                id: `task-${t.id}`,
                title: t.title,
                description: t.description || '',
                start: t.due_date,
                end: new Date(dueDate.getTime() + 3600000).toISOString(), // +1h
                type: t.task_type === 'call' ? 'call' : t.task_type === 'meeting' ? 'meeting' : 'task',
                priority: t.priority || 'medium',
                contact_id: t.contact_id,
                contact_name: t.contact_name,
                status: isOverdue ? 'overdue' : t.status,
                color: isOverdue ? '#EF4444' : TYPE_COLORS[t.task_type] || TYPE_COLORS.task,
                metadata: { task_id: t.id },
            })
        }

        // 2. Viajes programados (contacts con travel_dates)
        const travels = await query(`
      SELECT id, full_name, interested_destination, travel_dates_start, travel_dates_end,
             num_travelers, pipeline_stage
      FROM crm_contacts
      WHERE travel_dates_start BETWEEN $1 AND $2
        AND status = 'active' AND pipeline_stage NOT IN ('lost')
      ORDER BY travel_dates_start ASC
    `, [dateFrom, dateTo])

        for (const tr of travels.rows) {
            events.push({
                id: `travel-${tr.id}`,
                title: `✈️ ${tr.full_name} → ${tr.interested_destination || 'viaje'}`,
                description: `${tr.num_travelers || 1} viajero(s). Etapa: ${tr.pipeline_stage}`,
                start: tr.travel_dates_start,
                end: tr.travel_dates_end || tr.travel_dates_start,
                type: 'travel',
                priority: 'medium',
                contact_id: tr.id,
                contact_name: tr.full_name,
                status: 'pending',
                color: TYPE_COLORS.travel,
            })
        }

        // 3. Seguimientos próximos (contacts con next_followup_at)
        const followups = await query(`
      SELECT id, full_name, next_followup_at, pipeline_stage, lead_score
      FROM crm_contacts
      WHERE next_followup_at BETWEEN $1 AND $2
        AND status = 'active'
      ORDER BY next_followup_at ASC
    `, [dateFrom, dateTo])

        for (const f of followups.rows) {
            events.push({
                id: `followup-${f.id}`,
                title: `📞 Seguimiento: ${f.full_name}`,
                description: `Score: ${f.lead_score}. Etapa: ${f.pipeline_stage}`,
                start: f.next_followup_at,
                end: new Date(new Date(f.next_followup_at).getTime() + 1800000).toISOString(), // +30 min
                type: 'followup',
                priority: f.lead_score >= 70 ? 'high' : 'medium',
                contact_id: f.id,
                contact_name: f.full_name,
                status: 'pending',
                color: TYPE_COLORS.followup,
            })
        }

        return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    }

    /**
     * Digest semanal de eventos
     */
    async getWeeklyDigest(agentId?: number): Promise<WeeklyDigest> {
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        const events = await this.getEvents(
            startOfWeek.toISOString(),
            endOfWeek.toISOString(),
            agentId
        )

        const today = new Date().toISOString().split('T')[0]

        const byType: Record<string, number> = {}
        events.forEach(e => {
            byType[e.type] = (byType[e.type] || 0) + 1
        })

        return {
            period: {
                start: startOfWeek.toISOString(),
                end: endOfWeek.toISOString(),
            },
            total_events: events.length,
            by_type: byType,
            overdue: events.filter(e => e.status === 'overdue'),
            today: events.filter(e => e.start.startsWith(today)),
            upcoming: events.filter(e => new Date(e.start) > now && new Date(e.start) <= endOfWeek),
            travel_departures: events.filter(e => e.type === 'travel'),
        }
    }

    /**
     * Generar link de Google Calendar para un evento
     */
    generateGoogleCalendarLink(event: {
        title: string
        description?: string
        start: string
        end: string
        location?: string
    }): string {
        const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: `${fmt(event.start)}/${fmt(event.end)}`,
            details: event.description || '',
            location: event.location || '',
        })
        return `https://calendar.google.com/calendar/render?${params.toString()}`
    }

    /**
     * Generar contenido iCal (.ics)
     */
    generateICalEvent(event: {
        title: string
        description?: string
        start: string
        end: string
        location?: string
    }): string {
        const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AS Operadora//CRM//ES',
            'BEGIN:VEVENT',
            `DTSTART:${fmt(event.start)}`,
            `DTEND:${fmt(event.end)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location || ''}`,
            `UID:${Date.now()}@asoperadora.com`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n')
    }
}

export const crmCalendarService = new CRMCalendarService()
