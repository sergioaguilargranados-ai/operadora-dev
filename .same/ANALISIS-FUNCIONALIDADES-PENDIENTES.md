# 📊 ANÁLISIS COMPLETO DE FUNCIONALIDADES PENDIENTES

**Fecha:** 13 de Diciembre de 2025
**Versión:** v2.50
**Estado:** Análisis para priorización

---

## 📋 TABLA DE CONTENIDOS

1. [Estado General del Proyecto](#estado-general)
2. [Funcionalidades por Estado](#funcionalidades-por-estado)
3. [Análisis Detallado](#análisis-detallado)
4. [Plan de Desarrollo Sugerido](#plan-de-desarrollo)
5. [Estimaciones de Tiempo](#estimaciones)

---

## 🎯 ESTADO GENERAL DEL PROYECTO

### **Completado (Backend):** ~60%
- ✅ Base de datos (75+ tablas)
- ✅ Adaptadores de APIs (Amadeus, Kiwi, Booking, Expedia)
- ✅ Multi-tenancy (backend)
- ✅ Multi-moneda (backend)
- ✅ Servicios core (TenantService, CurrencyService, SearchService)
- ✅ Auto-guardado de hoteles
- ✅ Sistema de búsqueda unificado

### **Completado (Frontend):** ~40%
- ✅ Formulario de búsqueda (vuelos, hoteles)
- ✅ Página de resultados con filtros
- ✅ Página de detalles (hoteles)
- ✅ Modal de detalles (vuelos)
- ✅ Paginación de resultados
- ✅ Login/Registro básico

### **Pendiente:** ~40%
- ❌ CRM completo
- ❌ Comisiones
- ❌ Chatbot IA
- ❌ Itinerarios IA
- ❌ Documentos de usuarios
- ❌ Marca blanca (frontend)
- ❌ Pagos (Stripe + Mercado Pago)
- ❌ Traslados
- ❌ Cotizaciones
- ❌ Sistema de usuarios y roles (nuevo sistema propuesto)
- ❌ Seguridad y tracking (propuesta nueva)

---

## 📊 FUNCIONALIDADES POR ESTADO

### ✅ **COMPLETADO (Backend + DB)**

| # | Funcionalidad | Backend | Frontend | DB | Estado |
|---|---------------|---------|----------|-----|--------|
| 1 | Multi-moneda | ✅ 100% | ⏸️ 20% | ✅ | Backend listo |
| 2 | Multi-tenant | ✅ 100% | ❌ 0% | ✅ | Backend listo |
| 3 | APIs Proveedores | ✅ 90% | ✅ 70% | ✅ | Funcional |
| 4 | Búsquedas | ✅ 80% | ✅ 80% | ✅ | Funcional |

### 🟡 **PARCIALMENTE COMPLETADO**

| # | Funcionalidad | Backend | Frontend | DB | Falta |
|---|---------------|---------|----------|-----|-------|
| 5 | CRM Básico | ✅ 40% | ❌ 0% | ✅ | Frontend completo |
| 6 | Facturación | ⏸️ 20% | ❌ 0% | ✅ | Integración Facturama |
| 7 | Cuentas por Cobrar | ⏸️ 30% | ❌ 0% | ✅ | Lógica de negocio |
| 8 | Cuentas por Pagar | ⏸️ 30% | ❌ 0% | ✅ | Lógica de negocio |
| 9 | Comisiones | ⏸️ 20% | ❌ 0% | ✅ | Configuración + cálculo |
| 10 | Documentos | ❌ 0% | ❌ 0% | ✅ | Upload + encriptación |

### ❌ **NO INICIADO**

| # | Funcionalidad | Complejidad | Prioridad | Tiempo Est. |
|---|---------------|-------------|-----------|-------------|
| 11 | Chatbot IA (OpenAI) | Alta | Media | 3-4 semanas |
| 12 | Itinerarios IA | Alta | Media | 2-3 semanas |
| 13 | Traslados (Amadeus) | Media | Media | 1-2 semanas |
| 14 | Cotizaciones | Media | Alta | 2-3 semanas |
| 15 | Pagos (Stripe) | Media | Alta | 1-2 semanas |
| 16 | Pagos (Mercado Pago) | Media | Media | 1 semana |
| 17 | WhatsApp Bot | Alta | Baja | 2-3 semanas |
| 18 | Usuarios y Roles (nuevo) | Alta | **CRÍTICA** | 3-4 semanas |
| 19 | Seguridad y Tracking | Media | **CRÍTICA** | 2-3 semanas |

---

## 🔍 ANÁLISIS DETALLADO

### 1️⃣ **CRM EXTENDIDO** 🟡

**Estado Actual:**
- ✅ Tablas en BD (`crm_contacts`, `crm_interactions`, `crm_tasks`, `crm_pipeline`)
- ✅ Estructura base preparada
- ❌ APIs no implementadas
- ❌ Frontend no existe

**Lo que Falta:**
```typescript
// APIs necesarias:
- POST /api/crm/contacts
- GET /api/crm/contacts
- PUT /api/crm/contacts/[id]
- POST /api/crm/interactions
- GET /api/crm/pipeline
- POST /api/crm/tasks
```

**Frontend necesario:**
- Dashboard CRM (vista 360° del cliente)
- Lista de contactos con filtros
- Pipeline de ventas (Kanban)
- Historial de interacciones
- Calendario de tareas

**Prioridad:** ALTA (necesario para equipos de ventas)
**Tiempo estimado:** 2-3 semanas

---

### 2️⃣ **CONFIGURACIÓN DE COMISIONES** 🟡

**Estado Actual:**
- ✅ Tablas en BD (`commission_rules`, `commissions`, `commission_payments`)
- ❌ Lógica de cálculo no implementada
- ❌ Panel de configuración no existe

**Lo que Falta:**
```sql
-- Ejemplo de reglas de comisión:
{
  "agency_id": 123,
  "service_type": "hotel",
  "commission_type": "percentage", -- o "fixed"
  "value": 10.00,
  "conditions": {
    "min_booking_amount": 1000,
    "destinations": ["CUN", "MEX"],
    "booking_window_days": 30
  }
}
```

**Funcionalidades:**
- CRUD de reglas de comisión
- Cálculo automático al confirmar reserva
- Reporte de comisiones acumuladas
- Proceso de pago a agencias
- Notificaciones de comisiones generadas

**Prioridad:** ALTA (necesario para agencias)
**Tiempo estimado:** 2 semanas

---

### 3️⃣ **CHATBOT CON IA (OpenAI)** ❌

**Estado Actual:**
- ❌ No iniciado
- ❌ Sin integración con OpenAI
- ❌ Sin interfaz de chat

**Funcionalidades Propuestas:**

**A) Chat en Sitio Web:**
- Widget de chat flotante
- Respuestas automáticas con GPT-4
- Contexto de conversación
- Escalamiento a agente humano
- Historial de conversaciones

**B) WhatsApp Bot:**
- Integración con Twilio/WhatsApp Business API
- Respuestas automáticas
- Consulta de reservas
- Notificaciones de vuelos
- Soporte 24/7

**Tecnologías:**
```typescript
// Integración OpenAI
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Prompt system
const systemPrompt = `
Eres un asistente virtual de AS Operadora de Viajes.
Ayudas a los clientes a:
- Buscar vuelos y hoteles
- Consultar reservas existentes
- Resolver dudas sobre destinos
- Procesar solicitudes de cotización

Siempre sé amable, profesional y conciso.
`
```

**Costo Estimado:**
- OpenAI API: ~$20-50 USD/mes (uso inicial)
- Twilio WhatsApp: ~$0.005 USD por mensaje

**Prioridad:** MEDIA (innovador pero no crítico)
**Tiempo estimado:** 3-4 semanas

---

### 4️⃣ **CREADOR DE ITINERARIOS CON IA** ❌

**Estado Actual:**
- ❌ No iniciado

**Funcionalidades Propuestas:**

**Input del Usuario:**
- Destino(s)
- Fechas de viaje
- Presupuesto
- Intereses (aventura, cultura, playa, etc.)
- Tipo de viajero (familia, pareja, solo)

**Output Generado por IA:**
```typescript
{
  "itinerary": {
    "title": "7 Días en Cancún - Aventura y Playa",
    "days": [
      {
        "day": 1,
        "date": "2025-03-15",
        "activities": [
          {
            "time": "09:00",
            "activity": "Llegada a Cancún",
            "description": "Check-in en hotel",
            "location": "Hotel Paradise",
            "cost": 0
          },
          {
            "time": "14:00",
            "activity": "Playa del Carmen",
            "description": "Tarde de playa y snorkel",
            "location": "Playa del Carmen",
            "cost": 500
          }
        ],
        "accommodations": {
          "hotel_id": 123,
          "check_in": "2025-03-15",
          "nights": 1
        }
      }
      // ... más días
    ],
    "budget_breakdown": {
      "flights": 8000,
      "hotels": 12000,
      "activities": 5000,
      "food": 3000,
      "total": 28000
    }
  }
}
```

**Features:**
- Generación automática con GPT-4
- Integración con búsquedas de vuelos/hoteles
- Sugerencias de actividades (APIs de GetYourGuide, Viator)
- Mapa interactivo del itinerario
- Exportar a PDF
- Compartir con otros viajeros
- Convertir en cotización/reserva

**Prioridad:** MEDIA (valor agregado alto)
**Tiempo estimado:** 2-3 semanas

---

### 5️⃣ **GUARDADO DE DOCUMENTOS DE USUARIOS** ❌

**Estado Actual:**
- ✅ Tabla `traveler_documents` en BD
- ❌ APIs no implementadas
- ❌ Sistema de upload no existe

**Tipos de Documentos:**
```typescript
{
  "document_types": [
    "passport",           // Pasaporte
    "visa",              // Visa
    "id",                // INE/IFE
    "birth_certificate", // Acta de nacimiento
    "vaccination",       // Certificado de vacunación
    "travel_insurance",  // Seguro de viaje
    "other"             // Otros documentos
  ]
}
```

**Funcionalidades:**

**A) Upload y Almacenamiento:**
- Upload de archivos (PDF, JPG, PNG)
- Almacenamiento encriptado (AES-256)
- Vercel Blob Storage o Cloudflare R2
- URLs firmadas (expiran en 1 hora)
- Máximo 10MB por archivo

**B) Gestión:**
- Listar documentos por usuario
- Download con autenticación
- Eliminar documentos
- Vencimiento de documentos
- Notificaciones de documentos por vencer

**C) Seguridad:**
- Encriptación en reposo
- Encriptación en tránsito (HTTPS)
- Solo el usuario y admin pueden ver
- Logs de acceso a documentos
- 2FA para documentos sensibles

