# 🚀 DEPLOYMENT A VERCEL - GUÍA PASO A PASO

**Tiempo estimado:** 15-20 minutos

---

## ✅ PRE-REQUISITOS

Antes de deployar, asegúrate de tener:

- [x] Código en GitHub: https://github.com/sergioaguilargranados-ai/operadora-dev
- [x] Base de datos en Neon configurada
- [x] Cuenta en Vercel (crear en vercel.com si no tienes)

---

## 📋 PASO 1: IMPORTAR PROYECTO

### **1.1 Ir a Vercel:**
```
https://vercel.com
```

### **1.2 Click en "New Project"**

### **1.3 Conectar GitHub:**
- Si es primera vez, autorizar Vercel en GitHub
- Buscar: `operadora-dev`
- Click en "Import"

---

## ⚙️ PASO 2: CONFIGURAR PROYECTO

### **2.1 Settings del Proyecto:**

**Project Name:** `as-operadora` (o el que prefieras)
**Framework Preset:** Next.js (auto-detectado)
**Root Directory:** `./` (dejar por defecto)

### **2.2 Build Settings:**

✅ Ya están configurados automáticamente:
```
Build Command: next build
Output Directory: .next
Install Command: bun install
```

---

## 🔐 PASO 3: VARIABLES DE ENTORNO

⚠️ **MUY IMPORTANTE:** Configurar TODAS estas variables

### **3.1 Click en "Environment Variables"**

### **3.2 Agregar una por una:**

#### **DATABASE (OBLIGATORIO):**
```
DATABASE_URL = postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### **SEGURIDAD (OBLIGATORIO):**
```
JWT_SECRET = tu_secreto_super_seguro_cambiar_en_produccion_minimo_32_caracteres
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://as-operadora.vercel.app
```
*(Nota: Cambiar URL después del primer deploy)*

#### **AMADEUS (Opcional - si ya registraste):**
```
AMADEUS_API_KEY = tu_api_key
AMADEUS_API_SECRET = tu_api_secret
AMADEUS_SANDBOX = true
```

#### **SENDGRID (Opcional - si ya registraste):**
```
SENDGRID_API_KEY = SG.xxxxx
SENDGRID_FROM_EMAIL = noreply@asoperadora.com
```

#### **FACTURAMA (Opcional):**
```
FACTURAMA_USER = tu_usuario
FACTURAMA_PASSWORD = tu_password
FACTURAMA_SANDBOX = true
```

#### **OTROS (Opcionales):**
```
KIWI_API_KEY =
BOOKING_API_KEY =
EXPEDIA_API_KEY =
EXPEDIA_API_SECRET =
```

---

## 🚀 PASO 4: DEPLOY

### **4.1 Click en "Deploy"**

⏳ **Tiempo:** 2-5 minutos

Vercel hará:
1. ✅ Clonar repositorio
2. ✅ Instalar dependencias
3. ✅ Build del proyecto
4. ✅ Deploy automático

### **4.2 Esperar Completion:**

Verás:
```
✅ Build: Success
✅ Deployment: Ready
```

---

## 🌐 PASO 5: VERIFICAR DEPLOYMENT

### **5.1 Obtener URL:**

Vercel te dará una URL como:
```
https://as-operadora.vercel.app
```

### **5.2 Verificar que funciona:**

Abre la URL y verifica:
- ✅ Homepage carga
- ✅ No hay errores 500
- ✅ Puedes navegar

### **5.3 Actualizar NEXT_PUBLIC_APP_URL:**

1. Ir a Project Settings → Environment Variables
2. Editar `NEXT_PUBLIC_APP_URL`
3. Cambiar a tu URL real: `https://as-operadora.vercel.app`
4. Click en "Save"
5. Hacer un nuevo deploy (explicado abajo)

---

## 🔄 PASO 6: RE-DEPLOY (OPCIONAL)

Después de actualizar variables:

### **Opción A: Desde Vercel Dashboard:**
1. Ir a Deployments
2. Click en los 3 puntos del último deployment
3. Click en "Redeploy"

