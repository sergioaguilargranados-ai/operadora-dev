# 🎯 AG-Contexto-Proyecto - AS Operadora

**Última actualización:** 28 de Enero de 2026 - 10:30 CST  
**Versión actual:** v2.237  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Documento maestro del proyecto para trabajo con agentes AntiGravity

---

## 📌 INFORMACIÓN DEL PROYECTO

### Nombre del Proyecto
**AS OPERADORA - Sistema de Gestión de Viajes Corporativos**

### Cliente
Sergio Aguilar Granados

### Objetivo
Sistema completo de gestión de viajes corporativos con búsqueda, reservas, aprobaciones, pagos, reportes y dashboard ejecutivo. Competir con plataformas como Expedia con funcionalidades superiores.

### Estado Actual
- **Versión:** v2.237
- **Progreso:** 98% completo
- **Ambiente:** Desarrollo activo con usuarios en UAT
- **Deploy:** Automático vía Git → Vercel

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Animaciones:** Framer Motion
- **Gráficas:** Recharts

### Backend
- **Runtime:** Next.js API Routes (Serverless)
- **Servidor:** Estándar Next.js (NO `server.js` personalizado)
- **Base de Datos:** PostgreSQL (Neon Cloud)
- **Package Manager:** npm (NO bun en Vercel)
- **Autenticación:** JWT + bcrypt

### Servicios Externos
- **Pagos:** Stripe, PayPal, MercadoPago
- **Almacenamiento:** Vercel Blob
- **Email:** SendGrid (configurado, pendiente uso)
- **APIs Viajes:** Amadeus (API keys pendientes)

### Seguridad
- JWT (autenticación)
- bcrypt (passwords)
- AES-256 (encriptación)
- Rate limiting
- CORS configurado

---

## 🌐 REPOSITORIOS Y AMBIENTES

### Repositorios GitHub

| Repositorio | Propósito | URL | Estado |
|-------------|-----------|-----|--------|
| **as-operadora** | Producción | https://github.com/sergioaguilargranados-ai/as-operadora | ✅ PRODUCCIÓN |
| **operadora-dev** | Desarrollo/Backup | https://github.com/sergioaguilargranados-ai/operadora-dev | ⚠️ NO USAR PARA PROD |

**Estrategia Actual Correcta:**
- **as-operadora** → www.as-ope-viajes.company (ÚNICO SITIO DE PRODUCCIÓN)
- Todos los cambios deben ir dirigidos a este repositorio (`as-operadora`).
- El repositorio `operadora-dev` queda como respaldo o entorno de desarrollo secundario.

**⚠️ IMPORTANTE - Configuración de Git Remote:**

Para desplegar en producción, el remote debe ser `as-operadora`:

```bash
# Verificar configuración
git remote -v

# Debe existir el remote 'as-operadora' (o 'origin' apuntando a as-operadora)
# as-operadora    https://...as-operadora.git (fetch)
# as-operadora    https://...as-operadora.git (push)
```

**Flujo de trabajo para hacer cambios:**

```bash
# 1. Hacer cambios y commit
git add .
git commit -m "vX.XXX - Descripción"

# 2. Push SOLAMENTE a as-operadora (Producción)
git push as-operadora main
```

**Razón:** Centralizar el despliegue en el nuevo dominio y repositorio oficial.

### Proyectos Vercel

| Proyecto | Repo | URL | Ambiente |
|----------|------|-----|----------|
| **AS Operadora** | as-operadora | www.as-ope-viajes.company | ✅ PRODUCCIÓN |
| **Operadora Dev** | operadora-dev | app.asoperadora.com | ⚠️ OBSOLETO / DEV |

---

## 🔐 ACCESOS Y CREDENCIALES

### Base de Datos NEON

**CRÍTICO:** Solo existe UNA base de datos para todos los ambientes

