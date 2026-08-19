import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import api from './api'

// Configuración global de notificaciones Expo SDK 54 (solo en native)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

const NotificationsService = {
  // Registrar para notificaciones push
  registerForPushNotificationsAsync: async () => {
    if (Platform.OS === 'web') return null

    let token: string | null = null

    try {
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
          return null
        }

        // Obtener el token de forma segura
        try {
          const tokenResponse = await Notifications.getExpoPushTokenAsync()
          token = tokenResponse.data
        } catch (error) {
          // Expo Go SDK 54 requires standalone build for push tokens
          return null
        }

        // Enviar token al backend
        if (token) {
          try {
            await api.post('/users/push-token', { push_token: token, platform: Platform.OS })
          } catch (error) {}
        }
      }
    } catch (e) {
      // silent
    }

    return token
  },

  // Programar una notificación local
  scheduleNotification: async (title: string, body: string, seconds: number = 1) => {
    if (Platform.OS === 'web') return

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        },
      })
    } catch (e) {}
  },
}

export default NotificationsService
