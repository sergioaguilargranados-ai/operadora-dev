import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itineraryId } = await params

    // Verificar que existe
    const result = await pool.query(
      'SELECT * FROM itineraries WHERE id = $1',
      [itineraryId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Itinerario no encontrado'
      }, { status: 404 })
    }

    const itinerary = result.rows[0]

    // Si ya tiene token, reutilizarlo
    if (itinerary.shared_token) {
      return NextResponse.json({
        success: true,
        shared_token: itinerary.shared_token,
        share_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com'}/itinerary/shared/${itinerary.shared_token}`
      })
    }

    // Generar nuevo token único
    const token = crypto.randomBytes(16).toString('hex')

    // Actualizar itinerario
    await pool.query(
      'UPDATE itineraries SET is_shared = true, shared_token = $1 WHERE id = $2',
      [token, itineraryId]
    )

    return NextResponse.json({
      success: true,
      shared_token: token,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com'}/itinerary/shared/${token}`
    })

  } catch (error: any) {
    console.error('Error generating share token:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itineraryId } = await params

    // Deshabilitar compartir
    await pool.query(
      'UPDATE itineraries SET is_shared = false, shared_token = NULL WHERE id = $1',
      [itineraryId]
    )

    return NextResponse.json({
      success: true,
      message: 'Link de compartir eliminado'
    })

  } catch (error: any) {
    console.error('Error removing share token:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
