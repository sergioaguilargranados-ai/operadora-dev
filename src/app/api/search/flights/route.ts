/**
 * API Route: GET /api/search/flights
 * Búsqueda de vuelos
 */

import { NextRequest, NextResponse } from 'next/server'

// Datos mock de vuelos
function generateMockFlights(origin: string, destination: string, date: string, adults: number) {
  const airlines = ['Aeroméxico', 'Volaris', 'VivaAerobus', 'Interjet', 'United', 'American Airlines']
  const flights = []

  for (let i = 0; i < 8; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const departureHour = 6 + Math.floor(Math.random() * 14)
    const durationHours = 1 + Math.floor(Math.random() * 4)
    const arrivalHour = departureHour + durationHours
    const basePrice = 1500 + Math.floor(Math.random() * 8000)
    const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0

    flights.push({
      id: `flight-${i + 1}-${Date.now()}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + Math.floor(Math.random() * 900)}`,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase().substring(0, 3),
      departureDate: date,
      departureTime: `${String(departureHour).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
      arrivalTime: `${String(arrivalHour % 24).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
      duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
      stops,
      stopsInfo: stops > 0 ? `${stops} escala${stops > 1 ? 's' : ''}` : 'Directo',
      price: basePrice * adults,
      pricePerPerson: basePrice,
      currency: 'MXN',
      cabinClass: 'Economy',
      seatsAvailable: 5 + Math.floor(Math.random() * 20),
      baggage: {
        carryOn: '1 pieza de 10kg',
        checked: Math.random() > 0.3 ? '1 pieza de 23kg' : 'No incluido'
      },
      amenities: ['WiFi', 'Entretenimiento', 'Snacks'].filter(() => Math.random() > 0.5),
      provider: 'mock'
    })
  }

  // Ordenar por precio
  return flights.sort((a, b) => a.price - b.price)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin') || 'MEX'
    const destination = searchParams.get('destination') || 'CUN'
    const date = searchParams.get('date') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const adults = parseInt(searchParams.get('adults') || '1')
    const returnDate = searchParams.get('returnDate')
    const cabinClass = searchParams.get('cabinClass') || 'economy'

    // Limpiar destino (quitar acentos, espacios, etc.)
    const cleanDestination = destination
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 3)
      .toUpperCase()

    // Intentar Amadeus si está configurado
    if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
      try {
        // Aquí iría la llamada a Amadeus
        // Por ahora usamos mock
        console.log('Amadeus configurado, pero usando mock por ahora')
      } catch (amadeusError) {
        console.error('Error Amadeus:', amadeusError)
      }
    }

    // Generar vuelos mock
    const outboundFlights = generateMockFlights(origin, cleanDestination, date, adults)

    // Si hay fecha de regreso, generar vuelos de regreso
    let returnFlights: any[] = []
    if (returnDate) {
      returnFlights = generateMockFlights(cleanDestination, origin, returnDate, adults)
    }

    return NextResponse.json({
      success: true,
      data: {
        outbound: outboundFlights,
        return: returnFlights
      },
      searchParams: {
        origin,
        destination: cleanDestination,
        date,
        returnDate,
        adults,
        cabinClass
      },
      count: outboundFlights.length,
      provider: 'mock'
    })

  } catch (error: any) {
    console.error('Error searching flights:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al buscar vuelos'
    }, { status: 500 })
  }
}
