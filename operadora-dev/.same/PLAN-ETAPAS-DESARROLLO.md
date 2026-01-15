# 🎯 PLAN DE ETAPAS - DESARROLLO AS OPERADORA

**Fecha:** 14 de Diciembre de 2025
**Estado Actual:** 55% completado
**Objetivo:** Llevar a 100% (Producción completa)

---

## 📋 ESTRATEGIA

El desarrollo se divide en **4 ETAPAS PRINCIPALES**:

1. **ETAPA 1:** Completar Funcionalidades Iniciadas (MVP Ready)
2. **ETAPA 2:** Features Administrativas y CRM
3. **ETAPA 3:** Seguridad y Documentos
4. **ETAPA 4:** Features Avanzadas y Optimización

---

# 🚀 ETAPA 1: COMPLETAR MVP (2-3 semanas)

**Objetivo:** Completar funcionalidades iniciadas para tener un MVP funcional

**Progreso Actual:** 55% → **Objetivo:** 75%

## 1.1 Integración de Pagos ⭐ ALTA PRIORIDAD

### **Stripe Integration**
- [ ] Setup cuenta Stripe
- [ ] Instalar `@stripe/stripe-js` y `stripe` (servidor)
- [ ] Crear `/api/payments/create-intent`
- [ ] Crear `/api/payments/confirm`
- [ ] Crear `/api/payments/webhook` (eventos de Stripe)
- [ ] Componente `PaymentForm` con Elements
- [ ] Manejo de 3D Secure
- [ ] Guardar métodos de pago (tokenizados)
- [ ] Testing con tarjetas de prueba

### **PayPal Integration (Opcional)**
- [ ] Setup cuenta PayPal Business
- [ ] Instalar `@paypal/react-paypal-js`
- [ ] Crear `/api/payments/paypal/create-order`
- [ ] Crear `/api/payments/paypal/capture-order`
- [ ] Componente `PayPalButton`
- [ ] Webhooks de PayPal

### **Mercado Pago (México - Opcional)**
- [ ] Setup cuenta Mercado Pago
- [ ] Integrar SDK
- [ ] Soportar OXXO, SPEI, tarjetas mexicanas

**Estimado:** 5-7 días

---

## 1.2 Workflow de Aprobación de Reservas ⭐ ALTA PRIORIDAD

### **Backend**
- [ ] Crear `/api/approvals/pending` - Listar pendientes
- [ ] Crear `/api/approvals/[id]/approve` - Aprobar
- [ ] Crear `/api/approvals/[id]/reject` - Rechazar
- [ ] Crear `/api/approvals/[id]/history` - Historial
- [ ] Trigger automático al crear reserva (si requires_approval)
- [ ] Notificaciones a aprobadores
- [ ] Notificaciones a solicitante (aprobado/rechazado)

### **Frontend**
- [ ] Página `/approvals` - Lista de pendientes
- [ ] Modal de aprobación con detalles
- [ ] Formulario de rechazo con razón
- [ ] Badge de "Pendiente aprobación" en reservas
- [ ] Notificaciones en tiempo real (opcional)

**Estimado:** 4-5 días

---

## 1.3 Dashboard Administrativo Completo ⭐ ALTA PRIORIDAD

### **Gestión de Hoteles**
- [ ] Página `/admin/hotels` - Lista completa
- [ ] CRUD completo de hoteles
- [ ] Upload múltiple de imágenes
- [ ] Editar amenidades
- [ ] Marcar como destacado/oferta
- [ ] Activar/desactivar

### **Gestión de Vuelos (Mock Data)**
- [ ] Página `/admin/flights` - Lista
- [ ] CRUD de vuelos mock
- [ ] Para testing sin APIs reales

### **Gestión de Promociones**
- [ ] Página `/admin/promotions` - Lista
- [ ] Crear promoción (% descuento, código)
- [ ] Asignar a productos específicos
- [ ] Fechas de validez
- [ ] Límite de usos

### **Gestión de Proveedores**
- [ ] Página `/admin/suppliers` - Lista
- [ ] CRUD de proveedores
- [ ] Contratos y tarifas negociadas
- [ ] Estado de cuenta con proveedores

**Estimado:** 6-8 días

---

