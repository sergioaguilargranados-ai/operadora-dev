# 🎯 CONTEXTO COMPLETO PARA NUEVO CHAT

**Fecha:** 18 de Diciembre de 2025 - 04:50 CST
**Versión Actual:** v2.121
**Estado:** Sistema 98% completo y funcional

---

## ⚠️ REGLAS CRÍTICAS PARA EL AGENTE

### **REGLA #1: DIRECTORIO ÚNICO** 🔴
```
✅ SIEMPRE trabajar en: operadora-dev/
❌ NUNCA crear archivos en: /home/project/ (raíz)
❌ NUNCA crear archivos fuera de operadora-dev/
```

**Verificar antes de CADA operación:**
```bash
pwd  # Debe mostrar: /home/project/operadora-dev
```

### **REGLA #2: ESTRUCTURA DEL PROYECTO** 📁
```
/home/project/
└── operadora-dev/          ← ÚNICO DIRECTORIO DE TRABAJO
    ├── src/                ← Código fuente
    ├── public/             ← Assets públicos
    ├── database/           ← Migraciones SQL
    ├── .same/              ← Documentación del proyecto
    ├── package.json        ← Dependencias
    ├── .env.local          ← Variables de entorno
    └── README.md           ← Docs principales
```

### **REGLA #3: UNA SOLA BASE DE DATOS** 🗄️
```
✅ Neon PostgreSQL (ep-green-sky-afxrsbva...)
✅ Compartida: Same local + Vercel producción
❌ NO hay BD local
❌ NO hay BD de desarrollo separada
```

### **REGLA #4: VERSIONAMIENTO** 📊
```
Formato: v2.XXX
Actual: v2.121

Actualizar en cada cambio:
- src/app/page.tsx (comentario línea 3 y footer)
- README.md (header)
- .same/CONTEXTO-PROYECTO-MASTER.md
- .same/todos.md
```

### **REGLA #5: DOCUMENTACIÓN OBLIGATORIA** 📝

**5 documentos SIEMPRE actualizar:**
1. `README.md` - Contexto general del proyecto
2. `.same/CONTEXTO-PROYECTO-MASTER.md` - Memoria completa
3. `.same/todos.md` - Changelog y tareas
4. `.same/PROGRESO-DESARROLLO-ACTUALIZADO.md` - Progreso %
5. `.same/ESPECIFICACION-COMPLETA.md` - Specs técnicas (si aplica)

**Header obligatorio:**
```markdown
**Última actualización:** 18 de Diciembre de 2025 - HH:MM CST
**Versión:** v2.XXX
**Actualizado por:** AI Assistant
```

