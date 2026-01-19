import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Booking {
    id: string
    type: 'flight' | 'hotel' | 'auto' | 'tour'
    title: string
    date: string
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
    details: string
    image: string
    confirmationCode: string
}

const CACHE_KEY = 'user_bookings_cache'

const BookingsService = {
    // Obtener reservas (Estrategia: Network First -> Fallback Cache)
    getMyBookings: async (): Promise<Booking[]> => {
        try {
            // 1. Intentar obtener de la red
            const { data } = await api.get('/bookings/my-bookings')

            if (data.success && data.data) {
                // Mapear respuesta del backend al modelo móvil
                const mappedBookings = data.data.map(mapBookingFromApi)

                // 2. Guardar en cache (AsyncStorage) para uso offline
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mappedBookings))

                return mappedBookings
            }
            return []
        } catch (error) {
            console.log('Error fetching bookings (Network). Trying cache...', error)

            // 3. Si falla la red, intentar leer del cache
            const cachedData = await AsyncStorage.getItem(CACHE_KEY)
            if (cachedData) {
                console.log('Returning cached bookings')
                return JSON.parse(cachedData)
            }

            // Si no hay red ni cache, lanzar error o retornar vacío
            throw error
        }
    },

    // Obtener detalle de una reserva específica (Network First -> Cache)
    getBookingDetails: async (id: string) => {
        const DETAIL_KEY = `booking_detail_${id}`
        try {
            const { data } = await api.get(`/bookings/${id}`)
            if (data.success) {
                await AsyncStorage.setItem(DETAIL_KEY, JSON.stringify(data.data))
                return data.data
            }
        } catch (error) {
            const cachedDetail = await AsyncStorage.getItem(DETAIL_KEY)
            if (cachedDetail) return JSON.parse(cachedDetail)
            throw error
        }
    },

    // Crear una nueva reserva
    createBooking: async (bookingData: any) => {
        try {
            const { data } = await api.post('/bookings', bookingData)
            return data
        } catch (error) {
            console.error('Error creating booking:', error)
            throw error
        }
    }
}

// Helper para mapear lo que viene del backend a lo que usa la UI móvil
const mapBookingFromApi = (item: any): Booking => {
    // Determinar tipo basado en la data (ajustar según tu estructura real de BD)
    let type: Booking['type'] = 'hotel'
    let image = 'https://source.unsplash.com/800x600/?travel'

    if (item.type === 'flight' || item.flight_id) {
        type = 'flight'
        image = 'https://source.unsplash.com/800x600/?plane,sky'
    } else if (item.type === 'hotel' || item.hotel_id) {
        type = 'hotel'
        image = 'https://source.unsplash.com/800x600/?hotel,luxury'
    }

    return {
        id: item.id,
        type,
        title: item.service_name || 'Reserva',
        date: new Date(item.created_at).toLocaleDateString(), // Simplificado
        status: item.booking_status || 'confirmed',
        details: item.booking_reference || 'Sin referencia',
        image,
        confirmationCode: item.booking_reference
    }
}

export default BookingsService
