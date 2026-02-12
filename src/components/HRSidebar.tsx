"use client"

import { usePathname, useRouter } from 'next/navigation'
import {
    Users, Briefcase, FileText, Clock,
    CalendarOff, DollarSign, TrendingUp,
    UserPlus, FolderOpen, Shield,
    LayoutDashboard, ChevronLeft, ChevronRight,
    Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const HR_NAV_ITEMS = [
    { href: '/dashboard/rrhh', label: 'Dashboard', icon: LayoutDashboard, color: 'text-emerald-600' },
    { divider: true, label: 'Personal' },
    { href: '/dashboard/rrhh/employees', label: 'Empleados', icon: Users, color: 'text-blue-500' },
    { href: '/dashboard/rrhh/agents', label: 'Agentes', icon: Briefcase, color: 'text-purple-500' },
    { href: '/dashboard/rrhh/departments', label: 'Departamentos', icon: Building2, color: 'text-cyan-600' },
    { divider: true, label: 'Gestión' },
    { href: '/dashboard/rrhh/contracts', label: 'Contratos', icon: FileText, color: 'text-amber-600' },
    { href: '/dashboard/rrhh/attendance', label: 'Asistencia', icon: Clock, color: 'text-green-500' },
    { href: '/dashboard/rrhh/leaves', label: 'Ausencias', icon: CalendarOff, color: 'text-orange-500' },
    { divider: true, label: 'Compensación' },
    { href: '/dashboard/rrhh/payroll', label: 'Nómina', icon: DollarSign, color: 'text-emerald-500' },
    { href: '/dashboard/rrhh/commissions', label: 'Comisiones', icon: TrendingUp, color: 'text-indigo-500' },
    { divider: true, label: 'Expediente' },
    { href: '/dashboard/rrhh/documents', label: 'Documentos', icon: FolderOpen, color: 'text-rose-500' },
    { href: '/dashboard/rrhh/recruitment', label: 'Reclutamiento', icon: UserPlus, color: 'text-teal-500' },
    { divider: true, label: 'Sistema' },
    { href: '/dashboard/rrhh/audit', label: 'Auditoría', icon: Shield, color: 'text-gray-500' },
] as const

export function HRSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (href: string) => {
        if (href === '/dashboard/rrhh') return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={`hidden lg:flex flex-col bg-white/80 backdrop-blur-sm border-r border-emerald-100/50 transition-all duration-300 ease-in-out ${collapsed ? 'w-14' : 'w-52'
                }`}
            style={{ minHeight: 'calc(100vh - 64px)' }}
        >
            {/* Header */}
            <div className={`flex items-center px-3 py-3 border-b border-emerald-50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">RRHH</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-2 overflow-y-auto">
                {HR_NAV_ITEMS.map((item, i) => {
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
                                    ? 'bg-emerald-50/80 text-emerald-700 border-r-2 border-emerald-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-600' : item.color}`} />
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
                <div className="px-3 py-2 border-t border-gray-100">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-7 rounded-lg border-emerald-200/50 bg-emerald-50/30 text-emerald-600 hover:bg-emerald-100/50"
                        onClick={() => router.push('/dashboard')}
                    >
                        ← Dashboard Principal
                    </Button>
                </div>
            )}
        </aside>
    )
}
