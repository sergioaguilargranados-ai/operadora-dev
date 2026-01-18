import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/services/PayPalService'
import { query } from '@/lib/db'

/**
 * POST /api/payments/paypal/create-order
 * Crear orden de pago en PayPal
 *
 * Body:
 * {
 *   bookingId: number
 *   userId: number
 *   tenantId: number
 *   amount: string // "100.00"
 *   currency: string // 'USD', 'MXN'
 *   description?: string
 * }
 *
 * Response:
 * {
 *   success: true
 *   orderId: string
 *   approvalUrl: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, userId, tenantId, amount, currency, description, returnUrl, cancelUrl } = body

    // Validaciones
    if (!bookingId || !userId || !tenantId || !amount || !currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan parámetros requeridos'
        },
        { status: 400 }
      )
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 0.5) {
      return NextResponse.json(
        {
          success: false,
          error: 'El monto mínimo es $0.50'
        },
        { status: 400 }
      )
    }

    // Verificar que la reserva existe y pertenece al usuario
    const booking = await query(
      `SELECT id, user_id, tenant_id, total_price, booking_status, payment_status
       FROM bookings
       WHERE id = $1
         AND user_id = $2
         AND tenant_id = $3`,
      [bookingId, userId, tenantId]
    )

    if (!booking.rows || booking.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada'
        },
        { status: 404 }
      )
    }

    const bookingData = booking.rows[0]

    // Verificar que la reserva no esté ya pagada
    if (bookingData.payment_status === 'paid' || bookingData.booking_status === 'confirmed') {
      return NextResponse.json(
        {
          success: false,
          error: 'La reserva ya está pagada'
        },
        { status: 400 }
      )
    }

    // Crear orden en PayPal
    const order = await PayPalService.createOrder({
      amount,
      currency,
      bookingId,
      userId,
      tenantId,
      description: description || `Reserva #${bookingId} - AS Operadora`,
      returnUrl: returnUrl || undefined,
      cancelUrl: cancelUrl || undefined
    })

    // Guardar orden en BD (opcional)
    try {
      await query(
        `INSERT INTO payment_transactions (
          booking_id,
          user_id,
          tenant_id,
          amount,
          currency,
          status,
          payment_method,
          transaction_id,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          bookingId,
          userId,
          tenantId,
          amountNum,
          currency.toUpperCase(),
          'pending',
          'paypal',
          order.orderId
        ]
      )
    } catch (dbError: any) {
      // Si la tabla no existe, loguear pero continuar
      console.warn('⚠️ No se pudo guardar transacción en BD:', dbError.message)
    }

    // Obtener URL de aprobación
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      approvalUrl,
      status: order.status
    })

  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear orden de PayPal',
        details: error.message
      },
      { status: 500 }
    )
  }
}
