/**
 * CRM Predictive Scoring Service
 * 
 * Scoring predictivo basado en análisis de patrones históricos.
 * 
 * En lugar de ML puro, analiza comportamiento de contactos
 * que convirtieron exitosamente y aplica esos patrones
 * a contactos actuales para predecir probabilidad de conversión.
 * 
 * Señales predictivas:
 *   - Velocidad de respuesta del lead
 *   - Engagement (interacciones x tiempo)
 *   - Similitud con perfiles que convirtieron
 *   - Patrón de movimiento en pipeline
 *   - Indicadores de urgencia temporal
 */

import { query, queryOne } from '@/lib/db'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface PredictiveScore {
    contact_id: number
    current_score: number
    predicted_score: number
    conversion_probability: number
    predicted_days_to_close: number | null
    risk_level: 'low' | 'medium' | 'high'
    confidence: number
    signals: PredictiveSignal[]
    recommendations: string[]
}

interface PredictiveSignal {
    name: string
    value: number
    weight: number
    direction: 'positive' | 'negative' | 'neutral'
    description: string
}

interface ConversionPattern {
    avg_interactions: number
    avg_days_to_close: number
    avg_score_at_close: number
    top_sources: string[]
    top_destinations: string[]
    avg_travelers: number
    avg_budget: number
    common_channel: string
}

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMPredictiveService {

    /**
     * Calcular scoring predictivo para un contacto
     */
    async predictScore(contactId: number): Promise<PredictiveScore> {
        // 1. Obtener contacto actual
        const contact = await queryOne(`
      SELECT c.*,
        (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = c.id) AS interaction_count,
        (SELECT MAX(created_at) FROM crm_interactions WHERE contact_id = c.id) AS last_interaction,
        (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = c.id AND status = 'completed') AS tasks_completed,
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 86400 AS days_since_created
      FROM crm_contacts c WHERE c.id = $1
    `, [contactId])

        if (!contact) throw new Error('Contacto no encontrado')

        // 2. Obtener patrones de contactos que convirtieron
        const pattern = await this.getConversionPatterns()

        // 3. Calcular señales predictivas
        const signals: PredictiveSignal[] = []
        let totalWeight = 0
        let weightedScore = 0

        // --- Velocidad de engagement ---
        const interactionRate = contact.interaction_count / Math.max(contact.days_since_created, 1)
        const wonInteractionRate = pattern.avg_interactions / Math.max(pattern.avg_days_to_close, 1)
        const engagementRatio = Math.min(interactionRate / Math.max(wonInteractionRate, 0.01), 2)
        const engagementSignal: PredictiveSignal = {
            name: 'engagement_velocity',
            value: Math.round(engagementRatio * 50),
            weight: 20,
            direction: engagementRatio >= 0.8 ? 'positive' : engagementRatio >= 0.4 ? 'neutral' : 'negative',
            description: `${contact.interaction_count} interacciones en ${Math.round(contact.days_since_created)}d (patrón: ${Math.round(pattern.avg_interactions)} en ${Math.round(pattern.avg_days_to_close)}d)`,
        }
        signals.push(engagementSignal)
        totalWeight += engagementSignal.weight
        weightedScore += Math.min(engagementSignal.value, 100) * engagementSignal.weight

        // --- Recencia de actividad ---
        const daysSinceLastInteraction = contact.last_interaction
            ? (Date.now() - new Date(contact.last_interaction).getTime()) / 86400000
            : contact.days_since_created
        const recencyScore = daysSinceLastInteraction <= 1 ? 100 : daysSinceLastInteraction <= 3 ? 80 : daysSinceLastInteraction <= 7 ? 60 : daysSinceLastInteraction <= 14 ? 30 : 10
        const recencySignal: PredictiveSignal = {
            name: 'activity_recency',
            value: recencyScore,
            weight: 18,
            direction: recencyScore >= 60 ? 'positive' : recencyScore >= 30 ? 'neutral' : 'negative',
            description: `Última actividad hace ${Math.round(daysSinceLastInteraction)} día(s)`,
        }
        signals.push(recencySignal)
        totalWeight += recencySignal.weight
        weightedScore += recencySignal.value * recencySignal.weight

        // --- Progreso en pipeline ---
        const stageOrder: Record<string, number> = {
            new: 1, contacted: 2, qualified: 3, interested: 4,
            quoted: 5, negotiation: 6, reserved: 7, paid: 8, won: 9,
        }
        const stageNum = stageOrder[contact.pipeline_stage] || 1
        const pipelineProgress = (stageNum / 9) * 100
        const pipelineSignal: PredictiveSignal = {
            name: 'pipeline_progress',
            value: Math.round(pipelineProgress),
            weight: 25,
            direction: pipelineProgress >= 55 ? 'positive' : pipelineProgress >= 33 ? 'neutral' : 'negative',
            description: `Etapa: ${contact.pipeline_stage} (${stageNum}/9)`,
        }
        signals.push(pipelineSignal)
        totalWeight += pipelineSignal.weight
        weightedScore += pipelineSignal.value * pipelineSignal.weight

        // --- Score actual vs patrón ---
        const scoreRatio = contact.lead_score / Math.max(pattern.avg_score_at_close, 1)
        const scoreSignal: PredictiveSignal = {
            name: 'score_trajectory',
            value: Math.min(Math.round(scoreRatio * 50), 100),
            weight: 15,
            direction: scoreRatio >= 0.7 ? 'positive' : scoreRatio >= 0.4 ? 'neutral' : 'negative',
            description: `Score actual: ${contact.lead_score} (conversiones promedio: ${Math.round(pattern.avg_score_at_close)})`,
        }
        signals.push(scoreSignal)
        totalWeight += scoreSignal.weight
        weightedScore += scoreSignal.value * scoreSignal.weight

        // --- Completitud de datos ---
        let dataPoints = 0
        if (contact.email) dataPoints++
        if (contact.phone) dataPoints++
        if (contact.interested_destination) dataPoints++
        if (contact.travel_dates_start) dataPoints++
        if (contact.num_travelers) dataPoints++
        if (contact.budget_max) dataPoints++
        if (contact.travel_type) dataPoints++
        const dataScore = Math.round((dataPoints / 7) * 100)
        const dataSignal: PredictiveSignal = {
            name: 'data_completeness',
            value: dataScore,
            weight: 12,
            direction: dataScore >= 70 ? 'positive' : dataScore >= 40 ? 'neutral' : 'negative',
            description: `${dataPoints}/7 datos completos`,
        }
        signals.push(dataSignal)
        totalWeight += dataSignal.weight
        weightedScore += dataSignal.value * dataSignal.weight

        // --- Tareas completadas ---
        const taskCompletionRate = contact.tasks_completed > 0 ? Math.min(contact.tasks_completed * 20, 100) : 0
        const taskSignal: PredictiveSignal = {
            name: 'task_completion',
            value: taskCompletionRate,
            weight: 10,
            direction: taskCompletionRate >= 60 ? 'positive' : taskCompletionRate >= 20 ? 'neutral' : 'negative',
            description: `${contact.tasks_completed} tareas completadas del agente`,
        }
        signals.push(taskSignal)
        totalWeight += taskSignal.weight
        weightedScore += taskSignal.value * taskSignal.weight

        // 4. Calcular score predictivo final
        const predictedScore = Math.round(weightedScore / totalWeight)
        const conversionProbability = Math.min(Math.round(predictedScore * 1.05), 99) // Cap at 99%

        // 5. Estimar días al cierre
        const predictedDays = stageNum >= 7
            ? Math.round(Math.max(pattern.avg_days_to_close * 0.2, 2))
            : stageNum >= 5
                ? Math.round(pattern.avg_days_to_close * 0.5)
                : stageNum >= 3
                    ? Math.round(pattern.avg_days_to_close * 0.8)
                    : Math.round(pattern.avg_days_to_close)

        // 6. Risk level
        const riskLevel = conversionProbability >= 60 ? 'low' : conversionProbability >= 35 ? 'medium' : 'high'

        // 7. Generar recomendaciones
        const recommendations: string[] = []
        if (recencyScore <= 30) recommendations.push('⚠️ Contactar urgente — sin actividad reciente')
        if (dataScore < 50) recommendations.push('📝 Completar información del contacto')
        if (engagementRatio < 0.5) recommendations.push('📞 Aumentar frecuencia de interacciones')
        if (stageNum <= 2 && contact.days_since_created > 7) recommendations.push('🔄 Mover a siguiente etapa o recalificar')
        if (contact.lead_score < 30 && stageNum >= 4) recommendations.push('📊 Score bajo para su etapa — revisar calidad del lead')
        if (contact.is_hot_lead && recencyScore < 60) recommendations.push('🔥 Hot lead sin seguimiento — priorizar')
        if (taskCompletionRate === 0) recommendations.push('✅ Crear tareas de seguimiento')
        if (recommendations.length === 0) recommendations.push('✨ Buen camino — mantener ritmo de seguimiento')

        // 8. Confianza del modelo
        const confidence = Math.min(
            50 + // base
            Math.min(contact.interaction_count * 5, 20) + // más interacciones = más confianza
            (pattern.avg_interactions > 0 ? 15 : 0) + // hay datos históricos
            Math.min(Math.round(contact.days_since_created), 15), // más tiempo = más datos
            95
        )

        return {
            contact_id: contactId,
            current_score: contact.lead_score,
            predicted_score: predictedScore,
            conversion_probability: conversionProbability,
            predicted_days_to_close: contact.pipeline_stage === 'won' ? 0 : predictedDays,
            risk_level: riskLevel,
            confidence,
            signals,
            recommendations,
        }
    }

    /**
     * Análisis predictivo masivo — top leads con más probabilidad de cerrar
     */
    async getTopPredictions(limit = 20): Promise<PredictiveScore[]> {
        const contacts = await query(`
      SELECT id FROM crm_contacts
      WHERE status = 'active' AND pipeline_stage NOT IN ('won', 'lost')
      ORDER BY lead_score DESC, updated_at DESC
      LIMIT $1
    `, [limit])

        const predictions: PredictiveScore[] = []
        for (const c of contacts.rows) {
            try {
                const pred = await this.predictScore(c.id)
                predictions.push(pred)
            } catch { /* skip */ }
        }

        return predictions.sort((a, b) => b.conversion_probability - a.conversion_probability)
    }

    /**
     * Obtener patrones de conversión históricos
     */
    private async getConversionPatterns(): Promise<ConversionPattern> {
        const wonStats = await queryOne(`
      SELECT
        COALESCE(AVG(lead_score), 50) AS avg_score,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 30) AS avg_days,
        COALESCE(AVG(num_travelers), 2) AS avg_travelers,
        COALESCE(AVG(COALESCE(budget_max, budget_min, 0)), 0) AS avg_budget
      FROM crm_contacts
      WHERE pipeline_stage IN ('won', 'reserved', 'paid') AND status = 'active'
    `)

        const wonInteractions = await queryOne(`
      SELECT COALESCE(AVG(cnt), 5) AS avg_interactions
      FROM (
        SELECT contact_id, COUNT(*) AS cnt
        FROM crm_interactions
        WHERE contact_id IN (
          SELECT id FROM crm_contacts WHERE pipeline_stage IN ('won', 'reserved', 'paid') AND status = 'active'
        )
        GROUP BY contact_id
      ) sub
    `)

        const topSources = await query(`
      SELECT source, COUNT(*) AS cnt
      FROM crm_contacts
      WHERE pipeline_stage IN ('won', 'reserved', 'paid') AND source IS NOT NULL
      GROUP BY source ORDER BY cnt DESC LIMIT 5
    `)

        const topDest = await query(`
      SELECT interested_destination, COUNT(*) AS cnt
      FROM crm_contacts
      WHERE pipeline_stage IN ('won', 'reserved', 'paid') AND interested_destination IS NOT NULL
      GROUP BY interested_destination ORDER BY cnt DESC LIMIT 5
    `)

        return {
            avg_interactions: parseFloat(wonInteractions?.avg_interactions || '5'),
            avg_days_to_close: parseFloat(wonStats?.avg_days || '30'),
            avg_score_at_close: parseFloat(wonStats?.avg_score || '50'),
            top_sources: topSources.rows.map((r: Record<string, unknown>) => String(r.source)),
            top_destinations: topDest.rows.map((r: Record<string, unknown>) => String(r.interested_destination)),
            avg_travelers: parseFloat(wonStats?.avg_travelers || '2'),
            avg_budget: parseFloat(wonStats?.avg_budget || '0'),
            common_channel: 'whatsapp',
        }
    }
}

export const crmPredictiveService = new CRMPredictiveService()
