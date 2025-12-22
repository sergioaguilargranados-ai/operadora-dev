import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

/**
 * GET /api/corporate/policies
 * Obtener política de viaje del tenant
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const policy = await CorporateService.getPolicy(parseInt(tenantId))

    if (!policy) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No hay política configurada'
      })
    }

    return NextResponse.json({
      success: true,
      data: policy
    })

  } catch (error: any) {
    console.error('Error fetching policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener política',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/corporate/policies
 * Crear o actualizar política de viaje
 *
 * Body:
 * {
 *   tenantId: number
 *   maxFlightClass?: 'economy' | 'business' | 'first'
 *   maxHotelPrice?: number
 *   minAdvanceDays?: number
 *   requiresApproval?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenantId,
      maxFlightClass,
      maxHotelPrice,
      minAdvanceDays,
      requiresApproval
    } = body

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const policy = await CorporateService.upsertPolicy(
      parseInt(tenantId),
      {
        maxFlightClass,
        maxHotelPrice: maxHotelPrice ? parseFloat(maxHotelPrice) : undefined,
        minAdvanceDays: minAdvanceDays ? parseInt(minAdvanceDays) : undefined,
        requiresApproval
      }
    )

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Política guardada exitosamente'
    })

  } catch (error: any) {
    console.error('Error saving policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al guardar política',
        details: error.message
      },
      { status: 500 }
    )
  }
}
