# 🎯 CONTEXTO DEL PROYECTO - DOCUMENTO MAESTRO

**Última actualización:** 21 de December de 2025 - 17:44 CST
**Versión actual:** v2.152
**Actualizado por:** AI Assistant
**Propósito:** Memoria completa del proyecto para continuidad entre sesiones

---

## 🚀 ESTADO ACTUAL - v2.152

**✅ DEPLOY EXITOSO EN VERCEL**
- URL Producción: https://app.asoperadora.com
- Root Directory: `operadora-dev`
- Package Manager: npm (NO bun)
- Build: Exitoso ✅
- Último commit: d90bfa8 (v2.152 - Transfers + Activities completos)

**Estructura de Directorios:**
```
/home/project/
├── .git/
├── operadora-dev/          ← TODO EL CÓDIGO
│   ├── src/
│   ├── .same/
│   ├── package.json
│   ├── package-lock.json   ← npm
│   └── .npmrc              ← legacy-peer-deps=true
├── expedia-clone-BACKUP/   ← Backup (NO tocar)
└── uploads/
```

---

## 💬 COMUNICACIÓN CON EL USUARIO

**CRÍTICO:** Mantener comunicación **clara, cordial pero CONCRETA**.

### Estilo de respuesta:
```
✅ Respuestas cortas (1-5 líneas máximo)
✅ Estado visible (✅ ❌ ⏳)
✅ Solo detalles si se piden
❌ Evitar informes largos
❌ Evitar repetir contexto
❌ Evitar resúmenes innecesarios
```

### Ejemplo preferido:
```
3 archivos actualizados ✅
Versión v2.97
¿Siguiente?
```

**Ver más:** `.same/SISTEMA-DOCUMENTACION.md` sección "ESTILO DE COMUNICACIÓN"

---

## 📌 INFORMACIÓN CRÍTICA

### **Nombre del Proyecto**
**AS OPERADORA - Sistema de Gestión de Viajes Corporativos**

### **Cliente**
Sergio Aguilar Granados

### **Objetivo**
Sistema completo de gestión de viajes corporativos con búsqueda, reservas, aprobaciones, pagos, reportes y dashboard ejecutivo.

---

## 🗂️ ESTRUCTURA DE DIRECTORIOS

### **Directorio Principal**
```
/home/project/operadora-dev/
```

**IMPORTANTE:**
- ✅ **USAR SIEMPRE:** `/home/project/operadora-dev/`
- ❌ **NO USAR:** `/home/project/expedia-clone-BACKUP/` (es backup viejo)

### **Estructura Interna**
```
operadora-dev/
├── src/
│   ├── app/              # Páginas y APIs (Next.js App Router)
│   ├── components/       # Componentes UI (shadcn/ui)
│   ├── services/         # Lógica de negocio
│   ├── middleware/       # Seguridad (rate limiting, CORS)
│   ├── contexts/         # AuthContext, etc.
│   └── utils/           # Utilidades
├── .same/               # ⭐ DOCUMENTACIÓN DEL PROYECTO
├── migrations/          # Migraciones SQL
├── tests/               # Tests unitarios
├── .env.local          # Variables de entorno
├── package.json
└── README.md
```

---

## 🔐 ACCESOS Y CREDENCIALES

### **1. Base de Datos**

**Tipo:** PostgreSQL (Neon)
**Ambiente:** Producción (compartido dev y staging)
**Conexión:**
```
Host: ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
```

**DATABASE_URL (en `.env.local`):**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_QgZmnHAIUf67@ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**IMPORTANTE:**
- Solo hay UNA base de datos (Neon)
- Se usa tanto en desarrollo local como en Vercel
- NO hay BD local separada

### **2. Usuarios del Sistema**

**Contraseña para TODOS:** `Password123!`

| Email | Rol | Uso |
|-------|-----|-----|
| superadmin@asoperadora.com | SUPER_ADMIN | Acceso total |
| admin@asoperadora.com | ADMIN | Dashboard corporativo |
| manager@empresa.com | MANAGER | Aprobaciones |
| maria.garcia@empresa.com | MANAGER | Otro manager |
| empleado@empresa.com | EMPLOYEE | Mis reservas |
| juan.perez@empresa.com | EMPLOYEE | Otro empleado |

**Estado:** ✅ Todos verificados en BD
**Hash bcrypt:** `$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky`

### **3. Secrets y Variables**

**JWT_SECRET:**
```
zGYVpk6wYzyRl4hfqgS3hrqP81v0V0nB6g6MeE2SsBg=
```

