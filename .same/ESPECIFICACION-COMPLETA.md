# 📋 ESPECIFICACIÓN COMPLETA - AS OPERADORA PLATAFORMA

**Última actualización:** 14 de Diciembre de 2025
**Versión del Sistema:** v2.51

## 🎯 VISIÓN GENERAL

**Sistema multi-tenant (multi-empresa), multi-moneda para gestión de viajes y eventos.**

**Modelo de Negocio:** B2B2C (Business to Business to Consumer)
- Plataforma central que sirve a múltiples empresas
- Cada empresa sirve a sus propios clientes
- White-label para agencias

**Estado de Implementación:** 55% completado
- ✅ Backend core (APIs, servicios, BD)
- ✅ Integraciones proveedores (4 adaptadores)
- 🟡 Frontend (páginas básicas)
- ❌ Features avanzadas (pending)

---

# 1️⃣ SISTEMA MULTI-MONEDA

## 1.1 Especificación Validada ✅

**Funcionalidad:** Sistema debe soportar múltiples monedas con conversión en tiempo real.

### **Monedas Soportadas (Inicial):**
- 🇲🇽 MXN - Peso Mexicano (moneda base)
- 🇺🇸 USD - Dólar Estadounidense
- 🇪🇺 EUR - Euro
- 🇨🇦 CAD - Dólar Canadiense
- 🇬🇧 GBP - Libra Esterlina
- 🇯🇵 JPY - Yen Japonés

### **Características:**

#### **A) Selección de Moneda**
- Usuario selecciona moneda preferida en el perfil
- Selector de moneda en header (dropdown)
- Persistencia de preferencia (guardada en BD)
- Cookie/localStorage para visitantes no registrados

#### **B) Conversión de Precios**
- **Precio Base:** Siempre almacenado en MXN en BD
- **Conversión Display:** Al momento de mostrar según moneda seleccionada
- **Tipos de Cambio:** Actualización diaria desde API externa
- **Precisión:** 2 decimales para la mayoría, 0 para JPY

#### **C) API de Tipos de Cambio**
**Opciones recomendadas:**
- **exchangerate-api.com** (1,500 requests/mes gratis)
- **openexchangerates.org** (1,000 requests/mes gratis)
- **fixer.io** (backup)

#### **D) Caching**
- Tipos de cambio cacheados por 24 horas
- Actualización automática diaria a las 00:00 UTC
- Fallback a tipos de cambio del día anterior si API falla

### **Mejores Prácticas:**

✅ **NO convertir en base de datos** - Siempre guardar en moneda base
✅ **Mostrar moneda original** - "Precio original: $100 USD (≈ $1,850 MXN)"
✅ **Disclaimer de tipos de cambio** - "Tipo de cambio aproximado. Final al momento de pago"
✅ **Congelamiento de precio** - Al hacer reserva, guardar tipo de cambio usado
✅ **Auditoría** - Registrar qué tipo de cambio se usó en cada transacción

### **Base de Datos - Nuevas Tablas:**

```sql
-- Tipos de cambio
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(3) DEFAULT 'MXN',
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(12, 6) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50), -- API source
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency, date)
);

-- Monedas soportadas
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true
);

-- Auditoría de transacciones
ALTER TABLE bookings ADD COLUMN currency_code VARCHAR(3) DEFAULT 'MXN';
ALTER TABLE bookings ADD COLUMN exchange_rate DECIMAL(12, 6);
ALTER TABLE bookings ADD COLUMN original_price DECIMAL(10, 2);
```

---

# 1.2 Sistema de Roles y Seguridad ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Sistema de autenticación, autorización y gestión de roles.

### **Roles Implementados:**

**1. Super Admin (AS Operadora)**
- Acceso total a la plataforma
- Gestión de todos los tenants
- Configuración global
- Acceso a reportes consolidados

**2. Admin Corporativo**
- Gestión de su empresa
- Usuarios de su organización
- Políticas de viaje
- Reportes de su empresa

**3. Admin de Agencia**
- Gestión de su agencia
- Clientes de la agencia
- Configuración white-label
- Comisiones y ventas

