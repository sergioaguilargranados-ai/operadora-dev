'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import {
  LayoutDashboard,
  Package,
  User as UserIcon,
  HelpCircle,
  Compass,
  Users,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Receipt,
  Sparkles,
  ShieldCheck,
  FileText,
  Briefcase,
  ShoppingBag,
  Building,
  CreditCard,
  Eye,
  Globe,
  Search,
  X,
  Layers,
  FolderClosed,
  FolderOpen
} from 'lucide-react'

interface SubMenuItem {
  label: string
  route: string
  permission?: string
}

interface MenuItem {
  label: string
  icon: any
  route: string
  badge?: string
  permission?: string
  subItems?: SubMenuItem[]
}

interface MenuSection {
  title: string
  icon?: any
  items: MenuItem[]
}

interface PortalSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const ICON_MAP: Record<string, any> = {
  Users,
  LayoutDashboard,
  FileText,
  Briefcase,
  ShoppingBag,
  Building,
  Building2,
  Package,
  CreditCard,
  Receipt,
  Globe,
  ShieldCheck,
  Eye,
  MessageCircle,
  UserIcon,
  HelpCircle,
  Compass,
  Settings
}

const SECTION_ICON_MAP: Record<string, any> = {
  'INTRANET & OPERACIÓN': Briefcase,
  'GESTIÓN DE RESERVAS': Package,
  'ADMINISTRACIÓN Y AJUSTES': Settings,
  'CUENTA PERSONAL': UserIcon,
  'MI CUENTA & VIAJES': Globe,
  'AYUDA Y SOPORTE': HelpCircle
}

