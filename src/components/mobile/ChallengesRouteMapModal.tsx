import { useState, useEffect, useRef } from "react"
import { X, MapPin } from "lucide-react"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''

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

interface ChallengesRouteMapModalProps {
  isOpen: boolean
  onClose: () => void
  challenges: any[]
}

export function ChallengesRouteMapModal({ isOpen, onClose, challenges }: ChallengesRouteMapModalProps) {
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !mounted || challenges.length === 0) return

    setLoading(true)
    setError(false)

    // Solo tomamos los 3 principales
    const mainChallenges = challenges.slice(0, 3).filter(c => c.lat && c.lng)

    if (mainChallenges.length === 0) {
      setLoading(false)
      setError(true)
      return
    }

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

        const bounds = new google.maps.LatLngBounds()
        
        mainChallenges.forEach((challenge, index) => {
          const loc = new google.maps.LatLng(challenge.lat, challenge.lng)
          bounds.extend(loc)
          
          const isStart = index === 0;
          
          new google.maps.Marker({
            map,
            position: loc,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: isStart ? 8 : 6,
              fillColor: isStart ? '#22c55e' : '#3b82f6',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            },
            title: challenge.name,
            zIndex: isStart ? 100 : 1
          })
        })

        if (mainChallenges.length > 1) {
          const pathCoords = mainChallenges.map(p => new google.maps.LatLng(p.lat, p.lng))
          const routePath = new google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.6,
            strokeWeight: 3,
            icons: [{
              icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
              offset: '50%'
            }]
          })
          routePath.setMap(map)
        }

        map.fitBounds(bounds)
        
        const listener = google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() && map.getZoom()! > 15) map.setZoom(15)
          google.maps.event.removeListener(listener)
        })
        
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

  }, [isOpen, mounted, challenges])

  if (!isOpen && !mounted) return null

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-3xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} flex flex-col h-[75vh]`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 border border-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-serif font-bold text-gray-900">Ruta recomendada</h2>
          <p className="text-xs text-gray-500 mt-1">Conectando tus principales retos</p>
        </div>

        <div className="flex-1 relative bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs text-gray-400 font-medium tracking-wide">Trazando ruta...</span>
              </div>
            </div>
          )}
          
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <span className="text-sm text-gray-400">El mapa no está disponible</span>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </>
  )
}
