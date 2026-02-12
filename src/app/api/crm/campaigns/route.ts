import { NextRequest, NextResponse } from 'next/server'
import { crmCampaignService } from '@/services/CRMCampaignService'

/**
 * GET /api/crm/campaigns
 * 
 * Obtener templates disponibles y candidatos
 * Params: ?action=templates | preview | reengagement_candidates | posttrip_candidates
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'templates'

        switch (action) {
            case 'templates':
                return NextResponse.json({
                    success: true,
                    data: crmCampaignService.getTemplates(),
                })

            case 'preview': {
                const templateId = sp.get('template_id')
                if (!templateId) {
                    return NextResponse.json({ success: false, error: 'template_id requerido' }, { status: 400 })
                }
                const variables: Record<string, string> = {}
                sp.forEach((value, key) => {
                    if (key !== 'action' && key !== 'template_id') {
                        variables[key] = value
                    }
                })
                const preview = crmCampaignService.getTemplatePreview(templateId, {
                    nombre: 'Juan',
                    destino: 'Cancún',
                    ...variables,
                })
                if (!preview) {
                    return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 })
                }
                return NextResponse.json({ success: true, data: preview })
            }

            case 'reengagement_candidates': {
                const limit = parseInt(sp.get('limit') || '50')
                const candidates = await crmCampaignService.getReengagementCandidates(limit)
                return NextResponse.json({ success: true, data: candidates })
            }

            case 'posttrip_candidates': {
                const limit = parseInt(sp.get('limit') || '50')
                const candidates = await crmCampaignService.getPostTripCandidates(limit)
                return NextResponse.json({ success: true, data: candidates })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Campaigns]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}

/**
 * POST /api/crm/campaigns
 * 
 * Enviar campaña de email
 * Body: {
 *   template_id: string,
 *   contact_ids: number[],
 *   variables?: Record<string, string>
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { template_id, contact_ids, variables } = body

        if (!template_id) {
            return NextResponse.json({ success: false, error: 'template_id requerido' }, { status: 400 })
        }
        if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
            return NextResponse.json({ success: false, error: 'contact_ids requerido (array)' }, { status: 400 })
        }

        const result = await crmCampaignService.sendCampaign(template_id, contact_ids, variables)

        return NextResponse.json({
            success: true,
            data: result,
            message: `Campaña enviada: ${result.sent} exitosos, ${result.failed} fallidos de ${result.total_contacts} contactos`,
        })
    } catch (error) {
        console.error('[CRM Campaigns]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
