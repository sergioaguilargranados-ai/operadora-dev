/**
 * Adapter Base para Proveedores de APIs
 * Implementa el patrón Adapter para normalizar respuestas de diferentes proveedores
 */

export interface SearchParams {
  [key: string]: any
}

export interface SearchResult {
  id: string
  provider: string
  type: string
  price: number
  currency: string
  details: any
  rawData?: any
  expiresAt?: Date
}

export interface BookingData {
  offerId: string
  travelerInfo: any
  paymentInfo?: any
  [key: string]: any
}

export interface BookingConfirmation {
  bookingReference: string
  provider: string
  status: string
  details: any
  rawData?: any
}

export interface CancellationResult {
  success: boolean
  refundAmount?: number
  cancellationFee?: number
  message?: string
}

/**
 * Interface que todos los adaptadores deben implementar
 */
export interface ProviderAdapter {
  search(params: SearchParams): Promise<SearchResult[]>
  getDetails(id: string): Promise<any>
  createBooking(data: BookingData): Promise<BookingConfirmation>
  cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult>
  checkAvailability?(id: string): Promise<boolean>
}

/**
 * Clase base abstracta con funcionalidades comunes
 */
export abstract class BaseProviderAdapter implements ProviderAdapter {
  protected providerName: string
  protected apiEndpoint: string
  protected apiKey: string
  protected timeout: number = 30000 // 30 segundos default

  constructor(providerName: string, apiEndpoint: string, apiKey: string) {
    this.providerName = providerName
    this.apiEndpoint = apiEndpoint
    this.apiKey = apiKey
  }

  /**
   * Métodos abstractos que cada proveedor debe implementar
   */
  abstract search(params: SearchParams): Promise<SearchResult[]>
  abstract getDetails(id: string): Promise<any>
  abstract createBooking(data: BookingData): Promise<BookingConfirmation>
  abstract cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult>

  /**
   * Método auxiliar para hacer requests HTTP
   */
  protected async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiEndpoint}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }

      throw error
    }
  }

  /**
   * Normalizar precio a número
   */
  protected normalizePrice(price: any): number {
    if (typeof price === 'number') return price
    if (typeof price === 'string') return parseFloat(price.replace(/[^0-9.]/g, ''))
    return 0
  }

  /**
   * Normalizar fecha a ISO string
   */
  protected normalizeDate(date: any): string {
    if (date instanceof Date) return date.toISOString()
    if (typeof date === 'string') return new Date(date).toISOString()
    return new Date().toISOString()
  }

  /**
   * Logging de errores
   */
  protected logError(method: string, error: any): void {
    console.error(`[${this.providerName}] Error in ${method}:`, error)
  }

  /**
   * Validar parámetros requeridos
   */
  protected validateRequiredParams(params: any, required: string[]): void {
    const missing = required.filter(field => !params[field])

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`)
    }
  }

  /**
   * Rate limiting check (básico)
   */
  protected async checkRateLimit(): Promise<void> {
    // TODO: Implementar rate limiting desde BD
    // Por ahora solo un placeholder
    return Promise.resolve()
  }

  /**
   * Retry logic para requests fallidos
   */
  protected async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0) throw error

      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryRequest(fn, retries - 1, delay * 2)
    }
  }
}

/**
 * Ejemplo de uso:
 *
 * class AmadeusAdapter extends BaseProviderAdapter {
 *   async search(params: SearchParams): Promise<SearchResult[]> {
 *     this.validateRequiredParams(params, ['origin', 'destination', 'date'])
 *     await this.checkRateLimit()
 *
 *     const data = await this.makeRequest('/shopping/flight-offers', {
 *       method: 'GET',
 *       headers: { 'Authorization': `Bearer ${this.apiKey}` }
 *     })
 *
 *     return this.normalizeResults(data)
 *   }
 *
 *   private normalizeResults(data: any): SearchResult[] {
 *     // Convertir formato de Amadeus a formato estándar
 *     return data.map(item => ({
 *       id: item.id,
 *       provider: this.providerName,
 *       type: 'flight',
 *       price: this.normalizePrice(item.price.total),
 *       currency: item.price.currency,
 *       details: { ... },
 *       rawData: item
 *     }))
 *   }
 * }
 */
