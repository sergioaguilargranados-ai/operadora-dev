"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Trash2, ShieldCheck, ArrowRight, Loader2, CreditCard, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"

export default function MobileCartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { cart: cartItems, cartTotal: total, removeFromCart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState("")

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || cardNumber.length < 16) {
      toast({ title: "Error", description: "Número de tarjeta inválido", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/mobile/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || 1, // Usuario de prueba si no hay sesión real
          items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price_at_time: item.price })),
          total_amount: total
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Pedido Confirmado", description: "Tu compra se ha procesado con éxito" })
        clearCart()
        setTimeout(() => {
          router.push("/mobile/tienda")
        }, 1500)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Ocurrió un error en el pago", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center bg-white sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="text-xl font-bold ml-2">Carrito</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 mt-10">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Parece que aún no has agregado productos a tu carrito.</p>
          <Button onClick={() => router.push("/mobile/tienda")} className="bg-black text-white rounded-xl">
            Explorar Tienda
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          
          {/* Cart Items */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 px-2">Resumen de Compra</h2>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-2">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-auto">Cantidad: {item.quantity}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-black">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 mt-4 pt-4 px-2 flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="text-2xl font-bold text-black">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form (Simulated Gateway) */}
          <form onSubmit={handleCheckout} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mt-4">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Datos de Pago
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Número de Tarjeta</label>
                <input 
                  type="text" 
                  placeholder="4152 3134 5431 8219" 
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vencimiento</label>
                  <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">CVC</label>
                  <input type="text" placeholder="123" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-3 flex items-center gap-3 mt-6">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-[10px] text-blue-900 leading-tight">
                Pago 100% seguro. Usamos un simulador de pasarela para esta demo.
              </p>
            </div>
          </form>

        </div>
      )}

      {/* Floating Checkout Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
          <Button 
            onClick={handleCheckout}
            disabled={loading || !cardNumber}
            className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 shadow-xl shadow-black/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>Pagar ${total.toFixed(2)} <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      )}

    </div>
  )
}
