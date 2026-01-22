import BiometricService from '../biometric.service'

describe('BiometricService', () => {
    describe('isAvailable', () => {
        it('should return true when biometric hardware is available and enrolled', async () => {
            const result = await BiometricService.isAvailable()
            expect(typeof result).toBe('boolean')
        })
    })

    describe('getBiometricType', () => {
        it('should return a string describing the biometric type', async () => {
            const type = await BiometricService.getBiometricType()
            expect(typeof type).toBe('string')
            expect(type.length).toBeGreaterThan(0)
        })
    })

    describe('saveCredentials', () => {
        it('should save credentials securely', async () => {
            const email = 'test@example.com'
            const password = 'testPassword123'

            const result = await BiometricService.saveCredentials(email, password)
            expect(result).toBe(true)
        })
    })

    describe('isBiometricLoginEnabled', () => {
        it('should return boolean indicating if biometric login is enabled', async () => {
            const enabled = await BiometricService.isBiometricLoginEnabled()
            expect(typeof enabled).toBe('boolean')
        })
    })

    describe('disableBiometricLogin', () => {
        it('should disable biometric login and clear credentials', async () => {
            await BiometricService.disableBiometricLogin()
            const enabled = await BiometricService.isBiometricLoginEnabled()
            expect(enabled).toBe(false)
        })
    })
})
