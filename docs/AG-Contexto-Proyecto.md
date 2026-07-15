# 🎯 AG-Contexto-Proyecto - AS Operadora

**Última actualización:** 15 de Julio de 2026 - 13:25 CST  
**Versión actual:** v2.424  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Documento maestro del proyecto para trabajo con agentes AntiGravity, trabajar de esta manera es para tener un mejor control de los cambios que se hacen en el proyecto y asegurar que todo funcione correctamente. 

## 📌 REGLAS DE COMUNICACIÓN (IMPORTANTE)
- **Idioma:** Toda comunicación hacia el usuario y entre agentes **DEBE SER EXCLUSIVAMENTE EN ESPAÑOL**. No utilizar inglés en las respuestas, resúmenes ni en los mensajes entre subagentes.

## 📌 INFORMACIÓN DEL PROYECTO

### Nombre del Proyecto
**AS OPERADORA - Sistema de Gestión de Viajes Corporativos**

### Cliente
Sergio Aguilar Granados

### Repositorio Git
- **Ambiente de Pruebas / Liberación:** `https://github.com/sergioaguilargranados-ai/operadora-dev.git`
- **Repositorio Producción Legacy:** `https://github.com/sergioaguilargranados-ai/as-operadora.git`
- **Deploy:** Liberaciones en ambiente de pruebas sobre `operadora-dev`

### Objetivo
Sistema completo de gestión de viajes corporativos con búsqueda, reservas, aprobaciones, pagos, reportes y dashboard ejecutivo. Competir con plataformas como Expedia con funcionalidades superiores.

### AL VERSIONAR CONSERVAR V0.000 CON FECHA Y HORA
- **Versión:** V2.375 2026-07-14 20:05:00 CST 
La fecha y hora tiempo del CDMX


### ESTADO DEL PROYECTO
- **Progreso:** 99% completo (White-Label: ~96%)
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

### Backend  este sirve para la APP Movil
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

### Inteligencia Artificial & Herramientas Agentic
- **Agentes IA:** AntiGravity AI Assistant (Google DeepMind) basado en Gemini Advanced Agentic Coding.
- **Flujo de Trabajo:** Planificación autónoma (Planning Mode), ejecución iterativa, validación y creación de artefactos (Implementation Plans, Walkthroughs, Tasks).
- **Herramientas del Agente:** Capacidades de lectura/escritura de archivos (multi_replace_file_content), ejecución de scripts en terminal local (Windows), y búsqueda de patrones (grep_search).
- **Directrices para Agentes Futuros:** Todos los agentes deben consultar y apegarse estrictamente a los archivos de contexto en `/DOCS` (como este documento) antes de realizar modificaciones arquitectónicas o cambios que rompan el estilo existente. Es imperativo respetar el Multi-Tenant (Marca Blanca) y las validaciones de roles implementadas.

---

## 🌐 REPOSITORIOS Y AMBIENTES

### Repositorios GitHub

| Repositorio | Propósito | URL | Estado |
|-------------|-----------|-----|--------|
| **operadora-dev** | Ambiente de Pruebas / Liberación | https://github.com/sergioaguilargranados-ai/operadora-dev | **USAR ESTE REPOSITORIO** |
| **as-operadora** | Producción (Legacy) | https://github.com/sergioaguilargranados-ai/as-operadora | No usar |

**Estrategia Actual Correcta:**
- Tenemos diferentes ambientes. El repositorio **`operadora-dev` está marcado como ambiente de pruebas y es aquí donde liberaremos**.
- Todos los cambios deben ir dirigidos a este repositorio (`operadora-dev`).

**⚠️ IMPORTANTE - Configuración de Git Remote:**

Para desplegar en el ambiente de pruebas, el remote debe ser `operadora-dev`:

```bash
# Verificar configuración
git remote -v

# Debe existir el remote apuntando a operadora-dev
# origin    https://...operadora-dev.git (fetch)
# origin    https://...operadora-dev.git (push)
```

**Flujo de trabajo para hacer cambios y liberar en pruebas:**

1. **MUY IMPORTANTE ANTES DEL COMMIT (Actualización de Versión):** Siempre debes ejecutar el actualizador de versiones antes de confirmar los cambios. Esto garantiza que la fecha y hora de compilación (y los créditos de AS Operadora) aparezcan de manera idéntica en el portal de escritorio, en la app móvil y en la landing page inicial.

```bash
# 1. Actualizar la versión (esto actualiza los footers automáticamente)
node scripts/update-version.js

# 2. Hacer cambios y commit
git add .
git commit -m "vX.XXX - Descripción"

# 2. Push SOLAMENTE a operadora-dev (Ambiente de Pruebas / Liberación)
git push origin main
```

