"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from "lucide-react"

export default function MobileItineraryRootPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login')
      return
    }

    if (!user) return

    const checkTours = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '')
        const url = isAdmin ? '/api/bookings?userId=all' : `/api/bookings?userId=${user.id}`
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const bookingsList = data.data || []
          
          // Buscar la primera reserva con un tour_id
          const tourBooking = bookingsList.find((b: any) => {
            try {
              const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
              return !!details.tour_id
            } catch(e) {
              return false
            }
          })
          
          if (tourBooking) {
            const details = typeof tourBooking.special_requests === 'string' ? JSON.parse(tourBooking.special_requests) : (tourBooking.special_requests || {})
            router.push(`/mobile/itinerario/${details.tour_id}`)
          } else {
            // Si no tiene tours, mandarlo a mis reservas
            router.push('/mis-reservas')
          }
        } else {
          router.push('/mis-reservas')
        }
      } catch (error) {
        console.error("Error checking tours:", error)
        router.push('/mis-reservas')
      }
    }

    checkTours()
  }, [user, isAuthenticated])

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center gap-6 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-4 rounded-full shadow-sm border border-blue-50">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">Preparando tu viaje</h2>
          <p className="text-gray-500 text-sm animate-pulse">Sincronizando itinerario...</p>
        </div>
      </div>
    </div>
  )
}
