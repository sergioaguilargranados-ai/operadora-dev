import { query } from '@/lib/db'

/**
 * Servicio para gestión de notificaciones push
 * Soporta FCM (Firebase Cloud Messaging) para iOS y Android
 */
export class PushNotificationService {
    /**
     * Obtener todos los tokens activos de un usuario
     */
    static async getUserDeviceTokens(userId: number, platform?: 'ios' | 'android' | 'web') {
        try {
            let sql = `
        SELECT device_token, platform, device_name, app_version
        FROM device_tokens
        WHERE user_id = $1 AND is_active = true
      `
            const params: any[] = [userId]

            if (platform) {
                sql += ' AND platform = $2'
                params.push(platform)
            }

            const result = await query(sql, params)
            return result.rows
        } catch (error) {
            console.error('Error getting user device tokens:', error)
            return []
        }
    }

    /**
     * Enviar notificación push a un usuario específico
     * NOTA: Requiere configuración de FCM (Firebase Cloud Messaging)
     */
    static async sendToUser(
        userId: number,
        notification: {
            title: string
            body: string
            data?: Record<string, any>
        },
        platform?: 'ios' | 'android' | 'web'
    ) {
        try {
            const tokens = await this.getUserDeviceTokens(userId, platform)

            if (tokens.length === 0) {
                console.warn(`No active device tokens found for user ${userId}`)
                return { success: false, message: 'No active devices' }
            }

            // TODO: Integrar con FCM (Firebase Cloud Messaging)
            // Por ahora solo registramos la intención
            console.log(`[PUSH NOTIFICATION] To user ${userId}:`, {
                notification,
                deviceCount: tokens.length,
                platforms: [...new Set(tokens.map(t => t.platform))]
            })

            // Aquí iría la integración con FCM:
            // const admin = require('firebase-admin')
            // const message = {
            //   notification: {
            //     title: notification.title,
            //     body: notification.body
            //   },
            //   data: notification.data || {},
            //   tokens: tokens.map(t => t.device_token)
            // }
            // const response = await admin.messaging().sendMulticast(message)

            return {
                success: true,
                message: 'Notification queued',
                deviceCount: tokens.length
            }
        } catch (error) {
            console.error('Error sending push notification:', error)
            throw error
        }
    }

    /**
     * Enviar notificación a múltiples usuarios
     */
    static async sendToMultipleUsers(
        userIds: number[],
        notification: {
            title: string
            body: string
            data?: Record<string, any>
        }
    ) {
        const results = await Promise.allSettled(
            userIds.map(userId => this.sendToUser(userId, notification))
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        return {
            success: true,
            total: userIds.length,
            successful,
            failed
        }
    }

    /**
     * Enviar notificación de prueba
     */
    static async sendTestNotification(userId: number) {
        return this.sendToUser(userId, {
            title: '🎉 Notificación de Prueba',
            body: 'Tu dispositivo está correctamente registrado para recibir notificaciones',
            data: {
                type: 'test',
                timestamp: new Date().toISOString()
            }
        })
    }

    /**
     * Limpiar tokens inactivos (tokens que no se han usado en X días)
     */
    static async cleanupInactiveTokens(daysInactive: number = 90) {
        try {
            const result = await query(
                `UPDATE device_tokens 
         SET is_active = false 
         WHERE is_active = true 
           AND (last_used_at IS NULL OR last_used_at < NOW() - INTERVAL '${daysInactive} days')
         RETURNING id`,
                []
            )

            return {
                success: true,
                deactivated: result.rows.length
            }
        } catch (error) {
            console.error('Error cleaning up inactive tokens:', error)
            throw error
        }
    }
}

export default PushNotificationService