**D) OCR (Opcional):**
- Extracción automática de datos de pasaportes
- Validación de datos
- Autocompletado de formularios

**Prioridad:** ALTA (necesario para reservas internacionales)
**Tiempo estimado:** 2 semanas

---

### 6️⃣ **MULTI-MONEDA** ✅

**Estado Actual:**
- ✅ Backend 100% completo
- ✅ CurrencyService funcional
- ✅ API `/api/currencies` lista
- ⏸️ Frontend solo en algunas vistas

**Lo que Falta:**
- [ ] Selector de moneda en header
- [ ] Persistir preferencia de usuario
- [ ] Mostrar precios en moneda seleccionada en TODAS las vistas
- [ ] Gráficas de historial de tipos de cambio (admin)

**Prioridad:** MEDIA (ya funciona backend)
**Tiempo estimado:** 3-4 días

---

### 7️⃣ **MARCA BLANCA (MULTI-TENANT)** 🟡

**Estado Actual:**
- ✅ Backend 100% completo
- ✅ TenantService funcional
- ✅ Middleware de detección de tenant
- ✅ API `/api/tenants` lista
- ❌ Frontend 0%

**Lo que Falta:**

**A) Sistema de Configuración:**
```typescript
{
  "tenant_config": {
    "branding": {
      "logo_url": "https://...",
      "favicon_url": "https://...",
      "colors": {
        "primary": "#007bff",
        "secondary": "#6c757d",
        "accent": "#28a745"
      },
      "fonts": {
        "heading": "Poppins",
        "body": "Inter"
      }
    },
    "domain": {
      "subdomain": "agencia1",
      "custom_domain": "www.agencia1.com",
      "ssl_enabled": true
    },
    "features": {
      "enabled_modules": ["flights", "hotels", "packages"],
      "white_label_complete": true,
      "custom_footer": true,
      "custom_emails": true
    },
    "contact": {
      "email": "contacto@agencia1.com",
      "phone": "+52 999 999 9999",
      "whatsapp": "+52 999 999 9999",
      "social": {
        "facebook": "agencia1",
        "instagram": "@agencia1"
      }
    }
  }
}
```

