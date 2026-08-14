'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext'
import {
    User as UserIcon,
    Package,
    LogOut,
    Bell,
    HelpCircle,
    ChevronDown,
    Sliders,
    Globe
} from 'lucide-react'
import Link from 'next/link'

/**
 * UserMenu Component (v2.435)
 * 
 * Menú de usuario reestructurado con:
 * - Badge de Idioma y Moneda (🌐 ES / MXN ∨) que abre el modal oficial de 13 divisas.
 * - Tarjeta limpia de usuario.
 * - Para roles mayores a cliente (Staff/Admin/Agente): Opción "Operación" que despliega la suite operativa vertical estilo CRM.
 */
export function UserMenu() {
    const { user, isAuthenticated, logout } = useAuth()
    const { language, currency, openModal } = useLanguageCurrency()
    const router = useRouter()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
    }

    const isStaff = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENCY_ADMIN', 'AGENT', 'HR_MANAGER'].includes(user.role)

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
    const roleDisplay = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Administrador' :
                       user?.role === 'MANAGER' ? 'Gerente' :
                       user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENT' ? 'Agente de Viajes' : 'Viajero'

    return (
        <div className="flex items-center gap-2.5">
            {/* Badge de Selección de Idioma y Moneda (Imagen 4) */}
            <button
                onClick={openModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{language.toUpperCase()} / {currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Botón "Tus Reservas" */}
            <button
                onClick={() => router.push('/mis-reservas')}
                className="hidden md:inline-flex text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 transition-colors"
            >
                Tus Reservas
            </button>

            {/* Botón "Ayuda" */}
            <button
                onClick={() => router.push('/ayuda')}
                className="hover:text-primary hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-gray-100 transition-colors rounded-lg"
            >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Ayuda</span>
            </button>

            {!isAuthenticated || !user ? (
                <Link href="/login">
                    <button 
                        className="px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all shadow-xs" 
                        style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
                    >
                        Iniciar sesión
                    </button>
                </Link>
            ) : (
                <>
                    {/* Botón de Notificaciones */}
                    <button
                        onClick={() => router.push('/notificaciones')}
                        className="hover:text-primary relative p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        title="Notificaciones"
                    >
                        <Bell className="w-4.5 h-4.5 text-gray-700" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Menú Dropdown de Usuario */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-xs" 
                                style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
                            >
                                {initial}
                            </div>
                            <div className="hidden md:flex items-center gap-1">
                                <span className="text-xs font-bold text-gray-800">{user.name.split(' ')[0]}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                        </button>

                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />

                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                                    
                                    {/* Los datos del usuario (Header Card - Imagen 1) */}
                                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Los datos del usuario</p>
                                            <p className="text-xs font-bold text-gray-900 truncate mt-0.5">Nombre: <span className="font-normal">{user.name}</span></p>
                                            <p className="text-xs text-gray-600 truncate mt-0.5">Correo: <span className="font-normal">{user.email}</span></p>
                                            <p className="text-xs text-gray-600 mt-0.5">Tipo de usuario: <span className="font-semibold text-slate-800">{roleDisplay}</span></p>
                                        </div>
                                    </div>

                                    {/* Opciones de Navegación del Usuario */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => { router.push('/perfil'); setShowUserMenu(false) }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-medium transition-colors"
                                        >
                                            <UserIcon className="w-4 h-4 text-gray-500" />
                                            Perfil
                                        </button>

                                        <button
                                            onClick={() => { router.push('/mis-reservas'); setShowUserMenu(false) }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-medium transition-colors"
                                        >
                                            <Package className="w-4 h-4 text-gray-500" />
                                            Mis reservas
                                        </button>

                                        {/* Opción "Operación" para roles mayores a cliente */}
                                        {isStaff && (
                                            <button
                                                onClick={() => { router.push('/operacion'); setShowUserMenu(false) }}
                                                className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center justify-between text-xs text-blue-700 font-bold transition-colors border-t border-b border-blue-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Sliders className="w-4 h-4 text-blue-600" />
                                                    <span>Operación</span>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">CRM</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Cerrar Sesion */}
                                    <div className="border-t border-gray-100 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-xs text-red-600 font-semibold transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
