"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    BarChart3, Mail, MousePointer, Eye, AlertTriangle,
    Loader2, TrendingUp, Trophy, Beaker, ArrowUpRight,
    ArrowDownRight, Minus, ChevronRight, RefreshCw,
    Send, Target
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface CampaignMetrics {
    campaign_id: string
    template_name: string
    sent_at: string
    total_sent: number
    total_delivered: number
    total_opened: number
    total_clicked: number
    total_bounced: number
    open_rate: number
    click_rate: number
    bounce_rate: number
    ctr: number
}

interface Summary {
    total_campaigns: number
    total_emails_sent: number
    avg_open_rate: number
    avg_click_rate: number
    best_performing_template: string
    campaigns: CampaignMetrics[]
}

interface TimelinePoint {
    date: string
    sent: number
    opened: number
    clicked: number
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function CampaignMetricsPage() {
    const router = useRouter()
    const [summary, setSummary] = useState<Summary | null>(null)
    const [timeline, setTimeline] = useState<TimelinePoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [sumRes, tlRes] = await Promise.all([
                fetch('/api/crm/metrics?action=summary'),
                fetch('/api/crm/metrics?action=timeline'),
            ])
            const sumJson = await sumRes.json()
            const tlJson = await tlRes.json()
            if (sumJson.success) setSummary(sumJson.data)
            if (tlJson.success) setTimeline(tlJson.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        )
    }

    const s = summary || { total_campaigns: 0, total_emails_sent: 0, avg_open_rate: 0, avg_click_rate: 0, best_performing_template: 'N/A', campaigns: [] }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-pink-600" />
                            Métricas de Campañas
                        </h1>
                        <p className="text-xs text-gray-500">Open rate, clicks, A/B testing</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={loadData}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Actualizar
                    </Button>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-6xl">

