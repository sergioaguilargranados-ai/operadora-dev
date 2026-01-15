import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_token, user_id } = body || {}

    if (!device_token || !user_id) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'device_token y user_id son requeridos'),
        { status: 400 }
      )
    }

    await query('UPDATE device_tokens SET is_active = false WHERE user_id = $1 AND device_token = $2', [user_id, device_token])

    return NextResponse.json(successResponse({ unregistered: true }), { status: 200 })
  } catch (error: any) {
    return NextResponse.json(errorResponse('UNKNOWN', error?.message || 'Error desregistrando dispositivo'), { status: 500 })
  }
}
