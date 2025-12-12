"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Users, Minus, Plus } from "lucide-react"

interface GuestSelectorProps {
  onGuestsChange?: (adults: number, children: number, rooms: number) => void
}

export function GuestSelector({ onGuestsChange }: GuestSelectorProps) {
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)

  const handleChange = (type: 'adults' | 'children' | 'rooms', increment: boolean) => {
    const updateValue = (current: number, min: number = 0, max: number = 10) => {
      const newValue = increment ? Math.min(current + 1, max) : Math.max(current - 1, min)
      return newValue
    }

    if (type === 'adults') {
      const newAdults = updateValue(adults, 1)
      setAdults(newAdults)
      onGuestsChange?.(newAdults, children, rooms)
    } else if (type === 'children') {
      const newChildren = updateValue(children)
      setChildren(newChildren)
      onGuestsChange?.(adults, newChildren, rooms)
    } else {
      const newRooms = updateValue(rooms, 1)
      setRooms(newRooms)
      onGuestsChange?.(adults, children, newRooms)
    }
  }

  const totalGuests = adults + children

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-full h-12 flex items-center px-3 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left">
          <Users className="w-5 h-5 text-muted-foreground mr-3" />
          <span className="text-sm">
            {totalGuests} {totalGuests === 1 ? 'viajero' : 'viajeros'}, {rooms} {rooms === 1 ? 'habitación' : 'habitaciones'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Adultos</p>
              <p className="text-xs text-muted-foreground">Mayores de 18 años</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('adults', false)}
                disabled={adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{adults}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('adults', true)}
                disabled={adults >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Niños</p>
              <p className="text-xs text-muted-foreground">Menores de 18 años</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('children', false)}
                disabled={children <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{children}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('children', true)}
                disabled={children >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Habitaciones</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('rooms', false)}
                disabled={rooms <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{rooms}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleChange('rooms', true)}
                disabled={rooms >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