                {/* KPIs principales */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <Card className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                        <Mail className="w-4 h-4 mb-1 opacity-80" />
                        <div className="text-2xl font-bold">{s.total_campaigns}</div>
                        <div className="text-[10px] text-pink-100">Campañas totales</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <Send className="w-4 h-4 mb-1 opacity-80" />
                        <div className="text-2xl font-bold">{s.total_emails_sent.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-100">Emails enviados</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <Eye className="w-4 h-4 mb-1 opacity-80" />
                        <div className="text-2xl font-bold">{s.avg_open_rate}%</div>
                        <div className="text-[10px] text-green-100">Open rate promedio</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <MousePointer className="w-4 h-4 mb-1 opacity-80" />
                        <div className="text-2xl font-bold">{s.avg_click_rate}%</div>
                        <div className="text-[10px] text-purple-100">Click rate promedio</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white col-span-2 md:col-span-1">
                        <Trophy className="w-4 h-4 mb-1 opacity-80" />
                        <div className="text-sm font-bold truncate">{s.best_performing_template}</div>
                        <div className="text-[10px] text-amber-100">Mejor template</div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Timeline */}
                    <Card className="p-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-pink-500" />
                            Actividad últimos 30 días
                        </h3>
                        {timeline.length > 0 ? (
                            <div className="relative h-48 flex items-end gap-1">
                                {timeline.map((t, i) => {
                                    const maxVal = Math.max(...timeline.map(tp => tp.sent), 1)
                                    const sendH = (t.sent / maxVal) * 100
                                    const openH = (t.opened / maxVal) * 100
                                    const clickH = (t.clicked / maxVal) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                                            <div className="w-full flex flex-col items-center gap-0">
                                                <div
                                                    className="w-full bg-pink-200 rounded-t-sm transition-all"
                                                    style={{ height: `${sendH}%`, minHeight: t.sent > 0 ? 2 : 0 }}
                                                />
                                                <div
                                                    className="w-full bg-green-400 transition-all"
                                                    style={{ height: `${openH}%`, minHeight: t.opened > 0 ? 2 : 0 }}
                                                />
                                                <div
                                                    className="w-full bg-purple-500 rounded-b-sm transition-all"
                                                    style={{ height: `${clickH}%`, minHeight: t.clicked > 0 ? 2 : 0 }}
                                                />
                                            </div>
                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {new Date(t.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                                <br />📤 {t.sent} 👁 {t.opened} 🖱 {t.clicked}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                                Sin datos de actividad aún
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-pink-200 rounded" /> Enviados</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded" /> Abiertos</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded" /> Clicks</span>
                        </div>
                    </Card>

                    {/* Benchmarks */}
                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-pink-500" />
                            Benchmarks Industria
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Open Rate', value: s.avg_open_rate, benchmark: 21, unit: '%' },
                                { label: 'Click Rate', value: s.avg_click_rate, benchmark: 2.6, unit: '%' },
                                { label: 'Bounce Rate', value: s.campaigns.length > 0 ? Math.round(s.campaigns.reduce((a, c) => a + c.bounce_rate, 0) / s.campaigns.length) : 0, benchmark: 1.1, unit: '%' },
                            ].map(b => {
                                const diff = b.value - b.benchmark
                                const isGood = b.label === 'Bounce Rate' ? diff < 0 : diff > 0
                                return (
                                    <div key={b.label}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-600">{b.label}</span>
                                            <span className={`flex items-center gap-0.5 font-bold ${isGood ? 'text-green-500' : diff === 0 ? 'text-gray-400' : 'text-red-500'
                                                }`}>
                                                {isGood ? <ArrowUpRight className="w-3 h-3" /> : diff === 0 ? <Minus className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {b.value}{b.unit}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isGood ? 'bg-green-400' : 'bg-red-400'}`}
                                                style={{ width: `${Math.min(100, (b.value / Math.max(b.benchmark * 2, 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[9px] text-gray-400 mt-0.5">Benchmark: {b.benchmark}{b.unit}</div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="border-t mt-4 pt-3">
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                <Beaker className="w-3 h-3" /> A/B Testing
                            </h4>
                            <Button
                                variant="outline"
                                className="w-full text-xs h-8"
                                onClick={() => router.push('/dashboard/crm/campaigns')}
                            >
                                Crear test A/B →
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Lista de campañas */}
                <Card className="p-4 mt-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-pink-500" />
                        Campañas recientes
                    </h3>
                    {s.campaigns.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b">
                                        <th className="py-2 pr-4">Campaña</th>
                                        <th className="py-2 pr-4">Enviados</th>
                                        <th className="py-2 pr-4">Open Rate</th>
                                        <th className="py-2 pr-4">Click Rate</th>
                                        <th className="py-2 pr-4">CTR</th>
                                        <th className="py-2 pr-4">Bounce</th>
                                        <th className="py-2">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {s.campaigns.map(c => (
                                        <tr key={c.campaign_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-2.5 pr-4">
                                                <div className="font-medium text-gray-700">{c.template_name || c.campaign_id}</div>
                                            </td>
                                            <td className="py-2.5 pr-4 text-gray-500">{c.total_sent}</td>
                                            <td className="py-2.5 pr-4">
                                                <span className={`font-bold ${c.open_rate >= 21 ? 'text-green-500' : c.open_rate >= 15 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {c.open_rate}%
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-4">
                                                <span className={`font-bold ${c.click_rate >= 3 ? 'text-green-500' : c.click_rate >= 1 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {c.click_rate}%
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-4 text-gray-500">{c.ctr}%</td>
                                            <td className="py-2.5 pr-4">
                                                <span className={c.bounce_rate > 2 ? 'text-red-500' : 'text-gray-400'}>
                                                    {c.bounce_rate}%
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-gray-400">
                                                {c.sent_at ? new Date(c.sent_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Aún no hay campañas registradas</p>
                            <p className="text-[10px] text-gray-300 mt-1">Las métricas aparecerán cuando envíes campañas de email</p>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    )
}
