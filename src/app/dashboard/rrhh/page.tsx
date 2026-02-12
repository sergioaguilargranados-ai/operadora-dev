"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    Users, Briefcase, FileText, Clock,
    CalendarOff, DollarSign, TrendingUp,
    UserPlus, AlertTriangle, CheckCircle2,
    Building2, ArrowUpRight, RefreshCw,
    ChevronRight, UserCheck, UserX
} from 'lucide-react'

interface DashboardStats {
    total_employees: number
    active_employees: number
    internal_count: number
    agent_count: number
    freelance_count: number
    on_leave: number
    pending_leaves: number
    active_contracts: number
    expiring_contracts: number
    open_positions: number
    attendance_today: number
    absent_today: number
    total_payroll_this_month: number
    pending_commissions: number
}

export default function RRHHDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=dashboard')
            const data = await res.json()
            if (data.success) setStats(data.data)
        } catch (err) {
            console.error('Error fetching HR stats:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [fetchStats])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, onClick }: {
        title: string; value: string | number; icon: React.ComponentType<{ className?: string }>
        color: string; subtitle?: string; trend?: string; onClick?: () => void
    }) => (
        <button
            onClick={onClick}
            className={`bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-${color}/5 hover:-translate-y-0.5 group text-left w-full`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {trend && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
            <div className="text-xs text-gray-500">{title}</div>
            {subtitle && <div className="text-[10px] text-gray-400 mt-1">{subtitle}</div>}
            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver detalle <ChevronRight className="w-3 h-3" />
            </div>
        </button>
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Cargando módulo RRHH...</span>
                </div>
            </div>
        )
    }

    const s = stats || {
        total_employees: 0, active_employees: 0, internal_count: 0,
        agent_count: 0, freelance_count: 0, on_leave: 0,
        pending_leaves: 0, active_contracts: 0, expiring_contracts: 0,
        open_positions: 0, attendance_today: 0, absent_today: 0,
        total_payroll_this_month: 0, pending_commissions: 0
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                Recursos Humanos
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {currentTime.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {' · '}
                                {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchStats}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                title="Actualizar"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

                {/* ─── Row 1: KPI Principales ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Empleados"
                        value={s.total_employees}
                        icon={Users}
                        color="from-blue-500 to-blue-600"
                        subtitle={`${s.active_employees} activos`}
                    />
                    <StatCard
                        title="Empleados Internos"
                        value={s.internal_count}
                        icon={Building2}
                        color="from-cyan-500 to-cyan-600"
                        subtitle="Nómina fija"
                    />
                    <StatCard
                        title="Agentes de Ventas"
                        value={s.agent_count}
                        icon={Briefcase}
                        color="from-purple-500 to-purple-600"
                        subtitle="Comisiones"
                    />
                    <StatCard
                        title="Freelance"
                        value={s.freelance_count}
                        icon={UserCheck}
                        color="from-amber-500 to-amber-600"
                        subtitle="Honorarios"
                    />
                </div>

                {/* ─── Row 2: Estado Actual ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Asistencia Hoy"
                        value={s.attendance_today}
                        icon={Clock}
                        color="from-emerald-500 to-emerald-600"
                        subtitle={`${s.absent_today} ausentes`}
                    />
                    <StatCard
                        title="En Permiso"
                        value={s.on_leave}
                        icon={CalendarOff}
                        color="from-orange-500 to-orange-600"
                        subtitle={`${s.pending_leaves} solicitudes pendientes`}
                    />
                    <StatCard
                        title="Contratos Activos"
                        value={s.active_contracts}
                        icon={FileText}
                        color="from-indigo-500 to-indigo-600"
                        subtitle={s.expiring_contracts > 0
                            ? `⚠️ ${s.expiring_contracts} por vencer`
                            : 'Todos vigentes'
                        }
                    />
                    <StatCard
                        title="Posiciones Abiertas"
                        value={s.open_positions}
                        icon={UserPlus}
                        color="from-teal-500 to-teal-600"
                        subtitle="En proceso de reclutamiento"
                    />
                </div>

                {/* ─── Row 3: Financiero ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                        title="Nómina del Mes"
                        value={formatCurrency(s.total_payroll_this_month)}
                        icon={DollarSign}
                        color="from-emerald-500 to-green-600"
                        subtitle="Total net pay este mes"
                    />
                    <StatCard
                        title="Comisiones Pendientes"
                        value={formatCurrency(s.pending_commissions)}
                        icon={TrendingUp}
                        color="from-rose-500 to-pink-600"
                        subtitle="Por liquidar a agentes"
                    />
                </div>

                {/* ─── Row 4: Alertas y Accesos Rápidos ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alertas */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Alertas Activas
                        </h3>
                        <div className="space-y-2">
                            {s.pending_leaves > 0 && (
                                <div className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                                    <CalendarOff className="w-4 h-4 text-amber-600" />
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-amber-800">{s.pending_leaves} solicitudes de ausencia pendientes</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-amber-400" />
                                </div>
                            )}
                            {s.expiring_contracts > 0 && (
                                <div className="flex items-center gap-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                                    <FileText className="w-4 h-4 text-red-600" />
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-red-800">{s.expiring_contracts} contratos por vencer en 30 días</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-red-400" />
                                </div>
                            )}
                            {s.absent_today > 0 && (
                                <div className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                                    <UserX className="w-4 h-4 text-orange-600" />
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-orange-800">{s.absent_today} empleados ausentes hoy</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-orange-400" />
                                </div>
                            )}
                            {s.pending_leaves === 0 && s.expiring_contracts === 0 && s.absent_today === 0 && (
                                <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-800">Sin alertas pendientes ✨</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Nuevo Empleado', href: '/dashboard/rrhh/employees?new=true', icon: Users, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                                { label: 'Nuevo Agente', href: '/dashboard/rrhh/agents?new=true', icon: Briefcase, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                                { label: 'Registrar Asistencia', href: '/dashboard/rrhh/attendance', icon: Clock, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                                { label: 'Nueva Ausencia', href: '/dashboard/rrhh/leaves?new=true', icon: CalendarOff, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
                                { label: 'Crear Contrato', href: '/dashboard/rrhh/contracts?new=true', icon: FileText, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                                { label: 'Nuevo Candidato', href: '/dashboard/rrhh/recruitment?new=true', icon: UserPlus, color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                            ].map((action) => (
                                <a
                                    key={action.label}
                                    href={action.href}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-colors ${action.color}`}
                                >
                                    <action.icon className="w-3.5 h-3.5" />
                                    {action.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Row 5: Distribución Visual ─── */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">📊 Distribución del Personal</h3>
                    <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden">
                        {s.total_employees > 0 ? (
                            <>
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-l-lg flex items-center justify-center text-white text-[10px] font-bold transition-all"
                                    style={{ width: `${(s.internal_count / s.total_employees) * 100}%`, minWidth: s.internal_count > 0 ? '60px' : '0' }}
                                >
                                    Internos {s.internal_count}
                                </div>
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-full flex items-center justify-center text-white text-[10px] font-bold transition-all"
                                    style={{ width: `${(s.agent_count / s.total_employees) * 100}%`, minWidth: s.agent_count > 0 ? '60px' : '0' }}
                                >
                                    Agentes {s.agent_count}
                                </div>
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-r-lg flex items-center justify-center text-white text-[10px] font-bold transition-all"
                                    style={{ width: `${(s.freelance_count / s.total_employees) * 100}%`, minWidth: s.freelance_count > 0 ? '60px' : '0' }}
                                >
                                    Freelance {s.freelance_count}
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-100 h-full w-full rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                Sin registros aún
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
