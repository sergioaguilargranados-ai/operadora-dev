"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, CreditCard, Wallet, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

export default function MobilePaymentsPage() {
  const router = useRouter()

  const { user } = useAuth()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

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

  // Filter payments based on search
  const filteredPayments = payments.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    const idMatch = p.id?.toString().includes(s)
    const amountMatch = p.amount?.toString().includes(s)
    const dateMatch = new Date(p.created_at).toLocaleDateString().includes(s)
    const statusMatch = p.status?.toLowerCase().includes(s)
    const txMatch = p.transaction_id?.toLowerCase().includes(s)
    return idMatch || amountMatch || dateMatch || statusMatch || txMatch
  })

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-8">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <MobileLogo
          variant="dark"
          size="md"
          logoUrl={customLogoUrl}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-4">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Pagos</h1>
        <p className="text-sm text-gray-500">
          Historial de pagos realizados
        </p>
      </div>

      {/* Filter Bar */}
      <div className="px-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Buscar por fecha, monto, recibo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl border-gray-200 focus-visible:ring-black text-base placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Payment List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Cargando pagos...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <Wallet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No se encontraron pagos
          </div>
        ) : filteredPayments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-colors cursor-default">
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

    </div>
  )
}
