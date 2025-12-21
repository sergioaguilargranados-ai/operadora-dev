import { query, queryOne, queryMany, insertOne } from '@/lib/db'
import crypto from 'crypto'
import AmadeusAdapter from './providers/AmadeusAdapter'
import AmadeusHotelAdapter from './providers/AmadeusHotelAdapter'
import AmadeusTransferAdapter from './providers/AmadeusTransferAdapter'
import AmadeusActivitiesAdapter from './providers/AmadeusActivitiesAdapter'

export interface SearchParams {
  search_type: 'flight' | 'hotel' | 'package' | 'attraction'
  destination?: string
  origin?: string
  check_in?: string
  check_out?: string
  adults?: number
  children?: number
  rooms?: number
  [key: string]: any
}

export interface SearchResult {
  id: string
  type: string
  provider: string
  price: number
  currency: string
  details: any
  cached: boolean
}

class SearchService {
  // Inicializar adapters de Amadeus
  private amadeusFlights: AmadeusAdapter
  private amadeusHotels: AmadeusHotelAdapter
  private amadeusTransfers: AmadeusTransferAdapter
  private amadeusActivities: AmadeusActivitiesAdapter

  constructor() {
    const apiKey = process.env.AMADEUS_API_KEY || ''
    const apiSecret = process.env.AMADEUS_API_SECRET || ''
    const useSandbox = process.env.AMADEUS_ENVIRONMENT !== 'production'

    this.amadeusFlights = new AmadeusAdapter(apiKey, apiSecret, useSandbox)
    this.amadeusHotels = new AmadeusHotelAdapter(apiKey, apiSecret, useSandbox)
    this.amadeusTransfers = new AmadeusTransferAdapter(apiKey, apiSecret, useSandbox)
    this.amadeusActivities = new AmadeusActivitiesAdapter(apiKey, apiSecret, useSandbox)
  }