**Razón:** Centralizar las liberaciones de prueba en el repositorio `operadora-dev` tal como solicitó el cliente.

### Proyectos Vercel

| Proyecto | Repo | URL | Ambiente |
|----------|------|-----|----------|
| **AS Operadora** | as-operadora | www.as-ope-viajes.company | PRODUCCIÓN (Legacy) |
| **Operadora Dev** | operadora-dev | app.asoperadora.com | **PRUEBAS / LIBERACIÓN** |

---

## 🔐 ACCESOS Y CREDENCIALES

### Base de Datos NEON

**CRÍTICO:** Solo existe UNA base de datos por ahora para pruebas 

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

### Flujo Multi-Equipo (con `chats/`)

```
Equipo A                    Equipo B
────────────────────        ────────────────────
git pull                    git pull
"Lee chats/ y retoma" ←──  (mismo archivo en repo)
Trabaja...                  Trabaja...
"Guarda sesión en chats/"   "Guarda sesión en chats/"
git push ──────────────►    git push
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

### 💬 Carpeta `chats/` — Continuidad Multi-Equipo

**Propósito:** Permite retomar el trabajo con AntiGravity desde cualquier equipo sin perder contexto.

**Archivos en `chats/`:**

| Archivo | Descripción |
|---------|-------------|
| `AG-COMO-USAR-ESTA-CARPETA.md` | Guía completa de uso |
| `AG-sesion-YYMMDD-[tema].md` | Resumen de cada sesión de trabajo |

**Reglas obligatorias:**
- ✅ **Al iniciar sesión:** leer el archivo más reciente en `chats/` para retomar contexto
- ✅ **Al terminar sesión:** el agente escribe/actualiza `AG-sesion-YYMMDD-[tema].md` con lo hecho, archivos modificados y próximos pasos
- ✅ **Siempre hacer commit** de los archivos en `chats/` junto con los cambios de código
- ❌ **NUNCA** incluir API keys, passwords ni credenciales en archivos de `chats/`

**Para iniciar en cualquier equipo:**
```bash
git pull origin main
# Luego decirle al agente:
# "Lee el último archivo en chats/ y retoma desde donde quedamos"
```

**Para cerrar sesión:**
```
# Decirle al agente:
# "Guarda el resumen de esta sesión en chats/"
```

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
- ✅ `AG-sesion-260605-PWA-APIs-Local.md` (en `chats/`)
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
**v2.354** (22 Jun 2026, 11:25 CST)

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
1. Leer el archivo más reciente en `chats/` para retomar contexto de sesión anterior
2. Leer este documento (`AG-Contexto-Proyecto.md`)
3. Revisar `AG-Historico-Cambios.md` para ver últimos cambios
4. Verificar versión actual
5. Preguntar al usuario qué necesita

### 2. Durante Desarrollo
1. Hacer cambios en código
2. Probar localmente (`npm run dev`)
3. Verificar que no hay errores de build
4. Documentar cambios importantes

### 3. Al Finalizar Cambios
1. Escribir/actualizar resumen de sesión en `chats/AG-sesion-YYMMDD-[tema].md`
2. Incrementar versión

### 🔢 SISTEMA DE VERSIONAMIENTO

El proyecto usa una versión semántica estructurada (ej. `v2.344`).

**Actualización Automática de Fecha y Hora de Compilación:**
El proyecto ahora cuenta con un script automático (`scripts/update-version.js`) que se ejecuta durante cada compilación (`npm run build`). Este script:
1. Extrae la fecha y hora exacta (Zona Horaria CST - Ciudad de México).
2. Actualiza automáticamente los archivos del footer (`src/components/BrandFooter.tsx` y `src/app/admin/megatravel-scraping/page.tsx`).
3. Mantiene la versión actual del documento pero actualiza el timestamp justo antes de que Next.js genere el *build*.

Para actualizar a una **nueva versión**, se puede ejecutar el script manualmente pasando el argumento de la versión, o hacerlo en los archivos y la próxima compilación ajustará la hora automáticamente:
```bash
# Actualizar los footers a una versión específica
node scripts/update-version.js v2.345
```

**Registro de Cambios:**
Las versiones también deben quedar registradas manualmente en el documento `docs/AG-Historico-Cambios.md` para mantener una bitácora detallada de cada nueva funcionalidad.

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

### Error: "Cambios no se despliegan en el ambiente de pruebas"
**Causa:** Se hizo push al repositorio incorrecto (`as-operadora`).
**Contexto:** El repositorio que despliega al ambiente de pruebas donde liberaremos es **`operadora-dev`**.
**Síntomas:**
- `git push` exitoso pero sin cambios en app.asoperadora.com
**Solución:**
```bash
# Push explícito al repositorio de liberación
git push origin main
```
**Importante:**
- Siempre verificar con `git remote -v`
- Asegurar que `operadora-dev` esté configurado como remote origin
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
2. Usar versionado conforme a la sección **Convenciones de Versionado** (ver abajo)
3. Usar hora CDMX (CST / UTC-6) para todo — incluir fecha y hora
4. Comunicación en español
5. Respuestas concisas

### Convenciones de Versionado

**Formato:** `v2.XXX` donde XXX es un número secuencial incrementado con cada release.

**Reglas:**
1. **Solo la versión** se muestra en el footer de la aplicación (ejemplo: `v2.316d`). NO incluir "Build:", ni fecha, ni hora en el footer.
2. **Sub-versiones** se usan cuando hay múltiples releases pequeños dentro de una misma versión mayor, usando sufijo de letra: `v2.316`, `v2.316b`, `v2.316c`, `v2.316d`.
3. **En comentarios de código** (cabecera de archivos .tsx/.ts): incluir fecha y hora CDMX. Ejemplo: `// Build: 15 Feb 2026 - 14:16 CST - v2.316d`
4. **En documentos AG-**: incluir fecha, hora CDMX y versión en el header.
5. **En AG-Historico-Cambios.md**: formato `### v2.XXX - DD de MES de AAAA - HH:MM CST`
6. **En commits de Git**: incluir versión al inicio. Ejemplo: `v2.316d - descripción del cambio`
7. **Zona horaria:** Siempre usar hora de Ciudad de México (CST / UTC-6). NO usar UTC ni otra zona horaria.

