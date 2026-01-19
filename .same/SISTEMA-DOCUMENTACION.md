# 📚 SISTEMA DE DOCUMENTACIÓN DEL PROYECTO

**Última actualización:** 04 de Enero de 2026 - 23:04 CST
**Versión:** v2.173
**Actualizado por:** AI Assistant
**Propósito:** Explicar el sistema de documentación, convenciones, integraciones y estilo de comunicación

---

## 🎯 OBJETIVO

Este documento explica cómo funciona el sistema de documentación del proyecto AS OPERADORA y qué convenciones seguimos.

---

## 🚨 BASE DE DATOS - UNA SOLA BD PARA TODO

### **⚠️ REGLA CRÍTICA: SOLO UNA BASE DE DATOS**

**El proyecto usa UNA SOLA base de datos Neon para todos los ambientes:**

```
Base de datos ÚNICA (Producción y Desarrollo):
Host: ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech
Database: neondb
Usuario: neondb_owner

DATABASE_URL completa:
postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE (Actualizado 09 Ene 2026):**
- En Vercel solo debe existir UNA variable DATABASE_URL con scope "All Environments"
- Eliminar cualquier otra DATABASE_URL de Preview/Development/Production individual
- Same (.env.local) debe usar la MISMA URL

### **🔴 PROBLEMA HISTÓRICO (09 Ene 2026)**

Se detectó que existían **DOS bases de datos diferentes**:
- `ep-green-sky-afxrsbva` (usada en Same.new local)
- `ep-bold-hill-afbis0wk-pooler` (usada en Vercel producción)

Esto causó errores como:
```
column "type" of relation "bookings" does not exist
```

Porque las migraciones se ejecutaban en una BD pero producción usaba otra.

### **✅ SOLUCIÓN Y REGLA**

1. **Vercel y Same.new DEBEN usar la MISMA DATABASE_URL**
2. **Antes de ejecutar migraciones, verificar con:**
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL?.substring(0,80))"
   ```
3. **Comparar con Vercel Dashboard → Settings → Environment Variables → DATABASE_URL**
4. **Si son diferentes, actualizar `.env.local` para que coincida con Vercel**

### **📋 VERIFICACIÓN RÁPIDA**

Endpoint de debug disponible:
```
https://app.asoperadora.com/api/debug/check-db
```

Muestra:
- Prefijo de DATABASE_URL en uso
- Columnas de la tabla bookings
- Confirmación de conexión

### **🎯 ESTRUCTURA BD PRODUCCIÓN (Tabla bookings)**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer | PK |
| user_id | integer | FK usuario |
| tenant_id | integer | FK tenant |
| booking_type | varchar | flight, hotel, package |
| booking_reference | varchar | Código único |
| booking_status | varchar | pending, confirmed, cancelled |
| payment_status | varchar | pending, paid, refunded |
| total_price | numeric | Precio total |
| currency | varchar | MXN, USD |
| destination | varchar | Destino/servicio |
| lead_traveler_name | varchar | Nombre viajero principal |
| lead_traveler_email | varchar | Email |
| lead_traveler_phone | varchar | Teléfono |
| adults | integer | Número adultos |
| special_requests | text | JSON con detalles |
| created_at | timestamp | Fecha creación |

**IMPORTANTE:** Si la estructura local difiere, adaptar el código a la BD de producción, NO al revés.

---

## 🚨 ESTRUCTURA DE DIRECTORIOS CRÍTICA

### **⚠️ REGLA FUNDAMENTAL: TODO EL CÓDIGO EN `operadora-dev/`**

**Estructura actual del proyecto:**
```
/home/project/
├── .git/                          ← Git del repositorio
├── operadora-dev/                 ← TODO EL CÓDIGO AQUÍ
│   ├── src/                       ← Código fuente
│   ├── public/                    ← Assets públicos
│   ├── .same/                     ← Documentación
│   ├── package.json               ← Dependencias
│   ├── .npmrc                     ← Config npm
│   ├── next.config.js             ← Config Next.js
│   └── ...                        ← Todo lo demás
├── expedia-clone-BACKUP/          ← Backup histórico (NO TOCAR)
└── uploads/                       ← Uploads temporales
```

### **🔴 POR QUÉ NO PUEDE HABER CÓDIGO FUERA DE `operadora-dev/`**

#### **1. Configuración de Vercel:**
- **Root Directory en Vercel:** `operadora-dev`
- Vercel SOLO ve lo que está dentro de `operadora-dev/`
- Cualquier archivo fuera NO se despliega
- Si pones código en `/home/project/`, Vercel NO lo encontrará