## 1.4 White-Label Context Frontend ⭐ MEDIA PRIORIDAD

### **Implementación**
- [ ] Crear `src/contexts/WhiteLabelContext.tsx`
- [ ] Detectar tenant en middleware (ya existe)
- [ ] Cargar configuración white-label
- [ ] Provider en layout principal
- [ ] Hook `useWhiteLabel()`

### **Aplicar Branding Dinámico**
- [ ] Logo dinámico en header
- [ ] Colores dinámicos (CSS variables)
- [ ] Footer personalizado
- [ ] Emails con branding de agencia
- [ ] Subdominios (opcional, requiere DNS)

**Estimado:** 3-4 días

---

## 1.5 Testing y Correcciones ⭐ ALTA PRIORIDAD

### **Testing**
- [ ] Setup Jest + React Testing Library
- [ ] Tests unitarios de servicios críticos
- [ ] Tests de integración de APIs
- [ ] Tests E2E con Playwright (críticos)

### **Correcciones**
- [ ] Revisar errores de consola
- [ ] Optimizar queries lentas
- [ ] Corregir issues de responsive
- [ ] Validación de formularios

**Estimado:** 4-5 días

---

### 📊 RESUMEN ETAPA 1

| Tarea | Días | Prioridad |
|-------|------|-----------|
| Pagos (Stripe) | 5-7 | ⭐⭐⭐ |
| Workflow Aprobación | 4-5 | ⭐⭐⭐ |
| Dashboard Admin | 6-8 | ⭐⭐⭐ |
| White-Label Frontend | 3-4 | ⭐⭐ |
| Testing & QA | 4-5 | ⭐⭐⭐ |
| **TOTAL** | **22-29 días** | |

**Al completar Etapa 1:** Sistema listo para MVP → **75% completado**

---

# 🏢 ETAPA 2: CRM Y FEATURES ADMINISTRATIVAS (2-3 semanas)

**Objetivo:** Herramientas para operación del negocio

**Progreso:** 75% → **Objetivo:** 85%

## 2.1 CRM Completo

### **Pipeline de Ventas**
- [ ] Modelo de datos (leads, opportunities, deals)
- [ ] API `/api/crm/leads`
- [ ] API `/api/crm/opportunities`
- [ ] Kanban board para pipeline
- [ ] Drag & drop de etapas
- [ ] Seguimiento de actividades

### **Gestión de Contactos**
- [ ] Lista de contactos
- [ ] Perfil de contacto detallado
- [ ] Historial de interacciones
- [ ] Notas y tareas
- [ ] Importación masiva (CSV/Excel)

### **Reportes CRM**
- [ ] Conversión de leads
- [ ] Forecast de ventas
- [ ] Performance por agente
- [ ] Embudo de ventas

**Estimado:** 8-10 días

---

## 2.2 Reportes Avanzados y BI

### **Dashboards Ejecutivos**
- [ ] Dashboard financiero completo
- [ ] Dashboard operativo
- [ ] Dashboard comercial
- [ ] Filtros por fecha, tenant, etc.

### **Reportes Exportables**
- [ ] Programar reportes automáticos
- [ ] Envío por email programado
- [ ] Formatos: PDF, Excel, CSV
- [ ] Power BI connector (opcional)

**Estimado:** 5-6 días

---

## 2.3 Sistema de Comisiones Configurable

### **Configuración**
- [ ] UI para configurar % comisión por agencia
- [ ] Comisión por tipo (vuelo, hotel, paquete)
- [ ] Comisión fija vs porcentual
- [ ] Markup personalizado

### **Cálculo Automático**
- [ ] Trigger al confirmar reserva
- [ ] Cálculo basado en configuración
- [ ] Registro en `agency_commissions`

### **Dashboard de Comisiones**
- [ ] Vista de agencia (sus comisiones)
- [ ] Vista de operadora (todas las comisiones)
- [ ] Exportación y pago

**Estimado:** 4-5 días

---

### 📊 RESUMEN ETAPA 2

| Tarea | Días |
|-------|------|
| CRM Completo | 8-10 |
| Reportes Avanzados | 5-6 |
| Comisiones Configurables | 4-5 |
| **TOTAL** | **17-21 días** |

