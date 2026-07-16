import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const res = await dbQuery('SELECT id FROM users WHERE token = $1 LIMIT 1', [token])
      if (res.rows.length > 0) return res.rows[0].id
    }
    
    // Test mode fallback
    const mockUserStr = request.headers.get('x-mock-user')
    if (mockUserStr) {
      const mockUser = JSON.parse(mockUserStr)
      return mockUser.id
    }
  } catch (e) {
    console.error("Error validando token:", e)
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || request.cookies.get('as_user_id')?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el email del usuario para cruzarlo con cotizaciones huérfanas
    const userRes = await dbQuery('SELECT email FROM users WHERE id = $1', [userId])
    const userEmail = userRes.rows[0]?.email

    // Obtener los mensajes dirigidos al cliente (donde él es dueño del thread o la cotización es suya)
    const result = await dbQuery(`
      SELECT 
        m.id, 
        m.body, 
        t.subject,
        m.message_type, 
        m.created_at,
        m.sender_name,
        EXISTS(SELECT 1 FROM message_reads r WHERE r.message_id = m.id AND r.user_id = $1) as is_read
      FROM messages m
      JOIN communication_threads t ON m.thread_id = t.id
      LEFT JOIN tour_quotes tq ON t.reference_type = 'tour_quote' AND t.reference_id = tq.id
      WHERE (t.client_id = $1 OR tq.contact_email = $2)
        AND m.sender_type != 'client'
        AND m.is_internal = false
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [userId, userEmail])

    // Calcular cuántos no leídos hay (notificaciones tipo 'alert' o 'notification', o todos)
    const unreadCount = result.rows.filter(r => !r.is_read).length;

    return NextResponse.json({
      success: true,
      data: result.rows,
      unreadCount
    })

  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Para marcar como leídos
export async function PUT(request: NextRequest) {
  try {
    const { messageIds, userId } = await request.json()
    const finalUserId = userId || request.cookies.get('as_user_id')?.value

    if (!finalUserId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({ success: false, error: 'messageIds array es requerido' }, { status: 400 })
    }

    if (messageIds.length === 0) {
       return NextResponse.json({ success: true })
    }

    const now = new Date()
    
    // Insert ignores si ya existe (on conflict do nothing)
    // Usaremos un bucle simple por ahora, o insert múltiple
    for (const msgId of messageIds) {
      await dbQuery(`
        INSERT INTO message_reads (message_id, user_id, read_at)
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
          SELECT 1 FROM message_reads WHERE message_id = $1 AND user_id = $2
        )
      `, [msgId, finalUserId, now])
    }

    // Actualizar thread unread_count_client si queremos mantener consistencia
    // (Opcional, omitido por simplicidad y porque leemos directamente la vista)

    return NextResponse.json({
      success: true,
      message: 'Notificaciones marcadas como leídas'
    })

  } catch (error: any) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
