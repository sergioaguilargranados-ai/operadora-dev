"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Calendar, MapPin, Clock, Navigation, Download, Home, Loader2 } from 'lucide-react'

interface Activity {
  time: string
  title: string
  description: string
  location: string
}

interface Day {
  day: number
  date: string
  title: string
  activities: Activity[]
}

interface Itinerary {
  id: number
  title: string
  destination: string
  description: string
  start_date: string
  end_date: string
  days: Day[]
  notes: string
  recommendations: string
}

export default function SharedItineraryPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setToken(p.token)
    })
  }, [params])

  useEffect(() => {
    if (token) {
      loadItinerary()
    }
  }, [token])

  const loadItinerary = async () => {
    try {
      const res = await fetch(`/api/itineraries/shared/${token}`)
      const data = await res.json()

      if (data.success) {
        setItinerary(data.data)
      } else {
        setError(data.error || 'Itinerario no encontrado')
      }
    } catch (error) {
      setError('Error al cargar el itinerario')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!itinerary) return

    try {
      const res = await fetch(`/api/itineraries/${itinerary.id}/pdf`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Itinerario_${itinerary.title}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Cargando itinerario...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Itinerario no encontrado</h2>
          <p className="text-muted-foreground mb-6">{error || 'El link no es válido o ha expirado'}</p>
          <Button onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Ir a inicio
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={() => router.push('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Volver a inicio
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3">{itinerary.title}</h1>
            <div className="flex items-center justify-center gap-4 text-lg mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {itinerary.destination}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(itinerary.start_date).toLocaleDateString('es-MX')} - {new Date(itinerary.end_date).toLocaleDateString('es-MX')}
              </div>
            </div>
            {itinerary.description && (
              <p className="text-white/90 max-w-2xl mx-auto">{itinerary.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Itinerario */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {itinerary.days.map((day, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              {/* Header del día */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {day.day}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{day.title}</h2>
                      <p className="text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividades */}
              <div className="space-y-6">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex gap-4">
                    <div className="flex-shrink-0 w-20 text-right">
                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                        {activity.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Navigation className="w-4 h-4" />
                            {activity.location}
                          </div>
                        )}
                        {activity.description && (
                          <p className="text-muted-foreground">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Notas y Recomendaciones */}
        {(itinerary.notes || itinerary.recommendations) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {itinerary.notes && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Notas Importantes
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{itinerary.notes}</p>
              </Card>
            )}
            {itinerary.recommendations && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Recomendaciones
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{itinerary.recommendations}</p>
              </Card>
            )}
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 p-8 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none">
          <h3 className="text-2xl font-bold mb-3">¿Listo para vivir esta experiencia?</h3>
          <p className="mb-6 text-white/90">Contacta con nosotros para reservar tu viaje</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/contacto')} size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Contactar ahora
            </Button>
            <Button onClick={handleDownloadPDF} size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 AS Operadora de Viajes y Eventos | AS Viajando
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            📧 info@asoperadora.com | ☎️ +52 55 1234 5678
          </p>
        </div>
      </footer>
    </div>
  )
}
