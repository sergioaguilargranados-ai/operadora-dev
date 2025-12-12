"use client"

// Build: Dec 12 2025 - v2.0 - localStorage for search results - PRODUCTION
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Plane, Package, Compass, ChevronRight, Percent, Tag, Loader2 } from "lucide-react"
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
      // Guardar resultados en localStorage en lugar de URL
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchResults', JSON.stringify(response))
      }
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
      // Guardar resultados en localStorage en lugar de URL
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchResults', JSON.stringify(response))
      }
      router.push(`/resultados?type=flight`)
    }
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
            <button className="hidden md:block text-sm font-medium hover:text-primary">
              Explorar viajes
            </button>
          </div>
          <div className="flex items-center gap-3 md:gap-6 text-sm">
            <button className="hover:text-primary hidden md:flex items-center gap-2">
              <span>Obtén la app</span>
            </button>
            <button className="hover:text-primary">Viajes</button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user?.name.split(' ')[0]}</span>
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
                      </div>
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
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
                          onClick={() => router.push('/dashboard')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Compass className="w-4 h-4" />
                          Dashboard Financiero
                        </button>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section con animación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-hard p-8 mb-8 border border-white/20"
        >
          <Tabs defaultValue="stays" className="w-full">
            <TabsList className="mb-6 bg-transparent border-b rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger
                value="stays"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Estadías
              </TabsTrigger>
              <TabsTrigger
                value="flights"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Vuelos
              </TabsTrigger>
              <TabsTrigger
                value="cars"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Autos
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Paquetes
              </TabsTrigger>
              <TabsTrigger
                value="things"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Cosas que hacer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stays" className="mt-6">
              <div className="space-y-4">
                {/* Buscador en una sola fila - todo junto */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Destino */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">¿A dónde?</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input
                        placeholder="Introduce tu destino"
                        className="pl-10 h-12"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Fechas</label>
                    <DateRangePicker />
                  </div>

                  {/* Viajeros */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Viajeros</label>
                    <GuestSelector />
                  </div>

                  {/* Botón Buscar con gradiente */}
                  <div className="md:col-span-1 flex items-end">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-medium hover:shadow-hard transition-all duration-200"
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

                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Agregar un vuelo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Agregar un auto</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flights" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Origen */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Origen</label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input
                        placeholder="MEX - Ciudad de México"
                        className="pl-10 h-12"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Destino</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input
                        placeholder="CUN - Cancún"
                        className="pl-10 h-12"
                        value={flightDestination}
                        onChange={(e) => setFlightDestination(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Fechas</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        className="h-12"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                      <Input
                        type="date"
                        className="h-12"
                        placeholder="Retorno"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Botón Buscar con gradiente */}
                  <div className="md:col-span-1 flex items-end">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-medium hover:shadow-hard transition-all duration-200"
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
                  <div className="flex items-center gap-2 text-sm">
                    <label>Adultos:</label>
                    <input
                      type="number"
                      min="1"
                      max="9"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded"
                    />
                    <label className="ml-4">Niños:</label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Aerolíneas preferidas (opcional)</label>
                    <AirlineSelector
                      value={selectedAirlines}
                      onChange={setSelectedAirlines}
                      mode={airlineMode}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cars">
              <p className="text-muted-foreground">Búsqueda de autos próximamente...</p>
            </TabsContent>

            <TabsContent value="packages">
              <p className="text-muted-foreground">Búsqueda de paquetes próximamente...</p>
            </TabsContent>

            <TabsContent value="things">
              <p className="text-muted-foreground">Búsqueda de actividades próximamente...</p>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Member Benefits con gradiente moderno */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-slate-800 via-slate-900 to-blue-900 text-white p-8 mb-8 shadow-hard border-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                {isAuthenticated ? (
                  <>
                    <h3 className="font-semibold text-lg mb-1">
                      ¡Bienvenido a AS Club, {user?.name.split(' ')[0]}!
                    </h3>
                    <p className="text-sm text-white/80">
                      Disfruta de descuentos exclusivos y acumula puntos en cada reserva
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-1">
                      Únete a AS Club y obtén beneficios exclusivos
                    </h3>
                    <p className="text-sm text-white/80">
                      Descuentos especiales, acumulación de puntos y más
                    </p>
                  </>
                )}
              </div>
            </div>
            {!isAuthenticated && (
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white text-blue-900 hover:bg-blue-50 whitespace-nowrap shadow-medium font-semibold">
                    Iniciar sesión
                  </Button>
                </motion.div>
              </Link>
            )}
            </div>
          </Card>
        </motion.div>

        {/* Promo Cards con animación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-400 border-none shadow-medium hover:shadow-hard transition-shadow duration-300">
              <div className="p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1F29] mb-3">
                  Recibe alertas si bajan los precios de los vuelos
                </h3>
              </div>
              <Button
                variant="link"
                className="text-[#1A1F29] font-semibold p-0 h-auto justify-start hover:no-underline group"
              >
                Comprar vuelos
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-400 border-none shadow-medium hover:shadow-hard transition-shadow duration-300">
              <div className="p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1F29] mb-3">
                  Puedes ahorrar cuando juntas vuelo + hotel
                </h3>
              </div>
              <Button
                variant="link"
                className="text-[#1A1F29] font-semibold p-0 h-auto justify-start hover:no-underline group"
              >
                Reservar ahora
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
          </motion.div>
        </div>

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
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
                    alt="Oferta hotel"
                    className="w-full h-full object-cover"
                  />
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  25% OFF
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#0066FF]" />
                  <span className="text-sm font-semibold text-[#0066FF]">OFERTA FLASH</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Escapada de fin de semana</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Ahorra hasta 25% en hoteles seleccionados
                </p>
                <p className="text-xs text-muted-foreground">Válido hasta el 15 de Nov</p>
              </div>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
                  alt="Oferta playa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  30% OFF
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#0066FF]" />
                  <span className="text-sm font-semibold text-[#0066FF]">SÚPER OFERTA</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Playas del Caribe</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Descuento especial en resorts todo incluido
                </p>
                <p className="text-xs text-muted-foreground">Válido hasta el 30 de Nov</p>
              </div>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
                  alt="Oferta vuelo + hotel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  40% OFF
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#0066FF]" />
                  <span className="text-sm font-semibold text-[#0066FF]">PAQUETE</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Vuelo + Hotel</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Ahorra combinando tu vuelo y hotel
                </p>
                <p className="text-xs text-muted-foreground">Oferta por tiempo limitado</p>
              </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Featured Destination */}
        <div className="mb-12">
          <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop"
              alt="Destino destacado"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-6 h-6" />
                <span className="text-sm font-medium">DESTINO DESTACADO</span>
              </div>
              <h2 className="text-4xl font-bold mb-3">Descubre playas paradisíacas</h2>
              <p className="text-lg mb-4 max-w-xl">
                Desde carreras de caballos hasta rutas de bourbon, te espera un mundo de aventuras.
              </p>
            </div>
          </div>
        </div>

        {/* Descubre vuelos a destinos favoritos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Descubre vuelos a destinos favoritos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { city: "Cancún", price: "$2,450 MXN", image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600" },
              { city: "Ciudad de México", price: "$1,200 MXN", image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600" },
              { city: "Los Cabos", price: "$2,800 MXN", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600" },
              { city: "Guadalajara", price: "$1,450 MXN", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop" }
            ].map((dest, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold mb-1">{dest.city}</h3>
                  <p className="text-sm text-[#0066FF] font-semibold">{dest.price}</p>
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
            {[
              {
                image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
                title: "Resort Todo Incluido",
                price: "Desde $2,500 MXN",
                location: "Riviera Maya"
              },
              {
                image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop",
                title: "Villa Frente al Mar",
                price: "Desde $3,200 MXN",
                location: "Playa del Carmen"
              },
              {
                image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
                title: "Hotel Familiar",
                price: "Desde $1,800 MXN",
                location: "Cancún"
              }
            ].map((item, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.location}</p>
                  <p className="text-muted-foreground text-sm">{item.price}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Ofertas de última hora para el fin de semana */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Ofertas de última hora para el fin de semana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
                title: "Hotel Centro Histórico",
                location: "Ciudad de México",
                price: "$1,100 MXN",
                discount: "30%",
                dates: "Este fin de semana"
              },
              {
                image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
                title: "Cabaña en Montaña",
                location: "Valle de Bravo",
                price: "$1,650 MXN",
                discount: "25%",
                dates: "Vie - Dom"
              },
              {
                image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
                title: "Hotel Boutique",
                location: "San Miguel de Allende",
                price: "$1,450 MXN",
                discount: "35%",
                dates: "Este fin de semana"
              },
              {
                image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
                title: "Resort Playa",
                location: "Puerto Vallarta",
                price: "$2,200 MXN",
                discount: "40%",
                dates: "Vie - Dom"
              }
            ].map((deal, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{deal.discount}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#0066FF] font-semibold mb-1">{deal.dates}</p>
                  <h3 className="font-semibold text-sm mb-1">{deal.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{deal.location}</p>
                  <p className="text-sm font-bold text-[#0066FF]">{deal.price}</p>
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
            <Button variant="link" className="text-[#0066FF] font-semibold">
              Ver todos los paquetes
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
                destination: "Playa del Carmen",
                package: "Vuelo + Hotel + Traslados",
                nights: "5 noches",
                price: "$12,500 MXN",
                description: "Todo incluido en resort 5 estrellas"
              },
              {
                image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=500&fit=crop",
                destination: "Europa - París",
                package: "Vuelo + Hotel + Tours",
                nights: "7 noches",
                price: "$28,900 MXN",
                description: "Incluye tours a principales atracciones"
              },
              {
                image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=500&fit=crop",
                destination: "Los Cabos",
                package: "Vuelo + Resort + Actividades",
                nights: "4 noches",
                price: "$15,800 MXN",
                description: "Resort frente al mar con spa"
              }
            ].map((pkg, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full">
                    <p className="text-xs font-semibold">{pkg.nights}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2">{pkg.destination}</h3>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">{pkg.package}</p>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Desde</p>
                      <p className="text-xl font-bold text-[#0066FF]">{pkg.price}</p>
                    </div>
                    <Button size="sm" className="bg-[#0066FF] hover:bg-[#0052CC]">
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
            {[
              {
                image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop",
                title: "Casa en el árbol",
                location: "Chiapas, México",
                rating: 4.9,
                reviews: 234,
                price: "$2,100 MXN"
              },
              {
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
                title: "Hotel Boutique Colonial",
                location: "Oaxaca, México",
                rating: 4.8,
                reviews: 189,
                price: "$1,950 MXN"
              },
              {
                image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
                title: "Villa con Piscina Privada",
                location: "Tulum, México",
                rating: 5.0,
                reviews: 156,
                price: "$4,500 MXN"
              },
              {
                image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
                title: "Hacienda Histórica",
                location: "Yucatán, México",
                rating: 4.7,
                reviews: 312,
                price: "$3,200 MXN"
              },
              {
                image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
                title: "Bungalow Frente al Mar",
                location: "Oaxaca, México",
                rating: 4.9,
                reviews: 267,
                price: "$2,850 MXN"
              },
              {
                image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
                title: "Eco-Lodge en la Selva",
                location: "Quintana Roo, México",
                rating: 4.8,
                reviews: 198,
                price: "$2,400 MXN"
              }
            ].map((unique, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={unique.image}
                    alt={unique.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-sm">{unique.rating}</span>
                    <span className="text-xs text-muted-foreground">({unique.reviews})</span>
                  </div>
                  <h3 className="font-semibold text-base mb-1">{unique.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{unique.location}</p>
                  <p className="text-sm font-semibold text-[#0066FF]">{unique.price}</p>
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
            {[
              { destination: "Cancún", hotels: "1,234 hoteles", image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600" },
              { destination: "Playa del Carmen", hotels: "856 hoteles", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600" },
              { destination: "Tulum", hotels: "478 hoteles", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" },
              { destination: "Los Cabos", hotels: "623 hoteles", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600" },
              { destination: "Puerto Vallarta", hotels: "745 hoteles", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600" },
              { destination: "Guadalajara", hotels: "567 hoteles", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop" }
            ].map((dest, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all">
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <h3 className="font-bold text-sm">{dest.destination}</h3>
                    <p className="text-xs">{dest.hotels}</p>
                  </div>
                </div>
              </Card>
            ))}
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
                <li><a href="#" className="hover:text-foreground">Acerca de</a></li>
                <li><a href="#" className="hover:text-foreground">Empleos</a></li>
                <li><a href="#" className="hover:text-foreground">Prensa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-foreground">Contáctanos</a></li>
                <li><a href="#" className="hover:text-foreground">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Términos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Términos de uso</a></li>
                <li><a href="#" className="hover:text-foreground">Política de cookies</a></li>
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
              v2.0.2 | Build: Dec 10 2025, 19:00 UTC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
