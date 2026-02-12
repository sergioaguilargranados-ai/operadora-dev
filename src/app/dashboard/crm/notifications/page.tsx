"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
    Bell, BellOff, CheckCheck, Flame, Clock, AlertTriangle,
    ChevronRight, Loader2, RefreshCw, Filter, X, Zap,
    Eye, EyeOff, Trash2, ExternalLink, Sparkles
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface Notification {
    id: number
    notification_type: string
    priority: string
    title: string
    message: string | null
    action_url: string | null
    action_label: string | null
    is_read: boolean
    is_dismissed: boolean
    contact_name: string | null
    contact_score: number | null
    contact_is_hot: boolean
    created_at: string
    expires_at: string | null
}

// ═════════════════════════
// CONSTANTS
// ═════════════════════════
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Flame }> = {
    critical: { label: 'Crítica', color: '#EF4444', bg: 'bg-red-50 border-red-200', icon: Flame },
    high: { label: 'Alta', color: '#F97316', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle },
    medium: { label: 'Media', color: '#3B82F6', bg: 'bg-blue-50 border-blue-200', icon: Bell },
    low: { label: 'Baja', color: '#6B7280', bg: 'bg-slate-50 border-slate-200', icon: BellOff },
}

const TYPE_ICONS: Record<string, string> = {
    hot_lead_stale: '🔥',
    task_overdue: '⏰',
    contact_stale: '⚠️',
    automation: '⚡',
    stage_change: '📊',
    new_lead: '🆕',
    quote_reminder: '💰',
    booking_update: '📅',
    system: '⚙️',
}

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function NotificationsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [total, setTotal] = useState(0)
    const [unread, setUnread] = useState(0)

    // Filters
    const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all')
    const [filterPriority, setFilterPriority] = useState<string>('')
    const [generating, setGenerating] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filterRead === 'unread') params.set('is_read', 'false')
            if (filterRead === 'read') params.set('is_read', 'true')
            if (filterPriority) params.set('priority', filterPriority)
            params.set('limit', '100')

            const res = await fetch(`/api/crm/notifications?${params}`)
            const json = await res.json()
            if (json.success) {
                setNotifications(json.data || [])
                setTotal(json.meta?.total || 0)
                setUnread(json.meta?.unread || 0)
            }
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar las notificaciones', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [filterRead, filterPriority, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchNotifications()
    }, [isAuthenticated, fetchNotifications, router])

    const handleMarkRead = async (id: number) => {
        await fetch('/api/crm/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', notification_id: id }),
        })
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnread(prev => Math.max(prev - 1, 0))
    }

    const handleDismiss = async (id: number) => {
        await fetch('/api/crm/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dismiss', notification_id: id }),
        })
        setNotifications(prev => prev.filter(n => n.id !== id))
        setTotal(prev => prev - 1)
    }

    const handleMarkAllRead = async () => {
        const res = await fetch('/api/crm/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_all_read' }),
        })
        const json = await res.json()
        if (json.success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnread(0)
            toast({ title: '✅ Todas marcadas como leídas' })
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/crm/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' }),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: '⚡ Notificaciones generadas', description: `${json.data?.generated || 0} nuevas notificaciones` })
                fetchNotifications()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setGenerating(false)
        }
    }

    const getTimeAgo = (dateStr: string): string => {
        const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
        if (seconds < 60) return 'ahora'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
        return `${Math.floor(seconds / 86400)}d`
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    // Group by priority
    const critical = notifications.filter(n => n.priority === 'critical')
    const high = notifications.filter(n => n.priority === 'high')
    const medium = notifications.filter(n => n.priority === 'medium')
    const low = notifications.filter(n => n.priority === 'low')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-blue-600" />
                            {unread > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Notificaciones</h1>
                            <p className="text-xs text-muted-foreground">
                                {total} total · {unread} sin leer
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline" size="sm"
                            className="rounded-full gap-1.5 text-xs"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Generar
                        </Button>
                        {unread > 0 && (
                            <Button
                                variant="outline" size="sm"
                                className="rounded-full gap-1.5 text-xs"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> Leer todas
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={fetchNotifications}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-4xl space-y-5">
                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'Todas' },
                        { key: 'unread', label: `Sin leer (${unread})` },
                        { key: 'read', label: 'Leídas' },
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${filterRead === f.key
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border hover:bg-slate-50'
                                }`}
                            onClick={() => setFilterRead(f.key as typeof filterRead)}
                        >
                            {f.label}
                        </button>
                    ))}
                    <span className="w-px h-5 bg-slate-200 mx-1" />
                    {['critical', 'high', 'medium', 'low'].map(p => {
                        const cfg = PRIORITY_CONFIG[p]
                        return (
                            <button
                                key={p}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterPriority === p
                                        ? 'text-white shadow-md'
                                        : 'bg-white text-slate-600 border hover:bg-slate-50'
                                    }`}
                                style={filterPriority === p ? { backgroundColor: cfg.color } : undefined}
                                onClick={() => setFilterPriority(filterPriority === p ? '' : p)}
                            >
                                {cfg.label}
                            </button>
                        )
                    })}
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Críticas', count: critical.length, color: '#EF4444', icon: Flame },
                        { label: 'Altas', count: high.length, color: '#F97316', icon: AlertTriangle },
                        { label: 'Medias', count: medium.length, color: '#3B82F6', icon: Bell },
                        { label: 'Bajas', count: low.length, color: '#6B7280', icon: BellOff },
                    ].map((s, i) => (
                        <Card key={i} className="p-3 text-center border-0 bg-white shadow-sm">
                            <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                            <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{s.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Notification List */}
                {notifications.length === 0 ? (
                    <Card className="p-12 text-center border border-slate-200/60">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-500">Sin notificaciones</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Haz clic en &quot;Generar&quot; para crear notificaciones automáticas
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notifications.map(notif => {
                            const pCfg = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.medium
                            const typeIcon = TYPE_ICONS[notif.notification_type] || '📋'
                            const PIcon = pCfg.icon

                            return (
                                <Card
                                    key={notif.id}
                                    className={`p-0 overflow-hidden border transition-all hover:shadow-md ${!notif.is_read ? pCfg.bg : 'bg-white border-slate-200/60 opacity-75'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 p-4">
                                        {/* Priority indicator */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: pCfg.color }}
                                            >
                                                <PIcon className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-base">{typeIcon}</span>
                                                <h3 className={`text-sm font-semibold line-clamp-1 ${!notif.is_read ? 'text-slate-800' : 'text-slate-600'
                                                    }`}>
                                                    {notif.title}
                                                </h3>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            {notif.message && (
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-1.5">
                                                    {notif.message}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                <span>{getTimeAgo(notif.created_at)}</span>
                                                {notif.contact_name && (
                                                    <span className="flex items-center gap-1">
                                                        👤 {notif.contact_name}
                                                        {notif.contact_is_hot && <Flame className="w-3 h-3 text-orange-400" />}
                                                    </span>
                                                )}
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                                                    style={{ backgroundColor: `${pCfg.color}15`, color: pCfg.color }}>
                                                    {pCfg.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {notif.action_url && (
                                                <Button
                                                    variant="ghost" size="sm"
                                                    className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
                                                    onClick={() => router.push(notif.action_url!)}
                                                    title={notif.action_label || 'Ver'}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            {!notif.is_read && (
                                                <Button
                                                    variant="ghost" size="sm"
                                                    className="h-7 w-7 p-0 text-slate-400 hover:text-green-600"
                                                    onClick={() => handleMarkRead(notif.id)}
                                                    title="Marcar como leída"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost" size="sm"
                                                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                                                onClick={() => handleDismiss(notif.id)}
                                                title="Descartar"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
