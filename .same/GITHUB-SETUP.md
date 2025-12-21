# 🚀 INSTRUCCIONES RÁPIDAS - SUBIR A GITHUB

## ✅ ESTADO ACTUAL
- ✅ Proyecto completamente preparado
- ✅ 3 commits listos para push
- ✅ README.md, LICENSE y documentación completa
- ✅ .gitignore protegiendo archivos sensibles

---

## 📝 PASOS PARA SUBIR A GITHUB

### **1. CREAR REPOSITORIO EN GITHUB**

**Web (Más fácil):**
1. Ve a: https://github.com/new
2. **Repository name:** `asoperadora` (o el que prefieras)
3. **Description:** `Sistema completo de gestión de viajes corporativos`
4. **Visibility:** Elige Private o Public
5. **NO marques** "Initialize with README" (ya lo tenemos)
6. Click "Create repository"
7. **Copia la URL** que te muestra: `https://github.com/TU-USUARIO/asoperadora.git`

---

### **2. CONECTAR Y SUBIR EL CÓDIGO**

**Desde tu terminal, ejecuta estos comandos:**

```bash
# 1. Ve al directorio del proyecto
cd operadora-dev

# 2. Agrega el repositorio de GitHub como remote
# REEMPLAZA "TU-USUARIO" con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/asoperadora.git

# 3. Verifica que se agregó correctamente
git remote -v

# 4. Sube todo a GitHub
git push -u origin main
```

---

### **3. AUTENTICACIÓN**

Cuando Git te pida autenticación:

**Opción A: Personal Access Token (Recomendado)**
1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Dale un nombre: "AS Operadora Project"
4. Marca el scope: `repo` (completo)
5. Click "Generate token"
6. **COPIA EL TOKEN** (solo lo verás una vez)

Cuando Git pida credenciales:
```
Username: tu-usuario-github
Password: [pega el token que copiaste]
```

**Opción B: SSH (Si ya tienes SSH configurado)**
```bash
git remote set-url origin git@github.com:TU-USUARIO/asoperadora.git
git push -u origin main
```

---

### **4. VERIFICAR**

Después del push:
1. Ve a: `https://github.com/TU-USUARIO/asoperadora`
2. Deberías ver todo el código subido ✅
3. El README.md se mostrará automáticamente

---

## 🌐 DEPLOY A VERCEL (OPCIONAL)

Si quieres deployar a producción:

```bash
# 1. Instala Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

O desde la web:
1. Ve a: https://vercel.com/new
2. Click "Import Git Repository"
3. Selecciona tu repo de GitHub
4. Agrega las variables de entorno (ver .env.example)
5. Deploy

---

## 🔒 VARIABLES DE ENTORNO

**IMPORTANTE:** Antes de deployar, configura estas variables:

### **Mínimas para funcionar:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=<genera con: openssl rand -base64 32>
ENCRYPTION_SECRET_KEY=<genera con: openssl rand -base64 32>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Ver `.env.example` para la lista completa.

---

## 📋 CHECKLIST

- [ ] Repositorio creado en GitHub
- [ ] Remote agregado (`git remote -v` muestra origin)
- [ ] Push exitoso (`git push -u origin main`)
- [ ] README visible en GitHub
- [ ] Variables de entorno configuradas en Vercel (si vas a deployar)
- [ ] Deploy exitoso (opcional)

---

## 🆘 PROBLEMAS COMUNES

### **Error: remote origin already exists**
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/asoperadora.git
```

### **Error: Authentication failed**
- Usa Personal Access Token en lugar de contraseña
- O configura SSH keys

### **Error: Push rejected**
```bash
git pull origin main --rebase
git push origin main
```

---

## 📚 DOCUMENTACIÓN

- **Guía completa:** `.same/GIT-DEPLOYMENT-GUIDE.md`
- **Resumen ejecutivo:** `.same/RESUMEN-GIT-DEPLOYMENT.md`
- **Setup completo:** `.same/SETUP-COMPLETO.md`

---

## ✅ LISTO!

Después de seguir estos pasos, tu proyecto estará en GitHub y listo para:
- ✅ Colaboración en equipo
- ✅ Deploy automático con Vercel
- ✅ CI/CD con GitHub Actions
- ✅ Producción

---

**¿Necesitas ayuda?**
- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Email: support@asoperadora.com

**¡Todo listo! 🎉**
