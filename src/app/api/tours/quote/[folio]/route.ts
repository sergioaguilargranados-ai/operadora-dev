import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ folio: string }> }
) {
    try {
        const { folio } = await params

        if (!folio) {
            return NextResponse.json(
                { success: false, error: 'Folio requerido' },
                { status: 400 }
            )
        }

        // Buscar cotización por folio
        const result = await query(
            `SELECT * FROM tour_quotes WHERE folio = $1`,
            [folio]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Cotización no encontrada' },
                { status: 404 }
            )
        }

        const quote = result.rows[0]

        return NextResponse.json({
            success: true,
            data: quote
        })

    } catch (error) {
        console.error('Error fetching quote:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener la cotización' },
            { status: 500 }
        )
    }
}
