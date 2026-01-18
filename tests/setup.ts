/**
 * Test Setup
 * Configuración global para todos los tests
 */

import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// Mock de variables de entorno
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'test-secret-key-32-characters-long'
process.env.ENCRYPTION_SECRET_KEY = 'test-encryption-key-32-chars-long!'

// Mock de fetch global
global.fetch = vi.fn()

// Mock de console para tests más limpios
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn()
}
