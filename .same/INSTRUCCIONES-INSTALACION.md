# 📦 INSTRUCCIONES DE INSTALACIÓN - AS OPERADORA

**Proyecto:** Expedia Clone - AS Operadora de Viajes y Eventos
**Versión:** 19 (20 de Noviembre 2025)

---

## 📥 DESCARGA EXITOSA

✅ Has descargado el **código fuente** del proyecto (sin dependencias)
📦 Tamaño: ~420 KB (vs 837 MB con node_modules)

---

## 🚀 INSTALACIÓN PASO A PASO

### **1. Descomprimir el archivo**

```bash
# En Windows (con 7-Zip, WinRAR, o extraer)
- Clic derecho en expedia-clone-source.zip
- "Extraer aquí" o "Extract Here"

# En Mac/Linux
unzip expedia-clone-source.zip -d expedia-clone
cd expedia-clone
```

---

### **2. Instalar Bun (si no lo tienes)**

**En Windows:**
```powershell
# Opción 1: Con PowerShell
powershell -c "irm bun.sh/install.ps1|iex"

# Opción 2: Con npm (si tienes Node.js)
npm install -g bun
```

**En Mac/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Verificar instalación:**
```bash
bun --version
# Debe mostrar: 1.x.x
```

---

### **3. Instalar Dependencias**

```bash
cd expedia-clone
bun install
```

⏱️ **Tiempo:** 1-2 minutos
📦 **Descarga:** ~800 MB de dependencias

---

### **4. Configurar Variables de Entorno**

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tu editor favorito
# Windows: notepad .env.local
# Mac: nano .env.local
# VSCode: code .env.local
```

**Mínimo para funcionar:**
```bash
# Base de Datos (OBLIGATORIO)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret (OBLIGATORIO)
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres

# Todo lo demás es OPCIONAL al inicio
```

---

### **5. Crear Base de Datos**

**Opción A: Usar Neon (Gratis, Recomendado)**
1. Ir a https://neon.tech
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Copiar `DATABASE_URL`
5. Pegar en `.env.local`

**Opción B: PostgreSQL Local**
```bash
# Instalar PostgreSQL
# Crear base de datos
createdb expedia_clone

# URL quedará:
DATABASE_URL=postgresql://localhost:5432/expedia_clone
```

**Ejecutar el esquema:**
```bash
# Cargar el esquema de base de datos
psql $DATABASE_URL < .same/ESQUEMA-BD-COMPLETO.sql
```

---

### **6. Iniciar el Proyecto**

```bash
bun run dev
```

⚡ **El servidor se iniciará en:** http://localhost:3000

---

## ✅ VERIFICACIÓN

Abre tu navegador en http://localhost:3000 y deberías ver:
- ✅ Homepage con formulario de búsqueda
- ✅ Header con logo "AS OPERADORA"
- ✅ Diseño moderno con animaciones

---

## 🔧 COMANDOS ÚTILES

```bash
# Desarrollo
bun run dev              # Iniciar servidor de desarrollo

# Producción
bun run build            # Compilar para producción
bun run start            # Iniciar en modo producción

# Linting
bun run lint             # Verificar errores de código

