import { NextRequest, NextResponse } from 'next/server'
import { queryPaginated } from '@/lib/db'
import CurrencyService from '@/services/CurrencyService'
import type { Hotel } from '@/types'
import { successResponse, errorResponse } from '@/types/api-response'

function minimalHotel(hotel: any) {
  return {
    id: hotel.id,
    name: hotel.name || hotel.details?.name,
    city: hotel.city,
    location: hotel.location || hotel.details?.address,
    rating: hotel.rating || hotel.details?.rating || null,
    starRating: hotel.star_rating || hotel.details?.starRating || null,
    price_per_night: hotel.price_per_night,
    currency: hotel.currency,
    image_url: hotel.image_url || hotel.main_image || (Array.isArray(hotel.images) ? hotel.images[0] : null),
  }
}

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
    const view = (searchParams.get('view') || '').toLowerCase() // 'compact' para móvil

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

      baseQuery += ` AND (\n        LOWER(city) LIKE LOWER($${paramIndex})\n        OR LOWER(translate(city, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER($${paramIndex + 1})\n      )`
      params.push(`%${city}%`, `%${normalizedCity}%`)
      paramIndex += 2
    }

    if (destination) {
      const normalizedDest = destination
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      baseQuery += ` AND (\n        LOWER(city) LIKE LOWER($${paramIndex})\n        OR LOWER(location) LIKE LOWER($${paramIndex})\n        OR LOWER(translate(city, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER($${paramIndex + 1})\n        OR LOWER(translate(location, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE LOWER($${paramIndex + 1})\n      )`
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
    let hotels = result.data
    let exchangeRate = 1.0

    if (currency !== 'MXN') {
      const rateData = await CurrencyService.getLatestExchangeRate('MXN', currency)
      exchangeRate = rateData?.rate || 1.0

      hotels = result.data.map(hotel => ({
        ...hotel,
        price_per_night: Math.round(hotel.price_per_night * exchangeRate * 100) / 100,
        original_price: hotel.price_per_night,
        original_currency: hotel.currency,
        currency: currency
      }))
    }

    // Si se solicita vista compacta, reducir payload al mínimo necesario
    const data = view === 'compact' ? hotels.map(minimalHotel) : hotels

    return NextResponse.json(
      successResponse(data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.page < result.totalPages,
      }),
      { headers: { 'X-API-Version': '1.0' } }
    )

  } catch (error) {
    console.error('Error obteniendo hoteles:', error)
    return NextResponse.json(
      errorResponse('HOTELS_ERROR', 'Error al obtener hoteles'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
