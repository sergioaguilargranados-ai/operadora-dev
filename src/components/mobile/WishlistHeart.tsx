"use client"

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface WishlistHeartProps {
  item: {
    name: string
    desc: string
    img: string
    category?: string
  }
  city: string
  itineraryId: number
  dayIndex: number
}

export function WishlistHeart({ item, city, itineraryId, dayIndex }: WishlistHeartProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}`)
        const data = await res.json()
        if (data.success) {
          const saved = data.data.some((w: any) => 
            w.item_name === item.name && w.itinerary_id === itineraryId
          )
          setIsSaved(saved)
        }
      } catch (err) {
        console.error("Error checking wishlist status:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkStatus()
  }, [user?.id, item.name, itineraryId])

  const toggleWishlist = async () => {
    if (!user?.id) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar en tu wishlist", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          item_name: item.name,
          item_desc: item.desc,
          item_img: item.img,
          city,
          itinerary_id: itineraryId,
          day_index: dayIndex,
          category: item.category || 'souvenir'
        })
      })
      const data = await res.json()
      
      if (data.success) {
        const nowSaved = data.action === 'added'
        setIsSaved(nowSaved)
        toast({ 
          title: nowSaved ? "Guardado" : "Eliminado", 
          description: nowSaved ? `${item.name} añadido a tu wishlist.` : `${item.name} removido de tu wishlist.` 
        })
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err)
      toast({ title: "Error", description: "No se pudo actualizar la wishlist", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors ${
        isSaved ? 'bg-red-50' : 'bg-white'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
      ) : (
        <Heart 
          className={`w-3 h-3 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
        />
      )}
    </button>
  )
}