export function PortalSidebar({ collapsed: externalCollapsed, onToggleCollapse }: PortalSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { hasPermission, isSuperAdmin } = usePermissions()
  
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dynamicStaffMenu, setDynamicStaffMenu] = useState<MenuSection[] | null>(null)

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed))

  // Normalización del rol de usuario
  const normalizedRole = (user?.role || '').toUpperCase().replace(/[\s_-]/g, '')
  const isStaff = [
    'SUPERADMIN', 'ADMIN', 'ADMINISTRATOR', 'MANAGER', 
    'AGENCYADMIN', 'AGENT', 'AGENTE', 'STAFF', 'MASTER', 
    'AGENCIA', 'VENTAS', 'HRMANAGER'
  ].includes(normalizedRole)

  // 1. Menú estático para Viajeros / Clientes
  const clientMenu: MenuSection[] = [
    {
      title: 'MI CUENTA & VIAJES',
      icon: Globe,
      items: [
        { label: 'Tus Reservas', icon: Package, route: '/mis-reservas' },
        { label: 'Seguros de Viajero', icon: ShieldCheck, route: '/seguros', badge: '24/7' },
        { label: 'Mi Perfil', icon: UserIcon, route: '/perfil' },
        { label: 'Mis Facturas', icon: Receipt, route: '/facturacion' }
      ]
    },
    {
      title: 'AYUDA Y SOPORTE',
      icon: HelpCircle,
      items: [
        { label: 'Centro de Ayuda', icon: HelpCircle, route: '/ayuda' },
        { label: 'Prepara tu Viaje', icon: Compass, route: '/ayuda/prepara-tu-viaje' }
      ]
    }
  ]

  // 2. Menú estático para Agentes / Staff / Admin
  const staffMenu: MenuSection[] = [
    {
      title: 'INTRANET & OPERACIÓN',
      icon: Briefcase,
      items: [
        { 
          label: 'Catálogo Clientes & CRM', 
          icon: Users, 
          route: '/operacion', 
          badge: 'CRM',
          permission: 'crm:view',
          subItems: [
            { label: 'Catálogo Clientes', route: '/operacion' },
            { label: 'CRM Dashboard', route: '/dashboard/crm' },
            { label: 'Clientes CRM', route: '/dashboard/crm/clientes' },
            { label: 'Contactos CRM', route: '/dashboard/crm/contacts' },
            { label: 'Pipeline Kanban', route: '/dashboard/crm/pipeline' },
            { label: 'Tareas CRM', route: '/dashboard/crm/tasks' },
            { label: 'Calendario', route: '/dashboard/crm/calendar' },
            { label: 'WhatsApp CRM', route: '/dashboard/crm/whatsapp' },
            { label: 'Campañas Email', route: '/dashboard/crm/campaigns' },
            { label: 'Reglas & Workflows', route: '/dashboard/crm/automation' },
            { label: 'Analytics CRM', route: '/dashboard/crm/analytics' },
            { label: 'Docs Clientes', route: '/dashboard/crm/client-documents' },
            { label: 'Importar CSV', route: '/dashboard/crm/import' }
          ]
        },
        { 
          label: 'Dashboard Ventas', 
          icon: LayoutDashboard, 
          route: '/dashboard',
          permission: 'crm:view'
        },
        { label: 'Cotizaciones', icon: FileText, route: '/dashboard/quotes', permission: 'quotes:view' },
        { 
          label: 'RRHH / Personal', 
          icon: Briefcase, 
          route: '/dashboard/rrhh',
          permission: 'rrhh:view',
          subItems: [
            { label: 'Panel RRHH General', route: '/dashboard/rrhh' },
            { label: 'Directorio & Empleados', route: '/dashboard/rrhh/employees' },
            { label: 'Agentes RRHH', route: '/dashboard/rrhh/agents' },
            { label: 'Control de Asistencia', route: '/dashboard/rrhh/attendance' },
            { label: 'Permisos & Licencias', route: '/dashboard/rrhh/leaves' },
            { label: 'Gestión de Nómina', route: '/dashboard/rrhh/payroll' },
            { label: 'Reclutamiento & Vacantes', route: '/dashboard/rrhh/recruitment' },
            { label: 'Contratos & Expedientes', route: '/dashboard/rrhh/contracts' },
            { label: 'Documentos RRHH', route: '/dashboard/rrhh/documents' },
            { label: 'Auditoría & Logs RRHH', route: '/dashboard/rrhh/audit' }
          ]
        },
        { label: 'Productos de la tienda', icon: ShoppingBag, route: '/dashboard/store', permission: 'store:view' },
        { 
          label: 'Panel de Empresas', 
          icon: Building, 
          route: '/dashboard/corporate',
          permission: 'crm:view',
          subItems: [
            { label: 'Resumen General', route: '/dashboard/corporate' },
            { label: 'Empleados Corporativos', route: '/dashboard/corporate?tab=empleados' },
            { label: 'Gastos & Presupuestos', route: '/dashboard/corporate?tab=gastos' },
            { label: 'Métricas & CO2', route: '/dashboard/corporate?tab=metricas' },
            { label: 'Aprobaciones de Viaje', route: '/dashboard/corporate?tab=aprobaciones' },
            { label: 'Políticas de Viaje', route: '/dashboard/corporate?tab=politicas' },
            { label: 'Métodos de Pago', route: '/dashboard/corporate?tab=pagos' }
          ]
        },
        { 
          label: 'Panel Agencias', 
          icon: Building2, 
          route: '/dashboard/agency',
          permission: 'crm:view',
          subItems: [
            { label: 'Resumen General', route: '/dashboard/agency' },
            { label: 'Gestión Agentes', route: '/dashboard/agency?tab=agentes' },
            { label: 'Clientes Agencia', route: '/dashboard/agency?tab=clientes' },
            { label: 'Comisiones', route: '/dashboard/agency?tab=comisiones' }
          ]
        }
      ]
    },
    {
      title: 'GESTIÓN DE RESERVAS',
      icon: Package,
      items: [
        { label: 'Todas las Reservas', icon: Package, route: '/mis-reservas', permission: 'bookings:view' },
        { label: 'Seguros de Viajero', icon: ShieldCheck, route: '/seguros', badge: '24/7', permission: 'insurance:view' },
        { label: 'Pagos & Cuentas', icon: CreditCard, route: '/dashboard/payments', permission: 'bookings:payments' },
        { label: 'Facturación SAT CFDI', icon: Receipt, route: '/facturacion', badge: 'SAT', permission: 'invoices:view' }
      ]
    },
    {
      title: 'ADMINISTRACIÓN Y AJUSTES',
      icon: Settings,
      items: [
        {
          label: 'Gestión de Contenido',
          icon: Globe,
          route: '/admin/content',
          permission: 'content:view',
          subItems: [
            { label: 'Banner Principal', route: '/admin/content' },
            { label: 'Promociones', route: '/admin/content?tab=promotions' },
            { label: 'Vuelos Destacados', route: '/admin/content?tab=flights' },
            { label: 'Paquetes Turísticos', route: '/admin/content?tab=packages' },
            { label: 'Catálogo Hoteles', route: '/admin/content?tab=hotels-catalog' },
            { label: 'Catálogo Aerolíneas', route: '/admin/content?tab=airlines' },
            { label: 'Videos & URLs', route: '/admin/content?tab=videos' },
            { label: 'Imágenes Tours', route: '/admin/content?tab=tour-images' },
            { label: 'Ejecución de Procesos', route: '/admin/content?tab=processes' },
            { label: 'Landing Principal', route: '/admin/content?tab=expo' },
            { label: 'App Móvil PWA', route: '/admin/content?tab=mobile-app' },
            { label: 'Tienda (Productos)', route: '/admin/content?tab=store-products' },
            { label: 'Destinos (IA)', route: '/admin/content?tab=destinations' }
          ]
        },
        {
          label: 'Administración & Sistema',
          icon: ShieldCheck,
          route: '/admin/features',
          permission: 'admin:users:view',
          subItems: [
            { label: 'Administración de Funciones', route: '/admin/features' },
            { label: 'Tenants & Marca Blanca', route: '/admin/tenants' },
            { label: 'Panel MegaTravel', route: '/admin/megatravel' },
            { label: 'Imágenes de Tours', route: '/admin/tour-images' },
            { label: 'MegaTravel Scraping', route: '/admin/megatravel-scraping' },
            { label: 'Usuarios & Asignaciones', route: '/dashboard/admin/users' },
            { label: 'Roles & Permisos', route: '/admin/roles' }
          ]
        },
        { label: 'Panel Super Admin', icon: ShieldCheck, route: '/dashboard/admin/agencies', permission: 'admin:agencies:view' },
        { label: 'Moderación', icon: Eye, route: '/dashboard/moderacion', permission: 'admin:users:view' },
        { label: 'WhatsApp & Mensajes', icon: MessageCircle, route: '/comunicacion', permission: 'crm:whatsapp:use' }
      ]
    },
    {
      title: 'CUENTA PERSONAL',
      icon: UserIcon,
      items: [
        { label: 'Mi Perfil', icon: UserIcon, route: '/perfil', permission: 'profile:view' }
      ]
    }
  ]

  const fetchDynamicMenu = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('as_token') : null
      const headers: HeadersInit = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/admin/menu', { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.data?.sections)) {
          const sections: MenuSection[] = data.data.sections.map((sec: any) => ({
            title: sec.title,
            icon: SECTION_ICON_MAP[sec.title] || Layers,
            items: sec.items.filter((item: any) => item.is_active !== false).map((item: any) => ({
              label: item.label,
              icon: (item.icon_name && ICON_MAP[item.icon_name]) ? ICON_MAP[item.icon_name] : ShieldCheck,
              route: item.route,
              badge: item.badge,
              permission: item.permission_code,
              subItems: item.subItems ? item.subItems.filter((s: any) => s.is_active !== false).map((s: any) => ({
                label: s.label,
                route: s.route,
                permission: s.permission_code
              })) : undefined
            }))
          }))
          setDynamicStaffMenu(sections)
        }
      }
    } catch (err) {
      console.error('Error fetching dynamic menu in sidebar:', err)
    }
  }

  useEffect(() => {
    fetchDynamicMenu()

    const handleMenuUpdate = () => {
      fetchDynamicMenu()
    }
    window.addEventListener('menuStructureUpdated', handleMenuUpdate)
    return () => {
      window.removeEventListener('menuStructureUpdated', handleMenuUpdate)
    }
  }, [])

  const isItemPermitted = (item: MenuItem) => {
    if (isSuperAdmin || user?.role === 'SUPER_ADMIN') return true
    if (!item.permission) return true
    return hasPermission(item.permission)
  }

  const effectiveStaffMenu = dynamicStaffMenu && dynamicStaffMenu.length > 0 ? dynamicStaffMenu : staffMenu

  const baseMenu: MenuSection[] = useMemo(() => {
    const rawMenu = isStaff ? effectiveStaffMenu : clientMenu
    return rawMenu.map(section => ({
      ...section,
      icon: section.icon || SECTION_ICON_MAP[section.title] || Layers,
      items: section.items.filter(isItemPermitted)
    })).filter(section => section.items.length > 0)
  }, [isStaff, effectiveStaffMenu, isSuperAdmin, user?.role])

  // Detección automática de la sección activa según la ruta actual
  useEffect(() => {
    if (!pathname) return

    let matchedSection: string | null = null
    let matchedSubmenu: string | null = null

    for (const section of baseMenu) {
      for (const item of section.items) {
        if (pathname === item.route && !searchParams?.get('tab')) {
          matchedSection = section.title
        }
        if (item.subItems) {
          for (const sub of item.subItems) {
            const [sRoute, sQuery] = sub.route.split('?')
            if (pathname === sRoute) {
              const tabParam = searchParams?.get('tab')
              if (!sQuery || (tabParam && new URLSearchParams(sQuery).get('tab') === tabParam)) {
                matchedSection = section.title
                matchedSubmenu = item.label
              }
            }
          }
        }
      }
    }

    if (matchedSection) {
      setOpenSection(matchedSection)
    } else if (openSection === null && baseMenu.length > 0) {
      // Por defecto abrir la primera sección
      setOpenSection(baseMenu[0].title)
    }

    if (matchedSubmenu) {
      setOpenSubmenu(matchedSubmenu)
    }
  }, [pathname, searchParams, baseMenu])

  // Manejo del acordeón exclusivo: al dar clic en una sección se abre y se cierran las demás
  const toggleSection = (sectionTitle: string) => {
    if (collapsed) setInternalCollapsed(false)
    setOpenSection(prev => prev === sectionTitle ? null : sectionTitle)
  }

  const toggleSubmenu = (label: string) => {
    if (collapsed) setInternalCollapsed(false)
    setOpenSubmenu(prev => prev === label ? null : label)
  }

  // Filtrado reactivo por buscador
  const filteredMenu = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return baseMenu

    return baseMenu.map(section => {
      const matchingItems = section.items.filter(item => {
        const itemMatches = item.label.toLowerCase().includes(query) || (item.badge && item.badge.toLowerCase().includes(query))
        const subItemMatches = item.subItems?.some(s => s.label.toLowerCase().includes(query))
        return itemMatches || subItemMatches
      })

      return {
        ...section,
        items: matchingItems
      }
    }).filter(section => section.items.length > 0)
  }, [baseMenu, searchQuery])

  return (
    <aside className={`bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] transition-all duration-300 flex flex-col justify-between select-none z-10 ${collapsed ? 'w-16' : 'w-64'}`}>
      
      <div className="py-3 flex flex-col h-full overflow-hidden">
        
        {/* Header del Sidebar */}
        <div className="px-3.5 mb-2.5 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse flex-shrink-0"></span>
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase truncate">
                {isStaff ? 'MENÚ INTRANET' : 'PORTAL VIAJERO'}
              </span>
            </div>
          ) : (
            <div className="w-full text-center">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse inline-block"></span>
            </div>
          )}
          
          <button
            onClick={toggle}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-slate-800" /> : <ChevronLeft className="w-4 h-4 text-slate-800" />}
          </button>
        </div>

        {/* Buscador Rápido de Módulos (Estilo Spotlight) */}
        {!collapsed && isStaff && (
          <div className="px-3 mb-3">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar módulos..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenedor de Secciones con Scroll estilizado */}
        <div className="flex-1 overflow-y-auto px-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
          
          {filteredMenu.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No se encontraron módulos para "{searchQuery}"
            </div>
          ) : (
            filteredMenu.map((section, idx) => {
              const SectionIcon = section.icon || Layers
              const isSectionOpen = (searchQuery.trim() !== '') || (openSection === section.title)
              
              // Verificar si algún item o subitem de la sección está activo
              const isAnyItemActive = section.items.some(item => {
                if (pathname === item.route && !searchParams?.get('tab')) return true
                return item.subItems?.some(s => {
                  const [sRoute, sQuery] = s.route.split('?')
                  if (!sQuery) return pathname === sRoute && !searchParams?.get('tab')
                  const paramTab = new URLSearchParams(sQuery).get('tab')
                  return pathname === sRoute && searchParams?.get('tab') === paramTab
                })
              })

              return (
                <div key={idx} className="rounded-2xl border border-slate-100/80 bg-slate-50/40 overflow-hidden transition-all">
                  
                  {/* Encabezado de la Sección (Clickeable con Acordeón) */}
                  {!collapsed ? (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all ${
                        isSectionOpen 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : isAnyItemActive
                            ? 'bg-slate-200/70 text-slate-900 font-bold hover:bg-slate-200'
                            : 'text-slate-700 font-bold hover:bg-slate-100/90'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SectionIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isSectionOpen ? 'text-amber-400' : isAnyItemActive ? 'text-slate-900' : 'text-slate-500'
                        }`} />
                        <span className="text-[10.5px] uppercase tracking-wider truncate">
                          {section.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                          isSectionOpen 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {section.items.length}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isSectionOpen ? 'rotate-180 text-white' : 'text-slate-400'
                        }`} />
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSection(section.title)}
                      title={section.title}
                      className={`w-full p-2.5 flex items-center justify-center transition-colors ${
                        isAnyItemActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <SectionIcon className="w-4 h-4" />
                    </button>
                  )}

                  {/* Cuerpo Desplegable de la Sección (Items y Subitems) */}
                  {isSectionOpen && (
                    <div className="p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200 bg-white">
                      {section.items.map((item, i) => {
                        const Icon = item.icon
                        const hasSubItems = item.subItems && item.subItems.length > 0
                        const isSubmenuOpen = openSubmenu === item.label || searchQuery.trim() !== ''
                        const isDirectActive = pathname === item.route && !searchParams?.get('tab')
                        const isSubActive = item.subItems?.some(s => {
                          const [sRoute, sQuery] = s.route.split('?')
                          if (!sQuery) return pathname === sRoute && !searchParams?.get('tab')
                          const paramTab = new URLSearchParams(sQuery).get('tab')
                          return pathname === sRoute && searchParams?.get('tab') === paramTab
                        })
                        const isActive = isDirectActive || isSubActive

                        return (
                          <div key={i} className="space-y-1">
                            <button
                              onClick={() => {
                                if (hasSubItems) {
                                  toggleSubmenu(item.label)
                                } else {
                                  router.push(item.route)
                                }
                              }}
                              title={collapsed ? item.label : undefined}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left ${
                                isActive
                                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                                  : 'text-slate-800 font-semibold hover:bg-slate-100/90'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                                {!collapsed && (
                                  <span className={`truncate text-xs ${isActive ? 'text-white font-bold' : 'text-slate-800 font-semibold'}`}>
                                    {item.label}
                                  </span>
                                )}
                              </div>

                              {!collapsed && (
                                <div className="flex items-center gap-1">
                                  {item.badge && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                  {hasSubItems && (
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isSubmenuOpen ? 'rotate-180' : ''
                                    } ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                  )}
                                </div>
                              )}
                            </button>

                            {/* Despliegue de Submenús */}
                            {!collapsed && hasSubItems && isSubmenuOpen && (
                              <div className="ml-2.5 my-1 space-y-0.5 border-l-2 border-slate-200 pl-2">
                                {item.subItems!.map((sub, sIdx) => {
                                  const [sRoute, sQuery] = sub.route.split('?')
                                  const targetTab = sQuery ? new URLSearchParams(sQuery).get('tab') : null
                                  const isSubItemActive = pathname === sRoute && (targetTab ? searchParams?.get('tab') === targetTab : !searchParams?.get('tab'))

                                  return (
                                    <button
                                      key={sIdx}
                                      onClick={() => router.push(sub.route)}
                                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 ${
                                        isSubItemActive
                                          ? 'bg-slate-900 text-white font-bold shadow-2xs'
                                          : 'text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900'
                                      }`}
                                    >
                                      <span className="truncate">{sub.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>
              )
            })
          )}

        </div>

      </div>

      {/* Footer Branding en Sidebar */}
      {!collapsed && (
        <div className="p-3 m-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Marca Blanca Activa</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">AS Operadora de Viajes</p>
        </div>
      )}
    </aside>
  )
}
