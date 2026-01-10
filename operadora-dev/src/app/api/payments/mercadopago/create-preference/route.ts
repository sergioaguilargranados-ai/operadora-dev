/**
 * API Route: POST /api/payments/mercadopago/create-preference
 * Crear preferencia de pago de Mercado Pago
 */

import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/services/MercadoPagoService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      bookingId,
      userId,
      tenantId,
      amount,
      currency,
      title,
      description,
      returnUrl
    } = body

    // Validaciones
    if (!bookingId || !amount || !title) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: bookingId, amount, title' },
        { status: 400 }
      )
    }

    // Crear preferencia
    const preference = await MercadoPagoService.createPreference({
      bookingId: parseInt(bookingId),
      userId: userId || 1,
      tenantId: tenantId || 1,
      amount: parseFloat(amount),
      currency: currency || 'MXN',
      title,
      description,
      returnUrl
    })

    return NextResponse.json({
      success: true,
      preferenceId: preference.preferenceId,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint
    })

  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error)

    return NextResponse.json(
      { error: error.message || 'Error al crear preferencia de pago' },
      { status: 500 }
    )
  }
}
