import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function GET(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
    }

    console.log('🤖 Generando embeddings para chatbot...')

    const docs = await pool.query(`
      SELECT id, title, content
      FROM kb_documents
      WHERE embedding IS NULL OR embedding::text = '[0]'
    `)

    if (docs.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: '✅ Todos los embeddings ya están generados',
        updated: 0
      })
    }

    let updated = 0

    for (const doc of docs.rows) {
      console.log(`Procesando: ${doc.title}`)

      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: doc.content
      })

      await pool.query(`
        UPDATE kb_documents
        SET embedding = $1::vector
        WHERE id = $2
      `, [
        `[${embedding.data[0].embedding.join(',')}]`,
        doc.id
      ])

      updated++
      console.log(`   ✅ Embedding ${updated}/${docs.rows.length} guardado`)
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${updated} embeddings generados exitosamente`,
      updated,
      total: docs.rows.length
    })

  } catch (error: any) {
    console.error('Error generating embeddings:', error)
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 })
  }
}
