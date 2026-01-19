import api from './api'

export interface HotelSearchParams {
    destination: string
    checkIn: string
    checkOut: string
    guests: number
}

export interface Hotel {
    id: string
    name: string
    location: string // Mapped from city
    price: number // Mapped from min_price
    rating: number
    image: string
    amenities: string[]
    description?: string
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
                // Default API params
                rooms: 1,
            }

            const { data } = await api.get('/hotels/search', { params: queryParams })

            if (data.success && data.data) {
                // Map API response to mobile model
                return data.data.map((hotel: any) => ({
                    id: hotel.id,
                    name: hotel.name,
                    location: hotel.city,
                    price: hotel.min_price || 0,
                    rating: hotel.rating || 0,
                    image: hotel.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
                    amenities: hotel.amenities ? hotel.amenities.slice(0, 3) : [],
                }))
            }

            return []
        } catch (error) {
            console.error('Error searching hotels:', error)
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
