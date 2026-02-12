"use client"

import { usePathname, useRouter } from 'next/navigation'
import {
    Users, Target, ListTodo, Bell, Zap,
    BarChart3, Upload, Calendar, MessageSquare,
    LayoutDashboard, Eye, Workflow, Mail,
    TrendingUp, ChevronLeft, ChevronRight, FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const CRM_NAV_ITEMS = [
    { href: '/dashboard/crm', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { href: '/dashboard/crm/contacts', label: 'Contactos', icon: Users, color: 'text-blue-500' },
    { href: '/dashboard/crm/pipeline', label: 'Pipeline', icon: Target, color: 'text-purple-600' },
    { href: '/dashboard/crm/tasks', label: 'Tareas', icon: ListTodo, color: 'text-amber-600' },
    { href: '/dashboard/crm/calendar', label: 'Calendario', icon: Calendar, color: 'text-cyan-600' },
    { divider: true, label: 'Comunicación' },
    { href: '/dashboard/crm/whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { href: '/dashboard/crm/campaigns', label: 'Campañas Email', icon: Mail, color: 'text-rose-500' },
    { href: '/dashboard/crm/notifications', label: 'Notificaciones', icon: Bell, color: 'text-red-500' },
    { divider: true, label: 'Automatización' },
    { href: '/dashboard/crm/automation', label: 'Reglas', icon: Zap, color: 'text-amber-500' },
    { href: '/dashboard/crm/workflows', label: 'Workflows', icon: Workflow, color: 'text-indigo-500' },
    { divider: true, label: 'Analytics' },
    { href: '/dashboard/crm/analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-500' },
    { href: '/dashboard/crm/executive', label: 'Ejecutivo', icon: Eye, color: 'text-emerald-600' },
    { href: '/dashboard/crm/predictive', label: 'Scoring', icon: TrendingUp, color: 'text-purple-500' },
    { href: '/dashboard/crm/campaign-metrics', label: 'Métricas', icon: BarChart3, color: 'text-pink-500' },
    { divider: true, label: 'Datos' },
    { href: '/dashboard/crm/client-documents', label: 'Docs Clientes', icon: FolderOpen, color: 'text-sky-500' },
    { href: '/dashboard/crm/import', label: 'Importar CSV', icon: Upload, color: 'text-green-500' },
] as const

export function CRMSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (href: string) => {
        if (href === '/dashboard/crm') return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={`hidden lg:flex flex-col bg-white/80 backdrop-blur-sm border-r border-blue-100/50 transition-all duration-300 ease-in-out ${collapsed ? 'w-14' : 'w-52'
                }`}
            style={{ minHeight: 'calc(100vh - 64px)' }}
        >
            {/* Header */}
            <div className={`flex items-center px-3 py-3 border-b border-blue-50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">CRM</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-2 overflow-y-auto">
                {CRM_NAV_ITEMS.map((item, i) => {
                    if ('divider' in item && item.divider) {
                        if (collapsed) return <div key={i} className="my-2 border-t border-gray-100" />
                        return (
                            <div key={i} className="px-3 pt-3 pb-1">
                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                    {item.label}
                                </span>
                            </div>
                        )
                    }

                    if (!('href' in item)) return null

                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center gap-2.5 transition-all duration-150 ${collapsed ? 'justify-center px-2 py-2 mx-auto' : 'px-3 py-1.5'
                                } ${active
                                    ? 'bg-blue-50/80 text-blue-700 border-r-2 border-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : item.color}`} />
                            {!collapsed && (
                                <span className={`text-xs truncate ${active ? 'font-semibold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="px-3 py-2 border-t border-gray-100 space-y-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-7 rounded-lg border-emerald-200/50 bg-emerald-50/30 text-emerald-600 hover:bg-emerald-100/50"
                        onClick={() => router.push('/dashboard/rrhh')}
                    >
                        👥 Ir a RRHH
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-7 rounded-lg border-blue-200/50 bg-blue-50/30 text-blue-600 hover:bg-blue-100/50"
                        onClick={() => router.push('/dashboard')}
                    >
                        ← Dashboard Principal
                    </Button>
                </div>
            )}
        </aside>
    )
}
