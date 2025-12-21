# ✅ RESPUESTAS DEL CLIENTE - Configuración Aprobada

**Fecha:** 13 de Diciembre de 2025
**Estado:** APROBADO - Listo para implementar

---

## 🔒 SEGURIDAD Y TRACKING

### 1. **Nivel de Tracking**
**Respuesta:** Marketing completo

**Implementar:**
- ✅ Cookies necesarias (siempre activas)
- ✅ Cookies de analytics (Google Analytics)
- ✅ Cookies de marketing
- ✅ Cookies de personalización
- ✅ Tracking completo de comportamiento
- ✅ Device fingerprinting
- ✅ Business events

### 2. **Retención de Logs**
**Respuesta:** Sí, 2 años (recomendación GDPR)

**Implementar:**
- ✅ `access_logs`: 2 años
- ✅ `business_events`: 2 años
- ✅ `searches`: 1 año (suficiente para analytics)
- ✅ Job automático de limpieza de logs antiguos
- ✅ Exportación antes de eliminar (archivos comprimidos)

### 3. **Notificar Logins Nuevos Dispositivos**
**Respuesta:** Sí

**Implementar:**
- ✅ Detección de nuevo dispositivo por fingerprint
- ✅ Email de notificación con:
  - Dispositivo
  - Ubicación aproximada
  - Fecha y hora
  - IP
  - Botón "¿No fuiste tú?" → Bloquear sesión
- ✅ Opción en perfil: "No notificarme más de este dispositivo"

### 4. **Bloquear Países Específicos**
**Respuesta:** Sí

**Implementar:**
- ✅ Tabla `blocked_countries` configurable
- ✅ Panel admin para gestionar países bloqueados
- ✅ Bloqueo puede ser total o solo para ciertos módulos
- ✅ Whitelist de IPs (para excepciones)
- ✅ Log de intentos bloqueados

### 5. **Integraciones de Analytics**
**Respuesta:** Google Analytics (NO Facebook Pixel)

**Implementar:**
- ✅ Google Analytics 4
- ✅ Google Tag Manager
- ✅ Eventos personalizados:
  - Búsquedas
  - Ver detalles
  - Agregar a favoritos
  - Iniciar reserva
  - Completar compra
  - Abandono de carrito
- ❌ Facebook Pixel (NO implementar)

---

## 👥 USUARIOS Y ROLES

### 6. **Aprobación de Usuarios Internos**
**Respuesta:** Administrativo Y Director

**Implementar:**
- ✅ Notificación a ambos roles cuando hay solicitud
- ✅ Cualquiera de los dos puede aprobar
- ✅ Si uno aprueba, se notifica al otro
- ✅ Panel de aprobaciones pendientes
- ✅ Badge con contador en menú

### 7. **Límites de Usuarios**
**Respuesta:** No

**Implementar:**
- ✅ Sin límites de usuarios por empresa
- ✅ Sin límites de operadores por agencia
- ✅ Sin cargos extras por usuario adicional
- ✅ (Futuro: Planes premium con límites diferentes si es necesario)

### 8. **Marca Blanca - Dominios y Subdominios**
**Respuesta:** Ambos (dominios propios Y subdominios)

**Implementar:**
- ✅ Sistema multi-tenant completo
- ✅ Subdominios automáticos:
  - `agencia1.asoperadora.com`
  - `agencia2.asoperadora.com`
