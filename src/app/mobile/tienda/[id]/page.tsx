"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck, ChevronRight, Minus, Plus } from "lucide-react"

export default function MobileProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  // Datos mockeados del producto
  const product = {
    id: params.id,
    name: "Maleta de cabina AS Original",
    price: "$2,199",
    originalPrice: "$2,899",
    discount: "24% OFF",
    rating: 4.8,
    reviews: 124,
    images: [
      "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1581553680321-4fffae59fdd9?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Ligera, ultra resistente y diseñada con las medidas perfectas para viajar en cabina sin documentar. Material de policarbonato, 4 ruedas dobles giratorias 360° y candado TSA integrado.",
    features: [
      "Policarbonato 100% resistente a impactos",
      "Candado de combinación TSA",
      "Ruedas multidireccionales silenciosas",
      "Capacidad expansible de 15%"
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-24">
      
      {/* Top Navigation */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="text-gray-900 active:scale-95 transition-transform p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button className="text-gray-900 active:scale-95 transition-transform p-2 rounded-full hover:bg-gray-100">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={() => router.push('/mobile/tienda/carrito')} className="text-gray-900 active:scale-95 transition-transform p-2 rounded-full hover:bg-gray-100 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white w-full aspect-square relative flex items-center justify-center p-8 border-b border-gray-100">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply"
        />
        <button className="absolute bottom-4 right-4 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
          1 / 2
        </button>
      </div>

      {/* Product Info */}
      <div className="bg-white p-5 mb-2">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nuevo | {product.reviews} vendidos</p>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
        </div>
        
        <h1 className="text-lg text-gray-900 font-medium leading-tight mb-2">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{product.rating} ({product.reviews})</span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 line-through mb-1">{product.originalPrice}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-serif font-bold text-gray-900">{product.price}</span>
            <span className="text-sm font-bold text-green-600">{product.discount}</span>
          </div>
        </div>

        <div className="text-sm font-bold text-green-600 mb-1">Pagá en hasta 12 meses sin intereses</div>
        <a href="#" className="text-sm text-blue-500 hover:underline">Ver medios de pago</a>
      </div>

      {/* Shipping Info */}
      <div className="bg-white p-5 mb-2 flex items-start gap-4">
        <Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
        <div>
          <p className="text-green-600 font-bold text-sm mb-1">Llega gratis mañana</p>
          <p className="text-xs text-gray-500 mb-2">Comprando dentro de las próximas 4 hrs</p>
          <a href="#" className="text-sm text-blue-500 hover:underline">Enviar a Avenida Insurgentes Sur 100</a>
        </div>
      </div>

      {/* Trust */}
      <div className="bg-white p-5 mb-2 space-y-4">
        <div className="flex gap-4">
          <ShieldCheck className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div>
            <a href="#" className="text-sm text-blue-500 font-medium">Compra Protegida</a>
            <span className="text-sm text-gray-600">, recibe el producto que esperabas o te devolvemos tu dinero.</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-5 mb-2">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Descripción</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {product.description}
        </p>
        
        <h3 className="font-bold text-sm text-gray-900 mb-3">Características principales:</h3>
        <ul className="space-y-2">
          {product.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 flex flex-col gap-3 z-40 pb-6">
        
        {/* Quantity Selector */}
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
          <span className="text-sm font-bold px-2 text-gray-700">Cantidad:</span>
          <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-2 py-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-900 w-4 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-black text-white font-bold py-4 rounded-xl active:scale-95 transition-transform shadow-lg">
            Comprar ahora
          </button>
          <button className="flex-1 bg-gray-100 text-blue-600 font-bold py-4 rounded-xl active:scale-95 transition-transform border border-gray-200">
            Agregar al carrito
          </button>
        </div>
      </div>

    </div>
  )
}