### **Opción B: Desde Git:**
```bash
cd expedia-clone
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

---

## ✅ PASO 7: CONFIGURAR DOMINIO CUSTOM (Opcional)

Si tienes un dominio propio:

### **7.1 Ir a Project Settings → Domains**

### **7.2 Agregar dominio:**
```
www.asoperadora.com
asoperadora.com
```

### **7.3 Configurar DNS:**

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

**Tipo A:**
```
@ → 76.76.21.21
```

**Tipo CNAME:**
```
www → cname.vercel-dns.com
```

⏳ **Tiempo de propagación:** 24-48 horas

---

## 🔧 TROUBLESHOOTING

### **Error: Build Failed**

**Solución:**
1. Verificar logs en Vercel
2. Revisar errores de TypeScript
3. Asegurarse que `next build` funciona localmente

### **Error: 500 Internal Server Error**

**Solución:**
1. Verificar `DATABASE_URL` en variables de entorno
2. Verificar que la BD en Neon está accesible
3. Revisar logs en Vercel → Function Logs

### **Error: Can't connect to database**

**Solución:**
1. Verificar que `DATABASE_URL` incluye `?sslmode=require`
2. Verificar que Neon está en plan activo
3. Probar conexión desde local

### **Página en blanco**

**Solución:**
1. Abrir consola del navegador (F12)
2. Revisar errores JavaScript
3. Verificar que `NEXT_PUBLIC_APP_URL` es correcta

---

## 📊 MONITOREO POST-DEPLOY

### **Analytics:**
- Vercel Analytics: Incluido automáticamente
- Ver en Dashboard → Analytics

### **Logs:**
- Ver errores: Dashboard → Functions → Logs
- Real-time: Dashboard → Realtime → View

### **Performance:**
- Speed Insights: Dashboard → Speed Insights
- Core Web Vitals automáticos

---

## 🔒 SEGURIDAD POST-DEPLOY

### **Checklist de Seguridad:**

- [ ] Cambiar `JWT_SECRET` por uno seguro (32+ caracteres)
- [ ] Verificar que `.env.local` NO está en GitHub
- [ ] Configurar CORS si es necesario
- [ ] Activar HTTPS (automático en Vercel)
- [ ] Configurar rate limiting (opcional)

### **Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 NOTAS IMPORTANTES

### **Costs:**
- ✅ **Free Tier:** 100GB bandwidth/mes
- ✅ **Build time:** Ilimitado en hobby plan
- ⚠️ **Sobrecargo:** Si excedes, Vercel te notifica

### **Límites Free Tier:**
- Deployments: Ilimitados
- Bandwidth: 100GB/mes
- Build time: 6000 minutos/mes
- Serverless Functions: Ilimitadas

### **Auto-Deploy:**
- ✅ Cada push a `main` → Deploy automático
- ✅ Preview URLs para pull requests
- ✅ Rollback instantáneo

---

## 🎯 SIGUIENTES PASOS

Después del deploy exitoso:

1. **Probar Funcionalidades:**
   - Búsqueda
   - Login/Registro
   - Dashboard
   - Reservas

2. **Configurar APIs Externas:**
   - Registrar Amadeus
   - Configurar SendGrid
   - Agregar Facturama

3. **Testing:**
   - Crear usuarios de prueba
   - Hacer reservas de prueba
   - Verificar emails

4. **Monitoreo:**
   - Revisar logs diariamente
   - Configurar alertas
   - Monitorear performance

---

## 🆘 SOPORTE

**Vercel Support:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com (Pro plan)

**Problemas con el Código:**
- Revisar: `.same/` folder en el proyecto
- GitHub Issues: https://github.com/sergioaguilargranados-ai/operadora-dev/issues

---

## ✅ VERIFICACIÓN FINAL

Antes de considerar el deploy completo:

- [ ] URL funciona: https://as-operadora.vercel.app
- [ ] Homepage carga correctamente
- [ ] Búsqueda funciona
- [ ] Login/Registro funciona
- [ ] Dashboard accesible
- [ ] Base de datos conectada
- [ ] Logs sin errores críticos
- [ ] Performance aceptable
- [ ] Variables de entorno configuradas

---

**¡Deploy Completo!** 🎉

Tu aplicación está ahora en producción en Vercel.

URL: https://as-operadora.vercel.app (cambiar por tu URL real)

---

**Última actualización:** 21 de Noviembre de 2025
