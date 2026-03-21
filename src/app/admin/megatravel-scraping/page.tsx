// src/app/admin/megatravel-scraping/page.tsx
// Panel unificado: Sincronización + Scraping MegaTravel
// Build: 21 Mar 2026 13:22 - v2.342 - Fix Token: renovación proactiva + fallback as_user robusto
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MegaTravelScrapingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'idle' | 'sync' | 'scraping' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        processed: 0,
        success: 0,
        errors: 0,
        deprecated: 0,
        newTours: 0,
        updated: 0,
        itineraryDays: 0,
        includesFound: 0,
        notIncludesFound: 0,
    });
    const [totalTours, setTotalTours] = useState(0);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef(false);
    // Ref to track final stats for the summary
    const finalStatsRef = useRef(stats);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // ==========================================
    // AUTO-REFRESH DEL TOKEN (JWT expira en 15 min, refresh token dura 7 días)
    // Refresca cada 10 minutos mientras el proceso está corriendo
    // ==========================================
    useEffect(() => {
        if (isRunning) {
            const refreshToken = async () => {
                try {
                    const storedRefresh = localStorage.getItem('as_refresh');
                    if (!storedRefresh) {
                        console.warn('⚠️ No hay refresh token disponible');
                        return;
                    }

                    const res = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: storedRefresh })
                    });

                    const data = await res.json();
                    if (data.success && data.data?.accessToken) {
                        // Actualizar en localStorage
                        localStorage.setItem('as_token', data.data.accessToken);
                        // Actualizar cookie para que el middleware y las APIs lo lean
                        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                        document.cookie = `as_token=${encodeURIComponent(data.data.accessToken)};expires=${expires};path=/;samesite=lax`;
                        console.log('🔄 Token renovado exitosamente');
                    }
                } catch (e) {
                    console.error('⚠️ Error renovando token:', e);
                }
            };

            // Refresh inmediatamente al iniciar y luego cada 10 min
            refreshToken();
            refreshIntervalRef.current = setInterval(refreshToken, 10 * 60 * 1000);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                    refreshIntervalRef.current = null;
                }
            };
        } else {
            // Limpiar interval cuando se detiene el proceso
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        }
    }, [isRunning]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    // Obtener total de tours al cargar
    useEffect(() => {
        fetch('/api/admin/megatravel?action=stats')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTotalTours(data.data?.stats?.active_packages || data.data?.stats?.total_packages || 325);
                }
            })
            .catch(() => setTotalTours(325));
    }, []);

    // Helper: refrescar el token JWT manualmente
    const autoRefreshToken = async (): Promise<boolean> => {
        try {
            const storedRefresh = localStorage.getItem('as_refresh');
            if (!storedRefresh) return false;

            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: storedRefresh })
            });

            const data = await res.json();
            if (data.success && data.data?.accessToken) {
                localStorage.setItem('as_token', data.data.accessToken);
                const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `as_token=${encodeURIComponent(data.data.accessToken)};expires=${expires};path=/;samesite=lax`;
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const stopProcess = () => {
        abortRef.current = true;
        addLog('⛔ Deteniendo proceso... (terminando operación actual)');
    };

    // ==========================================
    // FASE 1: SINCRONIZACIÓN POR CATEGORÍA
    // ==========================================
    const runSync = async (): Promise<{ allCodes: string[]; newCount: number; updatedCount: number }> => {
        setCurrentPhase('sync');
        addLog('');
        addLog('═══════════════════════════════════════════');
        addLog('📡 FASE 1: SINCRONIZACIÓN CON MEGATRAVEL');
        addLog('═══════════════════════════════════════════');

        // Obtener lista de categorías
        let categories: Array<{ index: number; url: string; category: string }> = [];
        try {
            const catRes = await fetch('/api/admin/discover-tours', { credentials: 'include' });
            const catData = await catRes.json();
            if (catData.success) {
                categories = catData.categories;
                addLog(`🔍 ${categories.length} categorías para explorar`);
            }
        } catch (e) {
            addLog('❌ Error obteniendo categorías');
            return { allCodes: [], newCount: 0, updatedCount: 0 };
        }

        const allDiscoveredCodes: string[] = [];
        let totalNew = 0;
        let totalUpdated = 0;

        for (let i = 0; i < categories.length; i++) {
            if (abortRef.current) break;

            const cat = categories[i];
            addLog(`📂 [${i + 1}/${categories.length}] Explorando: ${cat.category}...`);
            setProgress(Math.round(((i) / categories.length) * 50)); // 0-50% para sync

            try {
                const response = await fetch('/api/admin/discover-tours', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ categoryIndex: cat.index })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    allDiscoveredCodes.push(...data.tours);
                    totalNew += data.inserted?.length || 0;
                    totalUpdated += data.updated?.length || 0;

                    const newLabel = data.inserted?.length > 0 ? ` (🆕 ${data.inserted.length} nuevos)` : '';
                    addLog(`   ✅ ${cat.category}: ${data.toursFound} tours${newLabel}`);

                    if (data.inserted?.length > 0) {
                        data.inserted.forEach((code: string) => addLog(`      🆕 ${code}`));
                    }
                } else {
                    addLog(`   ❌ ${cat.category}: ${data.error}`);
                }
            } catch (error: any) {
                addLog(`   ❌ ${cat.category}: ${error.message}`);
            }

            // Pausa breve entre categorías
            if (i < categories.length - 1 && !abortRef.current) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        // Eliminar duplicados
        const uniqueCodes = [...new Set(allDiscoveredCodes)];

        addLog('');
        addLog(`📊 Resumen sincronización:`);
        addLog(`   📦 Tours descubiertos: ${uniqueCodes.length}`);
        addLog(`   🆕 Nuevos: ${totalNew}`);
        addLog(`   🔄 Actualizados: ${totalUpdated}`);

        // Deprecar tours que ya no existen
        if (uniqueCodes.length > 0 && !abortRef.current) {
            addLog('');
            addLog('🚫 Verificando tours a dar de baja...');

            try {
                const depRes = await fetch('/api/admin/discover-tours', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'deprecate', discoveredCodes: uniqueCodes })
                });

                const depData = await depRes.json();
                if (depData.success && depData.deprecatedCount > 0) {
                    addLog(`   🚫 ${depData.deprecatedCount} tours dados de baja:`);
                    depData.deprecatedCodes?.forEach((code: string) => addLog(`      🚫 ${code}`));
                    setStats(prev => {
                        const updated = { ...prev, deprecated: depData.deprecatedCount, newTours: totalNew, updated: totalUpdated };
                        finalStatsRef.current = updated;
                        return updated;
                    });
                } else {
                    addLog('   ✅ Todos los tours siguen activos');
                    setStats(prev => {
                        const updated = { ...prev, newTours: totalNew, updated: totalUpdated };
                        finalStatsRef.current = updated;
                        return updated;
                    });
                }
            } catch (e: any) {
                addLog(`   ⚠️ Error verificando tours a deprecar: ${e.message}`);
            }
        }

        // Actualizar total tours
        if (uniqueCodes.length > 0) {
            setTotalTours(uniqueCodes.length);
        }

        // Registrar sincronización en el historial
        try {
            await fetch('/api/admin/discover-tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'log-sync',
                    totalFound: uniqueCodes.length,
                    newTours: totalNew,
                    updated: totalUpdated,
                    deprecated: finalStatsRef.current.deprecated,
                    triggeredBy: 'admin-panel'
                })
            });
            addLog('📝 Sincronización registrada en historial');
        } catch (e) { /* ignorar */ }

        return { allCodes: uniqueCodes, newCount: totalNew, updatedCount: totalUpdated };
    };

    // ==========================================
    // FASE 2: SCRAPING COMPLETO (actualizar detalles)
    // ==========================================
    const runScraping = async () => {
        setCurrentPhase('scraping');
        addLog('');
        addLog('═══════════════════════════════════════════');
        addLog('🔄 FASE 2: SCRAPING COMPLETO DE DETALLES');
        addLog('═══════════════════════════════════════════');

        const BATCH_SIZE = 5;
        // Recargar total de tours (puede haber cambiado con la sync)
        let total = totalTours || 325;
        try {
            const statsRes = await fetch('/api/admin/megatravel?action=stats', { credentials: 'include' });
            const statsData = await statsRes.json();
            if (statsData.success) {
                const ap = parseInt(statsData.data?.stats?.active_packages) || 0;
                const tp = parseInt(statsData.data?.stats?.total_packages) || 0;
                total = ap || tp || total;
                setTotalTours(total);
            }
        } catch (e) { /* usar el último total conocido */ }

        const totalBatches = Math.ceil(total / BATCH_SIZE);

        addLog(`📊 Total: ${total} tours en ${totalBatches} batches de ${BATCH_SIZE}`);

        let offset = 0;
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalErrors = 0;
        let totalItinerary = 0;
        let totalIncludes = 0;
        let totalNotIncludes = 0;
        let totalDeprecated = finalStatsRef.current.deprecated;

        let emptyBatchStreak = 0; // Contador de batches vacíos consecutivos

        while (offset < total && !abortRef.current) {
            const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;
            addLog(`📦 Batch ${batchNumber}/${totalBatches} (Tours ${offset + 1}-${Math.min(offset + BATCH_SIZE, total)})`);

            // Renovar token proactivamente cada 5 batches (~25 min de proceso)
            if (batchNumber % 5 === 1 && batchNumber > 1) {
                const renewed = await autoRefreshToken();
                if (renewed) {
                    addLog('🔑 Sesión renovada proactivamente');
                }
            }

            try {
                const response = await fetch('/api/admin/scrape-all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ limit: BATCH_SIZE, offset })
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Intentar refrescar el token y reintentar
                        addLog('⚠️ Token expirado, renovando...');
                        const refreshed = await autoRefreshToken();
                        if (refreshed) {
                            addLog('🔄 Token renovado, reintentando batch...');
                            // Reintentar el mismo batch
                            const retryRes = await fetch('/api/admin/scrape-all', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ limit: BATCH_SIZE, offset })
                            });
                            if (retryRes.ok) {
                                // Continuar procesando normalmente
                                const retryData = await retryRes.json();
                                if (retryData.success) {
                                    const batchSuccess = retryData.results.filter((r: any) => r.status === 'success').length;
                                    const batchErrors = retryData.results.filter((r: any) => r.status === 'error').length;
                                    totalProcessed += retryData.processed;
                                    totalSuccess += batchSuccess;
                                    totalErrors += batchErrors;
                                    addLog(`   ✅ ${batchSuccess} OK | ❌ ${batchErrors} errores`);
                                }
                                offset += BATCH_SIZE;
                                setProgress(50 + Math.min(Math.round((offset / total) * 50), 50));
                                if (offset < total && !abortRef.current) {
                                    await new Promise(resolve => setTimeout(resolve, 5000));
                                }
                                continue;
                            }
                        }
                        addLog('❌ No se pudo renovar la sesión. Reanuda después de iniciar sesión.');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const batchSuccess = data.results.filter((r: any) => r.status === 'success').length;
                    const batchErrors = data.results.filter((r: any) => r.status === 'error').length;
                    const batchDeprecated = data.results.filter((r: any) => r.status === 'deprecated').length;

                    totalProcessed += data.processed;
                    totalSuccess += batchSuccess;
                    totalErrors += batchErrors;
                    totalDeprecated += batchDeprecated;

                    // Sumar métricas detalladas
                    data.results.forEach((r: any) => {
                        if (r.status === 'success') {
                            totalItinerary += r.itinerary || 0;
                            totalIncludes += r.includes || 0;
                            totalNotIncludes += r.not_includes || 0;
                        }
                    });

                    addLog(`✅ Batch ${batchNumber}: ${batchSuccess} OK, ${batchErrors} errores${batchDeprecated > 0 ? `, ${batchDeprecated} dados de baja` : ''}`);

                    // Mostrar resultados individuales
                    data.results.forEach((r: any) => {
                        if (r.status === 'success') {
                            addLog(`   ✓ ${r.mt_code}: $${r.price || 'N/A'} USD, ${r.itinerary || '?'} días, ${r.includes || 0}/${r.not_includes || 0} inc/no-inc`);
                        } else if (r.status === 'deprecated') {
                            addLog(`   🚫 ${r.mt_code}: DADO DE BAJA (ya no existe en MegaTravel)`);
                        } else {
                            addLog(`   ✗ ${r.mt_code}: ${r.error?.substring(0, 80) || 'Error'}`);
                        }
                    });

                    setStats(prev => {
                        const updated = {
                            ...prev,
                            processed: totalProcessed,
                            success: totalSuccess,
                            errors: totalErrors,
                            deprecated: totalDeprecated,
                            itineraryDays: totalItinerary,
                            includesFound: totalIncludes,
                            notIncludesFound: totalNotIncludes,
                        };
                        finalStatsRef.current = updated;
                        return updated;
                    });

                    // Detectar batches vacíos para parar antes
                    if (data.processed === 0) {
                        emptyBatchStreak++;
                        if (emptyBatchStreak >= 2) {
                            addLog('✅ No hay más tours por procesar. Finalizando scraping.');
                            break;
                        }
                    } else {
                        emptyBatchStreak = 0;
                    }

                } else {
                    addLog(`❌ Error en batch ${batchNumber}: ${data.error}`);
                    totalErrors += BATCH_SIZE;
                }

            } catch (error: any) {
                addLog(`❌ Error en batch ${batchNumber}: ${error.message}`);
                totalErrors += BATCH_SIZE;
            }

            offset += BATCH_SIZE;
            // Progress: 50-100% para scraping
            setProgress(50 + Math.min(Math.round((offset / total) * 50), 50));

            // Pausa entre batches (5 segundos)
            if (offset < total && !abortRef.current) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (abortRef.current) {
            addLog('⛔ Scraping detenido por el usuario');
            addLog(`📊 Resumen parcial: ${totalProcessed} procesados, ${totalSuccess} exitosos, ${totalErrors} errores`);
        }
    };

    // ==========================================
    // FLUJO COMPLETO: Sync → Scraping
    // ==========================================
    const runFullProcess = async () => {
        abortRef.current = false;
        setIsRunning(true);
        setLogs([]);
        setProgress(0);
        const initialStats = { processed: 0, success: 0, errors: 0, deprecated: 0, newTours: 0, updated: 0, itineraryDays: 0, includesFound: 0, notIncludesFound: 0 };
        setStats(initialStats);
        finalStatsRef.current = initialStats;

        addLog('🚀 Iniciando proceso completo de actualización MegaTravel...');
        addLog(`📅 ${new Date().toLocaleString('es-MX')}`);

        // Limpiar syncs "running" que se quedaron pegadas
        try {
            const cleanRes = await fetch('/api/admin/discover-tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'cleanup-stale' })
            });
            const cleanData = await cleanRes.json();
            if (cleanData.cleaned > 0) {
                addLog(`🧹 ${cleanData.cleaned} sincronizaciones anteriores limpiadas`);
            }
        } catch (e) { /* ignorar */ }

        // Renovar token ANTES de empezar para evitar expiración durante el proceso
        addLog('🔑 Verificando sesión antes de iniciar...');
        const preRefreshed = await autoRefreshToken();
        if (!preRefreshed) {
            addLog('⚠️ No se pudo renovar el token de sesión. Continuando con sesión existente...');
            addLog('   (Si el proceso falla con 401, vuelve a iniciar sesión y reintenta)');
        } else {
            addLog('✅ Sesión verificada y renovada correctamente');
        }

        // FASE 1: Sincronización por categoría
        if (!abortRef.current) {
            await runSync();
        }

        // FASE 2: Scraping (si no se detuvo)
        if (!abortRef.current) {
            await runScraping();
        }

        // RESUMEN FINAL
        setCurrentPhase('done');
        const fs = finalStatsRef.current;
        addLog('');
        addLog('═══════════════════════════════════════════');
        addLog('🎉 PROCESO COMPLETO FINALIZADO');
        addLog('═══════════════════════════════════════════');
        addLog(`📊 Resumen Final:`);
        addLog(`   🆕 Tours nuevos: ${fs.newTours}`);
        addLog(`   🔄 Tours actualizados: ${fs.updated}`);
        addLog(`   🚫 Tours dados de baja: ${fs.deprecated}`);
        addLog(`   📦 Tours scrapeados: ${fs.processed}`);
        addLog(`   ✅ Exitosos: ${fs.success}`);
        addLog(`   ❌ Errores: ${fs.errors}`);
        addLog(`   📅 Días de itinerario: ${fs.itineraryDays}`);
        addLog(`   ✅ Includes: ${fs.includesFound} | ❌ Not includes: ${fs.notIncludesFound}`);
        setIsRunning(false);
    };

    // Solo scraping (sin sync)
    const runScrapingOnly = async () => {
        abortRef.current = false;
        setIsRunning(true);
        setLogs([]);
        setProgress(50);
        const initialStats = { processed: 0, success: 0, errors: 0, deprecated: 0, newTours: 0, updated: 0, itineraryDays: 0, includesFound: 0, notIncludesFound: 0 };
        setStats(initialStats);
        finalStatsRef.current = initialStats;

        addLog('🔄 Iniciando solo Scraping (sin sincronización)...');
        addLog(`📅 ${new Date().toLocaleString('es-MX')}`);

        await runScraping();

        setCurrentPhase('done');
        const fs = finalStatsRef.current;
        addLog('');
        addLog('🎉 Scraping finalizado');
        addLog(`   📦 Procesados: ${fs.processed} | ✅ OK: ${fs.success} | ❌ Errores: ${fs.errors}`);
        setIsRunning(false);
    };

    // Solo sincronización (sin scraping)
    const runSyncOnly = async () => {
        abortRef.current = false;
        setIsRunning(true);
        setLogs([]);
        setProgress(0);
        const initialStats = { processed: 0, success: 0, errors: 0, deprecated: 0, newTours: 0, updated: 0, itineraryDays: 0, includesFound: 0, notIncludesFound: 0 };
        setStats(initialStats);
        finalStatsRef.current = initialStats;

        addLog('📡 Iniciando solo Sincronización...');
        addLog(`📅 ${new Date().toLocaleString('es-MX')}`);

        await runSync();
        setProgress(100);

        setCurrentPhase('done');
        const fs = finalStatsRef.current;
        addLog('');
        addLog('🎉 Sincronización finalizada');
        addLog(`   🆕 Nuevos: ${fs.newTours} | 🔄 Actualizados: ${fs.updated} | 🚫 Dados de baja: ${fs.deprecated}`);
        setIsRunning(false);
    };

    const phaseLabel = currentPhase === 'sync' ? '📡 Sincronizando...'
        : currentPhase === 'scraping' ? '🔄 Scraping...'
            : currentPhase === 'done' ? '✅ Completado'
                : '';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                🌍 MegaTravel — Sincronización y Scraping
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Descubrir tours nuevos, dar de baja los eliminados y actualizar información completa
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={() => router.push('/admin/content')}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                            >
                                ← Gestión de Contenido
                            </button>
                            {phaseLabel && (
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentPhase === 'sync' ? 'bg-blue-100 text-blue-700' :
                                    currentPhase === 'scraping' ? 'bg-purple-100 text-purple-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {phaseLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Procesados</div>
                        <div className="text-xl font-bold text-blue-600">{stats.processed}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exitosos</div>
                        <div className="text-xl font-bold text-green-600">{stats.success}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Errores</div>
                        <div className="text-xl font-bold text-red-600">{stats.errors}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">De Baja</div>
                        <div className="text-xl font-bold text-gray-500">{stats.deprecated}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nuevos</div>
                        <div className="text-xl font-bold text-cyan-600">{stats.newTours}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actualizados</div>
                        <div className="text-xl font-bold text-indigo-600">{stats.updated}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Días Itinerario</div>
                        <div className="text-xl font-bold text-purple-600">{stats.itineraryDays}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Includes</div>
                        <div className="text-xl font-bold text-emerald-600">{stats.includesFound}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Not Includes</div>
                        <div className="text-xl font-bold text-orange-600">{stats.notIncludesFound}</div>
                    </div>
                </div>

                {/* Progress */}
                {isRunning && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {currentPhase === 'sync' ? 'Sincronizando categorías...' : 'Scraping de detalles...'}
                            </span>
                            <span className="text-sm font-medium text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${currentPhase === 'sync'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{currentPhase === 'sync' ? 'Fase 1: Descubrimiento' : `Fase 2: ${stats.processed} de ~${totalTours} tours`}</span>
                            <span>{currentPhase === 'sync' ? '0-50%' : '50-100%'}</span>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={runFullProcess}
                            disabled={isRunning}
                            className={`flex-1 min-w-[180px] py-3 px-5 rounded-xl font-semibold text-white transition-all ${isRunning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] shadow-lg shadow-blue-500/25'
                                }`}
                        >
                            {isRunning ? '⏳ Ejecutando...' : '🚀 Completo (Sync + Scraping)'}
                        </button>
                        <button
                            onClick={runSyncOnly}
                            disabled={isRunning}
                            className={`py-3 px-5 rounded-xl font-semibold text-white transition-all ${isRunning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.98] shadow-lg shadow-sky-500/25'
                                }`}
                        >
                            📡 Solo Sync
                        </button>
                        <button
                            onClick={runScrapingOnly}
                            disabled={isRunning}
                            className={`py-3 px-5 rounded-xl font-semibold text-white transition-all ${isRunning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            🔄 Solo Scraping
                        </button>
                        {isRunning && (
                            <button
                                onClick={stopProcess}
                                className="py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-[0.98] shadow-lg shadow-red-500/25 transition-all"
                            >
                                ⛔ Detener
                            </button>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            <strong>📋 Proceso Completo:</strong> 1️⃣ Sync — descubre nuevos, da de baja eliminados (~2 min) → 2️⃣ Scraping — actualiza itinerarios y precios (~60-120 min)
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
                    <div className="bg-gray-950 rounded-lg p-4 h-[420px] overflow-y-auto font-mono text-xs leading-relaxed">
                        {logs.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                No hay actividad aún. Selecciona una opción para comenzar.
                            </div>
                        ) : (
                            <>
                                {logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`mb-0.5 ${log.includes('═══') ? 'text-white font-bold' :
                                            log.includes('✅') || log.includes('✓') ? 'text-green-400' :
                                                log.includes('❌') || log.includes('✗') ? 'text-red-400' :
                                                    log.includes('🚫') ? 'text-gray-400' :
                                                        log.includes('🆕') ? 'text-cyan-400' :
                                                            log.includes('📦') ? 'text-blue-400' :
                                                                log.includes('📂') ? 'text-yellow-300' :
                                                                    log.includes('📡') || log.includes('🔄') ? 'text-indigo-400' :
                                                                        log.includes('🚀') || log.includes('🎉') ? 'text-yellow-400' :
                                                                            log.includes('📊') || log.includes('📅') ? 'text-cyan-400' :
                                                                                log.includes('⛔') || log.includes('⚠️') ? 'text-orange-400' :
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

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-6 py-4">
                    v2.323 | 19 Feb 2026 11:12 | AS Operadora — Panel MegaTravel
                </div>
            </div>
        </div>
    );
}
