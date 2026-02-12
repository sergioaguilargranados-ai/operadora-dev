/**
 * CRM AI Service
 * 
 * Servicio de inteligencia artificial para el CRM.
 * - Resúmenes automáticos de contactos y notificaciones
 * - Scoring avanzado con señales de comportamiento
 * - Sugerencias de acción para agentes
 * - Análisis de sentimiento
 * 
 * Funciona con OpenAI GPT-4 si OPENAI_API_KEY está configurada,
 * o con un motor de reglas inteligente como fallback.
 */

import { query } from '@/lib/db'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface ContactContext {
    id: number
    full_name: string
    email?: string
    phone?: string
    contact_type: string
    source?: string
    pipeline_stage: string
    lead_score: number
    is_hot_lead: boolean
    days_in_stage: number
    interested_destination?: string
    travel_dates_start?: string
    travel_dates_end?: string
    num_travelers?: number
    budget_min?: number
    budget_max?: number
    travel_type?: string
    total_bookings: number
    total_quotes: number
    total_interactions: number
    ltv: number
    tags?: string[]
    last_contact_at?: string
    created_at: string
}

interface AIInsight {
    summary: string
    suggested_actions: string[]
    risk_level: 'low' | 'medium' | 'high'
    engagement_score: number   // 0-100
    priority_label: string
    next_best_action: string
    talking_points: string[]
}

interface ScoringResult {
    total_score: number
    signals: Record<string, number>
    is_hot: boolean
    decay_applied: number
    behavioral_bonus: number
    recommendation: string
}

interface NotificationSummary {
    title: string
    body: string
    suggested_action: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
}

// ═══════════════════════════════════════════
// SCORING AVANZADO — SEÑALES DE COMPORTAMIENTO
// ═══════════════════════════════════════════

const BEHAVIORAL_SIGNALS: Record<string, { points: number; label: string; category: string }> = {
    // Datos de perfil
    has_destination: { points: 20, label: 'Proporcionó destino', category: 'perfil' },
    has_dates: { points: 15, label: 'Proporcionó fechas', category: 'perfil' },
    has_travelers: { points: 10, label: 'Proporcionó # viajeros', category: 'perfil' },
    has_budget: { points: 15, label: 'Proporcionó presupuesto', category: 'perfil' },
    has_phone: { points: 5, label: 'Tiene teléfono', category: 'perfil' },
    has_email: { points: 5, label: 'Tiene email', category: 'perfil' },
    has_whatsapp: { points: 5, label: 'Tiene WhatsApp', category: 'perfil' },

    // Intención de compra
    asked_payment: { points: 25, label: 'Preguntó por pagos', category: 'intencion' },
    asked_availability: { points: 15, label: 'Preguntó disponibilidad', category: 'intencion' },
    requested_quote: { points: 20, label: 'Solicitó cotización', category: 'intencion' },
    visited_3_tours: { points: 10, label: 'Visitó 3+ tours', category: 'intencion' },
    compared_options: { points: 10, label: 'Comparó opciones', category: 'intencion' },

    // Historial
    existing_client: { points: 30, label: 'Cliente existente', category: 'historial' },
    repeat_buyer: { points: 25, label: 'Ha comprado antes', category: 'historial' },
    high_ltv: { points: 20, label: 'LTV alto (>$20K)', category: 'historial' },

    // Fuente
    from_referral: { points: 15, label: 'Viene de referido', category: 'fuente' },
    from_campaign: { points: 10, label: 'Viene de campaña', category: 'fuente' },
    from_organic: { points: 8, label: 'Búsqueda orgánica', category: 'fuente' },
    from_social: { points: 5, label: 'Redes sociales', category: 'fuente' },

    // Demografía viaje
    family_travel: { points: 10, label: 'Viaje familiar (mayor ticket)', category: 'demografía' },
    group_travel: { points: 15, label: 'Viaje grupal', category: 'demografía' },
    honeymoon: { points: 12, label: 'Luna de miel', category: 'demografía' },
    business_travel: { points: 8, label: 'Viaje de negocios', category: 'demografía' },

    // Urgencia
    urgent_travel: { points: 20, label: 'Viaje < 30 días', category: 'urgencia' },
    imminent_travel: { points: 30, label: 'Viaje < 7 días', category: 'urgencia' },

    // Engagement
    responded_quickly: { points: 10, label: 'Respondió rápido', category: 'engagement' },
    multiple_interactions: { points: 15, label: '5+ interacciones', category: 'engagement' },
    recent_activity: { points: 10, label: 'Actividad reciente (24h)', category: 'engagement' },

    // Penalizaciones
    quote_stale: { points: -5, label: 'Cotización sin respuesta >24h', category: 'riesgo' },
    no_response_48h: { points: -10, label: 'Sin respuesta >48h', category: 'riesgo' },
    no_response_7d: { points: -15, label: 'Sin respuesta >7 días', category: 'riesgo' },
    stage_stale_14d: { points: -10, label: 'Estancado en etapa >14d', category: 'riesgo' },
    bounced_email: { points: -8, label: 'Email rebotado', category: 'riesgo' },
}

