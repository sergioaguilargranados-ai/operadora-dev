import { NextRequest, NextResponse } from 'next/server'
import { AmadeusAdapter } from '@/services/providers/AmadeusAdapter'
import SearchService from '@/services/SearchService'

/**
 * GET /api/packages/search
 * Busca paquetes combinando vuelos + hoteles
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '2')
    const rooms = parseInt(searchParams.get('rooms') || '1')
    const cabinClass = searchParams.get('cabinClass') || 'economy'
    const currency = searchParams.get('currency') || 'MXN'

    // Validaciones
    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros requeridos: destination, checkIn, checkOut'
      }, { status: 400 })
    }

    // Calcular noches
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights < 1) {
      return NextResponse.json({
        success: false,
        error: 'La fecha de regreso debe ser posterior a la fecha de salida'
      }, { status: 400 })
    }

    let packages: PackageResult[] = []
    let flightResults: FlightData[] = []
    let hotelResults: HotelData[] = []

    // Intentar obtener datos reales de Amadeus
    const hasAmadeus = process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET

    if (hasAmadeus && origin) {
      try {
        // Buscar vuelos
        const amadeus = new AmadeusAdapter(
          process.env.AMADEUS_API_KEY!,
          process.env.AMADEUS_API_SECRET!,
          process.env.AMADEUS_SANDBOX !== 'false'
        )

        const travelClassMap: Record<string, string> = {
          'economy': 'ECONOMY',
          'business': 'BUSINESS',
          'first': 'FIRST'
        }

        const flights = await amadeus.search({
          originLocationCode: origin.toUpperCase(),
          destinationLocationCode: destination.toUpperCase(),
          departureDate: checkIn,
          returnDate: checkOut,
          adults: guests,
          travelClass: travelClassMap[cabinClass] || 'ECONOMY',
          maxResults: 5
        })

        flightResults = flights.map((f) => ({
          id: String(f.id),
          price: Number(f.price) || 0,
          airline: (f.details as any)?.airline || 'Aerolínea',
          duration: (f.details as any)?.outbound?.duration,
          stops: (f.details as any)?.outbound?.stops || 0,
          departureTime: (f.details as any)?.outbound?.departureTime,
          arrivalTime: (f.details as any)?.outbound?.arrivalTime
        }))

        // Buscar hoteles
        const hotels = await SearchService.searchHotels({
          city: destination,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: guests,
          rooms,
          currency
        })

        hotelResults = hotels.slice(0, 5).map((h) => ({
          id: String(h.id),
          name: (h.details as any)?.hotelName || 'Hotel',
          price: Number(h.price) || 0,
          rating: (h.details as any)?.rating || 4,
          stars: (h.details as any)?.starRating || 4,
          image: (h.details as any)?.images?.[0] || getDefaultHotelImage(destination)
        }))

      } catch (apiError) {
        console.error('Error al buscar con Amadeus:', apiError)
      }
    }

    // Combinar vuelos + hoteles en paquetes
    if (flightResults.length > 0 && hotelResults.length > 0) {
      packages = combinePackages(flightResults, hotelResults, nights, guests, destination)
    } else {
      // Usar datos mock
      packages = getMockPackages(origin, destination, nights, guests, cabinClass)
    }

    return NextResponse.json({
      success: true,
      data: packages,
      total: packages.length,
      searchParams: {
        origin,
        destination,
        checkIn,
        checkOut,
        nights,
        guests,
        rooms,
        cabinClass
      },
      source: flightResults.length > 0 ? 'amadeus' : 'mock'
    })

  } catch (error) {
    console.error('Error en búsqueda de paquetes:', error)

    // Fallback a mock
    const destination = request.nextUrl.searchParams.get('destination') || ''
    const mockPackages = getMockPackages(null, destination, 5, 2, 'economy')

    return NextResponse.json({
      success: true,
      data: mockPackages,
      total: mockPackages.length,
      source: 'mock'
    })
  }
}

interface FlightData {
  id: string
  price: number
  airline: string
  duration?: string
  stops: number
  departureTime?: string
  arrivalTime?: string
}

interface HotelData {
  id: string
  name: string
  price: number
  rating: number
  stars: number
  image: string
}

interface PackageResult {
  id: string
  destination: string
  city: string
  country: string
  duration: number
  includes: string[]
  hotel: {
    name: string
    stars: number
    rating: number
    image: string
    mealPlan: string
  }
  flight: {
    airline: string
    departureTime: string
    arrivalTime: string
    stops: number
  }
  price: number
  originalPrice: number
  currency: string
  savings: number
  image: string
  featured: boolean
  allInclusive: boolean
}

/**
 * Combina vuelos y hoteles en paquetes
 */