#### **2. Configuración de Git:**
- El repositorio GitHub está en la raíz: `/home/project/.git`
- Pero el código productivo está en `/home/project/operadora-dev/`
- Esta estructura permite tener backups y otros directorios sin contaminar el deploy

#### **3. Si pones archivos en la raíz:**
- ❌ `vercel.json` en raíz → Error de schema validation
- ❌ Código en raíz → Vercel no lo encuentra
- ❌ `package.json` en raíz → Conflicto con el de `operadora-dev/`
- ❌ Archivos sueltos → Confusión y errores de build

### **✅ CONFIGURACIÓN FINAL DE VERCEL (Funcional)**

**En Vercel Dashboard:**
```
Project Settings → General → Build & Development Settings
Root Directory: operadora-dev
```

**Archivos clave en `operadora-dev/`:**
- ✅ `package.json` - Dependencias y scripts
- ✅ `package-lock.json` - Lock de npm (NO bun.lock)
- ✅ `.npmrc` - Config: `legacy-peer-deps=true`
- ✅ `next.config.js` - Config Next.js
- ✅ `.env.local` - Variables de entorno (NO en Git)

**Archivos que NO deben existir:**
- ❌ `/home/project/vercel.json` - Eliminado
- ❌ `/home/project/package.json` - NO crear
- ❌ `operadora-dev/bun.lock` - Eliminado (Vercel usa npm)

### **🎯 RESUMEN DE LA CONFIGURACIÓN**

| Elemento | Ubicación | Propósito |
|----------|-----------|-----------|
| **Repositorio Git** | `/home/project/.git` | Control de versiones |
| **Código productivo** | `/home/project/operadora-dev/` | App Next.js completa |
| **Root Directory Vercel** | `operadora-dev` | Dónde Vercel busca el código |
| **Package manager** | `npm` (NO bun) | Vercel usa npm por defecto |
| **Backup** | `/home/project/expedia-clone-BACKUP/` | Histórico (NO tocar) |
| **Uploads** | `/home/project/uploads/` | Temporales |

### **📋 CHECKLIST ANTES DE CUALQUIER CAMBIO**

Antes de crear/mover archivos, verificar:
- [ ] ¿El archivo va en `operadora-dev/`? → SÍ (99% de casos)
- [ ] ¿Es configuración de Vercel? → Va en `operadora-dev/`
- [ ] ¿Es código fuente? → Va en `operadora-dev/src/`
- [ ] ¿Es documentación? → Va en `operadora-dev/.same/`
- [ ] ¿Es dependencia? → Se agrega con `npm install` en `operadora-dev/`

### **⚠️ ERRORES COMUNES A EVITAR**

1. ❌ Crear `vercel.json` en raíz
   - ✅ Vercel usa solo Root Directory del dashboard

2. ❌ Usar `bun.lock`
   - ✅ Vercel requiere `package-lock.json` (npm)

3. ❌ Poner código en `/home/project/src/`
   - ✅ Todo va en `/home/project/operadora-dev/src/`

4. ❌ Variables de entorno en raíz
   - ✅ `.env.local` en `operadora-dev/`

5. ❌ Archivos de configuración duplicados
   - ✅ Solo en `operadora-dev/`

---

## 💬 ESTILO DE COMUNICACIÓN CON AGENTES

### **🎯 REGLA CRÍTICA: Comunicación Simple y Concreta**

Durante el desarrollo intensivo de pruebas y cambios, los agentes deben mantener una comunicación **clara, cordial pero MUY CONCRETA**.

### **✅ SÍ Hacer:**

**Respuestas cortas y directas:**
```
✅ "Listo, archivo actualizado en línea 45."
✅ "Push exitoso. Deploy en 2 min en app.asoperadora.com"
✅ "Error corregido. Probando..."
✅ "3 documentos actualizados. Versión v2.97"
```

**Informar solo lo esencial:**
- ✅ Qué se hizo
- ✅ Resultado (éxito/error)
- ✅ Próximo paso (si aplica)

**Formato preferido:**
```
Acción realizada: [breve]
Estado: ✅ / ❌
Siguiente: [si aplica]
```

### **❌ NO Hacer:**

**Evitar informes largos:**
```
❌ "He completado exitosamente la actualización del archivo
    en la línea 45, modificando la función xyz() para que
    ahora retorne el valor correcto según la especificación
    original del proyecto que fue definida en..."

✅ "Línea 45 actualizada. Función corregida."
```

**Evitar resúmenes innecesarios:**
```
❌ ## RESUMEN EJECUTIVO
   ### Lo que se hizo:
   1. Actualizar archivo
   2. Correr tests
   3. Verificar resultado

✅ "Archivo actualizado. Tests OK."
```

**Evitar repetir información:**
```
❌ Repetir el mismo cambio en múltiples formatos
✅ Decirlo una vez, claro y directo
```

