"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
  Search,
  FileText,
  Briefcase,
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react'

export default function CentroDeAyudaPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: '¿Cómo puedo hacer una reserva?',
      a: 'Selecciona tu destino, fechas y número de viajeros. Luego haz clic en Buscar y elige la opción que más te convenga.'
    },
    {
      q: '¿Puedo cancelar mi reserva?',
      a: "Sí, puedes cancelar desde 'Mis Reservas'. Las políticas de cancelación varían según el proveedor."
    },
    {
      q: '¿Cómo funciona AS Club?',
      a: 'AS Club es nuestro programa de lealtad. Acumula puntos en cada reserva y obtén descuentos exclusivos.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Centro de Ayuda</h1>
          <p className="text-sm text-slate-500 mt-1">Estamos aquí para ayudarte. Encuentra respuestas rápidas y la información que necesitas para tu viaje.</p>
        </div>

        {/* ━━━━ 3 CARDS ACCESO RÁPIDO (Mockup #10) ━━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Buscar reservación */}
          <Card 
            onClick={() => router.push('/mis-reservas')}
            className="p-5 border-gray-200/80 shadow-2xs rounded-2xl bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Buscar reservación</h3>
                <p className="text-xs text-slate-500 mt-1">Consulta tu itinerario y todos los detalles de tu viaje.</p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 2: Facturación */}
          <Card 
            onClick={() => router.push('/facturacion')}
            className="p-5 border-gray-200/80 shadow-2xs rounded-2xl bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Facturación</h3>
                <p className="text-xs text-slate-500 mt-1">Consulta y/o descarga las facturas de tu compra.</p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 3: Prepara tu viaje */}
          <Card 
            onClick={() => router.push('/ayuda/prepara-tu-viaje')}
            className="p-5 border-gray-200/80 shadow-2xs rounded-2xl bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Prepara tu viaje</h3>
                <p className="text-xs text-slate-500 mt-1">Información útil para tu viaje: requisitos, equipaje, documentos y más.</p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

        </div>

        {/* ━━━━ BANNER NEGRO "CHATEA CON NOSOTROS" (Mockup #10) ━━━━ */}
        <Card className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Chatea con nosotros</h3>
              <p className="text-xs text-slate-400 mt-0.5">Nuestro asistente virtual está aquí para ayudarte 24/7</p>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/comunicacion')}
            className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-6 rounded-xl self-end md:self-auto"
          >
            Iniciar Chat
          </Button>
        </Card>

        {/* ━━━━ SECCIÓN CANAL RECOMENDADO SEGÚN FECHA (Mockup #10) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Te recomendamos el siguiente canal según la fecha de tu viaje</h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mt-3 flex items-center gap-2">
              <span className="font-semibold text-slate-800">Tu viaje comienza hoy (24 jul. 2025).</span>
              <span className="text-slate-500">| Te recomendamos comunicarte por WhatsApp para recibir atención inmediata.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Email */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
                <Mail className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">Email</p>
              <p className="text-slate-400 text-[11px]">Más de 15 días antes de tu viaje</p>
              <p className="font-semibold text-slate-800 pt-1">info@asoperadora.com</p>
            </div>

            {/* WhatsApp (RECOMENDADO) */}
            <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-white space-y-2 text-center relative shadow-xs">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-full">
                Recomendado
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageCircle className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">WhatsApp</p>
              <p className="text-slate-400 text-[11px]">Tu reserva está ocurriendo ahora</p>
              <p className="font-semibold text-slate-800 pt-1">720 815 6804</p>
            </div>

            {/* Teléfono */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
                <Phone className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">Teléfono</p>
              <p className="text-slate-400 text-[11px]">Dentro de los próximos 15 días</p>
              <p className="font-semibold text-slate-800 pt-1">720 815 6804</p>
            </div>

          </div>
        </Card>

        {/* ━━━━ PREGUNTAS FRECUENTES (Mockup #10) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Preguntas Frecuentes</h3>

          <div className="divide-y divide-gray-100 text-xs">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-3.5">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between font-bold text-slate-900 text-left hover:text-blue-600 transition-colors"
                >
                  <span>¿{faq.q.replace('¿', '')}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openFaq === idx && (
                  <p className="text-slate-600 mt-2 pl-1 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

      </main>
    </div>
  )
}
