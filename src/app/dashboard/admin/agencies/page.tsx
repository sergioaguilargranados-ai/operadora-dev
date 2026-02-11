"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import {
    Building2, Users, DollarSign, TrendingUp, Briefcase,
    Loader2, Eye, Shield, Globe, ArrowUpRight, BarChart3
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
// Componente
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
                setAgencies(data.data.agencies)
                setGlobal(data.data.global)
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
            <PageHeader showBackButton={true} backButtonHref="/dashboard">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        Panel de Super Admin
                    </h1>
                    <p className="text-sm text-slate-400">Vista global de todas las agencias</p>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-6 max-w-7xl">

                {/* ═══ STATS GLOBALES ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-5 bg-white/10 backdrop-blur-sm border-white/10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-indigo-300" />
                                <span className="text-xs text-slate-300">Agencias</span>
                            </div>
                            <h3 className="text-3xl font-bold">{global?.total_agencies || 0}</h3>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="p-5 bg-white/10 backdrop-blur-sm border-white/10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-300" />
                                <span className="text-xs text-slate-300">Agentes</span>
                            </div>
                            <h3 className="text-3xl font-bold">{global?.total_agents || 0}</h3>
                            <p className="text-xs text-slate-400 mt-1">{global?.total_clients || 0} clientes</p>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="p-5 bg-white/10 backdrop-blur-sm border-white/10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-green-300" />
                                <span className="text-xs text-slate-300">Reservas</span>
                            </div>
                            <h3 className="text-3xl font-bold">{global?.total_bookings || 0}</h3>
                            <p className="text-xs text-green-300 mt-1">{formatCurrency(global?.total_revenue || 0)}</p>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card className="p-5 bg-white/10 backdrop-blur-sm border-white/10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-yellow-300" />
                                <span className="text-xs text-slate-300">Comisiones</span>
                            </div>
                            <h3 className="text-3xl font-bold">{formatCurrency(global?.total_commissions || 0)}</h3>
                            <div className="flex gap-2 text-xs mt-1">
                                <span className="text-yellow-300">⏳ {formatCurrency(global?.pending_commissions || 0)}</span>
                                <span className="text-green-300">✅ {formatCurrency(global?.available_commissions || 0)}</span>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* ═══ GRÁFICA COMPARATIVA ═══ */}
                {chartData.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="p-6 mb-8 bg-white/5 backdrop-blur-sm border-white/10">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <BarChart3 className="w-5 h-5 text-indigo-300" />
                                Comparativa de Agencias
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1E293B',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#F1F5F9'
                                        }}
                                    />
                                    <Bar dataKey="reservas" fill="#818CF8" radius={[4, 4, 0, 0]} name="Reservas" />
                                    <Bar dataKey="agentes" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Agentes" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                )}

                {/* ═══ LISTA DE AGENCIAS ═══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-300" />
                            Agencias Registradas
                        </h3>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            {agencies.length} agencias
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {agencies.map((agency, i) => (
                            <motion.div
                                key={agency.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <Card className="p-5 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                                    onClick={() => router.push(`/dashboard/agency?id=${agency.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {agency.company_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition">
                                                    {agency.company_name}
                                                </h4>
                                                <p className="text-sm text-slate-400">{agency.slug || '—'}</p>
                                                <div className="flex gap-2 mt-1.5">
                                                    <Badge className={agency.is_active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                                                        {agency.is_active ? '● Activa' : '○ Inactiva'}
                                                    </Badge>
                                                    <Badge className="bg-white/10 text-slate-300 border-white/10">
                                                        {parseInt(String(agency.total_agents))} agentes
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 items-center">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-slate-400">Clientes</p>
                                                <p className="text-lg font-bold text-white">{parseInt(String(agency.total_clients))}</p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-slate-400">Reservas</p>
                                                <p className="text-lg font-bold text-white">{parseInt(String(agency.total_bookings))}</p>
                                            </div>
                                            <div className="text-right hidden lg:block">
                                                <p className="text-xs text-slate-400">Revenue</p>
                                                <p className="text-lg font-bold text-green-300">{formatCurrency(parseFloat(String(agency.total_revenue)))}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">Comisiones</p>
                                                <p className="text-lg font-bold text-yellow-300">{formatCurrency(parseFloat(String(agency.total_commissions)))}</p>
                                                <div className="flex gap-1 text-xs mt-0.5">
                                                    {parseFloat(String(agency.pending_commissions)) > 0 && (
                                                        <span className="text-yellow-400">⏳{formatCurrency(parseFloat(String(agency.pending_commissions)))}</span>
                                                    )}
                                                    {parseFloat(String(agency.available_commissions)) > 0 && (
                                                        <span className="text-green-400">✅{formatCurrency(parseFloat(String(agency.available_commissions)))}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition" />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {agencies.length === 0 && (
                            <Card className="p-12 text-center bg-white/5 border-white/10">
                                <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-semibold mb-2 text-white">No hay agencias registradas</h3>
                                <p className="text-slate-400">Las agencias aparecerán aquí cuando se registren</p>
                            </Card>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
