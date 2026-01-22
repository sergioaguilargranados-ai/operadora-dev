import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CachedBooking {
    id: number
    service_type: string
    service_name: string
    booking_status: string
    payment_status: string
    total_price: number
    booking_details: any
    created_at: string
    cached_at: string
}

export interface CachedFlight {
    id: string
    airline: string
    origin: string
    destination: string
    departure: string
    arrival: string
    price: number
    cached_at: string
}

export interface CachedHotel {
    id: string
    name: string
    location: string
    price: number
    rating: number
    image: string
    cached_at: string
}

class OfflineService {
    private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

    // Keys para AsyncStorage
    private readonly KEYS = {
        BOOKINGS: 'offline_bookings',
        FLIGHTS: 'offline_flights',
        HOTELS: 'offline_hotels',
        LAST_SYNC: 'offline_last_sync',
        SEARCH_HISTORY: 'offline_search_history',
    }

    /**
     * Guardar reservas en cache
     */
    async cacheBookings(bookings: any[]): Promise<void> {
        try {
            const cachedBookings: CachedBooking[] = bookings.map(booking => ({
                ...booking,
                cached_at: new Date().toISOString(),
            }))

            await AsyncStorage.setItem(
                this.KEYS.BOOKINGS,
                JSON.stringify(cachedBookings)
            )
            await this.updateLastSync()
        } catch (error) {
            console.error('Error caching bookings:', error)
        }
    }

    /**
     * Obtener reservas del cache
     */
    async getCachedBookings(): Promise<CachedBooking[]> {
        try {
            const cached = await AsyncStorage.getItem(this.KEYS.BOOKINGS)
            if (!cached) return []

            const bookings: CachedBooking[] = JSON.parse(cached)

            // Filtrar reservas expiradas
            const now = new Date().getTime()
            return bookings.filter(booking => {
                const cachedTime = new Date(booking.cached_at).getTime()
                return (now - cachedTime) < this.CACHE_EXPIRY
            })
        } catch (error) {
            console.error('Error getting cached bookings:', error)
            return []
        }
    }

    /**
     * Guardar búsqueda de vuelos en cache
     */
    async cacheFlights(searchParams: any, flights: any[]): Promise<void> {
        try {
            const key = `${this.KEYS.FLIGHTS}_${JSON.stringify(searchParams)}`
            const cachedFlights: CachedFlight[] = flights.map(flight => ({
                ...flight,
                cached_at: new Date().toISOString(),
            }))

            await AsyncStorage.setItem(key, JSON.stringify(cachedFlights))
        } catch (error) {
            console.error('Error caching flights:', error)
        }
    }

    /**
     * Obtener vuelos del cache
     */
    async getCachedFlights(searchParams: any): Promise<CachedFlight[] | null> {
        try {
            const key = `${this.KEYS.FLIGHTS}_${JSON.stringify(searchParams)}`
            const cached = await AsyncStorage.getItem(key)
            if (!cached) return null

            const flights: CachedFlight[] = JSON.parse(cached)

            // Verificar si el cache está vigente
            if (flights.length > 0) {
                const cachedTime = new Date(flights[0].cached_at).getTime()
                const now = new Date().getTime()

                if ((now - cachedTime) < this.CACHE_EXPIRY) {
                    return flights
                }
            }

            return null
        } catch (error) {
            console.error('Error getting cached flights:', error)
            return null
        }
    }

    /**
     * Guardar búsqueda de hoteles en cache
     */
    async cacheHotels(searchParams: any, hotels: any[]): Promise<void> {
        try {
            const key = `${this.KEYS.HOTELS}_${JSON.stringify(searchParams)}`
            const cachedHotels: CachedHotel[] = hotels.map(hotel => ({
                ...hotel,
                cached_at: new Date().toISOString(),
            }))

            await AsyncStorage.setItem(key, JSON.stringify(cachedHotels))
        } catch (error) {
            console.error('Error caching hotels:', error)
        }
    }

    /**
     * Obtener hoteles del cache
     */
    async getCachedHotels(searchParams: any): Promise<CachedHotel[] | null> {
        try {
            const key = `${this.KEYS.HOTELS}_${JSON.stringify(searchParams)}`
            const cached = await AsyncStorage.getItem(key)
            if (!cached) return null

            const hotels: CachedHotel[] = JSON.parse(cached)

            // Verificar si el cache está vigente
            if (hotels.length > 0) {
                const cachedTime = new Date(hotels[0].cached_at).getTime()
                const now = new Date().getTime()

                if ((now - cachedTime) < this.CACHE_EXPIRY) {
                    return hotels
                }
            }

            return null
        } catch (error) {
            console.error('Error getting cached hotels:', error)
            return null
        }
    }

    /**
     * Guardar historial de búsquedas
     */
    async saveSearchHistory(search: any): Promise<void> {
        try {
            const history = await this.getSearchHistory()
            const updated = [search, ...history.slice(0, 9)] // Mantener últimas 10

            await AsyncStorage.setItem(
                this.KEYS.SEARCH_HISTORY,
                JSON.stringify(updated)
            )
        } catch (error) {
            console.error('Error saving search history:', error)
        }
    }

    /**
     * Obtener historial de búsquedas
     */
    async getSearchHistory(): Promise<any[]> {
        try {
            const history = await AsyncStorage.getItem(this.KEYS.SEARCH_HISTORY)
            return history ? JSON.parse(history) : []
        } catch (error) {
            console.error('Error getting search history:', error)
            return []
        }
    }

    /**
     * Limpiar historial de búsquedas
     */
    async clearSearchHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.KEYS.SEARCH_HISTORY)
        } catch (error) {
            console.error('Error clearing search history:', error)
        }
    }

    /**
     * Actualizar timestamp de última sincronización
     */
    private async updateLastSync(): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.KEYS.LAST_SYNC,
                new Date().toISOString()
            )
        } catch (error) {
            console.error('Error updating last sync:', error)
        }
    }

    /**
     * Obtener timestamp de última sincronización
     */
    async getLastSync(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(this.KEYS.LAST_SYNC)
        } catch (error) {
            console.error('Error getting last sync:', error)
            return null
        }
    }

    /**
     * Limpiar todo el cache
     */
    async clearAllCache(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys()
            const offlineKeys = keys.filter(key =>
                key.startsWith('offline_')
            )
            await AsyncStorage.multiRemove(offlineKeys)
        } catch (error) {
            console.error('Error clearing cache:', error)
        }
    }

    /**
     * Obtener tamaño del cache (aproximado)
     */
    async getCacheSize(): Promise<number> {
        try {
            const keys = await AsyncStorage.getAllKeys()
            const offlineKeys = keys.filter(key => key.startsWith('offline_'))

            let totalSize = 0
            for (const key of offlineKeys) {
                const value = await AsyncStorage.getItem(key)
                if (value) {
                    totalSize += value.length
                }
            }

            return totalSize
        } catch (error) {
            console.error('Error getting cache size:', error)
            return 0
        }
    }
}

export default new OfflineService()
