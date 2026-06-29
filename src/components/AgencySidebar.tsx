"use client"

import { usePathname, useRouter } from 'next/navigation'
import {
    Building2, Users, Briefcase, Settings, 
    ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const AGENCY_NAV_ITEMS = [
    { href: '/dashboard/agency', label: 'Panel Principal', icon: Building2, color: 'text-blue-600' },
    { divider: true, label: 'Gestión' },
    { href: '/dashboard/agency/agents', label: 'Agentes', icon: Briefcase, color: 'text-indigo-600' },
    { href: '/dashboard/agency/clients', label: 'Clientes', icon: Users, color: 'text-emerald-600' },
    { divider: true, label: 'Configuración' },
    { href: '/dashboard/agency/settings', label: 'Ajustes', icon: Settings, color: 'text-gray-600' },
] as const

export function AgencySidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (href: string) => {
        if (href === '/dashboard/agency') return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={`hidden lg:flex flex-col bg-white/80 backdrop-blur-sm border-r border-indigo-100/50 transition-all duration-300 ease-in-out ${collapsed ? 'w-14' : 'w-52'
                }`}
            style={{ minHeight: 'calc(100vh - 64px)' }}
        >
            {/* Header */}
            <div className={`flex items-center px-3 py-3 border-b border-indigo-50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Agencia</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-2 overflow-y-auto">
                {AGENCY_NAV_ITEMS.map((item, i) => {
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
                                    ? 'bg-indigo-50/80 text-indigo-700 border-r-2 border-indigo-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-600' : item.color}`} />
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
