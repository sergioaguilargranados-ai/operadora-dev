"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bookmark, MapPin, Info, Volume2, ArrowRightLeft, Mic, Copy, Volume1, Calendar as CalendarIcon, Heart, Loader2 } from "lucide-react"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"

export default function MobileItineraryDayDetail({ params }: { params: { id: string, dayIndex: string } }) {
  const router = useRouter()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<any>(null)
  
  const [dayData, setDayData] = useState<any>(null)

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`/api/itineraries/${params.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          let fetchedItinerary = data.data
          if (typeof fetchedItinerary.days === 'string') {
            try {
              fetchedItinerary.days = JSON.parse(fetchedItinerary.days)
            } catch (e) {
              fetchedItinerary.days = []
            }
          }
          setItinerary(fetchedItinerary)
          const days = fetchedItinerary.days || []
          const index = parseInt(params.dayIndex, 10) || 0
          if (days.length > index) {
            setDayData(days[index])
          } else if (days.length > 0) {
            setDayData(days[0])
          }
        } else {
          // Fallback a MegaTravel si no existe itinerario personalizado
          const resGroup = await fetch(`/api/groups/${params.id}`)
          const dataGroup = await resGroup.json()
          if (dataGroup.success && dataGroup.data) {
            const pkg = dataGroup.data
            const generatedDays = (pkg.itinerary || []).map((dayItem: any, index: number) => ({
              day: dayItem.day || index + 1,
              title: dayItem.title || `Día ${index + 1}`,
              description: dayItem.description || '',
              hero_image: pkg.images?.main || '',
              places: [{ name: pkg.region || 'Ubicación' }]
            }))
            
            setItinerary({
              title: pkg.name,
              destination: pkg.region,
              description: pkg.description,
              days: generatedDays
            })
            
            const index = parseInt(params.dayIndex, 10) || 0
            if (generatedDays.length > index) {
              setDayData(generatedDays[index])
            } else if (generatedDays.length > 0) {
              setDayData(generatedDays[0])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItinerary()
  }, [params.id])

  // Fallbacks si no hay datos en la BD aún para no romper el diseño original en pruebas
  const foods = dayData?.foods || [
    { name: "Moussaka", desc: "Pastel tradicional de berenjena y carne.", img: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=200&q=80" },
    { name: "Gyros", desc: "Carne asada servida en pan pita con verduras y salsa.", img: "https://images.unsplash.com/photo-1593504049359-715569420580?auto=format&fit=crop&w=200&q=80" }
  ]

  const places = dayData?.places || [
    { name: "Oia", desc: "Pueblo famoso por sus casas blancas y atardeceres.", img: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=200&q=80" },
    { name: "Fira", desc: "La vibrante capital de Santorini.", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&w=200&q=80" }
  ]

  const souvenirs = dayData?.souvenirs || [
    { name: "Ojo Turco", desc: "Protección y buena suerte.", img: "https://images.unsplash.com/photo-1607521798319-74d32049e491?auto=format&fit=crop&w=200&q=80" }
  ]

  const phrases = dayData?.phrases || [
    { es: "Hola", local: "Yassas" },
    { es: "Gracias", local: "Efcharistó" }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-28">
      
      {/* Top Navigation */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button onClick={() => router.push(`/mobile/itinerario/${params.id}`)} className="text-gray-900 active:scale-95 p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <MobileLogo
          variant="dark"
          size="md"
          logoUrl={customLogoUrl}
        />
        <button className="text-gray-900 active:scale-95 p-2 -mr-2 rounded-full hover:bg-gray-100">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Background Blobs for Premium Feel */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Hero Image Section */}
      <div className="px-4 pt-4 mb-4">
        <div className="relative w-full h-[320px] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <img 
            src={dayData?.hero_image || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80"} 
            alt={dayData?.title || "Destino"} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex mb-3 border border-white/30">
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Día {dayData?.day || 1} {dayData?.date ? `- ${dayData.date}` : ''}
              </p>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-2 text-white leading-tight">
              {dayData?.title || itinerary?.title || "Destino"}
            </h1>
            <div className="flex items-center gap-1.5 text-blue-200">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">{itinerary?.destination || "Internacional"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción General */}
      <div className="px-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2 font-serif text-lg">Descripción general</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {dayData?.description || itinerary?.description || "Tu destino te espera con increíbles experiencias. Disfruta de la gastronomía, cultura y paisajes únicos que hemos preparado para ti."}
            </p>
          </div>
        </div>
      </div>

      {/* Gastronomía */}
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-4">Gastronomía recomendada</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {foods.map((food, i) => (
            <div key={i} className="w-[140px] flex-shrink-0 flex flex-col">
              <img src={food.img} alt={food.name} className="w-full h-24 object-cover rounded-xl mb-2 shadow-sm" />
              <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{food.name}</h4>
              <p className="text-xs text-gray-500 leading-tight">{food.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Imperdibles */}
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-4">Lugares imperdibles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {places.map((place, i) => (
            <div key={i} className="w-[120px] flex-shrink-0 flex flex-col">
              <img src={place.img} alt={place.name} className="w-full h-[120px] object-cover rounded-2xl mb-2 shadow-sm" />
              <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{place.name}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{place.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Información Práctica */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Información práctica</h2>
        <div className="grid grid-cols-2 gap-3">
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-serif text-lg text-gray-700">€</div>
              <div>
                <p className="text-xs font-bold text-gray-900">Moneda</p>
                <p className="text-[10px] text-gray-500">Euro (€)</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">Se aceptan tarjetas en la mayoría de establecimientos.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Idioma</p>
                <p className="text-[10px] text-gray-500">Griego</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">El inglés es ampliamente hablado en zonas turísticas.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-lg">☀️</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Clima</p>
                <p className="text-[10px] text-gray-500">Mediterráneo</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">Veranos cálidos y secos. Inviernos suaves y agradables.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">GMT</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Zona horaria</p>
                <p className="text-[10px] text-gray-500">GMT +2</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">Misma hora que en la mayoría de países de Europa.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">⚡</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Voltaje</p>
                <p className="text-[10px] text-gray-500">230V / 50Hz</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">Enchufes tipo C y F.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">📞</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Emergencias</p>
                <p className="text-[10px] text-gray-500">112</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">Número único de emergencia en Europa.</p>
          </div>

        </div>
      </div>

      {/* Consejo */}
      <div className="px-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-4">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1">Consejo para tu viaje</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Camina mucho, disfruta sin prisa y mantente hidratado. Lleva siempre contigo agua, protector solar y tus medicamentos personales.
            </p>
          </div>
        </div>
      </div>

      {/* Frases útiles y Compras (Grid mixto) */}
      <div className="px-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Frases */}
        <div>
          <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Frases útiles</h2>
          <div className="space-y-3">
            {phrases.map((phrase, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-bold text-sm text-gray-900">{phrase.es}</p>
                  <p className="text-xs text-gray-500">{phrase.local}</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-black">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Compras */}
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-2">¿Qué comprar?</h2>
        <p className="text-sm text-gray-500 px-4 mb-4">Souvenirs icónicos de Santorini que no te puedes perder.</p>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {souvenirs.map((item, i) => (
            <div key={i} className="w-[120px] flex-shrink-0 flex flex-col">
              <div className="relative bg-[#f6f5f3] h-[120px] rounded-2xl mb-2 flex items-center justify-center p-2">
                <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <h4 className="font-bold text-xs text-gray-900 mb-1 leading-tight">{item.name}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Traductor */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Traductor en tiempo real</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">Español</span>
            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-700">Griego</span>
          </div>
          <div className="p-4 relative">
            <textarea 
              placeholder="Escribe aquí..." 
              className="w-full h-16 text-lg bg-transparent border-none outline-none resize-none placeholder:text-gray-300 font-serif"
            ></textarea>
            <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-2">
              <span className="text-xs text-gray-400">Traducción</span>
              <div className="flex gap-2 text-gray-400">
                <Copy className="w-4 h-4 cursor-pointer hover:text-black" />
                <Volume1 className="w-4 h-4 cursor-pointer hover:text-black" />
                <Mic className="w-5 h-5 ml-2 cursor-pointer text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 flex flex-col z-50">
        <button className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
          <CalendarIcon className="w-5 h-5" />
          Reservar tours para este destino
        </button>
      </div>

    </div>
  )
}
