# 💰 COSTOS TOTALES DEL PROYECTO - AS OPERADORA

## 📊 RESUMEN EJECUTIVO

| Concepto | Mes 1-3 | Mes 4-6 | Mes 7-9 | Mes 10-12 | Año 1 Total | Promedio/mes |
|----------|---------|---------|---------|-----------|-------------|--------------|
| **Hosting** | $0 | $117 | $156 | $192 | $465 | $39 |
| **APIs Proveedores** | $0 | $60 | $120 | $180 | $360 | $30 |
| **Servicios** | $30 | $120 | $180 | $240 | $570 | $48 |
| **Herramientas** | $0 | $0 | $29 | $29 | $58 | $5 |
| **Publicación Apps** | $0 | $124 | $0 | $0 | $124 | $10 |
| **TOTAL FIJO/MES** | **$30** | **$421** | **$485** | **$641** | **$1,577** | **$131** |
| **Variable (por reserva)** | ~$4.50/reserva | ~$4.50/reserva | ~$4.50/reserva | ~$4.50/reserva | - | - |

**Inversión inicial (setup):** $124 (Google Play + Apple Developer)

**Costo por reserva:** ~$4.50-5.00 USD (comisiones API + procesamiento pago)

**Ejemplo con 1,000 reservas/mes:** $641 fijo + $4,500 variable = $5,141 total

---

# 1️⃣ HOSTING E INFRAESTRUCTURA

## **Estrategia Recomendada: Vercel → Railway**

### **FASE 1: Mes 1-3 (Validación)**

| Servicio | Plan | Función | Costo/mes |
|----------|------|---------|-----------|
| **Vercel** | Hobby (Free) | Frontend + API Routes | $0 |
| **Neon PostgreSQL** | Free | Base de datos | $0 |
| **Upstash Redis** | Free | Cache | $0 |
| **Cloudflare R2** | Free | Storage documentos | $0 |
| **Cloudflare CDN** | Free | CDN global | $0 |
| **SUBTOTAL MES 1-3** | | | **$0** |

**Capacidad:** 50-100 reservas/mes, 10,000 pageviews/mes

---

### **FASE 2: Mes 4-6 (Crecimiento)**

| Servicio | Plan | Función | Costo/mes |
|----------|------|---------|-----------|
| **Vercel** | Pro | Frontend + API | $20 |
| **Neon PostgreSQL** | Scale | Base de datos (10GB) | $19 |
| **Upstash Redis** | Pro | Cache (1M commands/día) | $10 |
| **Vercel Blob** | Incluido | Storage | $0 |
| **Cloudflare** | Free | CDN + protección | $0 |
| **SUBTOTAL MES 4-6** | | | **$49** |

**Capacidad:** 200-500 reservas/mes, 40,000 pageviews/mes

**Alternativa Railway:**

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Next.js App | Developer (2GB RAM) | $10 |
| PostgreSQL | Developer (50GB) | $10 |
| Redis | Starter (512MB) | $5 |
| Workers | Starter | $5 |
| Cloudflare R2 | 25GB | $3 |
| **TOTAL Railway** | | **$33** |

---

### **FASE 3: Mes 7-9 (Expansión)**

**Railway (Recomendado):**

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Next.js App | Team (4GB RAM) | $20 |
| PostgreSQL | Developer (100GB) | $20 |
| Redis | Developer (1GB) | $10 |
| Workers × 2 | Starter × 2 | $10 |
| Cloudflare R2 | 50GB | $8 |
| **TOTAL MES 7-9** | | **$68** |

**Capacidad:** 600-1,000 reservas/mes, 80,000 pageviews/mes

---

### **FASE 4: Mes 10-12 (Escalamiento)**

**Railway Escalado o DigitalOcean:**

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Next.js App (Railway) | Team × 2 | $40 |
| PostgreSQL | Team (4GB, 200GB) | $40 |
| Redis | Team (2GB) | $20 |
| Workers × 2 | Developer × 2 | $20 |
| Cloudflare R2 | 100GB | $12 |
| **TOTAL MES 10-12** | | **$132** |

**O DigitalOcean App Platform:**

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| App Platform | Professional × 2 | $48 |
| PostgreSQL | 8GB RAM | $60 |
| Redis | 4GB RAM | $60 |
| Spaces + CDN | 100GB | $10 |
| **TOTAL DigitalOcean** | | **$178** |

