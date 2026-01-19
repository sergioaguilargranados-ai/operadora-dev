import api from './api'

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
            // Mapeo de parámetros para la API
            const queryParams = {
                originLocationCode: params.origin,
                destinationLocationCode: params.destination,
                departureDate: params.date, // Formato YYYY-MM-DD
                adults: 1 // Default
            }

            const { data } = await api.get('/flights/search', { params: queryParams })

            if (data.success && data.data) {
                // Mapear respuesta de Amadeus API al modelo móvil
                return data.data.map((flight: any) => {
                    const segment = flight.itineraries[0].segments[0]
                    const airlineCode = segment.carrierCode

                    return {
                        id: flight.id,
                        airline: mapAirlineName(airlineCode), // Helper function needed or use code
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
            }
            return []
        } catch (error) {
            console.error('Error searching flights:', error)
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
