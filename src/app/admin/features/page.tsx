// Página de Administración de Funciones
// Build: 22 Jul 2026 - v2.429 - Sistema de Administración Granular

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Search,
    Settings,
    ToggleLeft,
    ToggleRight,
    Monitor,
    Smartphone,
    Filter,
    RefreshCw,
    Check,
    X,
    Loader2,
    BarChart3
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';

interface Feature {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string;
    is_global_enabled: boolean;
    web_enabled: boolean;
    mobile_enabled: boolean;
    icon: string | null;
    sort_order: number;
}

interface AppSetting {
    key: string;
    value: string;
    description: string | null;
}

export default function AdminFeaturesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [features, setFeatures] = useState<Feature[]>([]);
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [providerMetrics, setProviderMetrics] = useState<any[]>([]);

    // Obtener token del localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('as_token');
            setAccessToken(token);
        }
    }, []);

    // Verificar acceso
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user && !['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
            router.push('/');
            return;
        }
    }, [isAuthenticated, user, router]);

    // Cargar datos
    const fetchData = useCallback(async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            setError(null);

            const [featuresRes, metricsRes] = await Promise.all([
                fetch('/api/admin/features', {
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
                }),
                fetch('/api/admin/analytics/providers', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }).catch(() => ({ json: async () => ({ success: false }) }))
            ]);

            const data = await featuresRes.json();
            const metricsData = await (metricsRes as any).json();

            if (metricsData.success && metricsData.data) {
                setProviderMetrics(metricsData.data);
            }

            if (data.success) {
                setFeatures(data.data.features || []);
                setCategories(data.data.categories || []);
                setSettings(data.data.settings || []);
            } else {
                setError(data.error?.message || 'Error al cargar datos');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error('Error fetching features:', err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Actualizar feature
    const updateFeature = async (code: string, field: string, value: boolean) => {
        if (!accessToken) return;

        setSaving(code);
        try {
            const response = await fetch('/api/admin/features', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    [field]: value
                })
            });

            const data = await response.json();

            if (data.success) {
                setFeatures(prev => prev.map(f =>
                    f.code === code ? { ...f, [field]: value } : f
                ));
            } else {
                setError(data.error?.message || 'Error al actualizar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(null);
        }
    };

    // Actualizar setting
    const updateSetting = async (key: string, value: string) => {
        if (!accessToken) return;

        setSaving(key);
        try {
            const response = await fetch('/api/admin/features', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            });

            const data = await response.json();

            if (data.success) {
                setSettings(prev => prev.map(s =>
                    s.key === key ? { ...s, value } : s
                ));
            } else {
                setError(data.error?.message || 'Error al actualizar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(null);
        }
    };

    // Filtrar features
    const filteredFeatures = features.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || f.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Agrupar por categoría
    const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, Feature[]>);

    // Nombres de categorías en español
    const categoryNames: Record<string, string> = {
        busqueda: '🔍 Búsqueda de Servicios',
        usuario: '👤 Menú Usuario',
        admin: '⚙️ Administración',
        corporativo: '🏢 Corporativo',
        pagos: '💳 Pagos',
        sistema: '🔧 Sistema'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Logo className="py-1" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Título */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" />
                        Administración de Funciones
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Controla qué funciones están disponibles en la aplicación web y móvil
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
                        <X className="w-5 h-5" />
                        {error}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="ml-auto"
                        >
                            Cerrar
                        </Button>
                    </div>
                )}

                {/* Configuración Global */}
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔐 Configuración Global
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings.filter(s => s.key.startsWith('LOGIN_')).map(setting => (
                            <div
                                key={setting.key}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">
                                        {setting.key === 'LOGIN_REQUIRED_WEB' ? 'Login obligatorio (Web)' : 'Login obligatorio (Móvil)'}
                                    </p>
                                    <p className="text-sm text-gray-500">{setting.description}</p>
                                </div>
                                <Button
                                    variant={setting.value === 'true' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateSetting(setting.key, setting.value === 'true' ? 'false' : 'true')}
                                    disabled={saving === setting.key}
                                    className={setting.value === 'true' ? 'bg-green-600 hover:bg-green-700' : ''}
                                >
                                    {saving === setting.key ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : setting.value === 'true' ? (
                                        <><Check className="w-4 h-4 mr-1" /> Activo</>
                                    ) : (
                                        <><X className="w-4 h-4 mr-1" /> Inactivo</>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Búsqueda y filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar función..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Todas
                        </Button>
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Lista de Features por Categoría */}
                {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                    <Card key={category} className="p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {categoryNames[category] || category}
                        </h2>
                        <div className="space-y-3">
                            {categoryFeatures.map(feature => (
                                <div
                                    key={feature.code}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${feature.is_global_enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{feature.name}</p>
                                            <code className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                                {feature.code}
                                            </code>
                                        </div>
                                        {feature.description && (
                                            <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Toggle Global */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 mb-1">Global</span>
                                            <button
                                                onClick={() => updateFeature(feature.code, 'is_global_enabled', !feature.is_global_enabled)}
                                                disabled={saving === feature.code}
                                                className="transition-colors"
                                            >
                                                {saving === feature.code ? (
                                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                                ) : feature.is_global_enabled ? (
                                                    <ToggleRight className="w-8 h-8 text-green-600" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Toggle Web */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 mb-1">Web</span>
                                            <button
                                                onClick={() => updateFeature(feature.code, 'web_enabled', !feature.web_enabled)}
                                                disabled={saving === feature.code || !feature.is_global_enabled}
                                                className={`transition-colors ${!feature.is_global_enabled ? 'opacity-50' : ''}`}
                                            >
                                                <Monitor className={`w-6 h-6 ${feature.web_enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                                            </button>
                                        </div>

                                        {/* Toggle Mobile */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 mb-1">Móvil</span>
                                            <button
                                                onClick={() => updateFeature(feature.code, 'mobile_enabled', !feature.mobile_enabled)}
                                                disabled={saving === feature.code || !feature.is_global_enabled}
                                                className={`transition-colors ${!feature.is_global_enabled ? 'opacity-50' : ''}`}
                                            >
                                                <Smartphone className={`w-6 h-6 ${feature.mobile_enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}

                {/* Resumen */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                    <h2 className="text-lg font-semibold mb-2">📊 Resumen</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold text-blue-600">{features.length}</p>
                            <p className="text-sm text-gray-600">Total Features</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-green-600">
                                {features.filter(f => f.is_global_enabled).length}
                            </p>
                            <p className="text-sm text-gray-600">Activos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-600">
                                {features.filter(f => !f.is_global_enabled).length}
                            </p>
                            <p className="text-sm text-gray-600">Inactivos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
                            <p className="text-sm text-gray-600">Categorías</p>
                        </div>
                    </div>
                    {/* SECCIÓN DE MÉTRICAS DE PROVEEDORES */}
                    <div className="mt-12 mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-6 h-6 text-[#0066FF]" />
                            <h2 className="text-2xl font-bold">Rendimiento de Proveedores</h2>
                        </div>
                        <Card className="p-6">
                            {providerMetrics.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Aún no hay suficientes datos de búsquedas para mostrar métricas.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="p-3 font-semibold">Proveedor</th>
                                                <th className="p-3 font-semibold">Servicio</th>
                                                <th className="p-3 font-semibold text-right">Consultas Totales</th>
                                                <th className="p-3 font-semibold text-right">Éxito</th>
                                                <th className="p-3 font-semibold text-right">Tiempo Promedio (ms)</th>
                                                <th className="p-3 font-semibold text-right">Resultados Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {providerMetrics.map((metric, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50/50">
                                                    <td className="p-3 font-medium">{metric.provider_name}</td>
                                                    <td className="p-3 capitalize">{metric.service_type}</td>
                                                    <td className="p-3 text-right">{metric.total_requests}</td>
                                                    <td className="p-3 text-right text-green-600">
                                                        {Math.round((metric.successful_requests / metric.total_requests) * 100)}%
                                                    </td>
                                                    <td className="p-3 text-right">{metric.avg_response_time}ms</td>
                                                    <td className="p-3 text-right">{metric.avg_results} res/búsqueda</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>
                </Card>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 py-4 mt-8">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>v2.233 | Sistema de Administración Granular</p>
                </div>
            </footer>
        </div>
    );
}
