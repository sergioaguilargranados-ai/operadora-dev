'use client'

import { useState, useEffect } from 'react'
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
  ArrowLeft,
  Globe
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
  items: MenuItem[]
}

interface PortalSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function PortalSidebar({ collapsed: externalCollapsed, onToggleCollapse }: PortalSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { hasPermission, isSuperAdmin } = usePermissions()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed))

  const isStaff = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENCY_ADMIN', 'AGENT', 'HR_MANAGER'].includes(user.role)

  useEffect(() => {
    if (pathname.includes('/dashboard/agency')) setOpenSubmenu('Panel Agencias')
    else if (pathname.includes('/dashboard/corporate')) setOpenSubmenu('Panel de Empresas')
    else if (pathname.includes('/admin/content')) setOpenSubmenu('Gestión de Contenido')
    else if (pathname.includes('/admin')) setOpenSubmenu('Administración & Sistema')
    else if (pathname.includes('/dashboard/crm') || pathname === '/operacion') setOpenSubmenu('Catálogo Clientes & CRM')
    else if (pathname.includes('/dashboard/rrhh')) setOpenSubmenu('RRHH / Personal')
  }, [pathname])

  const toggleSubmenu = (label: string) => {
    if (collapsed) setInternalCollapsed(false)
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  // 1. Menú para Viajeros / Clientes (Texto e iconos en negro)
  const clientMenu: MenuSection[] = [
    {
      title: 'MI CUENTA & VIAJES',
      items: [
        { label: 'Tus Reservas', icon: Package, route: '/mis-reservas' },
        { label: 'Mi Perfil', icon: UserIcon, route: '/perfil' },
        { label: 'Mis Facturas', icon: Receipt, route: '/facturacion' }
      ]
    },
    {
      title: 'AYUDA Y SOPORTE',
      items: [
        { label: 'Centro de Ayuda', icon: HelpCircle, route: '/ayuda' },
        { label: 'Prepara tu Viaje', icon: Compass, route: '/ayuda/prepara-tu-viaje' }
      ]
    }
  ]

  // 2. Menú para Agentes / Staff / Admin (Texto e iconos en negro + submenú desplegable)
  const staffMenu: MenuSection[] = [
    {
      title: 'INTRANET & OPERACIÓN',
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
      items: [
        { label: 'Todas las Reservas', icon: Package, route: '/mis-reservas', permission: 'bookings:view' },
        { label: 'Pagos & Cuentas', icon: CreditCard, route: '/dashboard/payments', permission: 'bookings:payments' },
        { label: 'Facturación SAT CFDI', icon: Receipt, route: '/facturacion', badge: 'SAT', permission: 'invoices:view' }
      ]
    },
    {
      title: 'ADMINISTRACIÓN Y AJUSTES',
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
      items: [
        { label: 'Mi Perfil', icon: UserIcon, route: '/perfil', permission: 'profile:view' }
      ]
    }
  ]

  const isItemPermitted = (item: MenuItem) => {
    if (isSuperAdmin || user?.role === 'SUPER_ADMIN') return true
    if (!item.permission) return true
    return hasPermission(item.permission)
  }

  const filteredStaffMenu = staffMenu.map(section => ({
    ...section,
    items: section.items.filter(isItemPermitted)
  })).filter(section => section.items.length > 0)

  const menuToRender = isStaff ? filteredStaffMenu : clientMenu

  return (
    <aside className={`bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] transition-all duration-200 flex flex-col justify-between select-none ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="py-4">
        {/* Toggle Collapse Header */}
        <div className="px-4 mb-3 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">
                {isStaff ? 'MENÚ INTRANET' : 'PORTAL VIAJERO'}
              </span>
            </div>
          )}
          <button
            onClick={toggle}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors mx-auto"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-slate-800" /> : <ChevronLeft className="w-4 h-4 text-slate-800" />}
          </button>
        </div>

        {/* Menu Sections & Accordion Submenus */}
        <div className="space-y-4">
          {menuToRender.map((section, idx) => (
            <div key={idx} className="px-2.5 space-y-1">
              {!collapsed && (
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-1">
                  {section.title}
                </p>
              )}
              {section.items.map((item, i) => {
                const Icon = item.icon
                const hasSubItems = item.subItems && item.subItems.length > 0
                const isSubmenuOpen = openSubmenu === item.label
                const isDirectActive = pathname === item.route && !searchParams.get('tab')
                const isSubActive = item.subItems?.some(s => {
                  const [sRoute, sQuery] = s.route.split('?')
                  if (!sQuery) return pathname === sRoute && !searchParams.get('tab')
                  const paramTab = new URLSearchParams(sQuery).get('tab')
                  return pathname === sRoute && searchParams.get('tab') === paramTab
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                        isActive
                          ? 'bg-black text-white shadow-xs font-bold'
                          : 'text-slate-900 font-semibold hover:bg-slate-100/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-900'}`} />
                        {!collapsed && <span className={`truncate text-xs ${isActive ? 'text-white font-bold' : 'text-slate-900 font-semibold'}`}>{item.label}</span>}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center gap-1">
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-900'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {hasSubItems && (
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''} ${isActive ? 'text-white' : 'text-slate-800'}`} />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Despliegue de Submenú con Línea Indicadora Estilo ERPCubox */}
                    {!collapsed && hasSubItems && isSubmenuOpen && (
                      <div className="ml-3 my-1 space-y-1">
                        {item.subItems!.map((sub, sIdx) => {
                          const [sRoute, sQuery] = sub.route.split('?')
                          const targetTab = sQuery ? new URLSearchParams(sQuery).get('tab') : null
                          const isSubItemActive = pathname === sRoute && (targetTab ? searchParams.get('tab') === targetTab : !searchParams.get('tab'))

                          return (
                            <button
                              key={sIdx}
                              onClick={() => router.push(sub.route)}
                              className={`w-full text-left px-3 py-1.5 text-xs transition-all flex items-center gap-2 ${
                                isSubItemActive
                                  ? 'border-l-3 border-black text-black font-extrabold bg-slate-100 rounded-r-lg pl-3'
                                  : 'border-l-2 border-slate-200 text-slate-800 font-medium hover:border-slate-800 hover:text-black hover:bg-slate-50 pl-3'
                              }`}
                            >
                              <span>{sub.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>



      {/* Footer Branding en Sidebar */}
      {!collapsed && (
        <div className="p-3 m-2.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Marca Blanca Activa</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">AS Operadora de Viajes</p>
        </div>
      )}
    </aside>
  )
}
