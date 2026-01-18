"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CookiesPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Volver
        </Button>
        <h1 className="text-4xl font-bold mb-2">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: 17 de Diciembre de 2025</p>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">¿Qué son las cookies?</h2>
          <p className="text-muted-foreground">Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.</p>
        </Card>
      </div>
    </div>
  )
}
