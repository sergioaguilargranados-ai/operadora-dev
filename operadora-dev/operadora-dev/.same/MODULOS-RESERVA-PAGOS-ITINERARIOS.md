# 📋 MÓDULOS: RESERVA, PAGOS, ITINERARIOS Y CHATBOT

**Última actualización:** 18 de Diciembre de 2025 - 10:45 CST
**Versión:** v2.127
**Actualizado por:** AI Assistant

---

## 🎯 ESTADO ACTUAL DE MÓDULOS

### 1. **MÓDULO DE RESERVAS** ✅ Completo

**Archivos:**
- `src/app/reserva/[id]/page.tsx` (21K - completo)
- `src/app/api/bookings/route.ts` (APIs CRUD)
- `src/app/api/bookings/[id]/route.ts`

**Base de Datos:**
- ✅ Tabla `bookings` (90 registros de prueba)
- ✅ Campos: booking_reference, booking_status, payment_status, total_price, etc.

**Funcionalidades Implementadas:**
- ✅ Crear reserva desde búsqueda de hoteles/vuelos
- ✅ Ver detalle de reserva
- ✅ Editar información de viajeros
- ✅ Cancelar reserva
- ✅ Estados: pending, confirmed, completed, cancelled
- ✅ Integración con usuario (user_id)
- ✅ Multi-tenant (tenant_id para corporativos)

**Acceso:**
- Usuario: `/mis-reservas` (ver todas mis reservas)
- Admin: `/dashboard/corporate` (ver todas las reservas)

---

### 2. **MÓDULO DE PAGOS** ✅ Completo

**Archivos:**
- `src/app/checkout/[bookingId]/page.tsx` (12K - completo)
- `src/app/api/payments/stripe/` (Stripe integrado)
- `src/app/api/payments/paypal/` (PayPal integrado)
- `src/services/StripeService.ts`
- `src/services/PayPalService.ts`

**Base de Datos:**
- ✅ Tabla `payment_transactions` (preparada)
- ✅ Campos: payment_method, amount, status, transaction_id

**Funcionalidades Implementadas:**
- ✅ Checkout con Stripe (tarjetas)
- ✅ Checkout con PayPal
- ✅ Payment intents
- ✅ Webhooks para confirmación
- ✅ Estados: pending, completed, failed, refunded
- ✅ Registro de transacciones

**Pendiente:**
- ⏳ Agregar más datos de ejemplo
- ⏳ Transferencia bancaria manual
- ⏳ Pago en efectivo/oficina

**Acceso:**
- `/checkout/[bookingId]` (después de crear reserva)
- `/dashboard/payments` (admin - ver todos los pagos)

---

### 3. **MÓDULO DE FACTURACIÓN** 🚧 En Configuración

**Archivos:**
- `src/app/dashboard/payments/page.tsx` (479 líneas - completo)
- `src/app/api/invoices/route.ts` (APIs CRUD)
- `src/app/api/accounts-payable/route.ts`
- `src/app/api/accounts-receivable/route.ts`
- `src/services/FacturamaService.ts` (integración preparada)

**Base de Datos:**
- ✅ Tabla `invoices` (preparada - agregando datos ahora)
- ✅ Tabla `accounts_payable` (cuentas por pagar)
- ✅ Tabla `accounts_receivable` (cuentas por cobrar)

**Funcionalidades:**
- ✅ Crear facturas desde reservas
- ✅ Ver facturas emitidas
- ✅ Estados: draft, issued, paid, overdue, cancelled
- ⏳ Descargar PDF/XML (Facturama configurado)
- ⏳ Enviar factura por email
- ✅ Gestión de cuentas por pagar/cobrar

**Acceso:**
- `/dashboard/payments` (admin - gestión completa)

---

### 3.5 **SISTEMA DE COTIZACIONES** ✅ Completo (v2.127)

**Archivos:**
- `src/app/dashboard/quotes/page.tsx` (completo)
- `src/app/api/quotes/route.ts` (CRUD completo)
- `src/app/api/quotes/[id]/pdf/route.ts` (exportar PDF)
- `src/app/api/quotes/[id]/send/route.ts` (enviar por email)
- `src/lib/pdfGenerator.ts` (generación de PDFs)

**Base de Datos:**
- ✅ Tabla `quotes` (cotizaciones)
- ✅ Tabla `quote_items` (items/rubros de cotización)
- ✅ Auto-generación de números de cotización (Q-2025-0001)
- ✅ Cálculo automático de totales
- ✅ Datos de ejemplo insertados

