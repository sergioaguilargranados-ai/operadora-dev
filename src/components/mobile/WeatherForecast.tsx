"use client"

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, Loader2, ThermometerSun } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WeatherForecastProps {
  city: string
  date: string // YYYY-MM-DD
}

export function WeatherForecast({ city, date }: WeatherForecastProps) {
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city || !date) return
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&date=${date}&_t=${Date.now()}`)
        const data = await res.json()
        if (data.success && data.data) {
          setForecast(data.data)
        }
      } catch (err) {
        console.error("Error fetching weather:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [city, date])

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
      </div>
    )
  }

  if (!forecast) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <ThermometerSun className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Clima</p>
            <p className="text-[10px] text-gray-500">Pronóstico no disponible</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500">
            {/* Custom logic for icons if we wanted to replace OpenWeatherMap icons with Lucide, but we can just use the img */}
            <img 
              src={`http://openweathermap.org/img/wn/${forecast.icon}@2x.png`} 
              alt={forecast.description}
              className="w-8 h-8 drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
              }}
            />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Clima en {city}</p>
            <p className="text-[10px] text-gray-500 capitalize">{forecast.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-gray-900">{Math.round(forecast.temp)}°</span>
        </div>
      </div>
      <div className="flex justify-between mt-auto relative z-10">
        <p className="text-[10px] font-medium text-gray-500">Mín: {Math.round(forecast.temp_min)}°</p>
        <p className="text-[10px] font-medium text-gray-500">Máx: {Math.round(forecast.temp_max)}°</p>
      </div>
      
      {/* Decorative background shape */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 z-0"></div>
    </div>
  )
}
