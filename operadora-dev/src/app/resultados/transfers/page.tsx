'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Car, Users, Luggage, ArrowLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface TransferResult {
  id: string
  provider: string
  type: string
  price: number
  currency: string
  details: {
    transferType: string
    start: {
      dateTime: string
      location: string
      address?: any
    }
    end: {
      location: string
      address?: any
    }
    vehicle: {
      code: string
      category: string
      description: string
      seats: number
      luggage: number
      imageURL?: string
    }
    serviceProvider: {
      code: string
      name: string
      logo?: string
      preferred: boolean
      contact?: any
    }
    distance?: {
      value: number
      unit: string
    }
  }
}

function TransferResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<TransferResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      try {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const date = searchParams.get('date')
        const time = searchParams.get('time')
        const passengers = searchParams.get('passengers')

        if (!from || !to || !date || !time) {
          setError('Parámetros de búsqueda incompletos')
          setLoading(false)
          return
        }

        console.log('🚗 Fetching transfers...', { from, to, date, time, passengers })

        const apiUrl = `/api/search/transfers?startLocationCode=${encodeURIComponent(from)}&endLocationCode=${encodeURIComponent(to)}&transferDate=${date}&transferTime=${time}:00&passengers=${passengers || 2}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          setResults(data.data || [])
        } else {
          setError(data.error || 'Error desconocido')
        }

      } catch (err) {
        console.error('❌ Error fetching transfers:', err)
        setError(err instanceof Error ? err.message : 'Error al buscar transfers')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Buscando transfers disponibles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Car className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nueva búsqueda
            </Button>
            <h1 className="text-3xl font-bold">Transfers Disponibles</h1>
            <p className="text-gray-600 mt-2">
              De <span className="font-semibold">{searchParams.get('from')}</span> a{' '}
              <span className="font-semibold">{searchParams.get('to')}</span>
              {' · '}
              {new Date(searchParams.get('date') || '').toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long'
              })}
              {' a las '}
              {searchParams.get('time')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Resultados encontrados</p>
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          </div>
        </div>

        {/* No results */}
        {results.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay transfers disponibles</h3>
            <p className="text-gray-600 mb-6">
              Intenta buscar con otros parámetros o fechas diferentes
            </p>
            <Button onClick={() => router.push('/')}>
              Realizar nueva búsqueda
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((transfer, index) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Vehicle Image/Icon */}
                    <div className="flex-shrink-0">
                      {transfer.details.vehicle.imageURL ? (
                        <img
                          src={transfer.details.vehicle.imageURL}
                          alt={transfer.details.vehicle.description}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Car className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Transfer Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-xl mb-1">
                            {transfer.details.vehicle.description}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {transfer.details.serviceProvider.name}
                            {transfer.details.serviceProvider.preferred && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Proveedor Preferido
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{transfer.details.vehicle.seats} asientos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Luggage className="w-4 h-4" />
                              <span>{transfer.details.vehicle.luggage} maletas</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Desde</p>
                          <p className="text-3xl font-bold text-blue-600">
                            ${transfer.price.toLocaleString()}
                            <span className="text-sm text-gray-500 ml-1">{transfer.currency}</span>
                          </p>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Desde</p>
                            <p className="font-medium">{transfer.details.start.location}</p>
                            {transfer.details.start.address && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {transfer.details.start.address.line}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Hasta</p>
                            <p className="font-medium">{transfer.details.end.location}</p>
                            {transfer.details.end.address && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {transfer.details.end.address.line}
                              </p>
                            )}
                          </div>
                        </div>
                        {transfer.details.distance && (
                          <p className="text-sm text-gray-600 mt-2">
                            Distancia: {transfer.details.distance.value} {transfer.details.distance.unit}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Reservar ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TransferResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <TransferResultsPageContent />
    </Suspense>
  )
}
