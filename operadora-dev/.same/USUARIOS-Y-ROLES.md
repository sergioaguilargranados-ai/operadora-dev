# 👥 USUARIOS Y ROLES - Sistema Completo

**Fecha:** 12 de Diciembre de 2025
**Versión:** v2.50
**Estado:** Análisis y Propuesta

---

## 📊 ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ LO QUE ESTÁ CONSTRUIDO

#### 1. **Tabla de Usuarios Básica**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Problemas:**
- ❌ No tiene campo de `role` o `user_type`
- ❌ No diferencia entre tipos de usuario
- ❌ No tiene campos para empresas o agencias
- ❌ No tiene campo de autorización/aprobación
- ❌ No maneja permisos granulares

---

## 🎯 PROPUESTA: SISTEMA COMPLETO DE USUARIOS Y ROLES

### 📋 ESQUEMA DE BASE DE DATOS MEJORADO

#### 1. **Tabla Principal de Usuarios (MEJORADA)**
```sql
-- Modificar tabla users existente
ALTER TABLE users
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'cliente',     -- 'cliente', 'corporativo', 'agencia', 'interno'
ADD COLUMN role VARCHAR(50),                                      -- Rol específico según tipo
ADD COLUMN company_id INTEGER REFERENCES companies(id),           -- Si es corporativo
ADD COLUMN agency_id INTEGER REFERENCES agencies(id),             -- Si es agencia
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',                  -- 'pending', 'active', 'suspended', 'rejected'
ADD COLUMN approved_by INTEGER REFERENCES users(id),              -- Quién aprobó el usuario
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN membership_type VARCHAR(20) DEFAULT 'basic',           -- 'basic', 'premium', 'vip'
ADD COLUMN preferences JSONB,                                     -- Preferencias del usuario
ADD COLUMN profile_completed BOOLEAN DEFAULT false,
ADD COLUMN fiscal_data_completed BOOLEAN DEFAULT false;

-- Índices para búsquedas rápidas
CREATE INDEX idx_users_type_role ON users(user_type, role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_company ON users(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_users_agency ON users(agency_id) WHERE agency_id IS NOT NULL;
```

#### 2. **Tabla de Empresas (CORPORATIVOS)**
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE,                    -- RFC
    industry VARCHAR(100),
    employee_count INTEGER,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2) DEFAULT 'MX',
    postal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',          -- 'active', 'inactive', 'suspended'
    credit_limit DECIMAL(10,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,             -- Días de crédito
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_tax_id ON companies(tax_id);
```

#### 3. **Tabla de Agencias**
```sql
CREATE TABLE agencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE,                    -- RFC
    license_number VARCHAR(100),                   -- Número de licencia de agencia
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2) DEFAULT 'MX',
    postal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,   -- % de comisión
    payment_method VARCHAR(50),                    -- 'bank_transfer', 'check', etc.
    logo_url TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agencies_name ON agencies(name);
CREATE INDEX idx_agencies_tax_id ON agencies(tax_id);
```

#### 4. **Tabla de Roles y Permisos**
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,              -- 'cliente', 'corporativo_admin', 'agencia_operador', etc.
    display_name VARCHAR(100),                     -- Nombre amigable
    description TEXT,
    user_type VARCHAR(20) NOT NULL,                -- A qué tipo de usuario pertenece
    permissions JSONB NOT NULL,                    -- Array de permisos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles predefinidos se insertarán después
```

#### 5. **Tabla de Permisos (Granular)**
```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,                   -- 'bookings', 'users', 'reports', etc.
    action VARCHAR(50) NOT NULL,                   -- 'create', 'read', 'update', 'delete', 'approve'
    resource VARCHAR(100),                         -- Recurso específico (opcional)
    description TEXT,
    UNIQUE(module, action, resource)
);

CREATE INDEX idx_permissions_module ON permissions(module);
```

#### 6. **Tabla Relacional: Usuario-Rol**
```sql
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,                          -- Para roles temporales
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
```

---

## 👤 TIPOS DE USUARIO Y ROLES