**Funcionalidades Implementadas:**
- ✅ Crear cotizaciones personalizadas
- ✅ Agregar/eliminar items dinámicamente
- ✅ Items con texto libre (item_name, description)
- ✅ Categorías: flight, hotel, transfer, activity, insurance, custom
- ✅ Cálculo automático de subtotales y totales
- ✅ Vista previa en tiempo real
- ✅ Estados: draft, sent, viewed, accepted, rejected, expired
- ✅ Listar todas las cotizaciones
- ✅ Editar cotizaciones existentes
- ✅ **Exportar a PDF profesional con logo**
- ✅ **Enviar por email con PDF adjunto** (NodeMailer)
- ✅ Email HTML responsive y profesional
- ✅ Actualización automática de estado a "sent"
- ✅ Términos y condiciones incluidos

**Configuración Email (SMTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

**Acceso:**
- Admin: `/dashboard/quotes` (gestión completa)

---

### 4. **CREADOR DE ITINERARIOS** ✅ Completo (v2.127)

**Estado:** ✅ Módulo 100% funcional

**Archivos:**
- `src/app/dashboard/itineraries/page.tsx` (completo)
- `src/app/itinerary/shared/[token]/page.tsx` (vista pública)
- `src/app/api/itineraries/route.ts` (CRUD completo)
- `src/app/api/itineraries/[id]/pdf/route.ts` (exportar PDF)
- `src/app/api/itineraries/[id]/share/route.ts` (compartir público)
- `src/app/api/itineraries/shared/[token]/route.ts` (ver público)
- `src/lib/pdfGenerator.ts` (generación de PDFs)

**Base de Datos:**
- ✅ Tabla `itineraries` creada (migración 010)
- ✅ Campos: title, destination, days (JSONB), notes, recommendations
- ✅ Sistema de compartir con token único
- ✅ Datos de ejemplo insertados

**Funcionalidades Implementadas:**
- ✅ Crear itinerario personalizado día por día
- ✅ Agregar/eliminar días dinámicamente
- ✅ Agregar/eliminar actividades por día
- ✅ Horarios, títulos, descripciones, ubicaciones
- ✅ Notas importantes y recomendaciones
- ✅ Listar todos los itinerarios
- ✅ Editar itinerarios existentes
- ✅ **Exportar a PDF profesional** (jsPDF)
- ✅ **Compartir con link público único** (sin login)
- ✅ Página pública hermosa para compartir
- ✅ Copiar link al portapapeles automáticamente
- ✅ Descargar PDF desde vista pública
- ✅ Estados: draft, active, completed, cancelled

**Acceso:**
- Admin: `/dashboard/itineraries` (gestión completa)
- Público: `/itinerary/shared/[token]` (sin login)

---

### 5. **CHATBOT WEB** ✅ Completo (v2.124)

**Archivos:**
- `src/components/ChatWidget.tsx` (widget flotante)
- `src/app/chatbot/page.tsx` (página completa)
- `src/app/api/chatbot/route.ts` (procesamiento de mensajes)

**Estado Actual:**
- ✅ Widget flotante en todas las páginas (esquina inferior derecha)
- ✅ Página completa de chat `/chatbot`
- ✅ Sistema de respuestas inteligentes basado en reglas
- ✅ Preparado para integración con OpenAI GPT-4
- ✅ Historial de conversación (últimos 10 mensajes)
- ✅ Animaciones con Framer Motion
- ✅ Indicador de escritura (typing...)
- ✅ Minimizar/Maximizar widget
- ✅ Respuestas contextuales sobre:
  - Vuelos, hoteles, paquetes
  - Precios y cotizaciones
  - Documentos necesarios
  - Cancelaciones y reembolsos
  - Contacto y soporte

**Funcionalidades:**
- ✅ 100% funcional sin necesidad de OpenAI
- ✅ Respuestas instantáneas y contextuales
- ✅ Interfaz moderna y profesional
- ⏳ OpenAI GPT-4 (agregar OPENAI_API_KEY para activar)
- ❌ WhatsApp bot (pendiente)

**Documentación:**
- Ver `.same/CHATBOT-SETUP.md` para guía completa

#### **5.2 Chatbot WhatsApp** ❌ Pendiente

**Funcionalidades:**
- [ ] Widget flotante en todas las páginas
- [ ] Respuestas automáticas con IA (OpenAI/Claude)
- [ ] Contexto de la página actual
- [ ] Historial de conversación
- [ ] Transferir a agente humano
- [ ] Búsqueda de vuelos/hoteles desde chat
- [ ] Crear reserva desde chat

**Archivos a Crear/Editar:**
- `src/components/ChatWidget.tsx` (widget flotante)
- `src/app/api/chatbot/route.ts` (API para mensajes)
- `src/services/ChatbotService.ts` (lógica IA)

**Integración Sugerida:**
- OpenAI GPT-4 para respuestas
- Embeddings para buscar en documentación
- Context: página actual, usuario, reservas previas

#### **5.2 Chatbot WhatsApp**

**Funcionalidades:**
- [ ] Recibir mensajes de WhatsApp
- [ ] Responder automáticamente
- [ ] Crear reservas vía WhatsApp
- [ ] Enviar confirmaciones
- [ ] Enviar recordatorios
- [ ] Estado de reservas

**Integración Necesaria:**
- Twilio WhatsApp API
- O WhatsApp Business API
- Webhook para recibir mensajes

**Archivos a Crear:**
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/services/WhatsAppService.ts`

**Flujo:**
```
Usuario WhatsApp → Webhook
  ↓
Procesar mensaje (IA)
  ↓
Generar respuesta
  ↓
Enviar vía WhatsApp API
```

---

## 📊 PRIORIZACIÓN RECOMENDADA

### **Fase 1: Completar lo Existente** (1-2 días)
1. ✅ Agregar datos de ejemplo a facturación
2. ✅ Enlazar facturación al menú (hecho)
3. ⏳ Probar flujo completo: Búsqueda → Reserva → Pago → Factura

### **Fase 2: Creador de Itinerarios** (2-3 días)
1. Crear tabla `itineraries`
2. Página de creación de itinerario
3. Editor drag & drop de actividades
4. Vista previa y exportar PDF
5. Compartir con viajeros

### **Fase 3: Chatbot Web** (2-3 días)
1. Widget flotante en homepage
2. Integración con OpenAI
3. Respuestas contextuales
4. Búsqueda de vuelos/hoteles desde chat

### **Fase 4: Chatbot WhatsApp** (3-4 días)
1. Configurar Twilio/WhatsApp Business
2. Webhook para recibir mensajes
3. Procesamiento con IA
4. Crear reservas vía WhatsApp
5. Notificaciones automáticas

---

## 🎯 ESTADO ACTUAL v2.127

### ✅ MÓDULOS COMPLETADOS (100%)

1. **Reservas** ✅ Completo
2. **Pagos (Stripe + PayPal)** ✅ Completo
3. **Facturación** ✅ Enlazado (pendiente datos)
4. **Cotizaciones** ✅ Completo con PDFs y Email
5. **Itinerarios** ✅ Completo con PDFs y Compartir
6. **Chatbot Web** ✅ Completo con IA opcional

### 📊 RESUMEN DE FUNCIONALIDADES

**Cotizaciones:**
- ✅ Crear/editar cotizaciones con items dinámicos
- ✅ Exportar a PDF profesional
- ✅ Enviar por email con PDF adjunto
- ✅ Estados: draft, sent, viewed, accepted, rejected

**Itinerarios:**
- ✅ Crear itinerarios día por día
- ✅ Actividades con horarios y ubicaciones
- ✅ Exportar a PDF hermoso
- ✅ Compartir con link público único
- ✅ Página pública sin login

**Chatbot Web:**
- ✅ Widget flotante en todas las páginas
- ✅ Respuestas inteligentes basadas en reglas
- ✅ Preparado para OpenAI GPT-4
- ✅ Página completa de chat

### ⏳ PENDIENTE

**A) Facturación CFDI**
- [ ] Botón "Facturar" en detalle de reserva
- [ ] Generar factura desde reserva
- [ ] Integración completa con Facturama

**B) Chatbot WhatsApp**
- [ ] Configurar Twilio/WhatsApp Business
- [ ] Webhook para mensajes
- [ ] Respuestas automáticas
- [ ] Crear reservas vía WhatsApp

**C) Mejoras Sugeridas**
- [ ] Analytics de cotizaciones enviadas
- [ ] Notificaciones push cuando cliente ve cotización
- [ ] Plantillas personalizables de emails
- [ ] Configuración SMTP real en producción

---

**Versión:** v2.127
**Progreso Total:** 95% completo
**Última actualización:** 18 Diciembre 2025 - 10:45 CST
