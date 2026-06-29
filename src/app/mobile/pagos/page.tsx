"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, CreditCard, Calendar as CalendarIcon, Shield, Plane, Wallet, Loader2, X, Copy, Landmark, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useEffect, useState } from "react"

export default function MobilePaymentsPage() {
  const router = useRouter()

  const { user } = useAuth()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPayments()
      fetchPaymentInstructions()
    }
  }, [user])

  const fetchPaymentInstructions = async () => {
    try {
      const res = await fetch(`/api/mobile/content?tenant_id=${user?.tenant_id || 1}`)
      const data = await res.json()
      if (data.success && data.data?.sections_json?.payment_instructions) {
        setPaymentInstructions(data.data.sections_json.payment_instructions)
      }
    } catch (err) {
      console.error("Error fetching payment instructions:", err)
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

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
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 flex flex-col z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
        >
          <Wallet className="w-5 h-5" />
          Realiza tu próximo pago
        </button>
      </div>

      {/* Payment Instructions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-[#0066FF] rounded-2xl flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Instrucciones de Pago</h3>
                <p className="text-sm text-gray-500">Transferencia o depósito</p>
              </div>
            </div>

            {paymentInstructions ? (
              <div className="space-y-4">
                {paymentInstructions.instructions_text && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {paymentInstructions.instructions_text}
                  </p>
                )}
                
                <div className="space-y-3 mt-4">
                  {[
                    { label: 'Banco', value: paymentInstructions.bank_name, key: 'bank' },
                    { label: 'Cuenta', value: paymentInstructions.account_number, key: 'account' },
                    { label: 'CLABE', value: paymentInstructions.clabe, key: 'clabe' },
                    { label: 'Beneficiario', value: paymentInstructions.reference, key: 'reference' }
                  ].map((item) => item.value && (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900">{item.value}</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.value, item.key)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#0066FF] bg-white rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95"
                      >
                        {copiedField === item.key ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Las instrucciones de pago aún no han sido configuradas por el administrador.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