```
Host: ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech
Database: neondb
Usuario: neondb_owner

DATABASE_URL completa:
postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**Importante:**
- Misma BD para AntiGravity (local) y Vercel (producción)
- NO hay base de datos local separada
- Configurar en `.env.local` y en Vercel Environment Variables

### Usuarios del Sistema

**Contraseña para TODOS:** `Password123!`

| Email | Rol | Uso |
|-------|-----|-----|
| superadmin@asoperadora.com | SUPER_ADMIN | Acceso total |
| admin@asoperadora.com | ADMIN | Dashboard corporativo |
| manager@empresa.com | MANAGER | Aprobaciones |
| empleado@empresa.com | EMPLOYEE | Mis reservas |

**Hash bcrypt:** `$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky`

### Secrets y Variables

```bash
# JWT
JWT_SECRET=zGYVpk6wYzyRl4hfqgS3hrqP81v0V0nB6g6MeE2SsBg=

# CRON
CRON_SECRET_KEY=dev_cron_secret_2025

# NODE
NODE_ENV=development
```

**Ver archivo completo:** `operadora-dev/.env.local`

### GitHub Token (NO documentar en repo)

**Ubicación sugerida:** `G:/Otros ordenadores/Mi PC/OPERADORA/.credentials/github-token.txt`

**Permisos requeridos:**
- `repo` (acceso completo a repositorios)
- `workflow` (ejecutar GitHub Actions)

**NUNCA** incluir el token en archivos del repositorio.

---

## 🔄 FLUJO DE TRABAJO GIT → VERCEL

### Flujo Automático

```
AntiGravity (desarrollo)
    ↓
    Push a GitHub
    ↓
GitHub (repositorio)
    ↓
    Webhook automático
    ↓
Vercel (build + deploy automático)
    ↓
Aplicación en vivo
    ↓
Conecta a NEON (base de datos)
```

### Comandos Git

**IMPORTANTE:** Git se ejecuta desde la raíz del workspace

```bash
# Verificar estado
cd "G:\Otros ordenadores\Mi PC\OPERADORA\AntiGravity\operadora-dev"
git status

# Agregar cambios
git add .

# Commit
git commit -m "v2.XXX - Descripción de cambios"

# Push a GitHub
git push origin main
```

### Verificación de Deploy

1. Push a GitHub (manual o desde AntiGravity)
2. Esperar 2-3 minutos (build automático en Vercel)
3. Verificar en URL de producción
4. Revisar versión en footer de la página

---

## 📂 ESTRUCTURA DE DIRECTORIOS

### Estructura del Workspace

```
G:/Otros ordenadores/Mi PC/OPERADORA/AntiGravity/
└── operadora-dev/                    ← TODO EL CÓDIGO AQUÍ
    ├── src/                          ← Código fuente
    │   ├── app/                      ← Páginas y APIs (Next.js App Router)
    │   ├── components/               ← Componentes UI (shadcn/ui)
    │   ├── services/                 ← Lógica de negocio
    │   ├── middleware/               ← Seguridad (rate limiting, CORS)
    │   ├── contexts/                 ← AuthContext, etc.
    │   └── utils/                    ← Utilidades
    ├── docs/                         ← 📚 DOCUMENTACIÓN (antes .same/)
    │   ├── AG-Contexto-Proyecto.md   ← Este documento
    │   ├── AG-Historico-Cambios.md   ← Histórico de versiones
    │   └── AG-*-YYMMDD.md            ← Documentos de sesión
    ├── migrations/                   ← Migraciones SQL
    ├── scripts/                      ← Scripts de utilidad
    ├── public/                       ← Assets públicos
    ├── .env.local                    ← Variables de entorno (NO en Git)
    ├── package.json                  ← Dependencias
    ├── next.config.js                ← Configuración Next.js
    └── README.md                     ← Documentación pública
