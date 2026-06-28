"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, BellOff } from "lucide-react"

export default function MobileNotificationsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Notificaciones</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <BellOff className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sin notificaciones</h2>
        <p className="text-gray-500 text-sm max-w-[250px]">
          No tienes notificaciones nuevas. Aquí aparecerán tus alertas y mensajes importantes.
        </p>
      </div>
    </div>
  )
}