### 1. **CLIENTE FINAL**

**Campos de Registro:**
```typescript
{
  name: string,
  email: string,
  password: string,
  password_confirm: string,
  phone: string,
  accept_privacy_policy: boolean,
  membership_reason: 'club' | 'purchase'        // Nuevo campo
}
```

**Asignación automática:**
- `user_type`: 'cliente'
- `role`: 'cliente'
- `status`: 'active' (activación inmediata)
- `membership_type`: 'basic'

**Permisos:**
```json
{
  "bookings": ["create", "read_own", "update_own", "cancel_own"],
  "searches": ["create", "read_own"],
  "favorites": ["create", "read_own", "delete_own"],
  "profile": ["read_own", "update_own"],
  "reviews": ["create", "read", "update_own"]
}
```

---

### 2. **CORPORATIVO**

**Campos de Registro:**
```typescript
{
  company_name: string,                          // Con autocomplete
  is_new_company: boolean,                       // Si no existe en catálogo
  name: string,
  email: string,
  password: string,
  password_confirm: string,
  phone: string,
  accept_privacy_policy: boolean,
  corporate_role: 'admin' | 'employee'           // Nuevo selector
}
```

**Proceso:**
1. Usuario busca empresa en autocomplete
2. Si no existe, se marca `is_new_company = true` y se crea
3. Se asigna `company_id` al usuario
4. Si es primer usuario de empresa → automáticamente `admin`
5. Si no es primer usuario → `employee` (requiere aprobación de admin de empresa)

**Roles:**

#### **Corporativo - Administrador**
- `user_type`: 'corporativo'
- `role`: 'corporativo_admin'
- `status`: 'active' (si es primer usuario) o 'pending' (si ya hay admin)

**Permisos:**
```json
{
  "bookings": ["create", "read_company", "update_company", "cancel_company", "approve"],
  "employees": ["create", "read", "update", "delete", "approve"],
  "reports": ["read_company"],
  "budget": ["manage"],
  "approvals": ["manage"]
}
```

#### **Corporativo - Empleado**
- `user_type`: 'corporativo'
- `role`: 'corporativo_employee'
- `status`: 'pending' (requiere aprobación de admin corporativo)

**Permisos:**
```json
{
  "bookings": ["create", "read_own"],
  "searches": ["create", "read_own"],
  "profile": ["read_own", "update_own"]
}
```

---

### 3. **AGENCIA DE VIAJES**

**Campos de Registro:**
```typescript
{
  agency_name: string,                           // Con autocomplete
  is_new_agency: boolean,
  name: string,
  email: string,
  password: string,
  password_confirm: string,
  phone: string,
  accept_privacy_policy: boolean,
  agency_role: 'admin' | 'operator'              // Nuevo selector
}
```

**Roles:**

#### **Agencia - Administrador**
- `user_type`: 'agencia'
- `role`: 'agencia_admin'
- `status`: 'active' (si primer usuario) o 'pending'

**Permisos:**
```json
{
  "bookings": ["create", "read_agency", "update_agency", "cancel_agency"],
  "clients": ["create", "read", "update", "manage"],
  "operators": ["create", "read", "update", "delete", "approve"],
  "commissions": ["read"],
  "reports": ["read_agency"],
  "quotes": ["create", "read", "send"]
}
```

#### **Agencia - Operador**
- `user_type`: 'agencia'
- `role`: 'agencia_operator'
- `status`: 'pending' (requiere aprobación)

**Permisos:**
```json
{
  "bookings": ["create", "read_agency", "update_own"],
  "clients": ["create", "read"],
  "searches": ["create"],
  "quotes": ["create", "read_own"]
}
```

---

### 4. **USUARIO INTERNO (OPERADORA)**

**Campos de Registro:**
```typescript
{
  name: string,
  email: string,
  password: string,
  password_confirm: string,
  phone: string,
  accept_privacy_policy: boolean,
  internal_role: 'director' | 'ventas' | 'operativo' | 'administrativo' | 'it'
}
```

