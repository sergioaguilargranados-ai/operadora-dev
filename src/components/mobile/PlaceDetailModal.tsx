import { useState, useEffect } from "react"
import { X, MapPin, Clock, Navigation, DollarSign, Heart } from "lucide-react"
import { ItineraryRouteMap } from "./ItineraryRouteMap"

interface PlaceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  place: any
}

export function PlaceDetailModal({ isOpen, onClose, place }: PlaceDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  if (!isOpen && !mounted) return null

  // Fallbacks if AI didn't generate rich fields
  const bestTime = place?.best_time || "Por la mañana"
  const transport = place?.transport || "A pie"
  const budget = place?.budget || "Económico"
  
  const activities = place?.activities || [
    "Recorre el lugar con calma",
    "Toma fotografías panorámicas",
    "Visita los puntos de interés cercanos",
    "Disfruta de la cultura local"
  ]
  
  // Si no hay gallery, usamos la imagen principal repetida o imágenes dummy
  const gallery = place?.gallery || [
    place?.img || "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1520625692631-f13c6d70ff99?auto=format&fit=crop&w=400&q=80"
  ]

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-3xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} flex flex-col max-h-[90vh]`}
      >
        {/* Header Image */}
        <div className="relative h-64 shrink-0 rounded-t-3xl overflow-hidden">
          <img src={place?.img || gallery[0]} alt={place?.name} className="w-full h-full object-cover" />
          
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent z-10">
            <button onClick={onClose} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe">
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {place?.type || "Punto de interés"}
            </span>
          </div>

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">{place?.name}</h2>
          
          <div className="flex items-center gap-1 text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{place?.location || place?.name}</span>
          </div>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {place?.desc}
          </p>

          {/* Metrics */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-gray-100">
              <Clock className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Mejor Hora</span>
              <span className="text-xs font-bold text-gray-900">{bestTime}</span>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-gray-100">
              <Navigation className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Llegar</span>
              <span className="text-xs font-bold text-gray-900">{transport}</span>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-gray-100">
              <DollarSign className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Presupuesto</span>
              <span className="text-xs font-bold text-gray-900">{budget}</span>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* Qué hacer */}
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">¿Qué hacer aquí?</h3>
              <div className="space-y-3">
                {activities.map((act: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Galería */}
            {gallery.length > 0 && (
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Galería</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <img src={gallery[0]} className="w-full h-40 object-cover rounded-2xl" />
                  </div>
                  {gallery.slice(1, 3).map((img: string, i: number) => (
                    <img key={i} src={img} className="w-full h-24 object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Mapa Preview */}
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Ubicación</h3>
              <div className="h-48 rounded-2xl overflow-hidden border border-gray-100">
                <ItineraryRouteMap cities={[place?.location || place?.name]} />
              </div>
            </div>
            
          </div>
          
          <div className="h-10"></div>
        </div>
      </div>
    </>
  )
}
