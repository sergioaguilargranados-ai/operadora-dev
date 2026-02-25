"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { ContentModal } from "@/components/admin/ContentModal"
import { VideoUrlEditor } from "@/components/admin/VideoUrlEditor"
import {
  Plus, Edit, Trash2, DollarSign, Calendar, Plane, Hotel, Package,
  Home, Globe, CheckCircle2, AlertCircle, X, RefreshCw,
  Image as ImageIcon, Search, Eye, Save, ExternalLink, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react"

export default function AdminContentPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [heroData, setHeroData] = useState<any>(null)
  const [promotions, setPromotions] = useState<any[]>([])
  const [flightDestinations, setFlightDestinations] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editingType, setEditingType] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("hero")
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Tour Images state
  const [tourImagesList, setTourImagesList] = useState<any[]>([])
  const [tourImagesLoading, setTourImagesLoading] = useState(false)
  const [tourImagesCount, setTourImagesCount] = useState(0)
  const [tourImgSearch, setTourImgSearch] = useState('')
  const [tourImgInputs, setTourImgInputs] = useState<Record<string, string>>({})
  const [tourImgSaving, setTourImgSaving] = useState<Record<string, boolean>>({})
  const [tourImgExpanded, setTourImgExpanded] = useState<string | null>(null)
  const [tourImgPreview, setTourImgPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      router.push('/')
      return
    }
    loadAllContent()
  }, [isAuthenticated, user])

  const loadAllContent = async () => {
    try {
      const [heroRes, promosRes, flightsRes, packagesRes] = await Promise.all([
        fetch('/api/homepage/hero'),
        fetch('/api/promotions'),
        fetch('/api/homepage/flight-destinations'),
        fetch('/api/featured-packages')
      ])

      const [heroData, promosData, flightsData, packagesData] = await Promise.all([
        heroRes.json(),
        promosRes.json(),
        flightsRes.json(),
        packagesRes.json()
      ])

      if (heroData.success) setHeroData(heroData.data)
      if (promosData.success) setPromotions(promosData.data)
      if (flightsData.success) setFlightDestinations(flightsData.data)
      if (packagesData.success) setPackages(packagesData.data)
    } catch (error) {
      console.error('Error loading content:', error)
      showToast('Error al cargar contenido', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadTourImages = async () => {
    try {
      setTourImagesLoading(true)
      const res = await fetch('/api/admin/tour-image?missing=true')
      const data = await res.json()
      if (data.success) {
        setTourImagesList(data.tours)
        setTourImagesCount(data.count)
      }
    } catch (error) {
      console.error('Error loading tour images:', error)
      showToast('Error al cargar tours', 'error')
    } finally {
      setTourImagesLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // HERO HANDLERS
  const handleEditHero = () => {
    setEditingItem(heroData)
    setEditingType('hero')
    setIsModalOpen(true)
  }

  const handleSaveHero = async (data: any) => {
    try {
      const res = await fetch('/api/homepage/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        setHeroData(result.data)
        showToast('Banner actualizado exitosamente', 'success')
        setIsModalOpen(false)
      } else {
        showToast(result.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      showToast('Error de conexión', 'error')
    }
  }

  // PROMOTIONS HANDLERS
  const handleEditPromotion = (promo: any) => {
    setEditingItem(promo)
    setEditingType('promotion')
    setIsModalOpen(true)
  }

  const handleNewPromotion = () => {
    setEditingItem(null)
    setEditingType('promotion')
    setIsModalOpen(true)
  }

  const handleSavePromotion = async (data: any) => {
    try {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/promotions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast(data.id ? 'Promoción actualizada' : 'Promoción creada', 'success')
        setIsModalOpen(false)
      } else {
        showToast(result.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      showToast('Error de conexión', 'error')
    }
  }

  const handleDeletePromotion = async (id: number) => {
    if (!confirm('¿Eliminar esta promoción?')) return

    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast('Promoción eliminada', 'success')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  // FLIGHT DESTINATIONS HANDLERS
  const handleEditFlight = (flight: any) => {
    setEditingItem(flight)
    setEditingType('flight')
    setIsModalOpen(true)
  }

  const handleNewFlight = () => {
    setEditingItem(null)
    setEditingType('flight')
    setIsModalOpen(true)
  }

  const handleSaveFlight = async (data: any) => {
    try {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/homepage/flight-destinations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast(data.id ? 'Destino actualizado' : 'Destino creado', 'success')
        setIsModalOpen(false)
      } else {
        showToast(result.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      showToast('Error de conexión', 'error')
    }
  }

  const handleDeleteFlight = async (id: number) => {
    if (!confirm('¿Eliminar este destino?')) return

    try {
      const res = await fetch(`/api/homepage/flight-destinations?id=${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast('Destino eliminado', 'success')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  // PACKAGES HANDLERS
  const handleEditPackage = (pkg: any) => {
    setEditingItem(pkg)
    setEditingType('package')
    setIsModalOpen(true)
  }

  const handleNewPackage = () => {
    setEditingItem(null)
    setEditingType('package')
    setIsModalOpen(true)
  }

  const handleSavePackage = async (data: any) => {
    try {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/featured-packages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast(data.id ? 'Paquete actualizado' : 'Paquete creado', 'success')
        setIsModalOpen(false)
      } else {
        showToast(result.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      showToast('Error de conexión', 'error')
    }
  }

  const handleDeletePackage = async (id: number) => {
    if (!confirm('¿Eliminar este paquete?')) return

    try {
      const res = await fetch(`/api/featured-packages/${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        loadAllContent()
        showToast('Paquete eliminado', 'success')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  // MODAL CONFIGS
  const getModalConfig = () => {
    switch (editingType) {
      case 'hero':
        return {
          title: 'Editar Banner Principal',
          fields: [
            { name: 'title', label: 'Título', type: 'text' as const, required: true },
            { name: 'subtitle', label: 'Subtítulo', type: 'text' as const },
            { name: 'description', label: 'Descripción', type: 'textarea' as const },
            { name: 'image_url', label: 'URL de Imagen', type: 'url' as const, required: true },
            { name: 'cta_text', label: 'Texto del Botón', type: 'text' as const },
            { name: 'cta_link', label: 'Link del Botón', type: 'text' as const }
          ],
          onSave: handleSaveHero
        }
      case 'promotion':
        return {
          title: editingItem ? 'Editar Promoción' : 'Nueva Promoción',
          fields: [
            { name: 'title', label: 'Título', type: 'text' as const, required: true },
            { name: 'description', label: 'Descripción', type: 'textarea' as const },
            { name: 'image_url', label: 'URL de Imagen', type: 'url' as const, required: true },
            { name: 'discount_percentage', label: 'Descuento %', type: 'number' as const },
            { name: 'badge_text', label: 'Texto del Badge', type: 'text' as const },
            { name: 'link_url', label: 'Link', type: 'text' as const },
            { name: 'valid_until', label: 'Válido hasta', type: 'date' as const },
            { name: 'display_order', label: 'Orden', type: 'number' as const }
          ],
          onSave: handleSavePromotion
        }
      case 'flight':
        return {
          title: editingItem ? 'Editar Destino' : 'Nuevo Destino',
          fields: [
            { name: 'city', label: 'Ciudad', type: 'text' as const, required: true },
            { name: 'country', label: 'País', type: 'text' as const, placeholder: 'México' },
            { name: 'price_from', label: 'Precio desde', type: 'number' as const, required: true },
            { name: 'currency', label: 'Moneda', type: 'text' as const, placeholder: 'MXN' },
            { name: 'image_url', label: 'URL de Imagen', type: 'url' as const, required: true },
            { name: 'airport_code', label: 'Código Aeropuerto', type: 'text' as const, placeholder: 'MEX' },
            { name: 'display_order', label: 'Orden', type: 'number' as const }
          ],
          onSave: handleSaveFlight
        }
      case 'package':
        return {
          title: editingItem ? 'Editar Paquete' : 'Nuevo Paquete',
          fields: [
            { name: 'destination', label: 'Destino', type: 'text' as const, required: true },
            { name: 'package_name', label: 'Nombre del Paquete', type: 'text' as const, required: true },
            { name: 'description', label: 'Descripción', type: 'textarea' as const },
            { name: 'price', label: 'Precio', type: 'number' as const, required: true },
            { name: 'currency', label: 'Moneda', type: 'text' as const, placeholder: 'MXN' },
            { name: 'duration_days', label: 'Duración (días)', type: 'number' as const, required: true },
            { name: 'duration_nights', label: 'Duración (noches)', type: 'number' as const, required: true },
            { name: 'includes', label: 'Incluye (separar con +)', type: 'text' as const, placeholder: 'Vuelo + Hotel + Tours' },
            { name: 'image_url', label: 'URL de Imagen', type: 'url' as const, required: true },
            { name: 'rating', label: 'Rating', type: 'number' as const, placeholder: '5.0' },
            { name: 'review_count', label: 'Número de Reviews', type: 'number' as const, placeholder: '0' },
            { name: 'display_order', label: 'Orden', type: 'number' as const }
          ],
          onSave: handleSavePackage
        }
      default:
        return null
    }
  }

  const modalConfig = getModalConfig()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader showBackButton={true} backButtonHref="/dashboard" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Card className={`p-4 flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
              {toast.message}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToast(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      )}

      {/* Modal */}
      {modalConfig && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
            setEditingType('')
          }}
          onSave={modalConfig.onSave}
          title={modalConfig.title}
          fields={modalConfig.fields}
          initialData={editingItem}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Contenido</h1>
          <p className="text-muted-foreground">
            Administra el contenido dinámico de la página principal
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Promociones
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Vuelos
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Paquetes
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Videos/URLs
            </TabsTrigger>
            <TabsTrigger value="tour-images" className="flex items-center gap-2" onClick={() => {
              if (tourImagesList.length === 0) loadTourImages()
            }}>
              <ImageIcon className="w-4 h-4" />
              Imágenes Tours
            </TabsTrigger>
            <TabsTrigger value="megatravel" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              MegaTravel
            </TabsTrigger>
          </TabsList>

          {/* HERO TAB */}
          <TabsContent value="hero">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Banner Principal</h2>
              </div>

              {heroData ? (
                <div className="space-y-4">
                  <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                    <img
                      src={heroData.image_url}
                      alt={heroData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-muted-foreground">Título</label>
                      <p className="p-3 bg-gray-50 rounded border font-semibold">{heroData.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-muted-foreground">Subtítulo</label>
                      <p className="p-3 bg-gray-50 rounded border">{heroData.subtitle}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-1 block text-muted-foreground">Descripción</label>
                      <p className="p-3 bg-gray-50 rounded border">{heroData.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="bg-[#0066FF] hover:bg-[#0052CC]"
                      onClick={handleEditHero}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Banner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay banner configurado</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* PROMOTIONS TAB */}
          <TabsContent value="promotions">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Ofertas Especiales</h2>
                <Button
                  className="bg-[#0066FF] hover:bg-[#0052CC]"
                  onClick={handleNewPromotion}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Promoción
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promo) => (
                  <Card key={promo.id} className="overflow-hidden">
                    <div className="relative h-32">
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                      {promo.discount_percentage && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{promo.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{promo.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {promo.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPromotion(promo)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeletePromotion(promo.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {promotions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay promociones</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* FLIGHTS TAB */}
          <TabsContent value="flights">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Vuelos a Destinos</h2>
                <Button
                  className="bg-[#0066FF] hover:bg-[#0052CC]"
                  onClick={handleNewFlight}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Destino
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {flightDestinations.map((dest) => (
                  <Card key={dest.id} className="overflow-hidden">
                    <div className="relative h-24">
                      <img
                        src={dest.image_url}
                        alt={dest.city}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm mb-1">{dest.city}</h3>
                      <p className="text-xs text-[#0066FF] font-semibold mb-2">
                        ${Number(dest.price_from).toLocaleString()} {dest.currency}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleEditFlight(dest)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 w-full text-xs"
                          onClick={() => handleDeleteFlight(dest.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {flightDestinations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay destinos de vuelos</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* PACKAGES TAB */}
          <TabsContent value="packages">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Paquetes Vacacionales</h2>
                <Button
                  className="bg-[#0066FF] hover:bg-[#0052CC]"
                  onClick={handleNewPackage}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Paquete
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <img
                        src={pkg.image_url}
                        alt={pkg.destination}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {pkg.duration_days}D/{pkg.duration_nights}N
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{pkg.package_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{pkg.destination}</p>
                      <p className="text-lg font-bold text-[#0066FF] mb-2">
                        ${Number(pkg.price).toLocaleString()} {pkg.currency}
                      </p>
                      {pkg.includes && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                          Incluye: {pkg.includes}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPackage(pkg)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeletePackage(pkg.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {packages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay paquetes configurados</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* VIDEOS TAB */}
          <TabsContent value="videos">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">URLs de Videos/Multimedia</h2>
              </div>

              <div className="space-y-6">
                {/* Video Tours */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🎬 Video Página de Tours</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    URL del video que aparece en el hero de la página de Tours y Viajes Grupales
                  </p>
                  <VideoUrlEditor
                    settingKey="TOURS_PROMO_VIDEO_URL"
                    label="URL del Video de Tours"
                    onSave={() => showToast('Video de Tours actualizado', 'success')}
                  />
                </div>

                {/* Video Home */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🏠 Video Página Principal</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    URL del video o imagen de fondo en la página principal
                  </p>
                  <VideoUrlEditor
                    settingKey="HOME_HERO_VIDEO_URL"
                    label="URL del Video/Imagen Principal"
                    onSave={() => showToast('Video Principal actualizado', 'success')}
                  />
                </div>

                {/* Video Viajes Grupales Tab */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">👥 Video Tab Viajes Grupales</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    URL del video que aparece en el tab de Viajes Grupales en la página principal
                  </p>
                  <VideoUrlEditor
                    settingKey="GROUPS_TAB_VIDEO_URL"
                    label="URL del Video de Grupos"
                    onSave={() => showToast('Video de Grupos actualizado', 'success')}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* MEGATRAVEL TAB */}
          <TabsContent value="megatravel">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🌍 MegaTravel — Tours y Scraping</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sincronización y Scraping de Tours</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Descubre tours nuevos de MegaTravel, da de baja los eliminados y actualiza itinerarios, precios, includes y not-includes de todos los tours.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg"
                      onClick={() => router.push('/admin/megatravel-scraping')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Abrir Panel de Sincronización y Scraping
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/admin/megatravel')}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Ver Paquetes Sincronizados
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-sm">📡 Paso 1: Sincronizar</h4>
                    <p className="text-xs text-muted-foreground">
                      Navega las categorías de MegaTravel para descubrir tours nuevos y marcar como inactivos los que ya no existen.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-sm">🔄 Paso 2: Scraping</h4>
                    <p className="text-xs text-muted-foreground">
                      Actualiza itinerarios, precios USD, includes y not-includes de cada tour individual.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-sm">⏱️ Duración</h4>
                    <p className="text-xs text-muted-foreground">
                      El proceso completo puede tomar 60-120 minutos. Puedes detenerlo en cualquier momento.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TOUR IMAGES TAB */}
          <TabsContent value="tour-images">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🖼️ Imágenes de Tours</h2>
                <Button
                  variant="outline"
                  onClick={loadTourImages}
                  disabled={tourImagesLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${tourImagesLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Tours sin imagen</p>
                    <p className="text-2xl font-bold text-red-800">{tourImagesCount}</p>
                  </div>
                </div>
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">¿Cómo actualizar una imagen?</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-xs text-amber-700">
                        <li>Clic en <strong>"Ver en MegaTravel"</strong></li>
                        <li>Clic derecho en la imagen → <strong>"Copiar dirección de imagen"</strong></li>
                        <li>Pega la URL en el campo y haz clic en <strong>"Guardar"</strong></li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o región..."
                  value={tourImgSearch}
                  onChange={(e) => setTourImgSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {tourImgSearch && (
                  <button onClick={() => setTourImgSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Image Preview Modal */}
              {tourImgPreview && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setTourImgPreview(null)}>
                  <div className="relative max-w-3xl">
                    <button onClick={() => setTourImgPreview(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-10">
                      <X className="w-5 h-5" />
                    </button>
                    <img src={tourImgPreview} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
                  </div>
                </div>
              )}

              {/* Tour List */}
              {tourImagesLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Cargando tours...</p>
                </div>
              ) : tourImagesList.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-700">¡Todos los tours tienen imagen!</p>
                  <p className="text-sm text-gray-500 mt-1">Haz clic en "Actualizar" para verificar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tourImagesList
                    .filter(t => !tourImgSearch ||
                      t.name.toLowerCase().includes(tourImgSearch.toLowerCase()) ||
                      t.code.toLowerCase().includes(tourImgSearch.toLowerCase()) ||
                      t.region.toLowerCase().includes(tourImgSearch.toLowerCase())
                    )
                    .map((tour: any) => {
                      const isExp = tourImgExpanded === tour.code
                      const isSaving = tourImgSaving[tour.code] || false
                      const inputUrl = tourImgInputs[tour.code] || ''

                      return (
                        <div key={tour.code} className={`border rounded-lg transition-all ${isExp ? 'border-blue-300 shadow-md' : 'hover:border-blue-200'}`}>
                          {/* Row */}
                          <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setTourImgExpanded(isExp ? null : tour.code)}>
                            <div className="w-14 h-10 rounded bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                              {inputUrl ? (
                                <img src={inputUrl} alt="" className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{tour.code}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{tour.region}</span>
                              </div>
                              <p className="font-medium text-sm truncate mt-0.5">{tour.name}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="flex items-center gap-1 text-orange-500 text-xs">
                                <AlertTriangle className="w-3 h-3" /> Sin imagen
                              </span>
                              {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </div>

                          {/* Expanded */}
                          {isExp && (
                            <div className="px-3 pb-3 pt-0 border-t">
                              <div className="mt-3 space-y-3">
                                <a href={tour.mtUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
                                  onClick={(e) => e.stopPropagation()}>
                                  <ExternalLink className="w-3.5 h-3.5" /> Ver en MegaTravel →
                                </a>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Pega aquí la URL de la imagen..."
                                    value={inputUrl}
                                    onChange={(e) => setTourImgInputs(prev => ({ ...prev, [tour.code]: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  {inputUrl && (
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setTourImgPreview(inputUrl) }}>
                                      <Eye className="w-3.5 h-3.5 mr-1" /> Vista previa
                                    </Button>
                                  )}
                                  <Button size="sm" disabled={!inputUrl || isSaving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      try { new URL(inputUrl) } catch { showToast('URL no válida', 'error'); return }
                                      setTourImgSaving(prev => ({ ...prev, [tour.code]: true }))
                                      try {
                                        const res = await fetch(`/api/admin/tour-image?code=${tour.code}`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ imageUrl: inputUrl })
                                        })
                                        const data = await res.json()
                                        if (data.success) {
                                          showToast(`✅ Imagen de ${tour.code} guardada`, 'success')
                                          setTimeout(() => {
                                            setTourImagesList(prev => prev.filter(t => t.code !== tour.code))
                                            setTourImagesCount(prev => prev - 1)
                                          }, 1000)
                                        } else {
                                          showToast(`❌ Error: ${data.error}`, 'error')
                                        }
                                      } catch { showToast('❌ Error de red', 'error') }
                                      setTourImgSaving(prev => ({ ...prev, [tour.code]: false }))
                                    }}
                                  >
                                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                    Guardar
                                  </Button>
                                </div>
                                {inputUrl && (
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                                    <img src={inputUrl} alt={tour.name} className="max-w-[200px] h-24 object-cover rounded border" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
