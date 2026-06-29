"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, CreditCard, Calendar as CalendarIcon, Shield, Plane, Wallet, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useEffect, useState } from "react"

export default function MobilePaymentsPage() {
  const router = useRouter()

  const { user } = useAuth()
  const { logoUrl } = useWhiteLabel()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchPayments()
    }
  }, [user])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/mobile/payments?user_id=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-28">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <img
          src={logoUrl || "/logo.png"}
          alt="AS Operadora"
          className="h-10 object-contain"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/icon-192x192.png'; }}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-6">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Pagos</h1>
        <p className="text-sm text-gray-500">
          Historial de pagos realizados
        </p>
      </div>

      {/* Payment List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Cargando pagos...</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <Wallet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No tienes pagos registrados
          </div>
        ) : payments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 active:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-center flex-shrink-0 text-[#003366]">
              <CreditCard className="w-6 h-6" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 leading-tight">Pago #{payment.id}</h3>
                <span className="text-sm font-semibold text-gray-900">${payment.amount} {payment.currency}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">{payment.transaction_id || 'Transferencia'}</p>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${payment.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                  <span className={`text-[11px] font-medium ${payment.status === 'completed' ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {payment.status === 'completed' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                  {new Date(payment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 flex flex-col z-50">
        <button className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
          <Wallet className="w-5 h-5" />
          Realiza tu próximo pago
        </button>
      </div>

    </div>
  )
}