**Al completar Etapa 2:** Sistema administrativo robusto → **85% completado**

---

# 🔐 ETAPA 3: SEGURIDAD Y DOCUMENTOS (1-2 semanas)

**Objetivo:** Seguridad enterprise y gestión de documentos

**Progreso:** 85% → **Objetivo:** 92%

## 3.1 Sistema de Encriptación

### **Encriptación AES-256**
- [ ] Crear `src/lib/encryption.ts`
- [ ] Funciones `encrypt()` y `decrypt()`
- [ ] Key management seguro
- [ ] Rotación de keys (opcional)

### **Aplicar Encriptación**
- [ ] Números de pasaporte
- [ ] Números de tarjetas
- [ ] Datos sensibles en BD

**Estimado:** 2-3 días

---

## 3.2 Upload y Gestión de Documentos

### **Upload de Archivos**
- [ ] Setup Vercel Blob o Cloudflare R2
- [ ] API `/api/documents/upload`
- [ ] Validación de archivos (tipo, tamaño)
- [ ] Encriptación antes de subir
- [ ] Generación de URLs firmadas

### **Gestión**
- [ ] API `/api/documents` - Listar
- [ ] API `/api/documents/[id]` - Descargar (firmado)
- [ ] API `/api/documents/[id]` - Eliminar
- [ ] UI de upload con drag & drop
- [ ] Previsualización de documentos

**Estimado:** 4-5 días

---

## 3.3 OCR de Documentos (Opcional)

### **Extracción Automática**
- [ ] Integrar Google Cloud Vision o AWS Textract
- [ ] Extraer datos de pasaportes
- [ ] Extraer datos de visas
- [ ] Pre-llenar formularios automáticamente

**Estimado:** 3-4 días (opcional)

---

## 3.4 Audit Logs y Seguridad

### **Logging**
- [ ] Tabla `audit_logs`
- [ ] Registrar acciones críticas
- [ ] Quién, qué, cuándo, desde dónde
- [ ] API `/api/audit/logs`
- [ ] UI para ver logs (admin)

### **Security Hardening**
- [ ] Rate limiting real (Upstash Redis)
- [ ] CSRF protection
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS protection
- [ ] Security headers (helmet)

**Estimado:** 3-4 días

---

### 📊 RESUMEN ETAPA 3

| Tarea | Días |
|-------|------|
| Encriptación | 2-3 |
| Upload Documentos | 4-5 |
| OCR (Opcional) | 3-4 |
| Audit & Security | 3-4 |
| **TOTAL** | **12-16 días** |

**Al completar Etapa 3:** Sistema enterprise-grade → **92% completado**

---

# ✨ ETAPA 4: FEATURES AVANZADAS Y PULIDO (2-3 semanas)

**Objetivo:** Features innovadoras y preparar para producción

**Progreso:** 92% → **Objetivo:** 100%

## 4.1 Chatbot con IA

### **OpenAI Integration**
- [ ] Setup OpenAI API
- [ ] Crear `/api/chat` endpoint
- [ ] Sistema de embeddings para contenido
- [ ] Context awareness (reservas del usuario)
- [ ] Respuestas en lenguaje natural

### **UI del Chatbot**
- [ ] Componente `ChatWidget`
- [ ] Chat interface moderna
- [ ] Historial de conversaciones
- [ ] Sugerencias automáticas

**Estimado:** 6-7 días

---

## 4.2 Sistema de Puntos AS Club

### **Backend**
- [ ] Tabla `loyalty_points`
- [ ] API `/api/loyalty/points`
- [ ] Acumulación automática (% de compra)
- [ ] Redención de puntos
- [ ] Niveles (Bronze, Silver, Gold, Platinum)

### **Frontend**
- [ ] Dashboard de puntos
- [ ] Historial de transacciones
- [ ] Catálogo de redención
- [ ] Badge de nivel de usuario

**Estimado:** 4-5 días

---

## 4.3 Notificaciones SMS y WhatsApp

### **Twilio Integration**
- [ ] Setup Twilio
- [ ] API `/api/notifications/sms`
- [ ] API `/api/notifications/whatsapp`
- [ ] Templates de mensajes
- [ ] Opt-in/opt-out

