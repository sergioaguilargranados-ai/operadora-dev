# 🔒 SEGURIDAD Y TRACKING - Estado Actual y Recomendaciones

**Fecha:** 12 de Diciembre de 2025
**Versión:** v2.50
**Estado:** Análisis Completo

---

## 📊 ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ LO QUE ESTÁ CONSTRUIDO

#### 1. **Autenticación Básica**
- ✅ Sistema de Login/Registro (`/api/auth/login`, `/api/auth/register`)
- ✅ Almacenamiento de contraseñas con hash (bcrypt recomendado)
- ✅ Tokens JWT para sesiones (localStorage)
- ✅ Middleware de autenticación (`src/middleware.ts`)
- ✅ Rutas protegidas básicas

**Ubicación del código:**
```typescript
// src/app/api/auth/login/route.ts
// src/app/api/auth/register/route.ts
// src/contexts/AuthContext.tsx
```

#### 2. **Base de Datos de Usuarios**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 1. **Tracking de Accesos y Actividad**

#### ❌ NO Implementado:
- Registro de IPs de acceso
- Registro de MAC Address (no disponible en web por seguridad del navegador)
- Historial de sesiones
- Geolocalización de accesos
- Device fingerprinting
- Registro de intentos fallidos de login

#### ✅ Recomendación - Tabla de Auditoría:
```sql
CREATE TABLE access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(45) NOT NULL,         -- IPv4 o IPv6
    user_agent TEXT,                         -- Navegador/Dispositivo
    device_fingerprint VARCHAR(255),         -- Hash único del dispositivo
    country VARCHAR(2),                      -- Código de país (MX, US, etc.)
    city VARCHAR(100),
    action VARCHAR(50),                      -- login, logout, search, booking
    action_details JSONB,                    -- Detalles específicos de la acción
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255)                  -- ID de sesión única
);

CREATE INDEX idx_access_logs_user ON access_logs(user_id, created_at DESC);
CREATE INDEX idx_access_logs_ip ON access_logs(ip_address, created_at DESC);
CREATE INDEX idx_access_logs_action ON access_logs(action);
```

---

### 2. **Sistema de Cookies**

#### ❌ NO Implementado:
- Banner de aceptación de cookies
- Almacenamiento de preferencias de cookies
- Cookies de tracking (analíticas)
- Cookies de personalización
- Política de cookies visible

#### ✅ Recomendación - Tabla de Consentimientos:
```sql
CREATE TABLE cookie_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,        -- Para usuarios no registrados
    ip_address VARCHAR(45),
    necessary_cookies BOOLEAN DEFAULT true,   -- Siempre true (obligatorias)
    analytics_cookies BOOLEAN DEFAULT false,
    marketing_cookies BOOLEAN DEFAULT false,
    personalization_cookies BOOLEAN DEFAULT false,
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);

CREATE INDEX idx_cookie_consents_session ON cookie_consents(session_id);
CREATE INDEX idx_cookie_consents_user ON cookie_consents(user_id);
```

---

### 3. **Tracking de Búsquedas y Comportamiento**

#### ❌ NO Implementado (pero hay tabla base):
```sql
-- EXISTE pero muy básica:
CREATE TABLE searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    destination VARCHAR(255),
    check_in DATE,
    check_out DATE,
    adults INTEGER,
    children INTEGER,
    rooms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ✅ Recomendación - Mejorar con:
```sql
-- Agregar campos a la tabla searches existente:
ALTER TABLE searches
ADD COLUMN search_type VARCHAR(20),          -- 'flight', 'hotel', 'package'
ADD COLUMN origin VARCHAR(100),              -- Para vuelos
ADD COLUMN ip_address VARCHAR(45),
ADD COLUMN device_type VARCHAR(50),          -- 'mobile', 'tablet', 'desktop'
ADD COLUMN session_id VARCHAR(255),
ADD COLUMN results_count INTEGER,            -- Cuántos resultados se mostraron
ADD COLUMN user_clicked_result BOOLEAN,      -- Si hizo clic en algún resultado
ADD COLUMN time_spent_seconds INTEGER,       -- Tiempo en página de resultados
ADD COLUMN search_filters JSONB;             -- Filtros aplicados
```

---

## 🎯 RECOMENDACIONES ADICIONALES DE SEGURIDAD

### 1. **Autenticación Avanzada**
```sql
-- Tabla de sesiones activas
CREATE TABLE active_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_active_sessions_user ON active_sessions(user_id, is_active);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
```

**Funcionalidades:**
- Cierre de sesión en todos los dispositivos
- Límite de sesiones concurrentes por usuario
- Detección de sesiones sospechosas (IP diferente, ubicación diferente)
- Notificación de nuevo inicio de sesión

---

### 2. **Rate Limiting y Protección contra Ataques**
```sql
-- Tabla de rate limiting
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT false,
    block_until TIMESTAMP
);

CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint, window_start);
```

**Límites recomendados:**
- Login: 5 intentos por 15 minutos
- Búsquedas: 100 por hora
- API calls: 1000 por día (usuarios registrados), 100 por día (anónimos)

---

### 3. **Tracking de Eventos de Negocio**
```sql
CREATE TABLE business_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,         -- 'view_hotel', 'view_flight', 'add_to_cart', 'purchase', etc.
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    event_data JSONB NOT NULL,               -- Datos específicos del evento
    revenue_amount DECIMAL(10,2),            -- Si el evento generó ingreso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_events_type ON business_events(event_type, created_at DESC);
CREATE INDEX idx_business_events_user ON business_events(user_id, created_at DESC);
CREATE INDEX idx_business_events_session ON business_events(session_id);
```

**Ejemplos de eventos:**
```json
{
  "event_type": "view_hotel",
  "event_data": {
    "hotel_id": 123,
    "hotel_name": "Hotel Paradise",
    "price": 2500,
    "city": "Cancún",
    "source": "search_results"
  }
}

{
  "event_type": "search_abandoned",
  "event_data": {
    "search_type": "flight",
    "origin": "MEX",
    "destination": "CUN",
    "results_shown": 15,
    "time_spent": 45,
    "reason": "closed_tab"
  }
}
```

---

### 4. **GDPR y Protección de Datos**
```sql
-- Tabla de solicitudes de datos personales
CREATE TABLE data_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL,       -- 'export', 'delete', 'anonymize'
    status VARCHAR(20) DEFAULT 'pending',    -- 'pending', 'processing', 'completed'
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(id),
    notes TEXT
);
```

---

### 5. **Detectar Patrones Sospechosos**
```sql
-- Tabla de alertas de seguridad
CREATE TABLE security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,         -- 'multiple_failed_logins', 'suspicious_ip', 'unusual_activity'
    severity VARCHAR(20) DEFAULT 'medium',   -- 'low', 'medium', 'high', 'critical'
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(45),
    description TEXT,
    alert_data JSONB,
    status VARCHAR(20) DEFAULT 'open',       -- 'open', 'investigating', 'resolved', 'false_positive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_security_alerts_status ON security_alerts(status, severity, created_at DESC);
