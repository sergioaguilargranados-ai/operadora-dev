'use client'

// Panel de Administración MegaTravel
// Build: 31 Ene 2026 - v2.254 - Panel admin para sincronización MegaTravel

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
    RefreshCw,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Database,
    Calendar,
    AlertCircle,
    Download
} from 'lucide-react'

export default function MegaTravelAdminPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [canSync, setCanSync] = useState(true)
    const [syncMessage, setSyncMessage] = useState('')
    const [lastSync, setLastSync] = useState<string | null>(null)
    const [recentSyncs, setRecentSyncs] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])

    // Verificar autenticación y rol
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            router.push('/')
            return
        }

        loadData()
    }, [isAuthenticated, user, router])

    const loadData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/megatravel?action=stats')
            const data = await response.json()

            if (data.success) {
                setStats(data.data.stats)
                setCanSync(data.data.canSync)
                setSyncMessage(data.data.syncMessage)
                setLastSync(data.data.lastSync)
                setRecentSyncs(data.data.recentSyncs || [])
            }

            // Cargar paquetes
            const packagesResponse = await fetch('/api/admin/megatravel?action=packages')
            const packagesData = await packagesResponse.json()
            if (packagesData.success) {
                setPackages(packagesData.data.packages || [])
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (force = false) => {
        if (!canSync && !force) {
            alert(syncMessage)
            return
        }

        if (!confirm('¿Estás seguro de iniciar la sincronización con MegaTravel?')) {
            return
        }

        setSyncing(true)
        try {
            const response = await fetch('/api/admin/megatravel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync', force })
            })

            const data = await response.json()

            if (data.success) {
                alert(`✅ Sincronización completada!\n\n` +
                    `Paquetes encontrados: ${data.data.packagesFound}\n` +
                    `Paquetes sincronizados: ${data.data.packagesSynced}\n` +
                    `Paquetes fallidos: ${data.data.packagesFailed}\n` +
                    `Duración: ${data.data.duration}`)
                loadData()
            } else {
                alert(`❌ Error: ${data.error?.message || 'Error desconocido'}`)
            }
        } catch (error) {
            console.error('Error syncing:', error)
            alert('❌ Error al sincronizar')
        } finally {
            setSyncing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Panel MegaTravel</h1>
                            <p className="text-gray-600 mt-1">Sincronización y gestión de paquetes</p>
                        </div>
                        <Button onClick={() => router.push('/')} variant="outline">
                            Volver al inicio
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Paquetes</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total_packages || 0}</p>
                            </div>
                            <Package className="w-12 h-12 text-blue-600 opacity-20" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.active_packages || 0}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Destacados</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats?.featured_packages || 0}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-yellow-600 opacity-20" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ofertas</p>
                                <p className="text-3xl font-bold text-red-600">{stats?.offer_packages || 0}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
                        </div>
                    </Card>
                </div>

                {/* Sincronización */}
                <Card className="p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Sincronización</h2>
                            <p className="text-sm text-gray-600 mt-1">{syncMessage}</p>
                            {lastSync && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Última sincronización: {new Date(lastSync).toLocaleString('es-MX')}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleSync(false)}
                                disabled={syncing || (!canSync)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {syncing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Sincronizar
                                    </>
                                )}
                            </Button>
                            {!canSync && (
                                <Button
                                    onClick={() => handleSync(true)}
                                    disabled={syncing}
                                    variant="outline"
                                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                >
                                    Forzar Sincronización
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Historial reciente */}
                    {recentSyncs.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sincronizaciones Recientes</h3>
                            <div className="space-y-2">
                                {recentSyncs.map((sync: any) => (
                                    <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {sync.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : sync.status === 'failed' ? (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-600" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(sync.started_at).toLocaleString('es-MX')}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {sync.packages_synced || 0} paquetes sincronizados
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${sync.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                sync.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {sync.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Lista de paquetes */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Paquetes Sincronizados</h2>
                        <Button onClick={loadData} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Código</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Región</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Precio</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Última Sync</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.slice(0, 20).map((pkg: any) => (
                                    <tr key={pkg.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900 font-mono">{pkg.mt_code}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{pkg.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{pkg.destination_region}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                                            ${pkg.price_usd} USD
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {pkg.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-gray-600">
                                            {pkg.last_sync_at ? new Date(pkg.last_sync_at).toLocaleDateString('es-MX') : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {packages.length > 20 && (
                        <p className="text-sm text-gray-600 mt-4 text-center">
                            Mostrando 20 de {packages.length} paquetes
                        </p>
                    )}
                </Card>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                    <p>© 2026 AS Operadora - Panel de Administración MegaTravel</p>
                    <p className="text-xs mt-1 opacity-50">v2.254 | Build: 31 Ene 2026</p>
                </div>
            </footer>
        </div>
    )
}