**4. Usuario Final**
- Búsqueda y reservas
- Perfil personal
- Historial de viajes
- Favoritos

### **AuthService Implementado:**

```typescript
// src/services/AuthService.ts
- login(email, password) → JWT token
- register(userData) → User created
- validateToken(token) → User data
- hashPassword(password) → Hashed
- verifyPassword(password, hash) → Boolean
- refreshToken(token) → New token
```

### **Middleware de Autenticación:**

```typescript
// src/middleware.ts
- Verificación JWT en rutas protegidas
- Extracción de usuario del token
- Inyección en headers (x-user-id)
- Redirección a login si no autenticado
```

### **Seguridad Implementada:**

✅ JWT con expiración (24h)
✅ Bcrypt para passwords (10 rounds)
✅ HttpOnly cookies (opcional)
✅ Refresh tokens
✅ Rate limiting preparado
✅ CORS configurado

### **Base de Datos:**

```sql
-- Tabla users ampliada
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    tenant_id INTEGER REFERENCES tenants(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 1.3 Cookie Consent y GDPR ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Sistema de consentimiento de cookies conforme a GDPR.

### **Componente CookieConsent:**

**Características:**
- ✅ Banner configurable
- ✅ Opciones: Aceptar todas, Solo necesarias, Configurar
- ✅ Política de privacidad enlazada
- ✅ Persistencia de preferencias
- ✅ Integración con Google Analytics (opcional)

### **API Endpoint:**

```typescript
// GET /api/cookie-consent
- Obtener preferencias del usuario

// POST /api/cookie-consent
- Guardar preferencias
{
  necessary: true,    // Siempre true
  analytics: boolean,
  marketing: boolean,
  preferences: boolean
}
```

### **UI Implementada:**

```tsx
// src/components/CookieConsent.tsx
<CookieConsent
  onAcceptAll={}
  onAcceptNecessary={}
  onConfigure={}
/>
```

### **Cookies Utilizadas:**

| Cookie | Tipo | Duración | Propósito |
|--------|------|----------|-----------|
| `cookie-consent` | Necesaria | 1 año | Guardar preferencias |
| `auth-token` | Necesaria | 24h | Sesión de usuario |
| `_ga` | Analytics | 2 años | Google Analytics |
| `tenant-id` | Necesaria | Session | Multi-tenancy |

---

# 1.4 Auto-guardado de Hoteles desde APIs ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Sistema inteligente de guardado automático de hoteles desde resultados de búsqueda.

### **HotelAutoSaveService:**

**Características:**
- ✅ Guardado automático al buscar
- ✅ Detección de duplicados por provider + external_id
- ✅ Actualización solo si datos son más completos
- ✅ Campo `data_completeness` (0-100%)
- ✅ Campo `needs_review` para revisión manual
- ✅ Tracking de provider y external_id

### **Lógica de Completitud:**

```typescript
data_completeness = (
  (name ? 20 : 0) +
  (description ? 15 : 0) +
  (images.length > 0 ? 15 : 0) +
  (rating ? 10 : 0) +
  (address ? 10 : 0) +
  (amenities.length > 0 ? 10 : 0) +
  (coordinates ? 10 : 0) +
  (price ? 10 : 0)
) / 100
```

### **API de Revisión:**

```typescript
// GET /api/hotels/review
- Lista hoteles con needs_review=true
- Ordenados por data_completeness ascendente
- Paginación

// PUT /api/hotels/review
- Marcar como revisado
- Actualizar datos faltantes
```

### **Migración BD:**

```sql
ALTER TABLE hotels
  ADD COLUMN provider VARCHAR(50),
  ADD COLUMN external_id VARCHAR(255),
  ADD COLUMN data_completeness INTEGER DEFAULT 0,
  ADD COLUMN needs_review BOOLEAN DEFAULT false;

CREATE UNIQUE INDEX idx_hotels_provider_external
  ON hotels(provider, external_id);