**B) Panel de Configuración:**
- Upload de logos (header + favicon)
- Color picker para marca
- Configuración de dominio personalizado
- Verificación DNS
- Preview en tiempo real

**C) Features:**
- CSS dinámico basado en configuración
- Meta tags personalizados (SEO)
- Emails con branding del tenant
- Footer personalizado
- Términos y condiciones por tenant

**Prioridad:** MEDIA-ALTA (diferenciador clave para agencias)
**Tiempo estimado:** 2-3 semanas

---

### 8️⃣ **SISTEMAS DE PAGO** ❌

#### **A) Stripe** ❌

**Funcionalidades:**
- Pagos con tarjeta (Visa, MasterCard, Amex)
- 3D Secure (SCA compliance)
- Guardado de tarjetas (tokenización)
- Pagos recurrentes (suscripciones)
- Webhooks de confirmación
- Reembolsos

**Integración:**
```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Crear Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00
  currency: 'mxn',
  metadata: {
    booking_id: '12345',
    user_id: '67890'
  }
})
```

**Prioridad:** ALTA (necesario para ventas)
**Tiempo estimado:** 1-2 semanas
**Costo:** 3.6% + $3 MXN por transacción

#### **B) Mercado Pago** ❌

**Funcionalidades:**
- Pagos con tarjeta
- Meses sin intereses
- OXXO, Spei, efectivo
- Wallet de Mercado Pago
- Webhooks

