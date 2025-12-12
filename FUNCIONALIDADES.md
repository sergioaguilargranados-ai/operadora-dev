# AS Operadora de Viajes y Eventos - Plataforma de Reservas

## 🎯 Descripción General
Plataforma completa y funcional de reservas de viajes para AS Operadora de Viajes y Eventos, con todas las características principales de un sitio moderno de reservas.

## ✨ Funcionalidades Principales

### 1. Búsqueda Interactiva
- **Sistema de Tabs**: Navegación entre diferentes tipos de búsqueda (Estadías, Vuelos, Autos, Paquetes, Cosas que hacer)
- **Campo de Destino**: Input con icono de ubicación para ingresar el destino
- **Botón de Búsqueda**: Navega a la página de resultados al hacer clic

### 2. Calendario Interactivo 📅
- Selector de rango de fechas con calendario visual
- Doble calendario para seleccionar fecha de entrada y salida
- Formato en español (ej: "30 oct - 5 nov")
- Previene selección de fechas pasadas
- Interfaz moderna con Radix UI y react-day-picker

### 3. Selector de Huéspedes 👥
- Dropdown interactivo para seleccionar:
  - **Adultos**: Mayores de 18 años (mínimo 1, máximo 10)
  - **Niños**: Menores de 18 años (0 a 10)
  - **Habitaciones**: Número de habitaciones (mínimo 1, máximo 10)
- Botones +/- para incrementar/decrementar cantidades
- Actualización en tiempo real del resumen

### 4. Ofertas Especiales y Descuentos 🏷️
- Sección dedicada con 3 tarjetas de ofertas
- Badges de descuento (25%, 30%, 40% OFF)
- Categorización de ofertas:
  - Oferta Flash
  - Súper Oferta
  - Paquetes
- Fechas de vencimiento de ofertas
- Efectos hover en las tarjetas

### 5. Página de Resultados de Búsqueda 🔍
- **Panel de Filtros Lateral**:
  - Filtro por rango de precio (Bajo, Medio, Alto)
  - Filtro por calificación (4+, 4.5+)
  - Filtros por comodidades (Wi-Fi, Piscina, Estacionamiento, Restaurante)

- **Tarjetas de Hoteles**:
  - 6 hoteles de ejemplo con información detallada
  - Imagen del hotel con hover effect
  - Calificación con estrellas
  - Número de reseñas
  - Precio por noche
  - Ubicación
  - Descripción breve
  - Iconos de comodidades
  - Botón "Ver detalles"

### 6. Sistema de Favoritos ❤️
- Icono de corazón en cada tarjeta de hotel
- Click para agregar/quitar de favoritos
- Animación visual (relleno rojo cuando está en favoritos)
- Estado persistente durante la sesión

### 7. Diseño y UX
- **Responsive**: Adaptable a móviles, tablets y escritorio
- **Colores de Marca**: Amarillo (#FFDC00) y azul (#0066FF) característicos de Expedia
- **Animaciones**: Efectos hover, transiciones suaves
- **Tipografía**: Jerarquía clara y legible
- **Componentes Reutilizables**: Arquitectura modular con shadcn/ui

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilado**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Iconos**: Lucide React
- **Calendario**: react-day-picker + date-fns
- **Gestión de Estado**: React Hooks (useState)
- **Navegación**: Next.js Router

## 📁 Estructura del Proyecto

```
expedia-clone/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal
│   │   ├── resultados/
│   │   │   └── page.tsx          # Página de resultados
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # Componentes base de shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   └── select.tsx
│   │   ├── DateRangePicker.tsx   # Selector de fechas
│   │   └── GuestSelector.tsx     # Selector de huéspedes
│   └── lib/
│       └── utils.ts
├── public/
└── package.json
```

## 🎨 Paleta de Colores

- **Amarillo Principal**: #FFDC00
- **Azul Primario**: #0066FF
- **Azul Hover**: #0052CC
- **Fondo Oscuro**: #1A2B49
- **Texto Principal**: #1A1F29
- **Rojo Oferta**: #EF4444

## 🚀 Próximas Mejoras Potenciales

- [ ] Integración con API real de hoteles
- [ ] Autenticación de usuarios
- [ ] Página de detalles del hotel
- [ ] Proceso de checkout y pago
- [ ] Historial de búsquedas
- [ ] Comparador de hoteles
- [ ] Reseñas y calificaciones de usuarios
- [ ] Mapas interactivos
- [ ] Filtros avanzados adicionales
- [ ] Notificaciones de cambios de precio

## 📱 Características Responsive

- **Móvil**: Diseño vertical, menú colapsado
- **Tablet**: Layout adaptativo, 2 columnas
- **Desktop**: Experiencia completa, múltiples columnas

## ⚡ Rendimiento

- Carga optimizada de imágenes con Unsplash
- Componentes lazy-loaded
- Sin errores de linter
- Código limpio y mantenible
