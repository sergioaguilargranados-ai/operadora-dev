"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
    Loader2, Flame, Phone, Users, Plane, CheckCircle,
    ExternalLink, Download, AlertTriangle, Zap
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface CalendarEvent {
    id: string
    title: string
    description: string
    start: string
    end: string
    type: 'task' | 'followup' | 'travel' | 'meeting' | 'call' | 'deadline' | 'campaign'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    contact_id?: number
    contact_name?: string
    status: 'pending' | 'completed' | 'overdue' | 'cancelled'
    color: string
}

interface WeeklyDigest {
    period: { start: string; end: string }
    total_events: number
    by_type: Record<string, number>
    overdue: CalendarEvent[]
    today: CalendarEvent[]
    upcoming: CalendarEvent[]
    travel_departures: CalendarEvent[]
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
    task: { label: 'Tarea', icon: '✅' },
    followup: { label: 'Seguimiento', icon: '📞' },
    travel: { label: 'Viaje', icon: '✈️' },
    meeting: { label: 'Reunión', icon: '👥' },
    call: { label: 'Llamada', icon: '📱' },
    deadline: { label: 'Vencimiento', icon: '⏰' },
    campaign: { label: 'Campaña', icon: '📧' },
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function CalendarPage() {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [digest, setDigest] = useState<WeeklyDigest | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [view, setView] = useState<'month' | 'week'>('month')

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Cargar eventos
    const loadEvents = useCallback(async () => {
        setLoading(true)
        try {
            const firstDay = new Date(year, month, 1)
            const lastDay = new Date(year, month + 1, 0)
            // Extender rango para cubrir toda la grilla visual
            firstDay.setDate(firstDay.getDate() - firstDay.getDay())
            lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

            const [eventsRes, digestRes] = await Promise.all([
                fetch(`/api/crm/calendar?action=events&date_from=${firstDay.toISOString()}&date_to=${lastDay.toISOString()}`),
                fetch(`/api/crm/calendar?action=digest`),
            ])

            const eventsJson = await eventsRes.json()
            const digestJson = await digestRes.json()

            if (eventsJson.success) setEvents(eventsJson.data)
            if (digestJson.success) setDigest(digestJson.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [year, month])

    useEffect(() => { loadEvents() }, [loadEvents])

    // Calcular grilla del mes
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7

    const calendarDays: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = []
    for (let i = 0; i < totalCells; i++) {
        const d = new Date(year, month, 1 - firstDayOfWeek + i)
        const dateStr = d.toISOString().split('T')[0]
        calendarDays.push({
            date: dateStr,
            day: d.getDate(),
            isCurrentMonth: d.getMonth() === month,
            isToday: dateStr === new Date().toISOString().split('T')[0],
        })
    }

    // Eventos por día
    const eventsByDay: Record<string, CalendarEvent[]> = {}
    events.forEach(e => {
        const day = e.start.split('T')[0]
        if (!eventsByDay[day]) eventsByDay[day] = []
        eventsByDay[day].push(e)
    })

    // Navegación
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToToday = () => setCurrentDate(new Date())

    // Eventos del día seleccionado
    const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] || []) : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                            Calendario CRM
                        </h1>
                        <p className="text-xs text-gray-500">Tareas, seguimientos y viajes programados</p>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-6xl">

                {/* ═══════ DIGEST SEMANAL ═══════ */}
                {digest && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        <Card className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div className="text-2xl font-bold">{digest.total_events}</div>
                            <div className="text-xs text-blue-100">Esta semana</div>
                        </Card>
                        <Card className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <div className="text-2xl font-bold">{digest.today.length}</div>
                            <div className="text-xs text-amber-100">Hoy</div>
                        </Card>
                        <Card className={`p-3 ${digest.overdue.length > 0 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 'bg-white border'}`}>
                            <div className={`text-2xl font-bold ${digest.overdue.length > 0 ? '' : 'text-gray-800'}`}>
                                {digest.overdue.length}
                            </div>
                            <div className={`text-xs ${digest.overdue.length > 0 ? 'text-red-100' : 'text-gray-500'}`}>Vencidos</div>
                        </Card>
                        <Card className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <div className="text-2xl font-bold">{digest.travel_departures.length}</div>
                            <div className="text-xs text-emerald-100">Viajes</div>
                        </Card>
                    </div>
                )}

                <div className="flex gap-5 flex-col lg:flex-row">
                    {/* ═══════ CALENDARIO ═══════ */}
                    <div className="flex-1">
                        <Card className="overflow-hidden">
                            {/* Header del calendario */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={prevMonth}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <h2 className="text-base font-bold min-w-[180px] text-center">
                                        {MONTHS[month]} {year}
                                    </h2>
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={nextMonth}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs" onClick={goToToday}>
                                    Hoy
                                </Button>
                            </div>

                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 bg-slate-100">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center py-2 text-[10px] font-semibold text-slate-500 uppercase">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Grilla de días */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 border-t">
                                    {calendarDays.map((cell, i) => {
                                        const dayEvents = eventsByDay[cell.date] || []
                                        const hasOverdue = dayEvents.some(e => e.status === 'overdue')
                                        const isSelected = selectedDay === cell.date

                                        return (
                                            <div
                                                key={i}
                                                className={`min-h-[80px] border-r border-b p-1 cursor-pointer transition-colors
                                                    ${!cell.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                                                    ${cell.isToday ? 'bg-blue-50/50' : ''}
                                                    ${isSelected ? 'bg-blue-100/70 ring-2 ring-blue-400 ring-inset' : ''}
                                                    hover:bg-blue-50/30
                                                `}
                                                onClick={() => setSelectedDay(cell.date)}
                                            >
                                                <div className={`text-right text-xs font-medium mb-0.5
                                                    ${!cell.isCurrentMonth ? 'text-gray-300' : cell.isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}
                                                `}>
                                                    {cell.isToday ? (
                                                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]">
                                                            {cell.day}
                                                        </span>
                                                    ) : cell.day}
                                                </div>
                                                <div className="space-y-0.5">
                                                    {dayEvents.slice(0, 3).map(e => (
                                                        <div
                                                            key={e.id}
                                                            className="text-[9px] px-1 py-0.5 rounded truncate"
                                                            style={{
                                                                backgroundColor: `${e.color}20`,
                                                                color: e.color,
                                                                borderLeft: `2px solid ${e.color}`,
                                                            }}
                                                            title={e.title}
                                                        >
                                                            {e.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <div className="text-[9px] text-gray-400 text-center">
                                                            +{dayEvents.length - 3} más
                                                        </div>
                                                    )}
                                                </div>
                                                {hasOverdue && (
                                                    <div className="absolute top-0.5 left-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Leyenda */}
                            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 border-t">
                                {Object.entries(TYPE_LABELS).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <span>{val.icon}</span> {val.label}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* ═══════ PANEL LATERAL ═══════ */}
                    <div className="w-full lg:w-72 space-y-4">
                        {/* Eventos del día seleccionado */}
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                {selectedDay
                                    ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                                    : 'Selecciona un día'
                                }
                            </h3>

                            {selectedDay && selectedDayEvents.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">Sin eventos este día</p>
                            )}

                            <div className="space-y-2 max-h-[350px] overflow-y-auto">
                                {selectedDayEvents.map(e => (
                                    <div
                                        key={e.id}
                                        className="p-2.5 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                                        style={{ borderLeftColor: e.color, borderLeftWidth: '3px' }}
                                        onClick={() => e.contact_id && router.push(`/dashboard/crm/contacts/${e.contact_id}`)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="text-xs font-medium text-gray-800 leading-tight">
                                                {TYPE_LABELS[e.type]?.icon} {e.title}
                                            </span>
                                            {e.status === 'overdue' && (
                                                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        {e.description && (
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{e.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] text-gray-400">
                                                {new Date(e.start).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${e.status === 'overdue' ? 'bg-red-100 text-red-600'
                                                    : e.status === 'completed' ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {e.status === 'overdue' ? 'Vencido' : e.status === 'completed' ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Vencidos */}
                        {digest && digest.overdue.length > 0 && (
                            <Card className="p-4 bg-red-50 border-red-200">
                                <h3 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Vencidos ({digest.overdue.length})
                                </h3>
                                <div className="space-y-1.5">
                                    {digest.overdue.slice(0, 5).map(e => (
                                        <div key={e.id} className="text-[11px] text-red-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                                            <span className="truncate">{e.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Próximas salidas */}
                        {digest && digest.travel_departures.length > 0 && (
                            <Card className="p-4 bg-emerald-50 border-emerald-200">
                                <h3 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                                    <Plane className="w-3.5 h-3.5" />
                                    Viajes esta semana ({digest.travel_departures.length})
                                </h3>
                                <div className="space-y-1.5">
                                    {digest.travel_departures.slice(0, 5).map(e => (
                                        <div key={e.id} className="text-[11px] text-emerald-600 flex items-center gap-1">
                                            <span>✈️</span>
                                            <span className="truncate">{e.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Acciones */}
                        <Card className="p-4">
                            <h3 className="text-xs font-semibold text-gray-600 mb-2">Acciones rápidas</h3>
                            <div className="flex flex-col gap-1.5">
                                <Button variant="outline" className="justify-start text-xs h-8" onClick={() => router.push('/dashboard/crm')}>
                                    <ChevronLeft className="w-3 h-3 mr-1" /> Volver al CRM
                                </Button>
                                <Button variant="outline" className="justify-start text-xs h-8"
                                    onClick={() => router.push('/dashboard/crm/predictive')}>
                                    <Zap className="w-3 h-3 mr-1 text-purple-500" /> Scoring predictivo
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
