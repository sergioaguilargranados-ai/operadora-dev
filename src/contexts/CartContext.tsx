"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface CartItem {
  id: number
  name: string
  price: number
  offer_price?: number
  image_url: string
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: any, quantity?: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Cargar carrito de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tienda_carrito")
      if (saved) {
        setCart(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Error cargando carrito", e)
    }
    setIsInitialized(true)
  }, [])

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("tienda_carrito", JSON.stringify(cart))
    }
  }, [cart, isInitialized])

  const addToCart = (product: any, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      
      const priceToUse = product.offer_price ? Number(product.offer_price) : Number(product.price)
      
      return [...prev, {
        id: product.id,
        name: product.name,
        price: priceToUse,
        image_url: product.image_url || "",
        quantity
      }]
    })
    
    toast({
      title: "Agregado al Carrito",
      description: `${product.name} ha sido añadido.`,
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem("tienda_carrito")
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
