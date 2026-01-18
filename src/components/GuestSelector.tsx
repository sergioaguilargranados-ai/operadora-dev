"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Users, Minus, Plus, ChevronDown } from "lucide-react"

interface Room {
  adults: number
  children: number
  childrenAges: number[]
}

interface GuestSelectorProps {
  onGuestsChange?: (adults: number, children: number, rooms: number, roomDetails?: Room[]) => void
}

export function GuestSelector({ onGuestsChange }: GuestSelectorProps) {
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0, childrenAges: [] }])

  const getTotalAdults = () => rooms.reduce((sum, room) => sum + room.adults, 0)
  const getTotalChildren = () => rooms.reduce((sum, room) => sum + room.children, 0)

  const handleAdultsChange = (roomIndex: number, increment: boolean) => {
    const newRooms = [...rooms]
    const current = newRooms[roomIndex].adults
    newRooms[roomIndex].adults = increment
      ? Math.min(current + 1, 6)
      : Math.max(current - 1, 1)
    setRooms(newRooms)
    onGuestsChange?.(getTotalAdults(), getTotalChildren(), newRooms.length, newRooms)
  }

  const handleChildrenChange = (roomIndex: number, increment: boolean) => {
    const newRooms = [...rooms]
    const current = newRooms[roomIndex].children
    if (increment && current < 4) {
      newRooms[roomIndex].children = current + 1
      newRooms[roomIndex].childrenAges.push(5) // edad por defecto
    } else if (!increment && current > 0) {
      newRooms[roomIndex].children = current - 1
      newRooms[roomIndex].childrenAges.pop()
    }
    setRooms(newRooms)
    onGuestsChange?.(getTotalAdults(), getTotalChildren(), newRooms.length, newRooms)
  }

  const handleChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const newRooms = [...rooms]
    newRooms[roomIndex].childrenAges[childIndex] = age
    setRooms(newRooms)
    onGuestsChange?.(getTotalAdults(), getTotalChildren(), newRooms.length, newRooms)
  }

  const addRoom = () => {
    if (rooms.length < 5) {
      const newRooms = [...rooms, { adults: 2, children: 0, childrenAges: [] }]
      setRooms(newRooms)
      onGuestsChange?.(getTotalAdults() + 2, getTotalChildren(), newRooms.length, newRooms)
    }
  }

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      const newRooms = rooms.filter((_, i) => i !== index)
      setRooms(newRooms)
      onGuestsChange?.(
        newRooms.reduce((sum, r) => sum + r.adults, 0),
        newRooms.reduce((sum, r) => sum + r.children, 0),
        newRooms.length,
        newRooms
      )
    }
  }

  const totalGuests = getTotalAdults() + getTotalChildren()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-full h-12 flex items-center justify-between px-3 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-sm">
              {totalGuests} {totalGuests === 1 ? 'viajero' : 'viajeros'}, {rooms.length} {rooms.length === 1 ? 'habitación' : 'habitaciones'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="start">
        <div className="space-y-4">
          {rooms.map((room, roomIndex) => (
            <div key={roomIndex} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Habitación {roomIndex + 1}</h4>
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(roomIndex)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {/* Adultos */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">Adultos</p>
                  <p className="text-xs text-muted-foreground">+18 años</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleAdultsChange(roomIndex, false)}
                    disabled={room.adults <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center font-medium text-sm">{room.adults}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleAdultsChange(roomIndex, true)}
                    disabled={room.adults >= 6}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Niños */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">Niños</p>
                  <p className="text-xs text-muted-foreground">0-17 años</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleChildrenChange(roomIndex, false)}
                    disabled={room.children <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center font-medium text-sm">{room.children}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleChildrenChange(roomIndex, true)}
                    disabled={room.children >= 4}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Edades de niños */}
              {room.children > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Edad de niños al terminar el viaje:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {room.childrenAges.map((age, childIndex) => (
                      <div key={childIndex} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Niño {childIndex + 1}:</span>
                        <select
                          value={age}
                          onChange={(e) => handleChildAgeChange(roomIndex, childIndex, parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm px-2 border rounded bg-white"
                        >
                          <option value="0">Menor de 1</option>
                          {Array.from({ length: 17 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} años</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Agregar habitación */}
          {rooms.length < 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={addRoom}
            >
              + Agregar otra habitación
            </Button>
          )}

          {/* Nota informativa */}
          <p className="text-xs text-muted-foreground text-center">
            Máximo 6 adultos y 4 niños por habitación
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