**CRON_SECRET_KEY:**
```
dev_cron_secret_2025
```

**NODE_ENV:**
```
development
```

**Ver archivo completo:** `operadora-dev/.env.local`

### **4. URLs y Deployments**

**Producción (Vercel):**
```
https://app.asoperadora.com
```

**Desarrollo (Same):**
```
http://localhost:3000
```

**Repositorio:**
```
https://github.com/sergioaguilargranados-ai/operadora-dev
```

**Base de Datos:**
```
Host: ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech
Database: neondb
```

### **5. Integraciones SAME**

**CRITICAL: SAME tiene integraciones activas con:**

1. **GitHub** - Push automático desde SAME
   - ✅ Configurado
   - ✅ Repo: sergioaguilargranados-ai/operadora-dev
   - ✅ Branch: main

2. **Neon** - Base de datos PostgreSQL
   - ✅ Configurado
   - ✅ Acceso directo desde SAME y Vercel

3. **GitHub → Vercel** - Deploy automático
   - ✅ Cada push a GitHub dispara deploy en Vercel
   - ✅ Deploy en: app.asoperadora.com
   - ✅ NO se necesita deploy manual

**Flujo de trabajo:**
```
SAME (desarrollo)
  → Push a GitHub (integración SAME)
    → Deploy automático en Vercel
      → Live en app.asoperadora.com
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### **Versión Actual**
**v2.96** (17 Dic 2025, 11:36 CST)

### **Progreso General**
**98%** completo

### **Desglose por Módulo**

| Módulo | % | Estado |
|--------|---|--------|
| Backend (APIs) | 96% | ✅ 48/50 APIs |
| Frontend | 90% | ✅ 18/20 páginas |
| Sistema Corporativo | 100% | ✅ Completo |
| Pagos (Stripe/PayPal) | 90% | ✅ Funcional |
| Seguridad | 95% | ✅ Funcional |
| Testing | 20% | ⏳ Básico |
| Documentación | 100% | ✅ Completa |
| Ambiente | 100% | ✅ Consolidado |

### **Datos en Base de Datos**
- ✅ 6 usuarios (todos los roles)
- ✅ 10 empleados corporativos
- ✅ 6 reservas (vuelos, hoteles, paquetes)
- ✅ 4 aprobaciones (2 pendientes)
- ✅ 4 transacciones de pago
- ✅ 5 centros de costo
- ✅ 4 políticas de viaje

---

## 📝 DOCUMENTOS QUE DEBEN ACTUALIZARSE

### **⭐ SIEMPRE ACTUALIZAR ESTOS 5 DOCUMENTOS:**

#### **1. README.md** 📖 (CONTEXTO PRINCIPAL - GITHUB)
**Ubicación:** `operadora-dev/README.md`
**Importancia:** ⭐⭐⭐⭐⭐ CRÍTICO
**Cuándo:** EN CADA CAMBIO IMPORTANTE
**Por qué:** Es la cara del proyecto en GitHub y el primer documento que lee cualquiera

**Qué actualizar:**
- Fecha y hora (CST) en header
- Versión actual en badge (v2.XX) y header
- Descripción general del proyecto
- Instrucciones de instalación
- Variables de entorno nuevas
- Comandos importantes
- Arquitectura si cambia
- Estado y progreso del proyecto

**Formato de actualización:**
```markdown
# 🌎 AS OPERADORA - Sistema de Gestión de Viajes y Eventos

**Última actualización:** [Fecha] - [Hora] CST
**Versión:** v2.XX
**Actualizado por:** AI Assistant

