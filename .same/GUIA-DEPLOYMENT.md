# 🚀 GUÍA COMPLETA DE DEPLOYMENT

## AS OPERADORA - Deployment a Producción

**Tiempo estimado:** 25 minutos
**Servicios:** Vercel + Neon PostgreSQL + Vercel Blob

---

## 📋 PASO 1: CREAR BASE DE DATOS EN NEON (5 MIN)

### **1.1 Crear cuenta en Neon**

1. Ir a https://neon.tech
2. Click en "Sign up"
3. Conectar con GitHub (recomendado)

### **1.2 Crear proyecto PostgreSQL**

1. Click en "New Project"
2. Configuración:
   ```
   Project name: as-operadora
   Postgres version: 16
   Region: US East (Ohio) - us-east-2
   ```
3. Click en "Create Project"

### **1.3 Obtener Connection String**

1. En el dashboard de Neon, click en "Connection Details"
2. Copiar la cadena de conexión:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **GUARDAR ESTO** - lo necesitarás después

### **1.4 Ejecutar Schema SQL**

1. En Neon dashboard, click en "SQL Editor"
2. Copiar TODO el contenido de `.same/ESQUEMA-BD-COMPLETO.sql`
3. Pegar en el editor
4. Click en "Run" (ejecutará ~5 segundos)
5. Verificar que no haya errores (debe decir "Success")

**✅ Listo:** Base de datos creada con 75+ tablas

---

## 📋 PASO 2: DEPLOYMENT A VERCEL (10 MIN)

### **2.1 Preparar repositorio**

1. Asegúrate de que tu código esté en GitHub
2. Si no lo has hecho:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### **2.2 Conectar con Vercel**

1. Ir a https://vercel.com
2. Click en "Sign up" → Conectar con GitHub
3. Click en "New Project"
4. Seleccionar repositorio "expedia-clone"
5. Click en "Import"

### **2.3 Configurar proyecto**

**Framework Preset:** Next.js (detectado automáticamente)

**Root Directory:** `.` (raíz)

**Build Command:** (dejar default)
```bash
next build
```

**Output Directory:** (dejar default)
```
.next
```

### **2.4 Configurar Variables de Entorno** ⚠️ **CRÍTICO**

Click en "Environment Variables" y agregar:

```bash
# Base de Datos
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Secret (genera uno aleatorio)
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar

# Amadeus (Sandbox - OPCIONAL para testing)
AMADEUS_API_KEY=tu_client_id
AMADEUS_API_SECRET=tu_client_secret
AMADEUS_SANDBOX=true

# Kiwi.com (OPCIONAL)
KIWI_API_KEY=tu_api_key

# Booking.com (OPCIONAL)
BOOKING_API_KEY=tu_api_key
BOOKING_AFFILIATE_ID=tu_affiliate_id

# Exchange Rate API (OPCIONAL)
EXCHANGE_RATE_API_KEY=tu_api_key
```

**IMPORTANTE:**
- `DATABASE_URL` es **OBLIGATORIO**
- `JWT_SECRET` es **OBLIGATORIO** (puedes generarlo con: `openssl rand -base64 32`)
- Las APIs de proveedores son **opcionales** para el primer deploy
- Si no tienes las APIs, el sistema funcionará con la BD local de hoteles

### **2.5 Deploy**

1. Click en "Deploy"
2. Esperar 2-3 minutos
3. ¡Listo! Tu sitio está en: `https://tu-proyecto.vercel.app`

**✅ Deployment completado**

---

## 📋 PASO 3: VERIFICAR QUE TODO FUNCIONA (5 MIN)

### **3.1 Verificar Homepage**

1. Abrir `https://tu-proyecto.vercel.app`
2. Debe cargar la página principal
3. Verificar que se vean los formularios de búsqueda

### **3.2 Test de APIs Backend**

**Test 1: Currencies API**
```bash
curl https://tu-proyecto.vercel.app/api/currencies
```
Debe retornar JSON con monedas

