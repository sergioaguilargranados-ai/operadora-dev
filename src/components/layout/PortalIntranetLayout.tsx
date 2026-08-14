'use client'

import React, { Suspense } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { PortalSidebar } from './PortalSidebar'

interface PortalIntranetLayoutProps {
  children: React.ReactNode
}

export function PortalIntranetLayout({ children }: PortalIntranetLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      {/* Header Superior Institucional */}
      <PageHeader showBackButton={false} />

      {/* Estructura Principal en 2 Secciones (Estilo Intranet ERPCubox) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna 1: Menú Vertical Adaptativo por Rol */}
        <Suspense fallback={<aside className="w-64 bg-white border-r border-gray-200" />}>
          <PortalSidebar />
        </Suspense>

        {/* Columna 2: Área de Trabajo Central Dinámica */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-[calc(100vh-65px)] space-y-6">
          <Suspense fallback={<div className="p-4 text-xs text-slate-400">Cargando módulo...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
