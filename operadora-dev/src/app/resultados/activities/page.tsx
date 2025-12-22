'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Activity, Star, MapPin, ArrowLeft, ExternalLink, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/PageHeader'

interface ActivityResult {
  id: string
  provider: string
  type: string
  price: number
  currency: string
  details: {
    name: string
    shortDescription: string
    description?: string
    location: {
      latitude: number
      longitude: number
      address?: string
      city?: string
      country?: string
    }
    rating?: string
    pictures: string[]
    bookingLink: string
    minimumDuration?: string
  }
}

function ActivitiesResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<ActivityResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      try {
        const city = searchParams.get('city')
        const radius = searchParams.get('radius') || '20'

        if (!city) {
          setError('Falta el parámetro de ciudad')
          setLoading(false)
          return
        }

        console.log('🎭 Fetching activities...', { city, radius })

        const apiUrl = `/api/search/activities?city=${encodeURIComponent(city)}&radius=${radius}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setResults(data.data || [])
        } else {
          setError(data.error || 'Error desconocido')
        }

      } catch (err) {
        console.error('❌ Error fetching activities:', err)
        setError(err instanceof Error ? err.message : 'Error al buscar actividades')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  const handleBooking = (bookingLink: string) => {
    window.open(bookingLink, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Buscando actividades y tours...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error en la búsqueda</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tours y Actividades</h1>
            <p className="text-gray-600 mt-2">
              En <span className="font-semibold">{searchParams.get('city')}</span>
              {' · '}
              Radio de búsqueda: {searchParams.get('radius')} km
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Actividades encontradas</p>
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          </div>
        </div>

        {/* No results */}
        {results.length === 0 ? (
          <Card className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay actividades disponibles</h3>
            <p className="text-gray-600 mb-6">
              Intenta buscar en otra ciudad o amplía el radio de búsqueda
            </p>
            <Button onClick={() => router.push('/')}>
              Realizar nueva búsqueda
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    {activity.details.pictures && activity.details.pictures.length > 0 ? (
                      <img
                        src={activity.details.pictures[0]}
                        alt={activity.details.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Activity className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {activity.details.pictures && activity.details.pictures.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{activity.details.pictures.length - 1} fotos
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Title and Rating */}
                    <div className="mb-3">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {activity.details.name}
                      </h3>
                      {activity.details.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{activity.details.rating}</span>
                          <span className="text-sm text-gray-500">/ 5</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                      {activity.details.shortDescription}
                    </p>

                    {/* Location */}
                    {activity.details.location.city && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {activity.details.location.city}
                          {activity.details.location.address && `, ${activity.details.location.address}`}
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    {activity.details.minimumDuration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>Duración: {activity.details.minimumDuration}</span>
                      </div>
                    )}

                    {/* Price and Booking */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Desde</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${activity.price.toLocaleString()}
                          <span className="text-sm text-gray-500 ml-1">{activity.currency}</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => handleBooking(activity.details.bookingLink)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                      >
                        Reservar
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        {results.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Al hacer clic en "Reservar", serás redirigido al sitio del proveedor (Viator o GetYourGuide)
                para completar tu reserva de manera segura.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivitiesResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <ActivitiesResultsPageContent />
    </Suspense>
  )
}