### **📝 Plantilla de Respuesta Rápida**

```markdown
[Acción]: [descripción breve]
Estado: ✅ Listo / ❌ Error / ⏳ En proceso
[Resultado crítico si hay]
```

**Ejemplos:**

```markdown
Actualización: 3 archivos modificados
Estado: ✅ Listo
Versión: v2.97
```

```markdown
Push a GitHub
Estado: ✅ Exitoso
Deploy: 2 min en app.asoperadora.com
```

```markdown
Error en línea 230
Estado: ❌ Corregido
Reintentando...
```

### **🚀 Durante Pruebas Intensivas**

En fase de testing y cambios rápidos:

**Comunicación ultra-concreta:**
```
1. Cambio aplicado
2. ✅ / ❌
3. [Siguiente acción]
```

**Sin:**
- ❌ Introducciones largas
- ❌ Contexto repetido (ya está documentado)
- ❌ Explicaciones técnicas extensas (solo si se pide)
- ❌ Múltiples resúmenes del mismo punto

**Con:**
- ✅ Información directa
- ✅ Estado claro (✅/❌/⏳)
- ✅ Acción si se necesita
- ✅ Cortesía pero brevedad

### **💡 Ejemplos Comparativos**

**❌ Respuesta larga (EVITAR):**
```
He actualizado exitosamente los documentos del sistema siguiendo
las convenciones establecidas en el sistema de documentación.
Los cambios incluyen:

1. Actualización del header con fecha y hora CST
2. Incremento de versión a v2.97
3. Modificación del contenido según lo solicitado
4. Verificación de que todos los documentos cumplan con el formato

El resultado final es que ahora todos los documentos están
sincronizados y listos para el siguiente paso del proceso.

¿Deseas que proceda con el siguiente cambio?
```

**✅ Respuesta corta (PREFERIDA):**
```
Documentos actualizados → v2.97
Estado: ✅ Listo
¿Siguiente cambio?
```

### **🎯 Reglas de Oro**

1. **Sé cordial pero breve**
   - "Listo ✅" es mejor que "He completado exitosamente..."

2. **Estado siempre visible**
   - Usa: ✅ ❌ ⏳ 🔄 para indicar estado

3. **Solo detalles si se piden**
   - Asume que el usuario sabe el contexto
   - Profundiza solo si pregunta

4. **Respuestas de una línea cuando sea posible**
   - "Archivo actualizado ✅"
   - "Error corregido ✅"
   - "Push exitoso ✅"

5. **Máximo 3-5 líneas en respuestas normales**
   - Solo exceder si hay error complejo
   - O si el usuario pide detalles

### **📊 Métricas de Comunicación Ideal**

| Situación | Líneas Respuesta | Ejemplo |
|-----------|------------------|---------|
| Cambio simple | 1 línea | "Actualizado ✅" |
| Cambio normal | 2-3 líneas | "3 archivos actualizados<br>Versión v2.97<br>Push exitoso ✅" |
| Cambio complejo | 3-5 líneas | Máximo con detalles |
| Error | 2-4 líneas | "Error línea 45<br>Causa: sintaxis<br>Corregido ✅" |

### **🔥 Fase Intensiva (Testing/Cambios Rápidos)**

Cuando se esté en modo de pruebas intensivas:

**Formato ultra-compacto:**
```
[Archivo] → ✅
[Archivo] → ✅
[Archivo] → ❌ Error línea 45
  └─ Corregido ✅
Push → ✅
Deploy → ⏳ 2min
```

**Sin explicaciones, solo resultados**

### **💼 Mantener Profesionalismo**

Aunque sea breve, siempre:
- ✅ Ser respetuoso
- ✅ Confirmar acciones
- ✅ Indicar si algo falló
- ✅ Ofrecer solución si hay error

**Ejemplo:**
```
Archivo actualizado ✅
¿Siguiente?
```

Es cordial, profesional y ultra-conciso.

---

## 📋 CONVENCIONES ESTABLECIDAS

### **1. Fecha y Hora en TODOS los Documentos iniciar con AG- para distingui los nuevos**

**Formato estándar para headers:**

```markdown
**Última actualización:** 17 de Diciembre de 2025 - 10:40 tiempo cdmx
**Versión:** v2.95
**Actualizado por:** AI Assistant
```

**¿Dónde va?**
- Al inicio de CADA documento que se actualice
- Justo debajo del título principal (H1)

**¿Cuándo actualizar?**
- SIEMPRE que se modifique el documento
- Aunque sea un cambio pequeño

**Zona horaria:**
- SIEMPRE usar CST (Ciudad de México)
- Formato: `10:20 CST`
- NO usar UTC

