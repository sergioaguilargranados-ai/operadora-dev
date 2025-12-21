import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'

/**
 * GET /api/communication/templates
 * Obtener plantillas de mensajes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = parseInt(searchParams.get('tenant_id') || '1')
    const category = searchParams.get('category') || undefined

    const templates = await CommunicationService.getTemplates(tenantId, category)

    return NextResponse.json({
      success: true,
      data: templates
    })

  } catch (error: any) {
    console.error('[TEMPLATES GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
