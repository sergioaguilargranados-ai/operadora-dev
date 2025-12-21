import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'

/**
 * GET /api/communication/preferences?user_id=123
 * Obtener preferencias de comunicación del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('user_id') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id es requerido' },
        { status: 400 }
      )
    }

    const preferences = await CommunicationService.getUserPreferences(userId)

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error: any) {
    console.error('[PREFERENCES GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/communication/preferences
 * Actualizar preferencias de comunicación
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...preferences } = body

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id es requerido' },
        { status: 400 }
      )
    }

    await CommunicationService.updatePreferences(user_id, preferences)

    return NextResponse.json({
      success: true,
      message: 'Preferencias actualizadas correctamente'
    })

  } catch (error: any) {
    console.error('[PREFERENCES PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
