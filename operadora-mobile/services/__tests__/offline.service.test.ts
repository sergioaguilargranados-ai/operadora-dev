import OfflineService from '../offline.service'

describe('OfflineService', () => {
    beforeEach(async () => {
        // Limpiar cache antes de cada test
        await OfflineService.clearAllCache()
    })

    describe('cacheBookings', () => {
        it('should cache bookings successfully', async () => {
            const mockBookings = [
                {
                    id: 1,
                    service_type: 'hotel',
                    service_name: 'Test Hotel',
                    booking_status: 'confirmed',
                    payment_status: 'paid',
                    total_price: 1000,
                    booking_details: {},
                    created_at: new Date().toISOString(),
                },
            ]

            await OfflineService.cacheBookings(mockBookings)
            const cached = await OfflineService.getCachedBookings()

            expect(cached.length).toBe(1)
            expect(cached[0].service_name).toBe('Test Hotel')
        })
    })

    describe('getCachedBookings', () => {
        it('should return empty array when no cache exists', async () => {
            const cached = await OfflineService.getCachedBookings()
            expect(cached).toEqual([])
        })

        it('should filter expired bookings', async () => {
            const oldDate = new Date()
            oldDate.setDate(oldDate.getDate() - 30) // 30 días atrás

            const mockBookings = [
                {
                    id: 1,
                    service_type: 'hotel',
                    service_name: 'Old Hotel',
                    booking_status: 'confirmed',
                    payment_status: 'paid',
                    total_price: 1000,
                    booking_details: {},
                    created_at: oldDate.toISOString(),
                    cached_at: oldDate.toISOString(),
                },
            ]

            await OfflineService.cacheBookings(mockBookings)
            const cached = await OfflineService.getCachedBookings()

            // Debe estar vacío porque el cache expiró
            expect(cached.length).toBe(0)
        })
    })

    describe('saveSearchHistory', () => {
        it('should save search to history', async () => {
            const search = {
                type: 'hotel',
                destination: 'Cancún',
                checkIn: '2026-02-01',
                checkOut: '2026-02-05',
            }

            await OfflineService.saveSearchHistory(search)
            const history = await OfflineService.getSearchHistory()

            expect(history.length).toBe(1)
            expect(history[0].destination).toBe('Cancún')
        })

        it('should limit history to 10 items', async () => {
            // Agregar 15 búsquedas
            for (let i = 0; i < 15; i++) {
                await OfflineService.saveSearchHistory({
                    type: 'hotel',
                    destination: `Destination ${i}`,
                })
            }

            const history = await OfflineService.getSearchHistory()
            expect(history.length).toBe(10)
        })
    })

    describe('clearAllCache', () => {
        it('should clear all cached data', async () => {
            // Agregar datos
            await OfflineService.cacheBookings([
                {
                    id: 1,
                    service_type: 'hotel',
                    service_name: 'Test',
                    booking_status: 'confirmed',
                    payment_status: 'paid',
                    total_price: 1000,
                    booking_details: {},
                    created_at: new Date().toISOString(),
                },
            ])

            await OfflineService.saveSearchHistory({ type: 'hotel' })

            // Limpiar
            await OfflineService.clearAllCache()

            // Verificar que esté vacío
            const bookings = await OfflineService.getCachedBookings()
            const history = await OfflineService.getSearchHistory()

            expect(bookings.length).toBe(0)
            expect(history.length).toBe(0)
        })
    })
})
