# 🚀 GUÍA COMPLETA DE CONFIGURACIÓN - AS OPERADORA

**Versión:** v82
**Fecha:** 15 de Diciembre de 2025
**Estado:** Listo para Producción

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Variables de Entorno](#variables-de-entorno)
5. [Configuración de Servicios](#configuración-de-servicios)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Seguridad](#seguridad)
9. [Troubleshooting](#troubleshooting)

---

## 1. REQUISITOS PREVIOS

### **Software Requerido:**
- ✅ Node.js 18.17 o superior
- ✅ Bun 1.0 o superior (package manager)
- ✅ PostgreSQL 14 o superior (Neon recomendado)
- ✅ Git

### **Cuentas Externas Requeridas:**

#### **Críticas (Sin estas NO funciona):**
- ✅ Neon Database (https://neon.tech) - Base de datos
- ✅ Stripe (https://stripe.com) - Pagos con tarjeta
- ✅ Vercel Blob (https://vercel.com) - Almacenamiento de documentos

#### **Importantes:**
- ✅ PayPal (https://paypal.com) - Pagos alternativos
- ✅ SendGrid (https://sendgrid.com) - Emails
- ✅ Amadeus API (https://developers.amadeus.com) - Vuelos

#### **Opcionales:**
- Kiwi.com API - Vuelos low-cost
- Booking.com API - Hoteles
- Expedia API - Paquetes
- Facturama - Facturación electrónica (México)

---

## 2. INSTALACIÓN

### **Paso 1: Clonar repositorio**

```bash
git clone <repository-url>
cd operadora-dev
```

### **Paso 2: Instalar dependencias**

```bash
bun install
```

### **Paso 3: Copiar archivo de variables de entorno**

```bash
cp .env.example .env.local
```

---

## 3. CONFIGURACIÓN DE BASE DE DATOS

### **Opción A: Neon (Recomendado)**

1. Crear cuenta en https://neon.tech
2. Crear nuevo proyecto PostgreSQL
3. Copiar connection string
4. Agregar a `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
```

### **Opción B: PostgreSQL Local**

```bash
# Crear base de datos
createdb asoperadora

# Actualizar .env.local
DATABASE_URL=postgresql://localhost:5432/asoperadora
```

### **Ejecutar Migraciones:**

```bash
# Migración 001: Schema base
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Migración 002: Centro de costos
psql $DATABASE_URL -f migrations/002_cost_centers.sql

# Migración 003: Pagos
psql $DATABASE_URL -f migrations/003_payment_transactions.sql

# Migración 004: Documentos y auditoría
psql $DATABASE_URL -f migrations/004_documents.sql
```

### **Verificar Instalación:**

```bash
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
```

Deberías ver todas las tablas creadas.

---

## 4. VARIABLES DE ENTORNO

### **Configuración Mínima (Crítica):**

```bash
# ============================================================================
# BASE DE DATOS (OBLIGATORIO)
# ============================================================================
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# ============================================================================
# SEGURIDAD (OBLIGATORIO)
# ============================================================================
# Generar con: openssl rand -base64 32
JWT_SECRET=<tu-secreto-32-caracteres-minimo>
ENCRYPTION_SECRET_KEY=<tu-clave-encriptacion-32-caracteres>

# ============================================================================
# NEXT.JS (OBLIGATORIO)
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================================================
# STRIPE (OBLIGATORIO PARA PAGOS)
# ============================================================================
# Obtener en: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================================
# VERCEL BLOB (OBLIGATORIO PARA DOCUMENTOS)
# ============================================================================
# Obtener en: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### **Configuración Completa (Opcional):**

```bash
# ============================================================================
# PAYPAL (OPCIONAL)
# ============================================================================
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# ============================================================================
# SENDGRID (OPCIONAL - Para emails)
# ============================================================================
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@asoperadora.com

# ============================================================================
# AMADEUS API (OPCIONAL - Para vuelos)
# ============================================================================
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_SANDBOX=true

# ============================================================================
# KIWI.COM (OPCIONAL)
# ============================================================================
KIWI_API_KEY=

# ============================================================================
# BOOKING.COM (OPCIONAL)
# ============================================================================
BOOKING_API_KEY=

# ============================================================================
# EXPEDIA (OPCIONAL)
# ============================================================================
EXPEDIA_API_KEY=
EXPEDIA_API_SECRET=
EXPEDIA_SANDBOX=true
```

---

## 5. CONFIGURACIÓN DE SERVICIOS

### **5.1 Stripe**

**Paso 1: Crear cuenta**
- Ir a https://dashboard.stripe.com/register
- Activar modo Test

**Paso 2: Obtener API Keys**
- Dashboard → Developers → API keys
- Copiar Publishable key y Secret key

**Paso 3: Configurar Webhook**
- Dashboard → Developers → Webhooks
- Agregar endpoint: `https://tu-dominio.com/api/webhooks/stripe`
- Eventos a escuchar:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `customer.subscription.created`
  - `customer.subscription.deleted`
- Copiar Webhook secret

**Paso 4: Probar en Test Mode**
- Tarjeta de prueba: `4242 4242 4242 4242`
- Fecha: Cualquier fecha futura
- CVC: 123

---

### **5.2 Vercel Blob**

**Paso 1: Crear proyecto en Vercel**
- Ir a https://vercel.com/dashboard
- Crear proyecto

**Paso 2: Crear Blob Store**
- Project Settings → Storage → Create Database
- Seleccionar "Blob"
- Copiar Read/Write Token

**Paso 3: Configurar en .env.local**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

### **5.3 PayPal (Opcional)**

**Paso 1: Crear cuenta developer**
- Ir a https://developer.paypal.com/
- Crear app en sandbox

**Paso 2: Obtener credenciales**
- Dashboard → My Apps & Credentials
- Copiar Client ID y Secret

**Paso 3: Configurar Webhook**
- Agregar webhook: `https://tu-dominio.com/api/webhooks/paypal`
- Eventos: `PAYMENT.*`, `BILLING.SUBSCRIPTION.*`

---

### **5.4 SendGrid (Opcional)**

**Paso 1: Crear cuenta**
- Ir a https://signup.sendgrid.com/
- Plan gratuito: 100 emails/día

**Paso 2: Crear API Key**
- Settings → API Keys → Create API Key
- Full Access

**Paso 3: Verificar sender**
- Settings → Sender Authentication
- Verificar dominio o email

---

## 6. TESTING

### **Ejecutar Tests:**

```bash
# Todos los tests
bun test

# Con UI interactiva
bun test:ui

# Con coverage
bun test:coverage

# Solo ejecutar una vez
bun test:run
```

### **Tests Disponibles:**

- ✅ `tests/unit/services/EncryptionService.test.ts` - Encriptación
- ✅ `tests/unit/utils/sanitization.test.ts` - Sanitización
- ⏳ Tests de integración (agregar según necesidad)
- ⏳ Tests E2E (agregar según necesidad)

### **Configuración de Testing:**

Archivo: `vitest.config.ts`
- Environment: happy-dom
- Coverage provider: v8
- Globals: true

---

## 7. DEPLOYMENT

### **Opción A: Vercel (Recomendado)**

**Paso 1: Conectar repositorio**
```bash
vercel login
vercel
```

**Paso 2: Configurar variables de entorno**
- Vercel Dashboard → Settings → Environment Variables
- Agregar TODAS las variables de `.env.local`

**Paso 3: Deploy**
```bash
vercel --prod
```

**Paso 4: Configurar custom domain (opcional)**
- Vercel Dashboard → Domains
- Agregar dominio

---

### **Opción B: Docker**

**Dockerfile incluido:**
```bash
# Build
docker build -t asoperadora .

# Run
docker run -p 3000:3000 --env-file .env.local asoperadora
```

---

### **Opción C: VPS/Cloud Server**

```bash
# En servidor
git clone <repo>
cd operadora-dev
bun install
bun build

# Con PM2
pm2 start ecosystem.config.js
```

---

## 8. SEGURIDAD

### **8.1 Generar Claves Secretas**

```bash
# JWT Secret
openssl rand -base64 32

# Encryption Secret
openssl rand -base64 32
```

### **8.2 Rate Limiting**

Configurado automáticamente en:
- `/api/auth/*` - 10 requests/15min
- `/api/payments/*` - 5 requests/15min
- `/api/search` - 30 requests/min
- General - 100 requests/min

### **8.3 Security Headers**

Configurados automáticamente:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- HSTS (producción)
- CORS estricto

### **8.4 Sanitización de Inputs**

Usar utilidades en `src/utils/sanitization.ts`:
```typescript
import { sanitizeText, Validators } from '@/utils/sanitization'

const clean = sanitizeText(userInput)
const isValid = Validators.isValidEmail(email)
```

---

## 9. TROUBLESHOOTING

### **Problema: Error de conexión a BD**

```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1"

# Verificar SSL
# Asegurar que la URL tenga ?sslmode=require
```

### **Problema: Pagos no funcionan**

```bash
# Verificar keys de Stripe
curl https://api.stripe.com/v1/balance \
  -u $STRIPE_SECRET_KEY:

# Debe retornar balance sin error
```

### **Problema: Uploads no funcionan**

```bash
# Verificar token de Vercel Blob
# Dashboard → Storage → Tokens
# Regenerar si es necesario
```

### **Problema: Tests fallan**

```bash
# Limpiar cache
bun install --force

# Verificar setup
cat tests/setup.ts

# Ejecutar un test específico
bun test EncryptionService.test.ts
```

---

## 🎯 CHECKLIST PRE-PRODUCCIÓN

### **Base de Datos:**
- [ ] Migraciones ejecutadas
- [ ] Datos de ejemplo eliminados
- [ ] Backups configurados

### **Variables de Entorno:**
- [ ] Todas las variables configuradas
- [ ] Claves de producción (no test)
- [ ] Secrets seguros (32+ caracteres)

### **Servicios:**
- [ ] Stripe en modo producción
- [ ] PayPal en modo producción
- [ ] Webhooks configurados
- [ ] Emails funcionando

### **Seguridad:**
- [ ] Rate limiting activo
- [ ] HTTPS configurado
- [ ] CORS configurado
- [ ] CSP headers activos

### **Testing:**
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan
- [ ] Coverage > 80%

### **Deployment:**
- [ ] Build exitoso
- [ ] Logs configurados
- [ ] Monitoreo activo
- [ ] Dominio configurado

---

## 📞 SOPORTE

- **Documentación:** `.same/` folder
- **Issues:** GitHub Issues
- **Email:** support@asoperadora.com

---

**Última actualización:** 15 de Diciembre de 2025
**Versión:** v82
**Mantenedor:** AI Assistant + Equipo de Desarrollo
