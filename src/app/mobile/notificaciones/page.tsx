"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronLeft, BellOff, Bell, Loader2, Circle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type Notification = {
  id: number
  body: string
  subject: string
  message_type: string
  created_at: string
  sender_name: string
  is_read: boolean
}

export default function MobileNotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.token) {
      loadNotifications()
    } else if (user === null) {
      setLoading(false)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/mobile/notifications', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
        
        // Marcar como leídas automáticamente
        const unreadIds = data.data.filter((n: Notification) => !n.is_read).map((n: Notification) => n.id)
        if (unreadIds.length > 0) {
          markAsRead(unreadIds)
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageIds: number[]) => {
    try {
      await fetch('/api/mobile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ messageIds })
      })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleString('es-MX', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Notificaciones</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full mt-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-sm border border-gray-100">
              <BellOff className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sin notificaciones</h2>
            <p className="text-gray-500 text-sm max-w-[250px]">
              No tienes notificaciones nuevas. Aquí aparecerán tus alertas y mensajes importantes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 bg-white">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex gap-4 items-start transition-colors ${notif.is_read ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.message_type === 'alert' || notif.message_type === 'notification' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-medium truncate ${notif.is_read ? 'text-gray-900' : 'text-black font-bold'}`}>
                      {notif.subject || notif.sender_name}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {notif.body}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="flex-shrink-0 pt-2">
                    <Circle className="w-3 h-3 fill-blue-600 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