![Version](https://img.shields.io/badge/version-2.XX-blue.svg)
```

#### **2. CONTEXTO-PROYECTO-MASTER.md** 🎯 (MEMORIA INTERNA)
**Ubicación:** `.same/CONTEXTO-PROYECTO-MASTER.md` (este documento)
**Importancia:** ⭐⭐⭐⭐⭐ CRÍTICO
**Cuándo:** Al final de CADA sesión de cambios
**Por qué:** Memoria completa para continuidad entre sesiones y agentes

**Qué actualizar:**
- Fecha y hora (CST)
- Versión actual
- Progreso del proyecto (%)
- Cambios críticos en accesos/BD
- Estado de módulos
- Comandos importantes
- Datos actualizados

**Formato de actualización:**
```markdown
**Última actualización:** [Fecha] - [Hora] CST
**Versión actual:** v2.XX
**Actualizado por:** AI Assistant
```

#### **3. todos.md** ✅ (CHANGELOG Y PENDIENTES)
**Ubicación:** `.same/todos.md`
**Importancia:** ⭐⭐⭐⭐
**Cuándo:** EN CADA CAMBIO (tareas, hitos, versiones)
**Por qué:** Changelog del proyecto y lista de pendientes

**Qué actualizar:**
- Fecha y hora (CST)
- Versión actual
- Changelog de cada versión (qué se hizo)
- Tareas completadas (marcar con ✅)
- Tareas pendientes actualizar)
- Hitos alcanzados
- Próximos pasos

#### **4. PROGRESO-DESARROLLO-ACTUALIZADO.md** 📊 (TRACKING)
**Ubicación:** `.same/PROGRESO-DESARROLLO-ACTUALIZADO.md`
**Importancia:** ⭐⭐⭐⭐
**Cuándo:** Cada versión nueva (v2.XX) o cambio importante
**Por qué:** Tracking detallado de progreso y métricas

**Qué actualizar:**
- Fecha y hora (CST)
- Versión actual
- Tabla de progreso por módulo (%)
- Nuevas funcionalidades implementadas
- APIs agregadas
- Componentes nuevos
- Hitos alcanzados

#### **5. ESPECIFICACION-COMPLETA.md** 📋 (SPECS TÉCNICAS)
**Ubicación:** `.same/ESPECIFICACION-COMPLETA.md`
**Importancia:** ⭐⭐⭐
**Cuándo:** Nuevas features o cambios en especificaciones
**Por qué:** Documentación técnica detallada del sistema

**Qué actualizar:**
- Fecha y hora (CST)
- Versión actual
- Nuevas funcionalidades
- Cambios en flujos de negocio
- APIs documentadas
- Reglas de negocio
- Diagramas si cambian

---

## 🔄 CONVENCIONES DE VERSIONADO

### **Esquema de Versiones**

**Formato:** `v2.XX`

**Ejemplos:**
- v2.94 (actual)
- v2.94 (siguiente)
- v2.100 (si llegamos)

**NO usar:**
- ❌ v91, v92 (sin el 2.)
- ❌ v1.XX (ya pasamos de v1)
- ❌ v2.0.92 (sin tercer dígito)

### **Formato de Fecha y Hora**

**Zona horaria:** CST (Ciudad de México, America/Mexico_City, GMT-6)

**Formato de fecha:**
```
17 de Diciembre de 2025 - 10:26 CST
```

**En código (comentarios):**
```javascript
// Build: 17 Dic 2025 10:26 CST - v2.94 - Descripción
```

**En footer:**
```
v2.94 | Build: 17 Dic 2025, 10:26 CST | Estado
```

**Comando para obtener hora CST:**
```bash
TZ='America/Mexico_City' date '+%d de %B de %Y - %H:%M CST'
```

### **Changelog de Versiones**

**Ubicación:** Cada versión debe tener su entrada en `todos.md`

**Formato:**
```markdown
## 🎉 HITO: [Nombre del Hito] ✅

**Fecha:** 17 de Diciembre de 2025 - 10:26 CST
**Versión:** v2.94
**Estado:** ✅ [Estado]

### Cambios:
1. ✅ [Cambio 1]
2. ✅ [Cambio 2]
3. ✅ [Cambio 3]
```

---

## 🛠️ TECNOLOGÍAS Y STACK

### **Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

### **Backend**
- Next.js API Routes
- PostgreSQL (Neon)
- Bun (package manager y runtime)

### **Servicios Externos**
- Stripe (pagos)
- PayPal (pagos alternativos)
- Vercel Blob (almacenamiento)
- SendGrid (emails - configurado pero no usado aún)
- Amadeus (vuelos - API key pendiente)

### **Seguridad**
- JWT (autenticación)
- bcrypt (passwords)
- AES-256 (encriptación)
- Rate limiting
- CORS
- CSP headers

---

## 📂 ARCHIVOS CRÍTICOS

### **Configuración**
```
.env.local              # ⭐ Variables de entorno
package.json            # Dependencias
next.config.js          # Config de Next.js
tsconfig.json           # Config de TypeScript
tailwind.config.ts      # Config de Tailwind
```

### **Base de Datos**
```
migrations/
├── 001_initial_schema.sql
├── 002_cost_centers.sql
├── 003_payment_transactions.sql
└── 004_documents.sql

datos-prueba-completos.sql    # Script de datos de prueba
schema-basico.sql             # Schema simplificado
cargar-datos-prueba.js        # Script Node para cargar datos
```

### **Documentación Principal**
```
.same/
├── CONTEXTO-PROYECTO-MASTER.md      # ⭐ Este documento
├── PROGRESO-DESARROLLO-ACTUALIZADO.md
├── ESPECIFICACION-COMPLETA.md
├── todos.md                          # Tareas y changelog
├── LISTO-PARA-PROBAR-v2.94.md
├── RESUMEN-CONSOLIDACION-v2.94.md
├── INSTRUCCIONES-PRUEBAS.md
├── GUIA-PRUEBAS-USUARIOS-ROLES.md
└── ESTADO-ACTUAL-v86.md

README.md
ESTADO-DEL-PROYECTO.md
```

---

## 🚀 COMANDOS IMPORTANTES

### **Desarrollo**
```bash
cd /home/project/operadora-dev
bun dev                    # Iniciar servidor (puerto 3000)
bun run build             # Build de producción
bun run lint              # Linter
```

### **Base de Datos**
```bash
# Cargar datos de prueba
bun run cargar-datos-prueba.js

# Conectar a BD directamente
psql $DATABASE_URL

# Verificar conexión
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL)"
```

### **Git**
```bash
git status
git add .
git commit -m "mensaje"
git push
```

**Repositorio:** https://github.com/sergioaguilargranados-ai/operadora-dev.git

---

## 🎯 FLUJO DE TRABAJO PARA NUEVOS CAMBIOS

### **1. Inicio de Sesión**
1. Leer este documento (`CONTEXTO-PROYECTO-MASTER.md`)
2. Verificar versión actual
3. Revisar `todos.md` para ver pendientes
4. Verificar que servidor esté corriendo

### **2. Durante Desarrollo**
1. Hacer cambios en código
2. Probar localmente
3. Correr linter si es necesario
4. Documentar cambios importantes

### **3. Al Finalizar Cambios**
1. Crear nueva versión con `versioning` tool
2. Actualizar **4 documentos obligatorios**:
   - CONTEXTO-PROYECTO-MASTER.md (este)
   - PROGRESO-DESARROLLO-ACTUALIZADO.md
   - README.md (si aplica)
   - ESPECIFICACION-COMPLETA.md (si aplica)
3. Actualizar `todos.md` con changelog
4. Actualizar footer en `src/app/page.tsx`
5. Commit a Git si es hito importante

### **4. Formato de Actualización**

**En TODOS los documentos actualizar el header:**
```markdown
**Última actualización:** 17 de Diciembre de 2025 - 10:26 CST
**Versión:** v2.94
**Actualizado por:** AI Assistant
```

---

## 📊 MÓDULOS DEL SISTEMA

### **1. Autenticación y Usuarios**
- ✅ Login/Registro
- ✅ JWT tokens
- ✅ 5 roles (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, GUEST)
- ✅ Multi-tenancy

**Archivos:**
- `src/services/AuthService.ts`
- `src/contexts/AuthContext.tsx`
- `src/app/api/auth/login/route.ts`

### **2. Dashboard Corporativo**
- ✅ Métricas en tiempo real
- ✅ Gráficas (Recharts)
- ✅ Exportación Excel/PDF
- ✅ Centro de costos
- ✅ Políticas de viaje

**Archivos:**
- `src/app/dashboard/corporate/page.tsx`
- `src/services/CorporateService.ts`

### **3. Gestión de Empleados**
- ✅ CRUD completo
- ✅ Import CSV masivo
- ✅ Exportación
- ✅ 10 empleados de prueba

**Archivos:**
- `src/app/dashboard/corporate/employees/page.tsx`
- `src/app/api/corporate/employees/route.ts`

### **4. Aprobaciones**
- ✅ Workflow multi-nivel
- ✅ 3 estados (pending, approved, rejected)
- ✅ Notificaciones automáticas
- ✅ 4 aprobaciones de prueba

**Archivos:**
- `src/app/approvals/page.tsx`
- `src/services/ApprovalService.ts`

### **5. Sistema de Pagos**
- ✅ Stripe integration
- ✅ PayPal integration
- ✅ Webhooks
- ✅ Dashboard de transacciones

**Archivos:**
- `src/services/StripeService.ts`
- `src/services/PayPalService.ts`
- `src/app/dashboard/payments/page.tsx`

### **6. Reportes**
- ✅ 3 tipos (Gastos, Empleados, Departamentos)
- ✅ Exportación Excel/PDF
- ✅ Filtros avanzados
- ✅ Gráficas interactivas

**Archivos:**
- `src/app/dashboard/corporate/reports/page.tsx`
- `src/app/api/corporate/reports/*/route.ts`

### **7. Búsqueda y Reservas**
- ✅ Búsqueda unificada (vuelos, hoteles)
- ✅ 6 reservas de prueba
- ✅ Estados: confirmed, pending, cancelled
- ✅ Validación de políticas

**Archivos:**
- `src/app/api/search/route.ts`
- `src/app/api/bookings/route.ts`
- `src/services/SearchService.ts`

### **8. Seguridad y Documentos**
- ✅ Encriptación AES-256
- ✅ URLs firmadas
- ✅ Upload a Vercel Blob
- ✅ Audit logs

**Archivos:**
- `src/services/EncryptionService.ts`
- `src/services/DocumentService.ts`

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### **Problema: "No puedo hacer login"**
**Solución:**
```bash
# Verificar que servidor esté corriendo
ps aux | grep "next dev"

# Reiniciar servidor
cd /home/project/operadora-dev
pkill -f "next dev"
bun dev
```

### **Problema: "No veo datos en dashboard"**
**Solución:**
```bash
# Recargar datos de prueba
cd /home/project/operadora-dev
bun run cargar-datos-prueba.js
```

### **Problema: "Error de conexión a BD"**
**Solución:**
```bash
# Verificar DATABASE_URL
cat .env.local | grep DATABASE_URL

# Debe mostrar: postgresql://neondb_owner:npg_...
```

### **Problema: "Archivo page.tsx vacío"**
**Solución:**
```bash
# Restaurar desde backup
cp /home/project/expedia-clone-BACKUP/src/app/page.tsx /home/project/operadora-dev/src/app/page.tsx
```

---

## 📈 PRÓXIMOS PASOS (Roadmap)

### **Corto Plazo (1-2 semanas)**
- [ ] Completar 2 páginas frontend (perfil, configuración) ✅ YA CREADAS
- [ ] Testing manual completo de todos los módulos
- [ ] Deploy a Vercel staging
- [ ] Configurar API keys de Amadeus

### **Mediano Plazo (3-4 semanas)**
- [ ] Testing automatizado (aumentar coverage a 80%)
- [ ] Optimizaciones de performance
- [ ] Deploy a producción
- [ ] Documentación de usuario final

### **Largo Plazo (1-3 meses)**
- [ ] App móvil (React Native)
- [ ] Chatbot con IA
- [ ] Sistema de puntos AS Club
- [ ] Integraciones adicionales

---

## 🎓 NOTAS PARA FUTUROS AGENTES

### **Al Iniciar una Sesión**

1. **SIEMPRE leer este documento primero**
2. Verificar versión actual en `todos.md`
3. Revisar pendientes en `todos.md`
4. Preguntar al usuario qué necesita

### **Durante el Trabajo**

1. Trabajar SOLO en `/home/project/operadora-dev/`
2. Usar versionado v2.XX
3. Usar hora CST para todo
4. Documentar cambios importantes

### **Al Finalizar**

1. Actualizar los **4 documentos obligatorios**
2. Crear versión con `versioning` tool
3. Actualizar `todos.md` con changelog
4. Incluir fecha y hora CST en TODOS los docs

### **Frases Clave del Usuario**

- **"como vamos a trabajar las versiones"** → Usar v2.XX, CST
- **"puedes actualizar [documento]"** → Incluir fecha/hora CST en header
- **"empezamos de cero"** → Leer CONTEXTO-PROYECTO-MASTER.md
- **"qué base usamos"** → Neon PostgreSQL (una sola BD)
- **"que documentos debemos actualizar"** → Los 4 obligatorios

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

Cada vez que actualices este documento:

- [ ] Fecha y hora actualizadas (CST)
- [ ] Versión actual correcta (v2.XX)
- [ ] Progreso de módulos actualizado
- [ ] Cambios en accesos/BD reflejados
- [ ] URLs y paths verificados
- [ ] Comandos probados
- [ ] Roadmap actualizado si hay cambios

---

## 📞 CONTACTO Y SOPORTE

**Cliente:** Sergio Aguilar Granados
**Email:** (pendiente en este doc)
**Repositorio:** https://github.com/sergioaguilargranados-ai/operadora-dev
**Deployment:** Vercel (pendiente de configurar)

---

**Documento creado:** 17 de Diciembre de 2025 - 10:26 CST
**Versión:** v2.94
**Propósito:** Memoria permanente del proyecto
**Actualizar:** Al final de cada sesión de cambios

---

🎯 **Este documento es la FUENTE DE VERDAD del proyecto.**
📌 **Actualízalo SIEMPRE que hagas cambios importantes.**
⭐ **Lee esto PRIMERO al iniciar cualquier sesión.**

---