```

---

## 📱 DEVICE FINGERPRINTING

### Implementación Recomendada:
```typescript
// src/lib/deviceFingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export async function getDeviceFingerprint() {
  const fp = await FingerprintJS.load()
  const result = await fp.get()

  return {
    visitorId: result.visitorId,
    browserName: result.components.browserName?.value,
    os: result.components.os?.value,
    device: result.components.device?.value,
    screenResolution: result.components.screenResolution?.value,
    timezone: result.components.timezone?.value,
    language: result.components.language?.value,
    platform: result.components.platform?.value
  }
}
```

---

## 🍪 IMPLEMENTACIÓN DE BANNER DE COOKIES

### Componente Recomendado:
```typescript
// src/components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = async () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }

    await saveCookieConsent(allAccepted)
    setShowBanner(false)
  }

  const acceptNecessary = async () => {
    await saveCookieConsent({ ...preferences, necessary: true })
    setShowBanner(false)
  }

  const saveCookieConsent = async (prefs: any) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs))

    // Enviar al backend
    await fetch('/api/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    })
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur">
      <Card className="max-w-4xl mx-auto p-6">
        <h3 className="text-lg font-semibold mb-2">🍪 Este sitio usa cookies</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Usamos cookies para mejorar tu experiencia, personalizar contenido,
          y analizar nuestro tráfico. Puedes aceptar todas o personalizar tus preferencias.
        </p>
        <div className="flex gap-2">
          <Button onClick={acceptAll}>Aceptar todas</Button>
          <Button variant="outline" onClick={acceptNecessary}>Solo necesarias</Button>
          <Button variant="ghost" onClick={() => setShowBanner(false)}>
            Configurar
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

## 🎯 ANÁLISIS DE COMPORTAMIENTO Y TENDENCIAS

### Queries Útiles para Analytics:

```sql
-- Top 10 destinos más buscados
SELECT
  destination,
  COUNT(*) as search_count,
  AVG(adults + children) as avg_travelers
FROM searches
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY destination
ORDER BY search_count DESC
LIMIT 10;

-- Tasa de conversión por dispositivo
SELECT
  device_type,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) as conversions,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) /
    COUNT(DISTINCT session_id),
    2
  ) as conversion_rate
FROM business_events
GROUP BY device_type;

-- Búsquedas abandonadas (sin clic en resultado)
SELECT
  search_type,
  COUNT(*) as total_searches,
  COUNT(CASE WHEN user_clicked_result = false THEN 1 END) as abandoned,
  ROUND(
    100.0 * COUNT(CASE WHEN user_clicked_result = false THEN 1 END) / COUNT(*),
    2
  ) as abandonment_rate
FROM searches
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY search_type;
```

---

## ✅ PLAN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1 (Inmediata):
1. ✅ Implementar banner de cookies
2. ✅ Crear tabla `cookie_consents`
3. ✅ Agregar tracking básico de IP en login
4. ✅ Implementar rate limiting en endpoints críticos

### Fase 2 (Corto Plazo):
5. ✅ Tabla `access_logs` completa
6. ✅ Device fingerprinting
7. ✅ Mejorar tabla `searches` con más datos
8. ✅ Implementar `active_sessions`

### Fase 3 (Mediano Plazo):
9. ✅ Sistema de alertas de seguridad
10. ✅ Analytics de negocio con `business_events`
11. ✅ Dashboard de métricas
12. ✅ Exportación de datos (GDPR)

---

## 🔐 MEJORES PRÁCTICAS ADICIONALES

1. **Encriptación:**
   - HTTPS obligatorio en producción
   - Encriptar datos sensibles en BD (tarjetas, pasaportes)
   - Tokens JWT con expiración corta (15 min) + refresh tokens

2. **Headers de Seguridad:**
   ```typescript
   // next.config.js
   headers: [
     {
       key: 'X-Frame-Options',
       value: 'DENY'
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff'
     },
     {
       key: 'Strict-Transport-Security',
       value: 'max-age=31536000; includeSubDomains'
     }
   ]
   ```

3. **Validación y Sanitización:**
   - Validar TODOS los inputs del usuario
   - Sanitizar datos antes de guardar en BD
   - Usar prepared statements (evitar SQL injection)

4. **Monitoreo:**
   - Logs centralizados (Winston, Pino)
   - Alertas automáticas de actividad sospechosa
   - Dashboard de seguridad en tiempo real

---

## ❓ PREGUNTAS PARA EL CLIENTE

1. **Cookies:** ¿Qué nivel de tracking quieres? (Solo necesarias, analytics, marketing completo)
2. **Retención de datos:** ¿Cuánto tiempo guardar logs de acceso? (GDPR recomienda máximo 2 años)
3. **Notificaciones:** ¿Enviar email cuando se detecte login desde nuevo dispositivo?
4. **Geolocalización:** ¿Bloquear accesos desde ciertos países?
5. **Analytics:** ¿Integrar Google Analytics, Facebook Pixel, etc.?

---

**Documento creado por:** AS Operadora Dev Team
**Última actualización:** 12 Dic 2025
**Estado:** Pendiente de revisión y aprobación