```

### Configuración de Vercel

**En Vercel Dashboard → Settings → Build & Development:**

```
Root Directory: operadora-dev
Build Command: next build (automático)
Output Directory: .next (automático)
Framework: Next.js (detectado)
Package Manager: npm
```

**NUNCA cambiar Root Directory** - debe ser `operadora-dev`

---

## 📝 SISTEMA DE DOCUMENTACIÓN

### Documentos Principales

| Documento | Ubicación | Propósito | Actualizar |
|-----------|-----------|-----------|------------|
| **AG-Contexto-Proyecto.md** | `docs/` | Contexto maestro (este doc) | Al cambiar configuración |
| **AG-Historico-Cambios.md** | `docs/` | Histórico de versiones | Cada versión nueva |
| **README.md** | raíz | Documentación pública GitHub | Cambios importantes |

### Documentos de Sesión (con fecha)

Formato: `AG-[nombre]-YYMMDD.md`

Ejemplos:
- `AG-task-260117.md` (tareas del 17 Ene 2026)
- `AG-implementation_plan-260117.md` (plan del 17 Ene 2026)
- `AG-walkthrough-260117.md` (walkthrough del 17 Ene 2026)

### Convención de Nomenclatura

**Todos los archivos nuevos:**
- Prefijo: `AG-` (AntiGravity)
- Nombre descriptivo en español
- Fecha al final (solo documentos de sesión): `-YYMMDD`

**Ejemplos:**
- ✅ `AG-Contexto-Proyecto.md`
- ✅ `AG-Historico-Cambios.md`
- ✅ `AG-task-260117.md`
- ✅ `AG-Plan-Integracion-APIs-260120.md`
- ❌ `contexto.md` (sin prefijo)
- ❌ `plan-2026-01-17.md` (formato de fecha incorrecto)

---

## 🔢 SISTEMA DE VERSIONAMIENTO

### Esquema de Versiones

**Formato:** `v2.XXX`

**Ejemplos:**
- ✅ v2.223 (actual)
- ✅ v2.224 (siguiente)
- ✅ v2.300 (futuro)
- ❌ v223 (falta el 2.)
- ❌ v2.0.223 (no usar tercer dígito)

### Incremento de Versión

- **Cambio pequeño:** v2.223 → v2.224
- **Cambio significativo:** v2.223 → v2.230
- **Hito importante:** v2.XXX → v3.0 (producción final)

### Ubicaciones de Versión

1. **Footer** (`src/app/page.tsx`):
   ```tsx
   <p className="text-xs mt-2 opacity-50">
     v2.223 | Build: 17 Ene 2026, 02:00 CST
   </p>
   ```

2. **Comentario de archivo** (parte superior):
   ```tsx
   // Build: 17 Ene 2026 - v2.223 - Fix login + AuthContext - PRODUCTION
   ```

3. **Documentos** (header):
   ```markdown
   **Versión actual:** v2.223
   ```

---

## 💬 COMUNICACIÓN CON AGENTES

### Idioma
**ESPAÑOL** - Toda la comunicación con agentes debe ser en español.

### Estilo de Comunicación

**Reglas de oro:**
- ✅ Respuestas cortas (1-5 líneas máximo)
- ✅ Estado visible (✅ ❌ ⏳)
- ✅ Solo detalles si se piden
- ❌ Evitar informes largos
- ❌ Evitar repetir contexto
- ❌ Evitar resúmenes innecesarios

**Ejemplo preferido:**
```
3 archivos actualizados ✅
Versión v2.224
¿Siguiente?
```

**Evitar:**
```
He completado exitosamente la actualización de los 3 archivos
del sistema siguiendo las convenciones establecidas...
[10 líneas más]
```

### Formato de Respuesta

```markdown
[Acción]: [descripción breve]
Estado: ✅ Listo / ❌ Error / ⏳ En proceso
[Resultado crítico si hay]
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Versión Actual
**v2.226** (18 Ene 2026, 15:30 CST)