```

---

# 1.5 Paginación Inteligente de Vuelos ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Sistema de paginación optimizado para resultados de vuelos.

### **Configuración:**
- **Límite total:** 15 vuelos (optimal para UX)
- **Por página:** 10 vuelos
- **Páginas:** 2 (10 + 5)

### **Features:**
✅ Modal de detalles (Dialog shadcn)
✅ Navegación sin perder estado de búsqueda
✅ Scroll position guardado
✅ Filtros aplicados persistentes
✅ Controles de paginación numéricos

### **Implementación:**

```typescript
// src/app/resultados/page.tsx
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const paginatedResults = results.slice(startIndex, endIndex)
```

---

# 1.6 Reportes y Exportación ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Sistema de generación de reportes en múltiples formatos.

### **PDFService:**

**Capabilities:**
- ✅ Vouchers de reserva
- ✅ Facturas en PDF
- ✅ Reportes financieros
- ✅ Estados de cuenta
- ✅ Logos y branding personalizado

**Librería:** `pdfkit`

```typescript
// src/services/PDFService.ts
- generateVoucher(booking) → PDF Buffer
- generateInvoice(invoice) → PDF Buffer
- generateFinancialReport(data) → PDF Buffer
- generateAccountStatement(account) → PDF Buffer
```

### **ExcelService:**

**Capabilities:**
- ✅ Reportes financieros multi-hoja
- ✅ Exportación de reservas
- ✅ Exportación de comisiones
- ✅ Cuentas por cobrar/pagar
- ✅ Formato profesional con headers

**Librería:** `xlsx` (SheetJS)

```typescript
// src/services/ExcelService.ts
- exportFinancialReport(data) → Excel Buffer
- exportBookings(bookings) → Excel Buffer
- exportCommissions(commissions) → Excel Buffer
- exportAccountsReceivable(accounts) → Excel Buffer
- exportAccountsPayable(accounts) → Excel Buffer
```

### **Endpoints:**

```
GET /api/invoices/[id]/pdf
GET /api/invoices/[id]/excel
GET /api/bookings/export?format=pdf
GET /api/accounts-receivable/export?format=excel
```

---

# 1.7 Gráficas Financieras ✅ **IMPLEMENTADO**

## Especificación

**Funcionalidad:** Visualización de datos financieros con gráficas interactivas.

### **FinancialCharts Component:**

**Tipos de gráficas:**
- ✅ Pie Chart - Distribución de CxC/CxP
- ✅ Bar Chart - Comisiones por período
- ✅ Line Chart - Tendencias temporales
- ✅ Area Chart - Flujo de caja

**Librería:** Recharts

```tsx
// src/components/charts/FinancialCharts.tsx
<AccountsReceivableChart data={} />
<AccountsPayableChart data={} />
<CommissionsChart data={} />
<CashFlowChart data={} />
```

### **Features:**
- Responsive design
- Tooltips informativos
- Colores personalizables
- Exportación a imagen
- Data labels
- Leyendas interactivas

---

# 2️⃣ SISTEMA MULTI-EMPRESA (MULTI-TENANT)

## 2.1 Especificación Validada y Mejorada ✅

**Funcionalidad:** Plataforma única que sirve a múltiples organizaciones con aislamiento de datos.

### **TIPOS DE USUARIO Y JERARQUÍA**

```
┌─────────────────────────────────────┐
│   SUPER ADMIN (AS OPERADORA)        │
│   - Administra toda la plataforma   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┬─────────────┬──────────────┐
       │               │             │              │
   ┌───▼────┐    ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐
   │USUARIO │    │EMPRESA/  │  │ AGENCIA  │  │ USUARIO  │
   │ FINAL  │    │CORPORAT. │  │          │  │ TERCERO  │
   └────────┘    └──────────┘  └────┬─────┘  └──────────┘
                                     │
                              ┌──────▼───────┐
                              │SUB-CLIENTES  │
                              │  DE AGENCIA  │
                              └──────────────┘
