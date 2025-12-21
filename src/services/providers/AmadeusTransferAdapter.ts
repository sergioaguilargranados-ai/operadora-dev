import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

interface AmadeusAuthToken {
  access_token: string
  expires_in: number
  token_type: string
}

interface AmadeusTransferOffer {
  id: string
  transferType: string
  start: {
    dateTime: string
    locationCode: string
    address?: {
      line: string
      city: string
      country: string
    }
  }
  end: {
    locationCode: string
    address?: {
      line: string
      city: string
      country: string
    }
  }
  stopOvers?: Array<{
    duration: string
    sequenceNumber: number
    location: {
      locationCode: string
    }
  }>
  passengerCharacteristics: Array<{
    passengerTypeCode: string
    age: number
  }>
  quotation: {
    monetaryAmount: string
    currencyCode: string
    isEstimated: boolean
    base?: {
      monetaryAmount: string
    }
    discount?: {
      monetaryAmount: string
    }
  }
  converted?: {
    monetaryAmount: string
    currencyCode: string
  }
  vehicle: {
    code: string
    category: string
    description: string
    seats: Array<{
      count: number
    }>
    baggages: Array<{
      count: number
      size: string
    }>
    imageURL?: string
  }
  serviceProvider: {
    code: string
    name: string
    logoUrl?: string
    termsUrl?: string
    isPreferred: boolean
    contacts?: {
      phoneNumber: string
      email: string
    }
  }
  partnerInfo?: {
    serviceProvider: {
      code: string
      name: string
    }
  }
  extraServices?: Array<{
    code: string
    description: string
    metricType: string
    price: {
      monetaryAmount: string
      currencyCode: string
    }
  }>
  distance?: {
    value: number
    unit: string
  }
  startConnectedSegment?: {
    transportationType: string
    transportationNumber: string
    departure: {
      localDateTime: string
    }
  }
  methodsOfPaymentAccepted?: string[]
  discountCodes?: Array<{
    type: string
    value: string
  }>
}

/**
 * Adapter para Amadeus Transfer API (Autos y Transfers)
 * Documentación: https://developers.amadeus.com/self-service/category/cars-and-transfers
 *
 * Capacidades:
 * - Transfer Search: Búsqueda de transfers privados/compartidos
 * - Transfer Booking: Reserva de transfers
 * - Transfer Management: Cancelación de reservas
 */
export class AmadeusTransferAdapter extends BaseProviderAdapter {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor(clientId: string, clientSecret: string, useSandbox: boolean = true) {
    const endpoint = useSandbox
      ? 'https://test.api.amadeus.com'
      : 'https://api.amadeus.com'

    super('amadeus-transfer', endpoint, clientId)

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

      console.log(`🔐 Authenticating Amadeus Transfer API...`)

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

