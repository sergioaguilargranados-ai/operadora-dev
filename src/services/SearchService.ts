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
  cached?: boolean
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
   * Auto-crea la ciudad en BD si no existe
   */
  private async getCityCode(cityName: string): Promise<string | null> {
    try {
      const normalizedName = this.normalizeCityName(cityName)

      // 1. Buscar en la base de datos
      const city = await queryOne(
        'SELECT city_code FROM cities WHERE normalized_name = $1 LIMIT 1',
        [normalizedName]
      )

      if (city && city.city_code) {
        console.log(`✓ Ciudad encontrada en BD: ${cityName} → ${city.city_code}`)
        return city.city_code
      }

      // 2. Si no existe, intentar en mapeo estático (legacy)
      const staticCode = this.getStaticCityCode(normalizedName)

      if (staticCode) {
        // Guardar en BD para futuras búsquedas
        await this.saveCityToDB(cityName, staticCode)
        return staticCode
      }

      // 3. Si no está en ningún lado, crear con código genérico
      console.log(`⚠️ Ciudad no encontrada: ${cityName}, creando entrada...`)
      const generatedCode = await this.createCityEntry(cityName)

      return generatedCode

    } catch (error) {
      console.error('❌ Error obteniendo city code:', error)
      return null
    }
  }

  /**
   * Normalizar nombre de ciudad (lowercase, sin acentos)
   */
  private normalizeCityName(cityName: string): string {
    return cityName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
  }

  /**
   * Buscar en mapeo estático (legacy - para migración)
   */
  private getStaticCityCode(normalizedName: string): string | null {
    const cityMapping: Record<string, string> = {
      // México - Principales
      'cancun': 'CUN',
      'cancún': 'CUN',
      'ciudad de mexico': 'MEX',
      'cdmx': 'MEX',
      'mexico city': 'MEX',
      'guadalajara': 'GDL',
      'monterrey': 'MTY',
      'cabo': 'SJD',
      'los cabos': 'SJD',
      'san jose del cabo': 'SJD',
      'puerto vallarta': 'PVR',
      'vallarta': 'PVR',

      // México - Otros destinos turísticos
      'acapulco': 'ACA',
      'aguascalientes': 'AGU',
      'campeche': 'CPE',
      'chetumal': 'CTM',
      'chihuahua': 'CUU',
      'ciudad juarez': 'CJS',
      'ciudad obregon': 'CEN',
      'colima': 'CLQ',
      'cozumel': 'CZM',
      'culiacan': 'CUL',
      'culiacán': 'CUL',
      'durango': 'DGO',
      'ensenada': 'ESE',
      'hermosillo': 'HMO',
      'huatulco': 'HUX',
      'ixtapa': 'ZIH',
      'zihuatanejo': 'ZIH',
      'la paz': 'LAP',
      'leon': 'BJX',
      'león': 'BJX',
      'bajio': 'BJX',
      'loreto': 'LTO',
      'los mochis': 'LMM',
      'manzanillo': 'ZLO',
      'matamoros': 'MAM',
      'mazatlan': 'MZT',
      'mazatlán': 'MZT',
      'merida': 'MID',
      'mérida': 'MID',
      'mexicali': 'MXL',
      'morelia': 'MLM',
      'nogales': 'NOG',
      'nuevo laredo': 'NLD',
      'oaxaca': 'OAX',
      'pachuca': 'PAC',
      'playa del carmen': 'PCM',
      'puebla': 'PBC',
      'queretaro': 'QRO',
      'querétaro': 'QRO',
      'reynosa': 'REX',
      'saltillo': 'SLW',
      'san luis potosi': 'SLP',
      'san luis potosí': 'SLP',
      'tampico': 'TAM',
      'tapachula': 'TAP',
      'tepic': 'TPQ',
      'tijuana': 'TIJ',
      'toluca': 'TLC',
      'torreon': 'TRC',
      'torreón': 'TRC',
      'tuxtla gutierrez': 'TGZ',
      'tuxtla gutiérrez': 'TGZ',
      'veracruz': 'VER',
      'villahermosa': 'VSA',
      'zacatecas': 'ZCL',

      // Estados Unidos - Principales
      'new york': 'NYC',
      'nueva york': 'NYC',
      'los angeles': 'LAX',
      'chicago': 'CHI',
      'houston': 'HOU',
      'miami': 'MIA',
      'san francisco': 'SFO',
      'las vegas': 'LAS',
      'orlando': 'ORL',
      'seattle': 'SEA',
      'boston': 'BOS',
      'washington': 'WAS',
      'philadelphia': 'PHL',
      'filadelfia': 'PHL',
      'atlanta': 'ATL',
      'dallas': 'DFW',
      'phoenix': 'PHX',
      'san diego': 'SAN',
      'denver': 'DEN',
      'austin': 'AUS',
      'nashville': 'BNA',
      'portland': 'PDX',
      'minneapolis': 'MSP',
      'detroit': 'DTT',
      'tampa': 'TPA',
      'new orleans': 'MSY',
      'nueva orleans': 'MSY',
      'salt lake city': 'SLC',

      // Europa - Principales
      'paris': 'PAR',
      'parís': 'PAR',
      'london': 'LON',
      'londres': 'LON',
      'madrid': 'MAD',
      'barcelona': 'BCN',
      'rome': 'ROM',
      'roma': 'ROM',
      'amsterdam': 'AMS',
      'ámsterdam': 'AMS',
      'berlin': 'BER',
      'berlín': 'BER',
      'vienna': 'VIE',
      'viena': 'VIE',
      'lisbon': 'LIS',
      'lisboa': 'LIS',
      'athens': 'ATH',
      'atenas': 'ATH',
      'prague': 'PRG',
      'praga': 'PRG',
      'budapest': 'BUD',
      'munich': 'MUC',
      'múnich': 'MUC',
      'milan': 'MIL',
      'milán': 'MIL',
      'venice': 'VCE',
      'venecia': 'VCE',
      'florence': 'FLR',
      'florencia': 'FLR',
      'dublin': 'DUB',
      'dublín': 'DUB',
      'copenhagen': 'CPH',
      'copenhague': 'CPH',
      'stockholm': 'STO',
      'estocolmo': 'STO',
      'oslo': 'OSL',
      'brussels': 'BRU',
      'bruselas': 'BRU',
      'zurich': 'ZRH',
      'zúrich': 'ZRH',
      'geneva': 'GVA',
      'ginebra': 'GVA',
      'edinburgh': 'EDI',
      'edimburgo': 'EDI',
      'manchester': 'MAN',

      // Asia - Principales
      'tokyo': 'TYO',
      'tokio': 'TYO',
      'beijing': 'BJS',
      'pekín': 'BJS',
      'shanghai': 'SHA',
      'shangái': 'SHA',
      'hong kong': 'HKG',
      'singapore': 'SIN',
      'singapur': 'SIN',
      'bangkok': 'BKK',
      'seoul': 'SEL',
      'seúl': 'SEL',
      'dubai': 'DXB',
      'dubái': 'DXB',
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'kuala lumpur': 'KUL',
      'jakarta': 'JKT',
      'manila': 'MNL',
      'taipei': 'TPE',
      'taipei': 'TPE',

      // América Latina - Principales
      'buenos aires': 'BUE',
      'sao paulo': 'SAO',
      'são paulo': 'SAO',
      'rio de janeiro': 'RIO',
      'rio': 'RIO',
      'bogota': 'BOG',
      'bogotá': 'BOG',
      'lima': 'LIM',
      'santiago': 'SCL',
      'caracas': 'CCS',
      'quito': 'UIO',
      'la habana': 'HAV',
      'havana': 'HAV',
      'san juan': 'SJU',
      'panama': 'PTY',
      'panamá': 'PTY',
      'panama city': 'PTY',
      'ciudad de panama': 'PTY',
      'ciudad de panamá': 'PTY',
      'san jose': 'SJO',
      'san josé': 'SJO',
      'guatemala': 'GUA',
      'managua': 'MGA',
      'san salvador': 'SAL',
      'tegucigalpa': 'TGU',
      'santo domingo': 'SDQ',

      // Oceanía
      'sydney': 'SYD',
      'sídney': 'SYD',
      'melbourne': 'MEL',
      'auckland': 'AKL',
      'brisbane': 'BNE',
      'perth': 'PER',

      // Caribe
      'punta cana': 'PUJ',
      'havana': 'HAV',
      'la habana': 'HAV',
      'nassau': 'NAS',
      'montego bay': 'MBJ',
      'kingston': 'KIN',
      'aruba': 'AUA',
      'curacao': 'CUR',
      'curaçao': 'CUR',
      'barbados': 'BGI',
      'st thomas': 'STT',
      'santo tomas': 'STT',
      'san martin': 'SXM',
      'saint martin': 'SXM'
    }

    return cityMapping[normalizedName] || null
  }

  /**
   * Guardar ciudad en base de datos
   */
  private async saveCityToDB(cityName: string, cityCode: string): Promise<void> {
    try {
      await insertOne('cities', {
        name: cityName,
        city_code: cityCode,
        // normalized_name se genera automáticamente con trigger
      })
      console.log(`✓ Ciudad guardada en BD: ${cityName} → ${cityCode}`)
    } catch (error) {
      console.error(`Error guardando ciudad en BD: ${cityName}`, error)
    }
  }

  /**
   * Crear entrada de ciudad con código genérico
   */
  private async createCityEntry(cityName: string): Promise<string> {
    try {
      // Generar código genérico basado en las 3 primeras letras
      const generatedCode = cityName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase()

      await insertOne('cities', {
        name: cityName,
        city_code: generatedCode,
        country: 'Unknown',
        country_code: 'XXX',
        // normalized_name se genera automáticamente con trigger
      })

      console.log(`✓ Ciudad creada automáticamente: ${cityName} → ${generatedCode}`)
      return generatedCode

    } catch (error) {
      console.error(`Error creando ciudad: ${cityName}`, error)
      // Retornar código genérico de fallback
      return cityName.substring(0, 3).toUpperCase()
    }
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
