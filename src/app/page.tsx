"use client"

// Build: 03 Feb 2026 - v2.295 - Integraci�n Civitatis (Modelo Afiliado)
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Plane, Package, Compass, ChevronRight, Percent, Tag, Loader2, Bell, HelpCircle, Hotel, Car, Activity, Home as HomeIcon, FileText, Calendar, MessageCircle, Shield, Users, Star, Smartphone, Bus, Sparkles, Utensils, Globe } from "lucide-react"
import { DateRangePicker } from "@/components/DateRangePicker"
import { GuestSelector } from "@/components/GuestSelector"
import { AirlineSelector } from "@/components/AirlineSelector"
import { CounterSelector } from "@/components/CounterSelector"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { User as UserIcon, LogOut } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { FeatureGate, useFeatureCheck } from "@/components/FeatureGate"
import { useFeatures } from "@/contexts/FeaturesContext"
import type {
  Promotion,
  FeaturedHero,
  FlightDestination,
  AccommodationFavorite,
  WeekendDeal,
  VacationPackage,
  UniqueStay,
  ExploreDestination,
  DbInfo
} from "@/types/homepage"

export default function Home() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { search, loading } = useSearch()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Estados para b�squeda de hoteles
  const [destination, setDestination] = useState("")
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [tourSearch, setTourSearch] = useState("")


  // Destinos organizados por pa�s con tipo (playa, ciudad, pueblo m�gico)
  const allDestinations = [
    // M�xico - Playas
    { name: "Canc�n", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Playa del Carmen", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Tulum", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Riviera Maya", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Cozumel", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Isla Mujeres", region: "Quintana Roo", country: "M�xico", type: "playa" },
    { name: "Los Cabos", region: "Baja California Sur", country: "M�xico", type: "playa" },
    { name: "La Paz", region: "Baja California Sur", country: "M�xico", type: "playa" },
    { name: "Puerto Vallarta", region: "Jalisco", country: "M�xico", type: "playa" },
    { name: "Nuevo Vallarta", region: "Nayarit", country: "M�xico", type: "playa" },
    { name: "Sayulita", region: "Nayarit", country: "M�xico", type: "playa" },
    { name: "Mazatl�n", region: "Sinaloa", country: "M�xico", type: "playa" },
    { name: "Acapulco", region: "Guerrero", country: "M�xico", type: "playa" },
    { name: "Ixtapa-Zihuatanejo", region: "Guerrero", country: "M�xico", type: "playa" },
    { name: "Huatulco", region: "Oaxaca", country: "M�xico", type: "playa" },
    { name: "Puerto Escondido", region: "Oaxaca", country: "M�xico", type: "playa" },
    // M�xico - Ciudades
    { name: "Ciudad de M�xico", region: "CDMX", country: "M�xico", type: "ciudad" },
    { name: "Guadalajara", region: "Jalisco", country: "M�xico", type: "ciudad" },
    { name: "Monterrey", region: "Nuevo Le�n", country: "M�xico", type: "ciudad" },
    { name: "M�rida", region: "Yucat�n", country: "M�xico", type: "ciudad" },
    { name: "Oaxaca", region: "Oaxaca", country: "M�xico", type: "ciudad" },
    { name: "Puebla", region: "Puebla", country: "M�xico", type: "ciudad" },
    { name: "Quer�taro", region: "Quer�taro", country: "M�xico", type: "ciudad" },
    { name: "Le�n", region: "Guanajuato", country: "M�xico", type: "ciudad" },
    { name: "Tijuana", region: "Baja California", country: "M�xico", type: "ciudad" },
    // M�xico - Pueblos M�gicos
    { name: "San Miguel de Allende", region: "Guanajuato", country: "M�xico", type: "pueblo" },
    { name: "Guanajuato", region: "Guanajuato", country: "M�xico", type: "pueblo" },
    { name: "San Crist�bal de las Casas", region: "Chiapas", country: "M�xico", type: "pueblo" },
    { name: "Taxco", region: "Guerrero", country: "M�xico", type: "pueblo" },
    { name: "Valle de Bravo", region: "Estado de M�xico", country: "M�xico", type: "pueblo" },
    { name: "Tepoztl�n", region: "Morelos", country: "M�xico", type: "pueblo" },
    { name: "P�tzcuaro", region: "Michoac�n", country: "M�xico", type: "pueblo" },
    { name: "Real de Catorce", region: "San Luis Potos�", country: "M�xico", type: "pueblo" },
    // USA
    { name: "Miami", region: "Florida", country: "Estados Unidos", type: "playa" },
    { name: "Orlando", region: "Florida", country: "Estados Unidos", type: "ciudad" },
    { name: "Nueva York", region: "New York", country: "Estados Unidos", type: "ciudad" },
    { name: "Los Angeles", region: "California", country: "Estados Unidos", type: "ciudad" },
    { name: "Las Vegas", region: "Nevada", country: "Estados Unidos", type: "ciudad" },
    { name: "San Francisco", region: "California", country: "Estados Unidos", type: "ciudad" },
    { name: "Chicago", region: "Illinois", country: "Estados Unidos", type: "ciudad" },
    { name: "Houston", region: "Texas", country: "Estados Unidos", type: "ciudad" },
    { name: "San Diego", region: "California", country: "Estados Unidos", type: "playa" },
    { name: "Honolulu", region: "Hawaii", country: "Estados Unidos", type: "playa" },
    // Europa
    { name: "Madrid", region: "Comunidad de Madrid", country: "Espa�a", type: "ciudad" },
    { name: "Barcelona", region: "Catalu�a", country: "Espa�a", type: "ciudad" },
    { name: "Ibiza", region: "Islas Baleares", country: "Espa�a", type: "playa" },
    { name: "Mallorca", region: "Islas Baleares", country: "Espa�a", type: "playa" },
    { name: "Par�s", region: "�le-de-France", country: "Francia", type: "ciudad" },
    { name: "Niza", region: "Provenza", country: "Francia", type: "playa" },
    { name: "Roma", region: "Lazio", country: "Italia", type: "ciudad" },
    { name: "Venecia", region: "V�neto", country: "Italia", type: "ciudad" },
    { name: "Florencia", region: "Toscana", country: "Italia", type: "ciudad" },
    { name: "Londres", region: "Inglaterra", country: "Reino Unido", type: "ciudad" },
    { name: "�msterdam", region: "Holanda del Norte", country: "Pa�ses Bajos", type: "ciudad" },
    // Caribe
    { name: "Punta Cana", region: "La Altagracia", country: "Rep�blica Dominicana", type: "playa" },
    { name: "Santo Domingo", region: "Distrito Nacional", country: "Rep�blica Dominicana", type: "ciudad" },
    { name: "La Habana", region: "La Habana", country: "Cuba", type: "ciudad" },
    { name: "Varadero", region: "Matanzas", country: "Cuba", type: "playa" },
    { name: "San Juan", region: "Puerto Rico", country: "Puerto Rico", type: "playa" },
    { name: "Aruba", region: "Oranjestad", country: "Aruba", type: "playa" },
    // Centroam�rica
    { name: "Ciudad de Panam�", region: "Panam�", country: "Panam�", type: "ciudad" },
    { name: "San Jos�", region: "San Jos�", country: "Costa Rica", type: "ciudad" },
    { name: "Guanacaste", region: "Guanacaste", country: "Costa Rica", type: "playa" },
    // Sudam�rica
    { name: "Buenos Aires", region: "Buenos Aires", country: "Argentina", type: "ciudad" },
    { name: "R�o de Janeiro", region: "R�o de Janeiro", country: "Brasil", type: "playa" },
    { name: "S�o Paulo", region: "S�o Paulo", country: "Brasil", type: "ciudad" },
    { name: "Lima", region: "Lima", country: "Per�", type: "ciudad" },
    { name: "Cusco", region: "Cusco", country: "Per�", type: "ciudad" },
    { name: "Bogot�", region: "Cundinamarca", country: "Colombia", type: "ciudad" },
    { name: "Cartagena", region: "Bol�var", country: "Colombia", type: "playa" },
  ]

  // Obtener pa�ses �nicos para b�squeda por pa�s
  const countries = [...new Set(allDestinations.map(d => d.country))]

  // Filtrar sugerencias cuando el usuario escribe
  const handleDestinationChange = (value: string) => {
    setDestination(value)
    if (value.length >= 2) {
      const searchTerm = value.toLowerCase()

      // Verificar si busca un pa�s completo
      const matchingCountry = countries.find(c =>
        c.toLowerCase().includes(searchTerm) || searchTerm.includes(c.toLowerCase())
      )

      let results: string[] = []

      if (matchingCountry && searchTerm.length >= 3) {
        // Si busca un pa�s, mostrar TODOS los destinos de ese pa�s con encabezado
        const countryDestinations = allDestinations
          .filter(d => d.country === matchingCountry)
          .map(d => `${d.name}, ${d.region} - ${d.country}`)
        results = [`?? Destinos en ${matchingCountry}:`, ...countryDestinations.slice(0, 8)]
      } else {
        // B�squeda normal por nombre de destino, regi�n o pa�s
        const filtered = allDestinations.filter(d =>
          d.name.toLowerCase().includes(searchTerm) ||
          d.region.toLowerCase().includes(searchTerm) ||
          d.country.toLowerCase().includes(searchTerm)
        )
        results = filtered.slice(0, 8).map(d => {
          const icon = d.type === 'playa' ? '???' : d.type === 'pueblo' ? '???' : '???'
          return `${icon} ${d.name}, ${d.region} - ${d.country}`
        })
      }

      setDestinationSuggestions(results)
      setShowDestinationSuggestions(results.length > 0)
    } else {
      setShowDestinationSuggestions(false)
    }
  }

  const selectDestination = (dest: string) => {
    // Ignorar si es un encabezado
    if (dest.startsWith('??')) return
    // Limpiar emojis y formatear
    const cleanDest = dest.replace(/^[?????????]\s*/, '')
    setDestination(cleanDest)
    setShowDestinationSuggestions(false)
  }

  // Mostrar sugerencias populares al hacer focus en campo vac�o
  const showPopularDestinations = () => {
    if (destination.length < 2) {
      const popular = [
        "?? Destinos Populares:",
        "??? Canc�n, Quintana Roo - M�xico",
        "??? Los Cabos, Baja California Sur - M�xico",
        "??? Puerto Vallarta, Jalisco - M�xico",
        "??? Ciudad de M�xico, CDMX - M�xico",
        "??? Miami, Florida - Estados Unidos",
        "??? Nueva York, New York - Estados Unidos",
        "??? Madrid, Comunidad de Madrid - Espa�a",
        "??? Punta Cana, La Altagracia - Rep�blica Dominicana"
      ]
      setDestinationSuggestions(popular)
      setShowDestinationSuggestions(true)
    }
  }

  // Handler para cuando cambian las fechas en el DateRangePicker
  const handleDateRangeChange = (dateRange: { from?: Date; to?: Date } | undefined) => {
    if (dateRange?.from) {
      setCheckIn(dateRange.from.toISOString().split('T')[0])
    }
    if (dateRange?.to) {
      setCheckOut(dateRange.to.toISOString().split('T')[0])
    }
  }

  // Estados para b�squeda de vuelos
  const [origin, setOrigin] = useState("")
  const [flightDestination, setFlightDestination] = useState("")
  const [flightType, setFlightType] = useState<'roundtrip' | 'oneway'>('roundtrip')
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [childrenAges, setChildrenAges] = useState<number[]>([])
  const [infants, setInfants] = useState(0)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [airlineMode, setAirlineMode] = useState<'include' | 'exclude'>('include')

  // Handler para cambiar cantidad de ni�os
  const handleChildrenChange = (newCount: number) => {
    setChildren(newCount)
    if (newCount > childrenAges.length) {
      // Agregar edades por defecto (5 a�os)
      const newAges = [...childrenAges]
      while (newAges.length < newCount) {
        newAges.push(5)
      }
      setChildrenAges(newAges)
    } else if (newCount < childrenAges.length) {
      // Recortar array de edades
      setChildrenAges(childrenAges.slice(0, newCount))
    }
  }

  // Handler para cambiar edad de un ni�o
  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...childrenAges]
    newAges[index] = age
    setChildrenAges(newAges)
  }

  // Estados para b�squeda de transfers
  const [transferOrigin, setTransferOrigin] = useState("")
  const [transferDestination, setTransferDestination] = useState("")
  const [transferType, setTransferType] = useState('airport-hotel')
  const [transferDate, setTransferDate] = useState("")
  const [transferTime, setTransferTime] = useState("10:00")
  const [transferReturnDate, setTransferReturnDate] = useState("")
  const [transferReturnTime, setTransferReturnTime] = useState("14:00")
  const [transferPassengers, setTransferPassengers] = useState(2)

  // Estados para b�squeda de actividades
  const [activityCity, setActivityCity] = useState("")
  const [activityDate, setActivityDate] = useState("")
  const [activityPersons, setActivityPersons] = useState(2)
  const [activityRadius, setActivityRadius] = useState(20)

  // Estados para b�squeda de autos (rental cars)
  const [carPickupLocation, setCarPickupLocation] = useState("")
  const [carDropoffLocation, setCarDropoffLocation] = useState("")
  const [carSameDropoff, setCarSameDropoff] = useState(true)
  const [carPickupDate, setCarPickupDate] = useState("")
  const [carDropoffDate, setCarDropoffDate] = useState("")
  const [carPickupTime, setCarPickupTime] = useState("10:30")
  const [carDropoffTime, setCarDropoffTime] = useState("10:30")
  const [carYoungDriver, setCarYoungDriver] = useState(false)

  // Estados para b�squeda de paquetes
  const [packageOrigin, setPackageOrigin] = useState("")
  const [packageDestination, setPackageDestination] = useState("")
  const [packageCheckIn, setPackageCheckIn] = useState("")
  const [packageCheckOut, setPackageCheckOut] = useState("")
  const [packageGuests, setPackageGuests] = useState(2)
  const [packageRooms, setPackageRooms] = useState(1)

  // Estados para b�squeda de restaurantes
  const [restaurantCity, setRestaurantCity] = useState("")
  const [restaurantDate, setRestaurantDate] = useState("")
  const [restaurantDiners, setRestaurantDiners] = useState(2)

  // Handler para b�squeda de paquetes
  const handleSearchPackages = async () => {
    if (!packageDestination) {
      alert('Por favor ingresa un destino para buscar paquetes')
      return
    }

    const params = new URLSearchParams()
    params.set('destination', packageDestination)
    if (packageOrigin) params.set('origin', packageOrigin)
    if (packageCheckIn) params.set('checkIn', packageCheckIn)
    if (packageCheckOut) params.set('checkOut', packageCheckOut)
    params.set('guests', packageGuests.toString())
    params.set('rooms', packageRooms.toString())

    router.push(`/resultados/paquetes?${params.toString()}`)
  }

  // Estados para contenido din�mico
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [featuredHero, setFeaturedHero] = useState<FeaturedHero | null>(null)
  const [flightDestinations, setFlightDestinations] = useState<FlightDestination[]>([])
  const [accommodationFavorites, setAccommodationFavorites] = useState<AccommodationFavorite[]>([])
  const [weekendDeals, setWeekendDeals] = useState<WeekendDeal[]>([])
  const [vacationPackages, setVacationPackages] = useState<VacationPackage[]>([])
  const [uniqueStays, setUniqueStays] = useState<UniqueStay[]>([])
  const [exploreDestinations, setExploreDestinations] = useState<ExploreDestination[]>([])
  const [groupTours, setGroupTours] = useState<any[]>([])
  const [loadingTours, setLoadingTours] = useState(false)

  // Estado para info de BD
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)

  // Estados para configuraciones de visibilidad
  const [homeSettings, setHomeSettings] = useState<Record<string, string>>({})
  const [toursVideoUrl, setToursVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ')
  const [homeHeroVideoUrl, setHomeHeroVideoUrl] = useState('')  // Video de fondo del hero
  const [groupsTabVideoUrl, setGroupsTabVideoUrl] = useState('') // Video del tab de grupos

  // Cargar datos din�micos
  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        const [
          promoRes,
          heroRes,
          flightsRes,
          accomRes,
          weekendRes,
          packRes,
          staysRes,
          exploreRes,
          dbRes
        ] = await Promise.all([
          fetch('/api/promotions?limit=3'),
          fetch('/api/homepage/hero'),
          fetch('/api/homepage/flight-destinations?limit=4'),
          fetch('/api/homepage/accommodation-favorites?limit=3'),
          fetch('/api/homepage/weekend-deals?limit=4'),
          fetch('/api/featured-packages?limit=3'),
          fetch('/api/unique-stays?limit=6'),
          fetch('/api/homepage/explore-destinations?limit=6'),
          fetch('/api/debug/db-info')
        ])

        const [
          promoData,
          heroData,
          flightsData,
          accomData,
          weekendData,
          packData,
          staysData,
          exploreData,
          dbData
        ] = await Promise.all([
          promoRes.json(),
          heroRes.json(),
          flightsRes.json(),
          accomRes.json(),
          weekendRes.json(),
          packRes.json(),
          staysRes.json(),
          exploreRes.json(),
          dbRes.json()
        ])

        if (promoData.success) setPromotions(promoData.data)
        if (heroData.success) setFeaturedHero(heroData.data)
        if (flightsData.success) setFlightDestinations(flightsData.data)
        if (accomData.success) setAccommodationFavorites(accomData.data)
        if (weekendData.success) setWeekendDeals(weekendData.data)
        if (packData.success) setVacationPackages(packData.data)
        if (staysData.success) setUniqueStays(staysData.data)
        if (exploreData.success) setExploreDestinations(exploreData.data)
        if (dbData.success) setDbInfo(dbData)
      } catch (error) {
        console.error('Error loading dynamic content:', error)
      }
    }

    fetchDynamicContent()

    // Cargar tours grupales por separado
    const fetchGroupTours = async () => {
      setLoadingTours(true)
      try {
        const res = await fetch('/api/groups?featured=true&limit=4')
        const data = await res.json()
        if (data.success && data.data.packages) {
          setGroupTours(data.data.packages)
        }
      } catch (error) {
        console.error('Error loading group tours:', error)
      } finally {
        setLoadingTours(false)
      }
    }
    fetchGroupTours()

    // Cargar configuraciones de visibilidad
    const fetchHomeSettings = async () => {
      try {
        const res = await fetch('/api/settings?keys=HOME_SEARCH_HOTELS,HOME_PACKAGES_CTA,HOME_OFFERS_SECTION,HOME_FLIGHTS_SECTION,HOME_ACCOMMODATION_SECTION,HOME_WEEKEND_SECTION,HOME_VACATION_PACKAGES,HOME_UNIQUE_STAYS,HOME_EXPLORE_WORLD,TOURS_PROMO_VIDEO_URL,HOME_HERO_VIDEO_URL,GROUPS_TAB_VIDEO_URL')
        const data = await res.json()
        if (data.success && data.settings) {
          setHomeSettings(data.settings)
          if (data.settings.TOURS_PROMO_VIDEO_URL) {
            setToursVideoUrl(data.settings.TOURS_PROMO_VIDEO_URL)
          }
          if (data.settings.HOME_HERO_VIDEO_URL) {
            setHomeHeroVideoUrl(data.settings.HOME_HERO_VIDEO_URL)
          }
          if (data.settings.GROUPS_TAB_VIDEO_URL) {
            setGroupsTabVideoUrl(data.settings.GROUPS_TAB_VIDEO_URL)
          }
        }
      } catch (error) {
        console.error('Error loading home settings:', error)
      }
    }
    fetchHomeSettings()
  }, [])

  const handleSearchHotels = async () => {
    if (!destination) {
      alert('Por favor ingresa un destino')
      return
    }

    const response = await search({
      type: 'hotel',
      city: destination,
      checkin: checkIn || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkout: checkOut || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      guests: guests,
      rooms: rooms,
      currency: 'MXN',
      providers: ['database', 'booking']
    })

    if (response && response.success) {
      localStorage.setItem('searchResults', JSON.stringify(response))
      router.push(`/resultados?type=hotel`)
    }
  }

  const handleSearchFlights = async () => {
    if (!origin || !flightDestination) {
      alert('Por favor ingresa origen y destino')
      return
    }

    const flightSearchParams: Parameters<typeof search>[0] = {
      type: 'flight',
      origin,
      destination: flightDestination,
      departureDate: departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: returnDate,
      adults: adults,
      children: children,
      cabinClass: 'economy',
      currency: 'MXN',
      providers: ['amadeus', 'kiwi', 'expedia']
    }

    // Agregar filtros de aerol�neas si hay selecci�n
    if (selectedAirlines.length > 0) {
      if (airlineMode === 'include') {
        flightSearchParams.includedAirlineCodes = selectedAirlines.join(',')
      } else {
        flightSearchParams.excludedAirlineCodes = selectedAirlines.join(',')
      }
    }

    const response = await search(flightSearchParams)

    if (response && response.success) {
      localStorage.setItem('searchResults', JSON.stringify(response))
      router.push(`/vuelos/${encodeURIComponent(flightDestination)}`)
    }
  }

  const handleSearchTransfers = async () => {
    if (!transferOrigin || !transferDestination || !transferDate) {
      alert('Por favor completa todos los campos')
      return
    }

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(transferDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      alert('La fecha de transfer no puede ser en el pasado')
      return
    }

    const params = new URLSearchParams({
      from: transferOrigin,
      to: transferDestination,
      type: transferType,
      date: transferDate,
      time: transferTime,
      passengers: transferPassengers.toString()
    })

    if (transferType === 'roundtrip') {
      if (!transferReturnDate) {
        alert('Por favor selecciona fecha de regreso')
        return
      }
      params.set('returnDate', transferReturnDate)
      params.set('returnTime', transferReturnTime)
    }

    router.push(`/resultados/transfers?${params.toString()}`)
  }

  const handleSearchRestaurants = async () => {
    if (!restaurantCity) {
      alert('Por favor ingresa una ciudad')
      return
    }
    const params = new URLSearchParams({
      city: restaurantCity,
      date: restaurantDate,
      diners: restaurantDiners.toString()
    })
    router.push(`/resultados/restaurantes?${params.toString()}`)
  }

  const handleSearchActivities = async () => {
    if (!activityCity) {
      alert('Por favor ingresa una ciudad')
      return
    }

    const params = new URLSearchParams({
      city: activityCity,
      radius: activityRadius.toString(),
      persons: activityPersons.toString()
    })

    if (activityDate) {
      params.set('date', activityDate)
    }

    router.push(`/resultados/activities?${params.toString()}`)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header con Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <Logo className="py-2" />
          </div>
          <div className="flex items-center gap-3 md:gap-6 text-sm">
            {/* Bot�n "Obt�n la app" - OCULTO TEMPORALMENTE */}
            {/* <button
              onClick={() => router.push('/app-info')}
              className="hover:text-primary hidden md:flex items-center gap-2"
            >
              <span>Obt�n la app</span>
            </button> */}
            <button
              onClick={() => router.push('/mis-reservas')}
              className="hover:text-primary font-medium"
            >
              Tus Reservas
            </button>
            <button
              onClick={() => router.push('/ayuda')}
              className="hover:text-primary flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Ayuda</span>
            </button>
            <button
              onClick={() => router.push('/notificaciones')}
              className="hover:text-primary relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {/* Badge de notificaciones pendientes */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.name.split(' ')[0]}</span>
                    {/* MXN - OCULTO TEMPORALMENTE (mostramos en d�lares) */}
                    {/* <span className="text-xs text-muted-foreground">MXN</span> */}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 py-2">
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        {user?.role && (
                          <p className="text-xs text-blue-600 font-semibold mt-1">{user.role}</p>
                        )}
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => router.push('/perfil')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <UserIcon className="w-4 h-4" />
                          Mi perfil
                        </button>
                        <button
                          onClick={() => router.push('/mis-reservas')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Package className="w-4 h-4" />
                          Mis reservas
                        </button>
                        <button
                          onClick={() => router.push('/comunicacion')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Centro de Comunicaci�n
                        </button>

                        {/* Opciones de Admin/SuperAdmin */}
                        {user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) && (
                          <>
                            <div className="border-t my-2"></div>
                            <button
                              onClick={() => router.push('/admin/content')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <HomeIcon className="w-4 h-4" />
                              Gesti�n de Contenido
                            </button>
                            <button
                              onClick={() => router.push('/dashboard/corporate')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Compass className="w-4 h-4" />
                              Dashboard Corporativo
                            </button>
                            <button
                              onClick={() => router.push('/dashboard')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Compass className="w-4 h-4" />
                              Dashboard Financiero
                            </button>
                            <button
                              onClick={() => router.push('/dashboard/payments')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Package className="w-4 h-4" />
                              Facturaci�n y Pagos
                            </button>
                            <button
                              onClick={() => router.push('/approvals')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Package className="w-4 h-4" />
                              Aprobaciones
                            </button>
                            <button
                              onClick={() => router.push('/dashboard/quotes')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <FileText className="w-4 h-4" />
                              Cotizaciones
                            </button>
                            <button
                              onClick={() => router.push('/dashboard/itineraries')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Calendar className="w-4 h-4" />
                              Itinerarios
                            </button>
                            <button
                              onClick={() => router.push('/admin/features')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-blue-600 font-medium"
                            >
                              <Shield className="w-4 h-4" />
                              Administraci�n de Funciones
                            </button>
                            <button
                              onClick={() => router.push('/admin/megatravel-scraping')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-green-600 font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Scraping MegaTravel
                            </button>
                          </>
                        )}
                      </div>
                      <div className="border-t pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesi�n
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="hover:text-primary font-medium">Iniciar sesi�n</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image/Video and Filters */}
      <main className="relative">
        {/* Background Image/Video Section */}
        <div className="relative min-h-[600px]">
          {/* Video o Imagen de fondo */}
          {homeHeroVideoUrl ? (
            // Video de fondo configurable
            <div className="absolute inset-0 overflow-hidden">
              {homeHeroVideoUrl.includes('youtube') || homeHeroVideoUrl.includes('vimeo') ? (
                <iframe
                  src={(() => {
                    let embedUrl = homeHeroVideoUrl.replace('watch?v=', 'embed/');
                    const videoIdMatch = embedUrl.match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/);
                    const videoId = videoIdMatch ? videoIdMatch[1] : '';
                    const separator = embedUrl.includes('?') ? '&' : '?';
                    return `${embedUrl}${separator}autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
                  })()}
                  className="absolute w-full h-full object-cover scale-150"
                  style={{ pointerEvents: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                />
              ) : homeHeroVideoUrl.includes('.mp4') || homeHeroVideoUrl.includes('.webm') ? (
                <video
                  src={homeHeroVideoUrl}
                  className="absolute w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${homeHeroVideoUrl})` }}
                />
              )}
            </div>
          ) : (
            // Imagen de fondo por defecto
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: featuredHero
                  ? `url(${featuredHero.image_url})`
                  : 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop)'
              }}
            />
          )}
          {/* Overlay oscuro para mejor contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

          {/* Container con filtros encima */}
          <div className="relative container mx-auto px-4 py-12 max-w-6xl">
            {/* Search Section con glassmorphism sobre la imagen */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-xl bg-white/85 rounded-3xl shadow-2xl p-8 border border-white/30"
            >
              <Tabs defaultValue="groups" className="w-full">
                {/* Barra de navegaci�n en 2 filas */}
                <div className="mb-6 bg-white/50 backdrop-blur-md rounded-xl p-2 space-y-1">
                  {/* Fila 1: Hoteles - AS Home - Vuelos - Traslados - Autos - Actividades - Seguros */}
                  <TabsList className="bg-transparent h-auto p-0 w-full justify-center flex-wrap gap-1">
                    <FeatureGate feature="SEARCH_HOTELS">
                      <TabsTrigger
                        value="stays"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Hotel className="w-4 h-4" />
                        <span>Hoteles</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_ASHOME">
                      <TabsTrigger
                        value="ashome"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <HomeIcon className="w-4 h-4" />
                        <span>AS Home</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_FLIGHTS">
                      <TabsTrigger
                        value="flights"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Plane className="w-4 h-4" />
                        <span>Vuelos</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_TRANSFERS">
                      <TabsTrigger
                        value="transfers"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Bus className="w-4 h-4" />
                        <span>Traslados</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_CARS">
                      <TabsTrigger
                        value="cars"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Car className="w-4 h-4" />
                        <span>Autos</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_ACTIVITIES">
                      <button
                        onClick={() => router.push('/actividades')}
                        className="rounded-lg border-b-2 border-transparent hover:border-primary hover:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm transition-all"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Actividades</span>
                      </button>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_INSURANCE">
                      <TabsTrigger
                        value="insurance"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <span>Seguros</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_ESIM">
                      <TabsTrigger
                        value="esim"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>E-Sim</span>
                      </TabsTrigger>
                    </FeatureGate>
                  </TabsList>

                  {/* Fila 2: Paquetes - Cruceros - Viajes Grupales - Disney - Universal - Xcaret - Conekta - Restaurantes */}
                  <TabsList className="bg-transparent h-auto p-0 w-full justify-center flex-wrap gap-1">
                    <FeatureGate feature="SEARCH_PACKAGES">
                      <TabsTrigger
                        value="packages"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Package className="w-4 h-4" />
                        <span>Paquetes</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_CRUISES">
                      <TabsTrigger
                        value="cruises"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Cruceros</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_GROUPS">
                      <TabsTrigger
                        value="groups"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Users className="w-4 h-4" />
                        <span>Viajes Grupales</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_DISNEY">
                      <TabsTrigger
                        value="disney"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Disney</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_UNIVERSAL">
                      <TabsTrigger
                        value="universal"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Star className="w-4 h-4" />
                        <span>Universal</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_XCARET">
                      <TabsTrigger
                        value="xcaret"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Xcaret</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_CONEKTA">
                      <TabsTrigger
                        value="conekta"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Users className="w-4 h-4" />
                        <span>Conekta</span>
                      </TabsTrigger>
                    </FeatureGate>
                    <FeatureGate feature="SEARCH_RESTAURANTS">
                      <TabsTrigger
                        value="restaurants"
                        className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-3 md:px-4 py-2 flex items-center gap-1.5 text-sm"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Restaurantes</span>
                      </TabsTrigger>
                    </FeatureGate>
                  </TabsList>
                </div>

                <TabsContent value="stays" className="mt-6">
                  {homeSettings.HOME_SEARCH_HOTELS === 'true' ? (
                    <div className="space-y-4">
                      {/* Buscador en una sola fila */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Destino con Datalist (como AS Home) */}
                        <div className="md:col-span-1 relative z-30">
                          <label className="block text-sm font-medium mb-2 text-gray-900">�A d�nde?</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                            <Input
                              placeholder="Ciudad o destino"
                              className="pl-10 h-12 bg-white relative z-20"
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                              list="hoteles-destinations-list"
                            />
                            <datalist id="hoteles-destinations-list">
                              <option value="Canc�n, Quintana Roo, M�xico" />
                              <option value="Playa del Carmen, Quintana Roo, M�xico" />
                              <option value="Tulum, Quintana Roo, M�xico" />
                              <option value="Riviera Maya, Quintana Roo, M�xico" />
                              <option value="Los Cabos, Baja California Sur, M�xico" />
                              <option value="Puerto Vallarta, Jalisco, M�xico" />
                              <option value="Ciudad de M�xico, CDMX, M�xico" />
                              <option value="Guadalajara, Jalisco, M�xico" />
                              <option value="Monterrey, Nuevo Le�n, M�xico" />
                              <option value="M�rida, Yucat�n, M�xico" />
                              <option value="Oaxaca, Oaxaca, M�xico" />
                              <option value="San Miguel de Allende, Guanajuato, M�xico" />
                              <option value="Valle de Bravo, Estado de M�xico, M�xico" />
                              <option value="Acapulco, Guerrero, M�xico" />
                              <option value="Mazatl�n, Sinaloa, M�xico" />
                              <option value="Miami, Florida, Estados Unidos" />
                              <option value="Orlando, Florida, Estados Unidos" />
                              <option value="Nueva York, New York, Estados Unidos" />
                              <option value="Las Vegas, Nevada, Estados Unidos" />
                              <option value="Los Angeles, California, Estados Unidos" />
                              <option value="Madrid, Espa�a" />
                              <option value="Barcelona, Espa�a" />
                              <option value="Par�s, Francia" />
                              <option value="Roma, Italia" />
                              <option value="Londres, Reino Unido" />
                              <option value="Punta Cana, Rep�blica Dominicana" />
                            </datalist>
                          </div>
                        </div>

                        {/* Fechas */}
                        <div className="md:col-span-1 relative z-20">
                          <label className="block text-sm font-medium mb-2 text-gray-900">Fechas</label>
                          <DateRangePicker onDateChange={handleDateRangeChange} />
                        </div>

                        {/* Viajeros */}
                        <div className="md:col-span-1 relative z-10">
                          <label className="block text-sm font-medium mb-2 text-gray-900">Viajeros</label>
                          <GuestSelector />
                        </div>

                        {/* Bot�n Buscar */}
                        <div className="md:col-span-1 flex items-end">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full"
                          >
                            <Button
                              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                              onClick={handleSearchHotels}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Buscando...
                                </>
                              ) : (
                                <>
                                  <Search className="w-5 h-5 mr-2" />
                                  Buscar
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <input type="checkbox" className="w-4 h-4 accent-primary" />
                          <span className="text-sm font-medium">Agregar un vuelo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <span className="text-sm font-medium">Agregar un auto</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <input type="checkbox" className="w-4 h-4 accent-primary" />
                          <span className="text-sm font-medium">E-Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <input type="checkbox" className="w-4 h-4 accent-primary" />
                          <span className="text-sm font-medium">Seguro</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <input type="checkbox" className="w-4 h-4 accent-primary" />
                          <span className="text-sm font-medium">Traslados</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <input type="checkbox" className="w-4 h-4 accent-primary" />
                          <span className="text-sm font-medium">Actividades</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Hotel className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">B�squeda de hoteles pr�ximamente</h3>
                      <p className="text-sm">�Estamos trabajando para ofrecerte la mejor experiencia de b�squeda!</p>
                      <p className="text-sm mt-2">Mientras tanto, explora nuestros <button onClick={() => router.push('/tours')} className="text-blue-600 underline">Tours y Viajes Grupales</button></p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="flights" className="mt-6">
                  <div className="space-y-4">
                    {/* Tipo de viaje */}
                    <div className="flex gap-6 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="flightType"
                          checked={flightType === 'roundtrip'}
                          onChange={() => setFlightType('roundtrip')}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-900">Ida y vuelta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="flightType"
                          checked={flightType === 'oneway'}
                          onChange={() => setFlightType('oneway')}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-900">Solo ida</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Origen */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Origen</label>
                        <div className="relative">
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ej: M�xico, MEX"
                            className="pl-10 h-12 bg-white uppercase"
                            value={origin}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z\s,]/g, '').toUpperCase()
                              setOrigin(val)
                            }}
                            list="airports-origin"
                          />
                          <datalist id="airports-origin">
                            {/* Principales */}
                            <option value="MEX">Ciudad de M�xico (MEX)</option>
                            <option value="GDL">Guadalajara, Jalisco (GDL)</option>
                            <option value="MTY">Monterrey, Nuevo Le�n (MTY)</option>
                            <option value="CUN">Canc�n, Quintana Roo (CUN)</option>
                            <option value="TIJ">Tijuana, Baja California (TIJ)</option>
                            <option value="SJD">Los Cabos, BCS (SJD)</option>
                            <option value="PVR">Puerto Vallarta, Jalisco (PVR)</option>
                            {/* Norte */}
                            <option value="CJS">Ciudad Ju�rez, Chihuahua (CJS)</option>
                            <option value="CUU">Chihuahua, Chihuahua (CUU)</option>
                            <option value="HMO">Hermosillo, Sonora (HMO)</option>
                            <option value="MZT">Mazatl�n, Sinaloa (MZT)</option>
                            <option value="CUL">Culiac�n, Sinaloa (CUL)</option>
                            <option value="SLP">San Luis Potos� (SLP)</option>
                            <option value="AGU">Aguascalientes (AGU)</option>
                            <option value="ZCL">Zacatecas (ZCL)</option>
                            <option value="LAP">La Paz, BCS (LAP)</option>
                            <option value="REX">Reynosa, Tamaulipas (REX)</option>
                            <option value="TAM">Tampico, Tamaulipas (TAM)</option>
                            <option value="NLD">Nuevo Laredo, Tamaulipas (NLD)</option>
                            <option value="MXL">Mexicali, Baja California (MXL)</option>
                            {/* Centro */}
                            <option value="BJX">Le�n, Guanajuato (BJX)</option>
                            <option value="QRO">Quer�taro (QRO)</option>
                            <option value="MLM">Morelia, Michoac�n (MLM)</option>
                            <option value="PBC">Puebla (PBC)</option>
                            <option value="TLC">Toluca, Estado de M�xico (TLC)</option>
                            <option value="CVM">Ciudad Victoria, Tamaulipas (CVM)</option>
                            {/* Sur */}
                            <option value="OAX">Oaxaca (OAX)</option>
                            <option value="HUX">Huatulco, Oaxaca (HUX)</option>
                            <option value="ZIH">Zihuatanejo, Guerrero (ZIH)</option>
                            <option value="ACA">Acapulco, Guerrero (ACA)</option>
                            <option value="VSA">Villahermosa, Tabasco (VSA)</option>
                            <option value="TAP">Tapachula, Chiapas (TAP)</option>
                            <option value="TGZ">Tuxtla Guti�rrez, Chiapas (TGZ)</option>
                            {/* Sureste */}
                            <option value="MID">M�rida, Yucat�n (MID)</option>
                            <option value="CME">Ciudad del Carmen, Campeche (CME)</option>
                            <option value="CZM">Cozumel, Quintana Roo (CZM)</option>
                            <option value="VER">Veracruz (VER)</option>
                          </datalist>
                        </div>
                      </div>

                      {/* Destino */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Destino</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ej: Canc�n, CUN"
                            className="pl-10 h-12 bg-white uppercase"
                            value={flightDestination}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z\s,]/g, '').toUpperCase()
                              setFlightDestination(val)
                            }}
                            list="airports-destination"
                          />
                          <datalist id="airports-destination">
                            {/* M�xico - Playa */}
                            <option value="CUN">Canc�n, Quintana Roo (CUN)</option>
                            <option value="SJD">Los Cabos, BCS (SJD)</option>
                            <option value="PVR">Puerto Vallarta, Jalisco (PVR)</option>
                            <option value="MZT">Mazatl�n, Sinaloa (MZT)</option>
                            <option value="HUX">Huatulco, Oaxaca (HUX)</option>
                            <option value="ZIH">Zihuatanejo, Guerrero (ZIH)</option>
                            <option value="ACA">Acapulco, Guerrero (ACA)</option>
                            <option value="CZM">Cozumel, Quintana Roo (CZM)</option>
                            {/* M�xico - Ciudades */}
                            <option value="MEX">Ciudad de M�xico (MEX)</option>
                            <option value="GDL">Guadalajara, Jalisco (GDL)</option>
                            <option value="MTY">Monterrey, Nuevo Le�n (MTY)</option>
                            <option value="OAX">Oaxaca (OAX)</option>
                            <option value="MID">M�rida, Yucat�n (MID)</option>
                            <option value="BJX">Le�n, Guanajuato (BJX)</option>
                            <option value="QRO">Quer�taro (QRO)</option>
                            {/* USA */}
                            <option value="MIA">Miami, Florida (MIA)</option>
                            <option value="LAX">Los Angeles, California (LAX)</option>
                            <option value="JFK">Nueva York (JFK)</option>
                            <option value="LAS">Las Vegas, Nevada (LAS)</option>
                            <option value="MCO">Orlando, Florida (MCO)</option>
                            <option value="DFW">Dallas, Texas (DFW)</option>
                            <option value="IAH">Houston, Texas (IAH)</option>
                            <option value="SFO">San Francisco, California (SFO)</option>
                            <option value="PHX">Phoenix, Arizona (PHX)</option>
                            <option value="DEN">Denver, Colorado (DEN)</option>
                            {/* Europa */}
                            <option value="MAD">Madrid, Espa�a (MAD)</option>
                            <option value="BCN">Barcelona, Espa�a (BCN)</option>
                            <option value="CDG">Par�s, Francia (CDG)</option>
                            <option value="FCO">Roma, Italia (FCO)</option>
                            <option value="LHR">Londres, UK (LHR)</option>
                            <option value="AMS">Amsterdam, Pa�ses Bajos (AMS)</option>
                            <option value="FRA">Frankfurt, Alemania (FRA)</option>
                            {/* Centroam�rica y Caribe */}
                            <option value="HAV">La Habana, Cuba (HAV)</option>
                            <option value="SJU">San Juan, Puerto Rico (SJU)</option>
                            <option value="PTY">Ciudad de Panam� (PTY)</option>
                            <option value="SJO">San Jos�, Costa Rica (SJO)</option>
                            <option value="GUA">Guatemala City (GUA)</option>
                            {/* Sudam�rica */}
                            <option value="BOG">Bogot�, Colombia (BOG)</option>
                            <option value="LIM">Lima, Per� (LIM)</option>
                            <option value="SCL">Santiago, Chile (SCL)</option>
                            <option value="EZE">Buenos Aires, Argentina (EZE)</option>
                            <option value="GRU">S�o Paulo, Brasil (GRU)</option>
                          </datalist>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fechas</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            className="h-12 bg-white"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                          />
                          {flightType === 'roundtrip' && (
                            <Input
                              type="date"
                              className="h-12 bg-white"
                              placeholder="Retorno"
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Bot�n Buscar */}
                      <div className="md:col-span-1 flex items-end">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={handleSearchFlights}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Buscando...
                              </>
                            ) : (
                              <>
                                <Search className="w-5 h-5 mr-2" />
                                Buscar
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                      {/* Pasajeros */}
                      <div className="md:col-span-2 grid grid-cols-3 gap-3">
                        <div>
                          <CounterSelector
                            label="Adultos (12+)"
                            value={adults}
                            onChange={setAdults}
                            min={1}
                            max={9}
                            showQuickButtons={false}
                          />
                        </div>
                        <div>
                          <CounterSelector
                            label="Ni�os (2-11)"
                            value={children}
                            onChange={handleChildrenChange}
                            min={0}
                            max={6}
                            showQuickButtons={false}
                          />
                        </div>
                        <div>
                          <CounterSelector
                            label="Beb�s (0-2)"
                            value={infants}
                            onChange={setInfants}
                            min={0}
                            max={3}
                            showQuickButtons={false}
                          />
                        </div>
                      </div>

                      {/* Aerol�neas */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1 text-gray-700">Aerol�neas preferidas</label>
                        <AirlineSelector
                          value={selectedAirlines}
                          onChange={setSelectedAirlines}
                          mode={airlineMode}
                        />
                      </div>
                    </div>

                    {/* Edades de ni�os */}
                    {children > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-3">Edad de los ni�os al momento del viaje:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {childrenAges.map((age, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 whitespace-nowrap">Ni�o {index + 1}:</span>
                              <select
                                value={age}
                                onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value))}
                                className="flex-1 h-8 px-2 border rounded bg-white text-sm"
                              >
                                {Array.from({ length: 10 }, (_, i) => i + 2).map(n => (
                                  <option key={n} value={n}>{n} a�os</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nota sobre beb�s */}
                    {infants > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                        <p className="text-xs text-amber-800">
                          <strong>Nota:</strong> Los beb�s (0-2 a�os) pueden viajar en el regazo del adulto sin costo adicional o en asiento propio con cargo. Cada adulto puede viajar con m�ximo 1 beb� en regazo.
                        </p>
                      </div>
                    )}

                    {/* Pol�tica de viaje */}
                    <div className="bg-blue-50 rounded-lg p-3 mt-3">
                      <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Pol�ticas de viaje:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Ni�os de 2-11 a�os deben viajar acompa�ados de un adulto</li>
                          <li>Beb�s menores de 2 a�os: 1 por adulto (en regazo gratis, asiento propio con cargo)</li>
                          <li>Menores de 18 a�os sin acompa�ante requieren autorizaci�n especial</li>
                          <li>Documentaci�n requerida: INE/Pasaporte vigente para todos los pasajeros</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transfers" className="mt-6">
                  <div className="space-y-4">
                    {/* Tipo de traslado */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="transferType" value="airport-hotel" checked={transferType === 'airport-hotel'} onChange={() => setTransferType('airport-hotel')} className="w-4 h-4 accent-primary" />
                        <span className="text-sm font-medium text-gray-900">Aeropuerto ? Hotel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="transferType" value="hotel-airport" checked={transferType === 'hotel-airport'} onChange={() => setTransferType('hotel-airport')} className="w-4 h-4 accent-primary" />
                        <span className="text-sm font-medium text-gray-900">Hotel ? Aeropuerto</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="transferType" value="roundtrip" checked={transferType === 'roundtrip'} onChange={() => setTransferType('roundtrip')} className="w-4 h-4 accent-primary" />
                        <span className="text-sm font-medium text-gray-900">Redondo</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Origen - Aeropuertos principales */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Desde</label>
                        <div className="relative">
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Aeropuerto o ciudad"
                            value={transferOrigin}
                            onChange={(e) => setTransferOrigin(e.target.value)}
                            className="pl-10 h-12 bg-white"
                            list="transfer-airports"
                          />
                          <datalist id="transfer-airports">
                            {/* M�xico */}
                            <option value="Aeropuerto Internacional de la Ciudad de M�xico (MEX)" />
                            <option value="Aeropuerto Internacional de Canc�n (CUN)" />
                            <option value="Aeropuerto Internacional de Guadalajara (GDL)" />
                            <option value="Aeropuerto Internacional de Monterrey (MTY)" />
                            <option value="Aeropuerto Internacional de Los Cabos (SJD)" />
                            <option value="Aeropuerto Internacional de Puerto Vallarta (PVR)" />
                            <option value="Aeropuerto Internacional de Tijuana (TIJ)" />
                            <option value="Aeropuerto Internacional de M�rida (MID)" />
                            <option value="Aeropuerto Internacional de Oaxaca (OAX)" />
                            {/* USA */}
                            <option value="Miami International Airport (MIA)" />
                            <option value="Los Angeles International Airport (LAX)" />
                            <option value="John F. Kennedy International Airport (JFK)" />
                            <option value="Las Vegas McCarran Airport (LAS)" />
                            <option value="Orlando International Airport (MCO)" />
                            <option value="Dallas/Fort Worth Airport (DFW)" />
                            <option value="Houston George Bush Airport (IAH)" />
                            <option value="San Francisco International Airport (SFO)" />
                            {/* Europa */}
                            <option value="Madrid-Barajas Airport (MAD)" />
                            <option value="Barcelona El Prat Airport (BCN)" />
                            <option value="Paris Charles de Gaulle Airport (CDG)" />
                            <option value="London Heathrow Airport (LHR)" />
                            <option value="Rome Fiumicino Airport (FCO)" />
                            <option value="Amsterdam Schiphol Airport (AMS)" />
                            <option value="Frankfurt Airport (FRA)" />
                          </datalist>
                        </div>
                      </div>

                      {/* Destino - Hoteles principales */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Hasta</label>
                        <div className="relative">
                          <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Hotel o direcci�n"
                            value={transferDestination}
                            onChange={(e) => setTransferDestination(e.target.value)}
                            className="pl-10 h-12 bg-white"
                            list="transfer-hotels"
                          />
                          <datalist id="transfer-hotels">
                            {/* Cadenas hoteleras internacionales */}
                            <option value="Marriott Hotels & Resorts" />
                            <option value="Hilton Hotels & Resorts" />
                            <option value="Hyatt Hotels" />
                            <option value="InterContinental Hotels" />
                            <option value="Four Seasons Hotels" />
                            <option value="Ritz-Carlton" />
                            <option value="Westin Hotels" />
                            <option value="Sheraton Hotels" />
                            <option value="Holiday Inn" />
                            <option value="Best Western" />
                            <option value="Radisson Hotels" />
                            <option value="Wyndham Hotels" />
                            <option value="Accor Hotels (Novotel, Ibis, Sofitel)" />
                            {/* Cadenas mexicanas */}
                            <option value="Fiesta Americana" />
                            <option value="Posadas (Fiesta Inn, Live Aqua)" />
                            <option value="Oasis Hotels" />
                            <option value="Palace Resorts" />
                            <option value="RIU Hotels & Resorts" />
                            <option value="Barcel� Hotels" />
                            <option value="Iberostar Hotels" />
                            <option value="Grand Palladium" />
                            <option value="Hard Rock Hotels" />
                            <option value="Secrets Resorts" />
                            <option value="Dreams Resorts" />
                            <option value="Sandos Hotels" />
                            <option value="Xcaret Hotels" />
                          </datalist>
                        </div>
                      </div>

                      {/* Fecha y Hora */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">
                          {transferType === 'roundtrip' ? 'Fecha de ida' : 'Fecha y Hora'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="h-12 bg-white"
                          />
                          <Input
                            type="time"
                            value={transferTime}
                            onChange={(e) => setTransferTime(e.target.value)}
                            className="h-12 bg-white"
                          />
                        </div>
                        {transferType === 'roundtrip' && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium mb-2 text-gray-900">Fecha de regreso</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="date"
                                placeholder="F. Regreso"
                                value={transferReturnDate}
                                onChange={(e) => setTransferReturnDate(e.target.value)}
                                min={transferDate || new Date().toISOString().split('T')[0]}
                                className="h-12 bg-white"
                              />
                              <Input
                                type="time"
                                value={transferReturnTime}
                                onChange={(e) => setTransferReturnTime(e.target.value)}
                                className="h-12 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bot�n Buscar */}
                      <div className="md:col-span-1 flex items-end">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={handleSearchTransfers}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Buscando...
                              </>
                            ) : (
                              <>
                                <Search className="w-5 h-5 mr-2" />
                                Buscar
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <label className="font-medium">Pasajeros:</label>
                      <div className="w-32">
                        <CounterSelector
                          value={transferPassengers}
                          onChange={setTransferPassengers}
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Autos - Estilo Expedia */}
                <TabsContent value="cars" className="mt-6">
                  <div className="space-y-4">
                    {/* Primera fila: Lugares */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Entrega</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Aeropuerto, ciudad u oficina"
                            className="pl-10 h-12 bg-white"
                            value={carPickupLocation}
                            onChange={(e) => setCarPickupLocation(e.target.value)}
                            list="car-pickup-locations"
                          />
                          <datalist id="car-pickup-locations">
                            <option value="Aeropuerto Internacional de la Ciudad de M�xico (MEX)" />
                            <option value="Aeropuerto de Canc�n (CUN)" />
                            <option value="Aeropuerto de Guadalajara (GDL)" />
                            <option value="Aeropuerto de Monterrey (MTY)" />
                            <option value="Aeropuerto de Los Cabos (SJD)" />
                            <option value="Aeropuerto de Puerto Vallarta (PVR)" />
                            <option value="Hertz - Centro Hist�rico CDMX" />
                            <option value="Avis - Polanco CDMX" />
                            <option value="Enterprise - Santa Fe CDMX" />
                            <option value="Budget - Zona Rosa CDMX" />
                            <option value="National - Reforma CDMX" />
                            <option value="Alamo - Aeropuerto CDMX" />
                            <option value="Miami International Airport (MIA)" />
                            <option value="Los Angeles International Airport (LAX)" />
                            <option value="Orlando International Airport (MCO)" />
                            <option value="Las Vegas Airport (LAS)" />
                            <option value="Madrid-Barajas Airport (MAD)" />
                            <option value="Barcelona El Prat Airport (BCN)" />
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Devoluci�n {carSameDropoff && "(igual a la entrega)"}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder={carSameDropoff ? "Mismo lugar de entrega" : "Aeropuerto, ciudad u oficina"}
                            className="pl-10 h-12 bg-white"
                            value={carSameDropoff ? carPickupLocation : carDropoffLocation}
                            onChange={(e) => setCarDropoffLocation(e.target.value)}
                            disabled={carSameDropoff}
                            list="car-dropoff-locations"
                          />
                          <datalist id="car-dropoff-locations">
                            <option value="Aeropuerto Internacional de la Ciudad de M�xico (MEX)" />
                            <option value="Aeropuerto de Canc�n (CUN)" />
                            <option value="Aeropuerto de Guadalajara (GDL)" />
                            <option value="Aeropuerto de Monterrey (MTY)" />
                            <option value="Aeropuerto de Los Cabos (SJD)" />
                            <option value="Aeropuerto de Puerto Vallarta (PVR)" />
                          </datalist>
                        </div>
                      </div>
                    </div>

                    {/* Segunda fila: Fechas y horas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Fecha de entrega
                        </label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={carPickupDate}
                          onChange={(e) => setCarPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Fecha de devoluci�n
                        </label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={carDropoffDate}
                          onChange={(e) => setCarDropoffDate(e.target.value)}
                          min={carPickupDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Hora entrega</label>
                        <select
                          className="w-full h-12 px-3 border rounded-lg bg-white text-sm"
                          value={carPickupTime}
                          onChange={(e) => setCarPickupTime(e.target.value)}
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2)
                            const min = i % 2 === 0 ? '00' : '30'
                            const time = `${hour.toString().padStart(2, '0')}:${min}`
                            return <option key={time} value={time}>{time}</option>
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Hora devoluci�n</label>
                        <select
                          className="w-full h-12 px-3 border rounded-lg bg-white text-sm"
                          value={carDropoffTime}
                          onChange={(e) => setCarDropoffTime(e.target.value)}
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2)
                            const min = i % 2 === 0 ? '00' : '30'
                            const time = `${hour.toString().padStart(2, '0')}:${min}`
                            return <option key={time} value={time}>{time}</option>
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Opciones adicionales */}
                    <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-primary rounded"
                          checked={carSameDropoff}
                          onChange={(e) => setCarSameDropoff(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Devolver en el mismo lugar de entrega</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-primary rounded"
                          checked={carYoungDriver}
                          onChange={(e) => setCarYoungDriver(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Conductor menor de 30 o mayor de 70 a�os</span>
                      </label>
                      {carYoungDriver && (
                        <p className="text-xs text-amber-600">Puede ser necesario un cargo extra por conductor joven o adulto mayor.</p>
                      )}
                    </div>

                    {/* Link de descuento y bot�n */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Tengo un c�digo de descuento
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <Button
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                        onClick={() => {
                          if (!carPickupLocation || !carPickupDate || !carDropoffDate) {
                            alert('Por favor completa todos los campos obligatorios')
                            return
                          }
                          const params = new URLSearchParams({
                            pickup: carPickupLocation,
                            dropoff: carSameDropoff ? carPickupLocation : carDropoffLocation,
                            pickupDate: carPickupDate,
                            dropoffDate: carDropoffDate,
                            pickupTime: carPickupTime,
                            dropoffTime: carDropoffTime,
                            youngDriver: carYoungDriver.toString()
                          })
                          router.push(`/resultados/autos?${params.toString()}`)
                        }}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="packages" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Arma tu paquete ideal seleccionando lo que necesitas:</p>
                    {/* Checks para agregar servicios */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Vuelo</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                        <Hotel className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Hotel</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Bus className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Traslado</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Car className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Auto</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Actividad</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <span className="text-sm font-medium">Seguro</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Compass className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Crucero</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Grupal</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Disney</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Universal</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Xcaret</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">E-Sim</span>
                      </label>
                    </div>
                    {/* Opciones especiales */}
                    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <span className="text-sm">Solo necesito hospedaje parte del viaje</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <span className="text-sm">Incluir AS Home (casas tipo Airbnb)</span>
                      </label>
                    </div>
                    {/* Formulario mejorado con origen y destino */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      {/* Origen */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Origen</label>
                        <div className="relative">
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                          <Input
                            placeholder="�De d�nde sales?"
                            className="pl-10 h-12 bg-white"
                            value={packageOrigin}
                            onChange={(e) => setPackageOrigin(e.target.value)}
                            list="package-origins"
                          />
                          <datalist id="package-origins">
                            <option value="Ciudad de M�xico, CDMX, M�xico" />
                            <option value="Guadalajara, Jalisco, M�xico" />
                            <option value="Monterrey, Nuevo Le�n, M�xico" />
                            <option value="Tijuana, Baja California, M�xico" />
                            <option value="Le�n, Guanajuato, M�xico" />
                            <option value="Quer�taro, Quer�taro, M�xico" />
                            <option value="Puebla, Puebla, M�xico" />
                            <option value="M�rida, Yucat�n, M�xico" />
                          </datalist>
                        </div>
                      </div>
                      {/* Destino */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Destino</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                          <Input
                            placeholder="�A d�nde vas?"
                            className="pl-10 h-12 bg-white"
                            value={packageDestination}
                            onChange={(e) => setPackageDestination(e.target.value)}
                            list="package-destinations"
                          />
                          <datalist id="package-destinations">
                            <option value="Canc�n, Quintana Roo, M�xico" />
                            <option value="Playa del Carmen, Quintana Roo, M�xico" />
                            <option value="Los Cabos, Baja California Sur, M�xico" />
                            <option value="Puerto Vallarta, Jalisco, M�xico" />
                            <option value="Miami, Florida, USA" />
                            <option value="Orlando, Florida, USA" />
                            <option value="Las Vegas, Nevada, USA" />
                            <option value="Nueva York, New York, USA" />
                            <option value="Par�s, Francia" />
                            <option value="Madrid, Espa�a" />
                            <option value="Barcelona, Espa�a" />
                            <option value="Roma, Italia" />
                            <option value="Punta Cana, Rep�blica Dominicana" />
                          </datalist>
                        </div>
                      </div>
                      {/* Fechas */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha salida</label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={packageCheckIn}
                          onChange={(e) => setPackageCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha regreso</label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={packageCheckOut}
                          onChange={(e) => setPackageCheckOut(e.target.value)}
                          min={packageCheckIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      {/* Viajeros */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Viajeros</label>
                        <select
                          value={packageGuests}
                          onChange={(e) => setPackageGuests(parseInt(e.target.value))}
                          className="w-full h-12 px-3 border rounded-lg bg-white text-sm"
                        >
                          <option value="1">1 viajero</option>
                          <option value="2">2 viajeros</option>
                          <option value="3">3 viajeros</option>
                          <option value="4">4 viajeros</option>
                          <option value="5">5 viajeros</option>
                          <option value="6">6+ viajeros</option>
                        </select>
                      </div>
                      {/* Bot�n */}
                      <div className="flex items-end">
                        <Button
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                          onClick={handleSearchPackages}
                        >
                          <Search className="w-5 h-5 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="things" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Ciudad con sugerencias */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">�A d�nde?</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ciudad o destino"
                            value={activityCity}
                            onChange={(e) => setActivityCity(e.target.value)}
                            className="pl-10 h-12 bg-white"
                            list="activity-destinations"
                          />
                          <datalist id="activity-destinations">
                            {/* M�xico - Playas */}
                            <option value="Canc�n, Quintana Roo, M�xico" />
                            <option value="Playa del Carmen, Quintana Roo, M�xico" />
                            <option value="Riviera Maya, Quintana Roo, M�xico" />
                            <option value="Los Cabos, Baja California Sur, M�xico" />
                            <option value="Puerto Vallarta, Jalisco, M�xico" />
                            {/* M�xico - Ciudades */}
                            <option value="Ciudad de M�xico, CDMX, M�xico" />
                            <option value="Guadalajara, Jalisco, M�xico" />
                            <option value="Oaxaca, Oaxaca, M�xico" />
                            <option value="San Miguel de Allende, Guanajuato, M�xico" />
                            <option value="M�rida, Yucat�n, M�xico" />
                            {/* USA */}
                            <option value="Orlando, Florida, USA" />
                            <option value="Miami, Florida, USA" />
                            <option value="Las Vegas, Nevada, USA" />
                            <option value="Nueva York, New York, USA" />
                            <option value="Los Angeles, California, USA" />
                            {/* Europa */}
                            <option value="Par�s, Francia" />
                            <option value="Barcelona, Espa�a" />
                            <option value="Roma, Italia" />
                            <option value="Londres, Reino Unido" />
                            {/* Caribe */}
                            <option value="Punta Cana, Rep�blica Dominicana" />
                          </datalist>
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha</label>
                        <Input
                          type="date"
                          value={activityDate}
                          onChange={(e) => setActivityDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-12 bg-white"
                        />
                      </div>

                      {/* Personas */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Personas</label>
                        <select
                          value={activityPersons}
                          onChange={(e) => setActivityPersons(parseInt(e.target.value))}
                          className="w-full h-12 px-3 border rounded-lg bg-white"
                        >
                          <option value="1">1 persona</option>
                          <option value="2">2 personas</option>
                          <option value="3">3 personas</option>
                          <option value="4">4 personas</option>
                          <option value="5">5 personas</option>
                          <option value="6">6+ personas</option>
                        </select>
                      </div>

                      {/* Radio de b�squeda */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Radio (km)</label>
                        <select
                          value={activityRadius}
                          onChange={(e) => setActivityRadius(parseInt(e.target.value))}
                          className="w-full h-12 px-3 border rounded-lg bg-white"
                        >
                          <option value="5">5 km</option>
                          <option value="10">10 km</option>
                          <option value="20">20 km</option>
                          <option value="50">50 km</option>
                        </select>
                      </div>

                      {/* Bot�n Buscar */}
                      <div className="md:col-span-1 flex items-end">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={handleSearchActivities}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Buscando...
                              </>
                            ) : (
                              <>
                                <Search className="w-5 h-5 mr-2" />
                                Buscar
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    {/* Checkboxes para agregar servicios */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span>Agregar vuelo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                        <Car className="w-4 h-4 text-blue-600" />
                        <span>Agregar auto</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                        <Hotel className="w-4 h-4 text-blue-600" />
                        <span>Agregar hospedaje</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cruises">
                  <div className="text-center py-8">
                    <Compass className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Cruceros</h3>
                    <p className="text-gray-700">Pr�ximamente...</p>
                  </div>
                </TabsContent>

                <TabsContent value="ashome" className="mt-6">
                  <div className="space-y-4">
                    {/* Header con leyenda y bot�n Publica tu casa */}
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <p className="text-sm text-gray-600">Encuentra casas, departamentos y villas para tu pr�ximo viaje</p>
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push('/ashome/publicar')}
                      >
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Publica tu casa
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">�A d�nde?</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ciudad o destino"
                            className="pl-10 h-12 bg-white"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            list="ashome-destinations"
                          />
                          <datalist id="ashome-destinations">
                            <option value="Canc�n, Quintana Roo, M�xico" />
                            <option value="Playa del Carmen, Quintana Roo, M�xico" />
                            <option value="Tulum, Quintana Roo, M�xico" />
                            <option value="Ciudad de M�xico, CDMX, M�xico" />
                            <option value="San Miguel de Allende, Guanajuato, M�xico" />
                            <option value="Valle de Bravo, Estado de M�xico, M�xico" />
                            <option value="Puerto Vallarta, Jalisco, M�xico" />
                            <option value="Los Cabos, Baja California Sur, M�xico" />
                            <option value="Oaxaca, Oaxaca, M�xico" />
                            <option value="M�rida, Yucat�n, M�xico" />
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Check-in</label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Check-out</label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Hu�spedes</label>
                        <div className="bg-white rounded-lg">
                          <CounterSelector
                            value={guests}
                            onChange={setGuests}
                            min={1}
                            max={20}
                            showQuickButtons={false}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Bot�n Buscar a la derecha */}
                    <div className="flex justify-end pt-2">
                      <Button
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                        onClick={() => {
                          const params = new URLSearchParams({
                            destination: destination,
                            checkIn: checkIn,
                            checkOut: checkOut,
                            guests: guests.toString()
                          })
                          router.push(`/resultados/ashome?${params.toString()}`)
                        }}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Buscar casas
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Seguros */}
                <TabsContent value="insurance">
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Seguros de Viaje</h3>
                    <p className="text-gray-600 mb-4">Viaja protegido con nuestros seguros de viaje</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Ver opciones de seguro
                    </Button>
                  </div>
                </TabsContent>

                {/* Viajes Grupales */}
                <TabsContent value="groups" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Tours y Viajes Grupales</h3>
                      <Button
                        variant="link"
                        className="text-blue-600 font-semibold"
                        onClick={() => router.push('/tours')}
                      >
                        Ver todos los tours
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    {/* Video promocional - usa GROUPS_TAB_VIDEO_URL o TOURS_PROMO_VIDEO_URL como fallback */}
                    {(() => {
                      const videoUrl = groupsTabVideoUrl || toursVideoUrl;
                      return (
                        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 bg-gray-900">
                          {videoUrl.includes('youtube') || videoUrl.includes('vimeo') ? (
                            <iframe
                              src={(() => {
                                let embedUrl = videoUrl.replace('watch?v=', 'embed/');
                                const videoIdMatch = embedUrl.match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/);
                                const videoId = videoIdMatch ? videoIdMatch[1] : '';
                                const separator = embedUrl.includes('?') ? '&' : '?';
                                return `${embedUrl}${separator}autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
                              })()}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                              title="Video promocional de viajes grupales"
                            />
                          ) : videoUrl.includes('.mp4') || videoUrl.includes('.webm') ? (
                            <video
                              src={videoUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img
                              src={videoUrl}
                              alt="Tours y Viajes Grupales"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h4 className="text-2xl font-bold mb-2">Descubre el Mundo</h4>
                            <p className="text-sm opacity-90">Tours todo incluido con vuelo, hotel y gu�a tur�stico</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Buscador de Tours */}
                    <div className="max-w-2xl mx-auto mb-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Buscar destino, pa�s o tour..."
                          value={tourSearch}
                          onChange={(e) => setTourSearch(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && tourSearch.trim()) {
                              router.push(`/tours?search=${encodeURIComponent(tourSearch)}`)
                            }
                          }}
                          className="pl-12 pr-32 py-6 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 bg-white shadow-sm"
                        />
                        <Button
                          onClick={() => {
                            if (tourSearch.trim()) {
                              router.push(`/tours?search=${encodeURIComponent(tourSearch)}`)
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-8 py-5 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                        >
                          Buscar
                        </Button>
                      </div>
                    </div>

                    {loadingTours ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        <span className="text-gray-600">Cargando tours...</span>
                      </div>
                    ) : groupTours.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {groupTours.slice(0, 4).map((tour: any) => (
                          <Card
                            key={tour.id}
                            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                            onClick={() => router.push(`/tours/${tour.id}`)}
                          >
                            <div className="relative h-32">
                              <img
                                src={tour.images?.main || '/placeholder.jpg'}
                                alt={tour.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <span className="text-xs text-white/80">{tour.region}</span>
                                <h4 className="font-bold text-white text-sm line-clamp-1">{tour.name}</h4>
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-gray-500">{tour.duration}</span>
                                  <div className="font-bold text-blue-600">
                                    ${new Intl.NumberFormat('es-MX').format(tour.pricing?.totalPrice || 0)} USD
                                  </div>
                                </div>
                                {tour.flight?.included && (
                                  <Plane className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No hay tours disponibles en este momento
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        className="flex-1 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                        onClick={() => router.push('/tours')}
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Ver cat�logo completo
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push('/viajes-grupales')}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        Cotizaci�n especial - Grupos Grandes
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Disney */}
                <TabsContent value="disney">
                  <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Disney Parks</h3>
                    <p className="text-gray-600 mb-4">Vive la magia de Disney con paquetes exclusivos</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Ver paquetes Disney
                    </Button>
                  </div>
                </TabsContent>

                {/* Universal */}
                <TabsContent value="universal">
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Universal Studios</h3>
                    <p className="text-gray-600 mb-4">Aventuras �picas en Universal Studios</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Ver paquetes Universal
                    </Button>
                  </div>
                </TabsContent>

                {/* Xcaret */}
                <TabsContent value="xcaret">
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Xcaret Parks</h3>
                    <p className="text-gray-600 mb-4">Experiencias �nicas en los parques Xcaret</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Ver paquetes Xcaret
                    </Button>
                  </div>
                </TabsContent>

                {/* Conekta - Expos y capacitaciones */}
                <TabsContent value="conekta">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Conekta</h3>
                    <p className="text-gray-600 mb-4">Expos, capacitaciones y eventos corporativos</p>
                    <p className="text-sm text-gray-500">Pr�ximamente...</p>
                  </div>
                </TabsContent>

                <TabsContent value="restaurants" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">�A d�nde?</label>
                        <div className="relative">
                          <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ciudad, restaurante o tipo de comida"
                            className="pl-10 h-12 bg-white"
                            value={restaurantCity}
                            onChange={(e) => setRestaurantCity(e.target.value)}
                            list="restaurant-cities"
                          />
                          <datalist id="restaurant-cities">
                            <option value="Ciudad de M�xico, CDMX" />
                            <option value="Canc�n, Quintana Roo" />
                            <option value="Guadalajara, Jalisco" />
                            <option value="Monterrey, Nuevo Le�n" />
                            <option value="M�rida, Yucat�n" />
                            <option value="Puebla, Puebla" />
                            <option value="Quer�taro, Quer�taro" />
                            <option value="Playa del Carmen, Quintana Roo" />
                            <option value="Los Cabos, Baja California Sur" />
                            <option value="Puerto Vallarta, Jalisco" />
                            <option value="Oaxaca, Oaxaca" />
                            <option value="San Miguel de Allende, Guanajuato" />
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha</label>
                        <Input
                          type="date"
                          className="h-12 bg-white"
                          value={restaurantDate}
                          onChange={(e) => setRestaurantDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">Comensales</label>
                        <div className="bg-white rounded-lg">
                          <CounterSelector
                            value={restaurantDiners}
                            onChange={setRestaurantDiners}
                            min={1}
                            max={20}
                            showQuickButtons={true}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                        onClick={handleSearchRestaurants}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Buscar mesas
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* E-Sim */}
                <TabsContent value="esim">
                  <div className="text-center py-8">
                    <Smartphone className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">E-Sim para Viajeros</h3>
                    <p className="text-gray-600 mb-4">Mantente conectado en cualquier parte del mundo</p>
                    <p className="text-sm text-gray-500">Pr�ximamente...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* AS Club y Alertas - Dos recuadros lado a lado (mitad del tama�o de filtros) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
              {/* AS Club */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-2xl border border-gray-200/50"
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      {isAuthenticated ? (
                        <>
                          <h3 className="font-bold text-gray-900 text-lg">
                            �Bienvenido, {user?.name.split(' ')[0]}!
                          </h3>
                          <p className="text-sm text-gray-700">
                            Disfruta beneficios exclusivos
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-900 text-lg">
                            �nete a AS Club
                          </h3>
                          <p className="text-sm text-gray-700">
                            Beneficios exclusivos
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <Link href="/login">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold mt-4">
                        Iniciar sesi�n
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Alertas de precio */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-2xl border border-gray-200/50 cursor-pointer"
                onClick={() => router.push('/notificaciones')}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Recibe alertas si bajan los precios
                    </h3>
                  </div>
                  <Button
                    variant="link"
                    className="text-blue-600 font-semibold p-0 h-auto justify-start hover:no-underline group"
                  >
                    Configurar alertas
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Ahorra con vuelo + hotel - Ancho completo - OCULTO POR SETTING */}
            {homeSettings.HOME_PACKAGES_CTA === 'true' && (
              <div className="mt-4 max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-2xl border border-gray-200/50 cursor-pointer"
                  onClick={() => router.push('/resultados?type=package')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Puedes ahorrar cuando juntas vuelo + hotel
                      </h3>
                    </div>
                    <Button
                      variant="link"
                      className="text-blue-600 font-semibold p-0 h-auto justify-start hover:no-underline group"
                    >
                      Ver paquetes
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Resto del contenido */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* NUEVA SECCI�N: Tours y Viajes Grupales - SIEMPRE VISIBLE */}
          <div className="mb-12">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold">Ofertas en Tours y Viajes Grupales</h2>
                  <p className="text-gray-600 mt-1">Descubre el mundo con nuestros paquetes todo incluido</p>
                </div>
                <Button
                  variant="link"
                  className="text-[#0066FF] font-semibold"
                  onClick={() => router.push('/tours')}
                >
                  Ver todos los tours
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

            </div>

            {/* Grid de tours - solo si hay tours */}
            {groupTours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {groupTours.slice(0, 4).map((tour: any, index) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    <Card
                      className="overflow-hidden group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300 rounded-3xl h-full"
                      onClick={() => router.push(`/tours/${tour.id}`)}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          src={tour.images?.main || 'https://images.unsplash.com/photo-1499856871958-5b9337606a3e?w=800'}
                          alt={tour.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Badges - Siempre mostrar OFERTA */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Tag className="w-3 h-3" /> OFERTA
                          </span>
                        </div>

                        {/* Info en imagen */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="text-xs opacity-80">{tour.region}</span>
                          <h3 className="font-bold text-lg line-clamp-1">{tour.name}</h3>
                          <div className="flex items-center gap-2 text-sm opacity-80">
                            <Calendar className="w-4 h-4" />
                            <span>{tour.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {tour.cities?.slice(0, 2).join(', ')}
                            {tour.cities?.length > 2 && ` +${tour.cities.length - 2}`}
                          </span>
                        </div>

                        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-xs text-gray-500">Desde</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-blue-600">
                                ${new Intl.NumberFormat('es-MX').format(tour.pricing?.totalPrice || 0)}
                              </span>
                              <span className="text-sm text-gray-500">USD</span>
                            </div>
                          </div>
                          {tour.flight?.included && (
                            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              <Plane className="w-3 h-3" />
                              <span>Vuelo incluido</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
            {/* CTA adicional - ELIMINADO (duplicado) */}

          {/* Ofertas Especiales y Descuentos - OCULTO POR SETTING */}
          {homeSettings.HOME_OFFERS_SECTION === 'true' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Ofertas especiales para ti</h2>
                <Button variant="link" className="text-[#0066FF] font-semibold">
                  Ver todas las ofertas
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {promotions.map((promo) => (
                  <motion.div
                    key={promo.id}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    <Card
                      className="overflow-hidden group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300 rounded-3xl"
                      onClick={() => router.push(`/oferta/${promo.id}`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          src={promo.image_url}
                          alt={promo.title}
                          className="w-full h-full object-cover"
                        />
                        {promo.discount_percentage && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <Percent className="w-4 h-4" />
                            {promo.discount_percentage}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {promo.badge_text && (
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-[#0066FF]" />
                            <span className="text-sm font-semibold text-[#0066FF]">{promo.badge_text}</span>
                          </div>
                        )}
                        <h3 className="font-semibold text-lg mb-1">{promo.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {promo.description}
                        </p>
                        {promo.valid_until && (
                          <p className="text-xs text-muted-foreground">
                            V�lido hasta {new Date(promo.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Descubre vuelos a destinos favoritos - OCULTO POR SETTING */}
          {homeSettings.HOME_FLIGHTS_SECTION === 'true' && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Descubre vuelos a destinos favoritos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flightDestinations.map((dest) => (
                  <Card
                    key={dest.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                    onClick={() => {
                      // Guardar par�metros de b�squeda y redirigir a resultados unificados
                      const searchData = {
                        success: true,
                        data: [],
                        searchParams: {
                          type: 'flight',
                          origin: 'MEX',
                          destination: dest.airport_code || dest.city.substring(0, 3).toUpperCase(),
                          destinationCity: dest.city,
                          departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          adults: 1,
                          children: 0
                        }
                      }
                      localStorage.setItem('searchResults', JSON.stringify(searchData))
                      router.push(`/vuelos/${encodeURIComponent(dest.city)}`)
                    }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={dest.image_url}
                        alt={dest.city}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold mb-1">{dest.city}</h3>
                      <p className="text-sm text-[#0066FF] font-semibold">
                        ${Number(dest.price_from).toLocaleString()} {dest.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">por persona, ida y vuelta</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Descubre tu nuevo hospedaje favorito - OCULTO POR SETTING */}
          {homeSettings.HOME_ACCOMMODATION_SECTION === 'true' && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Descubre tu nuevo hospedaje favorito</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accommodationFavorites.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                    onClick={() => router.push(`/hospedaje/${item.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{item.title || item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item.location}</p>
                      <p className="text-muted-foreground text-sm">
                        Desde ${Number(item.price_from || item.price_per_night || 0).toLocaleString()} {item.currency || 'MXN'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ofertas de �ltima hora para el fin de semana - OCULTO POR SETTING */}
          {homeSettings.HOME_WEEKEND_SECTION === 'true' && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Ofertas de �ltima hora para el fin de semana</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weekendDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                    onClick={() => router.push(`/hospedaje/${deal.id}`)}
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={deal.image_url}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {deal.discount_percentage && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{deal.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#0066FF] font-semibold mb-1">{deal.dates_label}</p>
                      <h3 className="font-semibold text-sm mb-1">{deal.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{deal.location}</p>
                      <p className="text-sm font-bold text-[#0066FF]">
                        ${Number(deal.price_per_night).toLocaleString()} {deal.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">por noche</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Descubre paquetes vacacionales - OCULTO POR SETTING */}
          {homeSettings.HOME_VACATION_PACKAGES === 'true' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Descubre paquetes vacacionales a los destinos m�s buscados</h2>
                <Button variant="link" className="text-[#0066FF] font-semibold" onClick={() => router.push('/paquetes')}>
                  Ver todos los paquetes
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vacationPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                    onClick={() => router.push(`/paquete/${pkg.id}`)}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={pkg.image_url}
                        alt={pkg.destination}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {pkg.nights && (
                        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full">
                          <p className="text-xs font-semibold">{pkg.nights} noches</p>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2">{pkg.destination}</h3>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        {pkg.includes || pkg.package_name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Desde</p>
                          <p className="text-xl font-bold text-[#0066FF]">
                            ${Number(pkg.price).toLocaleString()} {pkg.currency}
                          </p>
                        </div>
                        <Button size="sm" className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
                          Ver paquete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Echa un vistazo a estos hospedajes �nicos - OCULTO POR SETTING */}
          {homeSettings.HOME_UNIQUE_STAYS === 'true' && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Echa un vistazo a estos hospedajes �nicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueStays.map((unique) => (
                  <Card
                    key={unique.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-shadow rounded-3xl"
                    onClick={() => router.push(`/hospedaje/${unique.id}`)}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={unique.image_url}
                        alt={unique.property_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      {unique.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-500">?</span>
                          <span className="font-semibold text-sm">{Number(unique.rating).toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({unique.total_reviews || 0})
                          </span>
                        </div>
                      )}
                      <h3 className="font-semibold text-base mb-1">{unique.property_name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{unique.location}</p>
                      <p className="text-sm font-semibold text-[#0066FF]">
                        ${Number(unique.price_per_night).toLocaleString()} {unique.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">por noche</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Explora el mundo con AS Operadora - OCULTO POR SETTING */}
          {homeSettings.HOME_EXPLORE_WORLD === 'true' && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Explora el mundo con AS Operadora</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {exploreDestinations.map((dest) => (
                  <Card
                    key={dest.id}
                    className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                    onClick={() => router.push(`/resultados/activities?city=${encodeURIComponent(dest.destination || dest.destination_name || '')}&radius=20`)}
                  >
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={dest.image_url}
                        alt={dest.destination || dest.destination_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white">
                        <h3 className="font-bold text-sm">{dest.destination || dest.destination_name}</h3>
                        <p className="text-xs">{(dest.hotels_count || dest.total_hotels || 250).toLocaleString()} hoteles</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Círculos flotantes - Chat y WhatsApp */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Botón de WhatsApp */}
        <a
          href="https://wa.me/5215512345678"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group"
          title="Contactar por WhatsApp"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
        
        {/* Botón de Chat de Asistencia */}
        <button
          onClick={() => router.push('/ayuda')}
          className="w-14 h-14 bg-[#0066FF] hover:bg-[#0052CC] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group"
          title="Chat de asistencia"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* C�rculos flotantes - Chat y WhatsApp */}
      <footer className="bg-[#F7F7F7] mt-16 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/empresa/acerca-de" className="hover:text-foreground">Acerca de</Link></li>
                <li><Link href="/empresa/empleos" className="hover:text-foreground">Empleos</Link></li>
                <li><Link href="/empresa/prensa" className="hover:text-foreground">Prensa</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/ayuda" className="hover:text-foreground">Centro de ayuda</Link></li>
                <li><Link href="/contacto" className="hover:text-foreground">Cont�ctanos</Link></li>
                <li><Link href="/legal/privacidad" className="hover:text-foreground">Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">T�rminos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/terminos" className="hover:text-foreground">T�rminos de uso</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-foreground">Pol�tica de cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">S�guenos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-sm text-muted-foreground text-center">
            <p>� 2024 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
            <p className="text-xs mt-1">AS Viajando</p>
            <p className="text-xs mt-2 opacity-50">
              v2.296 | Build: 04 Feb 2026, 19:50 CST
            </p>
            {/* Informaci�n de BD - OCULTA TEMPORALMENTE */}
            {/* {dbInfo && (
              <div className="text-xs mt-3 opacity-70 bg-slate-100 p-3 rounded inline-block">
                <p className="font-mono">
                  ??? BD: <span className="font-bold">{dbInfo.database}</span> |
                  ?? Endpoint: <span className="font-bold">{dbInfo.endpoint}</span>
                </p>
                <p className="font-mono mt-1">
                  ?? Usuarios: <span className="font-bold">{dbInfo.totalUsers}</span> |
                  ?? Versi�n: <span className="font-bold">v2.296</span>
                </p>
              </div>
            )} */}
          </div>
        </div>
      </footer >
    </div >
  )
}
