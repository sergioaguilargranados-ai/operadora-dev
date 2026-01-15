import { NextRequest, NextResponse } from 'next/server'
import CurrencyService from '@/services/CurrencyService'

/**
 * GET /api/currencies
 * Obtener todas las monedas disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Obtener todas las monedas
    if (!action || action === 'list') {
      const currencies = await CurrencyService.getAllCurrencies()

      return NextResponse.json({
        success: true,
        data: currencies
      })
    }

    // Obtener tipos de cambio
    if (action === 'rates') {
      const base = searchParams.get('base') || 'MXN'
      const targets = searchParams.get('targets')?.split(',') || ['USD', 'EUR', 'CAD']

      const rates = await CurrencyService.getExchangeRatesForCurrencies(base, targets)

      return NextResponse.json({
        success: true,
        data: {
          base,
          rates,
          date: new Date().toISOString()
        }
      })
    }

    // Convertir monto
    if (action === 'convert') {
      const amount = parseFloat(searchParams.get('amount') || '0')
      const from = searchParams.get('from') || 'MXN'
      const to = searchParams.get('to') || 'USD'

      if (!amount || amount <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid amount'
        }, { status: 400 })
      }

      const result = await CurrencyService.convert(amount, from, to)

      return NextResponse.json({
        success: true,
        data: {
          original: {
            amount,
            currency: from
          },
          converted: {
            amount: result.amount,
            currency: to
          },
          rate: result.rate,
          date: result.date
        }
      })
    }

    // Acción no válida
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in currencies API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/currencies/update-rates
 * Actualizar tipos de cambio desde API externa
 * Solo para administradores
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar que el usuario sea admin
    // const token = request.headers.get('authorization')
    // const user = await verifyToken(token)
    // if (user.role !== 'admin') return unauthorized

    const needsUpdate = await CurrencyService.needsUpdate()

    if (!needsUpdate) {
      return NextResponse.json({
        success: true,
        message: 'Exchange rates are up to date',
        updated: 0
      })
    }

    const updated = await CurrencyService.updateExchangeRates()

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} exchange rates`,
      updated
    })

  } catch (error) {
    console.error('Error updating exchange rates:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update exchange rates'
    }, { status: 500 })
  }
}
