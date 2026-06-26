"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Construction } from "lucide-react"

export default function PlaceholderPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Próximamente</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-[250px]">
        Estamos construyendo esta sección para brindarte la mejor experiencia.
      </p>

      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
      >
        <ChevronLeft className="w-5 h-5" /> Regresar
      </button>
    </div>
  )
}
