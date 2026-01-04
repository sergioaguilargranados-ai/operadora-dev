# 📨 CENTRO DE COMUNICACIÓN - Especificación Técnica

**Fecha:** 20 Diciembre 2025
**Versión:** 1.0
**Estado:** Propuesta

---

## 🎯 Objetivos

1. **Centralizar comunicaciones** entre clientes, operadora y proveedores
2. **Evidencia legal** de todas las comunicaciones
3. **Trazabilidad completa** (quién, cuándo, cómo, leído/no leído)
4. **Múltiples canales** (Email, SMS, WhatsApp, In-app)
5. **Chat bidireccional** simple y efectivo

---

## 📊 Estructura de Base de Datos

### Tabla: `communication_threads`
Hilos de conversación relacionados con reservas/servicios

```sql
CREATE TABLE communication_threads (
  id SERIAL PRIMARY KEY,
  thread_type VARCHAR(50) NOT NULL, -- 'booking', 'general', 'complaint', 'inquiry'
  subject VARCHAR(255) NOT NULL,
  reference_type VARCHAR(50), -- 'booking', 'payment', 'itinerary', etc.
  reference_id INTEGER, -- ID de la reserva, pago, etc.

  -- Participantes
  client_id INTEGER REFERENCES users(id),
  assigned_agent_id INTEGER REFERENCES users(id), -- Agente asignado

  -- Estados
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed', 'pending', 'escalated'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Control
  last_message_at TIMESTAMP,
  last_message_by INTEGER REFERENCES users(id),
  unread_count_client INTEGER DEFAULT 0,
  unread_count_agent INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[], -- ['confirmacion', 'urgente', 'queja', etc.]
  is_archived BOOLEAN DEFAULT false,
  tenant_id INTEGER REFERENCES tenants(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `messages`
Mensajes individuales dentro de hilos

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES communication_threads(id) ON DELETE CASCADE,

  -- Remitente
  sender_id INTEGER REFERENCES users(id),
  sender_type VARCHAR(50) NOT NULL, -- 'client', 'agent', 'provider', 'system'
  sender_name VARCHAR(255),

  -- Contenido
  subject VARCHAR(255),
  body TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'notification', 'alert'

  -- Adjuntos
  attachments JSONB, -- [{name, url, type, size}]

  -- Metadata
  metadata JSONB, -- Info adicional (booking_id, payment_id, etc.)

  -- Control
  is_internal BOOLEAN DEFAULT false, -- Notas internas del staff
  requires_response BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `message_deliveries`
Registro de entregas por canal

```sql
CREATE TABLE message_deliveries (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,

  -- Canal
  channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'in_app'
  recipient VARCHAR(255) NOT NULL, -- email, phone, user_id

  -- Estados
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'

  -- Trazabilidad
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,

  -- Detalles técnicos
  provider VARCHAR(100), -- 'sendgrid', 'twilio', 'whatsapp_business', etc.
  provider_message_id VARCHAR(255), -- ID del proveedor
  error_message TEXT,

  -- Métricas
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `message_reads`
Registro de lecturas (evidencia)

```sql
CREATE TABLE message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),

  -- Detalles de lectura
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_via VARCHAR(50), -- 'web', 'mobile', 'email_client', etc.

  -- Información técnica
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `communication_preferences`
Preferencias de notificación (ya existe parcialmente)

```sql
CREATE TABLE communication_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,

  -- Canales habilitados
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,

  -- Contactos
  email_address VARCHAR(255),
  phone_number VARCHAR(20),
  whatsapp_number VARCHAR(20),

  -- Tipos de mensajes
  booking_confirmations BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  itinerary_changes BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT false,

  -- Horario
  quiet_hours_start TIME, -- Ej: 22:00
  quiet_hours_end TIME,   -- Ej: 08:00
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Flujos de Trabajo

### 1. Envío de Mensaje por Operadora

```
1. Agente crea mensaje en sistema
2. Selecciona destinatario(s) y tipo
3. Sistema determina canales según preferencias
4. Se crea registro en `messages`
5. Se crean registros en `message_deliveries` por cada canal
6. Servicios de envío procesan (email, SMS, WhatsApp)
7. Se actualiza estado de cada delivery
8. Cliente recibe notificación
9. Al abrir en app, se registra en `message_reads`
```

### 2. Cliente Responde

```
1. Cliente escribe respuesta en app
2. Se crea nuevo mensaje en el mismo thread
3. Se notifica al agente asignado
4. Incrementa unread_count_agent
5. Agente ve notificación y responde
6. Ciclo continúa
```

### 3. Mensaje Automático del Sistema

```
1. Trigger: Reserva confirmada, pago recibido, etc.
2. Sistema genera mensaje automático
3. Se asocia a thread existente o crea uno nuevo
4. Se envía por canales habilitados
5. Queda registro completo
```

---

## 🎨 Propuesta de Interfaz

### Vista Principal - Lista de Hilos

```
┌─────────────────────────────────────────────────────┐
│ 📨 Centro de Comunicación                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Nuevo Mensaje] [Filtros ▼] [Buscar...        🔍] │
│                                                     │
│ ┌─ Activos (3) ──────────────────────────────────┐ │
│ │                                                 │ │
│ │ 🔴 Cambio en vuelo - Reserva #1234          2h │ │
│ │    Último mensaje: Confirmamos nuevo horario... │ │
│ │    [Urgente] [Vuelo] [Sin leer]                │ │
│ │                                                 │ │
│ │ ⚪ Confirmación de pago - Reserva #1230      1d │ │
│ │    Último mensaje: Pago recibido exitosamente  │ │
│ │    [Pago] [Leído]                              │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Cerrados (12) ─────────────────────────────────┐│
│ │ ...                                             ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Vista de Conversación

```
┌─────────────────────────────────────────────────────┐
│ ← Cambio en vuelo - Reserva #1234    [Cerrar] [⋮] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Sistema                                  12:30 PM   │
│ ┌─────────────────────────────────────────────────┐│
│ │ Su vuelo AM 601 del 25 Dic ha cambiado          ││
│ │ Nueva salida: 10:00 AM                          ││
│ │                                                 ││
│ │ ✉️ Enviado por email                            ││
│ │ 📱 Enviado por WhatsApp                         ││
│ │ ✓ Leído a las 12:35 PM                         ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│                                    Tú       12:40 PM│
│ ┌─────────────────────────────────────────────────┐│
│ │ ¿Puedo cambiar el asiento también?             ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Agente María López                       12:42 PM  │
│ ┌─────────────────────────────────────────────────┐│
│ │ ¡Por supuesto! ¿Qué asiento prefiere?          ││
│ │                                                 ││
│ │ ✉️ Enviado por email                            ││
│ │ ⏳ Pendiente de lectura                         ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Escribir mensaje...]                      [Enviar]│
└─────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades Adicionales Sugeridas