**Proceso:**
1. Usuario se registra seleccionando rol interno
2. `status`: 'pending' → Requiere aprobación de Administrativo
3. Administrativo recibe notificación
4. Administrativo aprueba/rechaza desde panel de usuarios
5. Usuario recibe email de aprobación/rechazo

**Roles:**

#### **Director**
- `user_type`: 'interno'
- `role`: 'director'

**Permisos:**
```json
{
  "all": ["*"]  // Acceso total
}
```

#### **Ventas**
- `user_type`: 'interno'
- `role`: 'ventas'

**Permisos:**
```json
{
  "bookings": ["create", "read", "update"],
  "clients": ["create", "read", "update"],
  "quotes": ["create", "read", "send"],
  "reports": ["read_sales"],
  "commissions": ["read_own"]
}
```

#### **Operativo**
- `user_type`: 'interno'
- `role`: 'operativo'

**Permisos:**
```json
{
  "bookings": ["read", "update", "confirm"],
  "hotels": ["create", "update", "review"],
  "flights": ["confirm", "reissue"],
  "providers": ["manage"],
  "inventory": ["manage"]
}
```

#### **Administrativo**
- `user_type`: 'interno'
- `role`: 'administrativo'

**Permisos:**
```json
{
  "users": ["create", "read", "update", "approve", "suspend"],
  "companies": ["create", "read", "update"],
  "agencies": ["create", "read", "update"],
  "invoices": ["create", "read", "update", "cancel"],
  "payments": ["manage"],
  "reports": ["read_all"]
}
```

#### **IT**
- `user_type`: 'interno'
- `role`: 'it'

**Permisos:**
```json
{
  "system": ["manage"],
  "users": ["read", "update", "reset_password"],
  "logs": ["read"],
  "security": ["manage"],
  "integrations": ["manage"]
}
```

---

## 🗂️ SISTEMA DE MENÚ VERTICAL

### Propuesta de Menú Lateral Dinámico

