/**
 * PolicyValidationService - Validación de resultados contra políticas corporativas
 */

import { db } from '@/lib/db'

interface TravelPolicy {
  id: number
  tenant_id: number
  max_flight_class: string
  max_hotel_price: number
  min_advance_days: number
  requires_approval: boolean
}

interface ValidationResult {
  isValid: boolean
  requiresApproval: boolean
  violations: string[]
  warnings: string[]
}

interface FlightValidation {
  price: number
  flightClass: string
  departureDate: string
}

interface HotelValidation {
  pricePerNight: number
  checkInDate: string
}

export class PolicyValidationService {

  /**
   * Validar vuelo contra política
   */
  static async validateFlight(
    tenantId: number,
    flightData: FlightValidation
  ): Promise<ValidationResult> {
    const policy = await this.getPolicy(tenantId)

    if (!policy) {
      return {
        isValid: true,
        requiresApproval: false,
        violations: [],
        warnings: []
      }
    }

    const violations: string[] = []
    const warnings: string[] = []
    let requiresApproval = policy.requires_approval

    // Validar clase de vuelo
    const flightClassHierarchy: Record<string, number> = {
      economy: 1,
      business: 2,
      first: 3
    }

    const requestedClass = flightData.flightClass.toLowerCase()
    const maxAllowedClass = policy.max_flight_class.toLowerCase()

    if (flightClassHierarchy[requestedClass] > flightClassHierarchy[maxAllowedClass]) {
      violations.push(
        `Clase de vuelo ${flightData.flightClass} excede el máximo permitido (${policy.max_flight_class})`
      )
      requiresApproval = true
    }

    // Validar anticipación
    const daysInAdvance = this.getDaysInAdvance(flightData.departureDate)
    if (daysInAdvance < policy.min_advance_days) {
      violations.push(
        `Anticipación de ${daysInAdvance} días menor al mínimo requerido (${policy.min_advance_days} días)`
      )
      requiresApproval = true
    } else if (daysInAdvance < policy.min_advance_days + 3) {
      warnings.push(
        `Anticipación cercana al límite mínimo (${policy.min_advance_days} días)`
      )
    }

    return {
      isValid: violations.length === 0,
      requiresApproval,
      violations,
      warnings
    }
  }

  /**
   * Validar hotel contra política
   */
  static async validateHotel(
    tenantId: number,
    hotelData: HotelValidation
  ): Promise<ValidationResult> {
    const policy = await this.getPolicy(tenantId)

    if (!policy) {
      return {
        isValid: true,
        requiresApproval: false,
        violations: [],
        warnings: []
      }
    }

    const violations: string[] = []
    const warnings: string[] = []
    let requiresApproval = policy.requires_approval

    // Validar precio de hotel
    if (hotelData.pricePerNight > policy.max_hotel_price) {
      violations.push(
        `Precio de hotel $${hotelData.pricePerNight}/noche excede el máximo permitido ($${policy.max_hotel_price})`
      )
      requiresApproval = true
    } else if (hotelData.pricePerNight > policy.max_hotel_price * 0.9) {
      warnings.push(
        `Precio cercano al límite máximo ($${policy.max_hotel_price}/noche)`
      )
    }

    // Validar anticipación
    const daysInAdvance = this.getDaysInAdvance(hotelData.checkInDate)
    if (daysInAdvance < policy.min_advance_days) {
      violations.push(
        `Anticipación de ${daysInAdvance} días menor al mínimo requerido (${policy.min_advance_days} días)`
      )
      requiresApproval = true
    }

    return {
      isValid: violations.length === 0,
      requiresApproval,
      violations,
      warnings
    }
  }

  /**
   * Validar múltiples resultados
   */
  static async validateSearchResults(
    tenantId: number,
    results: any[],
    type: 'flight' | 'hotel'
  ): Promise<any[]> {
    const policy = await this.getPolicy(tenantId)

    if (!policy) {
      return results
    }

    // Agregar validación a cada resultado
    const validatedResults = await Promise.all(
      results.map(async (result) => {
        let validation: ValidationResult

        if (type === 'flight') {
          validation = await this.validateFlight(tenantId, {
            price: result.price,
            flightClass: result.class || 'economy',
            departureDate: result.departure_date
          })
        } else {
          validation = await this.validateHotel(tenantId, {
            pricePerNight: result.price_per_night,
            checkInDate: result.check_in_date
          })
        }

        return {
          ...result,
          policyValidation: validation,
          withinPolicy: validation.isValid,
          requiresApproval: validation.requiresApproval
        }
      })
    )

    // Ordenar: primero los que cumplen la política
    return validatedResults.sort((a, b) => {
      if (a.withinPolicy && !b.withinPolicy) return -1
      if (!a.withinPolicy && b.withinPolicy) return 1
      return 0
    })
  }

  /**
   * Obtener resumen de cumplimiento
   */
  static async getComplianceSummary(
    tenantId: number,
    results: any[]
  ): Promise<{
    total: number
    withinPolicy: number
    requiresApproval: number
    percentCompliance: number
  }> {
    const total = results.length
    const withinPolicy = results.filter(r => r.withinPolicy).length
    const requiresApproval = results.filter(r => r.requiresApproval).length

    return {
      total,
      withinPolicy,
      requiresApproval,
      percentCompliance: total > 0 ? Math.round((withinPolicy / total) * 100) : 100
    }
  }

  /**
   * Helpers
   */
  private static async getPolicy(tenantId: number): Promise<TravelPolicy | null> {
    return await db.queryOne<TravelPolicy>(
      'SELECT * FROM travel_policies WHERE tenant_id = $1',
      [tenantId]
    )
  }

  private static getDaysInAdvance(dateString: string): number {
    const targetDate = new Date(dateString)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
}
