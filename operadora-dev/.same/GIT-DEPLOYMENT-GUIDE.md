# 🚀 GUÍA COMPLETA DE DEPLOYMENT A GIT/GITHUB

**Fecha:** 15 de Diciembre de 2025
**Versión del Proyecto:** v82
**Estado:** ✅ LISTO PARA DEPLOYMENT

---

## 📋 ÍNDICE

1. [Estado Actual del Proyecto](#-estado-actual-del-proyecto)
2. [Preparación Inicial](#-preparación-inicial)
3. [Crear Repositorio en GitHub](#-crear-repositorio-en-github)
4. [Push Inicial](#-push-inicial)
5. [Configuración de Protección](#-configuración-de-protección)
6. [Deploy Automático con Vercel](#-deploy-automático-con-vercel)
7. [Workflows y CI/CD](#-workflows-y-cicd)
8. [Checklist Final](#-checklist-final)

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### **Archivos Preparados:**
- ✅ README.md completo
- ✅ LICENSE (MIT)
- ✅ .gitignore configurado
- ✅ .env.example con todas las variables
- ✅ Documentación completa en `.same/`
- ✅ Migraciones SQL
- ✅ Tests configurados

### **Commit Actual:**
```
commit 637213f (HEAD -> main)
Sistema Completo de Gestión de Viajes Corporativos
```

### **Estado del Repositorio:**
- Branch: `main`
- Working tree: Clean (todo committeado)
- Remote: No configurado (siguiente paso)

---

## 🎯 PREPARACIÓN INICIAL

### **Paso 1: Verificar .gitignore**

Ya está configurado correctamente. Verifica que incluye:

```bash
# Verificar contenido
cat .gitignore
```

Debe incluir:
```gitignore
/node_modules
/.next
.env
.env*.local
.vercel
*.log
/coverage
.vitest
```

### **Paso 2: Verificar que NO se suban archivos sensibles**

```bash
# Buscar archivos .env
find . -name ".env" -o -name ".env.local"

# IMPORTANTE: .env y .env.local NO deben estar en el repositorio
# Solo .env.example debe incluirse
```

### **Paso 3: Último Check de Estado**

```bash
cd operadora-dev

# Ver estado
git status

# Ver último commit
git log --oneline -5

# Ver archivos que se ignorarán
git status --ignored
```

---

## 🌐 CREAR REPOSITORIO EN GITHUB

### **Opción A: Desde la Web (Recomendado)**

1. **Ir a GitHub:** https://github.com/new

2. **Configurar Repositorio:**
   - **Repository name:** `asoperadora` (o el nombre que prefieras)
   - **Description:** `Sistema completo de gestión de viajes corporativos con módulos de pagos, seguridad y reportes`
   - **Visibility:**
     - ✅ Private (si es proyecto privado/cliente)
     - ⬜ Public (si es open source)
   - **NO marcar:** "Initialize this repository with a README"
   - **NO agregar:** .gitignore ni LICENSE (ya los tenemos)

3. **Crear Repositorio**

4. **Copiar URL del repositorio:**
   ```
   https://github.com/tu-usuario/asoperadora.git
   ```

### **Opción B: Desde CLI (gh)**

```bash
# Si tienes GitHub CLI instalado
gh repo create asoperadora --private --source=. --remote=origin --push
```

---

## 🚀 PUSH INICIAL

### **Paso 1: Conectar con GitHub**

```bash
cd operadora-dev

# Agregar remote
git remote add origin https://github.com/TU-USUARIO/asoperadora.git

# Verificar
git remote -v
```

Debe mostrar:
```
origin  https://github.com/TU-USUARIO/asoperadora.git (fetch)
origin  https://github.com/TU-USUARIO/asoperadora.git (push)
```

### **Paso 2: Verificar Branch**

```bash
# Ver branch actual
git branch

# Si no es 'main', renombrar
git branch -M main
```

### **Paso 3: Push Inicial**

```bash
# Push y configurar upstream
git push -u origin main
```

**IMPORTANTE:** Si GitHub pide autenticación:

**Método 1: Personal Access Token (Recomendado)**

1. Ir a: https://github.com/settings/tokens
2. Generate new token (classic)
3. Scopes: Marcar `repo` completo
4. Copiar token

Usar el token como password cuando git pida:
```
Username: tu-usuario
Password: ghp_tu_token_aqui
```

**Método 2: SSH**

```bash
# Generar SSH key si no tienes
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# Agregar en: https://github.com/settings/keys

# Cambiar remote a SSH
git remote set-url origin git@github.com:TU-USUARIO/asoperadora.git

# Push
git push -u origin main
```

### **Paso 4: Verificar Push**

```bash
# Ver remote branches
git branch -r

# Ver estado
git status
```

Ir a GitHub y verificar que todos los archivos estén ahí.

---

## 🛡️ CONFIGURACIÓN DE PROTECCIÓN

### **Paso 1: Proteger Branch Main**

En GitHub:
1. Ir a: Repository → Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Configurar:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass (cuando tengas CI/CD)
   - ✅ Include administrators
5. Save changes

### **Paso 2: Configurar Secrets**

Para CI/CD y Vercel:

1. Ir a: Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Agregar:
   ```
   DATABASE_URL
   JWT_SECRET
   ENCRYPTION_SECRET_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   PAYPAL_CLIENT_SECRET
   BLOB_READ_WRITE_TOKEN
   ```

---

## ☁️ DEPLOY AUTOMÁTICO CON VERCEL

### **Opción A: Conectar desde Vercel Dashboard**

1. Ir a: https://vercel.com/dashboard
2. Click "Add New..." → Project
3. Import Git Repository
4. Seleccionar tu repositorio de GitHub
5. Configurar:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `bun run build`
   - **Install Command:** `bun install`
6. Agregar Environment Variables (todas las de .env.example)
7. Deploy

### **Opción B: Desde CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link proyecto
vercel link

# Agregar variables de entorno
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# ... (repetir para todas)

# Deploy
vercel --prod
```

### **Configuración de Auto-Deploy**

Vercel automáticamente:
- ✅ Deploy en cada push a `main`
- ✅ Preview deploy en cada PR
- ✅ Ejecuta build y tests

---

## ⚙️ WORKFLOWS Y CI/CD

### **Paso 1: Crear GitHub Actions**

Crear archivo `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest

    - name: Install dependencies
      run: bun install

    - name: Run linter
      run: bun run lint

    - name: Run tests
      run: bun test:run

    - name: Build
      run: bun run build

  security:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Run security audit
      run: bun audit
```

### **Paso 2: Commit y Push Workflow**

```bash
git add .github/workflows/ci.yml
git commit -m "🔧 Add CI/CD workflow"
git push
```

### **Paso 3: Verificar en GitHub**

Ir a: Repository → Actions

Deberías ver el workflow ejecutándose.

---

## 📝 CHECKLIST FINAL

### **Pre-Push:**
- [x] README.md creado
- [x] LICENSE agregado
- [x] .gitignore configurado
- [x] .env.example completo
- [x] No hay archivos sensibles (.env, .env.local)
- [x] Documentación completa
- [x] Tests configurados
- [x] Build exitoso localmente

### **GitHub:**
- [ ] Repositorio creado en GitHub
- [ ] Remote configurado correctamente
- [ ] Push inicial exitoso
- [ ] Branch main protegido
- [ ] Secrets configurados
- [ ] README visible en GitHub

### **Vercel:**
- [ ] Proyecto conectado a GitHub
- [ ] Variables de entorno configuradas
- [ ] Deploy inicial exitoso
- [ ] Auto-deploy configurado
- [ ] Dominio custom (opcional)

### **CI/CD:**
- [ ] GitHub Actions configurado
- [ ] Tests automáticos funcionando
- [ ] Linter configurado
- [ ] Build verification activo

---

## 🎉 COMANDOS RÁPIDOS

### **Workflow Diario:**

```bash
# Ver estado
git status

# Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "✨ feat: descripción del cambio"

# Push
git push -u origin feature/nueva-funcionalidad

# Crear PR en GitHub
# Merge después de revisión
```

### **Sincronizar con Main:**

```bash
# Actualizar main
git checkout main
git pull origin main

# Volver a tu branch
git checkout feature/tu-feature

# Merge main en tu branch
git merge main
```

### **Deploy Manual:**

```bash
# Deploy a producción con Vercel
vercel --prod

# O solo preview
vercel
```

---

## 🔧 TROUBLESHOOTING

### **Error: remote origin already exists**

```bash
# Ver remotes
git remote -v

# Eliminar remote existente
git remote remove origin

# Agregar nuevo
git remote add origin https://github.com/TU-USUARIO/asoperadora.git
```

### **Error: Authentication failed**

Usar Personal Access Token:
1. Generar en: https://github.com/settings/tokens
2. Usar como password cuando git pida

### **Error: Push rejected**

```bash
# Pull cambios primero
git pull origin main --rebase

# Resolver conflictos si hay

# Push de nuevo
git push origin main
```

### **Archivos sensibles en el repositorio**

```bash
# Eliminar del historial (CUIDADO!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

---

## 📚 RECURSOS ADICIONALES

- **GitHub Docs:** https://docs.github.com
- **Vercel Docs:** https://vercel.com/docs
- **Git Cheatsheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **Conventional Commits:** https://www.conventionalcommits.org/

---

## 🎯 PRÓXIMOS PASOS

Después del deployment:

1. **Testing en Producción:**
   - Probar flujos completos
   - Validar webhooks (Stripe, PayPal)
   - Verificar uploads de documentos

2. **Monitoreo:**
   - Configurar Vercel Analytics
   - Setup error tracking (Sentry)
   - Logs en Vercel Dashboard

3. **Optimizaciones:**
   - Revisar bundle size
   - Configurar caching
   - Optimizar imágenes

4. **Documentación:**
   - Wiki en GitHub
   - API documentation pública
   - Changelog

---

**Preparado por:** AI Assistant
**Fecha:** 15 de Diciembre de 2025
**Versión del Proyecto:** v82
**Estado:** ✅ LISTO PARA DEPLOYMENT

---

## 🚀 COMANDO FINAL

```bash
# Resumen de pasos:
cd operadora-dev

# 1. Agregar remote
git remote add origin https://github.com/TU-USUARIO/asoperadora.git

# 2. Verificar branch
git branch -M main

# 3. Push
git push -u origin main

# 4. Verificar en GitHub
echo "✅ Ve a: https://github.com/TU-USUARIO/asoperadora"

# 5. Deploy con Vercel
vercel --prod
```

**¡Listo! 🎉**
