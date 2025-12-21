/**
 * AmadeusCitySearch Service
 * Integración con Amadeus City Search API
 *
 * Documentación: https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/city-search
 */

interface AmadeusAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface AmadeusCity {
  type: string
  name: string
  iataCode: string
  subType?: string
  address?: {
    countryCode: string
    stateCode?: string
  }
  geoCode?: {
    latitude: number
    longitude: number
  }
  timeZone?: string
}

interface CitySearchResult {
  id: string
  name: string
  country: string
  iataCode: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  timezone?: string
  airports?: Array<{
    name: string
    code: string
  }>
}

export class AmadeusCitySearchService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(apiKey: string, apiSecret: string, sandbox: boolean = true) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.baseUrl = sandbox
      ? 'https://test.api.amadeus.com'
      : 'https://api.amadeus.com'
  }

  /**
   * Obtener token de acceso OAuth2
   */
  private async getAccessToken(): Promise<string> {
    // Si ya tenemos un token válido, reutilizarlo
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret
        })
      })

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.statusText}`)
      }

      const data: AmadeusAuthResponse = await response.json()
      this.accessToken = data.access_token
      // Expirar 5 minutos antes del tiempo real
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

      return this.accessToken
    } catch (error) {
      console.error('Amadeus auth error:', error)
      throw error
    }
  }

  /**
   * Buscar ciudades por nombre o código
   *
   * @param keyword - Nombre de ciudad o código IATA
   * @param max - Número máximo de resultados (default: 10)
   */
  async searchCities(keyword: string, max: number = 10): Promise<CitySearchResult[]> {
    try {
      const token = await this.getAccessToken()

      const params = new URLSearchParams({
        keyword: keyword,
        max: max.toString(),
        include: 'AIRPORTS'
      })

      const response = await fetch(
        `${this.baseUrl}/v1/reference-data/locations/cities?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`City search failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Transformar respuesta de Amadeus a nuestro formato
      return (data.data || []).map((city: AmadeusCity) => ({
        id: city.iataCode,
        name: city.name,
        country: city.address?.countryCode || '',
        iataCode: city.iataCode,
        coordinates: city.geoCode ? {
          latitude: city.geoCode.latitude,
          longitude: city.geoCode.longitude
        } : undefined,
        timezone: city.timeZone
      }))
    } catch (error) {
      console.error('Amadeus city search error:', error)
      return []
    }
  }

  /**
   * Obtener información detallada de una ciudad
   *
   * @param cityCode - Código IATA de la ciudad
   */
  async getCityInfo(cityCode: string): Promise<CitySearchResult | null> {
    try {
      const results = await this.searchCities(cityCode, 1)
      return results[0] || null
    } catch (error) {
      console.error('Error getting city info:', error)
      return null
    }
  }

  /**
   * Buscar aeropuertos en una ciudad
   *
   * @param cityCode - Código IATA de la ciudad
   */
  async getAirports(cityCode: string): Promise<Array<{ name: string; code: string }>> {
    try {
      const token = await this.getAccessToken()

      const params = new URLSearchParams({
        subType: 'AIRPORT',
        keyword: cityCode
      })

      const response = await fetch(
        `${this.baseUrl}/v1/reference-data/locations?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()

      return (data.data || []).map((airport: any) => ({
        name: airport.name,
        code: airport.iataCode
      }))
    } catch (error) {
      console.error('Error getting airports:', error)
      return []
    }
  }

  /**
   * Buscar puntos de interés (POI) en una ciudad
   * Requiere coordenadas de la ciudad
   *
   * @param latitude - Latitud
   * @param longitude - Longitud
   * @param radius - Radio de búsqueda en km (default: 5)
   */
  async getPointsOfInterest(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<Array<{ name: string; category: string; location: string }>> {
    try {
      const token = await this.getAccessToken()

      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString()
      })

      const response = await fetch(
        `${this.baseUrl}/v1/reference-data/locations/pois?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()

      return (data.data || []).map((poi: any) => ({
        name: poi.name,
        category: poi.category,
        location: `${poi.geoCode?.latitude}, ${poi.geoCode?.longitude}`
      }))
    } catch (error) {
      console.error('Error getting POIs:', error)
      return []
    }
  }
}

/**
 * Función helper para crear instancia del servicio
 */
export function createAmadeusCitySearch(): AmadeusCitySearchService | null {
  const apiKey = process.env.AMADEUS_API_KEY || process.env.NEXT_PUBLIC_AMADEUS_API_KEY
  const apiSecret = process.env.AMADEUS_API_SECRET || process.env.NEXT_PUBLIC_AMADEUS_API_SECRET
  const sandbox = process.env.AMADEUS_SANDBOX !== 'false'

  if (!apiKey || !apiSecret) {
    console.warn('Amadeus credentials not configured')
    return null
  }

  return new AmadeusCitySearchService(apiKey, apiSecret, sandbox)
}

export default AmadeusCitySearchService
