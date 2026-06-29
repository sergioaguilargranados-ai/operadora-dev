"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ChevronLeft, Bell, Gift, Compass, MapPin, Play, Droplets, Sun, Briefcase, Footprints, Video, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileRewardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pasos' | 'invita'>('pasos')
  
  const [rewardsSteps, setRewardsSteps] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const MAX_STEPS = 10000 // Meta principal configurable

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const tId = user?.tenant_id || 1
      const [resRewards, resProgress] = await Promise.all([
        fetch(`/api/mobile/rewards?tenant_id=${tId}`),
        fetch(`/api/mobile/rewards/progress?user_id=${user?.id}&tenant_id=${tId}`)
      ])
      
      const dataRewards = await resRewards.json()
      const dataProgress = await resProgress.json()

      if (dataRewards.success) {
        setRewardsSteps(dataRewards.data || [])
      }

      if (dataProgress.success) {
        setProgress(dataProgress.data.current_steps || 0)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSteps = async (points: number, locationName: string) => {
    if (!user) return
    try {
      // Optimistic update
      setProgress(prev => prev + points)
      
      const res = await fetch('/api/mobile/rewards/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          tenant_id: user.tenant_id,
          add_steps: points,
          location_name: locationName
        })
      })
      const data = await res.json()
      if (data.success) {
        setProgress(data.data.current_steps)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate percentage
  const percentage = Math.min((progress / MAX_STEPS) * 100, 100)
  const circleOffset = 226 - (226 * percentage) / 100

  // Distribución dinámica de pasos según la cantidad de premios
  const getStepThreshold = (index: number) => {
    const stepSize = Math.floor(MAX_STEPS / (rewardsSteps.length || 1))
    return stepSize * (index + 1)
  }

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
          <img src="/logo-white.png" alt="AS" className="h-8 invert" onError={(e) => { 
            const target = e.currentTarget;
            if (!target.src.includes('/icons/icon-192x192.png')) {
              target.src = '/icons/icon-192x192.png'; 
            } else {
              target.style.display = 'none';
            }
          }} />
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
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Progress Section */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Tu progreso</h2>
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" className="stroke-gray-100" strokeWidth="8" fill="transparent" />
                    <circle cx="40" cy="40" r="36" className="stroke-green-600 transition-all duration-1000 ease-out" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={circleOffset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-green-600">{progress.toLocaleString()}</span>
                    <span className="text-sm font-medium text-gray-500">/ {MAX_STEPS.toLocaleString()} pasos</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1 mb-1">{Math.floor(percentage)}% completado</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Sigue caminando para desbloquear nuevas recompensas.</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Camina y gana (CMS Rewards) */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-1">Camina y gana</h2>
              <p className="text-xs text-gray-500 mb-4 leading-tight">Beneficios configurados desde el CMS.</p>
              
              {loading ? (
                <p className="text-sm text-gray-400 py-4">Cargando recompensas...</p>
              ) : (
                <div className="space-y-4">
                  {rewardsSteps.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No hay recompensas configuradas.</p>
                  ) : (
                    rewardsSteps.map((step, idx) => {
                      const reqSteps = getStepThreshold(idx)
                      const isActive = progress >= reqSteps
                      return (
                        <div key={idx} className="space-y-2">
                          <RewardItem 
                            steps={`${reqSteps.toLocaleString()} pasos`} 
                            reward={step.title} 
                            desc={step.description}
                            active={isActive} 
                          />
                          {/* Media Assets from CMS */}
                          {(step.image_url || step.video_url) && (
                            <div className="ml-11 flex gap-2 overflow-x-auto pb-1">
                              {step.image_url && (
                                <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border">
                                  <img src={step.image_url} alt="Premio" className="w-full h-full object-cover" />
                                </div>
                              )}
                              {step.video_url && (
                                <div className="h-16 w-24 flex-shrink-0 bg-gray-900 rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
                                  <Play className="w-5 h-5 text-white/80 z-10" fill="white" />
                                  <video src={step.video_url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
            <hr className="border-gray-100" />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 mt-2 md:mt-0">
            
            {/* Suma más pasos (Interactividad) */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Suma más pasos (Demo Interactivo)</h2>
              <p className="text-xs text-gray-500 mb-4">Haz clic para enviar el progreso a la base de datos.</p>
              <div className="grid grid-cols-1 gap-3 mb-4">
                <PlaceItem img="https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80" name="Museo Arqueológico" points={500} onAdd={() => handleAddSteps(500, 'Museo Arqueológico')} />
                <PlaceItem img="https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80" name="Plaza Principal" points={800} onAdd={() => handleAddSteps(800, 'Plaza Principal')} />
                <PlaceItem img="https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80" name="Monumento Histórico" points={1200} onAdd={() => handleAddSteps(1200, 'Monumento Histórico')} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Recomendaciones */}
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Recomendaciones para tu viaje</h2>
              <div className="space-y-4">
                <RecItem icon={<Droplets className="w-6 h-6 text-green-600"/>} bg="bg-green-50" title="Hidrátate" desc="Bebe suficiente agua durante todo el día." />
                <RecItem icon={<Sun className="w-6 h-6 text-yellow-600"/>} bg="bg-yellow-50" title="Protege tu piel" desc="Usa protector solar y reaplica cada 3 horas." />
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

function RewardItem({ steps, reward, desc, active }: { steps: string, reward: string, desc?: string, active: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full border border-green-200 flex items-center justify-center flex-shrink-0 mt-1 ${active ? 'bg-green-600 text-white' : 'bg-transparent text-green-600'}`}>
        <Gift className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs font-bold text-gray-900">{steps}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {active ? 'Desbloqueado' : 'Bloqueado'}
          </span>
        </div>
        <p className="text-sm font-bold text-black leading-tight">{reward}</p>
        {desc && <p className="text-[10px] text-gray-500 mt-1 leading-tight">{desc}</p>}
      </div>
    </div>
  )
}

function PlaceItem({ img, name, points, onAdd }: { img: string, name: string, points: number, onAdd: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm leading-tight">{name}</h4>
        <p className="text-[10px] font-semibold text-green-600 mt-0.5">+{points} pasos</p>
      </div>
      <Button size="sm" onClick={onAdd} className="bg-black hover:bg-gray-800 text-white h-8 rounded-xl px-4 text-xs font-bold active:scale-95 transition-transform">
        Sumar
      </Button>
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
