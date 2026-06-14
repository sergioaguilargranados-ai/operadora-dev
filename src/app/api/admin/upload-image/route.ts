import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check if we have Blob token (standard or custom 'b_' prefix)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.b_READ_WRITE_TOKEN;
    const hasBlobToken = !!blobToken;

    if (hasBlobToken) {
      // Upload to Vercel Blob
      const blob = await put(`tours/${Date.now()}-${file.name.replace(/\s+/g, '_')}`, file, {
        access: 'public',
        token: blobToken,
      })
      return NextResponse.json({ success: true, url: blob.url })
    } else {
      // Fallback to local /public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (e) {}

      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const filePath = path.join(uploadDir, uniqueName)
      
      await writeFile(filePath, buffer)
      
      return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` })
    }

  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen', details: error.message, hasToken: !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.b_READ_WRITE_TOKEN) },
      { status: 500 }
    )
  }
}