**Capacidad:** 1,000-2,000 reservas/mes, 150,000 pageviews/mes

---

## **Resumen Anual Hosting:**

| Mes | Config | Costo |
|-----|--------|-------|
| 1-3 | Vercel Free | $0 × 3 = $0 |
| 4-6 | Railway/Vercel Pro | $39 × 3 = $117 |
| 7-9 | Railway Escalado | $68 × 3 = $204 |
| 10-12 | Railway/DigitalOcean | $132 × 3 = $396 |
| **TOTAL AÑO 1** | | **$717** |
| **PROMEDIO/MES** | | **$60** |

---

# 2️⃣ APIS DE PROVEEDORES

## **Estrategia: Gratis → Sandbox → Producción**

### **FASE 1: Mes 1-3 (APIs Gratuitas)**

| Proveedor | Servicio | Modelo | Costo Setup | Costo Mensual |
|-----------|----------|--------|-------------|---------------|
| **Amadeus** | Vuelos (Sandbox) | Gratis 1K requests/mes | $0 | $0 |
| **Kiwi.com** | Vuelos | 3-5% comisión* | $0 | $0 |
| **Booking.com** | Hoteles | 4-6% comisión* | $0 | $0 |
| **GetYourGuide** | Tours/Atracciones | 20-25% comisión* | $0 | $0 |
| **Mozio** | Transporte | 10-15% comisión* | $0 | $0 |
| **Exchange Rate API** | Tipo de cambio | Gratis | $0 | $0 |
| **SUBTOTAL MES 1-3** | | | **$0** | **$0** |

*La comisión se descuenta del precio de venta, no es un costo adicional

---

### **FASE 2: Mes 4-6 (Sandbox + Producción Ligera)**

| Proveedor | Servicio | Modelo | Costo/mes |
|-----------|----------|--------|-----------|
| **Amadeus Self-Service** | Vuelos (producción) | $0.35/búsqueda, $2/reserva | ~$20 |
| **Kiwi.com** | Vuelos (backup) | 3-5% comisión | $0 |
| **Booking.com API Full** | Hoteles | 4-6% comisión | $0 |
| **Viator** | Tours | 20-25% comisión | $0 |
| **GetYourGuide** | Atracciones | 20-25% comisión | $0 |
| **Mozio** | Transporte | 10-15% comisión | $0 |
| **SUBTOTAL MES 4-6** | | | **~$20** |

---

### **FASE 3: Mes 7-12 (Producción Full)**

| Proveedor | Servicio | Volumen Estimado | Costo/mes |
|-----------|----------|------------------|-----------|
| **Amadeus** | Vuelos | 1,000 búsquedas, 200 reservas | $350 + $400 = $750 |
| **Hotelbeds** | Hoteles | Tarifa neta (sin fee API) | $0 |
| **GetYourGuide + Viator** | Tours | Comisión incluida | $0 |
| **Mozio** | Transporte | Comisión incluida | $0 |
| **SUBTOTAL MES 7-12** | | | **~$750** |

**Nota:** En Mes 7-12 consideramos migrar a Amadeus full production. Si te quedas con Kiwi.com, el costo sería $0.

---

## **Resumen Anual APIs:**

| Mes | Proveedores | Costo |
|-----|-------------|-------|
| 1-3 | Sandbox/Gratis | $0 × 3 = $0 |
| 4-6 | Amadeus Self-Service | $20 × 3 = $60 |
| 7-9 | Amadeus Lite | $100 × 3 = $300 |
| 10-12 | Amadeus Full (opcional) | $750 × 3 = $2,250 |
| **TOTAL AÑO 1** (sin Amadeus full) | | **$360** |
| **TOTAL AÑO 1** (con Amadeus full) | | **$2,610** |

**Recomendación:** Usar Kiwi.com + Booking.com año 1 → Migrar a Amadeus año 2

**Costo año 1 (conservador):** $360

---

# 3️⃣ SERVICIOS ESENCIALES

## **Facturación, Pagos, Comunicación**

### **Facturación Electrónica (México - CFDI)**

