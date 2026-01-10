"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  UtensilsCrossed,
  ParkingCircle,
  Dumbbell,
  Waves,
  Wind,
  Users,
  Calendar,
  Check,
  X,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function DetallesPage() {
  const params = useParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Datos de ejemplo (en producción vendrían de la API)
  const hotelData = {
    id: params.id,
    name: "Grand Fiesta Americana Coral Beach",
    location: "Zona Hotelera km 9.5, Cancún, Quintana Roo, México",
    city: "Cancún",
    starRating: 5,
    rating: 4.8,
    reviewCount: 3421,
    price: 6800,
    currency: "MXN",
    description: "Hotel de lujo con servicio de primer nivel, spa galardonado y gastronomía excepcional. Vista panorámica al mar Caribe. Ubicado en el corazón de la Zona Hotelera de Cancún, nuestro resort ofrece acceso directo a una playa de arena blanca y aguas cristalinas. Cada habitación está diseñada con elegancia y equipada con las comodidades más modernas.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200"
    ],
    amenities: [
      { name: "WiFi gratis", icon: Wifi, available: true },
      { name: "Piscina", icon: Waves, available: true },
      { name: "Restaurante", icon: UtensilsCrossed, available: true },
      { name: "Estacionamiento", icon: ParkingCircle, available: true },
      { name: "Gimnasio", icon: Dumbbell, available: true },
      { name: "Spa", icon: Wind, available: true },
      { name: "Acceso a playa", icon: Waves, available: true },
      { name: "Servicio a habitación", icon: Check, available: true }
    ],
    roomTypes: [
      {
        name: "Habitación Deluxe Vista al Mar",
        description: "Habitación espaciosa con cama king size y balcón privado con vista panorámica",
        maxOccupancy: 2,
        size: "42 m²",
        price: 6800
      },
      {
        name: "Suite Junior",
        description: "Suite con sala de estar separada y dos balcones con vista al mar",
        maxOccupancy: 4,
        size: "65 m²",
        price: 9500
      },
      {
        name: "Suite Presidencial",
        description: "Suite de lujo con jacuzzi privado, sala de estar y comedor",
        maxOccupancy: 6,
        size: "120 m²",
        price: 18000
      }
    ],
    checkIn: "15:00",
    checkOut: "12:00",
    cancellationPolicy: "Cancelación gratuita hasta 72 horas antes del check-in. Depósito reembolsable.",
    highlights: [
      "Spa galardonado con tratamientos de clase mundial",
      "7 restaurantes de cocina internacional",
      "3 piscinas infinity con vista al mar",
      "Playa privada de arena blanca",
      "Club de niños con actividades supervisadas",
      "Centro de negocios 24/7",
      "Servicio de concierge personalizado"
    ],
    reviews: [
      {
        author: "María González",
        rating: 5,
        date: "Hace 1 semana",
        comment: "Excelente hotel! El servicio es impecable y las instalaciones de primera. La playa es hermosa y el spa increíble. Definitivamente volveremos."
      },
      {
        author: "Carlos Mendoza",
        rating: 5,
        date: "Hace 2 semanas",
        comment: "Perfecta combinación de lujo y comodidad. El personal muy atento y las habitaciones impecables. Los restaurantes ofrecen gastronomía excepcional."
      },
      {
        author: "Laura Rodríguez",
        rating: 4,
        date: "Hace 1 mes",
        comment: "Muy buen hotel, excelente ubicación y servicios. Solo un pequeño detalle con el tiempo de espera en el restaurante, pero todo lo demás fue perfecto."
      }
    ]
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === hotelData.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hotelData.images.length - 1 : prev - 1
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 p-0"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" className="w-10 h-10 p-0">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="relative w-full h-[500px] bg-gray-900">
        <img
          src={hotelData.images[currentImageIndex]}
          alt={`${hotelData.name} - Imagen ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Gallery Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
          {currentImageIndex + 1} / {hotelData.images.length}
        </div>

        {/* Thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {hotelData.images.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: hotelData.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-2">{hotelData.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hotelData.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-primary text-white px-3 py-1 rounded font-semibold">
                  {hotelData.rating}
                </div>
                <span className="text-sm text-muted-foreground">
                  Excelente ({hotelData.reviewCount} reseñas)
                </span>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">Acerca de este hotel</h2>
              <p className="text-muted-foreground leading-relaxed">
                {hotelData.description}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Servicios e instalaciones</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotelData.amenities.map((amenity, index) => {
                  const Icon = amenity.icon
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${
                        amenity.available ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Room Types */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Habitaciones disponibles</h2>
              <div className="space-y-4">
                {hotelData.roomTypes.map((room, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {room.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Hasta {room.maxOccupancy} personas
                          </span>
                          <span>{room.size}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(room.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">por noche</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Highlights */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Lo más destacado</h2>
              <div className="grid gap-2">
                {hotelData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reseñas de huéspedes</h2>
              <div className="space-y-4">
                {hotelData.reviews.map((review, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Policies */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Políticas del hotel</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-1">Check-in</h3>
                  <p className="text-sm text-muted-foreground">A partir de las {hotelData.checkIn}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Check-out</h3>
                  <p className="text-sm text-muted-foreground">Hasta las {hotelData.checkOut}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Cancelación</h3>
                  <p className="text-sm text-muted-foreground">{hotelData.cancellationPolicy}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(hotelData.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ noche</span>
                </div>
                <p className="text-xs text-muted-foreground">Impuestos incluidos</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Fechas</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <input type="date" className="text-sm font-medium border-0 w-full p-0" />
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <input type="date" className="text-sm font-medium border-0 w-full p-0" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Huéspedes</label>
                  <div className="border rounded-lg p-3">
                    <select className="w-full border-0 text-sm font-medium">
                      <option>1 adulto</option>
                      <option>2 adultos</option>
                      <option>2 adultos, 1 niño</option>
                      <option>2 adultos, 2 niños</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-base font-semibold">
                Reservar ahora
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No se te cobrará todavía
              </p>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatPrice(hotelData.price)} × 3 noches</span>
                  <span>{formatPrice(hotelData.price * 3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarifa de servicio</span>
                  <span>{formatPrice(hotelData.price * 3 * 0.1)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(hotelData.price * 3 * 1.1)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
