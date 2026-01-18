# 📱 PREPARACIÓN DEL BACKEND PARA APP MÓVIL

**Fecha creación:** 10 de Enero de 2026 - 14:30 CST  
**Última actualización:** 15 de Enero de 2026 - 01:51 CST  
**Versión:** v2.225  
**Estado:** ✅ IMPLEMENTADO - Pendiente Verificación  
**Decisión tecnológica:** React Native + Expo (recomendado)

---

## 🎯 OBJETIVO

Preparar el backend actual (Next.js API Routes) para que soporte tanto la aplicación web como la futura aplicación móvil (React Native), manteniendo:
- Una sola base de código backend
- Una sola base de datos
- APIs compatibles con ambas plataformas

---

## 📊 ESTADO ACTUAL DEL BACKEND

### **Lo que YA funciona para móvil:**
| Componente | Estado | Notas |
|------------|--------|-------|
| APIs REST (~35 endpoints) | ✅ Listo | JSON responses |
| PostgreSQL (Neon) | ✅ Listo | Accesible desde cualquier lado |
| JWT Authentication | ✅ Listo | Funciona para móvil |
| Servicios desacoplados | ✅ Listo | Reutilizables |
| Stripe/PayPal/MercadoPago | ✅ Listo | Tienen SDKs móviles |

### **Lo que NECESITA modificación:**
| Componente | Estado | Prioridad | Esfuerzo |
|------------|--------|-----------|----------|
| CORS headers | ⚠️ Solo web | **ALTA** | Bajo |
| Refresh tokens | ❌ No existe | **ALTA** | Medio |
| API versioning | ❌ No existe | **MEDIA** | Bajo |
| Push notification tokens | ❌ No existe | **ALTA** | Medio |
| Respuestas estandarizadas | ⚠️ Inconsistentes | **MEDIA** | Medio |
| Rate limiting por device | ⚠️ Básico | **BAJA** | Medio |
| Endpoints optimizados | ❌ No existen | **BAJA** | Alto |

---

## 🔧 PUNTOS ESPECÍFICOS A MODIFICAR EN EL CÓDIGO

### **1. CORS - Configuración (ALTA PRIORIDAD)**

**Archivo:** `operadora-dev/next.config.js`

**Cambio requerido:**
```javascript
// Agregar headers CORS para permitir llamadas desde app móvil
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" }, // En prod: dominio específico
        { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
      ],
    },
  ];
}
```

**Por qué:** La app móvil hace llamadas desde un origen diferente (React Native no es un navegador tradicional).

---

### **2. REFRESH TOKENS - Nueva funcionalidad (ALTA PRIORIDAD)**

**Archivos a modificar:**
- `src/services/AuthService.ts` - Agregar lógica de refresh tokens
- `src/app/api/auth/login/route.ts` - Retornar refresh token
- `src/app/api/auth/refresh/route.ts` - **NUEVO** endpoint

**Nueva tabla en BD:**
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  device_info VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

**Flujo:**
```
1. Login → accessToken (15 min) + refreshToken (30 días)
2. accessToken expira → App llama /api/auth/refresh
3. refreshToken válido → Nuevo accessToken
4. refreshToken expirado → Usuario debe re-login
```

**Por qué:** En móvil, los usuarios esperan no tener que hacer login cada vez que abren la app.

---

### **3. DEVICE TOKENS - Push Notifications (ALTA PRIORIDAD)**

**Archivos nuevos:**
- `src/app/api/notifications/register-device/route.ts` - **NUEVO**
- `src/app/api/notifications/unregister-device/route.ts` - **NUEVO**
- `src/services/PushNotificationService.ts` - **NUEVO**

**Nueva tabla en BD:**
```sql
CREATE TABLE device_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_token VARCHAR(500) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name VARCHAR(100),
  app_version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active) WHERE is_active = true;
```

**Por qué:** Para enviar push notifications necesitamos guardar los tokens de cada dispositivo.

---

### **4. API VERSIONING (MEDIA PRIORIDAD)**

**Estructura propuesta:**
```
src/app/api/
├── v1/                          ← Nueva carpeta
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── refresh/route.ts
│   │   └── register/route.ts
│   ├── hotels/
│   │   └── route.ts
│   └── ...
├── auth/                        ← APIs actuales (mantener para web)
│   └── login/route.ts
└── ...
```

**Alternativa más simple (recomendada inicialmente):**
```
// Mantener APIs actuales
// Solo agregar header de versión en respuestas
X-API-Version: 1.0
```

**Por qué:** Permite evolucionar las APIs sin romper clientes existentes.

---

### **5. RESPUESTAS ESTANDARIZADAS (MEDIA PRIORIDAD)**

**Archivo nuevo:** `src/types/api-response.ts`

```typescript
// Formato estándar para TODAS las respuestas API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  timestamp: string;
}

// Helper para crear respuestas
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString()
  };
}

export function errorResponse(code: string, message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  };
}
```

**Archivos a modificar:** TODOS los archivos en `src/app/api/*/route.ts`

**Por qué:** La app móvil necesita respuestas predecibles para manejar estados de carga, errores, paginación.

---

### **6. AUTENTICACIÓN BIOMÉTRICA (MEDIA PRIORIDAD)**