// ═══════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════

class CRMAIService {

    /**
     * Genera un resumen inteligente con insights del contacto
     */
    async generateContactInsights(contactId: number): Promise<AIInsight> {
        // Obtener contexto completo del contacto
        const contactRes = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = c.id) AS interaction_count,
        (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = c.id AND status = 'pending') AS pending_tasks,
        (SELECT MAX(created_at) FROM crm_interactions WHERE contact_id = c.id) AS last_interaction_at
      FROM crm_contacts c WHERE c.id = $1
    `, [contactId])

        if (contactRes.rows.length === 0) {
            return {
                summary: 'Contacto no encontrado.',
                suggested_actions: [],
                risk_level: 'low',
                engagement_score: 0,
                priority_label: 'Desconocido',
                next_best_action: 'Verificar datos del contacto',
                talking_points: [],
            }
        }

        const contact = contactRes.rows[0] as ContactContext & {
            interaction_count: number
            pending_tasks: number
            last_interaction_at: string | null
        }

        // Obtener últimas interacciones para contexto
        const interactionsRes = await query(`
      SELECT interaction_type, subject, outcome, created_at
      FROM crm_interactions
      WHERE contact_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [contactId])

        // Intentar con OpenAI si disponible
        if (process.env.OPENAI_API_KEY) {
            try {
                return await this.generateWithOpenAI(contact, interactionsRes.rows)
            } catch (e) {
                console.error('[CRM-AI] OpenAI falló, usando motor de reglas:', e)
            }
        }

        // Fallback: motor de reglas inteligente
        return this.generateWithRules(contact, interactionsRes.rows)
    }

    /**
     * Scoring avanzado con análisis de comportamiento
     */
    async calculateAdvancedScore(contactId: number): Promise<ScoringResult> {
        const res = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = c.id) AS interaction_count,
        (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = c.id AND created_at >= NOW() - INTERVAL '24 hours') AS recent_interactions,
        (SELECT MAX(created_at) FROM crm_interactions WHERE contact_id = c.id) AS last_interaction_at,
        (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = c.id AND status = 'completed') AS completed_tasks
      FROM crm_contacts c WHERE c.id = $1
    `, [contactId])

        if (res.rows.length === 0) {
            return {
                total_score: 0, signals: {}, is_hot: false,
                decay_applied: 0, behavioral_bonus: 0,
                recommendation: 'Contacto no encontrado',
            }
        }

        const c = res.rows[0]
        const signals: Record<string, number> = {}

        // ── Señales de perfil ──
        if (c.interested_destination) signals.has_destination = BEHAVIORAL_SIGNALS.has_destination.points
        if (c.travel_dates_start) signals.has_dates = BEHAVIORAL_SIGNALS.has_dates.points
        if (c.num_travelers && c.num_travelers > 0) signals.has_travelers = BEHAVIORAL_SIGNALS.has_travelers.points
        if (c.budget_min || c.budget_max) signals.has_budget = BEHAVIORAL_SIGNALS.has_budget.points
        if (c.phone) signals.has_phone = BEHAVIORAL_SIGNALS.has_phone.points
        if (c.email) signals.has_email = BEHAVIORAL_SIGNALS.has_email.points
        if (c.whatsapp) signals.has_whatsapp = BEHAVIORAL_SIGNALS.has_whatsapp.points

        // ── Historial ──
        if (c.contact_type === 'client' || c.total_bookings > 0) {
            signals.existing_client = BEHAVIORAL_SIGNALS.existing_client.points
        }
        if (c.total_bookings > 1) signals.repeat_buyer = BEHAVIORAL_SIGNALS.repeat_buyer.points
        if (parseFloat(c.ltv || '0') > 20000) signals.high_ltv = BEHAVIORAL_SIGNALS.high_ltv.points

        // ── Fuente ──
        if (c.source === 'referral') signals.from_referral = BEHAVIORAL_SIGNALS.from_referral.points
        if (c.utm_source || c.utm_campaign) signals.from_campaign = BEHAVIORAL_SIGNALS.from_campaign.points
        if (c.source === 'web' || c.source === 'organic') signals.from_organic = BEHAVIORAL_SIGNALS.from_organic.points
        if (c.source === 'social' || c.source === 'facebook' || c.source === 'instagram') signals.from_social = BEHAVIORAL_SIGNALS.from_social.points

        // ── Tipo de viaje ──
        if (c.travel_type === 'family') signals.family_travel = BEHAVIORAL_SIGNALS.family_travel.points
        if (c.travel_type === 'group') signals.group_travel = BEHAVIORAL_SIGNALS.group_travel.points
        if (c.travel_type === 'honeymoon') signals.honeymoon = BEHAVIORAL_SIGNALS.honeymoon.points
        if (c.travel_type === 'business') signals.business_travel = BEHAVIORAL_SIGNALS.business_travel.points

        // ── Urgencia ──
        if (c.travel_dates_start) {
            const daysUntil = Math.ceil((new Date(c.travel_dates_start).getTime() - Date.now()) / (86400000))
            if (daysUntil <= 7 && daysUntil > 0) signals.imminent_travel = BEHAVIORAL_SIGNALS.imminent_travel.points
            else if (daysUntil <= 30 && daysUntil > 0) signals.urgent_travel = BEHAVIORAL_SIGNALS.urgent_travel.points
        }

        // ── Engagement ──
        if (parseInt(c.interaction_count || '0') >= 5) signals.multiple_interactions = BEHAVIORAL_SIGNALS.multiple_interactions.points
        if (parseInt(c.recent_interactions || '0') > 0) signals.recent_activity = BEHAVIORAL_SIGNALS.recent_activity.points
        if (c.total_quotes > 0) signals.requested_quote = BEHAVIORAL_SIGNALS.requested_quote.points

        // ── Penalizaciones — decay temporal ──
        let decay = 0
        if (c.last_interaction_at) {
            const hoursSince = (Date.now() - new Date(c.last_interaction_at).getTime()) / 3600000
            if (hoursSince > 168) { // 7 días
                signals.no_response_7d = BEHAVIORAL_SIGNALS.no_response_7d.points
                decay += 15
            } else if (hoursSince > 48) {
                signals.no_response_48h = BEHAVIORAL_SIGNALS.no_response_48h.points
                decay += 10
            }
        }

        if (parseInt(c.days_in_stage || '0') > 14) {
            signals.stage_stale_14d = BEHAVIORAL_SIGNALS.stage_stale_14d.points
            decay += 10
        }

        // Calcular score total
        const rawScore = Object.values(signals).reduce((s, v) => s + v, 0)
        const behavioralBonus = parseInt(c.interaction_count || '0') >= 3 ? 5 : 0
        const totalScore = Math.max(0, Math.min(100, rawScore + behavioralBonus))
        const isHot = totalScore >= 70

        // Generar recomendación
        let recommendation = ''
        if (totalScore >= 80) recommendation = '🔥 Lead caliente — contactar AHORA'
        else if (totalScore >= 60) recommendation = '⚡ Lead tibio — seguimiento prioritario'
        else if (totalScore >= 40) recommendation = '📊 Lead prometedor — nutrir con info'
        else if (totalScore >= 20) recommendation = '🌱 Lead nuevo — calificar más'
        else recommendation = '❄️ Lead frío — evaluar si vale la pena'

        // Actualizar en BD
        await query(`
      UPDATE crm_contacts SET
        lead_score = $1,
        score_signals = $2,
        is_hot_lead = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [totalScore, JSON.stringify(signals), isHot, contactId])

        return {
            total_score: totalScore,
            signals,
            is_hot: isHot,
            decay_applied: decay,
            behavioral_bonus: behavioralBonus,
            recommendation,
        }
    }

    /**
     * Genera resumen inteligente para una notificación
     */
    async generateNotificationSummary(
        type: string,
        contactId: number,
        eventData?: Record<string, unknown>
    ): Promise<NotificationSummary> {
        const contactRes = await query(
            `SELECT full_name, pipeline_stage, lead_score, interested_destination, 
              travel_dates_start, num_travelers, contact_type
       FROM crm_contacts WHERE id = $1`, [contactId]
        )

        const c = contactRes.rows[0]
        if (!c) {
            return {
                title: 'Contacto actualizado',
                body: 'Un contacto ha sido actualizado en el CRM.',
                suggested_action: 'Revisar contacto',
                priority: 'medium',
            }
        }

        const dest = c.interested_destination || 'destino sin definir'
        const name = c.full_name

        const templates: Record<string, NotificationSummary> = {
            lead_qualified: {
                title: `🎯 ${name} calificado como lead`,
                body: `${name} tiene interés en ${dest}${c.num_travelers ? ` para ${c.num_travelers} personas` : ''}. Score: ${c.lead_score}. ${c.travel_dates_start ? `Fecha de viaje: ${new Date(c.travel_dates_start).toLocaleDateString('es-MX')}` : ''}`,
                suggested_action: 'Enviar cotización personalizada',
                priority: c.lead_score >= 70 ? 'high' : 'medium',
            },
            purchase_intent: {
                title: `🔥 ${name} muestra intención de compra`,
                body: `${name} ha preguntado por pagos o disponibilidad para ${dest}. Score actual: ${c.lead_score}. Es momento de cerrar la venta.`,
                suggested_action: 'Contactar inmediatamente para cerrar',
                priority: 'urgent',
            },
            lead_abandoned: {
                title: `⚠️ ${name} sin actividad reciente`,
                body: `${name} lleva varios días sin interacción. Estaba interesado en ${dest}. Score: ${c.lead_score}. Riesgo de perder el lead.`,
                suggested_action: 'Enviar mensaje de seguimiento con oferta especial',
                priority: 'medium',
            },
            stage_changed: {
                title: `📊 ${name} cambió de etapa`,
                body: `${name} ha avanzado en el pipeline${eventData?.new_stage ? ` → ${eventData.new_stage}` : ''}. ${dest ? `Interesado en ${dest}.` : ''}`,
                suggested_action: 'Revisar y crear tarea de seguimiento',
                priority: 'medium',
            },
            task_overdue: {
                title: `⏰ Tarea vencida para ${name}`,
                body: `Hay una tarea pendiente vencida para ${name}${eventData?.task_title ? `: "${eventData.task_title}"` : ''}. No dejes pasar más tiempo.`,
                suggested_action: 'Completar tarea o reprogramar',
                priority: 'high',
            },
            hot_lead_stale: {
                title: `🔥⚠️ Lead caliente sin atender: ${name}`,
                body: `${name} tiene score ${c.lead_score} (HOT) pero no ha sido contactado en las últimas horas. Interesado en ${dest}. ¡Urgente!`,
                suggested_action: 'Contactar de inmediato por teléfono o WhatsApp',
                priority: 'urgent',
            },
            booking_created: {
                title: `🎉 ${name} hizo una reserva`,
                body: `¡Excelente! ${name} ha reservado${eventData?.booking_details ? ` — ${eventData.booking_details}` : ''}. Asegura que todo esté correcto.`,
                suggested_action: 'Confirmar detalles y enviar itinerario',
                priority: 'high',
            },
            new_referral: {
                title: `👥 Nuevo lead por referido: ${name}`,
                body: `${name} llegó por referido${eventData?.referrer ? ` de ${eventData.referrer}` : ''}. ${dest ? `Interesado en ${dest}.` : ''} Los referidos convierten 3x más.`,
                suggested_action: 'Dar atención prioritaria',
                priority: 'high',
            },
        }

        return templates[type] || {
            title: `📌 Actualización: ${name}`,
            body: `${name} tiene una actualización en el CRM. Score: ${c.lead_score}. Etapa: ${c.pipeline_stage}.`,
            suggested_action: 'Revisar el contacto en el CRM',
            priority: 'medium',
        }
    }

    /**
     * Generar scripts/guiones de conversación para el agente
     */
    async generateTalkingScript(contactId: number, scenario: string): Promise<{
        opening: string
        key_points: string[]
        objection_handlers: Record<string, string>
        closing: string
    }> {
        const res = await query(`
      SELECT full_name, interested_destination, travel_dates_start, travel_dates_end,
             num_travelers, budget_min, budget_max, travel_type, contact_type,
             lead_score, pipeline_stage, total_bookings
      FROM crm_contacts WHERE id = $1
    `, [contactId])

        const c = res.rows[0]
        if (!c) {
            return {
                opening: 'Hola, ¿en qué puedo ayudarle?',
                key_points: ['Verificar datos del contacto'],
                objection_handlers: {},
                closing: 'Quedo a sus órdenes.',
            }
        }

        const name = c.full_name.split(' ')[0] // Primer nombre
        const dest = c.interested_destination || 'su viaje'
        const isRepeat = c.total_bookings > 0
        const budgetStr = c.budget_max ? `$${Math.round(c.budget_max).toLocaleString('es-MX')}` : 'sin definir'

        const scripts: Record<string, {
            opening: string
            key_points: string[]
            objection_handlers: Record<string, string>
            closing: string
        }> = {
            first_contact: {
                opening: isRepeat
                    ? `¡Hola ${name}! Qué gusto saludarte de nuevo. Vi que estás interesado en ${dest}, ¿me platicas más?`
                    : `¡Hola ${name}! Bienvenido a AS Operadora. Vi tu interés en ${dest} y me encantaría ayudarte a que sea un viaje increíble.`,
                key_points: [
                    `Confirmar destino: ${dest}`,
                    c.travel_dates_start ? `Confirmar fechas: ${new Date(c.travel_dates_start).toLocaleDateString('es-MX')}` : 'Preguntar fechas de viaje',
                    c.num_travelers ? `Confirmar ${c.num_travelers} viajeros` : 'Preguntar número de viajeros',
                    `Presupuesto: ${budgetStr}`,
                    'Preguntar preferencias especiales (hotel, actividades, etc.)',
                ],
                objection_handlers: {
                    'Es caro': `Entiendo ${name}. Tenemos opciones flexibles y puedo armar un paquete que se ajuste a tu presupuesto. ¿Me dices un rango y te muestro lo mejor?`,
                    'Lo voy a pensar': `Claro, tómate tu tiempo. Solo te comento que los precios de ${dest} suelen subir conforme se acerca la fecha. ¿Te envío la cotización por WhatsApp para que la revises con calma?`,
                    'Estoy comparando': `¡Perfecto! Comparar es inteligente. Nosotros incluimos asistencia 24/7, seguro de viaje, y coordinación directa. ¿Quieres que te haga una comparativa?`,
                    'No estoy seguro del destino': `Te entiendo. Basado en lo que me cuentas, te recomendaría... ¿Te mando 3 opciones con precios para que compares?`,
                },
                closing: `${name}, fue un gusto platicar contigo. Te envío la cotización por WhatsApp/email. Cualquier duda, aquí estoy. ¡Tu viaje va a estar increíble! 🌴`,
            },
            follow_up: {
                opening: `¡Hola ${name}! ¿Cómo estás? Te contacto para dar seguimiento a nuestra cotización de ${dest}. ¿Tuviste oportunidad de revisarla?`,
                key_points: [
                    'Verificar si recibió la cotización',
                    'Resolver dudas pendientes',
                    'Confirmar si hay cambios en fechas o viajeros',
                    'Mencionar disponibilidad limitada si aplica',
                    'Ofrecer ajustar el paquete si es necesario',
                ],
                objection_handlers: {
                    'No la he revisado': `No te preocupes, ¿te la reenvío? También puedo hacerte un resumen rápido por aquí.`,
                    'Está fuera de presupuesto': `Entiendo. Puedo ajustar algunas cosas como categoría de hotel o quitar actividades opcionales. ¿Cuál sería tu presupuesto ideal?`,
                    'Ya reservé con otra agencia': `¡Qué bueno que ya tienes todo! Si en el futuro necesitas algo, aquí estamos. ¿Puedo enviarte ofertas de vez en cuando?`,
                },
                closing: `Perfecto ${name}, quedo al pendiente. Recuerda que la disponibilidad para ${dest} cambia rápido. ¡Aquí estoy para lo que necesites!`,
            },
            closing_deal: {
                opening: `¡${name}! Todo listo para confirmar tu viaje a ${dest}. Solo necesito unos datos para asegurar tu reserva.`,
                key_points: [
                    'Confirmar datos finales del paquete',
                    'Solicitar datos de pasajeros',
                    c.budget_max ? `Confirmar precio: ${budgetStr}` : 'Confirmar precio acordado',
                    'Explicar formas de pago disponibles',
                    'Detallar política de cancelación',
                    'Enviar contrato/términos',
                ],
                objection_handlers: {
                    'Necesito hablar con mi pareja': `Claro, ¿quieres que les envíe la info por WhatsApp o email para que la revisen juntos? Puedo agendar una llamada con ambos si prefieren.`,
                    'Puedo pagar después?': `Entiendo. Puedo separar la reserva con un anticipo del 30% y el resto puedes pagarlo antes de la fecha de viaje. ¿Te funciona?`,
                    'Quiero un descuento': `Déjame ver qué puedo hacer. Si confirmas hoy, puedo incluirte [beneficio extra] sin costo. ¿Te parece?`,
                },
                closing: `¡Listo ${name}! Tu reserva está confirmada. Te envío todo por email. Estoy aquí para cualquier cosa antes y durante tu viaje. ¡A disfrutar ${dest}! 🎉`,
            },
            post_trip: {
                opening: `¡Hola ${name}! ¿Cómo te fue en ${dest}? Espero que la hayas pasado increíble. Me encantaría saber tu experiencia.`,
                key_points: [
                    'Preguntar cómo fue el viaje',
                    'Pedir feedback específico (hotel, tours, traslados)',
                    'Solicitar reseña/testimonio',
                    'Ofrecer descuento para próximo viaje',
                    'Pedir referidos',
                ],
                objection_handlers: {
                    'Hubo un problema': `Lamento mucho escuchar eso, ${name}. ¿Me puedes platicar qué pasó? Quiero asegurarme de que lo resolvamos y que no vuelva a suceder.`,
                },
                closing: `¡Gracias por tu confianza ${name}! Si conoces a alguien que quiera viajar, te doy un 5% de descuento en tu próximo viaje por cada referido. ¡Hablamos pronto! ✈️`,
            },
        }

        return scripts[scenario] || scripts.first_contact
    }

    /**
     * Recalcular scores de todos los contactos activos (batch)
     */
    async batchRecalculateScores(): Promise<{ updated: number; hot_leads: number }> {
        const contacts = await query(`
      SELECT id FROM crm_contacts WHERE status = 'active'
    `)

        let updated = 0
        let hotLeads = 0

        for (const row of contacts.rows) {
            const result = await this.calculateAdvancedScore(row.id)
            updated++
            if (result.is_hot) hotLeads++
        }

        return { updated, hot_leads: hotLeads }
    }

    // ═══════════════════════════════════════════
    // MÉTODOS PRIVADOS
    // ═══════════════════════════════════════════

    /**
     * Genera insights usando OpenAI GPT-4
     */
    private async generateWithOpenAI(
        contact: ContactContext & { interaction_count: number; pending_tasks: number; last_interaction_at: string | null },
        recentInteractions: { interaction_type: string; subject: string; outcome: string; created_at: string }[]
    ): Promise<AIInsight> {
        const interactionsSummary = recentInteractions.map(i =>
            `- ${i.interaction_type}: "${i.subject || 'sin asunto'}" (${i.outcome || 'sin resultado'}) — ${new Date(i.created_at).toLocaleDateString('es-MX')}`
        ).join('\n')

        const prompt = `Eres un asistente de CRM para una agencia de viajes mexicana (AS Operadora). 
Analiza este contacto y genera un resumen ejecutivo en español.

CONTACTO:
- Nombre: ${contact.full_name}
- Tipo: ${contact.contact_type}
- Etapa pipeline: ${contact.pipeline_stage}
- Score: ${contact.lead_score}/100 ${contact.is_hot_lead ? '(HOT LEAD 🔥)' : ''}
- Días en etapa actual: ${contact.days_in_stage}
- Destino: ${contact.interested_destination || 'No definido'}
- Fechas: ${contact.travel_dates_start || 'No definidas'}
- Viajeros: ${contact.num_travelers || 'No definido'}
- Presupuesto: ${contact.budget_min || '?'} - ${contact.budget_max || '?'} MXN
- Tipo viaje: ${contact.travel_type || 'No definido'}
- Total reservas: ${contact.total_bookings}
- Total cotizaciones: ${contact.total_quotes}
- Total interacciones: ${contact.total_interactions}
- LTV: $${contact.ltv || 0} MXN
- Fuente: ${contact.source || 'Desconocida'}

INTERACCIONES RECIENTES:
${interactionsSummary || 'Sin interacciones registradas'}

Responde en JSON con este formato exacto:
{
  "summary": "Resumen de 2-3 oraciones del contacto",
  "suggested_actions": ["acción 1", "acción 2", "acción 3"],
  "risk_level": "low|medium|high",
  "engagement_score": 0-100,
  "priority_label": "Urgente|Alta|Media|Baja",
  "next_best_action": "La acción más importante a hacer ahora",
  "talking_points": ["punto 1 para la conversación", "punto 2"]
}`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 600,
            }),
        })

        if (!response.ok) throw new Error('OpenAI API error')

        const data = await response.json()
        const content = data.choices[0]?.message?.content || '{}'

        try {
            // Extraer JSON del contenido (puede estar envuelto en markdown)
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }
        } catch {
            console.error('[CRM-AI] Error parsing OpenAI response')
        }

        return this.generateWithRules(contact, [])
    }

    /**
     * Motor de reglas inteligente (fallback sin OpenAI)
     */
    private generateWithRules(
        contact: ContactContext & { interaction_count: number; pending_tasks: number; last_interaction_at: string | null },
        _recentInteractions: { interaction_type: string; subject: string; outcome: string; created_at: string }[]
    ): AIInsight {
        const c = contact
        const daysSinceContact = c.last_interaction_at
            ? Math.round((Date.now() - new Date(c.last_interaction_at).getTime()) / 86400000)
            : 999

        // Determinar nivel de riesgo
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (daysSinceContact > 7 || c.days_in_stage > 14) riskLevel = 'high'
        else if (daysSinceContact > 3 || c.days_in_stage > 7) riskLevel = 'medium'

        // Engagement score
        const engagementFactors = [
            c.interaction_count > 0 ? 20 : 0,
            c.interaction_count > 3 ? 15 : 0,
            c.interaction_count > 10 ? 10 : 0,
            daysSinceContact <= 1 ? 25 : daysSinceContact <= 3 ? 15 : daysSinceContact <= 7 ? 5 : 0,
            c.total_quotes > 0 ? 15 : 0,
            c.total_bookings > 0 ? 20 : 0,
        ]
        const engagementScore = Math.min(100, engagementFactors.reduce((s, v) => s + v, 0))

        // Prioridad
        let priorityLabel = 'Baja'
        if (c.is_hot_lead || c.lead_score >= 70) priorityLabel = 'Urgente'
        else if (c.lead_score >= 50) priorityLabel = 'Alta'
        else if (c.lead_score >= 30) priorityLabel = 'Media'

        // Resumen
        const parts: string[] = []
        parts.push(`${c.full_name} es un ${c.contact_type === 'client' ? 'cliente' : 'lead'} en etapa "${c.pipeline_stage}" con score ${c.lead_score}.`)

        if (c.interested_destination) parts.push(`Interesado en ${c.interested_destination}.`)
        if (c.total_bookings > 0) parts.push(`Tiene ${c.total_bookings} reserva(s) previas (LTV: $${Math.round(c.ltv || 0).toLocaleString('es-MX')}).`)
        if (daysSinceContact < 999) parts.push(`Último contacto hace ${daysSinceContact} día(s).`)
        if (c.pending_tasks > 0) parts.push(`${c.pending_tasks} tarea(s) pendiente(s).`)

        // Acciones sugeridas
        const actions: string[] = []
        if (c.is_hot_lead && daysSinceContact > 1) actions.push('⚡ Contactar de inmediato — lead caliente sin atender')
        if (c.pending_tasks > 0) actions.push(`📋 Completar ${c.pending_tasks} tarea(s) pendiente(s)`)
        if (c.pipeline_stage === 'new') actions.push('🎯 Calificar lead: obtener destino, fechas, presupuesto')
        if (c.pipeline_stage === 'qualified' && c.total_quotes === 0) actions.push('💰 Enviar cotización personalizada')
        if (c.pipeline_stage === 'quoted' && daysSinceContact > 2) actions.push('📞 Seguimiento de cotización enviada')
        if (c.pipeline_stage === 'negotiation') actions.push('🤝 Cerrar venta — ofrecer beneficio adicional')
        if (daysSinceContact > 7 && c.pipeline_stage !== 'won') actions.push('⚠️ Reactivar contacto con oferta especial')
        if (c.total_bookings > 0 && c.pipeline_stage === 'post_trip') actions.push('⭐ Solicitar reseña y referidos')

        if (actions.length === 0) actions.push('📊 Revisar estado del contacto')

        // Siguiente mejor acción
        const nextAction = actions[0]?.replace(/^[^\s]+\s/, '') || 'Revisar contacto'

        // Talking points
        const talkingPoints: string[] = []
        if (c.interested_destination) talkingPoints.push(`Preguntarle sobre su interés en ${c.interested_destination}`)
        if (c.num_travelers) talkingPoints.push(`Confirmar que viajan ${c.num_travelers} personas`)
        if (c.budget_max) talkingPoints.push(`Su presupuesto es ~$${Math.round(c.budget_max).toLocaleString('es-MX')}`)
        if (c.travel_dates_start) talkingPoints.push(`Fecha de viaje: ${new Date(c.travel_dates_start).toLocaleDateString('es-MX')}`)
        if (c.total_bookings > 0) talkingPoints.push(`Es cliente recurrente (${c.total_bookings} reservas)`)
        if (c.source === 'referral') talkingPoints.push('Llegó por referido — tratar con prioridad')

        return {
            summary: parts.join(' '),
            suggested_actions: actions.slice(0, 5),
            risk_level: riskLevel,
            engagement_score: engagementScore,
            priority_label: priorityLabel,
            next_best_action: nextAction,
            talking_points: talkingPoints.slice(0, 5),
        }
    }
}

export const crmAIService = new CRMAIService()
