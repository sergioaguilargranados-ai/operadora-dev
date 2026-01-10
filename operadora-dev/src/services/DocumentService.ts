/**
 * DocumentService.ts
 * Servicio para gestión de documentos sensibles
 *
 * Funcionalidades:
 * - Upload de documentos a Vercel Blob
 * - URLs firmadas con expiración
 * - Validación de tipo de archivo
 * - Compresión de imágenes
 * - Eliminación segura
 */

import { put, del, head } from '@vercel/blob'
import { EncryptionService } from './EncryptionService'

export interface UploadOptions {
  userId: number
  tenantId: number
  documentType: 'passport' | 'visa' | 'id' | 'driver_license' | 'other'
  fileName?: string
  metadata?: Record<string, string>
}

export interface DocumentRecord {
  id: string
  url: string
  fileName: string
  fileSize: number
  fileType: string
  documentType: string
  userId: number
  tenantId: number
  createdAt: string
  metadata?: Record<string, string>
}

export class DocumentService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]

  /**
   * Validar archivo antes de upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Archivo muy grande. Máximo ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Solo: JPG, PNG, WEBP, PDF`
      }
    }

    return { valid: true }
  }

  /**
   * Subir documento a Vercel Blob
   */
  static async uploadDocument(
    file: File | Buffer,
    options: UploadOptions
  ): Promise<DocumentRecord> {
    try {
      // Validar si es File
      if (file instanceof File) {
        const validation = this.validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
      }

      // Generar nombre único de archivo
      const timestamp = Date.now()
      const randomId = EncryptionService.generateToken(8)
      const extension = file instanceof File
        ? file.name.split('.').pop()
        : 'bin'

      const fileName = options.fileName ||
        `${options.documentType}_${options.userId}_${timestamp}_${randomId}.${extension}`

      // Generar path con estructura organizada
      const path = `documents/${options.tenantId}/${options.userId}/${options.documentType}/${fileName}`

      // Subir a Vercel Blob
      const blob = await put(path, file, {
        access: 'public', // Cambiar a 'private' si se requiere auth
        addRandomSuffix: false
      })

      console.log(`✅ Document uploaded: ${blob.url}`)

      // Crear registro de documento
      const documentRecord: DocumentRecord = {
        id: randomId,
        url: blob.url,
        fileName: fileName,
        fileSize: file instanceof File ? file.size : (file as Buffer).length,
        fileType: file instanceof File ? file.type : 'application/octet-stream',
        documentType: options.documentType,
        userId: options.userId,
        tenantId: options.tenantId,
        createdAt: new Date().toISOString(),
        metadata: options.metadata
      }

      return documentRecord

    } catch (error: any) {
      console.error('❌ Error uploading document:', error.message)
      throw new Error(`Error al subir documento: ${error.message}`)
    }
  }

  /**
   * Generar URL firmada con expiración
   * @param url - URL pública del blob
   * @param expiryMinutes - Minutos de validez (default: 60)
   */
  static generateSignedUrl(url: string, expiryMinutes: number = 60): string {
    const signature = EncryptionService.generateSignedUrl(url, expiryMinutes)
    return `/api/documents/view?sig=${encodeURIComponent(signature)}`
  }

  /**
   * Validar URL firmada
   */
  static validateSignedUrl(signature: string): {
    valid: boolean
    url: string | null
    expired: boolean
  } {
    const validation = EncryptionService.validateSignedUrl(signature)
    return {
      valid: validation.valid,
      url: validation.resourceId,
      expired: validation.expired
    }
  }

  /**
   * Eliminar documento de Vercel Blob
   */
  static async deleteDocument(url: string): Promise<boolean> {
    try {
      await del(url)
      console.log(`✅ Document deleted: ${url}`)
      return true
    } catch (error: any) {
      console.error('❌ Error deleting document:', error.message)
      return false
    }
  }

  /**
   * Obtener metadata de documento
   */
  static async getDocumentMetadata(url: string): Promise<{
    size: number
    uploadedAt: Date
    contentType: string
  } | null> {
    try {
      const metadata = await head(url)

      return {
        size: metadata.size,
        uploadedAt: metadata.uploadedAt,
        contentType: metadata.contentType || 'application/octet-stream'
      }
    } catch (error: any) {
      console.error('❌ Error getting document metadata:', error.message)
      return null
    }
  }

  /**
   * Validar si un documento existe
   */
  static async documentExists(url: string): Promise<boolean> {
    try {
      await head(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Generar thumbnail de imagen (placeholder - requiere servicio externo)
   */
  static generateThumbnailUrl(url: string, width: number = 200): string {
    // Placeholder - implementar con servicio como Cloudinary o Imgix
    // Por ahora retorna la URL original
    return url
  }

  /**
   * Extraer texto de documento con OCR (placeholder)
   * Requiere integración con Google Vision API o AWS Textract
   */
  static async extractText(url: string): Promise<string | null> {
    // TODO: Implementar OCR
    console.warn('⚠️ OCR not implemented yet')
    return null
  }

  /**
   * Validar documento de pasaporte con OCR (placeholder)
   */
  static async validatePassport(url: string): Promise<{
    valid: boolean
    data?: {
      number: string
      country: string
      expiryDate: string
      fullName: string
    }
    confidence?: number
  }> {
    // TODO: Implementar validación de pasaporte con OCR
    console.warn('⚠️ Passport validation not implemented yet')
    return { valid: false }
  }

  /**
   * Comprimir imagen antes de subir (placeholder)
   */
  static async compressImage(file: File, quality: number = 0.8): Promise<File> {
    // TODO: Implementar compresión de imagen
    // Por ahora retorna el archivo original
    console.warn('⚠️ Image compression not implemented yet')
    return file
  }

  /**
   * Sanitizar nombre de archivo
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }

  /**
   * Obtener extensión de archivo
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  /**
   * Verificar si es imagen
   */
  static isImage(fileType: string): boolean {
    return fileType.startsWith('image/')
  }

  /**
   * Verificar si es PDF
   */
  static isPDF(fileType: string): boolean {
    return fileType === 'application/pdf'
  }
}
