import * as Sharing from 'expo-sharing'
import { Share, Alert, Platform } from 'react-native'

export interface ShareOptions {
  title?: string
  message: string
  url?: string
}

class ShareService {
  /**
   * Verificar si compartir está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await Sharing.isAvailableAsync()
    } catch (error) {
      return false
    }
  }

  /**
   * Generar texto plano de itinerario
   */
  generateItineraryText(itinerary: any): string {
    let text = `✈️ ITINERARIO: ${itinerary.title || itinerary.destination || 'Viaje'}\n\n`
    if (itinerary.description) {
      text += `${itinerary.description}\n\n`
    }
    if (Array.isArray(itinerary.days)) {
      itinerary.days.forEach((d: any, i: number) => {
        text += `📅 Día ${d.day || i + 1}: ${d.title || ''}\n${d.description || d.desc || ''}\n\n`
      })
    }
    text += `Organizado por AS Operadora\nhttps://www.as-ope-viajes.company`
    return text
  }

  /**
   * Generar HTML de itinerario
   */
  generateItineraryHTML(itinerary: any): string {
    return `
      <html>
        <body>
          <h1>${itinerary.title || 'Itinerario de Viaje'}</h1>
          <p>${itinerary.description || ''}</p>
        </body>
      </html>
    `
  }

  /**
   * Compartir texto usando el share nativo
   */
  async shareText(text: string, title?: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message: text,
        title: title || 'Compartir',
      })
      return result.action === Share.sharedAction
    } catch (error) {
      console.error('Error sharing text:', error)
      return false
    }
  }

  /**
   * Compartir itinerario
   */
  async shareItinerary(itinerary: any): Promise<boolean> {
    const message = this.generateItineraryText(itinerary)
    return this.shareText(message, `Itinerario - ${itinerary.title || 'Viaje'}`)
  }

  /**
   * Compartir reserva
   */
  async shareBooking(booking: any): Promise<boolean> {
    const message = `¡He reservado mi viaje a ${booking.service_name || 'Destino'} con AS Operadora!\n\nReserva #${booking.id}`
    return this.shareText(message, 'Mi Reserva de Viaje')
  }

  /**
   * Compartir código de referido
   */
  async shareReferralCode(code: string, userName?: string): Promise<boolean> {
    const message = `${userName ? `${userName} te invita a viajar` : '¡Viaja con AS Operadora!'} Usa el código de beneficio: ${code}\nhttps://www.as-ope-viajes.company/registro?ref=${code}`
    return this.shareText(message, 'Código de Invitación')
  }
}

export default new ShareService()
