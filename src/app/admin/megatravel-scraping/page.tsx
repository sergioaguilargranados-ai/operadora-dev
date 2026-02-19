// src/app/admin/megatravel-scraping/page.tsx
// Panel de Scraping MegaTravel - Ejecución manual de scraping completo
// Build: 19 Feb 2026 - v2.320 - Mejorado con auth por cookie y vista de resultados
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MegaTravelScrapingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        processed: 0,
        success: 0,
        errors: 0,
        itineraryDays: 0,
        includesFound: 0,
        notIncludesFound: 0,
    });
    const [totalTours, setTotalTours] = useState(0);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    // Obtener total de tours al cargar
    useEffect(() => {
        fetch('/api/admin/megatravel?action=stats')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data?.stats?.totalPackages) {
                    setTotalTours(data.data.stats.totalPackages);
                }
            })
            .catch(() => setTotalTours(325)); // fallback
    }, []);

    const runScraping = async () => {
        setIsRunning(true);
        setLogs([]);
        setProgress(0);
        setStats({ processed: 0, success: 0, errors: 0, itineraryDays: 0, includesFound: 0, notIncludesFound: 0 });

        const BATCH_SIZE = 5;
        const total = totalTours || 325;
        const totalBatches = Math.ceil(total / BATCH_SIZE);

        addLog('🚀 Iniciando scraping completo de MegaTravel...');
        addLog(`📊 Total estimado: ${total} tours en ${totalBatches} batches de ${BATCH_SIZE}`);

        let offset = 0;
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalErrors = 0;
        let totalItinerary = 0;
        let totalIncludes = 0;
        let totalNotIncludes = 0;

        while (offset < total) {
            const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;
            addLog(`📦 Batch ${batchNumber}/${totalBatches} (Tours ${offset + 1}-${Math.min(offset + BATCH_SIZE, total)})`);

            try {
                const response = await fetch('/api/admin/scrape-all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Enviar cookies de autenticación
                    body: JSON.stringify({ limit: BATCH_SIZE, offset })
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        addLog('❌ Error de autenticación. Redirigiendo al login...');
                        router.push('/login');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const batchSuccess = data.results.filter((r: any) => r.status === 'success').length;
                    const batchErrors = data.results.filter((r: any) => r.status === 'error').length;

                    totalProcessed += data.processed;
                    totalSuccess += batchSuccess;
                    totalErrors += batchErrors;

                    // Sumar métricas detalladas
                    data.results.forEach((r: any) => {
                        if (r.status === 'success') {
                            totalItinerary += r.itinerary || 0;
                            totalIncludes += r.includes || 0;
                            totalNotIncludes += r.not_includes || 0;
                        }
                    });

                    addLog(`✅ Batch ${batchNumber}: ${batchSuccess} OK, ${batchErrors} errores`);

                    // Mostrar resultados individuales
                    data.results.forEach((r: any) => {
                        if (r.status === 'success') {
                            addLog(`   ✓ ${r.mt_code}: $${r.price || 'N/A'} USD, ${r.itinerary || '?'} días, ${r.includes || 0}/${r.not_includes || 0} inc/no-inc`);
                        } else {
                            addLog(`   ✗ ${r.mt_code}: ${r.error?.substring(0, 80) || 'Error'}`);
                        }
                    });

                    setStats({
                        processed: totalProcessed,
                        success: totalSuccess,
                        errors: totalErrors,
                        itineraryDays: totalItinerary,
                        includesFound: totalIncludes,
                        notIncludesFound: totalNotIncludes,
                    });

                } else {
                    addLog(`❌ Error en batch ${batchNumber}: ${data.error}`);
                    totalErrors += BATCH_SIZE;
                }

            } catch (error: any) {
                addLog(`❌ Error en batch ${batchNumber}: ${error.message}`);
                totalErrors += BATCH_SIZE;
            }

            offset += BATCH_SIZE;
            setProgress(Math.min(Math.round((offset / total) * 100), 100));

            // Pausa entre batches (5 segundos)
            if (offset < total) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        addLog('🎉 Scraping completo finalizado');
        addLog(`📊 Resumen: ${totalProcessed} procesados, ${totalSuccess} exitosos, ${totalErrors} errores`);
        addLog(`📅 Itinerarios: ${totalItinerary} días | ✅ Includes: ${totalIncludes} | ❌ Not includes: ${totalNotIncludes}`);
        setIsRunning(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                🔄 Scraping MegaTravel
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Actualizar itinerarios, precios, includes y not-includes de todos los tours
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/megatravel')}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                        >
                            ← Panel Admin
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Procesados</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exitosos</div>
                        <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Errores</div>
                        <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Días Itinerario</div>
                        <div className="text-2xl font-bold text-purple-600">{stats.itineraryDays}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Includes</div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.includesFound}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Not Includes</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.notIncludesFound}</div>
                    </div>
                </div>

                {/* Progress */}
                {isRunning && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
                            <span className="text-sm font-medium text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {stats.processed} de ~{totalTours || 325} tours procesados
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={runScraping}
                        disabled={isRunning}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all ${isRunning
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-lg shadow-blue-500/25'
                            }`}
                    >
                        {isRunning ? '⏳ Ejecutando scraping...' : '🚀 Iniciar Scraping Completo'}
                    </button>

                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>⚠️ Nota:</strong> Este proceso puede tomar 60-120 minutos. El navegador debe permanecer abierto.
                            <br />
                            <strong>💡 Alternativa:</strong> El cron job nocturno actualiza automáticamente {5 * 6} tours/día en batches de 5 cada 4 horas.
                        </p>
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">📋 Registro de Actividad</h2>
                        {logs.length > 0 && (
                            <button
                                onClick={() => setLogs([])}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="bg-gray-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs leading-relaxed">
                        {logs.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                No hay actividad aún. Haz clic en &quot;Iniciar Scraping&quot; para comenzar.
                            </div>
                        ) : (
                            <>
                                {logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`mb-0.5 ${log.includes('✅') || log.includes('✓') ? 'text-green-400' :
                                            log.includes('❌') || log.includes('✗') ? 'text-red-400' :
                                                log.includes('📦') ? 'text-blue-400' :
                                                    log.includes('🚀') || log.includes('🎉') ? 'text-yellow-400' :
                                                        log.includes('📊') ? 'text-cyan-400' :
                                                            'text-gray-400'
                                            }`}
                                    >
                                        {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
