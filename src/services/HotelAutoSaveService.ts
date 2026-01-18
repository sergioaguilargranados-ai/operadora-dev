import { query } from '@/lib/db'

interface HotelFromAPI {
  id?: string
  name: string
  city: string
  location?: string
  address?: string
  price: number
  currency?: string
  rating?: number
  reviewCount?: number
  starRating?: number
  description?: string
  facilities?: string[]
  imageUrl?: string
  provider: string
  externalId: string
}

export class HotelAutoSaveService {
  /**
   * Calcula qué tan completo están los datos del hotel (0-100%)
   */
  static calculateDataCompleteness(hotel: HotelFromAPI): number {
    let score = 0
    const fields = [
      { name: 'name', weight: 15 },
      { name: 'city', weight: 15 },
      { name: 'location', weight: 10 },
      { name: 'price', weight: 10 },
      { name: 'rating', weight: 10 },
      { name: 'starRating', weight: 10 },
      { name: 'description', weight: 15 },
      { name: 'facilities', weight: 10 },
      { name: 'imageUrl', weight: 5 }
    ]

    for (const field of fields) {
      const value = hotel[field.name as keyof HotelFromAPI]
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) score += field.weight
        } else if (typeof value === 'string') {
          if (value.trim().length > 0) score += field.weight
        } else {
          score += field.weight
        }
      }
    }

    return Math.min(100, score)
  }

  /**
   * Guarda o actualiza un hotel en la base de datos
   */
  static async saveHotel(hotel: HotelFromAPI): Promise<{ success: boolean; hotelId?: number; error?: string }> {
    try {
      // Verificar si el hotel ya existe por externalId + provider
      const existingHotel = await query(
        `SELECT id, data_completeness FROM hotels
         WHERE external_id = $1 AND provider = $2 LIMIT 1`,
        [hotel.externalId, hotel.provider]
      )

      const dataCompleteness = this.calculateDataCompleteness(hotel)

      if (existingHotel.rows.length > 0) {
        // Hotel ya existe - actualizar solo si los nuevos datos son más completos
        const existingCompleteness = existingHotel.rows[0].data_completeness || 0

        if (dataCompleteness > existingCompleteness) {
          await query(
            `UPDATE hotels SET
              name = $1,
              city = $2,
              location = $3,
              price_per_night = $4,
              currency = $5,
              rating = $6,
              review_count = $7,
              star_rating = $8,
              description = $9,
              amenities = $10,
              image_url = $11,
              data_completeness = $12,
              updated_at = CURRENT_TIMESTAMP,
              needs_review = true
            WHERE id = $13`,
            [
              hotel.name,
              hotel.city,
              hotel.location || hotel.address || hotel.city,
              hotel.price,
              hotel.currency || 'MXN',
              hotel.rating || null,
              hotel.reviewCount || 0,
              hotel.starRating || 3,
              hotel.description || `Hotel en ${hotel.city}`,
              hotel.facilities || [],
              hotel.imageUrl || null,
              dataCompleteness,
              existingHotel.rows[0].id
            ]
          )

          return { success: true, hotelId: existingHotel.rows[0].id }
        } else {
          // No actualizar, los datos existentes son mejores
          return { success: true, hotelId: existingHotel.rows[0].id }
        }
      } else {
        // Hotel nuevo - insertar
        const result = await query(
          `INSERT INTO hotels (
            name, city, location, price_per_night, currency,
            rating, review_count, star_rating, description,
            amenities, image_url, provider, external_id,
            data_completeness, needs_review, is_active,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) RETURNING id`,
          [
            hotel.name,
            hotel.city,
            hotel.location || hotel.address || hotel.city,
            hotel.price,
            hotel.currency || 'MXN',
            hotel.rating || null,
            hotel.reviewCount || 0,
            hotel.starRating || 3,
            hotel.description || `Hotel en ${hotel.city}`,
            hotel.facilities || [],
            hotel.imageUrl || null,
            hotel.provider,
            hotel.externalId,
            dataCompleteness,
            dataCompleteness < 70 // Marcar para revisión si tiene menos del 70%
          ]
        )

        return { success: true, hotelId: result.rows[0].id }
      }
    } catch (error) {
      console.error('Error saving hotel:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Guarda múltiples hoteles de una búsqueda
   */
  static async saveHotelsFromSearch(hotels: HotelFromAPI[]): Promise<{
    total: number
    saved: number
    updated: number
    skipped: number
    errors: number
  }> {
    let saved = 0
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const hotel of hotels) {
      try {
        const existsQuery = await query(
          'SELECT id FROM hotels WHERE external_id = $1 AND provider = $2',
          [hotel.externalId, hotel.provider]
        )

        const result = await this.saveHotel(hotel)

        if (result.success) {
          if (existsQuery.rows.length > 0) {
            updated++
          } else {
            saved++
          }
        } else {
          errors++
        }
      } catch (error) {
        console.error(`Error processing hotel ${hotel.name}:`, error)
        errors++
      }
    }

    console.log(`📊 Hotel auto-save summary:`)
    console.log(`   Total: ${hotels.length}`)
    console.log(`   ✅ Saved: ${saved}`)
    console.log(`   🔄 Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)

    return { total: hotels.length, saved, updated, skipped, errors }
  }

  /**
   * Obtiene hoteles que necesitan revisión manual
   */
  static async getHotelsNeedingReview(limit: number = 50) {
    try {
      const result = await query(
        `SELECT id, name, city, provider, data_completeness, created_at
         FROM hotels
         WHERE needs_review = true
         ORDER BY data_completeness ASC, created_at DESC
         LIMIT $1`,
        [limit]
      )
      return result.rows
    } catch (error) {
      console.error('Error getting hotels needing review:', error)
      return []
    }
  }

  /**
   * Marca un hotel como revisado
   */
  static async markAsReviewed(hotelId: number) {
    try {
      await query(
        'UPDATE hotels SET needs_review = false WHERE id = $1',
        [hotelId]
      )
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
}

export default HotelAutoSaveService
