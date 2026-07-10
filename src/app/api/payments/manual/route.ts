import { NextRequest, NextResponse } from 'next/server'
import { queryOne, updateOne, query, transaction } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let userId = 1 // Default para demo
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
        if (decoded.userId) userId = decoded.userId
      } catch (e) {
        // Ignorar error de JWT en demo
      }
    }

    const body = await request.json()
    const { bookingId, amount, method, reference, notes } = body

    if (!bookingId || !amount || !method) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos obligatorios'
      }, { status: 400 })
    }

    const booking = await queryOne('SELECT * FROM bookings WHERE id = $1', [bookingId])
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Reserva no encontrada'
      }, { status: 404 })
    }

    // Insertar el pago y actualizar la reserva en una transacción
    await transaction(async (client) => {
      // 1. Insertar el pago
      await client.query(`
        INSERT INTO payment_transactions (
          booking_id, user_id, tenant_id, amount, currency, status, payment_method, external_reference, payment_details
        ) VALUES (
          $1, $2, $3, $4, $5, 'completed', $6, $7, $8
        )
      `, [
        bookingId,
        userId,
        booking.tenant_id || 1,
        amount,
        booking.currency || 'MXN',
        method,
        reference || null,
        JSON.stringify({ notes, is_manual: true })
      ])

      // 2. Calcular monto pagado
      const payments = await client.query(`
        SELECT SUM(amount) as total_paid
        FROM payment_transactions
        WHERE booking_id = $1 AND status = 'completed'
      `, [bookingId])
      
      const totalPaid = parseFloat(payments.rows[0]?.total_paid || '0')
      const totalPrice = parseFloat(booking.total_price || '0')
      
      let newPaymentStatus = 'partial'
      if (totalPaid >= totalPrice) {
        newPaymentStatus = 'paid'
      } else if (totalPaid <= 0) {
        newPaymentStatus = 'pending'
      }

      // 3. Actualizar la reserva
      await client.query(`
        UPDATE bookings
        SET payment_status = $1, updated_at = NOW()
        WHERE id = $2
      `, [newPaymentStatus, bookingId])
    })

    return NextResponse.json({
      success: true,
      message: 'Pago manual registrado exitosamente'
    })

  } catch (error) {
    console.error('Error registrando pago manual:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: (error as Error).message
    }, { status: 500 })
  }
}