### **2. Versionado del Proyecto**

**Esquema:** v2.XX

**Ejemplos correctos:**
- ✅ v2.94
- ✅ v2.94
- ✅ v2.100

**Ejemplos incorrectos:**
- ❌ v91 (falta el 2.)
- ❌ v2.0.92 (no usamos tercer dígito)
- ❌ v1.92 (ya estamos en v2)

**Incremento:**
- Cambio pequeño: v2.94 → v2.94
- Cambio mayor: v2.94 → v2.95 o v2.100
- Hito importante: v2.94 → v3.0 (cuando llegue el momento)

---

## 📂 DOCUMENTOS OBLIGATORIOS A ACTUALIZAR

### **🔥 SIEMPRE actualizar estos 5:**

#### **1. README.md** 📖 CONTEXTO PRINCIPAL (GITHUB)
**Ubicación:** `operadora-dev/README.md`
**Importancia:** ⭐⭐⭐⭐⭐ MÁS CRÍTICO

**Propósito:**
- Cara del proyecto en GitHub
- Primera impresión para cualquiera que vea el repo
- Contexto general del proyecto
- Instrucciones de instalación y uso
- **DEBE servir como contexto completo del proyecto**

**Cuándo actualizar:**
- ✅ EN CADA CAMBIO IMPORTANTE
- ✅ Al actualizar cualquier otro documento
- ✅ Cuando cambia el setup/instalación
- ✅ Cuando hay nuevas variables de entorno
- ✅ Cuando se agregan comandos importantes
- ✅ Cuando cambia la arquitectura
- ✅ Cuando cambia el progreso general

**Qué actualizar:**
- Header (fecha, hora CST, versión)
- Badge de versión (v2.XX)
- Descripción del proyecto
- Estado y progreso actual
- Instrucciones de instalación
- Variables de entorno (.env)
- Comandos importantes
- Arquitectura
- Stack tecnológico
- Estado de módulos

#### **2. CONTEXTO-PROYECTO-MASTER.md** 🎯 MEMORIA INTERNA
**Ubicación:** `.same/CONTEXTO-PROYECTO-MASTER.md`
**Importancia:** ⭐⭐⭐⭐⭐ CRÍTICO

**Propósito:**
- Memoria completa del proyecto
- Primera lectura para nuevos agentes
- Fuente de verdad sobre accesos, BD, convenciones
- Contexto interno detallado

**Cuándo actualizar:**
- ✅ Al final de CADA sesión de cambios
- ✅ Cuando cambia algo crítico (BD, accesos, estructura)
- ✅ Cuando se agrega/quita un módulo
- ✅ Cuando cambia el progreso general

**Qué actualizar:**
- Header (fecha, hora, versión)
- Sección "Estado Actual del Proyecto"
- Tabla de progreso por módulo
- Accesos y credenciales si cambiaron
- Comandos si hay nuevos
- Datos en BD actualizados

#### **3. todos.md** ✅ CHANGELOG Y PENDIENTES
**Ubicación:** `.same/todos.md`
**Importancia:** ⭐⭐⭐⭐ MUY IMPORTANTE

**Propósito:**
- Changelog detallado de versiones
- Lista de tareas pendientes
- Hitos alcanzados
- Progreso de desarrollo

**Cuándo actualizar:**
- ✅ EN CADA CAMBIO (tareas, hitos, versiones)
- ✅ Al completar una tarea
- ✅ Al crear nueva versión
- ✅ Al alcanzar un hito

**Qué actualizar:**
- Header (fecha, hora, versión)
- Changelog de cada versión
- Tareas completadas (✅)
- Tareas pendientes
- Hitos alcanzados
- Próximos pasos

#### **4. PROGRESO-DESARROLLO-ACTUALIZADO.md** 📊 TRACKING
**Ubicación:** `.same/PROGRESO-DESARROLLO-ACTUALIZADO.md`
**Importancia:** ⭐⭐⭐⭐ IMPORTANTE

**Propósito:**
- Tracking detallado de progreso
- Tabla de % por módulo
- Historial de hitos
- Métricas del proyecto

**Cuándo actualizar:**
- ✅ Cada versión nueva (v2.94, v2.95, etc.)
- ✅ Cuando se completa un módulo
- ✅ Cuando cambian los porcentajes

**Qué actualizar:**
- Header (fecha, hora, versión)
- Tabla de progreso (%)
- Sección de hitos alcanzados
- Lista de APIs/componentes nuevos

#### **5. ESPECIFICACION-COMPLETA.md** 📋 SPECS TÉCNICAS
**Ubicación:** `.same/ESPECIFICACION-COMPLETA.md`
**Importancia:** ⭐⭐⭐ IMPORTANTE

