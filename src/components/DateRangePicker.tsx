"use client"

import { useState } from "react"
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
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 6))
  })

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    onDateChange?.(newDate)
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
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </PopoverContent>
    </Popover>
  )
}