function combinePackages(
  flights: FlightData[],
  hotels: HotelData[],
  nights: number,
  guests: number,
  destination: string
): PackageResult[] {
  const packages: PackageResult[] = []

  // Crear combinaciones
  for (let i = 0; i < Math.min(flights.length, 3); i++) {
    for (let j = 0; j < Math.min(hotels.length, 2); j++) {
      const flight = flights[i]
      const hotel = hotels[j]

      const flightPrice = flight.price || 0
      const hotelPrice = (hotel.price || 0) * nights
      const totalPrice = flightPrice + hotelPrice

      // Descuento por paquete (10-15%)
      const discount = 0.10 + (Math.random() * 0.05)
      const packagePrice = Math.round(totalPrice * (1 - discount))

      packages.push({
        id: `pkg-${flight.id}-${hotel.id}`,
        destination: destination,
        city: destination,
        country: getCountry(destination),
        duration: nights,
        includes: ['flight', 'hotel', 'transfer'],
        hotel: {
          name: hotel.name,
          stars: hotel.stars,
          rating: hotel.rating,
          image: hotel.image,
          mealPlan: hotel.stars >= 5 ? 'Todo Incluido' : 'Desayuno incluido'
        },
        flight: {
          airline: flight.airline,
          departureTime: flight.departureTime || '08:00',
          arrivalTime: flight.arrivalTime || '11:00',
          stops: flight.stops
        },
        price: packagePrice,
        originalPrice: totalPrice,
        currency: 'MXN',
        savings: totalPrice - packagePrice,
        image: getDestinationImage(destination),
        featured: i === 0 && j === 0,
        allInclusive: hotel.stars >= 5
      })
    }
  }

  return packages.sort((a, b) => a.price - b.price)
}

/**
 * Paquetes mock cuando no hay API
 */
