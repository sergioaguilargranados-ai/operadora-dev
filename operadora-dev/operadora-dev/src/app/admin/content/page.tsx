"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { ContentModal } from "@/components/admin/ContentModal"
import {
  Plus, Edit, Trash2, DollarSign, Calendar, Plane, Hotel, Package,
  Home, Globe, CheckCircle2, AlertCircle, X
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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

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
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="py-2" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              Ver sitio
            </Button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Card className={`p-4 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-900' : 'text-red-900'
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Banner Principal
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
        </Tabs>
      </div>
    </div>
  )
}
