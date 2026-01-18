import { describe, it, expect, beforeEach } from 'vitest'
import { EncryptionService } from '@/services/EncryptionService'

describe('EncryptionService', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const original = 'Hello, World!'
      const encrypted = EncryptionService.encrypt(original)
      const decrypted = EncryptionService.decrypt(encrypted)

      expect(decrypted).toBe(original)
      expect(encrypted).not.toBe(original)
    })

    it('should encrypt and decrypt an object correctly', () => {
      const original = { name: 'John', age: 30 }
      const encrypted = EncryptionService.encrypt(original)
      const decrypted = EncryptionService.decryptJSON(encrypted)

      expect(decrypted).toEqual(original)
    })

    it('should throw error when decrypting invalid data', () => {
      expect(() => {
        EncryptionService.decrypt('invalid-encrypted-data')
      }).toThrow()
    })
  })

  describe('hash', () => {
    it('should generate consistent hash for same input', () => {
      const data = 'test-data'
      const hash1 = EncryptionService.hash(data)
      const hash2 = EncryptionService.hash(data)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different inputs', () => {
      const hash1 = EncryptionService.hash('data1')
      const hash2 = EncryptionService.hash('data2')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('generateToken', () => {
    it('should generate random token of specified length', () => {
      const token = EncryptionService.generateToken(16)

      expect(token).toHaveLength(32) // hex doubles the length
      expect(typeof token).toBe('string')
    })

    it('should generate different tokens each time', () => {
      const token1 = EncryptionService.generateToken()
      const token2 = EncryptionService.generateToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('encryptCreditCard', () => {
    it('should encrypt credit card and preserve last 4 digits', () => {
      const cardNumber = '4242424242424242'
      const result = EncryptionService.encryptCreditCard(cardNumber)

      expect(result.lastFour).toBe('4242')
      expect(result.encrypted).toBeTruthy()
      expect(result.hash).toBeTruthy()

      // Verificar que se puede desencriptar
      const decrypted = EncryptionService.decrypt(result.encrypted)
      expect(decrypted).toBe(cardNumber)
    })
  })

  describe('mask', () => {
    it('should mask data correctly', () => {
      const data = '1234567890'
      const masked = EncryptionService.mask(data, 4)

      expect(masked).toBe('******7890')
    })

    it('should not mask if data is shorter than visible chars', () => {
      const data = '123'
      const masked = EncryptionService.mask(data, 4)

      expect(masked).toBe('123')
    })
  })

  describe('maskEmail', () => {
    it('should mask email correctly', () => {
      const email = 'user@example.com'
      const masked = EncryptionService.maskEmail(email)

      expect(masked).toBe('u***r@example.com')
    })
  })

  describe('generateSignedUrl', () => {
    it('should generate valid signed URL', () => {
      const resourceId = 'doc123'
      const signedUrl = EncryptionService.generateSignedUrl(resourceId, 60)

      expect(signedUrl).toContain(resourceId)
      expect(signedUrl.split(':').length).toBe(3)
    })

    it('should validate signed URL correctly', () => {
      const resourceId = 'doc123'
      const signedUrl = EncryptionService.generateSignedUrl(resourceId, 60)

      const validation = EncryptionService.validateSignedUrl(signedUrl)

      expect(validation.valid).toBe(true)
      expect(validation.resourceId).toBe(resourceId)
      expect(validation.expired).toBe(false)
    })

    it('should detect expired URL', async () => {
      const resourceId = 'doc123'
      const signedUrl = EncryptionService.generateSignedUrl(resourceId, -1) // Expired

      // Wait a bit to ensure expiry
      await new Promise(resolve => setTimeout(resolve, 100))

      const validation = EncryptionService.validateSignedUrl(signedUrl)

      expect(validation.valid).toBe(false)
      expect(validation.expired).toBe(true)
    })
  })

  describe('validateIntegrity', () => {
    it('should validate data integrity correctly', () => {
      const data = 'sensitive data'
      const encrypted = EncryptionService.encrypt(data)
      const hash = EncryptionService.hash(data)

      const isValid = EncryptionService.validateIntegrity(encrypted, hash)

      expect(isValid).toBe(true)
    })

    it('should detect tampered data', () => {
      const data = 'sensitive data'
      const encrypted = EncryptionService.encrypt(data)
      const wrongHash = EncryptionService.hash('wrong data')

      const isValid = EncryptionService.validateIntegrity(encrypted, wrongHash)

      expect(isValid).toBe(false)
    })
  })
})
