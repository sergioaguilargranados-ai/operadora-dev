import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function POST(request: Request) {
  try {
    const { user_id, name, file_url } = await request.json()

    if (!user_id || !name || !file_url) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Verificar si ya existe un documento con ese nombre para ese usuario
      const existing = await client.query(
        `SELECT id FROM entity_documents WHERE entity_type = 'user' AND entity_id = $1 AND title = $2`,
        [user_id, name]
      )

      if (existing.rows.length > 0) {
        // Actualizar
        await client.query(
          `UPDATE entity_documents SET document_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [file_url, existing.rows[0].id]
        )
      } else {
        // Insertar
        await client.query(
          `INSERT INTO entity_documents (entity_type, entity_id, title, document_type, document_url, created_at)
           VALUES ('user', $1, $2, 'file', $3, CURRENT_TIMESTAMP)`,
          [user_id, name, file_url]
        )
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
