# 📄 GUÍA: PDFs, Emails y Compartir Itinerarios

**Versión:** v2.127
**Fecha:** 18 Diciembre 2025
**Estado:** ✅ Funcional

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1. ✅ Exportación de Cotizaciones a PDF

**Ubicación:** `/dashboard/quotes`

**Características:**
- PDF profesional con logo y colores corporativos
- Incluye todos los datos de la cotización
- Tabla de items con cantidades y precios
- Cálculo automático de totales
- Términos y condiciones
- Descarga automática al hacer click

**Cómo usar:**
1. Ir a `/dashboard/quotes`
2. En la lista de cotizaciones, hacer click en botón "PDF"
3. El archivo se descarga automáticamente como `Cotizacion_Q-2025-0001.pdf`

**API:**
```
GET /api/quotes/[id]/pdf
```

---

### 2. ✅ Exportación de Itinerarios a PDF

**Ubicación:** `/dashboard/itineraries`

**Características:**
- Diseño atractivo con colores corporativos
- Itinerario día por día con actividades
- Horarios y ubicaciones detalladas
- Notas importantes y recomendaciones
- Paginación automática
- Footers en todas las páginas

**Cómo usar:**
1. Ir a `/dashboard/itineraries`
2. Click en botón "PDF" del itinerario deseado
3. Descarga automática como `Itinerario_NombreDelViaje.pdf`

**API:**
```
GET /api/itineraries/[id]/pdf
```

---

### 3. ✅ Envío de Cotizaciones por Email

**Ubicación:** `/dashboard/quotes`

**Características:**
- Email HTML profesional y responsive
- PDF adjunto automáticamente
- Mensaje personalizado de bienvenida
- Incluye detalles del viaje y total
- Actualiza estado de cotización a "sent"
- Footer con datos de contacto

**Cómo usar:**
1. Ir a `/dashboard/quotes`
2. Click en botón "Enviar" (azul)
3. Confirmar envío
4. El cliente recibe email con PDF adjunto

**API:**
```
POST /api/quotes/[id]/send
Body: { "customMessage": "Mensaje opcional" }
```

**Configuración SMTP (Variables de entorno):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@asoperadora.com
SMTP_PASS=tu_password_aqui
```

**Email enviado incluye:**
- ✅ Saludo personalizado
- ✅ Resumen de viaje (destino, fechas, total)
- ✅ PDF adjunto
- ✅ Botón para ver en línea
- ✅ Datos de contacto
- ✅ Validez de la cotización

---

### 4. ✅ Compartir Itinerarios Públicamente

**Ubicación:** `/dashboard/itineraries`

**Características:**
- Genera token único y seguro (32 caracteres hex)
- Link público sin necesidad de login
- Página optimizada para compartir
- Botón para descargar PDF desde vista pública
- Copia automática al portapapeles
- Se puede revocar el acceso eliminando el token

**Cómo usar:**

**Generar link de compartir:**
1. Ir a `/dashboard/itineraries`
2. Click en botón "Compartir" (verde)
3. Link copiado automáticamente al portapapeles
4. Compartir con clientes vía WhatsApp, Email, etc.

**Ver itinerario compartido:**
1. Abrir link: `/itinerary/shared/[token]`
2. Vista pública hermosa sin necesidad de login
3. Botón para descargar PDF
4. CTA para contactar y reservar

**APIs:**
```
POST /api/itineraries/[id]/share      # Generar token
DELETE /api/itineraries/[id]/share    # Eliminar token
GET /api/itineraries/shared/[token]   # Ver itinerario público
```

**Ejemplo de link:**
```
https://app.asoperadora.com/itinerary/shared/a1b2c3d4e5f6...
```

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

### PDFs
- **jsPDF** - Generación de PDFs
- **jspdf-autotable** - Tablas en PDFs
- Fuentes: Helvetica
- Colores corporativos: #0066FF (azul primario)

### Email
- **NodeMailer** - Envío de emails
- HTML responsive
- SMTP configurable
- Adjuntos automáticos

### Seguridad
- Tokens criptográficos (crypto.randomBytes)
- Compartir controlado por BD (is_shared flag)
- Sin exposición de datos sensibles en vistas públicas

---

## 📋 APIS DISPONIBLES

### Cotizaciones

#### 1. Generar PDF
```typescript
GET /api/quotes/[id]/pdf

Response:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="..."
```

#### 2. Enviar por Email
```typescript
POST /api/quotes/[id]/send

Body: {
  customMessage?: string  // Opcional
}

Response: {
  success: boolean
  message: string
  sentTo: string
}
```

### Itinerarios

#### 1. Generar PDF
```typescript
GET /api/itineraries/[id]/pdf

