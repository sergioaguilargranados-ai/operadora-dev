import * as Linking from 'expo-linking'
import { Platform, Alert } from 'react-native'

interface BoardingPassData {
    passengerName: string
    flightNumber: string
    airline: string
    origin: string
    destination: string
    departureTime: string
    arrivalTime: string
    seat: string
    gate: string
    boardingTime: string
    confirmationCode: string
    barcode?: string
}

class WalletService {
    /**
     * Verificar si el dispositivo soporta Wallet
     */
    async isWalletAvailable(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            // En iOS siempre está disponible (Apple Wallet)
            return true
        } else if (Platform.OS === 'android') {
            // En Android verificar si Google Pay está instalado
            try {
                const canOpen = await Linking.canOpenURL('googlepay://')
                return canOpen
            } catch {
                return false
            }
        }
        return false
    }

    /**
     * Agregar boarding pass a Apple Wallet (iOS)
     */
    async addToAppleWallet(passData: BoardingPassData, passUrl: string): Promise<boolean> {
        try {
            if (Platform.OS !== 'ios') {
                throw new Error('Apple Wallet solo está disponible en iOS')
            }

            // El backend debe generar un archivo .pkpass
            // passUrl es la URL del archivo .pkpass generado por el backend
            const canOpen = await Linking.canOpenURL(passUrl)

            if (canOpen) {
                await Linking.openURL(passUrl)
                return true
            } else {
                throw new Error('No se puede abrir el pase')
            }
        } catch (error) {
            console.error('Error adding to Apple Wallet:', error)
            Alert.alert('Error', 'No se pudo agregar el pase a Apple Wallet')
            return false
        }
    }

    /**
     * Agregar boarding pass a Google Pay (Android)
     */
    async addToGooglePay(passData: BoardingPassData, jwtToken: string): Promise<boolean> {
        try {
            if (Platform.OS !== 'android') {
                throw new Error('Google Pay solo está disponible en Android')
            }

            // El backend debe generar un JWT token para Google Pay
            // jwtToken es el token generado por el backend
            const saveUrl = `https://pay.google.com/gp/v/save/${jwtToken}`

            const canOpen = await Linking.canOpenURL(saveUrl)

            if (canOpen) {
                await Linking.openURL(saveUrl)
                return true
            } else {
                throw new Error('No se puede abrir Google Pay')
            }
        } catch (error) {
            console.error('Error adding to Google Pay:', error)
            Alert.alert('Error', 'No se pudo agregar el pase a Google Pay')
            return false
        }
    }

    /**
     * Agregar boarding pass al wallet correspondiente según la plataforma
     */
    async addBoardingPass(passData: BoardingPassData, passUrl: string, jwtToken?: string): Promise<boolean> {
        try {
            const available = await this.isWalletAvailable()

            if (!available) {
                Alert.alert(
                    'Wallet no disponible',
                    'Tu dispositivo no tiene Wallet configurado. Puedes descargar el pase en PDF.'
                )
                return false
            }

            if (Platform.OS === 'ios') {
                return await this.addToAppleWallet(passData, passUrl)
            } else if (Platform.OS === 'android') {
                if (!jwtToken) {
                    throw new Error('JWT token requerido para Google Pay')
                }
                return await this.addToGooglePay(passData, jwtToken)
            }

            return false
        } catch (error) {
            console.error('Error adding boarding pass:', error)
            return false
        }
    }

    /**
     * Generar URL de descarga de PDF del boarding pass
     */
    generatePdfUrl(bookingId: string, apiUrl: string): string {
        return `${apiUrl}/bookings/${bookingId}/boarding-pass/pdf`
    }

    /**
     * Descargar boarding pass como PDF
     */
    async downloadBoardingPassPdf(bookingId: string, apiUrl: string): Promise<void> {
        try {
            const pdfUrl = this.generatePdfUrl(bookingId, apiUrl)
            const canOpen = await Linking.canOpenURL(pdfUrl)

            if (canOpen) {
                await Linking.openURL(pdfUrl)
            } else {
                Alert.alert('Error', 'No se pudo descargar el pase')
            }
        } catch (error) {
            console.error('Error downloading PDF:', error)
            Alert.alert('Error', 'No se pudo descargar el pase en PDF')
        }
    }

    /**
     * Mostrar opciones para agregar/descargar boarding pass
     */
    async showBoardingPassOptions(
        passData: BoardingPassData,
        bookingId: string,
        apiUrl: string,
        passUrl?: string,
        jwtToken?: string
    ): Promise<void> {
        const available = await this.isWalletAvailable()
        const walletName = Platform.OS === 'ios' ? 'Apple Wallet' : 'Google Pay'

        const buttons: any[] = [
            {
                text: 'Descargar PDF',
                onPress: () => this.downloadBoardingPassPdf(bookingId, apiUrl),
            },
        ]

        if (available && (passUrl || jwtToken)) {
            buttons.unshift({
                text: `Agregar a ${walletName}`,
                onPress: () => this.addBoardingPass(passData, passUrl || '', jwtToken),
            })
        }

        buttons.push({
            text: 'Cancelar',
            style: 'cancel',
        })

        Alert.alert(
            'Pase de Abordar',
            'Selecciona una opción:',
            buttons
        )
    }
}

export default new WalletService()