**Propósito:**
- Specs técnicas completas
- Flujos de negocio
- APIs documentadas
- Reglas de negocio

**Cuándo actualizar:**
- ✅ Cuando se agrega una nueva feature
- ✅ Cuando cambia un flujo de negocio
- ✅ Cuando se documenta una nueva API
- ✅ Cuando cambian reglas de validación

**Qué actualizar:**
- Header (fecha, hora, versión)
- Sección de la feature nueva
- Diagramas si cambian
- Endpoints si hay nuevos
- Reglas de validación

---

## 📝 OTROS DOCUMENTOS IMPORTANTES

### **ESTADO-DEL-PROYECTO.md**
**Ubicación:** `operadora-dev/ESTADO-DEL-PROYECTO.md`

**Propósito:**
- Clarificación del estado actual
- Qué directorios usar
- Qué BD usar

**Cuándo actualizar:**
- Cuando hay confusión sobre el ambiente
- Cuando cambia algo estructural
- Cuando se reorganiza

### **Documentos de Versión**
**Ubicación:** `.same/`

**Ejemplos:**
- `LISTO-PARA-PROBAR-v2.94.md`
- `RESUMEN-CONSOLIDACION-v2.94.md`

**Propósito:**
- Snapshot de cada versión importante
- Qué se hizo en esa versión
- Instrucciones específicas

**Cuándo crear:**
- Al alcanzar un hito importante
- Al consolidar el ambiente
- Al completar un módulo grande

---

## 🔄 FLUJO DE ACTUALIZACIÓN

### **Al Hacer Cambios:**

```
1. Hacer cambios en código
   ↓
2. Probar localmente
   ↓
3. Crear versión (versioning tool)
   ↓
4. Actualizar 5 documentos obligatorios:
   - README.md 📖 MÁS CRÍTICO
   - CONTEXTO-PROYECTO-MASTER.md 🎯 CRÍTICO
   - todos.md ✅
   - PROGRESO-DESARROLLO-ACTUALIZADO.md 📊
   - ESPECIFICACION-COMPLETA.md 📋 (si aplica)
   ↓
5. Actualizar todos.md con changelog
   ↓
6. Actualizar footer en page.tsx
   ↓
7. Commit a Git (si es hito importante)
```

### **Template para Actualizar Header:**

```markdown
**Última actualización:** [Obtener con comando de fecha CST]
**Versión:** v2.XX [Versión actual]
**Actualizado por:** AI Assistant
```

**Comando para obtener fecha:**
```bash
TZ='America/Mexico_City' date '+%d de %B de %Y - %H:%M CST'
# Resultado: 17 de December de 2025 - 10:20 CST
```

---

## ✅ CHECKLIST DE DOCUMENTACIÓN

Al finalizar cambios, verificar:

- [ ] Header actualizado con fecha/hora CST
- [ ] Versión correcta (v2.XX)
- [ ] CONTEXTO-PROYECTO-MASTER.md actualizado
- [ ] PROGRESO-DESARROLLO-ACTUALIZADO.md actualizado
- [ ] README.md actualizado (si aplica)
- [ ] ESPECIFICACION-COMPLETA.md actualizado (si aplica)
- [ ] todos.md con changelog de la versión
- [ ] Footer en page.tsx con versión correcta

---

## 🎯 REGLAS DE ORO

### **1. SIEMPRE fecha y hora CST**
```
✅ 17 de Diciembre de 2025 - 10:20 CST
❌ 17 Dec 2025, 16:20 UTC
```

### **2. SIEMPRE versión v2.XX**
```
✅ v2.94
❌ v91
❌ v2.0.92
```

### **3. SIEMPRE actualizar CONTEXTO-PROYECTO-MASTER.md**
```
Es el documento MÁS IMPORTANTE
Debe estar SIEMPRE actualizado
Es la primera lectura para nuevos agentes
```

### **4. SIEMPRE incluir "Actualizado por"**
```markdown
**Actualizado por:** AI Assistant
**Actualizado por:** Sergio Aguilar
```

---

## 📊 JERARQUÍA DE DOCUMENTOS

### **Nivel 1 - Críticos (SIEMPRE leer/actualizar)**
1. 🔥 CONTEXTO-PROYECTO-MASTER.md
2. 🔥 PROGRESO-DESARROLLO-ACTUALIZADO.md
3. 🔥 README.md
4. 🔥 ESPECIFICACION-COMPLETA.md

### **Nivel 2 - Importantes (actualizar frecuentemente)**
5. todos.md
6. ESTADO-DEL-PROYECTO.md
7. SISTEMA-DOCUMENTACION.md (este doc)