### 1. **Templates de Mensajes**
```sql
CREATE TABLE message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(50), -- 'booking', 'payment', 'complaint', etc.
  subject VARCHAR(255),
  body TEXT,
  variables JSONB, -- {booking_id, client_name, amount, etc.}
  tenant_id INTEGER REFERENCES tenants(id)
);
```

### 2. **Mensajes Programados**
```sql
CREATE TABLE scheduled_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id),
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP
);
```

### 3. **Etiquetas y Categorías**
- Auto-categorización de mensajes
- Filtros rápidos
- Búsqueda avanzada

### 4. **Respuestas Rápidas**
- Templates de respuestas comunes
- "Gracias por su mensaje"
- "Estamos revisando su solicitud"
- "Confirmamos recepción"

### 5. **Adjuntos**
- Imágenes (vouchers, tickets)
- PDFs (itinerarios, facturas)
- Límite de tamaño
- Escaneo de virus

### 6. **Notificaciones Push**
- Notificaciones de navegador
- Notificaciones móviles (futuro)

### 7. **SLA y Tiempos de Respuesta**
```sql
ALTER TABLE communication_threads ADD COLUMN sla_deadline TIMESTAMP;
ALTER TABLE communication_threads ADD COLUMN response_time_minutes INTEGER;
```

