"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Wallet, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function MobileNewPaymentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Error", description: "Monto inválido", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      // En un entorno real se integraría el SDK de la pasarela de pagos, pero aquí lo simulamos:
      const res = await fetch("/api/mobile/payments/process", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          amount: Number(amount),
          currency: 'MXN',
          payment_method: 'card',
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({ title: "Pago exitoso", description: "Tu pago se procesó correctamente" })
        router.push("/mobile/pagos")
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Ocurrió un error al procesar el pago", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center bg-white sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="text-xl font-bold ml-2">Realizar Pago</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-[#0066FF] rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Wallet className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Ingresa el monto</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            El pago se registrará de inmediato a tu cuenta
          </p>

          <form onSubmit={handlePayment}>
            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full text-4xl font-bold text-center border-b-2 border-gray-200 py-4 focus:outline-none focus:border-[#0066FF] transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-400">MXN</span>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Tus pagos están protegidos por encriptación de 256 bits. 
                Los fondos se acreditarán en tu próximo estado de cuenta en máximo 24 horas hábiles.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !amount}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Pagar ahora <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
