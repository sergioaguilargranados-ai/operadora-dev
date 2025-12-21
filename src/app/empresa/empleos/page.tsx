"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmpleosPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-4xl font-bold mb-6">Trabaja con Nosotros</h1>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Únete a AS Operadora</h2>
          <p className="text-muted-foreground mb-4">
            Estamos buscando talento apasionado por los viajes y la tecnología.
          </p>
          <p className="text-muted-foreground">
            Envía tu CV a: <a href="mailto:rh@asoperadora.com" className="text-blue-600 hover:underline">rh@asoperadora.com</a>
          </p>
        </Card>
      </div>
    </div>
  )
}
