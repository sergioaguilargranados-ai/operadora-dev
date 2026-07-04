'use client'

import { useEffect, useRef, useState } from 'react'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDc8NB8nvcbY2OTv6Dcvzm7AwAbV7tPgF0'

interface ItineraryRouteMapProps {
  cities: string[]
}

// Minimalist, clean map style
const premiumMapStyle = [
  { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
  { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
  { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d4e4eb" }, { "visibility": "on" }] }
]

export function ItineraryRouteMap({ cities }: ItineraryRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!cities || cities.length === 0) {
      setLoading(false)
      setError(true)
      return
    }

    const uniqueCities = Array.from(new Set(cities))

    const initMap = async () => {
      try {
        const google = (window as any).google
        if (!google || !google.maps) {
          setError(true)
          setLoading(false)
          return
        }

        const map = new google.maps.Map(mapRef.current, {
          zoom: 4,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          styles: premiumMapStyle,
          gestureHandling: 'cooperative'
        })

        const geocoder = new google.maps.Geocoder()
        const bounds = new google.maps.LatLngBounds()

        // Geocode all cities
        const geocodedPlaces = await Promise.all(
          uniqueCities.map(city => 
            new Promise<any>((resolve) => {
              geocoder.geocode({ address: city }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                  resolve({ city, location: results[0].geometry.location })
                } else {
                  resolve(null)
                }
              })
            })
          )
        )

        const validPlaces = geocodedPlaces.filter(Boolean)

        if (validPlaces.length > 0) {
          // Add custom minimalist markers
          validPlaces.forEach((place, index) => {
            bounds.extend(place.location)
            
            // Marker
            new google.maps.Marker({
              map,
              position: place.location,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: index === 0 ? '#000000' : (index === validPlaces.length - 1 ? '#ef4444' : '#3b82f6'),
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
              },
              title: place.city
            })
          })

          // Draw route if multiple points
          if (validPlaces.length > 1) {
            const pathCoords = validPlaces.map(p => p.location)
            const flightPath = new google.maps.Polyline({
              path: pathCoords,
              geodesic: true,
              strokeColor: '#94a3b8',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
                offset: '50%'
              }]
            })
            flightPath.setMap(map)
          }

          map.fitBounds(bounds)
          
          // Unzoom slightly to give breathing room
          const listener = google.maps.event.addListener(map, "idle", () => {
            if (map.getZoom() && map.getZoom()! > 10) map.setZoom(10)
            google.maps.event.removeListener(listener)
          })
        } else {
          setError(true)
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Map init error:", err)
        setError(true)
        setLoading(false)
      }
    }

    const loadGoogleMaps = () => {
      if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
        initMap()
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => initMap())
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initMap()
      script.onerror = () => {
        setError(true)
        setLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [cities])

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative" style={{ height: '220px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs text-gray-400 font-medium tracking-wide">Cargando mapa...</span>
          </div>
        </div>
      )}
      
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <span className="text-xs text-gray-400">Mapa no disponible</span>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
