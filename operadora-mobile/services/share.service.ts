import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Platform, Alert } from 'react-native'

interface TripData {
    id: string
    title: string
    destination: string
    startDate: string
    endDate: string
    flights?: any[]
    hotels?: any[]
    activities?: any[]
    totalPrice: number
}

class ShareService {
    /**
     * Verificar si el dispositivo soporta compartir
     */
    async isAvailable(): Promise<boolean> {
        return await Sharing.isAvailableAsync()
    }

    /**
     * Compartir texto simple
     */
    async shareText(text: string, title?: string): Promise<boolean> {
        try {
            const available = await this.isAvailable()

            if (!available) {
                Alert.alert('No Disponible', 'Compartir no está disponible en este dispositivo')
                return false
            }

            // Crear archivo temporal con el texto
            const fileUri = `${FileSystem.cacheDirectory}share-${Date.now()}.txt`
            await FileSystem.writeAsStringAsync(fileUri, text)

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/plain',
                dialogTitle: title || 'Compartir',
                UTI: 'public.plain-text',
            })

            // Limpiar archivo temporal
            await FileSystem.deleteAsync(fileUri, { idempotent: true })

            return true
        } catch (error) {
            console.error('Error sharing text:', error)
            return false
        }
    }

    /**
     * Generar itinerario en formato texto
     */
    generateItineraryText(trip: TripData): string {
        let text = `🌍 ${trip.title}\n\n`
        text += `📍 Destino: ${trip.destination}\n`
        text += `📅 Fechas: ${trip.startDate} - ${trip.endDate}\n\n`

        if (trip.flights && trip.flights.length > 0) {
            text += `✈️ VUELOS:\n`
            trip.flights.forEach((flight, index) => {
                text += `${index + 1}. ${flight.airline} - ${flight.origin} → ${flight.destination}\n`
                text += `   Salida: ${flight.departure} | Llegada: ${flight.arrival}\n\n`
            })
        }

        if (trip.hotels && trip.hotels.length > 0) {
            text += `🏨 HOTELES:\n`
            trip.hotels.forEach((hotel, index) => {
                text += `${index + 1}. ${hotel.name}\n`
                text += `   ${hotel.location}\n`
                text += `   ${hotel.checkIn} - ${hotel.checkOut}\n\n`
            })
        }

        if (trip.activities && trip.activities.length > 0) {
            text += `🎯 ACTIVIDADES:\n`
            trip.activities.forEach((activity, index) => {
                text += `${index + 1}. ${activity.name}\n`
                text += `   ${activity.date} - ${activity.time}\n\n`
            })
        }

        text += `💰 Precio Total: $${trip.totalPrice.toLocaleString()}\n\n`
        text += `Reservado con AS Operadora\n`
        text += `https://asoperadora.com/trips/${trip.id}`

        return text
    }

    /**
     * Generar itinerario en formato HTML
     */
    generateItineraryHTML(trip: TripData): string {
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${trip.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #667eea;
        }
        .item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .item:last-child {
            border-bottom: none;
        }
        .price {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 ${trip.title}</h1>
        <p>📍 ${trip.destination}</p>
        <p>📅 ${trip.startDate} - ${trip.endDate}</p>
    </div>
`

        if (trip.flights && trip.flights.length > 0) {
            html += `
    <div class="section">
        <div class="section-title">✈️ Vuelos</div>
`
            trip.flights.forEach(flight => {
                html += `
        <div class="item">
            <strong>${flight.airline}</strong><br>
            ${flight.origin} → ${flight.destination}<br>
            Salida: ${flight.departure} | Llegada: ${flight.arrival}
        </div>
`
            })
            html += `    </div>\n`
        }

        if (trip.hotels && trip.hotels.length > 0) {
            html += `
    <div class="section">
        <div class="section-title">🏨 Hoteles</div>
`
            trip.hotels.forEach(hotel => {
                html += `
        <div class="item">
            <strong>${hotel.name}</strong><br>
            ${hotel.location}<br>
            ${hotel.checkIn} - ${hotel.checkOut}
        </div>
`
            })
            html += `    </div>\n`
        }

        html += `
    <div class="section">
        <div class="section-title">💰 Precio Total</div>
        <div class="price">$${trip.totalPrice.toLocaleString()}</div>
    </div>
    
    <div class="section" style="text-align: center; color: #666;">
        <p>Reservado con AS Operadora</p>
        <a href="https://asoperadora.com/trips/${trip.id}">Ver en línea</a>
    </div>
</body>
</html>
`
        return html
    }

    /**
     * Compartir itinerario de viaje
     */
    async shareTrip(trip: TripData, format: 'text' | 'html' = 'text'): Promise<boolean> {
        try {
            const available = await this.isAvailable()

            if (!available) {
                Alert.alert('No Disponible', 'Compartir no está disponible')
                return false
            }

            let fileUri: string
            let mimeType: string

            if (format === 'html') {
                const html = this.generateItineraryHTML(trip)
                fileUri = `${FileSystem.cacheDirectory}itinerario-${trip.id}.html`
                await FileSystem.writeAsStringAsync(fileUri, html)
                mimeType = 'text/html'
            } else {
                const text = this.generateItineraryText(trip)
                fileUri = `${FileSystem.cacheDirectory}itinerario-${trip.id}.txt`
                await FileSystem.writeAsStringAsync(fileUri, text)
                mimeType = 'text/plain'
            }

            await Sharing.shareAsync(fileUri, {
                mimeType,
                dialogTitle: `Compartir ${trip.title}`,
            })

            // Limpiar archivo temporal
            setTimeout(async () => {
                await FileSystem.deleteAsync(fileUri, { idempotent: true })
            }, 5000)

            return true
        } catch (error) {
            console.error('Error sharing trip:', error)
            Alert.alert('Error', 'No se pudo compartir el itinerario')
            return false
        }
    }

    /**
     * Compartir confirmación de reserva
     */
    async shareBookingConfirmation(
        bookingId: string,
        serviceName: string,
        confirmationCode: string
    ): Promise<boolean> {
        const text = `
✅ Reserva Confirmada

Servicio: ${serviceName}
Código de Confirmación: ${confirmationCode}
ID de Reserva: ${bookingId}

Reservado con AS Operadora
https://asoperadora.com/bookings/${bookingId}
`
        return await this.shareText(text, 'Confirmación de Reserva')
    }

    /**
     * Compartir oferta especial
     */
    async shareOffer(
        title: string,
        description: string,
        price: number,
        link: string
    ): Promise<boolean> {
        const text = `
🎉 ${title}

${description}

💰 Desde $${price.toLocaleString()}

Ver más: ${link}

Compartido desde AS Operadora
`
        return await this.shareText(text, title)
    }
}

export default new ShareService()
