"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { ChallengesRouteMapModal } from "@/components/mobile/ChallengesRouteMapModal"
import { ChevronLeft, Bell, Gift, Compass, MapPin, Play, Droplets, Sun, Briefcase, Footprints, Video, Image as ImageIcon, Copy, Share2, Trophy, Users, CheckCircle2, Link as LinkIcon, Loader2, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function MobileRewardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { logoUrl, logoDarkUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoDarkUrl || logoMobileUrl || logoUrl || null
  const [activeTab, setActiveTab] = useState<'pasos' | 'invita'>('pasos')
  
  const [rewardsSteps, setRewardsSteps] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const [referralData, setReferralData] = useState<any>(null)
  const [rankingData, setRankingData] = useState<any[]>([])
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [copied, setCopied] = useState(false)

  const [challenges, setChallenges] = useState<any[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false)
  
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loadingRecs, setLoadingRecs] = useState(true)

  const [plannedChallenges, setPlannedChallenges] = useState<string[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [checkingGPS, setCheckingGPS] = useState<string | null>(null)

  // Demo: animar la barra de progreso al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(user?.total_steps || 14500)
    }, 500)
    return () => clearTimeout(timer)
  }, [user?.total_steps])

  // Fetch Dynamic Challenges
  useEffect(() => {
    if (!user) return
    const fetchChallenges = async () => {
      try {
        setLoadingChallenges(true)
        const token = localStorage.getItem('token') || ''
        const res = await fetch('/api/rewards/challenges', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data.length > 0) {
            setChallenges(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching challenges:', error)
      } finally {
        setLoadingChallenges(false)
      }
    }

    const fetchRecommendations = async () => {
      try {
        setLoadingRecs(true)
        const token = localStorage.getItem('token') || ''
        const res = await fetch('/api/rewards/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setRecommendations(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoadingRecs(false)
      }
    }

    fetchChallenges()
    fetchRecommendations()

    // Cargar estados locales
    if (typeof window !== 'undefined') {
      try {
        const planned = JSON.parse(localStorage.getItem('plannedChallenges') || '[]')
        const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
        setPlannedChallenges(planned)
        setCompletedChallenges(completed)
      } catch (e) {}
    }
  }, [user])
  
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const dPhi = (lat2-lat1) * Math.PI/180;
    const dLambda = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLambda/2) * Math.sin(dLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
  }

  const handlePlanChallenge = (ch: any) => {
    const newPlanned = [...plannedChallenges, ch.id]
    setPlannedChallenges(newPlanned)
    localStorage.setItem('plannedChallenges', JSON.stringify(newPlanned))
    toast({ title: "Reto planeado", description: `Has seleccionado visitar: ${ch.name}` })
  }

  const handleCheckIn = (ch: any) => {
    setCheckingGPS(ch.id)
    
    if (!navigator.geolocation) {
      toast({ title: "GPS no disponible", description: "Tu dispositivo no soporta geolocalización.", variant: "destructive" })
      setCheckingGPS(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const dist = calculateDistance(latitude, longitude, ch.lat, ch.lng)
        
        // Simulamos un delay para que se vea la validación
        await new Promise(r => setTimeout(r, 1500))

        // MODO DEMO: Permitimos check-in independientemente de la distancia real 
        // para facilitar las pruebas, pero normalmente aquí haríamos:
        // if (dist > 500) { toast({ title: "Estás muy lejos", variant: "destructive" }); return }
        
        const newCompleted = [...completedChallenges, ch.id]
        setCompletedChallenges(newCompleted)
        localStorage.setItem('completedChallenges', JSON.stringify(newCompleted))
        
        await handleAddSteps(ch.points, ch.name)
        
        toast({ title: "¡Check-in Exitoso!", description: `Has ganado ${ch.points} pasos.` })
        setCheckingGPS(null)
      },
      (err) => {
        console.warn("GPS error:", err)
        // Fallback for Demo: Si el usuario rechaza permisos, igual lo logramos en demo
        setTimeout(async () => {
          const newCompleted = [...completedChallenges, ch.id]
          setCompletedChallenges(newCompleted)
          localStorage.setItem('completedChallenges', JSON.stringify(newCompleted))
          await handleAddSteps(ch.points, ch.name)
          toast({ title: "¡Check-in Simulado!", description: `Demo: Has ganado ${ch.points} pasos.` })
          setCheckingGPS(null)
        }, 1500)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }
  
  const MAX_STEPS = 10000 // Meta principal configurable

  useEffect(() => {
    if (user) {
      loadData()
      loadReferralData()
    }
  }, [user])

  const loadReferralData = async () => {
    try {
      setLoadingReferrals(true)
      const res = await fetch(`/api/mobile/referrals?user_id=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        setReferralData(data.data.user)
        setRankingData(data.data.ranking)
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoadingReferrals(false)
    }
  }

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
          <MobileLogo
            variant="light"
            size="md"
            logoUrl={customLogoUrl}
          />
          <button onClick={() => router.push('/mobile/notificaciones')} className="text-white hover:text-gray-300 p-2 -mr-2">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-16 left-6 right-6 z-20 text-white text-center">
          <h1 className="text-4xl font-serif font-bold mb-3 drop-shadow-md">Rewards AS</h1>
          <p className="text-sm text-gray-100 max-w-[250px] mx-auto leading-relaxed drop-shadow-md">
            Viaja, explora y gana beneficios exclusivos en cada experiencia.
          </p>
        </div>
      </div>

      {/* Main Card Overlay */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-30 shadow-sm border-t border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2 mt-2">
          <button 
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-[3px] transition-colors ${activeTab === 'pasos' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('pasos')}
          >
            <Footprints className="w-5 h-5" /> AS Retos
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-[3px] transition-colors ${activeTab === 'invita' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('invita')}
          >
            <Users className="w-5 h-5" /> AS Rewards
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'pasos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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
                  <Button className="w-full bg-black text-white font-bold rounded-xl h-12 shadow-sm hover:bg-gray-800">
                    Ver recompensas
                  </Button>
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

                {/* Estadísticas del viaje */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-6">
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Estadísticas del viaje</h2>
                  <div className="space-y-3">
                    <StatRow icon={<Footprints className="w-4 h-4 text-white" />} iconBg="bg-black" label="Pasos de hoy" value="1,000" />
                    <StatRow icon={<Footprints className="w-4 h-4 text-white" />} iconBg="bg-black" label="Pasos acumulados" value={progress.toLocaleString()} />
                    <StatRow icon={<MapPin className="w-4 h-4 text-white" />} iconBg="bg-black" label="Ciudades visitadas" value="3" />
                    <StatRow icon={<Compass className="w-4 h-4 text-white" />} iconBg="bg-black" label="Monumentos explorados" value={completedChallenges.length.toString()} />
                    <StatRow icon={<ImageIcon className="w-4 h-4 text-white" />} iconBg="bg-black" label="Museos visitados" value="2" />
                  </div>
                </div>

                {/* Insignias obtenidas */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-6">
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Insignias obtenidas</h2>
                  <div className="space-y-4">
                    <BadgeItem icon="🥉" bg="bg-amber-100 text-amber-700" title="Explorador" desc="Has recorrido más de 5,000 pasos." locked={progress < 5000} />
                    <BadgeItem icon="🥈" bg="bg-slate-200 text-slate-700" title="Aventurero" desc="Visitaste 3 puntos de interés." locked={completedChallenges.length < 3} />
                    <BadgeItem icon="🔒" bg="bg-gray-100 text-gray-500" title="Maestro Viajero" desc="Completa 25,000 pasos." locked={progress < 25000} />
                    <BadgeItem icon="🔒" bg="bg-gray-100 text-gray-500" title="Leyenda AS" desc="Completa todos los retos del viaje." locked={challenges.length === 0 || completedChallenges.length < challenges.length} />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6 mt-2 md:mt-0">
                
                {/* Suma más pasos (Interactividad) */}
                <div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Retos de tu próximo viaje</h2>
                  <p className="text-xs text-gray-500 mb-4">Rutas recomendadas basadas en tu itinerario.</p>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {loadingChallenges ? (
                      <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-20 bg-gray-100 rounded-2xl w-full"></div>
                        ))}
                      </div>
                    ) : (
                      challenges.map((challenge, idx) => {
                        const isPlanned = plannedChallenges.includes(challenge.id)
                        const isCompleted = completedChallenges.includes(challenge.id)
                        return (
                          <PlaceItem 
                            key={challenge.id || idx}
                            ch={challenge}
                            planned={isPlanned}
                            completed={isCompleted}
                            checking={checkingGPS === challenge.id}
                            onPlan={() => handlePlanChallenge(challenge)}
                            onCheckIn={() => handleCheckIn(challenge)}
                          />
                        )
                      })
                    )}
                  </div>
                  <Button 
                    onClick={() => setIsRouteMapOpen(true)}
                    className="w-full bg-black text-white font-bold rounded-xl h-12 mt-2 shadow-sm hover:bg-gray-800"
                  >
                    Ver en mapa
                  </Button>
                </div>

                <hr className="border-gray-100" />

                {/* Recomendaciones (Clima) */}
                <div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Recomendaciones para tu viaje</h2>
                  <div className="space-y-4">
                    {loadingRecs ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
                        <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
                      </div>
                    ) : Array.isArray(recommendations?.weatherTips) ? (
                      recommendations.weatherTips.map((tip: any, idx: number) => (
                        <RecItem 
                          key={idx} 
                          icon={idx % 2 === 0 ? <Sun className="w-6 h-6 text-yellow-600"/> : <Droplets className="w-6 h-6 text-blue-600"/>} 
                          bg={idx % 2 === 0 ? "bg-yellow-50" : "bg-blue-50"} 
                          title={tip.title} 
                          desc={tip.desc} 
                        />
                      ))
                    ) : (
                      <>
                        <RecItem icon={<Droplets className="w-6 h-6 text-green-600"/>} bg="bg-green-50" title="Hidrátate" desc="Bebe suficiente agua durante todo el día." />
                        <RecItem icon={<Sun className="w-6 h-6 text-yellow-600"/>} bg="bg-yellow-50" title="Protege tu piel" desc="Usa protector solar y reaplica cada 3 horas." />
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Medicamentos */}
                <div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Botiquín de Viaje Sugerido</h2>
                  <div className="space-y-4">
                    {loadingRecs ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
                        <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
                      </div>
                    ) : Array.isArray(recommendations?.medications) ? (
                      recommendations.medications.map((med: any, idx: number) => (
                        <RecItem 
                          key={idx} 
                          icon={<Pill className="w-6 h-6 text-red-600"/>} 
                          bg="bg-red-50" 
                          title={med.title} 
                          desc={med.desc} 
                        />
                      ))
                    ) : (
                      <RecItem icon={<Pill className="w-6 h-6 text-red-600"/>} bg="bg-red-50" title="Botiquín básico" desc="Paracetamol, curitas y medicina personal." />
                    )}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Tips para empacar */}
                <div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Tips para empacar</h2>
                  <div className="space-y-4">
                    <div className="w-full rounded-2xl overflow-hidden shadow-sm aspect-video bg-gray-100 relative">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/5Wn3L7Yf7d4?si=r7kFzB2-D3R4Jp9w" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="w-full rounded-2xl overflow-hidden shadow-sm aspect-video bg-gray-100 relative">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/L1Y5X14bM1w?si=7Y0GqF3tH6a5pL8r" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'invita' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                
                {/* Tu progreso de invitaciones */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Tu progreso de invitaciones</h3>
                  
                  {/* Progress Bar (Visual) */}
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-black rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((referralData?.referrals_count || 0) / 30) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-bold text-black leading-none">
                      {referralData?.referrals_count || 0} / 30
                    </p>
                    <p className="text-sm font-bold text-gray-700">viajeros invitados</p>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">Invita más viajeros y acerca tu próximo viaje a ser gratis.</p>
                </div>

                {/* Tus beneficios */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Tus beneficios</h3>
                  <div className="space-y-6">
                    <BenefitTier icon="🥉" title="Explorador AS" req="5 viajeros invitados" desc="Bono de $1,000 MXN para tu próximo viaje." />
                    <BenefitTier icon="🥈" title="Embajador AS" req="10 viajeros invitados" desc="Bono de $2,500 MXN para tu próximo viaje." />
                    <BenefitTier icon="🥇" title="Viajero Elite" req="15 viajeros invitados" desc="50% de descuento en tu siguiente viaje." />
                    <BenefitTier icon="💎" title="Leyenda AS" req="30 viajeros invitados" desc="Viaje gratuito.*" note="*Aplican términos y condiciones." />
                  </div>
                </div>

                {/* Invita más viajeros */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Invita más viajeros</h3>
                  
                  <div className="border border-gray-200 rounded-xl p-3 mb-4 text-center bg-gray-50/50">
                    <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Tu código de invitación</p>
                    <p className="font-mono font-bold text-xl tracking-wider text-black">
                      {referralData?.referral_code || 'CARGANDO...'}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(referralData?.referral_code || '');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-bold h-12 shadow-sm mb-6"
                  >
                    {copied ? '¡Código copiado!' : 'Compartir invitación'}
                  </Button>

                  <div className="flex justify-around items-center">
                    <SocialButton color="bg-green-500" name="WhatsApp" icon={<WhatsAppIcon />} />
                    <SocialButton color="bg-blue-600" name="Facebook" icon={<FacebookIcon />} />
                    <SocialButton color="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" name="Instagram" icon={<InstagramIcon />} />
                    <SocialButton color="bg-gray-500" name="Copiar enlace" icon={<LinkIcon className="w-5 h-5 text-white" />} onClick={() => {
                      navigator.clipboard.writeText(`https://asoperadora.com/registro?ref=${referralData?.referral_code || ''}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }} />
                  </div>
                </div>

                {/* Beneficios que puedes obtener */}
                <div className="bg-white rounded-3xl p-2 pt-6 mb-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 text-center">Beneficios que puedes obtener</h3>
                  <div className="grid grid-cols-3 gap-y-6 gap-x-2 text-center">
                    <MiniBenefit icon={<Gift className="w-6 h-6 text-green-600" />} color="bg-green-50" text="Descuentos en viajes" />
                    <MiniBenefit icon={<Briefcase className="w-6 h-6 text-blue-600" />} color="bg-blue-50" text="Tours gratuitos" />
                    <MiniBenefit icon={<Footprints className="w-6 h-6 text-purple-600" />} color="bg-purple-50" text="Créditos para futuras reservas" />
                    <MiniBenefit icon={<Sun className="w-6 h-6 text-yellow-600" />} color="bg-yellow-50" text="Upgrade de habitación" />
                    <MiniBenefit icon={<Compass className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50" text="Viajes gratuitos" />
                    <MiniBenefit icon={<Trophy className="w-6 h-6 text-orange-600" />} color="bg-orange-50" text="Beneficios exclusivos AS" />
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                
                {/* Invitados confirmados */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Invitados confirmados</h3>
                  
                  <div className="space-y-4 mb-6">
                    {/* Hardcoded checkmarks mimicking prototype */}
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">María González</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Carlos López</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Ana Hernández</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">José Ramírez</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Laura Torres</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Miguel Ruiz</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Fernanda Díaz</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm font-semibold text-black">Arturo Castillo</span></div>
                  </div>
                  
                  <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-bold h-12">
                    Ver todos
                  </Button>
                </div>

                {/* Ranking AS */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Ranking AS</h3>
                  
                  <div className="space-y-4 mb-6">
                    {loadingReferrals ? (
                      <p className="text-sm text-gray-500">Cargando ranking...</p>
                    ) : rankingData.length === 0 ? (
                      <p className="text-sm text-gray-500">Aún no hay ranking disponible.</p>
                    ) : (
                      rankingData.map((rankUser, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${idx === 0 ? 'bg-yellow-400 text-white shadow-sm' : idx === 1 ? 'bg-gray-300 text-gray-700 shadow-sm' : idx === 2 ? 'bg-amber-600 text-white shadow-sm' : 'bg-black text-white'}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-gray-900 text-sm">{rankUser.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-black">{rankUser.referral_count} invitados</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-bold h-12">
                    Ver clasificación completa
                  </Button>
                </div>
                
                {/* Banner Promo */}
                <div className="rounded-3xl overflow-hidden relative h-48 shadow-md">
                  <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" alt="Viaje gratis" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 max-w-[200px] leading-tight">Tu próximo viaje podría ser gratis</h3>
                    <p className="text-[10px] text-gray-200 mb-4 max-w-[220px]">Invita viajeros, acumula beneficios y alcanza el nivel Leyenda AS para obtener un viaje sin costo.</p>
                    <Button className="bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-xs h-10 px-6 w-fit">
                      Invitar amigos
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BenefitTier({ icon, title, req, desc, note }: { icon: string, title: string, req: string, desc: string, note?: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-full flex items-center justify-center text-xl shadow-inner border border-white">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-serif font-bold text-gray-900">{title}</h4>
          <span className="text-[10px] text-gray-500 font-semibold">{req}</span>
        </div>
        <p className="text-xs font-bold text-gray-900 mt-1">{desc}</p>
        {note && <p className="text-[9px] text-gray-400 mt-1">{note}</p>}
      </div>
    </div>
  )
}

function SocialButton({ color, name, icon, onClick }: { color: string, name: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center shadow-sm hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-gray-600">{name}</span>
    </div>
  )
}

function MiniBenefit({ icon, color, text }: { icon: React.ReactNode, color: string, text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-[10px] font-semibold text-gray-700 max-w-[80px] leading-tight text-center">{text}</p>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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

function PlaceItem({ ch, planned, completed, checking, onPlan, onCheckIn }: any) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${completed ? 'bg-green-50/50 border-green-200' : planned ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
        <img src={ch.img} alt={ch.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{ch.name}</h4>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-medium">A {Math.floor(Math.random()*5 + 1)} km</span>
        </div>
        <p className="text-[10px] font-bold text-green-600">+{ch.points} pasos estimados</p>
      </div>
      <div className="flex flex-col gap-2 justify-center">
        {completed ? (
          <div className="flex flex-col items-center justify-center text-green-600 h-9 px-3 rounded-xl text-[10px] font-bold border border-green-200 bg-green-50 shadow-sm">
            <CheckCircle2 className="w-4 h-4 mb-0.5" /> Logrado
          </div>
        ) : planned ? (
          <Button size="sm" disabled={checking} onClick={onCheckIn} className="bg-black hover:bg-gray-800 text-white h-9 rounded-xl px-3 text-xs font-bold shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MapPin className="w-3 h-3" /> Check-in</>}
          </Button>
        ) : (
          <Button size="sm" onClick={onPlan} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-9 rounded-xl px-4 text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Planear
          </Button>
        )}
      </div>
    </div>
  )
}

function StatRow({ icon, iconBg, label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}

function BadgeItem({ icon, bg, title, desc, locked }: any) {
  return (
    <div className={`flex items-center gap-4 ${locked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${bg}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{title}</h4>
        <p className="text-[11px] font-medium text-gray-500 leading-tight">{desc}</p>
      </div>
    </div>
  )
}

function RecItem({ icon, bg, title, desc }: { icon: React.ReactNode, bg: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{String(title || '')}</h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{String(desc || '')}</p>
      </div>
    </div>
  )
}