| Servicio | Plan | Timbres Incluidos | Costo/mes |
|----------|------|-------------------|-----------|
| **Facturama** | Básico | 250 timbres/mes | $350 MXN (~$20 USD) |
| **Facturama** | Profesional | 500 timbres/mes | $550 MXN (~$32 USD) |

**Consumo estimado:**
- Mes 1-3: 50 facturas = $20/mes
- Mes 4-6: 200 facturas = $20/mes (dentro del plan)
- Mes 7-12: 400-600 facturas = $32/mes

**Costo año 1:** $20×6 + $32×6 = $312

---

### **Procesamiento de Pagos**

| Proveedor | Comisión | Costo Fijo/Transacción |
|-----------|----------|------------------------|
| **Stripe** | 2.9% + $0.30 | Por transacción |
| **PayPal** | 3.49% + $0.49 | Por transacción |
| **Mercado Pago (MX)** | 3.99% + $3 MXN | Por transacción |

**Estimado (1,000 reservas/mes, ticket promedio $5,000 MXN):**
- Stripe: $5,000 × 2.9% = $145 + $0.30 = $145.30 por reserva
- **Costo mensual:** $145,300 procesados × 2.9% = ~$4,214

**Nota:** Este costo es PORCENTUAL al volumen de ventas, no es fijo.

**Costo fijo de gateway:** $0 (Stripe gratuito)

---

### **Email Marketing y Transaccional**

| Servicio | Plan | Límite | Costo/mes |
|----------|------|--------|-----------|
| **SendGrid** | Free | 100 emails/día | $0 |
| **SendGrid** | Essentials | 50K emails/mes | $15 |
| **SendGrid** | Pro | 100K emails/mes | $90 |

**Consumo estimado:**
- Confirmaciones: 1 por reserva
- Recordatorios: 1 por reserva
- Marketing: 2 por usuario/mes
- Total mes 3: ~500 emails → Free
- Total mes 6: ~2,000 emails → Free
- Total mes 9: ~8,000 emails → $15
- Total mes 12: ~15,000 emails → $15

**Costo año 1:** $0×6 + $15×6 = $90

---

### **SMS y WhatsApp**

| Servicio | Costo por Mensaje |
|----------|-------------------|
| **Twilio SMS (México)** | $0.05 USD/SMS |
| **Twilio WhatsApp** | $0.005-0.02 USD/msg |

**Uso conservador:**
- Confirmaciones urgentes: 10% de reservas
- Recordatorios: 30% de reservas

**Mes 3:** 50 reservas × 40% × $0.05 = $1
**Mes 6:** 200 reservas × 40% × $0.05 = $4
**Mes 9:** 600 reservas × 40% × $0.05 = $12
**Mes 12:** 1,000 reservas × 40% × $0.05 = $20

**Costo año 1:** ~$120

---

### **Resumen Servicios:**

| Servicio | Año 1 Total |
|----------|-------------|
| Facturama (CFDI) | $312 |
| SendGrid (Email) | $90 |
| Twilio (SMS/WhatsApp) | $120 |
| Stripe Gateway | $0 (fee por transacción aparte) |
| **TOTAL SERVICIOS AÑO 1** | **$522** |

---

# 4️⃣ HERRAMIENTAS DE DESARROLLO

## **Monitoreo, Logs, Seguridad**

| Herramienta | Propósito | Plan | Costo/mes |
|-------------|-----------|------|-----------|
| **Sentry** | Error tracking | Free (5K events/mes) | $0 |
| **Sentry** | Team (50K events/mes) | Team | $26 (si creces) |
| **LogTail** | Log management | Free (1GB/mes) | $0 |
| **UptimeRobot** | Uptime monitoring | Free (50 monitores) | $0 |
| **Google Analytics** | Web analytics | Free | $0 |
| **Cloudflare** | CDN + WAF | Free | $0 |
| **GitHub** | Git hosting | Free | $0 |

**Costo año 1:** $0 (todos en free tier)

**Año 2:** Posible upgrade a Sentry Team ($26/mes)

---

# 5️⃣ PUBLICACIÓN DE APPS MÓVILES

## **Stores - Pago Único/Anual**

| Store | Tipo | Costo |
|-------|------|-------|
| **Google Play** | Pago único | $25 USD |
| **Apple App Store** | Anual | $99 USD/año |
| **TOTAL INICIAL** | | **$124** |
| **ANUAL (renovaciones)** | | **$99/año** |

