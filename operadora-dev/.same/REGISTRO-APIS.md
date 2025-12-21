# 🔑 GUÍA DE REGISTRO EN APIS DE PROVEEDORES

## Tiempo total: 30-45 minutos

---

## 1️⃣ AMADEUS API - VUELOS (10 min) ⭐ **PRIORIDAD ALTA**

### **¿Qué es?**
El GDS más grande del mundo con acceso a 400+ aerolíneas.

### **Paso 1: Crear cuenta**

1. Ir a: https://developers.amadeus.com/register
2. Llenar formulario:
   ```
   First Name: Tu nombre
   Last Name: Tu apellido
   Email: tu@email.com
   Company: AS Operadora
   Password: (mínimo 8 caracteres)
   ```
3. Marcar checkbox "I agree to the terms..."
4. Click en "Create account"
5. Verificar email (revisa inbox/spam)
6. Click en link de verificación

### **Paso 2: Crear App**

1. Login en: https://developers.amadeus.com/my-apps
2. Click en "Create new app"
3. Configurar:
   ```
   App name: AS Operadora - Vuelos
   Description: Sistema de búsqueda de vuelos
   App type: Self-Service
   ```
4. Click en "Create"

### **Paso 3: Obtener credenciales**

1. En la app creada, click en "View details"
2. Verás 2 pestañas: **Test** y **Production**

**Para Sandbox (gratis - desarrollo):**
```
Tab: Test
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxx
```

**Para Producción (pago - cuando estés listo):**
```
Tab: Production
(Requiere solicitar acceso y aprobación)
```

### **Paso 4: Configurar en tu proyecto**

Crear archivo `.env.local` (si no existe):

```bash
# Copiar .env.example
cp .env.example .env.local
```

Editar `.env.local`:
```bash
AMADEUS_API_KEY=tu_api_key_del_tab_test
AMADEUS_API_SECRET=tu_api_secret_del_tab_test
AMADEUS_SANDBOX=true
```

### **Paso 5: Probar**

```bash
# Reiniciar el servidor
bun run dev
```

Abrir: http://localhost:3000
- Click en tab "Vuelos"
- Llenar: MEX → CUN
- Click "Buscar"
- Deberías ver vuelos reales de Amadeus

### **Límites Sandbox (gratis):**
- ✅ 1,000 requests/mes
- ✅ Todas las funcionalidades
- ✅ Datos reales de vuelos
- ⚠️ NO puedes crear reservas reales (solo simuladas)

### **Costos Producción:**
- $0.35 USD por búsqueda
- $2.00 USD por reserva
- Sin mensualidad

---

## 2️⃣ KIWI.COM API - VUELOS (10 min) ⭐ **PRIORIDAD ALTA**

### **¿Qué es?**
Agregador de vuelos con combinaciones inteligentes de aerolíneas.

### **Paso 1: Crear cuenta**

1. Ir a: https://tequila.kiwi.com/portal/
2. Click en "Sign up"
3. Llenar formulario:
   ```
   Email: tu@email.com
   Password: (seguro)
   Company: AS Operadora
   ```
4. Verificar email

### **Paso 2: Solicitar API Access**

1. Login en: https://tequila.kiwi.com/portal/
2. Click en "Get API Key"
3. Llenar solicitud:
   ```
   Company: AS Operadora
   Use case: Flight search platform
   Expected volume: 100-500 searches/month
   Website: https://asoperadora.com (o tu dominio)
   ```
4. Click en "Submit"
5. **Esperar aprobación:** 1-3 días (normalmente aprobado rápido)

### **Paso 3: Obtener API Key**

Una vez aprobado:
1. Login en portal
2. Dashboard → "API Key"
3. Copiar tu API key

### **Paso 4: Configurar**

En `.env.local`:
```bash
KIWI_API_KEY=tu_kiwi_api_key_aqui
```

### **Paso 5: Probar**

```bash
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=NYC&departureDate=2024-12-15&adults=1&providers=kiwi"
```

Debería retornar vuelos de Kiwi.

### **Límites:**
- ✅ Gratis para desarrollo
- ✅ Búsquedas ilimitadas (razonable)
- ✅ Puede crear reservas reales
- 💰 Comisión 3-5% por reserva (incluida en precio)

---

## 3️⃣ BOOKING.COM API - HOTELES (15 min) ⭐ **PRIORIDAD MEDIA**

### **¿Qué es?**
+28 millones de propiedades (hoteles, departamentos, etc).

### **Paso 1: Crear cuenta Affiliate**

1. Ir a: https://www.booking.com/affiliate
2. Click en "Join Now"
3. Llenar formulario extenso:
   ```
   Company: AS Operadora de Viajes
   Website: https://asoperadora.com
   Type: Travel Agency
   Monthly visitors: 1,000+
   Target audience: Mexico, Spanish speakers
   ```
4. Aceptar términos
5. Submit

### **Paso 2: Esperar aprobación**

⏰ **Tiempo:** 1-2 semanas (proceso manual)

Recibirás email cuando sea aprobado.

### **Paso 3: Solicitar API access**

Una vez aprobado como affiliate:
1. Login en: https://www.booking.com/affiliate-login.html
2. Menu → "API Access"
3. Click en "Request API Access"
4. Llenar justificación:
   ```
   Use case: Hotel search and booking platform
   Technical details: Next.js application, REST API integration
   Expected requests: 10,000/month
   ```
