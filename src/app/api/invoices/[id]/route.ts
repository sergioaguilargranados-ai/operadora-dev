import { NextRequest, NextResponse } from 'next/server'
import { queryOne, updateOne } from '@/lib/db'
import FacturamaService from '@/services/FacturamaService'
/**
 * GET /api/invoices/[id]
 * Obtener detalles de una factura
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') // pdf, xml, details
    const invoice = await queryOne(`
      SELECT i.*, b.user_id
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `, [id, userId])
    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }
    // Acciones especiales
    if (action === 'pdf') {
      try {
        const pdfBuffer = await FacturamaService.descargarPDF(invoice.facturama_id)
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="factura_${invoice.invoice_number}.pdf"`
          }
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to download PDF',
          message: (error as Error).message
        }, { status: 500 })
      }
    }
    if (action === 'xml') {
      try {
        const xmlContent = await FacturamaService.descargarXML(invoice.facturama_id)
        return new NextResponse(xmlContent, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="factura_${invoice.invoice_number}.xml"`
          }
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to download XML',
          message: (error as Error).message
        }, { status: 500 })
      }
    }
    // Retornar detalles
    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoice',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * DELETE /api/invoices/[id]
 * Cancelar una factura
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }
    const { id } = await params
    const invoice = await queryOne(`
      SELECT i.*, b.user_id
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `, [id, userId])
    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }
    if (invoice.status === 'cancelada') {
      return NextResponse.json({
        success: false,
        error: 'Invoice is already cancelled'
      }, { status: 400 })
    }
    const body = await request.json().catch(() => ({}))
    const motivo = body.motivo || '02' // 02 = Comprobante emitido con errores
    // Cancelar en Facturama
    try {
      await FacturamaService.cancelarFactura(invoice.facturama_id, motivo)
    } catch (error) {
      console.error('Facturama cancellation failed:', error)
      // Continuar con cancelación en BD aunque Facturama falle
    }
    // Actualizar en BD
    const updatedInvoice = await updateOne('invoices', parseInt(id), {
      status: 'cancelada',
      fecha_cancelacion: new Date(),
      motivo_cancelacion: motivo,
      updated_at: new Date()
    })
    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling invoice:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel invoice',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * Helper: Obtener user ID del token JWT
 */
async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    const token = authHeader.replace('Bearer ', '')
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded.userId || null
  } catch {
    return null
  }
}