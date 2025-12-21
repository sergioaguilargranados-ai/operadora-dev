# 🚀 PASOS PARA INTEGRAR APIs REALES - RESUMEN EJECUTIVO

**Fecha:** 11 de Diciembre de 2025
**Tiempo estimado:** 30 minutos
**Nivel:** Principiante ✅

---

## 🎯 OBJETIVO

Reemplazar los datos mock de vuelos con datos reales de Amadeus API.

**Resultado final:**
- ✅ Búsqueda de vuelos con 400+ aerolíneas reales
- ✅ Precios actualizados en tiempo real
- ✅ Información real de horarios, escalas, equipaje
- ✅ Gratis en desarrollo (Amadeus Sandbox)

---

## ⏱️ RESUMEN RÁPIDO (5 PASOS)

```
1. Registrarte en Amadeus (5 min)          → Obtener API Key
2. Configurar credenciales (2 min)         → Agregar a .env.local
3. Actualizar código (10 min)              → Conectar API real
4. Testing local (5 min)                   → Verificar que funciona
5. Deploy a Vercel (5 min)                 → Subir a producción
```

**Total:** ~30 minutos

---

## 📝 PASO 1: REGISTRARTE EN AMADEUS (5 MINUTOS)

### 1.1 Crear cuenta

1. Ve a: **https://developers.amadeus.com/register**

2. Llena el formulario:
   ```
   Nombre:    Tu nombre completo
   Email:     tu@email.com
   Compañía:  AS Operadora de Viajes y Eventos
   Tipo:      Travel Agency
   ```

3. Click **"Sign Up"**

4. **Confirma tu email** (revisa tu bandeja de entrada)

### 1.2 Crear Self-Service App

1. Login en: **https://developers.amadeus.com/**

2. Click en **"My Self-Service Workspace"**

3. Click en **"Create new app"**

4. Llena:
   ```
   App Name:     AS Operadora Production
   App Type:     Travel Agency
   Callback URL: https://app.asoperadora.com/callback
   ```

5. Click **"Create"**

### 1.3 Copiar Credenciales

Verás algo como:

```
API Key (Client ID):      H6eFZkHCkvuT1xJUBaIdNv4S9SKrLAWU
API Secret (Client Secret): Is953VcZUoszuQEB
```

**⚠️ GUARDA ESTAS CREDENCIALES** - Las necesitarás en el siguiente paso.

✅ **Completado Paso 1** - Tienes tus credenciales de Amadeus

---

## 🔧 PASO 2: CONFIGURAR CREDENCIALES (2 MINUTOS)

### 2.1 Crear archivo .env.local

En la raíz de tu proyecto:

```bash
# Copiar plantilla
cp .env.example .env.local
```

### 2.2 Editar .env.local

Abre `.env.local` y agrega tus credenciales:

```bash
# Amadeus API
AMADEUS_API_KEY=H6eFZkHCkvuT1xJUBaIdNv4S9SKrLAWU
AMADEUS_API_SECRET=Is953VcZUoszuQEB
AMADEUS_SANDBOX=true
```

Reemplaza con tus credenciales reales del Paso 1.

### 2.3 Verificar configuración

```bash
# Ejecutar script de verificación
node check-api-config.js
```

Deberías ver:
```
✅ Amadeus (Vuelos)
   ✓ AMADEUS_API_KEY: H6eF...LWWU
   ✓ AMADEUS_API_SECRET: Is95...uQEB
   ✓ AMADEUS_SANDBOX: true
```

✅ **Completado Paso 2** - Credenciales configuradas correctamente

---

## 💻 PASO 3: ACTUALIZAR CÓDIGO (10 MINUTOS)

### Opción A: Hacerlo automáticamente (RECOMENDADO)

**Dime:** "Actualiza el código para usar Amadeus API"

Y yo me encargo de todo automáticamente.

### Opción B: Hacerlo manualmente

1. Edita `src/app/api/flights/route.ts`
2. Reemplaza el contenido con el código de: `.same/INTEGRACION-APIS-REALES.md` (Sección 3.1)

3. Edita `src/app/api/search/route.ts`
4. Reemplaza la función `searchFlights` con el código de: `.same/INTEGRACION-APIS-REALES.md` (Sección 3.2)

✅ **Completado Paso 3** - Código actualizado para usar API real

---

