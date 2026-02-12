/**
 * CRM Workflow Engine Service
 * 
 * Motor de workflows personalizables para automatización CRM avanzada.
 * 
 * Conceptos:
 *   - Workflow: Secuencia de pasos que se ejecutan ante un trigger
 *   - Trigger: Evento que inicia el workflow (stage_change, time_based, score, etc.)
 *   - Step: Acción individual (send_email, send_whatsapp, wait, condition, update, create_task)
 *   - Condition: Evaluación que determina si continuar o bifurcar
 * 
 * Los workflows se almacenan en crm_automation_rules con type='workflow'
 * y su configuración es un JSON con steps y conditions.
 */

import { query, queryOne } from '@/lib/db'
import { crmCampaignService } from './CRMCampaignService'
import { crmWhatsAppService } from './CRMWhatsAppService'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

export interface Workflow {
    id?: number
    name: string
    description: string
    trigger_type: 'stage_change' | 'score_threshold' | 'time_inactive' | 'tag_added' | 'manual' | 'contact_created'
    trigger_config: Record<string, unknown>
    steps: WorkflowStep[]
    is_active: boolean
    execution_count?: number
    last_executed_at?: string
    created_at?: string
}

export interface WorkflowStep {
    id: string
    type: 'send_email' | 'send_whatsapp' | 'wait' | 'condition' | 'update_contact' | 'create_task' | 'move_stage' | 'add_tag' | 'notify_agent'
    config: Record<string, unknown>
    label: string
    next_step?: string       // siguiente paso
    on_true?: string         // para conditions
    on_false?: string        // para conditions
    position: { x: number; y: number } // para visualización
}

interface WorkflowExecution {
    workflow_id: number
    contact_id: number
    steps_executed: number
    steps_skipped: number
    errors: string[]
    duration_ms: number
}

// ═══════════════════════════════════════════
// TEMPLATES DE WORKFLOWS PREDEFINIDOS
// ═══════════════════════════════════════════

