import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/communication/messages/deliveries?ids=1,2,3
 * Devuelve el estado de entrega (message_deliveries) para los mensajes indicados.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids') || ''
        const ids = idsParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0)

        if (ids.length === 0) {
            return NextResponse.json({ success: true, data: [] })
        }

        // Traer los registros de entrega con información útil para mostrar en UI
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
        const result = await query(
            `SELECT
                id,
                message_id,
                channel,
                recipient,
                status,
                provider,
                provider_message_id,
                error_message,
                sent_at,
                delivered_at,
                opened_at
             FROM message_deliveries
             WHERE message_id IN (${placeholders})
             ORDER BY sent_at DESC`,
            ids
        )

        return NextResponse.json({ success: true, data: result.rows })
    } catch (error: any) {
        // Si la tabla no existe aún, devolver array vacío sin error
        if (error.message?.includes('does not exist')) {
            return NextResponse.json({ success: true, data: [] })
        }
        console.error('Error loading message deliveries:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
