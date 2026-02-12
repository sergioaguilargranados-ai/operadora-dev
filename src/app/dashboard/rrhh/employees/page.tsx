"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    Users, Search, Plus, Filter, Download,
    MoreVertical, Eye, Edit, Trash2,
    Building2, Mail, Phone, MapPin,
    Briefcase, ChevronDown, X
} from 'lucide-react'

interface Employee {
    id: number
    employee_number: string
    first_name: string
    last_name: string
    full_name: string
    email: string
    phone: string
    employee_type: string
    employment_status: string
    department_name: string | null
    position_title: string | null
    hire_date: string | null
    photo_url: string | null
    base_salary: number | null
    agency_name: string | null
    created_at: string
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('active')
    const [deptFilter, setDeptFilter] = useState('')
    const [total, setTotal] = useState(0)
    const [showNewForm, setShowNewForm] = useState(false)

    // Form state
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        employee_type: 'internal', department_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        rfc: '', curp: '', nss: '', base_salary: '',
        work_schedule: 'full_time',
        emergency_contact_name: '', emergency_contact_phone: ''
    })
    const [saving, setSaving] = useState(false)

    const fetchEmployees = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                action: 'employees',
                employee_type: 'internal',
                employment_status: statusFilter,
                limit: '50',
                offset: '0'
            })
            if (search) params.set('search', search)
            if (deptFilter) params.set('department_id', deptFilter)

            const res = await fetch(`/api/hr?${params}`)
            const data = await res.json()
            if (data.success) {
                setEmployees(data.data || [])
                setTotal(data.meta?.total || 0)
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter, deptFilter])

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    // Check URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('new') === 'true') setShowNewForm(true)
    }, [])

    const handleCreateEmployee = async () => {
        if (!form.first_name || !form.last_name) return
        setSaving(true)
        try {
            const res = await fetch('/api/hr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_employee',
                    ...form,
                    base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
                    department_id: form.department_id ? parseInt(form.department_id) : null
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowNewForm(false)
                setForm({
                    first_name: '', last_name: '', email: '', phone: '',
                    employee_type: 'internal', department_id: '',
                    hire_date: new Date().toISOString().split('T')[0],
                    rfc: '', curp: '', nss: '', base_salary: '',
                    work_schedule: 'full_time',
                    emergency_contact_name: '', emergency_contact_phone: ''
                })
                fetchEmployees()
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            inactive: 'bg-gray-50 text-gray-600 border-gray-200',
            on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
            terminated: 'bg-red-50 text-red-700 border-red-200',
            probation: 'bg-blue-50 text-blue-700 border-blue-200',
            suspended: 'bg-orange-50 text-orange-700 border-orange-200'
        }
        const labels: Record<string, string> = {
            active: 'Activo', inactive: 'Inactivo', on_leave: 'En Permiso',
            terminated: 'Baja', probation: 'Prueba', suspended: 'Suspendido'
        }
        return (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.active}`}>
                {labels[status] || status}
            </span>
        )
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Empleados Internos
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">{total} registros</p>
                        </div>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Nuevo Empleado
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email, número..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="active">Activos</option>
                            <option value="on_leave">En Permiso</option>
                            <option value="probation">Prueba</option>
                            <option value="terminated">Baja</option>
                            <option value="">Todos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No hay empleados registrados</p>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Crear primer empleado
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {employees.map((emp) => (
                            <div
                                key={emp.id}
                                className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                        {emp.photo_url
                                            ? <img src={emp.photo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                                            : getInitials(emp.full_name || `${emp.first_name} ${emp.last_name}`)
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                                            </h3>
                                            {getStatusBadge(emp.employment_status)}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" />
                                                {emp.position_title || 'Sin puesto'}
                                            </span>
                                            {emp.department_name && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {emp.department_name}
                                                </span>
                                            )}
                                            {emp.employee_number && (
                                                <span className="text-gray-400">#{emp.employee_number}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-500">
                                        {emp.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {emp.email}
                                            </span>
                                        )}
                                        {emp.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {emp.phone}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Ver">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-colors" title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Nuevo Empleado */}
            {showNewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Nuevo Empleado Interno
                            </h2>
                            <button onClick={() => setShowNewForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Datos Personales */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos Personales</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Nombre *</label>
                                        <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="Nombre(s)" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Apellidos *</label>
                                        <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="Apellido Paterno Materno" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Email</label>
                                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Teléfono</label>
                                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="+52 ..." />
                                    </div>
                                </div>
                            </div>

                            {/* Datos Laborales */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos Laborales</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Fecha de Ingreso</label>
                                        <input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Salario Base (MXN)</label>
                                        <input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Jornada</label>
                                        <select value={form.work_schedule} onChange={(e) => setForm({ ...form, work_schedule: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                            <option value="full_time">Tiempo Completo</option>
                                            <option value="part_time">Medio Tiempo</option>
                                            <option value="flexible">Flexible</option>
                                            <option value="remote">Remoto</option>
                                            <option value="hybrid">Híbrido</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Datos Fiscales */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos Fiscales (México)</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">RFC</label>
                                        <input type="text" value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase"
                                            placeholder="XXXX000000XXX" maxLength={13} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">CURP</label>
                                        <input type="text" value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase"
                                            placeholder="XXXX000000XXXXXXXX" maxLength={18} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">NSS (IMSS)</label>
                                        <input type="text" value={form.nss} onChange={(e) => setForm({ ...form, nss: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            placeholder="00000000000" maxLength={11} />
                                    </div>
                                </div>
                            </div>

                            {/* Contacto de Emergencia */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contacto de Emergencia</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Nombre</label>
                                        <input type="text" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Teléfono</label>
                                        <input type="tel" value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                            <button onClick={() => setShowNewForm(false)}
                                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleCreateEmployee}
                                disabled={saving || !form.first_name || !form.last_name}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                {saving ? 'Guardando...' : 'Crear Empleado'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
