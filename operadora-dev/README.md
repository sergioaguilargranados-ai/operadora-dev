# 🌎 AS OPERADORA - Sistema de Gestión de Viajes y Eventos

**Última actualización:** 21 de December de 2025 - 17:44 CST
**Versión:** v2.152
**Actualizado por:** AI Assistant

![Version](https://img.shields.io/badge/version-2.152-blue.svg)
![Production](https://img.shields.io/badge/live-app.asoperadora.com-success.svg)
![Status](https://img.shields.io/badge/status-production--live-green.svg)
![Deploy](https://img.shields.io/badge/deploy-vercel--success-brightgreen.svg)
![Progress](https://img.shields.io/badge/progress-96%25-brightgreen.svg)

> **Sistema completo de gestión de viajes corporativos con módulos de pagos, seguridad, documentos y reportes avanzados**

---

## 🔗 Enlaces Rápidos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 **Producción** | [app.asoperadora.com](https://app.asoperadora.com) | Aplicación en vivo (Vercel) |
| 💻 **Desarrollo** | [localhost:3000](http://localhost:3000) | Entorno local (SAME) |
| 📂 **Repositorio** | [GitHub](https://github.com/sergioaguilargranados-ai/operadora-dev) | Código fuente |
| 🗄️ **Base de datos** | Neon PostgreSQL | ep-green-sky-afxrsbva... |

**🚀 Flujo de trabajo:** SAME → GitHub (push automático) → Vercel (deploy automático) → app.asoperadora.com

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos](#-módulos)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Seguridad](#-seguridad)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características Principales

### 🏢 **Sistema Corporativo Completo (100%)**
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Workflow de aprobaciones multi-nivel
- ✅ Gestión de empleados y departamentos
- ✅ Políticas de viaje configurables
- ✅ Reportes avanzados con filtros
- ✅ Centro de costos
- ✅ Exportación Excel/PDF

### 💳 **Sistema de Pagos (90%)**
- ✅ Integración Stripe (tarjetas de crédito/débito)
- ✅ Integración PayPal
- ✅ Webhooks automáticos
- ✅ Reembolsos
- ✅ Subscripciones recurrentes
- ✅ Dashboard de transacciones
- ✅ Conciliación bancaria

### 🔐 **Seguridad Avanzada (95%)**
- ✅ Encriptación AES-256 para datos sensibles
- ✅ URLs firmadas con expiración
- ✅ Rate limiting por IP
- ✅ CORS estricto
- ✅ Content Security Policy (CSP)
- ✅ Sanitización de inputs (XSS, SQL injection)
- ✅ Audit logs completos
- ✅ Autenticación JWT

### 📄 **Gestión de Documentos (90%)**
- ✅ Upload seguro a Vercel Blob
- ✅ Validación de tipo y tamaño
- ✅ URLs temporales firmadas
- ✅ Soporte: JPG, PNG, WEBP, PDF
- ✅ Audit logs automáticos

### ✈️ **Búsqueda y Reservas (80%)**
- ✅ Búsqueda multi-proveedor
- ✅ Vuelos, hoteles, paquetes
- ✅ Filtros avanzados
- ✅ Validación de políticas en tiempo real
- ✅ Sistema de favoritos

---

## 🛠 Tecnologías

### **Frontend**
- [Next.js 15](https://nextjs.org/) - App Router
- [React 18](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Recharts](https://recharts.org/) - Charts & Analytics

### **Backend**
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - RESTful APIs
- [PostgreSQL](https://www.postgresql.org/) - Database (Neon)
- [Bun](https://bun.sh/) - Package Manager & Runtime

### **Integraciones**
- [Stripe](https://stripe.com/) - Procesamiento de pagos
- [PayPal](https://www.paypal.com/) - Pagos alternativos
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) - Almacenamiento de documentos
- [SendGrid](https://sendgrid.com/) - Emails transaccionales
- [Amadeus API](https://developers.amadeus.com/) - Búsqueda de vuelos

### **Seguridad**
- AES-256 Encryption
- JWT Authentication
- Rate Limiting
- CORS & CSP Headers
- Input Sanitization
- Audit Logging

### **Testing**
- [Vitest](https://vitest.dev/) - Unit Testing
- [@testing-library/react](https://testing-library.com/) - Component Testing
- Happy DOM - DOM Testing

---

## 🚀 Instalación Rápida

### **Requisitos Previos**
- Node.js 18.17 o superior
- Bun 1.0 o superior (recomendado)
- PostgreSQL 14 o superior (Neon recomendado)
- Git

### **Paso 1: Clonar Repositorio**
```bash
git clone https://github.com/tu-usuario/asoperadora.git
cd asoperadora
```

### **Paso 2: Instalar Dependencias**
```bash
bun install
# o
npm install
```

### **Paso 3: Configurar Variables de Entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```bash
# Base de Datos (OBLIGATORIO)
DATABASE_URL=postgresql://user:password@host:5432/database

# Seguridad (OBLIGATORIO)
JWT_SECRET=<genera-con-openssl-rand-base64-32>
ENCRYPTION_SECRET_KEY=<genera-con-openssl-rand-base64-32>

# Stripe (OBLIGATORIO para pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Blob (OBLIGATORIO para documentos)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### **Paso 4: Ejecutar Migraciones**
```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_cost_centers.sql
psql $DATABASE_URL -f migrations/003_payment_transactions.sql
psql $DATABASE_URL -f migrations/004_documents.sql
```

### **Paso 5: Iniciar Servidor de Desarrollo**
```bash
bun dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## ⚙️ Configuración

### **Configuración Completa**

Ver [`.same/SETUP-COMPLETO.md`](.same/SETUP-COMPLETO.md) para instrucciones detalladas.

### **Servicios Externos Requeridos**

#### **Críticos (Sin estos NO funciona):**
1. **Neon Database** - https://neon.tech
2. **Stripe** - https://stripe.com
3. **Vercel Blob** - https://vercel.com

#### **Opcionales:**
- PayPal - https://paypal.com
- SendGrid - https://sendgrid.com
- Amadeus API - https://developers.amadeus.com

---

## 📁 Estructura del Proyecto

```
operadora-dev/
├── .same/                     # Documentación y guías
│   ├── SETUP-COMPLETO.md     # Guía de configuración completa
│   ├── RESUMEN-FINAL-v82.md  # Resumen ejecutivo
│   └── todos.md              # Tareas pendientes
│
├── migrations/                # Migraciones SQL
│   ├── 001_initial_schema.sql
│   ├── 002_cost_centers.sql
│   ├── 003_payment_transactions.sql
│   └── 004_documents.sql
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   ├── dashboard/        # Dashboards
│   │   └── ...               # Páginas
│   │
│   ├── components/           # Componentes React
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...
│   │
│   ├── services/            # Lógica de negocio
│   │   ├── StripeService.ts
│   │   ├── PayPalService.ts
│   │   ├── EncryptionService.ts
│   │   └── ...
│   │
│   ├── middleware/          # Middlewares
│   │   ├── rateLimiter.ts
│   │   └── security.ts
│   │
│   └── utils/               # Utilidades
│       └── sanitization.ts
│
├── tests/                    # Tests
│   ├── unit/
│   └── setup.ts
│
├── .env.example             # Variables de entorno de ejemplo
├── package.json
└── README.md
```

---

## 📦 Módulos

### **1. Corporativo** (`src/app/dashboard/corporate/*`)
- Gestión de empleados
- Políticas de viaje
- Aprobaciones
- Reportes
- Centro de costos

### **2. Pagos** (`src/app/api/payments/*`)
- Stripe Integration
- PayPal Integration
- Webhooks
- Dashboard de transacciones

### **3. Seguridad** (`src/services/*`, `src/middleware/*`)
- Encriptación AES-256
- Rate limiting
- Sanitización
- Audit logs

### **4. Documentos** (`src/app/api/documents/*`)
- Upload seguro
- URLs firmadas
- Validación

---

## 📚 API Documentation

### **Autenticación**

```bash
POST /api/auth/login
POST /api/auth/register
```

### **Búsqueda**

```bash
GET /api/search?origin=MEX&destination=JFK&departure=2024-12-20
```

### **Reservas**

```bash
GET /api/bookings
POST /api/bookings
GET /api/bookings/[id]
PUT /api/bookings/[id]
```

### **Pagos**

```bash
POST /api/payments/stripe/create-payment-intent
POST /api/payments/stripe/confirm-payment
POST /api/payments/paypal/create-order
POST /api/payments/paypal/capture-order
GET /api/payments
```

### **Corporativo**

```bash
GET /api/corporate/employees
POST /api/corporate/employees
GET /api/corporate/stats
GET /api/corporate/reports/expenses
```

Ver documentación completa en [`.same/API-DOCUMENTATION.md`](.same/API-DOCUMENTATION.md)

---

## 🧪 Testing

### **Ejecutar Tests**

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

### **Tests Disponibles**

- ✅ 35+ tests unitarios
- ✅ EncryptionService
- ✅ Sanitization utilities
- ⏳ Tests de integración (agregar según necesidad)
- ⏳ Tests E2E (agregar según necesidad)

### **Coverage Objetivo**
- Actual: 20%
- Objetivo: 80%

---

## 🚢 Deployment

### **Opción A: Vercel (Recomendado)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### **Opción B: Docker**

```bash
# Build
docker build -t asoperadora .

# Run
docker run -p 3000:3000 --env-file .env.local asoperadora
```

### **Opción C: VPS/Cloud Server**

```bash
git clone <repo>
cd operadora-dev
bun install
bun build

# Con PM2
pm2 start ecosystem.config.js
```

Ver guía completa en [`.same/SETUP-COMPLETO.md`](.same/SETUP-COMPLETO.md#7-deployment)

---

## 🔒 Seguridad

### **Implementado**

- ✅ Encriptación AES-256 para datos sensibles
- ✅ JWT Authentication
- ✅ Rate limiting por IP
- ✅ CORS estricto
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ HSTS (producción)
- ✅ Sanitización de inputs (XSS, SQL injection)
- ✅ Audit logs completos

### **Generar Claves Secretas**

```bash
# JWT Secret
openssl rand -base64 32

# Encryption Secret
openssl rand -base64 32
```

---

## 📊 Estado del Proyecto

### **Progreso General: 98%** ✅

| Módulo | Progreso | Estado |
|--------|----------|--------|
| Sistema Corporativo | 100% | ✅ Completo |
| Sistema de Pagos | 90% | ✅ Funcional |
| Seguridad | 95% | ✅ Funcional |
| Documentos | 90% | ✅ Funcional |
| Testing | 20% | ⏳ En progreso |
| Documentación | 100% | ✅ Completo |

### **Métricas**

- **Total líneas de código:** ~27,000+
- **Servicios:** 15/15 (100% ✅)
- **APIs:** 48/50 (96%)
- **Páginas:** 18/20 (90%)
- **Tests:** 35+ escritos

---

## 🤝 Contribuir

### **Proceso**

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m '✨ Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Convenciones**

- **Commits:** Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Tests:** Escribir tests para nuevas features
- **Documentation:** Actualizar README y docs según sea necesario

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 📞 Soporte

- **Documentación:** [`.same/`](.same/) folder
- **Email:** support@asoperadora.com
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/asoperadora/issues)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- Toda la comunidad open source

---

**Hecho con ❤️ por el equipo de AS Operadora**

**Última actualización:** Diciembre 15, 2025 | **Versión:** 2.82
