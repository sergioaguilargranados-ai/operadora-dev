import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

interface AmadeusAuthToken {
  access_token: string
  expires_in: number
  token_type: string
}

interface AmadeusHotelOffer {
  hotel: {
    hotelId: string
    name: string
    cityCode: string
    latitude: number
    longitude: number
  }
  offers: Array<{
    id: string
    checkInDate: string
    checkOutDate: string
    room: {
      type: string
      typeEstimated: {
        category: string
        beds: number
        bedType: string
      }
      description: {
        text: string
      }
    }
    guests: {
      adults: number
    }
    price: {
      currency: string
      total: string
      base: string
      taxes: Array<{
        amount: string
        currency: string
        code: string
      }>
    }
    policies: {
      cancellation?: {
        description: {
          text: string
        }
      }
      paymentType: string
    }
    boardType?: string
  }>
  available: boolean
}

/**
 * Adapter para Amadeus Hotel API (Principal para hoteles)
 * Documentación: https://developers.amadeus.com/self-service/category/hotels
 *
 * Inventario: 150,000+ hoteles de 350+ cadenas
 * Incluye: Fotos, descripciones, amenidades, ratings
 */
export class AmadeusHotelAdapter extends BaseProviderAdapter {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor(clientId: string, clientSecret: string, useSandbox: boolean = true) {
    const endpoint = useSandbox
      ? 'https://test.api.amadeus.com'
      : 'https://api.amadeus.com'

    super('amadeus-hotel', endpoint, clientId)

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.isSandbox = useSandbox
  }

  /**
   * Obtener token OAuth2
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const authEndpoint = this.isSandbox
        ? 'https://test.api.amadeus.com/v1/security/oauth2/token'
        : 'https://api.amadeus.com/v1/security/oauth2/token'

      console.log(`🔐 Authenticating Amadeus Hotel API...`)

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

      console.log('✅ Amadeus Hotel authentication successful')
      return this.accessToken
    } catch (error) {
      console.error('❌ Error in getAccessToken:', error)
      this.logError('getAccessToken', error)
      throw error
    }
  }

  /**
   * Buscar hoteles por ciudad (paso 1)
   */
  async searchHotelsByCity(cityCode: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken()

      const url = `/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      return response.data || []
    } catch (error) {
      console.error('Error searching hotels by city:', error)
      return []
    }
  }

  /**
   * Búsqueda de ofertas de hoteles (paso 2)
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 AmadeusHotelAdapter.search() - Starting hotel search')

      this.validateRequiredParams(params, [
        'cityCode',
        'checkInDate',
        'checkOutDate',
        'adults'
      ])

      await this.checkRateLimit()

      const token = await this.getAccessToken()

      // Primero buscar hoteles en la ciudad
      const hotels = await this.searchHotelsByCity(params.cityCode!)

      if (!hotels || hotels.length === 0) {
        console.log('⚠️ No hotels found in city')
        return []
      }

      // Tomar los primeros 20 hoteles
      const hotelIds = hotels.slice(0, 20).map((h: any) => h.hotelId).join(',')

      // Buscar ofertas
      const searchParams = new URLSearchParams({
        hotelIds: hotelIds,
        checkInDate: params.checkInDate!,
        checkOutDate: params.checkOutDate!,
        adults: params.adults.toString(),
        roomQuantity: (params.rooms || 1).toString(),
        currency: params.currency || 'MXN',
        bestRateOnly: 'true'
      })

      if (params.children) {
        searchParams.append('childAges', Array(params.children).fill(10).join(','))
      }

      const url = `/v3/shopping/hotel-offers?${searchParams}`
      console.log(`📡 Making request to Amadeus Hotels: ${url}`)

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log(`✅ Amadeus Hotels response received. Offers: ${response.data?.length || 0}`)

      const normalized = this.normalizeHotelResults(response.data || [])
      console.log(`✅ Normalized ${normalized.length} hotel results`)

      return normalized

    } catch (error) {
      console.error('❌ Error in AmadeusHotelAdapter.search():', error)
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Obtener detalles completos de un hotel (con fotos)
   */
  async getHotelDetails(hotelId: string): Promise<any> {
    try {
      const token = await this.getAccessToken()

      const url = `/v3/shopping/hotel-offers/by-hotel?hotelId=${hotelId}`

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      return response.data
    } catch (error) {
      this.logError('getHotelDetails', error)
      throw error
    }
  }

  /**
   * Normalizar resultados a formato estándar
   */
  private normalizeHotelResults(offers: AmadeusHotelOffer[]): SearchResult[] {
    return offers.map(hotelOffer => {
      const hotel = hotelOffer.hotel
      const firstOffer = hotelOffer.offers[0]

      return {
        id: `${hotel.hotelId}-${firstOffer.id}`,
        provider: this.providerName,
        type: 'hotel',
        price: parseFloat(firstOffer.price.total),
        currency: firstOffer.price.currency,
        details: {
          hotelId: hotel.hotelId,
          hotelName: hotel.name,
          cityCode: hotel.cityCode,
          location: {
            latitude: hotel.latitude,
            longitude: hotel.longitude
          },
          checkIn: firstOffer.checkInDate,
          checkOut: firstOffer.checkOutDate,
          room: {
            type: firstOffer.room.type,
            category: firstOffer.room.typeEstimated.category,
            beds: firstOffer.room.typeEstimated.beds,
            bedType: firstOffer.room.typeEstimated.bedType,
            description: firstOffer.room.description.text
          },
          guests: {
            adults: firstOffer.guests.adults
          },
          boardType: firstOffer.boardType,
          price: {
            total: firstOffer.price.total,
            base: firstOffer.price.base,
            currency: firstOffer.price.currency,
            taxes: firstOffer.price.taxes
          },
          policies: {
            cancellation: firstOffer.policies.cancellation?.description.text,
            paymentType: firstOffer.policies.paymentType
          },
          available: hotelOffer.available
        },
        rawData: hotelOffer,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      }
    })
  }

  async getDetails(offerId: string): Promise<any> {
    try {
      const token = await this.getAccessToken()
      const response = await this.makeRequest(`/v3/shopping/hotel-offers/${offerId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      this.logError('getDetails', error)
      throw error
    }
  }

  async createBooking(data: BookingData): Promise<BookingConfirmation> {
    try {
      const token = await this.getAccessToken()

      const payload = {
        data: {
          offerId: data.offerId,
          guests: data.guests,
          payments: data.payments
        }
      }

      const response = await this.makeRequest('/v1/booking/hotel-bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      return {
        bookingReference: response.data[0].id,
        provider: this.providerName,
        status: response.data[0].providerConfirmationId ? 'confirmed' : 'pending',
        details: {
          confirmationId: response.data[0].providerConfirmationId,
          hotel: response.data[0].hotel,
          guests: response.data[0].guests
        },
        rawData: response.data
      }
    } catch (error) {
      this.logError('createBooking', error)
      throw error
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    // Amadeus no tiene endpoint directo de cancelación en Self-Service
    // Requiere contacto con proveedor o Enterprise API
    return {
      success: false,
      message: 'Cancellation must be done through hotel provider or Enterprise API'
    }
  }

  async checkAvailability(offerId: string): Promise<boolean> {
    try {
      const details = await this.getDetails(offerId)
      return details && details.available
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }
}

export default AmadeusHotelAdapter
