"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Key, Plus, Loader2, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface Permission {
    id: number
    name: string
    module: string
    action: string
    description: string
}

interface Role {
    id: number
    name: string
    description: string
    is_system: boolean
    permissions: number[]
}

export default function RolesAdminPage() {
    const router = useRouter()
    const [roles, setRoles] = useState<Role[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    // UI State
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [editedPermissions, setEditedPermissions] = useState<Set<number>>(new Set())
    const [showNewRoleModal, setShowNewRoleModal] = useState(false)
    const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' })

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/roles')
            const data = await res.json()
            if (data.success) {
                setRoles(data.data.roles)
                setAllPermissions(data.data.all_permissions)
            }
        } catch (error) {
            console.error('Error fetching roles:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role)
        setEditedPermissions(new Set(role.permissions))
    }

    const handleTogglePermission = (permId: number) => {
        if (!selectedRole) return
        const newSet = new Set(editedPermissions)
        if (newSet.has(permId)) {
            newSet.delete(permId)
        } else {
            newSet.add(permId)
        }
        setEditedPermissions(newSet)
    }

    const handleSaveRole = async () => {
        if (!selectedRole) return
        try {
            setSaving(true)
            const res = await fetch('/api/admin/roles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRole.id,
                    permissions: Array.from(editedPermissions)
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Rol actualizado correctamente')
                fetchRoles()
            } else {
                alert('Error al actualizar el rol: ' + data.error)
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('Error de red al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoleForm)
            })
            const data = await res.json()
            if (data.success) {
                setShowNewRoleModal(false)
                setNewRoleForm({ name: '', description: '' })
                fetchRoles()
            } else {
                alert('Error al crear: ' + data.error)
            }
        } catch (error) {
            alert('Error de red')
        } finally {
            setSaving(false)
        }
    }

    // Group permissions by module for the matrix UI
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = []
        acc[perm.module].push(perm)
        return acc
    }, {} as Record<string, Permission[]>)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-bold text-gray-800">Roles y Permisos</span>
                </div>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Lista de Roles */}
                    <Card className="col-span-1 p-0 overflow-hidden shadow-sm border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="font-semibold text-gray-800">Roles del Sistema</h3>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => setShowNewRoleModal(true)}>
                                <Plus className="w-4 h-4 mr-1" /> Nuevo Rol
                            </Button>
                        </div>
                        <div className="divide-y divide-gray-100 bg-white">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => handleSelectRole(role)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start justify-between ${
                                        selectedRole?.id === role.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{role.name}</span>
                                            {role.is_system && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Sistema</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{role.description}</p>
                                    </div>
                                    <div className="text-xs text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md">
                                        {role.permissions.length} perm
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Matriz de Permisos */}
                    <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200 bg-white min-h-[500px] flex flex-col">
                        {!selectedRole ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                <Key className="w-12 h-12 mb-4 text-gray-300" />
                                <p>Selecciona un rol de la lista para ver y editar sus permisos.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Matriz de Permisos: {selectedRole.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedRole.description}</p>
                                    </div>
                                    <Button onClick={handleSaveRole} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Guardar Cambios
                                    </Button>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    {Object.keys(groupedPermissions).length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No hay permisos registrados en el sistema.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                                                <div key={moduleName} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <h3 className="font-semibold text-gray-800 capitalize mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                                        Módulo: {moduleName}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {perms.map(perm => {
                                                            const isChecked = editedPermissions.has(perm.id)
                                                            return (
                                                                <label key={perm.id} className="flex items-start gap-3 cursor-pointer group">
                                                                    <div className="mt-0.5 relative flex items-center justify-center">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handleTogglePermission(perm.id)}
                                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                                                            {perm.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {perm.description}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal de Nuevo Rol */}
            {showNewRoleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Crear Nuevo Rol</h3>
                            <button onClick={() => setShowNewRoleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Identificador del Rol</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase" 
                                    placeholder="EJ: AUDITOR_JR"
                                    value={newRoleForm.name}
                                    onChange={e => setNewRoleForm({...newRoleForm, name: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Debe ser en mayúsculas, sin espacios.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
                                    rows={3}
                                    placeholder="Descripción de responsabilidades..."
                                    value={newRoleForm.description}
                                    onChange={e => setNewRoleForm({...newRoleForm, description: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowNewRoleModal(false)}>Cancelar</Button>
                                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Rol'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