- ✅ Dominios personalizados:
  - `www.agenciaejemplo.com` → apunta a sistema
  - Verificación DNS
  - SSL automático (Let's Encrypt)
- ✅ Personalización por tenant:
  - Logo
  - Colores primarios/secundarios
  - Favicon
  - Meta tags
  - Email de contacto
- ✅ Tabla `tenants` con configuración completa

### 9. **Sub-roles**
**Respuesta:** No

**Implementar:**
- ✅ Mantener roles principales sin sub-niveles
- ✅ Jerarquía simple y clara
- ✅ (Futuro: Considerar si es necesario más adelante)

### 10. **2FA para Usuarios Internos**
**Respuesta:** Sí

**Implementar:**
- ✅ 2FA obligatorio para:
  - Director
  - Administrativo
  - IT
- ✅ 2FA opcional para:
  - Ventas
  - Operativo
- ✅ Métodos de 2FA:
  - TOTP (Google Authenticator, Authy)
  - SMS (Twilio)
  - Email (backup)
- ✅ Códigos de recuperación (10 códigos de un solo uso)
- ✅ Recordar dispositivo por 30 días

### 11. **SSO para Empresas Grandes**
**Respuesta:** Sí

**Implementar:**
- ✅ SSO con proveedores principales:
  - Google Workspace
  - Microsoft Azure AD
  - Okta
- ✅ SAML 2.0
- ✅ OAuth 2.0
- ✅ Configuración por empresa en panel admin
- ✅ Mapeo de roles automático
- ✅ Sincronización de usuarios

### 12. **Login Social para Clientes**
**Respuesta:** Sí

**Implementar:**
- ✅ Login con Google
- ✅ Login con Facebook
- ✅ Login con Apple (iOS)
- ✅ Vinculación de cuentas existentes
- ✅ Auto-completar datos desde perfil social

### 13. **Campos Extra en Perfil**
**Respuesta:** Dirección, redes sociales, foto

**Implementar:**
```sql
ALTER TABLE users
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN address_line1 VARCHAR(255),
ADD COLUMN address_line2 VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN country VARCHAR(2) DEFAULT 'MX',
ADD COLUMN social_facebook VARCHAR(255),
ADD COLUMN social_instagram VARCHAR(255),
ADD COLUMN social_twitter VARCHAR(255),
ADD COLUMN social_linkedin VARCHAR(255),
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(20),
ADD COLUMN nationality VARCHAR(2),
ADD COLUMN passport_number VARCHAR(50),
ADD COLUMN passport_expiry DATE,
ADD COLUMN emergency_contact_name VARCHAR(255),
ADD COLUMN emergency_contact_phone VARCHAR(50);
```

### 14. **Verificar RFC con SAT**
**Respuesta:** Sí

**Implementar:**
- ✅ Integración con API del SAT
- ✅ Validación automática de RFC al capturar
- ✅ Autocompletado de:
  - Razón social
  - Domicilio fiscal
  - Régimen fiscal
- ✅ Indicador visual de RFC verificado
- ✅ Cache de RFCs verificados (evitar llamadas repetidas)
- ✅ Fallback si API SAT no disponible

### 15. **Documentos Requeridos Empresas/Agencias**
**Respuesta:** Opción de subir documento + descripción

**Implementar:**
```sql
CREATE TABLE entity_documents (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL,         -- 'company', 'agency'
    entity_id INTEGER NOT NULL,
    document_type VARCHAR(50),                -- 'rfc', 'acta', 'licencia', 'ine', 'otro'
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP
);
```

**Tipos de documentos:**
- RFC (Constancia de Situación Fiscal)
- Acta Constitutiva
- Comprobante de Domicilio
- Identificación oficial (INE/Pasaporte)
- Licencia de Agencia de Viajes
- Poder Notarial
- Otro (con descripción)

**Features:**
- ✅ Upload de múltiples archivos
- ✅ Formatos permitidos: PDF, JPG, PNG, DOCX
- ✅ Tamaño máximo: 10MB por archivo
- ✅ Preview de documentos
- ✅ Descarga de documentos
- ✅ Marca de verificación por admin
- ✅ Vencimiento de documentos (opcional)
- ✅ Notificación de documentos por vencer

---

## 📋 RESUMEN DE CONFIGURACIÓN

### Tracking y Analytics:
- ✅ Marketing completo activado
- ✅ Google Analytics 4
- ✅ Cookies: todas las categorías
- ✅ Retención: 2 años
- ✅ Device fingerprinting
- ✅ Notificaciones de logins nuevos
- ✅ Bloqueo de países configurable

### Usuarios y Autenticación:
- ✅ 4 tipos de usuario
- ✅ 9 roles principales
- ✅ Aprobación: Director O Administrativo
- ✅ Sin límites de usuarios
- ✅ 2FA obligatorio para roles críticos
- ✅ SSO para empresas
- ✅ Login social para clientes

### Marca Blanca:
- ✅ Multi-tenant completo
- ✅ Subdominios automáticos
- ✅ Dominios personalizados
- ✅ Personalización de diseño

### Datos y Documentos:
- ✅ Perfil extendido (dirección, redes, foto)
- ✅ Validación RFC con SAT
- ✅ Upload de documentos con verificación

---

## 🚀 SIGUIENTE FASE: IMPLEMENTACIÓN

Todas las respuestas han sido documentadas y están listas para implementación.

**Prioridad de desarrollo:**
1. Base de datos (migraciones)
2. Autenticación y roles
3. Sistema de permisos
4. Tracking y cookies
5. Multi-tenant / Marca blanca

---

**Aprobado por:** Cliente
**Fecha de aprobación:** 13 de Diciembre de 2025
**Estado:** ✅ LISTO PARA IMPLEMENTAR
