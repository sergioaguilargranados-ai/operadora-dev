# 🐙 GUÍA DE CONEXIÓN A GITHUB

**Última actualización:** 15 de Enero de 2026 - 00:20 CST
**Versión:** v1.0
**Idioma:** Español 🇪🇸

---

## 🎯 OBJETIVO
Explicar cómo asegurar que el agente "Antigravity" pueda enviar cambios (push) a tu repositorio de GitHub, garantizando que el despliegue automático en Vercel funcione.

---

## 🔍 DIAGNÓSTICO
Antigravity opera directamente sobre tu sistema de archivos (o contenedor). Para que pueda "conectarse" a GitHub, simplemente necesita que **Git esté configurado** en el entorno donde corre el agente.

### Paso 1: Verificar Configuración Actual
Pídele al agente que ejecute:
```bash
git remote -v
```
- **Correcto:** Deberías ver URLs que apuntan a tu repo, ej: `https://github.com/tu-usuario/operadora-dev.git`
- **Incorrecto:** Si no sale nada, no hay conexión remota.

### Paso 2: Verificar Credenciales
Antigravity usa las credenciales del sistema. Si trabajas en local (tu PC), usa tus credenciales de Windows/Mac. Si es un entorno nube, debe tener un token configurado.

---

## 🛠️ CÓMO CONECTAR (PASO A PASO)

Si el agente te indica que "no tiene permisos" o "no encuentra el repo", sigue estos pasos:

### Opción A: Configuración Automática (Si tienes GH CLI)
Si tienes `gh` instalado, el agente puede intentar autenticarse si le das el token, pero lo más seguro es que tú lo hagas en tu terminal:
```bash
gh auth login
```

### Opción B: Configuración Manual de Remoto
Indica al agente la URL de tu repositorio para que lo vincule:

1.  **Dile al agente:**
    *"Ejecuta el comando para agregar el remoto origin: `git remote add origin https://github.com/USUARIO/REPO.git`"* (Reemplaza con tus datos realies).

2.  **Configura tu usuario (si es la primera vez):**
    ```bash
    git config --global user.name "Tu Nombre"
    git config --global user.email "tu@email.com"
    ```

### Opción C: Token de Acceso Personal (PAT)
Si el agente necesita autenticarse "a nombre tuyo" y no puede abrir navegador:
1.  Genera un Token en GitHub (Settings -> Developer Settings -> Personal Access Tokens).
2.  Dale permisos de `repo`.
3.  La URL del remoto sería:
    `https://TOKEN_AQUI@github.com/USUARIO/REPO.git`

---

## 🚀 FLUJO DE TRABAJO RECOMENDADO

Para que Antigravity trabaje fluidamente con GitHub:

1.  **Siempre inicia la sesión verificando el estado:**
    *"Por favor revisa `git status` y confirma que estamos en la rama `main`."*

2.  **Solicita Push explícitamente:**
    Al terminar una tarea, dile: *"Haz commit y push de los cambios."*

3.  **Manejo de Conflictos:**
    Si el agente dice que hay conflictos (porque tú editaste algo en GitHub web), dile:
    *"Haz un `git pull --rebase` antes de subir los cambios."*

---

## ✅ VERIFICACIÓN FINAL
Para confirmar que todo funciona:
1.  Pide al agente: *"Haz un cambio menor en README.md y súbelo a GitHub."*
2.  Revisa tu repo en GitHub.com. Si ves el cambio, **Antigravity está conectado**.
