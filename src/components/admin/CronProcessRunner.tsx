'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CronProcessRunnerProps {
  title: string;
  description: string;
  endpoint: string;
  icon?: React.ReactNode;
}

export function CronProcessRunner({ title, description, endpoint, icon }: CronProcessRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runProcess = async () => {
    setIsRunning(true);
    setStatus('running');
    setLogs([]);
    addLog(`Iniciando proceso: ${title}...`);
    addLog(`Endpoint: GET ${endpoint}`);
    
    try {
      addLog('Ejecutando petición (por favor espera)...');
      
      const startTime = Date.now();
      const res = await fetch(endpoint);
      const data = await res.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (data.success) {
        addLog(`✅ Proceso finalizado con éxito en ${duration}s.`);
        addLog(`Respuesta: ${data.message || JSON.stringify(data.res || data.data || data)}`);
        setStatus('success');
      } else {
        addLog(`❌ Error en el proceso (${duration}s).`);
        addLog(`Detalles: ${data.error || JSON.stringify(data)}`);
        setStatus('error');
      }
    } catch (err: any) {
      addLog(`❌ Excepción de red/servidor: ${err.message}`);
      setStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            {icon} {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        <Button
          onClick={runProcess}
          disabled={isRunning}
          variant={status === 'error' ? 'destructive' : 'default'}
          className="shadow-sm"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : status === 'error' ? (
            <XCircle className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isRunning ? 'Ejecutando...' : 'Ejecutar Ahora'}
        </Button>
      </div>

      {/* Log Terminal */}
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto mt-4 shadow-inner border border-slate-800 relative">
        {logs.length === 0 ? (
          <div className="text-slate-600 flex items-center justify-center h-full italic">
            Esperando ejecución...
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed opacity-90 hover:opacity-100 transition-opacity">
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
