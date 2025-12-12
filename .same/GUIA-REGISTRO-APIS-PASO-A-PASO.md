# 🔑 GUÍA DE REGISTRO DE APIS - PASO A PASO

**Fecha:** 20 de Noviembre de 2025
**Objetivo:** Registrarse en todas las APIs de proveedores para obtener credenciales

---

## 📋 ORDEN RECOMENDADO DE REGISTRO

1. **Amadeus** ⭐ PRIORITARIO (Sandbox gratis)
2. **Kiwi.com** ✅ RECOMENDADO (Gratis para desarrollo)
3. **Expedia** ✅ RECOMENDADO (Sandbox gratis)
4. **Booking.com** ⏳ OPCIONAL (Requiere aprobación manual)

---

## 1️⃣ AMADEUS API - Vuelos (PRIORITARIO)

### **¿Por qué Amadeus primero?**
- ✅ Sandbox **completamente gratis**
- ✅ Aprobación **instantánea**
- ✅ 400+ aerolíneas incluidas
- ✅ Documentación excelente
- ✅ Puedes empezar a probar **hoy mismo**

---

### **PASO A PASO - Amadeus:**

#### **1. Crear cuenta**
📌 https://developers.amadeus.com/register

- Haz clic en "Sign Up"
- Llena el formulario:
  - Nombre completo
  - Email (usa email corporativo si tienes)
  - Contraseña fuerte
  - Compañía: "AS Operadora de Viajes y Eventos"
  - Tipo: "Travel Agency" o "OTA"

- ✅ Confirma tu email

#### **2. Crear una App (Self-Service)**

Una vez logueado:

1. Ve a **"My Self-Service Workspace"**
2. Haz clic en **"Create new app"**
3. Llena el formulario:
   - **App name:** "AS Operadora - Producción" (o "Testing" para pruebas)
   - **Application type:** "Travel Agency/OTA"
   - **Callback URL:** `https://tudominio.com/callback` (puedes usar cualquier URL por ahora)

4. Haz clic en **"Create"**

#### **3. Obtener credenciales**

Después de crear la app verás:

```bash
API Key (Client ID): xxxxxxxxxxxxxxxxxxxxx
API Secret (Client Secret): yyyyyyyyyyyyyyyyy
```

**⚠️ IMPORTANTE:** Guarda estas credenciales en un lugar seguro.

#### **4. Agregar al proyecto**

Copia las credenciales a tu `.env.local`:

```bash
# Amadeus API - Sandbox (Gratis)
AMADEUS_API_KEY=tu_client_id_aqui
AMADEUS_API_SECRET=tu_client_secret_aqui
AMADEUS_SANDBOX=true  # Cambiar a false para producción
```

#### **5. Testing**

Prueba que funcione:

```bash
# En tu terminal
cd expedia-clone
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-15&adults=2&providers=amadeus"
```

Deberías ver resultados de vuelos reales (en sandbox).

---

### **Limitaciones del Sandbox de Amadeus:**

✅ **Incluye:**
- Búsqueda de vuelos (ilimitada)
- Todos los destinos
- Todas las fechas
- Pricing y availability

❌ **NO incluye:**
- Reservas reales (solo simuladas)
- Emisión de tickets
- PNR reales

**💰 Costo Producción:**
- ~$0.35 USD por búsqueda
- ~$2 USD por reserva
- Prepago o facturación mensual

---

## 2️⃣ KIWI.COM API - Vuelos Low-Cost

### **¿Por qué Kiwi.com?**
- ✅ Aerolíneas low-cost que NO están en Amadeus
- ✅ 800+ aerolíneas
- ✅ Gratis para desarrollo
- ✅ Comisión solo al reservar (3-5%)

---

### **PASO A PASO - Kiwi.com:**

#### **1. Crear cuenta**
📌 https://tequila.kiwi.com/portal/

- Haz clic en "Get Started"
- Llena el formulario:
  - Nombre completo
  - Email
  - Compañía: "AS Operadora"
  - País: México
  - Tipo de negocio: "Travel Agency"

#### **2. Solicitar acceso a API**

1. Una vez logueado, ve a **"API Access"**
2. Llena el formulario de solicitud:
   - **Use case:** "Search and booking flights for Mexican travel agency"
   - **Expected volume:** "100-500 searches/day"
   - **Website:** Tu URL (puede ser temporal)

