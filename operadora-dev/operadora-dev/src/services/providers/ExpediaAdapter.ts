import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'
import HotelAutoSaveService from '@/services/HotelAutoSaveService'

/**
 * Adapter para Expedia Rapid API
 * Documentación: https://developers.expediagroup.com/
 *
 * APIs disponibles:
 * - Rapid API (Hoteles)
 * - TAAP API (Vuelos + Hoteles para agencias)
 */
export class ExpediaAdapter extends BaseProviderAdapter {
  protected apiSecret: string
  protected isSandbox: boolean

  constructor(apiKey: string, apiSecret: string, useSandbox: boolean = true) {
    const endpoint = useSandbox
      ? 'https://test.ean.com/v3'
      : 'https://api.ean.com/v3'

    super('expedia', endpoint, apiKey)

    this.apiSecret = apiSecret
    this.isSandbox = useSandbox
  }

  /**
   * Generar firma de autenticación
   */
  private generateAuthSignature(timestamp: number): string {
    // Expedia usa HMAC-SHA512
    const crypto = require('crypto')
    const message = `${this.apiKey}${this.apiSecret}${timestamp}`
    const hash = crypto.createHash('sha512').update(message).digest('hex')
    return hash
  }

  /**
   * Headers de autenticación
   */
  private getAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = this.generateAuthSignature(timestamp)

    return {
      'Authorization': `EAN APIKey=${this.apiKey},Signature=${signature},timestamp=${timestamp}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  /**
   * Búsqueda de hoteles con Expedia Rapid API
   */
  async searchHotels(params: SearchParams): Promise<SearchResult[]> {
    try {
      this.validateRequiredParams(params, ['city', 'checkin', 'checkout', 'guests'])

      await this.checkRateLimit()

      // Construir query
      const searchParams = new URLSearchParams({
        location: params.city,
        checkin: params.checkin,
        checkout: params.checkout,
        occupancy: `${params.guests || 2}`,
        currency: params.currency || 'MXN',
        language: 'es-MX',
        include: 'hotel_amenities,room_amenities'
      })

      if (params.rooms) searchParams.append('rooms', params.rooms.toString())
      if (params.min_price) searchParams.append('min_price', params.min_price.toString())
      if (params.max_price) searchParams.append('max_price', params.max_price.toString())

      const response = await this.makeRequest(`/properties/availability?${searchParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const normalizedResults = this.normalizeHotelResults(response.data || [])

      // Auto-guardar hoteles en la BD (sin bloquear la respuesta)
      this.autoSaveHotels(normalizedResults).catch(error => {
        console.error('Error auto-saving hotels from Expedia:', error)
      })

      return normalizedResults

    } catch (error) {
      this.logError('searchHotels', error)
      throw error
    }
  }

