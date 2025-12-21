import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

interface AmadeusAuthToken {
  access_token: string
  expires_in: number
  token_type: string
}

interface AmadeusActivity {
  id: string
  type: string
  self: {
    href: string
    methods: string[]
  }
  name: string
  shortDescription: string
  description?: string
  geoCode: {
    latitude: number
    longitude: number
  }
  rating?: string
  pictures: string[]
  bookingLink: string
  price: {
    currencyCode: string
    amount: string
  }
  minimumDuration?: string
  locationId?: string
  location?: {
    address: string
    city: string
    country: string
  }
}

/**
 * Adapter para Amadeus Tours and Activities API
 * Documentación: https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities
 *
 * Capacidades:
 * - Buscar actividades por ubicación (lat/long, ciudad)
 * - 300,000+ actividades de Viator y GetYourGuide
 * - Incluye fotos, descripciones, ratings
 * - Deep link para booking directo con proveedor
 */
export class AmadeusActivitiesAdapter extends BaseProviderAdapter {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor(clientId: string, clientSecret: string, useSandbox: boolean = true) {
    const endpoint = useSandbox
      ? 'https://test.api.amadeus.com'
      : 'https://api.amadeus.com'

    super('amadeus-activities', endpoint, clientId)

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.isSandbox = useSandbox
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const authEndpoint = this.isSandbox
        ? 'https://test.api.amadeus.com/v1/security/oauth2/token'
        : 'https://api.amadeus.com/v1/security/oauth2/token'

      console.log(`🔐 Authenticating Amadeus Activities API...`)

      const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Amadeus auth failed: ${response.status} - ${errorText}`)
      }

      const data: AmadeusAuthToken = await response.json()

      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000

      console.log('✅ Amadeus Activities authentication successful')
      return this.accessToken
    } catch (error) {
      console.error('❌ Error in getAccessToken:', error)
      this.logError('getAccessToken', error)
      throw error
    }
  }

  /**
   * Buscar actividades por coordenadas geográficas
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 AmadeusActivitiesAdapter.search() - Starting activities search')

      this.validateRequiredParams(params, ['latitude', 'longitude'])

      await this.checkRateLimit()

      const token = await this.getAccessToken()

      const searchParams = new URLSearchParams({
        latitude: params.latitude!.toString(),
        longitude: params.longitude!.toString(),
        radius: (params.radius || 20).toString() // Radio en km
      })

      const url = `/v1/shopping/activities?${searchParams}`
      console.log(`📡 Making request to Amadeus Activities: ${url}`)

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log(`✅ Amadeus Activities response received. Activities: ${response.data?.length || 0}`)

      const normalized = this.normalizeActivityResults(response.data || [])
      console.log(`✅ Normalized ${normalized.length} activity results`)

      return normalized

    } catch (error) {
      console.error('❌ Error in AmadeusActivitiesAdapter.search():', error)
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Buscar actividades por nombre de ciudad
   */
  async searchByCity(cityName: string, radius: number = 20): Promise<SearchResult[]> {
    try {
      console.log(`🔍 Searching activities in ${cityName}`)

      // Primero necesitamos obtener las coordenadas de la ciudad
      // Esto requeriría integración con City Search API o geocoding
      // Por ahora retornamos vacío y logging

      console.log('⚠️ City-based search requires geocoding integration')
      return []

    } catch (error) {
      console.error('Error searching by city:', error)
      return []
    }
  }

  /**
   * Obtener detalles de una actividad específica
   */
  async getActivityById(activityId: string): Promise<any> {
    try {
      const token = await this.getAccessToken()

      const url = `/v1/shopping/activities/${activityId}`

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      return response.data
    } catch (error) {
      this.logError('getActivityById', error)
      throw error
    }
  }

  /**
   * Normalizar resultados
   */
  private normalizeActivityResults(activities: AmadeusActivity[]): SearchResult[] {
    return activities.map(activity => {
      return {
        id: activity.id,
        provider: this.providerName,
        type: 'activity',
        price: parseFloat(activity.price.amount),
        currency: activity.price.currencyCode,
        details: {
          name: activity.name,
          shortDescription: activity.shortDescription,
          description: activity.description,
          location: {
            latitude: activity.geoCode.latitude,
            longitude: activity.geoCode.longitude,
            address: activity.location?.address,
            city: activity.location?.city,
            country: activity.location?.country
          },
          rating: activity.rating,
          pictures: activity.pictures,
          bookingLink: activity.bookingLink, // Deep link a Viator/GetYourGuide
          minimumDuration: activity.minimumDuration,
          price: {
            amount: activity.price.amount,
            currency: activity.price.currencyCode
          }
        },
        rawData: activity,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      }
    })
  }

  async getDetails(activityId: string): Promise<any> {
    return this.getActivityById(activityId)
  }

  async createBooking(data: BookingData): Promise<BookingConfirmation> {
    // Amadeus Activities API no tiene booking directo
    // El booking se hace via deep link al proveedor (Viator/GetYourGuide)

    return {
      bookingReference: 'REDIRECT_TO_PROVIDER',
      provider: this.providerName,
      status: 'redirect',
      details: {
        message: 'Booking must be completed with activity provider',
        bookingLink: data.bookingLink,
        provider: data.activityProvider
      },
      rawData: data
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    // No hay cancelación directa, se hace con el proveedor
    return {
      success: false,
      message: 'Cancellation must be done through activity provider (Viator/GetYourGuide)'
    }
  }

  async checkAvailability(activityId: string): Promise<boolean> {
    try {
      const details = await this.getActivityById(activityId)
      return details !== null
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }
}

export default AmadeusActivitiesAdapter
