"use client"

import { useEffect, useState, useRef } from 'react'
import { Loader2, ThermometerSun, Droplets, Wind, Umbrella } from 'lucide-react'

interface WeatherForecastProps {
  city: string
  date: string // YYYY-MM-DD
}

function getTheme(icon: string) {
  // Map openweathermap icons to tailwind gradient classes
  if (icon.includes('01') || icon.includes('02')) {
    // Clear / Few clouds -> Warm yellow/orange
    return {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      text: 'text-amber-900',
      textMuted: 'text-amber-700',
      chartStroke: '#f59e0b', // amber-500
      chartFill: 'url(#gradient-sunny)',
    }
  } else if (icon.includes('09') || icon.includes('10') || icon.includes('11')) {
    // Rain / Thunderstorm -> Dark blue/gray
    return {
      bg: 'bg-gradient-to-br from-slate-200 to-slate-300',
      text: 'text-slate-900',
      textMuted: 'text-slate-600',
      chartStroke: '#3b82f6', // blue-500
      chartFill: 'url(#gradient-rainy)',
    }
  } else {
    // Clouds, Snow, Mist -> Cool blue/gray
    return {
      bg: 'bg-gradient-to-br from-blue-50 to-slate-100',
      text: 'text-slate-800',
      textMuted: 'text-slate-500',
      chartStroke: '#64748b', // slate-500
      chartFill: 'url(#gradient-cloudy)',
    }
  }
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr)
  // Check if it's today
  const today = new Date()
  if (date.getUTCFullYear() === today.getUTCFullYear() && 
      date.getUTCMonth() === today.getUTCMonth() && 
      date.getUTCDate() === today.getUTCDate()) {
    return 'Hoy'
  }
  return date.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'UTC' })
}

function generateChartPaths(temps: number[], width: number, height: number) {
  if (temps.length < 2) return { path: '', fillPath: '', points: [] };
  
  // Calculate min and max with some padding so line doesn't hit edges
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;
  const range = max - min || 1;
  const stepX = width / (temps.length - 1);
  
  const points = temps.map((t, i) => ({
    x: i * stepX,
    y: height - ((t - min) / range) * height,
    temp: t
  }));

  // Catmull-Rom to Cubic Bezier curve
  let path = `M ${points[0].x},${points[0].y} `;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 === points.length ? i + 1 : i + 2];
    
    // Tension factor
    const tension = 6;
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;
    
    path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
  }

  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;

  return { path, fillPath, points };
}

export function WeatherForecast({ city, date }: WeatherForecastProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city || !date) return
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&date=${date}&_t=${Date.now()}`)
        const json = await res.json()
        if (json.success && json.data) {
          setData(json)
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
      <div className="bg-[#FDECDA] p-4 rounded-3xl border border-orange-100 shadow-sm flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
      </div>
    )
  }

  if (!data || !data.data) {
    return null
  }

  const current = data.data
  const extended = data.extended || [current]
  
  // Theme similar to the screenshot
  const theme = {
    bg: 'bg-[#FDECDA]',
    text: 'text-[#4A3B2C]',
    textMuted: 'text-[#8A7B6C]',
  }

  return (
    <div className={`${theme.bg} rounded-3xl p-4 flex flex-col w-full h-full`}>
      <h3 className={`text-sm font-bold ${theme.text}`}>Clima de hoy</h3>
      <p className={`text-[10px] ${theme.textMuted}`}>{city}</p>
      
      <div className="flex flex-col items-center justify-center mt-4 mb-2">
        <div className="flex items-center gap-2">
          <img 
            src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`} 
            alt={current.description}
            className="w-16 h-16 object-contain -ml-2"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <span className={`text-4xl font-light tracking-tighter ${theme.text}`}>
            {Math.round(current.temp)}°
          </span>
        </div>
        <p className={`text-xs capitalize font-medium ${theme.text}`}>{current.description}</p>
        <p className={`text-[10px] mt-1 ${theme.text}`}>
          Máx. {Math.round(current.temp_max)}° / Mín. {Math.round(current.temp_min)}°
        </p>
      </div>
      
      {/* 3 columns stats */}
      <div className={`grid grid-cols-3 gap-1 border-t border-b border-[#F5D8BA] py-3 my-4 ${theme.textMuted}`}>
        <div className="flex flex-col items-center">
          <Droplets className="w-4 h-4 mb-1" />
          <span className={`text-[10px] font-bold ${theme.text}`}>{current.humidity}%</span>
          <span className="text-[8px]">Humedad</span>
        </div>
        <div className="flex flex-col items-center border-l border-r border-[#F5D8BA]">
          <Wind className="w-4 h-4 mb-1" />
          <span className={`text-[10px] font-bold ${theme.text}`}>{current.wind_speed ? Math.round(current.wind_speed * 3.6) : 0} km/h</span>
          <span className="text-[8px]">Viento</span>
        </div>
        <div className="flex flex-col items-center">
          <ThermometerSun className="w-4 h-4 mb-1" />
          <span className={`text-[10px] font-bold ${theme.text}`}>{Math.round(current.temp_max)}</span>
          <span className="text-[8px]">Índice UV</span>
        </div>
      </div>
      
      {/* Weekly Forecast */}
      <h4 className={`text-[10px] font-bold ${theme.text} mb-2`}>Pronóstico semanal</h4>
      <div className="flex flex-col gap-2">
        {extended.slice(0, 7).map((day: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between">
            <span className={`text-[10px] font-medium w-6 capitalize ${theme.textMuted}`}>
              {formatDay(day.date)}
            </span>
            <img 
              src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
              alt="icon"
              className="w-6 h-6 object-contain"
            />
            <div className={`flex gap-3 text-[10px] font-bold ${theme.text}`}>
              <span>{Math.round(day.temp_max)}°</span>
              <span className={theme.textMuted}>{Math.round(day.temp_min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
