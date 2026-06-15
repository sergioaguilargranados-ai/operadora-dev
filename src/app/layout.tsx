import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { FeaturesProvider } from "@/contexts/FeaturesContext";
import { WhiteLabelProvider } from "@/contexts/WhiteLabelContext";
import { CookieConsent } from "@/components/CookieConsent";
import { ChatWidget } from "@/components/ChatWidget";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { BrandStyles } from "@/components/BrandStyles";
import { BrandMeta } from "@/components/BrandMeta";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AS Operadora de Viajes y Eventos | AS Viajando",
  description: "Descubre experiencias únicas con AS Operadora de Viajes y Eventos. Hoteles, vuelos, paquetes y más al mejor precio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AS Viajando",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0066FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* PWA Meta Tags */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AS Viajando" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0066FF" />
        <meta name="msapplication-tap-highlight" content="no" />
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          <WhiteLabelProvider>
            <BrandStyles />
            <BrandMeta />
            <FeaturesProvider>
              <ServiceWorkerRegistrar />
              <OfflineIndicator />
              <ClientBody>{children}</ClientBody>
              <CookieConsent />
              <WhatsAppWidget />
              <ChatWidget />
              <GoogleOneTap />
              <InstallPrompt />
            </FeaturesProvider>
          </WhiteLabelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