**Integración:**
```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

const payment = new Payment(client)
const result = await payment.create({
  body: {
    transaction_amount: 2000,
    description: 'Reserva Hotel Paradise',
    payment_method_id: 'visa',
    payer: {
      email: 'cliente@email.com'
    }
  }
})
```

**Prioridad:** MEDIA (alternativa local)
**Tiempo estimado:** 1 semana
**Costo:** 3.99% + IVA por transacción

---

### 9️⃣ **TRASLADOS (AMADEUS)** ❌

**Estado Actual:**
- ❌ No iniciado

**API de Amadeus Disponible:**
- Transfer Search
- Transfer Booking
- Transfer Management

**Tipos de Traslados:**
- Aeropuerto → Hotel
- Hotel → Aeropuerto
- Punto a Punto
- Tours privados
- Servicio de taxis/Uber integrado

**Vehículos:**
- Sedan (1-3 pasajeros)
- Van (4-6 pasajeros)
- Minibus (7-15 pasajeros)
- Bus (16+ pasajeros)
- Lujo/Ejecutivo

**Funcionalidades:**
```typescript
{
  "transfer_request": {
    "origin": {
      "type": "airport",
      "code": "CUN",
      "terminal": "2"
    },
    "destination": {
      "type": "hotel",
      "name": "Hotel Paradise",
      "address": "Blvd. Kukulcan km 9.5"
    },
    "date": "2025-03-15",
    "time": "14:30",
    "passengers": 4,
    "luggage": 4,
    "vehicle_type": "van"
  }
}
```

**Prioridad:** MEDIA (complementa vuelos/hoteles)
**Tiempo estimado:** 1-2 semanas

---

### 🔟 **COTIZACIONES** ❌

**Estado Actual:**
- ⏸️ Tabla `quotations` existe en BD
- ❌ Sistema no implementado

**Flujo Completo:**

**1. Cliente Solicita Cotización:**
```
Usuario selecciona productos/servicios deseados:
✓ Vuelo México → Cancún
✓ Hotel 5* (5 noches)
✓ Traslado aeropuerto-hotel
+ Campo abierto: "Necesito tour a Chichén Itzá para 4 personas"
```

**2. Operadora Completa Cotización:**
```
Agente de ventas accede a cotización:
- Ve los productos seleccionados
- Agrega servicios adicionales manualmente:
  * Tour Chichén Itzá (4 pax): $2,500 MXN c/u
  * Seguro de viaje: $500 MXN c/u
  * Traslado adicional: $800 MXN
- Ajusta precios (descuentos corporativos)
- Agrega notas/condiciones
- Calcula total
```

**3. Envío de Cotización:**
```
- PDF profesional con branding
- Vigencia de la cotización (15 días típico)
- Email al cliente con link de aprobación
- Cliente puede:
  * Aceptar → Convierte en reserva
  * Solicitar cambios → Regresa a operadora
  * Rechazar
```

**4. Conversión a Reserva:**
```
Al aceptar cotización:
→ Crea booking en estado "pendiente_pago"
→ Genera orden de pago
→ Cliente paga
→ Confirma reserva
→ Genera factura
```

