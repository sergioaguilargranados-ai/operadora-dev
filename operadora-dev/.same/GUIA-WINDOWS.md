# 🪟 Guía para Compilar en Windows

## ✅ Paso 1: Verificar que tienes Node.js y Bun

### Abrir PowerShell o CMD

**Presiona:** `Windows + R` → Escribe `cmd` → Enter

**Verifica Node.js:**
```cmd
node --version
```

Deberías ver algo como: `v18.x.x` o superior

**Si no tienes Node.js instalado:**
1. Ve a: https://nodejs.org/
2. Descarga la versión LTS
3. Instala y reinicia CMD

### Instalar Bun en Windows

```powershell
# Abre PowerShell como Administrador
# Presiona: Windows + X → "Windows PowerShell (Admin)"

# Instala Bun
powershell -c "irm bun.sh/install.ps1 | iex"
```

**O usa npm (si prefieres):**
```cmd
npm install -g bun
```

---

## ✅ Paso 2: Navegar a la Carpeta del Proyecto

```cmd
# Cambia a tu disco (si está en D:, E:, etc.)
D:

# Navega a la carpeta (ajusta la ruta a tu caso)
cd ruta\a\tu\proyecto\expedia-clone

# Ejemplo:
cd C:\Users\TuUsuario\Documents\expedia-clone
```

---

## ✅ Paso 3: Instalar Dependencias

```cmd
bun install
```

**O con npm:**
```cmd
npm install
```

**Espera a que termine** (puede tardar 2-3 minutos)

---

## ✅ Paso 4: Crear archivo .env.local

### Opción A: Con el Bloc de Notas

1. Abre el Bloc de Notas
2. Copia y pega esto:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_BASE_DATOS"
JWT_SECRET="clave_super_secreta_aleatoria_123456789"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
```

3. **IMPORTANTE:** Reemplaza:
   - `TU_USUARIO` → Usuario de PostgreSQL de cPanel
   - `TU_PASSWORD` → Contraseña de PostgreSQL
   - `TU_BASE_DATOS` → Nombre de tu base de datos
   - `tudominio.com` → Tu dominio real

4. Ve a: **Archivo → Guardar como...**
5. Nombre: `.env.local` (con el punto al inicio)
6. Tipo: **Todos los archivos (*.*)**
7. Ubicación: La carpeta `expedia-clone`
8. Guarda

### Opción B: Con PowerShell (Más rápido)

```powershell
# Abre PowerShell en la carpeta del proyecto
# Click derecho en la carpeta → "Abrir en Terminal"

# Crea el archivo
@"
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_BASE_DATOS"
JWT_SECRET="clave_super_secreta_aleatoria_123456789"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Luego edítalo con Bloc de Notas** para poner tus datos reales.

---

## ✅ Paso 5: Compilar el Proyecto

```cmd
bun run build
```

**O con npm:**
```cmd
npm run build
```

**Esto creará la carpeta `.next`** con tu proyecto compilado.

**Deberías ver al final:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...
└ ○ /login                               ...
```

---

## ✅ Paso 6: Comprimir Archivos para Subir

### Opción A: Con 7-Zip (Gratis)

1. **Descarga 7-Zip:** https://www.7-zip.org/
2. Instala
3. En la carpeta `expedia-clone`, selecciona:
   - Carpeta `.next`
   - Carpeta `public`
   - Carpeta `node_modules` (opcional, puede ser grande)
   - Carpeta `src`
   - Archivo `package.json`
   - Archivo `next.config.js`
   - Archivo `server.js`
   - Archivo `.env.local`

4. **Click derecho → 7-Zip → Agregar al archivo...**
5. Nombre: `expedia-deploy.zip`
6. Formato: ZIP
7. OK

### Opción B: Con PowerShell

```powershell
# Crear carpeta temporal
New-Item -ItemType Directory -Path ..\deploy -Force

# Copiar archivos necesarios
Copy-Item -Path .next -Destination ..\deploy\.next -Recurse
Copy-Item -Path public -Destination ..\deploy\public -Recurse
Copy-Item -Path src -Destination ..\deploy\src -Recurse
Copy-Item -Path package.json -Destination ..\deploy\
Copy-Item -Path next.config.js -Destination ..\deploy\
Copy-Item -Path server.js -Destination ..\deploy\
Copy-Item -Path .env.local -Destination ..\deploy\

# Comprimir (Windows 10/11)
Compress-Archive -Path ..\deploy\* -DestinationPath ..\expedia-deploy.zip -Force

