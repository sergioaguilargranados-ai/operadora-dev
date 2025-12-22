# 📁 Archivos Que Debes Crear Manualmente

Si te faltan estos archivos en tu proyecto, créalos siguiendo estas instrucciones:

---

## 1️⃣ server.js (Raíz del proyecto)

**Ubicación:** `expedia-clone/server.js`

**Contenido completo:**

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Crear app Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parsear la URL
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> AS Operadora - Ready on http://${hostname}:${port}`)
      console.log(`> Environment: ${process.env.NODE_ENV}`)
    })
})
```

**Cómo crearlo:**
1. Abre Bloc de Notas
2. Copia el código de arriba
3. Guarda como: `server.js` (en la raíz de `expedia-clone`)
4. Tipo: **Todos los archivos**

---

## 2️⃣ Carpeta public (Si no existe)

**Ubicación:** `expedia-clone/public/`

Si esta carpeta NO existe:
1. Crea una carpeta llamada `public` en la raíz de `expedia-clone`
2. Dentro de `public`, crea estos archivos:

### 2.1 public/robots.txt

**Contenido:**
```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Sitemap: https://tudominio.com/sitemap.xml
```

### 2.2 public/favicon.ico (Opcional)

Puedes agregar un favicon de 32x32 píxeles. Si no tienes uno, déjalo vacío por ahora.

---

## 3️⃣ .env.local (Raíz del proyecto)

**Ubicación:** `expedia-clone/.env.local`

**Contenido (REEMPLAZA CON TUS DATOS REALES):**

```env
DATABASE_URL="postgresql://cpanel_usuario:password@localhost:5432/cpanel_basedatos"
JWT_SECRET="clave_super_secreta_aleatoria_cambiar_en_produccion"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
```

**⚠️ IMPORTANTE:**
- Reemplaza `cpanel_usuario` con tu usuario real de PostgreSQL
- Reemplaza `password` con tu contraseña real
- Reemplaza `cpanel_basedatos` con el nombre de tu base de datos
- Reemplaza `tudominio.com` con tu dominio real
- Cambia `JWT_SECRET` por una clave aleatoria larga

**Cómo crearlo:**
1. Abre Bloc de Notas
2. Copia el contenido de arriba
3. **Cambia los valores** por los tuyos
4. Guarda como: `.env.local` (con el punto al inicio)
5. Tipo: **Todos los archivos**

---

## 📦 Estructura Final del Proyecto

Antes de subir, tu proyecto debe verse así:

```
expedia-clone/
├── .next/                   ✅ (Creada al compilar)
├── public/                  ✅ (Crear si no existe)
│   ├── robots.txt          ✅ (Crear)
│   └── favicon.ico         ⚠️  (Opcional)
├── src/                    ✅ (Ya existe)
├── package.json            ✅ (Ya existe)
├── next.config.js          ✅ (Ya existe)
├── server.js               ✅ (CREAR ESTE)
├── .env.local              ✅ (CREAR ESTE con tus datos)
└── node_modules/           ⚠️  (Opcional, se puede instalar en servidor)
```

---

## 🎯 Checklist de Archivos Necesarios

Antes de comprimir y subir, verifica que tienes:

- [ ] `.next/` (carpeta completa - resultado de `npm run build`)
- [ ] `public/` (carpeta - crear si no existe)
- [ ] `public/robots.txt` (archivo - crear)
- [ ] `src/` (carpeta completa - ya existe)
- [ ] `package.json` (archivo - ya existe)
- [ ] `next.config.js` (archivo - ya existe)
- [ ] `server.js` (archivo - **CREAR**)
- [ ] `.env.local` (archivo - **CREAR con tus datos**)

---

## 🚀 Si Algunos Archivos SÍ Existen

Si `server.js` o `public/` ya existen en tu proyecto pero no los ves:

1. **Asegúrate de que estás en la carpeta correcta:**
   ```cmd
   cd C:\ruta\completa\a\expedia-clone
   dir
   ```

2. **Muestra archivos ocultos:**
   - Abre la carpeta en el Explorador
   - Vista → Mostrar → Elementos ocultos
   - Vista → Mostrar → Extensiones de nombre de archivo

3. **Verifica que tienes la versión más reciente:**
   - Descarga el proyecto completo nuevamente
   - O usa los códigos de arriba para recrearlos

---

## 💡 Si Prefieres, Te Doy los Archivos Directamente

Dime si:
- ✅ Prefieres que te pase un ZIP con SOLO estos archivos faltantes
- ✅ Quieres que te guíe paso a paso para crearlos uno por uno
- ✅ Necesitas ayuda para verificar si ya los tienes

---

## 📞 Siguiente Paso

Una vez que tengas todos estos archivos:

1. Compila: `npm run build`
2. Comprime todo
3. Sube a cPanel
4. Continúa con la **GUIA-RAPIDA.md**
