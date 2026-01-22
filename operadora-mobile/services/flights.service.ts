import api from './api'
import OfflineService from './offline.service'

export interface Flight {
    id: string
    airline: string
    code: string
    origin: string
    destination: string
    departure: string
    arrival: string
    price: number
    duration: string
    logo: string
}

const FlightsService = {
    search: async (params: { origin: string, destination: string, date: string }): Promise<Flight[]> => {
        try {
            // Intentar búsqueda en red
            const queryParams = {
                originLocationCode: params.origin,
                destinationLocationCode: params.destination,
                departureDate: params.date,
                adults: 1
            }

            const { data } = await api.get('/flights/search', { params: queryParams })

            if (data.success && data.data) {
                const flights = data.data.map((flight: any) => {
                    const segment = flight.itineraries[0].segments[0]
                    const airlineCode = segment.carrierCode

                    return {
                        id: flight.id,
                        airline: mapAirlineName(airlineCode),
                        code: `${airlineCode} ${segment.number}`,
                        origin: segment.departure.iataCode,
                        destination: segment.arrival.iataCode,
                        departure: formatTime(segment.departure.at),
                        arrival: formatTime(segment.arrival.at),
                        price: parseFloat(flight.price.total),
                        duration: formatDuration(flight.itineraries[0].duration),
                        logo: `https://content.r9cdn.net/rimg/provider-logos/airlines/v/${airlineCode}.png`
                    }
                })

                // Cachear resultados
                await OfflineService.cacheFlights(params, flights)

                // Guardar en historial de búsquedas
                await OfflineService.saveSearchHistory({
                    type: 'flight',
                    ...params,
                    timestamp: new Date().toISOString()
                })

                return flights
            }
            return []
        } catch (error: any) {
            console.error('Error searching flights:', error)

            // Si hay error de red, intentar obtener del cache
            if (error.message === 'Network Error' || !error.response) {
                console.log('Network error, loading flights from cache...')
                const cached = await OfflineService.getCachedFlights(params)
                if (cached) {
                    return cached
                }
            }

            throw error
        }
    }
}

// Helpers simples
const mapAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
        'AM': 'Aeroméxico',
        'Y4': 'Volaris',
        'VB': 'Viva Aerobus',
        'UA': 'United Airlines',
        'AA': 'American Airlines'
    }
    return airlines[code] || code
}

const formatTime = (isoString: string) => {
    return isoString.split('T')[1].substring(0, 5)
}

const formatDuration = (ptDuration: string) => {
    // PT2H30M -> 2h 30m
    return ptDuration.replace('PT', '').toLowerCase()
}

export default FlightsService
