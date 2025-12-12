import { query, queryOne, queryMany, insertOne } from '@/lib/db'
import crypto from 'crypto'

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
   * Buscar vuelos (preparado para múltiples proveedores)
   */
  async searchFlights(params: {
    origin: string
    destination: string
    departure_date: string
    return_date?: string
    adults: number
    children?: number
    cabin_class?: string
  }): Promise<SearchResult[]> {
    // Generar hash de búsqueda
    const searchHash = this.generateSearchHash(params as any)

    // Intentar obtener desde cache
    const cached = await this.getFlightSearchCache(searchHash)

    if (cached) {
      return cached.results.map((r: any) => ({ ...r, cached: true }))
    }

    // TODO: Aquí irán las llamadas a los proveedores (Amadeus, Kiwi, etc)
    // Por ahora retornamos array vacío
    const results: SearchResult[] = []

    // Guardar en cache (15 minutos)
    if (results.length > 0) {
      await this.saveFlightSearchCache(searchHash, params, results)
    }

    return results
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