```typescript
// src/lib/menuConfig.ts
export const menuStructure = {
  cliente: [
    {
      section: "Principal",
      items: [
        { icon: "Home", label: "Inicio", path: "/" },
        { icon: "Search", label: "Buscar", path: "/buscar" },
        { icon: "Heart", label: "Favoritos", path: "/favoritos" }
      ]
    },
    {
      section: "Mis Reservas",
      items: [
        { icon: "Calendar", label: "Reservas Activas", path: "/mis-reservas" },
        { icon: "History", label: "Historial", path: "/mis-reservas/historial" }
      ]
    },
    {
      section: "Mi Cuenta",
      items: [
        { icon: "User", label: "Perfil", path: "/perfil" },
        { icon: "Award", label: "AS Club", path: "/club" },
        { icon: "Settings", label: "Configuración", path: "/configuracion" }
      ]
    }
  ],

  corporativo_admin: [
    {
      section: "Principal",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard" },
        { icon: "Search", label: "Nueva Reserva", path: "/buscar" }
      ]
    },
    {
      section: "Gestión Corporativa",
      items: [
        { icon: "Building", label: "Mi Empresa", path: "/empresa" },
        { icon: "Users", label: "Empleados", path: "/empresa/empleados" },
        { icon: "Calendar", label: "Reservas", path: "/empresa/reservas" },
        { icon: "FileText", label: "Reportes", path: "/empresa/reportes" },
        { icon: "DollarSign", label: "Presupuesto", path: "/empresa/presupuesto" }
      ]
    },
    {
      section: "Aprobaciones",
      items: [
        { icon: "CheckCircle", label: "Pendientes", path: "/empresa/aprobaciones" }
      ]
    }
  ],

  agencia_admin: [
    {
      section: "Principal",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard" },
        { icon: "Search", label: "Nueva Cotización", path: "/cotizaciones/nueva" }
      ]
    },
    {
      section: "Gestión de Agencia",
      items: [
        { icon: "Building2", label: "Mi Agencia", path: "/agencia" },
        { icon: "Users", label: "Operadores", path: "/agencia/operadores" },
        { icon: "UserPlus", label: "Clientes", path: "/agencia/clientes" }
      ]
    },
    {
      section: "Reservas y Ventas",
      items: [
        { icon: "FileText", label: "Cotizaciones", path: "/cotizaciones" },
        { icon: "Calendar", label: "Reservas", path: "/agencia/reservas" },
        { icon: "DollarSign", label: "Comisiones", path: "/agencia/comisiones" }
      ]
    },
    {
      section: "Reportes",
      items: [
        { icon: "BarChart", label: "Ventas", path: "/agencia/reportes/ventas" },
        { icon: "TrendingUp", label: "Performance", path: "/agencia/reportes/performance" }
      ]
    }
  ],

  director: [
    {
      section: "Dirección",
      items: [
        { icon: "LayoutDashboard", label: "Dashboard Ejecutivo", path: "/dashboard/executive" },
        { icon: "TrendingUp", label: "KPIs", path: "/dashboard/kpis" }
      ]
    },
    {
      section: "Operación",
      items: [
        { icon: "Calendar", label: "Todas las Reservas", path: "/admin/reservas" },
        { icon: "Users", label: "Clientes", path: "/admin/clientes" },
        { icon: "Building", label: "Corporativos", path: "/admin/corporativos" },
        { icon: "Building2", label: "Agencias", path: "/admin/agencias" }
      ]
    },
    {
      section: "Finanzas",
      items: [
        { icon: "DollarSign", label: "Facturación", path: "/admin/facturacion" },
        { icon: "CreditCard", label: "Cuentas por Cobrar", path: "/admin/cuentas-cobrar" },
        { icon: "Receipt", label: "Cuentas por Pagar", path: "/admin/cuentas-pagar" }
      ]
    },
    {
      section: "Reportes",
      items: [
        { icon: "BarChart", label: "Reportes Generales", path: "/admin/reportes" },
        { icon: "FileSpreadsheet", label: "Exportaciones", path: "/admin/exportaciones" }
      ]
    }
  ],

  administrativo: [
    {
      section: "Administración",
      items: [
        { icon: "Users", label: "Gestión de Usuarios", path: "/admin/usuarios" },
        { icon: "UserCheck", label: "Aprobaciones Pendientes", path: "/admin/aprobaciones", badge: "pending_approvals" },
        { icon: "Building", label: "Empresas", path: "/admin/empresas" },
        { icon: "Building2", label: "Agencias", path: "/admin/agencias" }
      ]
    },
    {
      section: "Facturación",
      items: [
        { icon: "FileText", label: "Facturas", path: "/admin/facturas" },
        { icon: "DollarSign", label: "Pagos", path: "/admin/pagos" },
        { icon: "CreditCard", label: "Cuentas por Cobrar", path: "/admin/cuentas-cobrar" },
        { icon: "Receipt", label: "Cuentas por Pagar", path: "/admin/cuentas-pagar" }
      ]
    }
  ],

  it: [
    {
      section: "Sistema",
      items: [
        { icon: "Settings", label: "Configuración", path: "/admin/system/config" },
        { icon: "Users", label: "Usuarios", path: "/admin/usuarios" },
        { icon: "Shield", label: "Seguridad", path: "/admin/security" },
        { icon: "Activity", label: "Logs", path: "/admin/logs" }
      ]
    },
    {
      section: "Integraciones",
      items: [
        { icon: "Plug", label: "APIs", path: "/admin/apis" },
        { icon: "Database", label: "Base de Datos", path: "/admin/database" }
      ]
    }
  ]
}
```

---

## 🎨 COMPONENTE DE MENÚ LATERAL

```typescript
// src/components/Sidebar.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { menuStructure } from '@/lib/menuConfig'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const menu = menuStructure[user.role] || menuStructure['cliente']

  return (
    <aside className="w-64 bg-white border-r min-h-screen sticky top-0">
      <div className="p-4">
        <Logo />
      </div>

      <nav className="px-3 space-y-6">
        {menu.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.section}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.path
                const Icon = icons[item.icon]

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <Badge variant="destructive">3</Badge>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
```

