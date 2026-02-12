import { NextRequest, NextResponse } from 'next/server'
import { crmWhatsAppService } from '@/services/CRMWhatsAppService'

/**
 * GET /api/crm/whatsapp
 *   action=templates -> listar plantillas
 *   action=preview&template_id=xx&nombre=Juan&destino=Cancún -> preview
 *   action=suggest&stage=quoted -> sugerencia
 * 
 * POST /api/crm/whatsapp
 *   { template_id, contact_ids, variables? } -> envío masivo
 *   { template_id, contact_id, variables? } -> envío individual
 */

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'templates'

        switch (action) {
            case 'templates': {
                const templates = crmWhatsAppService.getTemplates()
                return NextResponse.json({ success: true, data: templates })
            }

            case 'preview': {
                const templateId = sp.get('template_id')
                if (!templateId) return NextResponse.json({ success: false, error: 'template_id requerido' }, { status: 400 })
                const variables: Record<string, string> = {}
                sp.forEach((val, key) => { if (key !== 'action' && key !== 'template_id') variables[key] = val })
                const preview = crmWhatsAppService.getTemplatePreview(templateId, variables)
                return NextResponse.json({ success: true, data: { preview } })
            }

            case 'suggest': {
                const stage = sp.get('stage') || 'new'
                const suggested = crmWhatsAppService.getSuggestedTemplate(stage)
                return NextResponse.json({ success: true, data: { suggested_template: suggested } })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM WhatsApp]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { template_id, contact_id, contact_ids, variables } = body

        if (!template_id) {
            return NextResponse.json({ success: false, error: 'template_id requerido' }, { status: 400 })
        }

        // Envío individual
        if (contact_id) {
            const result = await crmWhatsAppService.sendTemplateMessage(contact_id, template_id, variables)
            return NextResponse.json({ success: result.success, data: result })
        }

        // Envío masivo
        if (contact_ids?.length) {
            const result = await crmWhatsAppService.sendBulkMessage(contact_ids, template_id, variables)
            return NextResponse.json({ success: true, data: result })
        }

        return NextResponse.json({ success: false, error: 'contact_id o contact_ids requerido' }, { status: 400 })
    } catch (error) {
        console.error('[CRM WhatsApp]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
