import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

/**
 * GET /api/crm/leads
 * Listar leads y prospectos del CRM
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const tenantId = sp.get('tenant_id') || sp.get('tenantId') || sp.get('agency_id')
    const tId = tenantId ? parseInt(tenantId) : undefined

    const { contacts, total } = await crmService.listContacts({
      tenant_id: tId,
      status: 'active',
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      data: contacts,
      total
    })
  } catch (error: any) {
    console.error('Error in GET /api/crm/leads:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/crm/leads
 * Crear nuevo lead o actualizar etapa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, contact_id, stage, full_name, email, phone, source, interested_destination, estimated_value, tenant_id } = body

    if (action === 'move_stage') {
      if (!contact_id || !stage) {
        return NextResponse.json({ success: false, error: 'contact_id y stage requeridos' }, { status: 400 })
      }
      const updated = await crmService.moveToStage(parseInt(contact_id), stage)
      return NextResponse.json({ success: true, data: updated })
    }

    if (!full_name) {
      return NextResponse.json({ success: false, error: 'full_name es requerido' }, { status: 400 })
    }

    const contact = await crmService.createContact({
      tenant_id: tenant_id ? parseInt(tenant_id) : undefined,
      full_name,
      email,
      phone,
      source: source || 'Directo',
      interested_destination,
      budget_max: estimated_value ? parseFloat(estimated_value) : undefined,
      pipeline_stage: stage || 'new',
      contact_type: 'lead'
    })

    return NextResponse.json({ success: true, data: contact })
  } catch (error: any) {
    console.error('Error in POST /api/crm/leads:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
