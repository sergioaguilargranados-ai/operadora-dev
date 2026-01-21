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
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full justify-around",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full justify-around mt-1",
        cell: cn(
          "relative h-9 w-9 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([data-range-middle])]:bg-blue-100",
          "[&:has([data-range-start])]:rounded-l-full",
          "[&:has([data-range-end])]:rounded-r-full",
          "[&:has([data-range-start][data-range-end])]:rounded-full"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-full",
          "transition-colors cursor-pointer",
          "hover:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "data-[selected]:bg-blue-600 data-[selected]:text-white data-[selected]:font-semibold data-[selected]:hover:bg-blue-700",
          "data-[range-start]:bg-blue-600 data-[range-start]:text-white data-[range-start]:font-semibold",
          "data-[range-end]:bg-blue-600 data-[range-end]:text-white data-[range-end]:font-semibold",
          "data-[range-middle]:bg-blue-100 data-[range-middle]:text-blue-800 data-[range-middle]:rounded-none data-[range-middle]:hover:bg-blue-200",
          "data-[today]:bg-gray-200 data-[today]:text-gray-900 data-[today]:font-bold",
          "data-[disabled]:text-gray-300 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent data-[disabled]:line-through",
          "data-[outside]:text-gray-400 data-[outside]:opacity-50"
        ),
        range_start: "data-[range-start]:bg-blue-600 data-[range-start]:text-white",
        range_end: "data-[range-end]:bg-blue-600 data-[range-end]:text-white",
        range_middle: "data-[range-middle]:bg-blue-100 data-[range-middle]:text-blue-800",
        selected: "bg-blue-600 text-white font-semibold",
        today: "bg-gray-200 text-gray-900 font-bold",
        outside: "text-gray-400 opacity-50",
        disabled: "text-gray-300 opacity-50 cursor-not-allowed line-through",
        hidden: "invisible",
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
