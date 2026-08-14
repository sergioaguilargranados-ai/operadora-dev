"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = "w-6 h-6" }: NotificationBellProps) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/mobile/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount)
          }
        })
        .catch(err => console.error("Error fetching unread count", err))
    }
  }, [user])

  return (
    <div className="relative inline-flex">
      <Bell className={className} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
          {unreadCount > 9 ? '+9' : unreadCount}
        </span>
      )}
    </div>
  )
}
