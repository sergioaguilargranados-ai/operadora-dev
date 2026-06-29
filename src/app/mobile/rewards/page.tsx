"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Gift, Compass, Trophy, MapPin, Play, Droplets, Sun, Briefcase, Medal, Footprints, Target, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileRewardsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pasos' | 'invita'>('pasos')
  
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* Hero Header */}
      <div className="relative h-[280px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80" 
          alt="Airplane wing over clouds" 
          className="w-full h-full object-cover"
        />
        
        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center text-white">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src="/logo-white.png" alt="AS" className="h-8 invert" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/icon-192x192.png'; }} />
          <button className="p-2 -mr-2">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-16 left-6 right-6 z-20 text-white">
          <h1 className="text-4xl font-serif font-bold mb-3 drop-shadow-md">Rewards AS</h1>
          <p className="text-sm text-gray-100 max-w-[250px] leading-relaxed drop-shadow-md">
            Viaja, explora y gana beneficios exclusivos en cada experiencia.
          </p>
        </div>
      </div>

      {/* Main Card Overlay */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-30 shadow-sm border-t border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'pasos' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('pasos')}
          >
            <Footprints className="w-4 h-4" /> Pasos y Exploración
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'invita' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('invita')}
          >
            <UsersIcon className="w-4 h-4" /> Invita y Gana
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN (In Desktop) / TOP COLUMN (In Mobile) */}
          <div className="space-y-6">
            
            {/* Progress Section */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Tu progreso</h2>
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" className="stroke-gray-100" strokeWidth="8" fill="transparent" />
                    <circle cx="40" cy="40" r="36" className="stroke-green-600" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset="203.4" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-green-600">1,000</span>
                    <span className="text-sm font-medium text-gray-500">/ 10,000 pasos</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1 mb-1">10% completado</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Sigue caminando para desbloquear nuevas recompensas.</p>
                </div>
              </div>
              <Button className="w-full bg-black hover:bg-gray-900 text-white font-medium rounded-xl h-12">
                Ver recompensas
              </Button>
            </div>

            <hr className="border-gray-100" />

            {/* Camina y gana */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-1">Camina y gana</h2>
              <p className="text-xs text-gray-500 mb-4 leading-tight">Durante tu viaje acumula pasos para desbloquear beneficios exclusivos.</p>
              
              <div className="space-y-4">
                <RewardItem steps="2,500" reward="5% de descuento en actividades" active={false} />
                <RewardItem steps="5,000" reward="Souvenir digital exclusivo" active={false} />
                <RewardItem steps="7,500" reward="Cupón de $50 MXN" active={false} />
                <RewardItem steps="10,000" reward="Cupón de $100 MXN" active={false} />
                <RewardItem steps="25,000" reward="Beneficio especial AS" active={false} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Estadísticas */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Estadísticas del viaje</h2>
              <div className="space-y-3">
                <StatItem icon={<Footprints className="w-4 h-4"/>} label="Pasos de hoy" value="1,000" />
                <StatItem icon={<Compass className="w-4 h-4"/>} label="Pasos acumulados" value="8,450" />
                <StatItem icon={<MapPin className="w-4 h-4"/>} label="Ciudades visitadas" value="3" />
                <StatItem icon={<Map className="w-4 h-4"/>} label="Monumentos explorados" value="7" />
                <StatItem icon={<Briefcase className="w-4 h-4"/>} label="Museos visitados" value="2" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Insignias */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Insignias obtenidas</h2>
              <div className="space-y-4">
                <BadgeItem icon="🏅" title="Explorador" desc="Has recorrido más de 5,000 pasos." active={true} />
                <BadgeItem icon="🥈" title="Aventurero" desc="Visitaste 3 puntos de interés." active={false} />
                <BadgeItem icon="🔒" title="Maestro Viajero" desc="Completa 25,000 pasos." active={false} />
                <BadgeItem icon="🔒" title="Leyenda AS" desc="Completa todos los retos del viaje." active={false} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (In Desktop) / BOTTOM COLUMN (In Mobile) */}
          <div className="space-y-6 mt-2 md:mt-0">
            
            {/* Suma más pasos */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Suma más pasos</h2>
              <div className="grid grid-cols-1 gap-3 mb-4">
                <PlaceItem img="https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80" name="Museo Arqueológico" steps="+500" />
                <PlaceItem img="https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80" name="Plaza Principal" steps="+800" />
                <PlaceItem img="https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80" name="Monumento Histórico" steps="+1,200" />
                <PlaceItem img="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=150&q=80" name="Mercado Local" steps="+600" />
              </div>
              <Button className="w-full bg-black hover:bg-gray-900 text-white font-medium rounded-xl h-12">
                Ver en mapa
              </Button>
            </div>

            <hr className="border-gray-100" />

            {/* Recomendaciones */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Recomendaciones para tu viaje</h2>
              <div className="space-y-4">
                <RecItem icon={<Droplets className="w-6 h-6 text-green-600"/>} bg="bg-green-50" title="Hidrátate" desc="Bebe suficiente agua durante todo el día." />
                <RecItem icon={<Sun className="w-6 h-6 text-yellow-600"/>} bg="bg-yellow-50" title="Protege tu piel" desc="Usa protector solar y reaplica cada 3 horas." />
                <RecItem icon={<Briefcase className="w-6 h-6 text-green-600"/>} bg="bg-green-50" title="Lleva tus medicamentos" desc="No olvides tus medicamentos personales y receta médica." />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Qué empacar */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-1">¿Qué empacar?</h2>
              <p className="text-xs text-gray-500 mb-4">Lista básica para tu viaje</p>
              <div className="space-y-2 mb-6">
                {['Pasaporte / Identificación', 'Tarjetas de crédito / Efectivo', 'Ropa y calzado cómodo', 'Protector solar', 'Gafas de sol', 'Cargador de celular', 'Cepillo y pasta dental', 'Medicamentos personales', 'Cámara o celular', 'Botella de agua reutilizable'].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                    <span className="text-[11px] font-medium text-gray-700">{item}</span>
                  </label>
                ))}
              </div>

              <div className="bg-green-50 rounded-2xl p-3 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Cómo empacar</h4>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Mira el video y viaja preparado como un experto.</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function UsersIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function RewardItem({ steps, reward, active }: { steps: string, reward: string, active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full border border-green-200 flex items-center justify-center flex-shrink-0 ${active ? 'bg-green-600 text-white' : 'bg-transparent text-green-600'}`}>
        <Gift className="w-4 h-4" />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-900">{steps} pasos</span>
        <span className="text-[10px] text-gray-500">{reward}</span>
      </div>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-700">{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-900">{value}</span>
    </div>
  )
}

function BadgeItem({ icon, title, desc, active }: { icon: string, title: string, desc: string, active: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${active ? 'bg-orange-100' : 'bg-gray-100 opacity-50 grayscale'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function PlaceItem({ img, name, steps }: { img: string, name: string, steps: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm leading-tight">{name}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{steps} pasos estimados</p>
      </div>
      <MapPin className="w-4 h-4 text-gray-400" />
    </div>
  )
}

function RecItem({ icon, bg, title, desc }: { icon: React.ReactNode, bg: string, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-1`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{desc}</p>
      </div>
    </div>
  )
}
