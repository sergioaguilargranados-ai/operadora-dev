# 🌍 AS Operadora de Viajes y Eventos

**Plataforma de Reservas Multi-Proveedor con Sistema Financiero Integrado**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 Descripción

Sistema completo de gestión de viajes y eventos con:
- ✅ Búsqueda multi-proveedor (Amadeus, Kiwi, Booking, Expedia)
- ✅ Sistema de reservas completo
- ✅ Dashboards financieros con gráficas interactivas
- ✅ Facturación electrónica CFDI (México)
- ✅ Multi-tenant (múltiples agencias)
- ✅ Multi-moneda
- ✅ Exportación de reportes PDF/Excel
- ✅ Gestión de comisiones
- ✅ Notificaciones por email

---

## 🎯 Características Principales

### **Búsqueda y Reservas**
- 🔍 Búsqueda unificada de vuelos, hoteles y paquetes
- ✈️ Integración con 4 proveedores principales
- 🏨 28+ millones de propiedades hoteleras
- ✈️ 1000+ aerolíneas disponibles
- 📦 Paquetes personalizables

### **Sistema Financiero**
- 📊 Dashboard con gráficas interactivas (Recharts)
- 💰 Cuentas por cobrar y pagar
- 💵 Gestión de comisiones
- 📄 Facturación CFDI automática
- 📈 Reportes financieros exportables

### **Características Técnicas**
- 🏢 Multi-tenant (white-label para agencias)
- 💱 Soporte multi-moneda con conversión automática
- 🔐 Autenticación JWT
- 📧 Sistema de notificaciones (SendGrid)
- 📱 Diseño responsive y moderno
- ⚡ Performance optimizado

---

## 🚀 Instalación Rápida

### **Prerequisitos**
- Node.js 18+ o Bun 1.0+
- PostgreSQL 14+
- Git

### **Paso 1: Clonar repositorio**
```bash
git clone https://github.com/sergioaguilargranados-ai/operadora-dev.git
cd operadora-dev
```

### **Paso 2: Instalar dependencias**
```bash
# Con Bun (recomendado)
bun install

# O con npm
npm install
```

### **Paso 3: Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```bash
# Base de Datos (OBLIGATORIO)
DATABASE_URL=postgresql://user:password@localhost:5432/operadora

# JWT Secret (OBLIGATORIO)
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres

# APIs Externas (OPCIONAL - para funcionalidad completa)
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
KIWI_API_KEY=
EXPEDIA_API_KEY=
BOOKING_API_KEY=
FACTURAMA_USER=
FACTURAMA_PASSWORD=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### **Paso 4: Crear base de datos**
```bash
# Crear base de datos PostgreSQL
createdb operadora

# Ejecutar esquema
psql operadora < .same/ESQUEMA-BD-COMPLETO.sql

# O si usas el DATABASE_URL:
psql $DATABASE_URL < .same/ESQUEMA-BD-COMPLETO.sql
```