**Base de Datos:**
```sql
CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    agency_id INTEGER REFERENCES agencies(id),
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(20), -- 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'
    valid_until DATE,
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    discount DECIMAL(10,2),
    total DECIMAL(10,2),
    currency VARCHAR(3),
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(id),
    item_type VARCHAR(50), -- 'flight', 'hotel', 'transfer', 'tour', 'custom'
    item_id INTEGER, -- Referencia al producto (si existe)
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    tax_rate DECIMAL(5,2),
    notes TEXT
);

CREATE TABLE quotation_history (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(id),
    action VARCHAR(50), -- 'created', 'sent', 'modified', 'accepted', 'rejected'
    performed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Prioridad:** ALTA (flujo de ventas crítico)
**Tiempo estimado:** 2-3 semanas

---

## 🚀 PLAN DE DESARROLLO SUGERIDO

### **PRIORIDAD 1 - CRÍTICO (Semanas 1-4)**
**Objetivo:** Seguridad, usuarios y funcionalidad base de ventas

#### Semana 1-2: Sistema de Usuarios y Seguridad
- [x] Crear documentación (COMPLETADO)
- [ ] Migraciones SQL (usuarios, roles, permisos, tracking)
- [ ] Actualizar formulario de registro (multi-tipo)
- [ ] Sistema de aprobaciones
- [ ] Middleware de permisos
- [ ] Banner de cookies
- [ ] Tracking de accesos
- [ ] Google Analytics

#### Semana 3: Cotizaciones
- [ ] APIs de cotizaciones (CRUD)
- [ ] Frontend: Crear cotización
- [ ] Frontend: Aprobar/rechazar cotización
- [ ] Conversión a reserva
- [ ] Generación de PDF

#### Semana 4: Pagos Básicos
- [ ] Integración Stripe
- [ ] Checkout page
- [ ] Confirmación de pago
- [ ] Webhooks

---

### **PRIORIDAD 2 - ALTA (Semanas 5-8)**
**Objetivo:** CRM, comisiones y documentos

#### Semana 5-6: CRM Básico
- [ ] APIs de CRM (contactos, interacciones, tareas)
- [ ] Dashboard CRM
- [ ] Ficha de cliente 360°
- [ ] Pipeline de ventas

#### Semana 7: Configuración de Comisiones
- [ ] CRUD de reglas de comisión
- [ ] Cálculo automático
- [ ] Reporte de comisiones
- [ ] Proceso de pago

#### Semana 8: Documentos de Usuarios
- [ ] Sistema de upload
- [ ] Encriptación
- [ ] APIs de gestión
- [ ] Frontend de documentos

---

### **PRIORIDAD 3 - MEDIA (Semanas 9-12)**
**Objetivo:** Features avanzadas y diferenciadores

#### Semana 9-10: Marca Blanca
- [ ] Panel de configuración de tenant
- [ ] CSS dinámico
- [ ] Verificación de dominio
- [ ] Preview de tenant

#### Semana 11: Traslados
- [ ] Adaptador Amadeus Transfers
- [ ] Búsqueda de traslados
- [ ] Booking de traslados
- [ ] Frontend

#### Semana 12: Mercado Pago
- [ ] Integración Mercado Pago
- [ ] OXXO, SPEI
- [ ] Webhooks

---

### **PRIORIDAD 4 - INNOVACIÓN (Semanas 13-16)**
**Objetivo:** IA y diferenciadores tecnológicos

#### Semana 13-14: Chatbot IA
- [ ] Integración OpenAI
- [ ] Widget de chat
- [ ] Prompts y contexto
- [ ] Escalamiento a humano

#### Semana 15-16: Creador de Itinerarios IA
- [ ] Prompts de itinerarios
- [ ] Integración con búsquedas
- [ ] Generación de PDFs
- [ ] Conversión a cotización

---

## ⏱️ ESTIMACIONES DE TIEMPO

| Prioridad | Funcionalidades | Semanas | Inicio Sugerido |
|-----------|-----------------|---------|-----------------|
| **CRÍTICA** | Usuarios, Seguridad, Cotizaciones, Pagos | 4 | Inmediato |
| **ALTA** | CRM, Comisiones, Documentos | 4 | Semana 5 |
| **MEDIA** | Marca Blanca, Traslados, Mercado Pago | 4 | Semana 9 |
| **INNOVACIÓN** | Chatbot IA, Itinerarios IA | 4 | Semana 13 |

**Total estimado:** 16 semanas (4 meses)

---

## ❓ PREGUNTAS PARA EL CLIENTE

1. **¿Estás de acuerdo con la priorización sugerida?**
2. **¿Alguna funcionalidad debe moverse a prioridad más alta?**
3. **¿Prefieres completar TODA la Prioridad 1 antes de pasar a Prioridad 2?** (recomendado)
4. **¿O prefieres ir intercalando funcionalidades?**
5. **¿Cuánto tiempo/presupuesto tienes disponible para desarrollo?**

---

**Creado por:** AS Operadora Dev Team
**Fecha:** 13 de Diciembre de 2025
**Estado:** Pendiente de aprobación del plan