### **Uso**
- [ ] Confirmaciones de reserva
- [ ] Recordatorios 24h antes
- [ ] Cambios de vuelo urgentes
- [ ] Códigos de verificación

**Estimado:** 3-4 días

---

## 4.4 Alertas de Precio

### **Funcionalidad**
- [ ] Tabla `price_alerts`
- [ ] Crear alerta desde resultados
- [ ] Cron job que verifica precios
- [ ] Notificar cuando baja precio
- [ ] UI para gestionar alertas

**Estimado:** 3-4 días

---

## 4.5 Performance y Optimización

### **Backend**
- [ ] Indexar queries lentas
- [ ] Query optimization
- [ ] Redis caching (Upstash)
- [ ] CDN para assets estáticos

### **Frontend**
- [ ] Code splitting
- [ ] Lazy loading de imágenes
- [ ] Optimizar bundle size
- [ ] Lighthouse score > 90

### **Infraestructura**
- [ ] Setup monitoring (Sentry)
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Uptime monitoring

**Estimado:** 5-6 días

---

## 4.6 Documentación y Preparación Producción

### **Documentación**
- [ ] README completo
- [ ] Guía de instalación
- [ ] Documentación de APIs (Swagger/OpenAPI)
- [ ] Guía de usuario final
- [ ] Guía de administrador

### **Deployment**
- [ ] Configurar CI/CD
- [ ] Testing automatizado en CI
- [ ] Deploy automático a staging
- [ ] Deploy manual a producción
- [ ] Rollback strategy

### **Backup y Recovery**
- [ ] Backup automático de BD (daily)
- [ ] Disaster recovery plan
- [ ] Testing de restore

**Estimado:** 4-5 días

---

### 📊 RESUMEN ETAPA 4

| Tarea | Días |
|-------|------|
| Chatbot IA | 6-7 |
| Sistema Puntos | 4-5 |
| SMS/WhatsApp | 3-4 |
| Alertas Precio | 3-4 |
| Optimización | 5-6 |
| Docs & Deploy | 4-5 |
| **TOTAL** | **25-31 días** |

**Al completar Etapa 4:** Sistema production-ready → **100% completado** ✅

---

# 📊 RESUMEN GENERAL DEL PLAN

| Etapa | Objetivo | Días | % Final |
|-------|----------|------|---------|
| **Etapa 1** | MVP Ready | 22-29 | 75% |
| **Etapa 2** | Admin & CRM | 17-21 | 85% |
| **Etapa 3** | Seguridad | 12-16 | 92% |
| **Etapa 4** | Features Avanzadas | 25-31 | 100% |
| **TOTAL** | **Production** | **76-97 días** | **100%** |

---

## 🎯 CRONOGRAMA ESTIMADO

**Con 1 desarrollador full-time:**
- Etapa 1: 3-4 semanas
- Etapa 2: 2-3 semanas
- Etapa 3: 2 semanas
- Etapa 4: 3-4 semanas
**TOTAL: 10-13 semanas (2.5-3 meses)**

**Con 2 desarrolladores:**
- TOTAL: 6-8 semanas (1.5-2 meses)

**Con equipo de 3+ desarrolladores:**
- TOTAL: 4-6 semanas (1-1.5 meses)

---

## 💡 RECOMENDACIONES

### **Prioridades Absolutas (No negociables):**
1. ✅ Integración de pagos (Etapa 1)
2. ✅ Workflow de aprobación (Etapa 1)
3. ✅ Testing completo (Etapa 1)

### **Nice to Have (Pueden posponerse):**
- OCR de documentos
- App móvil
- Alertas de precio
- Chatbot IA

### **Estrategia Recomendada:**
1. **Enfoque:** Completar ETAPA 1 primero (MVP)
2. **Lanzamiento Suave:** Beta con clientes selectos después de Etapa 1
3. **Feedback:** Ajustar Etapas 2-4 basado en feedback real
4. **Iteración:** No intentar hacer todo de una vez

### **Puntos de Decisión:**
Después de cada etapa, evaluar:
- ¿Está funcionando como esperábamos?
- ¿Qué feedback tenemos?
- ¿Ajustamos el plan de siguientes etapas?

---

**Documento creado:** 14 de Diciembre de 2025
**Próxima revisión:** Al completar Etapa 1
