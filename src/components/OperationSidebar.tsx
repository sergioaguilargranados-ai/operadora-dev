'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Kanban,
  CheckSquare,
  Calendar,
  MessageCircle,
  Mail,
  Bell,
  Zap,
  GitMerge,
  BarChart3,
  TrendingUp,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react'

export function OperationSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const menuSections = [
    {
      title: 'OPERACIÓN PRINCIPAL',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
        { label: 'Catálogo Clientes', icon: UserCheck, route: '/dashboard/crm/clientes' },
        { label: 'Contactos', icon: Users, route: '/dashboard/crm' },
        { label: 'Pipeline', icon: Kanban, route: '/dashboard/crm' },
        { label: 'Tareas', icon: CheckSquare, route: '/dashboard/crm' },
        { label: 'Calendario', icon: Calendar, route: '/dashboard/crm' }
      ]
    },
    {
      title: 'COMUNICACIÓN',
      items: [
        { label: 'WhatsApp', icon: MessageCircle, route: '/comunicacion' },
        { label: 'Campañas Email', icon: Mail, route: '/comunicacion' },
        { label: 'Notificaciones', icon: Bell, route: '/notificaciones' }
      ]
    },
    {
      title: 'AUTOMATIZACIÓN',
      items: [
        { label: 'Reglas', icon: Zap, route: '/admin/features' },
        { label: 'Workflows', icon: GitMerge, route: '/admin/features' }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Analytics', icon: BarChart3, route: '/dashboard/agency' },
        { label: 'Ejecutivo', icon: TrendingUp, route: '/dashboard' }
      ]
    },
    {
      title: 'DATOS',
      items: [
        { label: 'Docs Clientes', icon: FileText, route: '/perfil' },
        { label: 'Importar CSV', icon: Upload, route: '/dashboard/crm' }
      ]
    },
    {
      title: 'CONFIGURACIÓN',
      items: [
        { label: 'Panel Agencias', icon: Building2, route: '/dashboard/agency' },
        { label: 'Ajustes / Marca Blanca', icon: Settings, route: '/admin/features' }
      ]
    }
  ]

  return (
    <aside className={`bg-white border-r border-gray-200 min-h-screen transition-all duration-200 flex flex-col justify-between ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="py-4">
        {/* Toggle button */}
        <div className="px-4 mb-4 flex justify-between items-center">
          {!collapsed && <span className="text-xs font-bold text-slate-400 tracking-wider">MENÚ OPERACIÓN</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 mx-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1 px-3">
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                  {sec.title}
                </p>
              )}
              {sec.items.map((item, i) => {
                const Icon = item.icon
                const isActive = pathname === item.route

                return (
                  <button
                    key={i}
                    onClick={() => router.push(item.route)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' 
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
