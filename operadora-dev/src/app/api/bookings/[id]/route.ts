import { NextRequest, NextResponse } from 'next/server'
import { queryOne, updateOne, softDelete } from '@/lib/db'
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'
import KiwiAdapter from '@/services/providers/KiwiAdapter'
import ExpediaAdapter from '@/services/providers/ExpediaAdapter'
/**
 * GET /api/bookings/[id]
 * Obtener detalles de una reserva específica
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
    const booking = await queryOne(`
      SELECT
        b.id,
        b.booking_type,
        b.booking_reference,
        b.provider,
        b.status,
        b.total_amount,
        b.currency,
        b.booking_details,
        b.traveler_info,
        b.contact_info,
        b.special_requests,
        b.created_at,
        b.confirmed_at,
        b.cancelled_at,
        b.cancellation_reason,
        b.payment_status,
        b.payment_method,
        b.cost_center_id,
        cc.code as cost_center_code,
        cc.name as cost_center_name,
        cc.budget as cost_center_budget
      FROM bookings b
      LEFT JOIN cost_centers cc ON b.cost_center_id = cc.id
      WHERE b.id = $1 AND b.user_id = $2 AND b.is_active = true
    `, [id, userId])
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    // Parsear campos JSON
    const formattedBooking = {
      ...booking,
      booking_details: JSON.parse(booking.booking_details || '{}'),
      traveler_info: JSON.parse(booking.traveler_info || '[]'),
      contact_info: JSON.parse(booking.contact_info || '{}')
    }
    return NextResponse.json({
      success: true,
      data: formattedBooking
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch booking',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * PUT /api/bookings/[id]
 * Modificar una reserva (cambios, solicitudes especiales)
 */
export async function PUT(
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
    // Verificar que la reserva pertenece al usuario
    const booking = await queryOne(`
      SELECT * FROM bookings
      WHERE id = $1 AND user_id = $2 AND is_active = true
    `, [id, userId])
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    // Solo permitir modificaciones en reservas confirmadas
    if (booking.status !== 'confirmed' && booking.status !== 'pending_confirmation') {
      return NextResponse.json({
        success: false,
        error: 'Cannot modify booking with status: ' + booking.status
      }, { status: 400 })
    }
    const body = await request.json()
    const { special_requests, traveler_info } = body
    // Actualizar campos permitidos
    const updates: any = {}
    if (special_requests !== undefined) {
      updates.special_requests = special_requests
    }
    if (traveler_info !== undefined) {
      updates.traveler_info = JSON.stringify(traveler_info)
    }
    updates.updated_at = new Date()
    const updatedBooking = await updateOne('bookings', parseInt(id), updates)
    return NextResponse.json({
      success: true,
      data: {
        ...updatedBooking,
        traveler_info: JSON.parse(updatedBooking.traveler_info || '[]'),
        booking_details: JSON.parse(updatedBooking.booking_details || '{}')
      },
      message: 'Booking updated successfully'
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update booking',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * DELETE /api/bookings/[id]
 * Cancelar una reserva
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
    // Verificar que la reserva pertenece al usuario
    const booking = await queryOne(`
      SELECT * FROM bookings
      WHERE id = $1 AND user_id = $2 AND is_active = true
    `, [id, userId])
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    // Solo permitir cancelaciones en reservas confirmadas o pendientes
    if (booking.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Booking is already cancelled'
      }, { status: 400 })
    }
    const body = await request.json().catch(() => ({}))
    const cancellationReason = body.reason || 'User requested cancellation'
    // Intentar cancelar en el proveedor
    let providerCancellationResult
    try {
      switch (booking.provider.toLowerCase()) {
        case 'amadeus':
          providerCancellationResult = await cancelAmadeusBooking(
            booking.booking_reference,
            cancellationReason
          )
          break
        case 'kiwi':
          providerCancellationResult = await cancelKiwiBooking(
            booking.booking_reference,
            cancellationReason
          )
          break
        case 'expedia':
          providerCancellationResult = await cancelExpediaBooking(
            booking.booking_reference,
            cancellationReason
          )
          break
        default:
          // Para proveedores sin API de cancelación
          providerCancellationResult = {
            success: true,
            message: 'Manual cancellation required',
            refundAmount: 0
          }
      }
    } catch (providerError) {
      console.error('Provider cancellation failed:', providerError)
      // Continuar con cancelación en BD aunque el proveedor falle
      providerCancellationResult = {
        success: false,
        message: (providerError as Error).message
      }
    }
    // Actualizar estado en base de datos
    const updatedBooking = await updateOne('bookings', parseInt(id), {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: cancellationReason,
      updated_at: new Date()
    })
    // TODO: Enviar email de cancelación
    // await sendCancellationEmail(updatedBooking)
    // TODO: Procesar reembolso si aplica
    // await processRefund(updatedBooking, providerCancellationResult.refundAmount)
    return NextResponse.json({
      success: true,
      data: {
        ...updatedBooking,
        provider_cancellation: providerCancellationResult
      },
      message: 'Booking cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel booking',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * Helper: Cancelar reserva en Amadeus
 */
async function cancelAmadeusBooking(bookingRef: string, reason?: string) {
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    throw new Error('Amadeus credentials not configured')
  }
  const amadeus = new AmadeusAdapter(
    process.env.AMADEUS_API_KEY,
    process.env.AMADEUS_API_SECRET,
    process.env.AMADEUS_SANDBOX === 'true'
  )
  return await amadeus.cancelBooking(bookingRef, reason)
}
/**
 * Helper: Cancelar reserva en Kiwi
 */
async function cancelKiwiBooking(bookingRef: string, reason?: string) {
  // Kiwi no tiene API de cancelación directa
  // Retornar éxito pero marcando que requiere cancelación manual
  return {
    success: true,
    message: 'Cancellation registered. Contact Kiwi support to complete.',
    refundAmount: 0
  }
}
/**
 * Helper: Cancelar reserva en Expedia
 */
async function cancelExpediaBooking(bookingRef: string, reason?: string) {
  if (!process.env.EXPEDIA_API_KEY || !process.env.EXPEDIA_API_SECRET) {
    throw new Error('Expedia credentials not configured')
  }
  const expedia = new ExpediaAdapter(
    process.env.EXPEDIA_API_KEY,
    process.env.EXPEDIA_API_SECRET,
    process.env.EXPEDIA_SANDBOX === 'true'
  )
  return await expedia.cancelBooking(bookingRef, reason)
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
