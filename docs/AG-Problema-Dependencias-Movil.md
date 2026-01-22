# 🔧 Solución: Problema de Dependencias - App Móvil

**Fecha:** 20 de Enero de 2026 - 21:00 CST  
**Problema:** Dependencias marcadas como "extraneous" o "invalid"  
**Estado:** ⏳ En Resolución

---

## ❌ PROBLEMA ENCONTRADO

Al ejecutar `npm list --depth=0` se mostraron errores:

```
npm error extraneous: @babel/core@...
npm error invalid: expo@...
npm error invalid: react-native@...
```

**Síntomas:**
- ✅ Paquetes instalados en `node_modules`
- ❌ npm no los reconoce correctamente
- ❌ Comando `expo` no disponible
- ❌ `npm start` falla con "expo no se reconoce como un comando"

---

## 🔍 CAUSA DEL PROBLEMA

1. **Conflictos de versiones** entre paquetes
2. **Uso de `--legacy-peer-deps`** que ignora dependencias peer
3. **package-lock.json corrupto** o inconsistente
4. **Instalación previa incompleta**

---

## ✅ SOLUCIÓN APLICADA

### Paso 1: Limpiar Instalación Anterior

```bash
cd c:\operadora-dev\operadora-mobile

# Eliminar package-lock.json
del package-lock.json

# Eliminar node_modules
rmdir /s /q node_modules
```

### Paso 2: Reinstalar Dependencias

```bash
# Reinstalar con legacy-peer-deps
npm install --legacy-peer-deps
```

**Tiempo estimado:** 15-20 minutos

---

## 🎯 VERIFICACIÓN POST-INSTALACIÓN

Una vez que termine la instalación, verificar:

### 1. Verificar que Expo esté disponible

```bash
cd c:\operadora-dev\operadora-mobile

# Verificar versión de Expo
npx expo --version

# O usar el script de npm
npm start -- --help
```

### 2. Listar dependencias principales

```bash
npm list expo react-native expo-router --depth=0
```

**Resultado esperado:**
```
operadora-mobile@1.0.0
├── expo@51.0.39
├── expo-router@3.5.24
└── react-native@0.74.0
```

### 3. Intentar iniciar Expo

```bash
npm start
```

**Resultado esperado:**
```
> operadora-mobile@1.0.0 start
> expo start

Starting Metro Bundler...
```

---

## 🐛 SI EL PROBLEMA PERSISTE

### Opción A: Usar npx directamente

Si `npm start` sigue fallando:

```bash
# Usar npx para ejecutar expo directamente
npx expo start -c
```

### Opción B: Instalar Expo CLI globalmente

```bash
# Instalar Expo CLI de forma global
npm install -g expo-cli

# Luego usar
expo start
```

### Opción C: Verificar PATH de npm

```bash
# Verificar que npm bin esté en PATH
npm bin

# Agregar a PATH si es necesario:
# C:\operadora-dev\operadora-mobile\node_modules\.bin
```

---

## 📋 CHECKLIST DE DIAGNÓSTICO

Si encuentras problemas, verifica:

- [ ] `node_modules` existe y tiene contenido
- [ ] `package.json` está intacto
- [ ] No hay `package-lock.json` corrupto
- [ ] Node.js versión 20+ o 24+ instalado
- [ ] npm versión 8+ o 11+ instalado
- [ ] Suficiente espacio en disco (~5 GB libres)
- [ ] No hay procesos de npm corriendo en segundo plano

---

## 🔄 COMANDOS DE LIMPIEZA TOTAL

Si nada funciona, limpieza completa:

```bash
cd c:\operadora-dev\operadora-mobile

# 1. Limpiar cache de npm
npm cache clean --force

# 2. Eliminar todo
del package-lock.json
rmdir /s /q node_modules

# 3. Reinstalar desde cero
npm install --legacy-peer-deps

# 4. Si sigue fallando, probar sin legacy-peer-deps
npm install
```

---

## 💡 ALTERNATIVA: Usar Yarn

Si npm sigue dando problemas:

```bash
# Instalar Yarn globalmente
npm install -g yarn

# Usar Yarn en lugar de npm
cd c:\operadora-dev\operadora-mobile
yarn install

# Iniciar con Yarn
yarn start
```

---

## 📊 ESTADO ACTUAL

### Lo que Tenemos:
- ✅ Código de la app móvil completo
- ✅ `package.json` con todas las dependencias definidas
- ✅ IP configurada (192.168.100.8)
- ⏳ Dependencias en reinstalación

### Lo que Falta:
- ⏳ Instalación exitosa de dependencias
- ⏳ Verificar que `expo` funcione
- ⏳ Iniciar Metro Bundler
- ⏳ Probar en emulador/teléfono

---

## 🎯 PRÓXIMOS PASOS

Una vez que la instalación termine exitosamente:

1. **Verificar instalación**:
   ```bash
   npm list expo --depth=0
   ```

2. **Iniciar Expo**:
   ```bash
   npm start
   ```

3. **Si funciona**, continuar con:
   - Instalación de Android Studio (si aún no está)
   - Configuración de emulador
   - Prueba de la app

4. **Si no funciona**, probar:
   - `npx expo start`
   - Instalar Expo CLI global
   - Usar Yarn en lugar de npm

---

## 📝 NOTAS IMPORTANTES

### Sobre los Warnings "deprecated"

Los warnings como:
```
npm warn deprecated osenv@0.1.5: This package is no longer supported.
```

**SON NORMALES** y no afectan el funcionamiento. Son paquetes viejos que Expo/React Native aún usan pero que funcionan correctamente.

### Sobre "extraneous" vs "invalid"

- **extraneous**: Paquete instalado pero no en `package.json` (dependencia de dependencia)
- **invalid**: Versión instalada no coincide con la requerida

Ambos indican problemas en la estructura de dependencias que se resuelven con reinstalación limpia.

---

## 🆘 SI NADA FUNCIONA

Como última opción, podemos:

1. **Recrear el proyecto móvil desde cero**:
   ```bash
   npx create-expo-app@latest operadora-mobile-new
   # Copiar archivos de código manualmente
   ```

2. **Usar template de Expo**:
   ```bash
   npx create-expo-app@latest -t expo-template-blank-typescript
   ```

3. **Contactar soporte de Expo**:
   - Discord: https://chat.expo.dev
   - Forums: https://forums.expo.dev

---

**Documento creado:** 20 de Enero de 2026 - 21:00 CST  
**Actualizado por:** AntiGravity AI Assistant  
**Estado:** Instalación en proceso
