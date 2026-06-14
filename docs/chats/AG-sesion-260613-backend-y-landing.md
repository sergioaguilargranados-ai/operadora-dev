# Resumen de Sesión - 13 de Junio de 2026

## Cambios Implementados
- **Gestión de Imágenes con Vercel Blob:** Se actualizó el endpoint de carga de imágenes del panel de administración (`src/app/api/admin/upload-image/route.ts`) para soportar correctamente los prefijos de las variables de entorno de Vercel Blob (`BLOB_READ_WRITE_TOKEN` y `b_READ_WRITE_TOKEN`).
- **Plantilla Corporativa de Correos:** Se conectó la plantilla corporativa base (`landing-welcome.html`) al proceso de registro de usuarios en `src/app/api/inicio/register/route.ts` mediante `sendLandingWelcomeEmail`.
- **Caché Estático de Next.js:** Se deshabilitó el caché estático en la API de contenido de la Landing Page (`src/app/api/inicio/content/route.ts`) agregando `export const dynamic = 'force-dynamic';`, garantizando que las actualizaciones del panel de control se reflejen instantáneamente en el frontend.
- **Corrección de Conflicto de Base de Datos:** Se identificó un conflicto en la base de datos Neon donde existían múltiples IDs en `expo_landing_content`. Se modificó el GET de `src/app/api/inicio/content/route.ts` para que apunte exclusivamente a `id = 1` y coincida con el endpoint POST.
- **Soporte de URLs Absolutas (Landing Page):** Se corrigieron las etiquetas `<img>` en `src/app/inicio/page.tsx` para admitir rutas externas completas de Vercel Blob en las secciones de "¿Cómo podemos ayudarte?", "Servicios", y "Destinos".
- **Estética del Chatbot:** Se actualizó el color del botón y burbuja del `ChatWidget.tsx` de azul (brand-primary) a colores negro y blanco para alinear el diseño con el tema institucional.
- **Control de Versiones:** Se actualizó la versión en `README.md` y en el footer institucional (`BrandFooter.tsx`) a la versión v2.345.

## Próximos Pasos (Pendientes)
- Retomar el rediseño estético y de interfaz de la Landing Page.
- Continuar refinando componentes para mejorar la experiencia de usuario y conversiones de la página principal.
