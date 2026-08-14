import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
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
 * GET /api/billing/invoices/[id]
 * Detalle completo de una factura con sus conceptos (items).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const invoice = await queryOne('SELECT * FROM invoices WHERE id = $1', [id])
        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 })
        }

        const items = await queryMany('SELECT * FROM invoice_items WHERE invoice_id = $1', [id])

        return NextResponse.json({
            success: true,
            data: {
                ...invoice,
                items: items || []
            }
        })
    } catch (error: any) {
        console.error('Error GET /api/billing/invoices/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/billing/invoices/[id]
 * Cancela una factura ante el SAT a través del PAC activo.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const { searchParams } = new URL(request.url)
        const motive = searchParams.get('motive') || '02'
        const uuidReplacement = searchParams.get('uuidReplacement') || undefined

        const invoice = await queryOne('SELECT * FROM invoices WHERE id = $1', [id])
        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 })
        }

        if (invoice.status === 'cancelled') {
            return NextResponse.json({ success: false, error: 'La factura ya se encuentra cancelada' }, { status: 400 })
        }

        const config = await InvoiceService.getAgencyConfig(invoice.tenant_id)
        const connector = InvoiceService.getConnector(invoice.pac_provider || config.pac_provider)

        // Cancelar en el PAC
        let cancelRes = null
        if (invoice.facturama_id) {
            cancelRes = await connector.cancelCFDI(config, invoice.facturama_id, motive, uuidReplacement)
        }

        // Marcar cancelada en BD
        await queryOne(
            `UPDATE invoices 
             SET status = 'cancelled', 
                 fecha_cancelacion = NOW(), 
                 motivo_cancelacion = $1 
             WHERE id = $2`,
            [motive, id]
        )

        return NextResponse.json({
            success: true,
            message: 'Factura cancelada correctamente ante el SAT',
            pacResponse: cancelRes
        })
    } catch (error: any) {
        console.error('Error DELETE /api/billing/invoices/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
