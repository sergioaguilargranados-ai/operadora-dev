import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeFileName,
  Validators,
  FieldSanitizers,
  validateAndSanitizeForm
} from '@/utils/sanitization'

describe('Sanitization Utils', () => {
  describe('sanitizeHTML', () => {
    it('should remove dangerous HTML tags', () => {
      const dirty = '<script>alert("xss")</script><p>Hello</p>'
      const clean = sanitizeHTML(dirty)

      expect(clean).not.toContain('<script>')
      expect(clean).toContain('<p>Hello</p>')
    })

    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      const clean = sanitizeHTML(html)

      expect(clean).toBe(html)
    })
  })

  describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
      const text = '<div>Hello & "World"</div>'
      const clean = sanitizeText(text)

      expect(clean).not.toContain('<div>')
      expect(clean).toContain('&lt;')
      expect(clean).toContain('&amp;')
      expect(clean).toContain('&quot;')
    })
  })

  describe('sanitizeEmail', () => {
    it('should normalize email', () => {
      const email = ' Test@Example.COM '
      const clean = sanitizeEmail(email)

      expect(clean).toBe('test@example.com')
    })
  })

  describe('sanitizeURL', () => {
    it('should accept valid URLs', () => {
      const url = 'https://example.com'
      const clean = sanitizeURL(url)

      expect(clean).toBe(url)
    })

    it('should reject invalid URLs', () => {
      const url = 'javascript:alert("xss")'
      const clean = sanitizeURL(url)

      expect(clean).toBe('')
    })

    it('should reject URLs without protocol', () => {
      const url = 'example.com'
      const clean = sanitizeURL(url)

      expect(clean).toBe('')
    })
  })

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters except +', () => {
      const phone = '+1 (555) 123-4567'
      const clean = sanitizePhone(phone)

      expect(clean).toBe('+15551234567')
    })
  })

  describe('sanitizeFileName', () => {
    it('should replace invalid characters', () => {
      const fileName = 'my file (1).txt'
      const clean = sanitizeFileName(fileName)

      expect(clean).toBe('my_file_1.txt')
    })

    it('should convert to lowercase', () => {
      const fileName = 'MyFile.TXT'
      const clean = sanitizeFileName(fileName)

      expect(clean).toBe('myfile.txt')
    })
  })

  describe('Validators', () => {
    describe('isValidEmail', () => {
      it('should validate correct emails', () => {
        expect(Validators.isValidEmail('test@example.com')).toBe(true)
      })

      it('should reject invalid emails', () => {
        expect(Validators.isValidEmail('invalid-email')).toBe(false)
      })
    })

    describe('isValidURL', () => {
      it('should validate correct URLs', () => {
        expect(Validators.isValidURL('https://example.com')).toBe(true)
      })

      it('should reject invalid URLs', () => {
        expect(Validators.isValidURL('not-a-url')).toBe(false)
      })
    })

    describe('isValidInteger', () => {
      it('should validate integers', () => {
        expect(Validators.isValidInteger('123')).toBe(true)
        expect(Validators.isValidInteger('123.45')).toBe(false)
      })
    })

    describe('isValidFloat', () => {
      it('should validate floats', () => {
        expect(Validators.isValidFloat('123.45')).toBe(true)
        expect(Validators.isValidFloat('123')).toBe(true)
      })
    })
  })

  describe('FieldSanitizers', () => {
    describe('searchQuery', () => {
      it('should limit length and sanitize', () => {
        const long = 'a'.repeat(300)
        const clean = FieldSanitizers.searchQuery(long)

        expect(clean.length).toBeLessThanOrEqual(200)
      })
    })

    describe('username', () => {
      it('should create valid username', () => {
        const username = 'Test User@123'
        const clean = FieldSanitizers.username(username)

        expect(clean).toBe('testuser123')
        expect(clean).toMatch(/^[a-z0-9_-]+$/)
      })
    })

    describe('amount', () => {
      it('should parse valid amounts', () => {
        expect(FieldSanitizers.amount('$123.45')).toBe(123.45)
        expect(FieldSanitizers.amount('1,234.56')).toBe(1234.56)
      })

      it('should reject negative amounts', () => {
        expect(FieldSanitizers.amount('-123')).toBe(0)
      })

      it('should return null for invalid amounts', () => {
        expect(FieldSanitizers.amount('invalid')).toBe(null)
      })
    })
  })

  describe('validateAndSanitizeForm', () => {
    it('should validate and sanitize form data', () => {
      const data = {
        email: ' test@example.com ',
        age: '25',
        name: 'John Doe'
      }

      const rules = {
        email: { required: true, type: 'email' as const },
        age: { required: true, type: 'number' as const, min: 18 },
        name: { required: true, type: 'text' as const, minLength: 2 }
      }

      const result = validateAndSanitizeForm(data, rules)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
      expect(result.sanitized.email).toBe('test@example.com')
      expect(result.sanitized.age).toBe(25)
    })

    it('should detect validation errors', () => {
      const data = {
        email: 'invalid-email',
        age: '15'
      }

      const rules = {
        email: { required: true, type: 'email' as const },
        age: { required: true, type: 'number' as const, min: 18 }
      }

      const result = validateAndSanitizeForm(data, rules)

      expect(result.isValid).toBe(false)
      expect(result.errors.email).toBeTruthy()
      expect(result.errors.age).toBeTruthy()
    })

    it('should handle optional fields', () => {
      const data = {
        email: 'test@example.com'
      }

      const rules = {
        email: { required: true, type: 'email' as const },
        phone: { required: false, type: 'phone' as const }
      }

      const result = validateAndSanitizeForm(data, rules)

      expect(result.isValid).toBe(true)
    })
  })
})