### **Nivel 3 - Por Versión (crear según necesidad)**
8. LISTO-PARA-PROBAR-v2.XX.md
9. RESUMEN-CONSOLIDACION-v2.XX.md
10. GUIA-PRUEBAS-USUARIOS-ROLES.md

### **Nivel 4 - Referencia (consultar según necesidad)**
11. INSTRUCCIONES-PRUEBAS.md
12. ESTADO-ACTUAL-v86.md (versiones anteriores)
13. Otros documentos históricos

---

## 💡 CONSEJOS

### **Para AI Assistants:**

1. **Leer CONTEXTO-PROYECTO-MASTER.md PRIMERO**
   - Es tu memoria del proyecto
   - Tiene toda la info crítica
   - Se actualiza al final de cada sesión

2. **Actualizar headers SIEMPRE**
   - Aunque el cambio sea pequeño
   - Usar comando de fecha CST
   - Verificar versión correcta

3. **Documentar cambios importantes**
   - En CONTEXTO-PROYECTO-MASTER.md
   - En PROGRESO-DESARROLLO-ACTUALIZADO.md
   - En todos.md (changelog)

4. **No crear documentos innecesarios**
   - Usar los existentes
   - Solo crear si es realmente necesario
   - Seguir la nomenclatura v2.XX

### **Para el Cliente (Sergio):**

1. **Verificar que cada cambio tenga:**
   - Fecha y hora CST actualizada
   - Versión correcta
   - Los 4 documentos principales actualizados

2. **Pedir al agente que lea CONTEXTO-PROYECTO-MASTER.md**
   - Si empieza sin contexto
   - Si hay confusión
   - Si pregunta cosas básicas

3. **Solicitar actualizaciones de documentación**
   - Al final de cada sesión
   - Cuando se completa algo importante
   - Antes de cerrar un issue/ticket

---

## 📞 EJEMPLO DE SOLICITUD

**Buena solicitud:**
```
"Por favor actualiza CONTEXTO-PROYECTO-MASTER.md
con los cambios que hicimos hoy.
No olvides poner la fecha y hora CST."
```

**Solicitud completa:**
```
"Acabamos de completar el módulo X.
Por favor actualiza:
1. CONTEXTO-PROYECTO-MASTER.md
2. PROGRESO-DESARROLLO-ACTUALIZADO.md
3. todos.md con el changelog

Usa la versión v2.94 y hora CST."
```

---

## 🔍 VERIFICACIÓN RÁPIDA

### **¿Está bien documentado?**

```bash
# Verificar header en CONTEXTO-PROYECTO-MASTER.md
head -5 .same/CONTEXTO-PROYECTO-MASTER.md

# Debe mostrar:
# **Última actualización:** [Fecha] - [Hora] CST
# **Versión:** v2.XX
# **Actualizado por:** [Quien]

# Verificar versión en page.tsx
grep "v2\." src/app/page.tsx

# Debe mostrar:
# v2.94 | Build: 17 Dic 2025, 10:20 CST
```

---

## 🔌 INTEGRACIONES Y FLUJO DE DEPLOYMENT

### **🎯 CRITICAL: Cómo Funciona el Ecosistema**

**SAME** tiene integraciones directas con servicios externos que permiten un flujo automatizado de desarrollo y deployment.

### **1. SAME → GitHub (Integración Activa)**

**¿Qué es?**
- SAME tiene integración directa con GitHub
- Permite hacer push automático desde el entorno de SAME
- No necesitas configurar git manualmente cada vez

**¿Cómo usarla?**
```
SAME tiene botón/herramienta de integración con GitHub
→ Configuras una vez con tu token de GitHub
→ SAME puede hacer push directamente
→ No necesitas git commands manuales
```

**Para futuros agentes:**
- ✅ SAME ya está conectado a GitHub
- ✅ El push se hace desde SAME directamente
- ✅ Repositorio: https://github.com/sergioaguilargranados-ai/operadora-dev
- ✅ Branch principal: `main`

### **2. SAME → Neon (Base de Datos)**

**¿Qué es?**
- SAME tiene integración directa con Neon PostgreSQL
- Base de datos en la nube
- Acceso directo desde SAME

**Configuración:**
```
Base de datos: Neon PostgreSQL
Host: ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech
Database: neondb
```

**Para futuros agentes:**
- ✅ SAME ya está conectado a Neon
- ✅ La BD es accesible desde SAME y Vercel
- ✅ Es la ÚNICA base de datos (no hay local)

### **3. GitHub → Vercel (Deploy Automático)**

**¿Qué es?**
- GitHub y Vercel están comunicados
- Cada push a GitHub dispara un deploy automático en Vercel
- No necesitas hacer deploy manual