      console.log('✅ Amadeus Transfer authentication successful')
      return this.accessToken
    } catch (error) {
      console.error('❌ Error in getAccessToken:', error)
      this.logError('getAccessToken', error)
      throw error
    }
  }

  /**
   * Búsqueda de transfers
   *
   * Tipos de transfer:
   * - PRIVATE: Vehículo privado
   * - SHARED: Compartido
   * - TAXI: Taxi
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      console.log('🔍 AmadeusTransferAdapter.search() - Starting transfer search')

      this.validateRequiredParams(params, [
        'startLocationCode',
        'endLocationCode',
        'transferDate',
        'transferTime',
        'passengers'
      ])

      await this.checkRateLimit()

      const token = await this.getAccessToken()

      const searchParams = new URLSearchParams({
        startLocationCode: params.startLocationCode!,
        endLocationCode: params.endLocationCode!,
        transferDate: params.transferDate!,
        transferTime: params.transferTime!,
        passengers: params.passengers!.toString()
      })

      // Parámetros opcionales
      if (params.transferType) searchParams.append('transferType', params.transferType)
      if (params.startAddressLine) searchParams.append('startAddressLine', params.startAddressLine)
      if (params.endAddressLine) searchParams.append('endAddressLine', params.endAddressLine)
      if (params.startConnectedSegmentTransportationType) {
        searchParams.append('startConnectedSegment[transportationType]', params.startConnectedSegmentTransportationType)
      }
      if (params.startConnectedSegmentTransportationNumber) {
        searchParams.append('startConnectedSegment[transportationNumber]', params.startConnectedSegmentTransportationNumber)
      }

      const url = `/v1/shopping/transfer-offers?${searchParams}`
      console.log(`📡 Making request to Amadeus Transfers: ${url}`)

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log(`✅ Amadeus Transfers response received. Offers: ${response.data?.length || 0}`)

      const normalized = this.normalizeTransferResults(response.data || [])
      console.log(`✅ Normalized ${normalized.length} transfer results`)

      return normalized

    } catch (error) {
      console.error('❌ Error in AmadeusTransferAdapter.search():', error)
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Normalizar resultados
   */
  private normalizeTransferResults(offers: AmadeusTransferOffer[]): SearchResult[] {
    return offers.map(offer => {
      const vehicle = offer.vehicle
      const quotation = offer.quotation
      const serviceProvider = offer.serviceProvider

      return {
        id: offer.id,
        provider: this.providerName,
        type: 'transfer',
        price: parseFloat(quotation.monetaryAmount),
        currency: quotation.currencyCode,
        details: {
          transferType: offer.transferType,
          start: {
            dateTime: offer.start.dateTime,
            location: offer.start.locationCode,
            address: offer.start.address
          },
          end: {
            location: offer.end.locationCode,
            address: offer.end.address
          },
          vehicle: {
            code: vehicle.code,
            category: vehicle.category,
            description: vehicle.description,
            seats: vehicle.seats[0]?.count || 0,
            luggage: vehicle.baggages[0]?.count || 0,
            luggageSize: vehicle.baggages[0]?.size,
            imageURL: vehicle.imageURL
          },
          serviceProvider: {
            code: serviceProvider.code,
            name: serviceProvider.name,
            logo: serviceProvider.logoUrl,
            terms: serviceProvider.termsUrl,
            preferred: serviceProvider.isPreferred,
            contact: serviceProvider.contacts
          },
          passengers: offer.passengerCharacteristics,
          price: {
            total: quotation.monetaryAmount,
            base: quotation.base?.monetaryAmount,
            discount: quotation.discount?.monetaryAmount,
            currency: quotation.currencyCode,
            isEstimated: quotation.isEstimated
          },
          converted: offer.converted,
          distance: offer.distance,
          stopOvers: offer.stopOvers,
          extraServices: offer.extraServices,
          paymentMethods: offer.methodsOfPaymentAccepted,
          discountCodes: offer.discountCodes
        },
        rawData: offer,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      }
    })
  }

  async getDetails(offerId: string): Promise<any> {
    // Transfer offers no tienen endpoint específico de detalles
    // Los detalles completos vienen en la búsqueda
    try {
      return { offerId, message: 'Transfer details included in search results' }
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
          note: data.note || '',
          passengers: data.passengers,
          agency: data.agency,
          payment: data.payment,
          extraServices: data.extraServices,
          equipment: data.equipment,
          corporation: data.corporation,
          startConnectedSegment: data.startConnectedSegment,
          passengerCharacteristics: data.passengerCharacteristics,
          loyaltyPrograms: data.loyaltyPrograms
        }
      }

      const response = await this.makeRequest('/v1/ordering/transfer-orders', {
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
        status: response.data.status || 'confirmed',
        details: {
          confirmationNumber: response.data.confirmNbr,
          transfers: response.data.transfers,
          contacts: response.data.contacts
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

      const payload = {
        data: {
          confirmNbr: bookingId,
          reason: reason || 'Customer request'
        }
      }

      await this.makeRequest('/v1/ordering/transfer-orders', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      return {
        success: true,
        message: 'Transfer booking cancelled successfully'
      }
    } catch (error) {
      this.logError('cancelBooking', error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  async checkAvailability(offerId: string): Promise<boolean> {
    // Transfer offers expiran rápido, asumir disponible si existe
    return true
  }
}

export default AmadeusTransferAdapter
