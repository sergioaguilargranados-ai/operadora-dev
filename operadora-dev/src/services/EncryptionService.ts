/**
 * EncryptionService.ts
 * Servicio para encriptación y desencriptación de datos sensibles
 *
 * Funcionalidades:
 * - Encriptación AES-256
 * - Desencriptación segura
 * - Hashing de datos
 * - Generación de tokens seguros
 */

import CryptoJS from 'crypto-js'
import { randomBytes } from 'crypto'

export class EncryptionService {
  private static secretKey: string = process.env.ENCRYPTION_SECRET_KEY || ''

  /**
   * Verificar que la clave de encriptación esté configurada
   */
  private static checkKey(): void {
    if (!this.secretKey || this.secretKey.length < 32) {
      throw new Error('ENCRYPTION_SECRET_KEY no configurada o muy corta (mínimo 32 caracteres)')
    }
  }

  /**
   * Encriptar datos con AES-256
   * @param data - Datos a encriptar (string, número, objeto)
   * @returns String encriptado en formato Base64
   */
  static encrypt(data: string | number | object): string {
    this.checkKey()

    try {
      // Convertir a string si es necesario
      const dataString = typeof data === 'string' ? data : JSON.stringify(data)

      // Encriptar con AES-256
      const encrypted = CryptoJS.AES.encrypt(dataString, this.secretKey).toString()

      return encrypted

    } catch (error: any) {
      console.error('❌ Error encriptando datos:', error.message)
      throw new Error('Error al encriptar datos')
    }
  }

  /**
   * Desencriptar datos
   * @param encryptedData - String encriptado
   * @returns Datos desencriptados
   */
  static decrypt(encryptedData: string): string {
    this.checkKey()

    try {
      // Desencriptar con AES-256
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey)
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

      if (!decryptedString) {
        throw new Error('Datos corruptos o clave incorrecta')
      }

      return decryptedString

    } catch (error: any) {
      console.error('❌ Error desencriptando datos:', error.message)
      throw new Error('Error al desencriptar datos')
    }
  }

  /**
   * Desencriptar y parsear JSON
   */
  static decryptJSON<T>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData)
    return JSON.parse(decrypted) as T
  }

  /**
   * Hash de datos (SHA-256)
   * Útil para comparar datos sin almacenar el original
   */
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString()
  }

  /**
   * Generar token aleatorio seguro
   * @param length - Longitud del token (default: 32)
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex')
  }

  /**
   * Encriptar número de tarjeta de crédito
   * Almacena solo los últimos 4 dígitos sin encriptar
   */
  static encryptCreditCard(cardNumber: string): {
    encrypted: string
    lastFour: string
    hash: string
  } {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    const lastFour = cleanNumber.slice(-4)
    const encrypted = this.encrypt(cleanNumber)
    const hash = this.hash(cleanNumber)

    return {
      encrypted,
      lastFour,
      hash
    }
  }

  /**
   * Encriptar datos de pasaporte
   */
  static encryptPassport(passportData: {
    number: string
    country: string
    expiryDate: string
    fullName: string
  }): string {
    return this.encrypt(passportData)
  }

  /**
   * Desencriptar datos de pasaporte
   */
  static decryptPassport(encryptedData: string): {
    number: string
    country: string
    expiryDate: string
    fullName: string
  } {
    return this.decryptJSON(encryptedData)
  }

  /**
   * Enmascarar datos sensibles para mostrar en UI
   * Ejemplo: "1234567890" -> "******7890"
   */
  static mask(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return data
    }

    const masked = '*'.repeat(data.length - visibleChars)
    const visible = data.slice(-visibleChars)

    return masked + visible
  }

  /**
   * Enmascarar email
   * Ejemplo: "user@example.com" -> "u***@example.com"
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    const maskedUsername = username.charAt(0) + '***' + username.slice(-1)
    return `${maskedUsername}@${domain}`
  }

  /**
   * Validar integridad de datos encriptados
   * Compara el hash de los datos desencriptados con un hash almacenado
   */
  static validateIntegrity(encryptedData: string, expectedHash: string): boolean {
    try {
      const decrypted = this.decrypt(encryptedData)
      const actualHash = this.hash(decrypted)
      return actualHash === expectedHash
    } catch {
      return false
    }
  }

  /**
   * Encriptar con timestamp (expirable)
   * Útil para tokens temporales
   */
  static encryptWithExpiry(data: string, expiryMinutes: number = 60): string {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000)
    const payload = {
      data,
      expiry: expiryTime
    }

    return this.encrypt(payload)
  }

  /**
   * Desencriptar y validar expiración
   */
  static decryptWithExpiry(encryptedData: string): {
    data: string
    expired: boolean
  } | null {
    try {
      const payload = this.decryptJSON<{ data: string; expiry: number }>(encryptedData)
      const expired = Date.now() > payload.expiry

      return {
        data: payload.data,
        expired
      }
    } catch {
      return null
    }
  }

  /**
   * Generar URL firmada con expiración
   * Útil para documentos con acceso temporal
   */
  static generateSignedUrl(resourceId: string, expiryMinutes: number = 60): string {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000)
    const payload = `${resourceId}:${expiryTime}`
    const signature = this.hash(payload + this.secretKey)

    return `${resourceId}:${expiryTime}:${signature}`
  }

  /**
   * Validar URL firmada
   */
  static validateSignedUrl(signedUrl: string): {
    valid: boolean
    resourceId: string | null
    expired: boolean
  } {
    try {
      const [resourceId, expiryTimeStr, signature] = signedUrl.split(':')
      const expiryTime = parseInt(expiryTimeStr)

      // Validar formato
      if (!resourceId || !expiryTime || !signature) {
        return { valid: false, resourceId: null, expired: false }
      }

      // Validar firma
      const expectedSignature = this.hash(`${resourceId}:${expiryTime}` + this.secretKey)
      if (signature !== expectedSignature) {
        return { valid: false, resourceId: null, expired: false }
      }

      // Validar expiración
      const expired = Date.now() > expiryTime

      return {
        valid: !expired,
        resourceId,
        expired
      }

    } catch {
      return { valid: false, resourceId: null, expired: false }
    }
  }
}
