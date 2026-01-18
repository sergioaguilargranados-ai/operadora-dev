"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AyudaPage() {
  const router = useRouter()

  const faqs = [
    {
      question: "¿Cómo puedo hacer una reserva?",
      answer: "Selecciona tu destino, fechas y número de viajeros. Luego haz clic en Buscar y elige la opción que más te convenga."
    },
    {
      question: "¿Puedo cancelar mi reserva?",
      answer: "Sí, puedes cancelar desde 'Mis Reservas'. Las políticas de cancelación varían según el proveedor."
    },
    {
      question: "¿Cómo funciona AS Club?",
      answer: "AS Club es nuestro programa de lealtad. Acumula puntos en cada reserva y obtén descuentos exclusivos."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, AMEX) y PayPal."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Centro de Ayuda</h1>

        {/* Chatbot destacado */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Chatea con nosotros
              </h2>
              <p className="text-blue-100">
                Nuestro asistente virtual está aquí para ayudarte 24/7
              </p>
            </div>
            <Button
              onClick={() => router.push('/chatbot')}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Iniciar Chat
            </Button>
          </div>
        </Card>

        {/* Contacto */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('tel:7208156804')}>
            <Phone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Teléfono</h3>
            <p className="text-sm text-muted-foreground">720 815 6804</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('mailto:info@asoperadora.com')}>
            <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">info@asoperadora.com</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://wa.me/527208156804', '_blank')}>
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">720 815 6804</p>
          </Card>
        </div>

        {/* FAQs */}
        <h2 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