```

---

## 2.2 DETALLE POR TIPO DE USUARIO

### **A) USUARIO FINAL** 👤

**Descripción:** Cliente directo que usa la plataforma para sus viajes personales.

**Características:**
- ✅ Registro público (cualquiera puede registrarse)
- ✅ Perfil personal con datos de contacto
- ✅ Historial de viajes personal
- ✅ Programa de lealtad (AS Club)
- ✅ Favoritos y listas de deseos
- ✅ Gestión de viajeros frecuentes (familia, amigos)

**Funcionalidades:**
- Buscar vuelos, hoteles, paquetes
- Hacer reservas
- Ver historial de reservas
- Guardar tarjetas de pago (tokenizadas)
- Guardar documentos de viaje (pasaportes, visas)
- Recibir notificaciones
- Acumular puntos AS Club

**Permisos:**
- Solo ve sus propias reservas
- Solo puede hacer reservas para sí mismo y viajeros autorizados
- Acceso completo a su perfil

**Datos Guardados:**
- Información personal
- Preferencias de asiento, comida, etc.
- Documentos de viaje (encriptados)
- Métodos de pago
- Historial de compras

---

### **B) EMPRESA / CORPORATIVO** 🏢

**Descripción:** Organización que gestiona viajes de sus empleados.

**Características:**
- ✅ Cuenta empresarial con múltiples usuarios
- ✅ Branding corporativo (logo, colores limitados)
- ✅ Gestión centralizada de viajes
- ✅ Aprobación de viajes (workflows)
- ✅ Reportes y analytics
- ✅ Centros de costo / departamentos
- ✅ Políticas de viaje configurables

**Roles dentro de la Empresa:**

**1. Administrador Corporativo**
- Gestiona usuarios de la empresa
- Configura políticas de viaje
- Ve todos los viajes de la empresa
- Genera reportes
- Gestiona presupuesto

**2. Travel Manager**
- Hace reservas para empleados
- Aprueba/rechaza solicitudes
- Ve viajes de su departamento

**3. Empleado**
- Solicita viajes
- Ve solo sus propios viajes
- Respeta políticas corporativas

**Funcionalidades Especiales:**
- **Aprobación de viajes:** Sistema de workflow
  - Empleado solicita → Manager aprueba → Travel Manager reserva
- **Políticas de viaje:**
  - Clase máxima permitida (Económica/Business)
  - Hoteles máximo por noche
  - Destinos permitidos/restringidos
  - Anticipación mínima de reserva
- **Centros de Costo:**
  - Asignar viajes a departamentos
  - Tracking de gastos por área
- **Reportes:**
  - Gastos por empleado
  - Gastos por departamento
  - Destinos más visitados
  - Ahorro vs política

**Base de Datos - Empresas:**

```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_type VARCHAR(20) NOT NULL, -- 'corporate', 'agency'
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    domain VARCHAR(100) UNIQUE, -- subdominio.operadora.com
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id),
    role VARCHAR(50), -- 'admin', 'manager', 'employee'
    department VARCHAR(100),
    cost_center VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);