**Test 2: Search API (Hoteles)**
```bash
curl "https://tu-proyecto.vercel.app/api/search?type=hotel&city=Cancún&checkin=2024-12-01&checkout=2024-12-08&guests=2"
```
Debe retornar JSON con hoteles de la BD

**Test 3: Auth API**
```bash
curl -X POST https://tu-proyecto.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```
Debe crear usuario y retornar token

### **3.3 Test desde la Web**

1. Ir a `https://tu-proyecto.vercel.app`
2. Click en tab "Vuelos"
3. Llenar: Origen=MEX, Destino=CUN, Fecha
4. Click en "Buscar"
5. Debe navegar a `/resultados` (aunque no haya vuelos si no tienes APIs configuradas)

6. Volver a home, click en tab "Estadías"
7. Llenar: Destino=Cancún, Fechas
8. Click en "Buscar"
9. Debe mostrar hoteles de la base de datos

**✅ Si todo funciona → ¡DEPLOYMENT EXITOSO!**

---

## 📋 PASO 4: CONFIGURAR APIs DE PROVEEDORES (OPCIONAL)

### **4.1 Amadeus (Vuelos) - Sandbox Gratis**

1. Ir a https://developers.amadeus.com/
2. Crear cuenta
3. Crear app "Self-Service"
4. Copiar:
   - API Key (Client ID)
   - API Secret
5. En Vercel → Settings → Environment Variables:
   ```
   AMADEUS_API_KEY=tu_client_id
   AMADEUS_API_SECRET=tu_client_secret
   AMADEUS_SANDBOX=true
   ```
6. Redeploy (Vercel → Deployments → ... → Redeploy)

**Test:**
```bash
curl "https://tu-proyecto.vercel.app/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-15&adults=1&providers=amadeus"
```

### **4.2 Kiwi.com (Vuelos)**

1. Ir a https://tequila.kiwi.com/portal/
2. Crear cuenta
3. Solicitar API access
4. Copiar API Key
5. En Vercel:
   ```
   KIWI_API_KEY=tu_api_key
   ```
6. Redeploy

### **4.3 Booking.com (Hoteles)**

1. Ir a https://developers.booking.com/
2. Crear cuenta Affiliate
3. Aplicar para API access (toma 1-2 semanas)
4. Una vez aprobado:
   ```
   BOOKING_API_KEY=tu_api_key
   BOOKING_AFFILIATE_ID=tu_affiliate_id
   ```
5. Redeploy

---

## 📋 PASO 5: DOMINIO PERSONALIZADO (OPCIONAL)

### **5.1 Agregar dominio en Vercel**

1. En Vercel dashboard → Settings → Domains
2. Click en "Add Domain"
3. Ingresar: `asoperadora.com` (tu dominio)
4. Vercel te dará registros DNS para configurar

### **5.2 Configurar DNS**

En tu proveedor de DNS (GoDaddy, Namecheap, etc):

**Tipo A:**
```
@ → 76.76.21.21
```

**Tipo CNAME:**
```
www → cname.vercel-dns.com
```

**Esperar:** 5-30 minutos para propagación

**✅ Tu sitio estará en:** `https://asoperadora.com`

---

## 🔧 COMANDOS ÚTILES

### **Ver logs en tiempo real**

1. Vercel dashboard → Deployment → View Function Logs

### **Redeploy después de cambiar env vars**

1. Vercel → Deployments
2. Click en "..." del último deployment
3. "Redeploy"

### **Conectar a BD desde local**

```bash
# Usar el mismo DATABASE_URL de Vercel
export DATABASE_URL="postgresql://..."
psql $DATABASE_URL
```

### **Ejecutar migraciones**

```bash
# Si actualizas el schema
psql $DATABASE_URL < .same/ESQUEMA-BD-COMPLETO.sql
```

---

## ⚠️ TROUBLESHOOTING

### **Error: "Function Execution Timeout"**

**Causa:** Query SQL toma >10s
**Solución:** Optimizar queries o actualizar a Vercel Pro ($20/mes → 60s timeout)

