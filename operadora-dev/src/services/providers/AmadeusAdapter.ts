import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

interface AmadeusAuthToken {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * Adapter para Amadeus Flight API
 * Documentación: https://developers.amadeus.com/self-service/category/flights
 */
export class AmadeusAdapter extends BaseProviderAdapter {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor(clientId: string, clientSecret: string, useSandbox: boolean = true) {
    const endpoint = useSandbox
      ? 'https://test.api.amadeus.com/v2'
      : 'https://api.amadeus.com/v2'

    super('amadeus', endpoint, clientId)

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.isSandbox = useSandbox
  }

  /**
   * Obtener token de acceso OAuth2
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      console.log('✅ Using cached Amadeus token')
      return this.accessToken
    }

    try {
      const authEndpoint = this.isSandbox
        ? 'https://test.api.amadeus.com/v1/security/oauth2/token'
        : 'https://api.amadeus.com/v1/security/oauth2/token'

      console.log(`🔐 Authenticating with Amadeus (${this.isSandbox ? 'Sandbox' : 'Production'})...`)
      console.log(`   Endpoint: ${authEndpoint}`)
      console.log(`   Client ID: ${this.clientId?.substring(0, 8)}...`)

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
        console.error(`❌ Amadeus auth failed: ${response.status} ${response.statusText}`)
        console.error(`   Response: ${errorText}`)
        throw new Error(`Amadeus auth failed: ${response.status} - ${errorText}`)
      }

      const data: AmadeusAuthToken = await response.json()

      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000

      console.log('✅ Amadeus authentication successful')
      return this.accessToken
    } catch (error) {
      console.error('❌ Error in getAccessToken:', error)
      this.logError('getAccessToken', error)
      throw error
    }
  }

  /**
   * Búsqueda de vuelos
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 AmadeusAdapter.search() - Starting flight search')

      this.validateRequiredParams(params, [
        'originLocationCode',
        'destinationLocationCode',
        'departureDate',
        'adults'
      ])

      await this.checkRateLimit()

      const token = await this.getAccessToken()

      const searchParams = new URLSearchParams({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        max: (params.maxResults || 50).toString()
      })

      if (params.returnDate) searchParams.append('returnDate', params.returnDate)
      if (params.children) searchParams.append('children', params.children.toString())
      if (params.infants) searchParams.append('infants', params.infants.toString())
      if (params.travelClass) searchParams.append('travelClass', params.travelClass)

      // Filtros de aerolíneas
      if (params.includedAirlineCodes) {
        searchParams.append('includedAirlineCodes', params.includedAirlineCodes)
      }
      if (params.excludedAirlineCodes) {
        searchParams.append('excludedAirlineCodes', params.excludedAirlineCodes)
      }

      // Parámetros adicionales de preferencias
      if (params.nonStop) searchParams.append('nonStop', 'true')
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString())
      if (params.currencyCode) searchParams.append('currencyCode', params.currencyCode)

      const url = `/shopping/flight-offers?${searchParams}`
      console.log(`📡 Making request to Amadeus: ${url}`)

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log(`✅ Amadeus response received. Data items: ${response.data?.length || 0}`)

      const normalized = this.normalizeFlightResults(response.data || [])
      console.log(`✅ Normalized ${normalized.length} flight results`)

      return normalized

    } catch (error) {
      console.error('❌ Error in AmadeusAdapter.search():', error)
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Normalizar resultados de Amadeus a formato estándar
   */
  private normalizeFlightResults(offers: any[]): SearchResult[] {
    return offers.map(offer => {
      const itinerary = offer.itineraries[0]
      const firstSegment = itinerary.segments[0]
      const lastSegment = itinerary.segments[itinerary.segments.length - 1]

      const returnItinerary = offer.itineraries[1]
      let returnDeparture = null
      let returnArrival = null

      if (returnItinerary) {
        returnDeparture = returnItinerary.segments[0].departure.at
        returnArrival = returnItinerary.segments[returnItinerary.segments.length - 1].arrival.at
      }

      return {
        id: offer.id,
        provider: this.providerName,
        type: 'flight',
        price: this.normalizePrice(offer.price.total),
        currency: offer.price.currency,
        details: {
          outbound: {
            origin: firstSegment.departure.iataCode,
            destination: lastSegment.arrival.iataCode,
            departureTime: firstSegment.departure.at,
            arrivalTime: lastSegment.arrival.at,
            duration: itinerary.duration,
            stops: itinerary.segments.length - 1,
            segments: itinerary.segments.map((seg: any) => ({
              carrier: seg.carrierCode,
              flightNumber: seg.number,
              aircraft: seg.aircraft?.code,
              departure: {
                airport: seg.departure.iataCode,
                time: seg.departure.at,
                terminal: seg.departure.terminal
              },
              arrival: {
                airport: seg.arrival.iataCode,
                time: seg.arrival.at,
                terminal: seg.arrival.terminal
              }
            }))
          },
          inbound: returnItinerary ? {
            origin: returnItinerary.segments[0].departure.iataCode,
            destination: returnItinerary.segments[returnItinerary.segments.length - 1].arrival.iataCode,
            departureTime: returnDeparture,
            arrivalTime: returnArrival,
            duration: returnItinerary.duration,
            stops: returnItinerary.segments.length - 1
          } : null,
          airline: offer.validatingAirlineCodes[0],
          cabinClass: firstSegment.cabin,
          availableSeats: offer.numberOfBookableSeats,
          fareType: offer.pricingOptions?.fareType || [],
          includedBaggage: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags
        },
        rawData: offer,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })
  }

  async getDetails(offerId: string): Promise<any> {
    try {
      const token = await this.getAccessToken()
      const response = await this.makeRequest(`/shopping/flight-offers/${offerId}`, {
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
          type: 'flight-order',
          flightOffers: [data.offerId],
          travelers: data.travelerInfo,
          contacts: data.contactInfo
        }
      }

      const response = await this.makeRequest('/booking/flight-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      return {
        bookingReference: response.data.id,
        provider: this.providerName,
        status: response.data.flightOffers[0].status || 'confirmed',
        details: {
          pnr: response.data.associatedRecords?.[0]?.reference,
          tickets: response.data.tickets,
          travelers: response.data.travelers
        },
        rawData: response.data
      }
    } catch (error) {
      this.logError('createBooking', error)
      throw error
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    try {
      const token = await this.getAccessToken()
      await this.makeRequest(`/booking/flight-orders/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      return { success: true, message: 'Booking cancelled successfully' }
    } catch (error) {
      this.logError('cancelBooking', error)
      return { success: false, message: (error as Error).message }
    }
  }

  async checkAvailability(offerId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      const response = await this.makeRequest('/shopping/flight-offers/pricing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [offerId]
          }
        })
      })

      return response.data?.flightOffers?.length > 0
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }

  async searchLowFares(origin: string, departureDate?: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken()
      const params = new URLSearchParams({ origin, ...(departureDate && { departureDate }) })

      const response = await this.makeRequest(`/shopping/flight-destinations?${params}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      return response.data || []
    } catch (error) {
      this.logError('searchLowFares', error)
      return []
    }
  }
}

export default AmadeusAdapter