3. Espera aprobación (normalmente 1-3 días hábiles)

#### **3. Obtener API Key**

Te llegará un email con:

```bash
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **4. Agregar al proyecto**

```bash
# Kiwi.com API
KIWI_API_KEY=tu_kiwi_api_key_aqui
```

#### **5. Testing**

```bash
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=NYC&departureDate=2024-12-15&adults=2&providers=kiwi"
```

---

### **Limitaciones:**

✅ **Incluye:**
- Búsqueda gratis
- Todas las aerolíneas
- Combinaciones multi-aerolínea

❌ **Restricciones:**
- Rate limit: 50 requests/minuto
- Comisión al reservar: 3-5%

---

## 3️⃣ EXPEDIA RAPID API - Vuelos + Hoteles + Paquetes

### **¿Por qué Expedia?**
- ✅ Paquetes con descuento real
- ✅ 500K+ hoteles
- ✅ Sandbox gratis
- ✅ Plataforma integrada

---

### **PASO A PASO - Expedia:**

#### **1. Crear cuenta de Partner**
📌 https://developers.expediagroup.com/

- Haz clic en "Sign Up"
- Llena el formulario:
  - Tipo de cuenta: "Travel Agency"
  - Compañía: "AS Operadora de Viajes y Eventos"
  - Email corporativo
  - RFC (si tienes)

#### **2. Solicitar acceso a Rapid API**

1. Ve a **"My Applications"**
2. Haz clic en **"Request Access"**
3. Selecciona **"Rapid API"**
4. Llena el cuestionario:
   - Modelo de negocio: "OTA/Travel Agency"
   - Volumen esperado: "100-500 bookings/mes"
   - Región: "Latin America"

#### **3. Esperar aprobación**

- Tiempo: 3-7 días hábiles
- Te contactarán por email
- Pueden pedir información adicional

#### **4. Obtener credenciales**

Una vez aprobado:

```bash
API Key: xxxxxxxxxxxxxxxxxxxxx
API Secret: yyyyyyyyyyyyyyyyyy
```

#### **5. Agregar al proyecto**

```bash
# Expedia Rapid API
EXPEDIA_API_KEY=tu_expedia_api_key_aqui
EXPEDIA_API_SECRET=tu_expedia_api_secret_aqui
EXPEDIA_SANDBOX=true  # false para producción
```

#### **6. Testing**

```bash
# Vuelos
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-15&adults=2&providers=expedia"

# Hoteles
curl "http://localhost:3000/api/search?type=hotel&city=Cancún&checkin=2024-12-01&checkout=2024-12-08&guests=2&providers=expedia"

