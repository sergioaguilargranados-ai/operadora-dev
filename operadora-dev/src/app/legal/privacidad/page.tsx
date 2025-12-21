"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacidadPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-4xl font-bold mb-4">Aviso de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: Diciembre de 2025
        </p>

        <div className="space-y-6 prose prose-blue max-w-none">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AVISO DE PRIVACIDAD</h2>
            <p className="text-muted-foreground leading-relaxed">
              A través del presente AVISO DE PRIVACIDAD, AS Operadora de Viajes y Eventos, S.A. de C.V., persona moral constituida bajo la legislación aplicable en territorio nacional y con domicilio en <strong>Paseo San Pedro 321, Colonia San Carlos, Metepec, C.P. 52159, en Estado de México</strong>, informa que será la responsable del tratamiento de sus datos personales.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Para cualquier duda relacionada con la protección de sus datos personales podrá contactar con la empresa en la dirección de correo electrónico <a href="mailto:info@asoperadora.com" className="text-blue-600 hover:underline">info@asoperadora.com</a>, y al número <a href="tel:+527225187558" className="text-blue-600 hover:underline">+52 722 518 7558</a>.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RESPONSABLE DEL TRATAMIENTO DE SUS DATOS PERSONALES</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para la empresa la seguridad del titular es nuestra prioridad, por lo que protegemos sus datos personales mediante el uso, aplicación y mantenimiento de altas medidas de seguridad técnicas, físicas y administrativas, teniendo el titular la certeza que sus datos personales estaran protegidos y serán tratados de manera confidencial.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">DATOS PERSONALES QUE PUEDEN SER RECOLECTADOS</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los datos personales que la empresa puede recopilar del titular al momento de celebrar cualquier relación comercial o laboral son, de manera enunciativa más no limitativa:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Datos de identificación</li>
              <li>Datos de contacto</li>
              <li>Datos de ubicación</li>
              <li>Datos financieros</li>
              <li>Datos fiscales</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">DATOS PERSONALES SENSIBLES</h2>
            <p className="text-muted-foreground leading-relaxed">
              Serán considerados como datos personales sensibles aquellos dispuestos por la Ley Federal de Protección de Datos en Posesión de los Particulares, que de forma enunciativa más no limitativa, son los datos que forman parte de la intimidad del personal y cuya divulgación pone en riesgo o da origen a discriminación por aspectos de origen racial o étnico, estado de salud, información genética, creencias religiosas, filosóficas o morales, afiliación sindical, opiniones políticas y preferencias sexuales.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">FINALIDADES DEL TRATAMIENTO DE SUS DATOS PERSONALES</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los datos personales que la empresa recabe serán utilizados para atender las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Personalización de documentos respecto de los servicios adquiridos</li>
              <li>Registro como cliente o empleado de la Empresa</li>
              <li>Integrar expedientes, bases de datos y sistemas necesarios</li>
              <li>Envío de cotizaciones sobre los servicios solicitados</li>
              <li>Realizar reservas de viajes, boletos de avión, medios de transporte, hoteles</li>
              <li>Realizar trámites de visa, permisos y autorizaciones</li>
              <li>Gestionar y dar seguimiento a sus reservaciones</li>
              <li>Procesar pagos y aclaraciones</li>
              <li>Realizar gestiones de facturación</li>
              <li>Dar cumplimiento a las obligaciones derivadas de la relación jurídica</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Finalidades secundarias:</strong> Mercadotecnia, publicidad y prospección comercial, oferta de productos y servicios propios de la empresa, enviar promociones de bienes y servicios.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">OPCIONES Y MEDIOS PARA LIMITAR EL USO O DIVULGACIÓN DE LOS DATOS</h2>
            <p className="text-muted-foreground leading-relaxed">
              La empresa tiene implementadas medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales. El titular podrá limitar el uso o divulgación de sus datos personales enviando un correo electrónico a <a href="mailto:info@asoperadora.com" className="text-blue-600 hover:underline">info@asoperadora.com</a>, indicando su nombre completo y qué dato desea que no sea divulgado.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">TRANSFERENCIA DE DATOS DEL TITULAR</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              La empresa podrá transferir datos del titular a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Terceros prestadores de servicios y socios comerciales</li>
              <li>Aseguradoras o personas morales para servicios de atención médica</li>
              <li>Empresas afiliadas, subsidiarias y/o entidades controladoras</li>
              <li>Autoridades competentes en los casos previstos por la normatividad</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">DERECHOS DE ACCESO, RECTIFICACIÓN, CANCELACIÓN U OPOSICIÓN (DERECHOS ARCO)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Para ejercer los Derechos ARCO, el titular debe presentar su solicitud a:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">Correo electrónico:</p>
              <p className="text-blue-700"><a href="mailto:info@asoperadora.com">info@asoperadora.com</a></p>
              <p className="text-sm font-semibold text-blue-900 mt-2">Domicilio:</p>
              <p className="text-blue-700">Paseo San Pedro 321, Colonia San Carlos, Metepec, C.P. 52159, Estado de México</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La empresa tendrá 20 días hábiles desde la recepción de su petición completa para notificar la procedencia de su solicitud. En caso de ser positivo, se implementará en un plazo máximo de 15 días siguientes.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">USO DE TECNOLOGÍAS - COOKIES</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              La empresa utiliza diferentes tipos de cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
              <li><strong>Cookies de preferencias:</strong> Recordar sus opciones y configuraciones</li>
              <li><strong>Cookies de rendimiento:</strong> Mejorar el servicio mediante análisis estadístico</li>
              <li><strong>Cookies publicitarias:</strong> Personalizar la publicidad mostrada</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              El titular puede deshabilitar o ajustar el uso de cookies siguiendo los procedimientos del navegador de internet que utiliza.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">MODIFICACIONES AL AVISO DE PRIVACIDAD</h2>
            <p className="text-muted-foreground leading-relaxed">
              El presente aviso de privacidad puede sufrir modificaciones derivadas de nuevos requerimientos legales, necesidades propias de la relación comercial, cambios en nuestro modelo de negocio, u otras causas. Cualquier modificación será notificada por escrito, correo electrónico o mensaje telefónico.
            </p>
          </Card>

          <Card className="p-6 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">Contacto</h3>
            <p className="text-blue-700">AS Operadora de Viajes y Eventos, S.A. de C.V.</p>
            <p className="text-blue-700">Paseo San Pedro 321, Colonia San Carlos</p>
            <p className="text-blue-700">Metepec, C.P. 52159, Estado de México</p>
            <p className="text-blue-700 mt-2">Email: <a href="mailto:info@asoperadora.com" className="underline">info@asoperadora.com</a></p>
            <p className="text-blue-700">Tel: <a href="tel:+527225187558" className="underline">+52 722 518 7558</a></p>
          </Card>
        </div>
      </div>
    </div>
  )
}
