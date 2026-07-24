// Página de Administración de Tenants (Multi-Empresa / Marca Blanca)
// Build: 23 Jul 2026 - v2.430b - Fase 1 Multi-Empresa

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Search,
    Building2,
    Plus,
    Edit,
    Trash2,
    Users,
    UserPlus,
    UserMinus,
    BarChart3,
    Palette,
    Globe,
    Phone,
    Mail,
    RefreshCw,
    X,
    Loader2,
    Check,
    Eye,
    EyeOff,
    Store,
    Building,
    ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface TenantData {
    id: number;
    tenant_type: 'corporate' | 'agency';
    company_name: string;
    legal_name: string | null;
    tax_id: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    logo_url: string | null;
    logo_mobile_url: string | null;
    logo_dark_url: string | null;
    slogan: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    custom_domain: string | null;
    is_active: boolean;
    subscription_plan: string | null;
    created_at: string;
    updated_at: string;
    white_label?: WhiteLabelData | null;
}

interface WhiteLabelData {
    id?: number;
    favicon_url: string | null;
    footer_text: string | null;
    support_email: string | null;
    support_phone: string | null;
    terms_url: string | null;
    privacy_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
}

interface TenantFormData {
    tenant_type: 'corporate' | 'agency';
    company_name: string;
    legal_name: string;
    tax_id: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    logo_url: string;
    logo_mobile_url: string;
    logo_dark_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    custom_domain: string;
    subscription_plan: string;
    // White-label fields (for agency)
    wl_footer_text: string;
    wl_support_email: string;
    wl_support_phone: string;
    wl_meta_title: string;
    wl_meta_description: string;
    wl_slogan: string;
}

const EMPTY_FORM: TenantFormData = {
    tenant_type: 'agency',
    company_name: '',
    legal_name: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'México',
    logo_url: '',
    logo_mobile_url: '',
    logo_dark_url: '',
    primary_color: '#FF6B00',
    secondary_color: '#0066FF',
    accent_color: '#FF6B00',
    custom_domain: '',
    subscription_plan: 'basic',
    wl_footer_text: '',
    wl_support_email: '',
    wl_support_phone: '',
    wl_meta_title: '',
    wl_meta_description: '',
    wl_slogan: '',
};

// ─────────────────────────────────────────────
// Types para gestión de usuarios
// ─────────────────────────────────────────────
interface TenantUserData {
    tenant_user_id: number;
    user_id: number;
    role: string;
    department: string | null;
    cost_center: string | null;
    tenant_active: boolean;
    joined_at: string;
    name: string;
    email: string;
    phone: string | null;
    user_role: string;
    user_active: boolean;
}

