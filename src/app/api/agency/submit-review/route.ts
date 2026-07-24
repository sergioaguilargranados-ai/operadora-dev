import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      token = request.cookies.get('as_token')?.value
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; tenantId: number }

    if (decoded.role !== 'PENDING_AGENCY') {
      return NextResponse.json({ success: false, error: 'El rol actual no permite esta acción' }, { status: 403 })
    }

    // Actualizar el rol del usuario a UNDER_REVIEW_AGENCY
    await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      ['UNDER_REVIEW_AGENCY', decoded.id]
    )

    // Opcional: Enviar correo al administrador de que hay una nueva solicitud pendiente de revisión.

    return NextResponse.json({ success: true, message: 'Enviado a revisión' })

  } catch (error: any) {
    console.error('Error enviando a revisión:', error)
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor' },
      { status: 500 }
    )
  }
}
