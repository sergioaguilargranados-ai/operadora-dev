"use client"

import { useState, useEffect, useCallback } from 'react'
import { Clock, LogIn, LogOut, CalendarDays, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function AttendancePage() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    const fetchAttendance = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/hr?action=attendance&start_date=${selectedDate}&end_date=${selectedDate}`)
            const data = await res.json()
            if (data.success) setRecords(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [selectedDate])

    useEffect(() => { fetchAttendance() }, [fetchAttendance])

    const handleCheckIn = async (employeeId: number) => {
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check_in', employee_id: employeeId, attendance_date: selectedDate })
            })
            fetchAttendance()
        } catch (err) { console.error(err) }
    }

    const handleCheckOut = async (employeeId: number) => {
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check_out', employee_id: employeeId, attendance_date: selectedDate })
            })
            fetchAttendance()
        } catch (err) { console.error(err) }
    }

    const statusIcons: Record<string, React.ReactNode> = {
        present: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        absent: <XCircle className="w-4 h-4 text-red-500" />,
        late: <AlertCircle className="w-4 h-4 text-amber-500" />,
        remote: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
        half_day: <AlertCircle className="w-4 h-4 text-orange-500" />,
        holiday: <CheckCircle2 className="w-4 h-4 text-purple-500" />
    }
    const statusLabels: Record<string, string> = {
        present: 'Presente', absent: 'Ausente', late: 'Retardo', remote: 'Remoto', half_day: 'Medio día', holiday: 'Festivo'
    }

    const present = records.filter(r => ['present', 'late', 'remote'].includes(r.status)).length
    const absent = records.filter(r => r.status === 'absent').length
    const late = records.filter(r => r.status === 'late').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div><h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-600" />Control de Asistencia</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{records.length} registros</p></div>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="font-medium text-emerald-700">{present} presentes</span></div>
                        <div className="flex items-center gap-1.5 text-xs"><XCircle className="w-3.5 h-3.5 text-red-500" /><span className="font-medium text-red-700">{absent} ausentes</span></div>
                        <div className="flex items-center gap-1.5 text-xs"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="font-medium text-amber-700">{late} retardos</span></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
                ) : records.length === 0 ? (
                    <div className="text-center py-20"><Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">Sin registros de asistencia para esta fecha</p></div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Empleado</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Entrada</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Salida</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Horas</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr></thead>
                            <tbody>
                                {records.map((r: any) => (
                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{r.employee_name}</div>
                                            <div className="text-[10px] text-gray-400">#{r.employee_number}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {statusIcons[r.status]}
                                                <span className="text-xs text-gray-600">{statusLabels[r.status] || r.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {r.check_in
                                                ? <span className="text-xs text-gray-700 flex items-center justify-center gap-1"><LogIn className="w-3 h-3 text-emerald-500" />{new Date(r.check_in).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                                                : <span className="text-xs text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {r.check_out
                                                ? <span className="text-xs text-gray-700 flex items-center justify-center gap-1"><LogOut className="w-3 h-3 text-red-500" />{new Date(r.check_out).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                                                : <span className="text-xs text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">{r.worked_hours ? `${parseFloat(r.worked_hours).toFixed(1)}h` : '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {!r.check_in && <button onClick={() => handleCheckIn(r.employee_id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg hover:bg-emerald-100 font-medium">Entrada</button>}
                                                {r.check_in && !r.check_out && <button onClick={() => handleCheckOut(r.employee_id)} className="px-2 py-1 bg-red-50 text-red-700 text-[10px] rounded-lg hover:bg-red-100 font-medium">Salida</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
