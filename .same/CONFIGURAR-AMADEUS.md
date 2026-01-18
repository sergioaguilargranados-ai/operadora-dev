# 🔧 CONFIGURAR AMADEUS API - GUÍA COMPLETA

**Última actualización:** 21 Diciembre 2025 - 10:00 CST
**Estado:** APIs implementadas ✅ - Pendiente configuración

---

## 📊 ESTADO ACTUAL

### ✅ Lo que YA está listo:
- Adaptadores Amadeus completos (4 servicios)
- Integración en SearchService
- APIs REST funcionales
- UIs de búsqueda completadas
- Páginas de resultados diseñadas

### ⏳ Lo que falta:
- Obtener API keys de Amadeus
- Configurar variables de entorno
- Probar con datos reales

---

## 🎯 PASOS PARA ACTIVAR AMADEUS

### **1. Crear Cuenta en Amadeus Self-Service**

**URL:** https://developers.amadeus.com/register

**Proceso:**
1. Ir a https://developers.amadeus.com/register
2. Completar formulario de registro
3. Verificar email
4. Hacer login en https://developers.amadeus.com/my-apps

**Datos a proporcionar:**
- Nombre completo
- Email corporativo
- Tipo de cuenta: Company
- Nombre de empresa: AS Operadora de Viajes y Eventos
- País: México

---

### **2. Crear Aplicación**

**Pasos:**
1. Ir a "My Apps" → "Create New App"
2. Nombre de app: `AS Operadora Production` (o nombre que prefieras)
3. Descripción: "Sistema de reservas de viajes y eventos"
4. Tipo de app: Self-Service

**Servicios a activar:**
- ✅ **Flight Offers Search** (Búsqueda de vuelos)
- ✅ **Hotel Search** (Búsqueda de hoteles)
- ✅ **Transfer Search** (Transfers/Autos)
- ✅ **Tours and Activities** (Actividades)
- ✅ **Airport & City Search** (Geocoding)

---

### **3. Obtener Credenciales**

Una vez creada la app, verás:

```
API Key: xxxxxxxxxxxxxxxx
API Secret: yyyyyyyyyyyyyyyy
```

**⚠️ IMPORTANTE:**
- Hay credenciales de **TEST** (sandbox) y **PRODUCTION**
- Empezar con TEST primero
- TEST es gratis y sin límites
- PRODUCTION tiene costos por transacción

---

### **4. Configurar Variables de Entorno**

Editar `.env.local`:

```bash
# Amadeus API
AMADEUS_API_KEY=tu_api_key_aqui
AMADEUS_API_SECRET=tu_api_secret_aqui
AMADEUS_ENVIRONMENT=test  # Cambiar a 'production' cuando estés listo
```

**Ubicación del archivo:**
```
operadora-dev/.env.local
```

---

### **5. Reiniciar Servidor**

```bash
cd /home/project/operadora-dev

# Si está corriendo, detenerlo
pkill -f "next dev"

# Iniciar de nuevo
bun dev
```

El sistema detectará automáticamente las nuevas variables y empezará a usar Amadeus real.

---

## 📋 VERIFICACIÓN

### **Test de Conexión:**

```bash
# Probar autenticación
curl -X POST "https://test.api.amadeus.com/v1/security/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=TU_API_KEY&client_secret=TU_API_SECRET"
```

**Respuesta esperada:**
```json
{
  "access_token": "xxxxxxx",
  "expires_in": 1799,
  "token_type": "Bearer"
}
```

### **Test de Búsqueda de Hoteles:**

1. Ir a http://localhost:3000
2. Tab "Estadías"
3. Buscar: "Cancún"
4. Fechas: Próxima semana
5. Click "Buscar"

**Si funciona:** Verás hoteles reales con fotos y precios de Amadeus
**Si NO funciona:** Revisa logs en terminal

---

## 💰 COSTOS Y LÍMITES

### **Ambiente TEST (Sandbox):**
- ✅ **GRATIS** ilimitado
- ✅ Datos de prueba realistas
- ✅ Sin cargos
- ⚠️ No se pueden hacer reservas reales

### **Ambiente PRODUCTION:**

