# 📌 Sistema de Versionamiento

## 🔢 Esquema de Versiones - ACTUALIZADO

**Estrategia:** Versionamiento incremental por cambios

El proyecto usa un sistema de versionamiento que refleja cambios reales:
- **Versión Mayor.Menor**: v2.50, v2.51, v2.52, etc.
- **Versión Mayor**: Solo cambia en hitos importantes (v3.0 = PRODUCCIÓN FINAL)
- **Same Version**: Se usa para referencia interna pero NO afecta versión visible

### Formato:
```
v[MAYOR].[MINOR]
Ejemplo: v2.50, v2.51, v2.52... → v3.0
```

### Workflow:
1. Trabajar en **VARIOS cambios** antes de crear nueva versión
2. Al hacer **push a Git**, detallar TODOS los cambios en commit message
3. Incrementar versión solo cuando sea un conjunto significativo de cambios
4. Footer siempre muestra la versión actual visible al usuario

## 📊 Versiones Actuales

| Versión | Same Version | Fecha | Descripción |
|---------|--------------|-------|-------------|
| v2.50 | 50 | 12 Dic 2025 | Sistema de Paginación de Vuelos + Auto-Guardado de Hoteles |
| v2.0.2 | 48 | 10 Dic 2025 | Corrección de errores de hidratación |
| v2.0 | ~ | - | Lanzamiento con localStorage para resultados de búsqueda |

## 🎯 Próximas Versiones

- **v2.60**: Panel de administración para hoteles
- **v2.70**: Sistema de imágenes automático
- **v2.80**: Filtros avanzados
- **v2.90**: Sistema de favoritos
- **v3.0**: Lanzamiento completo del proyecto (PRODUCCIÓN FINAL)

## 📍 Ubicaciones de Versión

### 1. Footer (src/app/page.tsx)
```tsx
<p className="text-xs mt-2 opacity-50">
  v2.50 | Build: Dec 12 2025, 23:30 UTC
</p>
```

### 2. Comentario de Archivo (src/app/page.tsx)
```tsx
// Build: Dec 12 2025 - v2.50 - Flight Pagination + Hotel Auto-Save System - PRODUCTION
```

## 🔄 Proceso de Actualización

Cuando crees una nueva versión:

1. **Actualizar Footer** en `src/app/page.tsx`:
   - Cambiar número de versión
   - Actualizar fecha y hora de build

2. **Actualizar Comentario** en la parte superior del archivo:
   - Descripción breve de los cambios principales

3. **Documentar** en `.same/todos.md`:
   - Agregar a sección "COMPLETADAS EN ESTA SESIÓN"

4. **NO MIGRAR** hasta la siguiente actualización significativa

## 💡 Notas

- La versión en el footer ayuda a identificar qué versión está deployada
- Útil para debugging y soporte
- Cuando lleguemos a v3.0, será el lanzamiento oficial a producción
- El número MENOR se incrementa con cada versión de Same.new (automático)

---

**Última actualización:** 12 de Diciembre de 2025
**Versión actual:** v2.50 (Same Version 50)