CREATE TABLE travel_policies (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    max_flight_class VARCHAR(20), -- 'economy', 'business', 'first'
    max_hotel_price DECIMAL(10,2),
    min_advance_days INTEGER,
    requires_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE travel_approvals (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20), -- 'pending', 'approved', 'rejected'
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### **C) AGENCIA** 🏪

**Descripción:** Agencia de viajes que usa la plataforma para gestionar sus propios clientes.

**Características:**
- ✅ White-label completo (logo, colores, dominio)
- ✅ Gestión de clientes propios
- ✅ Comisiones y márgenes configurables
- ✅ Dashboard de ventas
- ✅ CRM integrado
- ✅ Links de referido personalizados
- ✅ Marca blanca total

**Funcionalidades:**

**1. Branding White-Label:**
- Logo personalizado (header)
- Colores corporativos (primario, secundario, acentos)
- Subdomain propio: `agencia.operadora.com`
- Email personalizado: `reservas@agencia.com`
- Términos y condiciones propios

**2. Gestión de Clientes:**
- Importar/crear clientes
- Asignar agente responsable
- Ver historial completo de cada cliente
- Notas y seguimiento (CRM)

**3. Sistema de Comisiones:**
- Markup configurable por servicio
- Comisión por reserva
- Dashboard de ingresos
- Reportes de ventas

**4. Links de Referido:**
- Link único: `operadora.com/r/AGENCIA123`
- Tracking de conversiones
- Cliente ve marca de la agencia
- Comisión automática

**Roles en Agencia:**

**1. Dueño/Admin de Agencia**
- Configuración general
- Gestión de agentes
- Reportes financieros
- Configuración de comisiones

**2. Agente de Viajes**
- Gestiona sus clientes asignados
- Hace reservas
- Da seguimiento

**3. Cliente de Agencia (Usuario Tercero)**
- Ve la plataforma con branding de la agencia
- Experiencia white-label completa

**Base de Datos - Agencias:**

```sql
CREATE TABLE agency_clients (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES tenants(id),
    client_user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id), -- Agente asignado
    referral_code VARCHAR(50) UNIQUE,
    commission_rate DECIMAL(5,2), -- Porcentaje
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, client_user_id)
);

CREATE TABLE agency_commissions (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES tenants(id),
    booking_id INTEGER REFERENCES bookings(id),
    base_price DECIMAL(10,2),
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    status VARCHAR(20), -- 'pending', 'paid'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE white_label_config (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) UNIQUE,
    custom_domain VARCHAR(100),
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    footer_text TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    terms_url TEXT,
    privacy_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### **D) USUARIO TERCERO (White-Label)** 👥

**Descripción:** Cliente de una agencia que accede vía link de referido.

**Características:**
- ✅ Ve la plataforma con branding de la agencia
- ✅ No sabe que es AS Operadora (marca blanca)
- ✅ Experiencia personalizada
- ✅ Precios con markup de la agencia

**Flujo:**

1. **Agencia genera link de referido:**
   - `https://operadora.com/r/AGENCIA123`
   - O subdomain: `https://agenciaxyz.operadora.com`

2. **Cliente entra por el link:**
   - Sistema detecta `referral_code` en URL
   - Guarda cookie/session con agencia de referencia
   - Muestra logo y colores de la agencia

3. **Cliente navega:**
   - Todo el sitio muestra branding de la agencia
   - Precios incluyen markup de la agencia
   - Emails vienen "de la agencia"

4. **Cliente se registra/compra:**
   - Queda vinculado a la agencia automáticamente
   - Agencia recibe comisión
   - Agencia puede dar seguimiento

**Implementación Técnica:**

```typescript
// Middleware para detectar agencia
// src/middleware.ts
export function middleware(request: NextRequest) {
  const referralCode = request.nextUrl.searchParams.get('r')
  const subdomain = request.headers.get('host')?.split('.')[0]

  if (referralCode || subdomain !== 'operadora') {
    // Detectar agencia y aplicar white-label
    // Guardar en cookie/session
  }
}

// Context para white-label
// src/contexts/WhiteLabelContext.tsx
interface WhiteLabelConfig {
  agencyId: number
  logo: string
  colors: {
    primary: string
    secondary: string
  }
  companyName: string
}
```

---

# 3️⃣ SISTEMA DE NOTIFICACIONES

## 3.1 Especificación Validada ✅

**Funcionalidad:** Sistema multi-canal de notificaciones configurables por usuario.

### **Canales Soportados:**
- 📧 Email
- 📱 SMS
- 💬 WhatsApp

### **Tipos de Notificaciones:**

**A) Transaccionales (No se pueden desactivar):**
- Confirmación de registro
- Confirmación de reserva
- Boletos/vouchers
- Cambios en reserva
- Cancelaciones
- Recordatorio de check-in (24hrs antes)

**B) Marketing (Opt-in):**
- Ofertas especiales
- Descuentos personalizados
- Newsletter
- Recomendaciones

**C) Operacionales:**
- Cambios de vuelo/horario
- Alertas de precio
- Recordatorios de documentación

### **Preferencias de Usuario:**

