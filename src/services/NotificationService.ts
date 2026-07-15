import { CommunicationService } from './CommunicationService'
import { query } from '@/lib/db'

export interface NotifyUserOptions {
  userId: number;
  title: string;
  body: string;
  type?: 'alert' | 'notification' | 'message';
  referenceType?: string;
  referenceId?: number;
  isImportant?: boolean;
}

export class NotificationService {
  /**
   * Envía una notificación automática a un usuario usando el sistema de mensajería
   * Esto creará un hilo de notificación interna o utilizará uno existente
   */
  static async notifyUser({
    userId,
    title,
    body,
    type = 'notification',
    referenceType,
    referenceId,
    isImportant = false
  }: NotifyUserOptions) {
    try {
      // Usar ID 0 o 1 como remitente de "Sistema"
      const systemAgentId = 1; 

      // Para mantener limpio el centro de comunicación, agrupamos notificaciones de sistema
      // en un hilo general por usuario, a menos que tenga una referencia específica.
      
      let threadId = null;
      
      // Buscar si ya existe un hilo de notificaciones para esto
      let threadQuery = `
        SELECT id FROM communication_threads 
        WHERE client_id = $1 AND thread_type = 'system_alert'
      `;
      let queryParams: any[] = [userId];

      if (referenceType && referenceId) {
        threadQuery += ` AND reference_type = $2 AND reference_id = $3`;
        queryParams.push(referenceType, referenceId);
      } else {
        threadQuery += ` AND reference_type IS NULL`;
      }
      
      threadQuery += ` LIMIT 1`;
      
      const existingThread = await query(threadQuery, queryParams);
      
      if (existingThread.rows.length > 0) {
        threadId = existingThread.rows[0].id;
      } else {
        // Crear el hilo de notificaciones
        const thread = await CommunicationService.createThread({
          client_id: userId,
          subject: title,
          thread_type: 'system_alert',
          reference_type: referenceType,
          reference_id: referenceId,
          assigned_agent_id: systemAgentId,
          priority: isImportant ? 'high' : 'normal',
          tenant_id: 1
        });
        threadId = thread.id;
      }

      // Enviar el mensaje usando el CommunicationService
      // Al ser un mensaje de sistema, sender_type = 'system'
      const message = await CommunicationService.sendMessage({
        thread_id: threadId,
        sender_id: systemAgentId,
        sender_type: 'system',
        sender_name: 'AS Operadora',
        subject: title,
        body: body,
        message_type: type,
        is_internal: false,
        requires_response: false,
        requires_moderation: false,
        tenant_id: 1
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('[NotificationService] Error enviando notificación a usuario:', error);
      return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
