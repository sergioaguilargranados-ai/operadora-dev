"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import {
    Users, UserPlus, DollarSign, TrendingUp, Briefcase, Link2, Search,
    Loader2, Eye, Edit, BarChart3, Wallet, Clock, CheckCircle,
    Copy, Plus, ArrowUpRight, ArrowDownRight, ChevronRight, Building2,
    Download, Filter, CreditCard, Send, AlertCircle
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

// ═══════════════════════════════════════
// Tipos
// ═══════════════════════════════════════

interface AgencyStats {
    total_agents: number
    active_agents: number
    total_clients: number
    total_bookings: number
    total_revenue: number
    total_commissions: number
    pending_commissions: number
    available_commissions: number
    paid_commissions: number
    top_agents: Array<{
        agent_name: string
        total_clients: number
        total_bookings: number
        total_commissions: number
    }>
}

interface Agent {
    id: number
    user_id: number
    tenant_id: number
    role: string
    referral_code: string | null
    agent_phone: string | null
    agent_commission_split: number
    agent_status: string
    is_active: boolean
    agent_name: string
    agent_email: string
}

interface AgencyClient {
    id: number
    client_name: string
    client_email: string
    client_phone: string
    source: string
    status: string
    total_bookings: number
    total_revenue: number
    created_at: string
}

interface Commission {
    id: number
    booking_type: string
    agent_name: string
    base_price: number
    commission_amount: number
    agent_commission_amount: number
    agency_commission_amount: number
    status: string
    created_at: string
    booking_reference?: string
    destination?: string
}

