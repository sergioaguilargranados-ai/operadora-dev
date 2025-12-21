"use client"

// Build: 21 Dec 2025 - v2.150 - OAuth Social + UI Reorganization - PRODUCTION
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Plane, Package, Compass, ChevronRight, Percent, Tag, Loader2, Bell, HelpCircle, Hotel, Car, Activity, Home as HomeIcon, FileText, Calendar, MessageCircle } from "lucide-react"
import { DateRangePicker } from "@/components/DateRangePicker"
import { GuestSelector } from "@/components/GuestSelector"
import { AirlineSelector } from "@/components/AirlineSelector"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { User as UserIcon, LogOut } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"

export default function Home() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { search, loading } = useSearch()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Estados para búsqueda de hoteles
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)

  // Estados para búsqueda de vuelos
  const [origin, setOrigin] = useState("")
  const [flightDestination, setFlightDestination] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [airlineMode, setAirlineMode] = useState<'include' | 'exclude'>('include')

  // Estados para búsqueda de transfers
  const [transferOrigin, setTransferOrigin] = useState("")
  const [transferDestination, setTransferDestination] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [transferTime, setTransferTime] = useState("10:00")
  const [transferPassengers, setTransferPassengers] = useState(2)

  // Estados para búsqueda de actividades
  const [activityCity, setActivityCity] = useState("")
  const [activityRadius, setActivityRadius] = useState(20)

  // Estados para contenido dinámico
  const [promotions, setPromotions] = useState<any[]>([])
  const [featuredHero, setFeaturedHero] = useState<any>(null)
  const [flightDestinations, setFlightDestinations] = useState<any[]>([])
  const [accommodationFavorites, setAccommodationFavorites] = useState<any[]>([])
  const [weekendDeals, setWeekendDeals] = useState<any[]>([])
  const [vacationPackages, setVacationPackages] = useState<any[]>([])
  const [uniqueStays, setUniqueStays] = useState<any[]>([])
  const [exploreDestinations, setExploreDestinations] = useState<any[]>([])

  // Estado para info de BD
  const [dbInfo, setDbInfo] = useState<any>(null)

  // Cargar datos dinámicos
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

    const searchParams: any = {
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

    // Agregar filtros de aerolíneas si hay selección
    if (selectedAirlines.length > 0) {
      if (airlineMode === 'include') {
        searchParams.includedAirlineCodes = selectedAirlines.join(',')
      } else {
        searchParams.excludedAirlineCodes = selectedAirlines.join(',')
      }
    }

    const response = await search(searchParams)

    if (response && response.success) {
      localStorage.setItem('searchResults', JSON.stringify(response))
      router.push(`/resultados?type=flight`)
    }
  }

  const handleSearchTransfers = async () => {
    if (!transferOrigin || !transferDestination || !transferDate) {
      alert('Por favor completa todos los campos')
      return
    }

    const params = new URLSearchParams({
      from: transferOrigin,
      to: transferDestination,
      date: transferDate,
      time: transferTime,
      passengers: transferPassengers.toString()
    })

    router.push(`/resultados/transfers?${params.toString()}`)
  }

  const handleSearchActivities = async () => {
    if (!activityCity) {
      alert('Por favor ingresa una ciudad')
      return
    }

    const params = new URLSearchParams({
      city: activityCity,
      radius: activityRadius.toString()
    })

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
            <button
              onClick={() => router.push('/app-info')}
              className="hover:text-primary hidden md:flex items-center gap-2"
            >
              <span>Obtén la app</span>
            </button>
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
                    <span className="text-xs text-muted-foreground">MXN</span>
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
                          Centro de Comunicación
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
                              Gestión de Contenido
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
                              Facturación y Pagos
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
                          </>
                        )}
                      </div>
                      <div className="border-t pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="hover:text-primary font-medium">Iniciar sesión</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image and Filters */}
      <main className="relative">
        {/* Background Image Section */}
        <div
          className="relative min-h-[600px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: featuredHero
              ? `url(${featuredHero.image_url})`
              : 'url(https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&h=900&fit=crop)'
          }}
        >
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
              <Tabs defaultValue="stays" className="w-full">
                <TabsList className="mb-6 bg-white/50 backdrop-blur-md border-b rounded-lg h-auto p-0 w-full justify-center">
                  <TabsTrigger
                    value="stays"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Hotel className="w-6 h-6" />
                    <span className="hidden md:inline">Estadías</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="flights"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Plane className="w-6 h-6" />
                    <span className="hidden md:inline">Vuelos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cars"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Car className="w-6 h-6" />
                    <span className="hidden md:inline">Autos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="packages"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Package className="w-6 h-6" />
                    <span className="hidden md:inline">Paquetes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="things"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Activity className="w-6 h-6" />
                    <span className="hidden md:inline">Actividades</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cruises"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <Compass className="w-6 h-6" />
                    <span className="hidden md:inline">Cruceros</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ashome"
                    className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/80 px-4 md:px-6 py-3 flex items-center gap-2 text-base"
                  >
                    <HomeIcon className="w-6 h-6" />
                    <span className="hidden md:inline">ASHome</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stays" className="mt-6">
                  <div className="space-y-4">
                    {/* Buscador en una sola fila */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Destino */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">¿A dónde?</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Introduce tu destino"
                            className="pl-10 h-12 bg-white"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fechas</label>
                        <DateRangePicker />
                      </div>

                      {/* Viajeros */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Viajeros</label>
                        <GuestSelector />
                      </div>

                      {/* Botón Buscar */}
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
                        <input type="checkbox" className="w-4 h-4 accent-primary" />
                        <span className="text-sm font-medium">Agregar un auto</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="flights" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Origen */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Origen</label>
                        <div className="relative">
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="MEX - Ciudad de México"
                            className="pl-10 h-12 bg-white"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>

                      {/* Destino */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Destino</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="CUN - Cancún"
                            className="pl-10 h-12 bg-white"
                            value={flightDestination}
                            onChange={(e) => setFlightDestination(e.target.value.toUpperCase())}
                          />
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
                          <Input
                            type="date"
                            className="h-12 bg-white"
                            placeholder="Retorno"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Botón Buscar */}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <label className="font-medium">Adultos:</label>
                        <input
                          type="number"
                          min="1"
                          max="9"
                          value={adults}
                          onChange={(e) => setAdults(parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded bg-white"
                        />
                        <label className="ml-4 font-medium">Niños:</label>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={children}
                          onChange={(e) => setChildren(parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Aerolíneas preferidas (opcional)</label>
                        <AirlineSelector
                          value={selectedAirlines}
                          onChange={setSelectedAirlines}
                          mode={airlineMode}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cars" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Origen */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Desde</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Aeropuerto/Dirección"
                            value={transferOrigin}
                            onChange={(e) => setTransferOrigin(e.target.value)}
                            className="pl-10 h-12 bg-white"
                          />
                        </div>
                      </div>

                      {/* Destino */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Hasta</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Hotel/Dirección"
                            value={transferDestination}
                            onChange={(e) => setTransferDestination(e.target.value)}
                            className="pl-10 h-12 bg-white"
                          />
                        </div>
                      </div>

                      {/* Fecha y Hora */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha y Hora</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            className="h-12 bg-white"
                          />
                          <Input
                            type="time"
                            value={transferTime}
                            onChange={(e) => setTransferTime(e.target.value)}
                            className="h-12 bg-white"
                          />
                        </div>
                      </div>

                      {/* Botón Buscar */}
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
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={transferPassengers}
                        onChange={(e) => setTransferPassengers(parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border rounded bg-white"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="packages">
                  <div className="text-center py-8">
                    <p className="text-gray-700">Búsqueda de paquetes próximamente...</p>
                  </div>
                </TabsContent>

                <TabsContent value="things" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Ciudad */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-900">¿Dónde?</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            placeholder="Ciudad o destino"
                            value={activityCity}
                            onChange={(e) => setActivityCity(e.target.value)}
                            className="pl-10 h-12 bg-white"
                          />
                        </div>
                      </div>

                      {/* Radio de búsqueda */}
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-900">Radio (km)</label>
                        <select
                          value={activityRadius}
                          onChange={(e) => setActivityRadius(parseInt(e.target.value))}
                          className="w-full h-12 px-3 border rounded bg-white"
                        >
                          <option value="5">5 km</option>
                          <option value="10">10 km</option>
                          <option value="20">20 km</option>
                          <option value="50">50 km</option>
                        </select>
                      </div>

                      {/* Botón Buscar */}
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
                  </div>
                </TabsContent>

                <TabsContent value="cruises">
                  <div className="text-center py-8">
                    <Compass className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">Cruceros</h3>
                    <p className="text-gray-700">Próximamente...</p>
                  </div>
                </TabsContent>

                <TabsContent value="ashome">
                  <div className="text-center py-8">
                    <HomeIcon className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">ASHome</h3>
                    <p className="text-gray-700">Próximamente...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* AS Club y Alertas - Dos recuadros lado a lado (mitad del tamaño de filtros) */}
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
                            ¡Bienvenido, {user?.name.split(' ')[0]}!
                          </h3>
                          <p className="text-sm text-gray-700">
                            Disfruta beneficios exclusivos
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-900 text-lg">
                            Únete a AS Club
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
                        Iniciar sesión
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

            {/* Ahorra con vuelo + hotel - Ancho completo */}
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
          </div>
        </div>

      {/* Resto del contenido */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Ofertas Especiales y Descuentos */}
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
                        Válido hasta {new Date(promo.valid_until).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>



        {/* Descubre vuelos a destinos favoritos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Descubre vuelos a destinos favoritos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flightDestinations.map((dest) => (
              <Card
                key={dest.id}
                className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                onClick={() => router.push(`/vuelos/${dest.city.toLowerCase().replace(/\s+/g, '-')}`)}
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

        {/* Descubre tu nuevo hospedaje favorito */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Descubre tu nuevo hospedaje favorito</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accommodationFavorites.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-shadow rounded-3xl"
                onClick={() => router.push(`/hospedaje/${item.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.location}</p>
                  <p className="text-muted-foreground text-sm">
                    Desde ${Number(item.price_from).toLocaleString()} {item.currency}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Ofertas de última hora para el fin de semana */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Ofertas de última hora para el fin de semana</h2>
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

        {/* Descubre paquetes vacacionales */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Descubre paquetes vacacionales a los destinos más buscados</h2>
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

        {/* Echa un vistazo a estos hospedajes únicos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Echa un vistazo a estos hospedajes únicos</h2>
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
                      <span className="text-yellow-500">★</span>
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

        {/* Explora el mundo con AS Operadora */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Explora el mundo con AS Operadora</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {exploreDestinations.map((dest) => (
              <Card
                key={dest.id}
                className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl"
                onClick={() => router.push(`/destino/${dest.city_code || dest.destination}`)}
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={dest.image_url}
                    alt={dest.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <h3 className="font-bold text-sm">{dest.destination}</h3>
                    <p className="text-xs">{dest.hotels_count.toLocaleString()} hoteles</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      </main>

      {/* Footer */}
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
                <li><Link href="/contacto" className="hover:text-foreground">Contáctanos</Link></li>
                <li><Link href="/legal/privacidad" className="hover:text-foreground">Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Términos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/terminos" className="hover:text-foreground">Términos de uso</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-foreground">Política de cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-sm text-muted-foreground text-center">
            <p>© 2024 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
            <p className="text-xs mt-1">Experiencias que inspiran</p>
            <p className="text-xs mt-2 opacity-50">
              v2.150 | Build: 21 Dec 2025, 07:00 CST | Live: app.asoperadora.com ✅ | OAuth Social + UI Reorganized
            </p>
            {dbInfo && (
              <div className="text-xs mt-3 opacity-70 bg-slate-100 p-3 rounded inline-block">
                <p className="font-mono">
                  🗄️ BD: <span className="font-bold">{dbInfo.database}</span> |
                  📍 Endpoint: <span className="font-bold">{dbInfo.endpoint}</span>
                </p>
                <p className="font-mono mt-1">
                  👥 Usuarios: <span className="font-bold">{dbInfo.totalUsers}</span> |
                  🕒 Último: {dbInfo.lastUser?.email || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
