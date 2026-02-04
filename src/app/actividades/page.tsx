"use client"

// Build: 03 Feb 2026 - v2.295 - Integración Civitatis (Modelo Afiliado)
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Globe, ExternalLink, Star, Users, Clock, HelpCircle, Bell } from "lucide-react"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"

// Destinos principales de Civitatis
const FEATURED_DESTINATIONS = [
    {
        name: "Roma",
        country: "Italia",
        slug: "roma",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
        description: "Coliseo, Vaticano y más",
        activities: "150+"
    },
    {
        name: "París",
        country: "Francia",
        slug: "paris",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
        description: "Torre Eiffel, Louvre, Versalles",
        activities: "200+"
    },
    {
        name: "Madrid",
        country: "España",
        slug: "madrid",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
        description: "Prado, Palacio Real, Toledo",
        activities: "120+"
    },
    {
        name: "Barcelona",
        country: "España",
        slug: "barcelona",
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
        description: "Sagrada Familia, Park Güell",
        activities: "180+"
    },
    {
        name: "Nueva York",
        country: "Estados Unidos",
        slug: "nueva-york",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
        description: "Estatua de la Libertad, Broadway",
        activities: "250+"
    },
    {
        name: "Londres",
        country: "Reino Unido",
        slug: "londres",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
        description: "Big Ben, Tower Bridge, Museos",
        activities: "220+"
    },
    {
        name: "Cancún",
        country: "México",
        slug: "cancun",
        image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop",
        description: "Playas, Chichén Itzá, Cenotes",
        activities: "90+"
    },
    {
        name: "Ciudad de México",
        country: "México",
        slug: "ciudad-de-mexico",
        image: "https://images.unsplash.com/photo-1518659526054-e5c7b8daed1d?w=800&h=600&fit=crop",
        description: "Teotihuacán, Xochimilco",
        activities: "100+"
    }
]

export default function ActividadesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [civitatis AgencyId, setCivitatisAgencyId] = useState("67114")
    const [showUserMenu, setShowUserMenu] = useState(false)

    // Cargar configuración de Civitatis
    useEffect(() => {
        const fetchCivitatisConfig = async () => {
            try {
                const res = await fetch('/api/settings?keys=CIVITATIS_AGENCY_ID')
                const data = await res.json()
                if (data.success && data.settings?.CIVITATIS_AGENCY_ID) {
                    setCivitatisAgencyId(data.settings.CIVITATIS_AGENCY_ID)
                }
            } catch (error) {
                console.error('Error loading Civitatis config:', error)
            }
        }
        fetchCivitatisConfig()
    }, [])

    // Generar URL de Civitatis con ID de agencia
    const getCivitatisUrl = (destination?: string) => {
        const baseUrl = "https://www.civitatis.com/es"
        const agencyParam = `?ag_aid=${civitatisAgencyId}`

        if (destination) {
            return `${baseUrl}/${destination}/${agencyParam}`
        }
        return `${baseUrl}/${agencyParam}`
    }

    // Handler para búsqueda
    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Buscar en Civitatis con el término de búsqueda
            const searchUrl = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(searchQuery)}&ag_aid=${civitatisAgencyId}`
            window.open(searchUrl, '_blank')
        }
    }

    // Handler para abrir destino
    const handleOpenDestination = (slug: string) => {
        const url = getCivitatisUrl(slug)
        window.open(url, '_blank')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header traslúcido (estilo AS Operadora) */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Logo className="py-2" />
                    </div>
                    <div className="flex items-center gap-3 md:gap-6 text-sm">
                        <button
                            onClick={() => router.push('/')}
                            className="hover:text-primary font-medium"
                        >
                            Inicio
                        </button>
                        <button
                            onClick={() => router.push('/tours')}
                            className="hover:text-primary font-medium"
                        >
                            Tours Grupales
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
                        </button>
                        {isAuthenticated ? (
                            <button
                                onClick={() => router.push('/perfil')}
                                className="flex items-center gap-2 hover:text-primary"
                            >
                                <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                            </button>
                        ) : (
                            <Link href="/login">
                                <button className="hover:text-primary font-medium">Iniciar sesión</button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section con video/imagen de fondo */}
            <div className="relative min-h-[500px]">
                {/* Imagen de fondo */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop)'
                    }}
                />
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

                {/* Contenido del Hero */}
                <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[500px] text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Globe className="w-12 h-12 text-white" />
                            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                                Tours y Actividades
                            </h1>
                        </div>
                        <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
                            Descubre experiencias únicas en los mejores destinos del mundo
                        </p>
                        <p className="text-lg text-white/80 mb-12 drop-shadow-md">
                            Visitas guiadas en español • Cancelación gratuita • Mejor precio garantizado
                        </p>

                        {/* Buscador de destinos */}
                        <div className="max-w-2xl mx-auto">
                            <Card className="p-6 backdrop-blur-xl bg-white/95 shadow-2xl">
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar destino, ciudad o actividad..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10 h-12 text-lg"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSearch}
                                        size="lg"
                                        className="px-8 h-12 bg-[#0066FF] hover:bg-[#0052CC]"
                                    >
                                        <Search className="w-5 h-5 mr-2" />
                                        Buscar
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Sección de destinos principales */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Destinos Principales</h2>
                    <p className="text-xl text-gray-600">
                        Explora las mejores actividades y tours en estos destinos populares
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURED_DESTINATIONS.map((destination, index) => (
                        <motion.div
                            key={destination.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card
                                className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                onClick={() => handleOpenDestination(destination.slug)}
                            >
                                {/* Imagen del destino */}
                                <div className="relative h-48 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${destination.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Badge de actividades */}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {destination.activities} actividades
                                        </span>
                                    </div>

                                    {/* Nombre del destino */}
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                                            {destination.name}
                                        </h3>
                                        <p className="text-sm text-white/90 drop-shadow-md">
                                            {destination.country}
                                        </p>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="p-4">
                                    <p className="text-gray-600 mb-4">{destination.description}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>4.8</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>Miles de reseñas</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-5 h-5 text-[#0066FF] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sección de explorar todos los destinos */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">¿No encuentras tu destino?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Explora actividades y tours en más de 3,000 destinos alrededor del mundo
                    </p>
                    <Button
                        size="lg"
                        onClick={() => window.open(getCivitatisUrl(), '_blank')}
                        className="px-12 py-6 text-lg bg-[#0066FF] hover:bg-[#0052CC]"
                    >
                        <Globe className="w-6 h-6 mr-3" />
                        Ver todos los destinos
                        <ExternalLink className="w-5 h-5 ml-3" />
                    </Button>
                </div>
            </section>

            {/* Sección de beneficios */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Mejor Precio Garantizado</h3>
                        <p className="text-gray-600">
                            Encontramos el mejor precio para ti. Si encuentras uno mejor, te devolvemos la diferencia.
                        </p>
                    </Card>

                    <Card className="p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Cancelación Gratuita</h3>
                        <p className="text-gray-600">
                            Cancela hasta 24 horas antes de la actividad y recibe un reembolso completo.
                        </p>
                    </Card>

                    <Card className="p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Guías en Español</h3>
                        <p className="text-gray-600">
                            Todas nuestras actividades incluyen guías profesionales que hablan español.
                        </p>
                    </Card>
                </div>
            </section>

            {/* Footer con versión */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm opacity-75">
                        © 2026 AS Operadora. Todos los derechos reservados.
                    </p>
                    <p className="text-xs mt-2 opacity-50">
                        v2.295 | Build: 03 Feb 2026, 23:40 CST | Powered by Civitatis
                    </p>
                </div>
            </footer>
        </div>
    )
}