const COLORS = ['#FF6B00', '#0066FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// ═══════════════════════════════════════
// Componente Principal
// ═══════════════════════════════════════

export default function AgencyDashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [stats, setStats] = useState<AgencyStats | null>(null)
    const [agents, setAgents] = useState<Agent[]>([])
    const [clients, setClients] = useState<AgencyClient[]>([])
    const [commissions, setCommissions] = useState<Commission[]>([])
    const [commissionsLoaded, setCommissionsLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'clients' | 'commissions'>('overview')
    const [searchQuery, setSearchQuery] = useState('')

    // Modal crear agente
    const [showAgentModal, setShowAgentModal] = useState(false)
    const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '', password: '', commission_split: 10 })

    // Dispersión
    const [showDisburseModal, setShowDisburseModal] = useState(false)
    const [disburseForm, setDisburseForm] = useState({ payment_method: 'transfer', payment_reference: '', notes: '' })
    const [disbursing, setDisbursing] = useState(false)

    // Filtros de comisiones
    const [commFilterStatus, setCommFilterStatus] = useState<string>('all')
    const [commFilterDateFrom, setCommFilterDateFrom] = useState('')
    const [commFilterDateTo, setCommFilterDateTo] = useState('')

    // TODO: Obtener del contexto de autenticación
    const agencyId = 2 // M&MTravelAgency ID temporal

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchData()
    }, [isAuthenticated])

    // Cargar comisiones al entrar al tab
    useEffect(() => {
        if (activeTab === 'commissions' && !commissionsLoaded) {
            fetchCommissions()
        }
    }, [activeTab])

    const fetchCommissions = async () => {
        try {
            const res = await fetch(`/api/agency/commissions?agency_id=${agencyId}`)
            const data = await res.json()
            if (data.success) {
                setCommissions(data.data.commissions || [])
                setCommissionsLoaded(true)
            }
        } catch (error) {
            console.error('Error fetching commissions:', error)
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, agentsRes, clientsRes] = await Promise.all([
                fetch(`/api/agency/dashboard/stats?agency_id=${agencyId}`),
                fetch(`/api/agency/agents?agency_id=${agencyId}`),
                fetch(`/api/agency/clients?agency_id=${agencyId}`)
            ])

            const [statsData, agentsData, clientsData] = await Promise.all([
                statsRes.json(),
                agentsRes.json(),
                clientsRes.json()
            ])

            if (statsData.success) setStats(statsData.data)
            if (agentsData.success) setAgents(agentsData.data)
            if (clientsData.success) setClients(clientsData.data)
        } catch (error) {
            console.error('Error fetching agency data:', error)
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

    const handleCreateAgent = async () => {
        if (!newAgent.name || !newAgent.email || !newAgent.password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nombre, email y contraseña son obligatorios' })
            return
        }

        try {
            const res = await fetch('/api/agency/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    name: newAgent.name,
                    email: newAgent.email,
                    phone: newAgent.phone,
                    password: newAgent.password,
                    commission_split: newAgent.commission_split
                })
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: '✅ Agente creado', description: `${newAgent.name} agregado exitosamente` })
                setShowAgentModal(false)
                setNewAgent({ name: '', email: '', phone: '', password: '', commission_split: 10 })
                fetchData()
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.message || data.error })
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el agente' })
        }
    }

    const handleDisburse = async () => {
        if (!disburseForm.payment_reference) {
            toast({ variant: 'destructive', title: 'Error', description: 'La referencia de pago es obligatoria' })
            return
        }
        try {
            setDisbursing(true)
            const res = await fetch('/api/agency/commissions/disburse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    payment_method: disburseForm.payment_method,
                    payment_reference: disburseForm.payment_reference,
                    notes: disburseForm.notes
                })
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: '✅ Dispersión exitosa',
                    description: `${data.data.commissions_paid} comisiones pagadas. Lote: ${data.data.batch_reference}`
                })
                setShowDisburseModal(false)
                setDisburseForm({ payment_method: 'transfer', payment_reference: '', notes: '' })
                setCommissionsLoaded(false)
                fetchData()
                fetchCommissions()
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || 'No se pudo dispersar' })
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Error al dispersar comisiones' })
        } finally {
            setDisbursing(false)
        }
    }

    const handleExportCSV = () => {
        let url = `/api/agency/commissions/export?agency_id=${agencyId}&format=csv`
        if (commFilterStatus !== 'all') url += `&status=${commFilterStatus}`
        if (commFilterDateFrom) url += `&date_from=${commFilterDateFrom}`
        if (commFilterDateTo) url += `&date_to=${commFilterDateTo}`
        window.open(url, '_blank')
    }

    const filteredCommissions = commissions.filter(c => {
        if (commFilterStatus !== 'all' && c.status !== commFilterStatus) return false
        if (commFilterDateFrom && new Date(c.created_at) < new Date(commFilterDateFrom)) return false
        if (commFilterDateTo && new Date(c.created_at) > new Date(commFilterDateTo + 'T23:59:59')) return false
        return true
    })

    const availableCount = commissions.filter(c => c.status === 'available').length

    const copyReferralLink = (code: string) => {
        const url = `https://mmta.app.asoperadora.com/?r=${code}`
        navigator.clipboard.writeText(url)
        toast({ title: '📋 Link copiado', description: url })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // ═══════════════════════════════════════
    // Datos para gráficas
    // ═══════════════════════════════════════

    const commissionData = [
        { name: 'Pendiente', value: stats?.pending_commissions || 0, color: '#FFBB28' },
        { name: 'Disponible', value: stats?.available_commissions || 0, color: '#00C49F' },
        { name: 'Pagada', value: stats?.paid_commissions || 0, color: '#0066FF' }
    ].filter(d => d.value > 0)

    const agentPerformance = (stats?.top_agents || []).map(a => ({
        name: a.agent_name?.split(' ')[0] || 'N/A',
        clientes: a.total_clients,
        reservas: a.total_bookings,
        comisiones: a.total_commissions
    }))

    // ═══════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
            <PageHeader showBackButton={true} backButtonHref="/dashboard">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Dashboard de Agencia
                    </h1>
                    <p className="text-sm text-muted-foreground">M&M Travel Agency</p>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Resumen', icon: BarChart3 },
                        { id: 'agents', label: 'Agentes', icon: Users },
                        { id: 'clients', label: 'Clientes', icon: UserPlus },
                        { id: 'commissions', label: 'Comisiones', icon: Wallet }
                    ].map(tab => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'outline'}
                            className={`gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : ''}`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* ═══ TAB: RESUMEN ═══ */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">{stats?.active_agents || 0} activos</Badge>
                                    </div>
                                    <h3 className="text-3xl font-bold">{stats?.total_agents || 0}</h3>
                                    <p className="text-sm text-muted-foreground">Agentes</p>
                                </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <UserPlus className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold">{stats?.total_clients || 0}</h3>
                                    <p className="text-sm text-muted-foreground">Clientes</p>
                                </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold">{stats?.total_bookings || 0}</h3>
                                    <p className="text-sm text-muted-foreground">Reservas</p>
                                    <p className="text-xs text-green-600 mt-1">{formatCurrency(stats?.total_revenue || 0)} ingresos</p>
                                </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-yellow-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold">{formatCurrency(stats?.total_commissions || 0)}</h3>
                                    <p className="text-sm text-muted-foreground">Comisiones totales</p>
                                    <div className="flex gap-3 mt-2 text-xs">
                                        <span className="text-yellow-600">⏳ {formatCurrency(stats?.pending_commissions || 0)}</span>
                                        <span className="text-green-600">✅ {formatCurrency(stats?.available_commissions || 0)}</span>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Gráficas */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Rendimiento de Agentes
                                    </h3>
                                    {agentPerformance.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={agentPerformance}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                <Bar dataKey="clientes" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Clientes" />
                                                <Bar dataKey="reservas" fill="#0066FF" radius={[4, 4, 0, 0]} name="Reservas" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p>Agrega agentes para ver su rendimiento</p>
                                                <Button size="sm" className="mt-3 bg-orange-500 hover:bg-orange-600" onClick={() => setShowAgentModal(true)}>
                                                    <Plus className="w-4 h-4 mr-1" /> Agregar Agente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Wallet className="w-5 h-5" />
                                        Distribución de Comisiones
                                    </h3>
                                    {commissionData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={commissionData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                                                >
                                                    {commissionData.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p>Aún no hay comisiones registradas</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        </div>

                        {/* Top Agentes Table */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Top Agentes
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab('agents')}>
                                        Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                                {(stats?.top_agents || []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(stats?.top_agents || []).map((agent, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-orange-600">#{i + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{agent.agent_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {agent.total_clients} clientes · {agent.total_bookings} reservas
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-green-600">{formatCurrency(agent.total_commissions)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">No hay agentes registrados aún</p>
                                )}
                            </Card>
                        </motion.div>
                    </>
                )}

                {/* ═══ TAB: AGENTES ═══ */}
                {activeTab === 'agents' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar agente..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white gap-2" onClick={() => setShowAgentModal(true)}>
                                <Plus className="w-4 h-4" />
                                Nuevo Agente
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {agents
                                .filter(a => !searchQuery || a.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.agent_email?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(agent => (
                                    <Card key={agent.id} className="p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {agent.agent_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-lg">{agent.agent_name}</h4>
                                                    <p className="text-sm text-muted-foreground">{agent.agent_email}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge variant="secondary">{agent.role}</Badge>
                                                        <Badge className={agent.agent_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                            {agent.agent_status === 'active' ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                        {agent.agent_commission_split > 0 && (
                                                            <Badge variant="outline">{agent.agent_commission_split}% comisión</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {agent.referral_code && (
                                                    <Button variant="outline" size="sm" onClick={() => copyReferralLink(agent.referral_code!)}>
                                                        <Copy className="w-4 h-4 mr-1" />
                                                        {agent.referral_code}
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/agent?agent_id=${agent.id}`)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                            {agents.length === 0 && (
                                <Card className="p-12 text-center">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                    <h3 className="text-xl font-semibold mb-2">No hay agentes registrados</h3>
                                    <p className="text-muted-foreground mb-4">Crea tu primer agente para comenzar a vender</p>
                                    <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowAgentModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" /> Crear primer agente
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ═══ TAB: CLIENTES ═══ */}
                {activeTab === 'clients' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Buscar cliente..." className="pl-10" />
                            </div>
                            <Badge variant="secondary" className="text-base px-4 py-2">{clients.length} clientes</Badge>
                        </div>

                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nombre</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Teléfono</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Origen</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reservas</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clients.map(client => (
                                            <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-medium">{client.client_name || '—'}</td>
                                                <td className="p-4 text-sm text-muted-foreground">{client.client_email || '—'}</td>
                                                <td className="p-4 text-sm">{client.client_phone || '—'}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{client.source === 'referral' ? '🔗 Referido' : '✍️ Manual'}</Badge>
                                                </td>
                                                <td className="p-4 text-center font-medium">{client.total_bookings}</td>
                                                <td className="p-4 font-medium text-green-600">{formatCurrency(client.total_revenue)}</td>
                                                <td className="p-4">
                                                    <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                                                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clients.length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Aún no hay clientes registrados</p>
                                        <p className="text-sm mt-1">Los clientes aparecerán aquí cuando se registren por liga de referido</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* ═══ TAB: COMISIONES ═══ */}
                {activeTab === 'commissions' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Resumen cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                            <Card className="p-5 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                    <span className="text-sm text-yellow-700 font-medium">Pendiente</span>
                                </div>
                                <h3 className="text-2xl font-bold text-yellow-700">{formatCurrency(stats?.pending_commissions || 0)}</h3>
                                <p className="text-xs text-yellow-600/70 mt-1">Reservas confirmadas, viaje no realizado</p>
                            </Card>

                            <Card className="p-5 bg-gradient-to-br from-green-50 to-white border-green-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Disponible</span>
                                </div>
                                <h3 className="text-2xl font-bold text-green-700">{formatCurrency(stats?.available_commissions || 0)}</h3>
                                <p className="text-xs text-green-600/70 mt-1">Viajes finalizados, lista para cobro</p>
                            </Card>

                            <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-blue-700 font-medium">Pagada</span>
                                </div>
                                <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(stats?.paid_commissions || 0)}</h3>
                                <p className="text-xs text-blue-600/70 mt-1">Dispersiones realizadas</p>
                            </Card>
                        </div>

                        {/* Filtros y Acciones */}
                        <div className="flex flex-wrap gap-3 mb-4 items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select
                                    className="text-sm border rounded-md px-3 py-2 bg-background"
                                    value={commFilterStatus}
                                    onChange={(e) => setCommFilterStatus(e.target.value)}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pending">⏳ Pendiente</option>
                                    <option value="available">✅ Disponible</option>
                                    <option value="paid">💰 Pagada</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    className="w-40 text-sm"
                                    value={commFilterDateFrom}
                                    onChange={(e) => setCommFilterDateFrom(e.target.value)}
                                    placeholder="Desde"
                                />
                                <span className="text-muted-foreground text-sm">a</span>
                                <Input
                                    type="date"
                                    className="w-40 text-sm"
                                    value={commFilterDateTo}
                                    onChange={(e) => setCommFilterDateTo(e.target.value)}
                                    placeholder="Hasta"
                                />
                            </div>
                            <div className="flex-1" />
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                                <Download className="w-4 h-4" /> Exportar CSV
                            </Button>
                            {availableCount > 0 && (
                                <Button
                                    size="sm"
                                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                                    onClick={() => setShowDisburseModal(true)}
                                >
                                    <Send className="w-4 h-4" /> Dispersar ({availableCount})
                                </Button>
                            )}
                        </div>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Historial de Comisiones</h3>
                                <Badge variant="secondary" className="text-sm">{filteredCommissions.length} de {commissions.length} registros</Badge>
                            </div>
                            {filteredCommissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Agente</th>
                                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Precio Base</th>
                                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Comisión</th>
                                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Agente</th>
                                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Agencia</th>
                                                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Estado</th>
                                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredCommissions.map(comm => (
                                                <tr key={comm.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="capitalize">
                                                            {comm.booking_type === 'hotel' ? '🏨' : comm.booking_type === 'tour' ? '🌎' : comm.booking_type === 'package' ? '📦' : comm.booking_type === 'transfer' ? '🚗' : '🎭'} {comm.booking_type}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-medium">{comm.agent_name || '—'}</td>
                                                    <td className="p-3 text-right">{formatCurrency(comm.base_price)}</td>
                                                    <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(comm.commission_amount)}</td>
                                                    <td className="p-3 text-right text-sm">{formatCurrency(comm.agent_commission_amount)}</td>
                                                    <td className="p-3 text-right text-sm">{formatCurrency(comm.agency_commission_amount)}</td>
                                                    <td className="p-3 text-center">
                                                        <Badge className={
                                                            comm.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                                                comm.status === 'available' ? 'bg-green-100 text-green-700' :
                                                                    comm.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-gray-100 text-gray-500'
                                                        }>
                                                            {comm.status === 'paid' ? '💰 Pagada' : comm.status === 'available' ? '✅ Disponible' : comm.status === 'pending' ? '⏳ Pendiente' : comm.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-sm text-muted-foreground">
                                                        {new Date(comm.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No hay comisiones con estos filtros</p>
                                    <p className="text-sm mt-1">Intenta cambiar los filtros o espera a nuevas reservas</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </main>

            {/* ═══ MODAL: Dispersar Comisiones ═══ */}
            <Dialog open={showDisburseModal} onOpenChange={setShowDisburseModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-green-500" />
                            Dispersar Comisiones
                        </DialogTitle>
                        <DialogDescription>
                            Se pagarán todas las comisiones con estado "Disponible" ({availableCount} comisiones por {formatCurrency(commissions.filter(c => c.status === 'available').reduce((s, c) => s + (c.agent_commission_amount || 0), 0))}).
                            Los agentes recibirán una notificación por email.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Método de pago *</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2 bg-background mt-1"
                                value={disburseForm.payment_method}
                                onChange={(e) => setDisburseForm({ ...disburseForm, payment_method: e.target.value })}
                            >
                                <option value="transfer">💳 Transferencia bancaria</option>
                                <option value="cash">💵 Efectivo</option>
                                <option value="check">📝 Cheque</option>
                            </select>
                        </div>
                        <div>
                            <Label>Referencia de pago *</Label>
                            <Input
                                placeholder="Ej: SPEI-20260211-001"
                                value={disburseForm.payment_reference}
                                onChange={(e) => setDisburseForm({ ...disburseForm, payment_reference: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Notas (opcional)</Label>
                            <Input
                                placeholder="Dispersión quincenal febrero"
                                value={disburseForm.notes}
                                onChange={(e) => setDisburseForm({ ...disburseForm, notes: e.target.value })}
                            />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-700">
                                Esta acción marcará las comisiones como pagadas y notificará a los agentes por email. No se puede deshacer.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDisburseModal(false)}>Cancelar</Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white gap-2"
                            onClick={handleDisburse}
                            disabled={disbursing}
                        >
                            {disbursing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {disbursing ? 'Dispersando...' : 'Confirmar Dispersión'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ MODAL: Crear Agente ═══ */}
            <Dialog open={showAgentModal} onOpenChange={setShowAgentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-orange-500" />
                            Nuevo Agente
                        </DialogTitle>
                        <DialogDescription>
                            Crea un agente de ventas para tu agencia. Se le generará automáticamente un código de referido.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nombre completo *</Label>
                            <Input
                                placeholder="Juan Pérez"
                                value={newAgent.name}
                                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                placeholder="juan@mmta.com.mx"
                                value={newAgent.email}
                                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input
                                placeholder="7221234567"
                                value={newAgent.phone}
                                onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Contraseña *</Label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={newAgent.password}
                                onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>% Comisión del agente</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0} max={100}
                                    value={newAgent.commission_split}
                                    onChange={(e) => setNewAgent({ ...newAgent, commission_split: parseInt(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">% de la comisión total de la agencia</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAgentModal(false)}>Cancelar</Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreateAgent}>
                            Crear Agente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