5. Submit

⏰ **Esperar:** 1-2 semanas adicionales

### **Paso 4: Obtener credenciales**

Una vez aprobado:
1. Dashboard → "API Credentials"
2. Copiar:
   - API Key
   - Affiliate ID

### **Paso 5: Configurar**

En `.env.local`:
```bash
BOOKING_API_KEY=tu_booking_api_key
BOOKING_AFFILIATE_ID=tu_affiliate_id
```

### **Nota importante:**

⚠️ Booking.com Affiliate API **NO permite reservas directas**
- Solo búsqueda de hoteles
- Redirige a Booking.com para completar reserva
- Recibes comisión (4-6%) después de la estancia

### **Alternativa mientras esperas:**

Usa la base de datos local con hoteles de ejemplo (Opción 2 del plan).

---

## 4️⃣ EXCHANGE RATE API - MONEDAS (5 min) ⭐ **PRIORIDAD BAJA**

### **¿Qué es?**
API para obtener tipos de cambio actualizados diariamente.

### **Opción A: ExchangeRate-API.com (Gratis - Recomendado)**

1. Ir a: https://www.exchangerate-api.com/
2. Click en "Get Free Key"
3. Ingresar email
4. Verificar email
5. Copiar API key del dashboard

**En `.env.local`:**
```bash
EXCHANGE_RATE_API_KEY=tu_api_key
```

**Límites gratis:**
- ✅ 1,500 requests/mes
- ✅ Actualización diaria
- ✅ 160+ monedas

### **Opción B: Sin API (usa valores manuales)**

El sistema ya tiene soporte para tipos de cambio manuales en la BD.

---

## 5️⃣ SENDGRID - EMAILS (5 min) ⭐ **PRIORIDAD BAJA**

### **¿Para qué?**
Envío de emails (confirmaciones, recordatorios, etc).

### **Paso 1: Crear cuenta**

1. Ir a: https://signup.sendgrid.com/
2. Crear cuenta (gratis)
3. Verificar email

### **Paso 2: Crear API Key**

1. Dashboard → Settings → API Keys
2. Click "Create API Key"
3. Name: "AS Operadora"
4. Permissions: "Full Access"
5. Copiar API key (solo se muestra una vez)

### **Paso 3: Configurar**

En `.env.local`:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

### **Paso 4: Verificar dominio**

1. Settings → Sender Authentication
2. "Verify a Single Sender" (para empezar)
3. O "Authenticate Your Domain" (para producción)

**Límites gratis:**
- ✅ 100 emails/día
- ✅ Suficiente para desarrollo

---

## ✅ CHECKLIST DE CONFIGURACIÓN

Después de registrarte en cada API:

**Obligatorias para funcionalidad básica:**
- [ ] Amadeus Sandbox configurado
- [ ] Variables en `.env.local` correctas
- [ ] Servidor reiniciado (`bun run dev`)
- [ ] Búsqueda de vuelos funciona

**Recomendadas:**
- [ ] Kiwi.com solicitado (esperar aprobación)
- [ ] Exchange Rate API configurado
- [ ] SendGrid configurado para emails

**Opcionales (para después):**
- [ ] Booking.com solicitado (esperar 2-4 semanas)
- [ ] Stripe para pagos
- [ ] Twilio para SMS

---

## 🧪 TESTING DE APIS

### **Test Amadeus:**
```bash
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-20&adults=1&providers=amadeus"
```

Debe retornar JSON con vuelos.

### **Test Kiwi:**
```bash
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-20&adults=1&providers=kiwi"
```

Debe retornar JSON con vuelos (una vez aprobado).

### **Test multi-proveedor:**
```bash
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-20&adults=1&providers=amadeus,kiwi"
```

Debe combinar resultados de ambos.

---

## ⚠️ TROUBLESHOOTING

### **Error: "Invalid credentials"**
- Verifica que copiaste correctamente API Key y Secret
- Revisa que no haya espacios extras
- Asegúrate de usar credenciales de "Test" (no "Production")

### **Error: "API quota exceeded"**
- Amadeus Sandbox: máximo 1,000 requests/mes
- Espera al próximo mes o solicita acceso a producción

### **Error: "Network error"**
- Verifica tu conexión a internet
- Algunos ISP bloquean APIs, usa VPN si es necesario

### **Kiwi no responde:**
- Verifica que tu solicitud haya sido aprobada
- Revisa email para confirmación
- Contacta soporte: https://tequila.kiwi.com/portal/support

---

## 📞 SOPORTE

**Amadeus:** https://developers.amadeus.com/support
**Kiwi:** https://tequila.kiwi.com/portal/support
**Booking:** https://developers.booking.com/support
**SendGrid:** https://support.sendgrid.com/

---

## 🎯 PRÓXIMO PASO

Una vez que tengas **al menos Amadeus configurado**:

✅ Continúa con **OPCIÓN 2: Agregar datos de ejemplo**

Esto te permitirá tener resultados tanto de APIs reales (vuelos) como de BD local (hoteles) para hacer demos completas.

---

**Última actualización:** 18 de Noviembre de 2024
