import * as Speech from 'expo-speech'
import { Audio } from 'expo-av'
import { Platform, Alert } from 'react-native'

interface VoiceSearchResult {
    text: string
    confidence: number
}

class VoiceSearchService {
    private recording: Audio.Recording | null = null
    private isRecording = false

    /**
     * Verificar si el dispositivo soporta reconocimiento de voz
     */
    async isAvailable(): Promise<boolean> {
        try {
            const { status } = await Audio.requestPermissionsAsync()
            return status === 'granted'
        } catch (error) {
            console.error('Error checking voice search availability:', error)
            return false
        }
    }

    /**
     * Iniciar grabación de voz
     */
    async startRecording(): Promise<void> {
        try {
            const permission = await Audio.requestPermissionsAsync()

            if (permission.status !== 'granted') {
                Alert.alert(
                    'Permiso Requerido',
                    'Necesitamos acceso al micrófono para la búsqueda por voz'
                )
                return
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            })

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )

            this.recording = recording
            this.isRecording = true
        } catch (error) {
            console.error('Error starting recording:', error)
            Alert.alert('Error', 'No se pudo iniciar la grabación')
        }
    }

    /**
     * Detener grabación y procesar
     */
    async stopRecording(): Promise<VoiceSearchResult | null> {
        try {
            if (!this.recording) {
                return null
            }

            this.isRecording = false
            await this.recording.stopAndUnloadAsync()
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            })

            const uri = this.recording.getURI()
            this.recording = null

            if (!uri) {
                return null
            }

            // En producción, enviar el audio a un servicio de reconocimiento de voz
            // Por ahora, simulamos el resultado
            return await this.processAudio(uri)
        } catch (error) {
            console.error('Error stopping recording:', error)
            return null
        }
    }

    /**
     * Procesar audio y convertir a texto
     * En producción, usar Google Speech-to-Text, AWS Transcribe, etc.
     */
    private async processAudio(uri: string): Promise<VoiceSearchResult> {
        // Simulación - En producción, enviar a API de reconocimiento de voz
        // Ejemplo con Google Cloud Speech-to-Text:
        // const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         config: { languageCode: 'es-MX' },
        //         audio: { uri }
        //     })
        // })

        return {
            text: 'Hoteles en Cancún', // Texto simulado
            confidence: 0.95
        }
    }

    /**
     * Búsqueda por voz con feedback
     */
    async searchByVoice(onResult: (text: string) => void): Promise<void> {
        try {
            const available = await this.isAvailable()

            if (!available) {
                Alert.alert(
                    'No Disponible',
                    'La búsqueda por voz no está disponible en este dispositivo'
                )
                return
            }

            // Dar feedback de que está escuchando
            await Speech.speak('Escuchando...', {
                language: 'es-MX',
                pitch: 1.0,
                rate: 1.0,
            })

            await this.startRecording()

            // Esperar 3 segundos de grabación
            await new Promise(resolve => setTimeout(resolve, 3000))

            const result = await this.stopRecording()

            if (result && result.text) {
                // Confirmar lo que entendió
                await Speech.speak(`Buscando ${result.text}`, {
                    language: 'es-MX',
                })

                onResult(result.text)
            } else {
                await Speech.speak('No pude entender, intenta de nuevo', {
                    language: 'es-MX',
                })
            }
        } catch (error) {
            console.error('Error in voice search:', error)
            Alert.alert('Error', 'Hubo un problema con la búsqueda por voz')
        }
    }

    /**
     * Leer texto en voz alta (Text-to-Speech)
     */
    async speak(text: string, language: string = 'es-MX'): Promise<void> {
        try {
            await Speech.speak(text, {
                language,
                pitch: 1.0,
                rate: 0.9,
            })
        } catch (error) {
            console.error('Error speaking:', error)
        }
    }

    /**
     * Detener reproducción de voz
     */
    async stopSpeaking(): Promise<void> {
        try {
            await Speech.stop()
        } catch (error) {
            console.error('Error stopping speech:', error)
        }
    }

    /**
     * Verificar si está grabando
     */
    getIsRecording(): boolean {
        return this.isRecording
    }
}

export default new VoiceSearchService()
