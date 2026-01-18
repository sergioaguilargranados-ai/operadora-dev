"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, Plane, Hotel, Star, MapPin, Calendar, Users,
  Check, Clock, Bus, Shield, Activity, Utensils, Wifi,
  Car, Heart, Share2, Phone, Mail, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

interface PackageDetails {
  id: string
  destination: string
  city: string
  country: string
  duration: number
  description: string
  includes: string[]
  hotel: {
    name: string
    stars: number
    rating: number
    reviews: number
    image: string
    mealPlan: string
    address: string
    amenities: string[]
  }
  flight: {
    outbound: {
      airline: string
      airlineLogo: string
      flightNumber: string
      departure: string
      arrival: string
      departureTime: string
      arrivalTime: string
      duration: string
    }
    return: {
      airline: string
      airlineLogo: string
      flightNumber: string
      departure: string
      arrival: string
      departureTime: string
      arrivalTime: string
      duration: string
    }
  }
  transfers: boolean
  activities: string[]
  insurance: boolean
  price: number
  originalPrice: number
  currency: string
  savings: number
  images: string[]
  itinerary: { day: number; title: string; description: string }[]
}

// Mock data para el paquete
const mockPackage: PackageDetails = {
  id: "1",
  destination: "Cancún",
  city: "Cancún",
  country: "México",
  duration: 5,
  description: "Disfruta de 5 noches en el paradisíaco Caribe mexicano con vuelo redondo, hospedaje todo incluido y traslados. El paquete perfecto para unas vacaciones inolvidables en las playas de Cancún.",
  includes: ["Vuelo redondo", "5 noches de hospedaje", "Todo incluido", "Traslados aeropuerto-hotel-aeropuerto", "Impuestos incluidos"],
  hotel: {
    name: "Grand Fiesta Americana Coral Beach",
    stars: 5,
    rating: 4.8,
    reviews: 2345,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    mealPlan: "Todo Incluido",
    address: "Boulevard Kukulcán Km 9.5, Zona Hotelera, Cancún",
    amenities: ["Piscina infinity", "Spa", "Gimnasio", "Restaurantes gourmet", "Bar en la playa", "WiFi gratis", "Room service 24h"]
  },
  flight: {
    outbound: {
      airline: "Aeroméxico",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AM.png",
      flightNumber: "AM 456",
      departure: "MEX",
      arrival: "CUN",
      departureTime: "08:30",
      arrivalTime: "11:15",
      duration: "2h 45m"
    },
    return: {
      airline: "Aeroméxico",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AM.png",
      flightNumber: "AM 457",
      departure: "CUN",
      arrival: "MEX",
      departureTime: "16:00",
      arrivalTime: "18:45",
      duration: "2h 45m"
    }
  },
  transfers: true,
  activities: ["Tour a Chichén Itzá (opcional)", "Snorkel en Isla Mujeres (opcional)"],
  insurance: true,
  price: 24500,
  originalPrice: 32000,
  currency: "MXN",
  savings: 7500,
  images: [
    "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
  ],
  itinerary: [
    { day: 1, title: "Llegada a Cancún", description: "Recepción en el aeropuerto y traslado al hotel. Check-in y tarde libre para disfrutar del resort." },
    { day: 2, title: "Día de playa", description: "Día completo para disfrutar de las instalaciones del hotel, playa y actividades acuáticas." },
    { day: 3, title: "Tour opcional", description: "Opción de tour a Chichén Itzá o día libre en el hotel." },
    { day: 4, title: "Relax total", description: "Disfruta del spa, piscinas o explora la zona hotelera." },
    { day: 5, title: "Último día", description: "Mañana libre. Check-out y traslado al aeropuerto para tu vuelo de regreso." }
  ]
}

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [packageData, setPackageData] = useState<PackageDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [guests, setGuests] = useState(2)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Simular carga de datos
    setLoading(true)
    setTimeout(() => {
      setPackageData(mockPackage)
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleReserve = () => {
    if (!packageData) return
    const bookingData = {
      type: 'package',
      package: packageData,
      destination: packageData.destination,
      guests: guests,
      totalPrice: packageData.price * guests,
      currency: packageData.currency
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push('/confirmar-reserva?type=package')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Paquete no encontrado</p>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-80 md:h-96 rounded-xl overflow-hidden"
          >
            <img
              src={packageData.images[selectedImage]}
              alt={packageData.destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Todo Incluido
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            {packageData.images.slice(0, 4).map((img, index) => (
              <div
                key={index}
                className={`relative h-36 md:h-44 rounded-lg overflow-hidden cursor-pointer ${selectedImage === index ? 'ring-2 ring-blue-600' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contenido principal */}
          <div className="flex-1">
            {/* Título y descripción */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{packageData.city}, {packageData.country}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Paquete {packageData.destination} - {packageData.duration} noches
              </h1>
              <p className="text-gray-600">{packageData.description}</p>
            </div>

            {/* Lo que incluye */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                Lo que incluye tu paquete
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {packageData.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Hotel */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Hotel className="w-6 h-6 text-blue-600" />
                Tu hotel
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={packageData.hotel.image}
                  alt={packageData.hotel.name}
                  className="w-full md:w-48 h-36 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{packageData.hotel.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: packageData.hotel.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {packageData.hotel.rating} ({packageData.hotel.reviews} reseñas)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {packageData.hotel.address}
                  </p>
                  <div className="bg-green-100 text-green-800 inline-block px-3 py-1 rounded-full text-sm font-medium mb-3">
                    <Utensils className="w-4 h-4 inline mr-1" />
                    {packageData.hotel.mealPlan}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {packageData.hotel.amenities.slice(0, 5).map((amenity, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Vuelos */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plane className="w-6 h-6 text-blue-600" />
                Tus vuelos
              </h2>
              <div className="space-y-4">
                {/* Vuelo de ida */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-2">Vuelo de ida</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={packageData.flight.outbound.airlineLogo}
                        alt={packageData.flight.outbound.airline}
                        className="w-10 h-10 object-contain"
                        onError={(e) => { e.currentTarget.src = '/placeholder-logo.png' }}
                      />
                      <div>
                        <p className="font-semibold">{packageData.flight.outbound.departure}</p>
                        <p className="text-sm text-gray-500">{packageData.flight.outbound.departureTime}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{packageData.flight.outbound.duration}</p>
                      <div className="w-24 h-px bg-gray-300 my-1" />
                      <p className="text-xs text-gray-500">Directo</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{packageData.flight.outbound.arrival}</p>
                      <p className="text-sm text-gray-500">{packageData.flight.outbound.arrivalTime}</p>
                    </div>
                  </div>
                </div>

                {/* Vuelo de regreso */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Vuelo de regreso</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={packageData.flight.return.airlineLogo}
                        alt={packageData.flight.return.airline}
                        className="w-10 h-10 object-contain"
                        onError={(e) => { e.currentTarget.src = '/placeholder-logo.png' }}
                      />
                      <div>
                        <p className="font-semibold">{packageData.flight.return.departure}</p>
                        <p className="text-sm text-gray-500">{packageData.flight.return.departureTime}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{packageData.flight.return.duration}</p>
                      <div className="w-24 h-px bg-gray-300 my-1" />
                      <p className="text-xs text-gray-500">Directo</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{packageData.flight.return.arrival}</p>
                      <p className="text-sm text-gray-500">{packageData.flight.return.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Servicios adicionales */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Servicios adicionales incluidos</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {packageData.transfers && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Bus className="w-6 h-6 text-blue-600" />
                    <span>Traslados</span>
                  </div>
                )}
                {packageData.insurance && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                    <span>Seguro de viaje</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Wifi className="w-6 h-6 text-purple-600" />
                  <span>WiFi incluido</span>
                </div>
              </div>
            </Card>

            {/* Itinerario */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Itinerario sugerido
              </h2>
              <div className="space-y-4">
                {packageData.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-semibold">{day.title}</h4>
                      <p className="text-sm text-gray-600">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar de precio */}
          <div className="lg:w-80">
            <Card className="p-6 sticky top-24">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 line-through text-lg">
                    ${packageData.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    -${packageData.savings.toLocaleString()}
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  ${packageData.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">{packageData.currency}</span>
                </div>
                <p className="text-sm text-gray-500">por persona</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duración</span>
                  <span className="font-medium">{packageData.duration} noches</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Viajeros</span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="border rounded-lg px-2 py-1"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span className="text-xl text-blue-600">
                      ${(packageData.price * guests).toLocaleString()} {packageData.currency}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleReserve}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Reservar ahora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Reserva segura. Cancelación gratuita hasta 48h antes.
              </p>

              {/* Contacto */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium mb-2">¿Necesitas ayuda?</p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Phone className="w-4 h-4" />
                  <span>800-123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>paquetes@asoperadora.com</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
