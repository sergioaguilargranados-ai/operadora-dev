"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Smartphone, Bell, MapPin, CreditCard, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AppInfoPage() {
  const router = useRouter()

  const features = [
    {
      icon: Bell,
      title: "Notificaciones en tiempo real",
      description: "Recibe alertas sobre tus reservas, cambios de vuelo y ofertas especiales"
    },
    {
      icon: MapPin,
      title: "Acceso offline",
      description: "Consulta tus reservas y itinerarios sin conexión a internet"
    },
    {
      icon: CreditCard,
      title: "Pagos seguros",
      description: "Guarda tus métodos de pago de forma segura para reservas más rápidas"
    },
    {
      icon: Shield,
      title: "Datos protegidos",
      description: "Tu información está encriptada con los más altos estándares de seguridad"
    },
    {
      icon: Zap,
      title: "Reservas ultrarrápidas",
      description: "Busca, compara y reserva en cuestión de segundos"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
            <Smartphone className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Descarga la app de AS Operadora
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lleva tus viajes contigo. Reserva, gestiona y disfruta desde tu móvil
          </p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-black hover:bg-gray-800">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="App Store"
                className="h-8"
              />
            </Button>
            <Button size="lg" className="bg-black hover:bg-gray-800">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-8"
              />
            </Button>
          </div>
        </div>

        {/* Preview de la app */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-blue-50 to-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Tu compañero de viaje perfecto
              </h2>
              <p className="text-muted-foreground mb-6">
                Gestiona todas tus reservas en un solo lugar. Recibe notificaciones
                importantes, accede a tus itinerarios sin conexión y descubre ofertas
                exclusivas para usuarios de la app.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Interfaz intuitiva y fácil de usar</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Sincronización en todos tus dispositivos</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Soporte al cliente 24/7</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-[2.5rem] flex items-center justify-center">
                  <Smartphone className="w-32 h-32 text-white opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Características */}
        <h2 className="text-3xl font-bold mb-8 text-center">
          Todo lo que necesitas para viajar mejor
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA final */}
        <Card className="p-12 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Descarga la app hoy y recibe un 10% de descuento en tu primera reserva
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Descargar para iOS
            </Button>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Descargar para Android
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
