'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Globe,
  DollarSign,
  Palette,
  Download,
  Trash2,
  Database,
  Shield,
  Bell,
  Map
} from 'lucide-react'

export default function ConfiguracionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Estados para configuración general
  const [language, setLanguage] = useState('es')
  const [currency, setCurrency] = useState('MXN')
  const [timezone, setTimezone] = useState('America/Mexico_City')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')

  // Estados para apariencia
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [fontSize, setFontSize] = useState('medium')
  const [colorScheme, setColorScheme] = useState('yellow')

  // Estados para privacidad
  const [profileVisibility, setProfileVisibility] = useState('private')
  const [searchHistory, setSearchHistory] = useState(true)
  const [analytics, setAnalytics] = useState(true)

  // Estados de la UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Cargar configuración guardada
    loadSettings()
  }, [isAuthenticated, router])

  const loadSettings = () => {
    // Cargar de localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setLanguage(settings.language || 'es')
      setCurrency(settings.currency || 'MXN')
      setTimezone(settings.timezone || 'America/Mexico_City')
      setDateFormat(settings.dateFormat || 'DD/MM/YYYY')
      setTheme(settings.theme || 'light')
      setFontSize(settings.fontSize || 'medium')
      setColorScheme(settings.colorScheme || 'yellow')
      setProfileVisibility(settings.profileVisibility || 'private')
      setSearchHistory(settings.searchHistory !== false)
      setAnalytics(settings.analytics !== false)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setMessage('')

    const settings = {
      language,
      currency,
      timezone,
      dateFormat,
      theme,
      fontSize,
      colorScheme,
      profileVisibility,
      searchHistory,
      analytics
    }

    try {
      // Guardar en localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings))

      // Guardar en backend (si existe el endpoint)
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage('✅ Configuración guardada exitosamente')

        // Aplicar cambios inmediatamente
        if (theme !== 'auto') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }

        // Aplicar tamaño de fuente
        document.documentElement.style.fontSize =
          fontSize === 'small' ? '14px' :
          fontSize === 'large' ? '18px' : '16px'
      } else {
        setMessage('⚠️ Configuración guardada localmente (servidor no disponible)')
      }
    } catch (error) {
      setMessage('⚠️ Configuración guardada localmente')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la caché? Esto puede hacer que la aplicación sea más lenta temporalmente.')) {
      localStorage.removeItem('searchCache')
      localStorage.removeItem('hotelCache')
      setMessage('✅ Caché limpiada exitosamente')
    }
  }

  const handleClearSearchHistory = () => {
    if (confirm('¿Estás seguro de que quieres eliminar tu historial de búsquedas?')) {
      localStorage.removeItem('searchHistory')
      setMessage('✅ Historial de búsquedas eliminado')
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/export-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `datos-usuario-${Date.now()}.json`
        a.click()
        setMessage('✅ Datos exportados exitosamente')
      } else {
        setMessage('❌ Error al exportar datos')
      }
    } catch (error) {
      setMessage('❌ Error al exportar datos')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">Personaliza tu experiencia en AS Operadora</p>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : message.startsWith('⚠️')
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacidad
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Datos
            </TabsTrigger>
          </TabsList>

          {/* Tab: General */}
          <TabsContent value="general">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Configuración General</h3>

              <div className="space-y-6">
                {/* Idioma */}
                <div>
                  <Label htmlFor="language" className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4" />
                    Idioma
                  </Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <Separator />

                {/* Moneda */}
                <div>
                  <Label htmlFor="currency" className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Moneda Preferida
                  </Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Libra Esterlina</option>
                    <option value="CAD">CAD - Dólar Canadiense</option>
                  </select>
                </div>

                <Separator />

                {/* Zona Horaria */}
                <div>
                  <Label htmlFor="timezone" className="flex items-center gap-2 mb-2">
                    <Map className="w-4 h-4" />
                    Zona Horaria
                  </Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                    <option value="America/New_York">Nueva York (GMT-5)</option>
                    <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                  </select>
                </div>

                <Separator />

                {/* Formato de Fecha */}
                <div>
                  <Label htmlFor="dateFormat" className="mb-2 block">
                    Formato de Fecha
                  </Label>
                  <select
                    id="dateFormat"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (15/12/2025)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/15/2025)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-15)</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Apariencia */}
          <TabsContent value="appearance">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Personalización de Apariencia</h3>

              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <Label className="mb-3 block">Tema</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'light'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-white border rounded mb-2"></div>
                      <p className="text-sm font-medium">Claro</p>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                      <p className="text-sm font-medium">Oscuro</p>
                    </button>

                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        theme === 'auto'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                      <p className="text-sm font-medium">Auto</p>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Tamaño de Fuente */}
                <div>
                  <Label className="mb-3 block">Tamaño de Texto</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          fontSize === size
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`font-medium ${
                          size === 'small' ? 'text-sm' :
                          size === 'large' ? 'text-lg' : 'text-base'
                        }`}>
                          {size === 'small' ? 'Pequeño' :
                           size === 'large' ? 'Grande' : 'Mediano'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Esquema de Color */}
                <div>
                  <Label className="mb-3 block">Color Principal</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { name: 'yellow', color: 'bg-yellow-500' },
                      { name: 'blue', color: 'bg-blue-500' },
                      { name: 'green', color: 'bg-green-500' },
                      { name: 'red', color: 'bg-red-500' },
                      { name: 'purple', color: 'bg-purple-500' }
                    ].map((scheme) => (
                      <button
                        key={scheme.name}
                        onClick={() => setColorScheme(scheme.name)}
                        className={`h-12 rounded-lg ${scheme.color} ${
                          colorScheme === scheme.name
                            ? 'ring-4 ring-gray-300'
                            : 'hover:ring-2 ring-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Privacidad */}
          <TabsContent value="privacy">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Privacidad y Seguridad</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Visibilidad del Perfil</h4>
                    <p className="text-sm text-gray-600">
                      Controla quién puede ver tu perfil
                    </p>
                  </div>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                    <option value="contacts">Solo Contactos</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Guardar Historial de Búsquedas</h4>
                    <p className="text-sm text-gray-600">
                      Almacena tus búsquedas para mejores recomendaciones
                    </p>
                  </div>
                  <Button
                    variant={searchHistory ? 'default' : 'outline'}
                    onClick={() => setSearchHistory(!searchHistory)}
                  >
                    {searchHistory ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Análisis de Uso</h4>
                    <p className="text-sm text-gray-600">
                      Ayúdanos a mejorar compartiendo datos anónimos de uso
                    </p>
                  </div>
                  <Button
                    variant={analytics ? 'default' : 'outline'}
                    onClick={() => setAnalytics(!analytics)}
                  >
                    {analytics ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Datos */}
          <TabsContent value="data">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Gestión de Datos</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Exportar Datos</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Descarga todos tus datos en formato JSON
                  </p>
                  <Button
                    onClick={handleExportData}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {loading ? 'Exportando...' : 'Exportar Mis Datos'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Limpiar Caché</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Elimina datos temporales para mejorar el rendimiento
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearCache}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Limpiar Caché
                  </Button>
                </div>

                <Separator />

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Espacio Utilizado
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Almacenamiento local: ~2.5 MB
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <Separator />

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Zona de Peligro</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Elimina permanentemente tu historial de búsquedas
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleClearSearchHistory}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Historial
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botón Guardar Global */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">¿Listo para guardar cambios?</h4>
              <p className="text-sm text-gray-600">
                Los cambios se aplicarán inmediatamente
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              size="lg"
            >
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
