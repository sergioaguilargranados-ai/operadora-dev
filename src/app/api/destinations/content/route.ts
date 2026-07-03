import { NextRequest, NextResponse } from 'next/server'
import { DestinationContentService } from '@/services/DestinationContentService'

export const maxDuration = 60; // Evitar timeout en Vercel por ser un endpoint de IA

/**
 * GET /api/destinations/content?city=Paris&country=Francia
 * Obtiene el contenido turístico de un destino (genera si no existe en cache)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const country = searchParams.get('country')

    if (!city || !country) {
      // Si no hay ciudad y país, devolver todos los destinos
      const allContent = await DestinationContentService.getAllContent()
      return NextResponse.json({
        success: true,
        data: allContent,
      })
    }

    const content = await DestinationContentService.getContentForCity(city, country)

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error: any) {
    console.error('❌ Error en GET /api/destinations/content:', error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/destinations/content
 * Forzar regeneración de contenido (admin)
 * Body: { city: string, country: string, force?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, country, force } = body

    if (!city || !country) {
      return NextResponse.json(
        { success: false, error: 'Se requiere city y country' },
        { status: 400 }
      )
    }

    // Si force=true, eliminar contenido existente para forzar regeneración
    if (force) {
      const key = DestinationContentService.generateDestinationKey(city, country)
      await DestinationContentService.deleteContent(key)
      console.log(`🔄 Contenido eliminado para regeneración forzada: ${key}`)
    }

    const content = await DestinationContentService.getContentForCity(city, country)

    return NextResponse.json({
      success: true,
      data: content,
      message: 'Contenido generado correctamente',
    })
  } catch (error: any) {
    console.error('❌ Error en POST /api/destinations/content:', error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