---

# 📊 TABLA RESUMEN COMPLETA - AÑO 1

## **Costos Fijos Mensuales:**

| Categoría | Mes 1-3 | Mes 4-6 | Mes 7-9 | Mes 10-12 | Total Año 1 |
|-----------|---------|---------|---------|-----------|-------------|
| **1. Hosting** | $0 | $117 | $204 | $396 | $717 |
| **2. APIs Proveedores** | $0 | $60 | $300 | $0* | $360 |
| **3. Facturación (CFDI)** | $60 | $60 | $96 | $96 | $312 |
| **4. Email (SendGrid)** | $0 | $0 | $45 | $45 | $90 |
| **5. SMS/WhatsApp** | $3 | $12 | $36 | $69 | $120 |
| **6. Herramientas** | $0 | $0 | $0 | $0 | $0 |
| **SUBTOTAL MENSUAL** | $63 | $249 | $681 | $606 | - |
| **TOTAL TRIMESTRE** | $189 | $747 | $2,043 | $1,818 | **$4,797** |

*Mes 10-12: usando Kiwi.com (gratis) en vez de Amadeus full

**+ Inversión Inicial (Apps):** $124

**TOTAL AÑO 1:** $4,797 + $124 = **$4,921**

**PROMEDIO MENSUAL AÑO 1:** **$410/mes**

---

## **Costos Variables (Por Reserva):**

| Concepto | Costo por Reserva |
|----------|-------------------|
| Stripe/PayPal fee | 2.9% + $0.30 (~$145 por $5K MXN) |
| Comisión Kiwi.com (si aplica) | 3-5% (~$150-250 por vuelo $5K) |
| Comisión Booking.com | 4-6% (~$200-300 por hotel $5K) |
| Timbrado CFDI adicional | $1.50 (si excedes plan) |

**Nota:** Las comisiones de Kiwi.com y Booking.com YA ESTÁN incluidas en el precio que cobras al cliente. NO son un costo adicional.

**Costo variable real por reserva:** ~$145-150 (solo Stripe) + $1.50 (CFDI) = **~$146.50**

**Para ticket de $5,000 MXN, el costo es ~2.9%**

---

## **Proyección de Ingresos vs Costos - Año 1**

| Mes | Reservas | Ticket Promedio | Ingresos Brutos | Costo Fijo | Costo Variable | Margen Bruto |
|-----|----------|-----------------|-----------------|------------|----------------|--------------|
| 1 | 50 | $5,000 MXN | $250,000 | $63 | $7,325 | $242,612 |
| 2 | 80 | $5,000 | $400,000 | $63 | $11,720 | $388,217 |
| 3 | 120 | $5,000 | $600,000 | $63 | $17,580 | $582,357 |
| 4 | 200 | $5,000 | $1,000,000 | $249 | $29,300 | $970,451 |
| 5 | 300 | $5,000 | $1,500,000 | $249 | $43,950 | $1,455,801 |
| 6 | 450 | $5,000 | $2,250,000 | $249 | $65,925 | $2,183,826 |
| 7 | 600 | $5,000 | $3,000,000 | $681 | $87,900 | $2,911,419 |
| 8 | 800 | $5,000 | $4,000,000 | $681 | $117,200 | $3,882,119 |
| 9 | 1,000 | $5,000 | $5,000,000 | $681 | $146,500 | $4,852,819 |
| 10 | 1,400 | $5,000 | $7,000,000 | $606 | $205,100 | $6,794,294 |
| 11 | 1,700 | $5,000 | $8,500,000 | $606 | $249,050 | $8,250,344 |
| 12 | 2,000 | $5,000 | $10,000,000 | $606 | $293,000 | $9,706,394 |
| **TOTAL** | **8,700** | - | **$43,500,000** | **$4,797** | **$1,274,550** | **$41,220,653** |

**Margen Bruto Año 1:** 94.7%

**Nota:** Estas cifras NO incluyen:
- Salarios del equipo
- Oficina/operación
- Marketing/adquisición de clientes
- Impuestos

---

## **Desglose de Margen por Reserva:**

**Ejemplo: Reserva de vuelo $5,000 MXN**

