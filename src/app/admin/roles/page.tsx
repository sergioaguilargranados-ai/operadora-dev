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
    Layers,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    FolderTree,
    RotateCcw,
    GripVertical,
    ChevronDown,
    ChevronRight,
    MoveRight
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

interface MenuItemData {
    id: number
    section_key: string
    section_title: string
    section_order: number
    item_key: string
    label: string
    icon_name: string | null
    route: string
    badge: string | null
    permission_code: string | null
    parent_item_key: string | null
    sort_order: number
    is_active: boolean
    tenant_id: number | null
    subItems?: MenuItemData[]
}

interface MenuSectionData {
    key: string
    title: string
    order: number
    items: MenuItemData[]
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

const SECTION_OPTIONS = [
    { key: 'operation', title: 'INTRANET & OPERACIÓN' },
    { key: 'bookings', title: 'GESTIÓN DE RESERVAS' },
    { key: 'admin', title: 'ADMINISTRACIÓN Y AJUSTES' },
    { key: 'account', title: 'CUENTA PERSONAL' }
]

export default function AdminRolesPage() {
    const router = useRouter()
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const { refreshPermissions } = usePermissions()

    const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'menu'>('roles')
    const [roles, setRoles] = useState<RoleItem[]>([])
    const [permissions, setPermissions] = useState<PermissionItem[]>([])
    const [groupedPermissions, setGroupedPermissions] = useState<Record<string, PermissionItem[]>>({})
    const [tenants, setTenants] = useState<{ id: number; company_name: string }[]>([])
    const [selectedTenant, setSelectedTenant] = useState<string>('all')

    // Menú Dinámico
    const [menuSections, setMenuSections] = useState<MenuSectionData[]>([])
    const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({})
    const [hasMenuChanges, setHasMenuChanges] = useState(false)

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
            const token = typeof window !== 'undefined' ? localStorage.getItem('as_token') : null
            const headers: HeadersInit = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            // 1. Carga de roles
            try {
                const rolesRes = await fetch('/api/admin/roles', { headers })
                if (rolesRes.ok) {
                    const rolesData = await rolesRes.json()
                    if (rolesData.success && Array.isArray(rolesData.data)) {
                        setRoles(rolesData.data)
                        if (rolesData.data.length > 0) {
                            setSelectedRoleForMatrix(prev => prev || rolesData.data[0])
                            setMatrixPermissions(prev => prev.length > 0 ? prev : (rolesData.data[0].permissions || []))
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching roles:', err)
            }

            // 2. Carga de catálogo de permisos
            try {
                const permsRes = await fetch('/api/admin/permissions', { headers })
                if (permsRes.ok) {
                    const permsData = await permsRes.json()
                    if (permsData.success) {
                        setPermissions(permsData.data.permissions || [])
                        setGroupedPermissions(permsData.data.grouped || {})
                    }
                }
            } catch (err) {
                console.error('Error fetching permissions:', err)
            }

            // 3. Carga de tenants / marcas blancas
            try {
                const tenantsRes = await fetch('/api/admin/tenants', { headers })
                if (tenantsRes.ok) {
                    const tenantsData = await tenantsRes.json()
                    if (tenantsData.success && Array.isArray(tenantsData.data)) {
                        setTenants(tenantsData.data)
                    }
                }
            } catch (err) {
                console.error('Error fetching tenants:', err)
            }

            // 4. Carga de estructura de menú
            try {
                const tenantQuery = selectedTenant !== 'all' && selectedTenant !== 'global' ? `?tenant_id=${selectedTenant}` : ''
                const menuRes = await fetch(`/api/admin/menu${tenantQuery}`, { headers })
                if (menuRes.ok) {
                    const menuData = await menuRes.json()
                    if (menuData.success && menuData.data?.sections) {
                        setMenuSections(menuData.data.sections)
                    }
                }
            } catch (err) {
                console.error('Error fetching menu structure:', err)
            }
        } catch (error) {
            console.error('Error cargando datos:', error)
            showToast('Error al cargar datos', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [selectedTenant])

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
            setMatrixPermissions(prev => prev.filter(code => !moduleCodes.includes(code)))
        } else {
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

    // ═══════════════════════════════════════════════════════════
    // MÉTODOS DEL ORGANIZADOR DEL MENÚ
    // ═══════════════════════════════════════════════════════════

    const toggleSubmenuExpand = (itemKey: string) => {
        setExpandedSubmenus(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))
    }

    const moveItemInDirection = (sectionKey: string, index: number, direction: 'up' | 'down') => {
        setMenuSections(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as MenuSectionData[]
            const section = next.find(s => s.key === sectionKey)
            if (!section) return prev

            const targetIndex = direction === 'up' ? index - 1 : index + 1
            if (targetIndex < 0 || targetIndex >= section.items.length) return prev

            // Intercambiar
            const temp = section.items[index]
            section.items[index] = section.items[targetIndex]
            section.items[targetIndex] = temp

            // Reasignar sort_order
            section.items.forEach((item, idx) => {
                item.sort_order = idx + 1
            })

            return next
        })
        setHasMenuChanges(true)
    }

    const moveSubItemInDirection = (sectionKey: string, parentKey: string, subIndex: number, direction: 'up' | 'down') => {
        setMenuSections(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as MenuSectionData[]
            const section = next.find(s => s.key === sectionKey)
            if (!section) return prev
            const parent = section.items.find(i => i.item_key === parentKey)
            if (!parent || !parent.subItems) return prev

            const targetIndex = direction === 'up' ? subIndex - 1 : subIndex + 1
            if (targetIndex < 0 || targetIndex >= parent.subItems.length) return prev

            // Intercambiar
            const temp = parent.subItems[subIndex]
            parent.subItems[subIndex] = parent.subItems[targetIndex]
            parent.subItems[targetIndex] = temp

            // Reasignar sort_order
            parent.subItems.forEach((sub, idx) => {
                sub.sort_order = idx + 1
            })

            return next
        })
        setHasMenuChanges(true)
    }

    const changeItemSection = (itemKey: string, fromSectionKey: string, toSectionKey: string) => {
        if (fromSectionKey === toSectionKey) return

        setMenuSections(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as MenuSectionData[]
            const fromSec = next.find(s => s.key === fromSectionKey)
            const toSec = next.find(s => s.key === toSectionKey)
            if (!fromSec || !toSec) return prev

            const itemIndex = fromSec.items.findIndex(i => i.item_key === itemKey)
            if (itemIndex === -1) return prev

            const [movedItem] = fromSec.items.splice(itemIndex, 1)
            movedItem.section_key = toSec.key
            movedItem.section_title = toSec.title
            movedItem.section_order = toSec.order
            movedItem.sort_order = toSec.items.length + 1

            toSec.items.push(movedItem)

            // Reordenar sección origen
            fromSec.items.forEach((item, idx) => {
                item.sort_order = idx + 1
            })

            return next
        })
        setHasMenuChanges(true)
    }

