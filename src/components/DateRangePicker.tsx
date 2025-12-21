"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  onDateChange?: (dateRange: DateRange | undefined) => void
}

export function DateRangePicker({ onDateChange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Inicializar fechas solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 6)

    setDate({
      from: today,
      to: nextWeek
    })
  }, [])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    onDateChange?.(newDate)
  }

  // Durante el servidor o antes de montar, mostrar placeholder
  if (!mounted) {
    return (
      <button
        className={cn(
          "relative w-full h-12 flex items-center px-3 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left"
        )}
        disabled
      >
        <CalendarIcon className="w-5 h-5 text-muted-foreground mr-3" />
        <span className="text-sm text-muted-foreground">Selecciona las fechas</span>
      </button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative w-full h-12 flex items-center px-3 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left"
          )}
        >
          <CalendarIcon className="w-5 h-5 text-muted-foreground mr-3" />
          {date?.from ? (
            date.to ? (
              <span className="text-sm">
                {format(date.from, "d MMM", { locale: es })} - {format(date.to, "d MMM", { locale: es })}
              </span>
            ) : (
              <span className="text-sm">{format(date.from, "d MMM yyyy", { locale: es })}</span>
            )
          ) : (
            <span className="text-sm text-muted-foreground">Selecciona las fechas</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={es}
          disabled={(date) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return date < today
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
