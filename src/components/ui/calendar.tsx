"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rdp-calendar", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center",
          "absolute left-1"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center",
          "absolute right-1"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-1",
        day: cn(
          "relative h-9 w-9 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([data-range-middle])]:bg-blue-100",
          "[&:has([data-range-start])]:rounded-l-full",
          "[&:has([data-range-end])]:rounded-r-full",
          "[&:has([data-range-start][data-range-end])]:rounded-full"
        ),
        day_button: cn(
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-full",
          "transition-colors cursor-pointer",
          "hover:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "aria-selected:bg-blue-600 aria-selected:text-white aria-selected:font-semibold aria-selected:hover:bg-blue-700"
        ),
        day_range_start: "bg-blue-600 text-white font-semibold",
        day_range_end: "bg-blue-600 text-white font-semibold",
        day_range_middle: "bg-blue-100 text-blue-800 rounded-none hover:bg-blue-200",
        day_selected: "bg-blue-600 text-white font-semibold",
        day_today: "bg-gray-200 text-gray-900 font-bold",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 opacity-50 cursor-not-allowed line-through",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