    const toggleItemActive = (itemKey: string, sectionKey: string) => {
        setMenuSections(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as MenuSectionData[]
            const section = next.find(s => s.key === sectionKey)
            if (!section) return prev
            const item = section.items.find(i => i.item_key === itemKey)
            if (item) {
                item.is_active = !item.is_active
            }
            return next
        })
        setHasMenuChanges(true)
    }

    const handleSaveMenuStructure = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem('as_token')

            // Aplanar todos los items y sub-items
            const flattenedItems: any[] = []
            menuSections.forEach(sec => {
                sec.items.forEach(item => {
                    flattenedItems.push({
                        item_key: item.item_key,
                        section_key: sec.key,
                        section_title: sec.title,
                        section_order: sec.order,
                        sort_order: item.sort_order,
                        is_active: item.is_active
                    })

                    if (Array.isArray(item.subItems)) {
                        item.subItems.forEach(sub => {
                            flattenedItems.push({
                                item_key: sub.item_key,
                                section_key: sec.key,
                                section_title: sec.title,
                                section_order: sec.order,
                                sort_order: sub.sort_order,
                                is_active: item.is_active
                            })
                        })
                    }
                })
            })

            const tenantId = selectedTenant !== 'all' && selectedTenant !== 'global' ? parseInt(selectedTenant) : null

            const res = await fetch('/api/admin/menu', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: flattenedItems,
                    tenant_id: tenantId
                })
            })

            const data = await res.json()
            if (data.success) {
                showToast('Estructura del menú guardada exitosamente', 'success')
                setHasMenuChanges(false)
                // Disparar evento para actualizar sidebar en vivo si está abierto
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('menuStructureUpdated'))
                }
            } else {
                showToast(data.error || 'Error al guardar estructura', 'error')
            }
        } catch (error) {
            console.error('Error guardando menú:', error)
            showToast('Error de conexión al guardar menú', 'error')
        } finally {
            setSaving(false)
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
                        Administra el catálogo de roles, marcas blancas, permisos granulares y la estructura del menú
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
                <TabsList className="grid w-full grid-cols-3 max-w-xl bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="roles" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 text-xs sm:text-sm">
                        <Users className="w-4 h-4" />
                        Catálogo de Roles ({roles.length})
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 text-xs sm:text-sm">
                        <Layers className="w-4 h-4" />
                        Matriz de Permisos
                    </TabsTrigger>
                    <TabsTrigger value="menu" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 text-xs sm:text-sm">
                        <FolderTree className="w-4 h-4" />
                        Organizador de Menú
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                            <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
                            <p className="text-sm font-semibold text-slate-700">Cargando catálogo de roles y permisos...</p>
                        </div>
                    ) : filteredRoles.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-slate-300 bg-white rounded-2xl">
                            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700">No se encontraron roles</h3>
                            <p className="text-xs text-slate-400 mt-1">No hay roles registrados para el filtro seleccionado</p>
                        </Card>
                    ) : (
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
                    )}
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

                {/* ═══════════════════════════════════════════════════════════
                    PESTAÑA 3: ORGANIZADOR DE MENÚ INTERACTIVO
                ═══════════════════════════════════════════════════════════ */}
                <TabsContent value="menu" className="space-y-6 pt-4">
                    {/* Barra de Control del Menú */}
                    <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-slate-800" />
                                Organizador de Menú y Secciones
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Cambia el orden con ▲/▼, mueve opciones entre secciones o desactiva las que no requieras
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handleSaveMenuStructure}
                                disabled={saving || !hasMenuChanges}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-2xs"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : hasMenuChanges ? 'Guardar Cambios' : 'Estructura Guardada'}
                            </Button>
                        </div>
                    </Card>

                    {/* Lista de Secciones y sus Ítems */}
                    <div className="space-y-6">
                        {menuSections.map(section => (
                            <Card key={section.key} className="border-gray-200/80 shadow-2xs rounded-2xl bg-white overflow-hidden">
                                {/* Cabecera de la Sección */}
                                <div className="bg-slate-100/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                                        <h4 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
                                            {section.title}
                                        </h4>
                                        <Badge variant="outline" className="bg-white text-slate-600 text-[10px] font-semibold">
                                            {section.items.length} opciones
                                        </Badge>
                                    </div>
                                </div>

                                {/* Lista de Ítems dentro de la Sección */}
                                <div className="p-4 divide-y divide-slate-100">
                                    {section.items.map((item, itemIdx) => {
                                        const hasSub = Array.isArray(item.subItems) && item.subItems.length > 0
                                        const isExpanded = expandedSubmenus[item.item_key]

                                        return (
                                            <div key={item.item_key} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200/70 transition-all">
                                                    {/* Nombre e Información del Ítem */}
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                                                            {item.sort_order}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold text-sm ${item.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                                                    {item.label}
                                                                </span>
                                                                {item.badge && (
                                                                    <Badge className="bg-slate-200 text-slate-800 text-[10px] font-bold">
                                                                        {item.badge}
                                                                    </Badge>
                                                                )}
                                                                {item.permission_code && (
                                                                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                        {item.permission_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 font-mono truncate">{item.route}</p>
                                                        </div>
                                                    </div>

                                                    {/* Controles de Reubicación */}
                                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                                        {/* Mover a otra Sección */}
                                                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
                                                            <MoveRight className="w-3.5 h-3.5 text-slate-400" />
                                                            <select 
                                                                value={section.key}
                                                                onChange={(e) => changeItemSection(item.item_key, section.key, e.target.value)}
                                                                className="bg-transparent font-medium text-slate-700 text-xs focus:outline-none cursor-pointer"
                                                            >
                                                                {SECTION_OPTIONS.map(opt => (
                                                                    <option key={opt.key} value={opt.key}>{opt.title}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Subir */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={itemIdx === 0}
                                                            onClick={() => moveItemInDirection(section.key, itemIdx, 'up')}
                                                            className="h-8 w-8 p-0 text-slate-700 hover:bg-slate-200"
                                                            title="Subir posición"
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </Button>

                                                        {/* Bajar */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={itemIdx === section.items.length - 1}
                                                            onClick={() => moveItemInDirection(section.key, itemIdx, 'down')}
                                                            className="h-8 w-8 p-0 text-slate-700 hover:bg-slate-200"
                                                            title="Bajar posición"
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </Button>

                                                        {/* Activar / Desactivar */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleItemActive(item.item_key, section.key)}
                                                            className={`h-8 w-8 p-0 ${item.is_active ? 'text-slate-600 hover:text-slate-900' : 'text-amber-600 hover:text-amber-700'}`}
                                                            title={item.is_active ? "Ocultar del menú" : "Mostrar en el menú"}
                                                        >
                                                            {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                        </Button>

                                                        {/* Desplegable de Submenús */}
                                                        {hasSub && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleSubmenuExpand(item.item_key)}
                                                                className="h-8 px-2 text-xs font-semibold text-slate-800 gap-1 bg-white"
                                                            >
                                                                <span>{item.subItems!.length} sub-opciones</span>
                                                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Sub-ítems anidados */}
                                                {hasSub && isExpanded && (
                                                    <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-2 py-2 animate-in slide-in-from-top-2 duration-150">
                                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                            Sub-opciones de {item.label}:
                                                        </p>
                                                        <div className="space-y-1.5">
                                                            {item.subItems!.map((sub, subIdx) => (
                                                                <div key={sub.item_key} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                                                                            {sub.sort_order}
                                                                        </span>
                                                                        <span className="font-semibold text-xs text-slate-800">{sub.label}</span>
                                                                        <span className="text-[10px] font-mono text-slate-400">{sub.route}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={subIdx === 0}
                                                                            onClick={() => moveSubItemInDirection(section.key, item.item_key, subIdx, 'up')}
                                                                            className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-100"
                                                                            title="Subir sub-opción"
                                                                        >
                                                                            <ArrowUp className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={subIdx === item.subItems!.length - 1}
                                                                            onClick={() => moveSubItemInDirection(section.key, item.item_key, subIdx, 'down')}
                                                                            className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-100"
                                                                            title="Bajar sub-opción"
                                                                        >
                                                                            <ArrowDown className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </Card>
                        ))}
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
