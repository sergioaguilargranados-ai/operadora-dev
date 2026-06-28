import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { entity_type, entity_id, document_name, document_type, document_url, status = 'active' } = body

        if (!entity_type || !entity_id || !document_url || !document_type) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Check if there is already a document of this type for this entity
            const existing = await client.query(`
                SELECT id FROM entity_documents 
                WHERE entity_type = $1 AND entity_id = $2 AND document_type = $3
            `, [entity_type, entity_id, document_type])

            if (existing.rows.length > 0) {
                // Update
                await client.query(`
                    UPDATE entity_documents 
                    SET document_url = $4, document_name = $5, updated_at = NOW()
                    WHERE entity_type = $1 AND entity_id = $2 AND document_type = $3
                `, [entity_type, entity_id, document_type, document_url, document_name])
            } else {
                // Insert
                await client.query(`
                    INSERT INTO entity_documents (entity_type, entity_id, document_name, document_type, document_url, status)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [entity_type, entity_id, document_name, document_type, document_url, status])
            }

            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error saving document:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
