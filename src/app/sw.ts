// Build: 21 Jul 2026 - 13:55 CST - v2.426
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, NetworkOnly, CacheFirst } from "serwist";
import { BackgroundSyncPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Configurar Background Sync para peticiones fallidas (ej. carrito, progreso)
const bgSyncPlugin = new BackgroundSyncPlugin('as-operadora-queue', {
  maxRetentionTime: 24 * 60 // Mantener por 24 horas máximo
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Caché explícito para la página de ayuda y FAQs para que siempre funcionen offline
    {
      matcher: ({ url }) => url.pathname.startsWith('/mobile/ayuda') || url.pathname.startsWith('/mobile/faqs'),
      handler: new StaleWhileRevalidate({
        cacheName: 'help-center-cache',
      }),
    },
    // Caché para el catálogo de tienda
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/store/products'),
      handler: new StaleWhileRevalidate({
        cacheName: 'store-catalog-cache',
      }),
    },
    // Guardar itinerarios en caché agresivo
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/itineraries'),
      handler: new CacheFirst({
        cacheName: 'itinerary-cache',
      }),
    },
    // Caché para bookings, groups, profile y wishlist (StaleWhileRevalidate)
    {
      matcher: ({ url }) => 
        url.pathname.startsWith('/api/bookings') || 
        url.pathname.startsWith('/api/groups') || 
        url.pathname.startsWith('/api/mobile/profile') || 
        url.pathname.startsWith('/api/wishlist'),
      handler: new StaleWhileRevalidate({
        cacheName: 'trip-metadata-cache',
      }),
    },
    // Caché para fotos e imágenes (Unsplash y Vercel Blob)
    {
      matcher: ({ url }) => 
        url.hostname.includes('unsplash.com') || 
        url.hostname.includes('vercel-storage.com'),
      handler: new CacheFirst({
        cacheName: 'trip-media-cache',
      }),
    },
    // Background sync para POSTs (carrito, pasos)
    {
      matcher: ({ request }) => request.method === 'POST',
      handler: new NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
    }
  ],
});

serwist.addEventListeners();