const WORKFLOW_TEMPLATES: Omit<Workflow, 'id'>[] = [
    {
        name: 'Bienvenida nuevo lead',
        description: 'Se ejecuta al crear un contacto nuevo. Envía WhatsApp de bienvenida, espera 24h, y si no hay respuesta envía email de seguimiento.',
        trigger_type: 'contact_created',
        trigger_config: {},
        is_active: false,
        steps: [
            { id: 'step1', type: 'send_whatsapp', config: { template_id: 'wa_welcome' }, label: 'WhatsApp bienvenida', next_step: 'step2', position: { x: 200, y: 50 } },
            { id: 'step2', type: 'wait', config: { hours: 24 }, label: 'Esperar 24h', next_step: 'step3', position: { x: 200, y: 150 } },
            { id: 'step3', type: 'condition', config: { field: 'interaction_count', operator: '>', value: 0 }, label: '¿Respondió?', on_true: 'step4', on_false: 'step5', position: { x: 200, y: 250 } },
            { id: 'step4', type: 'move_stage', config: { stage: 'contacted' }, label: 'Mover a Contactado', position: { x: 100, y: 350 } },
            { id: 'step5', type: 'send_email', config: { template_id: 'welcome_lead' }, label: 'Email de bienvenida', next_step: 'step6', position: { x: 300, y: 350 } },
            { id: 'step6', type: 'create_task', config: { title: 'Llamar a lead sin respuesta', type: 'call', priority: 'high', days: 1 }, label: 'Crear tarea de llamada', position: { x: 300, y: 450 } },
        ],
    },
    {
        name: 'Seguimiento cotización',
        description: 'Al enviar una cotización (stage: quoted), espera 48h y envía seguimiento por WhatsApp. Si no responde en 72h más, notifica al agente.',
        trigger_type: 'stage_change',
        trigger_config: { to_stage: 'quoted' },
        is_active: false,
        steps: [
            { id: 'step1', type: 'wait', config: { hours: 48 }, label: 'Esperar 48h', next_step: 'step2', position: { x: 200, y: 50 } },
            { id: 'step2', type: 'send_whatsapp', config: { template_id: 'wa_followup' }, label: 'WhatsApp seguimiento', next_step: 'step3', position: { x: 200, y: 150 } },
            { id: 'step3', type: 'wait', config: { hours: 72 }, label: 'Esperar 72h', next_step: 'step4', position: { x: 200, y: 250 } },
            { id: 'step4', type: 'condition', config: { field: 'pipeline_stage', operator: '==', value: 'quoted' }, label: '¿Sigue en cotizado?', on_true: 'step5', on_false: undefined, position: { x: 200, y: 350 } },
            { id: 'step5', type: 'notify_agent', config: { message: 'La cotización no ha sido respondida en 5 días', priority: 'high' }, label: 'Notificar agente', next_step: 'step6', position: { x: 200, y: 450 } },
            { id: 'step6', type: 'add_tag', config: { tag: 'cotización_sin_respuesta' }, label: 'Agregar tag', position: { x: 200, y: 550 } },
        ],
    },
    {
        name: 'Re-engagement automático',
        description: 'Para contactos sin actividad en 14 días. Envía email de re-engagement, espera 7 días, si no hay actividad envía oferta especial.',
        trigger_type: 'time_inactive',
        trigger_config: { days_inactive: 14 },
        is_active: false,
        steps: [
            { id: 'step1', type: 'send_email', config: { template_id: 'reengagement' }, label: 'Email re-engagement', next_step: 'step2', position: { x: 200, y: 50 } },
            { id: 'step2', type: 'wait', config: { hours: 168 }, label: 'Esperar 7 días', next_step: 'step3', position: { x: 200, y: 150 } },
            { id: 'step3', type: 'condition', config: { field: 'days_since_interaction', operator: '>', value: 21 }, label: '¿21d sin actividad?', on_true: 'step4', on_false: undefined, position: { x: 200, y: 250 } },
            { id: 'step4', type: 'send_email', config: { template_id: 'special_offer' }, label: 'Oferta especial', next_step: 'step5', position: { x: 200, y: 350 } },
            { id: 'step5', type: 'create_task', config: { title: 'Última llamada de re-engagement', type: 'call', priority: 'medium', days: 3 }, label: 'Tarea de llamada', position: { x: 200, y: 450 } },
        ],
    },
    {
        name: 'Hot lead detectado',
        description: 'Cuando el score supera 70 puntos, notifica al agente, envía WhatsApp al contacto, y crea tarea urgente de seguimiento.',
        trigger_type: 'score_threshold',
        trigger_config: { min_score: 70 },
        is_active: false,
        steps: [
            { id: 'step1', type: 'notify_agent', config: { message: '🔥 ¡Nuevo hot lead! Score arriba de 70', priority: 'urgent' }, label: 'Alerta hot lead', next_step: 'step2', position: { x: 200, y: 50 } },
            { id: 'step2', type: 'add_tag', config: { tag: 'hot_lead' }, label: 'Tag hot lead', next_step: 'step3', position: { x: 200, y: 150 } },
            { id: 'step3', type: 'create_task', config: { title: '🔥 Contactar hot lead URGENTE', type: 'call', priority: 'urgent', days: 0 }, label: 'Tarea urgente', position: { x: 200, y: 250 } },
        ],
    },
]

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMWorkflowService {

    /**
     * Obtener workflows disponibles (plantillas + guardados)
     */
    getWorkflowTemplates(): Omit<Workflow, 'id'>[] {
        return WORKFLOW_TEMPLATES
    }

    /**
     * Obtener workflows guardados
     */
    async getSavedWorkflows(): Promise<Workflow[]> {
        const result = await query(`
      SELECT id, name, trigger_event AS trigger_type,
             action_config, is_active, execution_count, last_executed_at, created_at
      FROM crm_automation_rules
      WHERE action_type = 'workflow'
      ORDER BY created_at DESC
    `)

        return result.rows.map((r: Record<string, unknown>) => {
            const config = typeof r.action_config === 'string'
                ? JSON.parse(r.action_config as string)
                : r.action_config
            return {
                id: r.id as number,
                name: r.name as string,
                description: config?.description || '',
                trigger_type: r.trigger_type as Workflow['trigger_type'],
                trigger_config: config?.trigger_config || {},
                steps: config?.steps || [],
                is_active: r.is_active as boolean,
                execution_count: r.execution_count as number,
                last_executed_at: r.last_executed_at as string,
                created_at: r.created_at as string,
            }
        })
    }

    /**
     * Guardar un workflow
     */
    async saveWorkflow(workflow: Omit<Workflow, 'id' | 'execution_count' | 'last_executed_at' | 'created_at'>): Promise<number> {
        const config = JSON.stringify({
            description: workflow.description,
            trigger_config: workflow.trigger_config,
            steps: workflow.steps,
        })

        const result = await queryOne(`
      INSERT INTO crm_automation_rules (name, trigger_event, action_type, action_config, is_active, priority, created_at)
      VALUES ($1, $2, 'workflow', $3, $4, 0, NOW())
      RETURNING id
    `, [workflow.name, workflow.trigger_type, config, workflow.is_active])

        return result?.id
    }

    /**
     * Actualizar un workflow existente
     */
    async updateWorkflow(id: number, workflow: Partial<Workflow>): Promise<void> {
        const existing = await queryOne(`SELECT action_config FROM crm_automation_rules WHERE id = $1`, [id])
        if (!existing) throw new Error('Workflow no encontrado')

        const currentConfig = typeof existing.action_config === 'string' ? JSON.parse(existing.action_config) : existing.action_config

        const updatedConfig = JSON.stringify({
            ...currentConfig,
            description: workflow.description ?? currentConfig.description,
            trigger_config: workflow.trigger_config ?? currentConfig.trigger_config,
            steps: workflow.steps ?? currentConfig.steps,
        })

        await query(`
      UPDATE crm_automation_rules
      SET name = COALESCE($2, name),
          trigger_event = COALESCE($3, trigger_event),
          action_config = $4,
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
      WHERE id = $1
    `, [id, workflow.name || null, workflow.trigger_type || null, updatedConfig, workflow.is_active ?? null])
    }

    /**
     * Ejecutar un workflow para un contacto
     */
    async executeWorkflow(workflowId: number, contactId: number): Promise<WorkflowExecution> {
        const startTime = Date.now()
        const execution: WorkflowExecution = {
            workflow_id: workflowId,
            contact_id: contactId,
            steps_executed: 0,
            steps_skipped: 0,
            errors: [],
            duration_ms: 0,
        }

        // Obtener workflow
        const rule = await queryOne(`SELECT * FROM crm_automation_rules WHERE id = $1`, [workflowId])
        if (!rule) {
            execution.errors.push('Workflow no encontrado')
            return execution
        }

        const config = typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config
        const steps: WorkflowStep[] = config.steps || []

        if (steps.length === 0) {
            execution.errors.push('Workflow sin pasos')
            return execution
        }

        // Obtener contacto
        const contact = await queryOne(`SELECT * FROM crm_contacts WHERE id = $1`, [contactId])
        if (!contact) {
            execution.errors.push('Contacto no encontrado')
            return execution
        }

        // Ejecutar pasos secuencialmente
        let currentStepId: string | undefined = steps[0].id

        while (currentStepId) {
            const step = steps.find(s => s.id === currentStepId)
            if (!step) break

            try {
                const result = await this.executeStep(step, contactId, contact)
                execution.steps_executed++

                // Determinar siguiente paso
                if (step.type === 'condition') {
                    currentStepId = result ? step.on_true : step.on_false
                    if (!result) execution.steps_skipped++
                } else if (step.type === 'wait') {
                    // Los waits son registrados pero no bloquean (en producción usarían un scheduler)
                    currentStepId = step.next_step
                } else {
                    currentStepId = step.next_step
                }
            } catch (err) {
                execution.errors.push(`Paso ${step.id} (${step.label}): ${(err as Error).message}`)
                currentStepId = step.next_step // Continuar aunque falle
            }
        }

        execution.duration_ms = Date.now() - startTime

        // Actualizar estadísticas del workflow
        await query(`
      UPDATE crm_automation_rules
      SET execution_count = COALESCE(execution_count, 0) + 1,
          last_executed_at = NOW()
      WHERE id = $1
    `, [workflowId])

        // Log de ejecución
        await query(`
      INSERT INTO crm_automation_log (rule_id, contact_id, trigger_event, action_result, status)
      VALUES ($1, $2, 'workflow_execution', $3, $4)
    `, [
            workflowId,
            contactId,
            JSON.stringify(execution),
            execution.errors.length === 0 ? 'success' : 'partial',
        ])

        return execution
    }

    /**
     * Ejecutar un paso individual
     */
    private async executeStep(step: WorkflowStep, contactId: number, contact: Record<string, unknown>): Promise<boolean> {
        switch (step.type) {
            case 'send_email': {
                const templateId = step.config.template_id as string
                await crmCampaignService.sendToContact(templateId, contactId)
                return true
            }

            case 'send_whatsapp': {
                const templateId = step.config.template_id as string
                await crmWhatsAppService.sendTemplateMessage(contactId, templateId)
                return true
            }

            case 'wait': {
                // En ejecución real, se registraría un delayed job
                // Por ahora, solo se registra el paso
                return true
            }

            case 'condition': {
                const field = step.config.field as string
                const operator = step.config.operator as string
                const value = step.config.value

                let fieldValue: unknown

                if (field === 'interaction_count') {
                    const result = await queryOne(`SELECT COUNT(*) AS cnt FROM crm_interactions WHERE contact_id = $1`, [contactId])
                    fieldValue = parseInt(result?.cnt || '0')
                } else if (field === 'days_since_interaction') {
                    const result = await queryOne(`
            SELECT EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 86400 AS days
            FROM crm_interactions WHERE contact_id = $1
          `, [contactId])
                    fieldValue = parseFloat(result?.days || '999')
                } else {
                    fieldValue = contact[field]
                }

                switch (operator) {
                    case '>': return Number(fieldValue) > Number(value)
                    case '<': return Number(fieldValue) < Number(value)
                    case '>=': return Number(fieldValue) >= Number(value)
                    case '<=': return Number(fieldValue) <= Number(value)
                    case '==': return String(fieldValue) === String(value)
                    case '!=': return String(fieldValue) !== String(value)
                    default: return false
                }
            }

            case 'update_contact': {
                const updates = step.config.updates as Record<string, unknown>
                if (updates) {
                    const fields: string[] = []
                    const values: unknown[] = [contactId]
                    let paramIndex = 2
                    for (const [key, val] of Object.entries(updates)) {
                        fields.push(`${key} = $${paramIndex++}`)
                        values.push(val)
                    }
                    if (fields.length > 0) {
                        await query(`UPDATE crm_contacts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1`, values)
                    }
                }
                return true
            }

            case 'create_task': {
                const cfg = step.config
                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + (Number(cfg.days) || 1))
                await query(`
          INSERT INTO crm_tasks (contact_id, title, task_type, priority, status, due_date, created_at)
          VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
        `, [contactId, cfg.title, cfg.type || 'follow_up', cfg.priority || 'medium', dueDate.toISOString()])
                return true
            }

            case 'move_stage': {
                const stage = step.config.stage as string
                await query(`
          UPDATE crm_contacts SET pipeline_stage = $2, stage_changed_at = NOW(), updated_at = NOW() WHERE id = $1
        `, [contactId, stage])
                return true
            }

            case 'add_tag': {
                const tag = step.config.tag as string
                await query(`
          UPDATE crm_contacts
          SET tags = array_append(COALESCE(tags, ARRAY[]::text[]), $2), updated_at = NOW()
          WHERE id = $1 AND NOT ($2 = ANY(COALESCE(tags, ARRAY[]::text[])))
        `, [contactId, tag])
                return true
            }

            case 'notify_agent': {
                const message = step.config.message as string
                const priority = step.config.priority as string || 'medium'
                await query(`
          INSERT INTO crm_notifications (user_id, type, title, message, priority, contact_id, created_at)
          SELECT assigned_agent_id, 'workflow', 'Workflow: ${step.label}', $2, $3, $1, NOW()
          FROM crm_contacts WHERE id = $1 AND assigned_agent_id IS NOT NULL
        `, [contactId, message, priority])
                return true
            }

            default:
                return false
        }
    }
}

export const crmWorkflowService = new CRMWorkflowService()
