"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { ContentModal } from "@/components/admin/ContentModal"
import { VideoUrlEditor } from "@/components/admin/VideoUrlEditor"
import { LandingContentManager } from "@/components/admin/LandingContentManager"
import { MobileAppContentManager } from "@/components/admin/MobileAppContentManager"
import { StoreProductsManager } from "@/components/admin/StoreProductsManager"
import { DestinationContentManager } from "@/components/admin/DestinationContentManager"
import {
  Plus, Edit, Trash2, DollarSign, Calendar, Plane, Hotel, Package,
  Home, Globe, CheckCircle2, AlertCircle, X, RefreshCw, Smartphone,
  Image as ImageIcon, Search, Eye, Save, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Star, MapPin, Loader2, ShoppingBag, Settings, CloudRain, Sparkles
} from "lucide-react"
import { CronProcessRunner } from "@/components/admin/CronProcessRunner"

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

  // Hotels Catalog state
  const [hotelsList, setHotelsList] = useState<any[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(false)
  const [hotelsCount, setHotelsCount] = useState(0)
  const [hotelsSearch, setHotelsSearch] = useState('')

  // Hotels Sync state
  const [syncStatus, setSyncStatus] = useState<{ isSyncing: boolean, progress: number, currentBatch: number, totalBatches: number, logs: string[] }>({
    isSyncing: false, progress: 0, currentBatch: 0, totalBatches: 0, logs: []
  })

  // Airlines Catalog state
  const [airlinesList, setAirlinesList] = useState<any[]>([])
  const [airlinesLoading, setAirlinesLoading] = useState(false)
  const [airlinesSearch, setAirlinesSearch] = useState('')
  const [editingAirline, setEditingAirline] = useState<any>(null)

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

  const loadHotels = async (searchQuery = '') => {
    try {
      setHotelsLoading(true)
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/admin/hotels?search=${searchQuery}&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setHotelsList(data.data)
        setHotelsCount(data.total)
      }
    } catch (error) {
      console.error('Error loading hotels:', error)
      showToast('Error al cargar hoteles', 'error')
    } finally {
      setHotelsLoading(false)
    }
  }

  const loadAirlines = async (searchQuery = '') => {
    try {
      setAirlinesLoading(true)
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/admin/airlines?search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setAirlinesList(data.data)
    } catch (error) {
      console.error('Error loading airlines:', error)
      showToast('Error al cargar aerolíneas', 'error')
    } finally {
      setAirlinesLoading(false)
    }
  }

  const saveAirlineLogo = async (iata: string, name: string, url: string) => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/admin/airlines', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ iata_code: iata, name, logo_url: url })
      })
      const data = await res.json()
      if (data.success) {
        showToast('Logo actualizado', 'success')
        loadAirlines(airlinesSearch)
        setEditingAirline(null)
      } else {
        showToast(data.error || 'Error al guardar logo', 'error')
      }
    } catch (error) {
      showToast('Error de conexión', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // SYNC LOGIC
  const handleStartSync = async () => {
    try {
      setSyncStatus({ isSyncing: true, progress: 0, currentBatch: 0, totalBatches: 0, logs: ['[Iniciando] Solicitando total de hoteles...'] })
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/admin/hotels/sync/start', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (!data.success) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false, logs: [...prev.logs, `[Error] ${data.error}`] }))
        showToast(data.error || 'Error al iniciar sync', 'error')
        return
      }

      setSyncStatus(prev => ({ 
        ...prev, 
        totalBatches: data.totalBatches, 
        logs: [...prev.logs, `[Descubrimiento] ${data.total} hoteles encontrados. Iniciando proceso por lotes...`] 
      }))

      // Process batches sequentially
      for (let i = 1; i <= data.totalBatches; i++) {
        // Checar si el usuario no cerró o canceló la sync
        const batchRes = await fetch('/api/admin/hotels/sync/process', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: i })
        })
        const batchData = await batchRes.json()
        
        if (!batchData.success) {
          setSyncStatus(prev => ({ ...prev, isSyncing: false, logs: [...prev.logs, `[Error en Lote ${i}] ${batchData.error}`] }))
          break
        }

        setSyncStatus(prev => ({
          ...prev,
          currentBatch: i,
          progress: Math.round((i / data.totalBatches) * 100),
          logs: [...prev.logs, ...(batchData.logs || [])]
        }))
      }

      setSyncStatus(prev => ({ ...prev, isSyncing: false, logs: [...prev.logs, '[Proceso Completado] Todos los lotes han sido procesados exitosamente.'] }))
      loadHotels() // Reload grid
      showToast('Sincronización completada', 'success')
    } catch (error) {
      console.error(error)
      setSyncStatus(prev => ({ ...prev, isSyncing: false, logs: [...prev.logs, '[Fallo Crítico] Error de conexión o servidor'] }))
      showToast('Error en la sincronización', 'error')
    }
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
          <TabsList className="flex flex-wrap h-auto p-1.5 bg-muted rounded-xl w-full mb-8 gap-1.5">
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
            <TabsTrigger value="hotels-catalog" className="flex items-center gap-2" onClick={() => {
              if (hotelsList.length === 0) loadHotels()
            }}>
              <Hotel className="w-4 h-4" />
              Catálogo Hoteles
            </TabsTrigger>
            <TabsTrigger value="airlines" className="flex items-center gap-2" onClick={() => {
              if (airlinesList.length === 0) loadAirlines()
            }}>
              <Plane className="w-4 h-4" />
              Catálogo Aerolíneas
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
            <TabsTrigger value="processes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ejecución de Procesos
            </TabsTrigger>
            <TabsTrigger value="expo" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Landing Principal
            </TabsTrigger>
            <TabsTrigger value="mobile-app" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              App Móvil PWA
            </TabsTrigger>
            <TabsTrigger value="store-products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Tienda (Productos)
            </TabsTrigger>
            <TabsTrigger value="destinations" className="flex items-center gap-2 text-blue-600">
              <MapPin className="w-4 h-4" /> Destinos (IA)
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

          {/* HOTELS CATALOG TAB */}
          <TabsContent value="hotels-catalog">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Catálogo de Hoteles</h2>
                <Button 
                  className="bg-[#0066FF] hover:bg-[#0052CC]" 
                  onClick={handleStartSync}
                  disabled={syncStatus.isSyncing}
                >
                  {syncStatus.isSyncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar Fotos (Content API)'}
                </Button>
              </div>

              {/* BARRA DE PROGRESO Y TERMINAL */}
              {(syncStatus.isSyncing || syncStatus.logs.length > 0) && (
                <div className="mb-8 space-y-4">
                  {/* Progress bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${syncStatus.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-blue-600 w-12 text-right">{syncStatus.progress}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Fase: Descarga de proveedores</span>
                    <span>{syncStatus.currentBatch} de {syncStatus.totalBatches} lotes completados</span>
                  </div>
                  
                  {/* Terminal Log */}
                  <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-4 font-mono text-[11px] h-64 overflow-y-auto mt-4 text-green-400">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800 text-gray-400">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Registro de Actividad</span>
                      <button onClick={() => setSyncStatus(prev => ({...prev, logs: []}))} className="hover:text-white">Limpiar</button>
                    </div>
                    <div className="space-y-1 mt-3">
                      {syncStatus.logs.map((log, i) => (
                        <div key={i} className={log.includes('[Error') ? 'text-red-400' : log.includes('✅') ? 'text-blue-300' : ''}>
                          {log}
                        </div>
                      ))}
                      {syncStatus.isSyncing && (
                        <div className="animate-pulse text-gray-500 mt-2">_</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex mb-6 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nombre o ciudad..." 
                    value={hotelsSearch}
                    onChange={(e) => setHotelsSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadHotels(hotelsSearch)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => loadHotels(hotelsSearch)}>Buscar</Button>
              </div>

              {hotelsLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0066FF]" />
                  <p className="mt-4 text-muted-foreground">Cargando catálogo...</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">Mostrando {hotelsList.length} de {hotelsCount} hoteles en base de datos.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotelsList.map((hotel) => (
                      <Card key={hotel.id} className="overflow-hidden flex flex-col">
                        <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                          {hotel.image_url ? (
                            <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                          ) : (
                            <Hotel className="w-12 h-12 text-gray-300" />
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold line-clamp-1" title={hotel.name}>{hotel.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {hotel.city}, {hotel.country}
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: hotel.star_rating || 0 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-auto">ID: {hotel.id} | {hotel.provider_id ? 'API' : 'Manual'}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          {/* AIRLINES CATALOG TAB */}
          <TabsContent value="airlines">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Catálogo de Aerolíneas</h2>
                <Button className="bg-[#0066FF] hover:bg-[#0052CC]" onClick={() => setEditingAirline({})}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Aerolínea
                </Button>
              </div>

              <div className="flex mb-6 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por código IATA o nombre..." 
                    value={airlinesSearch}
                    onChange={(e) => setAirlinesSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadAirlines(airlinesSearch)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => loadAirlines(airlinesSearch)}>Buscar</Button>
              </div>

              {airlinesLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0066FF]" />
                  <p className="mt-4 text-muted-foreground">Cargando aerolíneas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {airlinesList.map((airline) => (
                    <Card key={airline.iata_code} className="p-4 flex flex-col items-center justify-between hover:shadow-md transition-shadow relative">
                      {airline.is_custom && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" title="Logo Personalizado" />}
                      <div className="w-24 h-20 flex items-center justify-center bg-white rounded border mb-3 overflow-hidden p-2">
                        {airline.logo_url ? (
                          <img src={airline.logo_url} alt={airline.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Plane className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="text-center mb-4">
                        <p className="font-bold">{airline.iata_code}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1" title={airline.name}>{airline.name}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setEditingAirline(airline)}>
                        Editar Logo
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {editingAirline && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{editingAirline.iata_code ? 'Editar Aerolínea' : 'Nueva Aerolínea'}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setEditingAirline(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Código IATA (ej. AM)</label>
                      <Input 
                        value={editingAirline.iata_code || ''} 
                        onChange={e => setEditingAirline({...editingAirline, iata_code: e.target.value.toUpperCase()})}
                        disabled={!!editingAirline.is_custom || editingAirline.name}
                        placeholder="AM"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nombre de Aerolínea</label>
                      <Input 
                        value={editingAirline.name || ''} 
                        onChange={e => setEditingAirline({...editingAirline, name: e.target.value})}
                        placeholder="Aeroméxico"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">URL del Logo (Airhex o URL pública)</label>
                      <Input 
                        value={editingAirline.logo_url || ''} 
                        onChange={e => setEditingAirline({...editingAirline, logo_url: e.target.value})}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recomendado formato PNG transparente (max 200x200px).</p>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingAirline(null)}>Cancelar</Button>
                      <Button onClick={() => saveAirlineLogo(editingAirline.iata_code, editingAirline.name, editingAirline.logo_url)}>Guardar</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
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

                {/* Packing Tips Videos */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🧳 Videos de Tips para Empacar</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    URLs de los videos que aparecen en la sección de Retos (AS Rewards)
                  </p>
                  <div className="space-y-4">
                    <VideoUrlEditor
                      settingKey="PACKING_TIPS_VIDEO_1_URL"
                      label="URL del Video 1"
                      onSave={() => showToast('Video 1 actualizado', 'success')}
                    />
                    <VideoUrlEditor
                      settingKey="PACKING_TIPS_VIDEO_2_URL"
                      label="URL del Video 2"
                      onSave={() => showToast('Video 2 actualizado', 'success')}
                    />
                  </div>
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

          {/* PROCESSES TAB */}
          <TabsContent value="processes">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚙️ Ejecución de Procesos y Sincronización</h2>
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

              <div className="mt-8 space-y-6">
                <CronProcessRunner 
                  title="Actualizar Tipos de Cambio"
                  description="Descarga las divisas (EUR, USD, etc.) a MXN para el día de hoy usando la API configurada."
                  endpoint="/api/cron/update-rates"
                  icon={<DollarSign className="w-5 h-5 text-green-600" />}
                />

                <CronProcessRunner 
                  title="Pronóstico del Clima (Próximos Viajes)"
                  description="Revisa los itinerarios de los próximos 15 días y descarga el clima desde OpenWeatherMap."
                  endpoint="/api/cron/update-weather"
                  icon={<CloudRain className="w-5 h-5 text-blue-500" />}
                />

                <CronProcessRunner 
                  title="Regeneración de Destinos (IA)"
                  description="Fuerza la regeneración de datos ricos (Recetas paso a paso, Galerías completas, Actividades) usando Gemini."
                  endpoint="/api/cron/regenerate-tour"
                  icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                />
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
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Pega aquí la URL de la imagen..."
                                      value={inputUrl}
                                      onChange={(e) => setTourImgInputs(prev => ({ ...prev, [tour.code]: e.target.value }))}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id={`file-upload-${tour.code}`}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setTourImgSaving(prev => ({ ...prev, [tour.code]: true }));
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          const res = await fetch('/api/admin/upload-image', {
                                            method: 'POST',
                                            body: formData
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setTourImgInputs(prev => ({ ...prev, [tour.code]: data.url }));
                                            showToast('✅ Imagen subida correctamente', 'success');
                                          } else {
                                            showToast(`❌ Error: ${data.error}`, 'error');
                                          }
                                        } catch (err) {
                                          showToast('❌ Error de conexión', 'error');
                                        }
                                        setTourImgSaving(prev => ({ ...prev, [tour.code]: false }));
                                      }}
                                    />
                                    <Button 
                                      variant="outline" 
                                      type="button"
                                      className="px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById(`file-upload-${tour.code}`)?.click();
                                      }}
                                    >
                                      Subir foto
                                    </Button>
                                  </div>
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

          {/* LANDING PRINCIPAL TAB */}
          <TabsContent value="expo">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Landing Page Principal (/inicio)</h2>
              </div>
              <LandingContentManager showToast={showToast} />
            </Card>
          </TabsContent>

          {/* APP MOVIL PWA TAB */}
          <TabsContent value="mobile-app">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Contenido de Aplicación Móvil PWA</h2>
              </div>
              <MobileAppContentManager showToast={showToast} />
            </Card>
          </TabsContent>

          {/* STORE PRODUCTS TAB */}
          <TabsContent value="store-products">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Catálogo de Tienda Online</h2>
              </div>
              <StoreProductsManager showToast={showToast} />
            </Card>
          </TabsContent>

          {/* Destinos IA Tab */}
          <TabsContent value="destinations">
            <DestinationContentManager showToast={showToast} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
