"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactoPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Volver
        </Button>
        <h1 className="text-4xl font-bold mb-6">Contacto</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Teléfono</h3>
            <p className="text-sm">+52 55 1234 5678</p>
          </Card>
          <Card className="p-6 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm">contacto@asoperadora.com</p>
          </Card>
          <Card className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Oficina</h3>
            <p className="text-sm">CDMX, México</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
