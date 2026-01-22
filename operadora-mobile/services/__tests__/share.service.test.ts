import ShareService from '../share.service'

describe('ShareService', () => {
    describe('generateItineraryText', () => {
        it('should generate formatted text itinerary', () => {
            const mockTrip = {
                id: '123',
                title: 'Viaje a Cancún',
                destination: 'Cancún, México',
                startDate: '2026-02-01',
                endDate: '2026-02-05',
                flights: [
                    {
                        airline: 'Aeroméxico',
                        origin: 'MEX',
                        destination: 'CUN',
                        departure: '10:00',
                        arrival: '12:00',
                    },
                ],
                hotels: [
                    {
                        name: 'Hotel Fiesta Americana',
                        location: 'Zona Hotelera',
                        checkIn: '2026-02-01',
                        checkOut: '2026-02-05',
                    },
                ],
                activities: [],
                totalPrice: 15000,
            }

            const text = ShareService.generateItineraryText(mockTrip)

            expect(text).toContain('Viaje a Cancún')
            expect(text).toContain('Cancún, México')
            expect(text).toContain('Aeroméxico')
            expect(text).toContain('Hotel Fiesta Americana')
            expect(text).toContain('$15,000')
        })
    })

    describe('generateItineraryHTML', () => {
        it('should generate valid HTML itinerary', () => {
            const mockTrip = {
                id: '123',
                title: 'Viaje a Cancún',
                destination: 'Cancún, México',
                startDate: '2026-02-01',
                endDate: '2026-02-05',
                flights: [],
                hotels: [],
                activities: [],
                totalPrice: 15000,
            }

            const html = ShareService.generateItineraryHTML(mockTrip)

            expect(html).toContain('<!DOCTYPE html>')
            expect(html).toContain('<html>')
            expect(html).toContain('Viaje a Cancún')
            expect(html).toContain('$15,000')
            expect(html).toContain('</html>')
        })

        it('should include all trip sections when data is present', () => {
            const mockTrip = {
                id: '123',
                title: 'Viaje Completo',
                destination: 'Cancún',
                startDate: '2026-02-01',
                endDate: '2026-02-05',
                flights: [{ airline: 'Test', origin: 'MEX', destination: 'CUN', departure: '10:00', arrival: '12:00' }],
                hotels: [{ name: 'Test Hotel', location: 'Test', checkIn: '2026-02-01', checkOut: '2026-02-05' }],
                activities: [],
                totalPrice: 20000,
            }

            const html = ShareService.generateItineraryHTML(mockTrip)

            expect(html).toContain('✈️ Vuelos')
            expect(html).toContain('🏨 Hoteles')
            expect(html).toContain('Test')
            expect(html).toContain('Test Hotel')
        })
    })
})