| Concepto | Monto |
|----------|-------|
| Precio al cliente | $5,000 MXN |
| - Costo del vuelo (proveedor) | -$4,000 MXN |
| **Margen base** | **$1,000 MXN** (20%) |
| - Stripe fee (2.9%) | -$145 MXN |
| - CFDI timbrado | -$27 MXN ($1.50 USD) |
| **Margen neto** | **$828 MXN** (16.6%) |

**Para 1,000 reservas/mes:** $828,000 MXN = ~$46,000 USD/mes margen

---

# 💡 RECOMENDACIONES DE OPTIMIZACIÓN

## **Cómo reducir costos:**

### **1. Hosting (ahorro: $200-400/año)**
- Empezar con Vercel Free (3 meses)
- Migrar a Railway en vez de DigitalOcean
- Usar Cloudflare CDN free

### **2. APIs (ahorro: $2,000-8,000/año)**
- Usar Kiwi.com en vez de Amadeus año 1
- Negociar comisiones con Booking.com después de 500 reservas
- Contratar Hotelbeds solo después de 100 reservas hotel/mes

### **3. Servicios (ahorro: $100-200/año)**
- SendGrid free tier (primer año)
- Usar WhatsApp en vez de SMS (10x más barato)
- CFDI: plan básico suficiente primeros 6 meses

### **4. Herramientas (ahorro: $300/año)**
- Sentry free tier (50K events/mes es suficiente)
- GitHub free
- Google Analytics free

---

## **Escenario ULTRA CONSERVADOR (Mínimo viable):**

| Categoría | Costo/mes (promedio año 1) |
|-----------|----------------------------|
| Hosting | $30 (Railway desde mes 1) |
| APIs | $0 (solo Kiwi.com + Booking) |
| Facturación | $20 |
| Email | $0 (free tier) |
| SMS | $10 |
| Herramientas | $0 |
| **TOTAL** | **$60/mes** |
| **TOTAL AÑO 1** | **$720** |

**+ Apps (setup único):** $124

**GRAN TOTAL AÑO 1 (conservador):** **$844**

---

# 🎯 CONCLUSIONES

## **Inversión Inicial Requerida:**

| Concepto | Monto |
|----------|-------|
| Desarrollo (ya hecho) | $0 |
| Hosting Mes 1-3 | $0 |
| APIs Mes 1-3 | $0 |
| Google Play + Apple | $124 |
| **TOTAL INVERSIÓN INICIAL** | **$124** |

## **Costos Operacionales:**

| Escenario | Costo Fijo/mes | Costo Variable/reserva |
|-----------|----------------|------------------------|
| **Conservador** | $60 | $146.50 (2.9%) |
| **Recomendado** | $410 | $146.50 (2.9%) |
| **Full Production** | $650 | $146.50 (2.9%) |

## **Break-even:**

**Con margen de $828 por reserva:**
- Costos fijos mes: $410
- Break-even: 1 reserva/mes (cubre costos)
- Punto de equilibrio total: 10-15 reservas/mes

**Para 100 reservas/mes:**
- Ingresos margen: $82,800 MXN
- Costos fijos: $410 USD (~$7,380 MXN)
- Margen neto: $75,420 MXN

**Para 1,000 reservas/mes:**
- Ingresos margen: $828,000 MXN
- Costos fijos: $650 USD (~$11,700 MXN)
- Margen neto: $816,300 MXN (~$45,350 USD)

---

# ✅ DECISIÓN FINAL

## **Estrategia Recomendada: PROGRESIVA**

### **Mes 1-3: GRATIS ($0/mes)**
- Validar producto sin inversión
- Usar solo free tiers
- Capacidad: 100 reservas/mes

### **Mes 4-6: LIGHT ($249/mes)**
- Migrar a Railway
- Activar Amadeus Self-Service
- Capacidad: 500 reservas/mes

### **Mes 7-12: GROWTH ($410/mes)**
- Escalar recursos
- Activar todos los servicios
- Capacidad: 1,000-2,000 reservas/mes

**Costo total año 1:** ~$4,921

**ROI esperado:** Con 8,700 reservas/año y margen de $828/reserva = $7.2M MXN margen bruto

**Ratio costo/ingreso:** 0.6% (excelente)

---

¿Quieres que **ahora sí procedamos con la Fase 1 del desarrollo**?