**Comando para obtener fecha CST:**
```bash
TZ='America/Mexico_City' date '+%d de %B de %Y - %H:%M CST'
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### **Progreso General: 98%**

| Módulo | Estado | % | Archivos Clave |
|--------|--------|---|----------------|
| **Homepage Dinámica** | ✅ Completo | 100% | `src/app/page.tsx` (1044 líneas) |
| **Panel Admin Content** | ✅ Completo | 100% | `src/app/admin/content/page.tsx` (19K) |
| **Sistema de Roles** | ✅ Completo | 100% | Columna `role` en users |
| **Reservas** | ✅ Completo | 100% | `src/app/reserva/[id]/page.tsx` (21K) |
| **Pagos Stripe/PayPal** | ✅ Completo | 95% | `src/app/checkout/[bookingId]/page.tsx` (12K) |
| **Facturación** | 🚧 Config | 90% | `src/app/dashboard/payments/page.tsx` (479 líneas) |
| **Dashboard Corporativo** | ✅ Completo | 100% | `src/app/dashboard/corporate/page.tsx` |
| **Dashboard Financiero** | ✅ Completo | 100% | `src/app/dashboard/page.tsx` (707 líneas) |
| **Itinerarios** | ❌ Pendiente | 0% | No existe |
| **Chatbot Web** | 🚧 Básico | 10% | `src/app/chatbot/page.tsx` (889 bytes) |
| **Chatbot WhatsApp** | ❌ Pendiente | 0% | No existe |

---

## 🗄️ BASE DE DATOS (NEON POSTGRESQL)

### **Conexión**
```
Host: ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
SSL: Required
```

### **Tablas Importantes** (Total: 40+)

#### **Usuarios y Autenticación:**
- `users` - 24 usuarios (con columna `role`)
- `tenants` - Multi-tenant para corporativos

#### **Reservas y Pagos:**
- `bookings` - 90 reservas de prueba
- `payment_transactions` - Registro de pagos
- `invoices` - Facturas (en configuración)
- `accounts_payable` - Cuentas por pagar
- `accounts_receivable` - Cuentas por cobrar

#### **Homepage Dinámico (8 tablas):**
- `featured_hero` - Banner principal (2 registros)
- `promotions` - Ofertas especiales (3 registros)
- `flight_destinations` - Destinos de vuelos (8 registros)
- `accommodation_favorites` - Hospedajes favoritos (6)
- `weekend_deals` - Ofertas fin de semana (8)
- `featured_packages` - Paquetes vacacionales (6)
- `unique_stays` - Hospedajes únicos (12)
- `explore_destinations` - Destinos populares (12)

#### **Corporativo:**
- `corporate_employees` - Empleados
- `cost_centers` - Centros de costo
- `travel_policies` - Políticas de viaje
- `approvals` - Aprobaciones de viajes

### **Migraciones SQL**
```
database/migrations/
├── 001_usuarios_roles_seguridad.sql
├── 002_cost_centers.sql
├── 003_payment_transactions.sql
├── 004_documents.sql
├── 005_promotions_system.sql
├── 006_insert_users.sql
├── 007_homepage_content.sql ← Contenido dinámico
└── 008_add_role_to_users.sql ← Roles ADMIN/MANAGER
```

---

## 👥 USUARIOS DE PRUEBA

**Contraseña para TODOS:** `Password123!`

| Email | Rol | Para Probar |
|-------|-----|-------------|
| `superadmin@asoperadora.com` | SUPER_ADMIN | Acceso total |
| `admin@asoperadora.com` | ADMIN | Panel admin completo |
| `manager@empresa.com` | MANAGER | Aprobaciones + Reportes |
| `empleado@empresa.com` | EMPLOYEE | Mis reservas |

---

## 🌐 URLS Y ACCESOS

### **URLs de Producción:**
```
Homepage: https://app.asoperadora.com
GitHub: https://github.com/sergioaguilargranados-ai/operadora-dev
```

### **URLs Locales (Same):**
```
Dev Server: http://localhost:3000
```

### **Páginas Principales:**

**Públicas:**
- `/` - Homepage con contenido dinámico
- `/login` - Login con roles
- `/registro` - Registro de usuarios
- `/resultados` - Resultados de búsqueda
- `/hospedaje/[id]` - Detalle de hospedaje
- `/paquete/[id]` - Detalle de paquete

**Usuario Autenticado:**
- `/perfil` - Mi perfil
- `/mis-reservas` - Mis reservas
- `/reserva/[id]` - Detalle de reserva
- `/checkout/[bookingId]` - Pago de reserva

**Admin/Manager (roles requeridos):**
- `/admin/content` - Gestión de contenido homepage
- `/dashboard/corporate` - Dashboard corporativo
- `/dashboard` - Dashboard financiero
- `/dashboard/payments` - Facturación y pagos
- `/approvals` - Aprobaciones de viajes

---

## 🔌 INTEGRACIONES

### **1. SAME → GitHub**
```
✅ Integración activa
✅ Push automático configurado
✅ Branch: main
✅ NO usar git commands manuales
✅ Usar herramientas de SAME
```

### **2. GitHub → Vercel**
```
✅ Deploy automático al hacer push
✅ Tiempo: 2-3 minutos
✅ URL: app.asoperadora.com
✅ NO deploy manual necesario
```

### **3. Vercel → Neon (BD)**
```
✅ Variables de entorno configuradas
✅ DATABASE_URL sincronizado
✅ Misma BD que Same local
```

### **Flujo Completo:**
```
Same (código) → Push GitHub → Deploy Vercel → Producción
       ↓                                           ↓
   Neon BD ←──────────────────────────────────────┘
```

---

## 📦 TECNOLOGÍAS Y VERSIONES

```json
{
  "framework": "Next.js 15.5.7",
  "runtime": "Bun",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui": "shadcn/ui",
  "database": "PostgreSQL (Neon)",
  "payments": "Stripe + PayPal",
  "auth": "Custom (bcryptjs)",
  "api": "Next.js API Routes"
}
```

---

## 🛠️ COMANDOS IMPORTANTES

### **Desarrollo:**
```bash
cd operadora-dev
bun install              # Instalar dependencias
bun dev                  # Iniciar servidor (port 3000)
```

### **Git:**
```bash
cd operadora-dev
git status               # Ver cambios
git add .                # Agregar todos
git commit -m "mensaje"  # Commit
git push origin main     # Push (usar integración SAME mejor)
```

### **Base de Datos:**
```bash
cd operadora-dev
bun run check-db-info.js       # Ver info de BD
bun run list-all-users.js      # Listar usuarios
```

### **Verificaciones:**
```bash
pwd                      # Verificar directorio actual
ls -la                   # Ver archivos
wc -l src/app/page.tsx   # Verificar archivo no vacío
```

---

## 📋 FLUJO DE TRABAJO CORRECTO

### **1. Antes de Empezar:**
```bash
cd operadora-dev         # ⚠️ CRÍTICO
pwd                      # Verificar: /home/project/operadora-dev
git status               # Ver estado
```

### **2. Hacer Cambios:**
```
- Editar archivos EN operadora-dev/
- Probar localmente (bun dev)
- Verificar que funciona
```

### **3. Documentar:**
```
- Actualizar 5 docs obligatorios
- Actualizar versión en page.tsx
- Actualizar README.md
- Actualizar todos.md
```

### **4. Versionar:**
```
- Crear versión con tool versioning
- Tomar screenshot
- Verificar que se ve bien
```

### **5. Subir a GitHub:**
```
- git add .
- git commit con mensaje descriptivo
- git push origin main
- Esperar deploy (2-3 min)
- Verificar en app.asoperadora.com
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### **Problema 1: Archivos Fuera de Lugar**
```bash
# ❌ MAL - archivos en raíz
/home/project/src/
/home/project/package.json

# ✅ BIEN - archivos en operadora-dev
/home/project/operadora-dev/src/
/home/project/operadora-dev/package.json
```

