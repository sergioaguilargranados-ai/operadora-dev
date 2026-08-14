'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const { isAuthenticated } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada como standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) return // No mostrar banner si ya está instalada

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Verificar si el usuario ya descartó el banner para distanciar la invitación
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 14) return // No mostrar por 14 días después de descartar
    }

    // Para Android/Chrome — capturar el evento de instalación
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 5000)
    }

    if (typeof window !== 'undefined' && (window as any).pwaDeferredPrompt) {
      handler((window as any).pwaDeferredPrompt)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Para iOS — mostrar instrucciones después de 5 segundos
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 5000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        setDeferredPrompt(null)
      }
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  if (isStandalone || !showBanner || !isAuthenticated) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-0 md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-5 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 relative z-10">
            {/* Icono */}
            <div className="w-14 h-14 bg-gradient-to-br from-[#0066FF] to-[#0044CC] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Smartphone className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base">
                Instalar AS Operadora de Viajes
              </h3>

              {isIOS ? (
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Toca{' '}
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 inline text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                    </svg>
                  </span>{' '}
                  y luego <strong>"Agregar a pantalla de inicio"</strong>
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mt-1 leading-snug">
                    Acceso rápido a tours, reservas y cotizaciones desde tu pantalla de inicio
                  </p>
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="mt-3 bg-gradient-to-r from-[#0066FF] to-[#0044CC] hover:from-[#0055DD] hover:to-[#0033BB] text-white gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Instalar App
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
