# 🚀 GUÍA RÁPIDA - REGISTRO DE APIS

**Tiempo estimado:** 30-45 minutos para todas

---

## ⭐ PRIORITARIO (Empezar aquí)

### 1. AMADEUS - Vuelos ✈️
**Tiempo:** 5 minutos | **Gratis:** Sí (Sandbox ilimitado)

1. **Registrar:** https://developers.amadeus.com/register
2. **Crear App:** Click en "My Self-Service Workspace"
3. **Obtener credenciales:**
   - API Key
   - API Secret
4. **Copiar a `.env.local`:**
   ```
   AMADEUS_API_KEY=tu_api_key_aqui
   AMADEUS_API_SECRET=tu_api_secret_aqui
   AMADEUS_SANDBOX=true
   ```

✅ **Listo!** Ahora puedes buscar vuelos de 400+ aerolíneas

---

### 2. SENDGRID - Emails 📧
**Tiempo:** 5 minutos | **Gratis:** 100 emails/día

1. **Registrar:** https://sendgrid.com/
2. **Crear API Key:** Settings → API Keys → Create API Key
3. **Permisos:** Full Access
4. **Copiar a `.env.local`:**
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@asoperadora.com
   ```

⚠️ **Importante:** Verificar dominio para producción

---

## 🟡 RECOMENDADO (Segundo paso)

### 3. KIWI.COM - Vuelos Low-Cost ✈️
**Tiempo:** 10 minutos | **Gratis:** Sí (con límites)

1. **Registrar:** https://tequila.kiwi.com/portal/
2. **Request Access:** Llenar formulario
3. **Esperar aprobación:** 1-3 días
4. **Obtener API Key**
5. **Copiar a `.env.local`:**
   ```
   KIWI_API_KEY=tu_api_key_aqui
   ```

✅ Acceso a 800+ aerolíneas low-cost

---

### 4. FACTURAMA - CFDI México 🧾
**Tiempo:** 10 minutos | **Gratis:** Sandbox ilimitado

1. **Registrar:** https://www.facturama.mx/
2. **Crear cuenta Sandbox**
3. **Obtener credenciales:** Usuario y Password
4. **Copiar a `.env.local`:**
   ```
   FACTURAMA_USER=tu_usuario
   FACTURAMA_PASSWORD=tu_password
   FACTURAMA_SANDBOX=true
   ```

✅ Facturación electrónica CFDI 4.0

---

## 🟢 OPCIONAL (Tercer paso)

### 5. EXPEDIA - Todo en Uno 🏨
**Tiempo:** 15 minutos | **Aprobación:** 3-7 días

1. **Registrar:** https://developers.expediagroup.com/
2. **Request Partner Access**
3. **Llenar formulario de negocio**
4. **Esperar aprobación**
5. **Obtener API Key + Secret**

⏳ Requiere aprobación de Expedia

---

### 6. BOOKING.COM - Hoteles 🏨
**Tiempo:** 15 minutos | **Aprobación:** 5-10 días

1. **Registrar:** https://developers.booking.com/
2. **Apply for Connectivity Partner**
3. **Esperar aprobación**
4. **Obtener API Key**

⏳ Proceso de aprobación manual

---

## 💳 PAGOS (Cuando estés listo)

### 7. STRIPE - Procesamiento de Pagos
**Tiempo:** 10 minutos | **Gratis:** Comisiones por transacción

1. **Registrar:** https://stripe.com/
2. **Activar modo Test**
3. **Obtener Test Keys:** Developers → API Keys
4. **Copiar a `.env.local`:**
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

---

## ✅ VERIFICACIÓN

Después de configurar, verificar que funcionan:

```bash
# En tu terminal
cd expedia-clone
bun run dev
```

Luego probar:
- ✅ Búsqueda de vuelos (necesita Amadeus)
- ✅ Notificaciones email (necesita SendGrid)
- ✅ Facturación (necesita Facturama)

---

## 🎯 PRIORIDADES RECOMENDADAS

### **Para Desarrollo:**
1. ✅ Amadeus (vuelos)
2. ✅ SendGrid (emails)

### **Para Producción:**
1. ✅ Amadeus (vuelos)
2. ✅ SendGrid (emails)
3. ✅ Facturama (CFDI)
4. ✅ Kiwi (más opciones)
5. ⏳ Stripe (pagos)
6. ⏳ Expedia (cuando sea aprobado)
7. ⏳ Booking (cuando sea aprobado)

---

## 📝 NOTAS IMPORTANTES

### **Sandbox vs Producción:**
- **Sandbox:** Datos de prueba, gratis, sin límites
- **Producción:** Datos reales, puede tener costos

### **Límites Gratuitos:**
- **Amadeus Sandbox:** Ilimitado ✅
- **SendGrid:** 100 emails/día
- **Facturama Sandbox:** Ilimitado ✅
- **Kiwi:** 100 requests/día (sandbox)

### **Seguridad:**
- ⚠️ **NUNCA** subir `.env.local` a GitHub
- ✅ Ya está en `.gitignore`
- ✅ Usar variables de entorno en Vercel

---

## 🆘 SOPORTE

Si tienes problemas registrando:
- Amadeus: support@amadeus.com
- SendGrid: https://support.sendgrid.com/
- Facturama: soporte@facturama.com
- Kiwi: https://tequila.kiwi.com/portal/support

---

**¿Necesitas ayuda?** Revisa `.same/GUIA-REGISTRO-APIS-PASO-A-PASO.md` para guías detalladas.
