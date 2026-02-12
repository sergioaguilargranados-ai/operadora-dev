/**
 * CRM WhatsApp Service
 * 
 * Integración de WhatsApp con el CRM:
 * - Envío de mensajes con plantillas
 * - Seguimiento automático de conversaciones
 * - WhatsApp templates para cada etapa del pipeline
 * - Auto-registro de interacciones
 * - Quick replies personalizados
 */

import { query } from '@/lib/db'
import { sendWhatsAppMessage } from './MessagingService'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface WhatsAppTemplate {
    id: string
    name: string
    category: 'welcome' | 'followup' | 'quote' | 'reminder' | 'confirmation' | 'posttrip'
    message: string
    variables: string[]
}

interface SendResult {
    success: boolean
    contact_id: number
    message_sid?: string
    error?: string
}

// ═══════════════════════════════════════════
// PLANTILLAS DE WHATSAPP
// ═══════════════════════════════════════════

const WA_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 'wa_welcome',
        name: 'Bienvenida',
        category: 'welcome',
        variables: ['nombre', 'agente'],
        message: `¡Hola {{nombre}}! 👋

Soy {{agente}} de *AS Operadora*. Gracias por tu interés en viajar con nosotros.

Estoy aquí para ayudarte a planear el viaje perfecto. ¿Tienes algún destino en mente? ✈️🌴`,
    },
    {
        id: 'wa_followup',
        name: 'Seguimiento',
        category: 'followup',
        variables: ['nombre', 'destino'],
        message: `Hola {{nombre}} 👋

Te escribo para dar seguimiento a tu interés en viajar a *{{destino}}*.

¿Tuviste oportunidad de revisar la información? ¿Tienes alguna duda que pueda resolver?

Estoy a tus órdenes 😊`,
    },
    {
        id: 'wa_quote_sent',
        name: 'Cotización enviada',
        category: 'quote',
        variables: ['nombre', 'destino', 'precio'],
        message: `¡{{nombre}}! 📋

Te acabo de enviar tu cotización para *{{destino}}* por *{{precio}}*.

Revísala con calma y cualquier duda me comentas. Los precios son sujetos a disponibilidad, te recomiendo confirmar pronto para asegurar la mejor tarifa.

¿Alguna pregunta? 🤔`,
    },
    {
        id: 'wa_reminder',
        name: 'Recordatorio de viaje',
        category: 'reminder',
        variables: ['nombre', 'destino', 'fecha'],
        message: `¡Hola {{nombre}}! ✈️

Tu viaje a *{{destino}}* está muy cerca: *{{fecha}}*

📋 Checklist rápido:
✅ Documentos vigentes
✅ Reservaciones confirmadas
✅ Check-in online
✅ Equipaje listo

Si necesitas algo, estoy aquí. ¡Que disfrutes mucho tu viaje! 🌴🎉`,
    },
    {
        id: 'wa_confirmation',
        name: 'Confirmación de reserva',
        category: 'confirmation',
        variables: ['nombre', 'destino', 'folio'],
        message: `¡{{nombre}}! 🎉

Tu reservación ha sido *confirmada*:
📍 Destino: *{{destino}}*
🔑 Folio: *{{folio}}*

Recibirás un email con todos los detalles. Guarda este mensaje como referencia.

¡Vamos a hacer que tu viaje sea increíble! ✈️`,
    },
    {
        id: 'wa_posttrip',
        name: 'Post-viaje',
        category: 'posttrip',
        variables: ['nombre', 'destino'],
        message: `¡Hola {{nombre}}! 😊

¿Cómo estuvo tu viaje a *{{destino}}*? Espero que la hayas pasado increíble.

Tu opinión es muy importante para nosotros ⭐

También quería comentarte que si recomiendas a alguien, ambos reciben un *5% de descuento* en su próximo viaje 🎁

¡Gracias por confiar en AS Operadora! 💙`,
    },
]

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMWhatsAppService {

    /**
     * Obtener plantillas disponibles
     */
    getTemplates(): Omit<WhatsAppTemplate, 'message'>[] {
        return WA_TEMPLATES.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            variables: t.variables,
        }))
    }

    /**
     * Preview de plantilla con variables
     */
    getTemplatePreview(templateId: string, variables: Record<string, string>): string | null {
        const template = WA_TEMPLATES.find(t => t.id === templateId)
        if (!template) return null
        return this.interpolate(template.message, variables)
    }

    /**
     * Enviar WhatsApp a un contacto con plantilla
     */
    async sendTemplateMessage(
        contactId: number,
        templateId: string,
        customVariables?: Record<string, string>
    ): Promise<SendResult> {
        const template = WA_TEMPLATES.find(t => t.id === templateId)
        if (!template) return { success: false, contact_id: contactId, error: 'Template no encontrado' }

        // Obtener datos del contacto
        const contact = await query(`
      SELECT c.id, c.full_name, c.phone, c.whatsapp, c.interested_destination,
             c.travel_dates_start, c.budget_max, c.pipeline_stage,
             u.name AS agent_name
      FROM crm_contacts c
      LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE c.id = $1
    `, [contactId])

        if (contact.rows.length === 0) {
            return { success: false, contact_id: contactId, error: 'Contacto no encontrado' }
        }

        const c = contact.rows[0]
        const phone = c.whatsapp || c.phone
        if (!phone) {
            return { success: false, contact_id: contactId, error: 'Contacto sin teléfono/WhatsApp' }
        }

        // Construir variables
        const variables: Record<string, string> = {
            nombre: c.full_name.split(' ')[0],
            nombre_completo: c.full_name,
            destino: c.interested_destination || 'tu destino',
            agente: c.agent_name || 'AS Operadora',
            precio: c.budget_max ? `$${Math.round(c.budget_max).toLocaleString('es-MX')} MXN` : '',
            fecha: c.travel_dates_start
                ? new Date(c.travel_dates_start).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
                : '',
            ...customVariables,
        }

        const message = this.interpolate(template.message, variables)

        try {
            const result = await sendWhatsAppMessage({
                to: phone,
                body: message,
            })

            // Registrar interacción en CRM
            await query(`
        INSERT INTO crm_interactions (contact_id, interaction_type, subject, notes, channel, is_automated, created_at)
        VALUES ($1, 'whatsapp_sent', $2, $3, 'whatsapp', true, NOW())
      `, [contactId, `WhatsApp: ${template.name}`, message.substring(0, 500)])

            return {
                success: result.success,
                contact_id: contactId,
                message_sid: result.messageId,
                error: result.success ? undefined : 'Error enviando mensaje',
            }
        } catch (err) {
            return {
                success: false,
                contact_id: contactId,
                error: (err as Error).message,
            }
        }
    }

    /**
     * Envío masivo de WhatsApp a múltiples contactos
     */
    async sendBulkMessage(
        contactIds: number[],
        templateId: string,
        customVariables?: Record<string, string>
    ): Promise<{ sent: number; failed: number; results: SendResult[] }> {
        const results: SendResult[] = []
        let sent = 0
        let failed = 0

        for (const id of contactIds) {
            const result = await this.sendTemplateMessage(id, templateId, customVariables)
            results.push(result)
            if (result.success) sent++
            else failed++
            // Rate limiting: esperar 1s entre mensajes
            await new Promise(r => setTimeout(r, 1000))
        }

        return { sent, failed, results }
    }

    /**
     * Obtener sugerencia de template según etapa del pipeline
     */
    getSuggestedTemplate(pipelineStage: string): string {
        const map: Record<string, string> = {
            new: 'wa_welcome',
            contacted: 'wa_followup',
            qualified: 'wa_followup',
            interested: 'wa_followup',
            quoted: 'wa_quote_sent',
            negotiation: 'wa_quote_sent',
            reserved: 'wa_confirmation',
            paid: 'wa_confirmation',
            won: 'wa_posttrip',
            traveling: 'wa_reminder',
            post_trip: 'wa_posttrip',
        }
        return map[pipelineStage] || 'wa_followup'
    }

    private interpolate(template: string, variables: Record<string, string>): string {
        let result = template
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
        }
        return result
    }
}

export const crmWhatsAppService = new CRMWhatsAppService()
