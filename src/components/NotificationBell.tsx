"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export function NotificationBell({ className = "w-6 h-6", isWhite = false }: { className?: string; isWhite?: boolean }) {
  const router = useRouter()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount()
      // Polling every 15 seconds
      const interval = setInterval(loadUnreadCount, 15000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadUnreadCount = async () => {
    try {
      const res = await fetch(`/api/mobile/notifications?userId=${user?.id}`)
      const data = await res.json()
      if (data.success && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <button 
      onClick={() => router.push('/mobile/notificaciones')} 
      className={`p-2 -mr-1 relative flex-shrink-0 transition-colors ${isWhite ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
    >
      <Bell className={className} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  )
}
