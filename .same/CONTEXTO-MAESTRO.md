# 📘 CONTEXTO MAESTRO DEL PROYECTO (AS OPERADORA)

**Última actualización:** 15 de Enero de 2026 - 01:51 CST  
**Versión:** v2.225  
**Idioma Oficial:** Español 🇪🇸

---

## 🎯 OBJETIVO PRINCIPAL
Este documento unifica **todas las reglas, contextos y procedimientos** operativos del proyecto AS Operadora (Web & Móvil). Es la **FUENTE DE VERDAD** para cualquier agente o desarrollador.

---

## 🚨 REGLAS INQUEBRANTABLES (CRÍTICO)

### 1. 📂 ESTRUCTURA DE DIRECTORIOS
Todo el código productivo vive en `operadora-dev/`. **NUNCA** crear archivos en la raíz del workspace ni directorios anidados repetidos.

```
/home/project/                      ← RAÍZ DEL WORKSPACE
├── .git/                           ← Repositorio GIT (¡AQUÍ!)
├── operadora-dev/                  ← CÓDIGO FUENTE (Next.js)
│   ├── src/
│   ├── .same/                      ← Documentación
│   ├── public/
│   ├── package.json
│   └── next.config.js
└── uploads/                        ← Temporales
```
**Comando de verificación:** `ls /home/project/operadora-dev/operadora-dev` (Si retorna algo, **ESTÁ MAL**).

### 2. 🗄️ BASE DE DATOS ÚNICA
Existe **UNA SOLA** base de datos (PostgreSQL en Neon) para **TODOS** los ambientes (Local, Preview, Producción).
- **Prohibido** crear bases de datos adicionales.
- `DATABASE_URL` en `.env.local` debe coincidir con la de Vercel (Production).

### 3. 🗣️ IDIOMA Y COMUNICACIÓN
- **Documentación:** 100% Español.
- **Respuestas al Usuario:** 100% Español.
- **Estilo:** Breve, directo y profesional. "Acción realizada" > "He procedido a realizar...".
- **Formato de Respuesta:**
  ```markdown
  Acción: [Breve descripción]
  Estado: ✅ Listo / ❌ Error
  Siguiente: [Próximo paso]
  ```

### 4. 🔢 VERSIONAMIENTO (v2.XX)
- Esquema: `v[Mayor].[Menor]` (Ej: v2.224).
- **Siempre** actualizar el header de los documentos modificados con la nueva versión y fecha (CST).
- **Siempre** actualizar el footer en `src/app/page.tsx` con la versión visible.

---

## 🛠️ ARQUITECTURA TÉCNICA

### 🌐 WEB (Next.js 15)
- **Framework:** Next.js 15 (App Router).
- **UI:** Tailwind CSS + Shadcn/ui.
- **Auth:** JWT Custom (AuthService).
- **Pagos:** Stripe (Intentos), PayPal (Órdenes), MercadoPago.
- **Integraciones:** Amadeus (Vuelos/Hoteles), Facturama (Facturación).

### 📱 MÓVIL (React Native - Planeado)
- **Estrategia:** React Native + Expo.
- **Backend:** Usa el **MISMO** backend de la web.
- **Auth:** Compartida (JWT). Requiere endpoints `refresh_token` y CORS habilitado.

---

## 📚 DOCUMENTACIÓN REQUERIDA
Al finalizar una tarea significativa, actualizar (en orden):

1.  **`CONTEXTO-MAESTRO.md`** (Este documento).
2.  **`README.md`** (Cara pública en GitHub).
3.  **`todos.md`** (Log de cambios y pendientes).
4.  **`PROGRESO-DESARROLLO-ACTUALIZADO.md`** (Métricas).

---

## 🔄 FLUJO DE TRABAJO (WORKFLOW)

1.  **Leer Contexto:** Antes de escribir una línea de código, leer este archivo.
2.  **Planificar:** Usar `task_boundary` para definir qué se hará.
3.  **Ejecutar:** Realizar cambios en `operadora-dev/`.
4.  **Verificar:** Probar (compilación, lógica).
5.  **Documentar:** Actualizar docs y headers (Fecha CST, Versión).
6.  **Notificar:** Informar al usuario de forma concreta.

---

## ⚡ COMANDOS ÚTILES

- **Dev Server:** `cd operadora-dev && bun dev`
- **Build:** `cd operadora-dev && bun run build`
- **Lint:** `cd operadora-dev && bun run lint`
- **Git Push:** `cd /home/project && git add . && git commit -m "feat: descripción" && git push origin main`

---

**Nota:** Si encuentras discrepancias entre documentos, **este archivo (CONTEXTO-MAESTRO.md) tiene prioridad**.
