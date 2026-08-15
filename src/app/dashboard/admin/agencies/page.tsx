"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Building2, Users, DollarSign, TrendingUp, Briefcase,
    Loader2, Eye, ShieldCheck, Globe, ArrowUpRight, BarChart3,
    Plus, Sparkles
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

// ═══════════════════════════════════════
// Tipos
// ═══════════════════════════════════════

interface Agency {
    id: number
    company_name: string
    slug: string
    is_active: boolean
    created_at: string
    total_agents: number
    active_agents: number
    total_clients: number
    total_bookings: number
    total_revenue: number
    total_commissions: number
    pending_commissions: number
    available_commissions: number
    paid_commissions: number
}

interface GlobalStats {
    total_agencies: number
    total_agents: number
    total_clients: number
    total_bookings: number
    total_revenue: number
    total_commissions: number
    pending_commissions: number
    available_commissions: number
    paid_commissions: number
}

// ═══════════════════════════════════════
// Componente Principal
// ═══════════════════════════════════════

export default function AdminAgenciesPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [agencies, setAgencies] = useState<Agency[]>([])
    const [global, setGlobal] = useState<GlobalStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchData()
    }, [isAuthenticated])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/agencies')
            const data = await res.json()
            if (data.success) {
                setAgencies(data.data.agencies || [])
                setGlobal(data.data.global || null)
            }
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency', currency: 'MXN',
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        )
    }

    // Datos para gráfica comparativa
    const chartData = agencies
        .filter(a => parseFloat(String(a.total_commissions)) > 0 || parseInt(String(a.total_bookings)) > 0)
        .map(a => ({
            name: a.company_name.length > 12 ? a.company_name.substring(0, 12) + '…' : a.company_name,
            reservas: parseInt(String(a.total_bookings)),
            comisiones: parseFloat(String(a.total_commissions)),
            agentes: parseInt(String(a.total_agents))
        }))

    return (
        <div className="space-y-6">
            {/* Header Institucional de la Vista */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-serif flex items-center gap-2.5">
                        <ShieldCheck className="w-7 h-7 text-slate-900" />
                        Panel de Super Admin
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Vista global, métricas consolidadas y gestión de agencias afiliadas</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => router.push('/registro-agencias')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 gap-2 shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Agencia
                    </Button>
                </div>
            </div>

            {/* ═══ STATS GLOBALES (KPI CARDS) ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-blue-600">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">Total Agencias</p>
                        <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">{global?.total_agencies || 0}</span>
                        <span className="text-xs text-blue-600 font-bold">registradas</span>
                    </div>
                </Card>

                <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">Agentes Totales</p>
                        <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">{global?.total_agents || 0}</span>
                        <span className="text-xs text-slate-400 font-medium">({global?.total_clients || 0} clientes)</span>
                    </div>
                </Card>

                <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">Reservas Globales</p>
                        <Briefcase className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">{global?.total_bookings || 0}</span>
                        <span className="text-xs text-emerald-600 font-bold">{formatCurrency(global?.total_revenue || 0)}</span>
                    </div>
                </Card>

                <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-purple-600">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">Comisiones Totales</p>
                        <DollarSign className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(global?.total_commissions || 0)}</span>
                    </div>
                    <div className="flex gap-2 text-[10px] mt-1 text-slate-500">
                        <span className="text-amber-600 font-bold">⏳ {formatCurrency(global?.pending_commissions || 0)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">✅ {formatCurrency(global?.available_commissions || 0)}</span>
                    </div>
                </Card>
            </div>

            {/* ═══ GRÁFICA COMPARATIVA ═══ */}
            {chartData.length > 0 && (
                <Card className="p-6 border-gray-200/80 shadow-2xs rounded-2xl bg-white">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Rendimiento Comparativo de Agencias
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    color: '#0f172a'
                                }}
                            />
                            <Bar dataKey="reservas" fill="#000000" radius={[6, 6, 0, 0]} name="Reservas" />
                            <Bar dataKey="agentes" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Agentes" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* ═══ LISTA DE AGENCIAS REGISTRADAS ═══ */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                        <Globe className="w-4 h-4 text-slate-700" />
                        Agencias Registradas
                    </h3>
                    <Badge variant="outline" className="text-xs font-bold text-slate-700 bg-slate-100">
                        {agencies.length} agencias
                    </Badge>
                </div>

                <div className="space-y-3">
                    {agencies.map((agency, i) => (
                        <Card 
                            key={agency.id}
                            className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
                            onClick={() => router.push(`/dashboard/agency?id=${agency.id}`)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-2xs flex-shrink-0">
                                        {agency.company_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {agency.company_name}
                                        </h4>
                                        <p className="text-xs text-slate-400">{agency.slug || '—'}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                agency.is_active 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {agency.is_active ? '● Activa' : '○ Inactiva'}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                {parseInt(String(agency.total_agents))} agentes
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Clientes</p>
                                        <p className="text-sm font-bold text-slate-900">{parseInt(String(agency.total_clients))}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Reservas</p>
                                        <p className="text-sm font-bold text-slate-900">{parseInt(String(agency.total_bookings))}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Revenue</p>
                                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(parseFloat(String(agency.total_revenue)))}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Comisiones</p>
                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(parseFloat(String(agency.total_commissions)))}</p>
                                    </div>

                                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                            </div>
                        </Card>
                    ))}

                    {agencies.length === 0 && (
                        <Card className="p-12 text-center border-gray-200/80 shadow-2xs rounded-2xl bg-white">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <h3 className="text-base font-bold text-slate-900 mb-1">No hay agencias registradas</h3>
                            <p className="text-xs text-slate-500">Las agencias aparecerán aquí cuando completen su registro</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
