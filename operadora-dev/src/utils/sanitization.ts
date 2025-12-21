/**
 * Sanitization Utilities
 * Limpia y valida inputs para prevenir XSS e inyecciones
 */

import validator from 'validator'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizar string HTML (previene XSS)
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}

/**
 * Sanitizar string de texto plano
 */
export function sanitizeText(text: string): string {
  return validator.escape(text)
}

/**
 * Sanitizar email
 */
export function sanitizeEmail(email: string): string {
  return validator.normalizeEmail(email) || email.toLowerCase().trim()
}

/**
 * Sanitizar URL
 */
export function sanitizeURL(url: string): string {
  const trimmed = url.trim()

  if (!validator.isURL(trimmed, { require_protocol: true })) {
    return ''
  }

  // Solo permitir http y https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return ''
  }

  return trimmed
}

/**
 * Sanitizar número de teléfono
 */
export function sanitizePhone(phone: string): string {
  // Eliminar todos los caracteres excepto números y +
  return phone.replace(/[^0-9+]/g, '')
}

/**
 * Sanitizar nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._]+/, '')
    .toLowerCase()
}

/**
 * Sanitizar objeto completo recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value
      continue
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) :
        typeof item === 'object' ? sanitizeObject(item) :
        item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Validaciones
 */

export const Validators = {
  /**
   * Validar email
   */
  isValidEmail(email: string): boolean {
    return validator.isEmail(email)
  },

  /**
   * Validar URL
   */
  isValidURL(url: string): boolean {
    return validator.isURL(url, { require_protocol: true })
  },

  /**
   * Validar número de teléfono (básico)
   */
  isValidPhone(phone: string): boolean {
    return validator.isMobilePhone(phone, 'any', { strictMode: false })
  },

  /**
   * Validar UUID
   */
  isValidUUID(uuid: string): boolean {
    return validator.isUUID(uuid)
  },

  /**
   * Validar fecha ISO
   */
  isValidDate(date: string): boolean {
    return validator.isISO8601(date)
  },

  /**
   * Validar número entero
   */
  isValidInteger(value: string): boolean {
    return validator.isInt(value)
  },

  /**
   * Validar número decimal
   */
  isValidFloat(value: string): boolean {
    return validator.isFloat(value)
  },

  /**
   * Validar alfanumérico
   */
  isAlphanumeric(value: string): boolean {
    return validator.isAlphanumeric(value)
  },

  /**
   * Validar longitud de string
   */
  isValidLength(value: string, min: number, max: number): boolean {
    return validator.isLength(value, { min, max })
  },

  /**
   * Validar JSON
   */
  isValidJSON(value: string): boolean {
    return validator.isJSON(value)
  },

  /**
   * Validar tarjeta de crédito
   */
  isValidCreditCard(card: string): boolean {
    return validator.isCreditCard(card)
  },

  /**
   * Validar código postal (varios formatos)
   */
  isValidPostalCode(code: string, locale: string = 'any'): boolean {
    return validator.isPostalCode(code, locale as any)
  }
}

/**
 * Sanitizadores de campos específicos
 */

export const FieldSanitizers = {
  /**
   * Sanitizar entrada de búsqueda
   */
  searchQuery(query: string): string {
    return sanitizeText(query).slice(0, 200) // Límite de 200 caracteres
  },

  /**
   * Sanitizar nombre de usuario
   */
  username(username: string): string {
    return username
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30)
  },

  /**
   * Sanitizar nombre completo
   */
  fullName(name: string): string {
    return sanitizeText(name)
      .replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '')
      .trim()
      .slice(0, 100)
  },

  /**
   * Sanitizar descripción/comentario
   */
  description(text: string): string {
    return sanitizeHTML(text).slice(0, 1000)
  },

  /**
   * Sanitizar monto de dinero
   */
  amount(amount: string): number | null {
    const sanitized = amount.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(sanitized)
    return isNaN(parsed) ? null : Math.max(0, parsed)
  },

  /**
   * Sanitizar código de moneda
   */
  currency(currency: string): string {
    return currency.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  }
}

/**
 * Prevenir SQL Injection en queries crudos
 * NOTA: Preferir siempre parametrized queries
 */
export function escapeSQLString(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
}

/**
 * Prevenir NoSQL Injection
 */
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(query)) {
    // Eliminar operadores potencialmente peligrosos
    if (key.startsWith('$')) {
      continue
    }

    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Validar y sanitizar input de formulario
 */
export interface FormValidationRule {
  required?: boolean
  type?: 'email' | 'url' | 'phone' | 'number' | 'text' | 'html'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  sanitized: Record<string, any>
}

export function validateAndSanitizeForm(
  data: Record<string, any>,
  rules: Record<string, FormValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized: Record<string, any> = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    // Verificar requerido
    if (rule.required && (!value || value === '')) {
      errors[field] = `${field} es requerido`
      continue
    }

    if (!value && !rule.required) {
      sanitized[field] = value
      continue
    }

    // Validar tipo
    switch (rule.type) {
      case 'email':
        if (!Validators.isValidEmail(value)) {
          errors[field] = 'Email inválido'
        } else {
          sanitized[field] = sanitizeEmail(value)
        }
        break

      case 'url':
        if (!Validators.isValidURL(value)) {
          errors[field] = 'URL inválida'
        } else {
          sanitized[field] = sanitizeURL(value)
        }
        break

      case 'phone':
        sanitized[field] = sanitizePhone(value)
        break

      case 'number':
        const num = parseFloat(value)
        if (isNaN(num)) {
          errors[field] = 'Número inválido'
        } else {
          sanitized[field] = num
        }
        break

      case 'html':
        sanitized[field] = sanitizeHTML(value)
        break

      case 'text':
      default:
        sanitized[field] = sanitizeText(value)
        break
    }

    // Validar longitud
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Mínimo ${rule.minLength} caracteres`
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Máximo ${rule.maxLength} caracteres`
    }

    // Validar rango numérico
    if (rule.min !== undefined && parseFloat(value) < rule.min) {
      errors[field] = `Mínimo ${rule.min}`
    }

    if (rule.max !== undefined && parseFloat(value) > rule.max) {
      errors[field] = `Máximo ${rule.max}`
    }

    // Validar patrón
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = 'Formato inválido'
    }

    // Validación custom
    if (rule.custom && !rule.custom(value)) {
      errors[field] = 'Validación fallida'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  }
}
