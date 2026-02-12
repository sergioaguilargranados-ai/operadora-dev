'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    User as UserIcon,
    Package,
    MessageCircle,
    Home as HomeIcon,
    Compass,
    FileText,
    Calendar,
    Shield,
    LogOut,
    Bell,
    HelpCircle
} from 'lucide-react'
import Link from 'next/link'

/**
 * UserMenu Component
 * 
 * Menú de usuario estándar para todas las páginas del sistema.
 * Incluye funciones básicas para todos los usuarios y funciones administrativas
 * para SUPER_ADMIN, ADMIN y MANAGER.
 * 
 * @version v2.302
 * @date 09 Feb 2026
 */
export function UserMenu() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
    }

    if (!isAuthenticated || !user) {
        return (
            <Link href="/login">
                <button className="hover:text-primary font-medium">Iniciar sesión</button>
            </Link>
        )
    }

    return (
        <>
            {/* Botón de Notificaciones */}
            <button
                onClick={() => router.push('/notificaciones')}
                className="hover:text-primary relative"
                title="Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {/* Badge de notificaciones pendientes */}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Botón de Ayuda */}
            <button
                onClick={() => router.push('/ayuda')}
                className="hover:text-primary flex items-center gap-1"
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden md:inline">Ayuda</span>
            </button>

            {/* Menú de Usuario */}
            <div className="relative">
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:text-primary"
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    </div>
                </button>

                {showUserMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 py-2">
                            <div className="px-4 py-3 border-b">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                {user.role && (
                                    <p className="text-xs text-blue-600 font-semibold mt-1">{user.role}</p>
                                )}
                            </div>
                            <div className="py-2">
                                <button
                                    onClick={() => router.push('/perfil')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Mi perfil
                                </button>
                                <button
                                    onClick={() => router.push('/mis-reservas')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <Package className="w-4 h-4" />
                                    Mis reservas
                                </button>
                                <button
                                    onClick={() => router.push('/comunicacion')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Centro de Comunicación
                                </button>

                                {/* Opciones de Admin/SuperAdmin */}
                                {user.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) && (
                                    <>
                                        <div className="border-t my-2"></div>
                                        <button
                                            onClick={() => router.push('/admin/content')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <HomeIcon className="w-4 h-4" />
                                            Gestión de Contenido
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard/corporate')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Compass className="w-4 h-4" />
                                            Dashboard Corporativo
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Compass className="w-4 h-4" />
                                            Dashboard Financiero
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard/payments')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Package className="w-4 h-4" />
                                            Facturación y Pagos
                                        </button>
                                        <button
                                            onClick={() => router.push('/approvals')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Package className="w-4 h-4" />
                                            Aprobaciones
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard/quotes')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Cotizaciones
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard/itineraries')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Itinerarios
                                        </button>
                                        <button
                                            onClick={() => router.push('/admin/features')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-blue-600 font-medium"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Administración de Funciones
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="border-t pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