# Limpiar
Remove-Item -Path ..\deploy -Recurse -Force
```

El archivo `.zip` estará en la carpeta padre.

### Opción C: Copiar sin comprimir (WinSCP/FileZilla)

Si usas FTP, puedes subir las carpetas directamente sin comprimir.

---

## ✅ Paso 7: Subir a tu Servidor cPanel

### Con FileZilla (Gratis)

1. **Descarga FileZilla:** https://filezilla-project.org/
2. Instala
3. Abre FileZilla
4. Conecta:
   - Host: `ftp.tudominio.com`
   - Usuario: Tu usuario de cPanel
   - Contraseña: Tu contraseña de cPanel
   - Puerto: 21

5. **En el lado derecho** (servidor), navega a:
   - `public_html` (o la carpeta de tu dominio)

6. **En el lado izquierdo** (tu PC), navega a donde está tu `.zip`

7. **Arrastra el `.zip` al servidor**

8. **Descomprimir en cPanel:**
   - Ve a cPanel → **Administrador de archivos**
   - Encuentra tu archivo `expedia-deploy.zip`
   - Click derecho → **Extract** (Extraer)
   - Extrae en la carpeta actual

---

## 🎯 Alternativa: No Comprimir, Subir Directo

Si tu internet es bueno y tienes tiempo:

1. En FileZilla, arrastra carpeta por carpeta:
   - `.next` → Al servidor
   - `public` → Al servidor
   - `src` → Al servidor
   - Y los archivos individuales

**Ventaja:** No necesitas descomprimir en el servidor
**Desventaja:** Tarda más (miles de archivos)

---

## ✅ RESUMEN PARA WINDOWS

```cmd
# 1. Abrir CMD o PowerShell en la carpeta del proyecto
cd C:\Users\TuUsuario\Documents\expedia-clone

# 2. Instalar dependencias
bun install

# 3. Crear .env.local (con Bloc de Notas)

# 4. Compilar
bun run build

# 5. Comprimir archivos (con 7-Zip o PowerShell)

# 6. Subir con FileZilla a cPanel

# 7. Descomprimir en cPanel

# 8. Configurar Node.js App en cPanel
```

---

## 🔧 Problemas Comunes en Windows

### "El término 'bun' no se reconoce"

**Solución:**
```cmd
# Usa npm en su lugar
npm install
npm run build
```

### "Permission denied" al crear .env.local

**Solución:**
1. Abre el Bloc de Notas como Administrador
2. Crea el archivo desde ahí

### Error al compilar con rutas

**Solución:**
- Asegúrate de estar en la carpeta correcta con `cd`
- Usa comillas si la ruta tiene espacios:
  ```cmd
  cd "C:\Users\Mi Usuario\Documents\expedia-clone"
  ```

### No puedo ver el archivo .env.local

**Solución:**
1. Abre el Explorador de archivos
2. Ve a: **Vista → Mostrar → Extensiones de nombre de archivo**
3. **Vista → Mostrar → Elementos ocultos**

---

## 📁 Archivos Importantes que DEBES Subir

```
✅ .next\                  (Carpeta completa - resultado de compilar)
✅ public\                 (Carpeta completa - imágenes, etc.)
✅ src\                    (Carpeta completa - código fuente)
✅ package.json            (Archivo)
✅ next.config.js          (Archivo)
✅ server.js               (Archivo)
✅ .env.local              (Archivo - CON TUS DATOS REALES)
⚠️ node_modules\           (Opcional - puedes instalarlo en servidor)
```

---

## ✅ Checklist Final Windows

- [ ] Node.js instalado (verificar con `node --version`)
- [ ] Bun o npm funcionando
- [ ] Navegado a la carpeta `expedia-clone`
- [ ] Ejecutado `bun install` (o `npm install`)
- [ ] Creado archivo `.env.local` con datos reales
- [ ] Ejecutado `bun run build` exitosamente
- [ ] Veo la carpeta `.next` creada
- [ ] Archivos comprimidos en `.zip`
- [ ] FileZilla instalado y conectado a cPanel
- [ ] Archivo subido al servidor

**¿Todo listo?** → Continúa con configurar Node.js App en cPanel

---

## 🚀 Siguiente Paso

Una vez que hayas subido los archivos, sigue la guía:
**`.same/GUIA-RAPIDA.md`** desde el **Paso 6** (Configurar Node.js App)
