import api from './api'

export interface Auto {
    id: string
    name: string
    type: string // Economy, SUV, etc.
    price: number
    currency: string
    image: string
    provider: string
    transmission: string
    passengers: number
    doors: number
    bags: number
}

const AutosService = {
    search: async (params: { pickup: string, dropoff: string, pickupDate: string, dropoffDate: string }): Promise<Auto[]> => {
        try {
            const queryParams = {
                pickupLocation: params.pickup,
                dropoffLocation: params.dropoff,
                pickupDate: params.pickupDate,
                dropoffDate: params.dropoffDate
            }

            const { data } = await api.get('/cars/search', { params: queryParams })

            if (data.success && data.data) {
                // Map Amadeus/Provider response to simple mobile model
                return data.data.map((car: any) => ({
                    id: car.id,
                    name: `${car.vehicle.make} ${car.vehicle.model}`,
                    type: car.vehicle.category,
                    price: parseFloat(car.price.total),
                    currency: car.price.currency,
                    image: car.vehicle.image || 'https://source.unsplash.com/800x600/?car',
                    provider: car.provider?.company_name || 'Agencia',
                    transmission: car.vehicle.transmission === 'A' ? 'Automática' : 'Manual',
                    passengers: car.vehicle.seats || 4,
                    doors: car.vehicle.doors || 4,
                    bags: 2
                }))
            }
            return []
        } catch (error) {
            console.error('Error searching autos:', error)
            throw error
        }
    }
}

export default AutosService