**Tabla de configuración:**

```sql
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    -- Transaccionales
    booking_confirmation_email BOOLEAN DEFAULT true,
    booking_confirmation_sms BOOLEAN DEFAULT false,
    booking_confirmation_whatsapp BOOLEAN DEFAULT false,
    -- Marketing
    marketing_email BOOLEAN DEFAULT false,
    marketing_sms BOOLEAN DEFAULT false,
    marketing_whatsapp BOOLEAN DEFAULT false,
    -- Operacionales
    flight_changes_email BOOLEAN DEFAULT true,
    flight_changes_sms BOOLEAN DEFAULT true,
    flight_changes_whatsapp BOOLEAN DEFAULT false,
    -- Configuración general
    preferred_channel VARCHAR(20) DEFAULT 'email', -- 'email', 'sms', 'whatsapp'
    phone_verified BOOLEAN DEFAULT false,
    whatsapp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications_sent (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    type VARCHAR(50), -- 'booking_confirmation', 'flight_change', etc
    channel VARCHAR(20), -- 'email', 'sms', 'whatsapp'
    status VARCHAR(20), -- 'sent', 'delivered', 'failed', 'opened'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP
);
```

### **Servicios Recomendados:**

**Email:**
- **SendGrid** (100 emails/día gratis)
- **Resend** (3,000 emails/mes gratis)
- **AWS SES** (62,000 emails/mes gratis primer año)

**SMS:**
- **Twilio** (gratis con crédito de prueba, luego ~$0.05/SMS)
- **Vonage** (similar pricing)

**WhatsApp:**
- **Twilio WhatsApp API** ($0.005-0.02 por mensaje)
- **Meta WhatsApp Business API**

### **Implementación:**

```typescript
// src/lib/notifications.ts
interface NotificationPayload {
  userId: number
  type: string
  data: any
  channels?: ('email' | 'sms' | 'whatsapp')[]
}

async function sendNotification(payload: NotificationPayload) {
  // 1. Obtener preferencias del usuario
  // 2. Filtrar canales según preferencias
  // 3. Enviar por cada canal
  // 4. Registrar en notifications_sent
}
```

---

# 4️⃣ ALMACENAMIENTO DE DOCUMENTOS

## 4.1 Especificación Validada y Mejorada ✅

**Funcionalidad:** Almacenamiento seguro de documentos de identidad y viaje.

### **Documentos Soportados:**

**A) Identificación:**
- 🪪 INE/IFE (México)
- 🪪 Licencia de conducir
- 🪪 Cédula profesional
- 🪪 ID estatal/federal

**B) Documentos de Viaje:**
- 🛂 Pasaporte
- 🛂 Visa
- 🛂 Permiso de menor
- 🛂 Certificado de vacunación

### **Información Almacenada:**

**Pasaporte:**
- Número de pasaporte
- País emisor
- Fecha de expedición
- Fecha de expiración
- Nombre completo (como aparece)
- Nacionalidad
- Género
- Fecha de nacimiento
- Scan/foto del pasaporte (encriptado)

**Visa:**
- Tipo de visa
- País
- Número
- Fecha de expedición
- Fecha de expiración
- Scan/foto (encriptado)

### **Seguridad y Privacidad:**

✅ **Encriptación:**
- Archivos encriptados con AES-256
- Datos sensibles encriptados en BD
- Keys de encriptación en variables de entorno

✅ **Almacenamiento:**
- **Archivos:** AWS S3 / Cloudflare R2 / Vercel Blob
- **URLs firmadas:** Acceso temporal (15 min)
- **Sin acceso público directo**

✅ **Cumplimiento:**
- GDPR compliance (derecho al olvido)
- Logs de acceso a documentos
- Consentimiento explícito

✅ **Validaciones:**
- Verificar fecha de expiración
- Alertar si pasaporte expira pronto (< 6 meses)
- OCR automático para extraer datos

### **Base de Datos:**