### Progreso General
**98%** completo

### Desglose por Módulo

| Módulo | % | Estado |
|--------|---|--------|
| Backend (APIs) | 96% | ✅ 48/50 APIs |
| Frontend | 90% | ✅ 18/20 páginas |
| Sistema Corporativo | 100% | ✅ Completo |
| Pagos (Stripe/PayPal/MP) | 90% | ✅ Funcional |
| Seguridad | 95% | ✅ Funcional |
| Testing | 20% | ⏳ Básico |
| Documentación | 100% | ✅ Completa |

### Datos en Base de Datos

- ✅ 6 usuarios (todos los roles)
- ✅ 10 empleados corporativos
- ✅ 6 reservas (vuelos, hoteles, paquetes)
- ✅ 4 aprobaciones (2 pendientes)
- ✅ 4 transacciones de pago
- ✅ 5 centros de costo
- ✅ 4 políticas de viaje

---

## 🚀 COMANDOS IMPORTANTES

### Desarrollo

```bash
# Iniciar servidor de desarrollo
cd "G:\Otros ordenadores\Mi PC\OPERADORA\AntiGravity\operadora-dev"
npm run dev

# Build de producción
npm run build

# Linter
npm run lint
```

### Base de Datos

```bash
# Verificar conexión
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL?.substring(0,80))"

# Ejecutar migración
node scripts/run-migration-XXX.js

# Generar cifra de control
node scripts/db-control-cifra.js
```

### Git

```bash
# Estado
git status

# Agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "v2.XXX - Descripción"

# Push a GitHub (dispara deploy automático)
git push origin main
```

---

## 🎯 FLUJO DE TRABAJO PARA CAMBIOS

### 1. Inicio de Sesión
1. Leer este documento (`AG-Contexto-Proyecto.md`)
2. Revisar `AG-Historico-Cambios.md` para ver últimos cambios
3. Verificar versión actual
4. Preguntar al usuario qué necesita

### 2. Durante Desarrollo
1. Hacer cambios en código
2. Probar localmente (`npm run dev`)
3. Verificar que no hay errores de build
4. Documentar cambios importantes

### 3. Al Finalizar Cambios
1. Incrementar versión (v2.XXX → v2.XXX+1)
2. Actualizar footer en `src/app/page.tsx`
3. Actualizar documentos:
   - `AG-Historico-Cambios.md` (agregar entrada)
   - `AG-Contexto-Proyecto.md` (si cambió configuración)
   - `README.md` (si aplica)
4. Commit a Git con mensaje descriptivo
5. Push a GitHub (deploy automático)
6. Verificar deploy en Vercel (2-3 min)

### 4. Formato de Actualización

**Header de documentos:**
```markdown
**Última actualización:** 17 de Enero de 2026 - 02:00 CST
**Versión:** v2.XXX
**Actualizado por:** AntiGravity AI Assistant
```

---

## 📱 COMPATIBILIDAD APP MÓVIL

### Preparación Backend

El backend debe soportar tanto web como móvil (React Native futuro).

**Principios:**
- Un solo backend (NO separar)
- APIs REST consistentes
- JWT estándar (Authorization header)
- Retrocompatibilidad

**Formato de respuesta estándar:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

**Ver más:** `docs/BACKEND-MOVIL-PREPARACION.md` (si existe)

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Error: "No puedo hacer login"

