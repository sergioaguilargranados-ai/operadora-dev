"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
  Plane,
  Briefcase,
  FileText,
  ShieldCheck,
  Package,
  Hotel,
  CreditCard,
  Globe,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'

export default function PreparaTuViajePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('check-in')

  const navItems = [
    { id: 'check-in', label: 'Check-in vuelos', icon: Plane },
    { id: 'equipaje', label: 'Equipaje', icon: Briefcase },
    { id: 'documentacion', label: 'Documentación y visados', icon: FileText },
    { id: 'seguros', label: 'Seguros de viaje', icon: ShieldCheck },
    { id: 'traslados', label: 'Traslados', icon: Package },
    { id: 'hoteles', label: 'Hoteles', icon: Hotel },
    { id: 'pagos', label: 'Formas de pago', icon: CreditCard },
    { id: 'durante-viaje', label: 'Durante tu viaje', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <PageHeader showBackButton={true} backButtonHref="/ayuda" />

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">

        {/* BREADCRUMB */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Inicio</span>
          <span>&gt;</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/ayuda')}>Centro de ayuda</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-700">Prepara tu viaje</span>
        </div>

        {/* HEADER CON DECORACIÓN Y TÍTULO (Mockup #12) */}
        <Card className="overflow-hidden border-gray-200/80 shadow-xs rounded-2xl bg-white">
          <div className="h-48 w-full bg-slate-200 relative">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000" 
              alt="Prepara tu viaje"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-8 text-white">
              <h1 className="text-3xl font-extrabold">Prepara tu viaje</h1>
              <p className="text-sm opacity-90 mt-1">Todo lo que necesitas saber para que tu experiencia sea perfecta desde el inicio.</p>
            </div>
          </div>
        </Card>

        {/* LAYOUT DE 2 COLUMNAS (Mockup #12) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ━━━━ SIDEBAR IZQUIERDO: CONTENIDO (STICKY) ━━━━ */}
          <div className="space-y-4">
            <Card className="p-3 border-gray-200/80 shadow-2xs rounded-2xl bg-white space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Contenido</p>

              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </Card>

            {/* Box Soporte */}
            <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white text-xs space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-slate-700" />
                <p className="font-bold text-slate-900">¿No encuentras lo que buscas?</p>
              </div>
              <p className="text-slate-500">Contáctanos, estamos 24/7 para ayudarte.</p>
            </Card>
          </div>

          {/* ━━━━ PANEL DERECHO: SECCIONES DE CONTENIDO (Mockup #12) ━━━━ */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-8 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-8 text-xs leading-relaxed text-slate-600">

              {/* Check-in vuelos */}
              <section id="check-in" className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-900">
                  <Plane className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Check-in vuelos</h2>
                </div>
                <p>El check-in es el proceso en el cual confirmas tu abordaje dentro de un vuelo.</p>
                <p>La aerolínea con la que compraste tus boletos te dará tu pase de abordar y asignará el lugar que ocuparás en cabina, esto es para lo que sirve el check-in.</p>
                <p>Existen dos modalidades para hacer tu registro: check-in presencial y online.</p>
                <p>En ambos casos requieres llegar con anticipación al aeropuerto y tener la información de tu boleto e identificaciones siempre a la mano.</p>
              </section>

              {/* Equipaje */}
              <section id="equipaje" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <Briefcase className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Equipaje</h2>
                </div>
                <p>Cada aerolínea tiene políticas distintas en cuanto a peso, tamaño y artículos permitidos.</p>
                <p>Te recomendamos revisar las especificaciones de tu boleto y empacar con anticipación para evitar cargos extra y contratiempos en el aeropuerto.</p>
              </section>

              {/* Documentación y visados */}
              <section id="documentacion" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <FileText className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Documentación y visados</h2>
                </div>
                <p>Verifica que tu pasaporte tenga una vigencia mínima de 6 meses posteriores a tu fecha de regreso y consulta si necesitas visa para tu destino.</p>
                <p>Lleva copias digitales y físicas de tus documentos importantes.</p>
              </section>

              {/* Seguros de viaje */}
              <section id="seguros" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <ShieldCheck className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Seguros de viaje</h2>
                </div>
                <p>Contar con un seguro de viaje te da tranquilidad ante imprevistos como enfermedades, accidentes, pérdidas de equipaje o cancelaciones. Te recomendamos contratarlo desde el momento de tu reserva.</p>
              </section>

              {/* Traslados */}
              <section id="traslados" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <Package className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Traslados</h2>
                </div>
                <p>Incluye o reserva tus traslados aeropuerto-hotel-aeropuerto con anticipación. Así aseguras tu llegada y salida sin preocupaciones.</p>
              </section>

              {/* Hoteles */}
              <section id="hoteles" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <Hotel className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Hoteles</h2>
                </div>
                <p>Consulta la información de tu hotel: dirección, horarios de check-in y check-out, servicios incluidos y políticas de cancelación.</p>
                <p>Si tienes solicitudes especiales, contáctanos para apoyarte.</p>
              </section>

              {/* Formas de pago */}
              <section id="pagos" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <CreditCard className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Formas de pago</h2>
                </div>
                <p>Aceptamos tarjetas de crédito/débito y transferencias bancarias. Consulta las opciones disponibles al momento de tu reserva.</p>
              </section>

              {/* Durante tu viaje */}
              <section id="durante-viaje" className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <Globe className="w-6 h-6 text-slate-800" />
                  <h2 className="text-lg font-bold">Durante tu viaje</h2>
                </div>
                <p>Guarda siempre el contacto de emergencia de la aerolínea y de AS Operadora. Respeta las normas locales y disfruta cada momento de tu experiencia.</p>
              </section>

            </Card>

            {/* CTA Pie (Mockup #12) */}
            <Card className="p-6 border-gray-200/80 shadow-xs rounded-2xl bg-white flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">¿Aún tienes dudas?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Nuestro equipo está disponible 24/7 para ayudarte.</p>
              </div>

              <Button 
                onClick={() => router.push('/ayuda')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 rounded-xl"
              >
                Contáctanos
              </Button>
            </Card>
          </div>

        </div>

      </main>
    </div>
  )
}
