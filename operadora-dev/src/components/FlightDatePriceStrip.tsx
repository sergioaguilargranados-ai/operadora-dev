"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DatePrice {
  date: Date
  price: number
  isLowest: boolean
  isSelected: boolean
}

interface FlightDatePriceStripProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  basePrice?: number
  currency?: string
}

export function FlightDatePriceStrip({
  selectedDate,
  onDateSelect,
  basePrice = 2000,
  currency = 'MXN'
}: FlightDatePriceStripProps) {
  const [dates, setDates] = useState<DatePrice[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const visibleDates = 7

  useEffect(() => {
    // Generar 14 días de fechas con precios simulados
    const generatedDates: DatePrice[] = []
    const selected = selectedDate ? new Date(selectedDate) : new Date()

    // Empezar 3 días antes de la fecha seleccionada
    const startDate = new Date(selected)
    startDate.setDate(startDate.getDate() - 3)

    // Generar precios con variación realista
    const priceVariations = [
      1.15, 1.08, 1.02, 0.95, 1.0, 0.92, 1.05,
      1.12, 0.98, 1.18, 1.25, 0.88, 1.03, 1.10
    ]

    // Encontrar el precio más bajo para resaltarlo
    const lowestPrice = Math.min(...priceVariations) * basePrice

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const priceMultiplier = priceVariations[i]
      const price = Math.round(basePrice * priceMultiplier)

      const dateString = date.toISOString().split('T')[0]
      const selectedDateString = selected.toISOString().split('T')[0]

      generatedDates.push({
        date,
        price,
        isLowest: price === Math.round(lowestPrice),
        isSelected: dateString === selectedDateString
      })
    }

    setDates(generatedDates)

    // Centrar en la fecha seleccionada
    const selectedIndex = generatedDates.findIndex(d => d.isSelected)
    if (selectedIndex !== -1) {
      setStartIndex(Math.max(0, Math.min(selectedIndex - 3, generatedDates.length - visibleDates)))
    }
  }, [selectedDate, basePrice])

  const formatDate = (date: Date) => {
    const days = ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.']
    const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-MX')} ${currency}`
  }

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - 1))
  }

  const handleNext = () => {
    setStartIndex(Math.min(dates.length - visibleDates, startIndex + 1))
  }

  const handleDateClick = (datePrice: DatePrice) => {
    const dateString = datePrice.date.toISOString().split('T')[0]
    onDateSelect(dateString)
  }

  const visibleDateRange = dates.slice(startIndex, startIndex + visibleDates)

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm mb-4 text-gray-600">
        <span className="font-medium text-gray-900">Elige tu vuelo de salida</span>
        <ChevronRight className="w-4 h-4" />
        <span>Elige tu vuelo de regreso</span>
        <ChevronRight className="w-4 h-4" />
        <span>Revisa los detalles del viaje</span>
      </div>

      {/* Date strip */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          disabled={startIndex === 0}
          className="shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 flex gap-2 overflow-hidden">
          {visibleDateRange.map((datePrice, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(datePrice)}
              className={`
                flex-1 min-w-[100px] p-3 rounded-lg border-2 transition-all text-center
                ${datePrice.isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${datePrice.isLowest ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
              `}
            >
              <div className={`text-xs mb-1 ${datePrice.isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                {formatDate(datePrice.date)}
              </div>
              <div className={`font-bold text-sm ${
                datePrice.isSelected
                  ? 'text-blue-700'
                  : datePrice.isLowest
                    ? 'text-green-600'
                    : 'text-gray-900'
              }`}>
                {formatPrice(datePrice.price)}
              </div>
              {datePrice.isLowest && !datePrice.isSelected && (
                <div className="text-[10px] text-green-600 font-medium mt-1">Más bajo</div>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={startIndex >= dates.length - visibleDates}
          className="shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-3">
        Los precios pueden cambiar según la disponibilidad y no se consideran definitivos hasta que se complete la compra.
      </p>
    </div>
  )
}
