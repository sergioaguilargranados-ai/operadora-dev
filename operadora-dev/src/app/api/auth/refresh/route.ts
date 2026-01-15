import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '15m'

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try { body = await request.json() } catch {}
    let refreshToken: string | null = body.refreshToken || null
    const authHeader = request.headers.get('authorization')
    if (!refreshToken && authHeader && authHeader.startsWith('Bearer ')) {
      refreshToken = authHeader.substring(7)
    }

    if (!refreshToken) {
      return NextResponse.json(
        errorResponse('TOKEN_MISSING', 'Falta refresh token'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    let payload: any
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET)
    } catch (e) {
      return NextResponse.json(
        errorResponse('TOKEN_INVALID', 'Refresh token inválido'),
        { status: 401, headers: { 'X-API-Version': '1.0' } }
      )
    }

    if (payload?.type !== 'refresh' || !payload?.id) {
      return NextResponse.json(
        errorResponse('TOKEN_INVALID', 'Refresh token inválido'),
        { status: 401, headers: { 'X-API-Version': '1.0' } }
      )
    }

    // Validar sesión activa y token no expirado
    const sessionRes = await query(
      `SELECT id, expires_at, is_active FROM active_sessions
       WHERE user_id = $1 AND session_token = $2 AND is_active = true LIMIT 1`,
      [payload.id, refreshToken]
    )

    if (sessionRes.rows.length === 0) {
      return NextResponse.json(
        errorResponse('SESSION_NOT_FOUND', 'Sesión no válida o expirada'),
        { status: 401, headers: { 'X-API-Version': '1.0' } }
      )
    }

    // Obtener datos del usuario para generar nuevo access token
    const userRes = await query(
      'SELECT id, email, role, user_type FROM users WHERE id = $1 LIMIT 1',
      [payload.id]
    )
    if (userRes.rows.length === 0) {
      return NextResponse.json(
        errorResponse('USER_NOT_FOUND', 'Usuario no encontrado'),
        { status: 404, headers: { 'X-API-Version': '1.0' } }
      )
    }

    const user = userRes.rows[0]
    const newAccessToken = jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      user_type: user.user_type,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return NextResponse.json(
      successResponse({ accessToken: newAccessToken }),
      { status: 200, headers: { 'X-API-Version': '1.0' } }
    )
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('UNKNOWN', error?.message || 'Error al refrescar token'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
