"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bookmark, MapPin, Info, Volume2, ArrowRightLeft, Mic, Copy, Volume1, Calendar as CalendarIcon, Heart, Loader2 } from "lucide-react"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { WishlistHeart } from "@/components/mobile/WishlistHeart"
import { CurrencyCalculator } from "@/components/mobile/CurrencyCalculator"
import { WeatherForecast } from "@/components/mobile/WeatherForecast"
import { useToast } from "@/hooks/use-toast"
import { FoodDetailModal } from "@/components/mobile/FoodDetailModal"
import { PlaceDetailModal } from "@/components/mobile/PlaceDetailModal"

export default function MobileItineraryDayDetail({ params }: { params: { id: string, dayIndex: string } }) {
  const router = useRouter()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<any>(null)
  const [isDaySaved, setIsDaySaved] = useState(false)
  const [isSavingDay, setIsSavingDay] = useState(false)
  
  const [dayData, setDayData] = useState<any>(null)
  
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  // Map from name/symbol to code
  const getCurrencyCode = (name: string, symbol: string) => {
    const n = name.toLowerCase();
    if (n.includes('euro')) return 'EUR';
    if (n.includes('dólar') || n.includes('dolar')) {
      if (n.includes('canad')) return 'CAD';
      if (n.includes('australi')) return 'AUD';
      return 'USD';
    }
    if (n.includes('libra')) return 'GBP';
    if (n.includes('franco')) return 'CHF';
    if (n.includes('yen')) return 'JPY';
    if (n.includes('real')) return 'BRL';
    if (n.includes('peso')) {
      if (n.includes('argentin')) return 'ARS';
      if (n.includes('chilen')) return 'CLP';
      if (n.includes('colombian')) return 'COP';
      if (n.includes('uruguay')) return 'UYU';
      return 'MXN';
    }
    if (n.includes('sol')) return 'PEN';
    if (symbol === '€') return 'EUR';
    if (symbol === '£') return 'GBP';
    if (symbol === '¥') return 'JPY';
    return 'USD'; // default fallback
  }

  // Determinar idioma del destino para TTS (ej. en-US, fr-FR)
  const localLanguage = dayData?.practical_info?.language?.name || 'Idioma local'
  const langMapTTS: Record<string, string> = {
    'inglés': 'en-US',
    'ingles': 'en-US',
    'francés': 'fr-FR',
    'frances': 'fr-FR',
    'italiano': 'it-IT',
    'alemán': 'de-DE',
    'aleman': 'de-DE',
    'portugués': 'pt-PT',
    'portugues': 'pt-PT',
    'japonés': 'ja-JP',
    'japones': 'ja-JP',
    'español': 'es-ES',
    'espanol': 'es-ES',
    'español (castellano)': 'es-ES'
  }
  const ttsLang = langMapTTS[localLanguage.toLowerCase()] || 'en-US'

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('')
      return
    }
    const timer = setTimeout(async () => {
      setIsTranslating(true)
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            sourceLang: 'es',
            targetLang: localLanguage
          })
        })
        const data = await res.json()
        if (data.success) {
          setTranslatedText(data.translation)
        }
      } catch (err) {
        console.error('Translation error:', err)
      } finally {
        setIsTranslating(false)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [sourceText, localLanguage])

  const handleTTS = (text: string, lang: string) => {
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
  }

  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    alert('Traducción copiada al portapapeles')
  }

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('El dictado por voz no está soportado en este navegador.')
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSourceText(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.start()
  }

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

          // Reparar si el Día 1 guardado es en realidad la descripción de MegaTravel
          if (fetchedItinerary.days && fetchedItinerary.days.length > 0) {
            const first = fetchedItinerary.days[0]
            const second = fetchedItinerary.days[1]
            const fTitle = (first.title || '').toUpperCase()
            const sTitle = (second?.title || '').toUpperCase()
            
            if (
              (fTitle.includes('DÍAS') && fTitle.includes('NOCHES')) ||
              (fTitle.length > 50 && !fTitle.startsWith('DÍA') && !fTitle.startsWith('DIA')) ||
              (sTitle.includes('DÍA 1') || sTitle.includes('DIA 1'))
            ) {
              fetchedItinerary.days.shift()
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
            
            if (generatedDays.length > 0) {
              const first = generatedDays[0]
              const second = generatedDays[1]
              const fTitle = (first.title || '').toUpperCase()
              const sTitle = (second?.title || '').toUpperCase()
              
              if (
                (fTitle.includes('DÍAS') && fTitle.includes('NOCHES')) ||
                (fTitle.length > 50 && !fTitle.startsWith('DÍA') && !fTitle.startsWith('DIA')) ||
                (sTitle.includes('DÍA 1') || sTitle.includes('DIA 1'))
              ) {
                generatedDays.shift()
              }
            }

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

  // Datos dinámicos del destino (generados por IA y almacenados en days JSONB)
  const foods = dayData?.foods || []
  const places = dayData?.places || []
  const souvenirs = dayData?.souvenirs || []
  const phrases = dayData?.phrases || []
  const practicalInfo = dayData?.practical_info || null
  const travelTips = dayData?.travel_tips || []
  const getCityName = () => {
    if (dayData?.places?.[0]?.name) {
      const match = dayData.places[0].name.match(/\(([^,]+),/)
      if (match && match[1]) return match[1].trim()
      return dayData.places[0].name
    }
    if (dayData?.title && dayData.title.length < 40) return dayData.title
    return itinerary?.destination || 'tu destino'
  }
  const destinationName = getCityName()
  
  const currencyCode = getCurrencyCode(dayData?.practical_info?.currency?.name || '', dayData?.practical_info?.currency?.symbol || '')

  const toggleDayWishlist = async () => {
    if (!user?.id) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar en tu wishlist", variant: "destructive" })
      return
    }

    setIsSavingDay(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          item_name: dayData?.title || `Día ${parseInt(params.dayIndex) + 1}`,
          item_desc: dayData?.description || dayData?.desc || "Detalle del día",
          item_img: dayData?.hero_image || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=400&q=80",
          city: dayData?.places?.[0]?.name || "Destino",
          itinerary_id: parseInt(params.id),
          day_index: parseInt(params.dayIndex)
        })
      })
      const data = await res.json()
      
      if (data.success) {
        const nowSaved = data.action === 'added'
        setIsDaySaved(nowSaved)
        toast({ 
          title: nowSaved ? "Guardado" : "Eliminado", 
          description: nowSaved ? "Día añadido a tu wishlist." : "Día removido de tu wishlist." 
        })
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err)
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    } finally {
      setIsSavingDay(false)
    }
  }

  if (loading || !dayData) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24 relative">
      
      {/* Absolute top navbar over the image */}
      <div className="absolute top-0 w-full px-4 pt-8 flex items-center justify-between z-30">
        <button onClick={() => router.push(`/mobile/itinerario/${params.id}`)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/30">
          <ChevronLeft className="w-6 h-6" />
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
                Día {parseInt(params.dayIndex) + 1} {dayData?.date ? `- ${dayData.date}` : ''}
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
              {dayData?.general_description || dayData?.description || itinerary?.description || "Tu destino te espera con increíbles experiencias. Disfruta de la gastronomía, cultura y paisajes únicos que hemos preparado para ti."}
            </p>
          </div>
        </div>
      </div>

      {/* Gastronomía */}
      {foods.length > 0 && (
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-4">Gastronomía recomendada</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {foods.map((food, i) => (
            <div key={i} className="w-[140px] flex-shrink-0 flex flex-col cursor-pointer active:scale-95 transition-transform relative" onClick={() => setSelectedFood(food)}>
              <div className="relative mb-2">
                <img src={food.img} alt={food.name} className="w-full h-24 object-cover rounded-xl shadow-sm" />
                <WishlistHeart 
                  item={{...food, category: 'food'}} 
                  city={destinationName} 
                  itineraryId={parseInt(params.id)} 
                  dayIndex={parseInt(params.dayIndex)} 
                />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{food.name}</h4>
              <p className="text-xs text-gray-500 leading-tight">{food.desc}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Imperdibles */}
      {places.length > 0 && (
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-4">Lugares imperdibles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {places.map((place, i) => (
            <div key={i} className="w-[120px] flex-shrink-0 flex flex-col cursor-pointer active:scale-95 transition-transform relative" onClick={() => setSelectedPlace(place)}>
              <div className="relative mb-2">
                <img src={place.img} alt={place.name} className="w-full h-[120px] object-cover rounded-2xl shadow-sm" />
                <WishlistHeart 
                  item={{...place, category: 'place'}} 
                  city={destinationName} 
                  itineraryId={parseInt(params.id)} 
                  dayIndex={parseInt(params.dayIndex)} 
                />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{place.name}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{place.desc}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Información Práctica — Dinámico desde dayData.practical_info */}
      {practicalInfo && (
      <div className="px-4 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Información práctica</h2>
        <div className="columns-2 gap-3 space-y-3">
          
          {practicalInfo.currency && (
          <div 
            className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col active:scale-95 transition-transform cursor-pointer"
            onClick={() => setIsCalculatorOpen(true)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-serif text-lg text-gray-700">{practicalInfo.currency.symbol || '💰'}</div>
              <div>
                <p className="text-xs font-bold text-gray-900">Moneda</p>
                <p className="text-[10px] text-gray-500">{practicalInfo.currency.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">{practicalInfo.currency.tip}</p>
            <div className="mt-2 text-[10px] text-blue-500 font-bold flex justify-end">Calcular</div>
          </div>
          )}

          {practicalInfo?.climate && (
          <div className="break-inside-avoid">
            <WeatherForecast city={itinerary?.destination || "Madrid, España"} date={dayData.date} />
          </div>
          )}

          {practicalInfo.language && (
          <div className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Idioma</p>
                <p className="text-[10px] text-gray-500">{practicalInfo.language.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">{practicalInfo.language.tip}</p>
          </div>
          )}

          {practicalInfo?.timezone && (
          <div className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">GMT</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Zona horaria</p>
                <p className="text-[10px] text-gray-500">{practicalInfo.timezone?.zone || "Zona horaria local"}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">{practicalInfo.timezone?.tip}</p>
          </div>
          )}

          {practicalInfo?.voltage && (
          <div className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">⚡</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Voltaje</p>
                <p className="text-[10px] text-gray-500">{practicalInfo.voltage?.spec}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">{practicalInfo.voltage?.plug_type ? `Enchufes tipo ${practicalInfo.voltage.plug_type}. ` : ''}{practicalInfo.voltage?.tip}</p>
          </div>
          )}

          {practicalInfo?.emergency && (
          <div className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                <span className="text-sm font-bold">📞</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Emergencias</p>
                <p className="text-[10px] text-gray-500">{practicalInfo.emergency?.number}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">{practicalInfo.emergency?.tip}</p>
          </div>
          )}

        </div>
      </div>
      )}

      {/* Clima de 7 días (WeatherForecast) */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Pronóstico del clima</h2>
        <WeatherForecast city={destinationName} date={dayData?.date || new Date().toISOString().split('T')[0]} />
      </div>

      {/* Consejos de viaje — Dinámicos */}
      {travelTips.length > 0 && (
      <div className="px-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-4">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1">Consejo para tu viaje</h3>
            <ul className="text-xs text-blue-800 leading-relaxed space-y-1">
              {travelTips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      )}

      {/* Frases útiles */}
      {phrases.length > 0 && (
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
                  {phrase.pronunciation && (
                    <p className="text-[10px] text-gray-400 italic">{phrase.pronunciation}</p>
                  )}
                </div>
                <button 
                  className="p-2 text-gray-400 hover:text-black" 
                  onClick={() => handleTTS(phrase.local, ttsLang)}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
      )}

      {/* Compras */}
      {souvenirs.length > 0 && (
      <div className="mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 px-4 mb-2">¿Qué comprar?</h2>
        <p className="text-sm text-gray-500 px-4 mb-4">Souvenirs icónicos de {destinationName} que no te puedes perder.</p>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-none">
          {souvenirs.map((item, i) => (
            <div key={i} className="w-[120px] flex-shrink-0 flex flex-col">
              <div className="relative bg-[#f6f5f3] h-[120px] rounded-2xl mb-2 flex items-center justify-center p-2">
                <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                <WishlistHeart 
                  item={{...item, category: 'souvenir'}} 
                  city={destinationName} 
                  itineraryId={parseInt(params.id)} 
                  dayIndex={parseInt(params.dayIndex)} 
                />
              </div>
              <h4 className="font-bold text-xs text-gray-900 mb-1 leading-tight">{item.name}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Traductor */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Traductor en tiempo real</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">Español</span>
            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-700">{localLanguage}</span>
          </div>
          <div className="p-4 relative">
            <textarea 
              placeholder="Escribe aquí..." 
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-16 text-lg bg-transparent border-none outline-none resize-none placeholder:text-gray-300 font-serif"
            ></textarea>
            
            <div className="border-t border-gray-100 mt-2 pt-3">
              <div className="min-h-[3rem] text-lg font-serif text-gray-900">
                {isTranslating ? (
                  <span className="flex items-center text-sm text-gray-400 gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Traduciendo...</span>
                ) : (
                  translatedText || <span className="text-gray-300">Traducción</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2">
              <span className="text-xs text-gray-400"></span>
              <div className="flex gap-2 text-gray-400">
                <Copy className="w-4 h-4 cursor-pointer hover:text-black" onClick={() => handleCopy(translatedText)} />
                <Volume1 className="w-4 h-4 cursor-pointer hover:text-black" onClick={() => handleTTS(translatedText, ttsLang)} />
                <button 
                  className={`ml-2 p-2 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'}`}
                  onClick={handleMicClick}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <CurrencyCalculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
        targetCurrency={practicalInfo?.currency ? getCurrencyCode(practicalInfo.currency.name, practicalInfo.currency.symbol) : 'USD'}
      />

      <FoodDetailModal 
        isOpen={!!selectedFood} 
        onClose={() => setSelectedFood(null)} 
        food={selectedFood} 
      />

      <PlaceDetailModal 
        isOpen={!!selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
        place={selectedPlace} 
      />
    </div>
  )
}
