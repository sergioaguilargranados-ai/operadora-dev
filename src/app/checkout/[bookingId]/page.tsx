'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import StripeCheckoutForm from '@/components/StripeCheckoutForm'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, CheckCircle2, WalletCards, Receipt, DollarSign, ArrowRight, Building, Banknote, CreditCard, Sparkles, Loader2 } from 'lucide-react'

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Booking {
  id: number
  type: string
  service_name: string
  total_price: number
  paid_amount?: number
  pending_balance?: number
  currency: string
  status: string
  payment_status: string
  details: any
}

// Función auxiliar de redondeo limpio a 2 decimales
const round2 = (val: number): number => {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100
}

export default function CheckoutPage({
  params
}: {
  params: Promise<{ bookingId: string }>
}) {
  const resolvedParams = use(params)
  const bookingId = parseInt(resolvedParams.bookingId)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Normalizar rol del usuario actual o desde storage para determinar si es Staff/Admin
  const normalizedRole = (user?.role || '').toUpperCase().replace(/[\s_-]/g, '')
  
  let storedRole = ''
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('as_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        storedRole = (parsed?.role || '').toUpperCase().replace(/[\s_-]/g, '')
      }
    } catch (e) {}
  }

  const isStaff = [
    'SUPERADMIN', 'ADMIN', 'ADMINISTRATOR', 'MANAGER', 
    'AGENCYADMIN', 'AGENT', 'AGENTE', 'STAFF', 'MASTER', 
    'AGENCIA', 'VENTAS'
  ].includes(normalizedRole) || [
    'SUPERADMIN', 'ADMIN', 'ADMINISTRATOR', 'MANAGER', 
    'AGENCYADMIN', 'AGENT', 'AGENTE', 'STAFF', 'MASTER', 
    'AGENCIA', 'VENTAS'
  ].includes(storedRole)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'mercadopago' | 'manual'>('stripe')
  const [clientSecret, setClientSecret] = useState('')
  const [paypalOrderId, setPaypalOrderId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successRedirecting, setSuccessRedirecting] = useState(false)

  // Manual payment state
  const [manualAmount, setManualAmount] = useState<string>('')
  const [manualMethod, setManualMethod] = useState<'transfer' | 'cash' | 'deposit' | 'pos'>('transfer')
  const [manualReference, setManualReference] = useState('')
  const [manualNotes, setManualNotes] = useState('')

  useEffect(() => {
    // Si viene un token en la URL, setearlo para logueo sin fricción
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      if (token) {
        document.cookie = `as_token=${encodeURIComponent(token)};path=/;samesite=lax`
        localStorage.setItem('as_token', token)
        // Limpiar URL para no dejar el token expuesto
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) throw new Error('Error al cargar reserva')

      const data = await res.json()
      const b = data.booking
      setBooking(b)

      const tot = parseFloat(String(b.total_price || 0))
      const pd = parseFloat(String(b.paid_amount || 0))
      const bal = (b.pending_balance !== undefined && b.pending_balance !== null) 
        ? parseFloat(String(b.pending_balance)) 
        : Math.max(0, tot - pd)

      const cleanBal = round2(bal)
      setManualAmount(cleanBal > 0 ? cleanBal.toFixed(2) : round2(tot).toFixed(2))

      // Si ya está pagada en su totalidad
      if (b.payment_status === 'paid' && cleanBal <= 0) {
        toast({
          title: 'Reserva ya pagada',
          description: 'Esta reserva ya ha sido pagada en su totalidad'
        })
        window.location.href = `/reserva/${bookingId}`
        return
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStripePayment = async () => {
    if (!booking) return

    setProcessing(true)
    try {
      const res = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.pending_balance || booking.total_price,
          currency: booking.currency || 'mxn'
        })
      })

      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        throw new Error(data.error || 'Error al iniciar pago')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    if (!booking) return

    setProcessing(true)
    try {
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.pending_balance || booking.total_price,
          currency: booking.currency || 'MXN'
        })
      })

      const data = await res.json()
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      } else {
        throw new Error(data.error || 'Error al crear orden de PayPal')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
      setProcessing(false)
    }
  }

  const handleMercadoPagoPayment = async () => {
    if (!booking) return

    setProcessing(true)
    try {
      const res = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.pending_balance || booking.total_price,
          currency: booking.currency || 'MXN'
        })
      })

      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        throw new Error(data.error || 'Error al conectar con Mercado Pago')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
      setProcessing(false)
    }
  }

  const handleManualPayment = async () => {
    if (!booking || processing || successRedirecting) return
    const amountNum = round2(parseFloat(manualAmount))
    const maxBalance = round2(booking.pending_balance ?? (booking.total_price - (booking.paid_amount || 0)))

    if (!amountNum || amountNum <= 0 || isNaN(amountNum)) {
      toast({ title: 'Atención', description: 'Ingresa un monto válido mayor a 0', variant: 'destructive' })
      return
    }

    if (amountNum > maxBalance + 0.05) {
      toast({ 
        title: 'Monto excede el saldo', 
        description: `El saldo pendiente máximo es $${maxBalance.toLocaleString()} ${booking.currency}`, 
        variant: 'destructive' 
      })
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token') || ''}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: amountNum,
          method: manualMethod,
          reference: manualReference,
          notes: manualNotes
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccessRedirecting(true)
        toast({
          title: '✅ ¡Pago Registrado Exitosamente!',
          description: `Se abonaron $${amountNum.toFixed(2)} ${booking.currency}. Redirigiendo a tu reserva...`
        })
        
        // Redirección directa y garantizada a los detalles de la reserva
        setTimeout(() => {
          window.location.href = `/reserva/${booking.id}`
        }, 700)
      } else {
        throw new Error(data.error || data.message || 'Error al registrar el pago manual')
      }
    } catch (error: any) {
      toast({
        title: 'Error al registrar pago',
        description: error.message,
        variant: 'destructive'
      })
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando pasarela de pago...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-2">Reserva no encontrada</h2>
          <p className="text-gray-600 mb-6 text-sm">No pudimos localizar la reserva solicitada para procesar el pago.</p>
          <Button onClick={() => router.push('/mis-reservas')} className="bg-slate-900 text-white rounded-xl">
            Ver mis reservas
          </Button>
        </Card>
      </div>
    )
  }

  const totalPrice = round2(parseFloat(String(booking.total_price || 0)))
  const paidAmount = round2(parseFloat(String(booking.paid_amount || 0)))
  const pendingBalance = (booking.pending_balance !== undefined && booking.pending_balance !== null)
    ? round2(parseFloat(String(booking.pending_balance)))
    : Math.max(0, round2(totalPrice - paidAmount))

  const currentManualInput = round2(parseFloat(manualAmount) || 0)
  const remainingAfterPayment = Math.max(0, round2(pendingBalance - currentManualInput))

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0f172a',
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      <PageHeader showBackButton={true} backButtonHref={`/reserva/${booking.id}`} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">Pagar Reserva #{booking.id}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Completa tu pago de forma rápida y segura</p>
            </div>
            {isStaff && (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 px-3 py-1 font-semibold text-xs flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                Modo Staff / Agente Activo
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ━━━ RESUMEN DE LA RESERVA (Columna Izquierda) ━━━ */}
            <div className="md:col-span-1 space-y-4">
              <Card className="p-5 rounded-2xl border-gray-200/80 shadow-sm bg-white">
                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-600" />
                  Detalle del Viaje
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Servicio / Destino:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{booking.service_name || 'Viaje AS Operadora'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tipo:</span>
                    <p className="font-semibold text-slate-700 capitalize">{booking.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Estado de pago:</span>
                    <div className="mt-1">
                      <Badge className={
                        booking.payment_status === 'paid' ? 'bg-emerald-500 text-white' :
                        booking.payment_status === 'partial' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                      }>
                        {booking.payment_status === 'paid' ? 'Pagado' : booking.payment_status === 'partial' ? 'Pago Parcial' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Precio total:</span>
                    <span className="font-semibold">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</span>
                  </div>

                  {paidAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Pagado acumulado:</span>
                      <span>-${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-gray-100">
                    <span>Saldo pendiente:</span>
                    <span className="text-slate-900 font-serif text-base">${pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</span>
                  </div>
                </div>
              </Card>

              <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Transacción 100% Segura
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cifrado SSL de 256 bits. Tus datos financieros nunca son almacenados en nuestros servidores.
                </p>
              </div>
            </div>

            {/* ━━━ MÉTODOS DE PAGO (Columna Derecha) ━━━ */}
            <div className="md:col-span-2">
              <Card className="p-6 rounded-2xl border-gray-200/80 shadow-sm bg-white">
                <h3 className="font-bold text-slate-900 mb-4 text-base">Selecciona el método de pago</h3>

                {/* Banner de Éxito en Redirección */}
                {successRedirecting && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in duration-300">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm">¡Cobro registrado exitosamente!</p>
                      <p className="text-xs text-emerald-700">Actualizando saldo y redirigiendo a los detalles de la reserva...</p>
                    </div>
                  </div>
                )}

                {/* Selector de Métodos */}
                <div className={`grid gap-3 mb-6 ${isStaff ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                  
                  {/* 1. Tarjeta (Stripe) */}
                  <Button
                    variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('stripe')}
                    disabled={processing || successRedirecting}
                    className={`flex flex-col items-center py-4 h-auto rounded-xl transition-all ${
                      paymentMethod === 'stripe' ? 'bg-slate-900 text-white shadow-sm' : 'border-gray-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-1 text-current" />
                    <span className="text-xs font-bold">Tarjeta</span>
                  </Button>

                  {/* 2. PayPal */}
                  <Button
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('paypal')}
                    disabled={processing || successRedirecting}
                    className={`flex flex-col items-center py-4 h-auto rounded-xl transition-all ${
                      paymentMethod === 'paypal' ? 'bg-slate-900 text-white shadow-sm' : 'border-gray-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                      alt="PayPal"
                      className="h-6 mb-1"
                    />
                    <span className="text-xs font-bold">PayPal</span>
                  </Button>

                  {/* 3. Mercado Pago */}
                  <Button
                    variant={paymentMethod === 'mercadopago' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('mercadopago')}
                    disabled={processing || successRedirecting}
                    className={`flex flex-col items-center py-4 h-auto rounded-xl transition-all ${
                      paymentMethod === 'mercadopago' ? 'bg-slate-900 text-white shadow-sm' : 'border-gray-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <WalletCards className="h-6 w-6 mb-1 text-current" />
                    <span className="text-xs font-bold text-center">Mercado Pago</span>
                  </Button>

                  {/* 4. Pago Manual / Parcial (Exclusivo Staff & Agentes) */}
                  {isStaff && (
                    <Button
                      variant={paymentMethod === 'manual' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('manual')}
                      disabled={processing || successRedirecting}
                      className={`flex flex-col items-center py-4 h-auto rounded-xl transition-all relative ${
                        paymentMethod === 'manual' 
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200' 
                          : 'border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900'
                      }`}
                    >
                      <span className="absolute -top-2 right-1 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">STAFF</span>
                      <Banknote className="h-6 w-6 mb-1 text-current" />
                      <span className="text-xs font-bold text-center">Manual / Parcial</span>
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                {/* ━━━━ FORMULARIO STRIPE ━━━━ */}
                {paymentMethod === 'stripe' && (
                  <div>
                    {!clientSecret ? (
                      <div className="text-center py-8">
                        <p className="text-slate-600 mb-4 text-sm">
                          Paga el total pendiente de <strong>${pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</strong> con tarjeta de crédito o débito.
                        </p>
                        <Button
                          onClick={handleStripePayment}
                          disabled={processing || successRedirecting}
                          size="lg"
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                        >
                          {processing ? 'Procesando...' : 'Continuar con Tarjeta'}
                        </Button>
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={options}>
                        <StripeCheckoutForm
                          bookingId={booking.id}
                          amount={pendingBalance}
                          currency={booking.currency}
                        />
                      </Elements>
                    )}

                    <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png"
                        alt="Stripe"
                        className="h-4"
                      />
                      <span>Pago seguro</span>
                      <Badge variant="secondary" className="text-[10px]">SSL 256-bit</Badge>
                    </div>
                  </div>
                )}

                {/* ━━━━ FORMULARIO PAYPAL ━━━━ */}
                {paymentMethod === 'paypal' && (
                  <div>
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-4 text-sm">
                        Serás redirigido a PayPal para pagar <strong>${pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</strong> con tu cuenta o tarjeta asociada.
                      </p>
                      <Button
                        onClick={handlePayPalPayment}
                        disabled={processing || successRedirecting}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                      >
                        {processing ? 'Redirigiendo...' : 'Pagar con PayPal'}
                      </Button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400">
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="h-4" />
                      <p>Pago seguro con PayPal</p>
                      <Badge variant="secondary" className="text-[10px]">Protección al comprador</Badge>
                    </div>
                  </div>
                )}

                {/* ━━━━ FORMULARIO MERCADO PAGO ━━━━ */}
                {paymentMethod === 'mercadopago' && (
                  <div>
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-4 text-sm">
                        Paga <strong>${pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</strong> con Mercado Pago, tarjetas de crédito, débito o efectivo en tiendas OXXO.
                      </p>
                      <Button
                        onClick={handleMercadoPagoPayment}
                        disabled={processing || successRedirecting}
                        size="lg"
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold"
                      >
                        {processing ? 'Conectando...' : 'Pagar con Mercado Pago'}
                      </Button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400">
                      <img
                        src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.82/mercadopago/logo__small.png"
                        alt="Mercado Pago"
                        className="h-4"
                      />
                      <p>Pago seguro con Mercado Pago</p>
                      <Badge variant="secondary" className="text-[10px]">Compra Protegida</Badge>
                    </div>
                  </div>
                )}

                {/* ━━━━ FORMULARIO PAGO MANUAL / PARCIAL (STAFF) ━━━━ */}
                {isStaff && paymentMethod === 'manual' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Registro de Cobro en Caja / Manual y Abonos Parciales
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Permite ingresar abonos parciales o liquidaciones totales recibidas fuera de la pasarela digital (Transferencias SPEI, Depósitos en ventanilla, Efectivo o Terminal de punto de venta).
                      </p>
                    </div>

                    {/* Presets Rápidos de Monto */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Accesos rápidos de monto:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={processing || successRedirecting}
                          onClick={() => setManualAmount(pendingBalance.toFixed(2))}
                          className="text-xs font-semibold rounded-xl border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                        >
                          100% Saldo (${pendingBalance.toFixed(2)})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={processing || successRedirecting}
                          onClick={() => setManualAmount(round2(pendingBalance * 0.5).toFixed(2))}
                          className="text-xs font-semibold rounded-xl border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                        >
                          50% Anticipo (${round2(pendingBalance * 0.5).toFixed(2)})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={processing || successRedirecting}
                          onClick={() => setManualAmount(round2(pendingBalance * 0.3).toFixed(2))}
                          className="text-xs font-semibold rounded-xl border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                        >
                          30% Anticipo (${round2(pendingBalance * 0.3).toFixed(2)})
                        </Button>
                      </div>
                    </div>

                    {/* Inputs de Cobro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Monto a abonar *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                          <input 
                            type="number" 
                            className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" 
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            max={pendingBalance}
                            step="0.01"
                            placeholder="0.00"
                            disabled={processing || successRedirecting}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Método recibido *</label>
                        <select 
                          className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                          value={manualMethod}
                          onChange={(e) => setManualMethod(e.target.value as any)}
                          disabled={processing || successRedirecting}
                        >
                          <option value="transfer">🏦 Transferencia Bancaria (SPEI)</option>
                          <option value="deposit">🏢 Depósito en Ventanilla / Practicaja</option>
                          <option value="cash">💵 Efectivo en Oficina</option>
                          <option value="pos">💳 Terminal POS / Tarjeta en Oficina</option>
                        </select>
                      </div>

                    </div>

                    {/* Previsualización del Saldo Restante */}
                    <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>Saldo tras este abono:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        ${remainingAfterPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency} {remainingAfterPayment <= 0.01 ? '🎉 (Liquidado)' : '(Parcial)'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Folio / Clave de Rastreo / Referencia (Opcional)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" 
                        placeholder="Ej. SPEI 872361928, Recibo #405, Autorización #8841"
                        value={manualReference}
                        onChange={(e) => setManualReference(e.target.value)}
                        disabled={processing || successRedirecting}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notas internas de control</label>
                      <textarea 
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" 
                        placeholder="Detalles sobre quién recibió el pago o condiciones acordadas..."
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        rows={2}
                        disabled={processing || successRedirecting}
                      />
                    </div>

                    <Button
                      onClick={handleManualPayment}
                      disabled={processing || successRedirecting || !parseFloat(manualAmount) || parseFloat(manualAmount) <= 0}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-300 flex items-center justify-center gap-2"
                    >
                      {processing || successRedirecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{successRedirecting ? '¡Cobro exitoso! Redirigiendo...' : 'Procesando pago...'}</span>
                        </>
                      ) : (
                        <span>Registrar Cobro de ${currentManualInput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}</span>
                      )}
                    </Button>
                  </div>
                )}

              </Card>

              {/* Info adicional */}
              <div className="mt-6 text-xs text-slate-400 text-center">
                <p>Al completar el pago aceptas nuestros términos y condiciones de servicio.</p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
