"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, CreditCard, Wallet, Search, Calendar, Landmark } from "lucide-react"
import NotificationBell from "@/components/mobile/NotificationBell"
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
  
  const [activeTab, setActiveTab] = useState<'realizados' | 'pendientes'>('realizados')
  
  const [payments, setPayments] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchPayments()
      fetchPendingPayments()
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

  const fetchPendingPayments = async () => {
    try {
      setLoadingPending(true)
      const token = localStorage.getItem('token') || ''
      const res = await fetch(`/api/mobile/payments/pending?user_id=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setPendingPayments(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPending(false)
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
          <NotificationBell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-2">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Pagos</h1>
        <p className="text-sm text-gray-500">
          Revisa tus pagos y saldos
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6 mt-4">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('realizados')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'realizados' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Realizados
          </button>
          <button 
            onClick={() => setActiveTab('pendientes')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'pendientes' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Por realizar
          </button>
        </div>
      </div>

      {activeTab === 'realizados' ? (
        <>
          {/* Filter Bar */}
          <div className="px-4 mb-6 animate-in fade-in zoom-in duration-300">
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
          <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        </>
      ) : (
        <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loadingPending ? (
            <div className="text-center text-gray-500 py-10">Consultando saldos...</div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-gray-100">
              <Landmark className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              ¡Felicidades! No tienes saldos pendientes.
            </div>
          ) : pendingPayments.map((p) => (
            <div key={p.booking_id} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-2">
                    Saldo Pendiente
                  </p>
                  <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight mb-1">{p.destination}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">Reserva #{p.booking_id}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Costo total</span>
                  <span className="text-sm font-medium text-gray-900">${p.total_price.toFixed(2)} {p.currency}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500">Pagado</span>
                  <span className="text-sm font-medium text-gray-900">${p.paid_amount.toFixed(2)} {p.currency}</span>
                </div>
                <div className="h-px w-full bg-gray-200 mb-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Monto restante</span>
                  <span className="text-lg font-bold text-orange-600">${p.pending_amount.toFixed(2)} {p.currency}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 text-center mt-1">Contacta a tu agente de viajes para saldar este monto.</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