### **Paso 5: Iniciar servidor**
```bash
# Desarrollo
bun run dev

# O con npm
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📁 Estructura del Proyecto

```
operadora-dev/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API routes
│   │   │   ├── search/         # Búsqueda multi-proveedor
│   │   │   ├── bookings/       # Sistema de reservas
│   │   │   ├── invoices/       # Facturación CFDI
│   │   │   ├── accounts-receivable/  # CxC
│   │   │   ├── accounts-payable/     # CxP
│   │   │   └── commissions/          # Comisiones
│   │   ├── dashboard/          # Dashboard financiero
│   │   ├── mis-reservas/       # Reservas del usuario
│   │   └── ...
│   │
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── charts/             # Gráficas financieras
│   │
│   ├── services/
│   │   ├── providers/          # Adaptadores de APIs
│   │   │   ├── AmadeusAdapter.ts
│   │   │   ├── KiwiAdapter.ts
│   │   │   ├── BookingAdapter.ts
│   │   │   └── ExpediaAdapter.ts
│   │   ├── PDFService.ts       # Generación PDFs
│   │   ├── ExcelService.ts     # Exportación Excel
│   │   └── FacturamaService.ts # CFDI
│   │
│   └── lib/
│       └── db.ts               # Database helpers
│
├── .same/                      # 📚 Documentación técnica
│   ├── ESQUEMA-BD-COMPLETO.sql
│   ├── DESARROLLO-PROGRESO.md
│   ├── GUIA-REGISTRO-APIS-PASO-A-PASO.md
│   └── ...
│
├── public/                     # Assets estáticos
├── .env.example                # Template variables
├── package.json
└── README.md
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
bun run dev              # Iniciar servidor desarrollo
bun run build            # Build para producción
bun run start            # Iniciar en producción
bun run lint             # Ejecutar linter
```

---

## 🌐 Proveedores Integrados

| Proveedor | Tipo | Cobertura | Estado |
|-----------|------|-----------|--------|
| **Amadeus** | Vuelos | 400+ aerolíneas | ✅ Activo |
| **Kiwi.com** | Vuelos | 800+ aerolíneas | ✅ Activo |
| **Booking.com** | Hoteles | 28M+ propiedades | ✅ Activo |
| **Expedia** | Todo | 500K+ hoteles | ✅ Activo |

### **Cómo registrar APIs:**
Ver guía completa en: `.same/GUIA-REGISTRO-APIS-PASO-A-PASO.md`

---

## 💰 Características Financieras

### **Dashboard Interactivo**
- 📊 Gráficas de Cuentas por Cobrar (Pie Chart)
- 📊 Gráficas de Cuentas por Pagar (Pie Chart)
- 📊 Análisis de Comisiones (Bar Chart)
- 📈 Exportación PDF/Excel de reportes

### **Facturación CFDI**
- ✅ Integración con Facturama
- ✅ Generación automática de facturas
- ✅ Cancelación de CFDI
- ✅ Consulta de facturas

### **Gestión Financiera**
- 💰 Cuentas por Cobrar con seguimiento
- 💸 Cuentas por Pagar
- 💵 Sistema de comisiones por agencia
- 📊 Reportes financieros completos

---

## 📱 Diseño y UX

- ✨ **Diseño moderno** con Tailwind CSS
- 🎨 **Animaciones** con Framer Motion
- 📱 **Responsive** para móviles y tablets
- 🎯 **Glassmorphism** en header
- 🌈 **Gradientes** y efectos visuales
- ⚡ **Performance** optimizado

---

## 🗄️ Base de Datos

### **Esquema:**
- 75+ tablas
- Multi-tenant architecture
- Relaciones optimizadas
- Índices para performance

### **Principales Tablas:**
- `tenants` - Agencias/Operadoras
- `users` - Usuarios del sistema
- `bookings` - Reservas
- `invoices` - Facturas CFDI
- `accounts_receivable` - Cuentas por cobrar
- `accounts_payable` - Cuentas por pagar
- `commissions` - Comisiones

Ver esquema completo en: `.same/ESQUEMA-BD-COMPLETO.sql`

---

## 📚 Documentación

Toda la documentación técnica está en la carpeta `.same/`:

- **DESARROLLO-PROGRESO.md** - Historial completo del desarrollo
- **COMPARATIVA-EXPEDIA-VS-NUESTRO-SISTEMA.md** - Análisis de features
- **COMPARATIVA-APP-MOVIL-EXPEDIA.md** - Estrategia móvil
- **GUIA-REGISTRO-APIS-PASO-A-PASO.md** - Cómo registrar APIs
- **RESUMEN-DASHBOARDS-AVANZADOS.md** - Documentación dashboards
- **ESQUEMA-BD-COMPLETO.sql** - Schema de base de datos
- Y muchos más...

---

## 🚀 Deployment

### **Vercel (Recomendado)**
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático

### **Otras Opciones**
- Netlify
- Railway
- Render
- Tu propio servidor

Ver guía completa: `.same/GUIA-DEPLOYMENT.md`

---

## 📊 Estado del Proyecto

**Versión:** 19
**Progreso:** 92% completo
**Estado:** ✅ Listo para testing y deployment

### **Completado:**
- ✅ Backend APIs (100%)
- ✅ Frontend principal (92%)
- ✅ Dashboards financieros (100%)
- ✅ Sistema de reservas (100%)
- ✅ Facturación CFDI (100%)
- ✅ Exportación PDF/Excel (100%)
- ✅ Gráficas interactivas (100%)

### **Pendiente:**
- ⏳ Filtros avanzados en resultados
- ⏳ Login social (Google, Facebook)
- ⏳ Métodos de pago (Stripe, PayPal)
- ⏳ PWA móvil
- ⏳ Testing E2E

---

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir, contacta al equipo.

---

## 📞 Soporte

Para preguntas o issues:
- 📧 Email: soporte@asoperadora.com
- 📚 Documentación: Ver carpeta `.same/`
- 🐛 Issues: GitHub Issues

---

## 📝 Licencia

Proprietary - © 2025 AS Operadora de Viajes y Eventos

---

## 🎯 Próximos Pasos

1. **Instalar y probar localmente**
2. **Registrar APIs** (al menos Amadeus para testing)
3. **Configurar base de datos**
4. **Testing con datos reales**
5. **Deploy a producción**

---

## ⭐ Features Destacados

- 🏢 **Multi-tenant** - Una instalación, múltiples agencias
- 💱 **Multi-moneda** - USD, EUR, MXN y más
- 📊 **Dashboards avanzados** - Analytics en tiempo real
- 🎫 **Vouchers profesionales** - PDFs de alta calidad
- 📈 **Reportes exportables** - PDF y Excel
- 🔔 **Notificaciones** - Email automático
- 🎨 **UI/UX moderna** - Diseño profesional

---

**¿Listo para comenzar?** 🚀

```bash
git clone https://github.com/sergioaguilargranados-ai/operadora-dev.git
cd operadora-dev
bun install
bun run dev
```

**¡Bienvenido a AS Operadora!** 🌍✈️🏨

---

**Última actualización:** 21 de Noviembre de 2025