**Flujo automático:**
```
1. Haces cambios en código (en SAME)
2. Push a GitHub (desde SAME con integración)
3. GitHub notifica a Vercel
4. Vercel hace build automático
5. Deploy a producción en app.asoperadora.com
```

**Para futuros agentes:**
- ✅ GitHub y Vercel YA están conectados
- ✅ El deploy es AUTOMÁTICO al hacer push
- ✅ URL de producción: **app.asoperadora.com**
- ✅ NO necesitas hacer deploy manual

### **4. Flujo Completo de Trabajo**

```
┌─────────────┐
│    SAME     │ (Desarrollo)
└──────┬──────┘
       │ Push automático (integración GitHub)
       ▼
┌─────────────┐
│   GitHub    │ (Repositorio)
└──────┬──────┘
       │ Webhook automático
       ▼
┌─────────────┐
│   Vercel    │ (Deploy automático)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ app.asoperadora.com │ (Producción)
└─────────────┘
       │
       │ Conecta a
       ▼
┌─────────────┐
│    Neon     │ (Base de datos)
└─────────────┘
```

### **5. URLs Importantes**

| Servicio | URL | Propósito |
|----------|-----|-----------|
| **GitHub** | https://github.com/sergioaguilargranados-ai/operadora-dev | Repositorio de código |
| **Vercel (Producción)** | https://app.asoperadora.com | Aplicación en vivo |
| **Same (Dev)** | http://localhost:3000 | Desarrollo local |
| **Neon (DB)** | ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech | Base de datos |

### **6. Workflow para Futuros Agentes de SAME**

**Al hacer cambios:**

1. **Desarrollar** en SAME (localhost:3000)
2. **Probar** localmente
3. **Versionar** con `versioning` tool
4. **Actualizar documentos** (5 obligatorios)
5. **Push a GitHub** usando integración de SAME
6. **Esperar** deploy automático en Vercel (2-3 minutos)
7. **Verificar** en app.asoperadora.com

**NO necesitas:**
- ❌ Configurar git manualmente cada vez
- ❌ Hacer deploy manual a Vercel
- ❌ Conectar a BD local (usar Neon directamente)
- ❌ Preocuparte por webhooks (ya configurados)

### **7. Comandos SAME (Para Agentes)**

**Push a GitHub:**
```
Usar integración de SAME → GitHub
(No usar git commands manuales)
```

**Variables de entorno:**
```
DATABASE_URL → Ya configurado para Neon
Vercel tiene las MISMAS variables
```

**Verificar deployment:**
```
1. Ir a app.asoperadora.com
2. Verificar versión en footer (v2.XX)
3. Probar funcionalidades
```

### **8. Troubleshooting Rápido**

**Problema: Push no funciona**
```
→ Verificar integración SAME-GitHub está activa
→ Verificar permisos del token GitHub
```

**Problema: Deploy no ocurre**
```
→ Verificar webhook GitHub-Vercel
→ Ver logs en Vercel dashboard
```

**Problema: BD no conecta**
```
→ Verificar DATABASE_URL en .env.local
→ Mismo DATABASE_URL debe estar en Vercel
```

### **9. Reglas de Oro para Agentes**

1. ✅ **SIEMPRE usar integración SAME → GitHub** (no git manual)
2. ✅ **SIEMPRE esperar deploy automático** (no deploy manual)
3. ✅ **SIEMPRE verificar en app.asoperadora.com** después del push
4. ✅ **SIEMPRE usar Neon DB** (no BD local)
5. ✅ **SIEMPRE actualizar los 5 documentos** antes del push

---

## 📚 RESUMEN

### **Los 5 Obligatorios:**
1. 📖 README.md ⭐⭐ MÁS CRÍTICO
2. 🎯 CONTEXTO-PROYECTO-MASTER.md ⭐ CRÍTICO
3. ✅ todos.md
4. 📊 PROGRESO-DESARROLLO-ACTUALIZADO.md
5. 📋 ESPECIFICACION-COMPLETA.md

### **Formato de Header:**
```markdown
**Última actualización:** [Fecha] - [Hora] CST
**Versión:** v2.XX
**Actualizado por:** AI Assistant
```

### **Convenciones:**
- ✅ Versión: v2.XX
- ✅ Hora: CST (Ciudad de México)
- ✅ Fecha: "17 de Diciembre de 2025"
- ✅ Actualizar SIEMPRE que cambies algo

---

## 📱 COMPATIBILIDAD CON APP MÓVIL

### **⚠️ REGLA CRÍTICA: Backend unificado Web + Móvil**

A partir de v2.214, el backend debe soportar tanto la aplicación web como la futura aplicación móvil (React Native). **Todo cambio en APIs debe considerar ambas plataformas.**

### **🎯 Principios de Diseño**

