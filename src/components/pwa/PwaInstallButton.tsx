"use client"

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if we have the global prompt
    if (typeof window !== 'undefined' && (window as any).pwaDeferredPrompt) {
      setDeferredPrompt((window as any).pwaDeferredPrompt);
    }
    
    // Listen for future events
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).pwaDeferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Diagnóstico PWA: El navegador no ha emitido el evento de instalación (beforeinstallprompt). Esto significa que la aplicación aún no cumple con todos los requisitos de PWA en la nube (ej. Service Worker, Manifest, o HTTPS), o ya está instalada.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // FORZAR MOSTRAR EL BOTÓN (Quitamos el if (!deferredPrompt) return null;)
  
  return (
    <button
      onClick={handleInstall}
      className={`transition-colors text-[10px] flex items-center gap-1 ${deferredPrompt ? 'text-green-500 hover:text-green-400 font-bold opacity-100' : 'text-gray-400 hover:text-white opacity-50'}`}
      title="Instalar como Aplicación"
    >
      <Download className="w-3 h-3" />
      Instalar App {deferredPrompt ? '(Lista)' : '(Diagnostic)'}
    </button>
  );
}
