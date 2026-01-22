import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

class BiometricService {
    /**
     * Verificar si el dispositivo soporta biometría
     */
    async isAvailable(): Promise<boolean> {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync()
            const enrolled = await LocalAuthentication.isEnrolledAsync()
            return compatible && enrolled
        } catch (error) {
            console.error('Error checking biometric availability:', error)
            return false
        }
    }

    /**
     * Obtener tipo de biometría disponible
     */
    async getBiometricType(): Promise<string> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento Facial'
            }
            if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return Platform.OS === 'ios' ? 'Touch ID' : 'Huella Digital'
            }
            if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'Reconocimiento de Iris'
            }

            return 'Biometría'
        } catch (error) {
            console.error('Error getting biometric type:', error)
            return 'Biometría'
        }
    }

    /**
     * Autenticar con biometría
     */
    async authenticate(reason?: string): Promise<boolean> {
        try {
            const biometricType = await this.getBiometricType()
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason || `Autenticarse con ${biometricType}`,
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar contraseña',
            })

            return result.success
        } catch (error) {
            console.error('Error during biometric authentication:', error)
            return false
        }
    }

    /**
     * Guardar credenciales de forma segura para login biométrico
     */
    async saveCredentials(email: string, password: string): Promise<boolean> {
        try {
            await SecureStore.setItemAsync('biometric_email', email)
            await SecureStore.setItemAsync('biometric_password', password)
            await SecureStore.setItemAsync('biometric_enabled', 'true')
            return true
        } catch (error) {
            console.error('Error saving biometric credentials:', error)
            return false
        }
    }

    /**
     * Obtener credenciales guardadas
     */
    async getCredentials(): Promise<{ email: string; password: string } | null> {
        try {
            const email = await SecureStore.getItemAsync('biometric_email')
            const password = await SecureStore.getItemAsync('biometric_password')

            if (email && password) {
                return { email, password }
            }
            return null
        } catch (error) {
            console.error('Error getting biometric credentials:', error)
            return null
        }
    }

    /**
     * Verificar si el login biométrico está habilitado
     */
    async isBiometricLoginEnabled(): Promise<boolean> {
        try {
            const enabled = await SecureStore.getItemAsync('biometric_enabled')
            return enabled === 'true'
        } catch (error) {
            return false
        }
    }

    /**
     * Deshabilitar login biométrico
     */
    async disableBiometricLogin(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync('biometric_email')
            await SecureStore.deleteItemAsync('biometric_password')
            await SecureStore.deleteItemAsync('biometric_enabled')
        } catch (error) {
            console.error('Error disabling biometric login:', error)
        }
    }

    /**
     * Login con biometría
     */
    async loginWithBiometric(): Promise<{ email: string; password: string } | null> {
        try {
            // Verificar si está habilitado
            const enabled = await this.isBiometricLoginEnabled()
            if (!enabled) {
                return null
            }

            // Autenticar
            const authenticated = await this.authenticate('Inicia sesión con biometría')
            if (!authenticated) {
                return null
            }

            // Obtener credenciales
            return await this.getCredentials()
        } catch (error) {
            console.error('Error during biometric login:', error)
            return null
        }
    }
}

export default new BiometricService()