### **Error: "DATABASE_URL not found"**

**Causa:** Variable de entorno no configurada
**Solución:** Vercel → Settings → Environment Variables → Agregar `DATABASE_URL`

### **Error 500 en APIs**

1. Ver logs: Vercel → Deployment → View Function Logs
2. Identificar error
3. Corregir código
4. `git push` (auto-redeploy)

### **BD no tiene datos**

**Causa:** Schema no ejecutado
**Solución:**
1. Conectar a Neon SQL Editor
2. Ejecutar `.same/ESQUEMA-BD-COMPLETO.sql` completo

### **Búsquedas no retornan resultados**

**Causa normal:** No hay datos en la BD o APIs no configuradas

**Solución:**
1. Agregar hoteles de ejemplo:
   ```sql
   INSERT INTO hotels (name, location, city, price_per_night, rating)
   VALUES ('Hotel Test', 'Cancún Centro', 'Cancún', 1500, 4.5);
   ```
2. O configurar APIs de proveedores

---

## 📊 MONITOREO POST-DEPLOYMENT

### **Vercel Analytics (Gratis)**

1. Vercel dashboard → Analytics
2. Ver:
   - Visitors
   - Pageviews
   - API calls
   - Performance

### **Neon Dashboard**

1. Neon dashboard → Monitoring
2. Ver:
   - Connection count
   - Query performance
   - Storage used

---

## 💰 COSTOS ESPERADOS

| Servicio | Plan | Costo |
|----------|------|-------|
| **Vercel** | Hobby (Free) | $0 |
| **Neon** | Free Tier | $0 |
| **Total Mes 1-3** | | **$0** |

### **Límites Free Tier:**

**Vercel Hobby:**
- 100 GB bandwidth/mes
- 100 GB-hrs serverless function time
- 1,000 Image Optimizations

**Neon Free:**
- 0.5 GB storage
- 100 compute hours/mes
- Hibernación después de 5 min inactividad

### **Cuándo actualizar:**

**Vercel Pro ($20/mes)** cuando:
- >100 GB bandwidth/mes (~50,000 visitas)
- Necesitas >60s timeout
- Quieres analytics avanzados

**Neon Scale ($19/mes)** cuando:
- >0.5 GB datos
- >100 compute hours/mes
- No quieres hibernación

---

## ✅ CHECKLIST FINAL

Antes de considerar el deployment completo:

**Backend:**
- [ ] Base de datos creada en Neon
- [ ] Schema SQL ejecutado sin errores
- [ ] `DATABASE_URL` configurado en Vercel
- [ ] `JWT_SECRET` configurado
- [ ] Deployment exitoso en Vercel
- [ ] API `/api/currencies` responde
- [ ] API `/api/search` responde

**Frontend:**
- [ ] Homepage carga correctamente
- [ ] Formularios de búsqueda visibles
- [ ] Navegación funciona
- [ ] Búsqueda de hoteles muestra resultados
- [ ] Página de resultados se ve bien

**Opcionales (para funcionalidad completa):**
- [ ] Amadeus API configurado (vuelos)
- [ ] Kiwi API configurado (vuelos)
- [ ] Booking API configurado (hoteles)
- [ ] Dominio personalizado (asoperadora.com)

---

## 🎉 ¡FELICIDADES!

Tu plataforma de viajes está en producción y funcionando:

✅ **Homepage:** `https://tu-proyecto.vercel.app`
✅ **APIs:** Backend completamente funcional
✅ **Base de datos:** 75+ tablas operativas
✅ **Multi-moneda:** Conversión automática
✅ **Multi-tenancy:** Soporte para agencias y corporativos
✅ **Búsqueda real:** Hoteles desde BD, vuelos con APIs (si están configuradas)

---

## 📞 SOPORTE

**Problemas con Vercel:** https://vercel.com/support
**Problemas con Neon:** https://neon.tech/docs
**Amadeus API:** https://developers.amadeus.com/support

---

**Última actualización:** 18 de Noviembre de 2024
