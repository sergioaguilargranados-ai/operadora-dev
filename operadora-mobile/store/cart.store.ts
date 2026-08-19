import { create } from 'zustand'

export interface CartProduct {
  id: number | string
  name: string
  price: number
  offer_price?: number
  image_url?: string
  quantity: number
}

interface CartState {
  items: CartProduct[]
  addToCart: (product: any) => void
  removeFromCart: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: Number(product.offer_price || product.price || 0),
            image_url: product.image_url,
            quantity: 1,
          },
        ],
      }
    })
  },

  removeFromCart: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== id) }
      }
      return {
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      }
    })
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get()
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((acc, item) => acc + item.quantity, 0)
  },
}))

export default useCartStore
