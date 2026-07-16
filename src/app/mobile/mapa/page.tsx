"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, ArrowLeft, MapPin, Compass, Landmark, Coffee, BadgeHelp, Navigation, Hotel, ChevronUp, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ("places")[] = ["places"]

interface Place {
  id: number
  name: string
  category: string
  lat: number
  lng: number
  desc: string
  icon: any
}

export default function MobileMapPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [selectedCategory, setSelectedCategory] = useState("Monumentos")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null)
  const [locError, setLocError] = useState<string | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  
  // Drawer state
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true)
  
  // Google Places Autocomplete state
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [searchedPlace, setSearchedPlace] = useState<Place | null>(null)
  const [myHotelPlace, setMyHotelPlace] = useState<Place | null>(null)
  const [fetchedPlaces, setFetchedPlaces] = useState<Place[]>([])
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
    libraries,
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(loc)
          setMapCenter(loc)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          setLocError("No pudimos obtener tu ubicación real.")
          // Fallback a CDMX si falla
          setUserLocation({ lat: 19.4326, lng: -99.1332 })
          setMapCenter({ lat: 19.4326, lng: -99.1332 })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocError("Geolocalización no soportada por el navegador.")
      setUserLocation({ lat: 19.4326, lng: -99.1332 })
      setMapCenter({ lat: 19.4326, lng: -99.1332 })
    }
  }, [])

  // Buscar hotel del usuario
  useEffect(() => {
    if (!user || !isLoaded || !window.google) return
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(`/api/bookings?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.data && data.data.length > 0) {
           const latestBooking = data.data[0]
           const details = typeof latestBooking.special_requests === 'string' ? JSON.parse(latestBooking.special_requests) : (latestBooking.special_requests || {})
           // Intentar buscar el nombre del hotel o usar el destino
           const hotelName = details?.hotel_name || latestBooking.destination || latestBooking.service_name
           if (hotelName) {
             const geocoder = new window.google.maps.Geocoder()
             geocoder.geocode({ address: hotelName + " hotel" }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                   const loc = results[0].geometry.location
                   const newHotel: Place = {
                     id: 99999,
                     name: hotelName,
                     category: "Mi Hotel",
                     lat: loc.lat(),
                     lng: loc.lng(),
                     desc: results[0].formatted_address || "Hotel de tu itinerario",
                     icon: Hotel
                   }
                   setMyHotelPlace(newHotel)
                }
             })
           }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchBookings()
  }, [user, isLoaded])

  // Obtener lugares cercanos dinámicamente según la pestaña (Places API)
  useEffect(() => {
    if (!mapInstance || !userLocation || !isLoaded || !window.google) return;
    
    // Si la categoría es Mi Hotel o Búsqueda, no buscamos por NearbySearch
    if (selectedCategory === "Mi Hotel" || selectedCategory === "Búsqueda") {
      setFetchedPlaces([])
      return
    }

    setIsFetchingPlaces(true)
    const service = new window.google.maps.places.PlacesService(mapInstance);
    
    let queryType = ""
    let queryKeyword = ""

    switch (selectedCategory) {
      case "Monumentos": queryType = "tourist_attraction"; break;
      case "Restaurantes": queryType = "restaurant"; break;
      case "Museos": queryType = "museum"; break;
      case "Baños públicos": 
        queryType = "convenience_store"; 
        queryKeyword = "public restroom"; 
        break;
      default: queryType = "point_of_interest";
    }

    const request: google.maps.places.PlaceSearchRequest = {
      location: userLocation,
      radius: 2000,
      type: queryType,
      keyword: queryKeyword || undefined
    };

    service.nearbySearch(request, (results, status) => {
      setIsFetchingPlaces(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const places: Place[] = results.map((r, i) => ({
          id: i,
          name: r.name || "Lugar",
          category: selectedCategory,
          lat: r.geometry?.location?.lat() || 0,
          lng: r.geometry?.location?.lng() || 0,
          desc: r.vicinity || "",
          icon: MapPin
        })).filter(p => p.lat !== 0)
        setFetchedPlaces(places)
      } else {
        setFetchedPlaces([])
      }
    });

  }, [selectedCategory, mapInstance, userLocation, isLoaded])

  // Calcular ruta cuando se selecciona un lugar
  useEffect(() => {
    if (selectedPlace && userLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: selectedPlace.lat, lng: selectedPlace.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result)
          } else {
            console.error(`Error al calcular la ruta: ${status}`)
            toast({ title: 'Ruta no disponible', description: 'No se pudo trazar una ruta en auto hacia este destino.', variant: 'destructive' })
            setDirectionsResponse(null)
          }
        }
      )
    } else {
      setDirectionsResponse(null)
    }
  }, [selectedPlace, userLocation, isLoaded])

  const onLoadAutocomplete = useCallback((auto: google.maps.places.Autocomplete) => {
    setAutocomplete(auto)
  }, [])

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const newSearchedPlace: Place = {
          id: Date.now(),
          name: place.name || "Destino Buscado",
          category: "Búsqueda",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          desc: place.formatted_address || "",
          icon: MapPin
        }
        setSearchedPlace(newSearchedPlace)
        setSelectedPlace(newSearchedPlace)
        setSelectedCategory("Búsqueda")
        setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      }
    }
  }

  const baseCategories = [
    { name: "Monumentos", icon: Landmark },
    { name: "Restaurantes", icon: Coffee },
    { name: "Museos", icon: Compass },
    { name: "Baños públicos", icon: BadgeHelp }
  ]
  
  // Agregar "Mi Hotel" si existe y "Búsqueda" si hay un lugar buscado
  const categories = [...baseCategories]
  if (myHotelPlace) categories.unshift({ name: "Mi Hotel", icon: Hotel })
  if (searchedPlace) categories.push({ name: "Búsqueda", icon: Search })

  const basePlaces: Place[] = fetchedPlaces

  let allPlaces = [...basePlaces]
  if (myHotelPlace) allPlaces.push(myHotelPlace)
  if (searchedPlace) allPlaces.push(searchedPlace)

  const filteredPlaces = allPlaces.filter(p => p.category === selectedCategory)

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      {/* Search Bar Floating Container */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2 items-center">
        <button 
          onClick={() => router.back()} 
          className="w-11 h-11 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="relative flex-1">
          {isLoaded ? (
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
              options={{ strictBounds: false }}
            >
              <div>
                <Input 
                  placeholder="Buscar lugares, hoteles, museos..."
                  className="pl-10 h-11 bg-white border-none rounded-full shadow-lg text-sm w-full notranslate"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </Autocomplete>
          ) : (
            <div>
               <Input 
                  placeholder="Cargando buscador..."
                  className="pl-10 h-11 bg-white border-none rounded-full shadow-lg text-sm w-full"
                  disabled
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          )}
        </div>
        <button className="w-11 h-11 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border shrink-0">
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Horizontal Category Chips */}
      <div className="absolute top-[72px] left-0 right-0 z-20 px-4 overflow-x-auto flex gap-2 pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name)
                setSelectedPlace(null)
                setDirectionsResponse(null)
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border-0 shrink-0 ${
                selectedCategory === cat.name 
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Interactive Map Canvas Wrapper */}
      <div className="flex-1 w-full bg-slate-200 relative overflow-hidden">
        {!isLoaded || !userLocation ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 absolute inset-0 bg-slate-200 z-10">
            <Compass className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-bold">{!isLoaded ? 'Cargando mapas...' : 'Obteniendo tu ubicación GPS...'}</span>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            zoom={15}
            center={mapCenter || userLocation}
            onLoad={(map) => setMapInstance(map)}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
            }}
          >
            {/* User Location Marker */}
            <Marker 
              position={userLocation} 
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />

            {/* Places Markers */}
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlace(place)}
                icon={{
                  url: selectedPlace?.id === place.id 
                    ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    : place.category === "Mi Hotel"
                    ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                    : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
            ))}

            {/* Renderizar la ruta trazada */}
            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#0066FF',
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>

      {/* Dynamic Detail Bottom Drawer */}
      <div className={`absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t z-30 transition-all duration-300 ease-in-out ${isDrawerExpanded ? 'p-5' : 'p-3'}`}>
        <div 
          className="w-full flex flex-col items-center justify-center cursor-pointer mb-2"
          onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mb-1" />
          {isDrawerExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerExpanded ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}>
          {selectedPlace ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="pr-2">
                  <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                    {selectedPlace.category}
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 mt-1 notranslate">{selectedPlace.name}</h3>
                </div>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank')}
                  className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0"
                  title="Abrir GPS externo"
                >
                  <Navigation className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{selectedPlace.desc}</p>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    setSelectedPlace(null)
                    setDirectionsResponse(null)
                  }}
                  className="w-full py-2.5 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Explora el mapa</h3>
              <p className="text-xs text-gray-400 mt-1">Selecciona un marcador en el mapa o busca puntos de interés en la barra superior.</p>
              
              {isFetchingPlaces ? (
                <div className="flex justify-center mt-6">
                  <Compass className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredPlaces.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPlace(p)
                        setMapCenter({ lat: p.lat, lng: p.lng })
                      }}
                      className="p-3 border rounded-xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer flex gap-3 items-center shrink-0"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.category === 'Mi Hotel' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <MapPin className={`w-4 h-4 ${p.category === 'Mi Hotel' ? 'text-yellow-600' : 'text-gray-700'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate notranslate">{p.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 truncate">{p.category}</p>
                      </div>
                    </div>
                  ))}
                  {filteredPlaces.length === 0 && selectedCategory !== "Búsqueda" && selectedCategory !== "Mi Hotel" && (
                     <div className="col-span-2 text-center text-xs text-gray-400 py-4">No se encontraron lugares de esta categoría cerca de ti.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