```sql
CREATE TABLE travelers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    nationality VARCHAR(3), -- ISO country code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passports (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER REFERENCES travelers(id),
    passport_number_encrypted TEXT NOT NULL,
    country_of_issue VARCHAR(3) NOT NULL,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    full_name VARCHAR(255), -- Como aparece en pasaporte
    file_url_encrypted TEXT, -- URL del scan
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visas (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER REFERENCES travelers(id),
    visa_type VARCHAR(50),
    country VARCHAR(3) NOT NULL,
    visa_number_encrypted TEXT,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url_encrypted TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE identification_documents (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER REFERENCES travelers(id),
    document_type VARCHAR(50), -- 'ine', 'license', 'cedula'
    document_number_encrypted TEXT,
    issue_date DATE,
    expiry_date DATE,
    file_url_encrypted TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de acceso (auditoría)
CREATE TABLE document_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_type VARCHAR(50),
    document_id INTEGER,
    action VARCHAR(50), -- 'view', 'download', 'upload', 'delete'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Servicios Recomendados:**

**Almacenamiento:**
- **Vercel Blob** (gratis hasta 1GB)
- **Cloudflare R2** ($0.015/GB/mes, sin costos de salida)
- **AWS S3** ($0.023/GB/mes + egress)

**OCR (Opcional):**
- **Google Cloud Vision API**
- **AWS Textract**
- **Microsoft Azure Computer Vision**

### **Implementación:**

```typescript
// src/lib/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decrypt(encrypted: string): string {
  const parts = encrypted.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encryptedText = parts[2]
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

---

# 📊 RESUMEN ARQUITECTURA COMPLETA

## Stack Tecnológico Final:

**Frontend:**
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui

**Backend:**
- Next.js API Routes
- JWT Authentication
- Multi-tenancy middleware

**Base de Datos:**
- PostgreSQL (Neon)
- 20+ tablas
- Encriptación de datos sensibles

**Almacenamiento:**
- Vercel Blob / Cloudflare R2 (documentos)

**Notificaciones:**
- SendGrid (Email)
- Twilio (SMS + WhatsApp)

**Integraciones:**
- Exchange Rate API (multi-moneda)
- Payment Gateway (Stripe/PayPal)
- OCR para documentos

**Seguridad:**
- AES-256 encryption
- HTTPS everywhere
- Signed URLs
- Audit logs
- GDPR compliance

---

# ✅ VALIDACIÓN FINAL

## Lo que especificaste está ✅ CORRECTO:

1. ✅ Multi-moneda con tipo de cambio
2. ✅ Multi-empresa (4 tipos de usuario)
3. ✅ Sistema de notificaciones multi-canal
4. ✅ Almacenamiento de documentos

## Mejoras aplicadas:

- ✅ Arquitectura de base de datos completa
- ✅ Seguridad y encriptación
- ✅ Workflows de aprobación
- ✅ Sistema de comisiones para agencias
- ✅ White-label completo
- ✅ Auditoría y compliance

---

# 📊 ESTADO DE IMPLEMENTACIÓN

## ✅ Funcionalidades IMPLEMENTADAS (No en spec original)

1. **Sistema de Roles y Seguridad** ✅
   - AuthService completo
   - Middleware JWT
   - Gestión de sesiones

2. **Cookie Consent GDPR** ✅
   - Banner configurableAPI de preferencias
   - Componente reutilizable

3. **Auto-guardado de Hoteles** ✅
   - Guardado inteligente desde APIs
   - Sistema de completitud de datos
   - Review workflow

4. **Paginación Inteligente** ✅
   - 15 vuelos total, 10 por página
   - Modal de detalles
   - Estado persistente

5. **Reportes y Exportación** ✅
   - PDFService
   - ExcelService
   - Vouchers profesionales

6. **Gráficas Financieras** ✅
   - Componente FinancialCharts
   - Recharts integration
   - Múltiples tipos de gráficas

7. **Facturación CFDI** ✅
   - FacturamaService
   - Timbrado automático
   - Gestión completa

8. **Notificaciones Email** ✅
   - NotificationService
   - SendGrid integration
   - Templates HTML

