import { NextRequest, NextResponse } from 'next/server'
import { crmWorkflowService } from '@/services/CRMWorkflowService'

/**
 * GET /api/crm/workflows
 *   action=templates -> plantillas predefinidas
 *   action=saved -> workflows guardados
 * 
 * POST /api/crm/workflows
 *   action=save -> guardar workflow  { workflow }
 *   action=execute -> ejecutar workflow { workflow_id, contact_id }
 *   action=update -> actualizar workflow { workflow_id, workflow }
 *   action=toggle -> activar/desactivar { workflow_id, is_active }
 */

export async function GET(request: NextRequest) {
    try {
        const action = request.nextUrl.searchParams.get('action') || 'saved'

        switch (action) {
            case 'templates': {
                const templates = crmWorkflowService.getWorkflowTemplates()
                return NextResponse.json({ success: true, data: templates })
            }

            case 'saved': {
                const workflows = await crmWorkflowService.getSavedWorkflows()
                return NextResponse.json({ success: true, data: workflows })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Workflows]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'save': {
                const id = await crmWorkflowService.saveWorkflow(body.workflow)
                return NextResponse.json({ success: true, data: { id } })
            }

            case 'execute': {
                if (!body.workflow_id || !body.contact_id) {
                    return NextResponse.json({ success: false, error: 'workflow_id y contact_id requeridos' }, { status: 400 })
                }
                const result = await crmWorkflowService.executeWorkflow(body.workflow_id, body.contact_id)
                return NextResponse.json({ success: true, data: result })
            }

            case 'update': {
                if (!body.workflow_id) {
                    return NextResponse.json({ success: false, error: 'workflow_id requerido' }, { status: 400 })
                }
                await crmWorkflowService.updateWorkflow(body.workflow_id, body.workflow)
                return NextResponse.json({ success: true })
            }

            case 'toggle': {
                if (!body.workflow_id) {
                    return NextResponse.json({ success: false, error: 'workflow_id requerido' }, { status: 400 })
                }
                await crmWorkflowService.updateWorkflow(body.workflow_id, { is_active: body.is_active })
                return NextResponse.json({ success: true })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Workflows]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
