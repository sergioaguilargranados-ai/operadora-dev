"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Loader2, AlertTriangle, Info, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LostTourHelpPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [helpPhone, setHelpPhone] = useState("")

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/mobile/content')
        const data = await res.json()
        if (data.success && data.data) {
          setHelpPhone(data.data.help_phone || "")
        }
      } catch (e) {
        console.error("Error loading help phone", e)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 border-b border-gray-100 flex flex-col items-center sticky top-0 z-20">
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-gray-900 hover:text-gray-600 active:scale-95 transition-all p-2 -ml-2 rounded-full hover:bg-gray-50">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="w-7 h-7" /> {/* Spacer */}
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1 text-center">Perdí mi tour o traslado</h1>
      </div>

      <div className="px-5 mt-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100/50">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <h3 className="font-bold text-gray-900">Mantén la calma</h3>
              </div>
              <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed space-y-3">
                <p>
                  Si perdiste tu tour o servicio de traslado, no te preocupes, sigue estas recomendaciones:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Contacta a soporte:</strong> Usa el botón de WhatsApp abajo para comunicarte con nosotros inmediatamente.</li>
                  <li><strong>Revisa tus documentos:</strong> Asegúrate del punto de encuentro exacto y del horario en tu itinerario.</li>
                  <li><strong>Verifica el punto de encuentro:</strong> Algunas veces los guías o transportes pueden retrasarse unos minutos debido al tráfico.</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Recomendación</h4>
                <p className="text-xs text-gray-600 leading-relaxed">No te alejes del punto de reunión original mientras te pones en contacto con nosotros para buscar la mejor solución.</p>
              </div>
            </div>

            {helpPhone && (
              <button
                onClick={() => {
                  const message = `Hola, soy ${user?.name || (user as any)?.first_name || 'un cliente'}. Necesito ayuda, perdí mi tour o traslado. Mi correo es ${user?.email || ''}.`;
                  const url = `https://wa.me/${helpPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank');
                }}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-6 h-6" />
                Contactar por WhatsApp
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
