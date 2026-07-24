import { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  manifest: "/mobile-manifest.json",
  title: "AS Operadora Móvil",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AS Móvil",
  },
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
