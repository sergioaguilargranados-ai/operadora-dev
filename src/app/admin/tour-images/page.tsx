'use client'

// Panel de Gestión de Imágenes de Tours
// Build: 24 Feb 2026 - v2.329
// Permite ver tours sin imagen, con imagen genérica, y actualizar imágenes manualmente

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
    Image as ImageIcon,
    AlertTriangle,
    CheckCircle,
    Search,
    ExternalLink,
    Save,
    Trash2,
    Eye,
    RefreshCw,
    Globe,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

interface TourImageInfo {
    code: string
    name: string
    region: string
    country: string
    hasGallery: boolean
    galleryCount: number
    galleryImages: string[]
    mtUrl: string
    days: number
    nights: number
}

export default function TourImagesAdminPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [tours, setTours] = useState<TourImageInfo[]>([])
    const [totalTours, setTotalTours] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [imageInputs, setImageInputs] = useState<Record<string, string>>({})
    const [savingStates, setSavingStates] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({})
    const [expandedTour, setExpandedTour] = useState<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [showAll, setShowAll] = useState(false)
    const [allTours, setAllTours] = useState<any[]>([])
    const [allToursLoading, setAllToursLoading] = useState(false)

    // Auth check
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            router.push('/')
            return
        }
        loadMissingImages()
    }, [isAuthenticated, user, router])

    // Auto-clear notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const loadMissingImages = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/tour-image?missing=true')
            const data = await res.json()
            if (data.success) {
                setTours(data.tours)
                setTotalTours(data.count)
            }
        } catch (error) {
            console.error('Error loading tours:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadAllTours = async () => {
        try {
            setAllToursLoading(true)
            const res = await fetch('/api/admin/tour-image?all=true')
            const data = await res.json()
            if (data.success) {
                setAllTours(data.tours)
            }
        } catch (error) {
            console.error('Error loading all tours:', error)
        } finally {
            setAllToursLoading(false)
        }
    }

    const handleSaveImage = async (code: string) => {
        const imageUrl = imageInputs[code]?.trim()
        if (!imageUrl) {
            setNotification({ message: 'Ingresa una URL de imagen', type: 'error' })
            return
        }

        // Validate URL
        try {
            new URL(imageUrl)
        } catch {
            setNotification({ message: 'URL no válida', type: 'error' })
            return
        }

        setSavingStates(prev => ({ ...prev, [code]: 'saving' }))

        try {
            const res = await fetch(`/api/admin/tour-image?code=${code}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            })
            const data = await res.json()

            if (data.success) {
                setSavingStates(prev => ({ ...prev, [code]: 'success' }))
                setNotification({ message: `✅ Imagen de ${code} actualizada`, type: 'success' })
                // Remove from missing list after short delay
                setTimeout(() => {
                    setTours(prev => prev.filter(t => t.code !== code))
                    setTotalTours(prev => prev - 1)
                    setSavingStates(prev => ({ ...prev, [code]: 'idle' }))
                }, 1500)
            } else {
                setSavingStates(prev => ({ ...prev, [code]: 'error' }))
                setNotification({ message: `❌ Error: ${data.error}`, type: 'error' })
            }
        } catch (error) {
            setSavingStates(prev => ({ ...prev, [code]: 'error' }))
            setNotification({ message: '❌ Error de red', type: 'error' })
        }
    }

    const handleClearImage = async (code: string) => {
        setSavingStates(prev => ({ ...prev, [code]: 'saving' }))
        try {
            const res = await fetch(`/api/admin/tour-image?code=${code}&clear=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            if (data.success) {
                setNotification({ message: `Imagen de ${code} limpiada`, type: 'success' })
                setSavingStates(prev => ({ ...prev, [code]: 'idle' }))
                loadMissingImages()
            }
        } catch {
            setNotification({ message: '❌ Error al limpiar imagen', type: 'error' })
            setSavingStates(prev => ({ ...prev, [code]: 'idle' }))
        }
    }

    const filteredTours = tours.filter(t =>
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.region.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Cargando tours...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium transition-all animate-in slide-in-from-top ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Image Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setPreviewUrl(null)}>
                    <div className="relative max-w-4xl max-h-[80vh]">
                        <button onClick={() => setPreviewUrl(null)}
                            className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                        <img src={previewUrl} alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5Ij5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <ImageIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                Gestión de Imágenes de Tours
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Administra las imágenes principales de los tours de MegaTravel
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/admin/megatravel')}
                                className="text-sm"
                            >
                                ← Panel MegaTravel
                            </Button>
                            <Button
                                onClick={loadMissingImages}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 border-red-200 bg-gradient-to-br from-red-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-red-600 font-medium">Sin imagen</p>
                                <p className="text-3xl font-bold text-red-800">{totalTours}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 font-medium">Con imagen</p>
                                <p className="text-3xl font-bold text-green-800">325 - {totalTours} = {325 - totalTours}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Globe className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total tours</p>
                                <p className="text-3xl font-bold text-blue-800">325</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código o región..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Instrucciones */}
                <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">¿Cómo actualizar una imagen?</p>
                            <ol className="list-decimal list-inside space-y-1 text-amber-700">
                                <li>Haz clic en <strong>&quot;Ver en MegaTravel&quot;</strong> para abrir el tour original</li>
                                <li>Haz clic derecho en la imagen del tour → <strong>&quot;Copiar dirección de imagen&quot;</strong></li>
                                <li>Pega la URL en el campo de imagen del tour correspondiente</li>
                                <li>Haz clic en <strong>&quot;Vista previa&quot;</strong> para verificar que la imagen es correcta</li>
                                <li>Haz clic en <strong>&quot;Guardar&quot;</strong> para aplicar el cambio</li>
                            </ol>
                        </div>
                    </div>
                </Card>

                {/* Tour List */}
                <div className="space-y-3">
                    {filteredTours.length === 0 ? (
                        <Card className="p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-lg font-semibold text-gray-700">
                                {searchQuery ? 'No hay resultados para esta búsqueda' : '¡Todos los tours tienen imagen!'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {searchQuery ? 'Prueba con otro término de búsqueda' : 'No hay imágenes pendientes por configurar'}
                            </p>
                        </Card>
                    ) : (
                        filteredTours.map((tour) => {
                            const isExpanded = expandedTour === tour.code
                            const saveState = savingStates[tour.code] || 'idle'
                            const inputUrl = imageInputs[tour.code] || ''

                            return (
                                <Card key={tour.code}
                                    className={`overflow-hidden transition-all duration-300 ${saveState === 'success' ? 'border-green-400 bg-green-50/50' :
                                            saveState === 'error' ? 'border-red-400 bg-red-50/50' :
                                                isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                                        }`}>
                                    {/* Tour Header Row */}
                                    <div className="p-4 flex items-center gap-4 cursor-pointer"
                                        onClick={() => setExpandedTour(isExpanded ? null : tour.code)}>
                                        {/* Tour placeholder image */}
                                        <div className="w-20 h-14 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                                            {inputUrl ? (
                                                <img src={inputUrl} alt={tour.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none'
                                                            ; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs text-red-400">Error</span>'
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Tour info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{tour.code}</span>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tour.region}</span>
                                                {tour.country && (
                                                    <span className="text-xs text-gray-500">{tour.country}</span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 truncate mt-1">{tour.name}</h3>
                                            <p className="text-xs text-gray-500">{tour.days} días / {tour.nights} noches</p>
                                        </div>

                                        {/* Status badge */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {saveState === 'success' ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Guardada
                                                </span>
                                            ) : saveState === 'saving' ? (
                                                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-1 text-orange-500 text-sm">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Sin imagen
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                                            <div className="mt-4 space-y-4">
                                                {/* External Link */}
                                                <a href={tour.mtUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    onClick={(e) => e.stopPropagation()}>
                                                    <ExternalLink className="w-4 h-4" />
                                                    Ver en MegaTravel →
                                                </a>

                                                {/* Image URL Input */}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Pega aquí la URL de la imagen (ej: https://cdnmega.com/...)"
                                                        value={inputUrl}
                                                        onChange={(e) => {
                                                            setImageInputs(prev => ({ ...prev, [tour.code]: e.target.value }))
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {inputUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setPreviewUrl(inputUrl)
                                                            }}
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Vista previa
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        disabled={!inputUrl || saveState === 'saving'}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSaveImage(tour.code)
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                                    >
                                                        {saveState === 'saving' ? (
                                                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4 mr-1" />
                                                        )}
                                                        Guardar imagen
                                                    </Button>
                                                </div>

                                                {/* Preview thumbnail */}
                                                {inputUrl && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                                        <p className="text-xs text-gray-500 mb-2 font-medium">Vista previa:</p>
                                                        <img
                                                            src={inputUrl}
                                                            alt={`Preview de ${tour.name}`}
                                                            className="max-w-xs h-32 object-cover rounded-lg border shadow-sm"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZlZTJlMiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZGMyNjI2Ij5JbWFnZW4gbm8gdsOhbGlkYTwvdGV4dD48L3N2Zz4='
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Panel de Gestión de Imágenes • AS Operadora v2.329</p>
                    <p className="mt-1">Mostrando {filteredTours.length} de {totalTours} tours sin imagen</p>
                </div>
            </div>
        </div>
    )
}