  /**
   * Generar hash único para una búsqueda
   */
  private generateSearchHash(params: SearchParams): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return crypto.createHash('md5').update(sortedParams).digest('hex')
  }

  /**
   * Guardar búsqueda en historial
   */
  async saveSearch(userId: number | null, params: SearchParams): Promise<void> {
    try {
      await insertOne('searches', {
        user_id: userId,
        session_id: userId ? null : crypto.randomUUID(),
        search_type: params.search_type,
        destination: params.destination,
        origin: params.origin,
        check_in: params.check_in,
        check_out: params.check_out,
        adults: params.adults,
        children: params.children,
        rooms: params.rooms,
        search_params: JSON.stringify(params)
      })
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  /**
   * Obtener historial de búsquedas del usuario
   */
  async getSearchHistory(
    userId: number,
    searchType?: string,
    limit: number = 10
  ): Promise<any[]> {
    let queryText = `
      SELECT * FROM searches
      WHERE user_id = $1
    `
    const params: any[] = [userId]

    if (searchType) {
      queryText += ' AND search_type = $2'
      params.push(searchType)
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)

    return queryMany(queryText, params)
  }

  /**
   * Buscar vuelos usando Amadeus como proveedor principal
   */
  async searchFlights(params: {
    origin: string
    destination: string
    departure_date: string
    return_date?: string
    adults: number
    children?: number
    cabin_class?: string
    includedAirlineCodes?: string
    excludedAirlineCodes?: string
  }): Promise<SearchResult[]> {
    const searchHash = this.generateSearchHash(params as any)
    const cached = await this.getFlightSearchCache(searchHash)

    if (cached) {
      return cached.results.map((r: any) => ({ ...r, cached: true }))
    }

    try {
      console.log('🔍 Searching flights with Amadeus...')

      const amadeusParams = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departure_date,
        returnDate: params.return_date,
        adults: params.adults,
        children: params.children || 0,
        travelClass: params.cabin_class,
        includedAirlineCodes: params.includedAirlineCodes,
        excludedAirlineCodes: params.excludedAirlineCodes,
        maxResults: 50
      }

      const results = await this.amadeusFlights.search(amadeusParams)

      if (results.length > 0) {
        await this.saveFlightSearchCache(searchHash, params, results)
      }

      return results

    } catch (error) {
      console.error('❌ Error searching flights:', error)
      return []
    }
  }

  /**
   * Buscar hoteles - Amadeus principal + Booking.com complementario
   */
  async searchHotels(params: {
    city: string
    cityCode?: string
    checkInDate: string
    checkOutDate: string
    adults: number
    children?: number
    rooms?: number
    currency?: string
  }): Promise<SearchResult[]> {
    try {
      console.log('🏨 Searching hotels with Amadeus (primary)...')

      // Obtener cityCode si no se proporciona
      const cityCode = params.cityCode || await this.getCityCode(params.city)

      if (!cityCode) {
        console.error('❌ Could not determine city code')
        return []
      }

      const amadeusParams = {
        cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults,
        children: params.children || 0,
        rooms: params.rooms || 1,
        currency: params.currency || 'MXN'
      }

      const amadeusResults = await this.amadeusHotels.search(amadeusParams)

      console.log(`✅ Amadeus returned ${amadeusResults.length} hotels`)

      // Si hay menos de 10 resultados, complementar con Booking.com (futuro)
      if (amadeusResults.length < 10) {
        console.log('⚠️ Less than 10 results, consider adding Booking.com fallback')
        // TODO: Implementar BookingAdapter y merge aquí
      }

      // Ordenar por precio
      return amadeusResults.sort((a, b) => a.price - b.price)

    } catch (error) {
      console.error('❌ Error searching hotels:', error)
      return []
    }
  }

  /**
   * Buscar transfers (autos privados/compartidos/taxis)
   */
  async searchTransfers(params: {
    startLocationCode: string
    endLocationCode: string
    transferDate: string
    transferTime: string
    passengers: number
    transferType?: string
  }): Promise<SearchResult[]> {
    try {
      console.log('🚗 Searching transfers with Amadeus...')

      const results = await this.amadeusTransfers.search({
        startLocationCode: params.startLocationCode,
        endLocationCode: params.endLocationCode,
        transferDate: params.transferDate,
        transferTime: params.transferTime,
        passengers: params.passengers,
        transferType: params.transferType
      })

      console.log(`✅ Found ${results.length} transfer options`)

      return results.sort((a, b) => a.price - b.price)

    } catch (error) {
      console.error('❌ Error searching transfers:', error)
      return []
    }
  }

  /**
   * Buscar actividades y tours
   */
  async searchActivities(params: {
    latitude: number
    longitude: number
    radius?: number
  }): Promise<SearchResult[]> {
    try {
      console.log('🎭 Searching activities with Amadeus...')

      const results = await this.amadeusActivities.search({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 20
      })

      console.log(`✅ Found ${results.length} activities`)

      return results.sort((a, b) => a.price - b.price)

    } catch (error) {
      console.error('❌ Error searching activities:', error)
      return []
    }
  }

  /**
   * Obtener código IATA de ciudad a partir del nombre
   */
  private async getCityCode(cityName: string): Promise<string | null> {
    const cityMapping: Record<string, string> = {
      'cancun': 'CUN',
      'cancún': 'CUN',
      'ciudad de mexico': 'MEX',
      'cdmx': 'MEX',
      'mexico city': 'MEX',
      'guadalajara': 'GDL',
      'monterrey': 'MTY',
      'cabo': 'SJD',
      'los cabos': 'SJD',
      'puerto vallarta': 'PVR',
      'vallarta': 'PVR',
      'paris': 'PAR',
      'london': 'LON',
      'londres': 'LON',
      'new york': 'NYC',
      'nueva york': 'NYC',
      'madrid': 'MAD',
      'barcelona': 'BCN',
      'rome': 'ROM',
      'roma': 'ROM',
      'miami': 'MIA',
      'los angeles': 'LAX'
    }

    const normalized = cityName.toLowerCase().trim()
    return cityMapping[normalized] || null
  }

  /**
   * Merge y deduplicar resultados de múltiples proveedores
   */
  private mergeAndDeduplicateHotels(
    amadeusResults: SearchResult[],
    bookingResults: SearchResult[]
  ): SearchResult[] {
    const allResults = [...amadeusResults, ...bookingResults]
    const seen = new Set<string>()
    const unique: SearchResult[] = []

    for (const result of allResults) {
      // Crear clave única basada en nombre del hotel y ubicación
      const key = `${result.details.hotelName}-${result.details.location?.latitude}-${result.details.location?.longitude}`

      if (!seen.has(key)) {
        seen.add(key)
        unique.push(result)
      }
    }

    return unique.sort((a, b) => a.price - b.price)
  }

  /**
   * Obtener cache de búsqueda de vuelos
   */
  private async getFlightSearchCache(searchHash: string): Promise<any | null> {
    const cached = await queryOne(
      `SELECT * FROM flight_search_cache
       WHERE search_hash = $1
       AND expires_at > NOW()`,
      [searchHash]
    )

    if (cached) {
      return {
        results: cached.results,
        provider: cached.provider,
        cached_at: cached.cached_at
      }
    }

    return null
  }

  /**
   * Guardar búsqueda de vuelos en cache
   */
  private async saveFlightSearchCache(
    searchHash: string,
    params: any,
    results: SearchResult[]
  ): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutos

      await insertOne('flight_search_cache', {
        search_hash: searchHash,
        origin_code: params.origin,
        destination_code: params.destination,
        departure_date: params.departure_date,
        return_date: params.return_date,
        adults: params.adults,
        children: params.children || 0,
        cabin_class: params.cabin_class,
        results: JSON.stringify(results),
        provider: 'aggregated',
        expires_at: expiresAt.toISOString()
      })
    } catch (error) {
      console.error('Error saving flight cache:', error)
    }
  }

  /**
   * Limpiar cache expirado
   */
  async cleanExpiredCache(): Promise<number> {
    // Limpiar flight cache
    const flightResult = await query(
      'DELETE FROM flight_search_cache WHERE expires_at < NOW()'
    )

    // Limpiar hotel cache
    const hotelResult = await query(
      'DELETE FROM hotel_availability_cache WHERE expires_at < NOW()'
    )

    return (flightResult.rowCount ?? 0) + (hotelResult.rowCount ?? 0)
  }

  /**
   * Obtener búsquedas recientes (para sugerencias)
   */
  async getPopularDestinations(limit: number = 10): Promise<any[]> {
    return queryMany(
      `SELECT destination, COUNT(*) as search_count
       FROM searches
       WHERE destination IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY destination
       ORDER BY search_count DESC
       LIMIT $1`,
      [limit]
    )
  }

  /**
   * Obtener tendencias de búsqueda
   */
  async getSearchTrends(days: number = 7): Promise<any[]> {
    return queryMany(
      `SELECT
         DATE(created_at) as date,
         search_type,
         COUNT(*) as total_searches
       FROM searches
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at), search_type
       ORDER BY date DESC, total_searches DESC`
    )
  }
}

export default new SearchService()
