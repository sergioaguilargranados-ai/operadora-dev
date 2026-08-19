"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Shield,
  Plane,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileText,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Globe,
  HeartPulse,
  Luggage,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  Info,
  CreditCard,
  Building,
  Check
} from 'lucide-react'

interface Traveler {
  name: string
  doc_type: string
  doc_number: string
  birth_date: string
  email: string
  phone: string
}

interface InsurancePlan {
  plan_code: string
  plan_name: string
  badge?: string
  medical_coverage: string
  schengen_compliant: boolean
  covid_covered: boolean
  luggage_coverage: string
  trip_cancellation: string
  delay_coverage: string
  legal_assistance: string
  pre_existing_emergency: string
  daily_rate_usd: number
  total_price_usd: number
  total_price_mxn: number
  features: string[]
}

const DESTINATION_OPTIONS = [
  { code: 'europa_schengen', name: 'Europa & Espacio Schengen', flag: '🇪🇺', note: 'Cumple requisito 30k EUR' },
  { code: 'usa_canada', name: 'Estados Unidos & Canadá', flag: '🇺🇸', note: 'Alta cobertura recomendada' },
  { code: 'sudamerica_caribe', name: 'Sudamérica & Caribe', flag: '🌴', note: 'Cobertura regional completa' },
  { code: 'asia_oceania', name: 'Asia, Medio Oriente & Oceanía', flag: '⛩️', note: 'Cobertura médica y repatriación' },
  { code: 'cruceros', name: 'Cruceros & Aguas Internacionales', flag: '🚢', note: 'Incluye evacuación marítima' },
  { code: 'nacional', name: 'Nacional (México)', flag: '🇲🇽', note: 'Cobertura en toda la república' },
]

function SegurosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'cotizar' | 'mis-polizas' | 'guia'>(
    (tabParam as any) || 'cotizar'
  )

  // Step wizard in Cotizar tab
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form State
  const [selectedDestination, setSelectedDestination] = useState('europa_schengen')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 28)
    return d.toISOString().split('T')[0]
  })
  const [selectedBookingId, setSelectedBookingId] = useState<string>('')
  const [userBookings, setUserBookings] = useState<any[]>([])
  
  // Travelers State
  const [travelers, setTravelers] = useState<Traveler[]>([
    {
      name: user?.name || '',
      doc_type: 'PASAPORTE',
      doc_number: '',
      birth_date: '',
      email: user?.email || '',
      phone: ''
    }
  ])

  // Emergency Contact
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: 'Familiar'
  })

  // Quotation State
  const [quoting, setQuoting] = useState(false)
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)
  const [quoteDetails, setQuoteDetails] = useState<any>(null)

  // Policies List State
  const [loadingPolicies, setLoadingPolicies] = useState(false)
  const [policies, setPolicies] = useState<any[]>([])
  const [issuing, setIssuing] = useState(false)
  const [issuedPolicy, setIssuedPolicy] = useState<any>(null)

  useEffect(() => {
    if (tabParam && ['cotizar', 'mis-polizas', 'guia'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  // Cargar reservas activas del usuario para auto-completar
  useEffect(() => {
    if (user?.id) {
      fetchUserBookings()
      fetchUserPolicies()
    }
  }, [user?.id])

  const fetchUserBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data && Array.isArray(data.data)) {
          setUserBookings(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  const fetchUserPolicies = async () => {
    try {
      setLoadingPolicies(true)
      const isStaff = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENCY_ADMIN', 'AGENT'].includes(user.role)
      const url = isStaff ? `/api/insurance/policies` : `/api/insurance/policies?userId=${user?.id}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setPolicies(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching policies:', err)
    } finally {
      setLoadingPolicies(false)
    }
  }

  // Manejar selección de reserva existente
  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    if (!bookingId) return

    const found = userBookings.find(b => b.id.toString() === bookingId)
    if (found) {
      const details = typeof found.special_requests === 'string' ? JSON.parse(found.special_requests) : (found.special_requests || {})
      const destName = (found.service_name || details.tour_name || found.destination || '').toLowerCase()

      if (destName.includes('europa') || destName.includes('madrid') || destName.includes('paris') || destName.includes('italia') || destName.includes('grecia')) {
        setSelectedDestination('europa_schengen')
      } else if (destName.includes('estados unidos') || destName.includes('usa') || destName.includes('canada') || destName.includes('disney') || destName.includes('orlando')) {
        setSelectedDestination('usa_canada')
      } else if (destName.includes('peru') || destName.includes('cancun') || destName.includes('colombia') || destName.includes('argentina') || destName.includes('brasil')) {
        setSelectedDestination('sudamerica_caribe')
      } else if (destName.includes('japon') || destName.includes('tokio') || destName.includes('dubai') || destName.includes('egipto') || destName.includes('turquia')) {
        setSelectedDestination('asia_oceania')
      }

      if (found.created_at) {
        const start = new Date(found.created_at)
        start.setDate(start.getDate() + 30)
        const end = new Date(start)
        end.setDate(end.getDate() + 14)
        setStartDate(start.toISOString().split('T')[0])
        setEndDate(end.toISOString().split('T')[0])
      }

      toast({
        title: "Reserva vinculada",
        description: `Datos cargados para: ${found.service_name || 'Viaje seleccionado'}`
      })
    }
  }

  // Cotizar en tiempo real
  const handleCalculateQuote = async () => {
    try {
      setQuoting(true)
      const res = await fetch('/api/insurance/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_region: selectedDestination,
          start_date: startDate,
          end_date: endDate,
          passengers: travelers
        })
      })

      const data = await res.json()
      if (data.success && data.data?.plans) {
        setPlans(data.data.plans)
        setQuoteDetails(data.data)
        // Seleccionar por defecto el plan recomendado (Schengen)
        const rec = data.data.plans.find((p: InsurancePlan) => p.plan_code === 'PLAN_PLUS_SCHENGEN') || data.data.plans[0]
        setSelectedPlan(rec)
        setStep(2)
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo cotizar', variant: 'destructive' })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al conectar con el cotizador', variant: 'destructive' })
    } finally {
      setQuoting(false)
    }
  }

  // Gestión de Pasajeros
  const addTraveler = () => {
    setTravelers([
      ...travelers,
      {
        name: '',
        doc_type: 'PASAPORTE',
        doc_number: '',
        birth_date: '',
        email: '',
        phone: ''
      }
    ])
  }

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers]
    updated[index] = { ...updated[index], [field]: value }
    setTravelers(updated)
  }

  const removeTraveler = (index: number) => {
    if (travelers.length <= 1) return
    const updated = [...travelers]
    updated.splice(index, 1)
    setTravelers(updated)
  }

  // Emitir y Contratar Póliza
  const handleIssuePolicy = async () => {
    if (!selectedPlan) return

    // Validar pasajeros
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i]
      if (!t.name.trim() || !t.doc_number.trim()) {
        toast({
          title: "Datos incompletos",
          description: `Por favor completa el nombre y número de documento del Pasajero #${i + 1}`,
          variant: "destructive"
        })
        setStep(3)
        return
      }
    }

    try {
      setIssuing(true)
      const res = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          booking_id: selectedBookingId ? parseInt(selectedBookingId) : null,
          tenant_id: user?.tenant_id || 1,
          plan_code: selectedPlan.plan_code,
          plan_name: selectedPlan.plan_name,
          destination_region: selectedDestination,
          start_date: startDate,
          end_date: endDate,
          total_days: quoteDetails?.total_days || 1,
          passengers_count: travelers.length,
          total_price: selectedPlan.total_price_usd,
          currency: 'USD',
          insured_travelers: travelers,
          emergency_contact: emergencyContact,
          coverage_details: selectedPlan
        })
      })

      const data = await res.json()
      if (data.success && data.data) {
        setIssuedPolicy(data.data)
        setStep(4)
        fetchUserPolicies()
        toast({
          title: "¡Póliza Emitida Exitosamente!",
          description: `Póliza #${data.data.policy_number} registrada y activada.`
        })
      } else {
        toast({ title: 'Error al emitir', description: data.error || 'No se pudo emitir la póliza', variant: 'destructive' })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al procesar la emisión', variant: 'destructive' })
    } finally {
      setIssuing(false)
    }
  }

  return (
    <PortalIntranetLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Superior Institucional */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-8">
            <ShieldCheck className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> Asistencia Médica Internacional & Schengen
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">
              Seguro de Viajero y Protección Médica 24/7
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              Emisión inmediata de pólizas de asistencia médica con validez internacional. Cumple con los requisitos del <strong>Tratado Schengen</strong> (30,000 EUR sin deducible), repatriación sanitaria, protección ante COVID-19 y extravío de equipaje.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cobertura Schengen Garantizada
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin Deducible ni Copago
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Central 24/7 en Español
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas Principales */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm max-w-xl">
          <button
            onClick={() => {
              setActiveTab('cotizar')
              router.replace('/seguros?tab=cotizar', { scroll: false })
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cotizar'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Cotizar & Contratar
          </button>
          <button
            onClick={() => {
              setActiveTab('mis-polizas')
              router.replace('/seguros?tab=mis-polizas', { scroll: false })
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mis-polizas'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" /> Mis Pólizas ({policies.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('guia')
              router.replace('/seguros?tab=guia', { scroll: false })
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guia'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <PhoneCall className="w-4 h-4" /> Asistencia 24/7
          </button>
        </div>

        {/* CONTENIDO DE LAS PESTAÑAS */}

        {/* TAB 1: COTIZAR Y CONTRATAR */}
        {activeTab === 'cotizar' && (
          <div className="space-y-6">
            
            {/* Step Wizard Indicator */}
            {step < 4 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center max-w-2xl mx-auto">
                  <div 
                    onClick={() => setStep(1)} 
                    className={`flex items-center gap-2 cursor-pointer ${step >= 1 ? 'text-black font-bold' : 'text-gray-400'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-black text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                      {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="text-xs md:text-sm hidden sm:inline">Destino & Fechas</span>
                  </div>

                  <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />

                  <div 
                    onClick={() => plans.length > 0 && setStep(2)} 
                    className={`flex items-center gap-2 ${plans.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed'} ${step >= 2 ? 'text-black font-bold' : 'text-gray-400'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-black text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                      {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-xs md:text-sm hidden sm:inline">Selección de Plan</span>
                  </div>

                  <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />

                  <div 
                    onClick={() => selectedPlan && setStep(3)} 
                    className={`flex items-center gap-2 ${selectedPlan ? 'cursor-pointer' : 'cursor-not-allowed'} ${step >= 3 ? 'text-black font-bold' : 'text-gray-400'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-black text-white' : 'bg-gray-100'}`}>
                      3
                    </div>
                    <span className="text-xs md:text-sm hidden sm:inline">Datos Asegurados</span>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 1: DESTINO Y FECHAS */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Selector de Reserva Existente */}
                  {userBookings.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">¿Tienes una reserva con nosotros?</h3>
                          <p className="text-xs text-gray-600">Selecciona tu viaje para autocompletar destino y fechas en un solo clic.</p>
                        </div>
                      </div>

                      <select
                        value={selectedBookingId}
                        onChange={(e) => handleBookingSelect(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs md:text-sm text-gray-800 outline-none focus:ring-2 focus:ring-black cursor-pointer font-medium"
                      >
                        <option value="">Seleccionar una reserva activa...</option>
                        {userBookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            Reserva #{b.id} - {b.service_name || b.destination || 'Viaje'} ({b.booking_reference})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Destino */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-gray-900">1. Selecciona tu Destino Principal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {DESTINATION_OPTIONS.map((dest) => (
                        <div
                          key={dest.code}
                          onClick={() => setSelectedDestination(dest.code)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            selectedDestination === dest.code
                              ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{dest.flag}</span>
                            <span className="font-bold text-xs md:text-sm leading-tight">{dest.name}</span>
                          </div>
                          <span className={`text-[10px] ${selectedDestination === dest.code ? 'text-gray-300' : 'text-gray-500'}`}>
                            {dest.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fechas de Cobertura */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-gray-900">2. Fechas del Viaje</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Fecha de Salida (Inicio cobertura)
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Fecha de Regreso (Fin cobertura)
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cantidad de Pasajeros */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-gray-900">3. Pasajeros a Asegurar</h3>
                        <p className="text-xs text-gray-500">Agrega todos los viajeros que formarán parte de la misma póliza.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={addTraveler}
                        size="sm"
                        className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Pasajero
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {travelers.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {t.name ? t.name : `Pasajero #${idx + 1}`}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {t.doc_number ? `${t.doc_type}: ${t.doc_number}` : 'Pendiente de ingresar datos'}
                              </p>
                            </div>
                          </div>

                          {travelers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTraveler(idx)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón Cotizar */}
                  <Button
                    onClick={handleCalculateQuote}
                    disabled={quoting}
                    className="w-full bg-black hover:bg-gray-800 text-white rounded-2xl h-14 font-bold text-base shadow-lg transition-all"
                  >
                    {quoting ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculando cotización...</>
                    ) : (
                      <>Cotizar Planes de Asistencia <ChevronRight className="w-5 h-5 ml-1" /></>
                    )}
                  </Button>

                </div>

                {/* Columna Derecha: Beneficios y Leyendas Regulatorias */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" /> Garantías Institucionales
                    </h3>

                    <div className="space-y-4 text-xs text-gray-600">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                          🇪🇺
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-0.5">Cumplimiento Tratado Schengen</h4>
                          <p className="leading-relaxed">Póliza médica oficial válida en todos los consulados y aeropuertos europeos sin deducibles.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
                          🏥
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-0.5">Sin Pagos Directos en Hospital</h4>
                          <p className="leading-relaxed">Coordinamos el pago directo con clínicas y centros médicos para que no desembolses tu dinero.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold">
                          📱
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-0.5">Central 24/7 en tu Móvil</h4>
                          <p className="leading-relaxed">Asistencia médica por WhatsApp en español y llamadas por cobrar desde cualquier país.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de preexistencias */}
                  <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-xs text-gray-600 space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-gray-700" /> Cláusula de Urgencias y Preexistencias
                    </h4>
                    <p className="leading-relaxed text-[11px]">
                      La póliza cubre cualquier urgencia médica sobrevenida durante las fechas contratadas. En caso de preexistencias crónicas, se incluye la primera asistencia y estabilización médica de emergencia.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: SELECCIÓN DE PLAN */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Elige tu Plan de Asistencia</h2>
                    <p className="text-xs text-gray-500">
                      Cotización calculada para <strong>{quoteDetails?.passengers_count} viajero(s)</strong> por <strong>{quoteDetails?.total_days} días</strong>.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Modificar fechas/destino
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.plan_code === plan.plan_code
                    const isRecommended = plan.badge === 'RECOMENDADO'

                    return (
                      <div
                        key={plan.plan_code}
                        onClick={() => setSelectedPlan(plan)}
                        className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-2xl scale-[1.02]'
                            : isRecommended
                            ? 'bg-white border-black ring-2 ring-black shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        {plan.badge && (
                          <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm ${
                            isRecommended ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'
                          }`}>
                            {plan.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-serif font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {plan.plan_name}
                            </h3>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          </div>

                          <div className="my-4">
                            <span className="text-3xl font-bold font-mono">${plan.total_price_usd} USD</span>
                            <span className={`text-xs block mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              (~${plan.total_price_mxn.toLocaleString()} MXN total)
                            </span>
                          </div>

                          <div className={`p-3 rounded-2xl mb-4 text-xs ${isSelected ? 'bg-white/10 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
                            <div className="flex justify-between py-1 border-b border-white/10">
                              <span>Gastos Médicos:</span>
                              <span className="font-bold">{plan.medical_coverage}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/10">
                              <span>Tratado Schengen:</span>
                              <span className="font-bold">{plan.schengen_compliant ? '✅ Cumple' : '⚠️ No requerido'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/10">
                              <span>Equipaje Extraviado:</span>
                              <span className="font-bold">{plan.luggage_coverage}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Cancelación Viaje:</span>
                              <span className="font-bold">{plan.trip_cancellation}</span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-6 text-xs">
                            {plan.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2">
                                <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={isSelected ? 'text-gray-200' : 'text-gray-600'}>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlan(plan)
                            setStep(3)
                          }}
                          className={`w-full rounded-xl font-bold h-12 text-xs shadow-md ${
                            isSelected
                              ? 'bg-white text-black hover:bg-gray-100'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          Seleccionar este Plan
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-bold px-6">
                    Atrás
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!selectedPlan}
                    className="bg-black hover:bg-gray-800 text-white rounded-xl font-bold px-8"
                  >
                    Continuar con Datos de Asegurados <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASO 3: DATOS DE ASEGURADOS Y CONTACTO DE EMERGENCIA */}
            {step === 3 && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Datos de los Asegurados</h2>
                    <p className="text-xs text-gray-500">
                      Ingresa los datos tal como figuran en el pasaporte o identificación oficial para la emisión del certificado.
                    </p>
                  </div>
                  <Badge variant="outline" className="font-bold py-1 px-3">
                    Plan Seleccionado: {selectedPlan?.plan_name} (${selectedPlan?.total_price_usd} USD)
                  </Badge>
                </div>

                {/* Formulario de Pasajeros */}
                <div className="space-y-6">
                  {travelers.map((traveler, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="w-7 h-7 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900">Pasajero #{idx + 1}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Nombre Completo (como en pasaporte) *
                          </label>
                          <input
                            type="text"
                            value={traveler.name}
                            onChange={(e) => updateTraveler(idx, 'name', e.target.value)}
                            placeholder="Nombre(s) y Apellidos"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                              Tipo Documento
                            </label>
                            <select
                              value={traveler.doc_type}
                              onChange={(e) => updateTraveler(idx, 'doc_type', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs md:text-sm font-medium outline-none focus:ring-2 focus:ring-black cursor-pointer"
                            >
                              <option value="PASAPORTE">Pasaporte</option>
                              <option value="INE_DNI">INE / DNI</option>
                              <option value="CURP">CURP</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                              Número de Documento *
                            </label>
                            <input
                              type="text"
                              value={traveler.doc_number}
                              onChange={(e) => updateTraveler(idx, 'doc_number', e.target.value)}
                              placeholder="G12345678"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium uppercase"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Fecha de Nacimiento *
                          </label>
                          <input
                            type="date"
                            value={traveler.birth_date}
                            onChange={(e) => updateTraveler(idx, 'birth_date', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Correo Electrónico (para voucher)
                          </label>
                          <input
                            type="email"
                            value={traveler.email}
                            onChange={(e) => updateTraveler(idx, 'email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contacto de Emergencia */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                    <h3 className="font-serif font-bold text-lg text-gray-900">Contacto de Emergencia en País de Origen</h3>
                  </div>
                  <p className="text-xs text-gray-500">Persona a contactar en caso de una urgencia médica grave en el extranjero.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={emergencyContact.name}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                        placeholder="Nombre de contacto"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Teléfono con WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Parentesco
                      </label>
                      <select
                        value={emergencyContact.relation}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        <option value="Familiar">Familiar directo (Padre/Madre/Hijo)</option>
                        <option value="Cónyuge">Cónyuge / Pareja</option>
                        <option value="Hermano(a)">Hermano(a)</option>
                        <option value="Amigo">Amigo / Colega</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Resumen de Emisión y Leyenda de Aceptación */}
                <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                      <p className="text-xs text-gray-400">Total de la Póliza ({travelers.length} asegurados)</p>
                      <p className="text-3xl font-bold font-mono text-white">${selectedPlan?.total_price_usd} USD</p>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold">
                      🛡️ Activación Inmediata
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Al emitir esta póliza, certificas que los datos ingresados son verídicos. La póliza entra en vigencia a las 00:00 hrs del día de salida y su certificado oficial será emitido instantáneamente en PDF y enviado por correo.
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-gray-400 hover:text-white">
                      Atrás
                    </Button>
                    <Button
                      onClick={handleIssuePolicy}
                      disabled={issuing}
                      className="bg-white text-black hover:bg-gray-100 rounded-2xl h-14 px-8 font-bold text-base shadow-lg"
                    >
                      {issuing ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Emitiendo póliza oficial...</>
                      ) : (
                        <>Emitir y Contratar Póliza <ShieldCheck className="w-5 h-5 ml-1 text-emerald-600" /></>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {/* PASO 4: CONFIRMACIÓN Y VOUCHER EMITIDO */}
            {step === 4 && issuedPolicy && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Póliza Emitida y Activa
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mt-3 mb-1">
                    ¡Tu viaje está asegurado!
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    Folio Internacional: <strong>{issuedPolicy.policy_number}</strong>
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-left text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Plan de Asistencia:</span>
                    <span className="font-bold text-gray-900">{issuedPolicy.plan_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Vigencia:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(issuedPolicy.start_date).toLocaleDateString()} al {new Date(issuedPolicy.end_date).toLocaleDateString()} ({issuedPolicy.total_days} días)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Asegurados ({issuedPolicy.insured_travelers?.length || 1}):</span>
                    <span className="font-bold text-gray-900">
                      {issuedPolicy.insured_travelers?.map((t: any) => t.name).join(', ') || 'Titular'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Monto Total:</span>
                    <span className="font-bold text-black text-sm">${issuedPolicy.total_price} {issuedPolicy.currency}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Certificado PDF",
                        description: `Generando certificado oficial para póliza ${issuedPolicy.policy_number}`
                      })
                    }}
                    className="bg-black hover:bg-gray-800 text-white rounded-xl h-12 px-6 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Descargar Certificado PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab('mis-polizas')
                      setStep(1)
                    }}
                    className="rounded-xl h-12 px-6 font-bold text-xs"
                  >
                    Ver en Mis Pólizas
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MIS PÓLIZAS */}
        {activeTab === 'mis-polizas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Mis Pólizas Contratadas</h2>
                <p className="text-xs text-gray-500">Consulta tus certificados de asistencia y coberturas vigentes.</p>
              </div>
              <Button
                onClick={() => {
                  setActiveTab('cotizar')
                  setStep(1)
                }}
                className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Cotizar Nueva Póliza
              </Button>
            </div>

            {loadingPolicies ? (
              <div className="py-16 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-black" />
                Cargando pólizas registradas...
              </div>
            ) : policies.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-gray-900">Aún no tienes pólizas de seguro</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Protege tu salud y equipaje en tu próximo viaje con nuestras coberturas internacionales certificadas.
                </p>
                <Button
                  onClick={() => {
                    setActiveTab('cotizar')
                    setStep(1)
                  }}
                  className="bg-black text-white hover:bg-gray-800 rounded-xl font-bold text-xs"
                >
                  Cotizar mi Seguro de Viajero
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {policies.map((pol) => {
                  const isFinished = new Date(pol.end_date) < new Date()
                  const isCurrent = !isFinished && new Date(pol.start_date) <= new Date()

                  return (
                    <div
                      key={pol.id}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                              Póliza Internacional
                            </span>
                            <h3 className="font-mono font-bold text-base text-gray-900">{pol.policy_number}</h3>
                          </div>
                          <Badge className={`text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : isFinished
                              ? 'bg-gray-100 text-gray-500 border-gray-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {isCurrent ? '🟢 Vigente' : isFinished ? 'Concluida' : '🟡 Próximo Viaje'}
                          </Badge>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span className="font-bold text-gray-900">{pol.plan_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Destino:</span>
                            <span className="font-bold text-gray-900 uppercase">{pol.destination_region?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Vigencia:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(pol.start_date).toLocaleDateString()} - {new Date(pol.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pasajeros:</span>
                            <span className="font-bold text-gray-900">{pol.passengers_count} asegurado(s)</span>
                          </div>
                        </div>

                        {/* Lista de asegurados */}
                        {Array.isArray(pol.insured_travelers) && pol.insured_travelers.length > 0 && (
                          <div className="text-xs space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asegurados Titulares:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {pol.insured_travelers.map((tr: any, tIdx: number) => (
                                <span key={tIdx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                                  {tr.name} ({tr.doc_type || 'Doc'}: {tr.doc_number})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-black">${pol.total_price} {pol.currency}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Descarga de Certificado",
                                description: `Descargando voucher oficial de la póliza ${pol.policy_number}`
                              })
                            }}
                            className="rounded-xl text-xs font-bold"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> Voucher PDF
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              window.open(`https://wa.me/525512345678?text=${encodeURIComponent(`Hola, requiero asistencia médica para mi póliza ${pol.policy_number}`)}`, '_blank')
                            }}
                            className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold"
                          >
                            <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Asistencia 24/7
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GUÍA DE ASISTENCIA & COBERTURAS */}
        {activeTab === 'guia' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  Central de Asistencia al Viajero 24 Horas
                </h2>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-3xl">
                  Si te encuentras de viaje y presentas una urgencia médica, extravío de equipaje o requieres asesoría legal, comunícate inmediatamente con nuestra Central de Emergencias antes de realizar cualquier gasto directo.
                </p>
              </div>

              {/* Canales de Contacto Directos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <MessageCircle className="w-5 h-5" /> WhatsApp Emergencias
                  </div>
                  <p className="text-xs text-gray-600">Atención médica prioritaria y recepción de recetas/diagnósticos.</p>
                  <a
                    href="https://wa.me/525512345678"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block font-mono font-bold text-sm text-emerald-700 hover:underline pt-1"
                  >
                    +52 55 1234 5678
                  </a>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                    <PhoneCall className="w-5 h-5" /> Central Europa & Mundo
                  </div>
                  <p className="text-xs text-gray-600">Llamada por cobrar o directa internacional 24/7.</p>
                  <span className="block font-mono font-bold text-sm text-blue-700 pt-1">
                    +34 91 123 4567
                  </span>
                </div>

                <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                    <PhoneCall className="w-5 h-5" /> Central América & EE.UU.
                  </div>
                  <p className="text-xs text-gray-600">Línea gratuita Toll-Free desde Estados Unidos.</p>
                  <span className="block font-mono font-bold text-sm text-purple-700 pt-1">
                    +1 800 123 4567
                  </span>
                </div>
              </div>

              {/* Protocolo de Acción Paso a Paso */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-serif font-bold text-lg text-gray-900">¿Qué hacer en caso de una urgencia?</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">1</span>
                    <h4 className="font-bold text-gray-900">Contactar la Central</h4>
                    <p className="text-gray-600 leading-relaxed">Indica tu número de póliza, nombre y el síntoma o problema presentado.</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">2</span>
                    <h4 className="font-bold text-gray-900">Asignación Médica</h4>
                    <p className="text-gray-600 leading-relaxed">El médico coordinador te enviará un doctor a tu hotel o te referirá a la clínica más cercana.</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">3</span>
                    <h4 className="font-bold text-gray-900">Atención sin Pago</h4>
                    <p className="text-gray-600 leading-relaxed">La central cubre directamente las consultas, exámenes y medicamentos prescritos.</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">4</span>
                    <h4 className="font-bold text-gray-900">Seguimiento Médico</h4>
                    <p className="text-gray-600 leading-relaxed">Monitoreamos tu evolución clínica hasta tu completa recuperación o regreso a casa.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalIntranetLayout>
  )
}

export default function SegurosViajeroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          Cargando Seguros de Viajero...
        </div>
      </div>
    }>
      <SegurosContent />
    </Suspense>
  )
}