interface SearchedUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AdminTenantsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<TenantData | null>(null);
    const [formData, setFormData] = useState<TenantFormData>(EMPTY_FORM);
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'whitelabel'>('general');

    // Users modal state
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [usersTenant, setUsersTenant] = useState<TenantData | null>(null);
    const [tenantUsers, setTenantUsers] = useState<TenantUserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [addingUser, setAddingUser] = useState(false);
    const [newUserRole, setNewUserRole] = useState('AGENT');

    // Token
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('as_token');
            setAccessToken(token);
        }
    }, []);

    // Auth check
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user && !['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
            router.push('/');
            return;
        }
    }, [isAuthenticated, user, router]);

    // ─────────────────────────────────────────
    // CRUD Operations
    // ─────────────────────────────────────────

    const fetchTenants = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/tenants?limit=100', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                // Fetch white-label config for each agency
                const tenantsWithWL = await Promise.all(
                    (data.data || []).map(async (t: TenantData) => {
                        if (t.tenant_type === 'agency') {
                            try {
                                const wlRes = await fetch(`/api/tenants/${t.id}?action=info`, {
                                    headers: { 'Authorization': `Bearer ${accessToken}` }
                                });
                                const wlData = await wlRes.json();
                                return { ...t, white_label: wlData.data?.white_label || null };
                            } catch {
                                return t;
                            }
                        }
                        return t;
                    })
                );
                setTenants(tenantsWithWL);
            } else {
                setError(data.error || 'Error al cargar tenants');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const saveTenant = async () => {
        if (!accessToken) return;
        setSaving(true);
        setError(null);

        try {
            const body: Record<string, unknown> = {
                tenant_type: formData.tenant_type,
                company_name: formData.company_name,
                legal_name: formData.legal_name || null,
                tax_id: formData.tax_id || null,
                email: formData.email || null,
                phone: formData.phone || null,
                subscription_plan: formData.subscription_plan,
                logo_url: formData.logo_url || null,
                logo_mobile_url: formData.logo_mobile_url || null,
                logo_dark_url: formData.logo_dark_url || null,
                primary_color: formData.primary_color || null,
                secondary_color: formData.secondary_color || null,
                accent_color: formData.accent_color || null,
                custom_domain: formData.custom_domain || null,
                slogan: formData.wl_slogan || null,
            };

            // Si es agencia, incluir configuración white-label
            if (formData.tenant_type === 'agency') {
                body.white_label = {
                    footer_text: formData.wl_footer_text || null,
                    support_email: formData.wl_support_email || formData.email || null,
                    support_phone: formData.wl_support_phone || formData.phone || null,
                    meta_title: formData.wl_meta_title || formData.company_name,
                    meta_description: formData.wl_meta_description || null,
                };
            }

            let res;
            if (editingTenant) {
                // Update
                res = await fetch(`/api/tenants/${editingTenant.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
            } else {
                // Create
                res = await fetch('/api/tenants', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
            }

            const data = await res.json();
            if (data.success) {
                setSuccess(editingTenant ? 'Tenant actualizado ✅' : 'Tenant creado ✅');
                setShowModal(false);
                setEditingTenant(null);
                setFormData(EMPTY_FORM);
                await fetchTenants();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const deleteTenant = async (id: number) => {
        if (!accessToken) return;
        if (!confirm('¿Desactivar este tenant? (soft delete)')) return;

        try {
            const res = await fetch(`/api/tenants/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Tenant desactivado ✅');
                await fetchTenants();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Error al eliminar');
            }
        } catch {
            setError('Error de conexión');
        }
    };

    // ─────────────────────────────────────────
    // Gestión de usuarios del tenant
    // ─────────────────────────────────────────

    const openUsersModal = async (tenant: TenantData) => {
        setUsersTenant(tenant);
        setShowUsersModal(true);
        setTenantUsers([]);
        setUserSearchTerm('');
        setSearchResults([]);
        setNewUserRole('AGENT');
        await fetchTenantUsers(tenant.id);
    };

    const fetchTenantUsers = async (tenantId: number) => {
        if (!accessToken) return;
        setLoadingUsers(true);
        try {
            const res = await fetch(`/api/tenants/${tenantId}/users`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            const data = await res.json();
            if (data.success) {
                setTenantUsers(data.data || []);
            } else {
                setError(data.error || 'Error al cargar usuarios');
            }
        } catch {
            setError('Error de conexión al cargar usuarios');
        } finally {
            setLoadingUsers(false);
        }
    };

    const searchAvailableUsers = async (term: string) => {
        setUserSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearchingUsers(true);
        try {
            const res = await fetch(
                `/api/users/search?q=${encodeURIComponent(term)}&exclude_tenant=${usersTenant?.id}&limit=8`
            );
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data || []);
            }
        } catch {
            // silenciar errores de búsqueda
        } finally {
            setSearchingUsers(false);
        }
    };

    const addUserToTenant = async (userId: number) => {
        if (!accessToken || !usersTenant) return;
        setAddingUser(true);
        try {
            const res = await fetch(`/api/tenants/${usersTenant.id}/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, role: newUserRole }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Usuario agregado ✅');
                setUserSearchTerm('');
                setSearchResults([]);
                await fetchTenantUsers(usersTenant.id);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Error al agregar usuario');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setAddingUser(false);
        }
    };

    const removeUserFromTenant = async (userId: number, userName: string) => {
        if (!accessToken || !usersTenant) return;
        if (!confirm(`¿Quitar a ${userName} de ${usersTenant.company_name}?`)) return;

        try {
            const res = await fetch(`/api/tenants/${usersTenant.id}/users`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Usuario removido ✅');
                await fetchTenantUsers(usersTenant.id);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Error al remover usuario');
            }
        } catch {
            setError('Error de conexión');
        }
    };

    // ─────────────────────────────────────────
    // Modal helpers
    // ─────────────────────────────────────────

    const openCreateModal = () => {
        setEditingTenant(null);
        setFormData(EMPTY_FORM);
        setActiveTab('general');
        setShowModal(true);
    };

    const openEditModal = (tenant: TenantData) => {
        setEditingTenant(tenant);
        setFormData({
            tenant_type: tenant.tenant_type,
            company_name: tenant.company_name,
            legal_name: tenant.legal_name || '',
            tax_id: tenant.tax_id || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            address: tenant.address || '',
            city: tenant.city || '',
            country: tenant.country || 'México',
            logo_url: tenant.logo_url || '',
            logo_mobile_url: tenant.logo_mobile_url || '',
            primary_color: tenant.primary_color || '#FF6B00',
            secondary_color: tenant.secondary_color || '#0066FF',
            accent_color: tenant.accent_color || '#FF6B00',
            custom_domain: tenant.custom_domain || '',
            subscription_plan: tenant.subscription_plan || 'basic',
            wl_footer_text: tenant.white_label?.footer_text || '',
            wl_support_email: tenant.white_label?.support_email || '',
            wl_support_phone: tenant.white_label?.support_phone || '',
            wl_meta_title: tenant.white_label?.meta_title || '',
            wl_meta_description: tenant.white_label?.meta_description || '',
            wl_slogan: tenant.slogan || '',
        });
        setActiveTab('general');
        setShowModal(true);
    };

    // ─────────────────────────────────────────
    // Filter
    // ─────────────────────────────────────────

    const filteredTenants = tenants.filter(t => {
        const matchesSearch =
            t.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.custom_domain || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !filterType || t.tenant_type === filterType;
        return matchesSearch && matchesType;
    });

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────

    if (loading && tenants.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando tenants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Logo className="py-1" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={fetchTenants} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <Button
                            size="sm"
                            onClick={openCreateModal}
                            className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Tenant
                        </Button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        Gestión Multi-Empresa
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Administra empresas, agencias y configuración de marca blanca
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
                        <X className="w-5 h-5" />
                        {error}
                        <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                            Cerrar
                        </Button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-3">
                        <Check className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{tenants.length}</p>
                        <p className="text-sm text-gray-600">Total Tenants</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {tenants.filter(t => t.tenant_type === 'agency').length}
                        </p>
                        <p className="text-sm text-gray-600">Agencias</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-indigo-600">
                            {tenants.filter(t => t.tenant_type === 'corporate').length}
                        </p>
                        <p className="text-sm text-gray-600">Corporativos</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {tenants.filter(t => t.is_active).length}
                        </p>
                        <p className="text-sm text-gray-600">Activos</p>
                    </Card>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre, email o dominio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filterType === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType(null)}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filterType === 'agency' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType('agency')}
                        >
                            <Store className="w-4 h-4 mr-1" /> Agencias
                        </Button>
                        <Button
                            variant={filterType === 'corporate' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType('corporate')}
                        >
                            <Building className="w-4 h-4 mr-1" /> Corporativos
                        </Button>
                    </div>
                </div>

                {/* Tenants List */}
                <div className="space-y-4">
                    {filteredTenants.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-lg">No se encontraron tenants</p>
                            <p className="text-gray-400 mt-1">Crea el primer tenant con el botón &quot;Nuevo Tenant&quot;</p>
                        </Card>
                    ) : (
                        filteredTenants.map(tenant => (
                            <Card
                                key={tenant.id}
                                className={`p-6 transition-all hover:shadow-md ${!tenant.is_active ? 'opacity-60 bg-gray-50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Color indicator */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                            style={{
                                                backgroundColor: tenant.primary_color || '#0066FF',
                                            }}
                                        >
                                            {tenant.company_name.substring(0, 2).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{tenant.company_name}</h3>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${tenant.tenant_type === 'agency'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                        }`}
                                                >
                                                    {tenant.tenant_type === 'agency' ? '🏪 Agencia' : '🏢 Corporativo'}
                                                </span>
                                                {!tenant.is_active && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                {tenant.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5" /> {tenant.email}
                                                    </span>
                                                )}
                                                {tenant.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5" /> {tenant.phone}
                                                    </span>
                                                )}
                                                {tenant.custom_domain && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3.5 h-3.5" /> {tenant.custom_domain}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Color preview */}
                                            {tenant.tenant_type === 'agency' && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Palette className="w-3.5 h-3.5 text-gray-400" />
                                                    <div className="flex gap-1">
                                                        <div
                                                            className="w-5 h-5 rounded border"
                                                            style={{ backgroundColor: tenant.primary_color || '#ccc' }}
                                                            title={`Primario: ${tenant.primary_color}`}
                                                        />
                                                        <div
                                                            className="w-5 h-5 rounded border"
                                                            style={{ backgroundColor: tenant.secondary_color || '#ccc' }}
                                                            title={`Secundario: ${tenant.secondary_color}`}
                                                        />
                                                        {tenant.accent_color && (
                                                            <div
                                                                className="w-5 h-5 rounded border"
                                                                style={{ backgroundColor: tenant.accent_color }}
                                                                title={`Acento: ${tenant.accent_color}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        Plan: {tenant.subscription_plan || 'basic'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openUsersModal(tenant)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Users className="w-4 h-4 mr-1" /> Usuarios
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(tenant)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" /> Editar
                                        </Button>
                                        {tenant.is_active ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteTenant(tenant.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <EyeOff className="w-4 h-4 mr-1" /> Desactivar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> Activar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </main>

            {/* ─────────────────────────────────────────── */}
            {/* CREATE/EDIT MODAL */}
            {/* ─────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingTenant ? (
                                    <><Edit className="w-5 h-5 text-blue-600" /> Editar Tenant</>
                                ) : (
                                    <><Plus className="w-5 h-5 text-green-600" /> Nuevo Tenant</>
                                )}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b px-6 flex gap-0">
                            {(['general', 'branding', 'whitelabel'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'general' && '📋 General'}
                                    {tab === 'branding' && '🎨 Branding'}
                                    {tab === 'whitelabel' && '🏷️ White-Label'}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6 space-y-6">
                            {/* TAB: General */}
                            {activeTab === 'general' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Tenant *
                                            </label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={formData.tenant_type}
                                                onChange={e => setFormData(prev => ({ ...prev, tenant_type: e.target.value as 'corporate' | 'agency' }))}
                                            >
                                                <option value="agency">🏪 Agencia</option>
                                                <option value="corporate">🏢 Corporativo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Plan de Suscripción
                                            </label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={formData.subscription_plan}
                                                onChange={e => setFormData(prev => ({ ...prev, subscription_plan: e.target.value }))}
                                            >
                                                <option value="basic">Básico</option>
                                                <option value="professional">Profesional</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de la Empresa *
                                        </label>
                                        <Input
                                            value={formData.company_name}
                                            onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                            placeholder="Ej: M&M Travel Agency"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Razón Social
                                            </label>
                                            <Input
                                                value={formData.legal_name}
                                                onChange={e => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                                                placeholder="Razón social legal"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                RFC / Tax ID
                                            </label>
                                            <Input
                                                value={formData.tax_id}
                                                onChange={e => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                                                placeholder="RFC o ID fiscal"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="contacto@empresa.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <Input
                                                value={formData.phone}
                                                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+52 722 518 7558"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dominio Personalizado (subdominio)
                                        </label>
                                        <Input
                                            value={formData.custom_domain}
                                            onChange={e => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))}
                                            placeholder="mmta.app.asoperadora.com"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Subdominio donde la agencia verá su marca blanca
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* TAB: Branding */}
                            {activeTab === 'branding' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Logo Principal (Landing / Web)
                                        </label>
                                        <ImageUploadInput
                                            value={formData.logo_url}
                                            onChange={val => setFormData(prev => ({ ...prev, logo_url: val }))}
                                            placeholder="Subir logotipo principal..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Logo Secundario (App Móvil PWA)
                                        </label>
                                        <ImageUploadInput
                                            value={formData.logo_mobile_url}
                                            onChange={val => setFormData(prev => ({ ...prev, logo_mobile_url: val }))}
                                            placeholder="Subir logotipo para app móvil..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frase / Slogan de Marca Blanca
                                        </label>
                                        <Input
                                            value={formData.wl_slogan}
                                            onChange={e => setFormData(prev => ({ ...prev, wl_slogan: e.target.value }))}
                                            placeholder="Haz el viaje de tus sueños / El mejor servicio..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Frase de marca que se mostrará en la landing y app móvil
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color Primario
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.primary_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                                    className="w-10 h-10 rounded cursor-pointer"
                                                />
                                                <Input
                                                    value={formData.primary_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color Secundario
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.secondary_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                                    className="w-10 h-10 rounded cursor-pointer"
                                                />
                                                <Input
                                                    value={formData.secondary_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color Acento
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.accent_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                                                    className="w-10 h-10 rounded cursor-pointer"
                                                />
                                                <Input
                                                    value={formData.accent_color}
                                                    onChange={e => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Branding preview */}
                                    <div className="border rounded-xl overflow-hidden">
                                        <div
                                            className="py-4 px-6 flex items-center justify-between"
                                            style={{ backgroundColor: formData.primary_color }}
                                        >
                                            <span className="text-white font-bold text-lg">
                                                {formData.company_name || 'Nombre de la Empresa'}
                                            </span>
                                            <span className="text-white/80 text-sm">Vista Previa</span>
                                        </div>
                                        <div className="p-6 bg-white">
                                            <p className="text-gray-600 text-sm">
                                                Así se verá el header de la agencia con estos colores.
                                            </p>
                                            <button
                                                className="mt-3 px-4 py-2 rounded-full text-white text-sm font-medium"
                                                style={{ backgroundColor: formData.secondary_color }}
                                            >
                                                Botón de ejemplo
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* TAB: White-Label */}
                            {activeTab === 'whitelabel' && (
                                <>
                                    {formData.tenant_type !== 'agency' ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>La configuración White-Label solo está disponible para <strong>Agencias</strong></p>
                                            <p className="text-sm mt-1">Cambia el tipo de tenant a &quot;Agencia&quot; en la pestaña General</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Slogan
                                                </label>
                                                <Input
                                                    value={formData.wl_slogan}
                                                    onChange={e => setFormData(prev => ({ ...prev, wl_slogan: e.target.value }))}
                                                    placeholder="Haz el viaje de tus sueños!!"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email de Soporte
                                                    </label>
                                                    <Input
                                                        value={formData.wl_support_email}
                                                        onChange={e => setFormData(prev => ({ ...prev, wl_support_email: e.target.value }))}
                                                        placeholder="soporte@agencia.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Teléfono de Soporte
                                                    </label>
                                                    <Input
                                                        value={formData.wl_support_phone}
                                                        onChange={e => setFormData(prev => ({ ...prev, wl_support_phone: e.target.value }))}
                                                        placeholder="+52 722 518 7558"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Texto del Footer
                                                </label>
                                                <Input
                                                    value={formData.wl_footer_text}
                                                    onChange={e => setFormData(prev => ({ ...prev, wl_footer_text: e.target.value }))}
                                                    placeholder="© M&M Travel Agency. Todos los derechos reservados."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Meta Título (SEO)
                                                </label>
                                                <Input
                                                    value={formData.wl_meta_title}
                                                    onChange={e => setFormData(prev => ({ ...prev, wl_meta_title: e.target.value }))}
                                                    placeholder="M&M Travel Agency | Viajes y Experiencias"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Meta Descripción (SEO)
                                                </label>
                                                <Input
                                                    value={formData.wl_meta_description}
                                                    onChange={e => setFormData(prev => ({ ...prev, wl_meta_description: e.target.value }))}
                                                    placeholder="Descubre los mejores viajes con M&M Travel Agency"
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={saveTenant}
                                disabled={saving || !formData.company_name}
                                className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                                ) : editingTenant ? (
                                    <><Check className="w-4 h-4 mr-2" /> Actualizar</>
                                ) : (
                                    <><Plus className="w-4 h-4 mr-2" /> Crear Tenant</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────── */}
            {/* USERS MODAL */}
            {/* ─────────────────────────────────────────── */}
            {showUsersModal && usersTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Usuarios de {usersTenant.company_name}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {tenantUsers.length} usuario{tenantUsers.length !== 1 ? 's' : ''} vinculado{tenantUsers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowUsersModal(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Agregar usuario */}
                        <div className="px-6 py-4 bg-blue-50/50 border-b">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Agregar usuario
                            </h3>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por nombre o email..."
                                        value={userSearchTerm}
                                        onChange={(e) => searchAvailableUsers(e.target.value)}
                                        className="pl-9 bg-white"
                                    />
                                </div>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    <option value="AGENT">Agente</option>
                                    <option value="AGENCY_ADMIN">Admin Agencia</option>
                                    <option value="CLIENT">Cliente</option>
                                </select>
                            </div>

                            {/* Resultados de búsqueda */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-white border rounded-lg shadow-sm max-h-48 overflow-y-auto">
                                    {searchResults.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{u.name || 'Sin nombre'}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={addingUser}
                                                onClick={() => addUserToTenant(u.id)}
                                                className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Agregar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {userSearchTerm.length >= 2 && searchResults.length === 0 && !searchingUsers && (
                                <p className="mt-2 text-sm text-gray-500 text-center py-2">
                                    No se encontraron usuarios con "{userSearchTerm}"
                                </p>
                            )}
                            {searchingUsers && (
                                <p className="mt-2 text-sm text-gray-500 text-center py-2">
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Buscando...
                                </p>
                            )}
                        </div>

                        {/* Lista de usuarios actuales */}
                        <div className="px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Usuarios vinculados</h3>
                            {loadingUsers ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                    <p className="text-sm text-gray-500 mt-2">Cargando usuarios...</p>
                                </div>
                            ) : tenantUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No hay usuarios vinculados a este tenant</p>
                                    <p className="text-xs mt-1">Usa el buscador de arriba para agregar</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tenantUsers.map((tu) => (
                                        <div
                                            key={tu.tenant_user_id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                                                    style={{ backgroundColor: usersTenant.primary_color || '#0066FF' }}
                                                >
                                                    {(tu.name || tu.email || '?').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tu.name || 'Sin nombre'}</p>
                                                    <p className="text-xs text-gray-500">{tu.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tu.role === 'AGENCY_ADMIN' ? 'bg-purple-100 text-purple-700'
                                                    : tu.role === 'AGENT' ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {tu.role === 'AGENCY_ADMIN' ? 'Admin'
                                                        : tu.role === 'AGENT' ? 'Agente'
                                                            : tu.role}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeUserFromTenant(tu.user_id, tu.name || tu.email)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="Quitar del tenant"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end rounded-b-xl">
                            <Button variant="outline" onClick={() => setShowUsersModal(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gray-100 py-4 mt-8">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>v2.313 | Gestión Multi-Empresa &amp; Marca Blanca</p>
                </div>
            </footer>
        </div>
    );
}
