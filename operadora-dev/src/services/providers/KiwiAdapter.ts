import { BaseProviderAdapter, SearchParams, SearchResult, BookingData, BookingConfirmation, CancellationResult } from './BaseProviderAdapter'

/**
 * Adapter para Kiwi.com Tequila API
 * Documentación: https://tequila.kiwi.com/portal/docs/tequila_api
 */
export class KiwiAdapter extends BaseProviderAdapter {

  constructor(apiKey: string) {
    super('kiwi', 'https://api.tequila.kiwi.com', apiKey)
  }

  /**
   * Búsqueda de vuelos
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      // Validar parámetros
      this.validateRequiredParams(params, [
        'fly_from',
        'fly_to',
        'date_from',
        'adults'
      ])

      await this.checkRateLimit()

      // Construir query parameters
      const searchParams = new URLSearchParams({
        fly_from: params.fly_from,
        fly_to: params.fly_to,
        date_from: params.date_from,
        adults: params.adults.toString(),
        partner: 'asoperadora', // Partner ID
        curr: params.currency || 'MXN',
        limit: (params.limit || 50).toString()
      })

      // Fecha de retorno (opcional)
      if (params.date_to || params.return_date) {
        searchParams.append('return_from', params.date_to || params.return_date)
        searchParams.append('return_to', params.date_to || params.return_date)
      }

      // Niños
      if (params.children) {
        searchParams.append('children', params.children.toString())
      }

      // Infantes
      if (params.infants) {
        searchParams.append('infants', params.infants.toString())
      }

      // Clase de cabina
      if (params.cabin_class) {
        const cabinMap: Record<string, string> = {
          'economy': 'M',
          'premium_economy': 'W',
          'business': 'C',
          'first': 'F'
        }
        searchParams.append('selected_cabins', cabinMap[params.cabin_class] || 'M')
      }

      // Hacer request
      const response = await this.makeRequest(`/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      // Normalizar resultados
      return this.normalizeResults(response.data || [])

    } catch (error) {
      this.logError('search', error)
      throw error
    }
  }

  /**
   * Normalizar resultados de Kiwi a formato estándar
   */
  private normalizeResults(flights: any[]): SearchResult[] {
    return flights.map(flight => {
      // Kiwi puede tener múltiples rutas, tomamos la primera
      const route = flight.route[0]
      const lastRoute = flight.route[flight.route.length - 1]

      // Calcular stops
      const stops = flight.route.length - 1

      return {
        id: flight.id,
        provider: this.providerName,
        type: 'flight',
        price: this.normalizePrice(flight.price),
        currency: flight.currency || 'EUR',
        details: {
          outbound: {
            origin: route.flyFrom,
            destination: lastRoute.flyTo,
            departureTime: route.local_departure,
            arrivalTime: lastRoute.local_arrival,
            duration: `${Math.floor(flight.duration.total / 3600)}h ${Math.floor((flight.duration.total % 3600) / 60)}m`,
            stops,
            segments: flight.route.map((seg: any) => ({
              carrier: seg.airline,
              flightNumber: seg.flight_no,
              aircraft: seg.vehicle_type,
              departure: {
                airport: seg.flyFrom,
                time: seg.local_departure,
                city: seg.cityFrom
              },
              arrival: {
                airport: seg.flyTo,
                time: seg.local_arrival,
                city: seg.cityTo
              }
            }))
          },
          inbound: flight.return ? {
            // Kiwi maneja returns en el mismo array de routes
            // Esto es simplificado, en producción necesitarías parsing más complejo
            origin: flight.route[0].flyTo,
            destination: flight.route[0].flyFrom
          } : null,
          airline: route.airline,
          airlines: flight.airlines,
          availableSeats: flight.availability?.seats || null,
          quality: flight.quality,
          bookingToken: flight.booking_token,
          deepLink: flight.deep_link
        },
        rawData: flight,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })
  }

  /**
   * Verificar disponibilidad y precio actualizado
   */
  async checkAvailability(bookingToken: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('/v2/booking/check_flights', {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_token: bookingToken,
          bnum: 1,
          adults: 1
        })
      })

      return response.flights_checked && response.flights_invalid === 0
    } catch (error) {
      this.logError('checkAvailability', error)
      return false
    }
  }

  /**
   * Obtener detalles de vuelo
   */
  async getDetails(bookingToken: string): Promise<any> {
    try {
      const response = await this.makeRequest('/v2/booking/check_flights', {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_token: bookingToken,
          bnum: 1,
          adults: 1
        })
      })

      return response
    } catch (error) {
      this.logError('getDetails', error)
      throw error
    }
  }

  /**
   * Crear reserva
   */
  async createBooking(data: BookingData): Promise<BookingConfirmation> {
    try {
      // Payload para Kiwi booking
      const payload = {
        booking_token: data.bookingToken,
        passengers: data.passengers.map((p: any) => ({
          name: p.firstName,
          surname: p.lastName,
          email: p.email,
          phone: p.phone,
          birthday: p.dateOfBirth,
          nationality: p.nationality,
          cardno: p.passportNumber,
          expiration: p.passportExpiry
        })),
        lang: 'en',
        currency: data.currency || 'MXN'
      }

      const response = await this.makeRequest('/v2/booking/save_booking', {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      return {
        bookingReference: response.booking_id?.toString() || '',
        provider: this.providerName,
        status: response.status === 'confirmed' ? 'confirmed' : 'pending',
        details: {
          pnr: response.pnr,
          bookingId: response.booking_id,
          price: response.price,
          currency: response.currency,
          passengers: response.passengers
        },
        rawData: response
      }

    } catch (error) {
      this.logError('createBooking', error)
      throw error
    }
  }

  /**
   * Cancelar reserva (no soportado directamente por Kiwi API)
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult> {
    // Kiwi no tiene endpoint directo para cancelación
    // Normalmente se maneja vía customer service
    return {
      success: false,
      message: 'Cancellation must be requested through Kiwi customer service'
    }
  }

  /**
   * Buscar destinos por país
   */
  async searchByCountry(countryCode: string, dateFrom: string): Promise<SearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        fly_from: countryCode,
        date_from: dateFrom,
        partner: 'asoperadora',
        limit: '20'
      })

      const response = await this.makeRequest(`/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      return this.normalizeResults(response.data || [])
    } catch (error) {
      this.logError('searchByCountry', error)
      return []
    }
  }

  /**
   * Multi-city search
   */
  async searchMultiCity(cities: Array<{ from: string; to: string; date: string }>): Promise<SearchResult[]> {
    try {
      // Construir requests para cada tramo
      const requests = cities.map(city => ({
        fly_from: city.from,
        fly_to: city.to,
        date_from: city.date,
        date_to: city.date
      }))

      const searchParams = new URLSearchParams({
        fly_from: requests.map(r => r.fly_from).join(','),
        fly_to: requests.map(r => r.fly_to).join(','),
        date_from: requests[0].date_from,
        partner: 'asoperadora'
      })

      const response = await this.makeRequest(`/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      return this.normalizeResults(response.data || [])
    } catch (error) {
      this.logError('searchMultiCity', error)
      return []
    }
  }
}

export default KiwiAdapter
