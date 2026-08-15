'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import { 
    Shield, 
    ShieldCheck, 
    Plus, 
    Trash2, 
    Edit, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    Users, 
    Building2, 
    Sparkles, 
    Lock, 
    Unlock, 
    Search,
    RefreshCw,
    Check,
    X,
    Filter,
    Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface RoleItem {
    id: number
    name: string
    display_name?: string
    description?: string
    tenant_id?: number | null
    tenant_name?: string | null
    is_system?: boolean
    total_users: number
    permissions: string[]
}

interface PermissionItem {
    id: number
    code: string
    module: string
    action: string
    description: string
}

const MODULE_LABELS: Record<string, string> = {
    crm: 'CRM & Clientes',
    quotes: 'Cotizaciones',
    bookings: 'Reservaciones',
    rrhh: 'RRHH & Personal',
    content: 'Gestión de Contenido',
    store: 'Tienda Online',
    invoices: 'Facturación SAT',
    admin: 'Administración & Sistema',
    profile: 'Cuenta Personal',
    my_bookings: 'Mis Reservas (Cliente)',
    my_invoices: 'Mis Facturas (Cliente)',
    help: 'Centro de Ayuda',
    public: 'Público / Landing'
}

export default function AdminRolesPage() {
    const router = useRouter()
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const { refreshPermissions } = usePermissions()

    const [activeTab, setActiveTab] = useState<'roles' | 'matrix'>('roles')
    const [roles, setRoles] = useState<RoleItem[]>([])
    const [permissions, setPermissions] = useState<PermissionItem[]>([])
    const [groupedPermissions, setGroupedPermissions] = useState<Record<string, PermissionItem[]>>({})
    const [tenants, setTenants] = useState<{ id: number; company_name: string }[]>([])
    const [selectedTenant, setSelectedTenant] = useState<string>('all')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Modal nuevo rol
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newRoleName, setNewRoleName] = useState('')
    const [newRoleDisplayName, setNewRoleDisplayName] = useState('')
    const [newRoleDescription, setNewRoleDescription] = useState('')
    const [newRoleTenantId, setNewRoleTenantId] = useState<string>('global')

    // Matriz de edición
    const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<RoleItem | null>(null)
    const [matrixPermissions, setMatrixPermissions] = useState<string[]>([])
    const [searchModule, setSearchModule] = useState('')

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const loadData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('as_token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [rolesRes, permsRes, tenantsRes] = await Promise.all([
                fetch('/api/admin/roles', { headers }),
                fetch('/api/admin/permissions', { headers }),
                fetch('/api/admin/tenants', { headers })
            ])

            const rolesData = await rolesRes.json()
            const permsData = await permsRes.json()
            const tenantsData = await tenantsRes.json()

            if (rolesData.success) {
                setRoles(rolesData.data)
                if (!selectedRoleForMatrix && rolesData.data.length > 0) {
                    setSelectedRoleForMatrix(rolesData.data[0])
                    setMatrixPermissions(rolesData.data[0].permissions || [])
                }
            }

            if (permsData.success) {
                setPermissions(permsData.data.permissions)
                setGroupedPermissions(permsData.data.grouped)
            }

            if (tenantsData.success && Array.isArray(tenantsData.data)) {
                setTenants(tenantsData.data)
            }
        } catch (error) {
            console.error('Error cargando roles y permisos:', error)
            showToast('Error al cargar datos', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSelectRoleForMatrix = (role: RoleItem) => {
        setSelectedRoleForMatrix(role)
        setMatrixPermissions(role.permissions || [])
    }

    const togglePermission = (code: string) => {
        setMatrixPermissions(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    const toggleAllInModule = (modulePerms: PermissionItem[]) => {
        const moduleCodes = modulePerms.map(p => p.code)
        const allSelected = moduleCodes.every(code => matrixPermissions.includes(code))

        if (allSelected) {
            // Desmarcar todos del módulo
            setMatrixPermissions(prev => prev.filter(code => !moduleCodes.includes(code)))
        } else {
            // Marcar todos del módulo
            const toAdd = moduleCodes.filter(code => !matrixPermissions.includes(code))
            setMatrixPermissions(prev => [...prev, ...toAdd])
        }
    }

    const handleSaveMatrix = async () => {
        if (!selectedRoleForMatrix) return

        try {
            setSaving(true)
            const token = localStorage.getItem('as_token')
            const res = await fetch('/api/admin/roles', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: selectedRoleForMatrix.id,
                    display_name: selectedRoleForMatrix.display_name,
                    description: selectedRoleForMatrix.description,
                    permission_codes: matrixPermissions
                })
            })

            const data = await res.json()
            if (data.success) {
                showToast(`Permisos guardados para el rol ${selectedRoleForMatrix.display_name || selectedRoleForMatrix.name}`, 'success')
                await refreshPermissions()
                await loadData()
            } else {
                showToast(data.error || 'Error al guardar permisos', 'error')
            }
        } catch (error) {
            console.error('Error guardando permisos:', error)
            showToast('Error de conexión', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRoleName.trim()) {
            showToast('El código del rol es obligatorio', 'error')
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem('as_token')
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newRoleName,
                    display_name: newRoleDisplayName || newRoleName,
                    description: newRoleDescription,
                    tenant_id: newRoleTenantId === 'global' ? null : parseInt(newRoleTenantId),
                    permission_codes: []
                })
            })

            const data = await res.json()
            if (data.success) {
                showToast('Rol creado exitosamente', 'success')
                setIsCreateModalOpen(false)
                setNewRoleName('')
                setNewRoleDisplayName('')
                setNewRoleDescription('')
                setNewRoleTenantId('global')
                await loadData()
            } else {
                showToast(data.error || 'Error al crear rol', 'error')
            }
        } catch (error) {
            console.error('Error creando rol:', error)
            showToast('Error de conexión', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteRole = async (role: RoleItem) => {
        if (role.is_system) {
            showToast('Los roles del sistema están protegidos y no pueden eliminarse', 'error')
            return
        }

        if (role.total_users > 0) {
            showToast(`No se puede eliminar: tiene ${role.total_users} usuario(s) asignados`, 'error')
            return
        }

        if (!confirm(`¿Estás seguro de que deseas eliminar el rol "${role.display_name || role.name}"?`)) {
            return
        }

        try {
            const token = localStorage.getItem('as_token')
            const res = await fetch(`/api/admin/roles?id=${role.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await res.json()
            if (data.success) {
                showToast('Rol eliminado exitosamente', 'success')
                await loadData()
            } else {
                showToast(data.error || 'Error al eliminar rol', 'error')
            }
        } catch (error) {
            console.error('Error eliminando rol:', error)
            showToast('Error de conexión', 'error')
        }
    }

    const filteredRoles = roles.filter(r => {
        if (selectedTenant === 'all') return true
        if (selectedTenant === 'global') return !r.tenant_id
        return r.tenant_id === parseInt(selectedTenant)
    })

    const filteredModules = Object.entries(groupedPermissions).filter(([moduleKey]) => {
        if (!searchModule) return true
        const label = MODULE_LABELS[moduleKey] || moduleKey
        return label.toLowerCase().includes(searchModule.toLowerCase()) || moduleKey.toLowerCase().includes(searchModule.toLowerCase())
    })

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
            {/* ═══ TOAST NOTIFICATION ═══ */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-4 ${
                    toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ═══ ENCABEZADO INSTITUCIONAL ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                        <ShieldCheck className="w-7 h-7 text-slate-800" />
                        Gestión de Roles & Matriz de Permisos
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Administra el catálogo de roles, marcas blancas y permisos granulares de todo el sistema
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Rol
                    </Button>
                </div>
            </div>

            {/* ═══ PESTAÑAS PRINCIPALES ═══ */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="roles" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                        <Users className="w-4 h-4" />
                        Catálogo de Roles ({roles.length})
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900">
                        <Layers className="w-4 h-4" />
                        Matriz de Permisos
                    </TabsTrigger>
                </TabsList>

                {/* ═══════════════════════════════════════════════════════════
                    PESTAÑA 1: CATÁLOGO DE ROLES
                ═══════════════════════════════════════════════════════════ */}
                <TabsContent value="roles" className="space-y-4 pt-4">
                    {/* Filtro por Tenant / Marca Blanca */}
                    <div className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                            <Filter className="w-4 h-4 text-slate-500" />
                            Filtrar por Entidad:
                        </div>
                        <select 
                            value={selectedTenant} 
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:ring-1 focus:ring-slate-900"
                        >
                            <option value="all">Todos los Roles ({roles.length})</option>
                            <option value="global">Roles Globales del Sistema</option>
                            {tenants.map(t => (
                                <option key={t.id} value={String(t.id)}>Marca Blanca: {t.company_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Grid de Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRoles.map(role => (
                            <Card 
                                key={role.id} 
                                className="p-5 border-gray-200/80 shadow-2xs rounded-2xl bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {role.display_name || role.name}
                                                </h3>
                                                {role.is_system ? (
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-bold">
                                                        Sistema
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                                                        Personalizado
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs font-mono text-slate-400 mt-0.5">{role.name}</p>
                                        </div>

                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                                            {role.total_users}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                                        {role.description || 'Sin descripción asignada'}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                                            <Shield className="w-3 h-3 text-slate-500" />
                                            {role.name === 'SUPER_ADMIN' ? 'Todos los permisos' : `${role.permissions?.length || 0} permisos`}
                                        </span>
                                        {role.tenant_name && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                <Building2 className="w-3 h-3" />
                                                {role.tenant_name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                            handleSelectRoleForMatrix(role)
                                            setActiveTab('matrix')
                                        }}
                                        className="text-xs font-semibold text-slate-800 hover:bg-slate-100 gap-1.5 flex-1"
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        Editar Permisos
                                    </Button>

                                    {!role.is_system && role.total_users === 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDeleteRole(role)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
                                            title="Eliminar Rol"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ═══════════════════════════════════════════════════════════
                    PESTAÑA 2: MATRIZ DE PERMISOS GRANULARES
                ═══════════════════════════════════════════════════════════ */}
                <TabsContent value="matrix" className="space-y-6 pt-4">
                    {/* Selector de Rol a Configurar y Barra de Acción */}
                    <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Rol Seleccionado:
                            </Label>
                            <select 
                                value={selectedRoleForMatrix?.id || ''} 
                                onChange={(e) => {
                                    const r = roles.find(item => item.id === parseInt(e.target.value))
                                    if (r) handleSelectRoleForMatrix(r)
                                }}
                                className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-slate-900"
                            >
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.display_name || r.name} ({r.name}) {r.is_system ? '[Sistema]' : ''}
                                    </option>
                                ))}
                            </select>

                            {selectedRoleForMatrix?.name === 'SUPER_ADMIN' && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs">
                                    ★ Acceso Total Irrestricto
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <Input 
                                    placeholder="Buscar módulo..."
                                    value={searchModule}
                                    onChange={(e) => setSearchModule(e.target.value)}
                                    className="pl-9 h-9 text-xs w-48 bg-slate-50 border-slate-200"
                                />
                            </div>

                            <Button 
                                onClick={handleSaveMatrix}
                                disabled={saving || selectedRoleForMatrix?.name === 'SUPER_ADMIN'}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-2xs"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar Matriz'}
                            </Button>
                        </div>
                    </Card>

                    {/* Matriz por Módulos y Acciones */}
                    <div className="space-y-4">
                        {filteredModules.map(([moduleKey, modulePerms]) => {
                            const moduleCodes = modulePerms.map(p => p.code)
                            const allSelected = moduleCodes.every(c => matrixPermissions.includes(c))
                            const someSelected = moduleCodes.some(c => matrixPermissions.includes(c))

                            return (
                                <Card key={moduleKey} className="border-gray-200/80 shadow-2xs rounded-2xl bg-white overflow-hidden">
                                    {/* Cabecera del Módulo */}
                                    <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-slate-900" />
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900">
                                                    {MODULE_LABELS[moduleKey] || moduleKey.toUpperCase()}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-mono">Módulo: {moduleKey}</p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleAllInModule(modulePerms)}
                                            disabled={selectedRoleForMatrix?.name === 'SUPER_ADMIN'}
                                            className="text-xs font-semibold text-slate-700 hover:bg-slate-200"
                                        >
                                            {allSelected ? 'Desmarcar Módulo' : 'Seleccionar Todo'}
                                        </Button>
                                    </div>

                                    {/* Lista de Acciones Granulares */}
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {modulePerms.map(perm => {
                                            const isChecked = selectedRoleForMatrix?.name === 'SUPER_ADMIN' || matrixPermissions.includes(perm.code)

                                            return (
                                                <label 
                                                    key={perm.id}
                                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                                        isChecked 
                                                            ? 'bg-blue-50/50 border-blue-200 text-slate-900' 
                                                            : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                                                    } ${selectedRoleForMatrix?.name === 'SUPER_ADMIN' ? 'cursor-not-allowed opacity-80' : ''}`}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={selectedRoleForMatrix?.name === 'SUPER_ADMIN'}
                                                        onChange={() => togglePermission(perm.code)}
                                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="font-bold text-xs text-slate-900 truncate">
                                                                {perm.description || perm.action}
                                                            </span>
                                                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                                {perm.action}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                                                            {perm.code}
                                                        </p>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ═══════════════════════════════════════════════════════════
                MODAL CREAR NUEVO ROL
            ═══════════════════════════════════════════════════════════ */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-800" />
                                Crear Nuevo Rol
                            </h3>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRole} className="space-y-4">
                            <div>
                                <Label className="text-xs font-bold text-slate-700 uppercase">
                                    Código del Rol *
                                </Label>
                                <Input 
                                    placeholder="EJ: SUPERVISOR_VENTAS"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
                                    className="font-mono mt-1 text-sm uppercase"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Identificador único en mayúsculas sin espacios.</p>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700 uppercase">
                                    Nombre Visible
                                </Label>
                                <Input 
                                    placeholder="EJ: Supervisor de Ventas & Grupos"
                                    value={newRoleDisplayName}
                                    onChange={(e) => setNewRoleDisplayName(e.target.value)}
                                    className="mt-1 text-sm"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700 uppercase">
                                    Ámbito / Entidad
                                </Label>
                                <select
                                    value={newRoleTenantId}
                                    onChange={(e) => setNewRoleTenantId(e.target.value)}
                                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                                >
                                    <option value="global">Global (Toda la Plataforma)</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={String(t.id)}>Marca Blanca: {t.company_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700 uppercase">
                                    Descripción del Rol
                                </Label>
                                <textarea 
                                    rows={3}
                                    placeholder="Describe las responsabilidades y alcance de este rol..."
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 focus:ring-1 focus:ring-slate-900"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                                >
                                    {saving ? 'Guardando...' : 'Crear Rol'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