9. **Adaptadores de Proveedores** ✅
   - 4 adaptadores (Amadeus, Kiwi, Booking, Expedia)
   - 1000+ aerolíneas accesibles
   - 28M+ hoteles

---

## 🟡 Funcionalidades PARCIALMENTE implementadas

1. **Multi-tenancy** 🟡
   - ✅ Backend completo
   - ❌ Frontend context pendiente
   - ❌ White-label dinámico pendiente

2. **CRM** 🟡
   - ✅ Tablas de BD
   - ❌ Frontend pendiente
   - ❌ Pipeline de ventas pendiente

3. **Workflows de Aprobación** 🟡
   - ✅ Estructura de BD
   - ❌ Lógica de negocio pendiente
   - ❌ UI pendiente

4. **Sistema de Pagos** 🟡
   - ✅ Estructura preparada
   - ❌ Stripe integration pendiente
   - ❌ PayPal integration pendiente

---

## ❌ Funcionalidades PENDIENTES

1. **Almacenamiento de Documentos** ❌
   - Encriptación AES-256
   - Upload de pasaportes/visas
   - URLs firmadas
   - OCR automático

2. **Notificaciones Avanzadas** ❌
   - SMS (Twilio)
   - WhatsApp Business
   - Push notifications

3. **Panel Administrativo Completo** ❌
   - CRUD de promociones
   - Gestión de proveedores
   - Configuración de políticas

4. **Features Avanzadas** ❌
   - Sistema de puntos AS Club
   - Alertas de precio
   - Recomendaciones IA
   - Chatbot inteligente

5. **App Móvil** ❌
   - React Native setup
   - Diseño de pantallas
   - Integración APIs
   - Publicación stores

---

## 🎯 ROADMAP SUGERIDO

### **FASE A: Completar lo Iniciado** (2-3 semanas)
1. Integración de pagos (Stripe/PayPal)
2. White-label context frontend
3. Workflow de aprobación
4. Dashboard administrativo completo
5. Sistema de encriptación y documentos

### **FASE B: Features Avanzadas** (3-4 semanas)
6. CRM frontend completo
7. Chatbot con IA (OpenAI)
8. Reportes avanzados y BI
9. SMS y WhatsApp
10. Sistema de puntos AS Club

### **FASE C: Optimización** (2 semanas)
11. Testing completo (unit + e2e)
12. Performance optimization
13. Security audit
14. Documentación de usuario
15. Deployment a producción

### **FASE D: Expansión** (4+ semanas)
16. OCR de documentos
17. Alertas de precio
18. App móvil React Native
19. Integraciones BI avanzadas
20. Nuevos proveedores

---

## 📈 RESUMEN EJECUTIVO

| Categoría | % Completado |
|-----------|--------------|
| **Backend APIs** | 44% |
| **Servicios** | 60% |
| **Adaptadores** | 80% |
| **Frontend** | 40% |
| **Integraciones** | 33% |
| **BD Schema** | 100% |
| **TOTAL GENERAL** | **55%** |

### **Lo que funciona HOY:**
- ✅ Búsqueda real de vuelos y hoteles
- ✅ Multi-moneda automática
- ✅ Autenticación y roles
- ✅ Facturación CFDI
- ✅ Reportes y exportación
- ✅ Emails transaccionales

### **Lo que falta para MVP:**
- ❌ Integración de pagos
- ❌ Panel admin completo
- ❌ Documentos encriptados
- ❌ Notificaciones SMS/WhatsApp

### **Lo que falta para Producción Completa:**
- ❌ Testing exhaustivo
- ❌ Monitoring y logs
- ❌ Backup automático
- ❌ Security hardening
- ❌ Documentación completa

---

**CONCLUSIÓN:**
El sistema tiene **bases sólidas (55%)** con arquitectura escalable. Las funcionalidades core están implementadas y funcionando. Lo que falta son principalmente features avanzadas y pulido del frontend.

La plataforma está lista para continuar desarrollo incremental hacia producción.

---

**Última actualización de este documento:** 14 de Diciembre de 2025