  /**
   * Búsqueda de vuelos con Expedia TAAP
   */
  async searchFlights(params: SearchParams): Promise<SearchResult[]> {
    try {
      this.validateRequiredParams(params, [
        'originLocationCode',
        'destinationLocationCode',
        'departureDate',
        'adults'
      ])

      await this.checkRateLimit()

      const flightParams = new URLSearchParams({
        origin: params.originLocationCode,
        destination: params.destinationLocationCode,
        departure_date: params.departureDate,
        adults: params.adults.toString(),
        cabin_class: params.travelClass || 'economy',
        currency: params.currency || 'MXN'
      })

      if (params.returnDate) flightParams.append('return_date', params.returnDate)
      if (params.children) flightParams.append('children', params.children.toString())

      const response = await this.makeRequest(`/flights/search?${flightParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return this.normalizeFlightResults(response.data || [])

    } catch (error) {
      this.logError('searchFlights', error)
      throw error
    }
  }

  /**
   * Búsqueda general (hoteles o vuelos según tipo)
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    if (params.type === 'hotel' || params.city) {
      return this.searchHotels(params)
    } else if (params.type === 'flight' || params.originLocationCode) {
      return this.searchFlights(params)
    }

    throw new Error('Invalid search type. Must specify hotel or flight parameters.')
  }

  /**
   * Normalizar resultados de hoteles
   */
  private normalizeHotelResults(hotels: any[]): SearchResult[] {
    return hotels.map((hotel: any) => ({
      id: hotel.property_id || hotel.id,
      provider: this.providerName,
      type: 'hotel',
      price: this.normalizePrice(hotel.price?.total || hotel.total_rate),
      currency: hotel.price?.currency || 'MXN',
      details: {
        name: hotel.name,
        address: hotel.address?.line_1,
        city: hotel.address?.city,
        country: hotel.address?.country_code,
        latitude: hotel.location?.coordinates?.latitude,
        longitude: hotel.location?.coordinates?.longitude,
        starRating: hotel.star_rating || hotel.rating,
        rating: hotel.guest_rating?.overall || hotel.review_score,
        reviewCount: hotel.guest_rating?.count || hotel.review_count,
        description: hotel.descriptions?.amenities,
        facilities: hotel.amenities || [],
        photos: hotel.images?.map((img: any) => img.url) || [],
        checkIn: hotel.checkin?.time || '15:00',
        checkOut: hotel.checkout?.time || '12:00',
        rooms: hotel.rooms?.map((room: any) => ({
          name: room.name,
          description: room.description,
          maxOccupancy: room.occupancy?.max_allowed,
          price: room.rates?.[0]?.total_amount,
          amenities: room.amenities
        })) || [],
        policies: {
          cancellation: hotel.cancel_penalties?.[0]?.description,
          pets: hotel.amenities?.includes('Pets allowed'),
          smoking: hotel.amenities?.includes('Non-smoking rooms')
        }
      },
      rawData: hotel,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }))
  }

  /**
   * Normalizar resultados de vuelos
   */
  private normalizeFlightResults(flights: any[]): SearchResult[] {
    return flights.map((flight: any) => {
      const outbound = flight.slices?.[0] || flight.outbound
      const inbound = flight.slices?.[1] || flight.inbound

      return {
        id: flight.id || flight.flight_id,
        provider: this.providerName,
        type: 'flight',
        price: this.normalizePrice(flight.price?.total || flight.total_price),
        currency: flight.price?.currency || 'MXN',
        details: {
          outbound: {
            origin: outbound.origin?.iata_code || outbound.origin,
            destination: outbound.destination?.iata_code || outbound.destination,
            departureTime: outbound.departure_time || outbound.departure_at,
            arrivalTime: outbound.arrival_time || outbound.arrival_at,
            duration: outbound.duration,
            stops: outbound.segments?.length - 1 || 0,
            airline: outbound.operating_carrier || outbound.airline,
            segments: outbound.segments?.map((seg: any) => ({
              carrier: seg.operating_carrier?.iata_code,
              flightNumber: seg.flight_number,
              aircraft: seg.aircraft?.iata_code,
              departure: {
                airport: seg.origin?.iata_code,
                time: seg.departure_time,
                terminal: seg.origin_terminal
              },
              arrival: {
                airport: seg.destination?.iata_code,
                time: seg.arrival_time,
                terminal: seg.destination_terminal
              }
            }))
          },
          inbound: inbound ? {
            origin: inbound.origin?.iata_code || inbound.origin,
            destination: inbound.destination?.iata_code || inbound.destination,
            departureTime: inbound.departure_time || inbound.departure_at,
            arrivalTime: inbound.arrival_time || inbound.arrival_at,
            duration: inbound.duration,
            stops: inbound.segments?.length - 1 || 0,
            airline: inbound.operating_carrier || inbound.airline
          } : null,
          airline: outbound.operating_carrier || outbound.airline,
          cabinClass: flight.cabin_class || 'economy',
          baggage: flight.baggage_allowance
        },
        rawData: flight,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })
  }

  /**
   * Obtener detalles de hotel
   */
  async getHotelDetails(propertyId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/properties/${propertyId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      this.logError('getHotelDetails', error)
      throw error
    }
  }

  /**
   * Obtener detalles de vuelo
   */
  async getFlightDetails(flightId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/flights/${flightId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      this.logError('getFlightDetails', error)
      throw error
    }
  }

  /**
   * Obtener detalles (genérico)
   */
  async getDetails(id: string): Promise<any> {
    // Intentar obtener como hotel primero, luego como vuelo
    try {
      return await this.getHotelDetails(id)
    } catch {
      return await this.getFlightDetails(id)
    }
  }

  /**
   * Crear reserva
   */
  async createBooking(data: BookingData): Promise<BookingConfirmation> {
    try {
      const payload = {
        property_id: data.offerId || data.propertyId,
        checkin: data.checkin,
        checkout: data.checkout,
        rooms: data.rooms || 1,
        guests: data.travelerInfo,
        email: data.contactInfo?.emailAddress,
        phone: data.contactInfo?.phones?.[0]?.number,
        payment: data.paymentInfo
      }

      const response = await this.makeRequest('/bookings', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      return {
        bookingReference: response.data.itinerary_id || response.data.booking_id,
        provider: this.providerName,
        status: response.data.status || 'confirmed',
        details: {
          confirmationNumber: response.data.confirmation_number,
          hotel: response.data.hotel,
          rooms: response.data.rooms,
          totalPrice: response.data.total_price
        },
        rawData: response.data
      }
    } catch (error) {
      this.logError('createBooking', error)
      throw error
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    try {
      await this.makeRequest(`/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      })

      return {
        success: true,
        message: 'Booking cancelled successfully',
        refundAmount: 0 // Se obtendría de la respuesta
      }
    } catch (error) {
      this.logError('cancelBooking', error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }

  /**
   * Verificar disponibilidad
   */
  async checkAvailability(offerId: string): Promise<boolean> {
    try {
      const details = await this.getDetails(offerId)
      return details && details.available !== false
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }

  /**
   * Búsqueda de paquetes (vuelo + hotel)
   */
  async searchPackages(params: SearchParams): Promise<SearchResult[]> {
    try {
      this.validateRequiredParams(params, [
        'originLocationCode',
        'city',
        'departureDate',
        'returnDate',
        'adults'
      ])

      const packageParams = new URLSearchParams({
        origin: params.originLocationCode,
        destination: params.city,
        departure_date: params.departureDate,
        return_date: params.returnDate || '',
        adults: params.adults.toString(),
        currency: params.currency || 'MXN'
      })

      const response = await this.makeRequest(`/packages/search?${packageParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return this.normalizePackageResults(response.data || [])

    } catch (error) {
      this.logError('searchPackages', error)
      return []
    }
  }

  /**
   * Normalizar paquetes
   */
  private normalizePackageResults(packages: any[]): SearchResult[] {
    return packages.map((pkg: any) => ({
      id: pkg.package_id || pkg.id,
      provider: this.providerName,
      type: 'package',
      price: this.normalizePrice(pkg.total_price),
      currency: pkg.currency || 'MXN',
      details: {
        flight: pkg.flight,
        hotel: pkg.hotel,
        savings: pkg.savings_amount,
        includes: pkg.inclusions
      },
      rawData: pkg,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }))
  }

  /**
   * Auto-guardar hoteles en la base de datos
   */
  private async autoSaveHotels(results: SearchResult[]): Promise<void> {
    try {
      const hotelsToSave = results.map(result => ({
        name: result.details?.name || 'Hotel sin nombre',
        city: result.details?.city || 'Ciudad desconocida',
        location: result.details?.address || result.details?.city,
        address: result.details?.address,
        price: result.price,
        currency: result.currency || 'USD',
        rating: result.details?.rating,
        reviewCount: result.details?.reviewCount,
        starRating: result.details?.starRating,
        description: result.details?.description,
        facilities: result.details?.facilities || [],
        imageUrl: result.details?.photos?.[0],
        provider: this.providerName,
        externalId: result.id
      }))

      const summary = await HotelAutoSaveService.saveHotelsFromSearch(hotelsToSave)
      console.log(`📊 Expedia auto-save: ${summary.saved} nuevos, ${summary.updated} actualizados`)
    } catch (error) {
      console.error('Error in autoSaveHotels:', error)
    }
  }
}

export default ExpediaAdapter