| Servicio | Costo por Transacción | Límite Gratis/Mes |
|----------|----------------------|-------------------|
| **Vuelos** | $0.002 USD | 2,000 búsquedas |
| **Hoteles** | $0.005 USD | 1,000 búsquedas |
| **Transfers** | $0.003 USD | 500 búsquedas |
| **Activities** | $0.002 USD | 500 búsquedas |

**Ejemplo de costos mensuales:**
- 1,000 búsquedas de vuelos = $2 USD
- 500 búsquedas de hoteles = $2.50 USD
- 200 búsquedas de transfers = $0.60 USD
- **Total:** ~$5.10 USD/mes

---

## 🔧 TROUBLESHOOTING

### **Error: "Authentication failed"**

**Causa:** API keys incorrectas

**Solución:**
1. Verificar que copiaste las keys completas
2. Verificar que usas las keys de TEST (no production)
3. Verificar que `.env.local` esté en el directorio correcto

### **Error: "No se encontraron hoteles"**

**Causa:** Ciudad no reconocida

**Solución:**
1. Usar códigos IATA (CUN, MEX, GDL)
2. Verificar ortografía
3. Revisar tabla `cities` en BD

### **Error: "Rate limit exceeded"**

**Causa:** Demasiadas peticiones en poco tiempo

**Solución:**
1. Esperar 1 minuto
2. En producción, implementar cache
3. Usar límites en SearchService

---

## 📝 MIGRANDO A PRODUCCIÓN

### **Cuando estés listo:**

1. **Cambiar ambiente:**
```bash
# .env.local
AMADEUS_ENVIRONMENT=production
```

2. **Usar credenciales de producción:**
```bash
AMADEUS_API_KEY=prod_api_key_aqui
AMADEUS_API_SECRET=prod_api_secret_aqui
```

3. **Activar facturación en Amadeus:**
- Agregar tarjeta de crédito
- Configurar alertas de límites
- Revisar facturación mensual

4. **Monitorear uso:**
```
Dashboard Amadeus → Usage → View Statistics
```

---

## 🎯 RECOMENDACIONES

### **Para Desarrollo:**
- ✅ Usar TEST siempre
- ✅ Probar todos los flujos
- ✅ Validar datos mock vs reales

### **Para Staging:**
- ✅ Usar TEST
- ✅ Hacer pruebas de carga
- ✅ Validar performance

### **Para Producción:**
- ✅ Usar PRODUCTION
- ✅ Implementar cache (15 min para búsquedas)
- ✅ Monitorear costos semanalmente
- ✅ Configurar alertas de límites

---

## 🔗 RECURSOS ÚTILES

### **Documentación:**
- Portal: https://developers.amadeus.com
- Docs vuelos: https://developers.amadeus.com/self-service/category/flights
- Docs hoteles: https://developers.amadeus.com/self-service/category/hotels
- API Reference: https://developers.amadeus.com/self-service/apis-docs

### **Soporte:**
- Email: developers@amadeus.com
- Community: https://developers.amadeus.com/support
- Status: https://developers.amadeus.com/status

### **Testing:**
- Postman Collection: Disponible en el portal
- Test Data: https://developers.amadeus.com/self-service/apis-docs/guides/test-data

---

## ✅ CHECKLIST DE ACTIVACIÓN

- [ ] Cuenta Amadeus creada
- [ ] Aplicación configurada
- [ ] Servicios activados (Flights, Hotels, Transfers, Activities)
- [ ] API keys obtenidas (TEST)
- [ ] `.env.local` configurado
- [ ] Servidor reiniciado
- [ ] Test de autenticación exitoso
- [ ] Búsqueda de hoteles funciona
- [ ] Búsqueda de vuelos funciona
- [ ] Búsqueda de transfers funciona
- [ ] Búsqueda de activities funciona

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE ACTIVAR

1. ✅ Probar todas las búsquedas end-to-end
2. ✅ Validar que las fotos se muestren correctamente
3. ✅ Verificar que los precios sean reales
4. ✅ Implementar cache para reducir costos
5. ✅ Configurar alertas de uso
6. ✅ Documentar casos de uso comunes

---

**Última actualización:** 21 Diciembre 2025 - 10:00 CST
**Por:** AI Assistant
**Estado:** ✅ Guía completa

📧 **¿Dudas?** Consulta la documentación oficial o contáctame.
