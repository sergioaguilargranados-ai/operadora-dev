"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Plane,
  Hotel,
  Package,
  Users,
  Cloud,
  DollarSign,
  Info,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface CityData {
  id: string
  name: string
  country: string
  description: string
  iataCode?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  photos: string[]
  attractions: string[]
  bestTimeToVisit: string
  averageTemperature: string
  currency: string
  language: string
  timezone: string
  airports?: Array<{
    name: string
    code: string
  }>
}

export default function CiudadDetallePage() {
  const router = useRouter()
  const params = useParams()
  const [city, setCity] = useState<CityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    loadCityData()
  }, [params.id])

  const loadCityData = async () => {
    try {
      setLoading(true)

      // TODO: Integrar con Amadeus City Search API
      // const res = await fetch(`/api/cities/${params.id}`)
      // const data = await res.json()

      // Por ahora usar datos de ejemplo
      const mockCity: CityData = {
        id: params.id as string,
        name: getCityName(params.id as string),
        country: getCountry(params.id as string),
        description: `Descubre ${getCityName(params.id as string)}, un destino increíble que combina historia, cultura y belleza natural. Con su rica herencia cultural y moderna infraestructura turística, es el lugar perfecto para tu próxima aventura.`,
        iataCode: getIataCode(params.id as string),
        photos: [
          `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80`, // Ciudad
          `https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80`, // Atardecer
          `https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80`, // Arquitectura
          `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80`, // Playa
          `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80`, // Paisaje
          `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80`, // Montañas
          `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`, // Aventura
          `https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80`  // Gastronomía
        ],
        attractions: [
          'Centro Histórico',
          'Museo Nacional',
          'Playa Principal',
          'Parque Central',
          'Zona Arqueológica',
          'Mercado Local'
        ],
        bestTimeToVisit: 'Octubre - Abril',
        averageTemperature: '24°C',
        currency: 'MXN',
        language: 'Español',
        timezone: 'GMT-6',
        airports: [
          { name: 'Aeropuerto Internacional', code: getIataCode(params.id as string) }
        ]
      }

      setCity(mockCity)
    } catch (error) {
      console.error('Error loading city:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCityName = (id: string): string => {
    const cities: Record<string, string> = {
      'cancun': 'Cancún',
      'cdmx': 'Ciudad de México',
      'guadalajara': 'Guadalajara',
      'monterrey': 'Monterrey',
      'los-cabos': 'Los Cabos',
      'puerto-vallarta': 'Puerto Vallarta',
      'playa-del-carmen': 'Playa del Carmen',
      'oaxaca': 'Oaxaca'
    }
    return cities[id] || 'Ciudad'
  }

  const getCountry = (id: string): string => {
    return 'México'
  }

  const getIataCode = (id: string): string => {
    const codes: Record<string, string> = {
      'cancun': 'CUN',
      'cdmx': 'MEX',
      'guadalajara': 'GDL',
      'monterrey': 'MTY',
      'los-cabos': 'SJD',
      'puerto-vallarta': 'PVR',
      'playa-del-carmen': 'CUN',
      'oaxaca': 'OAX'
    }
    return codes[id] || 'XXX'
  }

  const handleSearchFlights = () => {
    if (city?.iataCode) {
      router.push(`/?destination=${city.iataCode}&type=flight`)
    }
  }

  const handleSearchHotels = () => {
    if (city?.name) {
      router.push(`/?city=${encodeURIComponent(city.name)}&type=hotel`)
    }
  }

  const handleSearchPackages = () => {
    router.push(`/?destination=${city?.name}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <p className="text-center mt-8">Ciudad no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-muted-foreground">{city.country}</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">{city.name}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {city.description}
          </p>
        </div>

        {/* Galería de Fotos - 8 fotos */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold">Galería</h2>
          </div>

          {/* Foto Principal */}
          <div className="mb-4 relative h-[500px] rounded-xl overflow-hidden">
            <img
              src={city.photos[activePhotoIndex]}
              alt={`${city.name} - Foto ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {activePhotoIndex + 1} / {city.photos.length}
            </div>
          </div>

          {/* Miniaturas */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {city.photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setActivePhotoIndex(index)}
                className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                  activePhotoIndex === index
                    ? 'ring-2 ring-blue-600 scale-105'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={photo}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleSearchFlights}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Vuelos</h3>
                <p className="text-sm text-muted-foreground">
                  Buscar vuelos a {city.name}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleSearchHotels}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Hotel className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hoteles</h3>
                <p className="text-sm text-muted-foreground">
                  Encuentra alojamiento
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleSearchPackages}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Paquetes</h3>
                <p className="text-sm text-muted-foreground">
                  Ver paquetes completos
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Información Detallada */}
        <Tabs defaultValue="info" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="info">
              <Info className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="attractions">
              <Star className="w-4 h-4 mr-2" />
              Atractivos
            </TabsTrigger>
            <TabsTrigger value="practical">
              <MapPin className="w-4 h-4 mr-2" />
              Info Práctica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Sobre {city.name}</h3>
              <p className="text-muted-foreground mb-6">
                {city.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Mejor Época</p>
                    <p className="text-muted-foreground">{city.bestTimeToVisit}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Temperatura Promedio</p>
                    <p className="text-muted-foreground">{city.averageTemperature}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Moneda</p>
                    <p className="text-muted-foreground">{city.currency}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Idioma</p>
                    <p className="text-muted-foreground">{city.language}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="attractions">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Principales Atractivos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {city.attractions.map((attraction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{attraction}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="practical">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Información Práctica</h3>

              {city.airports && city.airports.length > 0 && (
                <div className="mb-6">
                  <p className="font-semibold mb-3">Aeropuertos</p>
                  {city.airports.map((airport, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Plane className="w-4 h-4 text-blue-600" />
                      <span>{airport.name} ({airport.code})</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-6">
                <p className="font-semibold mb-3">Zona Horaria</p>
                <p className="text-muted-foreground">{city.timezone}</p>
              </div>

              <div>
                <p className="font-semibold mb-3">Consejos de Viaje</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Lleva protector solar y ropa ligera</li>
                  <li>• Respeta las costumbres locales</li>
                  <li>• Prueba la gastronomía local</li>
                  <li>• Mantente hidratado</li>
                  <li>• Contrata seguro de viaje</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Final */}
        <Card className="p-8 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para descubrir {city.name}?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Encuentra las mejores ofertas en vuelos, hoteles y paquetes completos para tu viaje
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              variant="outline"
              onClick={handleSearchFlights}
            >
              <Plane className="w-4 h-4 mr-2" />
              Buscar Vuelos
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSearchHotels}
            >
              <Hotel className="w-4 h-4 mr-2" />
              Buscar Hoteles
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSearchPackages}
            >
              <Package className="w-4 h-4 mr-2" />
              Ver Paquetes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
