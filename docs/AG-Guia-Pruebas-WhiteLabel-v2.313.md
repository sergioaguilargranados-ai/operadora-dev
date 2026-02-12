# 🧪 Guía de Pruebas — White-Label v2.313

**Fecha:** 11 de Febrero de 2026  
**Versión:** v2.313  
**Ambiente de pruebas:** Vercel (producción) + localhost (desarrollo)  
**Repositorio:** `https://github.com/sergioaguilargranados-ai/operadora-dev.git`

---

## 📋 ÍNDICE

1. [Pre-requisitos](#1-pre-requisitos)
2. [PRUEBA 1: Gestión de Tenants (Admin)](#prueba-1)
3. [PRUEBA 2: Gestión de Usuarios por Tenant](#prueba-2)
4. [PRUEBA 3: White-Label Rendering (Marca Blanca)](#prueba-3)
5. [PRUEBA 4: Markup de Precios (OBS-006)](#prueba-4)
6. [PRUEBA 5: Onboarding de Agencias (OBS-010)](#prueba-5)
7. [PRUEBA 6: Referral Auto-Vinculación](#prueba-6)
8. [PRUEBA 7: Emails con Branding (OBS-007)](#prueba-7)
9. [PRUEBA 8: Edge Middleware Cache (OBS-002)](#prueba-8)
10. [PRUEBA 9: BrandMeta - Favicon/Title Dinámico (OBS-009)](#prueba-9)
11. [Checklist General](#checklist)
12. [Reporte de Bugs](#reporte-bugs)

---

## 1. Pre-requisitos {#1-pre-requisitos}

### ⚠️ Migraciones de BD pendientes
Antes de probar, ejecutar estas migraciones en la base de datos PostgreSQL (Neon):

```sql
-- Migración 032: Campos de markup en white_label_config
ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_fixed DECIMAL(10,2) DEFAULT 0;
ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_type VARCHAR(20) DEFAULT 'percentage' CHECK (markup_type IN ('percentage', 'fixed', 'both'));
```

```sql
-- Migración 033: Tabla de solicitudes de agencias
CREATE TABLE IF NOT EXISTS agency_applications (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  website VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'México',
  employees_count VARCHAR(50),
  monthly_sales_volume VARCHAR(100),
  services_interested TEXT[],
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','reviewing','approved','rejected')),
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agency_applications_status ON agency_applications(status);
CREATE INDEX IF NOT EXISTS idx_agency_applications_email ON agency_applications(contact_email);
```

### Cuentas necesarias
- **SUPER_ADMIN o ADMIN**: Para acceder a `/admin/tenants`
- **Usuario normal**: Para probar el registro con referral
- **Tenant existente**: Al menos un tenant tipo "agency" con configuración white-label

---

## PRUEBA 1: Gestión de Tenants (Admin) {#prueba-1}

### Objetivo
Verificar que se pueden crear, editar, y ver tenants desde el panel de administración.

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 1.1 | Ir a `/admin/tenants` | Se muestra la página con header, stats y lista de tenants | | |
| 1.2 | Verificar las tarjetas de estadísticas | Se ven: Total, Agencias, Corporativos, Activos | | |
| 1.3 | Clic en **"Nuevo Tenant"** | Se abre modal con tabs: General, Branding, White-Label | | |
| 1.4 | Llenar datos de agencia de prueba: | | | |
| | - Tipo: Agencia | | | |
| | - Nombre: "Agencia Test QA" | | | |
| | - Email: test@agencia.com | | | |
| | - Plan: Profesional | | | |
| 1.5 | Tab **Branding**: Cambiar colores | Se ve vista previa del header con los colores elegidos | | |
| 1.6 | Tab **White-Label**: Agregar slogan + footer | Campos se guardan | | |
| 1.7 | Clic **"Crear Tenant"** | Mensaje "Tenant creado ✅", aparece en la lista | | |
| 1.8 | Clic **"Editar"** en el nuevo tenant | Modal se abre con los datos pre-cargados | | |
| 1.9 | Modificar email y guardar | Mensaje "Tenant actualizado ✅" | | |
| 1.10 | Usar buscador para filtrar | Solo aparecen tenants que coinciden | | |
| 1.11 | Filtrar por "Agencias" / "Corporativos" | Se filtran correctamente | | |
| 1.12 | Clic **"Desactivar"** en un tenant | Confirmación → tenant aparece con badge "Inactivo" | | |

---

## PRUEBA 2: Gestión de Usuarios por Tenant {#prueba-2}

### Objetivo
Verificar que se pueden agregar y quitar usuarios de un tenant.

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 2.1 | En `/admin/tenants`, clic botón **"Usuarios"** en un tenant | Se abre modal de gestión de usuarios | | |
| 2.2 | Verificar header del modal | Muestra nombre del tenant y conteo de usuarios | | |
| 2.3 | En el buscador, escribir el email de un usuario existente | Aparecen resultados con nombre y email | | |
| 2.4 | Seleccionar rol **"Agente"** en el dropdown | El dropdown muestra las opciones correctas | | |
| 2.5 | Clic **"Agregar"** en un resultado de búsqueda | Mensaje "Usuario agregado ✅", aparece en la lista de abajo | | |
| 2.6 | Verificar que el usuario aparece en la lista | Muestra avatar, nombre, email, y badge de rol | | |
| 2.7 | Intentar agregar el mismo usuario otra vez | Mensaje de error "Ya pertenece al tenant" | | |
| 2.8 | Clic icono rojo (🔴) para quitar un usuario | Confirmación → usuario desaparece de la lista | | |
| 2.9 | Buscar un email que no existe | Mensaje "No se encontraron usuarios" | | |
| 2.10 | Cerrar modal y volver a abrirlo | Lista se recarga correctamente | | |

### Datos de prueba sugeridos
- Usar emails de usuarios ya registrados en el sistema
- Probar con diferentes roles: AGENT, AGENCY_ADMIN, CLIENT

---

## PRUEBA 3: White-Label Rendering (Marca Blanca) {#prueba-3}

### Objetivo
Verificar que la marca blanca se aplica correctamente cuando se accede como tenant.

### Cómo probar en localhost
```
http://localhost:3000/?tenant=SUBDOMINIO_DEL_TENANT
```
Ejemplo: Si el tenant tiene subdominio `mmta`:
```
http://localhost:3000/?tenant=mmta
```

### Cómo probar en Vercel
Acceder desde el subdominio configurado del tenant (ej: `mmta.app.asoperadora.com`)

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 3.1 | Acceder con `?tenant=SUBDOMINIO` | La página carga sin errores | | |
| 3.2 | Verificar **colores del header** | Usa el color primario del tenant, no el azul de AS Operadora | | |
| 3.3 | Verificar **logo** | Si el tenant tiene logo_url, se muestra su logo | | |
| 3.4 | Verificar **footer** | Muestra el texto del footer del tenant + "Powered by AS Operadora" | | |
| 3.5 | Verificar **colores de botones** | Los botones usan los colores del tenant | | |
| 3.6 | Verificar **UserMenu** | El avatar usa el color primario del tenant | | |
| 3.7 | Verificar **ChatWidget** | Usa colores del tenant | | |
| 3.8 | Verificar **WhatsAppWidget** | Funciona normalmente | | |
| 3.9 | Navegar a otras páginas | Los colores se mantienen consistentes | | |
| 3.10 | Abrir DevTools → Elements | Las CSS variables `--brand-primary`, `--brand-secondary` tienen los valores del tenant | | |

---

## PRUEBA 4: Markup de Precios (OBS-006) {#prueba-4}

### Objetivo
Verificar que los precios se ajustan según el markup configurado del tenant.

### Pre-requisito
Configurar markup en la base de datos para un tenant:
```sql
UPDATE white_label_config 
SET markup_percentage = 15, markup_type = 'percentage' 
WHERE tenant_id = [ID_DEL_TENANT];
```

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 4.1 | Acceder con `?tenant=SUBDOMINIO` con markup configurado | Precio base debería incrementarse | | |
| 4.2 | Verificar en consola del browser | `WhiteLabelContext` expone `applyMarkup(precio)` | | |
| 4.3 | En consola: Verificar que `applyMarkup(1000)` = `1150` (con 15%) | El cálculo es correcto | | |
| 4.4 | Probar con `markup_type = 'fixed'` y `markup_fixed = 200` | `applyMarkup(1000)` = `1200` | | |
| 4.5 | Probar con `markup_type = 'both'` (15% + $200) | `applyMarkup(1000)` = `1350` | | |
| 4.6 | Sin tenant (AS Operadora directo) | `applyMarkup(1000)` = `1000` (sin cambio) | | |

### ⚠️ Nota
El markup se aplica en el frontend via el contexto. Las páginas que muestren precios deberían llamar `applyMarkup(precioBase)`. Si los precios no cambian visualmente, es porque los componentes de precio aún no integran la función (pendiente para siguiente sprint).

---

## PRUEBA 5: Onboarding de Agencias (OBS-010) {#prueba-5}

### Objetivo
Verificar que el formulario público de solicitud de agencia funciona.

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 5.1 | Ir a `/agencia/registro` | Se muestra la página con sección de beneficios + formulario | | |
| 5.2 | Verificar diseño visual | Página estilizada con gradientes, iconos, colores premium | | |
| 5.3 | Intentar enviar formulario vacío | Validación: campos requeridos marcados en rojo | | |
| 5.4 | Llenar formulario con datos de prueba: | | | |
| | - Nombre empresa: "Travel Test Agency" | | | |
| | - Nombre contacto: "Juan Pérez" | | | |
| | - Email: "juan@traveltest.com" | | | |
| | - Teléfono: "+52 722 123 4567" | | | |
| | - Ciudad: "Toluca" | | | |
| | - Estado: "Estado de México" | | | |
| | - Servicios: seleccionar varios | | | |
| 5.5 | Clic **"Enviar Solicitud"** | Mensaje de éxito: "¡Solicitud enviada!" | | |
| 5.6 | Verificar en BD: `SELECT * FROM agency_applications ORDER BY id DESC LIMIT 1` | Registro creado con status = 'pending' | | |
| 5.7 | Admin: `GET /api/agency-onboarding` | Lista de solicitudes con la nueva | | |
| 5.8 | Intentar enviar con el mismo email | Error: "Ya existe una solicitud pendiente" | | |

---

## PRUEBA 6: Referral Auto-Vinculación {#prueba-6}

### Objetivo
Verificar que un usuario que se registra por referral queda vinculado automáticamente al agente y tenant.

### Pre-requisitos
- Un agente con código de referral (verificar en `users` tabla, columna `referral_code`)
- El agente debe pertenecer a un tenant

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 6.1 | Navegar a `/?r=CODIGO_REFERRAL` | La URL carga normalmente | | |
| 6.2 | Verificar cookie `as_referral` en DevTools → Application → Cookies | Cookie existe con el código de referral, 30 días TTL | | |
| 6.3 | Registrar un nuevo usuario desde esa sesión | Registro exitoso | | |
| 6.4 | Verificar en BD: `SELECT * FROM referral_conversions ORDER BY id DESC LIMIT 1` | Registro con el agent_id correcto | | |
| 6.5 | Verificar en BD: `SELECT * FROM tenant_users WHERE user_id = [NUEVO_USER_ID]` | El usuario está vinculado al tenant del agente como 'client' | | |
| 6.6 | Registrar sin cookie de referral | No se crean registros en referral_conversions ni tenant_users | | |

---

## PRUEBA 7: Emails con Branding (OBS-007) {#prueba-7}

### Objetivo
Verificar que los emails enviados usan el branding del tenant.

### ⚠️ Nota importante
Esta prueba requiere que se dispare un evento que envíe email (reserva confirmada, factura, etc.). Si no se puede probar end-to-end, verificar la lógica vía API:

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 7.1 | Verificar que `NotificationService.ts` tiene `getTenantBranding()` | Método existe y consulta `tenants` + `white_label_config` | | |
| 7.2 | Verificar que `brandedEmailWrapper()` genera HTML con logo/colores | Template incluye logo, color primario, footer | | |
| 7.3 | Verificar que `sendBookingConfirmation()` acepta `tenantId` | El parámetro es opcional | | |
| 7.4 | Si es posible: disparar un booking para un cliente de un tenant | El email debe llegar con los colores y logo del tenant | | |
| 7.5 | Si es posible: verificar el email en inbox | Header con logo del tenant, colores correctos, footer personalizado | | |
| 7.6 | Sin tenantId: el email usa branding default de AS Operadora | Fallback funciona | | |

### Verificación manual del template
Puedes llamar la API de notificaciones directamente o revisar el código en `src/services/NotificationService.ts`:
- `getTenantBranding(tenantId)` → carga datos del tenant
- `brandedEmailWrapper(branding, contenido)` → genera HTML

---

## PRUEBA 8: Edge Middleware Cache (OBS-002) {#prueba-8}

### Objetivo
Verificar que el middleware pre-carga la config del tenant y la pasa por cookie.

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 8.1 | Acceder con `?tenant=SUBDOMINIO` | Página carga rápido | | |
| 8.2 | Verificar cookie `x-tenant-config` en DevTools → Cookies | Cookie existe con JSON de config del tenant | | |
| 8.3 | Verificar consola del browser | Log: "WhiteLabel: Config loaded from middleware cache" | | |
| 8.4 | Refrescar la página | No se hace fetch extra a `/api/tenant/detect` (se lee de cookie) | | |
| 8.5 | Esperar 5+ minutos y refrescar | El middleware hace un nuevo fetch (cache expirado) y actualiza la cookie | | |
| 8.6 | Verificar headers `x-tenant-host`, `x-tenant-subdomain` en Network tab | Headers presentes en las respuestas | | |

---

## PRUEBA 9: BrandMeta - Favicon/Title Dinámico (OBS-009) {#prueba-9}

### Objetivo
Verificar que el título, meta description y favicon cambian según el tenant.

### Pre-requisito
El tenant debe tener `meta_title` y `meta_description` configurados en `white_label_config`.

### Pasos

| # | Paso | Resultado Esperado | ✅/❌ | Notas |
|---|------|-------------------|:---:|-------|
| 9.1 | Acceder con `?tenant=SUBDOMINIO` | Página carga | | |
| 9.2 | Verificar título del tab del browser | Muestra el `meta_title` del tenant (no "AS Operadora") | | |
| 9.3 | View Source o DevTools → Elements → `<head>` | `<title>` tiene el valor del tenant | | |
| 9.4 | Verificar `<meta name="description">` | Tiene el `meta_description` del tenant | | |
| 9.5 | Si el tenant tiene `favicon_url`: verificar favicon | El favicon del browser cambia al del tenant | | |
| 9.6 | Sin tenant (acceso directo a AS Operadora) | Title = "AS Operadora", favicon default | | |

---

## ✅ Checklist General {#checklist}

### Funcionalidades Core

| # | Funcionalidad | Probada | Funciona | Notas |
|---|--------------|:-------:|:--------:|-------|
| 1 | Admin: CRUD de Tenants | | | |
| 2 | Admin: Gestión de Usuarios por Tenant | | | |
| 3 | White-Label: Colores dinámicos | | | |
| 4 | White-Label: Logo dinámico | | | |
| 5 | White-Label: Footer personalizado | | | |
| 6 | White-Label: Title/Favicon dinámico | | | |
| 7 | Markup de precios por agencia | | | |
| 8 | Onboarding: Formulario público | | | |
| 9 | Referral: Cookie persistente | | | |
| 10 | Referral: Auto-vinculación en registro | | | |
| 11 | Emails: Branding dinámico | | | |
| 12 | Middleware: Cache de tenant config | | | |

### URLs importantes para probar

| URL | Descripción |
|-----|-------------|
| `/admin/tenants` | Panel de gestión de tenants (requiere ADMIN) |
| `/agencia/registro` | Formulario público de onboarding |
| `/?tenant=mmta` | Simular white-label en localhost |
| `/?r=CODIGO` | Simular acceso por referral |
| `/api/tenant/detect?subdomain=mmta` | API de detección de tenant |
| `/api/agency-onboarding` | API de solicitudes de agencias (GET = listar) |
| `/api/tenants/[ID]/users` | API de usuarios del tenant |
| `/api/users/search?q=EMAIL` | API de búsqueda de usuarios |

---

## 🐛 Reporte de Bugs {#reporte-bugs}

Usar este formato para reportar bugs encontrados durante las pruebas:

```
### Bug #[número]
- **Prueba:** [número de prueba]
- **Paso:** [paso donde ocurrió]
- **Descripción:** [qué pasó]
- **Esperado:** [qué debería pasar]
- **Screenshot/Error:** [si aplica]
- **Prioridad:** Alta / Media / Baja
- **Estado:** Pendiente / En progreso / Resuelto
```

---

## 📝 Notas para el Tester

1. **Orden de pruebas**: Se recomienda seguir el orden numérico. Las pruebas 1 y 2 (admin) son necesarias antes de las pruebas 3-9.

2. **Tenant de prueba**: Si no existe un tenant, créalo primero en la Prueba 1 y agrégale usuarios en la Prueba 2.

3. **Migraciones**: Si ves errores de "tabla no existe" o "columna no existe", ejecutar las migraciones del pre-requisito.

4. **Consola del browser**: Muchos mensajes de debug se imprimen en la consola (`WhiteLabel:`, `Middleware:`). Mantenerla abierta durante las pruebas.

5. **Cache**: Si los cambios no se reflejan, limpiar cookies y cache del browser, o probar en ventana de incógnito.

---

*Documento generado el 11 de Febrero de 2026 — v2.313*
