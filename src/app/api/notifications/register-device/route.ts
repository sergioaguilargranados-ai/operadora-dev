import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { device_token, platform, device_name, app_version, user_id } = body || {}

    if (!device_token || !platform) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'device_token y platform son requeridos'),
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
        } catch {}
      }
    }

    if (!user_id) {
      return NextResponse.json(
        errorResponse('AUTH_MISSING', 'user_id requerido (body) o Authorization header'),
        { status: 401 }
      )
    }

    // Crear tabla si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_token VARCHAR(500) NOT NULL,
        platform VARCHAR(20) NOT NULL,
        device_name VARCHAR(100),
        app_version VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, device_token)
      );
    `)

    // Upsert
    await query(
      `INSERT INTO device_tokens (user_id, device_token, platform, device_name, app_version, is_active, last_used_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (user_id, device_token)
       DO UPDATE SET platform = EXCLUDED.platform, device_name = EXCLUDED.device_name, app_version = EXCLUDED.app_version, is_active = true, last_used_at = NOW()`,
      [user_id, device_token, platform, device_name || null, app_version || null]
    )

    return NextResponse.json(successResponse({ registered: true }), { status: 200 })
  } catch (error: any) {
    return NextResponse.json(errorResponse('UNKNOWN', error?.message || 'Error registrando dispositivo'), { status: 500 })
  }
}