---

## 🔐 MIDDLEWARE DE PERMISOS

```typescript
// src/lib/permissions.ts
export function hasPermission(
  user: User,
  module: string,
  action: string,
  resource?: any
): boolean {
  // Super admin tiene todo
  if (user.role === 'director') return true

  const rolePermissions = getRolePermissions(user.role)

  // Verificar si tiene el permiso específico
  if (rolePermissions[module]?.includes(action)) {
    // Verificar ownership si es necesario
    if (action.endsWith('_own') && resource) {
      return resource.user_id === user.id
    }

    // Verificar scope de empresa/agencia
    if (action.endsWith('_company') && resource) {
      return resource.company_id === user.company_id
    }

    if (action.endsWith('_agency') && resource) {
      return resource.agency_id === user.agency_id
    }

    return true
  }

  return false
}

// Componente de protección
export function ProtectedAction({
  module,
  action,
  children,
  fallback = null
}: Props) {
  const { user } = useAuth()

  if (!hasPermission(user, module, action)) {
    return fallback
  }

  return <>{children}</>
}
```

---

## ❓ PREGUNTAS PARA EL CLIENTE

### 1. **Aprobaciones de Usuarios Internos**
- ¿Solo Administrativo puede aprobar usuarios internos?
- ¿O Director también puede aprobar?
- ¿Notificar a múltiples personas cuando hay solicitud pendiente?

### 2. **Límites de Usuarios**
- ¿Límite de usuarios por empresa corporativa?
- ¿Límite de operadores por agencia?
- ¿Costo adicional por usuario extra?

### 3. **Marca Blanca**
- ¿Las agencias pueden tener su propio subdominio? (agencia1.asoperadora.com)
- ¿Pueden personalizar colores/logo?
- ¿Necesitan catálogo de precios diferente?

### 4. **Jerarquías**
- ¿Puede haber sub-roles? (Ej: Ventas Senior, Ventas Junior)
- ¿Delegación de permisos temporales?
- ¿Suplencias cuando alguien está de vacaciones?

### 5. **Autenticación**
- ¿2FA (autenticación de dos factores) para usuarios internos?
- ¿SSO (Single Sign-On) para empresas grandes?
- ¿Login con Google/Facebook para clientes?

### 6. **Datos Personales**
- ¿Qué campos adicionales necesitas en el perfil?
  - Fecha de nacimiento
  - Dirección completa
  - Pasaporte
  - Preferencias de viaje
  - Contacto de emergencia

### 7. **Validación de Empresas/Agencias**
- ¿Verificar RFC con SAT antes de crear empresa?
- ¿Solicitar documentos (RFC, acta constitutiva)?
- ¿Aprobación manual de nuevas empresas/agencias?

---

## ✅ RECOMENDACIONES ADICIONALES

### 1. **Onboarding por Rol**
Crear un wizard de bienvenida diferente para cada tipo de usuario:
- Cliente: Tour de búsqueda + Club
- Corporativo: Configurar empresa + Invitar empleados
- Agencia: Configurar tarifas + Agregar operadores
- Interno: Tutorial de herramientas administrativas

### 2. **Dashboard Personalizado**
Cada rol ve métricas relevantes:
- Cliente: Puntos, próximos viajes
- Corporativo Admin: Presupuesto usado, empleados activos
- Agencia: Ventas del mes, comisiones
- Director: Revenue, ocupación, conversion rate

### 3. **Notificaciones Inteligentes**
- Cliente: Ofertas de destinos que ha buscado
- Corporativo Admin: Aprobaciones pendientes
- Agencia: Nuevas comisiones disponibles
- Administrativo: Usuarios pendientes de aprobar

### 4. **Auditoría Completa**
Registrar todas las acciones importantes:
- Quién aprobó a quién
- Cambios de permisos
- Creación/eliminación de usuarios
- Acceso a datos sensibles

---

**Documento creado por:** AS Operadora Dev Team
**Última actualización:** 12 Dic 2025
**Estado:** Pendiente de revisión y aprobación