**Solución:**
```bash
cd operadora-dev  # SIEMPRE empezar aquí
```

### **Problema 2: Archivo Vacío (0 bytes)**
```bash
# Verificar tamaño
ls -lh src/app/page.tsx

# Si es 0 bytes, restaurar desde git
git show HEAD:src/app/page.tsx > src/app/page.tsx
```

### **Problema 3: BD No Conecta**
```bash
# Verificar variable
cat .env.local | grep DATABASE_URL

# Debe contener: ep-green-sky-afxrsbva
```

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

### **Opción A: Completar Facturación** ⏰ 2-3 horas
- Agregar datos de ejemplo
- Probar crear factura desde reserva
- Generar PDF
- Enviar por email

### **Opción B: Creador de Itinerarios** ⏰ 2-3 días
- Diseñar tabla BD
- Interfaz de creación
- Editor día por día
- Exportar PDF

### **Opción C: Chatbot Web con IA** ⏰ 2-3 días
- Widget flotante
- Integrar OpenAI/Claude
- Respuestas contextuales
- Buscar desde chat

### **Opción D: Chatbot WhatsApp** ⏰ 3-4 días
- Configurar Twilio
- Webhook para mensajes
- Procesamiento IA
- Crear reservas vía WhatsApp

---

## 📚 DOCUMENTOS DE REFERENCIA

**Leer en orden de importancia:**

1. **CONTEXTO-PROYECTO-MASTER.md** ⭐⭐⭐⭐⭐
   - Memoria completa del proyecto
   - Accesos y credenciales
   - Comandos importantes

2. **SISTEMA-DOCUMENTACION.md** ⭐⭐⭐⭐⭐
   - Convenciones de documentación
   - Estilo de comunicación
   - Sistema de versionamiento

3. **ESTADO-DEL-PROYECTO.md** ⭐⭐⭐⭐
   - Clarificación de ambiente
   - Qué usar y qué no

4. **PROGRESO-DESARROLLO-ACTUALIZADO.md** ⭐⭐⭐⭐
   - % de progreso por módulo
   - Hitos alcanzados

5. **MODULOS-RESERVA-PAGOS-ITINERARIOS.md** ⭐⭐⭐
   - Estado de módulos clave
   - Plan de implementación

6. **todos.md** ⭐⭐⭐
   - Changelog de versiones
   - Tareas pendientes

---

## ✅ CHECKLIST ANTES DE CADA OPERACIÓN

```
[ ] Estoy en /home/project/operadora-dev (verificar con pwd)
[ ] El archivo que voy a editar existe y no está vacío
[ ] Sé qué versión actual tengo (v2.121)
[ ] Tengo claro qué documentos debo actualizar
[ ] Sé dónde se desplegará el cambio (app.asoperadora.com)
```

---

## 🎯 RESUMEN EJECUTIVO

**Lo MÁS Importante:**
1. ✅ Trabajar SOLO en `operadora-dev/`
2. ✅ Una sola BD: Neon (compartida)
3. ✅ Versión actual: v2.121
4. ✅ Actualizar 5 docs obligatorios
5. ✅ Push a GitHub → Deploy automático
6. ✅ Verificar en app.asoperadora.com

**Lo que NO hacer:**
1. ❌ Crear archivos en /home/project/ (raíz)
2. ❌ Git commands manuales (usar SAME)
3. ❌ Deploy manual a Vercel
4. ❌ BD local

---

**Documento creado:** 18 de Diciembre de 2025 - 04:50 CST
**Para:** Nuevo chat en Same
**Versión actual del proyecto:** v2.121
**Estado:** ✅ Listo para continuar desarrollo