Response:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="..."
```

#### 2. Generar Link de Compartir
```typescript
POST /api/itineraries/[id]/share

Response: {
  success: boolean
  shared_token: string
  share_url: string
}
```

#### 3. Eliminar Link de Compartir
```typescript
DELETE /api/itineraries/[id]/share

Response: {
  success: boolean
  message: string
}
```

#### 4. Ver Itinerario Público
```typescript
GET /api/itineraries/shared/[token]

Response: {
  success: boolean
  data: Itinerary
}
```

---

## 🎨 PERSONALIZACIÓN

### Modificar Colores de PDF

**Archivo:** `src/lib/pdfGenerator.ts`

```typescript
// Línea 51: Color primario
const primaryColor: [number, number, number] = [0, 102, 255] // RGB

// Línea 52: Color secundario
const grayColor: [number, number, number] = [128, 128, 128]
```

### Modificar Plantilla de Email

**Archivo:** `src/app/api/quotes/[id]/send/route.ts`

Buscar la variable `emailHTML` (línea ~40) y modificar el HTML.

### Modificar Vista Pública de Itinerarios

**Archivo:** `src/app/itinerary/shared/[token]/page.tsx`

Personalizar componentes, colores y layout.

---

## 🧪 TESTING

### Probar PDF de Cotización
```bash
curl http://localhost:3000/api/quotes/1/pdf --output test.pdf
open test.pdf
```

### Probar Envío de Email
```bash
curl -X POST http://localhost:3000/api/quotes/1/send \
  -H "Content-Type: application/json" \
  -d '{"customMessage": "Prueba"}'
```

### Probar Compartir Itinerario
```bash
# Generar token
curl -X POST http://localhost:3000/api/itineraries/1/share

# Ver itinerario público (usar token del response)
curl http://localhost:3000/api/itineraries/shared/TOKEN_AQUI
```

---

## ⚙️ CONFIGURACIÓN SMTP

Para envío real de emails, configurar en `.env.local`:

```env
# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu_sendgrid_api_key

# Resend (recomendado para producción)
# Usar Resend SDK en lugar de SMTP

# Mailtrap (para testing)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_mailtrap_user
SMTP_PASS=tu_mailtrap_pass
```

**IMPORTANTE:**
- Para Gmail, usa "App Password" no tu contraseña normal
- Para producción, usar servicio profesional (SendGrid, Resend, AWS SES)

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

### Corto Plazo
- [ ] Agregar firma digital a PDFs
- [ ] Plantillas de email personalizables desde admin
- [ ] Estadísticas de emails enviados/abiertos
- [ ] Recordatorios automáticos si no hay respuesta

### Mediano Plazo
- [ ] Múltiples plantillas de PDF
- [ ] Watermarks en PDFs compartidos
- [ ] Compartir cotizaciones (además de itinerarios)
- [ ] QR code en itinerarios compartidos

### Largo Plazo
- [ ] Integración con DocuSign para firmas
- [ ] PDF interactivo con formularios
- [ ] Calendario para agendar llamadas desde email
- [ ] Analytics de compartidos (vistas, tiempo en página)

---

## 📞 SOPORTE

**Dudas técnicas:**
- Ver código fuente en archivos mencionados
- Revisar este documento
- Consultar documentación de jsPDF y NodeMailer

**Errores comunes:**

**1. PDF no se genera:**
- Verificar que la cotización/itinerario exista en BD
- Revisar que tenga datos completos
- Ver logs del servidor

**2. Email no se envía:**
- Verificar configuración SMTP en .env.local
- Probar credenciales SMTP manualmente
- Revisar logs del servidor para error específico

**3. Link compartido no funciona:**
- Verificar que el itinerario tenga `is_shared = true`
- Confirmar que el token es correcto
- Revisar que no se haya eliminado el token

---

## ✅ CHECKLIST DE VALIDACIÓN

- [x] PDFs se generan correctamente
- [x] PDFs incluyen toda la información necesaria
- [x] Emails se envían con PDF adjunto
- [x] Template de email se ve bien en móvil y desktop
- [x] Links de compartir funcionan sin login
- [x] Vista pública es atractiva y profesional
- [x] Botón de compartir copia link al portapapeles
- [x] Se puede descargar PDF desde vista pública
- [x] APIs responden correctamente
- [x] Errores se manejan apropiadamente

---

**Estado Final:** ✅ LISTO PARA PRODUCCIÓN

Todas las funcionalidades están operativas y listas para usarse.

**v2.127 | Build: 18 Dec 2025, 10:30 CST**
