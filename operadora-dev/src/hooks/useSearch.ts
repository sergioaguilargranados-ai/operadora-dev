import { useState } from 'react'

export interface SearchParams {
  type: 'flight' | 'hotel' | 'package'
  // Vuelos
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  adults?: number
  children?: number
  cabinClass?: string
  // Hoteles
  city?: string
  checkin?: string
  checkout?: string
  guests?: number
  rooms?: number
  // Común
  currency?: string
  providers?: string[]
}

export interface SearchResult {
  id: string
  provider: string
  type: string
  price: number
  currency: string
  details: any
  originalPrice?: number
  originalCurrency?: string
  exchangeRate?: number
}

export interface SearchResponse {
  success: boolean
  data: SearchResult[]
  total: number
  providers?: {
    searched: string[]
    successful: string[]
    failed: string[]
  }
  error?: string
}

export function useSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])

  const search = async (params: SearchParams): Promise<SearchResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      // Construir query string
      const queryParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/search?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.data)
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Search error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setError(null)
  }

  return {
    search,
    loading,
    error,
    results,
    clearResults
  }
}