```bash
# Verificar que servidor esté corriendo
npm run dev

# Verificar DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### Error: "No veo datos en dashboard"

```bash
# Verificar conexión a BD
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL?.substring(0,80))"
```

### Error: "Vercel no despliega"

1. Verificar que push a GitHub fue exitoso
2. Ir a Vercel Dashboard → Deployments
3. Revisar logs de build
4. Verificar que Root Directory = `operadora-dev` (o `./` si el repo está en raíz)

### Error: "404 NOT FOUND" en Vercel (tras build exitoso)

**Causa:** Conflicto entre servidor custom (`server.js`) y entorno Serverless.
**Solución:**
- Eliminar/Renombrar `server.js`
- Usar script `start`: `"next start"` en `package.json`
- Asegurar `vercel.json` con framework "nextjs"

### Error: "Build Error: Cannot find module expo-router"

**Causa:** Vercel intenta compilar la app móvil.
**Solución:** Excluir `operadora-mobile` en `.vercelignore` y `tsconfig.json`.

### Error: "Cambios no se despliegan en producción (www.as-ope-viajes.company)"
**Causa:** Se hizo push al repositorio incorrecto (`operadora-dev`).
**Contexto:** El único repositorio que despliega a producción es **`as-operadora`**.
**Síntomas:**
- `git push` exitoso pero sin cambios en www.as-ope-viajes.company
- Los cambios están en el repo `operadora-dev` pero no en `as-operadora`
**Solución:**
```bash
# Push explícito al repositorio de producción
git push as-operadora main
```
**Importante:**
- Siempre verificar con `git remote -v`
- Asegurar que `as-operadora` esté configurado como remote
---

## 📈 PRÓXIMOS PASOS

### Corto Plazo
- [ ] Configurar nuevo proyecto Vercel para `as-operadora`
- [ ] Migrar configuración de `operadora-dev` a `as-operadora`
- [ ] Testing manual completo
- [ ] Configurar API keys de Amadeus

### Mediano Plazo
- [ ] Testing automatizado (aumentar coverage)
- [ ] Optimizaciones de performance
- [ ] Documentación de usuario final
- [ ] Migrar usuarios a nuevo repo cuando esté estable

### Largo Plazo
- [ ] App móvil (React Native)
- [ ] Chatbot con IA
- [ ] Sistema de puntos AS Club
- [ ] Integraciones adicionales

---

## 🎓 NOTAS PARA AGENTES ANTIGRAVITY

### Al Iniciar
1. **SIEMPRE leer este documento primero**
2. Revisar `AG-Historico-Cambios.md` para contexto reciente
3. Verificar versión actual
4. Preguntar al usuario qué necesita

### Durante el Trabajo
1. Trabajar en `operadora-dev/` (directorio correcto)
2. Usar versionado v2.XXX
3. Usar hora CST para todo
4. Comunicación en español
5. Respuestas concisas

### Al Finalizar
1. Actualizar documentos necesarios
2. Incrementar versión
3. Actualizar `AG-Historico-Cambios.md`
4. Commit y push a GitHub
5. Verificar deploy automático

### Frases Clave del Usuario

- **"como vamos a trabajar las versiones"** → Usar v2.XXX, CST
- **"puedes actualizar [documento]"** → Incluir fecha/hora CST
- **"empezamos de cero"** → Leer AG-Contexto-Proyecto.md
- **"qué base usamos"** → Neon PostgreSQL (una sola BD)
- **"subir a GitHub"** → Push manual, deploy automático en Vercel

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de finalizar cualquier sesión:

- [ ] Versión incrementada correctamente
- [ ] Footer actualizado en `src/app/page.tsx`
- [ ] `AG-Historico-Cambios.md` actualizado con nueva entrada
- [ ] Este documento actualizado si cambió configuración
- [ ] Commit con mensaje descriptivo
- [ ] Push a GitHub exitoso
- [ ] Deploy verificado en Vercel

---

**Documento creado:** 17 de Enero de 2026 - 02:00 CST  
**Versión:** v2.223  
**Propósito:** Contexto maestro para agentes AntiGravity  
**Actualizar:** Al cambiar configuración, accesos o estructura

---

🎯 **Este documento es la FUENTE DE VERDAD del proyecto.**  
📌 **Actualízalo cuando cambien configuraciones críticas.**  
⭐ **Lee esto PRIMERO al iniciar cualquier sesión.**