### 8. **Encuestas de Satisfacción**
- Después de cerrar un hilo
- "¿Se resolvió su consulta?"
- Rating 1-5 estrellas

### 9. **Estadísticas y Reportes**
- Tiempo promedio de respuesta
- Mensajes por agente
- Satisfacción del cliente
- Tasa de resolución

### 10. **Integraciones**
- WhatsApp Business API
- Twilio para SMS
- SendGrid/Mailgun para emails
- Slack para notificaciones internas

---

## 🔒 Seguridad y Privacidad

1. **Encriptación:**
   - Mensajes sensibles encriptados en BD
   - TLS para transmisión

2. **Permisos:**
   - Clientes solo ven sus propios mensajes
   - Agentes ven solo hilos asignados
   - Admins ven todo

3. **Retención de Datos:**
   - Mensajes se guardan por 7 años (legal)
   - Opción de anonimizar después

4. **Auditoría:**
   - Log de quién leyó qué y cuándo
   - Cambios en estado de hilos
   - Exportación para casos legales

---

## 📱 APIs Necesarias

### POST /api/communication/threads
Crear nuevo hilo de conversación

### GET /api/communication/threads
Listar hilos del usuario

### POST /api/communication/messages
Enviar mensaje

### GET /api/communication/threads/:id/messages
Obtener mensajes de un hilo

### PUT /api/communication/messages/:id/read
Marcar como leído

### POST /api/communication/send
Enviar por canal específico

---

## 🎯 Plan de Implementación

### Fase 1: MVP (v1.0)
- [ ] Crear tablas de BD
- [ ] API básica (CRUD)
- [ ] Interfaz de lista de hilos
- [ ] Interfaz de conversación
- [ ] Envío por email
- [ ] Marca de leído

### Fase 2: Canales (v1.1)
- [ ] Integración SMS (Twilio)
- [ ] Integración WhatsApp
- [ ] Preferencias de usuario
- [ ] Templates de mensajes

### Fase 3: Avanzado (v1.2)
- [ ] Adjuntos
- [ ] Mensajes programados
- [ ] Estadísticas
- [ ] Respuestas rápidas

### Fase 4: Profesional (v2.0)
- [ ] SLA y tiempos
- [ ] Encuestas
- [ ] Reportes avanzados
- [ ] Integraciones externas

---

## 💡 Ventajas del Sistema

1. ✅ **Evidencia Legal:** Registro completo de comunicaciones
2. ✅ **Múltiples Canales:** Llega al cliente donde prefiera
3. ✅ **Trazabilidad:** Sabes exactamente quién, cuándo y cómo
4. ✅ **Centralizado:** Todo en un solo lugar
5. ✅ **Auditable:** Exportable para casos legales
6. ✅ **Escalable:** Puede crecer con el negocio
7. ✅ **User-Friendly:** Interfaz simple tipo chat

---

## ❓ Preguntas para Definir

1. **¿Cuánto tiempo se deben guardar los mensajes?**
   - Sugerencia: 7 años (requisito legal común)

2. **¿Los proveedores tendrán acceso directo al sistema?**
   - O envían via email y se canaliza?

3. **¿Se necesita moderación de mensajes?**
   - ¿Revisar antes de enviar?

4. **¿Hay límite de mensajes por día?**
   - Para evitar spam

5. **¿Se permite eliminar mensajes?**
   - Sugerencia: Solo ocultar, nunca eliminar (evidencia)

6. **¿Notificaciones en tiempo real?**
   - WebSockets o polling?

---

## 🚀 Siguiente Paso

¿Comenzamos con la Fase 1 (MVP)? Crearé:

1. Migraciones de BD
2. APIs básicas
3. Interfaz de usuario
4. Integración con email

**¿Procedo?**
