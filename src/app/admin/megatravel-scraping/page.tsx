// src/app/admin/megatravel-scraping/page.tsx
'use client';

import { useState } from 'react';

export default function MegaTravelScrapingPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        processed: 0,
        success: 0,
        errors: 0
    });

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const runScraping = async () => {
        setIsRunning(true);
        setLogs([]);
        setProgress(0);
        setStats({ processed: 0, success: 0, errors: 0 });

        addLog('🚀 Iniciando scraping completo de MegaTravel...');

        const BATCH_SIZE = 10;
        const TOTAL_TOURS = 325;
        const totalBatches = Math.ceil(TOTAL_TOURS / BATCH_SIZE);

        let offset = 0;
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalErrors = 0;

        while (offset < TOTAL_TOURS) {
            const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;
            addLog(`📦 Procesando batch ${batchNumber}/${totalBatches} (Tours ${offset + 1}-${Math.min(offset + BATCH_SIZE, TOTAL_TOURS)})`);

            try {
                const response = await fetch('/api/admin/scrape-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'dev-secret'}`
                    },
                    body: JSON.stringify({
                        limit: BATCH_SIZE,
                        offset: offset
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const batchSuccess = data.results.filter((r: any) => r.status === 'success').length;
                    const batchErrors = data.results.filter((r: any) => r.status === 'error').length;

                    totalProcessed += data.processed;
                    totalSuccess += batchSuccess;
                    totalErrors += batchErrors;

                    addLog(`✅ Batch ${batchNumber} completado: ${batchSuccess} exitosos, ${batchErrors} errores`);

                    // Mostrar algunos resultados
                    data.results.slice(0, 2).forEach((r: any) => {
                        if (r.status === 'success') {
                            addLog(`   ✓ ${r.mt_code}: $${r.price || 'N/A'} USD, ${r.includes} includes`);
                        } else {
                            addLog(`   ✗ ${r.mt_code}: Error`);
                        }
                    });

                    setStats({
                        processed: totalProcessed,
                        success: totalSuccess,
                        errors: totalErrors
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
            setProgress(Math.round((offset / TOTAL_TOURS) * 100));

            // Pausa entre batches
            if (offset < TOTAL_TOURS) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        addLog('✅ Scraping completo finalizado');
        addLog(`📊 Total: ${totalProcessed} procesados, ${totalSuccess} exitosos, ${totalErrors} errores`);
        setIsRunning(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔄 Scraping MegaTravel
                    </h1>
                    <p className="text-gray-600">
                        Actualizar precios, impuestos e información de inclusiones de todos los tours
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Procesados</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.processed}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Exitosos</div>
                        <div className="text-3xl font-bold text-green-600">{stats.success}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Errores</div>
                        <div className="text-3xl font-bold text-red-600">{stats.errors}</div>
                    </div>
                </div>

                {/* Progress */}
                {isRunning && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progreso</span>
                            <span className="text-sm font-medium text-gray-700">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <button
                        onClick={runScraping}
                        disabled={isRunning}
                        className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${isRunning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                            }`}
                    >
                        {isRunning ? '⏳ Ejecutando scraping...' : '🚀 Iniciar Scraping Completo'}
                    </button>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Nota:</strong> Este proceso puede tomar entre 60-90 minutos para completar los 325 tours.
                            El navegador debe permanecer abierto durante todo el proceso.
                        </p>
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Registro de Actividad</h2>
                    <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                No hay actividad aún. Haz clic en "Iniciar Scraping" para comenzar.
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`mb-1 ${log.includes('✅') ? 'text-green-400' :
                                            log.includes('❌') ? 'text-red-400' :
                                                log.includes('📦') ? 'text-blue-400' :
                                                    log.includes('🚀') ? 'text-yellow-400' :
                                                        'text-gray-300'
                                        }`}
                                >
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
