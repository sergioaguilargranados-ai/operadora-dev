"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Loader2, User, Building2, UserCircle2, Mail, Phone, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface UserData {
    id: number
    name: string
    email: string
    phone: string
    avatar_url: string
    global_role: string
    is_active: boolean
    created_at: string
    last_login: string
    agency_role?: string
    agency_name?: string
    tenant_id?: number
}

export default function UsersAdminPage() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserData[]>([])
    const [roles, setRoles] = useState<string[]>([])
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // all, internal, agency

    useEffect(() => {
        fetchUsers()
    }, [filterType])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/users?type=${filterType}`)
            const data = await res.json()
            if (data.success) {
                setUsers(data.data.users)
                setRoles(data.data.roles)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole })
            })
            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, global_role: newRole } : u))
            }
        } catch (err) {
            alert('Error al actualizar el rol')
        }
    }

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, is_active: !currentStatus })
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
            }
        } catch (err) {
            alert('Error al actualizar el estatus')
        }
    }

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <UserCircle2 className="w-6 h-6 text-indigo-600" />
                    Catálogo Maestro de Usuarios
                </span>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* Header Actions & Filters */}
                <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                            />
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Todos
                            </button>
                            <button 
                                onClick={() => setFilterType('internal')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'internal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Internos (AS Operadora)
                            </button>
                            <button 
                                onClick={() => setFilterType('agency')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'agency' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Externos (Agencias B2B)
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Users List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Contacto</th>
                                        <th className="px-6 py-4">Agencia (Multi-Tenant)</th>
                                        <th className="px-6 py-4">Rol del Sistema</th>
                                        <th className="px-6 py-4 text-center">Estatus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron usuarios con esos filtros.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Calendar className="w-3 h-3" /> Registrado el {format(new Date(user.created_at), 'dd/MM/yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {user.email}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Phone className="w-3 h-3 text-gray-400" />
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.tenant_id ? (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                                                                <Building2 className="w-3 h-3" />
                                                                {user.agency_name}
                                                            </span>
                                                            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold ml-1">
                                                                Rol Agencia: {user.agency_role}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Usuario Interno</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                                        value={user.global_role || 'CLIENT'}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    >
                                                        {roles.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
