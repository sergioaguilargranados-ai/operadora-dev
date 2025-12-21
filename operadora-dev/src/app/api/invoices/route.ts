import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'
import FacturamaService from '@/services/FacturamaService'

/**
 * GET /api/invoices
 * Listar facturas del usuario o tenant
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('booking_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let sql = `
      SELECT
        i.id,
        i.booking_id,
        i.invoice_number,
        i.folio_fiscal,
        i.serie,
        i.folio,
        i.rfc_receptor,
        i.nombre_receptor,
        i.total,
        i.subtotal,
        i.impuestos,
        i.status,
        i.fecha_emision,
        i.fecha_cancelacion,
        i.pdf_url,
        i.xml_url,
        i.created_at,
        b.booking_reference,
        b.booking_type
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      WHERE b.user_id = $1
    `

    const params: any[] = [userId]
    let paramIndex = 2

    if (bookingId) {
      sql += ` AND i.booking_id = $${paramIndex}`
      params.push(bookingId)
      paramIndex++
    }

    if (status) {
      sql += ` AND i.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (startDate) {
      sql += ` AND i.fecha_emision >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      sql += ` AND i.fecha_emision <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    sql += ` ORDER BY i.created_at DESC`

    const result = await query(sql, params)
    const invoices = result.rows || []

    return NextResponse.json({
      success: true,
      data: invoices,
      total: invoices.length
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoices',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * POST /api/invoices
 * Crear una factura CFDI
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()

    const {
      booking_id,
      cliente
    } = body

    // Validar que la reserva exista y pertenezca al usuario
    const booking = await queryOne(`
      SELECT * FROM bookings
      WHERE id = $1 AND user_id = $2
    `, [booking_id, userId])

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }

    // Verificar si ya existe una factura para esta reserva
    const existingInvoice = await queryOne(`
      SELECT * FROM invoices
      WHERE booking_id = $1 AND status = 'vigente'
    `, [booking_id])

    if (existingInvoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice already exists for this booking'
      }, { status: 400 })
    }

    // Generar factura con Facturama
    const facturaResult = await FacturamaService.generarFacturaDesdeReserva(
      booking_id,
      cliente
    )

    // Guardar en base de datos
    const invoice = await insertOne('invoices', {
      booking_id: booking_id,
      invoice_number: `${facturaResult.serie}${facturaResult.folio}`,
      folio_fiscal: facturaResult.folio_fiscal,
      serie: facturaResult.serie,
      folio: facturaResult.folio,
      rfc_receptor: cliente.rfc,
      nombre_receptor: cliente.nombre,
      total: facturaResult.total,
      subtotal: facturaResult.subtotal,
      impuestos: facturaResult.total - facturaResult.subtotal,
      status: 'vigente',
      fecha_emision: new Date(facturaResult.fecha),
      sello_digital_cfdi: facturaResult.sello_digital_cfdi,
      sello_digital_sat: facturaResult.sello_digital_sat,
      cadena_original_sat: facturaResult.cadena_original_sat,
      numero_certificado_sat: facturaResult.numero_certificado_sat,
      rfc_proveedor_certificacion: facturaResult.rfc_proveedor_certificacion,
      pdf_url: facturaResult.pdf_url,
      xml_url: facturaResult.xml_url,
      facturama_id: facturaResult.id
    })

    // TODO: Enviar factura por email
    // await sendInvoiceEmail(invoice, cliente.email)

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create invoice',
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
