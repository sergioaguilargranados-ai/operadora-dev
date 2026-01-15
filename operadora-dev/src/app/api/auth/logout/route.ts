import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { successResponse, errorResponse } from '@/types/api-response'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try { body = await request.json() } catch {}
    const { session_token, user_id } = body || {}

    let token = session_token
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json(
        errorResponse('TOKEN_MISSING', 'Falta session_token o Authorization header'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    // Intentar extraer user_id desde token si no viene
    let uid = user_id
    if (!uid) {
      try {
        const payload: any = jwt.verify(token, JWT_SECRET)
        uid = payload?.id
      } catch {}
    }

    if (!uid) {
      return NextResponse.json(
        errorResponse('USER_MISSING', 'user_id requerido'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    await query('UPDATE active_sessions SET is_active = false WHERE user_id = $1 AND session_token = $2', [uid, token])

    return NextResponse.json(
      successResponse({ loggedOut: true }),
      { status: 200, headers: { 'X-API-Version': '1.0' } }
    )
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('UNKNOWN', error?.message || 'Error en logout'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