# Database
bun run db:migrate       # Ejecutar migraciones (futuro)
bun run db:seed          # Cargar datos de ejemplo (futuro)
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
expedia-clone/
├── src/
│   ├── app/                 # Páginas y rutas (Next.js App Router)
│   │   ├── page.tsx         # Homepage
│   │   ├── login/           # Login
│   │   ├── mis-reservas/    # Mis Reservas
│   │   ├── dashboard/       # Dashboard Financiero
│   │   ├── reserva/[id]/    # Detalles de reserva
│   │   └── api/             # Backend APIs
│   │       ├── search/      # Búsqueda multi-proveedor
│   │       ├── bookings/    # Sistema de reservas
│   │       ├── invoices/    # Facturación CFDI
│   │       ├── accounts-receivable/  # CxC
│   │       ├── accounts-payable/     # CxP
│   │       └── commissions/          # Comisiones
│   │
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes shadcn
│   │   └── charts/          # Gráficas financieras
│   │
│   ├── services/            # Servicios de negocio
│   │   ├── providers/       # Adaptadores de APIs
│   │   │   ├── AmadeusAdapter.ts
│   │   │   ├── KiwiAdapter.ts
│   │   │   ├── BookingAdapter.ts
│   │   │   └── ExpediaAdapter.ts
│   │   ├── PDFService.ts    # Generación de PDFs
│   │   ├── ExcelService.ts  # Exportación Excel
│   │   └── FacturamaService.ts  # Facturación CFDI
│   │
│   ├── lib/                 # Utilidades
│   │   └── db.ts            # Helpers de base de datos
│   │
│   └── types/               # TypeScript types
│
├── .same/                   # Documentación del proyecto
│   ├── ESQUEMA-BD-COMPLETO.sql
│   ├── DESARROLLO-PROGRESO.md
│   ├── COMPARATIVA-EXPEDIA-VS-NUESTRO-SISTEMA.md
│   ├── COMPARATIVA-APP-MOVIL-EXPEDIA.md
│   ├── GUIA-REGISTRO-APIS-PASO-A-PASO.md
│   └── RESUMEN-DASHBOARDS-AVANZADOS.md
│
├── .env.example             # Variables de entorno (plantilla)
├── .env.local               # Variables de entorno (TU CONFIGURACIÓN)
├── package.json
└── README.md
```

---

## 🔑 APIs A REGISTRAR (Opcional, para funcionalidad completa)

### **Prioritario:**
1. **Amadeus** (Vuelos)
   - https://developers.amadeus.com/register
   - Sandbox GRATIS
   - Aprobación: Instantánea

2. **SendGrid** (Emails)
   - https://sendgrid.com/
   - 100 emails/día GRATIS
   - Aprobación: Instantánea

### **Recomendado:**
3. **Kiwi.com** (Vuelos low-cost)
   - https://tequila.kiwi.com/portal/
   - Gratis para desarrollo
   - Aprobación: 1-3 días

4. **Expedia** (Paquetes)
   - https://developers.expediagroup.com/
   - Sandbox gratis
   - Aprobación: 3-7 días

### **Opcional:**
5. **Facturama** (Facturación CFDI México)
   - https://www.facturama.mx/
   - Sandbox gratis
   - Aprobación: Instantánea

Ver guía completa en: `.same/GUIA-REGISTRO-APIS-PASO-A-PASO.md`

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: Cannot find module**
```bash
# Reinstalar dependencias
rm -rf node_modules
bun install
```

### **Error: DATABASE_URL not defined**
```bash
# Verificar que .env.local existe y tiene DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### **Error: Port 3000 already in use**
```bash
# Cambiar puerto
bun run dev --port 3001

# O matar proceso en puerto 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

### **Error: Module not found '@/...'**
```bash
# Verificar tsconfig.json
# Reiniciar servidor
```

### **Página en blanco o errores de hidratación**
```bash
# Limpiar cache
rm -rf .next
bun run dev
```

---

## 📚 DOCUMENTACIÓN

Todos los documentos están en la carpeta `.same/`:

- **DESARROLLO-PROGRESO.md** - Historial completo del proyecto
- **COMPARATIVA-EXPEDIA-VS-NUESTRO-SISTEMA.md** - Análisis de features
- **COMPARATIVA-APP-MOVIL-EXPEDIA.md** - Estrategia móvil
- **GUIA-REGISTRO-APIS-PASO-A-PASO.md** - Cómo registrar APIs
- **RESUMEN-DASHBOARDS-AVANZADOS.md** - Documentación de dashboards

---

## 🎯 ESTADO DEL PROYECTO

**Versión:** 19
**Progreso:** 92% completo
**Estado:** Listo para testing y deployment

**Completado:**
- ✅ Backend APIs (100%)
- ✅ Frontend principal (92%)
- ✅ Dashboards financieros (100%)
- ✅ Sistema de reservas (100%)
- ✅ Facturación CFDI (100%)
- ✅ Exportación PDF/Excel (100%)
- ✅ Gráficas interactivas (100%)

**Pendiente:**
- ⏳ Filtros avanzados
- ⏳ Login social
- ⏳ Métodos de pago
- ⏳ PWA móvil
- ⏳ Deployment

---

## 🚀 PRÓXIMOS PASOS

1. **Probar localmente** - Verificar que todo funciona
2. **Registrar APIs** - Al menos Amadeus para testing
3. **Testing con datos reales** - Hacer búsquedas y reservas
4. **Ajustes y feedback** - Reportar cualquier issue
5. **Deployment** - Cuando estés listo para producción

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa este documento
2. Revisa la documentación en `.same/`
3. Verifica logs en la terminal
4. Contacta a Same support (si es problema de plataforma)

---

**¡Listo para comenzar!** 🎉

Ejecuta `bun install && bun run dev` y comienza a explorar el proyecto.

---

**Última actualización:** 20 de Noviembre de 2025
