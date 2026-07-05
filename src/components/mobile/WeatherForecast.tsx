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
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(300)

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

  useEffect(() => {
    if (containerRef.current) {
      setChartWidth(containerRef.current.offsetWidth)
    }
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data])

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
      </div>
    )
  }

  if (!data || !data.data) {
    return (
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <ThermometerSun className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Clima en {city}</p>
            <p className="text-xs text-gray-500">Pronóstico no disponible</p>
          </div>
        </div>
      </div>
    )
  }

  const current = data.data
  const extended = data.extended || [current]
  const theme = getTheme(current.icon)
  
  // Render chart
  const temps = extended.map((day: any) => parseFloat(day.temp_max))
  const chartHeight = 60
  // Adjust chart width based on number of days (min 300px, or full container)
  const actualChartWidth = Math.max(chartWidth, extended.length * 60)
  const { path, fillPath, points } = generateChartPaths(temps, actualChartWidth, chartHeight)

  return (
    <div ref={containerRef} className={`${theme.bg} rounded-3xl shadow-sm flex flex-col relative overflow-hidden transition-colors duration-500`}>
      {/* Top Section: Current Weather */}
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className={`text-sm font-semibold ${theme.text}`}>{city}</h3>
            <p className={`text-xs capitalize ${theme.textMuted}`}>{current.description}</p>
            
            <div className="flex items-center mt-2">
              <span className={`text-5xl font-light tracking-tighter ${theme.text}`}>
                {Math.round(current.temp)}°
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <img 
              src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`} 
              alt={current.description}
              className="w-20 h-20 drop-shadow-md -mt-2 -mr-2"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        </div>
        
        {/* Extra Info Row */}
        <div className="flex gap-4 mt-4">
          {(current.pop > 0) && (
            <div className={`flex items-center gap-1 text-xs ${theme.textMuted}`}>
              <Umbrella className="w-3 h-3" />
              <span>{Math.round(current.pop * 100)}% precip.</span>
            </div>
          )}
          {current.humidity !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${theme.textMuted}`}>
              <Droplets className="w-3 h-3" />
              <span>{current.humidity}% hum.</span>
            </div>
          )}
          {current.wind_speed !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${theme.textMuted}`}>
              <Wind className="w-3 h-3" />
              <span>{Math.round(current.wind_speed * 3.6)} km/h</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Section */}
      <div className="relative h-[80px] w-full overflow-hidden mt-2">
        <svg width="100%" height={chartHeight + 20} className="absolute bottom-0 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient-sunny" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-rainy" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-cloudy" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <path d={fillPath} fill={theme.chartFill} />
          <path d={path} fill="none" stroke={theme.chartStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={theme.chartStroke} strokeWidth="2" />
              <text x={p.x} y={p.y - 12} textAnchor="middle" className={`text-[10px] font-bold ${theme.text}`} fill="currentColor">
                {Math.round(p.temp)}°
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Extended Forecast Carousel */}
      <div className="px-5 pb-5 pt-2 flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide relative z-10">
        {extended.map((day: any, idx: number) => (
          <div key={idx} className="flex flex-col items-center min-w-[50px] snap-center">
            <span className={`text-[10px] font-medium capitalize ${theme.textMuted}`}>
              {formatDay(day.date)}
            </span>
            <img 
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
              alt="icon"
              className="w-8 h-8 my-1"
            />
            <div className="flex flex-col items-center">
              <span className={`text-xs font-bold ${theme.text}`}>{Math.round(day.temp_max)}°</span>
              <span className={`text-[10px] ${theme.textMuted}`}>{Math.round(day.temp_min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