# Paquetes
curl "http://localhost:3000/api/search?type=package&origin=MEX&destination=Cancún&departureDate=2024-12-01&returnDate=2024-12-08&adults=2&providers=expedia"
```

---

### **Limitaciones Sandbox:**

✅ **Incluye:**
- Búsquedas ilimitadas
- Datos de hoteles reales
- Precios simulados
- Paquetes simulados

❌ **NO incluye:**
- Reservas reales
- Transacciones con tarjeta

**💰 Costo Producción:**
- Modelo de comisión variable
- Sin costos fijos
- Pagos por reserva completada

---

## 4️⃣ BOOKING.COM API - Hoteles (OPCIONAL)

### **⚠️ ADVERTENCIA:**
Booking.com tiene un proceso de aprobación **más estricto** y **lento**. Si tienes prisa, usa solo Expedia + Base de datos local para hoteles.

---

### **PASO A PASO - Booking.com:**

#### **1. Registrarse en Affiliate Program**
📌 https://www.booking.com/affiliate

- Crear cuenta de afiliado
- Llenar información fiscal
- Esperar aprobación (1-2 semanas)

#### **2. Solicitar API Access**
📌 https://developers.booking.com/

- Una vez aprobado como afiliado, solicitar API
- Llenar formulario detallado
- Explicar tu modelo de negocio

#### **3. Proceso de verificación**

Booking.com puede pedir:
- Constancia fiscal
- Prueba de dominio
- Screenshots de tu sitio
- Plan de negocio

⏰ **Tiempo total:** 2-4 semanas

#### **4. Obtener credenciales**

```bash
API Key: xxxxxxxxxxxxx
Affiliate ID: yyyyyyyyyy
```

#### **5. Agregar al proyecto**

```bash
# Booking.com API
BOOKING_API_KEY=tu_booking_api_key_aqui
BOOKING_AFFILIATE_ID=tu_affiliate_id_aqui
```

---

### **Modelo de Negocio Booking:**

⚠️ **IMPORTANTE:** Booking.com Affiliate API **NO permite reservas directas**.

**Flujo:**
1. Buscas hoteles en tu web
2. Muestras resultados
3. Usuario hace clic
4. **Rediriges a Booking.com** (con tu affiliate ID)
5. Usuario completa reserva en Booking.com
6. Recibes **comisión del 4-6%** después de la estancia

---

## 📊 RESUMEN DE COSTOS Y TIEMPOS

| API | Tiempo Aprobación | Costo Sandbox | Costo Producción | Prioridad |
|-----|-------------------|---------------|------------------|-----------|
| **Amadeus** | Instantáneo | Gratis ✅ | $0.35/búsqueda | ⭐ ALTA |
| **Kiwi.com** | 1-3 días | Gratis ✅ | 3-5% comisión | ✅ ALTA |
| **Expedia** | 3-7 días | Gratis ✅ | % comisión | ✅ MEDIA |
| **Booking** | 2-4 semanas | Gratis ✅ | 4-6% comisión | ⏳ BAJA |

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### **Semana 1:**
1. ✅ Registrarse en Amadeus (hoy mismo)
2. ✅ Solicitar Kiwi.com
3. ✅ Solicitar Expedia

### **Semana 2:**
4. ⏳ Esperar aprobaciones
5. ⏳ Testing con Amadeus Sandbox
6. ⏳ (Opcional) Solicitar Booking

### **Semana 3-4:**
7. ✅ Activar todas las APIs
8. ✅ Testing integrado
9. ✅ Preparar producción

---

## 🚀 DESPUÉS DE REGISTRARTE

Una vez que tengas las credenciales:

### **1. Agregar a `.env.local`:**

```bash
# Amadeus
AMADEUS_API_KEY=tu_client_id
AMADEUS_API_SECRET=tu_secret
AMADEUS_SANDBOX=true

# Kiwi
KIWI_API_KEY=tu_key

# Expedia
EXPEDIA_API_KEY=tu_key
EXPEDIA_API_SECRET=tu_secret
EXPEDIA_SANDBOX=true

# Booking (opcional)
BOOKING_API_KEY=tu_key
BOOKING_AFFILIATE_ID=tu_id
```

### **2. Reiniciar servidor:**

```bash
cd expedia-clone
bun run dev
```

### **3. Probar búsquedas:**

```bash
# Multi-proveedor
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=NYC&departureDate=2024-12-15&adults=2&providers=amadeus,kiwi,expedia"
```

---

## 📞 SOPORTE

### **Amadeus:**
- Email: developers@amadeus.com
- Docs: https://developers.amadeus.com/self-service/apis-docs
- Chat: Disponible en portal

### **Kiwi.com:**
- Email: support@tequila.kiwi.com
- Docs: https://tequila.kiwi.com/portal/docs
- Slack: Community disponible

### **Expedia:**
- Email: partnersupport@expediagroup.com
- Docs: https://developers.expediagroup.com/docs
- Phone: +1-877-227-7481

### **Booking.com:**
- Email: affiliate.support@booking.com
- Docs: https://developers.booking.com/api/index.html
- Slow response time (48-72hrs)

---

## ✅ CHECKLIST COMPLETO

- [ ] Cuenta Amadeus creada
- [ ] App Amadeus creada
- [ ] Credenciales Amadeus en `.env.local`
- [ ] Testing Amadeus exitoso
- [ ] Cuenta Kiwi creada
- [ ] API Kiwi solicitada
- [ ] Credenciales Kiwi en `.env.local`
- [ ] Testing Kiwi exitoso
- [ ] Cuenta Expedia creada
- [ ] Rapid API solicitada
- [ ] Credenciales Expedia en `.env.local`
- [ ] Testing Expedia exitoso
- [ ] (Opcional) Cuenta Booking creada
- [ ] (Opcional) API Booking aprobada
- [ ] (Opcional) Testing Booking exitoso

---

**🎉 ¡Con Amadeus + Kiwi + Expedia tienes cobertura COMPLETA de vuelos, hoteles y paquetes!**

**No necesitas esperar a Booking.com para empezar a operar.**

---

**Última actualización:** 20 de Noviembre de 2025
