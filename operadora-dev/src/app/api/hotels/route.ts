import { NextRequest, NextResponse } from 'next/server'
import { queryPaginated } from '@/lib/db'
import CurrencyService from '@/services/CurrencyService'
import type { Hotel } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parámetros de búsqueda
    const city = searchParams.get('city')
    const destination = searchParams.get('destination')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const amenities = searchParams.get('amenities')?.split(',')
    const starRating = searchParams.get('starRating')

    // Paginación
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const orderBy = searchParams.get('orderBy') || 'rating'
    const orderDirection = (searchParams.get('orderDirection') || 'DESC') as 'ASC' | 'DESC'

    // Conversión de moneda
    const currency = searchParams.get('currency') || 'MXN'

    // Construir query dinámicamente
    let baseQuery = 'SELECT * FROM hotels WHERE is_active = true'
    const params: any[] = []
    let paramIndex = 1

    if (city) {
      // Búsqueda flexible: quita acentos y busca en minúsculas
      const normalizedCity = city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      baseQuery += ` AND (
        LOWER(city) LIKE LOWER(${paramIndex})
        OR LOWER(translate(city, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER(${paramIndex + 1})
      )`
      params.push(`%${city}%`, `%${normalizedCity}%`)
      paramIndex += 2
    }

    if (destination) {
      const normalizedDest = destination
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      baseQuery += ` AND (
        LOWER(city) LIKE LOWER(${paramIndex})
        OR LOWER(location) LIKE LOWER(${paramIndex})
        OR LOWER(translate(city, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER(${paramIndex + 1})
        OR LOWER(translate(location, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER(${paramIndex + 1})
      )`
      params.push(`%${destination}%`, `%${normalizedDest}%`)
      paramIndex += 2
    }

    if (minPrice) {
      baseQuery += ` AND price_per_night >= $${paramIndex}`
      params.push(parseFloat(minPrice))
      paramIndex++
    }

    if (maxPrice) {
      baseQuery += ` AND price_per_night <= $${paramIndex}`
      params.push(parseFloat(maxPrice))
      paramIndex++
    }

    if (minRating) {
      baseQuery += ` AND rating >= $${paramIndex}`
      params.push(parseFloat(minRating))
      paramIndex++
    }

    if (starRating) {
      baseQuery += ` AND star_rating = $${paramIndex}`
      params.push(parseInt(starRating, 10))
      paramIndex++
    }

    // Filtro por amenidades (usando ARRAY contains)
    if (amenities && amenities.length > 0) {
      for (const amenity of amenities) {
        baseQuery += ` AND $${paramIndex} = ANY(amenities)`
        params.push(amenity)
        paramIndex++
      }
    }

    // Ejecutar query con paginación
    const result = await queryPaginated<Hotel>(
      baseQuery,
      params,
      { page, limit, orderBy, orderDirection }
    )

    // Convertir precios a moneda solicitada si no es MXN
    let convertedHotels = result.data
    let exchangeRate = 1.0

    if (currency !== 'MXN') {
      const rateData = await CurrencyService.getLatestExchangeRate('MXN', currency)
      exchangeRate = rateData?.rate || 1.0

      convertedHotels = result.data.map(hotel => ({
        ...hotel,
        price_per_night: Math.round(hotel.price_per_night * exchangeRate * 100) / 100,
        original_price: hotel.price_per_night,
        original_currency: hotel.currency,
        currency: currency
      }))
    }

    return NextResponse.json({
      success: true,
      data: convertedHotels,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      currency,
      exchangeRate: currency !== 'MXN' ? exchangeRate : undefined
    })

  } catch (error) {
    console.error('Error obteniendo hoteles:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener hoteles'
    }, { status: 500 })
  }
}