### Al Finalizar
1. Escribir resumen de sesión en `chats/AG-sesion-YYMMDD-[tema].md`
2. Actualizar documentos necesarios
3. Incrementar versión
4. Actualizar `AG-Historico-Cambios.md`
5. Commit y push a GitHub (`operadora-dev.git`) — **incluir archivos de `chats/`**
6. Verificar deploy automático

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

## 🎓 LECCIONES APRENDIDAS IMPORTANTES

### Google Maps API
- **Problema:** TypeScript no reconoce `google` sin tipos instalados
- **Solución:** Usar `(window as any).google` y tipos `any`
- **Archivo:** `src/components/TourMap.tsx`
- **Lección:** Para APIs externas sin tipos, usar `window` y `any` para evitar errores de compilación

### Pérdida de Funcionalidades
- **Problema:** Al agregar nuevas funciones (ej: mapa), se pueden perder funcionalidades existentes (ej: botón "Cotizar Tour")
- **Solución:** SIEMPRE revisar `AG-Historico-Cambios.md` antes de hacer cambios grandes
- **Lección:** Verificar que las funcionalidades previas sigan presentes después de cambios grandes

### Versiones en Footers
- **Problema:** Múltiples versiones en diferentes páginas causan confusión
- **Solución:** Mantener UN SOLO número de versión en la página principal (`src/app/page.tsx`)
- **Lección:** Usar la versión de la página principal como referencia única

### Búsqueda de Tours
- **Implementación:** Búsqueda parcial en múltiples campos (nombre, descripción, región, país, ciudades)
- **Backend:** `src/services/MegaTravelSyncService.ts`
- **Frontend:** Buscador en página principal y en `/tours`
- **Lección:** La búsqueda debe ser flexible y buscar en múltiples campos para mejor UX

### Módulo de Cotizaciones (v2.250)
- **Funcionalidad:** Formulario completo de cotización que reemplazó el botón de WhatsApp
- **Páginas:** `/cotizar-tour` y `/cotizacion/[folio]`
- **API:** `/api/tours/quote`
- **Tabla:** `tour_quotes` (21 campos)
- **Lección:** Este módulo es CRÍTICO, no debe perderse en futuras actualizaciones

### Código AS-XXXXX en Flujo de Viajes Grupales (v2.335)
- **Funcionalidad:** El código de viaje del proveedor (internamente `MT-XXXXX`) se presenta al cliente siempre como `AS-XXXXX` en todo el flujo: catálogo, formulario, confirmación, PDF y email
- **Función helper:** `formatTourCode(id)` — idempotente, normaliza `MT-XXXXX`, `AS-XXXXX` o numérico al formato `AS-XXXXX`
- **Puntos de contacto:** tarjetas del catálogo `/tours`, título y sidebar de `/cotizar-tour`, confirmación de envío, vista web y PDF de `/cotizacion/[folio]`, email HTML, mensaje automático Communication Center
- **Lección:** La transformación de prefijo ya se hacía en la API (`/api/groups`). Esta versión lleva el código al cliente en cada pantalla sin tocar la BD ni el modelo de datos

