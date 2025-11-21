import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

/**
 * Adapter para Booking.com Affiliate API
 * Documentación: https://developers.booking.com/
 *
 * NOTA: Booking.com Affiliate API es principalmente para búsqueda y redirección
 * Las reservas se completan en Booking.com directamente
 */
export class BookingAdapter extends BaseProviderAdapter {
  private affiliateId: string

  constructor(apiKey: string, affiliateId: string) {
    super('booking', 'https://distribution-xml.booking.com', apiKey)
    this.affiliateId = affiliateId
  }

  /**
   * Búsqueda de hoteles
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      // Validar parámetros
      this.validateRequiredParams(params, [
        'city',
        'checkin',
        'checkout',
        'guests'
      ])

      await this.checkRateLimit()

      // Construir query
      const searchParams = new URLSearchParams({
        city: params.city,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests.toString(),
        rooms: (params.rooms || 1).toString(),
        affiliate_id: this.affiliateId,
        currency: params.currency || 'MXN',
        language: 'es'
      })

      // Filtros opcionales
      if (params.min_price) {
        searchParams.append('min_price', params.min_price.toString())
      }

      if (params.max_price) {
        searchParams.append('max_price', params.max_price.toString())
      }

      if (params.star_rating) {
        searchParams.append('class', params.star_rating.toString())
      }

      const response = await this.makeRequest(`/2.7/hotels?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`
        }
      })

      return this.normalizeHotelResults(response.hotels || [], {})

    } catch (error) {
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Normalizar resultados de Booking.com
   */
  private normalizeHotelResults(hotels: any[], searchParams?: any): SearchResult[] {
    return hotels.map(hotel => ({
      id: hotel.hotel_id?.toString() || hotel.id,
      provider: this.providerName,
      type: 'hotel',
      price: this.normalizePrice(hotel.min_total_price || hotel.price),
      currency: hotel.currency || 'EUR',
      details: {
        name: hotel.hotel_name || hotel.name,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country_code,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        starRating: hotel.class || hotel.star_rating,
        rating: hotel.review_score,
        reviewCount: hotel.review_nr || hotel.number_of_reviews,
        description: hotel.hotel_description,
        facilities: hotel.hotel_facilities || hotel.amenities,
        photos: hotel.hotel_photos?.map((p: any) => p.url_max1280 || p.url_original) || [],
        checkIn: hotel.checkin?.from || '14:00',
        checkOut: hotel.checkout?.until || '12:00',
        rooms: hotel.room_data?.map((room: any) => ({
          name: room.room_name,
          description: room.room_description,
          maxOccupancy: room.max_occupancy,
          facilities: room.room_facilities,
          photos: room.room_photos,
          price: room.price
        })) || [],
        policies: {
          cancellation: hotel.cancellation_policy,
          pets: hotel.pets_allowed,
          smoking: hotel.smoking_policy
        },
        bookingUrl: this.generateBookingUrl(hotel.hotel_id, searchParams || {}),
        deepLink: hotel.url
      },
      rawData: hotel,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    }))
  }

  /**
   * Generar URL de reserva con affiliate tracking
   */
  private generateBookingUrl(hotelId: string, params: any): string {
    const baseUrl = 'https://www.booking.com/hotel/xx/hotel.html'
    const urlParams = new URLSearchParams({
      hotel_id: hotelId,
      checkin: params.checkin,
      checkout: params.checkout,
      group_adults: params.guests?.toString() || '2',
      group_children: '0',
      no_rooms: params.rooms?.toString() || '1',
      aid: this.affiliateId
    })

    return `${baseUrl}?${urlParams}`
  }

  /**
   * Obtener detalles de hotel específico
   */
  async getDetails(hotelId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/2.7/hotels/${hotelId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`
        }
      })

      return response
    } catch (error) {
      this.logError('getDetails', error)
      throw error
    }
  }

  /**
   * Verificar disponibilidad
   */
  async checkAvailability(hotelId: string): Promise<boolean> {
    try {
      const details = await this.getDetails(hotelId)
      return details && details.is_available !== false
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }

  /**
   * Booking.com Affiliate API no permite reservas directas
   * Las reservas se hacen redirigiendo a Booking.com
   */
  async createBooking(data: BookingData): Promise<BookingConfirmation> {
    // Booking.com Affiliate no soporta reservas directas
    // Retornamos el link de redirección
    return {
      bookingReference: 'redirect',
      provider: this.providerName,
      status: 'redirect',
      details: {
        redirectUrl: data.redirectUrl || this.generateBookingUrl(data.hotelId, data),
        message: 'Customer will be redirected to Booking.com to complete reservation'
      },
      rawData: data
    }
  }

  /**
   * No aplica para affiliate API
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    return {
      success: false,
      message: 'Cancellations must be managed through Booking.com'
    }
  }

  /**
   * Buscar hoteles por coordenadas geográficas
   */
  async searchByCoordinates(
    latitude: number,
    longitude: number,
    checkin: string,
    checkout: string,
    radius: number = 5
  ): Promise<SearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
        checkin,
        checkout,
        affiliate_id: this.affiliateId
      })

      const response = await this.makeRequest(`/2.7/hotels?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`
        }
      })

      return this.normalizeHotelResults(response.hotels || [], {})
    } catch (error) {
      this.logError('searchByCoordinates', error)
      return []
    }
  }

  /**
   * Obtener hoteles por ciudad
   */
  async getHotelsByCity(cityName: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        city_name: cityName,
        rows: limit.toString(),
        affiliate_id: this.affiliateId
      })

      const response = await this.makeRequest(`/2.7/hotels?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`
        }
      })

      return this.normalizeHotelResults(response.hotels || [], {})
    } catch (error) {
      this.logError('getHotelsByCity', error)
      return []
    }
  }

  /**
   * Buscar por nombre de hotel
   */
  async searchByName(hotelName: string): Promise<SearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        name: hotelName,
        affiliate_id: this.affiliateId
      })

      const response = await this.makeRequest(`/2.7/hotels?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`
        }
      })

      return this.normalizeHotelResults(response.hotels || [], {})
    } catch (error) {
      this.logError('searchByName', error)
      return []
    }
  }
}

export default BookingAdapter