## 🧪 PASO 4: TESTING LOCAL (5 MINUTOS)

### 4.1 Iniciar servidor

```bash
bun run dev
```

### 4.2 Probar en el navegador

1. Ve a: **http://localhost:3000**
2. Click en pestaña **"Vuelos"**
3. Busca:
   ```
   Origen:  MEX
   Destino: CUN
   Salida:  Cualquier fecha futura
   ```
4. Click **"Buscar"**

### 4.3 Verificar resultados

Deberías ver:
- ✅ Lista de vuelos reales
- ✅ Aerolíneas: Aeroméxico, Volaris, United, etc.
- ✅ Precios reales en MXN
- ✅ Horarios reales

### 4.4 Verificar logs

En tu terminal donde corre el servidor, deberías ver:

```
✅ Conectado a Amadeus API
🔍 Buscando vuelos: MEX → CUN
✅ Encontrados 15 vuelos
```

✅ **Completado Paso 4** - API funcionando en local

---

## 🚀 PASO 5: DEPLOY A VERCEL (5 MINUTOS)

### 5.1 Commit y push

```bash
git add .
git commit -m "feat: Integrate Amadeus API for real flight data"
git push origin main
```

### 5.2 Configurar en Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Tu proyecto **operadora-dev**
3. **Settings** → **Environment Variables**
4. Agrega las 3 variables:

   ```
   AMADEUS_API_KEY        = H6eFZkHCkvuT1xJUBaIdNv4S9SKrLAWU
   AMADEUS_API_SECRET     = Is953VcZUoszuQEB
   AMADEUS_SANDBOX        = true
   ```

5. Marca: ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### 5.3 Redeploy

1. **Deployments** → Latest
2. **"..."** → **"Redeploy"**
3. Espera 2-3 minutos

### 5.4 Verificar en producción

1. Ve a: **https://app.asoperadora.com**
2. Busca vuelos como en testing local
3. Deberías ver datos reales

✅ **Completado Paso 5** - API real funcionando en producción

---

## 🎉 ¡COMPLETADO!

### ✅ Lo que tienes ahora:

- ✅ Búsqueda de vuelos con datos REALES
- ✅ 400+ aerolíneas disponibles
- ✅ Precios actualizados en tiempo real
- ✅ Gratis e ilimitado (Amadeus Sandbox)
- ✅ Funcionando en producción

### 📊 Pruébalo:

```
https://app.asoperadora.com

Busca: MEX → CUN
Verás vuelos reales de Aeroméxico, Volaris, United, etc.
```

---

## 🔄 PRÓXIMOS PASOS OPCIONALES

### Mejorar con más proveedores:

1. **Agregar Kiwi.com** (vuelos low-cost)
   - Registrarse en: https://tequila.kiwi.com/portal/login
   - Agregar `KIWI_API_KEY` a variables de entorno
   - El código ya soporta múltiples proveedores

2. **Agregar caching** (mejorar velocidad)
   - Redis o Vercel KV
   - Cachear búsquedas populares por 5-10 minutos

3. **Cambiar a Amadeus Production** (cuando estés listo)
   - Cambiar `AMADEUS_SANDBOX=false`
   - Costo: $0.002 por búsqueda (~$2 por 1000 búsquedas)
   - Permite hacer reservas reales

---

## 🆘 ¿PROBLEMAS?

### Error: "No flight providers configured"
→ Verifica que las variables de entorno estén bien configuradas

### Error: "Authentication failed"
→ Verifica que las credenciales sean correctas (sin espacios extra)

### Los vuelos tardan mucho en cargar
→ Es normal, APIs reales tardan 2-5 segundos. Agrega loading states.

### No encuentro vuelos para ciertas rutas
→ No todas las rutas tienen vuelos directos. Prueba rutas populares primero.

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, consulta:
- **Guía completa:** `.same/INTEGRACION-APIS-REALES.md`
- **Guía de registro:** `.same/GUIA-REGISTRO-APIS-PASO-A-PASO.md`
- **Documentación Amadeus:** https://developers.amadeus.com/self-service

---

## ✉️ ¿NECESITAS AYUDA?

**Opción 1:** Dime en qué paso estás y te ayudo

**Opción 2:** Dime "Hazlo automáticamente" y actualizo el código por ti

---

**¡Éxito!** 🚀

Una vez completado, tendrás una plataforma de viajes profesional con datos reales.
