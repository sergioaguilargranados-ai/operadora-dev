"use client"

import { useState, useRef, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Search, UserCheck, UserX, Shield, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UsersAdminPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [users, setUsers] = useState<any[]>([])

    // Simulated data fetch
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setUsers([
                { id: 1, name: "Admin Principal", email: "admin@asoperadora.com", role: "SUPER_ADMIN", status: "active", last_login: "Hace 2 horas" },
                { id: 2, name: "Andrea V.", email: "andrea@asoperadora.com", role: "ADMIN", status: "active", last_login: "Hace 5 horas" },
                { id: 3, name: "Carlos M.", email: "carlos@asoperadora.com", role: "MANAGER", status: "inactive", last_login: "Hace 2 días" },
                { id: 4, name: "Laura T.", email: "laura@asoperadora.com", role: "AGENT", status: "active", last_login: "Hace 10 mins" },
            ])
            setLoading(false)
        }, 800)
    }, [])

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setImporting(true)
        
        // Simulating processing
        setTimeout(() => {
            setImporting(false)
            alert("✅ Importación de usuarios completada con éxito.")
            if(fileInputRef.current) fileInputRef.current.value = ""
        }, 2000)
    }

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            SUPER_ADMIN: "bg-red-100 text-red-800",
            ADMIN: "bg-orange-100 text-orange-800",
            MANAGER: "bg-blue-100 text-blue-800",
            AGENT: "bg-green-100 text-green-800"
        }
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${styles[role] || "bg-gray-100 text-gray-800"}`}>{role}</span>
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <span className="text-lg font-bold text-gray-800">Administración de Usuarios</span>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Buscar usuarios..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const link = document.createElement("a");
                                link.href = "/plantilla_usuarios.csv";
                                link.download = "plantilla_usuarios.csv";
                                link.click();
                            }}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                        </Button>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleImportFile}
                        />
                        <Button 
                            className="bg-black text-white hover:bg-gray-800"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {importing ? "Importando..." : "Importar Usuarios"}
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Usuario</th>
                                    <th className="px-6 py-4 font-medium">Rol</th>
                                    <th className="px-6 py-4 font-medium">Estado</th>
                                    <th className="px-6 py-4 font-medium">Último Acceso</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.status === 'active' ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <UserCheck className="w-3 h-3" /> Activo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                                    <UserX className="w-3 h-3" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {u.last_login}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </div>
        </div>
    )
}
