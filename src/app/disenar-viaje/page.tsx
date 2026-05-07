"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, Send, Loader2, Bot, User, Sparkles, 
  MapPin, Calendar, Users, Heart, DollarSign, 
  CheckCircle2, Plane, ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface CapturedFields {
  [key: string]: any
}

const STEPS = [
  { key: 'destination', label: 'Destino', icon: MapPin, color: '#3B82F6' },
  { key: 'dates', label: 'Fechas', icon: Calendar, color: '#8B5CF6' },
  { key: 'travelers', label: 'Viajeros', icon: Users, color: '#EC4899' },
  { key: 'experience', label: 'Experiencia', icon: Heart, color: '#EF4444' },
  { key: 'budget', label: 'Presupuesto', icon: DollarSign, color: '#10B981' },
  { key: 'interests', label: 'Intereses', icon: Sparkles, color: '#F59E0B' },
  { key: 'ready', label: '¡Listo!', icon: CheckCircle2, color: '#06B6D4' },
]

export default function TripDesignerPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '✈️ ¡Hola! Soy tu diseñador de viajes personal de AS Operadora.\n\nVamos a crear juntos el viaje perfecto para ti. Solo necesito hacerte algunas preguntas para entender exactamente lo que buscas.\n\n🌍 Empecemos: ¿A dónde te gustaría viajar? Puede ser un país, una ciudad o incluso "no sé, sorpréndeme".',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [capturedFields, setCapturedFields] = useState<CapturedFields>({})
  const [currentStep, setCurrentStep] = useState('destination')
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposalId, setProposalId] = useState<number | null>(null)
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  // Enviar mensaje al chat
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/trip-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          message: currentInput,
          history: messages.slice(-12).map(m => ({
            role: m.role,
            content: m.content
          })),
          captured_fields: capturedFields,
          proposal_id: proposalId
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        // Actualizar estado
        if (data.all_captured_fields) {
          setCapturedFields(data.all_captured_fields)
        }
        if (data.next_step) {
          setCurrentStep(data.next_step)
        }
        if (data.completion_percentage !== undefined) {
          setCompletionPercentage(data.completion_percentage)
        }
        if (data.is_ready) {
          setIsReady(true)
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo. 🔄',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Generar itinerario
  const handleGenerate = async () => {
    setIsGenerating(true)

    const generatingMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '✨ ¡Excelente! Estoy diseñando tu itinerario personalizado...\n\n⏳ Esto puede tomar unos segundos. Estoy analizando destinos, actividades, restaurantes y alojamiento para crear la experiencia perfecta para ti.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, generatingMessage])

    try {
      const response = await fetch('/api/trip-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          captured_fields: capturedFields,
          proposal_id: proposalId
        })
      })

      const data = await response.json()

      if (data.success) {
        setProposalId(data.proposal?.id)
        setGeneratedItinerary(data.itinerary || data.proposal?.ai_itinerary)

        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🎉 ¡Tu itinerario "${data.itinerary?.itinerary_title || capturedFields.destination}" está listo!\n\n📋 Folio: ${data.proposal?.folio || 'Generando...'}\n📅 ${capturedFields.duration_nights || 7} días de aventura\n💰 Costo estimado: $${data.itinerary?.total_estimated_cost?.toLocaleString() || '---'} ${capturedFields.budget_currency || 'MXN'}\n\n👇 Desplázate para ver tu itinerario completo. Un asesor de AS Operadora lo revisará y te contactará con los detalles finales y precios confirmados.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
      } else {
        throw new Error(data.error || 'Error generando itinerario')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Hubo un problema generando tu itinerario: ${error.message}\n\nNo te preocupes, tus datos quedaron guardados. Un asesor de AS Operadora se pondrá en contacto contigo para crear tu itinerario manualmente. 📞`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  // Descargar PDF
  const handleDownloadPDF = async () => {
    if (!proposalId) return
    
    try {
      const response = await fetch('/api/trip-designer/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposalId })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Itinerario-${capturedFields.destination}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="hidden sm:block">
              <span className="text-white/50 mx-2">|</span>
              <span className="text-white/80 font-medium">Diseñador de Viajes IA</span>
              <Sparkles className="w-4 h-4 text-yellow-400 inline ml-2" />
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex
              return (
                <div key={step.key} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      opacity: isCompleted ? 1 : isActive ? 1 : 0.4
                    }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 hidden md:block ${
                      isActive ? 'text-white font-medium' : 'text-white/40'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 lg:w-16 h-0.5 mx-1 transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          {/* Percentage bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-white/40 text-xs mt-1.5 text-right">{completionPercentage}% completado</p>
        </div>

        {/* Chat + Itinerary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <Card className={`${generatedItinerary ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white/5 backdrop-blur-xl border-white/10 flex flex-col overflow-hidden transition-all duration-500`}
            style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AS Travel Designer</h1>
                  <p className="text-sm text-white/70">Diseño de viajes personalizado con IA</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 backdrop-blur-sm border border-white/10 text-white/90'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1.5 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-white/30'
                      }`}>
                        {message.timestamp.toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white/80" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/10">
              {isReady && !generatedItinerary ? (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-500/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Diseñando tu viaje...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      ¡Generar Mi Itinerario con IA! 🚀
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe aquí..."
                    className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-base rounded-xl focus:ring-blue-500"
                    disabled={loading || isGenerating}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || isGenerating}
                    className="h-12 w-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Itinerary Preview (appears after generation) */}
          {generatedItinerary && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden"
                style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
              >
                {/* Itinerary Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
                  <div className="flex items-center gap-3">
                    <Plane className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {generatedItinerary.itinerary_title || `Viaje a ${capturedFields.destination}`}
                      </h2>
                      <p className="text-sm text-white/70">{generatedItinerary.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Days Scroll */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 'calc(100vh - 370px)' }}>
                  {generatedItinerary.days?.map((day: any) => (
                    <Card key={day.day_number} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                          D{day.day_number}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{day.title}</h3>
                          <p className="text-white/40 text-xs">📍 {day.city}</p>
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="space-y-2 ml-5 border-l-2 border-white/10 pl-4">
                        {day.activities?.map((act: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-white/40 text-xs font-mono min-w-[45px]">{act.time}</span>
                            <div>
                              <p className="text-white/80 text-sm">{act.name}</p>
                              <p className="text-white/40 text-xs">{act.description}</p>
                              {act.estimated_cost > 0 && (
                                <span className="text-emerald-400 text-xs">${act.estimated_cost?.toLocaleString()} {act.currency}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Hotel */}
                      {day.hotel?.name && (
                        <div className="mt-3 p-2 bg-purple-500/10 rounded-lg flex items-center gap-2">
                          <span className="text-sm">🏨</span>
                          <div>
                            <p className="text-white/80 text-xs font-medium">{day.hotel.name}</p>
                            <p className="text-purple-300 text-xs">${day.hotel.estimated_cost?.toLocaleString()} {capturedFields.budget_currency || 'MXN'}</p>
                          </div>
                        </div>
                      )}

                      {/* Day cost */}
                      <div className="mt-2 text-right">
                        <span className="text-white/30 text-xs">Estimado del día: </span>
                        <span className="text-emerald-400 text-sm font-semibold">
                          ${day.estimated_day_cost?.toLocaleString()} {capturedFields.budget_currency || 'MXN'}
                        </span>
                      </div>
                    </Card>
                  ))}

                  {/* Total */}
                  <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">💰 Costo Total Estimado</span>
                      <span className="text-emerald-400 text-xl font-bold">
                        ${generatedItinerary.total_estimated_cost?.toLocaleString()} {capturedFields.budget_currency || 'MXN'}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      * Precios estimados. Un asesor de AS Operadora confirmará los precios finales.
                    </p>
                  </Card>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                      onClick={() => {
                        if (proposalId) {
                          // Podría redirigir a una página de detalle o contacto
                          window.open(`https://wa.me/527208156804?text=Hola! Me interesa la propuesta de viaje ${capturedFields.destination}. Folio: AS-TRIP`, '_blank')
                        }
                      }}
                    >
                      💬 Contactar Asesor por WhatsApp
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white/70 hover:text-white h-11">
                      📧 Enviar por Email
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