| Principio | Descripción |
|-----------|-------------|
| **Un solo backend** | NO crear backend separado para móvil |
| **APIs REST consistentes** | Mismo formato de respuesta para web y móvil |
| **JWT estándar** | Authorization header con Bearer token |
| **Retrocompatibilidad** | Cambios no deben romper clientes existentes |

### **📋 Checklist para CADA nuevo endpoint**

Antes de crear o modificar un endpoint API, verificar:

- [ ] **CORS:** ¿Funciona con llamadas cross-origin?
- [ ] **Auth:** ¿Usa Authorization header (no cookies exclusivamente)?
- [ ] **Respuesta:** ¿Usa formato estándar `{ success, data, error, meta }`?
- [ ] **Errores:** ¿Retorna códigos de error consistentes?
- [ ] **Paginación:** ¿Usa formato estándar (page/limit o cursor)?
- [ ] **Datos:** ¿Los campos son los mínimos necesarios?

### **🔧 Formato de Respuesta Estándar**

```typescript
// TODAS las APIs deben usar este formato
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;      // 'AUTH_INVALID', 'NOT_FOUND', etc.
    message: string;   // Mensaje para mostrar al usuario
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### **🔐 Autenticación Móvil**

| Método | Web | Móvil | Estado |
|--------|-----|-------|--------|
| JWT en header | ✅ | ✅ | Funcional |
| Refresh tokens | ❌ | ✅ Requerido | **PENDIENTE** |
| Biométrico | N/A | ✅ Requerido | **PENDIENTE** |
| OAuth (Google/Apple) | ✅ | ✅ | Funcional |

### **📲 Push Notifications**

Para soportar push notifications, cada usuario puede tener múltiples device tokens:

```sql
-- Tabla requerida (PENDIENTE de crear)
device_tokens (
  user_id → users.id,
  device_token VARCHAR,
  platform ENUM('ios', 'android', 'web'),
  is_active BOOLEAN
)
```

### **⚠️ Errores Comunes a Evitar**

| Error | Problema | Solución |
|-------|----------|----------|
| Cookies-only auth | Móvil no maneja cookies bien | Usar Authorization header |
| Respuestas HTML en error | Móvil espera JSON | Siempre retornar JSON |
| CORS no configurado | App móvil bloqueada | Configurar headers en next.config.js |
| Sin refresh token | Usuario debe login constantemente | Implementar refresh tokens |
| Datos excesivos | Consume datos móviles | Crear endpoints optimizados |

### **📖 Documentación de Referencia**

- **Preparación backend:** `.same/BACKEND-MOVIL-PREPARACION.md`
- **Estrategia móvil:** `.same/APP-MOVIL-ESTRATEGIA.md`
- **Comparativa Expedia:** `.same/COMPARATIVA-APP-MOVIL-EXPEDIA.md`

### **🚦 Estado de Preparación**

| Componente | Estado | Prioridad |
|------------|--------|-----------|
| CORS headers | ⏳ Pendiente | Alta |
| Refresh tokens | ⏳ Pendiente | Alta |
| Device tokens | ⏳ Pendiente | Alta |
| Respuestas estándar | ⏳ Pendiente | Media |
| Endpoints optimizados | ⏳ Pendiente | Baja |

**Última actualización sección móvil:** 10 de Enero de 2026

---

## 📚 RESUMEN

### **Los 5 Obligatorios:**
1. 📖 README.md ⭐⭐ MÁS CRÍTICO
2. 🎯 CONTEXTO-PROYECTO-MASTER.md ⭐ CRÍTICO
3. ✅ todos.md
4. 📊 PROGRESO-DESARROLLO-ACTUALIZADO.md
5. 📋 ESPECIFICACION-COMPLETA.md

### **Formato de Header:**
```markdown
**Última actualización:** [Fecha] - [Hora] CST
**Versión:** v2.XX
**Actualizado por:** AI Assistant
```

### **Convenciones:**
- ✅ Versión: v2.XX
- ✅ Hora: CST (Ciudad de México)
- ✅ Fecha: "17 de Diciembre de 2025"
- ✅ Actualizar SIEMPRE que cambies algo

---

**Este sistema de documentación garantiza:**
- 📝 Claridad total sobre qué cambió y cuándo
- 🔄 Continuidad entre sesiones
- 🎯 Contexto completo para nuevos agentes
- ⏰ Trazabilidad temporal precisa
- 📱 Compatibilidad web + móvil

---

**Documento creado:** 17 de Diciembre de 2025 - 10:20 CST
**Última actualización:** 10 de Enero de 2026 - 14:30 CST
**Versión:** v2.214
**Por:** AI Assistant
**Estado:** ✅ Sistema de documentación definido + Reglas móvil agregadas
