import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { push_token, platform, user_id } = body || {}

    if (!push_token) {
      return NextResponse.json(
        errorResponse('INVALID_TOKEN', 'Token push requerido'),
        { status: 400 }
      )
    }

    // Guardar o actualizar en tabla device_tokens
    const query = `
      INSERT INTO device_tokens (user_id, token, platform, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (token) 
      DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = NOW()
      RETURNING id, token, platform;
    `

    try {
      const result = await pool.query(query, [user_id || null, push_token, platform || 'android'])
      return NextResponse.json(
        successResponse({ token: result.rows[0] }),
        { status: 200 }
      )
    } catch (dbErr: any) {
      // Si la tabla no tiene unique constraint en token o falla, intentamos insert simple
      const insertFallback = `
        INSERT INTO device_tokens (user_id, token, platform, updated_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id;
      `
      const fallbackResult = await pool.query(insertFallback, [user_id || null, push_token, platform || 'android'])
      return NextResponse.json(
        successResponse({ id: fallbackResult.rows[0]?.id }),
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error('Error saving push token:', error)
    return NextResponse.json(
      errorResponse('SERVER_ERROR', error.message || 'Error al registrar token push'),
      { status: 500 }
    )
  }
}
