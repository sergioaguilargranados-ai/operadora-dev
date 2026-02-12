import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'
import { crmAIService } from '@/services/CRMAIService'

/**
 * POST /api/webhooks/crm
 * 
 * Webhook universal para conectar eventos del CRM con automatizaciones.
 * Cualquier sistema externo o interno puede enviar eventos aquí.
 * 
 * Payload:
 * {
 *   event: string              — Tipo de evento (contact_created, stage_changed, etc.)
 *   contact_id?: number        — ID del contacto (requerido para la mayoría de eventos)
 *   data?: Record<string, any> — Datos adicionales del evento
 *   webhook_secret?: string    — Secret para validación
 *   source?: string            — Sistema origen (internal, zapier, n8n, make, custom)
 * }
 * 
 * Eventos soportados:
 *   - contact_created, contact_updated
 *   - stage_changed, score_updated
 *   - interaction_created, task_completed, task_overdue
 *   - quote_sent, booking_created, booking_cancelled
 *   - payment_received, payment_failed
 *   - custom (ejecuta reglas con trigger_event = data.custom_event)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { event, contact_id, data, webhook_secret, source } = body

        // Validar secret
        const expectedSecret = process.env.CRM_WEBHOOK_SECRET || process.env.WEBHOOK_INTERNAL_SECRET || 'as-operadora-crm-2026'
        if (webhook_secret && webhook_secret !== expectedSecret) {
            return NextResponse.json({ success: false, error: 'Invalid webhook secret' }, { status: 403 })
        }

        if (!event) {
            return NextResponse.json({ success: false, error: 'event is required' }, { status: 400 })
        }

        console.log(`[CRM Webhook] Event: ${event}, Contact: ${contact_id || 'N/A'}, Source: ${source || 'internal'}`)

        const results: Record<string, unknown> = {
            event,
            contact_id,
            source: source || 'internal',
            timestamp: new Date().toISOString(),
            actions_executed: 0,
        }

        // 1. Ejecutar reglas de automatización
        if (contact_id) {
            const automationCount = await crmService.executeAutomationRules(event, contact_id, data)
            results.actions_executed = automationCount
        }

        // 2. Recalcular score si es relevante
        const scoreEvents = ['interaction_created', 'quote_sent', 'booking_created', 'stage_changed', 'payment_received']
        if (contact_id && scoreEvents.includes(event)) {
            const scoring = await crmAIService.calculateAdvancedScore(contact_id)
            results.new_score = scoring.total_score
            results.is_hot = scoring.is_hot
        }

        // 3. Generar notificación inteligente para eventos importantes
        const notifyEvents: Record<string, string> = {
            booking_created: 'booking_created',
            stage_changed: 'stage_changed',
            task_overdue: 'task_overdue',
            payment_received: 'purchase_intent',
            payment_failed: 'lead_abandoned',
        }

        if (contact_id && notifyEvents[event]) {
            try {
                const summary = await crmAIService.generateNotificationSummary(
                    notifyEvents[event], contact_id, data
                )
                await crmService.createNotification({
                    contact_id,
                    notification_type: 'webhook',
                    priority: summary.priority,
                    title: summary.title,
                    message: summary.body,
                    action_url: `/dashboard/crm/contacts/${contact_id}`,
                    action_label: summary.suggested_action,
                    metadata: { source: source || 'webhook', event, ...data },
                })
                results.notification_created = true
            } catch (e) {
                console.error('[CRM Webhook] Error creating notification:', e)
                results.notification_created = false
            }
        }

        // 4. Escalación automática para eventos críticos
        const criticalEvents = ['payment_failed', 'booking_cancelled', 'task_overdue']
        if (criticalEvents.includes(event) && contact_id) {
            await crmService.createNotification({
                contact_id,
                notification_type: 'escalation',
                priority: 'urgent',
                title: `🚨 Escalación: ${event.replace(/_/g, ' ')}`,
                message: `Evento crítico "${event}" para contacto #${contact_id}. Requiere atención inmediata.`,
                action_url: `/dashboard/crm/contacts/${contact_id}`,
                action_label: 'Atender ahora',
                metadata: { escalation_level: 1, original_event: event },
            })
            results.escalation_created = true
        }

        return NextResponse.json({
            success: true,
            data: results,
        })
    } catch (error) {
        console.error('[CRM Webhook] Error:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/webhooks/crm
 * 
 * Devuelve info del webhook (para verificación de servicios externos como Zapier/Make)
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        webhook: 'CRM Events Webhook',
        version: '1.0',
        supported_events: [
            'contact_created', 'contact_updated',
            'stage_changed', 'score_updated',
            'interaction_created', 'task_completed', 'task_overdue',
            'quote_sent', 'booking_created', 'booking_cancelled',
            'payment_received', 'payment_failed',
            'custom',
        ],
        documentation: 'POST con { event, contact_id, data, webhook_secret, source }',
    })
}