### Módulo de Reservas y Pagos (v2.334)
- **Funcionalidad:** Gestión completa de reservas con acciones: Ver detalles, PDF oficial, Pago (pasarela Stripe/PayPal/MercadoPago), Facturar
- **Páginas:** `/mis-reservas` (listado) y `/reserva/[id]` (detalle)
- **Checkout:** `/checkout/[bookingId]` con Stripe, PayPal, Mercado Pago
- **API:** `/api/bookings`, `/api/payments/stripe/*`, `/api/payments/paypal/*`, `/api/payments/mercadopago/*`
- **Tablas:** `bookings`, `payment_transactions`
- **PDFs Oficiales:** Reserva con diseño premium institucional (logo AS serif, barra dorada, detalles del tour, resumen financiero, T&C, footer navy/gold)
- **PDF Comprobante de Pago:** Diseño premium con sello verde "PAGO COMPLETADO", datos de transacción, tarjeta, reserva asociada
- **Auto-crear reserva:** Al confirmar cotización de tour, se crea reserva automáticamente en `bookings`
- **Lección:** Los detalles del servicio se guardan como JSON en `special_requests` para flexibilidad

### Motor Multi-Proveedor Actividades y Restaurantes (v2.358)
- **Funcionalidad:** Desarrollo de la Arquitectura de Agregadores Multi-proveedor para Restaurantes (`RestaurantAggregator`) y Actividades (`ActivityAggregator`), replicando el de Vuelos.
- **Implementación:** `Promise.allSettled` con captura individual, desduplicación de items y registro de métricas exactas (en ms) a PostgreSQL en la tabla `provider_metrics`.
- **Adaptadores:** `OpenTableAdapter`, `CivitatisAdapter` y la estructura `ViatorAdapter` listos y probados.
- **Lección:** Toda la app ahora sigue un patrón Aggregator-Adapter unificado para todos sus servicios principales (Vuelos, Hoteles, Restaurantes, Actividades).

### Homogenización Logo App Móvil - Componente MobileLogo (v2.359 - 29 Jun 2026)
- **Problema resuelto:** Los archivos SVG (`logo-black.svg`, `logo-white.svg`) usan `@import` de Google Fonts que NO funciona cuando se cargan como `<img>`, causando que el logo se vea con fuente incorrecta o como cuadrado negro (fallback al icono).
- **Solución:** Se creó el componente React `src/components/mobile/MobileLogo.tsx` que renderiza el logo como HTML real (no SVG), usando `font-family` con fallback a fuentes del sistema (Georgia, Times New Roman).
- **Props del componente:**
  - `variant="dark"` → texto negro (fondos blancos/claros)
  - `variant="light"` → texto blanco (fondos oscuros/negros)
  - `size="sm|md|lg"` → tamaño del logo
  - `logoUrl` → si se provee, muestra imagen personalizada de agencia white-label
- **Páginas actualizadas:** Login, Home, Perfil, Tienda, Itinerario (lista y detalle día), Pagos, Ayuda, Viajes Grupales, Rewards
- **Regla de uso:**
  - Fondo oscuro (Home banner, Perfil header negro, Tienda header negro, Rewards banner): `variant="light"`
  - Fondo claro (Login, Itinerario, Pagos, Ayuda, Viajes Grupales): `variant="dark"`
- **API Detect mejorada:** `src/app/api/tenant/detect/route.ts` ahora extrae `logo_mobile_url` directamente de la tabla `mobile_app_content` y lo entrega al `WhiteLabelContext`.
- **Lección:** Nunca usar SVG con `@import` Google Fonts cargado como `<img>` - el browser no ejecuta el `@import`. Usar componentes React con `font-family` inline o Next.js `next/font`.

---

**Documento creado:** 17 de Enero de 2026 - 02:00 CST  
**Versión:** v2.223  
**Propósito:** Contexto maestro para agentes AntiGravity  
**Actualizar:** Al cambiar configuración, accesos o estructura

---

🎯 **Este documento es la FUENTE DE VERDAD del proyecto.**  
📌 **Actualízalo cuando cambien configuraciones críticas.**  
⭐ **Lee esto PRIMERO al iniciar cualquier sesión.**
