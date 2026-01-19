import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import api from './api'

// Configuración global de notificaciones
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
})

const NotificationsService = {
    // Registrar para notificaciones push
    registerForPushNotificationsAsync: async () => {
        let token

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            })
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!')
                return
            }

            // Obtener el token
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id' // Debes configurar esto en app.json
            })).data

            console.log('Push Token:', token)

            // Enviar token al backend para asociarlo al usuario
            try {
                await api.post('/users/push-token', { token })
            } catch (error) {
                // Silently fail if backend endpoint doesn't exist yet
                console.log('Error saving push token', error)
            }
        } else {
            console.log('Must use physical device for Push Notifications')
        }

        return token
    },

    // Programar una notificación local (demo)
    scheduleNotification: async (title: string, body: string, seconds: number = 1) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: { seconds },
        })
    }
}

export default NotificationsService
