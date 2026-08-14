import { useState, useEffect } from "react"
import { X, Clock, Users, Utensils, Star, Heart } from "lucide-react"

interface FoodDetailModalProps {
  isOpen: boolean
  onClose: () => void
  food: any
}

export function FoodDetailModal({ isOpen, onClose, food }: FoodDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  if (!isOpen && !mounted) return null

  // Fallbacks if AI didn't generate rich fields
  const difficulty = food?.difficulty || "Media"
  const time = food?.time || "30 min"
  const portions = food?.portions || "2"
  const type = food?.type || "Platillo Típico"
  
  const ingredients = food?.ingredients || [
    "Ingredientes locales tradicionales",
    "Especias de la región",
    "Preparado con pasión local"
  ]
  
  const preparation = food?.preparation || [
    "Visita uno de los restaurantes recomendados.",
    "Pide este platillo tradicional.",
    "¡Disfruta los sabores auténticos!"
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
          <img src={food?.img || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"} alt={food?.name} className="w-full h-full object-cover" />
          
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
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
          
          {/* Floating type badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 shadow-sm uppercase tracking-wider">
              {type}
            </span>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">{food?.name}</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {food?.desc}
          </p>

          {/* Metrics */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-orange-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Star className="w-5 h-5 text-orange-500 mb-1" />
              <span className="text-[10px] uppercase font-bold text-orange-400">Dificultad</span>
              <span className="text-sm font-bold text-orange-900">{difficulty}</span>
            </div>
            <div className="flex-1 bg-blue-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Clock className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-[10px] uppercase font-bold text-blue-400">Tiempo</span>
              <span className="text-sm font-bold text-blue-900">{time}</span>
            </div>
            <div className="flex-1 bg-green-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Users className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-[10px] uppercase font-bold text-green-400">Porciones</span>
              <span className="text-sm font-bold text-green-900">{portions}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Ingredients */}
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-400" />
                Ingredientes
              </h3>
              <ul className="space-y-2">
                {ingredients.map((ing: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></div>
                    <span className="text-sm text-gray-600 leading-relaxed">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation */}
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-3">Preparación</h3>
              <div className="space-y-4">
                {preparation.map((step: string, i: number) => (
                  <div key={i} className="flex gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pro Tip */}
            {food?.tip && (
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-3">
                <Star className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-yellow-900 mb-1">Tip de local</h4>
                  <p className="text-xs text-yellow-800 leading-relaxed">{food.tip}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-10"></div>
        </div>
      </div>
    </>
  )
}
