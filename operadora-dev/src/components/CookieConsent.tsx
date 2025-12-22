'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    // Verificar si ya hay consentimiento
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Mostrar banner después de 1 segundo
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Cargar preferencias guardadas
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved)

        // Aplicar configuración de cookies
        applyConsent(saved)
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
      }
    }
  }, [])

  const applyConsent = (prefs: typeof preferences) => {
    // Analytics (Google Analytics)
    if (prefs.analytics) {
      enableGoogleAnalytics()
    } else {
      disableGoogleAnalytics()
    }

    // Marketing
    if (prefs.marketing) {
      // Habilitar scripts de marketing
      console.log('Marketing cookies enabled')
    }

    // Personalización
    if (prefs.personalization) {
      // Habilitar cookies de personalización
      console.log('Personalization cookies enabled')
    }
  }

  const enableGoogleAnalytics = () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      // @ts-ignore
      window.dataLayer = window.dataLayer || []
      // @ts-ignore
      function gtag(){dataLayer.push(arguments)}
      // @ts-ignore
      gtag('js', new Date())
      // @ts-ignore
      gtag('config', process.env.NEXT_PUBLIC_GA_ID)

      // Cargar script de GA
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      script.async = true
      document.head.appendChild(script)
    }
  }

  const disableGoogleAnalytics = () => {
    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window['ga-disable-' + process.env.NEXT_PUBLIC_GA_ID] = true
    }
  }

  const saveConsentToBackend = async (prefs: typeof preferences) => {
    try {
      const sessionId = localStorage.getItem('session_id') || generateSessionId()

      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          ...prefs
        })
      })
    } catch (error) {
      console.error('Error saving cookie consent:', error)
    }
  }

  const generateSessionId = () => {
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('session_id', sessionId)
    return sessionId
  }

  const acceptAll = async () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }

    setPreferences(allAccepted)
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted))
    applyConsent(allAccepted)
    await saveConsentToBackend(allAccepted)
    setShowBanner(false)
  }

  const acceptNecessary = async () => {
    const necessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }

    setPreferences(necessary)
    localStorage.setItem('cookie_consent', JSON.stringify(necessary))
    applyConsent(necessary)
    await saveConsentToBackend(necessary)
    setShowBanner(false)
  }

  const savePreferences = async () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences))
    applyConsent(preferences)
    await saveConsentToBackend(preferences)
    setShowBanner(false)
    setShowPreferences(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-5xl mx-auto p-6 shadow-2xl">
        {!showPreferences ? (
          // Banner principal
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                🍪 Este sitio usa cookies
              </h3>
              <p className="text-sm text-muted-foreground">
                Usamos cookies para mejorar tu experiencia, personalizar contenido,
                analizar nuestro tráfico y mostrarte anuncios relevantes. Al hacer clic en
                "Aceptar todas", aceptas el uso de todas las cookies.
                {' '}
                <a href="/politica-privacidad" className="underline hover:text-primary">
                  Política de Privacidad
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={acceptAll}
                className="w-full sm:w-auto"
              >
                Aceptar todas
              </Button>
              <Button
                variant="outline"
                onClick={acceptNecessary}
                className="w-full sm:w-auto"
              >
                Solo necesarias
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPreferences(true)}
                className="w-full sm:w-auto"
              >
                Configurar
              </Button>
            </div>
          </div>
        ) : (
          // Preferencias detalladas
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preferencias de Cookies</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necesarias */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Cookies Necesarias</h4>
                  <p className="text-sm text-muted-foreground">
                    Esenciales para el funcionamiento del sitio. No pueden desactivarse.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Cookies Analíticas</h4>
                  <p className="text-sm text-muted-foreground">
                    Nos ayudan a entender cómo usas nuestro sitio para mejorarlo.
                    Utilizamos Google Analytics.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Cookies de Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilizadas para mostrarte anuncios relevantes basados en tus intereses.
                  </p>
                </div>
              </div>

              {/* Personalización */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) => setPreferences({ ...preferences, personalization: e.target.checked })}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Cookies de Personalización</h4>
                  <p className="text-sm text-muted-foreground">
                    Permiten recordar tus preferencias y personalizar tu experiencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePreferences} className="flex-1">
                Guardar preferencias
              </Button>
              <Button variant="outline" onClick={acceptAll} className="flex-1">
                Aceptar todas
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
