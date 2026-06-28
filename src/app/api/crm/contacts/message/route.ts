import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { contact_id, message, user_id } = body

        if (!contact_id || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // If user_id is provided, we save it as a mobile notification
            if (user_id) {
                await client.query(`
                    INSERT INTO notifications_sent (user_id, message, status, channel, notification_type, subject)
                    VALUES ($1, $2, 'pending', 'push', 'direct_message', 'Nuevo mensaje de tu Agente')
                `, [user_id, message])
            }

            // Also record the interaction in the CRM
            await client.query(`
                INSERT INTO crm_interactions (contact_id, interaction_type, notes)
                VALUES ($1, 'message', $2)
            `, [contact_id, message])
            
            // Update the contact's last interaction date
            await client.query(`
                UPDATE crm_contacts
                SET last_interaction_at = NOW(), last_contact_at = NOW()
                WHERE id = $1
            `, [contact_id])

            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
