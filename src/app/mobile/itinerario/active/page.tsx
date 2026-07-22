"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from "lucide-react"

export default function MobileActiveItineraryRedirect() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/mobile/login')
      return
    }

    if (!user) return

    const fetchAndRedirect = async () => {
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
          
          let nearestTripId = null
          let nearestDiff = Infinity
          const now = new Date().getTime()

          bookingsList.forEach((b: any) => {
            try {
              const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
              const tripId = details.tour_id || b.id.toString()
              const tripDate = new Date(b.travel_date || details.fecha_inicio || b.created_at).getTime()
              
              if (tripDate >= now) {
                const diff = tripDate - now
                if (diff < nearestDiff) {
                  nearestDiff = diff
                  nearestTripId = tripId
                }
              }
            } catch(e) {}
          })

          if (nearestTripId) {
            router.replace(`/mobile/itinerario/${nearestTripId}?tab=itinerario`)
          } else {
            router.replace('/mobile/itinerario')
          }
        } else {
          router.replace('/mobile/itinerario')
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
        router.replace('/mobile/itinerario')
      }
    }

    fetchAndRedirect()
  }, [user, isAuthenticated, router])

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )
}
