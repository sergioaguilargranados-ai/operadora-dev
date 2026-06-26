"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [showSyncMsg, setShowSyncMsg] = useState(false)

  useEffect(() => {
    // Verificar estado inicial
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine)
    }

    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => {
      setIsOffline(false)
      setShowSyncMsg(true)
      // Ocultar mensaje de sincronización después de 3 segundos
      setTimeout(() => setShowSyncMsg(false), 3000)
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (!isOffline && !showSyncMsg) return null

  if (showSyncMsg) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-xs font-bold py-1.5 px-4 z-50 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
        <Wifi className="w-3.5 h-3.5" /> Conexión restablecida. Sincronizando cambios...
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-xs font-bold py-1.5 px-4 z-50 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3.5 h-3.5" /> Sin conexión a internet. Estás viendo datos guardados.
    </div>
  )
}
