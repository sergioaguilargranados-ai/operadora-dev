"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AcercaDePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-4xl font-bold mb-6">Acerca de AS Operadora</h1>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Nuestra Historia</h2>
          <p className="text-muted-foreground mb-4">
            AS Operadora de Viajes y Eventos nace con la misión de transformar la manera en que
            las empresas y personas organizan sus viajes. Combinamos tecnología de punta con un
            servicio personalizado para ofrecer experiencias únicas.
          </p>
          <p className="text-muted-foreground">
            Con más de 10 años de experiencia en el sector turístico, nos hemos posicionado como
            líderes en la gestión de viajes corporativos y eventos especiales en México y Latinoamérica.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
          <p className="text-muted-foreground">
            Ofrecer soluciones de viaje innovadoras y personalizadas que superen las expectativas
            de nuestros clientes, contribuyendo al éxito de sus negocios y a la realización de sus sueños.
          </p>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Nuestros Valores</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>Excelencia:</strong> Compromiso con la calidad en cada detalle
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>Innovación:</strong> Tecnología al servicio de mejores experiencias
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>Confianza:</strong> Relaciones transparentes y duraderas
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