function getMockPackages(
  origin: string | null,
  destination: string,
  nights: number,
  guests: number,
  cabinClass: string
): PackageResult[] {
  const destinationLower = destination.toLowerCase()

  const allPackages: PackageResult[] = [
    {
      id: "pkg-1",
      destination: "Cancún",
      city: "Cancún",
      country: "México",
      duration: nights || 5,
      includes: ['flight', 'hotel', 'transfer'],
      hotel: {
        name: "Grand Fiesta Americana Coral Beach",
        stars: 5,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        mealPlan: "Todo Incluido"
      },
      flight: {
        airline: "Aeroméxico",
        departureTime: "08:30",
        arrivalTime: "11:15",
        stops: 0
      },
      price: 24500 * guests,
      originalPrice: 32000 * guests,
      currency: "MXN",
      savings: 7500 * guests,
      image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800",
      featured: true,
      allInclusive: true
    },
    {
      id: "pkg-2",
      destination: "Los Cabos",
      city: "Los Cabos",
      country: "México",
      duration: nights || 4,
      includes: ['flight', 'hotel', 'transfer', 'activities'],
      hotel: {
        name: "Marquis Los Cabos Resort & Spa",
        stars: 5,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        mealPlan: "Desayuno incluido"
      },
      flight: {
        airline: "Volaris",
        departureTime: "06:45",
        arrivalTime: "09:30",
        stops: 0
      },
      price: 28900 * guests,
      originalPrice: 35500 * guests,
      currency: "MXN",
      savings: 6600 * guests,
      image: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800",
      featured: true,
      allInclusive: false
    },
    {
      id: "pkg-3",
      destination: "Playa del Carmen",
      city: "Playa del Carmen",
      country: "México",
      duration: nights || 6,
      includes: ['flight', 'hotel', 'transfer'],
      hotel: {
        name: "Xcaret México",
        stars: 5,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        mealPlan: "Todo Incluido + Parques"
      },
      flight: {
        airline: "VivaAerobus",
        departureTime: "07:00",
        arrivalTime: "09:45",
        stops: 0
      },
      price: 42500 * guests,
      originalPrice: 55000 * guests,
      currency: "MXN",
      savings: 12500 * guests,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      featured: false,
      allInclusive: true
    },
    {
      id: "pkg-4",
      destination: "Puerto Vallarta",
      city: "Puerto Vallarta",
      country: "México",
      duration: nights || 5,
      includes: ['flight', 'hotel'],
      hotel: {
        name: "Secrets Vallarta Bay Resort",
        stars: 4,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        mealPlan: "Solo hospedaje"
      },
      flight: {
        airline: "Aeroméxico",
        departureTime: "10:30",
        arrivalTime: "12:15",
        stops: 0
      },
      price: 18500 * guests,
      originalPrice: 22000 * guests,
      currency: "MXN",
      savings: 3500 * guests,
      image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800",
      featured: false,
      allInclusive: false
    },
    {
      id: "pkg-5",
      destination: "Miami",
      city: "Miami",
      country: "Estados Unidos",
      duration: nights || 7,
      includes: ['flight', 'hotel', 'insurance'],
      hotel: {
        name: "Fontainebleau Miami Beach",
        stars: 5,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        mealPlan: "Desayuno incluido"
      },
      flight: {
        airline: "American Airlines",
        departureTime: "08:00",
        arrivalTime: "14:30",
        stops: 0
      },
      price: 45000 * guests,
      originalPrice: 58000 * guests,
      currency: "MXN",
      savings: 13000 * guests,
      image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800",
      featured: true,
      allInclusive: false
    },
    {
      id: "pkg-6",
      destination: "Punta Cana",
      city: "Punta Cana",
      country: "República Dominicana",
      duration: nights || 5,
      includes: ['flight', 'hotel', 'transfer', 'insurance'],
      hotel: {
        name: "Hard Rock Hotel Punta Cana",
        stars: 5,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        mealPlan: "Todo Incluido"
      },
      flight: {
        airline: "Copa Airlines",
        departureTime: "06:00",
        arrivalTime: "16:30",
        stops: 1
      },
      price: 38500 * guests,
      originalPrice: 48000 * guests,
      currency: "MXN",
      savings: 9500 * guests,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      featured: false,
      allInclusive: true
    }
  ]

  // Filtrar por destino si se especifica
  if (destination && destination.length > 2) {
    const filtered = allPackages.filter(p =>
      p.destination.toLowerCase().includes(destinationLower) ||
      p.city.toLowerCase().includes(destinationLower) ||
      p.country.toLowerCase().includes(destinationLower)
    )
    if (filtered.length > 0) return filtered
  }

  return allPackages
}

function getCountry(destination: string): string {
  const countries: Record<string, string> = {
    'cancun': 'México',
    'cancún': 'México',
    'playa del carmen': 'México',
    'los cabos': 'México',
    'puerto vallarta': 'México',
    'miami': 'Estados Unidos',
    'orlando': 'Estados Unidos',
    'las vegas': 'Estados Unidos',
    'punta cana': 'República Dominicana',
    'paris': 'Francia',
    'madrid': 'España',
    'barcelona': 'España'
  }
  return countries[destination.toLowerCase()] || 'México'
}

function getDestinationImage(destination: string): string {
  const images: Record<string, string> = {
    'cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
    'cancún': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
    'los cabos': 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800',
    'miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800',
    'playa del carmen': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  }
  return images[destination.toLowerCase()] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
}

function getDefaultHotelImage(destination: string): string {
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
}
