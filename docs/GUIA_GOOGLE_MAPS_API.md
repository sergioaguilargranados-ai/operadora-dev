# Guía para obtener la Google Places API Key

Para que el módulo de Restaurantes funcione con datos reales y mapas interactivos, necesitas una **API Key de Google Cloud** con los servicios habilitados.

## Pasos para obtener la API Key

1. Ve a la [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un **Nuevo Proyecto** (ej: "AS Operadora Web").
3. Una vez creado el proyecto, ve al menú de "APIs y Servicios" > "Biblioteca" (Library).
4. Busca y **HABILITA** las siguientes APIs (es importante habilitar ambas):
   - **Places API (New)** o **Places API**: Para buscar restaurantes y obtener detalles.
   - **Maps JavaScript API**: Para mostrar el mapa interactivo en la web.
5. Ve a "APIs y Servicios" > "Credenciales".
6. Haz clic en **"Crear Credenciales"** > **"Clave de API"**.
7. Copia la clave generada (empieza por `AIza...`).

## Configuración en el Proyecto

1. Abre el archivo `.env` en la raíz del proyecto.
2. Agrega la siguiente línea (si no existe, créala). Es importante usar el prefijo `NEXT_PUBLIC_` para que el mapa funcione en el navegador:

```env
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy... (Tu clave aquí)
```

## Restricciones (Recomendado)

Para seguridad, en la consola de Google Cloud, edita tu Clave de API y:
- **Restricciones de API:** Selecciona solo "Places API" y "Maps JavaScript API".
- **Restricciones de Aplicación:** Para desarrollo local, puedes dejarlo abierto o agregar `localhost:3000`. Para producción, agrega tu dominio (ej: `as-operadora.vercel.app`).

## Nota Importante de Costos
Google ofrece $200 USD de crédito mensual gratis, lo cual es suficiente para miles de cargas de mapa y búsquedas. Sin embargo, requiere vincular una tarjeta de crédito para activar la cuenta.
