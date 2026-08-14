import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { InvoiceService } from '@/services/billing/InvoiceService'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

function getUserIdFromRequest(request: NextRequest): number | null {
    try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('as_token')?.value
        if (!token) return null

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'as-operadora-secret-2026')
        return decoded.userId || decoded.id || null
    } catch {
        return null
    }
}

/**
 * GET /api/billing/invoices
 * Lista las facturas emitidas (con filtros por status, rfc, o booking_id)
 */
export async function GET(request: NextRequest) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const bookingId = searchParams.get('booking_id')

        let sql = `SELECT i.*, b.booking_reference, b.destination 
                   FROM invoices i 
                   LEFT JOIN bookings b ON i.booking_id = b.id 
                   WHERE 1=1`
        const params: any[] = []

        if (status && status !== 'all') {
            params.push(status)
            sql += ` AND i.status = $${params.length}`
        }

        if (bookingId) {
            params.push(bookingId)
            sql += ` AND i.booking_id = $${params.length}`
        }

        sql += ` ORDER BY i.created_at DESC`

        const invoices = await queryMany(sql, params)

        return NextResponse.json({
            success: true,
            data: invoices || []
        })
    } catch (error: any) {
        console.error('Error GET /api/billing/invoices:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/billing/invoices
 * Emite y timbra un nuevo CFDI de factura para una reserva.
 */
export async function POST(request: NextRequest) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { bookingId, rfc, razonSocial, regimenFiscal, codigoPostal, usoCfdi, email } = body

        if (!bookingId || !rfc || !razonSocial || !codigoPostal) {
            return NextResponse.json({ success: false, error: 'Faltan datos fiscales requeridos (RFC, Razón Social, C.P.)' }, { status: 400 })
        }

        const result = await InvoiceService.createInvoice(bookingId, {
            rfc: rfc.trim().toUpperCase(),
            razonSocial: razonSocial.trim(),
            regimenFiscal: regimenFiscal || '601',
            codigoPostal: codigoPostal.trim(),
            usoCfdi: usoCfdi || 'G03',
            email: email || ''
        })

        return NextResponse.json({
            success: true,
            data: result.invoice,
            pacResponse: result.pacResponse,
            message: result.pacResponse.success ? 'Factura timbrada exitosamente' : 'Factura guardada como borrador'
        })
    } catch (error: any) {
        console.error('Error POST /api/billing/invoices:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
