"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    Brain, Zap, TrendingUp, AlertTriangle, ChevronRight,
    Loader2, Target, Clock, ShieldCheck, ArrowUpRight,
    ArrowDownRight, Minus, RefreshCw, Eye
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface PredictiveSignal {
    name: string
    value: number
    weight: number
    direction: 'positive' | 'negative' | 'neutral'
    description: string
}

interface PredictiveScore {
    contact_id: number
    current_score: number
    predicted_score: number
    conversion_probability: number
    predicted_days_to_close: number | null
    risk_level: 'low' | 'medium' | 'high'
    confidence: number
    signals: PredictiveSignal[]
    recommendations: string[]
}

const SIGNAL_LABELS: Record<string, string> = {
    engagement_velocity: '⚡ Velocidad de engagement',
    activity_recency: '🕐 Recencia de actividad',
    pipeline_progress: '📊 Progreso en pipeline',
    score_trajectory: '📈 Trayectoria de score',
    data_completeness: '📝 Completitud de datos',
    task_completion: '✅ Tareas completadas',
}

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Bajo', color: 'text-green-600', bg: 'bg-green-100' },
    medium: { label: 'Medio', color: 'text-amber-600', bg: 'bg-amber-100' },
    high: { label: 'Alto', color: 'text-red-600', bg: 'bg-red-100' },
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function PredictivePage() {
    const router = useRouter()
    const [predictions, setPredictions] = useState<PredictiveScore[]>([])
    const [selectedPrediction, setSelectedPrediction] = useState<PredictiveScore | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPredictions()
    }, [])

    const loadPredictions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/crm/predictive?action=top_predictions&limit=25')
            const json = await res.json()
            if (json.success) setPredictions(json.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    // Stats
    const avgProbability = predictions.length > 0
        ? Math.round(predictions.reduce((a, p) => a + p.conversion_probability, 0) / predictions.length)
        : 0
    const highProb = predictions.filter(p => p.conversion_probability >= 60).length
    const atRisk = predictions.filter(p => p.risk_level === 'high').length
    const avgDays = predictions.filter(p => p.predicted_days_to_close != null).length > 0
        ? Math.round(predictions.filter(p => p.predicted_days_to_close != null)
            .reduce((a, p) => a + (p.predicted_days_to_close || 0), 0)
            / predictions.filter(p => p.predicted_days_to_close != null).length)
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Brain className="w-5 h-5 text-purple-400" />
                            Scoring Predictivo
                        </h1>
                        <p className="text-xs text-gray-400">Predicción de conversión por análisis de patrones</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={loadPredictions}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-6xl">

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                        <div className="text-3xl font-bold text-purple-400">{avgProbability}%</div>
                        <div className="text-xs text-gray-400 mt-1">Prob. promedio</div>
                    </Card>
                    <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                        <div className="text-3xl font-bold text-green-400">{highProb}</div>
                        <div className="text-xs text-gray-400 mt-1">Alta probabilidad (60%+)</div>
                    </Card>
                    <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                        <div className="text-3xl font-bold text-red-400">{atRisk}</div>
                        <div className="text-xs text-gray-400 mt-1">En riesgo</div>
                    </Card>
                    <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                        <div className="text-3xl font-bold text-cyan-400">{avgDays}d</div>
                        <div className="text-xs text-gray-400 mt-1">Días promedio al cierre</div>
                    </Card>
                </div>

                <div className="flex gap-5 flex-col lg:flex-row">
                    {/* ═══════ LISTA DE PREDICCIONES ═══════ */}
                    <div className="flex-1">
                        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">
                            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-200">
                                    🎯 Ranking de conversión ({predictions.length} contactos)
                                </h2>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700/50">
                                    {predictions.map((p, i) => {
                                        const risk = RISK_CONFIG[p.risk_level]
                                        const isSelected = selectedPrediction?.contact_id === p.contact_id

                                        return (
                                            <div
                                                key={p.contact_id}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                                    ${isSelected ? 'bg-purple-900/30' : 'hover:bg-slate-800/40'}
                                                `}
                                                onClick={() => setSelectedPrediction(p)}
                                            >
                                                {/* Ranking */}
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        i === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                            i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-slate-700 text-gray-400'
                                                    }`}>
                                                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                                                </div>

                                                {/* Probabilidad */}
                                                <div className="w-16 flex-shrink-0">
                                                    <div className="text-lg font-bold text-white">{p.conversion_probability}%</div>
                                                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${p.conversion_probability}%`,
                                                                background: p.conversion_probability >= 60
                                                                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                                                                    : p.conversion_probability >= 35
                                                                        ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                                                                        : 'linear-gradient(90deg, #EF4444, #F87171)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-200 font-medium truncate">
                                                        Contacto #{p.contact_id}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-500">
                                                            Score: {p.current_score} → {p.predicted_score}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${risk.bg} ${risk.color}`}>
                                                            Riesgo: {risk.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Días al cierre */}
                                                <div className="text-right flex-shrink-0">
                                                    {p.predicted_days_to_close != null && (
                                                        <>
                                                            <div className="text-sm font-semibold text-gray-300">{p.predicted_days_to_close}d</div>
                                                            <div className="text-[9px] text-gray-500">al cierre</div>
                                                        </>
                                                    )}
                                                </div>

                                                <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ═══════ DETALLE DE PREDICCIÓN ═══════ */}
                    <div className="w-full lg:w-80 space-y-4">
                        {selectedPrediction ? (
                            <>
                                {/* Header */}
                                <Card className="p-4 bg-gradient-to-br from-purple-900/50 to-slate-800/50 border-purple-700/50">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-1">
                                            {selectedPrediction.conversion_probability}%
                                        </div>
                                        <div className="text-xs text-purple-300">Probabilidad de conversión</div>
                                        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-gray-400">
                                            <ShieldCheck className="w-3 h-3" />
                                            Confianza: {selectedPrediction.confidence}%
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                                            <div className="text-sm font-bold text-cyan-400">{selectedPrediction.predicted_days_to_close || '—'}d</div>
                                            <div className="text-[9px] text-gray-400">Días al cierre</div>
                                        </div>
                                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                                            <div className="text-sm font-bold text-amber-400">
                                                {selectedPrediction.current_score} → {selectedPrediction.predicted_score}
                                            </div>
                                            <div className="text-[9px] text-gray-400">Score</div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Señales */}
                                <Card className="p-4 bg-slate-800/30 border-slate-700">
                                    <h3 className="text-xs font-semibold text-gray-300 mb-3">📊 Señales predictivas</h3>
                                    <div className="space-y-2.5">
                                        {selectedPrediction.signals.map(s => (
                                            <div key={s.name}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        {SIGNAL_LABELS[s.name] || s.name}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px]">
                                                        {s.direction === 'positive' ? (
                                                            <ArrowUpRight className="w-3 h-3 text-green-400" />
                                                        ) : s.direction === 'negative' ? (
                                                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                                                        ) : (
                                                            <Minus className="w-3 h-3 text-gray-500" />
                                                        )}
                                                        <span className="text-gray-300 font-medium">{s.value}</span>
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(s.value, 100)}%`,
                                                            background: s.direction === 'positive' ? '#10B981'
                                                                : s.direction === 'negative' ? '#EF4444' : '#6B7280',
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-[9px] text-gray-500 mt-0.5">{s.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Recomendaciones */}
                                <Card className="p-4 bg-slate-800/30 border-slate-700">
                                    <h3 className="text-xs font-semibold text-gray-300 mb-2">💡 Recomendaciones</h3>
                                    <div className="space-y-1.5">
                                        {selectedPrediction.recommendations.map((r, i) => (
                                            <div key={i} className="text-[11px] text-gray-400 leading-relaxed">
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Acciones */}
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg"
                                    onClick={() => router.push(`/dashboard/crm/contacts/${selectedPrediction.contact_id}`)}
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Ver contacto 360°
                                </Button>
                            </>
                        ) : (
                            <Card className="p-8 bg-slate-800/30 border-slate-700 text-center">
                                <Brain className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
                                <p className="text-sm text-gray-400">Selecciona un contacto para ver el análisis predictivo</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
