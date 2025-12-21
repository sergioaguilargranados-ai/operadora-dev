import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'

/**
 * GET /api/communication/quick-responses
 * Obtener respuestas rápidas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('user_id') || '1')
    const tenantId = parseInt(searchParams.get('tenant_id') || '1')

    const responses = await CommunicationService.getQuickResponses(userId, tenantId)

    return NextResponse.json({
      success: true,
      data: responses
    })

  } catch (error: any) {
    console.error('[QUICK RESPONSES GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
