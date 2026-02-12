"use client"

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Plus, Calendar, X } from 'lucide-react'

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPayroll = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=payroll')
            const data = await res.json()
            if (data.success) setPayrolls(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchPayroll() }, [fetchPayroll])

    const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0)
    const statusColors: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-blue-50 text-blue-700', paid: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-gray-50 text-gray-500' }
    const typeLabels: Record<string, string> = { regular: 'Ordinaria', bonus: 'Bono', commission: 'Comisión', settlement: 'Finiquito', aguinaldo: 'Aguinaldo' }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div><h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600" />Nómina</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{payrolls.length} registros</p></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
                ) : payrolls.length === 0 ? (
                    <div className="text-center py-20"><DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">Sin registros de nómina</p><p className="text-xs text-gray-400 mt-1">Los registros aparecerán aquí cuando se procese la primera nómina</p></div>
                ) : (
                    <div className="bg-white/90 rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500">Empleado</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500">Período</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500">Tipo</th>
                                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500">Bruto</th>
                                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500">Deducciones</th>
                                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500">Neto</th>
                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500">Estado</th>
                            </tr></thead>
                            <tbody>
                                {payrolls.map((p: any) => (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{p.employee_name}</div><div className="text-[10px] text-gray-400">{p.employee_type === 'agent' ? '🏷️ Agente' : '👔 Interno'}</div></td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-600">{p.pay_period_start} → {p.pay_period_end}</td>
                                        <td className="px-4 py-3 text-center"><span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{typeLabels[p.payroll_type] || p.payroll_type}</span></td>
                                        <td className="px-4 py-3 text-right text-xs font-medium text-gray-700">{fmt(p.gross_pay)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-red-600">-{fmt(p.total_deductions)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{fmt(p.net_pay)}</td>
                                        <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[p.status] || ''}`}>{p.status}</span></td>
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