**Archivos nuevos:**
- `src/app/api/auth/biometric/register/route.ts` - **NUEVO**
- `src/app/api/auth/biometric/login/route.ts` - **NUEVO**

**Nueva tabla en BD:**
```sql
CREATE TABLE biometric_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  UNIQUE(user_id, device_id)
);
```

**Por qué:** Face ID / Touch ID son esperados en apps modernas.

---

### **7. ENDPOINTS OPTIMIZADOS PARA MÓVIL (BAJA PRIORIDAD)**

**Archivos nuevos (opcionales):**
- `src/app/api/v1/mobile/home/route.ts` - Dashboard consolidado
- `src/app/api/v1/mobile/search/route.ts` - Búsqueda con menos datos

**Ejemplo de optimización:**
```typescript
// Web: Retorna todos los campos
GET /api/hotels → { hotel: { ...50 campos } }

// Móvil: Retorna solo campos esenciales
GET /api/v1/mobile/hotels → { hotel: { id, name, image, price, rating } }
```

**Por qué:** Reduce consumo de datos móviles y mejora velocidad de carga.

---

## 📋 CHECKLIST DE COMPATIBILIDAD MÓVIL

### **Antes de cada nuevo endpoint, verificar:**

- [ ] ¿Usa el formato de respuesta estándar (ApiResponse)?
- [ ] ¿Maneja errores con códigos consistentes?
- [ ] ¿Soporta Authorization header con Bearer token?
- [ ] ¿Los campos sensibles están excluidos de la respuesta?
- [ ] ¿La paginación usa cursor o offset estándar?
- [ ] ¿Los datos son lo más compactos posible?

### **Antes de modificar un endpoint existente:**

- [ ] ¿El cambio es backward-compatible?
- [ ] ¿Se actualizó la versión de la API si es breaking change?
- [ ] ¿Se documentó el cambio?

---

## 🚦 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

| Fase | Tarea | Archivos | Tiempo Est. |
|------|-------|----------|-------------|
| **1** | CORS headers | `next.config.js` | 30 min |
| **2** | Respuestas estandarizadas (helper) | `src/types/api-response.ts` | 1 hora |
| **3** | Refresh tokens | `AuthService.ts`, 2 routes, 1 migración | 4 horas |
| **4** | Device tokens | 2 routes, 1 service, 1 migración | 3 horas |
| **5** | Actualizar endpoints críticos | `auth/login`, `bookings`, `search` | 4 horas |
| **6** | Documentar API (OpenAPI) | `docs/api-spec.yaml` | 4 horas |

**Tiempo total estimado:** 1-2 días de trabajo

---

## 🔗 REFERENCIAS

- **Documento estrategia:** `.same/APP-MOVIL-ESTRATEGIA.md`
- **Comparativa Expedia:** `.same/COMPARATIVA-APP-MOVIL-EXPEDIA.md`
- **Sistema documentación:** `.same/SISTEMA-DOCUMENTACION.md`

---

## 📝 NOTAS IMPORTANTES

1. **NO romper la web actual** - Todos los cambios deben ser retrocompatibles
2. **Un backend para todo** - No crear backend separado para móvil
3. **JWT es el estándar** - No cambiar a otro sistema de auth
4. **La BD no cambia** - Solo se agregan tablas nuevas, no se modifican existentes

---

## ✅ ESTADO DE IMPLEMENTACIÓN (15 Enero 2026)

### Completado

| Componente | Archivo | Estado |
|------------|---------|--------|
| CORS Headers | `next.config.js` | ✅ Implementado |
| Refresh Tokens (BD) | `migrations/015_refresh_tokens.sql` | ✅ Creado |
| Refresh Tokens (Lógica) | `src/services/AuthService.ts` | ✅ Implementado |
| Endpoint Refresh | `src/app/api/auth/refresh/route.ts` | ✅ Funcional |
| Device Tokens (BD) | `migrations/017_device_tokens.sql` | ✅ Creado |
| Register Device | `src/app/api/notifications/register-device/route.ts` | ✅ Funcional |
| Unregister Device | `src/app/api/notifications/unregister-device/route.ts` | ✅ Mejorado |
| Push Service | `src/services/PushNotificationService.ts` | ✅ Base creada |
| Respuestas API | `src/types/api-response.ts` | ✅ Estandarizado |

### Métodos Agregados a AuthService

- ✅ `storeRefreshToken()` - Almacena tokens en BD
- ✅ `revokeRefreshToken()` - Invalida tokens
- ✅ `rotateRefreshToken()` - Rotación segura
- ✅ `login()` actualizado - Guarda refresh token
- ✅ `logout()` actualizado - Revoca refresh token

### Pendiente de Verificación

- [ ] Ejecutar migraciones en base de datos
- [ ] Probar flujo completo de login/refresh
- [ ] Probar registro/baja de dispositivos
- [ ] Verificar CORS desde app móvil
- [ ] Integrar FCM real (opcional)

---

**Documento creado:** 10 de Enero de 2026  
**Última actualización:** 15 de Enero de 2026 - 01:51 CST  
**Estado:** ✅ Implementación completa - Backend listo para app móvil
