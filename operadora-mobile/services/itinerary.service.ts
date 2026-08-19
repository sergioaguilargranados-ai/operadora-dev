import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'

export interface ItineraryDay {
  day: number
  title: string
  desc?: string
  description?: string
  hero_image?: string
  image_url?: string
  places?: Array<{
    name: string
    desc?: string
    image?: string
    gallery?: string[]
  }>
  gastronomy?: Array<{
    name: string
    desc?: string
    image?: string
    ingredients?: string[]
  }>
  activities?: string[]
}

export interface ItineraryData {
  id?: string
  tour_id?: string
  title: string
  destination: string
  description?: string
  days: ItineraryDay[]
  hero_image?: string
}

class ItineraryService {
  private CACHE_PREFIX = 'offline_itinerary_'

  /**
   * Obtener itinerario (con soporte offline transparente)
   */
  async getItinerary(tourId: string): Promise<ItineraryData | null> {
    try {
      // 1. Intentar red primero
      const res = await api.get(`/itineraries/${tourId}`)
      if (res.data?.success && res.data?.data) {
        let item = res.data.data
        if (typeof item.days === 'string') {
          try {
            item.days = JSON.parse(item.days)
          } catch (e) {
            item.days = []
          }
        }
        // Guardar en cache offline
        await this.cacheItinerary(tourId, item)
        return item
      }

      // 2. Fallback a /api/groups
      const resGroup = await api.get(`/groups/${tourId}`)
      if (resGroup.data?.success && resGroup.data?.data) {
        const pkg = resGroup.data.data
        const generatedDays = (pkg.itinerary || []).map((d: any, i: number) => ({
          day: d.day || i + 1,
          title: d.title || `Día ${i + 1}`,
          desc: d.description || '',
          description: d.description || '',
          hero_image: pkg.images?.main || '',
          places: [{ name: pkg.region || 'Ubicación' }],
        }))

        const fallbackItem: ItineraryData = {
          tour_id: tourId,
          title: pkg.name,
          destination: pkg.region,
          description: pkg.description || '',
          days: generatedDays,
          hero_image: pkg.images?.main,
        }

        await this.cacheItinerary(tourId, fallbackItem)
        return fallbackItem
      }
    } catch (err) {
      console.warn('Network error fetching itinerary, falling back to cache', err)
    }

    // 3. Fallback a cache local
    return this.getCachedItinerary(tourId)
  }

  /**
   * Guardar en cache local
   */
  async cacheItinerary(tourId: string, data: ItineraryData): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.CACHE_PREFIX}${tourId}`, JSON.stringify(data))
    } catch (e) {
      console.error('Error caching itinerary', e)
    }
  }

  /**
   * Leer del cache local
   */
  async getCachedItinerary(tourId: string): Promise<ItineraryData | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${tourId}`)
      return cached ? JSON.parse(cached) : null
    } catch (e) {
      console.error('Error reading cached itinerary', e)
      return null
    }
  }
}

export default new ItineraryService()
