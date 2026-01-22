import api from './api'
import OfflineService from './offline.service'

export interface HotelSearchParams {
    destination: string
    checkIn: string
    checkOut: string
    guests: number
}

export interface Hotel {
    id: string
    name: string
    location: string
    price: number
    rating: number
    image: string
    amenities: string[]
    description?: string
    latitude?: number
    longitude?: number
}

const HotelsService = {
    search: async (params: HotelSearchParams): Promise<Hotel[]> => {
        try {
            // Mapping frontend params to API params
            const queryParams = {
                destination: params.destination,
                checkIn: params.checkIn,
                checkOut: params.checkOut,
                adults: params.guests,
                rooms: 1,
            }

            const { data } = await api.get('/hotels/search', { params: queryParams })

            if (data.success && data.data) {
                const hotels = data.data.map((hotel: any) => ({
                    id: hotel.id,
                    name: hotel.name,
                    location: hotel.city,
                    price: hotel.min_price || 0,
                    rating: hotel.rating || 0,
                    image: hotel.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
                    amenities: hotel.amenities ? hotel.amenities.slice(0, 3) : [],
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                }))

                // Cachear resultados
                await OfflineService.cacheHotels(params, hotels)

                // Guardar en historial de búsquedas
                await OfflineService.saveSearchHistory({
                    type: 'hotel',
                    ...params,
                    timestamp: new Date().toISOString()
                })

                return hotels
            }

            return []
        } catch (error: any) {
            console.error('Error searching hotels:', error)

            // Si hay error de red, intentar obtener del cache
            if (error.message === 'Network Error' || !error.response) {
                console.log('Network error, loading hotels from cache...')
                const cached = await OfflineService.getCachedHotels(params)
                if (cached) {
                    return cached
                }
            }

            throw error
        }
    },

    getDetails: async (id: string) => {
        try {
            const { data } = await api.get(`/hotels/${id}`)
            return data.data
        } catch (error) {
            console.error('Error getting hotel details:', error)
            throw error
        }
    }
}

export default HotelsService
