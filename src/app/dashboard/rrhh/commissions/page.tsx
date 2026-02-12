"use client"

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react'

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // TODO: Add API endpoint for hr_agent_commissions
    useEffect(() => { setLoading(false) }, [])

    const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" />Comisiones de Agentes</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Seguimiento y liquidación de comisiones</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/90 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"><DollarSign className="w-4 h-4 text-white" /></div></div>
                        <div className="text-xl font-bold text-gray-900">{fmt(0)}</div>
                        <div className="text-[10px] text-gray-500">Total Pendientes</div>
                    </div>
                    <div className="bg-white/90 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div></div>
                        <div className="text-xl font-bold text-gray-900">{fmt(0)}</div>
                        <div className="text-[10px] text-gray-500">Pagado este Mes</div>
                    </div>
                    <div className="bg-white/90 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"><Target className="w-4 h-4 text-white" /></div></div>
                        <div className="text-xl font-bold text-gray-900">0</div>
                        <div className="text-[10px] text-gray-500">Agentes con Comisiones</div>
                    </div>
                    <div className="bg-white/90 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center"><Calendar className="w-4 h-4 text-white" /></div></div>
                        <div className="text-xl font-bold text-gray-900">{fmt(0)}</div>
                        <div className="text-[10px] text-gray-500">Acumulado YTD</div>
                    </div>
                </div>

                <div className="text-center py-16">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Sin comisiones registradas</p>
                    <p className="text-xs text-gray-400 mt-1">Las comisiones se generan automáticamente cuando los agentes cierran ventas</p>
                </div>
            </div>
        </div>
    )
}
