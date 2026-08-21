import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * POST /api/upload/blob
 * Subir archivos (imágenes, PDFs, documentos) a Vercel Blob con fallback local
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'agencies'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.b_READ_WRITE_TOKEN

    if (blobToken) {
      // Subida a Vercel Blob en producción
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const blob = await put(`${folder}/${Date.now()}-${sanitizedName}`, file, {
        access: 'public',
        token: blobToken,
      })
      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: file.name,
        size: file.size
      })
    } else {
      // Fallback para desarrollo local
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)

      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (e) {}

      const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)

      return NextResponse.json({
        success: true,
        url: `/uploads/${folder}/${uniqueName}`,
        fileName: file.name,
        size: file.size
      })
    }
  } catch (error: any) {
    console.error('Error uploading file to blob:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir archivo', details: error.message },
      { status: 500 }
    )
  }
}
