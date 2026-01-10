"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TerminosPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-4xl font-bold mb-4">Términos y Condiciones de Venta</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: Diciembre de 2025
        </p>

        <div className="space-y-6 prose prose-blue max-w-none">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">TÉRMINOS Y CONDICIONES</h2>
            <p className="text-muted-foreground leading-relaxed">
              EL CLIENTE reconoce que la sociedad denominada <strong>AS OPERADORA DE VIAJES Y EVENTOS SOCIEDAD ANÓNIMA DE CAPITAL VARIABLE</strong> (en lo sucesivo AS OPERADORA DE VIAJES Y EVENTOS o sus subsidiarias, filiales, controladoras o representantes) actúa como comercializadora de servicios turísticos nacionales y del extranjero, así como intermediaria entre usuarios-turistas y de otros prestadores de servicios turísticos entre sí.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Los servicios incluyen la comercialización de paquetes turísticos, servicios turísticos, paquetes de viajes a través de medios electrónicos, portales digitales, páginas web, e-commerce, realizar reservaciones, integración, desarrollo, operación y compraventa de paquetes tursticos, tanto de transporte aéreo, terrestre, marítimo por cuenta propia o de terceros.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RESPONSABILIDAD</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los servicios serán proporcionados por prestadores independientes que no actúan por o en representación de AS OPERADORA DE VIAJES Y EVENTOS. EL CLIENTE acepta expresamente que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Ni AS OPERADORA ni sus subsidiarias tienen injerencia en la prestación de los servicios contratados</li>
              <li>Libera a AS OPERADORA de responsabilidad por incumplimientos de terceros prestadores</li>
              <li>No se responsabiliza por daños, perjuicios, pérdidas o gastos generados por los servicios contratados</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RESERVACIONES Y DEPÓSITOS</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                <strong>Toda reservación de hotel, paquetes, vuelos, expedición de boletos, traslados, guías y demás son NO REEMBOLSABLES.</strong>
              </p>
              <p className="leading-relaxed">
                Para reservar paquetes se requiere un depósito que puede variar de acuerdo con el operador, destino o temporada. Los depósitos no son reembolsables en caso de cualquier cancelación.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">BOLETOS DE AVIÓN</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los boletos de aión de cualquier categoría son:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>No reembolsables</strong></li>
              <li><strong>No endosables</strong></li>
              <li><strong>No transferibles</strong> (no se aceptan cambios de nombres)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Todas las aerolíneas se reservan el derecho de sobrevender, cambiar horarios, cancelar o realizar cambios sin previo aviso y sin responsabilidad de AS OPERADORA. Esto está autorizado gubernamentalmente.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RESTRICCIONES Y DOCUMENTACIÓN</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                Todas las líneas aéreas y navieras tienen restricciones diferentes para que viajen:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Menores de 18 años</li>
                <li>Mujeres embarazadas</li>
                <li>Personas que utilicen bastón o silla de ruedas</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Es responsabilidad del CLIENTE consultar las restricciones aplicables.</strong>
              </p>
              <p className="leading-relaxed mt-3">
                Todos los viajeros deberán contar con la documentación necesaria: pasaportes vigentes, visas, etc. Los problemas por incumplimiento son responsabilidad del cliente.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">CAUSAS DE FUERZA MAYOR</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los cambios o cancelación de viajes ocasionados por huracanes, ciclones, terremotos o cualquier otra causa de fuerza mayor son ajenos a AS OPERADORA. Quedarn sujetos a las políticas de la línea aérea, transportista u operador para cancelación o cambios de itinerario.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">PRECIOS - NO INCLUYEN</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los precios NO incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Gastos de visado de entrada a cualquier país</li>
              <li>Gastos de tramitación de pasaportes</li>
              <li>Propinas de tipo personal</li>
              <li>Traslados no especificados en el itinerario</li>
              <li>Exceso de equipaje</li>
              <li>Gastos extras no especificados</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">POLÍTICAS DE RESERVACIÓN</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Las tarifas son válidas al momento de la cotización</li>
              <li>Para asegurar tarifa se debe generar apartado o depósito completo</li>
              <li>Puede existir variación por cambio de disponibilidad o tipo de cambio</li>
              <li>Reserva válida solo cuando un experto confirme el servicio</li>
              <li>Número de confirmación enviado después del pago</li>
              <li>Reservaciones sujetas a disponibilidad</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">POLÍTICAS DE PAGO</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                Aceptamos: <strong>Visa, Mastercard y American Express</strong>
              </p>
              <p className="leading-relaxed">
                Los pagos se reciben en <strong>Moneda Nacional (MXN)</strong>. Otros tipos de moneda serán convertidos al tipo de cambio vigente. AS OPERADORA no es responsable de fluctuaciones internacionales o comisiones bancarias.
              </p>
              <p className="leading-relaxed">
                <strong>Facturación:</strong> Solo se podrá facturar en el mismo mes que se contrata el servicio.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">POLÍTICAS DE CANCELACIÓN</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Las cancelaciones deben informarse por escrito a través de correo electrónico. Las políticas varían según el servicio contratado.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg mt-3">
              <p className="text-sm font-semibold text-yellow-900">IMPORTANTE:</p>
              <p className="text-yellow-700">AS OPERADORA actúa como intermediario. Las políticas específicas dependen de cada proveedor.</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">HOTELES</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Políticas específicas para cada hotel (consultar al reservar)</li>
              <li>Precios por habitación con régimen de comidas solicitado</li>
              <li>Hora de ingreso: 15:00 hrs / Hora de salida: 10:00 hrs</li>
              <li>Posible cambio de hotel por disponibilidad (categoría similar)</li>
              <li>Estancia adicional debe solicitarse directamente con el hotel</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">TRANSPORTACIÓN TERRESTRE Y TOURS</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">Políticas específicas para cada servicio:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Cancelaciones antes de la fecha del servicio: cargo sobre monto total</li>
                <li>No presentarse al servicio: NO reembolsable</li>
              </ul>
              <p className="leading-relaxed mt-3">
                La Agencia se reserva el derecho de modificar itinerarios si es imprescindible para mejor organización o por fuerza mayor.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">SERVICIOS AÉREOS</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Tasas de aeropuerto NO incluidas en paquetes</li>
              <li>Tarifas por persona (puede o no incluir impuestos)</li>
              <li>Polticas de cancelación y penalización entran en vigor al emitir boletos</li>
              <li>Políticas varían según línea aérea</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">FUNDAMENTO LEGAL</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Estos términos se establecen de acuerdo a los artículos 1794 al 1859 del Código Civil Federal, artículos 89 al 95 del Código de Comercio, artículos 76 bis y 76 bis 1 de la Ley Federal de Protección al Consumidor y bajo la recomendación de la Norma Mexicana NMX-COE-001-SCFI-2018.
            </p>
          </Card>

          <Card className="p-6 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">Contacto</h3>
            <p className="text-blue-700">AS Operadora de Viajes y Eventos, S.A. de C.V.</p>
            <p className="text-blue-700">Paseo San Pedro 321, Colonia San Carlos</p>
            <p className="text-blue-700">Metepec, C.P. 52159, Estado de México</p>
            <p className="text-blue-700 mt-2">Web: <a href="http://www.asoperadora.com" className="underline" target="_blank" rel="noopener noreferrer">www.asoperadora.com</a></p>
            <p className="text-blue-700">Email: <a href="mailto:info@asoperadora.com" className="underline">info@asoperadora.com</a></p>
            <p className="text-blue-700">Tel: <a href="tel:+527225187558" className="underline">+52 722 518 7558</a></p>
          </Card>
        </div>
      </div>
    </div>
  )
}
