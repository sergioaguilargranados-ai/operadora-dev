import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { device_token, user_id } = body || {}

    if (!device_token) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'device_token es requerido'),
        { status: 400 }
      )
    }

    // Intentar obtener user_id desde Authorization si no viene en el body
    if (!user_id) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const payload: any = jwt.verify(authHeader.substring(7), JWT_SECRET)
          user_id = payload?.id
        } catch { }
      }
    }

    if (!user_id) {
      return NextResponse.json(
        errorResponse('AUTH_MISSING', 'user_id requerido (body) o Authorization header'),
        { status: 401 }
      )
    }

    // Marcar dispositivo como inactivo
    const result = await query(
      `UPDATE device_tokens 
       SET is_active = false 
       WHERE user_id = $1 AND device_token = $2
       RETURNING id`,
      [user_id, device_token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Dispositivo no encontrado'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      successResponse({ unregistered: true }),
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('UNKNOWN', error?.message || 'Error al dar de baja dispositivo'),
      { status: 500 }
    )
  }
}
